---
applyTo: "**"
---

# KidsWallet – Projekt-Übersicht & Konventionen

## Projektbeschreibung

KidsWallet ist eine Touch-optimierte Web-App für iPad-Browser zur Verwaltung von Kinder-Taschengeld.
Eltern verwalten Wallets im PIN-geschützten Admin-Bereich. Kinder sehen ihren Kontostand, Transaktionen und Sparziele.

## Tech-Stack (STRIKT einhalten)

- **Backend:** Node.js + Express, JSON-Datei (`data/data.json`) als Datenbank
- **Frontend:** HTML5 (semantisch) + Vanilla CSS (Custom Properties) + Vanilla JS (ES Modules)
- **VERBOTEN:** Kein React, Vue, Angular, Svelte, Tailwind, Bootstrap, Sass/SCSS, jQuery, lodash oder andere Frameworks/Libraries außer Express

## Projektstruktur

```
KidsWallet/
├── package.json
├── server.js                     # Express-Backend & API
├── data/
│   └── data.json                 # Persistenz
├── public/
│   ├── index.html                # SPA-Shell
│   ├── css/
│   │   ├── reset.css
│   │   ├── variables.css         # Alle Design-Tokens
│   │   ├── base.css
│   │   ├── layout.css
│   │   ├── components.css        # Buttons, Cards, Modals, Inputs, Toast
│   │   └── views/
│   │       ├── home.css
│   │       ├── wallet.css
│   │       ├── admin.css
│   │       └── goals.css
│   └── js/
│       ├── app.js                # Einstiegspunkt, Hash-Router
│       ├── api.js                # fetch()-Wrapper
│       ├── state.js              # Mini-State mit Event-Bus
│       ├── utils.js              # Hilfsfunktionen
│       ├── views/
│       │   ├── HomeView.js
│       │   ├── WalletView.js
│       │   ├── GoalsView.js
│       │   └── admin/
│       │       ├── AdminView.js
│       │       ├── AdminChildrenView.js
│       │       ├── AdminAllowanceView.js
│       │       └── AdminSettingsView.js
│       └── components/
│           ├── Modal.js
│           ├── Toast.js
│           ├── AvatarPicker.js
│           └── ColorPicker.js
└── .github/copilot/
    ├── kidswallet-project.instructions.md     (diese Datei)
    ├── kidswallet-data-model.instructions.md
    ├── vanilla-js-spa.instructions.md
    └── vanilla-css.instructions.md
```

## Konventionen

### Benennung

- JS-Klassen: PascalCase (`WalletView`, `Modal`)
- JS-Dateien: PascalCase für Views/Komponenten, camelCase für Utilities
- CSS-Klassen: kebab-case (`.wallet-header`, `.btn-primary`)
- CSS Custom Properties: `--kebab-case`

### HTML

- Semantische Elemente überall: `<main>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<footer>`, `<dialog>` wo sinnvoll
- ARIA-Attribute für Modals und interaktive Elemente
- `lang="de"` auf `<html>`

### Sprache

- Alle UI-Texte auf Deutsch
- Kommentare im Code auf Deutsch oder Englisch (konsistent innerhalb einer Datei)

### Touch-Optimierung (iPad)

- Alle klickbaren Elemente: min. 48×48px
- Formularfelder: font-size min. 16px (verhindert iOS-Auto-Zoom)
- Keine Hover-only Interaktionen
- Scrollbare Bereiche: `-webkit-overflow-scrolling: touch`

### Sicherheit

- PIN niemals als Klartext speichern (SHA-256 Hash)
- Alle Server-Inputs validieren (Länge, Typ, Format)
- Keine HTML-Injektion: Nutzereingaben escapen

### Start

```bash
npm install
npm start
# → http://localhost:3000
# Kein PIN voreingestellt – PIN-Schutz optional unter Verwaltung → Einstellungen
```
