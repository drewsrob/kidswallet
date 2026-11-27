// errors.js – sprachneutrale Fachfehler und verständliche Fehlermeldungen
//
// Die Datenschicht wirft DomainError mit einem i18n-Schlüssel statt fertigem Text.
// Erst beim Anzeigen wird die Meldung in die aktuelle Sprache übersetzt.

import { t } from './i18n.js';
import { DomainError } from './domain-error.js';
export { DomainError } from './domain-error.js';

/**
 * Fehler in eine verständliche Meldung übersetzen.
 * Fachliche Fehler werden als übersetztes Detail angehängt, technische Fehler nie direkt angezeigt.
 * @param {unknown} err
 * @param {string} fallback  Bereits übersetzte, aktionsbezogene Meldung, z. B. t('transaction.bookingFailed')
 * @returns {string}
 */
export function describeError(err, fallback) {
  if (err?.name === 'QuotaExceededError') return `${fallback} ${t('errors.storageFull')}`;
  if (err instanceof DomainError) {
    const detail = t(`errors.${err.code}`, err.params).replace(/[.!]$/, '');
    return t('errors.withDetail', { message: fallback, detail });
  }
  return fallback;
}
