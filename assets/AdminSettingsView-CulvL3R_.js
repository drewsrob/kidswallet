import{F as e,G as t,I as n,l as r,n as i,r as a,t as o}from"./errors-BuZJOoV2.js";import{t as s}from"./api-DyjQjSGb.js";import{n as c,o as l}from"./Modal-B9ryagiW.js";import{c as u,s as d}from"./index-DhmQMiWU.js";import{n as f,t as p}from"./template-DebUhnZr.js";/* empty css              */var m=p(`<!-- @block: main -->\r
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
`);function h(e,t){return async n=>{n.preventDefault();let r=e.querySelector(`button[type="submit"]`);if(!r?.disabled){r&&(r.disabled=!0);try{await t()}finally{r&&(r.disabled=!1)}}}}var g=class{constructor(){this._handlers=[]}_guardAuth(){return i()?!0:(location.hash=`#/admin`,!1)}async render(){if(!this._guardAuth())return`<div></div>`;let{settings:t}=e();return f(m.main,{currency:t.currency??`€`,pinEnabled:a()})}mount(){let e=document.getElementById(`pin-protection-switch`);if(e){let t=()=>this._togglePinProtection(e);e.addEventListener(`click`,t),this._handlers.push({el:e,type:`click`,fn:t})}let t=document.getElementById(`currency-form`);if(t){let e=h(t,()=>this._saveCurrency(t));t.addEventListener(`submit`,e),this._handlers.push({el:t,type:`submit`,fn:e})}let n=document.getElementById(`pin-form`);if(n){let e=h(n,()=>this._changePin(n));n.addEventListener(`submit`,e),this._handlers.push({el:n,type:`submit`,fn:e})}}async _togglePinProtection(e){if(e.getAttribute(`aria-busy`)===`true`)return;e.setAttribute(`aria-busy`,`true`);let i;try{i=a()?await d():await u()}finally{e.removeAttribute(`aria-busy`)}if(!i)return;let o=a();o&&n({adminAuthenticated:!0}),r.success(t(o?`security.enabled`:`security.disabled`)),document.contains(e)&&await this._rerender()}async _rerender(){let e=document.getElementById(`app`),t=window.scrollY;this.unmount(),e.innerHTML=await this.render(),this.mount(),window.scrollTo(0,t),document.getElementById(`pin-protection-switch`)?.focus({preventScroll:!0})}async _saveCurrency(i){let a=document.getElementById(`currency-input`)?.value?.trim();if(c(i,`currency-input`),!a){l(i,`currency-input`,t(`validation.currencyRequired`)),document.getElementById(`currency-input`)?.focus();return}try{let i=await s.updateSettings({currency:a});n({settings:{...e().settings,currency:i.currency}}),r.success(t(`settings.currencySaved`))}catch(e){console.error(e),r.error(o(e,t(`settings.currencySaveFailed`)),{action:{label:t(`common.retry`),onClick:()=>i.requestSubmit()}})}}async _changePin(e){[`current-pin`,`new-pin`,`new-pin-confirm`].forEach(t=>c(e,t));let n=e=>document.getElementById(e)?.value?.trim()??``,i=n(`current-pin`),a=n(`new-pin`),u=n(`new-pin-confirm`),d=null,f=(t,n)=>{l(e,t,n),d??=t};if(i||f(`current-pin`,t(`validation.currentPinRequired`)),/^\d{4,12}$/.test(a)?a!==u&&f(`new-pin-confirm`,t(`validation.pinMismatch`)):f(`new-pin`,t(`validation.pinTooShort`)),d){document.getElementById(d)?.focus();return}try{await s.updateSettings({currentPin:i,newPin:a}),r.success(t(`pin.changed`)),e.reset()}catch(n){if(console.error(n),n?.code===`currentPinWrong`){l(e,`current-pin`,t(`validation.pinWrong`));let n=document.getElementById(`current-pin`);n&&(n.value=``,n.focus());return}r.error(o(n,t(`pin.changeFailed`)))}}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{g as default};