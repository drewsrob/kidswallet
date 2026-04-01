import{g as e,h as t,m as n}from"./index-CAzKeS1O.js";import{n as r,t as i}from"./template-CRf3gOUw.js";import{t as a}from"./Toast-BYCYXKyv.js";var o=i(`<!-- @block: pinScreen -->\r
<section class="view-admin-pin view-section" aria-label="Admin-Anmeldung">\r
  <div class="card admin-pin-card">\r
    <div class="admin-pin-icon" aria-hidden="true">\${icon('lock', { size: 48 })}</div>\r
    <h1 class="admin-pin-title">Admin-Bereich</h1>\r
    <p class="admin-pin-hint">Bitte Admin-PIN eingeben</p>\r
    <form id="pin-form" novalidate>\r
      <div class="form-group">\r
        <label class="form-label" for="pin-input">PIN</label>\r
        <input\r
          class="form-input pin-input"\r
          id="pin-input"\r
          type="password"\r
          inputmode="numeric"\r
          autocomplete="current-password"\r
          maxlength="12"\r
          placeholder="••••"\r
          aria-label="Admin-PIN"\r
          autofocus\r
        >\r
      </div>\r
      <p class="form-error" id="pin-error" hidden aria-live="polite">\r
        Falscher PIN. Bitte nochmals versuchen.\r
      </p>\r
      <button class="btn btn-primary btn-full" type="submit" id="btn-pin-submit">\r
        Anmelden\r
      </button>\r
    </form>\r
  </div>\r
</section>\r
\r
<!-- @block: dashboard -->\r
<section class="view-admin view-section" aria-label="Admin-Dashboard">\r
  <div class="view-header">\r
    <h1>Admin-Bereich</h1>\r
    <button class="btn btn-ghost btn-sm" id="btn-logout" type="button">\r
      \${icon('lock', { size: 16 })} Abmelden\r
    </button>\r
  </div>\r
\r
  <nav class="admin-nav" aria-label="Admin-Navigation">\r
    <button class="admin-nav-item" data-nav="children" type="button">\r
      <span class="nav-icon" aria-hidden="true">\${icon('user', { size: 32 })}</span>\r
      <span>Kinder verwalten</span>\r
    </button>\r
    <button class="admin-nav-item" data-nav="settings" type="button">\r
      <span class="nav-icon" aria-hidden="true">\${icon('settings', { size: 32 })}</span>\r
      <span>Einstellungen</span>\r
    </button>\r
  </nav>\r
</section>\r
`),s=class{constructor(){this._handlers=[]}async render(){let{adminAuthenticated:e}=n();return r(e?o.dashboard:o.pinScreen,{})}mount(){let{adminAuthenticated:e}=n();e?this._mountDashboard():this._mountPinForm()}_mountPinForm(){let n=document.getElementById(`pin-form`);if(!n)return;let i=async n=>{n.preventDefault();let i=document.getElementById(`pin-input`),s=document.getElementById(`pin-error`),c=document.getElementById(`btn-pin-submit`),l=i.value.trim();if(l){c.disabled=!0,c.textContent=`…`;try{let{valid:n}=await e.verifyPin(l);n?(t({adminAuthenticated:!0}),s.hidden=!0,document.getElementById(`app`).innerHTML=r(o.dashboard,{}),this._mountDashboard()):(s.hidden=!1,i.value=``,i.focus())}catch{a.error(`Fehler bei der Anmeldung.`)}finally{c.disabled=!1,c.textContent=`Anmelden`}}};n.addEventListener(`submit`,i),this._handlers.push({el:n,type:`submit`,fn:i})}_mountDashboard(){let e=document.querySelector(`.admin-nav`);if(e){let t=e=>{let t=e.target.closest(`[data-nav]`);if(!t)return;let n=t.dataset.nav;n===`children`&&(location.hash=`#/admin/children`),n===`settings`&&(location.hash=`#/admin/settings`)};e.addEventListener(`click`,t),this._handlers.push({el:e,type:`click`,fn:t})}let n=document.getElementById(`btn-logout`);if(n){let e=()=>{t({adminAuthenticated:!1}),location.hash=`#/`};n.addEventListener(`click`,e),this._handlers.push({el:n,type:`click`,fn:e})}}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{s as default};