// components/StatTile.js – Kompakte Kennzahlen (Wert + Beschriftung), z. B. Einnahmen / Ausgaben / Saldo
import './StatTile.css';
import { escapeHtml, formatCurrency } from '../utils.js';
import { t } from '../i18n.js';

const MINUS = '\u2212';

/**
 * Betrag mit Vorzeichen formatieren (+2,00 € / −1,00 € / 0,00 €).
 * @param {number} amount
 * @param {string} currency
 */
export function formatSignedCurrency(amount, currency = '€') {
  if (amount === 0) return formatCurrency(0, currency);
  return `${amount < 0 ? MINUS : '+'}${formatCurrency(Math.abs(amount), currency)}`;
}

/**
 * @param {Object} stat
 * @param {string} stat.value – bereits formatierter Wert
 * @param {string} stat.label
 * @param {'pos'|'neg'|'neutral'|'muted'} [stat.tone='neutral']
 * @param {boolean} [stat.emphasis] – hebt die Kachel dezent hervor (z. B. Saldo)
 */
export function renderStatTile({ value, label, tone = 'neutral', emphasis = false }) {
  return `
    <div class="stat-tile stat-tile--${tone}${emphasis ? ' stat-tile--emphasis' : ''}">
      <dt class="stat-tile__label">${escapeHtml(label)}</dt>
      <dd class="stat-tile__value">${escapeHtml(value)}</dd>
    </div>`;
}

/**
 * Gruppe von Kennzahlen mit optionaler Überschrift.
 * @param {Array} stats – siehe renderStatTile
 * @param {string} [title]
 */
export function renderStatGroup(stats, title) {
  return `
    <div class="stat-group">
      ${title ? `<h3 class="stat-group__title">${escapeHtml(title)}</h3>` : ''}
      <dl class="stat-group__tiles">${stats.map(renderStatTile).join('')}</dl>
    </div>`;
}

/** Standard-Kennzahlen Einnahmen / Ausgaben / Saldo für einen Zeitraum. */
export function renderPeriodStats({ income, expense, net }, title, currency = '€') {
  return renderStatGroup([
    { value: formatSignedCurrency(income, currency), label: t('dashboard.statIncome'), tone: income ? 'pos' : 'muted' },
    { value: formatSignedCurrency(-expense, currency), label: t('dashboard.statExpense'), tone: expense ? 'neg' : 'muted' },
    { value: formatSignedCurrency(net, currency), label: t('dashboard.statNet'), tone: 'neutral', emphasis: true },
  ], title);
}
