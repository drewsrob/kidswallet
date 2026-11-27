// views/AllowanceView.js – Taschengeld-Regeln eines Kindes (Route: #/wallet/:id/allowances)
import './AllowanceView.css';

import { api } from '../api.js';
import { getState } from '../state.js';
import { applyChildTheme, formatCurrency, formatAllowanceSchedule } from '../utils.js';
import { confirm, rerenderKeepingFocus } from '../components/Modal.js';
import { Toast } from '../components/Toast.js';
import { confirmWithPin } from '../components/PinPrompt.js';
import { openAllowanceForm } from '../components/AllowanceForm.js';
import { renderChildNotFound } from '../components/EmptyState.js';
import { getNextPayout } from '../status.js';
import { describeError } from '../errors.js';
import { t } from '../i18n.js';
import { parseBlocks, render } from '../template.js';
import allowanceViewHtml from './AllowanceView.html?raw';

const blocks = parseBlocks(allowanceViewHtml);

function allowanceStatus(allowance) {
  if (!allowance.isActive) return { tone: 'attention', icon: 'clock', text: t('allowance.paused') };
  const next = getNextPayout([allowance]);
  return next && { tone: 'info', icon: 'clock', text: next.text };
}

export default class AllowanceView {
  constructor(childId) {
    this.childId = childId;
    this.child = null;
    this.allowances = [];
    this._handlers = [];
  }

  async render() {
    const { children, settings } = getState();
    this.child = children.find(c => c.id === this.childId);

    if (!this.child) return renderChildNotFound();

    applyChildTheme(this.child.colorPaletteIndex);
    document.getElementById('toolbar-title').textContent = t('allowance.toolbarTitle', { name: this.child.name });

    try {
      this.allowances = await api.getAllowances(this.childId);
    } catch (e) {
      console.error(e);
      this.allowances = [];
      this._loadFailed = true;
    }

    const currency = settings.currency ?? '€';
    const allowanceItem = ({ allowance, currency: cur }) =>
      render(blocks.allowanceItem, { allowance, currency: cur, status: allowanceStatus(allowance) });

    return render(blocks.main, { child: this.child, allowances: this.allowances, currency, allowanceItem });
  }

  mount() {
    if (this._loadFailed) {
      this._loadFailed = false;
      Toast.error(t('errors.loadFailed'), { action: { label: t('common.retry'), onClick: () => this._refreshAllowances() } });
    }

    for (const id of ['btn-add-allowance', 'btn-empty-add-allowance']) {
      const btn = document.getElementById(id);
      if (!btn) continue;
      const h = () => this._showAllowanceForm();
      btn.addEventListener('click', h);
      this._handlers.push({ el: btn, type: 'click', fn: h });
    }

    const list = document.getElementById('allowance-list');
    if (list) {
      const onClick = (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const { action, allowanceId } = btn.dataset;
        if (action === 'edit') this._showAllowanceForm(allowanceId);
        if (action === 'delete') this._deleteAllowance(allowanceId);
      };
      const onChange = (e) => {
        const input = e.target.closest('input[data-action="toggle"]');
        if (input) this._toggleAllowance(input.dataset.allowanceId, input.checked);
      };
      list.addEventListener('click', onClick);
      list.addEventListener('change', onChange);
      this._handlers.push({ el: list, type: 'click', fn: onClick });
      this._handlers.push({ el: list, type: 'change', fn: onChange });
    }
  }

  async _showAllowanceForm(allowanceId = null) {
    const existing = allowanceId ? this.allowances.find(a => a.id === allowanceId) : null;
    if (await openAllowanceForm(this.childId, existing)) await this._refreshAllowances();
  }

  async _toggleAllowance(allowanceId, isActive) {
    const allowance = this.allowances.find(a => a.id === allowanceId);
    if (!allowance) return;
    // Bei Abbruch springt der Schalter beim Neu-Rendern auf den gespeicherten Stand zurück
    if (!(await confirmWithPin(isActive ? t('pin.reasons.ruleActivate') : t('pin.reasons.rulePause')))) {
      await this._refreshAllowances();
      return;
    }
    try {
      await api.updateAllowance(allowanceId, {
        amount: allowance.amount,
        frequency: allowance.frequency,
        dayOfWeek: allowance.dayOfWeek,
        dayOfMonth: allowance.dayOfMonth,
        isActive,
      });
      allowance.isActive = isActive;
      Toast.success(isActive ? t('allowance.activated') : t('allowance.pausedToast'));
    } catch (e) {
      console.error(e);
      Toast.error(describeError(e, t('allowance.toggleFailed')), {
        action: { label: t('common.retry'), onClick: () => this._toggleAllowance(allowanceId, isActive) },
      });
    }
    // Schalter und Statushinweis (nächste Auszahlung / pausiert) mit dem gespeicherten Stand abgleichen;
    // der Fokus bleibt dabei auf dem Schalter
    await this._refreshAllowances();
  }

  async _deleteAllowance(allowanceId) {
    const allowance = this.allowances.find(a => a.id === allowanceId);
    if (!allowance) return;

    const confirmed = await confirm(
      t('allowance.deleteTitle'),
      t('allowance.deleteMessage', {
        amount: formatCurrency(allowance.amount, getState().settings.currency ?? '€'),
        schedule: formatAllowanceSchedule(allowance),
      }),
    );
    if (!confirmed) return;
    if (!(await confirmWithPin(t('pin.reasons.ruleDelete')))) return;
    await this._doDelete(allowanceId);
  }

  async _doDelete(allowanceId) {
    try {
      await api.deleteAllowance(allowanceId);
      Toast.success(t('allowance.deleted'));
      await this._refreshAllowances();
    } catch (e) {
      console.error(e);
      Toast.error(describeError(e, t('allowance.deleteFailed')), {
        action: { label: t('common.retry'), onClick: () => this._doDelete(allowanceId) },
      });
    }
  }

  async _refreshAllowances() {
    await rerenderKeepingFocus(async () => {
      const html = await this.render();
      this.unmount();
      document.getElementById('app').innerHTML = html;
      this.mount();
    }, () => ['#btn-add-allowance']);
  }
  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}
