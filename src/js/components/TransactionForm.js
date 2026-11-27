// components/TransactionForm.js – Modal für manuelle Einnahmen/Ausgaben

import { api } from '../api.js';
import { getState } from '../state.js';
import { formatCurrency, escapeHtml } from '../utils.js';
import { Modal } from './Modal.js';
import { Toast } from './Toast.js';
import { t } from '../i18n.js';
import { describeError } from '../errors.js';
import { amountRule, parseAmount, formatAmountInput } from '../validation.js';
import { confirmWithPin } from './PinPrompt.js';
import { getFinancialStatus } from '../finance.js';

const MAX_AMOUNT = 9999.99;

/**
 * Einnahme oder Ausgabe für ein Kind erfassen.
 * @param {string} childId
 * @param {'earn'|'spend'} kind
 * @returns {Promise<boolean>} true, wenn erfasst wurde
 */
export async function openTransactionForm(childId, kind) {
  const { settings, children } = getState();
  const currency = settings.currency ?? '€';
  const child = children.find(c => c.id === childId);
  if (!child) return false;

  const isSpend = kind === 'spend';
  const finance = getFinancialStatus(child);
  const readAmount = (root) => parseAmount(root.querySelector('#tx-amount')?.value).value;

  const modal = new Modal({
    title: t(`transaction.${kind}Title`),
    subtitle: t(`transaction.${kind}Subtitle`, { name: escapeHtml(child.name) }),
    icon: isSpend ? 'minus' : 'plus',
    tone: kind,
    help: kind,
    sheet: true,
    content: /* html */`
      <div class="form-group form-group--primary">
        <label class="form-label" for="tx-amount">${t('transaction.amountLabel', { currency: escapeHtml(currency) })}</label>
        <div class="input-affix">
          <input class="form-input form-input--amount" id="tx-amount" type="text" inputmode="decimal"
            enterkeyhint="done" aria-required="true" placeholder="${formatAmountInput(0)}" autocomplete="off"
            ${isSpend ? 'aria-describedby="tx-amount-hint"' : ''}>
          <span class="input-affix__unit" aria-hidden="true">${escapeHtml(currency)}</span>
        </div>
        ${isSpend
          ? `<p class="form-hint" id="tx-amount-hint">${t('transaction.available', { amount: `<strong>${formatCurrency(child.balance, currency)}</strong>` })}
              ${t('finance.borrowingAvailable', { amount: formatCurrency(finance.remainingAdvance, currency) })}</p>`
          : ''}
      </div>
      <div class="form-group">
        <label class="form-label" for="tx-desc">${t('transaction.descriptionLabel')} <span class="form-optional">(${t('common.optional')})</span></label>
        <input class="form-input" id="tx-desc" type="text" enterkeyhint="done"
          maxlength="60" placeholder="${t(`transaction.${kind}Placeholder`)}" autocomplete="off">
      </div>
    `,
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: t('common.record'), value: 'confirm', variant: 'primary', pin: true },
    ],
    fields: {
      'tx-amount': amountRule({ max: MAX_AMOUNT, currency }),
    },
    submit: async (_value, ctx) => {
      if (!(await confirmWithPin(isSpend ? t('pin.reasons.spend') : t('pin.reasons.earn')))) return false;
      const amt = readAmount(ctx.root);
      // Ohne Beschreibung wird nichts Sprachabhängiges gespeichert – die Liste zeigt dann einen allgemeinen Titel
      const desc = ctx.root.querySelector('#tx-desc')?.value?.trim() || '';
      const res = await api.addTransaction(childId, {
        amount: isSpend ? -amt : amt,
        type: 'manual',
        description: desc,
      });
      Object.assign(child, res.child);
      return amt;
    },
    errorMessage: (e) => describeError(e, t('transaction.bookingFailed')),
  });

  if (await modal.open() !== 'confirm') return false;

  const amountText = formatCurrency(modal.result, currency);
  Toast.success(t(isSpend ? 'transaction.spendSaved' : 'transaction.earnSaved', { amount: amountText }));
  return true;
}