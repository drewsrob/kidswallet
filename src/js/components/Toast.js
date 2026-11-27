// components/Toast.js – Toast-Benachrichtigungen (nicht modal, blenden sich selbst aus)

import { icon } from '../icons.js';

const container = () => document.getElementById('toast-container');

const DURATIONS = { success: 3000, info: 3500, warning: 5000, error: 6000 };
const ACTION_DURATION = 8000;

/**
 * Toast anzeigen
 * @param {string} message  HTML-String (Aufrufer escapen Nutzereingaben)
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {object} [opts]
 * @param {number} [opts.duration]  Anzeigedauer in ms
 * @param {{label: string, onClick: Function}} [opts.action]  z. B. „Wiederholen“
 */
export function showToast(message, type = 'info', opts = {}) {
  const { action } = opts;
  const duration = opts.duration ?? (action ? ACTION_DURATION : DURATIONS[type] ?? 3000);

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  // Fehler werden sofort angesagt, alles andere höflich über die Live-Region des Containers
  if (type === 'error') toast.setAttribute('role', 'alert');

  const icons = {
    success: icon('check-circle',   { size: 18 }),
    error:   icon('alert-circle',   { size: 18 }),
    info:    icon('info',           { size: 18 }),
    warning: icon('alert-triangle', { size: 18 }),
  };
  toast.innerHTML = /* html */`
    <span class="toast-icon" aria-hidden="true">${icons[type] ?? icons.info}</span>
    <span class="toast-message">${message}</span>
    ${action ? `<button type="button" class="toast-action">${action.label}</button>` : ''}
  `;

  container().appendChild(toast);

  let timer = null;
  let removed = false;
  const dismiss = () => {
    if (removed) return;
    removed = true;
    clearTimeout(timer);
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  };
  const start = () => { clearTimeout(timer); timer = setTimeout(dismiss, duration); };
  const pause = () => clearTimeout(timer);

  start();

  // Beim Lesen (Hover) oder Bedienen (Fokus) nicht ausblenden
  toast.addEventListener('mouseenter', pause);
  toast.addEventListener('mouseleave', () => { if (!toast.contains(document.activeElement)) start(); });
  toast.addEventListener('focusin', pause);
  toast.addEventListener('focusout', (e) => { if (!toast.contains(e.relatedTarget)) start(); });

  toast.addEventListener('click', (e) => {
    if (action && e.target.closest('.toast-action')) {
      dismiss();
      action.onClick();
      return;
    }
    dismiss();
  });

  return dismiss;
}

export const Toast = {
  show: showToast,
  success: (msg, opts) => showToast(msg, 'success', opts),
  error:   (msg, opts) => showToast(msg, 'error', opts),
  info:    (msg, opts) => showToast(msg, 'info', opts),
  warning: (msg, opts) => showToast(msg, 'warning', opts),
};

// Meldung über ein Neuladen der Seite hinweg (wird in app.js beim Start angezeigt)
export const FLASH_KEY = 'kidswallet-flash';

export function queueFlashToast(message, type = 'success') {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({ type, message }));
}