// views/TransactionsView.js – Vollständiger Buchungsverlauf (Route: #/wallet/:id/transactions)
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
import { parseBlocks, render } from '../template.js';
import transactionsHtml from './TransactionsView.html?raw';

const blocks = parseBlocks(transactionsHtml);
function groupByMonth(transactions) {
  const monthFormat = new Intl.DateTimeFormat(getLocale(), { month: 'long', year: 'numeric' });
  const groups = [];
  for (const tx of transactions) {
    const label = monthFormat.format(new Date(tx.date));
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(tx);
    else groups.push({ label, items: [tx] });
  }
  return groups;
}

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

    return render(blocks.main, {
      child,
      transactions,
      groups: groupByMonth(transactions),
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
