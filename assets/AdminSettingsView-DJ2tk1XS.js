import{F as e,G as t,L as n,P as r,c as i,n as a,t as o}from"./security-CtCnMpu7.js";import{t as s}from"./api-D0XJvEL6.js";import{n as c,o as l}from"./Modal-DHEdphQb.js";import{c as u,s as d}from"./index-C__9U8Hp.js";import{n as f,t as p}from"./template-jTQYgMln.js";/* empty css              */var m=p(`<!-- @block: main -->\r
<section class="view-section" aria-label="\${t('navigation.settings')}">\r
  \${sectionHeader({ level: 1, title: t('navigation.settings') })}\r
\r
  <div class="settings-list">\r
\r
    <div class="settings-item">\r
      \${sectionHeader({ icon: 'lock', title: t('security.title'), help: 'pin' })}\r
      <div class="settings-switch-row">\r
        <span class="settings-switch-text">\r
          <span class="settings-switch-label" id="pin-protection-label">\${t('security.pinProtection')}</span>\r
          <span class="settings-switch-hint" id="pin-protection-hint">\${t('security.pinProtectionHint')}</span>\r
        </span>\r
        <button class="toggle-switch" id="pin-protection-switch" type="button" role="switch"\r
          aria-checked="\${pinEnabled}" aria-labelledby="pin-protection-label" aria-describedby="pin-protection-hint">\r
          <span class="toggle-thumb" aria-hidden="true"></span>\r
        </button>\r
      </div>\r
    </div>\r
\r
    <div class="settings-item">\r
      \${sectionHeader({ icon: 'exchange', title: t('settings.currencyTitle'), help: 'currency' })}\r
      <form id="currency-form" novalidate>\r
        <div class="form-group">\r
          <label class="form-label" for="currency-input">\${t('settings.currencyLabel')}</label>\r
          <input class="form-input settings-currency-input" id="currency-input"\r
            type="text" maxlength="3" value="\${currency}"\r
            placeholder="€" autocomplete="off">\r
        </div>\r
        <button class="btn btn-primary" type="submit">\${t('common.save')}</button>\r
      </form>\r
    </div>\r
\r
    \${pinEnabled ? \`\r
    <div class="settings-item">\r
      \${sectionHeader({ icon: 'key', title: t('settings.changePin'), help: 'pin' })}\r
      <form id="pin-form" novalidate>\r
        <div class="form-group">\r
          <label class="form-label" for="current-pin">\${t('settings.currentPin')}</label>\r
          <input class="form-input pin-input" id="current-pin"\r
            type="password" inputmode="numeric"\r
            maxlength="12" placeholder="••••" autocomplete="current-password">\r
        </div>\r
        <div class="form-group">\r
          <label class="form-label" for="new-pin">\${t('settings.newPin')}</label>\r
          <input class="form-input pin-input" id="new-pin"\r
            type="password" inputmode="numeric"\r
            maxlength="12" placeholder="••••" autocomplete="new-password">\r
          <span class="form-hint">\${t('settings.newPinHint')}</span>\r
        </div>\r
        <div class="form-group">\r
          <label class="form-label" for="new-pin-confirm">\${t('settings.newPinConfirm')}</label>\r
          <input class="form-input pin-input" id="new-pin-confirm"\r
            type="password" inputmode="numeric"\r
            maxlength="12" placeholder="••••" autocomplete="new-password">\r
        </div>\r
        <button class="btn btn-primary" type="submit">\${t('settings.changePin')}</button>\r
      </form>\r
    </div>\r
    \` : ''}\r
\r
  </div>\r
</section>\r
`);function h(e,t){return async n=>{n.preventDefault();let r=e.querySelector(`button[type="submit"]`);if(!r?.disabled){r&&(r.disabled=!0);try{await t()}finally{r&&(r.disabled=!1)}}}}var g=class{constructor(){this._handlers=[]}_guardAuth(){return o()?!0:(location.hash=`#/admin`,!1)}async render(){if(!this._guardAuth())return`<div></div>`;let{settings:e}=r();return f(m.main,{currency:e.currency??`€`,pinEnabled:a()})}mount(){let e=document.getElementById(`pin-protection-switch`);if(e){let t=()=>this._togglePinProtection(e);e.addEventListener(`click`,t),this._handlers.push({el:e,type:`click`,fn:t})}let t=document.getElementById(`currency-form`);if(t){let e=h(t,()=>this._saveCurrency(t));t.addEventListener(`submit`,e),this._handlers.push({el:t,type:`submit`,fn:e})}let n=document.getElementById(`pin-form`);if(n){let e=h(n,()=>this._changePin(n));n.addEventListener(`submit`,e),this._handlers.push({el:n,type:`submit`,fn:e})}}async _togglePinProtection(n){if(n.getAttribute(`aria-busy`)===`true`)return;n.setAttribute(`aria-busy`,`true`);let r;try{r=a()?await d():await u()}finally{n.removeAttribute(`aria-busy`)}if(!r)return;let o=a();o&&e({adminAuthenticated:!0}),i.success(t(o?`security.enabled`:`security.disabled`)),document.contains(n)&&await this._rerender()}async _rerender(){let e=document.getElementById(`app`),t=window.scrollY;this.unmount(),e.innerHTML=await this.render(),this.mount(),window.scrollTo(0,t),document.getElementById(`pin-protection-switch`)?.focus({preventScroll:!0})}async _saveCurrency(a){let o=document.getElementById(`currency-input`)?.value?.trim();if(c(a,`currency-input`),!o){l(a,`currency-input`,t(`validation.currencyRequired`)),document.getElementById(`currency-input`)?.focus();return}try{let n=await s.updateSettings({currency:o});e({settings:{...r().settings,currency:n.currency}}),i.success(t(`settings.currencySaved`))}catch(e){console.error(e),i.error(n(e,t(`settings.currencySaveFailed`)),{action:{label:t(`common.retry`),onClick:()=>a.requestSubmit()}})}}async _changePin(e){[`current-pin`,`new-pin`,`new-pin-confirm`].forEach(t=>c(e,t));let r=e=>document.getElementById(e)?.value?.trim()??``,a=r(`current-pin`),o=r(`new-pin`),u=r(`new-pin-confirm`),d=null,f=(t,n)=>{l(e,t,n),d??=t};if(a||f(`current-pin`,t(`validation.currentPinRequired`)),/^\d{4,12}$/.test(o)?o!==u&&f(`new-pin-confirm`,t(`validation.pinMismatch`)):f(`new-pin`,t(`validation.pinTooShort`)),d){document.getElementById(d)?.focus();return}try{await s.updateSettings({currentPin:a,newPin:o}),i.success(t(`pin.changed`)),e.reset()}catch(r){if(console.error(r),r?.code===`currentPinWrong`){l(e,`current-pin`,t(`validation.pinWrong`));let n=document.getElementById(`current-pin`);n&&(n.value=``,n.focus());return}i.error(n(r,t(`pin.changeFailed`)))}}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{g as default};