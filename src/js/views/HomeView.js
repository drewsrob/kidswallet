// views/HomeView.js – Logik & State-Verwaltung (Startseite)
import './HomeView.css';

import { api } from '../api.js';
import { getState, setState } from '../state.js';
import { Toast } from '../components/Toast.js';
import { openChildForm } from '../components/ChildForm.js';
import { getPaletteColors, escapeHtml, animateCountUp } from '../utils.js';
import { icon } from '../icons.js';
import { getChildCardGoal } from '../status.js';
import { parseBlocks, render } from '../template.js';
import homeHtml from './HomeView.html?raw';

const blocks = parseBlocks(homeHtml);

export default class HomeView {
  constructor() {
    this._handlers = [];
  }

  async render() {
    try {
      const data = await api.getState();
      setState({ children: data.children, settings: data.settings });
    } catch (e) {
      // State aus Cache verwenden
    }

    const { children, settings } = getState();
    const currency = settings.currency ?? '€';

    const childCard = ({ child, currency: cur, childIndex = 0 }) => {
      const colors = getPaletteColors(child.colorPaletteIndex);
      const cardGoal = getChildCardGoal(child.goals, child.balance, cur);

      // Kinderkarte ist role="button" – Inhalte werden dort nicht einzeln vorgelesen,
      // daher steckt die Sparziel-Info im aria-label der Karte.
      let goalFooter = '';
      if (cardGoal) {
        const { status } = cardGoal;
        const reached = status.state === 'reached';
        goalFooter = `
          <div class="child-card__goals${reached ? ' child-card__goals--reached' : ''}" aria-hidden="true">
            <div class="child-card__goals-count">${icon('target', { size: 14 })}<span>${cardGoal.countText}</span></div>
            <div class="child-card__goals-row">
              <span class="child-card__goals-name">${escapeHtml(cardGoal.goal.name)}</span>
              <span class="child-card__goals-pct">${reached ? icon('check-circle', { size: 14 }) : ''}${cardGoal.progressText}</span>
            </div>
            <div class="progress-bar child-card__goals-bar">
              <div class="progress-fill" style="--target-width: ${status.pct}%;"></div>
            </div>
          </div>`;
      }
      const goalSummary = cardGoal ? cardGoal.summary : '';

      return render(blocks.childCard, { child, currency: cur, colors, goalFooter, goalSummary, childIndex });
    };

    return render(blocks.main, { children, currency, childCard });
  }

  mount() {
    const { settings } = getState();
    const currency = settings.currency ?? '€';
    document.querySelectorAll('.child-card__balance[data-balance]').forEach(el => {
      animateCountUp(el, 0, parseFloat(el.dataset.balance), currency);
    });

    const btnAdd = document.getElementById('btn-home-add-child');
    if (btnAdd) {
      const h = () => this._addChild();
      btnAdd.addEventListener('click', h);
      this._handlers.push({ el: btnAdd, type: 'click', fn: h });
    }

    const grid = document.getElementById('children-grid');
    if (grid) {
      const cardHandler = (e) => {
        const card = e.target.closest('[data-child-id]');
        if (!card) return;
        location.hash = `#/wallet/${card.dataset.childId}`;
      };
      grid.addEventListener('click', cardHandler);
      this._handlers.push({ el: grid, type: 'click', fn: cardHandler });

      const keyHandler = (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const card = e.target.closest('[data-child-id]');
        if (!card) return;
        e.preventDefault();
        location.hash = `#/wallet/${card.dataset.childId}`;
      };
      grid.addEventListener('keydown', keyHandler);
      this._handlers.push({ el: grid, type: 'keydown', fn: keyHandler });
    }
  }

  async _addChild() {
    const created = await openChildForm();
    if (!created) return;

    const app = document.getElementById('app');
    const html = await this.render();
    this.unmount();
    app.innerHTML = html;
    this.mount();
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
    this._handlers = [];
  }
}
