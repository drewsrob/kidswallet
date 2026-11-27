import template from './AppearanceView.html?raw';
import './AppearanceView.css';
import { parseBlocks, render } from '../template.js';
import { applyColorTokens } from '../utils.js';
import { Toast } from '../components/Toast.js';
import { isAdminUnlocked } from '../security.js';
import { getThemePreference, setThemePreference, THEME_PREFERENCES } from '../theme.js';
import { describeError } from '../errors.js';
import { t, getLanguage, setLanguage, SUPPORTED_LANGUAGES } from '../i18n.js';

const ACCENT_KEY = 'kidswallet-accent';
const DEFAULT_ACCENT = '#6c63ff';

// Beschriftungen werden erst beim Rendern übersetzt
const PRESETS = [
  { hex: '#6c63ff', key: 'purple' },
  { hex: '#9b5de5', key: 'violet' },
  { hex: '#ef476f', key: 'pink' },
  { hex: '#ff6b6b', key: 'coral' },
  { hex: '#f9a826', key: 'orange' },
  { hex: '#43aa8b', key: 'green' },
  { hex: '#118ab2', key: 'blue' },
  { hex: '#60656b', key: 'grey' },
];

export default class AppearanceView {
  constructor() {
    this._current = (localStorage.getItem(ACCENT_KEY) || DEFAULT_ACCENT).trim();
    this._blocks = parseBlocks(template);
  }

  render() {
    // Nur über die entsperrte Verwaltung erreichbar
    if (!isAdminUnlocked()) {
      this._blocked = true;
      location.replace('#/admin');
      return '<div></div>';
    }
    return render(this._blocks.layout, {
      current: this._current,
      presets: PRESETS.map(p => ({ ...p, label: t(`appearance.colors.${p.key}`) })),
      themes: THEME_PREFERENCES.map(value => ({ value, label: t(`appearance.themes.${value}`) })),
      theme: getThemePreference(),
      languages: SUPPORTED_LANGUAGES,
      language: getLanguage(),
    });
  }

  mount() {
    if (this._blocked) return;
    const themeGroup = document.querySelector('.appearance-themes');
    themeGroup.addEventListener('change', (e) => {
      const preference = e.target.closest('input[name="app-theme"]')?.value;
      if (!preference) return;
      themeGroup.querySelectorAll('.appearance-choice').forEach(choice => {
        choice.classList.toggle('active', choice.querySelector('input').value === preference);
      });
      // Das Schema wird auch dann übernommen, wenn das Speichern scheitert
      try {
        setThemePreference(preference);
      } catch (err) {
        console.error(err);
        Toast.error(describeError(err, t('errors.saveFailed')));
      }
    });
    const input = document.getElementById('appearance-color-input');
    const swatch = document.getElementById('appearance-wheel-swatch');
    const previewBtn = document.getElementById('appearance-preview-btn');
    const previewBadge = document.getElementById('appearance-preview-badge');
    const saveBtn = document.getElementById('appearance-save');
    const view = document.querySelector('.appearance-view');

    const updateLive = (hex) => {
      this._current = hex;
      // Update CSS custom properties live on the whole app
      document.documentElement.style.setProperty('--color-primary', hex);
      document.documentElement.style.setProperty('--child-primary', hex);
      document.documentElement.style.setProperty('--child-light', `color-mix(in srgb, ${hex} 15%, transparent)`);
      applyColorTokens('accent', hex);
      applyColorTokens('child', hex);
      // Update swatch
      swatch.style.background = hex;
      input.value = hex;
      // Update preset active states
      view.querySelectorAll('.appearance-preset').forEach(btn => {
        const isActive = btn.dataset.color.toLowerCase() === hex.toLowerCase();
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });
      // Update preview badge (btn-primary auto-updates via --child-primary on :root)
      previewBadge.style.background = `color-mix(in srgb, ${hex} 15%, transparent)`;
      previewBadge.style.color = 'var(--accent-text)';
    };

    // Preset clicks
    view.addEventListener('click', (e) => {
      const preset = e.target.closest('.appearance-preset');
      if (preset) updateLive(preset.dataset.color);
    });

    // Color wheel
    input.addEventListener('input', (e) => updateLive(e.target.value));

    // Save
    saveBtn.addEventListener('click', () => {
      try {
        localStorage.setItem(ACCENT_KEY, this._current);
        Toast.success(t('settings.accentSaved'));
      } catch (e) {
        console.error(e);
        Toast.error(describeError(e, t('errors.saveFailed')));
      }
    });

    // Sprache: Die Ansicht wird von app.js nach dem Sprachwechsel neu gerendert
    const languageGroup = view.querySelector('.appearance-languages');
    languageGroup?.addEventListener('change', async (e) => {
      const code = e.target.closest('input[name="app-language"]')?.value;
      if (!code || code === getLanguage()) return;
      try {
        await setLanguage(code);
        Toast.success(t('appearance.languageSaved'));
      } catch (err) {
        console.error(err);
        const current = document.getElementById(`appearance-language-${getLanguage()}`);
        if (current) current.checked = true;
        Toast.error(describeError(err, t('errors.saveFailed')));
      }
    });
  }
}
