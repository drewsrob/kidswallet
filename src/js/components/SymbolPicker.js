// components/SymbolPicker.js – Durchsuchbare, kategorisierte Symbolauswahl
//
// Skaliert auf beliebig viele Symbole: Suche (Name, Synonyme, Kategorie),
// einklappbare Kategorien, Pfeiltasten-Navigation und dauerhaft sichtbare Auswahl.

import './SymbolPicker.css';
import { icon } from '../icons.js';
import { escapeHtml } from '../utils.js';
import { t } from '../i18n.js';
import {
  GOAL_SYMBOLS, GOAL_SYMBOL_CATEGORIES, DEFAULT_GOAL_SYMBOL,
  getGoalSymbol, matchesGoalSymbol, getSymbolName, getCategoryName,
} from '../goalSymbols.js';

function renderOption(symbol, selected) {
  const isSel = symbol.id === selected;
  const name = escapeHtml(getSymbolName(symbol.id));
  return /* html */`
    <button type="button" class="symbol-option${isSel ? ' selected' : ''}" data-symbol="${symbol.id}"
      aria-pressed="${isSel}" aria-label="${name}" title="${name}">
      ${icon(symbol.id, { size: 24 })}
      <span class="symbol-option__check" aria-hidden="true">${icon('check', { size: 12 })}</span>
    </button>`;
}

/**
 * Symbolauswahl als HTML-String rendern
 * @param {object} opts
 * @param {string} [opts.id='symbol-picker'] ID-Präfix
 * @param {string} [opts.selected] aktuell gewähltes Symbol
 * @param {string} [opts.label] sichtbare Feldbezeichnung
 */
export function renderSymbolPicker({ id = 'symbol-picker', selected = DEFAULT_GOAL_SYMBOL, label = t('goal.iconLabel') } = {}) {
  const current = getGoalSymbol(selected) ?? getGoalSymbol(DEFAULT_GOAL_SYMBOL);

  const groups = GOAL_SYMBOL_CATEGORIES.map(categoryId => {
    const items = GOAL_SYMBOLS.filter(s => s.category === categoryId);
    if (!items.length) return '';
    const categoryName = escapeHtml(getCategoryName(categoryId));
    return /* html */`
      <details class="symbol-group" data-category="${categoryId}" open>
        <summary class="symbol-group__title">
          <span class="symbol-group__name">${categoryName}</span>
          <span class="symbol-group__count" data-count>${t('goal.symbolGroupCount', { count: items.length })}</span>
          <span class="symbol-group__chevron" aria-hidden="true">${icon('chevron-right', { size: 18 })}</span>
        </summary>
        <div class="symbol-group__grid" role="group" aria-label="${categoryName}">
          ${items.map(s => renderOption(s, current.id)).join('')}
        </div>
      </details>`;
  }).join('');

  return /* html */`
    <div class="symbol-picker" id="${id}" data-selected="${current.id}">
      <div class="symbol-picker__head">
        <span class="form-label form-label--secondary" id="${id}-label">${escapeHtml(label)}</span>
        <span class="symbol-picker__current" data-current>
          <span class="symbol-picker__current-icon" data-current-icon>${icon(current.id, { size: 18 })}</span>
          <span data-current-name>${escapeHtml(t('goal.symbolSelected', { name: getSymbolName(current.id) }))}</span>
        </span>
      </div>
      <div class="symbol-picker__search">
        <span class="symbol-picker__search-icon" aria-hidden="true">${icon('magnifier', { size: 18 })}</span>
        <input class="form-input symbol-picker__input" id="${id}-search" type="search"
          placeholder="${escapeHtml(t('goal.symbolSearchPlaceholder'))}" aria-label="${escapeHtml(t('goal.symbolSearchLabel'))}"
          aria-controls="${id}-list" autocomplete="off" spellcheck="false" enterkeyhint="search">
      </div>
      <div class="symbol-picker__list" id="${id}-list" role="group" aria-labelledby="${id}-label">
        ${groups}
        <p class="symbol-picker__empty" data-empty hidden>${escapeHtml(t('goal.symbolNoResults'))}</p>
      </div>
      <p class="sr-only" data-status aria-live="polite"></p>
    </div>`;
}

/**
 * Interaktion der Symbolauswahl aktivieren
 * @param {HTMLElement|null} container Element aus renderSymbolPicker
 * @param {(id: string) => void} onChange
 */
export function mountSymbolPicker(container, onChange) {
  if (!container) return;
  const search = container.querySelector('.symbol-picker__input');
  const list = container.querySelector('.symbol-picker__list');
  const groups = [...container.querySelectorAll('.symbol-group')];
  const buttons = [...container.querySelectorAll('.symbol-option')];
  const empty = container.querySelector('[data-empty]');
  const status = container.querySelector('[data-status]');
  const currentIcon = container.querySelector('[data-current-icon]');
  const currentName = container.querySelector('[data-current-name]');
  let searching = false;

  const applyFilter = (query) => {
    const active = query.trim() !== '';
    // Beim Start einer Suche den Auf-/Zuklapp-Zustand merken und danach wiederherstellen
    if (active && !searching) groups.forEach(g => { g.dataset.userOpen = String(g.open); });

    let total = 0;
    groups.forEach(group => {
      let visible = 0;
      group.querySelectorAll('.symbol-option').forEach(btn => {
        const match = matchesGoalSymbol(getGoalSymbol(btn.dataset.symbol), query);
        btn.hidden = !match;
        if (match) visible++;
      });
      total += visible;
      group.hidden = visible === 0;
      group.querySelector('[data-count]').textContent = t('goal.symbolGroupCount', { count: visible });
      if (active && visible) group.open = true;
      if (!active && searching) group.open = group.dataset.userOpen !== 'false';
    });

    empty.hidden = total > 0;
    status.textContent = active ? (total ? t('goal.symbolResults', { count: total }) : t('goal.symbolNoResults')) : '';
    searching = active;
  };

  const select = (id, { focus = false } = {}) => {
    const symbol = getGoalSymbol(id);
    if (!symbol) return;
    container.dataset.selected = id;
    buttons.forEach(btn => {
      const on = btn.dataset.symbol === id;
      btn.classList.toggle('selected', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    currentIcon.innerHTML = icon(id, { size: 18 });
    currentName.textContent = t('goal.symbolSelected', { name: getSymbolName(id) });

    if (search.value) { search.value = ''; applyFilter(''); }
    const btn = buttons.find(b => b.dataset.symbol === id);
    const group = btn?.closest('details');
    if (group && !group.open) group.open = true;
    if (focus) btn?.focus({ preventScroll: true });
    btn?.scrollIntoView({ block: 'nearest' });
    onChange?.(id);
  };

  search.addEventListener('input', () => applyFilter(search.value));

  search.addEventListener('keydown', (e) => {
    // Escape leert zuerst die Suche, statt den Dialog zu schließen
    if (e.key === 'Escape' && search.value) {
      e.preventDefault();
      search.value = '';
      applyFilter('');
      return;
    }
    // Enter übernimmt den ersten Treffer, statt den Dialog abzusenden
    if (e.key === 'Enter' && search.value.trim()) {
      e.preventDefault();
      const first = buttons.find(b => !b.hidden);
      if (first) select(first.dataset.symbol, { focus: true });
      return;
    }
    if (e.key === 'ArrowDown') {
      const first = buttons.find(b => !b.hidden && b.offsetParent !== null);
      if (first) { e.preventDefault(); first.focus(); }
    }
  });

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.symbol-option');
    if (btn) select(btn.dataset.symbol, { focus: true });
  });

  // Pfeiltasten: links/rechts der Reihe nach, hoch/runter zur nächstgelegenen Zeile
  list.addEventListener('keydown', (e) => {
    const btn = e.target.closest?.('.symbol-option');
    if (!btn || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    const visible = buttons.filter(b => !b.hidden && b.offsetParent !== null);
    const i = visible.indexOf(btn);
    let next = null;

    if (e.key === 'ArrowLeft') next = visible[i - 1];
    else if (e.key === 'ArrowRight') next = visible[i + 1];
    else if (e.key === 'Home') next = visible[0];
    else if (e.key === 'End') next = visible[visible.length - 1];
    else {
      const r = btn.getBoundingClientRect();
      const down = e.key === 'ArrowDown';
      const candidates = visible.filter(b => {
        const br = b.getBoundingClientRect();
        return down ? br.top > r.top + 4 : br.top < r.top - 4;
      });
      if (!candidates.length) {
        if (!down) { e.preventDefault(); search.focus(); }
        return;
      }
      const rowTop = down
        ? Math.min(...candidates.map(b => b.getBoundingClientRect().top))
        : Math.max(...candidates.map(b => b.getBoundingClientRect().top));
      const row = candidates.filter(b => Math.abs(b.getBoundingClientRect().top - rowTop) < 4);
      next = row.reduce((best, b) =>
        Math.abs(b.getBoundingClientRect().left - r.left) < Math.abs(best.getBoundingClientRect().left - r.left) ? b : best);
    }

    if (next) {
      e.preventDefault();
      next.focus();
      next.scrollIntoView({ block: 'nearest' });
    }
  });
}
