import{A as e,B as t,D as n,E as r,G as i,M as a,O as o,T as s,d as c,f as l,i as u,j as d,m as f,p}from"./security-CtCnMpu7.js";function m(e){let t=String(e??``).replace(/[\s€$£]/g,``);return t?/^[-−]/.test(t)?{empty:!1,value:NaN,error:`negative`}:(t.includes(`,`)&&t.includes(`.`)&&(t=t.lastIndexOf(`,`)>t.lastIndexOf(`.`)?t.replace(/\./g,``):t.replace(/,/g,``)),t=t.replace(`,`,`.`),/^(\d+\.?\d*|\.\d+)$/.test(t)?(t.split(`.`)[1]??``).length>2?{empty:!1,value:NaN,error:`decimals`}:{empty:!1,value:Number(t),error:``}:{empty:!1,value:NaN,error:`invalid`}):{empty:!0,value:NaN,error:``}}function h(){try{return new Intl.NumberFormat(t()).formatToParts(1.5).find(e=>e.type===`decimal`)?.value??`.`}catch{return`.`}}function g(e){return e==null||isNaN(e)?``:Number(e).toFixed(2).replace(`.`,h())}function _({max:e,currency:t=`€`}){return n=>{let{empty:r,value:a,error:s}=m(n);return r?i(`validation.amountRequired`):s===`negative`?i(`validation.amountNotNegative`):s===`decimals`?i(`validation.amountDecimals`):s?i(`validation.amountInvalid`):a<=0?i(`validation.amountRequired`):a>e?i(`validation.amountMax`,{max:o(e,t)}):``}}function v(e){return t=>String(t??``).trim()?``:e??i(`validation.nameRequired`)}function y(e,t,n){return r=>{let i=String(r??``).trim(),a=Number(i);return/^\d+$/.test(i)&&a>=e&&a<=t?``:typeof n==`function`?n():n}}function b(e=`star`,t=`avatar-picker`){let n=l.map(n=>`
    <button
      type="button"
      class="avatar-option${n===e?` selected`:``}"
      data-avatar="${n}"
      data-picker="${t}"
      aria-label="${r(f(n))}"
      aria-pressed="${n===e}"
    >${p(n,{size:28})}</button>
  `).join(``);return`
    <div class="avatar-picker" id="${t}" role="group" aria-label="${r(i(`symbols.avatarPickerLabel`))}">
      ${n}
    </div>
  `}function x(e,t){let n=document.getElementById(e);if(!n)return()=>{};let r=e=>{let r=e.target.closest(`[data-avatar]`);if(!r)return;let i=r.dataset.avatar;n.querySelectorAll(`.avatar-option`).forEach(e=>{e.classList.toggle(`selected`,e.dataset.avatar===i),e.setAttribute(`aria-pressed`,String(e.dataset.avatar===i))}),t(i)};return n.addEventListener(`click`,r),()=>n.removeEventListener(`click`,r)}var S=[{index:0,nameKey:`purple`,primary:`#6c63ff`,light:`#ede9ff`},{index:1,nameKey:`coral`,primary:`#ff6b6b`,light:`#fff0f0`},{index:2,nameKey:`green`,primary:`#43aa8b`,light:`#e8f8f1`},{index:3,nameKey:`orange`,primary:`#f9a826`,light:`#fff8e1`},{index:4,nameKey:`pink`,primary:`#ef476f`,light:`#fce4ec`},{index:5,nameKey:`blue`,primary:`#118ab2`,light:`#e1f5fe`},{index:6,nameKey:`lightGreen`,primary:`#8ac926`,light:`#f1f8e9`},{index:7,nameKey:`violet`,primary:`#9b5de5`,light:`#f3e5ff`}];function C(e){return i(`symbols.colors.${e.nameKey}`)}function w(e=0,t=`color-picker`){let n=S.map(n=>`
    <button
      type="button"
      class="color-swatch${n.index===e?` selected`:``}"
      style="background-color: ${n.primary};"
      data-palette-index="${n.index}"
      data-picker="${t}"
      aria-label="${r(C(n))}"
      aria-pressed="${n.index===e}"
      title="${r(C(n))}"
    ></button>
  `).join(``);return`
    <div class="color-picker" id="${t}" role="group" aria-label="${i(`symbols.colorPickerLabel`)}">
      ${n}
    </div>
  `}function T(e,t){let n=document.getElementById(e);if(!n)return()=>{};let r=e=>{let r=e.target.closest(`[data-palette-index]`);if(!r)return;let i=Number(r.dataset.paletteIndex);n.querySelectorAll(`.color-swatch`).forEach(e=>{let t=Number(e.dataset.paletteIndex)===i;e.classList.toggle(`selected`,t),e.setAttribute(`aria-pressed`,String(t))}),t(i)};return n.addEventListener(`click`,r),()=>n.removeEventListener(`click`,r)}var E={success:`check-circle`,info:`info`,attention:`alert-circle`};function D({tone:e=`info`,text:t,icon:n,href:i}={}){let a=`${p(n||E[e]||`info`,{size:16})}<span>${r(t)}</span>`,o=`status-hint status-hint--${e}`;return i?`<a class="${o}" href="${r(i)}">${a}</a>`:`<span class="${o}">${a}</span>`}function O(e=[],t=i(`common.hints`)){return e.length?`
    <ul class="status-list" aria-label="${r(t)}">
      ${e.map(e=>`<li>${D(e)}</li>`).join(``)}
    </ul>`:``}var k=`−`;function A(e,t=`€`){return e===0?o(0,t):`${e<0?k:`+`}${o(Math.abs(e),t)}`}function j({value:e,label:t,tone:n=`neutral`,emphasis:i=!1}){return`
    <div class="stat-tile stat-tile--${n}${i?` stat-tile--emphasis`:``}">
      <dt class="stat-tile__label">${r(t)}</dt>
      <dd class="stat-tile__value">${r(e)}</dd>
    </div>`}function M(e,t){return`
    <div class="stat-group">
      ${t?`<h3 class="stat-group__title">${r(t)}</h3>`:``}
      <dl class="stat-group__tiles">${e.map(j).join(``)}</dl>
    </div>`}function N({income:e,expense:t,net:n},r,a=`€`){return M([{value:A(e,a),label:i(`dashboard.statIncome`),tone:e?`pos`:`muted`},{value:A(-t,a),label:i(`dashboard.statExpense`),tone:t?`neg`:`muted`},{value:A(n,a),label:i(`dashboard.statNet`),tone:`neutral`,emphasis:!0}],r)}function P({title:e,id:t,level:n=2,icon:i,subtitle:a,action:o,help:s,className:c=``}){let l=`h${n}`,d=n===1?24:18;return`
    <header class="section-header section-header--h${n}${c?` ${c}`:``}">
      <div class="section-header__row">
        <${l} class="section-header__title"${t?` id="${t}"`:``}>
          ${i?p(i,{size:d,className:`inline-icon`}):``}<span>${r(e)}</span>
        </${l}>
        ${s?u(s):``}
      </div>
      ${o?`<div class="section-header__actions">${F(o)}</div>`:``}
      ${a?`<p class="section-header__subtitle">${r(a)}</p>`:``}
    </header>`}function F({id:e,label:t,icon:n,ariaLabel:i,variant:a=`ghost`}){return`<button class="btn btn-${a}${a===`ghost`?` btn-sm`:``} section-header__action" id="${e}" type="button"${i?` aria-label="${r(i)}"`:``}>
    ${n?p(n,{size:a===`ghost`?16:18}):``}<span>${r(t)}</span>
  </button>`}var I={t:i,formatCurrency:o,escapeHtml:r,calcPercent:s,getPaletteColors:a,formatAllowanceSchedule:n,get DAY_NAMES(){return d()},formatRelativeDate:e,icon:p,AVATAR_ICON_KEYS:l,renderAvatarPicker:b,renderColorPicker:w,renderEmptyState:c,renderStatusHint:D,renderStatusList:O,renderStatGroup:M,renderPeriodStats:N,formatSignedCurrency:A,formatAmountInput:g,helpButton:u,sectionHeader:P};function L(e){let t={},n=/<!--\s*@block:\s*(\w+)\s*-->([\s\S]*?)(?=<!--\s*@block:|$)/g,r;for(;(r=n.exec(e))!==null;)t[r[1]]=r[2].trim();return t}function R(e,t={}){let n={...I,...t};return Function(...Object.keys(n),`return \`${e}\``)(...Object.values(n))}export{_ as a,m as c,x as i,v as l,R as n,g as o,T as r,y as s,L as t};