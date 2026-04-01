import{g as e,h as t,m as n}from"./index-CAzKeS1O.js";import{n as r,t as i}from"./template-CRf3gOUw.js";import{t as a}from"./Toast-BYCYXKyv.js";var o=i(`<!-- @block: main -->\r
<section class="view-section" aria-label="Einstellungen">\r
  <h1 class="view-title">Einstellungen</h1>\r
\r
  <div class="settings-list">\r
\r
    <div class="settings-item">\r
      <div class="settings-item-header">\r
        <h2 class="settings-item-title">\r
          \${icon('exchange', { size: 18, className: 'inline-icon' })} Währungssymbol\r
        </h2>\r
      </div>\r
      <form id="currency-form" novalidate>\r
        <div class="form-group">\r
          <label class="form-label" for="currency-input">Symbol (max. 3 Zeichen)</label>\r
          <input class="form-input settings-currency-input" id="currency-input"\r
            type="text" maxlength="3" value="\${currency}"\r
            placeholder="€" autocomplete="off">\r
        </div>\r
        <button class="btn btn-primary" type="submit">Speichern</button>\r
      </form>\r
    </div>\r
\r
    <div class="settings-item">\r
      <div class="settings-item-header">\r
        <h2 class="settings-item-title">\r
          \${icon('key', { size: 18, className: 'inline-icon' })} Admin-PIN ändern\r
        </h2>\r
      </div>\r
      <form id="pin-form" novalidate>\r
        <div class="form-group">\r
          <label class="form-label" for="current-pin">Aktueller PIN</label>\r
          <input class="form-input pin-input" id="current-pin"\r
            type="password" inputmode="numeric"\r
            maxlength="12" placeholder="••••" autocomplete="current-password">\r
        </div>\r
        <div class="form-group">\r
          <label class="form-label" for="new-pin">Neuer PIN</label>\r
          <input class="form-input pin-input" id="new-pin"\r
            type="password" inputmode="numeric"\r
            maxlength="12" placeholder="••••" autocomplete="new-password">\r
          <span class="form-hint">Mindestens 4 Zeichen</span>\r
        </div>\r
        <div class="form-group">\r
          <label class="form-label" for="new-pin-confirm">Neuer PIN wiederholen</label>\r
          <input class="form-input pin-input" id="new-pin-confirm"\r
            type="password" inputmode="numeric"\r
            maxlength="12" placeholder="••••" autocomplete="new-password">\r
        </div>\r
        <button class="btn btn-primary" type="submit">PIN ändern</button>\r
      </form>\r
    </div>\r
\r
  </div>\r
</section>\r
`),s=class{constructor(){this._handlers=[]}_guardAuth(){return n().adminAuthenticated?!0:(location.hash=`#/admin`,!1)}async render(){if(!this._guardAuth())return`<div></div>`;let{settings:e}=n();return r(o.main,{currency:e.currency??`€`})}mount(){let r=document.getElementById(`currency-form`);if(r){let i=async r=>{r.preventDefault();let i=document.getElementById(`currency-input`)?.value?.trim();if(!i){a.error(`Bitte ein WÃ¤hrungssymbol eingeben.`);return}try{let r=await e.updateSettings({currency:i});t({settings:{...n().settings,currency:r.currency}}),a.success(`WÃ¤hrungssymbol gespeichert.`)}catch(e){a.error(e.message)}};r.addEventListener(`submit`,i),this._handlers.push({el:r,type:`submit`,fn:i})}let i=document.getElementById(`pin-form`);if(i){let t=async t=>{t.preventDefault();let n=document.getElementById(`current-pin`)?.value,r=document.getElementById(`new-pin`)?.value?.trim(),o=document.getElementById(`new-pin-confirm`)?.value?.trim();if(!n){a.error(`Bitte den aktuellen PIN eingeben.`);return}if(!r||r.length<4){a.error(`Neuer PIN muss mindestens 4 Zeichen haben.`);return}if(r!==o){a.error(`Die neuen PINs stimmen nicht Ã¼berein.`);return}try{await e.updateSettings({currentPin:n,newPin:r}),a.success(`PIN erfolgreich geÃ¤ndert!`),i.reset()}catch(e){a.error(e.message)}};i.addEventListener(`submit`,t),this._handlers.push({el:i,type:`submit`,fn:t})}}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{s as default};