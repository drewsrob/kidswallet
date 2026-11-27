import{A as e,E as t,G as n,L as r,O as i,P as a,c as o,j as s}from"./security-CtCnMpu7.js";import{t as c}from"./api-D0XJvEL6.js";import{t as l}from"./Modal-DHEdphQb.js";import{o as u}from"./index-C__9U8Hp.js";import{a as d,c as f,n as p,o as m,t as h}from"./template-jTQYgMln.js";var g=h(`<!-- @block: transactionList -->
<ul class="\${className}" aria-label="\${label}">
  \${items.map((tx, i) => \`
    <li class="transaction-item" style="animation-delay: \${Math.min(i, 10) * 45}ms">
      <div class="transaction-icon transaction-icon--\${tx.tone}" aria-hidden="true">\${icon(tx.icon, { size: 20 })}</div>
      <div class="transaction-meta">
        <div class="transaction-desc">\${escapeHtml(tx.title)}</div>
        <div class="transaction-sub">
          \${tx.showLabel ? \`<span class="transaction-type">\${tx.label}</span><span aria-hidden="true">·</span>\` : ''}
          <time class="transaction-date" datetime="\${tx.date}">\${tx.dateLabel}</time>
        </div>
      </div>
      <div class="transaction-amount \${tx.amountClass}">\${tx.amountText}</div>
    </li>
  \`).join('')}
</ul>`),_={earn:{icon:`plus-circle`,tone:`pos`},spend:{icon:`minus-circle`,tone:`neg`},allowance:{icon:`gift`,tone:`accent`},initial:{icon:`gift`,tone:`accent`},goal:{icon:`target`,tone:`accent`},correction:{icon:`edit`,tone:`accent`}},v=new Set([``,`einnahme`,`ausgabe`,`grundbetrag`,`startguthaben`,`manuelle buchung`,`manuelle einnahme`,`manuelle ausgabe`,`taschengeld`]),y=[`So`,`Mo`,`Di`,`Mi`,`Do`,`Fr`,`Sa`],b=/^Taschengeld \((?:(So|Mo|Di|Mi|Do|Fr|Sa)|(\d{1,2})\. des Monats)\)$/,x=/^Gekauft: (.+)$/;function S(e){switch(e.type){case`allowance`:return`allowance`;case`initial`:return`initial`;case`goal_purchase`:case`goal_allocation`:return`goal`;case`correction`:return`correction`;default:return e.amount<0?`spend`:`earn`}}function C(e,t){if(e.schedule)return e.schedule;let n=b.exec(t);return n?n[1]?{frequency:`weekly`,dayOfWeek:y.indexOf(n[1])}:{frequency:`monthly`,dayOfMonth:Number(n[2])}:null}function w(e,t,r){let i=n(`transaction.kinds.${t}.generic`);if(t===`allowance`){let t=C(e,r);if(t?.frequency===`weekly`)return n(`transaction.allowanceWeekly`,{day:s(`short`)[t.dayOfWeek]});if(t?.frequency===`monthly`)return n(`transaction.allowanceMonthly`,{day:t.dayOfMonth})}return e.type===`goal_purchase`&&r?n(`transaction.goalPurchase`,{name:x.exec(r)?.[1]??r}):v.has(r.toLowerCase())?i:r}function T(t,r){let a=S(t),o=w(t,a,String(t.description??``).trim()),s=n(`transaction.kinds.${a}.label`),c=!o.toLowerCase().includes(s.toLowerCase()),l=t.amount<0;return{..._[a],label:s,title:o,showLabel:c,date:t.date,dateLabel:e(t.date),amountClass:l?`amount-negative`:`amount-positive`,amountText:`${l?`−`:`+`}${i(Math.abs(t.amount),r)}`}}function E(e,t,r=n(`transaction.listLabel`),{variant:i=`cards`}={}){let a=e.map(e=>T(e,t)),o=i===`rows`?`transactions-list transactions-list--rows`:`transactions-list`;return p(g.transactionList,{items:a,label:r,className:o})}var D=9999.99;async function O(e,s){let{settings:p,children:h}=a(),g=p.currency??`€`,_=h.find(t=>t.id===e);if(!_)return!1;let v=s===`spend`,y=e=>f(e.querySelector(`#tx-amount`)?.value).value,b=new l({title:n(`transaction.${s}Title`),subtitle:n(`transaction.${s}Subtitle`,{name:t(_.name)}),icon:v?`minus`:`plus`,tone:s,help:s,sheet:!0,content:`
      <div class="form-group form-group--primary">
        <label class="form-label" for="tx-amount">${n(`transaction.amountLabel`,{currency:t(g)})}</label>
        <div class="input-affix">
          <input class="form-input form-input--amount" id="tx-amount" type="text" inputmode="decimal"
            enterkeyhint="done" aria-required="true" placeholder="${m(0)}" autocomplete="off"
            ${v?`aria-describedby="tx-amount-hint"`:``}>
          <span class="input-affix__unit" aria-hidden="true">${t(g)}</span>
        </div>
        ${v?`<p class="form-hint" id="tx-amount-hint">${n(`transaction.available`,{amount:`<strong>${i(_.balance,g)}</strong>`})}</p>`:``}
      </div>
      <div class="form-group">
        <label class="form-label" for="tx-desc">${n(`transaction.descriptionLabel`)} <span class="form-optional">(${n(`common.optional`)})</span></label>
        <input class="form-input" id="tx-desc" type="text" enterkeyhint="done"
          maxlength="60" placeholder="${n(`transaction.${s}Placeholder`)}" autocomplete="off">
      </div>
    `,actions:[{label:n(`common.cancel`),value:`cancel`,variant:`secondary`},{label:n(`common.record`),value:`confirm`,variant:`primary`,pin:!0}],fields:{"tx-amount":d({max:D,currency:g})},submit:async(t,r)=>{if(!await u(n(v?`pin.reasons.spend`:`pin.reasons.earn`)))return!1;let i=y(r.root),a=r.root.querySelector(`#tx-desc`)?.value?.trim()||``;return _.balance=(await c.addTransaction(e,{amount:v?-i:i,type:`manual`,description:a})).newBalance,i},errorMessage:e=>r(e,n(`transaction.bookingFailed`))});if(await b.open()!==`confirm`)return!1;let x=i(b.result,g);return o.success(n(v?`transaction.spendSaved`:`transaction.earnSaved`,{amount:x})),!0}export{E as n,O as t};