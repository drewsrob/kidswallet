// components/ActivityChart.js – Aktivitäts-Verlauf (Einnahmen / Ausgaben) für das Kinder-Dashboard
import { formatCurrency } from '../utils.js';
import { t, getLocale } from '../i18n.js';
import { getActivitySeries, getAvailableRanges } from '../stats.js';
import { renderChart } from './Chart.js';
import { renderEmptyState } from './EmptyState.js';
import { renderSegmentedControl } from './SegmentedControl.js';

/** Zeitraumfilter [1M] [3M] [6M] für den Card-Header */
export function renderActivityRangeControl(selected, { premium = false } = {}) {
  return renderSegmentedControl({
    id: 'activity-range',
    label: t('dashboard.activityRangeLabel'),
    selected,
    options: getAvailableRanges({ premium }).map(r => ({
      value: r.id,
      label: t(`dashboard.ranges.${r.id}.short`),
      ariaLabel: t(`dashboard.ranges.${r.id}.long`),
    })),
  });
}

/**
 * Diagramm bzw. Hinweis bei zu wenigen Daten.
 * @param {object[]} transactions
 * @param {string} rangeId
 * @param {string} currency
 * @param {{ type?: string }} [opts]  Diagrammtyp (vorbereitet für weitere Ansichten)
 */
export function renderActivityChart(transactions, rangeId, currency, { type = 'line' } = {}) {
  const data = getActivitySeries(transactions, rangeId);
  if (!data.hasEnoughData) {
    return renderEmptyState({ variant: 'inline', icon: 'trending-up', text: t('dashboard.activityNotEnoughData') });
  }

  const locale = getLocale();
  const weekly = data.range.bucket === 'week';
  const short = new Intl.DateTimeFormat(locale, weekly ? { day: 'numeric', month: 'short' } : { month: 'short' });
  const long = new Intl.DateTimeFormat(locale, weekly ? { day: 'numeric', month: 'long' } : { month: 'long', year: 'numeric' });

  return renderChart({
    type,
    label: t('dashboard.chartLabel', { range: t(`dashboard.ranges.${data.range.id}.long`) }),
    periodLabel: t('dashboard.chartPeriod'),
    labels: data.points.map(p => short.format(p.start)),
    longLabels: data.points.map(p => (weekly ? t('dashboard.chartWeekOf', { date: long.format(p.start) }) : long.format(p.start))),
    series: [
      { id: 'income', label: t('dashboard.statIncome'), tone: 'pos', values: data.points.map(p => p.income) },
      { id: 'expense', label: t('dashboard.statExpense'), tone: 'neg', values: data.points.map(p => p.expense) },
    ],
    formatValue: (v) => formatCurrency(v, currency),
  });
}
