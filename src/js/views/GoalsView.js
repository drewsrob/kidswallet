// views/GoalsView.js – Logik & State-Verwaltung (Sparziele)
import './GoalsView.css';

import { api } from '../api.js';
import { getState, setState } from '../state.js';
import { formatCurrency, applyChildTheme, escapeHtml, animateCountUp } from '../utils.js';
import { Modal, confirm, rerenderKeepingFocus } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { openGoalForm } from '../components/GoalForm.js';
import { renderChildNotFound } from '../components/EmptyState.js';
import { getGoalStatus } from '../status.js';
import { describeError } from '../errors.js';
import { t } from '../i18n.js';
import { icon } from '../icons.js';
import { getFinancialStatus, toCents } from '../finance.js';
import { amountRule, parseAmount, formatAmountInput } from '../validation.js';
import { parseBlocks, render } from '../template.js';
import goalsHtml from './GoalsView.html?raw';

const blocks = parseBlocks(goalsHtml);

// Wie der Zielbetrag im Sparziel-Formular
const MAX_PRICE = 99999;

export default class GoalsView {
  constructor(childId) {
    this.childId = childId;
    this.child = null;
    this.goals = [];
    this._handlers = [];
  }

  _makeGoalCard(currency, walletBalance) {
    return ({ goal, currency: cur = currency }) => {
      const isPurchased = !!goal.purchasedAt;
      const isReachable = !isPurchased && walletBalance >= goal.targetAmount;
      const status = isPurchased ? null : getGoalStatus(goal, walletBalance, cur);
      const pct = status ? status.pct : 100;
      return render(blocks.goalCard, { goal, currency: cur, pct, isPurchased, isReachable, walletBalance, status });
    };
  }

  async render() {
    const { children, settings } = getState();
    this.child = children.find(c => c.id === this.childId);

    if (!this.child) return renderChildNotFound();

    applyChildTheme(this.child.colorPaletteIndex);

    const currency = settings.currency ?? '€';

    try {
      this.goals = await api.getGoals(this.childId);
    } catch (e) {
      console.error(e);
      this.goals = [];
      this._loadFailed = true;
    }

    const balance = this.child.balance;
    const activeGoals = this.goals
      .filter(g => !g.purchasedAt)
      .sort((a, b) => (balance / b.targetAmount) - (balance / a.targetAmount));
    const doneGoals = this.goals.filter(g => !!g.purchasedAt);
    const goalCard = this._makeGoalCard(currency, balance);

    return render(blocks.main, { child: this.child, activeGoals, doneGoals, currency, goalCard });
  }

  mount() {
    const { settings } = getState();
    const currency = settings.currency ?? '€';
    const balanceEl = document.getElementById('current-balance');
    if (balanceEl && balanceEl.dataset.balance) {
      animateCountUp(balanceEl, 0, parseFloat(balanceEl.dataset.balance), currency);
    }

    if (this._loadFailed) { this._loadFailed = false; this._showLoadError(); }

    const section = document.querySelector('.view-goals');
    if (!section) return;

    // Neues Sparziel
    const btnNew = document.getElementById('btn-new-goal');
    if (btnNew) {
      const h = () => this._createGoal();
      btnNew.addEventListener('click', h);
      this._handlers.push({ el: btnNew, type: 'click', fn: h });
    }

    // Delegiertes Click-Handling für Ziel-Aktionen
    const listHandler = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const { action, goalId } = btn.dataset;
      if (action === 'create') this._createGoal();
      if (action === 'edit') this._editGoal(goalId);
      if (action === 'purchase') this._purchaseGoal(goalId);
      if (action === 'delete') this._deleteGoal(goalId);
    };
    section.addEventListener('click', listHandler);
    this._handlers.push({ el: section, type: 'click', fn: listHandler });
  }

  async _createGoal() {
    if (await openGoalForm(this.childId)) await this._refresh();
  }

  async _editGoal(goalId, options) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    const reached = !goal.purchasedAt && this.child.balance >= goal.targetAmount;
    if (await openGoalForm(this.childId, goal, { adjust: reached, ...options })) await this._refresh();
  }

  async _purchaseGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    const { settings } = getState();
    const currency = settings.currency ?? '€';
    const finance = getFinancialStatus(this.child);
    const availableCents = toCents(finance.availableBalance);
    // Deckung wie bei bookExpense: Guthaben + noch möglicher Vorschuss (abzgl. einer anfallenden Leihgebühr)
    const coverCents = availableCents + toCents(finance.remainingAdvance);
    const openingFee = finance.advanceActive ? 0 : finance.fixedFee;
    const readPrice = (root) => parseAmount(root.querySelector('#goal-purchase-price')?.value);

    const modal = new Modal({
      title: t('goal.purchaseTitle', { name: escapeHtml(goal.name) }),
      icon: 'shopping-bag',
      tone: 'goal',
      help: 'goals',
      sheet: true,
      content: /* html */`
        <dl class="goal-purchase-planned">
          <dt>${t('goal.plannedPrice')}</dt>
          <dd>${formatCurrency(goal.targetAmount, currency)}</dd>
        </dl>
        <div class="form-group form-group--primary">
          <label class="form-label" for="goal-purchase-price">${t('goal.actualPrice', { currency: escapeHtml(currency) })}</label>
          <div class="input-affix">
            <input class="form-input form-input--amount" id="goal-purchase-price" type="text" inputmode="decimal"
              enterkeyhint="done" aria-required="true" autocomplete="off" aria-describedby="goal-purchase-hint"
              value="${formatAmountInput(goal.targetAmount)}">
            <span class="input-affix__unit" aria-hidden="true">${escapeHtml(currency)}</span>
          </div>
          <p class="form-hint" id="goal-purchase-hint" aria-live="polite"></p>
        </div>
        <div class="goal-purchase-shortfall" id="goal-purchase-shortfall" role="alert" hidden>
          <p>${t('goal.notEnoughFunds')}</p>
          <button type="button" class="btn btn-secondary btn-sm" data-value="adjust">
            ${icon('edit', { size: 16 })} ${t('goal.adjustGoal')}
          </button>
        </div>`,
      actions: [
        { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
        { label: t('goal.buy'), value: 'buy', variant: 'primary' },
      ],
      fields: { 'goal-purchase-price': amountRule({ max: MAX_PRICE, currency }) },
      validate: (value, ctx) => value !== 'buy' || toCents(readPrice(ctx.root).value) <= coverCents,
      submit: (value, ctx) => (value === 'buy'
        ? api.updateGoal(goal.id, { purchaseGoal: true, purchasePrice: readPrice(ctx.root).value })
        : undefined),
      errorMessage: (e) => describeError(e, t('goal.purchaseFailed')),
    });

    const resultPromise = modal.open();
    const root = document.getElementById('goal-purchase-price').closest('.modal');
    const hint = root.querySelector('#goal-purchase-hint');
    const shortfall = root.querySelector('#goal-purchase-shortfall');
    const buyButton = root.querySelector('.modal-actions [data-value="buy"]');
    const update = () => {
      const { value, error, empty } = readPrice(root);
      const valid = !empty && !error && value > 0 && value <= MAX_PRICE;
      const cents = valid ? toCents(value) : 0;
      const covered = cents <= coverCents;
      shortfall.hidden = !valid || covered;
      buyButton.disabled = valid && !covered;
      if (!valid || !covered) { hint.textContent = ''; return; }
      const advance = Math.max(0, cents - availableCents) / 100;
      hint.innerHTML = advance > 0
        ? t(openingFee > 0 ? 'goal.purchaseAdvanceFee' : 'goal.purchaseAdvance', {
          amount: `<strong>${formatCurrency(advance, currency)}</strong>`,
          fee: formatCurrency(openingFee, currency),
        })
        : t('goal.purchaseBalanceAfter', { amount: `<strong>${formatCurrency((availableCents - cents) / 100, currency)}</strong>` });
    };
    root.addEventListener('input', update);
    update();

    const result = await resultPromise;
    if (result === 'adjust') {
      await this._editGoal(goal.id, { targetAmount: readPrice(root).value });
      return;
    }
    if (result !== 'buy') return;
    const { child } = modal.result;
    setState({ children: getState().children.map(c => c.id === this.childId ? { ...c, ...child } : c) });
    this.child = { ...this.child, ...child };
    Toast.success(t('goal.purchased', { name: escapeHtml(goal.name) }));
    await this._refresh();
  }

  async _deleteGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    const confirmed = await confirm(
      t('goal.deleteTitle'),
      t('goal.deleteMessage', { name: escapeHtml(goal.name) }),
    );
    if (!confirmed) return;
    await this._doDelete(goal);
  }

  async _doDelete(goal) {
    try {
      await api.deleteGoal(goal.id);
      Toast.success(t('goal.deleted'));
      await this._refresh();
    } catch (e) {
      console.error(e);
      Toast.error(describeError(e, t('goal.deleteFailed')), {
        action: { label: t('common.retry'), onClick: () => this._doDelete(goal) },
      });
    }
  }
  async _refresh() {
    try {
      this.goals = await api.getGoals(this.childId);
    } catch (e) {
      console.error(e);
      this._showLoadError();
      return;
    }

    const { settings, children } = getState();
    this.child = children.find(c => c.id === this.childId) || this.child;
    const currency = settings.currency ?? '€';

    const balance = this.child.balance;
    const activeGoals = this.goals
      .filter(g => !g.purchasedAt)
      .sort((a, b) => (balance / b.targetAmount) - (balance / a.targetAmount));
    const doneGoals = this.goals.filter(g => !!g.purchasedAt);
    const goalCard = this._makeGoalCard(currency, balance);

    const section = document.querySelector('.view-goals');
    if (!section) return;

    // Vollständig neu rendern – deckt auch den Übergang Empty-State → Liste ab
    await rerenderKeepingFocus(() => {
      this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
      this._handlers = [];
      section.outerHTML = render(blocks.main, { child: this.child, activeGoals, doneGoals, currency, goalCard });
      this.mount();
    }, () => ['#btn-new-goal']);
  }

  _showLoadError() {
    Toast.error(t('errors.loadFailed'), { action: { label: t('common.retry'), onClick: () => this._refresh() } });
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}



