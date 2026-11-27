// components/Modal.js – Promise-basiertes Modal mit Fokusverwaltung und Inline-Fehlern

import { icon } from '../icons.js';
import { t } from '../i18n.js';
import { helpButton } from './HelpButton.js';
import { isPinEnabled } from '../security.js';

// Anzahl offener Modals – Hintergrund bleibt gesperrt, solange mindestens eines offen ist
let openCount = 0;
let titleSeq = 0;
// Offene Dialoge (oberster zuletzt) – nur der oberste reagiert auf Tastatur
const stack = [];
const returnFocus = new WeakMap();
// Schließwunsch ohne Button (Escape, Android-Zurück) – prüft ungespeicherte Eingaben
const dismissers = new WeakMap();
// Rücksprungziel des zuletzt geschlossenen Dialogs
let lastReturnFocus = null;

const FOCUS_DATA_KEYS = ['action', 'goalId', 'allowanceId', 'childId', 'transactionId'];

// Selektor, mit dem sich ein Element nach dem Neu-Rendern wiederfinden lässt
function focusSelector(el) {
  if (!(el instanceof HTMLElement) || el === document.body) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;
  const parts = FOCUS_DATA_KEYS
    .filter(key => el.dataset[key] != null)
    .map(key => `[data-${key.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`)}="${CSS.escape(el.dataset[key])}"]`);
  return parts.length ? parts.join('') : null;
}

/**
 * Ansicht neu rendern und den Tastaturfokus auf das entsprechende Element im neuen DOM
 * zurücksetzen (z. B. den Button, der einen Dialog geöffnet hat).
 * @param {() => Promise<void>|void} rerender
 * @param {(selector: string|null) => string[]} [fallbacks]
 *   Ersatzziele, falls das ursprüngliche Element nach dem Rendern fehlt (z. B. gelöschter Eintrag)
 */
export async function rerenderKeepingFocus(rerender, fallbacks = () => []) {
  const active = document.activeElement;
  const closingOverlay = active?.closest?.('.modal-overlay[data-closing]');
  const origin = closingOverlay ? returnFocus.get(closingOverlay)
    : active === document.body ? lastReturnFocus
    : active;
  const selector = focusSelector(origin);

  await rerender();

  if (!selector) return;
  for (const sel of [selector, ...fallbacks(selector)]) {
    const el = document.querySelector(sel);
    if (!el || el.offsetParent === null) continue;
    // Überschriften als Ersatzziel programmatisch fokussierbar machen
    if (/^H[1-6]$/.test(el.tagName) && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    return;
  }
}

function lockScroll() {
  if (openCount++ === 0) document.documentElement.classList.add('modal-open');
}

// Bottom-Sheets mit Ausblend-Animation entfernen; übrige Dialoge sofort
function removeOverlay(overlay) {
  if (!overlay.classList.contains('modal-overlay--sheet')) { overlay.remove(); return; }
  overlay.classList.add('modal-overlay--leaving');
  const animations = overlay.getAnimations({ subtree: true });
  if (animations.length === 0) { overlay.remove(); return; }
  Promise.allSettled(animations.map(a => a.finished)).then(() => overlay.remove());
  // Sicherheitsnetz, falls die Animation nie abgeschlossen wird (z. B. Tab im Hintergrund)
  setTimeout(() => overlay.remove(), 600);
}

function unlockScroll() {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) document.documentElement.classList.remove('modal-open');
}

// Werte, die einen Dialog ohne Validierung/Speichern schließen
const DISMISS_VALUES = new Set(['cancel', 'close', 'backdrop', 'escape', 'back']);

// Formularzustand eines Sheets: Eingabewerte und Auswahl in Pickern (Suchfelder zählen nicht)
function formSnapshot(root) {
  const els = root.querySelectorAll('input:not([type="search"]), select, textarea, [aria-pressed]');
  return JSON.stringify([...els].map(el => {
    if (el.matches('[aria-pressed]')) return el.getAttribute('aria-pressed');
    return el.type === 'checkbox' || el.type === 'radio' ? el.checked : el.value;
  }));
}

/**
 * Obersten offenen Dialog wie über „Abbrechen“ schließen (z. B. Android-Zurück-Taste).
 * Sheets mit ungespeicherten Eingaben fragen vorher nach.
 * @returns {boolean} true, wenn ein Dialog offen war und die Aktion übernommen hat
 */
export function dismissTopModal() {
  const top = stack[stack.length - 1];
  if (!top) return false;
  dismissers.get(top)?.('back');
  return true;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Fehlermeldung direkt unter einem Formularfeld anzeigen (WCAG: Fehler identifizieren).
 * Standardmäßig verschwindet die Meldung, sobald das Feld geändert wird.
 * @param {ParentNode} root
 * @param {string} inputId
 * @param {string} message
 * @param {{ autoClear?: boolean }} [options]  false = Meldung wird vom Aufrufer verwaltet (Live-Validierung)
 */
export function setFieldError(root, inputId, message, { autoClear = true } = {}) {
  const input = root.querySelector(`#${inputId}`);
  if (!input) return;
  const errId = `${inputId}-error`;
  let err = root.querySelector(`#${errId}`);
  if (!err) {
    err = document.createElement('p');
    err.className = 'form-error';
    err.id = errId;
    // role="alert": Screenreader lesen die Meldung sofort vor, auch während der Eingabe
    err.setAttribute('role', 'alert');
    // Bei Feldern mit Einheit (z. B. „€“) unter dem gesamten Eingabeblock einfügen
    (input.closest('.input-affix') ?? input).insertAdjacentElement('afterend', err);
  }
  // Nur bei geänderter Meldung neu schreiben, damit sie nicht bei jedem Tastendruck erneut vorgelesen wird
  if (err.dataset.message !== message) {
    err.dataset.message = message;
    err.innerHTML = `${icon('alert-circle', { size: 16 })}<span></span>`;
    err.lastElementChild.textContent = message;
  }
  input.setAttribute('aria-invalid', 'true');
  const describedBy = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean);
  if (!describedBy.includes(errId)) input.setAttribute('aria-describedby', [...describedBy, errId].join(' '));

  if (!autoClear) return;
  const clear = () => clearFieldError(root, inputId);
  input.addEventListener('input', clear, { once: true });
  input.addEventListener('change', clear, { once: true });
}

export function clearFieldError(root, inputId) {
  const input = root.querySelector(`#${inputId}`);
  const errId = `${inputId}-error`;
  root.querySelector(`#${errId}`)?.remove();
  if (!input) return;
  input.removeAttribute('aria-invalid');
  const rest = (input.getAttribute('aria-describedby') ?? '').split(' ').filter(id => id && id !== errId);
  if (rest.length) input.setAttribute('aria-describedby', rest.join(' '));
  else input.removeAttribute('aria-describedby');
}

export class Modal {
  /**
   * @param {object} options
   * @param {string} options.title
   * @param {string} [options.subtitle]  Kurze Erklärung unter dem Titel (HTML-String)
   * @param {string} [options.icon]  Icon-Name für den Dialog-Header
   * @param {'earn'|'spend'|'rule'|'goal'} [options.tone]  Farbliche Akzentuierung des Dialogs
   * @param {string} options.content  HTML-String
   * @param {Array<{label: string, value: string, variant?: string}>} options.actions
   * @param {Record<string, (value: string, root: HTMLElement) => string>} [options.fields]
   *   Feldregeln (Input-ID → Fehlermeldung oder ''). Werden live während der Eingabe,
   *   beim Verlassen des Feldes und vor dem Speichern geprüft; ausgeblendete Felder zählen nicht.
   * @param {(value: string, ctx: ModalContext) => boolean|void} [options.validate]
   *   Zusätzliche synchrone Prüfung vor dem Schließen; `false` hält den Dialog offen.
   * @param {(value: string, ctx: ModalContext) => Promise<any>} [options.submit]
   *   Asynchrones Speichern; wirft es, bleibt der Dialog mit Fehlermeldung offen,
   *   liefert es `false`, bleibt er ohne Meldung offen (Feldfehler selbst setzen).
   * @param {(err: unknown) => string} [options.errorMessage]  Text für fehlgeschlagenes Speichern
   * @param {string} [options.help]  Schlüssel aus helpTopics.js – zeigt ein Fragezeichen im Header
   * @param {boolean} [options.sheet]  Bottom-Sheet („Anzeigen, Erfassen, Bearbeiten“): auf kleinen
   *   Bildschirmen von unten, schließt nur über Buttons – nie per Klick auf den Hintergrund.
   *   Ohne sheet: klassischer Dialog („Bestätigen, Absichern, Löschen“).
   * @param {boolean} [options.describeContent]  Inhalt dient Screenreadern als Dialogbeschreibung
   * @param {boolean} [options.dismissible]  false = schließt nur über die Aktions-Buttons
   *   (nicht per Escape, Hintergrund oder Zurück-Taste) – für Entscheidungen, die getroffen werden müssen
   *
   * @typedef {object} ModalContext
   * @property {HTMLElement} root
   * @property {(inputId: string, message: string) => void} fieldError
   */
  constructor({ title, subtitle, icon: headerIcon, tone, content, actions, fields, validate, submit, errorMessage, help, sheet, describeContent, dismissible }) {
    this.title = title;
    this.subtitle = subtitle ?? '';
    this.headerIcon = headerIcon ?? null;
    this.tone = tone ?? null;
    this.help = help ?? null;
    this.sheet = Boolean(sheet);
    this.describeContent = Boolean(describeContent);
    this.dismissible = dismissible ?? true;
    this.content = content;
    this.actions = actions ?? [{ label: t('common.close'), value: 'close', variant: 'secondary' }];
    this.fields = fields ?? {};
    this.validate = validate ?? null;
    this.submit = submit ?? null;
    this.errorMessage = errorMessage ?? (() => t('errors.actionFailed'));
    /** Rückgabewert von submit() nach erfolgreichem Speichern */
    this.result = undefined;
  }

  /**
   * Modal öffnen und auf Benutzeraktion warten
   * @returns {Promise<string>} Wert des geklickten Buttons
   */
  open() {
    return new Promise((resolve) => {
      const titleId = `modal-title-${++titleSeq}`;
      // Folgt ein Dialog direkt auf einen sich schließenden (z. B. PIN → Formular),
      // übernimmt er dessen Rücksprungziel statt des gleich entfernten Feldes.
      const activeEl = document.activeElement;
      const closingOverlay = activeEl?.closest?.('.modal-overlay[data-closing]');
      const previousFocus = (closingOverlay && returnFocus.get(closingOverlay)) || activeEl;

      const overlay = document.createElement('div');
      overlay.className = `modal-overlay${this.sheet ? ' modal-overlay--sheet' : ''}`;
      returnFocus.set(overlay, previousFocus);
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-labelledby', titleId);
      const subtitleId = `${titleId}-desc`;
      const contentId = `${titleId}-content`;
      const describedBy = [this.subtitle && subtitleId, this.describeContent && contentId].filter(Boolean).join(' ');
      if (describedBy) overlay.setAttribute('aria-describedby', describedBy);

      overlay.innerHTML = /* html */`
        <div class="modal${this.tone ? ` modal--${this.tone}` : ''}">
          <header class="modal-header${this.headerIcon || this.help ? ' modal-header--icon' : ''}">
            ${this.headerIcon ? `<span class="modal-icon" aria-hidden="true">${icon(this.headerIcon, { size: 24 })}</span>` : ''}
            <div class="modal-heading">
              <h2 id="${titleId}">${this.title}</h2>
              ${this.subtitle ? `<p class="modal-subtitle" id="${subtitleId}">${this.subtitle}</p>` : ''}
            </div>
            ${this.help ? helpButton(this.help) : ''}
          </header>
          <div class="modal-content" id="${contentId}">
            ${this.content}
          </div>
          <div class="modal-error" role="alert" hidden></div>
          <footer class="modal-actions">
            ${this.actions.map(a => {
              // Schloss nur, wenn tatsächlich eine PIN abgefragt wird
              const pin = a.pin && isPinEnabled();
              return /* html */`
              <button
                class="btn btn-${a.variant ?? 'secondary'}"
                data-value="${a.value}"
                type="button"
              >${pin ? `${icon('lock', { size: 16 })} ` : ''}${a.label}${pin ? `<span class="sr-only"> (${t('pin.required')})</span>` : ''}</button>
            `;
            }).join('')}
          </footer>
        </div>
      `;

      const modalEl = overlay.querySelector('.modal');
      const contentEl = overlay.querySelector('.modal-content');
      const errorEl = overlay.querySelector('.modal-error');
      const buttons = [...overlay.querySelectorAll('.modal-actions [data-value]')];
      let firstInvalid = null;

      const ctx = {
        root: modalEl,
        fieldError: (inputId, message) => {
          setFieldError(modalEl, inputId, message);
          firstInvalid ??= modalEl.querySelector(`#${inputId}`);
        },
      };

      const showError = (message) => {
        errorEl.innerHTML = `${icon('alert-circle', { size: 18 })}<span></span>`;
        errorEl.lastElementChild.textContent = message;
        errorEl.hidden = false;
      };
      const hideError = () => { errorEl.hidden = true; errorEl.textContent = ''; };

      // ── Feldregeln: live prüfen ──────────────────────────────────────────
      const rules = this.fields;
      /** @returns {boolean} true, wenn das Feld gültig ist (oder ausgeblendet) */
      const checkField = (id, { whileTyping = false } = {}) => {
        const input = modalEl.querySelector(`#${id}`);
        if (!input || input.closest('[hidden]')) { clearFieldError(modalEl, id); return true; }
        const message = rules[id](input.value, modalEl);
        if (!message) { clearFieldError(modalEl, id); return true; }
        // Beim Tippen ein (noch) leeres Feld nicht anmahnen – erst beim Verlassen/Speichern
        if (whileTyping && !input.value.trim() && input.getAttribute('aria-invalid') !== 'true') return true;
        setFieldError(modalEl, id, message, { autoClear: false });
        return false;
      };
      const checkAllFields = () => {
        let ok = true;
        for (const id of Object.keys(rules)) {
          if (!checkField(id)) { ok = false; firstInvalid ??= modalEl.querySelector(`#${id}`); }
        }
        return ok;
      };

      modalEl.addEventListener('input', (e) => {
        if (e.target.id in rules) checkField(e.target.id, { whileTyping: true });
      });
      modalEl.addEventListener('change', (e) => {
        // Abhängige Felder (z. B. Tag im Monat bei Häufigkeit „Monatlich“) neu bewerten
        if (e.target.matches('select')) {
          for (const id of Object.keys(rules)) {
            if (modalEl.querySelector(`#${id}`)?.getAttribute('aria-invalid') === 'true') checkField(id);
          }
        }
      });
      modalEl.addEventListener('focusout', (e) => {
        if (!(e.target.id in rules) || closed) return;
        // Beim Abbrechen oder Öffnen der Kontexthilfe keine Fehlermeldung aufblitzen lassen
        if (DISMISS_VALUES.has(e.relatedTarget?.dataset?.value) || e.relatedTarget?.matches?.('[data-help]')) return;
        checkField(e.target.id);
      });

      let closed = false;
      let busy = false;

      const close = (value) => {
        if (closed) return;
        closed = true;
        lastReturnFocus = previousFocus;
        overlay.dataset.closing = '';
        document.removeEventListener('keydown', onKeyDown);
        stack.splice(stack.indexOf(overlay), 1);
        resolve(value);
        // Overlay erst nach allen Microtasks entfernen, damit await-Aufrufer
        // noch Formularwerte aus dem Modal-DOM lesen können.
        setTimeout(() => {
          removeOverlay(overlay);
          unlockScroll();
          if (stack.length === 0) {
            if (previousFocus && document.contains(previousFocus)) previousFocus.focus({ preventScroll: true });
            return;
          }
          // Gestapelter Dialog (z. B. PIN über Formular): Fokus zurück in den darunterliegenden Dialog
          const top = stack[stack.length - 1];
          if (top.contains(document.activeElement)) return;
          const back = previousFocus && top.contains(previousFocus) && !previousFocus.disabled
            ? previousFocus
            : top.querySelector('.form-input, .form-select, button:not(:disabled)');
          back?.focus({ preventScroll: true });
        }, 0);
      };

      const setBusy = (state) => {
        busy = state;
        modalEl.setAttribute('aria-busy', String(state));
        buttons.forEach(b => { b.disabled = state; });
      };

      const trigger = async (value) => {
        if (busy) return;
        if (DISMISS_VALUES.has(value)) { close(value); return; }

        firstInvalid = null;
        hideError();
        const fieldsOk = checkAllFields();
        const extraOk = !this.validate || this.validate(value, ctx) !== false;
        if (!fieldsOk || !extraOk) {
          firstInvalid?.focus();
          return;
        }
        if (this.submit) {
          setBusy(true);
          let res;
          try {
            res = await this.submit(value, ctx);
          } catch (err) {
            console.error(err);
            setBusy(false);
            showError(this.errorMessage(err));
            return;
          }
          setBusy(false);
          // false = fachlich abgelehnt (z. B. falsche PIN) – Feldfehler wurde gesetzt
          if (res === false) { firstInvalid?.focus(); return; }
          this.result = res;
        }
        close(value);
      };

      // Ausgangszustand erst nach dem synchronen Einhängen der Picker durch den Aufrufer festhalten
      let initialState = null;
      queueMicrotask(() => { initialState = formSnapshot(contentEl); });
      const isDirty = () => initialState !== null && formSnapshot(contentEl) !== initialState;

      let confirmingDiscard = false;
      const requestDismiss = async (value) => {
        if (busy || closed || confirmingDiscard || !this.dismissible) return;
        if (this.sheet && isDirty()) {
          confirmingDiscard = true;
          const choice = await new Modal({
            title: t('dialog.discardTitle'),
            content: `<p>${t('dialog.discardMessage')}</p>`,
            describeContent: true,
            actions: [
              { label: t('dialog.discardKeep'), value: 'cancel', variant: 'secondary' },
              { label: t('dialog.discardConfirm'), value: 'discard', variant: 'danger' },
            ],
          }).open();
          confirmingDiscard = false;
          if (choice !== 'discard') return;
        }
        close(value);
      };
      dismissers.set(overlay, requestDismiss);

      overlay.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-value]');
        if (btn && overlay.contains(btn)) { trigger(btn.dataset.value); return; }
        // Klick neben den Dialog schließt nur klassische Dialoge – Sheets schützen Eingaben
        if (e.target === overlay && !busy && !this.sheet && this.dismissible) close('backdrop');
      });

      const primaryAction = () =>
        [...this.actions].reverse().find(a => !DISMISS_VALUES.has(a.value) && (a.variant === 'primary' || a.variant === 'danger'));

      const onKeyDown = (e) => {
        // Nur das oberste Modal reagiert
        if (stack[stack.length - 1] !== overlay) return;
        // Bereits von einem Feld behandelt (z. B. Escape/Enter in der Symbolsuche)
        if (e.defaultPrevented) return;

        if (e.key === 'Escape') {
          requestDismiss('escape');
          return;
        }

        // Enter in einem Eingabefeld löst die Primäraktion aus
        if (e.key === 'Enter' && e.target.matches?.('input:not([type="color"]):not([type="checkbox"]):not([type="radio"]), select')) {
          const primary = primaryAction();
          if (primary) { e.preventDefault(); trigger(primary.value); }
          return;
        }

        // Fokus im Dialog halten
        if (e.key === 'Tab') {
          const items = [...modalEl.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null);
          if (!items.length) return;
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && (document.activeElement === first || !modalEl.contains(document.activeElement))) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      };
      document.addEventListener('keydown', onKeyDown);

      document.body.appendChild(overlay);
      stack.push(overlay);
      lockScroll();

      // Sofort fokussieren (nicht per requestAnimationFrame – das wird in Hintergrund-Tabs
      // ausgesetzt und lässt den Fokus sonst auf dem auslösenden Button stehen).
      // Erstes Eingabefeld, sonst den ersten Button (in Bestätigungen „Abbrechen“)
      const target = modalEl.querySelector('.form-input, .form-select') ?? buttons[0];
      target?.focus({ preventScroll: true });
    });
  }
}

/**
 * Bestätigungsdialog (z. B. vor dem Löschen)
 * @param {string} title
 * @param {string} message  HTML-String
 * @param {string} [confirmLabel]  Standard: „Löschen“
 * @returns {Promise<boolean>}
 */
export async function confirm(title, message, confirmLabel = t('common.delete')) {
  const result = await new Modal({
    title,
    content: `<p>${message}</p>`,
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: confirmLabel, value: 'confirm', variant: 'danger' },
    ],
  }).open();
  return result === 'confirm';
}