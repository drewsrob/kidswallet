# KidsWallet

Taschengeld-Verwaltung für Kinder – Vanilla JavaScript, Vite und Capacitor (PWA und Android-App).

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server: http://localhost:5173/kidswallet/
npm run build      # Web-Build (PWA) nach dist/
```

## Web-Veröffentlichung

Jeder Push auf `main` baut die PWA per GitHub Actions und veröffentlicht sie auf `gh-pages`.
Die Live-Seite ist unter https://drewsrob.github.io/kidswallet/ erreichbar. Der Workflow lässt sich
außerdem im GitHub-Reiter **Actions** manuell starten.

## Android Build

Die Android-App wird vollständig aus VS Code bzw. dem Terminal gebaut und installiert – Android Studio ist
für die tägliche Entwicklung nicht nötig.

| Befehl | Beschreibung |
|---|---|
| `npm run android:sync` | Web-App für Android bauen und mit `npx cap sync android` ins Android-Projekt übernehmen |
| `npm run android:build` | Sync und Debug-APK erstellen (`android/app/build/outputs/apk/debug/`) |
| `npm run android:install` | Debug-APK bauen und auf dem angeschlossenen Smartphone **aktualisieren** (`adb install -r`), anschließend starten |
| `npm run android:release` | Sync und Release-APK erstellen (`android/app/build/outputs/apk/release/`, unsigniert) |
| `npm run android:run` | `npx cap run android` – Auswahl von Gerät oder Emulator |

Alle Befehle stehen auch als VS-Code-Tasks bereit: **Terminal → Run Task → Android …**
(„Android Install“ ist der Standard-Build-Task, `Strg+Umschalt+B`).

Täglicher Ablauf:

```bash
npm run android:install
```

### Hinweise

- **Daten bleiben erhalten:** `android:install` aktualisiert die vorhandene Installation. localStorage mit
  Kindern, Buchungen, Sparzielen, Regeln und Einstellungen bleibt bestehen. Die App wird nie automatisch
  deinstalliert – auch nicht, wenn die installierte Version mit einem anderen Schlüssel signiert wurde.
  In diesem Fall bricht das Skript ab und lässt die Installation unverändert. Ein Update erfordert denselben
  Signaturschlüssel; für Debug-Builds ist das `%USERPROFILE%\.android\debug.keystore` des Rechners, auf dem
  die installierte Version gebaut wurde.
- **Gerät:** USB-Debugging aktivieren und das Smartphone verbinden. Das Gerät wird vor dem Build geprüft.
  Bei mehreren Geräten das Ziel mit der Umgebungsvariable `ANDROID_SERIAL` festlegen. Bricht die
  ADB-Verbindung ab, startet das Skript den ADB-Server neu und versucht es noch einmal.
- **Voraussetzungen:** Android SDK (gefunden über `ANDROID_HOME`, `ANDROID_SDK_ROOT`, `android/local.properties`
  oder den Standardpfad) und JDK 21 (`JAVA_HOME`, sonst das JDK von Android Studio). `adb` muss nicht im
  `PATH` liegen.
- **Web-Build:** Die Android-Befehle bauen mit `npm run build:android` (Basis `/` statt `/kidswallet/`).
  `dist/` enthält danach den Android-Build; für die PWA vor dem Deployment erneut `npm run build` ausführen.
- **Release:** Die Release-APK ist unsigniert. Für die Verteilung muss sie mit einem eigenen Keystore
  signiert werden.
- **Maven Central:** `android/build.gradle` bezieht Maven-Central-Artefakte zuerst über `repo1.maven.org`,
  weil `repo.maven.apache.org` in manchen Netzen mit 403 antwortet.

Die Logik liegt in [`scripts/android.mjs`](scripts/android.mjs).
