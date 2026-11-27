// utils.js – Hilfsfunktionen

import { t, getLocale } from './i18n.js';

/**
 * Geldbetrag im Zahlenformat der aktuellen Sprache formatieren
 * @param {number} amount
 * @param {string} currency Währungssymbol (z.B. "€")
 */
export function formatCurrency(amount, currency = '€') {
  const formatted = new Intl.NumberFormat(getLocale(), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  // Schmales geschütztes Leerzeichen, damit Betrag und Symbol nie umbrechen
  return t('format.currency', { amount: formatted, currency }).replace(/ /g, '\u202f');
}

/**
 * ISO-Datum im Datumsformat der aktuellen Sprache formatieren
 * @param {string} isoString
 */
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(getLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Uhrzeit (Stunden:Minuten) im Format der aktuellen Sprache */
export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' });
}

/** Datum mit Uhrzeit, z. B. „26.11.2026, 10:30 Uhr“ */
export function formatDateTime(isoString) {
  return t('format.dateTime', { date: formatDate(isoString), time: formatTime(isoString) });
}

/**
 * Wochentag-Namen der aktuellen Sprache (Index 0 = Sonntag)
 * @param {'long'|'short'} [width]
 */
export function getDayNames(width = 'long') {
  const fmt = new Intl.DateTimeFormat(getLocale(), { weekday: width });
  // 2023-01-01 war ein Sonntag
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
}

/**
 * Datum als relative Zeit formatieren (heute, gestern, ...)
 * @param {string} isoString
 */
export function formatRelativeDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  // Kalendertage vergleichen, nicht 24-h-Blöcke (gestern 22 Uhr ≠ „Heute“)
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return t('format.today');
  if (diffDays === 1) return t('format.yesterday');
  if (diffDays < 7) return t('format.daysAgo', { count: diffDays });
  return formatDate(isoString);
}

/**
 * HTML-Sonderzeichen escapen (verhindert XSS in Template-Literals)
 * @param {*} str
 */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Kind-Farbthema auf :root setzen
 * @param {number} paletteIndex 0–7
 */
export function applyChildTheme(paletteIndex) {
  const idx = Math.max(0, Math.min(7, Number(paletteIndex) || 0));
  const root = document.documentElement;
  root.style.setProperty('--child-primary', `var(--palette-${idx}-primary)`);
  root.style.setProperty('--child-light', `var(--palette-${idx}-light)`);
  const hex = getComputedStyle(root).getPropertyValue(`--palette-${idx}-primary`).trim();
  applyColorTokens('child', hex);
}

/**
 * Kind-Farbthema zurücksetzen auf Standard-Lila
 */
export function resetChildTheme() {
  const accent = localStorage.getItem('kidswallet-accent') || '#6c63ff';
  document.documentElement.style.setProperty('--child-primary', accent);
  document.documentElement.style.setProperty('--child-light', `color-mix(in srgb, ${accent} 15%, transparent)`);
  applyColorTokens('child', accent);
}

// ── Barrierefreie Farbableitung (WCAG 2.x) ──────────────────────────────────
// Feste Theme-Flächen aus variables.css, gegen die Text geprüft wird.
const THEME_SURFACES = {
  light: { bg: '#ffffff', surfaces: ['#ffffff', '#f4f6fb'], inverse: '#ffffff', heroInks: ['#1f2328', '#000000'] },
  dark:  { bg: '#22272e', surfaces: ['#22272e', '#2d333b', '#373e47'], inverse: '#22272e', heroInk: '#edf2f7' },
};
const AA_TEXT = 4.5;
const MAX_FILL_SHIFT = 0.2;

function _rgb(hex) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) || 0);
}

function _hex(rgb) {
  return '#' + rgb.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

function _mix(a, b, t) {
  const x = _rgb(a), y = _rgb(b);
  return _hex(x.map((v, i) => v * (1 - t) + y[i] * t));
}

function _luminance(hex) {
  const [r, g, b] = _rgb(hex).map(v => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const la = _luminance(a), lb = _luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Verschiebt `hex` schrittweise Richtung `toward`, bis alle Hintergründe ≥ min erreichen. */
function _shiftUntil(hex, toward, backgrounds, min = AA_TEXT) {
  for (let t = 0; t <= 1; t += 0.01) {
    const c = _mix(hex, toward, t);
    if (backgrounds.every(bg => contrastRatio(c, bg) >= min)) return { color: c, shift: t };
  }
  return { color: toward, shift: 1 };
}

function _toHsl(hex) {
  const [r, g, b] = _rgb(hex).map(v => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function _fromHsl([h, s, l]) {
  if (s === 0) return _hex([l, l, l].map(v => v * 255));
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const ch = (t) => {
    t = (t + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return _hex([ch(h + 1 / 3), ch(h), ch(h - 1 / 3)].map(v => v * 255));
}

/** Gleicher Farbton, Helligkeit um `delta` verschoben, Sättigung optional gedeckelt – nie neutral. */
function _shade(hex, delta, maxSat = 1) {
  const [h, s, l] = _toHsl(hex);
  return _fromHsl([h, Math.min(s, maxSat), Math.min(0.95, Math.max(0.05, l + delta))]);
}

/** Dunkelt `hex` um höchstens `maxDelta` ab, solange `ink` darauf AA-Kontrast behält. */
function _darkenWhile(hex, maxDelta, ink) {
  let best = hex;
  for (let d = 0.01; d <= maxDelta + 1e-9; d += 0.01) {
    const c = _shade(hex, -d);
    if (contrastRatio(c, ink) < AA_TEXT) break;
    best = c;
  }
  return best;
}

const HERO_DEPTH = 0.08;
// Dunkle Töne mit voller Sättigung wirken auf dunklem Grund grell; leicht gedeckelt bleiben sie ruhig, aber farbig.
const HERO_DARK_MAX_SAT = 0.7;

/**
 * Subtiler tonaler Verlauf für Hero- und Kinderkarten: Kinderfarbe → leicht dunklere Variante.
 * Nur die Helligkeit ändert sich (Farbton/Sättigung bleiben), damit die Fläche als eine Farbe wirkt.
 * Dunkel: Kinderfarbe wird zunächst so weit abgedunkelt, bis helle Schrift AA erreicht.
 * `inkL` ist die Schrift im hellen Theme mit AA-Kontrast auf beiden Stopps.
 */
export function heroGradient(hex) {
  const { light, dark } = THEME_SURFACES;
  const startL = _shade(hex, HERO_DEPTH / 2);
  const endL = _darkenWhile(hex, HERO_DEPTH / 2, '#000000');
  const inkL = light.heroInks.find(ink => [startL, endL].every(c => contrastRatio(ink, c) >= AA_TEXT)) || '#000000';

  let startD = _shade(hex, 0, HERO_DARK_MAX_SAT);
  for (let d = 0; d <= 1 && contrastRatio(startD, dark.heroInk) < AA_TEXT; d += 0.01) startD = _shade(hex, -d, HERO_DARK_MAX_SAT);
  const endD = _shade(startD, -HERO_DEPTH);
  return { startL, endL, startD, endD, inkL };
}

/** Füllfarbe + Schriftfarbe für Buttons; bevorzugt die Theme-Schrift, sonst die Gegenfarbe. */
function _fillPair(hex, preferredInk, otherInk) {
  const towardAway = contrastRatio(preferredInk, '#ffffff') > contrastRatio(preferredInk, '#000000') ? '#ffffff' : '#000000';
  const preferred = _shiftUntil(hex, towardAway, [preferredInk]);
  if (preferred.shift <= MAX_FILL_SHIFT) return { fill: preferred.color, ink: preferredInk };
  if (contrastRatio(hex, otherInk) >= AA_TEXT) return { fill: hex, ink: otherInk };
  return { fill: preferred.color, ink: preferredInk };
}

/**
 * Leitet aus einer Basisfarbe lesbare Varianten für helles und dunkles Theme ab und
 * setzt sie als --{prefix}-text-l/-d, --{prefix}-fill-l/-d, --{prefix}-on-fill-l/-d,
 * --{prefix}-hero-ink-l und --{prefix}-hero-start/-end-l/-d auf :root.
 * @param {'child'|'accent'} prefix
 * @param {string} hex
 */
export function applyColorTokens(prefix, hex) {
  if (!/^#?[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(hex).trim())) return;
  const { light, dark } = THEME_SURFACES;
  const tint = (bg, t) => _mix(bg, hex, t);

  const textL = _shiftUntil(hex, '#000000', [...light.surfaces, tint('#f4f6fb', 0.15), tint('#ffffff', 0.2)]).color;
  const textD = _shiftUntil(hex, '#ffffff', [...dark.surfaces, tint('#2d333b', 0.15), tint('#373e47', 0.15)]).color;
  const fillL = _fillPair(hex, light.inverse, '#1f2328');
  const fillD = _fillPair(hex, dark.inverse, '#ffffff');
  const hero = heroGradient(hex);

  const style = document.documentElement.style;
  style.setProperty(`--${prefix}-text-l`, textL);
  style.setProperty(`--${prefix}-text-d`, textD);
  style.setProperty(`--${prefix}-fill-l`, fillL.fill);
  style.setProperty(`--${prefix}-on-fill-l`, fillL.ink);
  style.setProperty(`--${prefix}-fill-d`, fillD.fill);
  style.setProperty(`--${prefix}-on-fill-d`, fillD.ink);
  style.setProperty(`--${prefix}-hero-ink-l`, hero.inkL);
  style.setProperty(`--${prefix}-hero-start-l`, hero.startL);
  style.setProperty(`--${prefix}-hero-start-d`, hero.startD);
  style.setProperty(`--${prefix}-hero-end-l`, hero.endL);
  style.setProperty(`--${prefix}-hero-end-d`, hero.endD);
}

/**
 * Palette-Farbe direkt aus CSS-Variablen auslesen
 * @param {number} paletteIndex
 * @returns {{ primary: string, light: string }}
 */
export function getPaletteColors(paletteIndex) {
  const idx = Math.max(0, Math.min(7, Number(paletteIndex) || 0));
  const style = getComputedStyle(document.documentElement);
  const primary = style.getPropertyValue(`--palette-${idx}-primary`).trim();
  return {
    primary,
    light: style.getPropertyValue(`--palette-${idx}-light`).trim(),
    ink: inkOn(primary),
    hero: heroGradient(primary),
  };
}

/** Lesbarste Schriftfarbe (weiß oder fast schwarz) auf einer Fläche in `hex`. */
export function inkOn(hex) {
  return contrastRatio('#ffffff', hex) >= contrastRatio('#1f2328', hex) ? '#ffffff' : '#1f2328';
}

/**
 * Taschengeld-Regel als lesbaren String formatieren
 * @param {object} allowance
 */
export function formatAllowanceSchedule(allowance) {
  if (allowance.frequency === 'weekly') {
    return t('allowance.scheduleWeekly', { day: getDayNames()[allowance.dayOfWeek] });
  }
  return t('allowance.scheduleMonthly', { day: allowance.dayOfMonth });
}

/**
 * Prozentsatz berechnen (0–100, geclampt)
 * @param {number} current
 * @param {number} total
 */
export function calcPercent(current, total) {
  if (!total || total <= 0) return 0;
  return Math.min(100, Math.round((current / total) * 100));
}

/**
 * Geldbetrag animiert von `from` bis `to` hochzählen
 * @param {HTMLElement} el
 * @param {number} from
 * @param {number} to
 * @param {string} currency
 * @param {number} duration in ms
 */
export function animateCountUp(el, from, to, currency, duration = 800) {
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(Math.max((now - start) / duration, 0), 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = formatCurrency(from + (to - from) * eased, currency);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = formatCurrency(to, currency);
  }
  requestAnimationFrame(tick);
}
