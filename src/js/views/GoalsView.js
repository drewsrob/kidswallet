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
import { parseBlocks, render } from '../template.js';
import goalsHtml from './GoalsView.html?raw';

const blocks = parseBlocks(goalsHtml);

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

  async _editGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (await openGoalForm(this.childId, goal)) await this._refresh();
  }

  async _purchaseGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    const { settings } = getState();
    const currency = settings.currency ?? '€';

    const confirmed = await new Modal({
      title: t('goal.purchaseTitle', { name: escapeHtml(goal.name) }),
      content: `<p>${t('goal.purchaseDeducted', { amount: formatCurrency(goal.targetAmount, currency) })}</p>
               <p>${t('goal.purchaseBalanceAfter', { amount: `<strong>${formatCurrency(this.child.balance - goal.targetAmount, currency)}</strong>` })}</p>`,
      actions: [
        { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
        { label: t('goal.buy'), value: 'confirm', variant: 'primary' },
      ],
    }).open();

    if (confirmed !== 'confirm') return;
    await this._doPurchase(goal);
  }

  async _doPurchase(goal) {
    try {
      const response = await api.updateGoal(goal.id, { purchaseGoal: true });
      const { children } = getState();
      const updated = children.map(c => c.id === this.childId ? { ...c, balance: response.newBalance } : c);
      setState({ children: updated });
      this.child = { ...this.child, balance: response.newBalance };
      Toast.success(t('goal.purchased', { name: escapeHtml(goal.name) }));
      await this._refresh();
    } catch (e) {
      console.error(e);
      Toast.error(describeError(e, t('goal.purchaseFailed')), {
        action: { label: t('common.retry'), onClick: () => this._doPurchase(goal) },
      });
    }
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



