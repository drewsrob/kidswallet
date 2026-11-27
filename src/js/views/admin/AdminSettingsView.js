// views/admin/AdminSettingsView.js – Logik (Einstellungen)

import './Admin.css';
import { api } from '../../api.js';
import { getState, setState } from '../../state.js';
import { isAdminUnlocked, isPinEnabled } from '../../security.js';
import { Toast } from '../../components/Toast.js';
import { setFieldError, clearFieldError } from '../../components/Modal.js';
import { setupPin, disablePinProtection } from '../../components/PinPrompt.js';
import { describeError } from '../../errors.js';
import { t } from '../../i18n.js';
import { parseBlocks, render } from '../../template.js';
import settingsHtml from './AdminSettingsView.html?raw';

const blocks = parseBlocks(settingsHtml);

// Formular-Submit mit Sperre gegen Doppelklick
function guardSubmit(form, fn) {
  return async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn?.disabled) return;
    if (btn) btn.disabled = true;
    try { await fn(); } finally { if (btn) btn.disabled = false; }
  };
}

export default class AdminSettingsView {
  constructor() {
    this._handlers = [];
  }

  _guardAuth() {
    if (!isAdminUnlocked()) {
      location.hash = '#/admin';
      return false;
    }
    return true;
  }

  async render() {
    if (!this._guardAuth()) return '<div></div>';
    const { settings } = getState();
    return render(blocks.main, { currency: settings.currency ?? '€', pinEnabled: isPinEnabled() });
  }

  mount() {
    const pinSwitch = document.getElementById('pin-protection-switch');
    if (pinSwitch) {
      const h = () => this._togglePinProtection(pinSwitch);
      pinSwitch.addEventListener('click', h);
      this._handlers.push({ el: pinSwitch, type: 'click', fn: h });
    }

    const currencyForm = document.getElementById('currency-form');
    if (currencyForm) {
      const h = guardSubmit(currencyForm, () => this._saveCurrency(currencyForm));
      currencyForm.addEventListener('submit', h);
      this._handlers.push({ el: currencyForm, type: 'submit', fn: h });
    }

    const pinForm = document.getElementById('pin-form');
    if (pinForm) {
      const h = guardSubmit(pinForm, () => this._changePin(pinForm));
      pinForm.addEventListener('submit', h);
      this._handlers.push({ el: pinForm, type: 'submit', fn: h });
    }
  }

  async _togglePinProtection(pinSwitch) {
    if (pinSwitch.getAttribute('aria-busy') === 'true') return;
    pinSwitch.setAttribute('aria-busy', 'true');
    let changed;
    try {
      changed = isPinEnabled() ? await disablePinProtection() : await setupPin();
    } finally {
      pinSwitch.removeAttribute('aria-busy');
    }
    if (!changed) return;

    const enabled = isPinEnabled();
    // Wer den Schutz hier aktiviert, ist bereits in der Verwaltung und bleibt entsperrt
    if (enabled) setState({ adminAuthenticated: true });
    Toast.success(t(enabled ? 'security.enabled' : 'security.disabled'));
    if (document.contains(pinSwitch)) await this._rerender();
  }

  // „PIN ändern“ erscheint nur bei aktivem Schutz – Seite neu aufbauen, Fokus auf dem Schalter halten
  async _rerender() {
    const app = document.getElementById('app');
    const scrollY = window.scrollY;
    this.unmount();
    app.innerHTML = await this.render();
    this.mount();
    window.scrollTo(0, scrollY);
    document.getElementById('pin-protection-switch')?.focus({ preventScroll: true });
  }

  async _saveCurrency(form) {
    const currency = document.getElementById('currency-input')?.value?.trim();
    clearFieldError(form, 'currency-input');
    if (!currency) {
      setFieldError(form, 'currency-input', t('validation.currencyRequired'));
      document.getElementById('currency-input')?.focus();
      return;
    }
    try {
      const updated = await api.updateSettings({ currency });
      setState({ settings: { ...getState().settings, currency: updated.currency } });
      Toast.success(t('settings.currencySaved'));
    } catch (e) {
      console.error(e);
      Toast.error(describeError(e, t('settings.currencySaveFailed')), {
        action: { label: t('common.retry'), onClick: () => form.requestSubmit() },
      });
    }
  }

  async _changePin(form) {
    const fields = ['current-pin', 'new-pin', 'new-pin-confirm'];
    fields.forEach(id => clearFieldError(form, id));
    const value = id => document.getElementById(id)?.value?.trim() ?? '';
    const currentPin = value('current-pin');
    const newPin = value('new-pin');
    const newPinConfirm = value('new-pin-confirm');

    let firstInvalid = null;
    const fail = (id, msg) => { setFieldError(form, id, msg); firstInvalid ??= id; };
    if (!currentPin) fail('current-pin', t('validation.currentPinRequired'));
    if (!/^\d{4,12}$/.test(newPin)) fail('new-pin', t('validation.pinTooShort'));
    else if (newPin !== newPinConfirm) fail('new-pin-confirm', t('validation.pinMismatch'));
    if (firstInvalid) { document.getElementById(firstInvalid)?.focus(); return; }

    try {
      await api.updateSettings({ currentPin, newPin });
      Toast.success(t('pin.changed'));
      form.reset();
    } catch (e) {
      console.error(e);
      if (e?.code === 'currentPinWrong') {
        setFieldError(form, 'current-pin', t('validation.pinWrong'));
        const input = document.getElementById('current-pin');
        if (input) { input.value = ''; input.focus(); }
        return;
      }
      Toast.error(describeError(e, t('pin.changeFailed')));
    }
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}