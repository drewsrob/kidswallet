// views/TransactionsView.js – Buchungen: Gesamtübersicht, Monatszusammenfassungen und Verlauf (Route: #/wallet/:id/transactions)
import './TransactionsView.css';

import { api } from '../api.js';
import { getState } from '../state.js';
import { applyChildTheme } from '../utils.js';
import { Toast } from '../components/Toast.js';
import { rerenderKeepingFocus } from '../components/Modal.js';
import { t, getLocale } from '../i18n.js';
import { renderTransactionList } from '../components/TransactionList.js';
import { renderChildNotFound } from '../components/EmptyState.js';
import { openTransactionForm } from '../components/TransactionForm.js';
import { getTotals, groupByMonth } from '../stats.js';
import { parseBlocks, render } from '../template.js';
import transactionsHtml from './TransactionsView.html?raw';

const blocks = parseBlocks(transactionsHtml);

export default class TransactionsView {
  constructor(childId) {
    this.childId = childId;
    this._handlers = [];
  }

  async render() {
    const { children, settings } = getState();
    const child = children.find(c => c.id === this.childId);

    if (!child) return renderChildNotFound();

    applyChildTheme(child.colorPaletteIndex);
    const currency = settings.currency ?? '€';

    let transactions = [];
    this._loadFailed = false;
    try {
      transactions = await api.getTransactions(this.childId);
    } catch (e) {
      console.error(e);
      this._loadFailed = true;
    }
    transactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    const monthFormat = new Intl.DateTimeFormat(getLocale(), { month: 'long', year: 'numeric' });
    const totals = getTotals(transactions);
    const groups = groupByMonth(transactions).map(g => ({ ...g, label: monthFormat.format(g.date) }));

    return render(blocks.main, {
      child,
      transactions,
      totals,
      sinceLabel: totals.since ? monthFormat.format(totals.since) : '',
      groups,
      currency,
      monthSummary: (g) => render(blocks.monthSummary, { g, currency }),
      transactionList: (items, label) => renderTransactionList(items, currency, label),
    });
  }

  mount() {
    if (this._loadFailed) {
      Toast.error(t('errors.loadFailed'), { action: { label: t('common.retry'), onClick: () => this._refresh() } });
    }
    const actions = {
      'btn-empty-earn': () => this._book('earn'),
      'btn-empty-spend': () => this._book('spend'),
    };
    for (const [id, h] of Object.entries(actions)) {
      const btn = document.getElementById(id);
      if (!btn) continue;
      btn.addEventListener('click', h);
      this._handlers.push({ el: btn, type: 'click', fn: h });
    }
  }

  async _book(kind) {
    if (!(await openTransactionForm(this.childId, kind))) return;
    await this._refresh();
  }

  async _refresh() {
    if (!document.querySelector('.view-transactions')) return;
    await rerenderKeepingFocus(async () => {
      const html = await this.render();
      const section = document.querySelector('.view-transactions');
      if (!section) return;
      this.unmount();
      section.outerHTML = html;
      this.mount();
    }, () => ['#transactions-page-title']);
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}
