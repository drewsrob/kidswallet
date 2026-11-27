// components/HelpButton.js – Info-Icon (ⓘ), das den Zweck eines Bereichs erklärt

import { icon } from '../icons.js';
import { getHelpTopic, helpButtonLabel } from '../helpTopics.js';
import { escapeHtml } from '../utils.js';

/**
 * @param {string} key  Hilfethema aus helpTopics.js
 * @returns {string} HTML; geöffnet wird per Delegation in InfoDialog.js (data-help)
 */
export function helpButton(key) {
  const help = getHelpTopic(key);
  if (!help) return '';
  return /* html */`<button type="button" class="help-btn" data-help="${key}"
    aria-label="${escapeHtml(helpButtonLabel(help.title))}" aria-haspopup="dialog">${icon('info', { size: 20 })}</button>`;
}
