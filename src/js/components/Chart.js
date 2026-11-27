// components/Chart.js – Schlichtes, abhängigkeitsfreies Diagramm (SVG) für Verläufe
//
// Aufbau: Achsen, Hilfslinien, Legende und die Screenreader-Datentabelle sind für alle
// Diagrammtypen gleich. Nur die Zeichenfläche (Plot) stammt vom jeweiligen Renderer.
// Ein neuer Typ (z. B. 'bar') = eine Funktion in PLOT_RENDERERS; keine weitere Änderung nötig.
import './Chart.css';
import { escapeHtml } from '../utils.js';

/**
 * @typedef {Object} ChartSeries
 * @property {string} id
 * @property {string} label
 * @property {'pos'|'neg'|'accent'} tone  Farbe aus der Palette (Grün / Rot / Akzentfarbe)
 * @property {number[]} values
 */

/**
 * @typedef {Object} PlotContext
 * @property {ChartSeries[]} series
 * @property {number} count             Anzahl der Punkte je Reihe
 * @property {(i: number) => number} x  Position in % (0–100) von links
 * @property {(v: number) => number} y  Position in % (0–100) von oben
 */

/**
 * svg: Inhalt der Zeichenfläche (viewBox 0–100); overlay: optionales HTML darüber
 * @type {Record<string, (ctx: PlotContext) => { svg: string, overlay?: string }>}
 */
const PLOT_RENDERERS = {
  line: (ctx) => ({ svg: renderLinePlot(ctx), overlay: renderLineDots(ctx) }),
};

export const CHART_TYPES = Object.freeze(Object.keys(PLOT_RENDERERS));

const MAX_X_LABELS = 6;

/**
 * @param {Object} opts
 * @param {string} [opts.type='line']        siehe CHART_TYPES
 * @param {string} opts.label                Beschreibung des Diagramms (Screenreader)
 * @param {string[]} opts.labels             Kurzbeschriftung je Punkt (x-Achse)
 * @param {string[]} [opts.longLabels]       ausführliche Beschriftung je Punkt (Datentabelle)
 * @param {string} opts.periodLabel          Spaltenkopf der Datentabelle
 * @param {ChartSeries[]} opts.series
 * @param {(v: number) => string} opts.formatValue
 * @returns {string} HTML
 */
export function renderChart({ type = 'line', label, labels, longLabels = labels, periodLabel, series, formatValue }) {
  const renderPlot = PLOT_RENDERERS[type];
  if (!renderPlot) throw new Error(`Unbekannter Diagrammtyp: ${type}`);

  const count = labels.length;
  const max = niceMax(Math.max(0, ...series.flatMap(s => s.values)));
  const ctx = {
    series,
    count,
    x: (i) => (count <= 1 ? 50 : (i / (count - 1)) * 100),
    y: (v) => 100 - (Math.max(0, v) / max) * 100,
  };
  const plot = renderPlot(ctx);

  return /* html */`
    <figure class="chart chart--${type}" role="group" aria-label="${escapeHtml(label)}">
      <div class="chart__body" aria-hidden="true">
        <div class="chart__canvas">
          <span class="chart__y-label" style="top: 0%">${escapeHtml(formatValue(max))}</span>
          <span class="chart__y-label" style="top: 50%">${escapeHtml(formatValue(max / 2))}</span>
          <svg class="chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            ${[0, 50, 100].map(y => `<line class="chart__grid${y === 100 ? ' chart__grid--base' : ''}" x1="0" x2="100" y1="${y}" y2="${y}" vector-effect="non-scaling-stroke"/>`).join('')}
            ${plot.svg}
          </svg>
          ${plot.overlay ?? ''}
        </div>
        <div class="chart__x">${renderXLabels(labels, ctx.x)}</div>
      </div>
      ${renderLegend(series)}
      ${renderDataTable({ label, periodLabel, longLabels, series, formatValue })}
    </figure>`;
}

// ── Plot-Renderer ─────────────────────────────────────────────────────────────

function renderLinePlot({ series, x, y }) {
  return series.map(s => {
    const points = s.values.map((v, i) => `${round(x(i))},${round(y(v))}`).join(' ');
    return `<polyline class="chart__line chart__tone--${s.tone}" points="${points}" vector-effect="non-scaling-stroke"/>`;
  }).join('');
}

// Punkte als HTML, damit sie trotz verzerrter SVG-Fläche rund bleiben
function renderLineDots({ series, x, y }) {
  return series.map(s => s.values.map((v, i) =>
    `<span class="chart__dot chart__tone--${s.tone}" style="left: ${round(x(i))}%; top: ${round(y(v))}%"></span>`,
  ).join('')).join('');
}

// ── Gemeinsame Bausteine ──────────────────────────────────────────────────────

function renderXLabels(labels, x) {
  const step = Math.ceil(labels.length / MAX_X_LABELS);
  const last = labels.length - 1;
  return labels.map((text, i) => {
    // Den letzten (aktuellen) Punkt immer beschriften; Nachbarn ggf. auslassen, damit nichts überlappt
    const show = i === last || (i % step === 0 && last - i >= step);
    if (!show) return '';
    const align = labels.length > 1 && i === 0 ? ' chart__x-label--start' : i === last && labels.length > 1 ? ' chart__x-label--end' : '';
    return `<span class="chart__x-label${align}" style="left: ${round(x(i))}%">${escapeHtml(text)}</span>`;
  }).join('');
}

function renderLegend(series) {
  return `<ul class="chart__legend">
    ${series.map(s => `<li class="chart__legend-item"><span class="chart__swatch chart__tone--${s.tone}" aria-hidden="true"></span>${escapeHtml(s.label)}</li>`).join('')}
  </ul>`;
}

function renderDataTable({ label, periodLabel, longLabels, series, formatValue }) {
  return `<table class="sr-only">
    <caption>${escapeHtml(label)}</caption>
    <thead><tr><th scope="col">${escapeHtml(periodLabel)}</th>${series.map(s => `<th scope="col">${escapeHtml(s.label)}</th>`).join('')}</tr></thead>
    <tbody>
      ${longLabels.map((l, i) => `<tr><th scope="row">${escapeHtml(l)}</th>${series.map(s => `<td>${escapeHtml(formatValue(s.values[i]))}</td>`).join('')}</tr>`).join('')}
    </tbody>
  </table>`;
}

/** Runde Obergrenze für die y-Achse (1, 2, 2,5, 5 × 10ⁿ), damit Hilfslinien glatte Werte zeigen. */
function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find(f => f * magnitude >= value);
  return step * magnitude;
}

const round = (n) => Math.round(n * 100) / 100;
