// security.js – Optionaler PIN-Schutz: Zustand für Verwaltung und kritische Aktionen
//
// Ohne aktive PIN ist die Verwaltung frei zugänglich und kritische Aktionen werden
// ohne PIN-Abfrage ausgeführt. Maßgeblich ist der beim Start geladene App-State.

import { getState, setState } from './state.js';

export function isPinEnabled() {
  return getState().settings?.pinEnabled === true;
}

/** Verwaltung zugänglich: ohne PIN-Schutz immer, sonst nach dem Entsperren */
export function isAdminUnlocked() {
  return !isPinEnabled() || getState().adminAuthenticated;
}

export function setPinEnabled(enabled) {
  setState({ settings: { ...getState().settings, pinEnabled: enabled, pinMigrationPending: false } });
}
