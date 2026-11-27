// goalSymbols.js – Zentrale Symbolbibliothek für Sparziele
//
// Jedes Symbol: { id, category, svg }
//  - id:       stabiler Schlüssel (wird am Sparziel gespeichert – niemals umbenennen)
//  - category: Schlüssel aus GOAL_SYMBOL_CATEGORIES
//  - svg:      Pfad-Markup für ein 24×24-Feather-Icon (stroke="currentColor")
//
// Sichtbare Texte liegen in den Sprachdateien:
//  - symbols.items.<id>.name      sichtbare/vorgelesene Bezeichnung
//  - symbols.items.<id>.keywords  Synonyme für die Suche (ein Text, durch Komma/Leerzeichen getrennt)
//  - symbols.categories.<id>      Kategoriename
//
// Neue Symbole: Eintrag in GOAL_SYMBOLS und Texte in den Sprachdateien ergänzen –
// Auswahl, Suche und icon() übernehmen ihn automatisch.

import { t, hasKey, getLanguage } from './i18n.js';

/** Kategorie-IDs in Anzeigereihenfolge */
export const GOAL_SYMBOL_CATEGORIES = [
  'spielzeug',
  'forschen',
  'medien',
  'freizeit',
  'allgemein',
];

export const DEFAULT_GOAL_SYMBOL = 'bike';

export const GOAL_SYMBOLS = [
  // ── Spielzeug ────────────────────────────────────────────────────────────
  {
    id: 'blocks', category: 'spielzeug',
    svg: `<rect x="3" y="11" width="18" height="9" rx="1"/><rect x="5.5" y="7" width="4" height="4" rx="1"/><rect x="14.5" y="7" width="4" height="4" rx="1"/>`,
  },
  {
    id: 'teddy', category: 'spielzeug',
    svg: `<circle cx="6.4" cy="7.4" r="2.2"/><circle cx="17.6" cy="7.4" r="2.2"/><circle cx="12" cy="13" r="6"/><ellipse cx="12" cy="15.5" rx="2.5" ry="1.8"/><line x1="9.5" y1="11.5" x2="9.51" y2="11.5"/><line x1="14.5" y1="11.5" x2="14.51" y2="11.5"/>`,
  },
  {
    id: 'puzzle', category: 'spielzeug',
    svg: `<path d="M5 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H5z"/>`,
  },
  {
    id: 'car', category: 'spielzeug',
    svg: `<path d="M3 17v-5l2.5-5h9l4 5H21v5"/><path d="M3 12h18"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5"/>`,
  },
  {
    id: 'gamepad', category: 'spielzeug',
    svg: `<line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/>`,
  },
  {
    id: 'robot', category: 'spielzeug',
    svg: `<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1"/><line x1="9" y1="12" x2="9.01" y2="12"/><line x1="15" y1="12" x2="15.01" y2="12"/><path d="M9.5 15.5h5"/><path d="M2 12v4M22 12v4"/>`,
  },
  {
    id: 'kite', category: 'spielzeug',
    svg: `<polygon points="12 2 19 9 12 17 5 9"/><path d="M5 9h14M12 2v15"/><path d="M12 17c-1.5 1.5 1.5 2.5 0 5"/>`,
  },
  {
    id: 'dice', category: 'spielzeug',
    svg: `<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/>`,
  },

  // ── Forschen & Entdecken ─────────────────────────────────────────────────
  {
    id: 'microscope', category: 'forschen',
    svg: `<path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>`,
  },
  {
    id: 'flask', category: 'forschen',
    svg: `<path d="M9 2h6"/><path d="M10 2v6.5L4.6 18.4A2 2 0 0 0 6.4 21.5h11.2a2 2 0 0 0 1.8-3.1L14 8.5V2"/><path d="M7 15h10"/>`,
  },
  {
    id: 'gem', category: 'forschen',
    svg: `<polygon points="6 3 18 3 22 9 12 22 2 9"/><line x1="2" y1="9" x2="22" y2="9"/><polyline points="6 3 12 9 18 3"/>`,
  },
  {
    id: 'fossil', category: 'forschen',
    svg: `<path d="M12 12a1 1 0 0 1 1 1 2 2 0 0 1-2 2 3 3 0 0 1-3-3 4 4 0 0 1 4-4 5 5 0 0 1 5 5 6 6 0 0 1-6 6 7 7 0 0 1-7-7 8 8 0 0 1 8-8"/>`,
  },
  {
    id: 'magnifier', category: 'forschen',
    svg: `<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16" y2="16"/>`,
  },
  {
    id: 'volcano', category: 'forschen',
    svg: `<path d="M3 21 9 10h6l6 11z"/><path d="M9 10l1.5 3 1.5-2 1.5 2 1.5-3"/><path d="M12 7V4M9 6.5 7.5 4M15 6.5 16.5 4"/>`,
  },
  {
    id: 'telescope', category: 'forschen',
    svg: `<path d="M3 13.5 16.5 7l2 4L5 17.5z"/><path d="M16.5 7 19 6l2 4-2.5 1"/><path d="M11 15.5 8 22M12.5 15l3.5 7"/>`,
  },
  {
    id: 'planet', category: 'forschen',
    svg: `<circle cx="12" cy="12" r="6"/><path d="M6.5 14.3C3.3 16.4 1.6 18.5 2.3 19.7c.9 1.6 6.3-.4 12-4.5 5.7-4.1 9.1-8.6 8.2-10.1-.6-1.1-3-.7-6.1.8"/>`,
  },
  {
    id: 'compass', category: 'forschen',
    svg: `<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>`,
  },
  {
    id: 'leaf', category: 'forschen',
    svg: `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>`,
  },

  // ── Medien & Wissen ──────────────────────────────────────────────────────
  {
    id: 'book', category: 'medien',
    svg: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
  },
  {
    id: 'magazine', category: 'medien',
    svg: `<path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8z"/>`,
  },
  {
    id: 'music', category: 'medien',
    svg: `<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>`,
  },
  {
    id: 'headphones', category: 'medien',
    svg: `<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>`,
  },
  {
    id: 'camera', category: 'medien',
    svg: `<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>`,
  },
  {
    id: 'film', category: 'medien',
    svg: `<rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>`,
  },
  {
    id: 'phone', category: 'medien',
    svg: `<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
  },
  {
    id: 'tablet', category: 'medien',
    svg: `<rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
  },
  {
    id: 'laptop', category: 'medien',
    svg: `<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/>`,
  },

  // ── Freizeit & Hobby ─────────────────────────────────────────────────────
  {
    id: 'bike', category: 'freizeit',
    svg: `<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>`,
  },
  {
    id: 'ball', category: 'freizeit',
    svg: `<circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M20.49 9H3.51"/><path d="M20.49 15H3.51"/>`,
  },
  {
    id: 'skateboard', category: 'freizeit',
    svg: `<path d="M2 11c0 1.1.9 2 2 2h16a2 2 0 0 0 2-2"/><path d="M7 13v2M17 13v2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>`,
  },
  {
    id: 'rocket', category: 'freizeit',
    svg: `<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>`,
  },
  {
    id: 'plane', category: 'freizeit',
    svg: `<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.9 1.1s.4 1 .9 1.1l7.6 2.5 2.5 7.6c.1.5.5.9 1.1.9s1-.4 1.1-.9z"/>`,
  },
  {
    id: 'house', category: 'freizeit',
    svg: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
  },
  {
    id: 'tent', category: 'freizeit',
    svg: `<path d="M3.5 21 12 4l8.5 17"/><path d="M2 21h20"/><path d="M9 21l3-6 3 6"/>`,
  },
  {
    id: 'palette', category: 'freizeit',
    svg: `<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>`,
  },
  {
    id: 'ticket', category: 'freizeit',
    svg: `<path d="M2 9V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6z"/><path d="M13 5v2M13 11v2M13 17v2"/>`,
  },
  {
    id: 'paw', category: 'freizeit',
    svg: `<path d="M12 21c-3 0-5.5-1.4-5.5-4S9 12 12 12s5.5 2.5 5.5 5-2.5 4-5.5 4z"/><circle cx="5" cy="10.5" r="2"/><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="19" cy="10.5" r="2"/>`,
  },

  // ── Wünsche & Allgemein ──────────────────────────────────────────────────
  {
    id: 'gift', category: 'allgemein',
    svg: `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`,
  },
  {
    id: 'wish', category: 'allgemein',
    svg: `<path d="M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/><path d="M4 2v4M2 4h4"/>`,
  },
  {
    id: 'star', category: 'allgemein',
    svg: `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`,
  },
  {
    id: 'heart', category: 'allgemein',
    svg: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  },
  {
    id: 'crown', category: 'allgemein',
    svg: `<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><line x1="2" y1="20" x2="22" y2="20"/>`,
  },
  {
    id: 'trophy', category: 'allgemein',
    svg: `<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/><rect x="6" y="18" width="12" height="4"/><line x1="12" y1="2" x2="12" y2="18"/>`,
  },
  {
    id: 'piggy', category: 'allgemein',
    svg: `<ellipse cx="12" cy="14" rx="8" ry="6"/><circle cx="20" cy="13" r="2.5"/><line x1="12" y1="8" x2="12" y2="5"/><line x1="10.5" y1="5" x2="13.5" y2="5"/><circle cx="10" cy="12.5" r="1" fill="currentColor"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="14" y1="20" x2="14" y2="22"/><path d="M4.5 14c-1-.4-1.5-1.2-1.5-2"/>`,
  },
];

const BY_ID = new Map(GOAL_SYMBOLS.map(s => [s.id, s]));

/** Symbol per ID (oder undefined) */
export function getGoalSymbol(id) {
  return BY_ID.get(id);
}

/** Sichtbare Bezeichnung eines Symbols in der aktuellen Sprache (Fallback: ID) */
export function getSymbolName(id) {
  const key = `symbols.items.${id}.name`;
  return hasKey(key) ? t(key) : String(id ?? '');
}

/** Suchbegriffe eines Symbols in der aktuellen Sprache (ein Text) */
export function getSymbolKeywords(id) {
  const key = `symbols.items.${id}.keywords`;
  return hasKey(key) ? t(key) : '';
}

/** Kategoriename in der aktuellen Sprache (Fallback: ID) */
export function getCategoryName(id) {
  const key = `symbols.categories.${id}`;
  return hasKey(key) ? t(key) : String(id ?? '');
}

/** Klein, ohne Akzente/Umlaut-Punkte, ß → ss – damit „bar“ auch „Bär“ findet */
export function normalizeSearch(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Suchindex je Sprache – wird beim ersten Suchen in einer Sprache aufgebaut
const searchIndexes = new Map();

function searchIndex() {
  const lang = getLanguage();
  let index = searchIndexes.get(lang);
  if (!index) {
    index = new Map(GOAL_SYMBOLS.map(s => [
      s.id,
      normalizeSearch([getSymbolName(s.id), getSymbolKeywords(s.id), getCategoryName(s.category)].join(' ')),
    ]));
    searchIndexes.set(lang, index);
  }
  return index;
}

/**
 * Prüft, ob ein Symbol zur Suche passt. Alle Suchwörter müssen in Name,
 * Synonymen oder Kategorie vorkommen (Teilwort-Treffer, z. B. „rad“ → Fahrrad).
 */
export function matchesGoalSymbol(symbol, query) {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const haystack = searchIndex().get(symbol.id) ?? '';
  return terms.every(term => haystack.includes(term));
}

/** Symbole, die zur Suche passen (Reihenfolge der Bibliothek bleibt erhalten) */
export function searchGoalSymbols(query) {
  return GOAL_SYMBOLS.filter(s => matchesGoalSymbol(s, query));
}
