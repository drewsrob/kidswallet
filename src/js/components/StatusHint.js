// components/StatusHint.js – Dezente Statushinweise (Chips) für Dashboard & Cards
import './StatusHint.css';
import { escapeHtml } from '../utils.js';
import { icon as renderIcon } from '../icons.js';
import { t } from '../i18n.js';

const DEFAULT_ICONS = { success: 'check-circle', info: 'info', attention: 'alert-circle' };

/**
 * @param {Object} status
 * @param {'success'|'info'|'attention'} [status.tone='info']
 * @param {string} status.text
 * @param {string} [status.icon] – Icon-Key aus icons.js
 * @param {string} [status.href] – macht den Hinweis zum Link
 */
export function renderStatusHint({ tone = 'info', text, icon, href } = {}) {
  const content = `${renderIcon(icon || DEFAULT_ICONS[tone] || 'info', { size: 16 })}<span>${escapeHtml(text)}</span>`;
  const cls = `status-hint status-hint--${tone}`;
  return href
    ? `<a class="${cls}" href="${escapeHtml(href)}">${content}</a>`
    : `<span class="${cls}">${content}</span>`;
}

export function renderStatusList(statuses = [], label = t('common.hints')) {
  if (!statuses.length) return '';
  return `
    <ul class="status-list" aria-label="${escapeHtml(label)}">
      ${statuses.map(s => `<li>${renderStatusHint(s)}</li>`).join('')}
    </ul>`;
}
