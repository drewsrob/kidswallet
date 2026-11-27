import { api } from '../api.js';
import { getState, setState } from '../state.js';
import { DEFAULT_FINANCIAL_RULES, getFinancialStatus } from '../finance.js';
import { t } from '../i18n.js';
import { describeError } from '../errors.js';
import { escapeHtml, formatCurrency } from '../utils.js';
import { amountRule, parseAmount, formatAmountInput } from '../validation.js';
import { Modal } from './Modal.js';
import { confirmWithPin } from './PinPrompt.js';
import { Toast } from './Toast.js';

function updateChild(child) {
  setState({ children: getState().children.map(c => c.id === child.id ? { ...c, ...child } : c) });
}

export async function openFinancialRulesForm(childId) {
  const { children, settings } = getState();
  const child = children.find(c => c.id === childId);
  if (!child) return false;
  const rules = child.financialRules ?? DEFAULT_FINANCIAL_RULES;
  const currency = settings.currency ?? '€';
  const numericField = (id, label, value, unit) => `
    <div class="form-group">
      <label class="form-label" for="${id}">${label}</label>
      <div class="input-affix">
        <input class="form-input" id="${id}" type="text" inputmode="decimal"
          value="${formatAmountInput(value)}" aria-required="true" autocomplete="off">
        <span class="input-affix__unit" aria-hidden="true">${escapeHtml(unit)}</span>
      </div>
    </div>`;
  const modal = new Modal({
    title: t('finance.title'),
    subtitle: escapeHtml(child.name),
    icon: 'shield', help: 'finance', sheet: true,
    content: `
      <div class="form-group">
        <label class="form-label" for="finance-enabled">
          <input id="finance-enabled" type="checkbox" ${rules.allowAdvances ? 'checked' : ''}>
          ${t('finance.allowAdvances')}
        </label>
        <p class="form-hint">${t('finance.disabledHint')}</p>
      </div>
      <fieldset id="finance-options" class="finance-options" ${rules.allowAdvances ? '' : 'disabled'}>
        <legend class="sr-only">${t('finance.title')}</legend>
        ${numericField('finance-limit', t('finance.maxDebt'), rules.maxDebt, currency)}
        <p class="form-hint">${t('finance.limitHint')}</p>
        <div class="form-group">
          <label class="form-label" for="finance-model">${t('finance.feeModel')}</label>
          <select class="form-select" id="finance-model">
            ${['none', 'fixed', 'interest'].map(model => `<option value="${model}" ${rules.feeModel === model ? 'selected' : ''}>${t(`finance.models.${model}`)}</option>`).join('')}
          </select>
        </div>
        <div id="finance-fixed" ${rules.feeModel === 'fixed' ? '' : 'hidden'}>
          ${numericField('finance-fee', t('finance.fixedFee'), rules.fixedFee, currency)}
          <p class="form-hint">${t('finance.feeHint')}</p>
        </div>
        <div id="finance-interest" ${rules.feeModel === 'interest' ? '' : 'hidden'}>
          ${numericField('finance-percent', t('finance.repaymentPercent'), rules.repaymentPercent, '%')}
          <p class="form-hint">${t('finance.interestHint')}</p>
        </div>
      </fieldset>
      <p class="form-hint">${t('finance.repaymentHint')}</p>
    `,
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: t('common.save'), value: 'save', variant: 'primary', pin: true },
    ],
    validate: (_value, ctx) => {
      if (!ctx.root.querySelector('#finance-enabled').checked) return true;
      const model = ctx.root.querySelector('#finance-model').value;
      const fields = [['finance-limit', 99999, false]];
      if (model === 'fixed') fields.push(['finance-fee', 99999, true]);
      if (model === 'interest') fields.push(['finance-percent', 100, true]);
      let ok = true;
      for (const [id, max, allowZero] of fields) {
        const { value, empty, error } = parseAmount(ctx.root.querySelector(`#${id}`).value);
        if (empty || error || value > max || (!allowZero && value === 0)) {
          ctx.fieldError(id, t('finance.invalidValue', { max }));
          ok = false;
        }
      }
      return ok;
    },
    submit: async (_value, ctx) => {
      if (!(await confirmWithPin(t('finance.pinReason')))) return false;
      const allowAdvances = ctx.root.querySelector('#finance-enabled').checked;
      const feeModel = ctx.root.querySelector('#finance-model').value;
      const read = id => parseAmount(ctx.root.querySelector(`#${id}`).value).value;
      return api.updateFinancialRules(childId, {
        ...rules, allowAdvances,
        ...(allowAdvances ? {
          maxDebt: read('finance-limit'), feeModel,
          fixedFee: feeModel === 'fixed' ? read('finance-fee') : rules.fixedFee,
          repaymentPercent: feeModel === 'interest' ? read('finance-percent') : rules.repaymentPercent,
        } : {}),
      });
    },
    errorMessage: e => describeError(e, t('finance.saveFailed')),
  });
  const result = modal.open();
  const root = document.getElementById('finance-enabled').closest('.modal-overlay');
  const onChange = () => {
    root.querySelector('#finance-options').disabled = !root.querySelector('#finance-enabled').checked;
    root.querySelector('#finance-fixed').hidden = root.querySelector('#finance-model').value !== 'fixed';
    root.querySelector('#finance-interest').hidden = root.querySelector('#finance-model').value !== 'interest';
  };
  root.addEventListener('change', onChange);
  const action = await result;
  root.removeEventListener('change', onChange);
  if (action !== 'save') return false;
  updateChild(modal.result);
  Toast.success(t('finance.saved'));
  return true;
}

export async function openDebtRepaymentForm(childId) {
  const { children, settings } = getState();
  const child = children.find(c => c.id === childId);
  if (!child) return false;
  const status = getFinancialStatus(child);
  const max = Math.min(status.availableBalance, status.totalDebt);
  const currency = settings.currency ?? '€';
  const quick = [...[1, 2, 5].map(amount => ({ amount, label: formatCurrency(amount, currency) })),
    { amount: max, label: t('finance.repayFull') }];
  const modal = new Modal({
    title: t('finance.repay'), icon: 'exchange', help: 'finance', sheet: true,
    content: `
      <div class="form-group">
        <label class="form-label" for="repayment-amount">${t('transaction.amountLabel', { currency: escapeHtml(currency) })}</label>
        <input class="form-input" id="repayment-amount" type="text" inputmode="decimal"
          value="" aria-required="true" aria-describedby="repayment-hint" autocomplete="off">
        <div class="repay-quick" role="group" aria-label="${t('finance.repayQuick')}">
          ${quick.map(q => `<button type="button" class="btn btn-secondary btn-sm" data-repay-amount="${formatAmountInput(q.amount)}"
            aria-pressed="false" ${q.amount > max ? 'disabled' : ''}>${q.label}</button>`).join('')}
        </div>
        <p class="form-hint" id="repayment-hint">${t('finance.repayHint', { amount: formatCurrency(max, currency) })}</p>
      </div>`,
    fields: { 'repayment-amount': amountRule({ max, currency }) },
    actions: [
      { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
      { label: t('common.record'), value: 'repay', variant: 'primary', pin: true },
    ],
    submit: async (_value, ctx) => {
      if (!(await confirmWithPin(t('finance.repay')))) return false;
      return api.repayDebt(childId, { amount: parseAmount(ctx.root.querySelector('#repayment-amount').value).value });
    },
    errorMessage: e => describeError(e, t('transaction.bookingFailed')),
  });
  const result = modal.open();
  const input = document.getElementById('repayment-amount');
  const buttons = [...input.parentElement.querySelectorAll('[data-repay-amount]')];
  const syncPressed = () => buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.repayAmount === input.value)));
  input.parentElement.addEventListener('click', (e) => {
    const button = e.target.closest('[data-repay-amount]');
    if (!button) return;
    input.value = button.dataset.repayAmount;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  input.addEventListener('input', syncPressed);
  if (await result !== 'repay') return false;
  updateChild(modal.result.child);
  Toast.success(t('finance.repaid'));
  return true;
}
