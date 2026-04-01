import{a as e,f as t,g as n,m as r,o as i,r as a,u as o}from"./index-CAzKeS1O.js";import{n as s,t as c}from"./template-CRf3gOUw.js";import{t as l}from"./Modal-Bo7RHeCF.js";import{t as u}from"./Toast-BYCYXKyv.js";var d=c(`<!-- @block: main -->\r
<section class="view-wallet view-section" aria-label="Wallet von \${escapeHtml(child.name)}">\r
\r
  <div class="wallet-hero">\r
    <div class="wallet-avatar" aria-hidden="true">\${icon(child.avatar, { size: 52 })}</div>\r
    <div class="wallet-name">\${escapeHtml(child.name)}</div>\r
    <div class="wallet-balance" data-balance="\${child.balance}">\${formatCurrency(child.balance, currency)}</div>\r
  </div>\r
\r
  <div class="wallet-quick-actions" role="group" aria-label="Aktionen">\r
    <button class="quick-action-btn quick-action-btn--success" id="btn-earn" type="button">\r
      <span class="quick-icon" aria-hidden="true">\${icon('plus-circle', { size: 30 })}</span>\r
      <span>Einnahme</span>\r
    </button>\r
    <button class="quick-action-btn quick-action-btn--danger" id="btn-spend" type="button">\r
      <span class="quick-icon" aria-hidden="true">\${icon('minus-circle', { size: 30 })}</span>\r
      <span>Ausgabe</span>\r
    </button>\r
    <button class="quick-action-btn" id="btn-goals" type="button">\r
      <span class="quick-icon" aria-hidden="true">\${icon('target', { size: 30 })}</span>\r
      <span>Sparziele</span>\r
      \${activeGoals.length > 0\r
        ? \`<span class="badge badge-primary">\${activeGoals.length}</span>\`\r
        : ''}\r
    </button>\r
    <button class="quick-action-btn" id="btn-show-all-tx" type="button">\r
      <span class="quick-icon" aria-hidden="true">\${icon('list', { size: 30 })}</span>\r
      <span>Verlauf</span>\r
    </button>\r
  </div>\r
\r
  \${allowances.length > 0 ? \`\r
    <section class="wallet-allowances" aria-label="Taschengeld-Regeln">\r
      <h2>\${icon('clock', { size: 18, className: 'inline-icon' })} Taschengeld-Regeln</h2>\r
      <ul class="allowance-list-compact">\r
        \${allowances.map(a => allowanceItem({ allowance: a, currency })).join('')}\r
      </ul>\r
    </section>\r
  \` : ''}\r
\r
  \${activeGoals.length > 0 ? goalsPreview({ goals: activeGoals, currency, balance: child.balance }) : ''}\r
\r
  <section class="transactions-section" aria-label="Letzte Buchungen">\r
    <h2>\${icon('list', { size: 18, className: 'inline-icon' })} Letzte Buchungen</h2>\r
    \${transactionList({ transactions: transactions.slice(0, 10), currency })}\r
  </section>\r
\r
</section>\r
\r
<!-- @block: allowanceItem -->\r
<li class="allowance-item-compact\${allowance.isActive ? '' : ' inactive'}">\r
  <span class="allowance-item-compact-schedule">\r
    \${icon('clock', { size: 14, className: 'inline-icon' })}\r
    \${formatCurrency(allowance.amount, currency)}\r
    – \${formatAllowanceSchedule(allowance)}\r
  </span>\r
  \${!allowance.isActive ? \`<span class="badge badge-muted">Inaktiv</span>\` : ''}\r
</li>\r
\r
<!-- @block: goalsPreview -->\r
<section class="wallet-goals-preview" aria-label="Sparziele">\r
  <h2>\${icon('target', { size: 18, className: 'inline-icon' })} Meine Sparziele</h2>\r
  \${goals.slice().sort((a, b) => (balance / b.targetAmount) - (balance / a.targetAmount)).slice(0, 2).map(g => {\r
    const pct = Math.min(100, Math.round((balance / g.targetAmount) * 100));\r
    const canBuy = balance >= g.targetAmount;\r
    return \`<article class="wallet-goal-card\${canBuy ? ' wallet-goal-card--reachable' : ''}">\r
      <header class="wallet-goal-card__header">\r
        <span class="wallet-goal-card__title">\${icon(g.icon, { size: 18, className: 'inline-icon' })} <strong>\${escapeHtml(g.name)}</strong></span>\r
        <span class="wallet-goal-card__percent\${canBuy ? ' wallet-goal-card__percent--done' : ''}">\${pct}%</span>\r
      </header>\r
      <div class="progress-bar wallet-goal-card__progress">\r
        <div class="progress-fill\${canBuy ? ' complete' : ''}" style="--target-width: \${pct}%;"></div>\r
      </div>\r
      <footer class="wallet-goal-card__meta">\r
        \${canBuy\r
          ? \`<span style="color:var(--color-success);font-weight:var(--font-bold)">🎉 Kaufbereit!</span>\`\r
          : \`<span>noch \${formatCurrency(g.targetAmount - balance, currency)} fehlen</span>\`\r
        }\r
        <span>Ziel: \${formatCurrency(g.targetAmount, currency)}</span>\r
      </footer>\r
    </article>\`;\r
  }).join('')}\r
</section>\r
\r
<!-- @block: transactionList -->\r
\${!transactions.length\r
  ? \`<div class="empty-state">\r
      <span class="empty-icon">\${icon('list', { size: 48 })}</span>\r
      <p>Noch keine Buchungen</p>\r
    </div>\`\r
  : \`<ul class="transactions-list" aria-label="Buchungen">\r
      \${transactions.map((tx, i) => \`\r
        <li class="transaction-item" style="animation-delay: \${i * 45}ms">\r
          <div class="transaction-icon" aria-hidden="true">\${getTxIcon(tx.type)}</div>\r
          <div class="transaction-meta">\r
            <div class="transaction-desc">\${escapeHtml(tx.description)}</div>\r
            <time class="transaction-date" datetime="\${tx.date}">\${formatRelativeDate(tx.date)}</time>\r
          </div>\r
          <div class="transaction-amount \${tx.amount >= 0 ? 'amount-positive' : 'amount-negative'}">\r
            \${tx.amount >= 0 ? '+' : ''}\${formatCurrency(tx.amount, currency)}\r
          </div>\r
        </li>\r
      \`).join('')}\r
    </ul>\`}\r
`),f=class{constructor(e){this.childId=e,this.child=null,this.transactions=[],this._handlers=[],this._flashType=null}async render(){let{children:e,settings:o}=r();if(this.child=e.find(e=>e.id===this.childId),!this.child)return`
        <div class="empty-state">
          <span class="empty-icon">${a(`alert-circle`,{size:48})}</span>
          <h2>Kind nicht gefunden</h2>
          <button class="btn btn-primary mt-lg" onclick="location.hash='#/'">Zurück</button>
        </div>
      `;i(this.child.colorPaletteIndex),document.getElementById(`toolbar-title`).textContent=this.child.name;let c=o.currency??`€`,l=t(this.child.colorPaletteIndex);try{this.transactions=await n.getTransactions(this.childId)}catch{this.transactions=[]}let u=[];try{u=await n.getGoals(this.childId)}catch{u=[]}let f=[];try{f=await n.getAllowances(this.childId)}catch{f=[]}return s(d.main,{child:this.child,colors:l,transactions:this.transactions,activeGoals:u.filter(e=>!e.purchasedAt),allowances:f,currency:c,allowanceItem:({allowance:e,currency:t})=>s(d.allowanceItem,{allowance:e,currency:t}),goalsPreview:({goals:e,currency:t,balance:n})=>s(d.goalsPreview,{goals:e,currency:t,balance:n}),transactionList:({transactions:e,currency:t})=>s(d.transactionList,{transactions:e,currency:t})})}mount(){let{settings:t}=r(),n=t.currency??`€`,i=document.querySelector(`.wallet-balance[data-balance]`);if(i){if(this._flashType){let e=this._flashType;this._flashType=null,i.classList.add(`wallet-balance--flash-${e}`),i.addEventListener(`animationend`,()=>i.classList.remove(`wallet-balance--flash-${e}`),{once:!0})}e(i,0,parseFloat(i.dataset.balance),n)}let a=document.getElementById(`btn-goals`);if(a){let e=()=>{location.hash=`#/wallet/${this.childId}/goals`};a.addEventListener(`click`,e),this._handlers.push({el:a,type:`click`,fn:e})}let o=document.getElementById(`btn-earn`);if(o){let e=()=>this._earnMoney();o.addEventListener(`click`,e),this._handlers.push({el:o,type:`click`,fn:e})}let s=document.getElementById(`btn-spend`);if(s){let e=()=>this._spendMoney();s.addEventListener(`click`,e),this._handlers.push({el:s,type:`click`,fn:e})}let c=document.getElementById(`btn-show-all-tx`);if(c){let e=()=>this._showAllTransactions();c.addEventListener(`click`,e),this._handlers.push({el:c,type:`click`,fn:e})}}async _earnMoney(){let{settings:e}=r(),t=e.currency??`€`;if(await new l({title:`Einnahme buchen`,content:`
        <div class="form-group">
          <label class="form-label" for="earn-amount">Betrag (${t})</label>
          <input class="form-input" id="earn-amount" type="number"
            min="0.01" step="0.01"
            placeholder="z.B. 10.00" autocomplete="off">
        </div>
        <div class="form-group">
          <label class="form-label" for="earn-desc">Beschreibung (optional)</label>
          <input class="form-input" id="earn-desc" type="text"
            maxlength="60" placeholder="z.B. Geschenk von Oma">
        </div>
      `,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:`Buchen`,value:`confirm`,variant:`primary`}],validate:e=>{if(e!==`confirm`)return!0;let t=parseFloat(document.getElementById(`earn-amount`)?.value);return isNaN(t)||t<=0?(u.error(`Bitte einen Betrag eingeben.`),!1):!0}}).open()!==`confirm`)return;let i=parseFloat(document.getElementById(`earn-amount`)?.value),a=document.getElementById(`earn-desc`)?.value?.trim()||`Einnahme`;try{let e=await n.addTransaction(this.childId,{amount:i,type:`manual`,description:a});this.child.balance=e.newBalance,u.success(`${o(i,t)} gutgeschrieben.`),this._flashType=`pos`,await this._refresh()}catch(e){u.error(e.message)}}async _spendMoney(){let{settings:e}=r(),t=e.currency??`€`,i=this.child.balance;if(await new l({title:`Ausgabe buchen`,content:`
        <div class="form-group">
          <label class="form-label" for="spend-amount">Betrag (${t})</label>
          <input class="form-input" id="spend-amount" type="number"
            min="0.01" step="0.01"
            placeholder="z.B. 5.00" autocomplete="off">
        </div>
        <div class="form-group">
          <label class="form-label" for="spend-desc">Beschreibung (optional)</label>
          <input class="form-input" id="spend-desc" type="text"
            maxlength="60" placeholder="z.B. Eis gekauft">
        </div>
        <p class="modal-note">Verfügbares Guthaben: <strong>${o(i,t)}</strong></p>
      `,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:`Buchen`,value:`confirm`,variant:`primary`}],validate:e=>{if(e!==`confirm`)return!0;let t=parseFloat(document.getElementById(`spend-amount`)?.value);return isNaN(t)||t<=0?(u.error(`Bitte einen Betrag eingeben.`),!1):!0}}).open()!==`confirm`)return;let a=parseFloat(document.getElementById(`spend-amount`)?.value),s=document.getElementById(`spend-desc`)?.value?.trim()||`Ausgabe`;try{let e=await n.addTransaction(this.childId,{amount:-a,type:`manual`,description:s});this.child.balance=e.newBalance,u.success(`${o(a,t)} abgezogen.`),this._flashType=`neg`,await this._refresh()}catch(e){u.error(e.message)}}async _refresh(){let{settings:e,children:i}=r();this.child=i.find(e=>e.id===this.childId)||this.child,e.currency,t(this.child.colorPaletteIndex);try{this.transactions=await n.getTransactions(this.childId)}catch{}try{await n.getGoals(this.childId)}catch{}try{await n.getAllowances(this.childId)}catch{}let a=document.querySelector(`.view-wallet`);a&&(this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[],a.outerHTML=await this.render(),this.mount())}async _showAllTransactions(){let{settings:e}=r(),t=e.currency??`€`;if(!this.transactions.length){u.info(`Noch keine Buchungen vorhanden.`);return}await new l({title:`Alle Buchungen`,content:`
        <div class="modal-scroll">
          ${(({transactions:e,currency:t})=>s(d.transactionList,{transactions:e,currency:t}))({transactions:this.transactions,currency:t})}
        </div>
      `,actions:[{label:`Schließen`,value:`close`,variant:`secondary`}]}).open()}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{f as default};