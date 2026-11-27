// components/AllowanceForm.js – Modal zum Erstellen/Bearbeiten einer Taschengeld-Regel

import { api } from '../api.js';
import { getState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';
import { t } from '../i18n.js';
import { describeError } from '../errors.js';
import { amountRule, intRangeRule, parseAmount } from '../validation.js';
import { confirmWithPin } from './PinPrompt.js';
import { parseBlocks, render } from '../template.js';
import allowanceFormHtml from './AllowanceForm.html?raw';

const blocks = parseBlocks(allowanceFormHtml);

const MAX_AMOUNT = 9999.99;
const DEFAULT_WEEKDAY = 6; // Samstag – wie im Formular „Kind erstellen“

/**
 * Formular für eine neue (ohne existing) oder bestehende Taschengeld-Regel öffnen.
 * @param {string} childId
 * @param {object|null} [existing] – zu bearbeitende Regel
 * @returns {Promise<boolean>} true, wenn gespeichert wurde
 */
export async function openAllowanceForm(childId, existing = null) {
  const isEdit = !!existing;
  const { settings, children } = getState();
  const currency = settings.currency ?? '€';
  const child = children.find(c => c.id === childId);
  const dayOfWeek = existing?.dayOfWeek ?? DEFAULT_WEEKDAY;

  const readPayload = (root) => ({
    amount: parseAmount(root.querySelector('#allowance-amount')?.value).value,
    frequency: root.querySelector('#allowance-frequency')?.value,
    dayOfWeek: parseInt(root.querySelector('#allowance-day-of-week')?.value ?? String(DEFAULT_WEEKDAY)),
    dayOfMonth: parseInt(root.querySelector('#allowance-day-of-month')?.value ?? '1'),
  });

  const modal = new Modal({
    title: isEdit ? t('allowance.titleEdit') : t('allowance.titleCreate'),
    subtitle: child ? t('allowance.subtitle', { name: escapeHtml(child.name) }) : '',
    icon: 'clock',
    tone: 'rule',
    help: 'allowances',
    sheet: true,
    content: render(blocks.allowanceForm, { existing, currency, dayOfWeek }),
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: isEdit ? t('common.save') : t('common.create'), value: 'submit', variant: 'primary', pin: true },
    ],
    fields: {
      'allowance-amount': amountRule({ max: MAX_AMOUNT, currency }),
      'allowance-day-of-month': intRangeRule(1, 28, () => t('validation.dayOfMonth')),
    },
    submit: async (_value, ctx) => {
      if (!(await confirmWithPin(isEdit ? t('pin.reasons.ruleEdit') : t('pin.reasons.ruleCreate')))) return false;
      const payload = readPayload(ctx.root);
      if (isEdit) await api.updateAllowance(existing.id, payload);
      else await api.createAllowance(childId, payload);
    },
    errorMessage: (e) => describeError(e, t('allowance.saveFailed')),
  });

  const resultPromise = modal.open();

  // Das Modal-DOM existiert nach open() bereits – Listener direkt verbinden
  const freqSelect = document.getElementById('allowance-frequency');
  freqSelect?.addEventListener('change', () => {
    const freq = freqSelect.value;
    document.getElementById('weekly-options').hidden = freq !== 'weekly';
    document.getElementById('monthly-options').hidden = freq !== 'monthly';
  });

  if (await resultPromise !== 'submit') return false;

  Toast.success(isEdit ? t('allowance.updated') : t('allowance.created'));
  return true;
}