// i18n.js – Internationalisierung auf Basis von i18next
//
// Alle sichtbaren Texte liegen in src/i18n/<sprache>.json; Deutsch ist die Referenz.
// Verwendung: t('wallet.income'), t('goal.count', { count: 2 }), t('help.wallet.paragraphs', { returnObjects: true })
// Statisches HTML: data-i18n="key" (Textinhalt), data-i18n-attr="aria-label:key;title:key2"

import i18next from 'i18next';
import de from '../i18n/de.json';
import en from '../i18n/en.json';
import fr from '../i18n/fr.json';
import es from '../i18n/es.json';
import pt from '../i18n/pt.json';

export const LANGUAGE_STORAGE_KEY = 'kidswallet-language';
export const REFERENCE_LANGUAGE = 'de';
export const FALLBACK_LANGUAGE = 'en';

/** Unterstützte Sprachen mit Eigenbezeichnung (Endonym) und Standard-Locale für Formatierungen */
export const SUPPORTED_LANGUAGES = [
  { code: 'de', label: 'Deutsch', locale: 'de-DE' },
  { code: 'en', label: 'English', locale: 'en-GB' },
  { code: 'fr', label: 'Français', locale: 'fr-FR' },
  { code: 'es', label: 'Español', locale: 'es-ES' },
  { code: 'pt', label: 'Português', locale: 'pt-PT' },
];

const RESOURCES = { de, en, fr, es, pt };
const isSupported = (code) => SUPPORTED_LANGUAGES.some(l => l.code === code);
const baseCode = (tag) => String(tag || '').toLowerCase().split(/[-_]/)[0];

function storedLanguage() {
  try {
    const code = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupported(code) ? code : null;
  } catch {
    return null;
  }
}

/** Gerätesprache → unterstützte Sprache, sonst Englisch */
export function detectDeviceLanguage() {
  const tags = (typeof navigator !== 'undefined' && (navigator.languages?.length ? navigator.languages : [navigator.language])) || [];
  for (const tag of tags) {
    const code = baseCode(tag);
    if (isSupported(code)) return code;
  }
  return FALLBACK_LANGUAGE;
}

const missingReported = new Set();

i18next.init({
  resources: Object.fromEntries(Object.entries(RESOURCES).map(([code, translation]) => [code, { translation }])),
  lng: storedLanguage() || detectDeviceLanguage(),
  fallbackLng: [FALLBACK_LANGUAGE, REFERENCE_LANGUAGE],
  supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
  initAsync: false,
  interpolation: { escapeValue: false },
  returnNull: false,
  saveMissing: import.meta.env.DEV,
  missingKeyHandler: (lngs, _ns, key) => {
    const id = `${lngs.join(',')}:${key}`;
    if (missingReported.has(id)) return;
    missingReported.add(id);
    console.warn(`Missing translation:\n${key} (${lngs.join(', ')})`);
  },
});

document.documentElement.lang = i18next.language;

/** Text zum Schlüssel in der aktuellen Sprache */
export const t = (key, options) => i18next.t(key, options);

/** Prüft, ob ein Schlüssel existiert (z. B. für Altdaten-Zuordnungen) */
export const hasKey = (key) => i18next.exists(key);

export function getLanguage() {
  return isSupported(i18next.resolvedLanguage) ? i18next.resolvedLanguage : FALLBACK_LANGUAGE;
}

/** Locale für Intl-Formatierungen; regionale Gerätevariante bleibt erhalten (z. B. de-AT, pt-BR) */
export function getLocale() {
  const code = getLanguage();
  const device = typeof navigator !== 'undefined' ? navigator.language : '';
  if (device && baseCode(device) === code) return device;
  return SUPPORTED_LANGUAGES.find(l => l.code === code).locale;
}

/** true, wenn die Sprache manuell gewählt wurde (überschreibt die Gerätesprache) */
export function isLanguageManual() {
  return storedLanguage() !== null;
}

/**
 * Sprache wechseln und dauerhaft speichern.
 * @param {string|null} code  Sprachcode oder null für „wie Gerät“
 */
export async function setLanguage(code) {
  if (code && !isSupported(code)) throw new Error(`Unsupported language: ${code}`);
  try {
    if (code) localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
    else localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch { /* Speicher nicht verfügbar – Sprache gilt nur für diese Sitzung */ }
  await i18next.changeLanguage(code || detectDeviceLanguage());
}

/** Gespeicherte Sprache erneut anwenden (z. B. nach dem Wiederherstellen eines Backups) */
export function reloadLanguage() {
  return i18next.changeLanguage(storedLanguage() || detectDeviceLanguage());
}

/** Callback bei Sprachwechsel; liefert eine Abmeldefunktion */
export function onLanguageChange(callback) {
  i18next.on('languageChanged', callback);
  return () => i18next.off('languageChanged', callback);
}

i18next.on('languageChanged', (lng) => { document.documentElement.lang = lng; });

/** Statisches Markup mit data-i18n / data-i18n-attr übersetzen */
export function translateDom(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    });
  });
}
