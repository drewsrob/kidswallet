import{E as e,G as t,L as n,P as r,_ as i,b as a,c as o,g as s,h as c,p as l,v as u,x as d,y as f}from"./security-CtCnMpu7.js";import{t as p}from"./api-D0XJvEL6.js";import{t as m}from"./Modal-DHEdphQb.js";import{a as h,c as g,l as _,n as v,t as y}from"./template-jTQYgMln.js";function b(t,n){let r=t.id===n,i=e(a(t.id));return`
    <button type="button" class="symbol-option${r?` selected`:``}" data-symbol="${t.id}"
      aria-pressed="${r}" aria-label="${i}" title="${i}">
      ${l(t.id,{size:24})}
      <span class="symbol-option__check" aria-hidden="true">${l(`check`,{size:12})}</span>
    </button>`}function x({id:n=`symbol-picker`,selected:r=c,label:o=t(`goal.iconLabel`)}={}){let d=f(r)??f(`bike`),p=i.map(n=>{let r=s.filter(e=>e.category===n);if(!r.length)return``;let i=e(u(n));return`
      <details class="symbol-group" data-category="${n}" open>
        <summary class="symbol-group__title">
          <span class="symbol-group__name">${i}</span>
          <span class="symbol-group__count" data-count>${t(`goal.symbolGroupCount`,{count:r.length})}</span>
          <span class="symbol-group__chevron" aria-hidden="true">${l(`chevron-right`,{size:18})}</span>
        </summary>
        <div class="symbol-group__grid" role="group" aria-label="${i}">
          ${r.map(e=>b(e,d.id)).join(``)}
        </div>
      </details>`}).join(``);return`
    <div class="symbol-picker" id="${n}" data-selected="${d.id}">
      <div class="symbol-picker__head">
        <span class="form-label form-label--secondary" id="${n}-label">${e(o)}</span>
        <span class="symbol-picker__current" data-current>
          <span class="symbol-picker__current-icon" data-current-icon>${l(d.id,{size:18})}</span>
          <span data-current-name>${e(t(`goal.symbolSelected`,{name:a(d.id)}))}</span>
        </span>
      </div>
      <div class="symbol-picker__search">
        <span class="symbol-picker__search-icon" aria-hidden="true">${l(`magnifier`,{size:18})}</span>
        <input class="form-input symbol-picker__input" id="${n}-search" type="search"
          placeholder="${e(t(`goal.symbolSearchPlaceholder`))}" aria-label="${e(t(`goal.symbolSearchLabel`))}"
          aria-controls="${n}-list" autocomplete="off" spellcheck="false" enterkeyhint="search">
      </div>
      <div class="symbol-picker__list" id="${n}-list" role="group" aria-labelledby="${n}-label">
        ${p}
        <p class="symbol-picker__empty" data-empty hidden>${e(t(`goal.symbolNoResults`))}</p>
      </div>
      <p class="sr-only" data-status aria-live="polite"></p>
    </div>`}function S(e,n){if(!e)return;let r=e.querySelector(`.symbol-picker__input`),i=e.querySelector(`.symbol-picker__list`),o=[...e.querySelectorAll(`.symbol-group`)],s=[...e.querySelectorAll(`.symbol-option`)],c=e.querySelector(`[data-empty]`),u=e.querySelector(`[data-status]`),p=e.querySelector(`[data-current-icon]`),m=e.querySelector(`[data-current-name]`),h=!1,g=e=>{let n=e.trim()!==``;n&&!h&&o.forEach(e=>{e.dataset.userOpen=String(e.open)});let r=0;o.forEach(i=>{let a=0;i.querySelectorAll(`.symbol-option`).forEach(t=>{let n=d(f(t.dataset.symbol),e);t.hidden=!n,n&&a++}),r+=a,i.hidden=a===0,i.querySelector(`[data-count]`).textContent=t(`goal.symbolGroupCount`,{count:a}),n&&a&&(i.open=!0),!n&&h&&(i.open=i.dataset.userOpen!==`false`)}),c.hidden=r>0,u.textContent=n?r?t(`goal.symbolResults`,{count:r}):t(`goal.symbolNoResults`):``,h=n},_=(i,{focus:o=!1}={})=>{if(!f(i))return;e.dataset.selected=i,s.forEach(e=>{let t=e.dataset.symbol===i;e.classList.toggle(`selected`,t),e.setAttribute(`aria-pressed`,String(t))}),p.innerHTML=l(i,{size:18}),m.textContent=t(`goal.symbolSelected`,{name:a(i)}),r.value&&(r.value=``,g(``));let c=s.find(e=>e.dataset.symbol===i),u=c?.closest(`details`);u&&!u.open&&(u.open=!0),o&&c?.focus({preventScroll:!0}),c?.scrollIntoView({block:`nearest`}),n?.(i)};r.addEventListener(`input`,()=>g(r.value)),r.addEventListener(`keydown`,e=>{if(e.key===`Escape`&&r.value){e.preventDefault(),r.value=``,g(``);return}if(e.key===`Enter`&&r.value.trim()){e.preventDefault();let t=s.find(e=>!e.hidden);t&&_(t.dataset.symbol,{focus:!0});return}if(e.key===`ArrowDown`){let t=s.find(e=>!e.hidden&&e.offsetParent!==null);t&&(e.preventDefault(),t.focus())}}),i.addEventListener(`click`,e=>{let t=e.target.closest(`.symbol-option`);t&&_(t.dataset.symbol,{focus:!0})}),i.addEventListener(`keydown`,e=>{let t=e.target.closest?.(`.symbol-option`);if(!t||![`ArrowLeft`,`ArrowRight`,`ArrowUp`,`ArrowDown`,`Home`,`End`].includes(e.key))return;let n=s.filter(e=>!e.hidden&&e.offsetParent!==null),i=n.indexOf(t),a=null;if(e.key===`ArrowLeft`)a=n[i-1];else if(e.key===`ArrowRight`)a=n[i+1];else if(e.key===`Home`)a=n[0];else if(e.key===`End`)a=n[n.length-1];else{let i=t.getBoundingClientRect(),o=e.key===`ArrowDown`,s=n.filter(e=>{let t=e.getBoundingClientRect();return o?t.top>i.top+4:t.top<i.top-4});if(!s.length){o||(e.preventDefault(),r.focus());return}let c=o?Math.min(...s.map(e=>e.getBoundingClientRect().top)):Math.max(...s.map(e=>e.getBoundingClientRect().top));a=s.filter(e=>Math.abs(e.getBoundingClientRect().top-c)<4).reduce((e,t)=>Math.abs(t.getBoundingClientRect().left-i.left)<Math.abs(e.getBoundingClientRect().left-i.left)?t:e)}a&&(e.preventDefault(),a.focus(),a.scrollIntoView({block:`nearest`}))})}var C=y(`<!-- @block: goalForm -->\r
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
`),w=99999;async function T(i,a=null){let s=!!a,{settings:l,children:u}=r(),d=l.currency??`€`,y=u.find(e=>e.id===i),b=f(a?.icon)?a.icon:c,T=e=>({name:e.querySelector(`#goal-name-input`)?.value?.trim(),targetAmount:g(e.querySelector(`#goal-target-input`)?.value).value}),E=new m({title:t(s?`goal.titleEdit`:`goal.titleCreate`),subtitle:s?t(`goal.subtitleEdit`):y?t(`goal.subtitleCreate`,{name:e(y.name)}):``,icon:`target`,tone:`goal`,help:`goals`,sheet:!0,content:v(C.goalForm,{currency:d,existing:a,symbolPicker:x({id:`goal-symbol-picker`,selected:b})}),actions:[{label:t(`common.cancel`),value:`cancel`,variant:`secondary`},{label:t(s?`common.save`:`common.create`),value:`submit`,variant:`primary`}],fields:{"goal-name-input":_(),"goal-target-input":h({max:w,currency:d})},submit:async(e,t)=>{let n={...T(t.root),icon:b};s?await p.updateGoal(a.id,n):await p.createGoal(i,n)},errorMessage:e=>n(e,t(`goal.saveFailed`))}).open();return S(document.getElementById(`goal-symbol-picker`),e=>{b=e}),await E===`submit`?(o.success(t(s?`goal.updated`:`goal.createdToast`)),!0):!1}export{T as t};