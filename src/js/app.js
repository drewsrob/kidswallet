// app.js – Einstiegspunkt, Hash-Router, Lifecycle

// Globale CSS-Styles (Vite verarbeitet und bündelt diese)
import '../css/reset.css';
import '../css/variables.css';
import '../css/base.css';
import '../css/layout.css';
import '../css/components.css';
import '../css/animations.css';
import '../css/skeleton.css';

// i18n zuerst initialisieren, damit alle Views und Komponenten übersetzte Texte erhalten
import { t, translateDom, onLanguageChange } from './i18n.js';
import { api } from './api.js';
import { setState } from './state.js';
import { restoreTheme } from './theme.js';
import { resetChildTheme, applyColorTokens } from './utils.js';
import { icon } from './icons.js';
import { renderEmptyState } from './components/EmptyState.js';
import { Toast, FLASH_KEY } from './components/Toast.js';
import { getHelpTopic, helpButtonLabel } from './helpTopics.js';
import './components/InfoDialog.js';
import { dismissTopModal, rerenderKeepingFocus } from './components/Modal.js';
import { resolvePinMigration } from './components/PinPrompt.js';
import { Capacitor } from '@capacitor/core';
import { skeletonHome, skeletonWallet, skeletonGoals, skeletonAdminList } from './skeletons.js';

// ── Router-Tabelle ─────────────────────────────────────────────────────────
const routes = [
  {
    pattern: /^(#\/?)?$/,
    load: () => import('./views/HomeView.js'),
    params: () => [],
    showHeader: false,
    help: 'home',
    skeleton: skeletonHome,
  },
  {
    pattern: /^#\/wallet\/([^/]+)$/,
    load: () => import('./views/WalletView.js'),
    params: (m) => [m[1]],
    showHeader: true,
    titleKey: 'navigation.wallet',
    help: 'wallet',
    skeleton: skeletonWallet,
  },
  {
    pattern: /^#\/wallet\/([^/]+)\/goals$/,
    load: () => import('./views/GoalsView.js'),
    params: (m) => [m[1]],
    showHeader: true,
    titleKey: 'navigation.goals',
    help: 'goals',
    skeleton: skeletonGoals,
  },
  {
    pattern: /^#\/wallet\/([^/]+)\/transactions$/,
    load: () => import('./views/TransactionsView.js'),
    params: (m) => [m[1]],
    showHeader: true,
    titleKey: 'navigation.transactions',
    help: 'transactions',
    skeleton: skeletonAdminList,
  },
  {
    pattern: /^#\/wallet\/([^/]+)\/allowances$/,
    load: () => import('./views/AllowanceView.js'),
    params: (m) => [m[1]],
    showHeader: true,
    titleKey: 'navigation.allowances',
    help: 'allowances',
    skeleton: skeletonAdminList,
  },
  {
    pattern: /^#\/admin$/,
    load: () => import('./views/admin/AdminView.js'),
    params: () => [],
    showHeader: true,
    titleKey: 'navigation.management',
    help: 'admin',
  },
  {
    pattern: /^#\/admin\/children$/,
    load: () => import('./views/admin/AdminChildrenView.js'),
    params: () => [],
    showHeader: true,
    titleKey: 'navigation.children',
    help: 'children',
    skeleton: skeletonAdminList,
  },
  {
    pattern: /^#\/admin\/settings$/,
    load: () => import('./views/admin/AdminSettingsView.js'),
    params: () => [],
    showHeader: true,
    titleKey: 'navigation.settings',
    help: 'settings',
  },
  {
    pattern: /^#\/admin\/appearance$/,
    load: () => import('./views/AppearanceView.js'),
    params: () => [],
    showHeader: true,
    titleKey: 'navigation.appearance',
    help: 'appearance',
  },
  {
    pattern: /^#\/admin\/backup$/,
    load: () => import('./views/admin/AdminBackupView.js'),
    params: () => [],
    showHeader: true,
    titleKey: 'navigation.backup',
    help: 'backup',
  },
];

// Routentitel erst beim Anzeigen übersetzen (aktuelle Sprache)
const routeTitle = (route) => (route?.titleKey ? t(route.titleKey) : t('common.appName'));

// ── State ──────────────────────────────────────────────────────────────────
let currentView = null;
let currentRoute = null;
let initialized = false;
let initFailed = false;

const appEl = document.getElementById('app');
const toolbarLeftBtn = document.getElementById('toolbar-left-btn');
const toolbarTitle = document.getElementById('toolbar-title');
const sidenav = document.getElementById('app-sidenav');
const sidenavBackdrop = document.getElementById('sidenav-backdrop');
const sidenavCloseBtn = document.getElementById('btn-sidenav-close');
const sidenavBtnHome = document.getElementById('sidenav-btn-home');
const sidenavBtnAdmin = document.getElementById('sidenav-btn-admin');

// ── Sidenav ─────────────────────────────────────────────────────────────────
function openSidenav() {
  sidenav.classList.add('open');
  sidenavBackdrop.classList.add('open');
  sidenav.setAttribute('aria-hidden', 'false');
  sidenav.removeAttribute('inert');
  toolbarLeftBtn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeSidenav() {
  sidenav.classList.remove('open');
  sidenavBackdrop.classList.remove('open');
  sidenav.setAttribute('aria-hidden', 'true');
  sidenav.setAttribute('inert', '');
  toolbarLeftBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

sidenavBackdrop.addEventListener('click', closeSidenav);
sidenavCloseBtn.addEventListener('click', closeSidenav);

// ── Android-Zurück-Taste ───────────────────────────────────────────────────
// Reihenfolge: offenes Sheet/Dialog (mit Rückfrage bei ungespeicherten Eingaben),
// dann Seitenmenü, dann vorherige Seite (Standardverhalten von Android).
if (Capacitor.isNativePlatform()) {
  import('@capacitor/app').then(({ App }) => {
    App.addListener('backButton', ({ canGoBack }) => {
      if (dismissTopModal()) return;
      if (sidenav.classList.contains('open')) { closeSidenav(); return; }
      if (canGoBack) history.back();
      else App.exitApp();
    });
  }).catch(err => console.error('Zurück-Taste nicht verfügbar:', err));
}
sidenavBtnHome.addEventListener('click', () => { closeSidenav(); location.hash = '#/'; });
sidenavBtnAdmin.addEventListener('click', () => { closeSidenav(); location.hash = '#/admin'; });

// ── Theme ──────────────────────────────────────────────────────────────────────────
const ACCENT_KEY = 'kidswallet-accent';
const htmlEl = document.documentElement;

function _faviconSvg(color) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${color}"/><g transform="translate(7,7) scale(0.75)" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="2" y="8" width="20" height="13" rx="2"/><path d="M2 13h20"/><path d="M14 16h3"/><rect x="9" y="5" width="6" height="3" rx="1"/><circle cx="12" cy="2.5" r="1.5" fill="#fff" stroke="none"/><line x1="12" y1="4" x2="12" y2="5"/></g></svg>`;
}

function updateFavicon(hex) {
  const url = `data:image/svg+xml,${encodeURIComponent(_faviconSvg(hex))}`;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = url;
}

function applyAccent(hex) {
  htmlEl.style.setProperty('--color-primary', hex);
  htmlEl.style.setProperty('--child-primary', hex);
  htmlEl.style.setProperty('--child-light', `color-mix(in srgb, ${hex} 15%, transparent)`);
  applyColorTokens('accent', hex);
  applyColorTokens('child', hex);
  updateFavicon(hex);
}

restoreTheme();

const _savedAccent = localStorage.getItem(ACCENT_KEY);
if (_savedAccent) applyAccent(_savedAccent);
else applyColorTokens('accent', '#6c63ff');

// Toolbar-Linksbutton: Burger oder Zurück
toolbarLeftBtn.addEventListener('click', () => {
  if (toolbarLeftBtn.dataset.mode === 'back') {
    history.back();
  } else {
    openSidenav();
  }
});

// Hilfe-Button: öffnet die Kontexthilfe der aktuellen Seite (Delegation über data-help, siehe InfoDialog.js)
const helpBtn = document.getElementById('btn-help');

function updateHelpButton(key) {
  if (!helpBtn) return;
  const help = key && getHelpTopic(key);
  helpBtn.hidden = !help;
  if (!help) { delete helpBtn.dataset.help; return; }
  helpBtn.dataset.help = key;
  helpBtn.setAttribute('aria-label', helpButtonLabel(help.title));
  helpBtn.setAttribute('aria-haspopup', 'dialog');
}

// Toolbar passend zur Route beschriften (auch nach einem Sprachwechsel)
function updateToolbar(route) {
  toolbarLeftBtn.setAttribute('aria-label', t(route?.showHeader ? 'navigation.back' : 'navigation.openMenu'));
  toolbarTitle.textContent = routeTitle(route);
  updateHelpButton(route?.help);
}

// ── Navigation ─────────────────────────────────────────────────────────────
async function navigate() {
  const hash = location.hash || '';

  // Route finden
  let matchedRoute = null;
  let match = null;

  for (const route of routes) {
    const m = hash.match(route.pattern);
    if (m) {
      matchedRoute = route;
      match = m;
      break;
    }
  }

  if (!matchedRoute) {
    location.hash = '#/';
    return;
  }

  // Verwaltung sperrt sich automatisch, sobald sie verlassen wird
  if (!hash.startsWith('#/admin')) {
    setState({ adminAuthenticated: false });
  }

  // Alten View aufräumen
  if (currentView?.unmount) {
    try { currentView.unmount(); } catch (_) {}
  }

  // Farb-Theme zurücksetzen (nur wenn wir nicht in einer Kind-View sind)
  if (!matchedRoute.pattern.toString().includes('wallet')) {
    resetChildTheme();
  }

  // Toolbar-Linksbutton: Burger (Home) oder Zurück (Sub-Seite)
  if (matchedRoute.showHeader) {
    toolbarLeftBtn.dataset.mode = 'back';
    toolbarLeftBtn.innerHTML = icon('arrow-left', { size: 24 });
    toolbarLeftBtn.removeAttribute('aria-expanded');
    toolbarLeftBtn.removeAttribute('aria-controls');
  } else {
    toolbarLeftBtn.dataset.mode = 'menu';
    toolbarLeftBtn.innerHTML = icon('menu', { size: 24 });
    toolbarLeftBtn.setAttribute('aria-expanded', 'false');
    toolbarLeftBtn.setAttribute('aria-controls', 'app-sidenav');
  }
  currentRoute = matchedRoute;
  updateToolbar(matchedRoute);

  // Ladezustand – Skeleton falls vorhanden, sonst Spinner
  appEl.innerHTML = matchedRoute.skeleton
    ? matchedRoute.skeleton()
    : /* html */`
      <div class="loading-screen" aria-busy="true" aria-label="${t('common.loading')}">
        <div class="loading-spinner" aria-hidden="true"></div>
        <p>${t('common.loading')}</p>
      </div>
    `;

  try {
    const { default: ViewClass } = await matchedRoute.load();
    const params = matchedRoute.params(match);
    currentView = new ViewClass(...params);

    const html = await currentView.render();
    appEl.innerHTML = html;

    if (currentView.mount) currentView.mount();
  } catch (err) {
    console.error('Navigation-Fehler:', err);
    currentView = null;
    appEl.innerHTML = renderEmptyState({
      icon: 'alert-triangle',
      tone: 'danger',
      title: t('empty.loadError.title'),
      text: t('empty.loadError.text'),
      actions: [
        { id: 'btn-retry-navigation', label: t('common.tryAgain') },
        { href: '#/', label: t('common.toHome'), icon: 'house', variant: 'secondary' },
      ],
    });
    document.getElementById('btn-retry-navigation')?.addEventListener('click', () => navigate());
  }
}

// ── App-Initialisierung ───────────────────────────────────────────────────
async function init() {
  try {
    // State laden
    const stateData = await api.getState();
    setState({ children: stateData.children, settings: stateData.settings });

    // Fällige Taschengeld-Zahlungen verarbeiten
    const result = await api.processAllowances();

    // Falls Zahlungen verarbeitet wurden, State neu laden
    if (result.changed) {
      const freshState = await api.getState();
      setState({ children: freshState.children });
    }

    // Lade Seite
    window.addEventListener('hashchange', navigate);
    initialized = true;
    navigate();
    showFlashMessage();

    // Bestandsinstallation mit früherer Standard-PIN: einmalig über den PIN-Schutz entscheiden
    if (stateData.settings.pinMigrationPending) resolvePinMigration();

  } catch (err) {
    console.error('Initialisierungsfehler:', err);
    initFailed = true;
    renderOfflineState();
  }
}

function renderOfflineState() {
  appEl.innerHTML = renderEmptyState({
    icon: 'alert-triangle',
    tone: 'danger',
    title: t('empty.offline.title'),
    text: t('empty.offline.text'),
    actions: [{ id: 'btn-reload', label: t('common.reload') }],
  });
  document.getElementById('btn-reload')?.addEventListener('click', () => location.reload());
}

// ── Sprachwechsel ──────────────────────────────────────────────────────────
// Statische Shell neu beschriften und die aktuelle Seite in der neuen Sprache rendern.
// Seitenmenü und offene Dialoge bleiben bestehen (sie liegen außerhalb von #app).
async function handleLanguageChange() {
  translateDom(document);
  if (initFailed) { renderOfflineState(); return; }
  if (!initialized) return;
  updateToolbar(currentRoute);
  const scrollY = window.scrollY;
  await rerenderKeepingFocus(() => navigate(), () => ['main h1']);
  window.scrollTo(0, scrollY);
}

translateDom(document);
onLanguageChange(() => {
  handleLanguageChange().catch(err => console.error('Sprachwechsel-Fehler:', err));
});

// ── Einmalige Meldung nach einem Neuladen (z. B. nach dem Wiederherstellen) ──
function showFlashMessage() {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return;
  sessionStorage.removeItem(FLASH_KEY);
  try {
    const { type, message } = JSON.parse(raw);
    Toast.show(message, type);
  } catch { /* ungültige Meldung ignorieren */ }
}

// Start wenn DOM bereit ist
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
