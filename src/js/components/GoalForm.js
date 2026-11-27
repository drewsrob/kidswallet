// components/GoalForm.js – Modal zum Erstellen und Bearbeiten eines Sparziels

import { api } from '../api.js';
import { getState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';
import { renderSymbolPicker, mountSymbolPicker } from './SymbolPicker.js';
import { t } from '../i18n.js';
import { describeError } from '../errors.js';
import { amountRule, requiredRule, parseAmount } from '../validation.js';
import { getGoalSymbol, DEFAULT_GOAL_SYMBOL } from '../goalSymbols.js';
import { parseBlocks, render } from '../template.js';
import goalFormHtml from './GoalForm.html?raw';

const blocks = parseBlocks(goalFormHtml);

const MAX_TARGET = 99999;

/**
 * Formular zum Erstellen (ohne existing) oder Bearbeiten eines Sparziels öffnen.
 * @param {string} childId
 * @param {object|null} [existing] – zu bearbeitendes Sparziel
 * @param {object} [options]
 * @param {boolean} [options.adjust] – erreichtes Ziel an die Realität anpassen (z. B. geänderter Preis)
 * @param {number} [options.targetAmount] – vorbelegter Zielbetrag statt des gespeicherten
 * @returns {Promise<boolean>} true, wenn gespeichert wurde
 */
export async function openGoalForm(childId, existing = null, { adjust = false, targetAmount } = {}) {
  const isEdit = !!existing;
  if (isEdit && targetAmount !== undefined) existing = { ...existing, targetAmount };
  const { settings, children } = getState();
  const currency = settings.currency ?? '€';
  const child = children.find(c => c.id === childId);
  let selectedIcon = getGoalSymbol(existing?.icon) ? existing.icon : DEFAULT_GOAL_SYMBOL;

  const read = (root) => ({
    name: root.querySelector('#goal-name-input')?.value?.trim(),
    targetAmount: parseAmount(root.querySelector('#goal-target-input')?.value).value,
  });

  const modal = new Modal({
    title: adjust ? t('goal.titleAdjust') : isEdit ? t('goal.titleEdit') : t('goal.titleCreate'),
    subtitle: isEdit ? t('goal.subtitleEdit') : (child ? t('goal.subtitleCreate', { name: escapeHtml(child.name) }) : ''),
    icon: 'target',
    tone: 'goal',
    help: 'goals',
    sheet: true,
    content: render(blocks.goalForm, {
      currency, existing,
      symbolPicker: renderSymbolPicker({ id: 'goal-symbol-picker', selected: selectedIcon }),
    }),
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: isEdit ? t('common.save') : t('common.create'), value: 'submit', variant: 'primary' },
    ],
    fields: {
      'goal-name-input': requiredRule(),
      'goal-target-input': amountRule({ max: MAX_TARGET, currency }),
    },
    submit: async (_value, ctx) => {
      const payload = { ...read(ctx.root), icon: selectedIcon };
      if (isEdit) await api.updateGoal(existing.id, payload);
      else await api.createGoal(childId, payload);
    },
    errorMessage: (e) => describeError(e, t('goal.saveFailed')),
  });

  const resultPromise = modal.open();

  // Das Modal-DOM existiert nach open() bereits – Listener direkt verbinden
  mountSymbolPicker(document.getElementById('goal-symbol-picker'), (id) => { selectedIcon = id; });

  if (await resultPromise !== 'submit') return false;

  Toast.success(isEdit ? t('goal.updated') : t('goal.createdToast'));
  return true;
}