import{c as e,d as t,f as n,i as r,l as i,n as a,p as o,r as s,s as c,t as l,u}from"./index-CAzKeS1O.js";function d(e=`star`,t=`avatar-picker`){return`
    <div class="avatar-picker" id="${t}" role="group" aria-label="Avatar auswählen">
      ${l.map(n=>`
    <button
      type="button"
      class="avatar-option${n===e?` selected`:``}"
      data-avatar="${n}"
      data-picker="${t}"
      aria-label="${n}"
      aria-pressed="${n===e}"
    >${s(n,{size:28})}</button>
  `).join(``)}
    </div>
  `}function f(e,t){let n=document.getElementById(e);if(!n)return()=>{};let r=e=>{let r=e.target.closest(`[data-avatar]`);if(!r)return;let i=r.dataset.avatar;n.querySelectorAll(`.avatar-option`).forEach(e=>{e.classList.toggle(`selected`,e.dataset.avatar===i),e.setAttribute(`aria-pressed`,String(e.dataset.avatar===i))}),t(i)};return n.addEventListener(`click`,r),()=>n.removeEventListener(`click`,r)}var p=[{index:0,name:`Lila`,primary:`#6c63ff`,light:`#ede9ff`},{index:1,name:`Koralle`,primary:`#ff6b6b`,light:`#fff0f0`},{index:2,name:`Grün`,primary:`#43aa8b`,light:`#e8f8f1`},{index:3,name:`Orange`,primary:`#f9a826`,light:`#fff8e1`},{index:4,name:`Pink`,primary:`#ef476f`,light:`#fce4ec`},{index:5,name:`Blau`,primary:`#118ab2`,light:`#e1f5fe`},{index:6,name:`Hellgrün`,primary:`#8ac926`,light:`#f1f8e9`},{index:7,name:`Violett`,primary:`#9b5de5`,light:`#f3e5ff`}];function m(e=0,t=`color-picker`){return`
    <div class="color-picker" id="${t}" role="group" aria-label="Farbe auswählen">
      ${p.map(n=>`
    <button
      type="button"
      class="color-swatch${n.index===e?` selected`:``}"
      style="background-color: ${n.primary};"
      data-palette-index="${n.index}"
      data-picker="${t}"
      aria-label="${n.name}"
      aria-pressed="${n.index===e}"
      title="${n.name}"
    ></button>
  `).join(``)}
    </div>
  `}function h(e,t){let n=document.getElementById(e);if(!n)return()=>{};let r=e=>{let r=e.target.closest(`[data-palette-index]`);if(!r)return;let i=Number(r.dataset.paletteIndex);n.querySelectorAll(`.color-swatch`).forEach(e=>{let t=Number(e.dataset.paletteIndex)===i;e.classList.toggle(`selected`,t),e.setAttribute(`aria-pressed`,String(t))}),t(i)};return n.addEventListener(`click`,r),()=>n.removeEventListener(`click`,r)}var g={formatCurrency:u,escapeHtml:e,calcPercent:c,getPaletteColors:n,formatAllowanceSchedule:i,DAY_NAMES:r,formatRelativeDate:t,getTxIcon:o,icon:s,GOAL_ICON_KEYS:a,AVATAR_ICON_KEYS:l,renderAvatarPicker:d,renderColorPicker:m};function _(e){let t={},n=/<!--\s*@block:\s*(\w+)\s*-->([\s\S]*?)(?=<!--\s*@block:|$)/g,r;for(;(r=n.exec(e))!==null;)t[r[1]]=r[2].trim();return t}function v(e,t={}){let n={...g,...t};return Function(...Object.keys(n),`return \`${e}\``)(...Object.values(n))}export{f as i,v as n,h as r,_ as t};