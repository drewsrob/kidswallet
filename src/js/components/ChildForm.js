// components/ChildForm.js – Modal zum Erstellen/Bearbeiten eines Kindes

import { api } from '../api.js';
import { getState, setState } from '../state.js';
import { escapeHtml, formatCurrency } from '../utils.js';
import { t } from '../i18n.js';
import { describeError } from '../errors.js';
import { Modal } from './Modal.js';
import { confirmWithPin } from './PinPrompt.js';
import { Toast } from './Toast.js';
import { mountAvatarPicker } from './AvatarPicker.js';
import { mountColorPicker } from './ColorPicker.js';
import { parseBlocks, render } from '../template.js';
import childFormHtml from './ChildForm.html?raw';

const blocks = parseBlocks(childFormHtml);

/**
 * Formular zum Erstellen (ohne childId) oder Bearbeiten eines Kindes öffnen.
 * @param {string|null} [childId]
 * @returns {Promise<object|null>} Das gespeicherte Kind oder null bei Abbruch/Fehler
 */
export async function openChildForm(childId = null) {
  const isEdit = !!childId;
  const { children, settings } = getState();
  const currency = settings.currency ?? '€';
  const existing = isEdit ? children.find(c => c.id === childId) : null;

  let selectedAvatar = existing?.avatar ?? 'star';
  let selectedPalette = existing?.colorPaletteIndex ?? 0;

  const allowanceFields = () => render(blocks.allowanceFields, { currency });
  const content = render(blocks.childForm, {
    existing, currency, selectedAvatar, selectedPalette, isEdit, allowanceFields,
  });

  let cleanupAvatar = () => {};
  let cleanupColor = () => {};

  const num = (root, id) => parseFloat(root.querySelector(`#${id}`)?.value ?? '');

  const modal = new Modal({
    title: isEdit ? t('child.titleEdit', { name: escapeHtml(existing.name) }) : t('child.titleCreate'),
    subtitle: isEdit ? t('child.subtitleEdit') : t('child.subtitleCreate'),
    icon: 'user',
    help: 'children',
    sheet: true,
    content,
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: isEdit ? t('common.save') : t('common.create'), value: 'submit', variant: 'primary', pin: true },
    ],
    validate: (_value, ctx) => {
      let ok = true;
      if (!ctx.root.querySelector('#child-name')?.value?.trim()) {
        ctx.fieldError('child-name', t('validation.nameRequired')); ok = false;
      }
      if (!isEdit) {
        const balance = num(ctx.root, 'child-balance');
        if (balance < 0) { ctx.fieldError('child-balance', t('validation.amountNotNegative')); ok = false; }
        else if (balance > 99999) { ctx.fieldError('child-balance', t('validation.amountMax', { max: formatCurrency(99999, currency) })); ok = false; }
        const allowance = num(ctx.root, 'inline-allowance-amount');
        if (allowance < 0) { ctx.fieldError('inline-allowance-amount', t('validation.amountNotNegative')); ok = false; }
        else if (allowance > 9999.99) { ctx.fieldError('inline-allowance-amount', t('validation.amountMax', { max: formatCurrency(9999.99, currency) })); ok = false; }
      }
      return ok;
    },
    submit: async (_value, ctx) => {
      if (!(await confirmWithPin(isEdit ? t('pin.reasons.childEdit') : t('pin.reasons.childCreate')))) return false;
      const name = ctx.root.querySelector('#child-name').value.trim();
      if (isEdit) {
        return { saved: await api.updateChild(childId, { name, avatar: selectedAvatar, colorPaletteIndex: selectedPalette }) };
      }
      const saved = await api.createChild({
        name, avatar: selectedAvatar, colorPaletteIndex: selectedPalette,
        balance: num(ctx.root, 'child-balance') || 0,
      });

      // Optionales Taschengeld direkt beim Erstellen einrichten
      const allowanceAmount = num(ctx.root, 'inline-allowance-amount');
      const allowanceDayOfWeek = parseInt(ctx.root.querySelector('#inline-allowance-day')?.value ?? '6');
      let ruleFailed = false;
      if (allowanceAmount > 0) {
        try {
          await api.createAllowance(saved.id, {
            amount: allowanceAmount,
            frequency: 'weekly',
            dayOfWeek: isNaN(allowanceDayOfWeek) ? 6 : allowanceDayOfWeek,
            dayOfMonth: null,
          });
        } catch (e) {
          console.error(e);
          ruleFailed = true;
        }
      }
      return { saved, ruleFailed };
    },
    errorMessage: (e) => describeError(e, t('child.saveFailed')),
  });

  const resultPromise = modal.open();

  // Das Modal-DOM existiert nach open() bereits – Picker direkt einhängen
  cleanupAvatar = mountAvatarPicker('modal-avatar-picker', (av) => { selectedAvatar = av; });
  cleanupColor = mountColorPicker('modal-color-picker', (idx) => { selectedPalette = idx; });

  const result = await resultPromise;

  cleanupAvatar();
  cleanupColor();

  if (result !== 'submit') return null;

  const { saved, ruleFailed } = modal.result;
  const safeName = escapeHtml(saved.name);
  if (isEdit) Toast.success(t('child.updated'));
  else if (ruleFailed) Toast.warning(t('child.createdRuleFailed', { name: safeName }));
  else Toast.success(t('child.created', { name: safeName }));

  try {
    setState({ children: await api.getChildren() });
  } catch (e) { /* Ansicht lädt beim nächsten Rendern neu */ }

  return saved;
}