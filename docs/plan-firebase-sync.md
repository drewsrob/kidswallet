# Plan: Geräteübergreifende Synchronisierung + Familienkonten mit Firebase

## Entscheidungen

- **Backend:** Firebase Firestore (kostenloses Spark-Tier)
- **Auth:** Firebase Anonymous Auth beim App-Start (unsichtbar) + optionales Upgrade auf Email/Passwort
- **Sync ist OPT-IN:** App funktioniert ohne Registrierung; Sync wird in den Einstellungen aktiviert
- **Offline-First:** Firestore SDK hat eingebaute Offline-Persistenz via IndexedDB (`enableIndexedDbPersistence`)
- **Echtzeit:** Firestore `onSnapshot()` Listener in HomeView + WalletView
- **Admin-PIN:** bleibt unverändert für lokale Admin-UI-Absicherung
- **E-Mail-Benachrichtigungen:** KEIN E-Mail — stattdessen In-App-Badge/Hinweis für Admin (bleibt im kostenlosen Tier)
- **API-Interface:** `api-firebase.js` implementiert exakt dieselbe Schnittstelle wie `api-local.js` → Views bleiben weitgehend unverändert

---

## User Journey

1. App installieren → startet direkt (kein Login-Dialog) → Firebase erstellt anonym eine Auth-Session im Hintergrund
2. Daten werden unter `families/{anonUid}/...` in Firestore gespeichert — funktioniert sofort
3. **Optionaler Weg zu Sync:** Einstellungen → „Synchronisierung aktivieren" → E-Mail + Passwort eingeben
   → `linkWithCredential(EmailAuthProvider.credential(...))` upgradet den anonymen Account → **alle Daten bleiben erhalten**
4. Zweites Gerät: App installieren → „Anmelden" (nur wenn Sync gewünscht) → Familie beitreten

> **Hinweis:** Wer die App deinstalliert ohne Sync aktiviert zu haben, verliert seine Daten — genau wie heute mit localStorage. Das ist das erwartete Verhalten.

---

## Familienkonten-Modell (tolino-Stil)

- Ein Nutzer gründet die Familie → wird **Admin** → bekommt einen lesbaren `inviteCode` (z. B. `WOLF-7821`)
- Andere können der Familie beitreten:
  - **Per E-Mail-Einladung:** Admin gibt E-Mail-Adresse ein → Person sieht Einladung nach Sync-Aktivierung
  - **Per Family-ID:** Person gibt inviteCode ein → Admin sieht ausstehende Anfrage mit Badge → bestätigt/lehnt ab
- Nur ein Admin pro Familie; Mitglieder können Daten lesen, Admin verwaltet Kinder/Einstellungen (bestehende PIN-Guard-Logik)

---

## Firestore Datenstruktur

```
users/{uid}
  - email, displayName, familyId (null | string), role ('admin'|'member'|null), createdAt

families/{familyId}
  - name ("Familie Müller")
  - adminUid
  - inviteCode                ← lesbarer Code, z.B. "WOLF-7821"
  - createdAt
  - members:         [{uid, email, displayName, role, joinedAt}]
  - pendingRequests: [{uid, email, displayName, requestedAt, method: 'email_invite'|'family_id'}]

families/{familyId}/settings/...
families/{familyId}/children/...
families/{familyId}/transactions/...
families/{familyId}/allowances/...
families/{familyId}/goals/...
```

---

## Flows

1. **Sync aktivieren (erster Nutzer):** Anonymous → E-Mail/Passwort eingeben → Account upgrade → Onboarding
2. **Familie gründen:** `families`-Dokument anlegen, `inviteCode` generieren, `users/{uid}.familyId` setzen, `role = 'admin'`
3. **Per E-Mail einladen (Admin):** Admin gibt E-Mail ein → `pendingRequest` mit `method: 'email_invite'` → Eingeladener sieht Hinweis nach Sync-Aktivierung
4. **Per Family-ID beitreten:** Nutzer gibt `inviteCode` ein → `pendingRequest` angelegt → Warteanzeige → Admin sieht Badge
5. **Admin bestätigt/lehnt ab:** `user.familyId` gesetzt → Mitglied hat sofort Zugriff (via `onSnapshot`)

---

## Umsetzungsphasen

### Phase 1 — Firebase-Projekt einrichten *(manuell, einmalig)*

1. Firebase-Projekt anlegen auf [firebase.google.com](https://firebase.google.com)
2. **Firestore Database** aktivieren (Region: `europe-west1`)
3. **Authentication → Email/Password** aktivieren
4. **Authentication → Anonymous** aktivieren
5. Firebase Config (`apiKey`, `projectId`, `appId`, …) bereithalten für Phase 2

### Phase 2 — Firebase SDK & Initialisierung

6. `npm install firebase`
7. `src/js/firebase.js` **(NEU)**
   - Firebase App initialisieren mit Config aus Umgebungsvariable / Build-Constant
   - Firestore initialisieren + `enableIndexedDbPersistence()` (Offline-Support)
   - `signInAnonymously()` beim ersten Start
   - Auth- und Firestore-Instanz exportieren

### Phase 3 — Sync-Aktivierung in den Einstellungen

8. `src/js/views/admin/AdminSettingsView.js` — neuer Abschnitt „Synchronisierung"
   - Status: „Nicht aktiviert" / „Aktiv als [email]"
   - Button „Synchronisierung aktivieren" → öffnet Modal mit E-Mail + Passwort
   - `linkWithCredential()` auf anonymen Account → bei Erfolg: Onboarding-Flow
   - Button „Abmelden" (nur wenn Sync aktiv) → `signOut()` + Redirect
9. `src/js/state.js` — Felder `user` + `family` ergänzen

### Phase 4 — Onboarding (Familie gründen oder beitreten)

10. `src/js/views/auth/OnboardingView.js` + `.html` + `.css` **(NEU)**
    - Wird gezeigt wenn `user.familyId === null` (nach Sync-Aktivierung)
    - **Option A: „Familie gründen"**
      - `families`-Dokument anlegen, `inviteCode` generieren (`WORT-ZAHL`-Format)
      - `users/{uid}.familyId` setzen, `role = 'admin'` → Redirect zu `#/`
    - **Option B: „Per Family-ID beitreten"**
      - Eingabefeld für `inviteCode` → Family-Dokument suchen → `pendingRequest` erstellen
      - Warteanzeige: „Deine Anfrage ist ausstehend. Der Admin muss sie bestätigen."
11. Einladungs-Erkennung: wenn `pendingRequest` mit eigener E-Mail existiert → Einladung annehmen statt manuell beitreten

### Phase 5 — Familienverwaltung im Admin-Bereich

12. `src/js/views/admin/AdminFamilyView.js` + `.html` + `.css` **(NEU)** — neuer Tab im Admin-Menü
    - Zeigt: kopierbaren `inviteCode`, Mitgliederliste mit Rollen
    - Zeigt: **Badge** mit Anzahl offener Beitrittsanfragen (live via `onSnapshot`)
    - „Per E-Mail einladen": Admin gibt E-Mail ein → `pendingRequest` mit `method: 'email_invite'`
    - Bestätigen / Ablehnen von Anfragen → bei Bestätigung: `user.familyId` gesetzt, in `members[]` aufgenommen

### Phase 6 — Firestore API-Schicht

13. `src/js/api-firebase.js` **(NEU)** — exakt dieselbe Schnittstelle wie `api-local.js`
    - Alle Operationen auf `families/{familyId}/...`
    - Methoden: `getState`, `verifyPin`, `getChildren`, `createChild`, `updateChild`, `deleteChild`, `getTransactions`, `addTransaction`, `getAllowances`, `createAllowance`, `updateAllowance`, `deleteAllowance`, `processAllowances`, `getGoals`, `createGoal`, `updateGoal`, `getSettings`, `updateSettings`
14. `src/js/api.js` — einzeilige Umleitung von `api-local` auf `api-firebase`

### Phase 7 — Echtzeit-Updates

15. `src/js/views/HomeView.js` — `onSnapshot()` auf `children`-Kollektion → automatisches Re-Render
16. `src/js/views/WalletView.js` — `onSnapshot()` auf `transactions` + `goals` des aktiven Kindes
17. `src/js/views/admin/AdminFamilyView.js` — `onSnapshot()` auf `families/{familyId}` → Badge aktualisiert sich live
18. **Pflicht:** Listener-Cleanup in jedem `unmount()` — sonst Memory Leaks

### Phase 8 — Datenmigration *(einmalig)*

19. Nach Sync-Aktivierung prüfen: Firestore-Familie leer + `localStorage` hat Daten?
    → Modal „Vorhandene Daten zu Firebase übertragen?" → bei Bestätigung: einmalige Migration

### Phase 9 — Firestore Security Rules

20. Rules in der Firebase Console oder `firestore.rules`:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Jeder Auth-User darf nur sein eigenes User-Dokument lesen/schreiben
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Familie: nur Mitglieder dürfen lesen/schreiben
    match /families/{familyId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.members.map(m, m.uid);

      // Subkollektionen: gleiche Regel
      match /{subcollection=**} {
        allow read, write: if request.auth != null
          && get(/databases/$(database)/documents/families/$(familyId))
             .data.members.map(m, m.uid).hasAny([request.auth.uid]);
      }
    }
  }
}
```

---

## Betroffene Dateien

| Datei | Status | Änderung |
|-------|--------|----------|
| `package.json` | ändern | `firebase` dependency hinzufügen |
| `src/js/firebase.js` | **NEU** | App-Init, Persistence, Anonymous Auth |
| `src/js/api-firebase.js` | **NEU** | ~500 Zeilen, vollständige Firestore-API |
| `src/js/api.js` | ändern | 1-Zeilen-Umleitung auf `api-firebase` |
| `src/js/app.js` | ändern | `onAuthStateChanged`-Guard, Onboarding-Routing |
| `src/js/state.js` | ändern | Felder `user` + `family` |
| `src/js/views/auth/OnboardingView.{js,html,css}` | **NEU** | Familie gründen / beitreten |
| `src/js/views/admin/AdminSettingsView.js` | ändern | Sync-Aktivieren-Bereich |
| `src/js/views/admin/AdminFamilyView.{js,html,css}` | **NEU** | Mitglieder + Beitrittsanfragen |
| `src/js/views/HomeView.js` | ändern | `onSnapshot`-Listener |
| `src/js/views/WalletView.js` | ändern | `onSnapshot`-Listener |
| Firebase Console | manuell | Firestore + Auth + Security Rules einrichten |

---

## Verification

1. App starten → kein Login-Dialog → funktioniert direkt wie bisher
2. Einstellungen → „Synchronisierung aktivieren" → E-Mail eingeben → Onboarding erscheint
3. „Familie gründen" → `inviteCode` wird angezeigt und ist kopierbar
4. Zweites Gerät: „Synchronisierung aktivieren" → „Per Family-ID beitreten" → Admin sieht Badge → bestätigt → Gerät 2 hat sofort Zugriff
5. Admin lädt per E-Mail ein → Person aktiviert Sync → sieht Einladungsdialog statt leerem Onboarding
6. Transaktion auf Gerät A → erscheint auf Gerät B in ~1 Sekunde (Live-Update)
7. Gerät offline → Transaktion hinzufügen → online gehen → Daten synchronisiert
8. Firebase Console zeigt Daten unter `families/{uid}/...`
9. `npm run build:android` baut fehlerfrei
