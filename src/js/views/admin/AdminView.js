// views/admin/AdminView.js – Verwaltung (PIN-Entsperrung + Navigation)
import './Admin.css';

import { api } from '../../api.js';
import { setState } from '../../state.js';
import { isAdminUnlocked, isPinEnabled } from '../../security.js';
import { Toast } from '../../components/Toast.js';
import { describeError } from '../../errors.js';
import { t } from '../../i18n.js';
import { parseBlocks, render } from '../../template.js';
import adminViewHtml from './AdminView.html?raw';

const blocks = parseBlocks(adminViewHtml);
const renderDashboard = () => render(blocks.dashboard, { pinEnabled: isPinEnabled() });

export default class AdminView {
  constructor() {
    this._handlers = [];
  }

  async render() {
    // Ohne aktiven PIN-Schutz öffnet sich die Verwaltung direkt
    return isAdminUnlocked() ? renderDashboard() : render(blocks.pinScreen);
  }

  mount() {
    if (!isAdminUnlocked()) {
      this._mountPinForm();
    } else {
      this._mountDashboard();
    }
  }

  _mountPinForm() {
    const form = document.getElementById('pin-form');
    if (!form) return;

    const handler = async (e) => {
      e.preventDefault();
      const pinInput = document.getElementById('pin-input');
      const pinError = document.getElementById('pin-error');
      const submitBtn = document.getElementById('btn-pin-submit');
      const pin = pinInput.value.trim();

      const showError = (msg) => {
        pinError.textContent = msg;
        pinError.hidden = false;
        pinInput.setAttribute('aria-invalid', 'true');
        pinInput.value = '';
        pinInput.focus();
      };

      if (!pin) { showError(t('validation.pinRequired')); return; }

      submitBtn.disabled = true;
      submitBtn.textContent = '…';

      try {
        const { valid } = await api.verifyPin(pin);
        if (valid) {
          setState({ adminAuthenticated: true });
          pinError.hidden = true;
          document.getElementById('app').innerHTML = renderDashboard();
          this._mountDashboard();
        } else {
          showError(t('validation.pinWrong'));
        }
      } catch (err) {
        console.error(err);
        Toast.error(describeError(err, t('pin.checkFailed')));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = t('management.unlock');
      }
    };

    form.addEventListener('submit', handler);
    this._handlers.push({ el: form, type: 'submit', fn: handler });
  }

  _mountDashboard() {
    const nav = document.querySelector('.admin-nav');
    if (nav) {
      const h = (e) => {
        const btn = e.target.closest('[data-nav]');
        if (!btn) return;
        const target = btn.dataset.nav;
        if (target === 'children') location.hash = '#/admin/children';
        if (target === 'settings') location.hash = '#/admin/settings';
        if (target === 'appearance') location.hash = '#/admin/appearance';
        if (target === 'backup') location.hash = '#/admin/backup';
      };
      nav.addEventListener('click', h);
      this._handlers.push({ el: nav, type: 'click', fn: h });
    }

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      const h = () => {
        setState({ adminAuthenticated: false });
        location.hash = '#/';
      };
      btnLogout.addEventListener('click', h);
      this._handlers.push({ el: btnLogout, type: 'click', fn: h });
    }
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}

