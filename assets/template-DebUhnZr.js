import{B as e,D as t,E as n,G as r,M as i,N as a,O as o,a as s,f as c,h as l,j as u,k as d,m as f,p}from"./errors-BuZJOoV2.js";function m(e){let t=String(e??``).replace(/[\s€$£]/g,``);return t?/^[-−]/.test(t)?{empty:!1,value:NaN,error:`negative`}:(t.includes(`,`)&&t.includes(`.`)&&(t=t.lastIndexOf(`,`)>t.lastIndexOf(`.`)?t.replace(/\./g,``):t.replace(/,/g,``)),t=t.replace(`,`,`.`),/^(\d+\.?\d*|\.\d+)$/.test(t)?(t.split(`.`)[1]??``).length>2?{empty:!1,value:NaN,error:`decimals`}:{empty:!1,value:Number(t),error:``}:{empty:!1,value:NaN,error:`invalid`}):{empty:!0,value:NaN,error:``}}function h(){try{return new Intl.NumberFormat(e()).formatToParts(1.5).find(e=>e.type===`decimal`)?.value??`.`}catch{return`.`}}function g(e){return e==null||isNaN(e)?``:Number(e).toFixed(2).replace(`.`,h())}function _({max:e,currency:t=`€`}){return n=>{let{empty:i,value:a,error:o}=m(n);return i?r(`validation.amountRequired`):o===`negative`?r(`validation.amountNotNegative`):o===`decimals`?r(`validation.amountDecimals`):o?r(`validation.amountInvalid`):a<=0?r(`validation.amountRequired`):a>e?r(`validation.amountMax`,{max:d(e,t)}):``}}function v(e){return t=>String(t??``).trim()?``:e??r(`validation.nameRequired`)}function y(e,t,n){return r=>{let i=String(r??``).trim(),a=Number(i);return/^\d+$/.test(i)&&a>=e&&a<=t?``:typeof n==`function`?n():n}}function b(e=`star`,n=`avatar-picker`){let i=p.map(r=>`
    <button
      type="button"
      class="avatar-option${r===e?` selected`:``}"
      data-avatar="${r}"
      data-picker="${n}"
      aria-label="${t(l(r))}"
      aria-pressed="${r===e}"
    >${f(r,{size:28})}</button>
  `).join(``);return`
    <div class="avatar-picker" id="${n}" role="group" aria-label="${t(r(`symbols.avatarPickerLabel`))}">
      ${i}
    </div>
  `}function x(e,t){let n=document.getElementById(e);if(!n)return()=>{};let r=e=>{let r=e.target.closest(`[data-avatar]`);if(!r)return;let i=r.dataset.avatar;n.querySelectorAll(`.avatar-option`).forEach(e=>{e.classList.toggle(`selected`,e.dataset.avatar===i),e.setAttribute(`aria-pressed`,String(e.dataset.avatar===i))}),t(i)};return n.addEventListener(`click`,r),()=>n.removeEventListener(`click`,r)}var S=[{index:0,nameKey:`purple`,primary:`#6c63ff`,light:`#ede9ff`},{index:1,nameKey:`coral`,primary:`#ff6b6b`,light:`#fff0f0`},{index:2,nameKey:`green`,primary:`#43aa8b`,light:`#e8f8f1`},{index:3,nameKey:`orange`,primary:`#f9a826`,light:`#fff8e1`},{index:4,nameKey:`pink`,primary:`#ef476f`,light:`#fce4ec`},{index:5,nameKey:`blue`,primary:`#118ab2`,light:`#e1f5fe`},{index:6,nameKey:`lightGreen`,primary:`#8ac926`,light:`#f1f8e9`},{index:7,nameKey:`violet`,primary:`#9b5de5`,light:`#f3e5ff`}];function C(e){return r(`symbols.colors.${e.nameKey}`)}function w(e=0,n=`color-picker`){let i=S.map(r=>`
    <button
      type="button"
      class="color-swatch${r.index===e?` selected`:``}"
      style="background-color: ${r.primary};"
      data-palette-index="${r.index}"
      data-picker="${n}"
      aria-label="${t(C(r))}"
      aria-pressed="${r.index===e}"
      title="${t(C(r))}"
    ></button>
  `).join(``);return`
    <div class="color-picker" id="${n}" role="group" aria-label="${r(`symbols.colorPickerLabel`)}">
      ${i}
    </div>
  `}function T(e,t){let n=document.getElementById(e);if(!n)return()=>{};let r=e=>{let r=e.target.closest(`[data-palette-index]`);if(!r)return;let i=Number(r.dataset.paletteIndex);n.querySelectorAll(`.color-swatch`).forEach(e=>{let t=Number(e.dataset.paletteIndex)===i;e.classList.toggle(`selected`,t),e.setAttribute(`aria-pressed`,String(t))}),t(i)};return n.addEventListener(`click`,r),()=>n.removeEventListener(`click`,r)}var E={success:`check-circle`,info:`info`,attention:`alert-circle`};function D({tone:e=`info`,text:n,icon:r,href:i}={}){let a=`${f(r||E[e]||`info`,{size:16})}<span>${t(n)}</span>`,o=`status-hint status-hint--${e}`;return i?`<a class="${o}" href="${t(i)}">${a}</a>`:`<span class="${o}">${a}</span>`}function O(e=[],n=r(`common.hints`)){return e.length?`
    <ul class="status-list" aria-label="${t(n)}">
      ${e.map(e=>`<li>${D(e)}</li>`).join(``)}
    </ul>`:``}var k=`−`;function A(e,t=`€`){return e===0?d(0,t):`${e<0?k:`+`}${d(Math.abs(e),t)}`}function j({value:e,label:n,tone:r=`neutral`,emphasis:i=!1}){return`
    <div class="stat-tile stat-tile--${r}${i?` stat-tile--emphasis`:``}">
      <dt class="stat-tile__label">${t(n)}</dt>
      <dd class="stat-tile__value">${t(e)}</dd>
    </div>`}function M(e,n){return`
    <div class="stat-group">
      ${n?`<h3 class="stat-group__title">${t(n)}</h3>`:``}
      <dl class="stat-group__tiles">${e.map(j).join(``)}</dl>
    </div>`}function N({income:e,expense:t,net:n},i,a=`€`){return M([{value:A(e,a),label:r(`dashboard.statIncome`),tone:e?`pos`:`muted`},{value:A(-t,a),label:r(`dashboard.statExpense`),tone:t?`neg`:`muted`},{value:A(n,a),label:r(`dashboard.statNet`),tone:`neutral`,emphasis:!0}],i)}function P({title:e,id:n,level:r=2,icon:i,subtitle:a,action:o,controls:c,help:l,className:u=``}){let d=`h${r}`,p=r===1?24:18;return`
    <header class="section-header section-header--h${r}${u?` ${u}`:``}">
      <div class="section-header__row">
        <${d} class="section-header__title"${n?` id="${n}"`:``}>
          ${i?f(i,{size:p,className:`inline-icon`}):``}<span>${t(e)}</span>
        </${d}>
        ${l?s(l):``}
      </div>
      ${o||c?`<div class="section-header__actions">${c??``}${o?F(o):``}</div>`:``}
      ${a?`<p class="section-header__subtitle">${t(a)}</p>`:``}
    </header>`}function F({id:e,label:n,icon:r,ariaLabel:i,variant:a=`ghost`}){return`<button class="btn btn-${a}${a===`ghost`?` btn-sm`:``} section-header__action" id="${e}" type="button"${i?` aria-label="${t(i)}"`:``}>
    ${r?f(r,{size:a===`ghost`?16:18}):``}<span>${t(n)}</span>
  </button>`}var I={t:r,formatCurrency:d,escapeHtml:t,calcPercent:n,getPaletteColors:a,formatAllowanceSchedule:o,get DAY_NAMES(){return i()},formatRelativeDate:u,icon:f,AVATAR_ICON_KEYS:p,renderAvatarPicker:b,renderColorPicker:w,renderEmptyState:c,renderStatusHint:D,renderStatusList:O,renderStatGroup:M,renderPeriodStats:N,formatSignedCurrency:A,formatAmountInput:g,helpButton:s,sectionHeader:P};function L(e){let t={},n=/<!--\s*@block:\s*(\w+)\s*-->([\s\S]*?)(?=<!--\s*@block:|$)/g,r;for(;(r=n.exec(e))!==null;)t[r[1]]=r[2].trim();return t}function R(e,t={}){let n={...I,...t};return Function(...Object.keys(n),`return \`${e}\``)(...Object.values(n))}export{_ as a,m as c,x as i,v as l,R as n,g as o,T as r,y as s,L as t};