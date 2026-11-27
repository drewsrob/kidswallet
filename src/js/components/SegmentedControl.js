// components/SegmentedControl.js – Kompakte Umschaltung zwischen wenigen Optionen (z. B. 1M / 3M / 6M)
import './SegmentedControl.css';
import { escapeHtml } from '../utils.js';

/**
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.label                Gruppenbeschriftung für Screenreader
 * @param {{ value: string, label: string, ariaLabel?: string }[]} opts.options
 * @param {string} opts.selected
 * @returns {string} HTML
 */
export function renderSegmentedControl({ id, label, options, selected }) {
  return /* html */`
    <div class="segmented" id="${escapeHtml(id)}" role="group" aria-label="${escapeHtml(label)}">
      ${options.map(o => `
        <button class="segmented__option" type="button" data-value="${escapeHtml(o.value)}"
          aria-pressed="${o.value === selected}"${o.ariaLabel ? ` aria-label="${escapeHtml(o.ariaLabel)}"` : ''}>${escapeHtml(o.label)}</button>
      `).join('')}
    </div>`;
}

/**
 * Auswahl verdrahten. onChange wird nur bei einer tatsächlichen Änderung aufgerufen.
 * @returns {() => void} Aufräumfunktion
 */
export function bindSegmentedControl(el, onChange) {
  const handler = (e) => {
    const btn = e.target.closest('.segmented__option');
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
    for (const b of el.querySelectorAll('.segmented__option')) {
      b.setAttribute('aria-pressed', String(b === btn));
    }
    onChange(btn.dataset.value);
  };
  el.addEventListener('click', handler);
  return () => el.removeEventListener('click', handler);
}
