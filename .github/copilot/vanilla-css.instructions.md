---
applyTo: "public/css/**"
---

# KidsWallet – Vanilla CSS Design-System

## Design-Token-Hierarchie

Alle Werte kommen aus `variables.css` CSS Custom Properties.
Niemals Hard-coded Farben, Abstände oder Größen in anderen CSS-Dateien!
Ausnahme: Strukturelle Layout-Werte (z.B. `display: flex`).

## variables.css – vollständige Token-Liste

### Farbpaletten (8 Stück, Index 0–7)

```css
--palette-0-primary: #6c63ff;
--palette-0-light: #ede9ff; /* Lila */
--palette-1-primary: #ff6b6b;
--palette-1-light: #fff0f0; /* Rot */
--palette-2-primary: #43aa8b;
--palette-2-light: #e8f8f1; /* Grün */
--palette-3-primary: #f9a826;
--palette-3-light: #fff8e1; /* Orange */
--palette-4-primary: #ef476f;
--palette-4-light: #fce4ec; /* Pink */
--palette-5-primary: #118ab2;
--palette-5-light: #e1f5fe; /* Blau */
--palette-6-primary: #8ac926;
--palette-6-light: #f1f8e9; /* Hellgrün */
--palette-7-primary: #9b5de5;
--palette-7-light: #f3e5ff; /* Violett */
```

### Aktives Kind-Farbschema (wird per JS auf :root gesetzt)

```css
--child-primary: var(--palette-0-primary); /* Fallback */
--child-light: var(--palette-0-light);
```

### Systemfarben

```css
--color-bg: #f4f6fb;
--color-surface: #ffffff;
--color-border: #e2e8f0;
--color-text: #1a202c;
--color-text-muted: #718096;
--color-text-inverse: #ffffff;
--color-success: #38a169;
--color-success-light: #f0fff4;
--color-danger: #e53e3e;
--color-danger-light: #fff5f5;
--color-warning: #d69e2e;
--color-warning-light: #fffff0;
--color-info: #3182ce;
--color-info-light: #ebf8ff;
```

### Spacing (8pt System)

```css
--space-xs: 0.25rem; /*  4px */
--space-sm: 0.5rem; /*  8px */
--space-md: 1rem; /* 16px */
--space-lg: 1.5rem; /* 24px */
--space-xl: 2rem; /* 32px */
--space-2xl: 3rem; /* 48px */
```

### Typografie (Fluid mit clamp)

```css
--text-xs: clamp(0.7rem, 1.2vw, 0.75rem);
--text-sm: clamp(0.8rem, 1.5vw, 0.875rem);
--text-base: clamp(0.95rem, 2vw, 1rem);
--text-lg: clamp(1.1rem, 2.5vw, 1.25rem);
--text-xl: clamp(1.3rem, 3vw, 1.5rem);
--text-2xl: clamp(1.6rem, 4vw, 2rem);
--text-3xl: clamp(2rem, 5vw, 2.5rem);
--font-normal: 400;
--font-medium: 500;
--font-bold: 700;
--line-height: 1.5;
--font-family:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Border-Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-xl: 28px;
--radius-full: 9999px;
```

### Schatten

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08);
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.14);
```

### Übergänge

```css
--transition-fast: 150ms ease;
--transition: 200ms ease;
--transition-slow: 350ms ease;
```

### Touch-Targets

```css
--touch-min: 48px;
```

### Z-Index-Skala

```css
--z-base: 0;
--z-overlay: 50;
--z-modal: 100;
--z-toast: 200;
```

## Komponenten-Muster

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  min-height: var(--touch-min);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border: none;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    opacity var(--transition-fast);
  text-decoration: none;
  -webkit-user-select: none;
  user-select: none;
}
.btn:active {
  transform: scale(0.96);
  opacity: 0.9;
}
.btn-primary {
  background: var(--child-primary);
  color: var(--color-text-inverse);
}
.btn-secondary {
  background: var(--color-surface);
  border: 2px solid var(--child-primary);
  color: var(--child-primary);
}
.btn-danger {
  background: var(--color-danger);
  color: var(--color-text-inverse);
}
.btn-ghost {
  background: transparent;
  color: var(--color-text);
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
}
.child-card {
  background: var(--child-light);
  border-left: 4px solid var(--child-primary);
}
```

### Formularfelder

```css
.form-input {
  width: 100%;
  min-height: var(--touch-min);
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-base); /* WICHTIG: >= 16px verhindert iOS-Zoom! */
  font-family: var(--font-family);
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color var(--transition);
  -webkit-appearance: none;
  appearance: none;
}
.form-input:focus {
  outline: none;
  border-color: var(--child-primary);
}
```

## Wichtige CSS-Regeln

- Alle klickbaren Elemente: `:active` State definieren
- Touch-Scrolling: `overflow-y: auto; -webkit-overflow-scrolling: touch;`
- `box-sizing: border-box` universal (im reset.css)
- Formularfelder: font-size MINDESTENS var(--text-base) ≈ 16px (iOS-Zoom-Schutz)
- Keine `hover:`-only Interaktionen (Touch hat kein Hover)
- `scroll-behavior: smooth` auf `html`
