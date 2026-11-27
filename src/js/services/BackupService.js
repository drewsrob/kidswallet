// services/BackupService.js – Datensicherung: Export, Import, Validierung, Versionsprüfung
//
// Unabhängig von der Oberfläche. Das Backup-Format beschreibt fachliche Daten
// (Kinder, Buchungen, …) und nicht die Speichertechnik. Wo die Daten liegen,
// entscheidet ein austauschbarer Storage-Adapter (heute localStorage, später
// z. B. SQLite oder Cloud), ohne dass sich das Format ändern muss.
//
// Format (Version 1):
// {
//   "version": 1,
//   "createdAt": "2026-11-26T10:30:00.000Z",
//   "app": "KidsWallet",
//   "data": {
//     "children": [...], "allowances": [...], "transactions": [...], "goals": [...],
//     "settings":    { "currency": "€", "adminPinHash": "<sha-256>" | null, "pinConfigured": true },
//     "preferences": { "theme": "system" | "light" | "dark" | null, "accent": "#rrggbb" | null, "language": "de" | null }
//   }
// }

export const BACKUP_APP = 'KidsWallet';
export const BACKUP_VERSION = 1;
export const SUPPORTED_BACKUP_VERSIONS = [1];

const ENTITY_KEYS = ['children', 'allowances', 'transactions', 'goals'];

export class BackupError extends Error {
  /** @param {'invalid' | 'unsupportedVersion' | 'corrupt'} code */
  constructor(code, message) {
    super(message ?? code);
    this.name = 'BackupError';
    this.code = code;
  }
}

// ── Storage-Adapter: localStorage ───────────────────────────────────────────
const LS_KEYS = {
  data: 'kidswallet-data',
  theme: 'kidswallet-theme',
  accent: 'kidswallet-accent',
  language: 'kidswallet-language',
  meta: 'kidswallet-backup-meta',
};

export const localStorageAdapter = {
  /** Aktuellen Datenbestand im Backup-Datenformat liefern */
  read() {
    let stored = {};
    try { stored = JSON.parse(localStorage.getItem(LS_KEYS.data) ?? '{}') ?? {}; } catch { stored = {}; }
    const data = { ...stored };
    for (const key of ENTITY_KEYS) data[key] = Array.isArray(stored[key]) ? stored[key] : [];
    data.settings = isPlainObject(stored.settings) ? stored.settings : {};
    data.preferences = {
      theme: localStorage.getItem(LS_KEYS.theme),
      accent: localStorage.getItem(LS_KEYS.accent),
      // Nur der Sprachcode – Backups enthalten keine übersetzten Texte
      language: localStorage.getItem(LS_KEYS.language),
    };
    return data;
  },

  /** Datenbestand vollständig ersetzen – bei einem Fehler wird der alte Stand zurückgeschrieben */
  write(data) {
    const { preferences, ...appData } = data;
    const keys = [LS_KEYS.data, LS_KEYS.theme, LS_KEYS.accent, LS_KEYS.language];
    const previous = keys.map(k => [k, localStorage.getItem(k)]);
    try {
      localStorage.setItem(LS_KEYS.data, JSON.stringify(appData));
      setOrRemove(LS_KEYS.theme, preferences?.theme);
      setOrRemove(LS_KEYS.accent, preferences?.accent);
      // Ältere Backups ohne Sprache lassen die aktuelle Sprachwahl unverändert
      if (preferences && 'language' in preferences) setOrRemove(LS_KEYS.language, preferences.language);
    } catch (err) {
      previous.forEach(([k, v]) => setOrRemove(k, v));
      throw err;
    }
  },

  readMeta() {
    try { return JSON.parse(localStorage.getItem(LS_KEYS.meta) ?? 'null'); } catch { return null; }
  },

  writeMeta(meta) {
    localStorage.setItem(LS_KEYS.meta, JSON.stringify(meta));
  },
};

function setOrRemove(key, value) {
  if (value === null || value === undefined) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
}

// ── Export ──────────────────────────────────────────────────────────────────

/** Vollständiges Backup-Objekt aus dem aktuellen Datenbestand erzeugen */
export function createBackup({ adapter = localStorageAdapter, now = new Date() } = {}) {
  return {
    version: BACKUP_VERSION,
    createdAt: now.toISOString(),
    app: BACKUP_APP,
    data: adapter.read(),
  };
}

export function serializeBackup(backup) {
  return JSON.stringify(backup, null, 2);
}

/** Dateiname nach Schema kidswallet-backup-YYYY-MM-DD.json (lokales Datum) */
export function backupFileName(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `kidswallet-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

/** Erfolgreichen Export vermerken (Datum + Version für die Übersicht) */
export function recordBackupCreated(backup, { adapter = localStorageAdapter } = {}) {
  const meta = { ...(adapter.readMeta() ?? {}), lastBackupAt: backup.createdAt, version: backup.version };
  adapter.writeMeta(meta);
  return meta;
}

/** @returns {{ lastBackupAt?: string, version?: number } | null} */
export function getBackupInfo({ adapter = localStorageAdapter } = {}) {
  return adapter.readMeta();
}

// ── Import ──────────────────────────────────────────────────────────────────

/**
 * Dateiinhalt einlesen und vollständig prüfen.
 * @param {string} text
 * @returns {object} geprüftes Backup
 * @throws {BackupError}
 */
export function parseBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(String(text).replace(/^\uFEFF/, ''));
  } catch {
    // Sieht nach einem abgeschnittenen/veränderten KidsWallet-Backup aus → beschädigt
    throw new BackupError(/"app"\s*:\s*"KidsWallet"/.test(String(text)) ? 'corrupt' : 'invalid');
  }
  return validateBackup(parsed);
}

/**
 * Struktur und Version prüfen.
 * @throws {BackupError}
 */
export function validateBackup(backup) {
  if (!isPlainObject(backup) || backup.app !== BACKUP_APP) throw new BackupError('invalid');
  if (!Number.isInteger(backup.version) || !SUPPORTED_BACKUP_VERSIONS.includes(backup.version)) {
    throw new BackupError('unsupportedVersion');
  }
  if (typeof backup.createdAt !== 'string' || Number.isNaN(Date.parse(backup.createdAt))) {
    throw new BackupError('corrupt', 'createdAt');
  }

  const { data } = backup;
  if (!isPlainObject(data)) throw new BackupError('corrupt', 'data');

  for (const key of ENTITY_KEYS) {
    if (!Array.isArray(data[key])) throw new BackupError('corrupt', key);
  }
  const check = (list, name, fields) => {
    const ids = new Set();
    for (const item of list) {
      if (!isPlainObject(item) || !isId(item.id) || ids.has(item.id)) throw new BackupError('corrupt', name);
      ids.add(item.id);
      for (const [field, test] of Object.entries(fields)) {
        if (!test(item[field])) throw new BackupError('corrupt', `${name}.${field}`);
      }
    }
  };
  check(data.children, 'children', { name: isString, balance: isNumber });
  check(data.allowances, 'allowances', { childId: isId, amount: isNumber });
  check(data.transactions, 'transactions', { childId: isId, amount: isNumber });
  check(data.goals, 'goals', { childId: isId, name: isString, targetAmount: isNumber });

  const { settings, preferences } = data;
  if (!isPlainObject(settings) || !isString(settings.currency)
    // Ohne aktiven PIN-Schutz ist adminPinHash null (ältere Backups enthalten immer eine PIN)
    || !(settings.adminPinHash == null || (typeof settings.adminPinHash === 'string' && /^[0-9a-f]{64}$/.test(settings.adminPinHash)))
    || !(settings.pinConfigured === undefined || typeof settings.pinConfigured === 'boolean')) {
    throw new BackupError('corrupt', 'settings');
  }
  if (!isPlainObject(preferences)
    || !(preferences.theme == null || ['system', 'light', 'dark'].includes(preferences.theme))
    || !(preferences.accent == null || /^#[0-9a-f]{6}$/i.test(preferences.accent))
    || !(preferences.language == null || /^[a-z]{2,3}$/.test(preferences.language))) {
    throw new BackupError('corrupt', 'preferences');
  }
  return backup;
}

/**
 * Geprüftes Backup wiederherstellen – ersetzt den aktuellen Datenbestand vollständig.
 * @throws {BackupError}
 */
export function restoreBackup(backup, { adapter = localStorageAdapter } = {}) {
  validateBackup(backup);
  adapter.write(backup.data);
}

// ── Hilfsfunktionen ─────────────────────────────────────────────────────────
function isPlainObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }
function isString(v) { return typeof v === 'string' && v.trim() !== ''; }
function isNumber(v) { return typeof v === 'number' && Number.isFinite(v); }
function isId(v) { return isString(v) || Number.isInteger(v); }
