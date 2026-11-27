import express from 'express';
import compression from 'compression';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, 'data', 'data.json');
const DIST_PATH  = join(__dirname, 'dist');

const app = express();
app.use(compression());
app.use(express.json());

// Statische Dateien: Im Produktionsbetrieb aus dist/ ausliefern.
// Im Entwicklungsbetrieb übernimmt Vite (Port 5173) das Frontend.
if (existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────────

function readData() {
  return JSON.parse(readFileSync(DATA_PATH, 'utf-8'));
}

function writeData(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

function hashPin(pin) {
  return createHash('sha256').update(String(pin)).digest('hex');
}

function sanitize(str) {
  return String(str).trim().replace(/[<>&"']/g, '');
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function validateChild(body) {
  const name = String(body.name ?? '').trim();
  if (!name || name.length < 1) throw new Error('Name fehlt');
  if (name.length > 50) throw new Error('Name ist zu lang (max. 50 Zeichen)');
  const idx = Number(body.colorPaletteIndex ?? 0);
  if (!Number.isInteger(idx) || idx < 0 || idx > 7) throw new Error('Ungültige Farbe');
  if (body.balance !== undefined) {
    const b = Number(body.balance);
    if (isNaN(b) || b < 0 || b > 99999) throw new Error('Ungültiger Grundbetrag');
  }
}

function validateAllowance(body) {
  const amount = Number(body.amount);
  if (isNaN(amount) || amount <= 0 || amount > 9999.99) throw new Error('Ungültiger Betrag (0,01–9999,99)');
  if (!['weekly', 'monthly'].includes(body.frequency)) throw new Error('Ungültige Häufigkeit');
  if (body.frequency === 'weekly') {
    const d = Number(body.dayOfWeek);
    if (!Number.isInteger(d) || d < 0 || d > 6) throw new Error('Ungültiger Wochentag (0–6)');
  }
  if (body.frequency === 'monthly') {
    const d = Number(body.dayOfMonth);
    if (!Number.isInteger(d) || d < 1 || d > 28) throw new Error('Ungültiger Tag (1–28)');
  }
}

function validateGoal(body) {
  const name = String(body.name ?? '').trim();
  if (!name || name.length < 1) throw new Error('Name fehlt');
  if (name.length > 60) throw new Error('Name ist zu lang (max. 60 Zeichen)');
  const target = Number(body.targetAmount);
  if (isNaN(target) || target <= 0 || target > 99999) throw new Error('Ungültiger Zielbetrag');
}

// Lokales Datum als "YYYY-MM-DD" (nicht UTC, damit Zahltage zur Ortszeit passen)
function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseLocalDate(s) {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

function addDays(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

// Regeln aus älteren Versionen haben kein Anlagedatum. Wurden sie noch nie
// ausgezahlt, ist der früheste mögliche Beginn der Tag, an dem das Kind angelegt
// wurde (bzw. dessen erste Buchung) – ab dort werden verpasste Zahltage nachgeholt.
function migrateLegacyAllowance(data, a, now) {
  if (a.createdAt) return false;
  const child = data.children.find(c => c.id === a.childId);
  const firstTx = data.transactions
    .filter(t => t.childId === a.childId)
    .map(t => t.date)
    .sort()[0];
  const since = child?.createdAt ?? firstTx ?? addDays(now, -1).toISOString();
  a.createdAt = since;
  if (!a.lastExecuted) a.activeSince = localDateStr(new Date(since));
  return true;
}

// Bucht alle fälligen Zahlungen inkl. verpasster Zahltage seit dem letzten
// Abrechnungsstand (lastExecuted bzw. Aktivierungsdatum).
function processAllowances(data, now = new Date()) {
  const today = localDateStr(now);
  const dayLabels = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  let booked = 0;
  let dirty = false;

  for (const a of data.allowances) {
    if (migrateLegacyAllowance(data, a, now)) dirty = true;
    if (!a.isActive) continue;

    const bounds = [];
    if (a.lastExecuted) bounds.push(a.lastExecuted.slice(0, 10));
    if (a.activeSince) bounds.push(localDateStr(addDays(parseLocalDate(a.activeSince), -1)));
    const start = bounds.sort().at(-1);

    for (let d = addDays(parseLocalDate(start), 1); localDateStr(d) <= today; d = addDays(d, 1)) {
      const isDue =
        (a.frequency === 'weekly' && a.dayOfWeek === d.getDay()) ||
        (a.frequency === 'monthly' && a.dayOfMonth === d.getDate());
      if (!isDue) continue;

      const dateStr = localDateStr(d);
      data.transactions.push({
        id: crypto.randomUUID(),
        childId: a.childId,
        amount: a.amount,
        type: 'allowance',
        description: a.frequency === 'weekly'
          ? `Taschengeld (${dayLabels[a.dayOfWeek]})`
          : `Taschengeld (${a.dayOfMonth}. des Monats)`,
        date: dateStr === today
          ? now.toISOString()
          : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 8).toISOString(),
      });

      const child = data.children.find(c => c.id === a.childId);
      if (child) child.balance = +(child.balance + a.amount).toFixed(2);
      a.lastExecuted = dateStr;
      booked++;
      dirty = true;
    }
  }
  return { booked, dirty };
}

// ── Middleware: ID-Validierung ─────────────────────────────────────────────────

function requireValidId(req, res, next) {
  const id = req.params.id;
  if (id && !isValidUUID(id)) return res.status(400).json({ message: 'Ungültige ID' });
  next();
}

// ── API-Routen ─────────────────────────────────────────────────────────────────

// Gesamter State (öffentlich – nur Kinder + Einstellungen ohne PIN-Hash)
app.get('/api/state', (req, res) => {
  try {
    const data = readData();
    const activeGoalsByChild = {};
    for (const g of (data.goals ?? [])) {
      if (!g.completedAt) {
        if (!activeGoalsByChild[g.childId]) activeGoalsByChild[g.childId] = [];
        activeGoalsByChild[g.childId].push(g);
      }
    }
    res.json({
      children: data.children.map(c => ({
        ...c,
        goals: (activeGoalsByChild[c.id] ?? []).map(g => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          savedAmount: g.savedAmount,
          targetAmount: g.targetAmount,
        })),
      })),
      settings: { currency: data.settings.currency },
    });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Lesen der Daten' });
  }
});

// Admin-PIN überprüfen
app.post('/api/admin/verify', (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ message: 'PIN fehlt' });
    const data = readData();
    const valid = hashPin(pin) === data.settings.adminPinHash;
    res.json({ valid });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Überprüfen der PIN' });
  }
});

// Einstellungen speichern
app.put('/api/settings', (req, res) => {
  try {
    const data = readData();
    const { currency, newPin, currentPin } = req.body;

    if (currency) {
      const c = sanitize(currency);
      if (c.length < 1 || c.length > 3) return res.status(400).json({ message: 'Ungültige Währung' });
      data.settings.currency = c;
    }

    if (newPin) {
      if (!currentPin) return res.status(400).json({ message: 'Aktueller PIN fehlt' });
      if (hashPin(currentPin) !== data.settings.adminPinHash) {
        return res.status(403).json({ message: 'Aktueller PIN ist falsch' });
      }
      const pin = String(newPin).trim();
      if (pin.length < 4 || pin.length > 12) return res.status(400).json({ message: 'PIN muss 4–12 Zeichen haben' });
      data.settings.adminPinHash = hashPin(pin);
    }

    writeData(data);
    res.json({ currency: data.settings.currency });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Speichern der Einstellungen' });
  }
});

// ── Kinder ─────────────────────────────────────────────────────────────────────

app.get('/api/children', (req, res) => {
  try {
    const data = readData();
    res.json(data.children);
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Laden der Kinder' });
  }
});

app.post('/api/children', (req, res) => {
  try {
    validateChild(req.body);
    const data = readData();

    const initialBalance = req.body.balance !== undefined ? +(Number(req.body.balance).toFixed(2)) : 0;
    const child = {
      id: crypto.randomUUID(),
      name: sanitize(req.body.name),
      avatar: sanitize(req.body.avatar || '😊'),
      colorPaletteIndex: Number(req.body.colorPaletteIndex ?? 0),
      balance: initialBalance,
      createdAt: new Date().toISOString(),
    };
    data.children.push(child);

    if (initialBalance > 0) {
      data.transactions.push({
        id: crypto.randomUUID(),
        childId: child.id,
        amount: initialBalance,
        type: 'initial',
        description: 'Grundbetrag',
        date: new Date().toISOString(),
      });
    }

    writeData(data);

    // Optionales Taschengeld direkt beim Anlegen einrichten
    if (req.body.allowance && Number(req.body.allowance.amount) > 0) {
      try {
        const aBody = {
          amount: +(Number(req.body.allowance.amount).toFixed(2)),
          frequency: 'weekly',
          dayOfWeek: Number(req.body.allowance.dayOfWeek ?? 6),
          dayOfMonth: null,
        };
        validateAllowance(aBody);
        const freshData = readData();
        freshData.allowances.push({
          id: crypto.randomUUID(),
          childId: child.id,
          ...aBody,
          lastExecuted: null,
          activeSince: localDateStr(new Date()),
          createdAt: new Date().toISOString(),
          isActive: true,
        });
        writeData(freshData);
      } catch (_) { /* Ungültige Taschengeld-Daten ignorieren – Kind wurde bereits angelegt */ }
    }

    res.status(201).json(child);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put('/api/children/:id', requireValidId, (req, res) => {
  try {
    validateChild(req.body);
    const data = readData();
    const child = data.children.find(c => c.id === req.params.id);
    if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });

    child.name = sanitize(req.body.name);
    child.avatar = sanitize(req.body.avatar || child.avatar);
    child.colorPaletteIndex = Number(req.body.colorPaletteIndex ?? child.colorPaletteIndex);

    writeData(data);
    res.json(child);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/children/:id', requireValidId, (req, res) => {
  try {
    const data = readData();
    const idx = data.children.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Kind nicht gefunden' });

    data.children.splice(idx, 1);
    // Zugehörige Daten bereinigen
    data.allowances = data.allowances.filter(a => a.childId !== req.params.id);
    data.transactions = data.transactions.filter(t => t.childId !== req.params.id);
    data.goals = data.goals.filter(g => g.childId !== req.params.id);

    writeData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Löschen' });
  }
});

// ── Transaktionen ──────────────────────────────────────────────────────────────

app.get('/api/children/:id/transactions', requireValidId, (req, res) => {
  try {
    const data = readData();
    const child = data.children.find(c => c.id === req.params.id);
    if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });
    const txs = data.transactions
      .filter(t => t.childId === req.params.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(txs);
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Laden der Transaktionen' });
  }
});

app.post('/api/children/:id/transactions', requireValidId, (req, res) => {
  try {
    const data = readData();
    const child = data.children.find(c => c.id === req.params.id);
    if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });

    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount === 0) return res.status(400).json({ message: 'Ungültiger Betrag' });
    if (Math.abs(amount) > 9999.99) return res.status(400).json({ message: 'Betrag zu groß' });

    const validTypes = ['manual', 'goal_allocation'];
    const type = validTypes.includes(req.body.type) ? req.body.type : 'manual';
    const description = sanitize(req.body.description || 'Manuelle Buchung');

    const tx = {
      id: crypto.randomUUID(),
      childId: req.params.id,
      amount: +amount.toFixed(2),
      type,
      description: description.slice(0, 100),
      date: new Date().toISOString(),
    };
    data.transactions.push(tx);
    child.balance = +(child.balance + amount).toFixed(2);

    writeData(data);
    res.status(201).json({ transaction: tx, newBalance: child.balance });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ── Taschengeld-Regeln ─────────────────────────────────────────────────────────

app.get('/api/children/:id/allowances', requireValidId, (req, res) => {
  try {
    const data = readData();
    const child = data.children.find(c => c.id === req.params.id);
    if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });
    res.json(data.allowances.filter(a => a.childId === req.params.id));
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Laden der Taschengeld-Regeln' });
  }
});

app.post('/api/children/:id/allowances', requireValidId, (req, res) => {
  try {
    validateAllowance(req.body);
    const data = readData();
    const child = data.children.find(c => c.id === req.params.id);
    if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });

    const allowance = {
      id: crypto.randomUUID(),
      childId: req.params.id,
      amount: +(Number(req.body.amount).toFixed(2)),
      frequency: req.body.frequency,
      dayOfWeek: req.body.frequency === 'weekly' ? Number(req.body.dayOfWeek) : null,
      dayOfMonth: req.body.frequency === 'monthly' ? Number(req.body.dayOfMonth) : null,
      lastExecuted: null,
      activeSince: localDateStr(new Date()),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    data.allowances.push(allowance);
    writeData(data);
    res.status(201).json(allowance);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put('/api/allowances/:id', requireValidId, (req, res) => {
  try {
    validateAllowance(req.body);
    const data = readData();
    const allowance = data.allowances.find(a => a.id === req.params.id);
    if (!allowance) return res.status(404).json({ message: 'Regel nicht gefunden' });

    allowance.amount = +(Number(req.body.amount).toFixed(2));
    allowance.frequency = req.body.frequency;
    allowance.dayOfWeek = req.body.frequency === 'weekly' ? Number(req.body.dayOfWeek) : null;
    allowance.dayOfMonth = req.body.frequency === 'monthly' ? Number(req.body.dayOfMonth) : null;
    if (req.body.isActive !== undefined) {
      const isActive = Boolean(req.body.isActive);
      // Bei Reaktivierung keine Zahlungen für die inaktive Zeit nachholen
      if (isActive && !allowance.isActive) allowance.activeSince = localDateStr(new Date());
      allowance.isActive = isActive;
    }

    writeData(data);
    res.json(allowance);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/allowances/:id', requireValidId, (req, res) => {
  try {
    const data = readData();
    const idx = data.allowances.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Regel nicht gefunden' });
    data.allowances.splice(idx, 1);
    writeData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Löschen' });
  }
});

// ── Taschengeld verarbeiten ────────────────────────────────────────────────────

app.post('/api/allowances/process', (req, res) => {
  try {
    const data = readData();
    const { booked, dirty } = processAllowances(data);
    if (dirty) writeData(data);
    res.json({ processed: booked, changed: booked > 0 });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Verarbeiten der Taschengeld-Regeln' });
  }
});

// ── Sparziele ──────────────────────────────────────────────────────────────────

app.get('/api/children/:id/goals', requireValidId, (req, res) => {
  try {
    const data = readData();
    const child = data.children.find(c => c.id === req.params.id);
    if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });
    res.json(data.goals.filter(g => g.childId === req.params.id));
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Laden der Sparziele' });
  }
});

app.post('/api/children/:id/goals', requireValidId, (req, res) => {
  try {
    validateGoal(req.body);
    const data = readData();
    const child = data.children.find(c => c.id === req.params.id);
    if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });

    const goal = {
      id: crypto.randomUUID(),
      childId: req.params.id,
      name: sanitize(req.body.name),
      targetAmount: +(Number(req.body.targetAmount).toFixed(2)),
      savedAmount: +(Number(req.body.initialSaved ?? 0).toFixed(2)),
      initialSaved: +(Number(req.body.initialSaved ?? 0).toFixed(2)),
      icon: sanitize(req.body.icon || '🎯'),
      createdAt: new Date().toISOString(),
      completedAt: null,
      purchasedAt: null,
    };
    data.goals.push(goal);
    writeData(data);
    res.status(201).json(goal);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put('/api/goals/:id', requireValidId, (req, res) => {
  try {
    const data = readData();
    const goal = data.goals.find(g => g.id === req.params.id);
    if (!goal) return res.status(404).json({ message: 'Sparziel nicht gefunden' });

    // Ziel kaufen (Guthaben abziehen, Ziel als gekauft markieren)
    if (req.body.purchaseGoal) {
      const child = data.children.find(c => c.id === goal.childId);
      if (!child) return res.status(404).json({ message: 'Kind nicht gefunden' });
      if (child.balance < goal.targetAmount) return res.status(400).json({ message: 'Nicht genug Guthaben' });

      child.balance = +(child.balance - goal.targetAmount).toFixed(2);

      data.transactions.push({
        id: crypto.randomUUID(),
        childId: goal.childId,
        amount: -goal.targetAmount,
        type: 'goal_purchase',
        description: `Gekauft: ${goal.name}`,
        date: new Date().toISOString(),
      });

      goal.completedAt = new Date().toISOString();
      goal.purchasedAt = new Date().toISOString();
    }

    if (req.body.markPurchased) {
      goal.purchasedAt = new Date().toISOString();
    }

    // Metadaten bearbeiten
    if (req.body.name !== undefined) {
      const name = String(req.body.name).trim();
      if (!name || name.length > 60) return res.status(400).json({ message: 'Ungültiger Name' });
      goal.name = sanitize(name);
    }
    if (req.body.targetAmount !== undefined) {
      const t = Number(req.body.targetAmount);
      if (isNaN(t) || t <= 0 || t > 99999) return res.status(400).json({ message: 'Ungültiger Zielbetrag' });
      goal.targetAmount = +t.toFixed(2);
    }
    if (req.body.icon !== undefined) goal.icon = sanitize(req.body.icon);

    writeData(data);
    const child = data.children.find(c => c.id === goal.childId);
    res.json({ goal, newBalance: child?.balance });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/goals/:id', requireValidId, (req, res) => {
  try {
    const data = readData();
    const idx = data.goals.findIndex(g => g.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Sparziel nicht gefunden' });

    data.goals.splice(idx, 1);
    writeData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Fehler beim Löschen' });
  }
});

// ── SPA Fallback ───────────────────────────────────────────────────────────────

app.get('*', (req, res) => {
  res.sendFile(join(DIST_PATH, 'index.html'));
});

// ── Server starten ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ KidsWallet läuft auf http://localhost:${PORT}`);
  console.log(`🔑 Standard-PIN: 1234`);
});
