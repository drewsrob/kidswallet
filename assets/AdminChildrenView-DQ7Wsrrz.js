import{c as e,f as t,g as n,h as r,m as i}from"./index-CAzKeS1O.js";import{i as a,n as o,r as s,t as c}from"./template-CRf3gOUw.js";import{t as l}from"./Modal-Bo7RHeCF.js";import{t as u}from"./Toast-BYCYXKyv.js";var d=c(`<!-- @block: childrenList -->\r
<section class="view-section" aria-label="Kinder verwalten">\r
  <div class="view-header">\r
    <h1>Kinder verwalten</h1>\r
    <button class="btn btn-primary" id="btn-add-child" type="button">+ Kind hinzufügen</button>\r
  </div>\r
\r
  \${children.length > 0\r
    ? \`<ul class="admin-children-list" id="children-list" aria-label="Kinder">\r
        \${children.map(child => childItem({ child, currency })).join('')}\r
      </ul>\`\r
    : \`<div class="empty-state">\r
        <span class="empty-icon">\${icon('user', { size: 48 })}</span>\r
        <p>Noch keine Kinder. Füge das erste Kind hinzu!</p>\r
      </div>\`}\r
</section>\r
\r
<!-- @block: childItem -->\r
<li class="admin-child-item" style="--child-color: \${colors.primary}">\r
  <span class="admin-child-avatar"\r
    aria-hidden="true">\${icon(child.avatar, { size: 28 })}</span>\r
  <div class="admin-child-info">\r
    <div class="admin-child-name">\${escapeHtml(child.name)}</div>\r
    <div class="admin-child-balance">Kontostand: \${formatCurrency(child.balance, currency)}</div>\r
  </div>\r
  <div class="admin-child-actions">\r
    <button class="btn btn-secondary btn-sm"\r
      data-action="allowances" data-child-id="\${child.id}" type="button"\r
      aria-label="Taschengeld für \${escapeHtml(child.name)}">\r
      \${icon('coin', { size: 16 })} Taschengeld\r
    </button>\r
    <button class="btn btn-ghost btn-sm btn-icon"\r
      data-action="edit" data-child-id="\${child.id}" type="button"\r
      aria-label="\${escapeHtml(child.name)} bearbeiten">\r
      \${icon('edit', { size: 20 })}\r
    </button>\r
    <button class="btn btn-ghost btn-sm btn-icon"\r
      data-action="delete" data-child-id="\${child.id}" type="button"\r
      aria-label="\${escapeHtml(child.name)} löschen">\r
      \${icon('trash', { size: 20 })}\r
    </button>\r
  </div>\r
</li>\r
\r
<!-- @block: childForm -->\r
<div class="form-group">\r
  <label class="form-label" for="child-name">Name</label>\r
  <input class="form-input" id="child-name" type="text"\r
    value="\${escapeHtml(existing?.name ?? '')}"\r
    placeholder="z.B. Mia" maxlength="50" autocomplete="off">\r
</div>\r
\r
\${!isEdit ? \`\r
  <div class="form-group">\r
    <label class="form-label" for="child-balance">Grundbetrag (\${currency})</label>\r
    <input class="form-input" id="child-balance" type="number"\r
      min="0" max="99999" step="0.01" value="0" placeholder="0.00">\r
    <span class="form-hint">Wird als Startsaldo dem Wallet gutgeschrieben.</span>\r
  </div>\r
\` : ''}\r
\r
<div class="form-group">\r
  <p class="form-label">Avatar wählen</p>\r
  \${renderAvatarPicker(selectedAvatar, 'modal-avatar-picker')}\r
</div>\r
\r
<div class="form-group">\r
  <p class="form-label">Farbe wählen</p>\r
  \${renderColorPicker(selectedPalette, 'modal-color-picker')}\r
</div>\r
\r
\${!isEdit ? allowanceFields() : ''}\r
\r
<!-- @block: allowanceFields -->\r
<hr class="form-divider">\r
<p class="form-section-title">\r
  \${icon('coin', { size: 16, className: 'inline-icon' })}\r
  Taschengeld einrichten <span class="form-hint">(optional)</span>\r
</p>\r
\r
<div class="allowance-inline-row">\r
  <div class="form-group">\r
    <label class="form-label" for="inline-allowance-amount">Betrag (€)</label>\r
    <input class="form-input" id="inline-allowance-amount"\r
      type="number" min="0" max="9999.99" step="0.01" placeholder="z.B. 2.00">\r
  </div>\r
\r
  <div class="form-group">\r
    <label class="form-label" for="inline-allowance-day">Wochentag</label>\r
    <select class="form-select" id="inline-allowance-day">\r
      \${DAY_NAMES.map((name, idx) => \`\r
        <option value="\${idx}" \${idx === 6 ? 'selected' : ''}>\${name}</option>\r
      \`).join('')}\r
    </select>\r
  </div>\r
</div>\r
\r
<span class="form-hint">\r
  Leer lassen, falls kein Taschengeld eingerichtet werden soll.\r
</span>\r
`),f=class{constructor(){this._handlers=[]}_guardAuth(){return i().adminAuthenticated?!0:(location.hash=`#/admin`,!1)}async render(){if(!this._guardAuth())return`<div></div>`;let e=[];try{e=await n.getChildren(),r({children:e})}catch{u.error(`Kinder konnten nicht geladen werden.`)}let a=i().settings.currency??`€`;return o(d.childrenList,{children:e,currency:a,childItem:({child:e,currency:n})=>{let r=t(e.colorPaletteIndex);return o(d.childItem,{child:e,currency:n,colors:r})}})}mount(){let e=document.getElementById(`btn-add-child`);if(e){let t=()=>this._showChildForm();e.addEventListener(`click`,t),this._handlers.push({el:e,type:`click`,fn:t})}let t=document.getElementById(`children-list`);if(t){let e=e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,childId:r}=t.dataset;n===`edit`&&this._showChildForm(r),n===`delete`&&this._deleteChild(r),n===`allowances`&&(location.hash=`#/admin/allowances/${r}`)};t.addEventListener(`click`,e),this._handlers.push({el:t,type:`click`,fn:e})}}async _showChildForm(t=null){let r=!!t,{children:c,settings:f}=i(),p=f.currency??`€`,m=r?c.find(e=>e.id===t):null,h=m?.avatar??`star`,g=m?.colorPaletteIndex??0,_=o(d.childForm,{existing:m,currency:p,selectedAvatar:h,selectedPalette:g,isEdit:r,allowanceFields:()=>o(d.allowanceFields,{})}),v=()=>{},y=()=>{},b=await new Promise(e=>{let t=new l({title:r?`${m.name} bearbeiten`:`Kind hinzufügen`,content:_,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:r?`Speichern`:`Hinzufügen`,value:`submit`,variant:`primary`}]}).open();requestAnimationFrame(()=>{v=a(`modal-avatar-picker`,e=>{h=e}),y=s(`modal-color-picker`,e=>{g=e})}),t.then(e)});if(v(),y(),b!==`submit`)return;let x=document.getElementById(`child-name`)?.value?.trim();if(!x){u.error(`Bitte einen Namen eingeben.`);return}try{if(r){let r=await n.updateChild(t,{name:x,avatar:h,colorPaletteIndex:g});u.success(`${e(r.name)} aktualisiert.`)}else{let t=parseFloat(document.getElementById(`child-balance`)?.value??`0`)||0,r=await n.createChild({name:x,avatar:h,colorPaletteIndex:g,balance:t}),i=parseFloat(document.getElementById(`inline-allowance-amount`)?.value??`0`),a=parseInt(document.getElementById(`inline-allowance-day`)?.value??`6`);if(i>0)try{await n.createAllowance(r.id,{amount:i,frequency:`weekly`,dayOfWeek:isNaN(a)?6:a,dayOfMonth:null})}catch{u.info(`Kind angelegt, Taschengeld-Regel konnte nicht gespeichert werden.`)}u.success(`${e(r.name)} wurde hinzugefügt!`)}await this._refresh()}catch(e){u.error(e.message)}}async _deleteChild(t){let r=i().children.find(e=>e.id===t);if(r&&await new l({title:`Kind entfernen?`,content:`
        <p>Soll <strong>${e(r.name)}</strong> wirklich entfernt werden?</p>
        <p class="text-danger text-sm">
          ⚠️ Alle Transaktionen, Taschengeld-Regeln und Sparziele werden ebenfalls gelöscht.
        </p>
      `,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:`Endgültig löschen`,value:`confirm`,variant:`danger`}]}).open()===`confirm`)try{await n.deleteChild(t),u.success(`${e(r.name)} wurde entfernt.`),await this._refresh()}catch(e){u.error(e.message)}}async _refresh(){try{r({children:await n.getChildren()})}catch{}let e=await this.render();document.getElementById(`app`).innerHTML=e,this.mount()}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{f as default};