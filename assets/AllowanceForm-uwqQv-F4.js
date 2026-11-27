import{D as e,F as t,G as n,l as r,t as i}from"./errors-B_GFX16_.js";import{t as a}from"./api-0d9YJt6W.js";import{t as o}from"./Modal-BR3LSJ3m.js";import{o as s}from"./index-MuNmPWIB.js";import{a as c,c as l,n as u,s as d,t as f}from"./template-CY161wSk.js";var p=f(`<!-- @block: allowanceForm -->\r
<div class="form-group form-group--primary">\r
  <label class="form-label" for="allowance-amount">\${t('transaction.amountLabel', { currency: escapeHtml(currency) })}</label>\r
  <div class="input-affix">\r
    <input class="form-input form-input--amount" id="allowance-amount" type="text" inputmode="decimal"\r
      enterkeyhint="done" aria-required="true" autocomplete="off"\r
      value="\${formatAmountInput(existing?.amount)}" placeholder="\${formatAmountInput(0)}">\r
    <span class="input-affix__unit" aria-hidden="true">\${escapeHtml(currency)}</span>\r
  </div>\r
</div>\r
\r
<div class="form-row">\r
  <div class="form-group">\r
    <label class="form-label" for="allowance-frequency">\${t('allowance.frequencyLabel')}</label>\r
    <select class="form-select" id="allowance-frequency">\r
      <option value="weekly"  \${(!existing || existing.frequency === 'weekly')  ? 'selected' : ''}>\${t('allowance.frequencyWeekly')}</option>\r
      <option value="monthly" \${existing?.frequency === 'monthly' ? 'selected' : ''}>\${t('allowance.frequencyMonthly')}</option>\r
    </select>\r
  </div>\r
\r
  <div class="form-group" id="weekly-options" \${(!existing || existing.frequency === 'weekly') ? '' : 'hidden'}>\r
    <label class="form-label" for="allowance-day-of-week">\${t('allowance.weekdayLabel')}</label>\r
    <select class="form-select" id="allowance-day-of-week">\r
      \${DAY_NAMES.map((name, idx) => \`\r
        <option value="\${idx}" \${dayOfWeek === idx ? 'selected' : ''}>\${name}</option>\r
      \`).join('')}\r
    </select>\r
  </div>\r
\r
  <div class="form-group" id="monthly-options" \${existing?.frequency === 'monthly' ? '' : 'hidden'}>\r
    <label class="form-label" for="allowance-day-of-month">\${t('allowance.monthDayLabel')}</label>\r
    <input class="form-input" id="allowance-day-of-month" type="text" inputmode="numeric"\r
      enterkeyhint="done" autocomplete="off" aria-describedby="allowance-day-of-month-hint"\r
      value="\${existing?.dayOfMonth ?? 1}" placeholder="1">\r
    <p class="form-hint" id="allowance-day-of-month-hint">\${t('allowance.monthDayHint')}</p>\r
  </div>\r
</div>\r
`),m=9999.99,h=6;async function g(f,g=null){let _=!!g,{settings:v,children:y}=t(),b=v.currency??`€`,x=y.find(e=>e.id===f),S=g?.dayOfWeek??h,C=e=>({amount:l(e.querySelector(`#allowance-amount`)?.value).value,frequency:e.querySelector(`#allowance-frequency`)?.value,dayOfWeek:parseInt(e.querySelector(`#allowance-day-of-week`)?.value??String(h)),dayOfMonth:parseInt(e.querySelector(`#allowance-day-of-month`)?.value??`1`)}),w=new o({title:n(_?`allowance.titleEdit`:`allowance.titleCreate`),subtitle:x?n(`allowance.subtitle`,{name:e(x.name)}):``,icon:`clock`,tone:`rule`,help:`allowances`,sheet:!0,content:u(p.allowanceForm,{existing:g,currency:b,dayOfWeek:S}),actions:[{label:n(`common.cancel`),value:`cancel`,variant:`secondary`},{label:n(_?`common.save`:`common.create`),value:`submit`,variant:`primary`,pin:!0}],fields:{"allowance-amount":c({max:m,currency:b}),"allowance-day-of-month":d(1,28,()=>n(`validation.dayOfMonth`))},submit:async(e,t)=>{if(!await s(n(_?`pin.reasons.ruleEdit`:`pin.reasons.ruleCreate`)))return!1;let r=C(t.root);_?await a.updateAllowance(g.id,r):await a.createAllowance(f,r)},errorMessage:e=>i(e,n(`allowance.saveFailed`))}).open(),T=document.getElementById(`allowance-frequency`);return T?.addEventListener(`change`,()=>{let e=T.value;document.getElementById(`weekly-options`).hidden=e!==`weekly`,document.getElementById(`monthly-options`).hidden=e!==`monthly`}),await w===`submit`?(r.success(n(_?`allowance.updated`:`allowance.created`)),!0):!1}export{g as t};