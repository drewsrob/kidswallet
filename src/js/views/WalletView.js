// views/WalletView.js – Logik & State-Verwaltung (Wallet-Dashboard)
import './WalletView.css';

import { api } from '../api.js';
import { getState } from '../state.js';
import { applyChildTheme, animateCountUp } from '../utils.js';
import { openTransactionForm } from '../components/TransactionForm.js';
import { openChildForm } from '../components/ChildForm.js';
import { openAllowanceForm } from '../components/AllowanceForm.js';
import { openGoalForm } from '../components/GoalForm.js';
import { renderTransactionList } from '../components/TransactionList.js';
import { renderChildNotFound } from '../components/EmptyState.js';
import { renderActivityChart, renderActivityRangeControl } from '../components/ActivityChart.js';
import { bindSegmentedControl } from '../components/SegmentedControl.js';
import { DEFAULT_RANGE_ID } from '../stats.js';
import { getDashboardStatuses, getGoalStatus, getHeroFacts, getNextPayout } from '../status.js';
import { t } from '../i18n.js';
import { Toast } from '../components/Toast.js';
import { rerenderKeepingFocus } from '../components/Modal.js';
import { parseBlocks, render } from '../template.js';
import walletHtml from './WalletView.html?raw';

const blocks = parseBlocks(walletHtml);

// Teildaten laden; Fehler werden gemerkt und nach dem Rendern gemeldet,
// damit das Dashboard trotzdem nutzbar bleibt.
async function loadOrEmpty(fn, onError) {
  try { return await fn(); } catch (e) { console.error(e); onError(); return []; }
}

export default class WalletView {
  constructor(childId) {
    this.childId = childId;
    this.child = null;
    this._handlers = [];
    this._flashType = null;
    // Gewählter Zeitraum bleibt beim Neu-Rendern (z. B. nach einer Buchung) erhalten
    this._activityRange = DEFAULT_RANGE_ID;
    this._transactions = [];
  }

  async render() {
    const { children, settings } = getState();
    this.child = children.find(c => c.id === this.childId);

    if (!this.child) return renderChildNotFound();

    applyChildTheme(this.child.colorPaletteIndex);
    document.getElementById('toolbar-title').textContent = this.child.name;

    const currency = settings.currency ?? '€';
    this._loadFailed = false;
    const failed = () => { this._loadFailed = true; };
    const [transactions, goals, allowances] = await Promise.all([
      loadOrEmpty(() => api.getTransactions(this.childId), failed),
      loadOrEmpty(() => api.getGoals(this.childId), failed),
      loadOrEmpty(() => api.getAllowances(this.childId), failed),
    ]);

    const balance = this.child.balance;
    // Ziele, die am nächsten an der Erfüllung sind, zuerst
    const activeGoals = goals
      .filter(g => !g.purchasedAt)
      .sort((a, b) => a.targetAmount - b.targetAmount);

    const allowanceItem = ({ allowance, currency: cur }) =>
      render(blocks.allowanceItem, { allowance, currency: cur });

    const goalItem = ({ goal, currency: cur, balance: bal }) =>
      render(blocks.goalItem, { goal, currency: cur, balance: bal, status: getGoalStatus(goal, bal, cur) });

    const transactionList = ({ transactions: txs, currency: cur }) =>
      renderTransactionList(txs, cur, t('transaction.recentTitle'), { variant: 'rows' });

    const activeAllowances = allowances.filter(a => a.isActive);
    const allowanceStatus = allowances.length === 0 ? null
      : activeAllowances.length === 0
        ? { tone: 'attention', icon: 'clock', text: t('allowance.paused') }
        : (next => next && { tone: 'info', icon: 'clock', text: next.text })(getNextPayout(activeAllowances));

    const statuses = getDashboardStatuses({ childId: this.childId, allowances, goals, balance });
    const heroFacts = getHeroFacts({ goals, transactions });
    this._transactions = transactions;
    this._currency = currency;

    return render(blocks.main, {
      child: this.child,
      transactions,
      goals,
      activeGoals,
      allowances,
      currency,
      balance,
      allowanceItem,
      goalItem,
      transactionList,
      allowanceStatus,
      statuses,
      heroFacts,
      activityRangeControl: renderActivityRangeControl(this._activityRange),
      activityChart: transactions.length > 0 ? renderActivityChart(transactions, this._activityRange, currency) : '',
    });
  }

  mount() {
    const currency = getState().settings.currency ?? '€';
    if (this._loadFailed) {
      Toast.error(t('errors.loadFailed'), { action: { label: t('common.retry'), onClick: () => this._refresh() } });
    }
    const balanceEl = document.querySelector('.wallet-balance[data-balance]');
    if (balanceEl) {
      if (this._flashType) {
        const ft = this._flashType;
        this._flashType = null;
        balanceEl.classList.add(`wallet-balance--flash-${ft}`);
        balanceEl.addEventListener('animationend', () =>
          balanceEl.classList.remove(`wallet-balance--flash-${ft}`), { once: true });
      }
      animateCountUp(balanceEl, 0, parseFloat(balanceEl.dataset.balance), currency);
    }

    const actions = {
      'btn-earn': () => this._book('earn'),
      'btn-spend': () => this._book('spend'),
      'btn-empty-earn': () => this._book('earn'),
      'btn-empty-spend': () => this._book('spend'),
      'btn-edit-child': () => this._editChild(),
      'btn-manage-allowances': () => this._manageAllowances(),
      'btn-create-allowance': () => this._createAllowance(),
      'btn-manage-goals': () => { location.hash = `#/wallet/${this.childId}/goals`; },
      'btn-create-goal': () => this._createGoal(),
    };

    for (const [id, h] of Object.entries(actions)) {
      const btn = document.getElementById(id);
      if (!btn) continue;
      btn.addEventListener('click', h);
      this._handlers.push({ el: btn, type: 'click', fn: h });
    }

    // Zeitraumwechsel: nur das Diagramm neu zeichnen, die übrige Ansicht bleibt unverändert
    const rangeEl = document.getElementById('activity-range');
    const chartEl = document.getElementById('activity-chart');
    if (rangeEl && chartEl) {
      this._unbindRange = bindSegmentedControl(rangeEl, (range) => {
        this._activityRange = range;
        chartEl.innerHTML = renderActivityChart(this._transactions, range, this._currency);
      });
    }
  }

  async _book(kind) {
    if (!(await openTransactionForm(this.childId, kind))) return;
    this._flashType = kind === 'earn' ? 'pos' : 'neg';
    await this._refresh();
  }

  async _editChild() {
    if (!(await openChildForm(this.childId))) return;
    await this._refresh();
  }

  _manageAllowances() {
    location.hash = `#/wallet/${this.childId}/allowances`;
  }

  async _createAllowance() {
    if (!(await openAllowanceForm(this.childId))) return;
    await this._refresh();
  }

  async _createGoal() {
    if (!(await openGoalForm(this.childId))) return;
    await this._refresh();
  }

  async _refresh() {
    if (!document.querySelector('.view-wallet')) return;
    // Wird der auslösende Button beim Neu-Rendern ersetzt (z. B. Empty-State → Liste),
    // landet der Fokus auf der gleichwertigen Aktion des neuen Zustands.
    const fallbacks = {
      '#btn-create-goal': ['#btn-manage-goals'],
      '#btn-create-allowance': ['#btn-manage-allowances'],
      '#btn-empty-earn': ['#btn-earn'],
      '#btn-empty-spend': ['#btn-spend'],
    };
    await rerenderKeepingFocus(async () => {
      const html = await this.render();
      const section = document.querySelector('.view-wallet');
      if (!section) return;
      this.unmount();
      section.outerHTML = html;
      this.mount();
    }, (sel) => fallbacks[sel] ?? []);
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
    this._unbindRange?.();
    this._unbindRange = null;
  }
}
