// components/TransactionList.js – Wiederverwendbare Buchungsliste (Dashboard & Alle Buchungen)
import './TransactionList.css';
import { formatCurrency, formatRelativeDate, getDayNames } from '../utils.js';
import { parseBlocks, render } from '../template.js';
import { t } from '../i18n.js';
import { toCents } from '../finance.js';
import html from './TransactionList.html?raw';

const blocks = parseBlocks(html);

// tone: pos = Statusfarbe Grün, neg = Statusfarbe Rot, accent = Akzentfarbe des Kindes
// Beschriftungen: transaction.kinds.<kind>.label / .generic
const KINDS = {
  earn:      { icon: 'plus-circle',  tone: 'pos' },
  spend:     { icon: 'minus-circle', tone: 'neg' },
  allowance: { icon: 'coin',         tone: 'accent' },
  initial:   { icon: 'gift',         tone: 'accent' },
  goal:      { icon: 'target',       tone: 'accent' },
  correction:{ icon: 'edit',         tone: 'accent' },
  advance:   { icon: 'coin',         tone: 'accent' },
  loan_fee:  { icon: 'minus-circle', tone: 'neg' },
  debt_repayment: { icon: 'exchange', tone: 'accent' },
};

// Ältere Datenstände enthalten deutsche Standardtexte; sie werden wie leere Beschreibungen behandelt.
// 'grundbetrag': frühere Bezeichnung des Startguthabens
const GENERIC_DESCRIPTIONS = new Set(['', 'einnahme', 'ausgabe', 'grundbetrag', 'startguthaben', 'manuelle buchung', 'manuelle einnahme', 'manuelle ausgabe', 'taschengeld']);
const LEGACY_WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const LEGACY_ALLOWANCE = /^Taschengeld \((?:(So|Mo|Di|Mi|Do|Fr|Sa)|(\d{1,2})\. des Monats)\)$/;
const LEGACY_PURCHASE = /^Gekauft: (.+)$/;

function kindOf(tx) {
  switch (tx.type) {
    case 'advance':
    case 'loan_fee':
    case 'debt_repayment': return tx.type;
    case 'allowance':       return 'allowance';
    case 'initial':         return 'initial';
    case 'goal_purchase':
    case 'goal_allocation': return 'goal';
    case 'correction':      return 'correction';
    default:                return tx.amount < 0 ? 'spend' : 'earn';
  }
}

/** Zahltag einer Taschengeld-Buchung (neu: tx.schedule, alt: aus deutschem Text gelesen) */
function allowanceSchedule(tx, desc) {
  if (tx.schedule) return tx.schedule;
  const m = LEGACY_ALLOWANCE.exec(desc);
  if (!m) return null;
  return m[1] ? { frequency: 'weekly', dayOfWeek: LEGACY_WEEKDAYS.indexOf(m[1]) } : { frequency: 'monthly', dayOfMonth: Number(m[2]) };
}

function titleOf(tx, kindKey, desc) {
  if (['advance', 'loan_fee', 'debt_repayment'].includes(kindKey)) {
    return t(tx.migration ? 'finance.legacyAdvance' : `finance.types.${kindKey}`);
  }
  const generic = t(`transaction.kinds.${kindKey}.generic`);
  if (kindKey === 'allowance') {
    const s = allowanceSchedule(tx, desc);
    if (s?.frequency === 'weekly') return t('transaction.allowanceWeekly', { day: getDayNames('short')[s.dayOfWeek] });
    if (s?.frequency === 'monthly') return t('transaction.allowanceMonthly', { day: s.dayOfMonth });
  }
  if (tx.type === 'goal_purchase' && desc) {
    return t('transaction.goalPurchase', { name: LEGACY_PURCHASE.exec(desc)?.[1] ?? desc });
  }
  return GENERIC_DESCRIPTIONS.has(desc.toLowerCase()) ? generic : desc;
}

/** Buchung in eine Anzeige-Struktur übersetzen (Typ, Titel, Vorzeichen, Datum). */
export function describeTransaction(tx, currency) {
  const kindKey = kindOf(tx);
  const desc = String(tx.description ?? '').trim();
  const title = titleOf(tx, kindKey, desc);
  const financial = ['advance', 'loan_fee', 'debt_repayment'].includes(kindKey);
  const label = t(financial ? `finance.types.${kindKey}` : `transaction.kinds.${kindKey}.label`);
  // Typ nur zusätzlich anzeigen, wenn er nicht schon im Titel steht
  const showLabel = !title.toLowerCase().includes(label.toLowerCase());
  const negative = tx.amount < 0;

  return {
    ...KINDS[kindKey],
    label,
    title,
    showLabel,
    date: tx.date,
    dateLabel: formatRelativeDate(tx.date),
    amountClass: negative ? 'amount-negative' : 'amount-positive',
    amountText: `${negative ? '\u2212' : '+'}${formatCurrency(Math.abs(tx.amount), currency)}`,
    detail: financial && tx.debtAfter ? t('finance.debtAfter', {
      amount: formatCurrency((toCents(tx.debtAfter.principal) + toCents(tx.debtAfter.fees)) / 100, currency),
    }) : tx.type === 'goal_purchase' && tx.plannedAmount
      ? t('goal.plannedPriceDetail', { amount: formatCurrency(tx.plannedAmount, currency) }) : '',
    groupId: tx.groupId ?? '',
    transactionId: tx.id,
  };
}

/**
 * @param {object} [opts]
 * @param {'cards'|'rows'} [opts.variant]  'rows': Listenzeilen für die Einbettung in eine Card
 */
export function renderTransactionList(transactions, currency, label = t('transaction.listLabel'), { variant = 'cards' } = {}) {
  const items = transactions.map(tx => describeTransaction(tx, currency));
  const className = variant === 'rows' ? 'transactions-list transactions-list--rows' : 'transactions-list';
  return render(blocks.transactionList, { items, label, className });
}