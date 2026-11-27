// components/SectionHeader.js – Einheitlicher Kopf für Seiten, Cards und Bereiche
//
// Aufbau:  [Symbol] Titel                     [ⓘ]
//                                        [Aktion]
// Das Info-Icon gehört fest zur Titelzeile und steht rechts außen.
// Die Aktion steht immer in einer eigenen Zeile darunter, rechtsbündig –
// so verdrängen sich Titel, Aktion und Info auf keiner Bildschirmbreite.

import { icon as renderIcon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import { helpButton } from './HelpButton.js';

/**
 * @typedef {Object} SectionHeaderAction
 * @property {string} id
 * @property {string} label
 * @property {string} [icon]
 * @property {string} [ariaLabel]
 * @property {'ghost'|'primary'|'secondary'} [variant='ghost']  ghost wird kompakt dargestellt
 */

/**
 * @param {Object} opts
 * @param {string} opts.title            Klartext, wird escaped
 * @param {string} [opts.id]             id der Überschrift (für aria-labelledby)
 * @param {1|2|3} [opts.level=2]         Überschriftenebene
 * @param {string} [opts.icon]           Symbol vor dem Titel
 * @param {string} [opts.subtitle]       Zusatzzeile unter dem Titel (Klartext)
 * @param {SectionHeaderAction} [opts.action]
 * @param {string} [opts.help]           Schlüssel aus helpTopics.js → Info-Icon rechts außen
 * @param {string} [opts.className]
 * @returns {string} HTML
 */
export function sectionHeader({ title, id, level = 2, icon, subtitle, action, help, className = '' }) {
  const tag = `h${level}`;
  const iconSize = level === 1 ? 24 : 18;
  return /* html */`
    <header class="section-header section-header--h${level}${className ? ` ${className}` : ''}">
      <div class="section-header__row">
        <${tag} class="section-header__title"${id ? ` id="${id}"` : ''}>
          ${icon ? renderIcon(icon, { size: iconSize, className: 'inline-icon' }) : ''}<span>${escapeHtml(title)}</span>
        </${tag}>
        ${help ? helpButton(help) : ''}
      </div>
      ${action ? `<div class="section-header__actions">${renderAction(action)}</div>` : ''}
      ${subtitle ? `<p class="section-header__subtitle">${escapeHtml(subtitle)}</p>` : ''}
    </header>`;
}

function renderAction({ id, label, icon, ariaLabel, variant = 'ghost' }) {
  const size = variant === 'ghost' ? ' btn-sm' : '';
  return /* html */`<button class="btn btn-${variant}${size} section-header__action" id="${id}" type="button"${ariaLabel ? ` aria-label="${escapeHtml(ariaLabel)}"` : ''}>
    ${icon ? renderIcon(icon, { size: variant === 'ghost' ? 16 : 18 }) : ''}<span>${escapeHtml(label)}</span>
  </button>`;
}
