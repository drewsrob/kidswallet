import { DomainError } from './domain-error.js';

export const DEFAULT_FINANCIAL_RULES = Object.freeze({
  allowAdvances: false,
  maxDebt: 10,
  feeModel: 'none',
  fixedFee: 0.5,
  repaymentPercent: 10,
});

export const toCents = amount => Math.round(amount * 100);
const money = cents => cents / 100;
const isMoney = value => typeof value === 'number' && Number.isFinite(value)
  && value >= 0 && value <= 99999 && Math.abs(value * 100 - toCents(value)) < 1e-7;

export function validateFinancialRules(rules) {
  if (!rules || typeof rules.allowAdvances !== 'boolean'
    || !['none', 'fixed', 'interest'].includes(rules.feeModel)
    || !isMoney(rules.maxDebt) || (rules.allowAdvances && rules.maxDebt === 0)
    || !isMoney(rules.fixedFee)
    || typeof rules.repaymentPercent !== 'number' || !Number.isFinite(rules.repaymentPercent)
    || rules.repaymentPercent < 0 || rules.repaymentPercent > 100
    || Math.abs(rules.repaymentPercent * 100 - Math.round(rules.repaymentPercent * 100)) > 1e-7) {
    throw new DomainError('invalidFinancialRules');
  }
  return { ...DEFAULT_FINANCIAL_RULES, ...rules };
}

export function getFinancialStatus(child) {
  const rules = child.financialRules ?? DEFAULT_FINANCIAL_RULES;
  const principal = child.debt?.principal ?? Math.max(0, -child.balance);
  const fees = child.debt?.fees ?? 0;
  const totalDebt = money(toCents(principal) + toCents(fees));
  const availableBalance = Math.max(0, child.balance);
  const openingFee = totalDebt === 0 && rules.feeModel === 'fixed' ? rules.fixedFee : 0;
  return {
    availableBalance,
    principal,
    fees,
    totalDebt,
    netBalance: money(toCents(availableBalance) - toCents(totalDebt)),
    advanceActive: totalDebt > 0,
    allowAdvances: rules.allowAdvances,
    maxDebt: rules.maxDebt,
    feeModel: rules.feeModel,
    fixedFee: rules.feeModel === 'fixed' ? rules.fixedFee : 0,
    // 'percent': automatische Tilgung mit festem Anteil; 'full': Taschengeld tilgt, soweit es reicht
    repaymentMode: rules.feeModel === 'interest' ? 'percent' : 'full',
    repaymentPercent: rules.feeModel === 'interest' ? rules.repaymentPercent : 100,
    remainingAdvance: rules.allowAdvances
      ? money(Math.max(0, toCents(rules.maxDebt) - toCents(totalDebt) - toCents(openingFee))) : 0,
  };
}

/**
 * Wirkung einer automatischen Taschengeldzahlung auf Guthaben und Schulden – dieselbe
 * Rechnung wie beim Buchen, damit Vorschau (z. B. Kinderansicht) und Buchung übereinstimmen.
 */
export function previewAllowanceRepayment(child, amount) {
  const status = getFinancialStatus(child);
  const repayment = Math.min(toCents(status.totalDebt),
    Math.round(toCents(amount) * Math.round(status.repaymentPercent * 100) / 10000));
  const feesRepaid = Math.min(repayment, toCents(status.fees));
  return {
    allowance: amount,
    repayment: money(repayment),
    feesRepaid: money(feesRepaid),
    principalRepaid: money(repayment - feesRepaid),
    credited: money(toCents(amount) - repayment),
    debtAfter: money(toCents(status.totalDebt) - repayment),
  };
}

/**
 * Verlauf des aktuellen Vorschussvorgangs (seit die Schuld zuletzt bei 0 lag):
 * insgesamt geliehen (Vorschüsse + Gebühren) und bereits zurückgezahlt.
 */
export function getDebtProgress(transactions) {
  const movements = transactions
    .filter(tx => tx.debtAfter && (tx.principalChange || tx.feeChange))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  let borrowed = 0;
  let repaid = 0;
  for (const tx of movements) {
    const change = toCents(tx.principalChange ?? 0) + toCents(tx.feeChange ?? 0);
    const debtBefore = toCents(tx.debtAfter.principal) + toCents(tx.debtAfter.fees) - change;
    if (debtBefore <= 0) {
      borrowed = 0;
      repaid = 0;
    }
    if (change > 0) borrowed += change;
    else repaid -= change;
  }
  return { borrowed: money(borrowed), repaid: money(repaid) };
}

/** Status of the current debt episode: total = open + repaid (fees included). */
export function getRepaymentProgress(child, transactions) {
  const open = getFinancialStatus(child).totalDebt;
  if (open <= 0) return { open: 0, repaid: 0, total: 0, percent: 0 };
  const { repaid } = getDebtProgress(transactions);
  const total = toCents(open) + toCents(repaid);
  return { open, repaid, total: money(total), percent: Math.floor(toCents(repaid) / total * 100) };
}

/** Every movement records its cash effect and the two debt components separately. */
export function bookFinanceTransaction(data, child, {
  amount, type, date = new Date().toISOString(), groupId = crypto.randomUUID(),
  principalChange = 0, feeChange = 0, cashChange = amount, ...details
}) {
  const tx = {
    ...details, id: crypto.randomUUID(), childId: child.id, type, amount,
    description: details.description ?? '', date, groupId, cashChange, principalChange, feeChange,
  };
  child.balance = money(toCents(child.balance) + toCents(cashChange));
  child.debt.principal = money(toCents(child.debt.principal) + toCents(principalChange));
  child.debt.fees = money(toCents(child.debt.fees) + toCents(feeChange));
  tx.balanceAfter = child.balance;
  tx.debtAfter = { ...child.debt };
  data.transactions.push(tx);
  return tx;
}

export function migrateChildFinance(data, child) {
  let changed = false;
  if (!child.financialRules) {
    child.financialRules = { ...DEFAULT_FINANCIAL_RULES };
    changed = true;
  }
  if (!child.debt) {
    child.debt = { principal: 0, fees: 0 };
    if (child.balance < 0) {
      const amount = money(-toCents(child.balance));
      bookFinanceTransaction(data, child, {
        amount, type: 'advance', principalChange: amount, migration: 'legacy_negative_balance',
      });
    }
    changed = true;
  }
  return changed;
}

export function bookExpense(data, child, amount, details = {}) {
  const cents = toCents(amount);
  const shortfall = Math.max(0, cents - toCents(child.balance));
  const status = getFinancialStatus(child);
  const rules = child.financialRules;
  const fee = shortfall > 0 && !status.advanceActive && rules.feeModel === 'fixed'
    ? toCents(rules.fixedFee) : 0;
  if (shortfall > 0) {
    if (!rules.allowAdvances) throw new DomainError('advancesDisabled');
    if (toCents(status.totalDebt) + shortfall + fee > toCents(rules.maxDebt)) {
      throw new DomainError('debtLimitExceeded');
    }
  }
  const groupId = crypto.randomUUID();
  const date = new Date().toISOString();
  if (shortfall > 0) {
    bookFinanceTransaction(data, child, {
      amount: money(shortfall), type: 'advance', principalChange: money(shortfall), groupId, date,
    });
  }
  if (fee > 0) {
    bookFinanceTransaction(data, child, {
      amount: -money(fee), type: 'loan_fee', cashChange: 0, feeChange: money(fee), groupId, date,
    });
  }
  return bookFinanceTransaction(data, child, { ...details, amount: -money(cents), groupId, date });
}

export function bookRepayment(data, child, amount, details = {}) {
  const cents = toCents(amount);
  const status = getFinancialStatus(child);
  if (cents <= 0 || cents > toCents(child.balance) || cents > toCents(status.totalDebt)) {
    throw new DomainError('invalidRepayment');
  }
  const fees = Math.min(cents, toCents(child.debt.fees));
  return bookFinanceTransaction(data, child, {
    ...details, type: 'debt_repayment', amount: -money(cents),
    feeChange: -money(fees), principalChange: -money(cents - fees),
  });
}

export function bookAllowance(data, child, amount, details) {
  const status = getFinancialStatus(child);
  const { repayment } = previewAllowanceRepayment(child, amount);
  const transaction = bookFinanceTransaction(data, child, { ...details, amount, type: 'allowance' });
  if (repayment > 0) {
    bookRepayment(data, child, repayment, {
      groupId: transaction.groupId, date: transaction.date, sourceTransactionId: transaction.id,
      repaymentPercent: status.repaymentPercent,
    });
  }
  return transaction;
}

// Financing transfers are neither earned income nor consumption.
export function isFinancingTransfer(tx) {
  return tx.type === 'advance' || tx.type === 'debt_repayment';
}
