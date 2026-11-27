import{D as e,F as t,G as n,I as r,k as i,l as a,t as o}from"./errors-B_GFX16_.js";import{t as s}from"./api-0d9YJt6W.js";import{t as c}from"./Modal-BR3LSJ3m.js";import{o as l}from"./index-MuNmPWIB.js";import{i as u,n as d,r as f,t as p}from"./template-CY161wSk.js";var m=p(`<!-- @block: childForm -->\r
<div class="form-group">\r
  <label class="form-label" for="child-name">\${t('child.nameLabel')}</label>\r
  <input class="form-input" id="child-name" type="text"\r
    value="\${escapeHtml(existing?.name ?? '')}"\r
    placeholder="\${t('child.namePlaceholder')}" maxlength="50" autocomplete="off" aria-required="true">\r
</div>\r
\r
\${!isEdit ? \`\r
  <div class="form-group">\r
    <label class="form-label" for="child-balance">\${t('child.startBalanceLabel', { currency })}</label>\r
    <input class="form-input" id="child-balance" type="number" inputmode="decimal"\r
      min="0" max="99999" step="0.01" value="0" placeholder="0.00">\r
    <span class="form-hint" id="child-balance-hint">\${t('child.startBalanceHint')}</span>\r
  </div>\r
\` : ''}\r
\r
<div class="form-group">\r
  <p class="form-label">\${t('child.avatarLabel')}</p>\r
  \${renderAvatarPicker(selectedAvatar, 'modal-avatar-picker')}\r
</div>\r
\r
<div class="form-group">\r
  <p class="form-label">\${t('child.colorLabel')}</p>\r
  \${renderColorPicker(selectedPalette, 'modal-color-picker')}\r
</div>\r
\r
\${!isEdit ? allowanceFields() : ''}\r
\r
<!-- @block: allowanceFields -->\r
<hr class="form-divider">\r
<p class="form-section-title">\r
  \${icon('coin', { size: 16, className: 'inline-icon' })}\r
  \${t('child.allowanceSetup')} <span class="form-hint">(\${t('common.optional')})</span>\r
</p>\r
\r
<div class="allowance-inline-row">\r
  <div class="form-group">\r
    <label class="form-label" for="inline-allowance-amount">\${t('transaction.amountLabel', { currency })}</label>\r
    <input class="form-input" id="inline-allowance-amount"\r
      type="number" inputmode="decimal" min="0" max="9999.99" step="0.01" placeholder="\${t('child.allowanceAmountPlaceholder')}">\r
  </div>\r
\r
  <div class="form-group">\r
    <label class="form-label" for="inline-allowance-day">\${t('allowance.weekdayLabel')}</label>\r
    <select class="form-select" id="inline-allowance-day">\r
      \${DAY_NAMES.map((name, idx) => \`\r
        <option value="\${idx}" \${idx === 6 ? 'selected' : ''}>\${name}</option>\r
      \`).join('')}\r
    </select>\r
  </div>\r
</div>\r
\r
<span class="form-hint">\r
  \${t('child.allowanceEmptyHint')}\r
</span>\r
`);async function h(p=null){let h=!!p,{children:g,settings:_}=t(),v=_.currency??`€`,y=h?g.find(e=>e.id===p):null,b=y?.avatar??`star`,x=y?.colorPaletteIndex??0,S=d(m.childForm,{existing:y,currency:v,selectedAvatar:b,selectedPalette:x,isEdit:h,allowanceFields:()=>d(m.allowanceFields,{currency:v})}),C=()=>{},w=()=>{},T=(e,t)=>parseFloat(e.querySelector(`#${t}`)?.value??``),E=new c({title:h?n(`child.titleEdit`,{name:e(y.name)}):n(`child.titleCreate`),subtitle:n(h?`child.subtitleEdit`:`child.subtitleCreate`),icon:`user`,help:`children`,sheet:!0,content:S,actions:[{label:n(`common.cancel`),value:`cancel`,variant:`secondary`},{label:n(h?`common.save`:`common.create`),value:`submit`,variant:`primary`,pin:!0}],validate:(e,t)=>{let r=!0;if(t.root.querySelector(`#child-name`)?.value?.trim()||(t.fieldError(`child-name`,n(`validation.nameRequired`)),r=!1),!h){let e=T(t.root,`child-balance`);e<0?(t.fieldError(`child-balance`,n(`validation.amountNotNegative`)),r=!1):e>99999&&(t.fieldError(`child-balance`,n(`validation.amountMax`,{max:i(99999,v)})),r=!1);let a=T(t.root,`inline-allowance-amount`);a<0?(t.fieldError(`inline-allowance-amount`,n(`validation.amountNotNegative`)),r=!1):a>9999.99&&(t.fieldError(`inline-allowance-amount`,n(`validation.amountMax`,{max:i(9999.99,v)})),r=!1)}return r},submit:async(e,t)=>{if(!await l(n(h?`pin.reasons.childEdit`:`pin.reasons.childCreate`)))return!1;let r=t.root.querySelector(`#child-name`).value.trim();if(h)return{saved:await s.updateChild(p,{name:r,avatar:b,colorPaletteIndex:x})};let i=await s.createChild({name:r,avatar:b,colorPaletteIndex:x,balance:T(t.root,`child-balance`)||0}),a=T(t.root,`inline-allowance-amount`),o=parseInt(t.root.querySelector(`#inline-allowance-day`)?.value??`6`),c=!1;if(a>0)try{await s.createAllowance(i.id,{amount:a,frequency:`weekly`,dayOfWeek:isNaN(o)?6:o,dayOfMonth:null})}catch(e){console.error(e),c=!0}return{saved:i,ruleFailed:c}},errorMessage:e=>o(e,n(`child.saveFailed`))}),D=E.open();C=u(`modal-avatar-picker`,e=>{b=e}),w=f(`modal-color-picker`,e=>{x=e});let O=await D;if(C(),w(),O!==`submit`)return null;let{saved:k,ruleFailed:A}=E.result,j=e(k.name);h?a.success(n(`child.updated`)):A?a.warning(n(`child.createdRuleFailed`,{name:j})):a.success(n(`child.created`,{name:j}));try{r({children:await s.getChildren()})}catch{}return k}export{h as t};