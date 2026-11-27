// skeletons.js – Skeleton-HTML für Ladezustände je View

import { t } from './i18n.js';

const line = (size) => `<div class="skel skel-line skel-line--${size}"></div>`;
const bar  = ()      => `<div class="skel skel-bar"></div>`;

// ── Startseite: Kind-Kacheln ──────────────────────────────────────────────
export function skeletonHome() {
  const card = (i) => `
    <div class="skeleton-child-card" style="--card-index:${i}">
      <div class="skel skel-avatar"></div>
      ${line('md')}
      ${line('xl')}
    </div>`;

  return `
    <section class="view-home view-section" aria-busy="true" aria-label="${t('common.loading')}">
      <section>
        <div class="skeleton-child-grid">
          ${card(0)}${card(1)}${card(2)}
        </div>
      </section>
    </section>`;
}

// ── Wallet: Hero + Buttons + Ziele + Buchungen ────────────────────────────
export function skeletonWallet() {
  const quickBtn = () => `<div class="skel skel-quick-btn"></div>`;

  const goalCard = () => `
    <div class="skeleton-goal-card">
      <div class="skel-row">
        <div class="skel skel-icon-sm"></div>
        <div class="skel-col">
          ${line('lg')}
          ${line('md')}
        </div>
        ${line('sm')}
      </div>
      ${bar()}
    </div>`;

  const txRow = () => `
    <div class="skeleton-tx-row">
      <div class="skel skel-icon-sm" style="border-radius:50%"></div>
      <div class="skel-col">
        ${line('lg')}
        ${line('sm')}
      </div>
      ${line('md')}
    </div>`;

  return `
    <section class="view-wallet view-section" aria-busy="true" aria-label="${t('common.loading')}">
      <div class="skeleton-wallet-hero">
        <div class="skeleton-wallet-hero__identity">
          <div class="skel skel-avatar-sm"></div>
          ${line('sm')}
        </div>
        ${line('xl')}
      </div>
      <div class="skeleton-quick-actions">
        ${quickBtn()}${quickBtn()}
      </div>
      <div class="skeleton-section">
        ${line('md')}
        ${line('lg')}
      </div>
      <div class="skeleton-section">
        ${line('md')}
        ${goalCard()}${goalCard()}
      </div>
      <div class="skeleton-tx-section">
        ${line('md')}
        ${txRow()}${txRow()}${txRow()}${txRow()}${txRow()}
      </div>
    </section>`;
}

// ── Sparziele: Balance + Ziel-Karten ─────────────────────────────────────
export function skeletonGoals() {
  const goalCard = () => `
    <li class="skeleton-goal-card">
      <div class="skel-row">
        <div class="skel skel-icon-md"></div>
        <div class="skel-col">
          ${line('lg')}
          ${line('md')}
        </div>
      </div>
      ${bar()}
      <div class="skel-row" style="justify-content:space-between">
        ${line('sm')}${line('sm')}
      </div>
    </li>`;

  return `
    <section class="view-goals view-section" aria-busy="true" aria-label="${t('common.loading')}">
      <div class="goals-balance-info">
        ${line('sm')}
        ${line('xl')}
      </div>
      <div class="view-header">
        ${line('lg')}
        <div class="skel" style="width:120px;height:44px;border-radius:var(--radius-full)"></div>
      </div>
      <ul class="skeleton-goals-list">
        ${goalCard()}${goalCard()}${goalCard()}
      </ul>
    </section>`;
}

// ── Admin-Liste: Kinder / Taschengeld ────────────────────────────────────
export function skeletonAdminList() {
  const row = () => `
    <div class="skeleton-admin-row">
      <div class="skel skel-avatar"></div>
      <div class="skel-col">
        ${line('lg')}
        ${line('md')}
      </div>
      <div class="skel skel-icon-sm"></div>
    </div>`;

  return `
    <section class="view-section" aria-busy="true" aria-label="${t('common.loading')}">
      <div class="view-header">
        ${line('lg')}
        <div class="skel" style="width:120px;height:44px;border-radius:var(--radius-full)"></div>
      </div>
      <div class="skeleton-section">
        ${row()}${row()}${row()}
      </div>
    </section>`;
}
