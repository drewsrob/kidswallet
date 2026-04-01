import{g as e,l as t,m as n,r,u as i}from"./index-CAzKeS1O.js";import{n as a,t as o}from"./template-CRf3gOUw.js";import{t as s}from"./Modal-Bo7RHeCF.js";import{t as c}from"./Toast-BYCYXKyv.js";var l=o(`<!-- @block: main -->\r
<section class="view-section" aria-label="Taschengeld-Regeln">\r
  <div class="view-header">\r
    <div>\r
      <h1>\${icon(child.avatar, { size: 24, className: 'inline-icon' })} \${escapeHtml(child.name)}</h1>\r
      <p class="text-muted text-sm">Taschengeld-Regeln</p>\r
    </div>\r
    <button class="btn btn-primary" id="btn-add-allowance" type="button">+ Regel hinzufügen</button>\r
  </div>\r
\r
  \${allowances.length > 0\r
    ? \`<ul class="allowance-list" id="allowance-list" aria-label="Taschengeld-Regeln">\r
        \${allowances.map(a => allowanceItem({ allowance: a, currency })).join('')}\r
      </ul>\`\r
    : \`<div class="empty-state">\r
        <span class="empty-icon">\${icon('coin', { size: 48 })}</span>\r
        <p>Noch keine Taschengeld-Regeln. Regel hinzufügen!</p>\r
      </div>\`}\r
\r
  <aside class="admin-info-note">\r
    <p class="admin-info-note__text">\r
      \${icon('info', { size: 16 })}\r
      Das Taschengeld wird automatisch beim Öffnen der App gutgeschrieben, wenn der Zahltag erreicht ist.\r
    </p>\r
  </aside>\r
</section>\r
\r
<!-- @block: allowanceItem -->\r
<li class="allowance-item" data-allowance-id="\${allowance.id}">\r
  <div class="allowance-info">\r
    <div class="allowance-amount">\${formatCurrency(allowance.amount, currency)}</div>\r
    <div class="allowance-schedule">\${formatAllowanceSchedule(allowance)}</div>\r
    \${allowance.lastExecuted\r
      ? \`<div class="text-xs text-muted">Zuletzt: \${allowance.lastExecuted}</div>\`\r
      : ''}\r
  </div>\r
  <div class="allowance-actions">\r
    <label class="toggle" aria-label="\${allowance.isActive ? 'Aktiv' : 'Inaktiv'}">\r
      <input type="checkbox"\r
        \${allowance.isActive ? 'checked' : ''}\r
        data-action="toggle"\r
        data-allowance-id="\${allowance.id}">\r
      <span class="toggle-slider"></span>\r
    </label>\r
    <button class="btn btn-ghost btn-sm btn-icon"\r
      data-action="edit" data-allowance-id="\${allowance.id}"\r
      type="button" aria-label="Bearbeiten">\r
      \${icon('edit', { size: 20 })}\r
    </button>\r
    <button class="btn btn-ghost btn-sm btn-icon"\r
      data-action="delete" data-allowance-id="\${allowance.id}"\r
      type="button" aria-label="Löschen">\r
      \${icon('trash', { size: 20 })}\r
    </button>\r
  </div>\r
</li>\r
\r
<!-- @block: allowanceForm -->\r
<div class="form-group">\r
  <label class="form-label" for="allowance-amount">Betrag (\${currency})</label>\r
  <input class="form-input" id="allowance-amount" type="number"\r
    min="0.01" max="9999.99" step="0.01"\r
    value="\${existing?.amount ?? ''}" placeholder="z.B. 2.00">\r
</div>\r
\r
<div class="form-group">\r
  <label class="form-label" for="allowance-frequency">Häufigkeit</label>\r
  <select class="form-select" id="allowance-frequency">\r
    <option value="weekly"  \${(!existing || existing.frequency === 'weekly')  ? 'selected' : ''}>Wöchentlich</option>\r
    <option value="monthly" \${existing?.frequency === 'monthly' ? 'selected' : ''}>Monatlich</option>\r
  </select>\r
</div>\r
\r
<div id="weekly-options"\r
  style="\${(!existing || existing.frequency === 'weekly') ? '' : 'display:none'}">\r
  <div class="form-group">\r
    <label class="form-label" for="allowance-day-of-week">Wochentag</label>\r
    <select class="form-select" id="allowance-day-of-week">\r
      \${DAY_NAMES.map((name, idx) => \`\r
        <option value="\${idx}" \${existing?.dayOfWeek === idx ? 'selected' : ''}>\${name}</option>\r
      \`).join('')}\r
    </select>\r
  </div>\r
</div>\r
\r
<div id="monthly-options"\r
  style="\${existing?.frequency === 'monthly' ? '' : 'display:none'}">\r
  <div class="form-group">\r
    <label class="form-label" for="allowance-day-of-month">Tag des Monats (1–28)</label>\r
    <input class="form-input" id="allowance-day-of-month" type="number"\r
      min="1" max="28" value="\${existing?.dayOfMonth ?? 1}" placeholder="1">\r
  </div>\r
</div>\r
`),u=class{constructor(e){this.childId=e,this.child=null,this.allowances=[],this._handlers=[]}_guardAuth(){return n().adminAuthenticated?!0:(location.hash=`#/admin`,!1)}async render(){if(!this._guardAuth())return`<div></div>`;let{children:t,settings:i}=n();if(this.child=t.find(e=>e.id===this.childId),!this.child)return`
        <div class="empty-state">
          <span class="empty-icon">${r(`alert-circle`,{size:48})}</span>
          <h2>Kind nicht gefunden</h2>
          <button class="btn btn-primary mt-lg" onclick="location.hash='#/admin/children'">Zurück</button>
        </div>
      `;document.getElementById(`toolbar-title`).textContent=`Taschengeld – ${this.child.name}`;try{this.allowances=await e.getAllowances(this.childId)}catch{this.allowances=[]}let o=i.currency??`€`;return a(l.main,{child:this.child,allowances:this.allowances,currency:o,allowanceItem:({allowance:e,currency:t})=>a(l.allowanceItem,{allowance:e,currency:t})})}mount(){let e=document.getElementById(`btn-add-allowance`);if(e){let t=()=>this._showAllowanceForm();e.addEventListener(`click`,t),this._handlers.push({el:e,type:`click`,fn:t})}let t=document.getElementById(`allowance-list`);if(t){let e=async e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,allowanceId:r}=t.dataset;if(n===`edit`&&this._showAllowanceForm(r),n===`delete`&&this._deleteAllowance(r),n===`toggle`){let e=t.checked;await this._toggleAllowance(r,e)}};t.addEventListener(`click`,e),t.addEventListener(`change`,e),this._handlers.push({el:t,type:`click`,fn:e}),this._handlers.push({el:t,type:`change`,fn:e})}}async _showAllowanceForm(t=null){let r=!!t,i=r?this.allowances.find(e=>e.id===t):null,{settings:o}=n(),u=o.currency??`€`,d=a(l.allowanceForm,{existing:i,currency:u});if(await new Promise(e=>{let t=new s({title:r?`Regelanpassen`:`Neue Taschengeld-Regel`,content:d,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:r?`Speichern`:`Hinzufügen`,value:`submit`,variant:`primary`}]}).open();requestAnimationFrame(()=>{let e=document.getElementById(`allowance-frequency`);e&&e.addEventListener(`change`,()=>{let t=e.value;document.getElementById(`weekly-options`).style.display=t===`weekly`?``:`none`,document.getElementById(`monthly-options`).style.display=t===`monthly`?``:`none`})}),t.then(e)})!==`submit`)return;let f=parseFloat(document.getElementById(`allowance-amount`)?.value),p=document.getElementById(`allowance-frequency`)?.value,m=parseInt(document.getElementById(`allowance-day-of-week`)?.value??`6`),h=parseInt(document.getElementById(`allowance-day-of-month`)?.value??`1`);if(isNaN(f)||f<=0){c.error(`Ungültiger Betrag.`);return}let g={amount:f,frequency:p,dayOfWeek:m,dayOfMonth:h};try{r?(await e.updateAllowance(t,g),c.success(`Regel aktualisiert.`)):(await e.createAllowance(this.childId,g),c.success(`Taschengeld-Regel hinzugefügt! 💰`)),await this._refreshAllowances()}catch(e){c.error(e.message)}}async _toggleAllowance(t,n){let r=this.allowances.find(e=>e.id===t);if(r)try{await e.updateAllowance(t,{amount:r.amount,frequency:r.frequency,dayOfWeek:r.dayOfWeek,dayOfMonth:r.dayOfMonth,isActive:n}),r.isActive=n,c.info(`Regel ${n?`aktiviert`:`deaktiviert`}.`)}catch(e){c.error(e.message)}}async _deleteAllowance(r){let a=this.allowances.find(e=>e.id===r);if(a&&await new s({title:`Regel löschen?`,content:`<p>Taschengeld-Regel (${i(a.amount,n().settings.currency??`€`)}, ${t(a)}) wirklich löschen?</p>`,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:`Löschen`,value:`confirm`,variant:`danger`}]}).open()===`confirm`)try{await e.deleteAllowance(r),c.success(`Regel gelöscht.`),await this._refreshAllowances()}catch(e){c.error(e.message)}}async _refreshAllowances(){try{this.allowances=await e.getAllowances(this.childId)}catch{}let t=await this.render();document.getElementById(`app`).innerHTML=t,this.mount()}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{u as default};