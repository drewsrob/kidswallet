// components/PinPrompt.js – PIN-Bestätigung kritischer Änderungen und Verwaltung des PIN-Schutzes
//
// Banking-Prinzip: Ansehen und Bearbeiten sind frei, erst das endgültige Speichern
// einer kritischen Änderung wird mit der PIN bestätigt. Es gibt bewusst keine
// Sitzungsfreigabe – jede kritische Änderung wird einzeln bestätigt.
// Der PIN-Schutz ist optional: Ohne PIN werden kritische Änderungen direkt gespeichert.

import { api } from '../api.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';
import { escapeHtml } from '../utils.js';
import { t, hasKey } from '../i18n.js';
import { describeError } from '../errors.js';
import { setPinEnabled } from '../security.js';

const PIN_PATTERN = /^\d{4,12}$/;

function pinField(id, label, { autocomplete = 'current-password', hint } = {}) {
  return /* html */`
    <div class="form-group">
      <label class="form-label" for="${id}">${label}</label>
      <input class="form-input pin-input" id="${id}" type="password"
        inputmode="numeric" autocomplete="${autocomplete}" maxlength="12"
        enterkeyhint="done" placeholder="••••" aria-required="true">
      ${hint ? `<span class="form-hint">${hint}</span>` : ''}
    </div>
  `;
}

const fieldValue = (ctx, id) => ctx.root.querySelector(`#${id}`).value.trim();

/**
 * PIN abfragen, unmittelbar bevor eine kritische Änderung gespeichert wird.
 * Kann aus einem geöffneten Formular-Dialog heraus aufgerufen werden; der PIN-Dialog
 * legt sich darüber, und bei Abbruch bleibt das Formular samt Eingaben erhalten.
 * Ist kein PIN-Schutz aktiv, wird die Aktion ohne Abfrage freigegeben.
 *
 * @param {string} reason – Was bestätigt wird: übersetzter Text, z. B. t('pin.reasons.earn'),
 *   oder Schlüssel aus pin.reasons, z. B. 'earn'
 * @returns {Promise<boolean>} true, wenn die PIN korrekt war oder kein PIN-Schutz aktiv ist
 */
export async function confirmWithPin(reason) {
  const { pinEnabled } = await api.getSecurity();
  if (!pinEnabled) return true;

  const reasonText = reason && hasKey(`pin.reasons.${reason}`) ? t(`pin.reasons.${reason}`) : reason;
  const result = await new Modal({
    title: t('pin.title'),
    subtitle: escapeHtml(t('pin.hint', { reason: reasonText })),
    icon: 'lock',
    content: pinField('quick-pin-input', t('pin.label')),
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: t('common.confirm'), value: 'confirm', variant: 'primary' },
    ],
    validate: (_value, ctx) => {
      if (!ctx.root.querySelector('#quick-pin-input').value.trim()) {
        ctx.fieldError('quick-pin-input', t('validation.pinRequired'));
        return false;
      }
      return true;
    },
    submit: async (_value, ctx) => {
      const input = ctx.root.querySelector('#quick-pin-input');
      const { valid } = await api.verifyPin(input.value.trim());
      if (valid) return true;
      input.value = '';
      ctx.fieldError('quick-pin-input', t('validation.pinWrong'));
      return false;
    },
    errorMessage: (e) => describeError(e, t('pin.checkFailed')),
  }).open();

  return result === 'confirm';
}

/**
 * Dialog „PIN festlegen“: PIN zweimal eingeben und den PIN-Schutz aktivieren.
 * @param {{ subtitle?: string }} [options]  Erklärung unter dem Titel (Klartext)
 * @returns {Promise<boolean>} true, wenn der PIN-Schutz aktiviert wurde
 */
export async function setupPin({ subtitle } = {}) {
  const result = await new Modal({
    title: t('security.setPinTitle'),
    subtitle: escapeHtml(subtitle ?? t('security.setPinHint')),
    icon: 'key',
    content: pinField('setup-pin', t('security.pin'), { autocomplete: 'new-password', hint: t('settings.newPinHint') })
      + pinField('setup-pin-confirm', t('security.pinConfirm'), { autocomplete: 'new-password' }),
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: t('security.setPinAction'), value: 'confirm', variant: 'primary' },
    ],
    validate: (_value, ctx) => {
      const pin = fieldValue(ctx, 'setup-pin');
      if (!PIN_PATTERN.test(pin)) { ctx.fieldError('setup-pin', t('validation.pinTooShort')); return false; }
      if (pin !== fieldValue(ctx, 'setup-pin-confirm')) {
        ctx.fieldError('setup-pin-confirm', t('validation.pinMismatch'));
        return false;
      }
      return true;
    },
    submit: async (_value, ctx) => {
      await api.enablePin(fieldValue(ctx, 'setup-pin'));
      setPinEnabled(true);
    },
    errorMessage: (e) => describeError(e, t('security.enableFailed')),
  }).open();

  return result === 'confirm';
}

/**
 * PIN-Schutz nach Eingabe der aktuellen PIN abschalten.
 * @returns {Promise<boolean>} true, wenn der PIN-Schutz deaktiviert wurde
 */
export async function disablePinProtection() {
  const result = await new Modal({
    title: t('security.disableTitle'),
    subtitle: escapeHtml(t('security.disableHint')),
    icon: 'lock',
    content: pinField('disable-pin-input', t('settings.currentPin')),
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: t('security.disableAction'), value: 'confirm', variant: 'primary' },
    ],
    validate: (_value, ctx) => {
      if (fieldValue(ctx, 'disable-pin-input')) return true;
      ctx.fieldError('disable-pin-input', t('validation.currentPinRequired'));
      return false;
    },
    submit: async (_value, ctx) => {
      try {
        await api.disablePin(fieldValue(ctx, 'disable-pin-input'));
      } catch (e) {
        if (e?.code !== 'currentPinWrong') throw e;
        ctx.root.querySelector('#disable-pin-input').value = '';
        ctx.fieldError('disable-pin-input', t('validation.pinWrong'));
        return false;
      }
      setPinEnabled(false);
    },
    errorMessage: (e) => describeError(e, t('security.disableFailed')),
  }).open();

  return result === 'confirm';
}

/**
 * Einmalige Entscheidung nach dem Update für Installationen mit der früheren Standard-PIN 1234:
 * eigene PIN festlegen oder den PIN-Schutz abschalten. Die alte PIN wird nicht still übernommen.
 */
export async function resolvePinMigration() {
  for (;;) {
    const choice = await new Modal({
      title: t('security.migrationTitle'),
      icon: 'lock',
      content: `<p>${t('security.migrationText')}</p><p>${t('security.migrationChoice')}</p>`,
      describeContent: true,
      dismissible: false,
      actions: [
        { label: t('security.migrationDisable'), value: 'disable', variant: 'secondary' },
        { label: t('security.migrationUse'), value: 'use', variant: 'primary' },
      ],
    }).open();

    if (choice === 'use') {
      // Abbruch beim Festlegen führt zurück zur Auswahl
      if (await setupPin({ subtitle: t('security.migrationSetHint') })) {
        Toast.success(t('security.enabled'));
        return;
      }
      continue;
    }

    try {
      await api.disablePin();
      setPinEnabled(false);
      Toast.success(t('security.disabled'));
    } catch (e) {
      // Bleibt die Entscheidung offen, gilt weiter die alte PIN; beim nächsten Start wird erneut gefragt
      console.error(e);
      Toast.error(describeError(e, t('security.disableFailed')));
    }
    return;
  }
}