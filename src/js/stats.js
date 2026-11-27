// stats.js – Statistik-Grundlage: aggregiert Buchungen für Diagramme und Übersichten
//
// Alle Beträge werden intern in Cent summiert (keine Rundungsfehler bei vielen Buchungen)
// und erst bei der Ausgabe in Währungseinheiten umgerechnet.
// Ergebnisse werden je Buchungsliste (Array-Referenz) zwischengespeichert: Ein Wechsel des
// Zeitraums oder erneutes Abfragen derselben Liste rechnet nichts doppelt.
//
// Erweiterbarkeit (z. B. Premium): weitere Zeiträume in STATS_RANGES ergänzen und mit
// `premium: true` markieren – getAvailableRanges() blendet sie ohne Freischaltung aus.

/**
 * @typedef {Object} StatsRange
 * @property {string} id
 * @property {number} months         Länge des Zeitraums
 * @property {'week'|'month'} bucket Auflösung der Diagrammpunkte
 * @property {boolean} [premium]
 */

/** @type {StatsRange[]} */
export const STATS_RANGES = [
  { id: '1m', months: 1, bucket: 'week' },
  { id: '3m', months: 3, bucket: 'week' },
  { id: '6m', months: 6, bucket: 'month' },
];

export const DEFAULT_RANGE_ID = '1m';

// Mindestanzahl an Buchungen bzw. Diagrammpunkten, damit ein Verlauf aussagekräftig ist
const MIN_TRANSACTIONS = 2;
const MIN_BUCKETS = 2;

/** Zeiträume, die angeboten werden (Premium-Zeiträume nur mit Freischaltung). */
export function getAvailableRanges({ premium = false } = {}) {
  return STATS_RANGES.filter(r => premium || !r.premium);
}

export function getRange(id) {
  return STATS_RANGES.find(r => r.id === id) ?? STATS_RANGES.find(r => r.id === DEFAULT_RANGE_ID);
}

// ── Hilfsfunktionen ───────────────────────────────────────────────────────────

const toCents = (amount) => Math.round(Number(amount) * 100) || 0;
const fromCents = (cents) => cents / 100;

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

function startOfWeek(d) {
  // Woche beginnt am Montag
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addBucket(d, bucket) {
  return bucket === 'week'
    ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7)
    : new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

const startOfBucket = (d, bucket) => (bucket === 'week' ? startOfWeek(d) : startOfMonth(d));

function periodOut({ income, expense, count }) {
  return { income: fromCents(income), expense: fromCents(expense), net: fromCents(income - expense), count };
}

// ── Cache ─────────────────────────────────────────────────────────────────────

/** @type {WeakMap<object[], { index?: ReturnType<typeof buildIndex>, series: Map<string, object> }>} */
const cache = new WeakMap();

function entryFor(transactions) {
  let entry = cache.get(transactions);
  if (!entry) cache.set(transactions, (entry = { series: new Map() }));
  return entry;
}

/**
 * Ein einziger Durchlauf über alle Buchungen: Summen je Monat, Gesamtsummen, älteste Buchung.
 * Einnahmen = positive Beträge, Ausgaben = negative Beträge (als positiver Wert).
 */
function buildIndex(transactions) {
  const months = new Map();
  const total = { income: 0, expense: 0, count: 0 };
  let oldest = null;

  for (const tx of transactions) {
    const date = new Date(tx.date);
    if (Number.isNaN(date.getTime())) continue;
    const cents = toCents(tx.amount);
    const key = monthKey(date);
    let m = months.get(key);
    if (!m) months.set(key, (m = { key, income: 0, expense: 0, count: 0 }));
    for (const p of [m, total]) {
      p.count++;
      if (cents >= 0) p.income += cents; else p.expense -= cents;
    }
    if (!oldest || date < oldest) oldest = date;
  }
  return { months, total, oldest };
}

function indexFor(transactions) {
  const entry = entryFor(transactions);
  entry.index ??= buildIndex(transactions);
  return entry.index;
}

// ── Öffentliche Auswertungen ──────────────────────────────────────────────────

/**
 * Summen über alle Buchungen seit Bestehen des Kontos.
 * @returns {{ income: number, expense: number, net: number, count: number, since: Date|null }}
 */
export function getTotals(transactions) {
  const { total, oldest } = indexFor(transactions);
  return { ...periodOut(total), since: oldest };
}

/**
 * Buchungen nach Kalendermonat gruppieren – neueste Monate zuerst, inkl. Monatssummen.
 * Die Reihenfolge der Buchungen innerhalb eines Monats bleibt erhalten.
 * @returns {{ key: string, date: Date, income: number, expense: number, net: number, count: number, items: object[] }[]}
 */
export function groupByMonth(transactions) {
  const { months } = indexFor(transactions);
  const groups = new Map();
  for (const tx of transactions) {
    const date = new Date(tx.date);
    if (Number.isNaN(date.getTime())) continue;
    const key = monthKey(date);
    let g = groups.get(key);
    if (!g) {
      g = { key, date: startOfMonth(date), ...periodOut(months.get(key)), items: [] };
      groups.set(key, g);
    }
    g.items.push(tx);
  }
  return [...groups.values()].sort((a, b) => b.date - a.date);
}

/**
 * Verlauf von Einnahmen und Ausgaben für einen Zeitraum (aggregiert je Woche bzw. Monat).
 * Der Zeitraum beginnt frühestens mit der ältesten Buchung – vor Bestehen des Kontos
 * werden keine leeren Punkte erzeugt.
 *
 * @param {object[]} transactions
 * @param {string} rangeId
 * @param {Date} [now]
 * @returns {{
 *   range: StatsRange,
 *   points: { start: Date, income: number, expense: number, count: number }[],
 *   income: number, expense: number, count: number,
 *   hasEnoughData: boolean,
 * }}
 */
export function getActivitySeries(transactions, rangeId, now = new Date()) {
  const range = getRange(rangeId);
  const entry = entryFor(transactions);
  // Tagesgenau zwischenspeichern, damit sich die Werte über Mitternacht korrekt verschieben
  const cacheKey = `${range.id}|${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const cached = entry.series.get(cacheKey);
  if (cached) return cached;

  const { months, oldest } = indexFor(transactions);
  const { bucket } = range;
  // Monate: aktueller plus (months − 1) volle Vormonate; Wochen: alle Wochen der letzten `months` Monate
  const rangeStart = bucket === 'month'
    ? new Date(now.getFullYear(), now.getMonth() - range.months + 1, 1)
    : startOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() - Math.round(range.months * 30.44)));
  const firstStart = oldest && startOfBucket(oldest, bucket) > rangeStart ? startOfBucket(oldest, bucket) : rangeStart;
  const end = addBucket(startOfBucket(now, bucket), bucket);

  const points = [];
  for (let d = firstStart; d < end; d = addBucket(d, bucket)) {
    points.push({ start: d, income: 0, expense: 0, count: 0 });
  }

  if (bucket === 'month') {
    // Monatswerte direkt aus dem Index – unabhängig von der Anzahl der Buchungen
    for (const p of points) {
      const m = months.get(monthKey(p.start));
      if (m) Object.assign(p, { income: m.income, expense: m.expense, count: m.count });
    }
  } else if (points.length) {
    const from = points[0].start;
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    for (const tx of transactions) {
      const date = new Date(tx.date);
      if (!(date >= from) || date >= end) continue;
      // Sommer-/Winterzeit verschiebt um max. eine Stunde – Index per Rundung stabil
      const i = Math.floor((startOfWeek(date) - from + WEEK_MS / 2) / WEEK_MS);
      const p = points[i];
      if (!p) continue;
      const cents = toCents(tx.amount);
      p.count++;
      if (cents >= 0) p.income += cents; else p.expense -= cents;
    }
  }

  let income = 0, expense = 0, count = 0;
  for (const p of points) {
    income += p.income; expense += p.expense; count += p.count;
    p.income = fromCents(p.income);
    p.expense = fromCents(p.expense);
  }

  const result = {
    range,
    points,
    income: fromCents(income),
    expense: fromCents(expense),
    count,
    hasEnoughData: points.length >= MIN_BUCKETS && count >= MIN_TRANSACTIONS,
  };
  entry.series.set(cacheKey, result);
  return result;
}
