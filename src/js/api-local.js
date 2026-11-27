// api-local.js – Vollständige lokale Datenschicht (localStorage + Web Crypto)
// Kein Server, kein Netzwerk – alle Daten liegen auf dem Gerät.
// Gespeichert werden nur sprachneutrale Daten; Fehler tragen i18n-Codes (DomainError).

import { DomainError } from './errors.js';

const STORAGE_KEY = 'kidswallet-data';

// SHA-256 von '1234' – frühere Standard-PIN. Neue Installationen starten ohne PIN (adminPinHash: null).
const LEGACY_DEFAULT_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

function defaultData() {
  return {
    children: [],
    allowances: [],
    transactions: [],
    goals: [],
    settings: {
      currency: '€',
      adminPinHash: null,
      pinConfigured: true,
    },
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const data = JSON.parse(raw);
    // Migrations-Sicherheit: fehlende Arrays auffüllen
    data.children    ??= [];
    data.allowances  ??= [];
    data.transactions ??= [];
    data.goals       ??= [];
    data.settings    ??= { currency: '€' };
    data.settings.adminPinHash ??= null;
    return data;
  } catch {
    return defaultData();
  }
}

/**
 * Bestandsinstallation mit der früheren Standard-PIN 1234, deren Inhaber noch nicht
 * entschieden hat, ob der PIN-Schutz genutzt werden soll. Wer die PIN bereits selbst
 * geändert hat, hat sich bewusst für den Schutz entschieden und wird nicht gefragt.
 */
function isPinMigrationPending(settings) {
  return settings.adminPinHash === LEGACY_DEFAULT_PIN_HASH && settings.pinConfigured !== true;
}

function validateNewPin(pin) {
  const value = String(pin ?? '').trim();
  if (!/^\d{4,12}$/.test(value)) throw new DomainError('pinLength');
  return value;
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// SHA-256 via Web Crypto API → Hex-String
async function hashPin(pin) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(pin)));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function sanitize(str) {
  return String(str).trim().replace(/[<>&"']/g, '');
}

function validateChild(body) {
  const name = String(body.name ?? '').trim();
  if (!name) throw new DomainError('nameMissing');
  if (name.length > 50) throw new DomainError('nameTooLong', { max: 50 });
  const idx = Number(body.colorPaletteIndex ?? 0);
  if (!Number.isInteger(idx) || idx < 0 || idx > 7) throw new DomainError('invalidColor');
  if (body.balance !== undefined) {
    const b = Number(body.balance);
    if (isNaN(b) || b < 0 || b > 99999) throw new DomainError('invalidStartBalance');
  }
}

function validateAllowance(body) {
  const amount = Number(body.amount);
  if (isNaN(amount) || amount <= 0 || amount > 9999.99) throw new DomainError('invalidAmountRange');
  if (!['weekly', 'monthly'].includes(body.frequency)) throw new DomainError('invalidFrequency');
  if (body.frequency === 'weekly') {
    const d = Number(body.dayOfWeek);
    if (!Number.isInteger(d) || d < 0 || d > 6) throw new DomainError('invalidWeekday');
  }
  if (body.frequency === 'monthly') {
    const d = Number(body.dayOfMonth);
    if (!Number.isInteger(d) || d < 1 || d > 28) throw new DomainError('invalidDay');
  }
}

function validateGoal(body) {
  const name = String(body.name ?? '').trim();
  if (!name) throw new DomainError('nameMissing');
  if (name.length > 60) throw new DomainError('nameTooLong', { max: 60 });
  const target = Number(body.targetAmount);
  if (isNaN(target) || target <= 0 || target > 99999) throw new DomainError('invalidTarget');
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

/**
 * Regeln aus älteren Versionen haben kein Anlagedatum. Wurden sie noch nie
 * ausgezahlt, ist der früheste mögliche Beginn der Tag, an dem das Kind angelegt
 * wurde (bzw. dessen erste Buchung) – ab dort werden verpasste Zahltage nachgeholt.
 * @returns {boolean} true, wenn die Regel geändert wurde
 */
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

/**
 * Bucht alle fälligen Taschengeld-Zahlungen – auch verpasste Zahltage, an denen
 * die App nicht geöffnet wurde. Geprüft wird jeder Tag nach dem letzten
 * Abrechnungsstand (lastExecuted bzw. Aktivierungsdatum) bis einschließlich heute.
 * @returns {{ booked: number, dirty: boolean }} Anzahl gebuchter Zahlungen / Daten geändert
 */
function runProcessAllowances(data, now = new Date()) {
  const today     = localDateStr(now);
  let booked = 0;
  let dirty  = false;

  for (const a of data.allowances) {
    if (migrateLegacyAllowance(data, a, now)) dirty = true;
    if (!a.isActive) continue;

    // Letzter bereits abgerechneter Tag (exklusiver Startpunkt)
    const bounds = [];
    if (a.lastExecuted) bounds.push(a.lastExecuted.slice(0, 10));
    if (a.activeSince)  bounds.push(localDateStr(addDays(parseLocalDate(a.activeSince), -1)));
    const start = bounds.sort().at(-1);

    for (let d = addDays(parseLocalDate(start), 1); localDateStr(d) <= today; d = addDays(d, 1)) {
      const isDue =
        (a.frequency === 'weekly'  && a.dayOfWeek  === d.getDay())  ||
        (a.frequency === 'monthly' && a.dayOfMonth === d.getDate());
      if (!isDue) continue;

      const dateStr = localDateStr(d);
      data.transactions.push({
        id: crypto.randomUUID(),
        childId: a.childId,
        amount: a.amount,
        type: 'allowance',
        // Sprachneutral: die Anzeige („Taschengeld (Mo)“) entsteht erst beim Rendern
        description: '',
        schedule: a.frequency === 'weekly'
          ? { frequency: 'weekly', dayOfWeek: a.dayOfWeek }
          : { frequency: 'monthly', dayOfMonth: a.dayOfMonth },
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

// ── Öffentliche API ────────────────────────────────────────────────────────────

export const api = {

  // Gesamter State (Kinder + aktive Ziele + Einstellungen ohne PIN-Hash)
  getState() {
    const data = loadData();
    const activeGoalsByChild = {};
    for (const g of data.goals) {
      if (!g.completedAt && !g.purchasedAt) {
        (activeGoalsByChild[g.childId] ??= []).push(g);
      }
    }
    return Promise.resolve({
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
      settings: {
        currency: data.settings.currency,
        pinEnabled: !!data.settings.adminPinHash,
        pinMigrationPending: isPinMigrationPending(data.settings),
      },
    });
  },

  // Admin-PIN überprüfen
  async verifyPin(pin) {
    if (!pin) throw new DomainError('pinMissing');
    const data = loadData();
    if (!data.settings.adminPinHash) return { valid: false };
    const hash = await hashPin(pin);
    return { valid: hash === data.settings.adminPinHash };
  },

  // ── PIN-Schutz (optional) ─────────────────────────────────────────────────

  getSecurity() {
    const { settings } = loadData();
    return Promise.resolve({
      pinEnabled: !!settings.adminPinHash,
      pinMigrationPending: isPinMigrationPending(settings),
    });
  },

  /** PIN-Schutz mit neuer PIN aktivieren – ein bestehender Schutz wird nur über „PIN ändern“ geändert */
  async enablePin(newPin) {
    const data = loadData();
    if (data.settings.adminPinHash && !isPinMigrationPending(data.settings)) {
      throw new DomainError('pinAlreadyEnabled');
    }
    const pin = validateNewPin(newPin);
    data.settings.adminPinHash = await hashPin(pin);
    data.settings.pinConfigured = true;
    saveData(data);
    return { pinEnabled: true };
  },

  /** PIN-Schutz abschalten – erfordert die aktuelle PIN (außer bei der Erstentscheidung nach dem Update) */
  async disablePin(currentPin) {
    const data = loadData();
    if (data.settings.adminPinHash && !isPinMigrationPending(data.settings)) {
      if (!currentPin) throw new DomainError('currentPinMissing');
      if (await hashPin(String(currentPin).trim()) !== data.settings.adminPinHash) {
        throw new DomainError('currentPinWrong');
      }
    }
    data.settings.adminPinHash = null;
    data.settings.pinConfigured = true;
    saveData(data);
    return { pinEnabled: false };
  },

  // ── Kinder ────────────────────────────────────────────────────────────────

  getChildren() {
    return Promise.resolve(loadData().children);
  },

  createChild(body) {
    validateChild(body);
    const data = loadData();
    const initialBalance = body.balance !== undefined ? +(Number(body.balance).toFixed(2)) : 0;

    const child = {
      id: crypto.randomUUID(),
      name: sanitize(body.name),
      avatar: sanitize(body.avatar || '😊'),
      colorPaletteIndex: Number(body.colorPaletteIndex ?? 0),
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
        description: '',
        date: new Date().toISOString(),
      });
    }

    // Optionales Taschengeld direkt beim Anlegen einrichten
    if (body.allowance && Number(body.allowance.amount) > 0) {
      try {
        const aBody = {
          amount: +(Number(body.allowance.amount).toFixed(2)),
          frequency: 'weekly',
          dayOfWeek: Number(body.allowance.dayOfWeek ?? 6),
          dayOfMonth: null,
        };
        validateAllowance(aBody);
        data.allowances.push({
          id: crypto.randomUUID(),
          childId: child.id,
          ...aBody,
          lastExecuted: null,
          activeSince: localDateStr(new Date()),
          createdAt: new Date().toISOString(),
          isActive: true,
        });
      } catch (_) { /* Ungültige Taschengeld-Daten ignorieren – Kind wurde bereits angelegt */ }
    }

    saveData(data);
    return Promise.resolve(child);
  },

  updateChild(id, body) {
    validateChild(body);
    const data = loadData();
    const child = data.children.find(c => c.id === id);
    if (!child) throw new DomainError('childNotFound');

    child.name = sanitize(body.name);
    child.avatar = sanitize(body.avatar || child.avatar);
    child.colorPaletteIndex = Number(body.colorPaletteIndex ?? child.colorPaletteIndex);

    saveData(data);
    return Promise.resolve(child);
  },

  deleteChild(id) {
    const data = loadData();
    const idx = data.children.findIndex(c => c.id === id);
    if (idx === -1) throw new DomainError('childNotFound');

    data.children.splice(idx, 1);
    data.allowances   = data.allowances.filter(a => a.childId !== id);
    data.transactions = data.transactions.filter(t => t.childId !== id);
    data.goals        = data.goals.filter(g => g.childId !== id);

    saveData(data);
    return Promise.resolve({ success: true });
  },

  // ── Transaktionen ──────────────────────────────────────────────────────────

  getTransactions(childId) {
    const data = loadData();
    if (!data.children.find(c => c.id === childId)) throw new DomainError('childNotFound');
    const txs = data.transactions
      .filter(t => t.childId === childId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    return Promise.resolve(txs);
  },

  addTransaction(childId, body) {
    const data = loadData();
    const child = data.children.find(c => c.id === childId);
    if (!child) throw new DomainError('childNotFound');

    const amount = Number(body.amount);
    if (isNaN(amount) || amount === 0) throw new DomainError('invalidAmount');
    if (Math.abs(amount) > 9999.99) throw new DomainError('amountTooLarge');

    const validTypes = ['manual', 'goal_allocation'];
    const type        = validTypes.includes(body.type) ? body.type : 'manual';
    const description = sanitize(body.description || '').slice(0, 100);

    const tx = {
      id: crypto.randomUUID(),
      childId,
      amount: +amount.toFixed(2),
      type,
      description,
      date: new Date().toISOString(),
    };
    data.transactions.push(tx);
    child.balance = +(child.balance + amount).toFixed(2);

    saveData(data);
    return Promise.resolve({ transaction: tx, newBalance: child.balance });
  },

  // ── Taschengeld-Regeln ─────────────────────────────────────────────────────

  getAllowances(childId) {
    const data = loadData();
    if (!data.children.find(c => c.id === childId)) throw new DomainError('childNotFound');
    return Promise.resolve(data.allowances.filter(a => a.childId === childId));
  },

  createAllowance(childId, body) {
    validateAllowance(body);
    const data = loadData();
    if (!data.children.find(c => c.id === childId)) throw new DomainError('childNotFound');

    const allowance = {
      id: crypto.randomUUID(),
      childId,
      amount: +(Number(body.amount).toFixed(2)),
      frequency: body.frequency,
      dayOfWeek:  body.frequency === 'weekly'  ? Number(body.dayOfWeek)  : null,
      dayOfMonth: body.frequency === 'monthly' ? Number(body.dayOfMonth) : null,
      lastExecuted: null,
      activeSince: localDateStr(new Date()),
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    data.allowances.push(allowance);
    saveData(data);
    return Promise.resolve(allowance);
  },

  updateAllowance(id, body) {
    validateAllowance(body);
    const data = loadData();
    const allowance = data.allowances.find(a => a.id === id);
    if (!allowance) throw new DomainError('ruleNotFound');

    allowance.amount    = +(Number(body.amount).toFixed(2));
    allowance.frequency = body.frequency;
    allowance.dayOfWeek  = body.frequency === 'weekly'  ? Number(body.dayOfWeek)  : null;
    allowance.dayOfMonth = body.frequency === 'monthly' ? Number(body.dayOfMonth) : null;
    if (body.isActive !== undefined) {
      const isActive = Boolean(body.isActive);
      // Bei Reaktivierung keine Zahlungen für die inaktive Zeit nachholen
      if (isActive && !allowance.isActive) allowance.activeSince = localDateStr(new Date());
      allowance.isActive = isActive;
    }

    saveData(data);
    return Promise.resolve(allowance);
  },

  deleteAllowance(id) {
    const data = loadData();
    const idx = data.allowances.findIndex(a => a.id === id);
    if (idx === -1) throw new DomainError('ruleNotFound');
    data.allowances.splice(idx, 1);
    saveData(data);
    return Promise.resolve({ success: true });
  },

  processAllowances() {
    const data = loadData();
    const { booked, dirty } = runProcessAllowances(data);
    if (dirty) saveData(data);
    return Promise.resolve({ processed: booked, changed: booked > 0 });
  },

  // ── Sparziele ──────────────────────────────────────────────────────────────

  getGoals(childId) {
    const data = loadData();
    if (!data.children.find(c => c.id === childId)) throw new DomainError('childNotFound');
    return Promise.resolve(data.goals.filter(g => g.childId === childId));
  },

  createGoal(childId, body) {
    validateGoal(body);
    const data = loadData();
    if (!data.children.find(c => c.id === childId)) throw new DomainError('childNotFound');

    const goal = {
      id: crypto.randomUUID(),
      childId,
      name: sanitize(body.name),
      targetAmount: +(Number(body.targetAmount).toFixed(2)),
      savedAmount:  +(Number(body.initialSaved ?? 0).toFixed(2)),
      initialSaved: +(Number(body.initialSaved ?? 0).toFixed(2)),
      icon: sanitize(body.icon || '🎯'),
      createdAt:   new Date().toISOString(),
      completedAt: null,
      purchasedAt: null,
    };
    data.goals.push(goal);
    saveData(data);
    return Promise.resolve(goal);
  },

  updateGoal(id, body) {
    const data = loadData();
    const goal = data.goals.find(g => g.id === id);
    if (!goal) throw new DomainError('goalNotFound');

    // Ziel kaufen (Guthaben abziehen + als gekauft markieren)
    if (body.purchaseGoal) {
      const child = data.children.find(c => c.id === goal.childId);
      if (!child) throw new DomainError('childNotFound');
      if (child.balance < goal.targetAmount) throw new DomainError('notEnoughBalance');

      child.balance = +(child.balance - goal.targetAmount).toFixed(2);
      data.transactions.push({
        id: crypto.randomUUID(),
        childId: goal.childId,
        amount: -goal.targetAmount,
        type: 'goal_purchase',
        // Nur der Zielname; „Gekauft: …“ wird beim Anzeigen übersetzt
        description: goal.name,
        date: new Date().toISOString(),
      });
      goal.completedAt = new Date().toISOString();
      goal.purchasedAt = new Date().toISOString();
    }

    if (body.markPurchased) {
      goal.purchasedAt = new Date().toISOString();
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name || name.length > 60) throw new DomainError('invalidName');
      goal.name = sanitize(name);
    }
    if (body.targetAmount !== undefined) {
      const t = Number(body.targetAmount);
      if (isNaN(t) || t <= 0 || t > 99999) throw new DomainError('invalidTarget');
      goal.targetAmount = +t.toFixed(2);
    }
    if (body.icon !== undefined) goal.icon = sanitize(body.icon);

    saveData(data);
    const child = data.children.find(c => c.id === goal.childId);
    return Promise.resolve({ goal, newBalance: child?.balance });
  },

  deleteGoal(id) {
    const data = loadData();
    const idx = data.goals.findIndex(g => g.id === id);
    if (idx === -1) throw new DomainError('goalNotFound');
    data.goals.splice(idx, 1);
    saveData(data);
    return Promise.resolve({ success: true });
  },

  // ── Einstellungen ──────────────────────────────────────────────────────────

  async updateSettings(body) {
    const data = loadData();
    const { currency, newPin, currentPin } = body;

    if (currency) {
      const c = sanitize(currency);
      if (c.length < 1 || c.length > 3) throw new DomainError('invalidCurrency');
      data.settings.currency = c;
    }

    if (newPin) {
      if (!data.settings.adminPinHash) throw new DomainError('pinNotEnabled');
      if (!currentPin) throw new DomainError('currentPinMissing');
      const currentHash = await hashPin(currentPin);
      if (currentHash !== data.settings.adminPinHash) throw new DomainError('currentPinWrong');
      data.settings.adminPinHash = await hashPin(validateNewPin(newPin));
      data.settings.pinConfigured = true;
    }

    saveData(data);
    return { currency: data.settings.currency };
  },
};
