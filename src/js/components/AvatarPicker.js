// components/AvatarPicker.js – SVG-Icon-Avatar-Auswahl

import { AVATAR_ICON_KEYS, iconLabel, icon } from '../icons.js';
import { t } from '../i18n.js';
import { escapeHtml } from '../utils.js';

/** Verfügbare Avatar-Keys (Rückwärts-Kompatibilität) */
export const AVATARS = AVATAR_ICON_KEYS;

/**
 * Avatar-Picker HTML-String erzeugen
 * @param {string} selectedAvatar Aktuell ausgewählter Avatar-Key
 * @param {string} pickerId ID-Präfix für die Elemente
 */
export function renderAvatarPicker(selectedAvatar = 'star', pickerId = 'avatar-picker') {
  const options = AVATAR_ICON_KEYS.map(key => /* html */`
    <button
      type="button"
      class="avatar-option${key === selectedAvatar ? ' selected' : ''}"
      data-avatar="${key}"
      data-picker="${pickerId}"
      aria-label="${escapeHtml(iconLabel(key))}"
      aria-pressed="${key === selectedAvatar}"
    >${icon(key, { size: 28 })}</button>
  `).join('');

  return /* html */`
    <div class="avatar-picker" id="${pickerId}" role="group" aria-label="${escapeHtml(t('symbols.avatarPickerLabel'))}">
      ${options}
    </div>
  `;
}

/**
 * Event-Listener für Avatar-Picker aktivieren
 * @param {string} pickerId
 * @param {Function} onChange Wird mit dem gewählten Emoji aufgerufen
 * @returns {Function} Cleanup-Funktion
 */
export function mountAvatarPicker(pickerId, onChange) {
  const container = document.getElementById(pickerId);
  if (!container) return () => {};

  const handler = (e) => {
    const btn = e.target.closest('[data-avatar]');
    if (!btn) return;

    const avatar = btn.dataset.avatar;

    // Auswahl-Status aktualisieren
    container.querySelectorAll('.avatar-option').forEach(el => {
      el.classList.toggle('selected', el.dataset.avatar === avatar);
      el.setAttribute('aria-pressed', String(el.dataset.avatar === avatar));
    });

    onChange(avatar);
  };

  container.addEventListener('click', handler);
  return () => container.removeEventListener('click', handler);
}
