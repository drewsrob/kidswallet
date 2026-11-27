import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../src/js/api-local.js';
import { DEFAULT_FINANCIAL_RULES, bookAllowance, getDebtProgress, getFinancialStatus, getRepaymentProgress, previewAllowanceRepayment, toCents } from '../src/js/finance.js';
import { getTotals, groupByMonth, getActivitySeries } from '../src/js/stats.js';
import { createBackup, parseBackup, restoreBackup } from '../src/js/services/BackupService.js';
import { readFileSync } from 'node:fs';

const key = 'kidswallet-data';
const stored = () => JSON.parse(localStorage.getItem(key));
const persistedChild = id => stored().children.find(c => c.id === id);
const rules = overrides => ({ ...DEFAULT_FINANCIAL_RULES, allowAdvances: true, ...overrides });
const createMila = balance => api.createChild({ name: 'Mila', balance });
const expectCode = (action, code) => assert.throws(action, error => error.code === code);
const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: k => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, String(v)),
    removeItem: k => values.delete(k),
  };
});

test('Mila: advances are opt-in and rejected expenses leave storage unchanged', async () => {
  const mila = await createMila(2);
  const before = localStorage.getItem(key);
  expectCode(() => api.addTransaction(mila.id, { amount: -5 }), 'advancesDisabled');
  assert.equal(localStorage.getItem(key), before);
  await api.addTransaction(mila.id, { amount: -2 });
  assert.equal(persistedChild(mila.id).balance, 0);
});

test('hard limit includes the opening fee, including exact cent boundaries', async () => {
  const mila = await createMila(0);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'fixed', fixedFee: 0.5 }));
  const before = localStorage.getItem(key);
  expectCode(() => api.addTransaction(mila.id, { amount: -9.75 }), 'debtLimitExceeded');
  assert.equal(localStorage.getItem(key), before);
  await api.addTransaction(mila.id, { amount: -9.5 });
  assert.deepEqual(persistedChild(mila.id).debt, { principal: 9.5, fees: 0.5 });
  const atLimit = localStorage.getItem(key);
  expectCode(() => api.addTransaction(mila.id, { amount: -0.01 }), 'debtLimitExceeded');
  assert.equal(localStorage.getItem(key), atLimit);
});

test('no-fee advance accepts -10 but not -10.01 and uses available funds first', async () => {
  const mila = await createMila(2);
  await api.updateFinancialRules(mila.id, rules({}));
  expectCode(() => api.addTransaction(mila.id, { amount: -12.01 }), 'debtLimitExceeded');
  await api.addTransaction(mila.id, { amount: -12 });
  assert.equal(persistedChild(mila.id).balance, 0);
  assert.equal(persistedChild(mila.id).debt.principal, 10);
  assert.deepEqual((await api.getTransactions(mila.id)).filter(tx => tx.type === 'advance').map(tx => tx.amount), [10]);
});

test('debt progress counts borrowed and repaid amounts of the current advance only', async () => {
  const mila = await createMila(5);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'fixed' }));
  await api.addTransaction(mila.id, { amount: -8 });
  await api.addTransaction(mila.id, { amount: 4 });
  await api.repayDebt(mila.id, { amount: 3.5 });
  assert.deepEqual(getDebtProgress(await api.getTransactions(mila.id)), { borrowed: 3.5, repaid: 3.5 });
  await api.addTransaction(mila.id, { amount: -2 });
  await api.addTransaction(mila.id, { amount: 1 });
  await api.repayDebt(mila.id, { amount: 0.75 });
  assert.deepEqual(getDebtProgress(await api.getTransactions(mila.id)), { borrowed: 2, repaid: 0.75 });
  assert.equal(getFinancialStatus(persistedChild(mila.id)).totalDebt, 1.25);
  assert.deepEqual(getRepaymentProgress(persistedChild(mila.id), await api.getTransactions(mila.id)),
    { open: 1.25, repaid: 0.75, total: 2, percent: 37 });
  await api.addTransaction(mila.id, { amount: 2 });
  await api.repayDebt(mila.id, { amount: 1.25 });
  assert.deepEqual(getRepaymentProgress(persistedChild(mila.id), await api.getTransactions(mila.id)),
    { open: 0, repaid: 0, total: 0, percent: 0 });
});

test('fee is charged once per debt episode and can recur only after full repayment', async () => {
  const mila = await createMila(5);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'fixed' }));
  await api.addTransaction(mila.id, { amount: -8 });
  await api.addTransaction(mila.id, { amount: -1 });
  await api.addTransaction(mila.id, { amount: 5 });
  assert.equal(persistedChild(mila.id).debt.principal, 4);
  await api.repayDebt(mila.id, { amount: 0.25 });
  assert.deepEqual(persistedChild(mila.id).debt, { principal: 4, fees: 0.25 });
  await api.repayDebt(mila.id, { amount: 4.25 });
  await api.addTransaction(mila.id, { amount: -1 });
  assert.equal((await api.getTransactions(mila.id)).filter(tx => tx.type === 'loan_fee').length, 2);
  assert.deepEqual(persistedChild(mila.id).debt, { principal: 0.5, fees: 0.5 });
});

test('automatic 10% repayment actually reduces 5 euros debt to 4.75 and credits 2.25', async () => {
  const mila = await createMila(0);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'interest' }));
  await api.addTransaction(mila.id, { amount: -5 });
  await api.createAllowance(mila.id, { amount: 2.5, frequency: 'weekly', dayOfWeek: new Date().getDay() });
  assert.equal((await api.processAllowances()).processed, 0, 'due allowance is booked when the rule is created');
  assert.equal(persistedChild(mila.id).balance, 2.25);
  assert.equal(persistedChild(mila.id).debt.principal, 4.75);
  const txs = await api.getTransactions(mila.id);
  const payment = txs.find(tx => tx.type === 'allowance');
  const repayment = txs.find(tx => tx.type === 'debt_repayment');
  assert.equal(payment.amount, 2.5);
  assert.equal(repayment.amount, -0.25);
  assert.equal(repayment.principalChange, -0.25);
  assert.equal(repayment.sourceTransactionId, payment.id);
  assert.equal(repayment.groupId, payment.groupId);
  assert.equal(repayment.date, payment.date);
  const before = localStorage.getItem(key);
  assert.equal((await api.processAllowances()).processed, 0);
  assert.equal(localStorage.getItem(key), before);
});

test('allowance due today is booked immediately when a child or rule is created, exactly once', async () => {
  const today = new Date().getDay();
  const jonte = await api.createChild({ name: 'Jonte', balance: 0, allowance: { amount: 2.5, dayOfWeek: today } });
  assert.equal(persistedChild(jonte.id).balance, 2.5);

  const alex = await createMila(0);
  await api.createAllowance(alex.id, { amount: 1, frequency: 'weekly', dayOfWeek: (today + 1) % 7 });
  assert.equal(persistedChild(alex.id).balance, 0);
  const [rule] = await api.getAllowances(alex.id);
  await api.updateAllowance(rule.id, { amount: 1, frequency: 'weekly', dayOfWeek: today });
  assert.equal(persistedChild(alex.id).balance, 1);

  assert.equal((await api.processAllowances()).processed, 0);
  assert.equal((await api.getTransactions(jonte.id)).filter(tx => tx.type === 'allowance').length, 1);
});

test('repayment is capped at 10 cents remaining debt; surplus stays available', async () => {
  const mila = await createMila(0);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'interest' }));
  await api.addTransaction(mila.id, { amount: -0.1 });
  await api.createAllowance(mila.id, { amount: 2.5, frequency: 'weekly', dayOfWeek: new Date().getDay() });
  await api.processAllowances();
  assert.equal(persistedChild(mila.id).balance, 2.4);
  assert.deepEqual(persistedChild(mila.id).debt, { principal: 0, fees: 0 });
  assert.equal((await api.getTransactions(mila.id)).find(tx => tx.type === 'debt_repayment').amount, -0.1);
});

test('0%, fractional percentages, rounding, 100%, and no debt produce correct cash and debt', () => {
  for (const [percent, amount, expected] of [[0, 2.5, 0], [10, 0.05, 0.01], [33.33, 2.5, 0.83], [100, 2.5, 2.5]]) {
    const child = { id: 'mila', balance: 0, debt: { principal: 5, fees: 0 }, financialRules: rules({ feeModel: 'interest', repaymentPercent: percent }) };
    const data = { transactions: [] };
    bookAllowance(data, child, amount, {});
    assert.equal(child.balance, (toCents(amount) - toCents(expected)) / 100);
    assert.equal(child.debt.principal, (500 - toCents(expected)) / 100);
    assert.equal(data.transactions.filter(tx => tx.type === 'debt_repayment').length, expected > 0 ? 1 : 0);
  }
  const child = { id: 'mila', balance: 0, debt: { principal: 0, fees: 0 }, financialRules: rules({ feeModel: 'interest' }) };
  const data = { transactions: [] };
  bookAllowance(data, child, 2.5, {});
  assert.equal(child.balance, 2.5);
  assert.equal(data.transactions.length, 1);
});

test('child-view data: status explains debt and the allowance preview matches the actual booking', () => {
  const make = () => ({ id: 'mila', balance: 2.25, debt: { principal: 5, fees: 0.5 }, financialRules: rules({ feeModel: 'interest', repaymentPercent: 10 }) });
  const status = getFinancialStatus(make());
  assert.equal(status.totalDebt, 5.5);
  assert.equal(status.fees, 0.5);
  assert.equal(status.netBalance, -3.25);
  assert.equal(status.repaymentMode, 'percent');
  assert.equal(status.repaymentPercent, 10);
  const child = make();
  const preview = previewAllowanceRepayment(child, 2.5);
  assert.deepEqual(preview, { allowance: 2.5, repayment: 0.25, feesRepaid: 0.25, principalRepaid: 0, credited: 2.25, debtAfter: 5.25 });
  bookAllowance({ transactions: [] }, child, 2.5, {});
  assert.equal(child.balance, 2.25 + preview.credited);
  assert.equal(getFinancialStatus(child).totalDebt, preview.debtAfter);
  assert.equal(getFinancialStatus({ ...make(), financialRules: rules({ feeModel: 'fixed' }) }).repaymentMode, 'full');
});

test('no-fee and fixed-fee models repay with full allowance; fees first, never charged again on payday', async () => {
  for (const model of ['none', 'fixed']) {
    const mila = await createMila(0);
    await api.updateFinancialRules(mila.id, rules({ feeModel: model }));
    await api.addTransaction(mila.id, { amount: -5 });
    await api.createAllowance(mila.id, { amount: 2.5, frequency: 'weekly', dayOfWeek: new Date().getDay() });
    await api.processAllowances();
    assert.equal(persistedChild(mila.id).balance, 0);
    assert.deepEqual(persistedChild(mila.id).debt, { principal: model === 'fixed' ? 3 : 2.5, fees: 0 });
    assert.equal((await api.getTransactions(mila.id)).filter(tx => tx.type === 'loan_fee').length, model === 'fixed' ? 1 : 0);
  }
});

test('repayment errors and rule changes cannot forgive debt or bypass the limit', async () => {
  const mila = await createMila(0);
  await api.updateFinancialRules(mila.id, rules({}));
  await api.addTransaction(mila.id, { amount: -5 });
  let before = localStorage.getItem(key);
  expectCode(() => api.repayDebt(mila.id, { amount: 1 }), 'invalidRepayment');
  expectCode(() => api.updateFinancialRules(mila.id, rules({ maxDebt: 4.99 })), 'debtLimitBelowOutstanding');
  assert.equal(localStorage.getItem(key), before);
  await api.updateFinancialRules(mila.id, rules({ allowAdvances: false }));
  assert.equal(persistedChild(mila.id).debt.principal, 5);
  expectCode(() => api.addTransaction(mila.id, { amount: -0.01 }), 'advancesDisabled');
  await api.addTransaction(mila.id, { amount: 10 });
  before = localStorage.getItem(key);
  expectCode(() => api.repayDebt(mila.id, { amount: 5.01 }), 'invalidRepayment');
  assert.equal(localStorage.getItem(key), before);
  await api.repayDebt(mila.id, { amount: 5 });
  assert.equal(persistedChild(mila.id).balance, 5);
  assert.equal(persistedChild(mila.id).debt.principal, 0);
});

test('invalid rules and non-cent or non-finite amounts do not write data', async () => {
  const mila = await createMila(2);
  const before = localStorage.getItem(key);
  for (const value of [NaN, Infinity, -Infinity, 0, 0.001, -0.001, -1.001]) {
    expectCode(() => api.addTransaction(mila.id, { amount: value }), 'invalidAmount');
  }
  for (const invalid of [{ maxDebt: 0 }, { fixedFee: -1 }, { repaymentPercent: 100.01 }, { feeModel: 'unknown' }]) {
    expectCode(() => api.updateFinancialRules(mila.id, rules(invalid)), 'invalidFinancialRules');
  }
  assert.equal(localStorage.getItem(key), before);
});

test('rules and debt are isolated per child', async () => {
  const mila = await createMila(0);
  const other = await api.createChild({ name: 'Alex', balance: 0 });
  await api.updateFinancialRules(mila.id, rules({}));
  await api.addTransaction(mila.id, { amount: -5 });
  expectCode(() => api.addTransaction(other.id, { amount: -1 }), 'advancesDisabled');
  assert.deepEqual(persistedChild(other.id).debt, { principal: 0, fees: 0 });
});

test('negative legacy balance migrates visibly and persistently exactly once, preserving net value', async () => {
  const mila = await createMila(0);
  const legacy = stored();
  const child = legacy.children[0];
  delete child.debt;
  delete child.financialRules;
  child.balance = -4.5;
  localStorage.setItem(key, JSON.stringify(legacy));
  const migrated = (await api.getChildren())[0];
  assert.equal(migrated.balance, 0);
  assert.equal(migrated.debt.principal, 4.5);
  assert.equal(migrated.financialStatus.netBalance, -4.5);
  const before = localStorage.getItem(key);
  await api.getState();
  assert.equal(localStorage.getItem(key), before);
  const txs = await api.getTransactions(mila.id);
  assert.equal(txs.length, 1);
  assert.equal(txs[0].migration, 'legacy_negative_balance');
  assert.equal(txs[0].amount, 4.5);
});

test('overdue allowances across multiple rules are booked chronologically and exactly once', async () => {
  const mila = await createMila(0);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'interest' }));
  await api.addTransaction(mila.id, { amount: -5 });
  const start = new Date();
  start.setDate(start.getDate() - 15);
  const data = stored();
  for (const [id, amount, day] of [['z', 2.5, 1], ['a', 1, 4]]) {
    data.allowances.push({ id, childId: mila.id, amount, frequency: 'weekly', dayOfWeek: day,
      createdAt: start.toISOString(), activeSince: localDate(start), lastExecuted: null, isActive: true });
  }
  localStorage.setItem(key, JSON.stringify(data));
  const result = await api.processAllowances();
  const payments = stored().transactions.filter(tx => tx.type === 'allowance');
  assert.ok(result.processed >= 4);
  assert.deepEqual(payments.map(tx => tx.date), payments.map(tx => tx.date).sort());
  const expectedRepayment = payments.reduce((sum, tx) => sum + Math.round(toCents(tx.amount) / 10), 0);
  assert.equal(toCents(persistedChild(mila.id).debt.principal), 500 - expectedRepayment);
  assert.equal((await api.processAllowances()).processed, 0);
});

test('journal reproduces cash and debt; statistics never count financing transfers twice', async () => {
  const mila = await createMila(2);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'fixed' }));
  await api.addTransaction(mila.id, { amount: -7 });
  await api.addTransaction(mila.id, { amount: 2.5 });
  await api.repayDebt(mila.id, { amount: 0.25 });
  const txs = await api.getTransactions(mila.id);
  const child = persistedChild(mila.id);
  assert.equal(txs.reduce((sum, tx) => sum + toCents(tx.cashChange ?? tx.amount), 0), toCents(child.balance));
  assert.equal(txs.reduce((sum, tx) => sum + toCents(tx.principalChange ?? 0), 0), toCents(child.debt.principal));
  assert.equal(txs.reduce((sum, tx) => sum + toCents(tx.feeChange ?? 0), 0), toCents(child.debt.fees));
  const totals = getTotals(txs);
  assert.equal(totals.income, 4.5);
  assert.equal(totals.expense, 7.5);
  assert.equal(totals.net, -3);
  assert.equal(totals.advances, 5);
  assert.equal(totals.fees, 0.5);
  assert.equal(totals.repayments, 0.25);
  assert.equal(totals.net, getFinancialStatus(child).netBalance);
  assert.equal(groupByMonth(txs)[0].repayments, 0.25);
  for (const range of ['1m', '6m']) {
    const series = getActivitySeries(txs, range);
    assert.equal(series.income, totals.income);
    assert.equal(series.expense, totals.expense);
    assert.equal(series.points.reduce((sum, point) => sum + toCents(point.repayments), 0), 25);
  }
});

test('version 2 backup round-trip retains financial history and rejects corrupted debt', async () => {
  const mila = await createMila(0);
  await api.updateFinancialRules(mila.id, rules({ feeModel: 'fixed' }));
  await api.addTransaction(mila.id, { amount: -5 });
  const backup = createBackup();
  assert.equal(backup.version, 2);
  const parsed = parseBackup(JSON.stringify(backup));
  restoreBackup(parsed);
  assert.deepEqual(persistedChild(mila.id), backup.data.children[0]);
  assert.deepEqual(await api.getTransactions(mila.id), backup.data.transactions);
  const corrupt = structuredClone(backup);
  corrupt.data.children[0].debt.fees = -1;
  expectCode(() => parseBackup(JSON.stringify(corrupt)), 'corrupt');
  const corruptTx = structuredClone(backup);
  corruptTx.data.transactions.find(tx => tx.type === 'advance').principalChange = 0;
  expectCode(() => parseBackup(JSON.stringify(corruptTx)), 'corrupt');
});

test('version 1 backup imports remain compatible and migrate negative balances without forgiveness', async () => {
  const mila = await createMila(0);
  const legacy = createBackup();
  legacy.version = 1;
  delete legacy.data.children[0].financialRules;
  delete legacy.data.children[0].debt;
  legacy.data.children[0].balance = -3;
  restoreBackup(parseBackup(JSON.stringify(legacy)));
  const state = await api.getState();
  assert.equal(state.children[0].financialStatus.netBalance, -3);
  assert.equal(state.children[0].financialRules.allowAdvances, false);
  assert.equal((await api.getTransactions(mila.id)).filter(tx => tx.type === 'advance').length, 1);
});

test('goal purchase books the actual price, uses advances when allowed and is rejected without coverage', async () => {
  const mila = await createMila(35);
  const helmet = await api.createGoal(mila.id, { name: 'Fahrradhelm', targetAmount: 35 });
  const before = localStorage.getItem(key);
  expectCode(() => api.updateGoal(helmet.id, { purchaseGoal: true, purchasePrice: 39 }), 'advancesDisabled');
  expectCode(() => api.updateGoal(helmet.id, { purchaseGoal: true, purchasePrice: 29.001 }), 'invalidAmount');
  assert.equal(localStorage.getItem(key), before);

  await api.updateGoal(helmet.id, { purchaseGoal: true, purchasePrice: 29 });
  assert.equal(persistedChild(mila.id).balance, 6);
  const purchase = (await api.getTransactions(mila.id)).find(tx => tx.type === 'goal_purchase');
  assert.equal(purchase.amount, -29);
  assert.equal(purchase.plannedAmount, 35);
  assert.equal(stored().goals[0].purchasePrice, 29);

  const jonas = await api.createChild({ name: 'Jonas', balance: 35 });
  await api.updateFinancialRules(jonas.id, rules({}));
  const bike = await api.createGoal(jonas.id, { name: 'Fahrradhelm', targetAmount: 35 });
  const { child } = await api.updateGoal(bike.id, { purchaseGoal: true, purchasePrice: 39 });
  assert.equal(child.balance, 0);
  assert.equal(child.financialStatus.totalDebt, 4);
  assert.deepEqual((await api.getTransactions(jonas.id)).map(tx => [tx.type, tx.amount]).filter(([type]) => type !== 'initial')
    .sort(([a], [b]) => a.localeCompare(b)), [['advance', 4], ['goal_purchase', -39]]);
});

test('all supported languages provide every new finance, help, and error key', () => {
  const read = language => JSON.parse(readFileSync(new URL(`../src/i18n/${language}.json`, import.meta.url), 'utf8'));
  const keys = (value, prefix = '') => Object.entries(value).flatMap(([key, item]) =>
    item && typeof item === 'object' && !Array.isArray(item) ? keys(item, `${prefix}${key}.`) : [`${prefix}${key}`]);
  const de = read('de');
  for (const language of ['en', 'fr', 'es', 'pt']) {
    const translation = read(language);
    assert.deepEqual(keys(translation.finance).sort(), keys(de.finance).sort());
    for (const k of ['adjust', 'adjustLabel', 'titleAdjust', 'plannedPrice', 'actualPrice', 'notEnoughFunds', 'adjustGoal', 'purchaseAdvance', 'purchaseAdvanceFee', 'plannedPriceDetail']) {
      assert.equal(typeof translation.goal[k], 'string', `${language}: goal.${k}`);
    }
    assert.ok(translation.help.finance.paragraphs.length >= 2);
    assert.equal(translation.help.finance.terms.length, de.help.finance.terms.length);
    assert.ok(translation.help.finance.terms.every(({ term, text }) => term && text));
    assert.doesNotMatch(translation.finance.models.interest, /interest|zins|inter[eé]s|juro/i);
    for (const code of ['invalidFinancialRules', 'advancesDisabled', 'debtLimitExceeded', 'debtLimitBelowOutstanding', 'invalidRepayment']) {
      assert.equal(typeof translation.errors[code], 'string');
    }
  }
});
