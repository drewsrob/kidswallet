// helpTopics.js – Kontexthilfe: Darstellung je Thema (Texte liegen in i18n unter help.<thema>)

import { t, hasKey } from './i18n.js';

/** Symbol aus icons.js und optionaler Farbton je Hilfethema */
export const HELP_TOPICS = {
  home: { icon: 'users' },
  wallet: { icon: 'coin' },
  allowances: { icon: 'clock' },
  goals: { icon: 'target' },
  activity: { icon: 'trending-up' },
  transactions: { icon: 'list' },
  earn: { icon: 'plus', tone: 'earn' },
  spend: { icon: 'minus', tone: 'spend' },
  admin: { icon: 'shield' },
  children: { icon: 'users' },
  settings: { icon: 'settings' },
  appearance: { icon: 'palette' },
  currency: { icon: 'exchange' },
  pin: { icon: 'key' },
  theme: { icon: 'moon' },
  accentColor: { icon: 'palette' },
  language: { icon: 'globe' },
  backup: { icon: 'shield' },
  finance: { icon: 'shield' },
};

/**
 * Übersetztes Hilfethema oder null, falls unbekannt
 * @param {string} key
 * @returns {{ title: string, paragraphs: string[], terms: { term: string, text: string }[], icon: string, tone?: string } | null}
 */
export function getHelpTopic(key) {
  const meta = HELP_TOPICS[key];
  if (!meta || !hasKey(`help.${key}.title`)) return null;
  const paragraphs = t(`help.${key}.paragraphs`, { returnObjects: true });
  const terms = hasKey(`help.${key}.terms`) ? t(`help.${key}.terms`, { returnObjects: true }) : [];
  return {
    ...meta,
    title: t(`help.${key}.title`),
    paragraphs: Array.isArray(paragraphs) ? paragraphs : [],
    terms: Array.isArray(terms) ? terms : [],
  };
}

/** Screenreader-Beschriftung des Info-Buttons */
export function helpButtonLabel(title) {
  return t('help.buttonLabel', { title });
}
