// components/EmptyState.js – Einheitlicher leerer Zustand mit nächstem Schritt
import './EmptyState.css';
import { escapeHtml } from '../utils.js';
import { icon as renderIcon } from '../icons.js';
import { t } from '../i18n.js';

/**
 * @param {Object} opts
 * @param {string} [opts.icon]   – Icon-Key aus icons.js
 * @param {string} [opts.title]  – Überschrift (entfällt z.B. in Cards mit eigenem Header)
 * @param {string} opts.text     – Beschreibung
 * @param {Array<{label: string, id?: string, action?: string, href?: string, icon?: string,
 *   variant?: 'primary'|'secondary'|'ghost', ariaLabel?: string}>} [opts.actions]
 * @param {'page'|'inline'} [opts.variant='page'] – page: ganze Ansicht, inline: innerhalb einer Card
 * @param {string} [opts.tone] – 'danger' färbt das Icon für Fehlerzustände
 */
export function renderEmptyState({ icon, title, text, actions = [], variant = 'page', tone } = {}) {
  const iconSize = variant === 'inline' ? 32 : 48;
  const classes = ['empty-state', `empty-state--${variant}`, tone ? `empty-state--${tone}` : '']
    .filter(Boolean).join(' ');

  return `
    <div class="${classes}">
      ${icon ? `<span class="empty-icon" aria-hidden="true">${renderIcon(icon, { size: iconSize })}</span>` : ''}
      ${title ? `<h2 class="empty-state__title">${escapeHtml(title)}</h2>` : ''}
      ${text ? `<p class="empty-state__text">${escapeHtml(text)}</p>` : ''}
      ${actions.length ? `<div class="empty-state__actions">${actions.map(renderAction).join('')}</div>` : ''}
    </div>`;
}

/** Fallback, wenn eine Kind-ID nicht (mehr) existiert. */
export function renderChildNotFound() {
  return renderEmptyState({
    icon: 'alert-circle',
    title: t('empty.childNotFound.title'),
    text: t('empty.childNotFound.text'),
    actions: [{ label: t('common.toHome'), href: '#/', icon: 'arrow-left' }],
  });
}

function renderAction({ label, id, action, href, icon, variant = 'primary', ariaLabel }) {
  const attrs = [
    `class="btn btn-${variant}"`,
    id ? `id="${escapeHtml(id)}"` : '',
    action ? `data-action="${escapeHtml(action)}"` : '',
    ariaLabel ? `aria-label="${escapeHtml(ariaLabel)}"` : '',
  ].filter(Boolean).join(' ');
  const content = `${icon ? renderIcon(icon, { size: 18 }) : ''} ${escapeHtml(label)}`;
  return href
    ? `<a ${attrs} href="${escapeHtml(href)}">${content}</a>`
    : `<button ${attrs} type="button">${content}</button>`;
}
