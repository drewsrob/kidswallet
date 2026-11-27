---
applyTo: "public/js/**"
---

# KidsWallet – Vanilla JS SPA Patterns

## Hash-Router (app.js)

```js
const routes = [
  { pattern: /^(#\/)?$/, view: () => import("./views/HomeView.js") },
  {
    pattern: /^#\/wallet\/([^/]+)$/,
    view: () => import("./views/WalletView.js"),
  },
  {
    pattern: /^#\/wallet\/([^/]+)\/goals$/,
    view: () => import("./views/GoalsView.js"),
  },
  { pattern: /^#\/admin$/, view: () => import("./views/admin/AdminView.js") },
  {
    pattern: /^#\/admin\/children$/,
    view: () => import("./views/admin/AdminChildrenView.js"),
  },
  {
    pattern: /^#\/admin\/children\/([^/]+)$/,
    view: () => import("./views/admin/AdminChildEditView.js"),
  },
  {
    pattern: /^#\/admin\/settings$/,
    view: () => import("./views/admin/AdminSettingsView.js"),
  },
];
```

## View-Klassen-Muster (IMMER so aufbauen)

```js
export default class ExampleView {
  constructor(param) {
    this.param = param;
    this._handlers = []; // für Event-Listener Cleanup
  }

  async render() {
    // 1. Daten laden
    // 2. HTML als Template-Literal zurückgeben
    return /* html */ `
      <section class="view-..." aria-label="...">
        ...
      </section>
    `;
  }

  mount() {
    // Event-Listener registrieren, immer über _addHandler()
  }

  unmount() {
    this._handlers.forEach(({ el, type, fn }) =>
      el.removeEventListener(type, fn),
    );
    this._handlers = [];
  }

  _addHandler(el, type, fn) {
    el.addEventListener(type, fn);
    this._handlers.push({ el, type, fn });
  }
}
```

## State-Management (state.js)

```js
// Einfacher reaktiver State ohne Framework
const _state = { children: [], settings: {}, adminAuthenticated: false };
const _listeners = {};

export function getState() {
  return { ..._state };
}
export function setState(partial) {
  Object.assign(_state, partial);
  Object.keys(partial).forEach((key) =>
    _listeners[key]?.forEach((fn) => fn(_state[key])),
  );
}
export function subscribe(key, fn) {
  if (!_listeners[key]) _listeners[key] = [];
  _listeners[key].push(fn);
  return () => {
    _listeners[key] = _listeners[key].filter((l) => l !== fn);
  };
}
```

## API-Wrapper (api.js)

```js
async function request(method, path, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Serverfehler" }));
    throw new Error(err.message || "Unbekannter Fehler");
  }
  return res.json();
}
```

## Modal (Promise-based)

```js
const result = await new Modal({
  title: "Kind löschen?",
  content: "<p>Wirklich löschen?</p>",
  actions: [
    { label: "Abbrechen", value: "cancel", variant: "secondary" },
    { label: "Löschen", value: "confirm", variant: "danger" },
  ],
}).open();
if (result === "confirm") {
  /* ... */
}
```

## Toast-Benachrichtigungen

```js
import { Toast } from "./components/Toast.js";
Toast.show("Gespeichert!", "success"); // success | error | info
Toast.show("Fehler aufgetreten", "error");
```

## Kind-Farbthema setzen

```js
// utils.js → applyChildTheme()
export function applyChildTheme(paletteIndex) {
  document.documentElement.style.setProperty(
    "--child-primary",
    `var(--palette-${paletteIndex}-primary)`,
  );
  document.documentElement.style.setProperty(
    "--child-light",
    `var(--palette-${paletteIndex}-light)`,
  );
}
export function resetChildTheme() {
  document.documentElement.style.removeProperty("--child-primary");
  document.documentElement.style.removeProperty("--child-light");
}
```

## Utilities (utils.js)

```js
export function formatCurrency(amount, currency = "€") {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })
    .format(amount)
    .replace("€", currency)
    .trim();
}
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

## Wichtige Regeln

- `/* html */` Tag-Kommentar vor Template-Literals für HTML-Syntax-Highlighting
- Event-Listener IMMER über `_addHandler()` in mount(), nie in render()
- `escapeHtml()` für alle Nutzerdaten in Template-Literals
- Keine globalen Variablen außer in `state.js`
- `async render()` – await für alle API-Calls, Fehler mit try/catch + Toast
- Navigation: `location.hash = '#/pfad'` (nie `location.href`)
