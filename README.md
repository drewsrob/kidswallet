# KidsWallet

Taschengeld-Verwaltung für Kinder – Vanilla JavaScript, Vite und Capacitor (PWA und Android-App).

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server: http://localhost:5173/kidswallet/
npm run build      # Web-Build (PWA) nach dist/
npm test          # Finanzregeln, Buchungen, Migration und Backups
```

## Vorschuss & Schulden

Im Kinderkonto lassen sich unter **Vorschuss & Schulden** pro Kind Vorschüsse freigeben,
ein hartes Gesamtlimit und ein Gebührenmodell festlegen. Standardmäßig sind neue Vorschüsse
deaktiviert. Das Limit umfasst Vorschussschuld und offene Leihgebühren gemeinsam. Reicht es
einschließlich der einmaligen Gebühr nicht, wird die gesamte Ausgabe ohne Teilbuchung abgelehnt.
Eine neue Leihgebühr entsteht erst wieder, nachdem die gesamte vorherige Schuld getilgt wurde.

Guthaben (`child.balance`, nie negativ) und Schuld (`child.debt.principal` / `fees`) sind getrennt.
Der Netto-Saldo ist Guthaben minus Gesamtschuld. Bei einer Ausgabe wird nur der fehlende Betrag
als Vorschuss aufgenommen. Ein vorhandener negativer Alt-Saldo wird einmalig durch eine sichtbare
Vorschussbuchung übernommen; der Netto-Saldo bleibt unverändert. Bestehende Schulden bleiben
auch nach dem Abschalten neuer Vorschüsse bestehen. Ein aktives Limit kann nicht unter die
offene Gesamtschuld abgesenkt werden.

Automatisches Taschengeld wird vollständig als Einnahme gebucht. Im Modell **Automatische Tilgung**
(intern weiterhin `feeModel: 'interest'`) tilgt der konfigurierte Anteil (0–100 %, centgenau gerundet)
die echte Schuld; die Schuld wächst nicht. Beispiel: 5 € Schuld, 2,50 € Taschengeld, 10 % Tilgung ergeben
4,75 € Restschuld und 2,25 € neues Guthaben. Bei den Modellen **Keine Gebühren** und **Feste Gebühr**
werden bis zu 100 % des Taschengelds zur Tilgung eingesetzt. Jede Tilgung ist auf die offene Schuld
begrenzt; Gebühren werden zuerst getilgt. Manuelle Einnahmen bleiben Guthaben und können mit
**Schulden zurückzahlen** ausdrücklich eingesetzt werden.

Vorschuss (`advance`), Leihgebühr (`loan_fee`), Tilgung (`debt_repayment`) und Taschengeld
(`allowance`) bleiben eigene Buchungen. `groupId` verknüpft zusammengehörige Vorgänge;
`cashChange`, `principalChange`, `feeChange`, `balanceAfter` und `debtAfter` dokumentieren
die jeweiligen Auswirkungen. Tilgungen zum Taschengeld referenzieren zusätzlich dessen
`sourceTransactionId` und den angewendeten Prozentsatz. `financialStatus` in der lokalen API
liefert verfügbare Mittel, Schuldkomponenten, Netto-Saldo, Regeln und Tilgungsart
(`repaymentMode`: `percent` oder `full`) auch für eine spätere Kinderansicht.
`previewAllowanceRepayment(child, betrag)` berechnet mit derselben Logik wie die Buchung, wie
viel einer Taschengeldzahlung tilgt und gutgeschrieben wird. `getDebtProgress(buchungen)` liefert
für den aktuellen Vorschussvorgang (seit die Schuld zuletzt bei 0 lag) den insgesamt geliehenen
und den bereits zurückgezahlten Betrag. `getRepaymentProgress(kind, buchungen)` fasst das als
`{open, repaid, total, percent}` zusammen (Gesamtschuld = offen + getilgt, inkl. Leihgebühren).
Eine Kinderansicht wird noch nicht eingeblendet.

Übersichtsseiten zeigen nur den Zustand: Die Vorschuss-Karte nennt offene Schulden, Gesamtschuld
und Schuldenlimit sowie einen Tilgungsbalken („1,80 € von 8,00 € getilgt“); die Hero-Karte zeigt
offene Schulden und den Nettostand. Regeln und Berechnungslogik stehen ausschließlich im
Einstellungsdialog und in der Kontext-Hilfe. Der Rückzahlungsdialog bietet eine Schnellauswahl
(1, 2, 5 €, „Vollständig“ = min(Guthaben, offene Schulden)); freie Eingabe bleibt möglich.

Auswertungen zählen Vorschuss und Tilgung separat als Finanzierungstransfers, nicht erneut als
Einnahmen bzw. Ausgaben. Gebühren sind Ausgaben. Backups der Version 2 erhalten Regeln,
Schuldkomponenten und Buchungsverknüpfungen; Version 1 kann weiterhin importiert werden.
Die Anwendung nutzt die lokale Datenschicht (Browser und Android), nicht die historische
Server-API.

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
