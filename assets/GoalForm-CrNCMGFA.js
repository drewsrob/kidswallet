import{D as e,F as t,G as n,S as r,_ as i,b as a,g as o,l as s,m as c,t as l,v as u,x as d,y as f}from"./errors-B_GFX16_.js";import{t as p}from"./api-0d9YJt6W.js";import{t as m}from"./Modal-BR3LSJ3m.js";import{a as h,c as g,l as _,n as v,t as y}from"./template-CY161wSk.js";function b(t,n){let r=t.id===n,i=e(d(t.id));return`
    <button type="button" class="symbol-option${r?` selected`:``}" data-symbol="${t.id}"
      aria-pressed="${r}" aria-label="${i}" title="${i}">
      ${c(t.id,{size:24})}
      <span class="symbol-option__check" aria-hidden="true">${c(`check`,{size:12})}</span>
    </button>`}function x({id:t=`symbol-picker`,selected:r=o,label:s=n(`goal.iconLabel`)}={}){let l=a(r)??a(`bike`),p=u.map(t=>{let r=i.filter(e=>e.category===t);if(!r.length)return``;let a=e(f(t));return`
      <details class="symbol-group" data-category="${t}" open>
        <summary class="symbol-group__title">
          <span class="symbol-group__name">${a}</span>
          <span class="symbol-group__count" data-count>${n(`goal.symbolGroupCount`,{count:r.length})}</span>
          <span class="symbol-group__chevron" aria-hidden="true">${c(`chevron-right`,{size:18})}</span>
        </summary>
        <div class="symbol-group__grid" role="group" aria-label="${a}">
          ${r.map(e=>b(e,l.id)).join(``)}
        </div>
      </details>`}).join(``);return`
    <div class="symbol-picker" id="${t}" data-selected="${l.id}">
      <div class="symbol-picker__head">
        <span class="form-label form-label--secondary" id="${t}-label">${e(s)}</span>
        <span class="symbol-picker__current" data-current>
          <span class="symbol-picker__current-icon" data-current-icon>${c(l.id,{size:18})}</span>
          <span data-current-name>${e(n(`goal.symbolSelected`,{name:d(l.id)}))}</span>
        </span>
      </div>
      <div class="symbol-picker__search">
        <span class="symbol-picker__search-icon" aria-hidden="true">${c(`magnifier`,{size:18})}</span>
        <input class="form-input symbol-picker__input" id="${t}-search" type="search"
          placeholder="${e(n(`goal.symbolSearchPlaceholder`))}" aria-label="${e(n(`goal.symbolSearchLabel`))}"
          aria-controls="${t}-list" autocomplete="off" spellcheck="false" enterkeyhint="search">
      </div>
      <div class="symbol-picker__list" id="${t}-list" role="group" aria-labelledby="${t}-label">
        ${p}
        <p class="symbol-picker__empty" data-empty hidden>${e(n(`goal.symbolNoResults`))}</p>
      </div>
      <p class="sr-only" data-status aria-live="polite"></p>
    </div>`}function S(e,t){if(!e)return;let i=e.querySelector(`.symbol-picker__input`),o=e.querySelector(`.symbol-picker__list`),s=[...e.querySelectorAll(`.symbol-group`)],l=[...e.querySelectorAll(`.symbol-option`)],u=e.querySelector(`[data-empty]`),f=e.querySelector(`[data-status]`),p=e.querySelector(`[data-current-icon]`),m=e.querySelector(`[data-current-name]`),h=!1,g=e=>{let t=e.trim()!==``;t&&!h&&s.forEach(e=>{e.dataset.userOpen=String(e.open)});let i=0;s.forEach(o=>{let s=0;o.querySelectorAll(`.symbol-option`).forEach(t=>{let n=r(a(t.dataset.symbol),e);t.hidden=!n,n&&s++}),i+=s,o.hidden=s===0,o.querySelector(`[data-count]`).textContent=n(`goal.symbolGroupCount`,{count:s}),t&&s&&(o.open=!0),!t&&h&&(o.open=o.dataset.userOpen!==`false`)}),u.hidden=i>0,f.textContent=t?i?n(`goal.symbolResults`,{count:i}):n(`goal.symbolNoResults`):``,h=t},_=(r,{focus:o=!1}={})=>{if(!a(r))return;e.dataset.selected=r,l.forEach(e=>{let t=e.dataset.symbol===r;e.classList.toggle(`selected`,t),e.setAttribute(`aria-pressed`,String(t))}),p.innerHTML=c(r,{size:18}),m.textContent=n(`goal.symbolSelected`,{name:d(r)}),i.value&&(i.value=``,g(``));let s=l.find(e=>e.dataset.symbol===r),u=s?.closest(`details`);u&&!u.open&&(u.open=!0),o&&s?.focus({preventScroll:!0}),s?.scrollIntoView({block:`nearest`}),t?.(r)};i.addEventListener(`input`,()=>g(i.value)),i.addEventListener(`keydown`,e=>{if(e.key===`Escape`&&i.value){e.preventDefault(),i.value=``,g(``);return}if(e.key===`Enter`&&i.value.trim()){e.preventDefault();let t=l.find(e=>!e.hidden);t&&_(t.dataset.symbol,{focus:!0});return}if(e.key===`ArrowDown`){let t=l.find(e=>!e.hidden&&e.offsetParent!==null);t&&(e.preventDefault(),t.focus())}}),o.addEventListener(`click`,e=>{let t=e.target.closest(`.symbol-option`);t&&_(t.dataset.symbol,{focus:!0})}),o.addEventListener(`keydown`,e=>{let t=e.target.closest?.(`.symbol-option`);if(!t||![`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`Home`,`End`].includes(e.key))return;let n=l.filter(e=>!e.hidden&&e.offsetParent!==null),r=n.indexOf(t),a=null;if(e.key===`ArrowLeft`)a=n[r-1];else if(e.key===`ArrowRight`)a=n[r+1];else if(e.key===`Home`)a=n[0];else if(e.key===`End`)a=n[n.length-1];else{let r=t.getBoundingClientRect(),o=e.key===`ArrowDown`,s=n.filter(e=>{let t=e.getBoundingClientRect();return o?t.top>r.top+4:t.top<r.top-4});if(!s.length){o||(e.preventDefault(),i.focus());return}let c=o?Math.min(...s.map(e=>e.getBoundingClientRect().top)):Math.max(...s.map(e=>e.getBoundingClientRect().top));a=s.filter(e=>Math.abs(e.getBoundingClientRect().top-c)<4).reduce((e,t)=>Math.abs(t.getBoundingClientRect().left-r.left)<Math.abs(e.getBoundingClientRect().left-r.left)?t:e)}a&&(e.preventDefault(),a.focus(),a.scrollIntoView({block:`nearest`}))})}var C=y(`<!-- @block: goalForm -->\r
<div class="form-group form-group--primary">\r
  <label class="form-label" for="goal-name-input">\${t('goal.nameLabel')}</label>\r
  <input class="form-input" id="goal-name-input" type="text" enterkeyhint="done"\r
    placeholder="\${t('goal.namePlaceholder')}" maxlength="60" autocomplete="off" aria-required="true"\r
    value="\${escapeHtml(existing?.name ?? '')}">\r
</div>\r
<div class="form-group">\r
  <label class="form-label" for="goal-target-input">\${t('goal.targetLabel', { currency: escapeHtml(currency) })}</label>\r
  <div class="input-affix">\r
    <input class="form-input" id="goal-target-input" type="text" inputmode="decimal" enterkeyhint="done"\r
      placeholder="\${formatAmountInput(0)}" autocomplete="off" aria-required="true"\r
      value="\${formatAmountInput(existing?.targetAmount)}">\r
    <span class="input-affix__unit" aria-hidden="true">\${escapeHtml(currency)}</span>\r
  </div>\r
</div>\r
<div class="form-group">\r
  \${symbolPicker}\r
</div>\r
`),w=99999;async function T(r,i=null,{adjust:c=!1,targetAmount:u}={}){let d=!!i;d&&u!==void 0&&(i={...i,targetAmount:u});let{settings:f,children:y}=t(),b=f.currency??`€`,T=y.find(e=>e.id===r),E=a(i?.icon)?i.icon:o,D=e=>({name:e.querySelector(`#goal-name-input`)?.value?.trim(),targetAmount:g(e.querySelector(`#goal-target-input`)?.value).value}),O=new m({title:n(c?`goal.titleAdjust`:d?`goal.titleEdit`:`goal.titleCreate`),subtitle:d?n(`goal.subtitleEdit`):T?n(`goal.subtitleCreate`,{name:e(T.name)}):``,icon:`target`,tone:`goal`,help:`goals`,sheet:!0,content:v(C.goalForm,{currency:b,existing:i,symbolPicker:x({id:`goal-symbol-picker`,selected:E})}),actions:[{label:n(`common.cancel`),value:`cancel`,variant:`secondary`},{label:n(d?`common.save`:`common.create`),value:`submit`,variant:`primary`}],fields:{"goal-name-input":_(),"goal-target-input":h({max:w,currency:b})},submit:async(e,t)=>{let n={...D(t.root),icon:E};d?await p.updateGoal(i.id,n):await p.createGoal(r,n)},errorMessage:e=>l(e,n(`goal.saveFailed`))}).open();return S(document.getElementById(`goal-symbol-picker`),e=>{E=e}),await O===`submit`?(s.success(n(d?`goal.updated`:`goal.createdToast`)),!0):!1}export{T as t};