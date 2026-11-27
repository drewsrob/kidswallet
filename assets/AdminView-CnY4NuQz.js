import{F as e,G as t,L as n,c as r,n as i,t as a}from"./security-BjFG_6IR.js";import{t as o}from"./api-DitHL2SU.js";import{n as s,t as c}from"./template-eUISzhwL.js";/* empty css              */var l=c(`<!-- @block: pinScreen -->\r
<section class="view-admin-pin view-section" aria-label="\${t('management.unlockLabel')}">\r
  <div class="card admin-pin-card">\r
    <div class="admin-pin-icon" aria-hidden="true">\${icon('lock', { size: 48 })}</div>\r
    <h1 class="admin-pin-title">\${t('management.title')}</h1>\r
    <p class="admin-pin-hint" id="pin-hint">\${t('management.unlockHint')}</p>\r
    <form id="pin-form" novalidate>\r
      <div class="form-group">\r
        <label class="form-label" for="pin-input">\${t('pin.label')}</label>\r
        <input\r
          class="form-input pin-input"\r
          id="pin-input"\r
          type="password"\r
          inputmode="numeric"\r
          autocomplete="current-password"\r
          maxlength="12"\r
          placeholder="••••"\r
          aria-describedby="pin-hint pin-error"\r
          autofocus\r
        >\r
      </div>\r
      <p class="form-error" id="pin-error" hidden role="alert"></p>\r
      <button class="btn btn-primary btn-full" type="submit" id="btn-pin-submit">\r
        \${t('management.unlock')}\r
      </button>\r
    </form>\r
  </div>\r
</section>\r
\r
<!-- @block: dashboard -->\r
<section class="view-admin view-section" aria-labelledby="admin-title">\r
  \${sectionHeader({\r
    level: 1, id: 'admin-title', title: t('management.title'), subtitle: t('management.intro'),\r
    action: pinEnabled ? { id: 'btn-logout', icon: 'lock', label: t('management.lock') } : null,\r
  })}\r
\r
  <nav class="admin-nav" aria-label="\${t('management.title')}">\r
    <button class="admin-nav-item" data-nav="children" type="button">\r
      <span class="nav-icon" aria-hidden="true">\${icon('user', { size: 32 })}</span>\r
      <span>\${t('navigation.children')}</span>\r
      <small class="admin-nav-desc">\${t('management.childrenDesc')}</small>\r
    </button>\r
    <button class="admin-nav-item" data-nav="settings" type="button">\r
      <span class="nav-icon" aria-hidden="true">\${icon('settings', { size: 32 })}</span>\r
      <span>\${t('navigation.settings')}</span>\r
      <small class="admin-nav-desc">\${t('management.settingsDesc')}</small>\r
    </button>\r
    <button class="admin-nav-item" data-nav="appearance" type="button">\r
      <span class="nav-icon" aria-hidden="true">\${icon('palette', { size: 32 })}</span>\r
      <span>\${t('navigation.appearance')}</span>\r
      <small class="admin-nav-desc">\${t('management.appearanceDesc')}</small>\r
    </button>\r
    <button class="admin-nav-item" data-nav="backup" type="button">\r
      <span class="nav-icon" aria-hidden="true">\${icon('database', { size: 32 })}</span>\r
      <span>\${t('navigation.backup')}</span>\r
      <small class="admin-nav-desc">\${t('management.backupDesc')}</small>\r
    </button>\r
  </nav>\r
</section>\r
`),u=()=>s(l.dashboard,{pinEnabled:i()}),d=class{constructor(){this._handlers=[]}async render(){return a()?u():s(l.pinScreen)}mount(){a()?this._mountDashboard():this._mountPinForm()}_mountPinForm(){let i=document.getElementById(`pin-form`);if(!i)return;let a=async i=>{i.preventDefault();let a=document.getElementById(`pin-input`),s=document.getElementById(`pin-error`),c=document.getElementById(`btn-pin-submit`),l=a.value.trim(),d=e=>{s.textContent=e,s.hidden=!1,a.setAttribute(`aria-invalid`,`true`),a.value=``,a.focus()};if(!l){d(t(`validation.pinRequired`));return}c.disabled=!0,c.textContent=`…`;try{let{valid:n}=await o.verifyPin(l);n?(e({adminAuthenticated:!0}),s.hidden=!0,document.getElementById(`app`).innerHTML=u(),this._mountDashboard()):d(t(`validation.pinWrong`))}catch(e){console.error(e),r.error(n(e,t(`pin.checkFailed`)))}finally{c.disabled=!1,c.textContent=t(`management.unlock`)}};i.addEventListener(`submit`,a),this._handlers.push({el:i,type:`submit`,fn:a})}_mountDashboard(){let t=document.querySelector(`.admin-nav`);if(t){let e=e=>{let t=e.target.closest(`[data-nav]`);if(!t)return;let n=t.dataset.nav;n===`children`&&(location.hash=`#/admin/children`),n===`settings`&&(location.hash=`#/admin/settings`),n===`appearance`&&(location.hash=`#/admin/appearance`),n===`backup`&&(location.hash=`#/admin/backup`)};t.addEventListener(`click`,e),this._handlers.push({el:t,type:`click`,fn:e})}let n=document.getElementById(`btn-logout`);if(n){let t=()=>{e({adminAuthenticated:!1}),location.hash=`#/`};n.addEventListener(`click`,t),this._handlers.push({el:n,type:`click`,fn:t})}}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{d as default};