import{B as e,C as t,D as n,F as r,G as i,I as a,d as o,f as s,k as c,l,m as u,t as d,w as f}from"./errors-B_GFX16_.js";import{o as p,s as m,t as h}from"./finance-BduCd0kS.js";import{t as g}from"./api-0d9YJt6W.js";import{a as _,t as v}from"./Modal-BR3LSJ3m.js";import{o as y}from"./index-MuNmPWIB.js";import{a as b,c as x,n as S,o as C,t as w}from"./template-CY161wSk.js";import{t as T}from"./AllowanceForm-uwqQv-F4.js";import{a as E,i as D,n as O,r as k}from"./status--rfWzDs2.js";import{t as A}from"./GoalForm-CrNCMGFA.js";import{t as j}from"./ChildForm-BTQezad2.js";import{a as M,n as N,o as P,t as ee}from"./stats-DmoPsUGF.js";function F(e){a({children:r().children.map(t=>t.id===e.id?{...t,...e}:t)})}async function I(e){let{children:t,settings:a}=r(),o=t.find(t=>t.id===e);if(!o)return!1;let s=o.financialRules??h,c=a.currency??`€`,u=(e,t,r,i)=>`
    <div class="form-group">
      <label class="form-label" for="${e}">${t}</label>
      <div class="input-affix">
        <input class="form-input" id="${e}" type="text" inputmode="decimal"
          value="${C(r)}" aria-required="true" autocomplete="off">
        <span class="input-affix__unit" aria-hidden="true">${n(i)}</span>
      </div>
    </div>`,f=new v({title:i(`finance.title`),subtitle:n(o.name),icon:`shield`,help:`finance`,sheet:!0,content:`
      <div class="form-group">
        <label class="form-label" for="finance-enabled">
          <input id="finance-enabled" type="checkbox" ${s.allowAdvances?`checked`:``}>
          ${i(`finance.allowAdvances`)}
        </label>
        <p class="form-hint">${i(`finance.disabledHint`)}</p>
      </div>
      <fieldset id="finance-options" class="finance-options" ${s.allowAdvances?``:`disabled`}>
        <legend class="sr-only">${i(`finance.title`)}</legend>
        ${u(`finance-limit`,i(`finance.maxDebt`),s.maxDebt,c)}
        <p class="form-hint">${i(`finance.limitHint`)}</p>
        <div class="form-group">
          <label class="form-label" for="finance-model">${i(`finance.feeModel`)}</label>
          <select class="form-select" id="finance-model">
            ${[`none`,`fixed`,`interest`].map(e=>`<option value="${e}" ${s.feeModel===e?`selected`:``}>${i(`finance.models.${e}`)}</option>`).join(``)}
          </select>
        </div>
        <div id="finance-fixed" ${s.feeModel===`fixed`?``:`hidden`}>
          ${u(`finance-fee`,i(`finance.fixedFee`),s.fixedFee,c)}
          <p class="form-hint">${i(`finance.feeHint`)}</p>
        </div>
        <div id="finance-interest" ${s.feeModel===`interest`?``:`hidden`}>
          ${u(`finance-percent`,i(`finance.repaymentPercent`),s.repaymentPercent,`%`)}
          <p class="form-hint">${i(`finance.interestHint`)}</p>
        </div>
      </fieldset>
      <p class="form-hint">${i(`finance.repaymentHint`)}</p>
    `,actions:[{label:i(`common.cancel`),value:`cancel`,variant:`secondary`},{label:i(`common.save`),value:`save`,variant:`primary`,pin:!0}],validate:(e,t)=>{if(!t.root.querySelector(`#finance-enabled`).checked)return!0;let n=t.root.querySelector(`#finance-model`).value,r=[[`finance-limit`,99999,!1]];n===`fixed`&&r.push([`finance-fee`,99999,!0]),n===`interest`&&r.push([`finance-percent`,100,!0]);let a=!0;for(let[e,n,o]of r){let{value:r,empty:s,error:c}=x(t.root.querySelector(`#${e}`).value);(s||c||r>n||!o&&r===0)&&(t.fieldError(e,i(`finance.invalidValue`,{max:n})),a=!1)}return a},submit:async(t,n)=>{if(!await y(i(`finance.pinReason`)))return!1;let r=n.root.querySelector(`#finance-enabled`).checked,a=n.root.querySelector(`#finance-model`).value,o=e=>x(n.root.querySelector(`#${e}`).value).value;return g.updateFinancialRules(e,{...s,allowAdvances:r,...r?{maxDebt:o(`finance-limit`),feeModel:a,fixedFee:a===`fixed`?o(`finance-fee`):s.fixedFee,repaymentPercent:a===`interest`?o(`finance-percent`):s.repaymentPercent}:{}})},errorMessage:e=>d(e,i(`finance.saveFailed`))}),p=f.open(),m=document.getElementById(`finance-enabled`).closest(`.modal-overlay`),_=()=>{m.querySelector(`#finance-options`).disabled=!m.querySelector(`#finance-enabled`).checked,m.querySelector(`#finance-fixed`).hidden=m.querySelector(`#finance-model`).value!==`fixed`,m.querySelector(`#finance-interest`).hidden=m.querySelector(`#finance-model`).value!==`interest`};m.addEventListener(`change`,_);let b=await p;return m.removeEventListener(`change`,_),b===`save`?(F(f.result),l.success(i(`finance.saved`)),!0):!1}async function L(e){let{children:t,settings:a}=r(),o=t.find(t=>t.id===e);if(!o)return!1;let s=p(o),u=Math.min(s.availableBalance,s.totalDebt),f=a.currency??`€`,m=[...[1,2,5].map(e=>({amount:e,label:c(e,f)})),{amount:u,label:i(`finance.repayFull`)}],h=new v({title:i(`finance.repay`),icon:`exchange`,help:`finance`,sheet:!0,content:`
      <div class="form-group">
        <label class="form-label" for="repayment-amount">${i(`transaction.amountLabel`,{currency:n(f)})}</label>
        <input class="form-input" id="repayment-amount" type="text" inputmode="decimal"
          value="" aria-required="true" aria-describedby="repayment-hint" autocomplete="off">
        <div class="repay-quick" role="group" aria-label="${i(`finance.repayQuick`)}">
          ${m.map(e=>`<button type="button" class="btn btn-secondary btn-sm" data-repay-amount="${C(e.amount)}"
            aria-pressed="false" ${e.amount>u?`disabled`:``}>${e.label}</button>`).join(``)}
        </div>
        <p class="form-hint" id="repayment-hint">${i(`finance.repayHint`,{amount:c(u,f)})}</p>
      </div>`,fields:{"repayment-amount":b({max:u,currency:f})},actions:[{label:i(`common.cancel`),value:`cancel`,variant:`secondary`},{label:i(`common.record`),value:`repay`,variant:`primary`,pin:!0}],submit:async(t,n)=>await y(i(`finance.repay`))?g.repayDebt(e,{amount:x(n.root.querySelector(`#repayment-amount`).value).value}):!1,errorMessage:e=>d(e,i(`transaction.bookingFailed`))}),_=h.open(),S=document.getElementById(`repayment-amount`),w=[...S.parentElement.querySelectorAll(`[data-repay-amount]`)];return S.parentElement.addEventListener(`click`,e=>{let t=e.target.closest(`[data-repay-amount]`);t&&(S.value=t.dataset.repayAmount,S.dispatchEvent(new Event(`input`,{bubbles:!0})))}),S.addEventListener(`input`,()=>w.forEach(e=>e.setAttribute(`aria-pressed`,String(e.dataset.repayAmount===S.value)))),await _===`repay`?(F(h.result.child),l.success(i(`finance.repaid`)),!0):!1}var R={line:e=>({svg:V(e),overlay:H(e)})};Object.freeze(Object.keys(R));var z=6;function B({type:e=`line`,label:t,labels:r,longLabels:i=r,periodLabel:a,series:o,formatValue:s}){let c=R[e];if(!c)throw Error(`Unbekannter Diagrammtyp: ${e}`);let l=r.length,u=K(Math.max(0,...o.flatMap(e=>e.values))),d={series:o,count:l,x:e=>l<=1?50:e/(l-1)*100,y:e=>100-Math.max(0,e)/u*100},f=c(d);return`
    <figure class="chart chart--${e}" role="group" aria-label="${n(t)}">
      <div class="chart__body" aria-hidden="true">
        <div class="chart__canvas">
          <span class="chart__y-label" style="top: 0%">${n(s(u))}</span>
          <span class="chart__y-label" style="top: 50%">${n(s(u/2))}</span>
          <svg class="chart__svg" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            ${[0,50,100].map(e=>`<line class="chart__grid${e===100?` chart__grid--base`:``}" x1="0" x2="100" y1="${e}" y2="${e}" vector-effect="non-scaling-stroke"/>`).join(``)}
            ${f.svg}
          </svg>
          ${f.overlay??``}
        </div>
        <div class="chart__x">${U(r,d.x)}</div>
      </div>
      ${W(o)}
      ${G({label:t,periodLabel:a,longLabels:i,series:o,formatValue:s})}
    </figure>`}function V({series:e,x:t,y:n}){return e.map(e=>{let r=e.values.map((e,r)=>`${q(t(r))},${q(n(e))}`).join(` `);return`<polyline class="chart__line chart__tone--${e.tone}" points="${r}" vector-effect="non-scaling-stroke"/>`}).join(``)}function H({series:e,x:t,y:n}){return e.map(e=>e.values.map((r,i)=>`<span class="chart__dot chart__tone--${e.tone}" style="left: ${q(t(i))}%; top: ${q(n(r))}%"></span>`).join(``)).join(``)}function U(e,t){let r=Math.ceil(e.length/z),i=e.length-1;return e.map((a,o)=>o===i||o%r===0&&i-o>=r?`<span class="chart__x-label${e.length>1&&o===0?` chart__x-label--start`:o===i&&e.length>1?` chart__x-label--end`:``}" style="left: ${q(t(o))}%">${n(a)}</span>`:``).join(``)}function W(e){return`<ul class="chart__legend">
    ${e.map(e=>`<li class="chart__legend-item"><span class="chart__swatch chart__tone--${e.tone}" aria-hidden="true"></span>${n(e.label)}</li>`).join(``)}
  </ul>`}function G({label:e,periodLabel:t,longLabels:r,series:i,formatValue:a}){return`<table class="sr-only">
    <caption>${n(e)}</caption>
    <thead><tr><th scope="col">${n(t)}</th>${i.map(e=>`<th scope="col">${n(e.label)}</th>`).join(``)}</tr></thead>
    <tbody>
      ${r.map((e,t)=>`<tr><th scope="row">${n(e)}</th>${i.map(e=>`<td>${n(a(e.values[t]))}</td>`).join(``)}</tr>`).join(``)}
    </tbody>
  </table>`}function K(e){if(e<=0)return 1;let t=10**Math.floor(Math.log10(e));return[1,2,2.5,5,10].find(n=>n*t>=e)*t}var q=e=>Math.round(e*100)/100;function J({id:e,label:t,options:r,selected:i}){return`
    <div class="segmented" id="${n(e)}" role="group" aria-label="${n(t)}">
      ${r.map(e=>`
        <button class="segmented__option" type="button" data-value="${n(e.value)}"
          aria-pressed="${e.value===i}"${e.ariaLabel?` aria-label="${n(e.ariaLabel)}"`:``}>${n(e.label)}</button>
      `).join(``)}
    </div>`}function Y(e,t){let n=n=>{let r=n.target.closest(`.segmented__option`);if(!(!r||r.getAttribute(`aria-pressed`)===`true`)){for(let t of e.querySelectorAll(`.segmented__option`))t.setAttribute(`aria-pressed`,String(t===r));t(r.dataset.value)}};return e.addEventListener(`click`,n),()=>e.removeEventListener(`click`,n)}function X(e,{premium:t=!1}={}){return J({id:`activity-range`,label:i(`dashboard.activityRangeLabel`),selected:e,options:N({premium:t}).map(e=>({value:e.id,label:i(`dashboard.ranges.${e.id}.short`),ariaLabel:i(`dashboard.ranges.${e.id}.long`)}))})}function Z(t,n,r,{type:a=`line`}={}){let o=ee(t,n);if(!o.hasEnoughData)return s({variant:`inline`,icon:`trending-up`,text:i(`dashboard.activityNotEnoughData`)});let l=e(),u=o.range.bucket===`week`,d=new Intl.DateTimeFormat(l,u?{day:`numeric`,month:`short`}:{month:`short`}),f=new Intl.DateTimeFormat(l,u?{day:`numeric`,month:`long`}:{month:`long`,year:`numeric`});return B({type:a,label:i(`dashboard.chartLabel`,{range:i(`dashboard.ranges.${o.range.id}.long`)}),periodLabel:i(`dashboard.chartPeriod`),labels:o.points.map(e=>d.format(e.start)),longLabels:o.points.map(e=>u?i(`dashboard.chartWeekOf`,{date:f.format(e.start)}):f.format(e.start)),series:[{id:`income`,label:i(`dashboard.statIncome`),tone:`pos`,values:o.points.map(e=>e.income)},{id:`expense`,label:i(`dashboard.statExpense`),tone:`neg`,values:o.points.map(e=>e.expense)}],formatValue:e=>c(e,r)})}var Q=w(`<!-- @block: main -->\r
<section class="view-wallet view-section" aria-label="\${t('wallet.label', { name: escapeHtml(child.name) })}">\r
\r
  <div class="wallet-hero">\r
    <div class="wallet-hero__top">\r
      <div class="wallet-hero__identity">\r
        <div class="wallet-avatar" aria-hidden="true">\${icon(child.avatar, { size: 26 })}</div>\r
        <div class="wallet-name">\${escapeHtml(child.name)}</div>\r
      </div>\r
    </div>\r
    <div>\${t('finance.availableBalance')}</div>\r
    <div class="wallet-balance" data-balance="\${child.balance}">\${formatCurrency(child.balance, currency)}</div>\r
    \${finance.advanceActive ? \`\r
      <dl class="wallet-net">\r
        <div class="wallet-net__row wallet-net__row--debt">\r
          <dt>\${icon('shield', { size: 14 })}\${t('finance.openDebt')}</dt>\r
          <dd>\${formatSignedCurrency(-finance.totalDebt, currency)}</dd>\r
        </div>\r
        <div class="wallet-net__row">\r
          <dt class="wallet-net__label">\${t('finance.netBalance')}</dt>\r
          <dd class="wallet-net__value">\${formatSignedCurrency(finance.netBalance, currency)}</dd>\r
        </div>\r
      </dl>\` : ''}\r
    \${heroFacts.length > 0 ? \`\r
      <ul class="wallet-hero__facts" aria-label="\${t('wallet.factsLabel')}">\r
        \${heroFacts.map(f => \`<li>\${icon(f.icon, { size: 14 })}<span>\${escapeHtml(f.text)}</span></li>\`).join('')}\r
      </ul>\` : ''}\r
    <footer class="card-footer wallet-hero__footer">\r
      <button class="btn btn-ghost card-footer__action" id="btn-edit-child" type="button"\r
        aria-label="\${t('child.titleEdit', { name: escapeHtml(child.name) })}">\r
        \${icon('edit', { size: 18 })}<span>\${t('common.edit')}</span>\r
      </button>\r
    </footer>\r
  </div>\r
\r
  \${renderStatusList(statuses, t('wallet.statusLabel'))}\r
\r
  <div class="wallet-quick-actions" role="group" aria-label="\${t('wallet.actionsLabel')}">\r
    <button class="quick-action-btn quick-action-btn--success" id="btn-earn" type="button"\r
      aria-label="\${t('transaction.earnTitle')}">\r
      <span class="quick-icon" aria-hidden="true">\${icon('plus-circle', { size: 30 })}</span>\r
      <span>\${t('wallet.income')}</span>\r
    </button>\r
    <button class="quick-action-btn quick-action-btn--danger" id="btn-spend" type="button"\r
      aria-label="\${t('transaction.spendTitle')}">\r
      <span class="quick-icon" aria-hidden="true">\${icon('minus-circle', { size: 30 })}</span>\r
      <span>\${t('wallet.expense')}</span>\r
    </button>\r
  </div>\r
\r
  <section class="card dashboard-card" aria-labelledby="finance-card-title">\r
    \${sectionHeader({ id: 'finance-card-title', icon: 'shield', title: t('finance.title'), help: 'finance' })}\r
    <dl class="finance-facts">\r
      <div class="finance-facts__primary"><dt>\${t('finance.openDebt')}</dt><dd>\${finance.advanceActive\r
        ? formatCurrency(finance.totalDebt, currency) : t('finance.noDebt')}</dd></div>\r
      <div><dt>\${t('finance.totalDebt')}</dt><dd>\${formatCurrency(repayment.total, currency)}</dd></div>\r
      <div><dt>\${t('finance.debtLimit')}</dt><dd>\${finance.allowAdvances\r
        ? formatCurrency(finance.maxDebt, currency) : t('finance.notAllowed')}</dd></div>\r
    </dl>\r
    \${finance.advanceActive ? (label => \`\r
      <div class="finance-repaid">\r
        <div class="progress-bar">\r
          <div class="progress-fill" style="--target-width: \${repayment.percent}%;" role="progressbar"\r
            aria-valuenow="\${repayment.percent}" aria-valuemin="0" aria-valuemax="100" aria-label="\${label}"></div>\r
        </div>\r
        <div class="finance-repaid__label" aria-hidden="true">\${label}</div>\r
      </div>\`)(t('finance.repaidOf', { repaid: formatCurrency(repayment.repaid, currency), total: formatCurrency(repayment.total, currency) })) : ''}\r
    \${manageFooter('btn-financial-rules', t('finance.manage'), finance.advanceActive\r
      ? footerButton({ id: 'btn-repay-debt', label: t('finance.repay'), icon: 'coin', disabled: !(finance.availableBalance > 0) })\r
      : '')}\r
  </section>\r
\r
  <section class="card dashboard-card" aria-labelledby="allowance-card-title">\r
    \${sectionHeader({ id: 'allowance-card-title', icon: 'clock', title: t('allowance.title'), help: 'allowances' })}\r
    \${allowances.length > 0\r
      ? \`<ul class="allowance-list-compact">\r
          \${allowances.map(a => allowanceItem({ allowance: a, currency })).join('')}\r
        </ul>\r
        \${allowanceStatus ? \`<div class="dashboard-card__status">\${renderStatusHint(allowanceStatus)}</div>\` : ''}\r
        \${manageFooter('btn-manage-allowances', t('allowance.manage'))}\`\r
      : renderEmptyState({\r
          variant: 'inline',\r
          icon: 'clock',\r
          text: t('allowance.emptyText'),\r
          actions: [{ id: 'btn-create-allowance', label: t('allowance.create'), icon: 'plus' }],\r
        })}\r
  </section>\r
\r
  <section class="card dashboard-card" aria-labelledby="goals-card-title">\r
    \${sectionHeader({ id: 'goals-card-title', icon: 'target', title: t('goal.title'), help: 'goals' })}\r
    \${activeGoals.length > 0\r
      ? \`<div class="dashboard-goal-list">\r
          \${activeGoals.map(g => goalItem({ goal: g, currency, balance: child.balance })).join('')}\r
        </div>\`\r
      : renderEmptyState({\r
          variant: 'inline',\r
          icon: goals.length > 0 ? 'trophy' : 'target',\r
          text: goals.length > 0 ? t('goal.allDoneText') : t('goal.emptyText'),\r
          actions: [{ id: 'btn-create-goal', label: t('goal.create'), icon: 'plus' }],\r
        })}\r
    \${goals.length > 0 ? manageFooter('btn-manage-goals', t('goal.manage')) : ''}\r
  </section>\r
\r
  <section class="card dashboard-card" aria-labelledby="activity-card-title">\r
    \${sectionHeader({\r
      id: 'activity-card-title', icon: 'trending-up', title: t('dashboard.activityTitle'), help: 'activity',\r
      controls: transactions.length > 0 ? activityRangeControl : null,\r
    })}\r
    \${transactions.length > 0\r
      ? \`<div class="activity-chart" id="activity-chart">\${activityChart}</div>\`\r
      : renderEmptyState({\r
          variant: 'inline',\r
          icon: 'trending-up',\r
          text: t('dashboard.activityEmpty'),\r
        })}\r
  </section>\r
\r
  <section class="card dashboard-card" aria-labelledby="transactions-title">\r
    \${sectionHeader({\r
      id: 'transactions-title', icon: 'list', title: t('transaction.recentTitle'), help: 'transactions',\r
      subtitle: transactions.length > 0 ? t('transaction.recentHint') : null,\r
    })}\r
    \${transactions.length > 0\r
      ? \`\${recentTransactions.length > 0\r
          ? transactionList({ transactions: recentTransactions, currency })\r
          : \`<p class="dashboard-card__hint">\${t('transaction.recentEmpty')}</p>\`}\r
        <div class="card-footer">\r
          <a class="btn btn-ghost card-footer__action" id="link-all-transactions"\r
            href="#/wallet/\${child.id}/transactions">\r
            \${t('transaction.showAll')} \${icon('chevron-right', { size: 18 })}\r
          </a>\r
        </div>\`\r
      : renderEmptyState({\r
          variant: 'inline',\r
          icon: 'list',\r
          text: t('transaction.emptyText'),\r
          actions: [\r
            { id: 'btn-empty-earn', label: t('transaction.earnTitle'), icon: 'plus-circle', variant: 'secondary' },\r
            { id: 'btn-empty-spend', label: t('transaction.spendTitle'), icon: 'minus-circle', variant: 'secondary' },\r
          ],\r
        })}\r
  </section>\r
\r
</section>\r
\r
<!-- @block: allowanceItem -->\r
<li class="allowance-item-compact\${allowance.isActive ? '' : ' inactive'}">\r
  <span class="allowance-item-compact-schedule">\r
    \${allowance.frequency === 'weekly'\r
      ? t('wallet.allowanceRuleWeekly', { amount: \`<strong>\${formatCurrency(allowance.amount, currency)}</strong>\`, day: DAY_NAMES[allowance.dayOfWeek] })\r
      : t('wallet.allowanceRuleMonthly', { amount: \`<strong>\${formatCurrency(allowance.amount, currency)}</strong>\`, day: allowance.dayOfMonth })}\r
  </span>\r
  \${!allowance.isActive ? \`<span class="badge badge-muted">\${t('allowance.pausedBadge')}</span>\` : ''}\r
</li>\r
\r
<!-- @block: goalItem -->\r
<article class="wallet-goal-card wallet-goal-card--\${status.state}">\r
  <header class="wallet-goal-card__header">\r
    <span class="wallet-goal-card__title">\${icon(goal.icon, { size: 18, className: 'inline-icon' })} <strong>\${escapeHtml(goal.name)}</strong></span>\r
    \${status.state === 'reached' ? renderStatusHint({ tone: 'success', icon: 'trophy', text: status.text }) : ''}\r
  </header>\r
  <div class="progress-bar wallet-goal-card__progress">\r
    <div class="progress-fill\${status.state === 'reached' ? ' complete' : ''}" style="--target-width: \${status.pct}%;"\r
      role="progressbar" aria-valuenow="\${status.pct}" aria-valuemin="0" aria-valuemax="100"\r
      aria-label="\${t('goal.progressLabel', { name: escapeHtml(goal.name) })}"></div>\r
  </div>\r
  <footer class="wallet-goal-card__meta">\r
    <span>\${t('goal.saved', { saved: formatCurrency(Math.min(balance, goal.targetAmount), currency), target: formatCurrency(goal.targetAmount, currency) })}</span>\r
    \${status.state === 'reached' ? '' : \`<span class="wallet-goal-card__rest">\${escapeHtml(status.text)}</span>\`}\r
  </footer>\r
</article>\r
`);async function $(e,t){try{return await e()}catch(e){return console.error(e),t(),[]}}var te=class{constructor(e){this.childId=e,this.child=null,this._handlers=[],this._flashType=null,this._activityRange=`1m`,this._transactions=[]}async render(){let{children:e,settings:t}=r();if(this.child=e.find(e=>e.id===this.childId),!this.child)return o();f(this.child.colorPaletteIndex),document.getElementById(`toolbar-title`).textContent=this.child.name;let n=t.currency??`€`;this._loadFailed=!1;let a=()=>{this._loadFailed=!0},[s,c,l]=await Promise.all([$(()=>g.getTransactions(this.childId),a),$(()=>g.getGoals(this.childId),a),$(()=>g.getAllowances(this.childId),a)]),d=this.child.balance,h=c.filter(e=>!e.purchasedAt).sort((e,t)=>e.targetAmount-t.targetAmount),_=({allowance:e,currency:t})=>S(Q.allowanceItem,{allowance:e,currency:t}),v=({goal:e,currency:t,balance:n})=>S(Q.goalItem,{goal:e,currency:t,balance:n,status:k(e,n,t)}),y=({transactions:e,currency:t})=>P(e,t,i(`transaction.recentTitle`),{variant:`rows`}),b=({id:e,label:t,ariaLabel:n,icon:r,disabled:i=!1})=>`
      <button class="btn btn-ghost card-footer__action" id="${e}" type="button"${n?` aria-label="${n}"`:``}${i?` disabled`:``}>
        ${r?u(r,{size:18}):``}<span>${t}</span>
      </button>`,x=(...e)=>`<div class="card-footer">${e.filter(Boolean).join(``)}</div>`,C=(e,t,n=``)=>x(n,b({id:e,label:i(`common.manage`),ariaLabel:t,icon:`settings`})),w=l.filter(e=>e.isActive),T=l.length===0?null:w.length===0?{tone:`attention`,icon:`clock`,text:i(`allowance.paused`)}:(e=>e&&{tone:`info`,icon:`clock`,text:e.text})(E(w)),A=O({childId:this.childId,allowances:l,goals:c,balance:d}),j=D({goals:c,transactions:s});this._transactions=s,this._currency=n;let M=new Date;return M.setHours(0,0,0,0),M.setDate(M.getDate()-6),S(Q.main,{child:this.child,transactions:s,recentTransactions:s.filter(e=>new Date(e.date)>=M),goals:c,activeGoals:h,allowances:l,currency:n,balance:d,allowanceItem:_,goalItem:v,transactionList:y,manageFooter:C,footerButton:b,allowanceStatus:T,statuses:A,heroFacts:j,finance:p(this.child),repayment:m(this.child,s),activityRangeControl:X(this._activityRange),activityChart:s.length>0?Z(s,this._activityRange,n):``})}mount(){let e=r().settings.currency??`€`;this._loadFailed&&l.error(i(`errors.loadFailed`),{action:{label:i(`common.retry`),onClick:()=>this._refresh()}});let n=document.querySelector(`.wallet-balance[data-balance]`);if(n){if(this._flashType){let e=this._flashType;this._flashType=null,n.classList.add(`wallet-balance--flash-${e}`),n.addEventListener(`animationend`,()=>n.classList.remove(`wallet-balance--flash-${e}`),{once:!0})}t(n,0,parseFloat(n.dataset.balance),e)}let a={"btn-earn":()=>this._book(`earn`),"btn-spend":()=>this._book(`spend`),"btn-empty-earn":()=>this._book(`earn`),"btn-empty-spend":()=>this._book(`spend`),"btn-edit-child":()=>this._editChild(),"btn-financial-rules":()=>this._editFinancialRules(),"btn-repay-debt":()=>this._repayDebt(),"btn-manage-allowances":()=>this._manageAllowances(),"btn-create-allowance":()=>this._createAllowance(),"btn-manage-goals":()=>{location.hash=`#/wallet/${this.childId}/goals`},"btn-create-goal":()=>this._createGoal()};for(let[e,t]of Object.entries(a)){let n=document.getElementById(e);n&&(n.addEventListener(`click`,t),this._handlers.push({el:n,type:`click`,fn:t}))}let o=document.getElementById(`activity-range`),s=document.getElementById(`activity-chart`);o&&s&&(this._unbindRange=Y(o,e=>{this._activityRange=e,s.innerHTML=Z(this._transactions,e,this._currency)}))}async _book(e){await M(this.childId,e)&&(this._flashType=e===`earn`?`pos`:`neg`,await this._refresh())}async _editChild(){await j(this.childId)&&await this._refresh()}async _editFinancialRules(){await I(this.childId)&&await this._refresh()}async _repayDebt(){await L(this.childId)&&await this._refresh()}_manageAllowances(){location.hash=`#/wallet/${this.childId}/allowances`}async _createAllowance(){await T(this.childId)&&await this._refresh()}async _createGoal(){await A(this.childId)&&await this._refresh()}async _refresh(){if(!document.querySelector(`.view-wallet`))return;let e={"#btn-create-goal":[`#btn-manage-goals`],"#btn-create-allowance":[`#btn-manage-allowances`],"#btn-empty-earn":[`#btn-earn`],"#btn-empty-spend":[`#btn-spend`]};await _(async()=>{let e=await this.render(),t=document.querySelector(`.view-wallet`);t&&(this.unmount(),t.outerHTML=e,this.mount())},t=>e[t]??[])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[],this._unbindRange?.(),this._unbindRange=null}};export{te as default};