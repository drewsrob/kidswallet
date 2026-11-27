// validation.js – Gemeinsame Eingabeprüfung für Formulardialoge
// Regeln liefern eine Fehlermeldung oder '' (gültig) und werden vom Modal live am Feld ausgewertet.
import { formatCurrency } from './utils.js';
import { t, getLocale } from './i18n.js';

/**
 * Betrag aus einem Textfeld lesen. Akzeptiert Komma und Punkt („2,50“, „2.50“, „1.000,50“).
 * @returns {{ empty: boolean, value: number, error: ''|'invalid'|'decimals'|'negative' }}
 */
export function parseAmount(raw) {
  let s = String(raw ?? '').replace(/[\s€$£]/g, '');
  if (!s) return { empty: true, value: NaN, error: '' };
  if (/^[-−]/.test(s)) return { empty: false, value: NaN, error: 'negative' };
  // Bei beiden Trennzeichen ist das letzte das Dezimaltrennzeichen, das andere Tausendertrenner
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '') : s.replace(/,/g, '');
  }
  s = s.replace(',', '.');
  if (!/^(\d+\.?\d*|\.\d+)$/.test(s)) return { empty: false, value: NaN, error: 'invalid' };
  if ((s.split('.')[1] ?? '').length > 2) return { empty: false, value: NaN, error: 'decimals' };
  return { empty: false, value: Number(s), error: '' };
}

/** Dezimaltrennzeichen der aktuellen Sprache („,“ oder „.“) */
function decimalSeparator() {
  try {
    return new Intl.NumberFormat(getLocale()).formatToParts(1.5).find(p => p.type === 'decimal')?.value ?? '.';
  } catch {
    return '.';
  }
}

/** Betrag für ein Eingabefeld vorbelegen („2,50“ bzw. „2.50“ je nach Sprache). */
export function formatAmountInput(amount) {
  if (amount == null || isNaN(amount)) return '';
  return Number(amount).toFixed(2).replace('.', decimalSeparator());
}

/** Regel: Pflichtbetrag größer 0 und höchstens `max`. */
export function amountRule({ max, currency = '€' }) {
  return (raw) => {
    const { empty, value, error } = parseAmount(raw);
    if (empty) return t('validation.amountRequired');
    if (error === 'negative') return t('validation.amountNotNegative');
    if (error === 'decimals') return t('validation.amountDecimals');
    if (error) return t('validation.amountInvalid');
    if (value <= 0) return t('validation.amountRequired');
    if (value > max) return t('validation.amountMax', { max: formatCurrency(max, currency) });
    return '';
  };
}

/** Regel: Pflichttext (nicht nur Leerzeichen). */
export function requiredRule(message) {
  return (raw) => (String(raw ?? '').trim() ? '' : (message ?? t('validation.nameRequired')));
}

/**
 * Regel: ganze Zahl zwischen min und max.
 * @param {string|Function} message  Meldung oder Funktion, die sie zur Prüfzeit liefert
 */
export function intRangeRule(min, max, message) {
  return (raw) => {
    const s = String(raw ?? '').trim();
    const n = Number(s);
    if (/^\d+$/.test(s) && n >= min && n <= max) return '';
    return typeof message === 'function' ? message() : message;
  };
}
