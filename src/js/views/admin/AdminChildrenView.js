// views/admin/AdminChildrenView.js – Logik (Kinder-Liste mit Löschen im Admin)

import './Admin.css';
import { api } from '../../api.js';
import { getState, setState } from '../../state.js';
import { isAdminUnlocked } from '../../security.js';
import { escapeHtml, getPaletteColors } from '../../utils.js';
import { Modal, rerenderKeepingFocus } from '../../components/Modal.js';
import { Toast } from '../../components/Toast.js';
import { openChildForm } from '../../components/ChildForm.js';
import { describeError } from '../../errors.js';
import { t } from '../../i18n.js';
import { parseBlocks, render } from '../../template.js';
import adminChildrenHtml from './AdminChildrenView.html?raw';

const blocks = parseBlocks(adminChildrenHtml);

export default class AdminChildrenView {
  constructor() {
    this._handlers = [];
  }

  // Sicherheitsprüfung: Nur authentifiziert erreichbar
  _guardAuth() {
    if (!isAdminUnlocked()) {
      location.hash = '#/admin';
      return false;
    }
    return true;
  }

  async render() {
    if (!this._guardAuth()) return '<div></div>';

    let children = [];
    try {
      children = await api.getChildren();
      setState({ children });
    } catch (e) {
      console.error(e);
      Toast.error(t('errors.loadFailed'), { action: { label: t('common.retry'), onClick: () => this._refresh() } });
    }

    const currency = getState().settings.currency ?? '€';

    const childItem = ({ child, currency: cur }) => {
      const colors = getPaletteColors(child.colorPaletteIndex);
      return render(blocks.childItem, { child, currency: cur, colors });
    };

    return render(blocks.childrenList, { children, currency, childItem });
  }

  mount() {
    ['btn-admin-add-child', 'btn-admin-empty-add-child'].forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const h = () => this._addChild();
      btn.addEventListener('click', h);
      this._handlers.push({ el: btn, type: 'click', fn: h });
    });

    const list = document.getElementById('children-list');
    if (list) {
      const h = (e) => {
        const btn = e.target.closest('[data-action="delete"]');
        if (btn) this._deleteChild(btn.dataset.childId);
      };
      list.addEventListener('click', h);
      this._handlers.push({ el: list, type: 'click', fn: h });
    }
  }

  // Gleicher Dialog wie auf der Startseite
  async _addChild() {
    if (await openChildForm()) await this._refresh();
  }

  async _deleteChild(childId) {
    const child = getState().children.find(c => c.id === childId);
    if (!child) return;

    const confirmed = await new Modal({
      title: t('child.deleteTitle'),
      content: /* html */`
        <p>${t('child.deleteMessage', { name: escapeHtml(child.name) })}</p>
        <p class="text-danger text-sm">
          ${t('child.deleteWarning')}
        </p>
      `,
      actions: [
        { label: t('common.cancel'), value: 'cancel', variant: 'secondary' },
        { label: t('common.delete'), value: 'confirm', variant: 'danger' },
      ],
    }).open();

    if (confirmed !== 'confirm') return;
    await this._doDelete(child);
  }

  async _doDelete(child) {
    try {
      await api.deleteChild(child.id);
      Toast.success(t('child.deleted', { name: escapeHtml(child.name) }));
      await this._refresh();
    } catch (e) {
      console.error(e);
      Toast.error(describeError(e, t('child.deleteFailed')), {
        action: { label: t('common.retry'), onClick: () => this._doDelete(child) },
      });
    }
  }

  async _refresh() {
    await rerenderKeepingFocus(async () => {
      const html = await this.render();
      this.unmount();
      document.getElementById('app').innerHTML = html;
      this.mount();
    }, () => ['#children-list [data-action="delete"]', 'main h1']);
  }
  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}
