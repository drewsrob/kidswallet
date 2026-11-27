// theme.js – Farbschema „System“, „Hell“ oder „Dunkel“ (gespeichert in localStorage)
//
// Die Darstellung selbst erfolgt rein per CSS: data-theme="light" / "dark" erzwingt ein Schema,
// ohne Attribut folgt die App über @media (prefers-color-scheme) live dem Betriebssystem.
// JavaScript speichert nur die Auswahl und setzt das Attribut.

const THEME_KEY = 'kidswallet-theme';

export const THEME_PREFERENCES = ['system', 'light', 'dark'];

/** Gespeicherte Auswahl – ohne gültigen Eintrag gilt „system“ */
export function getThemePreference() {
  const stored = localStorage.getItem(THEME_KEY);
  return THEME_PREFERENCES.includes(stored) ? stored : 'system';
}

export function applyThemePreference(preference) {
  const root = document.documentElement;
  if (preference === 'light' || preference === 'dark') root.setAttribute('data-theme', preference);
  else root.removeAttribute('data-theme');
}

export function setThemePreference(preference) {
  if (!THEME_PREFERENCES.includes(preference)) throw new Error(`Unbekanntes Farbschema: ${preference}`);
  applyThemePreference(preference);
  localStorage.setItem(THEME_KEY, preference);
}

export function restoreTheme() {
  applyThemePreference(getThemePreference());
}
