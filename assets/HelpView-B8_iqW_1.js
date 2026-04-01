import{n as e,t}from"./template-CRf3gOUw.js";var n=`<!-- @block: layout -->\r
<div class="help-view view-section">\r
\r
  <!-- Intro -->\r
  <div class="help-header">\r
    <div class="help-header-icon">\${icon('book', { size: 40 })}</div>\r
    <h1 class="help-header-title">KidsWallet Hilfe</h1>\r
    <p class="help-header-subtitle">Alle Funktionen auf einen Blick</p>\r
  </div>\r
\r
  <!-- ── 1. Startseite ──────────────────────────────────────────────── -->\r
  <details class="help-section" open>\r
    <summary class="help-section-header">\r
      <span class="help-section-icon">\${icon('house', { size: 20 })}</span>\r
      <span class="help-section-title">Startseite</span>\r
      <span class="help-section-chevron">\${icon('chevron-right', { size: 18 })}</span>\r
    </summary>\r
    <div class="help-section-body">\r
      <p class="help-desc">\r
        Die Startseite zeigt alle angelegten Kinder als bunte Karten. Jede Karte zeigt den aktuellen Kontostand und – falls aktive Sparziele vorhanden sind – einen kleinen Fortschrittsbalken des nächsten Ziels. Tippt man auf eine Karte, öffnet sich das Konto des Kindes.\r
      </p>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Beispiel: Kinderkarte</span>\r
        <div class="hp-child-card">\r
          <div class="hp-child-card-top">\r
            <div class="hp-child-avatar">\${icon('star', { size: 22 })}</div>\r
            <span class="hp-child-name">Mia</span>\r
          </div>\r
          <div class="hp-child-balance">12,50 €</div>\r
          <div class="hp-goals-strip">\r
            <div class="hp-goals-strip-top">\r
              <span>🎯 1 Sparziel aktiv</span>\r
              <span>Fahrrad · 78 %</span>\r
            </div>\r
            <div class="hp-goals-bar-track">\r
              <div class="hp-goals-bar-fill" style="width: 78%;"></div>\r
            </div>\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
  </details>\r
\r
  <!-- ── 2. Wallet / Konto ──────────────────────────────────────────── -->\r
  <details class="help-section">\r
    <summary class="help-section-header">\r
      <span class="help-section-icon">\${icon('coin', { size: 20 })}</span>\r
      <span class="help-section-title">Kinderkonto (Wallet)</span>\r
      <span class="help-section-chevron">\${icon('chevron-right', { size: 18 })}</span>\r
    </summary>\r
    <div class="help-section-body">\r
      <p class="help-desc">\r
        Das Kinderkonto zeigt den Kontostand als große Hero-Karte oben. Darunter befinden sich drei Schnellaktionen sowie die Taschengeld-Übersicht, aktive Sparziele und die letzten Transaktionen.\r
      </p>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Hero-Karte &amp; Schnellaktionen</span>\r
\r
        <!-- Hero -->\r
        <div class="hp-wallet-hero">\r
          <div class="hp-wallet-hero-name">Mias Konto</div>\r
          <div class="hp-wallet-hero-balance">12,50 €</div>\r
        </div>\r
\r
        <!-- Quick actions -->\r
        <div class="hp-quick-actions">\r
          <div class="hp-qa-btn">\r
            <div class="hp-qa-icon hp-qa-icon--primary">\${icon('target', { size: 20 })}</div>\r
            Sparziele\r
          </div>\r
          <div class="hp-qa-btn">\r
            <div class="hp-qa-icon hp-qa-icon--danger">\${icon('minus-circle', { size: 20 })}</div>\r
            Ausgabe\r
          </div>\r
          <div class="hp-qa-btn">\r
            <div class="hp-qa-icon hp-qa-icon--muted">\${icon('list', { size: 20 })}</div>\r
            Verlauf\r
          </div>\r
        </div>\r
      </div>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Transaktionsverlauf</span>\r
        <div class="hp-tx-list">\r
          <div class="hp-tx-item">\r
            <div class="hp-tx-icon hp-tx-icon--credit">\${icon('plus', { size: 18 })}</div>\r
            <div class="hp-tx-info">\r
              <div class="hp-tx-desc">Taschengeld</div>\r
              <div class="hp-tx-date">heute</div>\r
            </div>\r
            <span class="hp-tx-amount hp-tx-amount--credit">+ 5,00 €</span>\r
          </div>\r
          <div class="hp-tx-item">\r
            <div class="hp-tx-icon hp-tx-icon--debit">\${icon('minus', { size: 18 })}</div>\r
            <div class="hp-tx-info">\r
              <div class="hp-tx-desc">Eis kaufen</div>\r
              <div class="hp-tx-date">gestern</div>\r
            </div>\r
            <span class="hp-tx-amount hp-tx-amount--debit">− 1,50 €</span>\r
          </div>\r
          <div class="hp-tx-item">\r
            <div class="hp-tx-icon hp-tx-icon--debit">\${icon('target', { size: 18 })}</div>\r
            <div class="hp-tx-info">\r
              <div class="hp-tx-desc">→ Ziel: Fahrrad</div>\r
              <div class="hp-tx-date">vor 2 Tagen</div>\r
            </div>\r
            <span class="hp-tx-amount hp-tx-amount--debit">− 2,00 €</span>\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
  </details>\r
\r
  <!-- ── 3. Sparziele ───────────────────────────────────────────────── -->\r
  <details class="help-section">\r
    <summary class="help-section-header">\r
      <span class="help-section-icon">\${icon('target', { size: 20 })}</span>\r
      <span class="help-section-title">Sparziele</span>\r
      <span class="help-section-chevron">\${icon('chevron-right', { size: 18 })}</span>\r
    </summary>\r
    <div class="help-section-body">\r
      <p class="help-desc">\r
        Kinder können auf bestimmte Wünsche sparen. Jedes Ziel hat einen Namen, ein Symbol, einen Zielbetrag und einen optionalen Anfangsbetrag. Über die Sparziele-Seite können Beträge auf ein Ziel eingezahlt werden. Ist das Ziel zu 100 % erreicht, erscheint der Button&nbsp;„Kaufen" – damit wird der Betrag abgebucht und das Ziel als erfüllt markiert.\r
      </p>\r
\r
      <ul class="help-steps">\r
        <li class="help-step">\r
          <span class="help-step-num">1</span>\r
          <span>Im Konto auf <strong>Sparziele</strong> tippen.</span>\r
        </li>\r
        <li class="help-step">\r
          <span class="help-step-num">2</span>\r
          <span>Auf <strong>+&nbsp;Neues Ziel</strong> tippen, Name, Symbol und Zielbetrag eingeben.</span>\r
        </li>\r
        <li class="help-step">\r
          <span class="help-step-num">3</span>\r
          <span>Auf einer Zielkarte <strong>Sparen</strong> wählen und den Betrag eingeben.</span>\r
        </li>\r
        <li class="help-step">\r
          <span class="help-step-num">4</span>\r
          <span>Bei 100 % erscheint <strong>Kaufen</strong> – damit wird das Ziel abgeschlossen.</span>\r
        </li>\r
      </ul>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Beispiel: Zielkarte</span>\r
        <div class="hp-goal-card">\r
          <div class="hp-goal-header">\r
            <div class="hp-goal-icon">\${icon('bike', { size: 24 })}</div>\r
            <div class="hp-goal-info">\r
              <div class="hp-goal-name">Fahrrad</div>\r
              <div class="hp-goal-amount">39,00 € / 50,00 €</div>\r
            </div>\r
          </div>\r
          <div class="hp-goal-bar-track">\r
            <div class="hp-goal-bar-fill" style="width: 78%;"></div>\r
          </div>\r
          <div class="hp-goal-actions">\r
            <div class="hp-goal-btn">\${icon('trash', { size: 14 })}&nbsp;Löschen</div>\r
            <div class="hp-goal-btn hp-goal-btn--primary">\${icon('plus', { size: 14 })}&nbsp;Sparen</div>\r
          </div>\r
        </div>\r
        <div class="hp-goal-card" style="opacity: 0.7;">\r
          <div class="hp-goal-header">\r
            <div class="hp-goal-icon">\${icon('gamepad', { size: 24 })}</div>\r
            <div class="hp-goal-info">\r
              <div class="hp-goal-name">Spielkonsole</div>\r
              <div class="hp-goal-amount">30,00 € / 30,00 €</div>\r
            </div>\r
          </div>\r
          <div class="hp-goal-bar-track">\r
            <div class="hp-goal-bar-fill" style="width: 100%;"></div>\r
          </div>\r
          <div class="hp-goal-actions">\r
            <div class="hp-goal-btn">\${icon('trash', { size: 14 })}&nbsp;Löschen</div>\r
            <div class="hp-goal-btn hp-goal-btn--primary">\${icon('check', { size: 14 })}&nbsp;Kaufen</div>\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
  </details>\r
\r
  <!-- ── 4. Ausgabe buchen ──────────────────────────────────────────── -->\r
  <details class="help-section">\r
    <summary class="help-section-header">\r
      <span class="help-section-icon">\${icon('minus-circle', { size: 20 })}</span>\r
      <span class="help-section-title">Ausgabe buchen</span>\r
      <span class="help-section-chevron">\${icon('chevron-right', { size: 18 })}</span>\r
    </summary>\r
    <div class="help-section-body">\r
      <p class="help-desc">\r
        Mit dem Button <strong>Ausgabe</strong> im Konto lässt sich eine Ausgabe manuell erfassen – zum Beispiel wenn das Kind am Kiosk Geld ausgegeben hat. Der Betrag wird vom Kontostand abgezogen. Das Konto darf dabei auch ins Minus gehen (z.&nbsp;B. Schulden eintragen).\r
      </p>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Ausgabe-Formular</span>\r
        <div class="hp-modal">\r
          <p class="hp-modal-title">\${icon('minus-circle', { size: 18 })}&nbsp; Ausgabe buchen</p>\r
          <div class="hp-form-group">\r
            <label class="hp-form-label">Betrag (€)</label>\r
            <input class="hp-form-input" type="text" value="2,50" readonly>\r
          </div>\r
          <div class="hp-form-group">\r
            <label class="hp-form-label">Beschreibung (optional)</label>\r
            <input class="hp-form-input" type="text" value="Eis kaufen" readonly>\r
          </div>\r
          <button class="hp-form-btn">\${icon('minus-circle', { size: 16 })}&nbsp; Ausgabe buchen</button>\r
        </div>\r
      </div>\r
    </div>\r
  </details>\r
\r
  <!-- ── 5. Taschengeld-Regeln ─────────────────────────────────────── -->\r
  <details class="help-section">\r
    <summary class="help-section-header">\r
      <span class="help-section-icon">\${icon('clock', { size: 20 })}</span>\r
      <span class="help-section-title">Taschengeld-Regeln</span>\r
      <span class="help-section-chevron">\${icon('chevron-right', { size: 18 })}</span>\r
    </summary>\r
    <div class="help-section-body">\r
      <p class="help-desc">\r
        Im Admin-Bereich können für jedes Kind automatische Taschengeld-Regeln angelegt werden. Das Taschengeld wird dann wöchentlich oder monatlich an einem bestimmten Tag automatisch gutgeschrieben – ganz ohne manuelles Eingreifen. Mehrere Regeln pro Kind sind möglich.\r
      </p>\r
\r
      <ul class="help-steps">\r
        <li class="help-step">\r
          <span class="help-step-num">1</span>\r
          <span>Admin-Bereich öffnen (Menü → <strong>Admin-Bereich</strong>).</span>\r
        </li>\r
        <li class="help-step">\r
          <span class="help-step-num">2</span>\r
          <span>Auf <strong>Kinder verwalten</strong> → Kind auswählen → <strong>Taschengeld</strong> tippen.</span>\r
        </li>\r
        <li class="help-step">\r
          <span class="help-step-num">3</span>\r
          <span>Betrag, Häufigkeit (wöchentlich / monatlich) und Wochentag / Monatstag eingeben.</span>\r
        </li>\r
      </ul>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Beispiel: Taschengeld-Regel</span>\r
        <div class="hp-rule-card">\r
          <div class="hp-rule-row">\r
            <span class="hp-rule-label">Betrag</span>\r
            <span class="hp-rule-value">5,00 €</span>\r
          </div>\r
          <div class="hp-rule-row">\r
            <span class="hp-rule-label">Häufigkeit</span>\r
            <span class="hp-rule-badge">\${icon('clock', { size: 14 })}&nbsp;Wöchentlich</span>\r
          </div>\r
          <div class="hp-rule-row">\r
            <span class="hp-rule-label">Wochentag</span>\r
            <span class="hp-rule-value">Freitag</span>\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
  </details>\r
\r
  <!-- ── 6. Admin-Bereich ───────────────────────────────────────────── -->\r
  <details class="help-section">\r
    <summary class="help-section-header">\r
      <span class="help-section-icon">\${icon('shield', { size: 20 })}</span>\r
      <span class="help-section-title">Admin-Bereich</span>\r
      <span class="help-section-chevron">\${icon('chevron-right', { size: 18 })}</span>\r
    </summary>\r
    <div class="help-section-body">\r
      <p class="help-desc">\r
        Der Admin-Bereich ist mit einem PIN geschützt. Hier können Kinder angelegt, bearbeitet und gelöscht werden, Taschengeld-Regeln verwaltet sowie der Admin-PIN geändert werden. Der Standard-PIN beim ersten Start lautet&nbsp;<strong>1234</strong>.\r
      </p>\r
\r
      <ul class="help-steps">\r
        <li class="help-step">\r
          <span class="help-step-num">1</span>\r
          <span>Menü öffnen (Burger-Symbol links) → <strong>Admin-Bereich</strong> tippen.</span>\r
        </li>\r
        <li class="help-step">\r
          <span class="help-step-num">2</span>\r
          <span>PIN eingeben (Standard: <strong>1234</strong>).</span>\r
        </li>\r
        <li class="help-step">\r
          <span class="help-step-num">3</span>\r
          <span>Über <strong>Einstellungen</strong> den PIN jederzeit ändern.</span>\r
        </li>\r
      </ul>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Admin-Navigation</span>\r
        <div class="hp-admin-nav">\r
          <div class="hp-admin-nav-item">\r
            <span class="hp-admin-icon">\${icon('user', { size: 28 })}</span>\r
            Kinder verwalten\r
          </div>\r
          <div class="hp-admin-nav-item">\r
            <span class="hp-admin-icon">\${icon('settings', { size: 28 })}</span>\r
            Einstellungen\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
  </details>\r
\r
  <!-- ── 7. Dunkelmodus & Erscheinungsbild ─────────────────────────── -->\r
  <details class="help-section">\r
    <summary class="help-section-header">\r
      <span class="help-section-icon">\${icon('moon', { size: 20 })}</span>\r
      <span class="help-section-title">Dunkelmodus</span>\r
      <span class="help-section-chevron">\${icon('chevron-right', { size: 18 })}</span>\r
    </summary>\r
    <div class="help-section-body">\r
      <p class="help-desc">\r
        Das Hell-/Dunkelmodus-Toggle befindet sich im Seitenmenü (Menü öffnen → Schalter unten). Die Einstellung wird gespeichert und beim nächsten Öffnen der App automatisch wiederhergestellt.\r
      </p>\r
\r
      <div class="help-preview">\r
        <span class="help-preview-label">Wo zu finden?</span>\r
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--color-surface-raised); border: 1px solid var(--color-border); border-radius: 14px; width: 100%; max-width: 300px; box-sizing: border-box;">\r
          <span style="color: var(--color-primary);">\${icon('moon', { size: 22 })}</span>\r
          <span style="flex: 1; font-size: 14px; font-weight: 600; color: var(--color-text);">Dunkelmodus</span>\r
          <span style="width: 46px; height: 26px; border-radius: 13px; background: var(--color-primary); display: flex; align-items: center; padding: 0 4px; box-sizing: border-box;">\r
            <span style="width: 20px; height: 20px; border-radius: 50%; background: #fff; margin-left: auto; display: block;"></span>\r
          </span>\r
        </div>\r
      </div>\r
    </div>\r
  </details>\r
\r
</div>\r
`,r=class{async render(){return e(t(n).layout,{})}};export{r as default};