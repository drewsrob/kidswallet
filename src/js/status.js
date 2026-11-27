// status.js – Berechnung von Statusinformationen (nächste Auszahlung, Ziel-Status, Dashboard-Hinweise)
import { calcPercent, formatCurrency } from './utils.js';
import { t, getLocale } from './i18n.js';

// Ab diesem Fortschritt (in %) gilt ein Ziel als „fast erreicht“
export const GOAL_ALMOST_THRESHOLD = 80;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY_MS);
}

function isDueOn(allowance, d) {
  return allowance.frequency === 'weekly'
    ? allowance.dayOfWeek === d.getDay()
    : allowance.dayOfMonth === d.getDate();
}

/**
 * Nächster Auszahlungstag einer aktiven Regel (heute zählt, solange heute noch nicht ausgezahlt wurde).
 * @returns {Date|null}
 */
export function getNextPayoutDate(allowance, now = new Date()) {
  if (!allowance?.isActive) return null;
  const today = startOfDay(now);
  const todayStr = localDateStr(today);
  let d = allowance.lastExecuted && allowance.lastExecuted.slice(0, 10) >= todayStr
    ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    : today;
  if (allowance.activeSince && allowance.activeSince > localDateStr(d)) {
    const [y, m, day] = allowance.activeSince.split('-').map(Number);
    d = new Date(y, m - 1, day);
  }
  // Monatliche Regeln am 29.–31. greifen nicht in jedem Monat – daher großzügig suchen
  for (let i = 0; i < 400; i++, d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    if (isDueOn(allowance, d)) return d;
  }
  return null;
}

/** Früheste nächste Auszahlung über alle aktiven Regeln. */
export function getNextPayout(allowances, now = new Date()) {
  const dates = allowances.map(a => getNextPayoutDate(a, now)).filter(Boolean);
  if (!dates.length) return null;
  const date = dates.reduce((min, d) => (d < min ? d : min));
  const inDays = daysBetween(now, date);
  const dateLabel = new Intl.DateTimeFormat(getLocale(), { weekday: 'long', day: '2-digit', month: '2-digit' }).format(date);
  const relLabel = inDays === 0 ? t('format.relToday')
    : inDays === 1 ? t('format.relTomorrow')
      : t('format.relInDays', { count: inDays });
  return { date, inDays, dateLabel, relLabel, text: t('allowance.nextPayout', { date: dateLabel, relative: relLabel }) };
}

/**
 * Status eines Sparziels relativ zum Guthaben.
 * @returns {{ state: 'reached'|'almost'|'progress', pct: number, rest: number, text: string }}
 */
export function getGoalStatus(goal, balance, currency = '€') {
  const pct = Math.min(99, calcPercent(Math.min(balance, goal.targetAmount), goal.targetAmount));
  const rest = Math.max(0, +(goal.targetAmount - balance).toFixed(2));
  if (rest <= 0) return { state: 'reached', pct: 100, rest: 0, text: t('goal.reached') };
  const restLabel = formatCurrency(rest, currency);
  if (pct >= GOAL_ALMOST_THRESHOLD) return { state: 'almost', pct, rest, text: t('goal.almost', { rest: restLabel }) };
  return { state: 'progress', pct, rest, text: t('goal.remaining', { rest: restLabel }) };
}

/**
 * Sparziel-Zusammenfassung für die Kinderkarte: Anzahl aktiver Ziele plus das wichtigste Ziel
 * (gleiche Reihenfolge wie in der Detailansicht: kleinster Zielbetrag = am nächsten am Ziel).
 * @returns {null | { count: number, countText: string, goal: object, status: ReturnType<typeof getGoalStatus>, progressText: string, summary: string }}
 */
export function getChildCardGoal(goals, balance, currency = '€') {
  const active = (goals ?? []).filter(g => !g.purchasedAt && g.targetAmount > 0);
  if (!active.length) return null;
  const goal = [...active].sort((a, b) => a.targetAmount - b.targetAmount)[0];
  const status = getGoalStatus(goal, balance, currency);
  const countText = t('goal.activeCount', { count: active.length });
  const progressText = status.state === 'reached' ? t('goal.reached') : t('format.percent', { value: status.pct });
  const summary = t('goal.cardSummary', { countText, name: goal.name, progress: progressText });
  return { count: active.length, countText, goal, status, progressText, summary };
}

/**
 * Wichtigste Hinweise für das Dashboard eines Kindes (nach Priorität, begrenzt).
 * tone: 'success' | 'info' | 'attention'
 */
export function getDashboardStatuses({ childId, allowances, goals, balance, now = new Date(), limit = 2 }) {
  const statuses = [];
  const todayStr = localDateStr(now);

  const reached = goals.filter(g => !g.purchasedAt && balance >= g.targetAmount);
  if (reached.length) {
    statuses.push({
      tone: 'success',
      icon: 'trophy',
      text: reached.length === 1
        ? t('goal.reachedNamed', { name: reached[0].name })
        : t('goal.reachedCount', { count: reached.length }),
      href: `#/wallet/${childId}/goals`,
    });
  }

  const active = allowances.filter(a => a.isActive);
  if (active.some(a => a.lastExecuted === todayStr)) {
    statuses.push({ tone: 'success', icon: 'gift', text: t('allowance.payoutPaidToday') });
  } else {
    const next = getNextPayout(active, now);
    if (next?.inDays === 0) statuses.push({ tone: 'info', icon: 'gift', text: t('allowance.payoutToday') });
    if (next?.inDays === 1) statuses.push({ tone: 'info', icon: 'gift', text: t('allowance.payoutTomorrow') });
  }

  if (goals.length === 1 && goals[0].createdAt
      && localDateStr(new Date(goals[0].createdAt)) === todayStr) {
    statuses.push({ tone: 'info', icon: 'target',     text: t('goal.firstCreated') });
  }

  if (allowances.length === 0) {
        statuses.push({ tone: 'attention', icon: 'clock', text: t('allowance.noRule') });
  } else if (active.length === 0) {
        statuses.push({ tone: 'attention', icon: 'clock', text: t('allowance.pausedShort') });
  }

  return statuses.slice(0, limit);
}

/**
 * Kurzinfos für die Hero-Card – nur Werte, für die Daten vorliegen.
 * @returns {{ icon: string, text: string }[]}
 */
export function getHeroFacts({ goals, transactions, now = new Date() }) {
  const facts = [];

  const activeGoals = goals.filter(g => !g.purchasedAt).length;
  if (activeGoals > 0) facts.push({ icon: 'target', text: t('goal.activeCount', { count: activeGoals }) });

  // Woche beginnt am Montag
  const weekCount = transactions.filter(tx => new Date(tx.date) >= startOfWeek(now)).length;
  if (weekCount > 0) facts.push({ icon: 'list', text: t('dashboard.weekTransactions', { count: weekCount }) });

  return facts;
}

function startOfWeek(now) {
  const d = startOfDay(now);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
