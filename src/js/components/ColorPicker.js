// components/ColorPicker.js – Farbpaletten-Auswahl (8 Farben)

import { t } from '../i18n.js';
import { escapeHtml } from '../utils.js';

/** Farbpaletten-Definitionen (Name über symbols.colors.<nameKey>) */
export const PALETTES = [
  { index: 0, nameKey: 'purple',     primary: '#6c63ff', light: '#ede9ff' },
  { index: 1, nameKey: 'coral',      primary: '#ff6b6b', light: '#fff0f0' },
  { index: 2, nameKey: 'green',      primary: '#43aa8b', light: '#e8f8f1' },
  { index: 3, nameKey: 'orange',     primary: '#f9a826', light: '#fff8e1' },
  { index: 4, nameKey: 'pink',       primary: '#ef476f', light: '#fce4ec' },
  { index: 5, nameKey: 'blue',       primary: '#118ab2', light: '#e1f5fe' },
  { index: 6, nameKey: 'lightGreen', primary: '#8ac926', light: '#f1f8e9' },
  { index: 7, nameKey: 'violet',     primary: '#9b5de5', light: '#f3e5ff' },
];

/** Name einer Farbpalette in der aktuellen Sprache */
export function paletteName(palette) {
  return t(`symbols.colors.${palette.nameKey}`);
}

/**
 * Color-Picker HTML-String erzeugen
 * @param {number} selectedIndex Aktuell ausgewählter Paletten-Index (0–7)
 * @param {string} pickerId ID für das Container-Element
 */
export function renderColorPicker(selectedIndex = 0, pickerId = 'color-picker') {
  const swatches = PALETTES.map(p => /* html */`
    <button
      type="button"
      class="color-swatch${p.index === selectedIndex ? ' selected' : ''}"
      style="background-color: ${p.primary};"
      data-palette-index="${p.index}"
      data-picker="${pickerId}"
      aria-label="${escapeHtml(paletteName(p))}"
      aria-pressed="${p.index === selectedIndex}"
      title="${escapeHtml(paletteName(p))}"
    ></button>
  `).join('');

  return /* html */`
    <div class="color-picker" id="${pickerId}" role="group" aria-label="${t('symbols.colorPickerLabel')}">
      ${swatches}
    </div>
  `;
}

/**
 * Event-Listener für Color-Picker aktivieren
 * @param {string} pickerId
 * @param {Function} onChange Wird mit dem gewählten Index (number) aufgerufen
 * @returns {Function} Cleanup-Funktion
 */
export function mountColorPicker(pickerId, onChange) {
  const container = document.getElementById(pickerId);
  if (!container) return () => {};

  const handler = (e) => {
    const btn = e.target.closest('[data-palette-index]');
    if (!btn) return;

    const index = Number(btn.dataset.paletteIndex);

    // Auswahl-Status aktualisieren
    container.querySelectorAll('.color-swatch').forEach(el => {
      const isSelected = Number(el.dataset.paletteIndex) === index;
      el.classList.toggle('selected', isSelected);
      el.setAttribute('aria-pressed', String(isSelected));
    });

    onChange(index);
  };

  container.addEventListener('click', handler);
  return () => container.removeEventListener('click', handler);
}
