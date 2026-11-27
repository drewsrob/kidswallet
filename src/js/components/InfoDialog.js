// components/InfoDialog.js – Kontexthilfe: kurzer Info-Dialog (mobil als Bottom-Sheet)

import { Modal } from './Modal.js';
import { getHelpTopic } from '../helpTopics.js';
import { t } from '../i18n.js';
import { escapeHtml } from '../utils.js';

/**
 * Info-Dialog zu einem Bereich öffnen.
 * @param {string} key  Hilfethema aus helpTopics.js
 */
export function openHelp(key) {
  const help = getHelpTopic(key);
  if (!help?.paragraphs.length) return Promise.resolve('close');
  return new Modal({
    title: help.title,
    icon: help.icon,
    tone: help.tone,
    sheet: true,
    describeContent: true,
    content: `<div class="help-info">${help.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('')}${help.terms.length
      ? `<dl class="help-terms">${help.terms.map(({ term, text }) => `<dt>${escapeHtml(term)}</dt><dd>${escapeHtml(text)}</dd>`).join('')}</dl>`
      : ''}</div>`,
    actions: [{ label: t('help.close'), value: 'close', variant: 'primary' }],
  }).open();
}

// Alle Fragezeichen (auch in Dialogen und neu gerenderten Ansichten) per Delegation bedienen
document.addEventListener('click', (e) => {
  const btn = e.target.closest?.('[data-help]');
  if (!btn) return;
  e.preventDefault();
  openHelp(btn.dataset.help);
});
