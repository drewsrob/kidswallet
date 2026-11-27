import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

const isAndroid = process.env.BUILD_TARGET === 'android';
const base = isAndroid ? '/' : '/kidswallet/';
const iconBase = isAndroid ? '' : '/kidswallet';

// Farbschema „System“: Jede Regel mit [data-theme="dark"] erhält direkt dahinter eine Kopie in
// @media (prefers-color-scheme: dark), die greift, solange nicht ausdrücklich „Hell“ gewählt ist.
// So bleiben die dunklen Styles einmalig gepflegt, die Umschaltung erledigt der Browser per CSS.
const DARK_SELECTOR = '[data-theme="dark"]';
// :where() hält die Spezifität identisch zu [data-theme="dark"] (eine Pseudoklasse = ein Attribut)
const SYSTEM_DARK_SELECTOR = ':root:where(:not([data-theme]), [data-theme="system"])';

function systemColorScheme() {
  return {
    postcssPlugin: 'kidswallet-system-color-scheme',
    Once(root, { AtRule }) {
      root.walkRules((rule) => {
        if (!rule.selector.includes(DARK_SELECTOR)) return;
        const selectors = rule.selectors
          .filter((s) => s.includes(DARK_SELECTOR))
          .map((s) => s.replaceAll(DARK_SELECTOR, SYSTEM_DARK_SELECTOR));
        const media = new AtRule({ name: 'media', params: '(prefers-color-scheme: dark)' });
        media.append(rule.clone({ selectors }));
        rule.after(media);
      });
    },
  };
}
systemColorScheme.postcss = true;

export default defineConfig({
  // Projekt-Root: index.html liegt im Root-Verzeichnis
  root: '.',

  // Base-URL: '/' für Android, '/kidswallet/' für GitHub Pages
  base,

  // Quell-Verzeichnis für Assets (öffentliche statische Dateien)
  publicDir: 'public',

  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'KidsWallet – Taschengeld',
        short_name: 'KidsWallet',
        description: 'Taschengeld-Verwaltung für Kinder',
        theme_color: '#6c63ff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'de',
        start_url: base,
        scope: base,
        id: base,
        icons: [
          {
            src: `${iconBase}/icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${iconBase}/icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: `${iconBase}/icon-maskable-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: `${iconBase}/icon-maskable-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Offline-First: App läuft vollständig ohne Netzwerk
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [],
      },
    }),
  ],

  css: {
    postcss: { plugins: [systemColorScheme()] },
  },

  server: {
    port: 5173,
  },

  build: {
    // Ausgabe-Verzeichnis für Produktion
    outDir: 'dist',
    emptyOutDir: true,
  },
});

