---
applyTo: "**"
---

# KidsWallet – Datenmodell, API & Backend-Logik

## data.json Vollstruktur

```json
{
  "settings": {
    "adminPinHash": null,            // SHA-256 hex der PIN oder null = kein PIN-Schutz
    "pinConfigured": true,           // Entscheidung über den PIN-Schutz getroffen (Migration der alten Standard-PIN)
    "currency": "€"
  },
  "children": [
    {
      "id": "uuid-v4",
      "name": "Mia",
      "avatar": "🦁",
      "colorPaletteIndex": 0,
      "balance": 0.0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "allowances": [
    {
      "id": "uuid-v4",
      "childId": "uuid-v4",
      "amount": 2.0,
      "frequency": "weekly",
      "dayOfWeek": 6,
      "dayOfMonth": null,
      "lastExecuted": "2024-03-23",
      "activeSince": "2024-03-01",
      "isActive": true
    }
  ],
  "transactions": [
    {
      "id": "uuid-v4",
      "childId": "uuid-v4",
      "amount": 2.0,
      "type": "allowance",
      "description": "Taschengeld (Samstag)",
      "date": "2024-03-30T10:00:00.000Z"
    }
  ],
  "goals": [
    {
      "id": "uuid-v4",
      "childId": "uuid-v4",
      "name": "Neues Fahrrad",
      "targetAmount": 100.0,
      "savedAmount": 25.0,
      "icon": "🚲",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "completedAt": null
    }
  ]
}
```

## Transaktionstypen

| Typ               | Beschreibung                                                 |
| ----------------- | ------------------------------------------------------------ |
| `initial`         | Grundbetrag beim Erstellen des Wallets                       |
| `allowance`       | Automatisch durch Taschengeld-Regel                          |
| `manual`          | Vom Elternteil manuell hinzugefügt oder abgezogen            |
| `goal_allocation` | Betrag einem Sparziel zugewiesen (negativer Betrag = Sparen) |

## API-Endpunkte (alle unter /api)

| Method | Pfad                       | Beschreibung                                 |
| ------ | -------------------------- | -------------------------------------------- |
| GET    | /state                     | Kinder + Settings (kein PIN, kein sensibles) |
| POST   | /admin/verify              | PIN prüfen → `{ valid: bool }`               |
| GET    | /children                  | Alle Kinder                                  |
| POST   | /children                  | Kind erstellen                               |
| PUT    | /children/:id              | Kind bearbeiten                              |
| DELETE | /children/:id              | Kind löschen                                 |
| GET    | /children/:id/transactions | Transaktionen (neueste zuerst)               |
| POST   | /children/:id/transactions | Manuelle Transaktion hinzufügen              |
| GET    | /children/:id/allowances   | Taschengeld-Regeln                           |
| POST   | /children/:id/allowances   | Neue Taschengeld-Regel                       |
| PUT    | /allowances/:id            | Regel bearbeiten                             |
| DELETE | /allowances/:id            | Regel löschen                                |
| GET    | /children/:id/goals        | Sparziele                                    |
| POST   | /children/:id/goals        | Neues Sparziel                               |
| PUT    | /goals/:id                 | Sparziel bearbeiten (inkl. savedAmount)      |
| DELETE | /goals/:id                 | Sparziel löschen                             |
| POST   | /allowances/process        | Fällige Zahlungen ausführen (beim App-Start) |
| PUT    | /settings                  | Einstellungen speichern (PIN, Währung)       |

## Allowance-Prozess-Logik

Beim App-Start werden **alle** fälligen Zahltage gebucht – auch solche, an denen die App
nicht geöffnet wurde. Geprüft wird jeder Tag nach dem letzten Abrechnungsstand bis heute
(lokales Datum, nicht UTC):

- Startpunkt (exklusiv) = späteres Datum aus `lastExecuted` und `activeSince - 1 Tag`.
  Altdaten ohne beides erhalten beim ersten Lauf `activeSince = gestern`.
- `activeSince` wird beim Anlegen und bei Reaktivierung einer Regel auf heute gesetzt,
  damit keine Zahlungen für Zeiträume vor dem Anlegen bzw. während der Inaktivität entstehen.
- Nachgeholte Buchungen erhalten das Datum des jeweiligen Zahltags (08:00 Uhr Ortszeit).
- `lastExecuted` = Datum des zuletzt gebuchten Zahltags.

Implementierung: `runProcessAllowances()` in `src/js/api-local.js` bzw.
`processAllowances()` in `server.js`.

```js
for (const a of data.allowances) {
  if (!a.isActive) continue;
  if (!a.lastExecuted && !a.activeSince) a.activeSince = yesterday; // Altdaten-Migration
  const bounds = [];
  if (a.lastExecuted) bounds.push(a.lastExecuted);
  if (a.activeSince) bounds.push(localDateStr(addDays(parseLocalDate(a.activeSince), -1)));
  const start = bounds.sort().at(-1);

  for (let d = addDays(parseLocalDate(start), 1); localDateStr(d) <= today; d = addDays(d, 1)) {
    const isDue =
      (a.frequency === "weekly" && a.dayOfWeek === d.getDay()) ||
      (a.frequency === "monthly" && a.dayOfMonth === d.getDate());
    if (!isDue) continue;
    // Transaktion buchen, Kontostand erhöhen, a.lastExecuted = localDateStr(d)
  }
}
```

## PIN-Hashing

```js
import { createHash } from "crypto";
function hashPin(pin) {
  return createHash("sha256").update(String(pin)).digest("hex");
}
// Frühere Standard-PIN "1234" (nur noch zur Migration bestehender Installationen):
// 03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4
```

## Server-Validierung (immer serverseitig!)

```js
function sanitize(str) {
  return String(str)
    .trim()
    .replace(/[<>&"']/g, "");
}
function validateChild(body) {
  if (!body.name || String(body.name).trim().length < 1)
    throw new Error("Name fehlt");
  if (String(body.name).trim().length > 50) throw new Error("Name zu lang");
  if (body.colorPaletteIndex < 0 || body.colorPaletteIndex > 7)
    throw new Error("Ungültige Farbe");
  if (
    body.balance !== undefined &&
    (isNaN(body.balance) || body.balance > 99999)
  )
    throw new Error("Ungültiger Betrag");
}
function validateAllowance(body) {
  if (
    !body.amount ||
    isNaN(body.amount) ||
    body.amount <= 0 ||
    body.amount > 9999.99
  )
    throw new Error("Ungültiger Betrag");
  if (!["weekly", "monthly"].includes(body.frequency))
    throw new Error("Ungültige Häufigkeit");
  if (body.frequency === "weekly" && (body.dayOfWeek < 0 || body.dayOfWeek > 6))
    throw new Error("Ungültiger Wochentag");
  if (
    body.frequency === "monthly" &&
    (body.dayOfMonth < 1 || body.dayOfMonth > 28)
  )
    throw new Error("Ungültiger Tag");
}
```

## Datei-I/O Pattern (server.js)

```js
import { readFileSync, writeFileSync } from "fs";
const DATA_PATH = new URL("./data/data.json", import.meta.url);

function readData() {
  return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}
function writeData(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf-8");
}
```
