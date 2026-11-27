// template.js – Micro-Template-Engine für Vite ?raw HTML-Importe
//
// Verwendung in View-Dateien:
//   import rawHtml from './MyView.html?raw';
//   import { parseBlocks, render } from '../template.js';
//
//   const blocks = parseBlocks(rawHtml);
//   someEl.innerHTML = render(blocks.main, { data });
//
// In .html-Template-Dateien werden JavaScript-Template-Literal-Ausdrücke
// mit ${ ... } verwendet. Globale Hilfsfunktionen (formatCurrency, icon, …)
// stehen automatisch zur Verfügung.

import {
  formatCurrency,
  escapeHtml,
  calcPercent,
  getPaletteColors,
  formatAllowanceSchedule,
  getDayNames,
  formatRelativeDate,
} from './utils.js';
import { icon, AVATAR_ICON_KEYS } from './icons.js';
import { renderAvatarPicker } from './components/AvatarPicker.js';
import { renderColorPicker } from './components/ColorPicker.js';
import { renderEmptyState } from './components/EmptyState.js';
import { renderStatusHint, renderStatusList } from './components/StatusHint.js';
import { renderStatGroup, renderPeriodStats, formatSignedCurrency } from './components/StatTile.js';
import { t } from './i18n.js';
import { formatAmountInput } from './validation.js';
import { helpButton } from './components/HelpButton.js';
import { sectionHeader } from './components/SectionHeader.js';

// Alle Hilfsfunktionen, die in Templates ohne expliziten Import verfügbar sind.
// Sprachabhängige Werte sind Getter, damit sie bei jedem Rendern neu ermittelt werden.
const TEMPLATE_GLOBALS = {
  t,
  formatCurrency,
  escapeHtml,
  calcPercent,
  getPaletteColors,
  formatAllowanceSchedule,
  get DAY_NAMES() { return getDayNames(); },
  formatRelativeDate,
  icon,
  AVATAR_ICON_KEYS,
  renderAvatarPicker,
  renderColorPicker,
  renderEmptyState,
  renderStatusHint,
  renderStatusList,
  renderStatGroup,
  renderPeriodStats,
  formatSignedCurrency,
  formatAmountInput,
  helpButton,
  sectionHeader,
};

/**
 * Benannte Blöcke aus einer HTML-Template-Datei extrahieren.
 * Trennlinie: <!-- @block: blockName -->
 *
 * @param {string} html – Roher HTML-String (via ?raw import)
 * @returns {Object.<string, string>} – Map: Blockname → Template-String
 */
export function parseBlocks(html) {
  const blocks = {};
  const re = /<!--\s*@block:\s*(\w+)\s*-->([\s\S]*?)(?=<!--\s*@block:|$)/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    blocks[match[1]] = match[2].trim();
  }
  return blocks;
}

/**
 * Template-String mit Daten rendern.
 * Der Template-String darf JavaScript-Template-Literal-Ausdrücke enthalten.
 * Globale Helfer aus TEMPLATE_GLOBALS sind automatisch verfügbar.
 *
 * @param {string} template – Template-String (Template-Literal-Inhalt ohne Backticks)
 * @param {Object} [data={}] – Zusätzliche Variablen, die im Template verfügbar sind
 * @returns {string} – Gerendertes HTML
 */
export function render(template, data = {}) {
  const ctx = { ...TEMPLATE_GLOBALS, ...data };
  // eslint-disable-next-line no-new-func
  return new Function(...Object.keys(ctx), `return \`${template}\``)(...Object.values(ctx));
}
