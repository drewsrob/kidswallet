import{B as e,C as t,E as n,G as r,O as i,P as a,S as o,c as s,d as c,u as l}from"./security-BjFG_6IR.js";import{t as u}from"./api-DitHL2SU.js";import{a as d}from"./Modal-BZqi9zWF.js";import{n as f,t as p}from"./template-eUISzhwL.js";import{t as m}from"./AllowanceForm-9wGkTe4R.js";import{a as h,i as g,n as _,r as v}from"./status-06dWPduS.js";import{t as y}from"./GoalForm-CUTukSkg.js";import{t as b}from"./ChildForm-DQXPMz9V.js";import{a as x,n as S,o as C,t as w}from"./stats-D_O02OKc.js";var T={line:e=>({svg:O(e),overlay:k(e)})};Object.freeze(Object.keys(T));var E=6;function D({type:e=`line`,label:t,labels:r,longLabels:i=r,periodLabel:a,series:o,formatValue:s}){let c=T[e];if(!c)throw Error(`Unbekannter Diagrammtyp: ${e}`);let l=r.length,u=N(Math.max(0,...o.flatMap(e=>e.values))),d={series:o,count:l,x:e=>l<=1?50:e/(l-1)*100,y:e=>100-Math.max(0,e)/u*100},f=c(d);return`
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
        <div class="chart__x">${A(r,d.x)}</div>
      </div>
      ${j(o)}
      ${M({label:t,periodLabel:a,longLabels:i,series:o,formatValue:s})}
    </figure>`}function O({series:e,x:t,y:n}){return e.map(e=>{let r=e.values.map((e,r)=>`${P(t(r))},${P(n(e))}`).join(` `);return`<polyline class="chart__line chart__tone--${e.tone}" points="${r}" vector-effect="non-scaling-stroke"/>`}).join(``)}function k({series:e,x:t,y:n}){return e.map(e=>e.values.map((r,i)=>`<span class="chart__dot chart__tone--${e.tone}" style="left: ${P(t(i))}%; top: ${P(n(r))}%"></span>`).join(``)).join(``)}function A(e,t){let r=Math.ceil(e.length/E),i=e.length-1;return e.map((a,o)=>o===i||o%r===0&&i-o>=r?`<span class="chart__x-label${e.length>1&&o===0?` chart__x-label--start`:o===i&&e.length>1?` chart__x-label--end`:``}" style="left: ${P(t(o))}%">${n(a)}</span>`:``).join(``)}function j(e){return`<ul class="chart__legend">
    ${e.map(e=>`<li class="chart__legend-item"><span class="chart__swatch chart__tone--${e.tone}" aria-hidden="true"></span>${n(e.label)}</li>`).join(``)}
  </ul>`}function M({label:e,periodLabel:t,longLabels:r,series:i,formatValue:a}){return`<table class="sr-only">
    <caption>${n(e)}</caption>
    <thead><tr><th scope="col">${n(t)}</th>${i.map(e=>`<th scope="col">${n(e.label)}</th>`).join(``)}</tr></thead>
    <tbody>
      ${r.map((e,t)=>`<tr><th scope="row">${n(e)}</th>${i.map(e=>`<td>${n(a(e.values[t]))}</td>`).join(``)}</tr>`).join(``)}
    </tbody>
  </table>`}function N(e){if(e<=0)return 1;let t=10**Math.floor(Math.log10(e));return[1,2,2.5,5,10].find(n=>n*t>=e)*t}var P=e=>Math.round(e*100)/100;function F({id:e,label:t,options:r,selected:i}){return`
    <div class="segmented" id="${n(e)}" role="group" aria-label="${n(t)}">
      ${r.map(e=>`
        <button class="segmented__option" type="button" data-value="${n(e.value)}"
          aria-pressed="${e.value===i}"${e.ariaLabel?` aria-label="${n(e.ariaLabel)}"`:``}>${n(e.label)}</button>
      `).join(``)}
    </div>`}function I(e,t){let n=n=>{let r=n.target.closest(`.segmented__option`);if(!(!r||r.getAttribute(`aria-pressed`)===`true`)){for(let t of e.querySelectorAll(`.segmented__option`))t.setAttribute(`aria-pressed`,String(t===r));t(r.dataset.value)}};return e.addEventListener(`click`,n),()=>e.removeEventListener(`click`,n)}function L(e,{premium:t=!1}={}){return F({id:`activity-range`,label:r(`dashboard.activityRangeLabel`),selected:e,options:S({premium:t}).map(e=>({value:e.id,label:r(`dashboard.ranges.${e.id}.short`),ariaLabel:r(`dashboard.ranges.${e.id}.long`)}))})}function R(t,n,a,{type:o=`line`}={}){let s=w(t,n);if(!s.hasEnoughData)return c({variant:`inline`,icon:`trending-up`,text:r(`dashboard.activityNotEnoughData`)});let l=e(),u=s.range.bucket===`week`,d=new Intl.DateTimeFormat(l,u?{day:`numeric`,month:`short`}:{month:`short`}),f=new Intl.DateTimeFormat(l,u?{day:`numeric`,month:`long`}:{month:`long`,year:`numeric`});return D({type:o,label:r(`dashboard.chartLabel`,{range:r(`dashboard.ranges.${s.range.id}.long`)}),periodLabel:r(`dashboard.chartPeriod`),labels:s.points.map(e=>d.format(e.start)),longLabels:s.points.map(e=>u?r(`dashboard.chartWeekOf`,{date:f.format(e.start)}):f.format(e.start)),series:[{id:`income`,label:r(`dashboard.statIncome`),tone:`pos`,values:s.points.map(e=>e.income)},{id:`expense`,label:r(`dashboard.statExpense`),tone:`neg`,values:s.points.map(e=>e.expense)}],formatValue:e=>i(e,a)})}var z=p(`<!-- @block: main -->\r
<section class="view-wallet view-section" aria-label="\${t('wallet.label', { name: escapeHtml(child.name) })}">\r
\r
  <div class="wallet-hero">\r
    <div class="wallet-hero__top">\r
      <div class="wallet-hero__identity">\r
        <div class="wallet-avatar" aria-hidden="true">\${icon(child.avatar, { size: 26 })}</div>\r
        <div class="wallet-name">\${escapeHtml(child.name)}</div>\r
      </div>\r
      <button class="wallet-edit-btn" id="btn-edit-child" type="button"\r
        aria-label="\${t('child.titleEdit', { name: escapeHtml(child.name) })}">\r
        \${icon('edit', { size: 16 })}<span>\${t('common.edit')}</span>\r
      </button>\r
    </div>\r
    <div class="wallet-balance" data-balance="\${child.balance}">\${formatCurrency(child.balance, currency)}</div>\r
    \${heroFacts.length > 0 ? \`\r
      <ul class="wallet-hero__facts" aria-label="\${t('wallet.factsLabel')}">\r
        \${heroFacts.map(f => \`<li>\${icon(f.icon, { size: 14 })}<span>\${escapeHtml(f.text)}</span></li>\`).join('')}\r
      </ul>\` : ''}\r
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
  <section class="card dashboard-card" aria-labelledby="allowance-card-title">\r
    \${sectionHeader({\r
      id: 'allowance-card-title', icon: 'clock', title: t('allowance.title'), help: 'allowances',\r
      action: allowances.length > 0\r
        ? { id: 'btn-manage-allowances', icon: 'settings', label: t('common.manage'), ariaLabel: t('allowance.manage') }\r
        : null,\r
    })}\r
    \${allowances.length > 0\r
      ? \`<ul class="allowance-list-compact">\r
          \${allowances.map(a => allowanceItem({ allowance: a, currency })).join('')}\r
        </ul>\r
        \${allowanceStatus ? \`<div class="dashboard-card__status">\${renderStatusHint(allowanceStatus)}</div>\` : ''}\`\r
      : renderEmptyState({\r
          variant: 'inline',\r
          icon: 'clock',\r
          text: t('allowance.emptyText'),\r
          actions: [{ id: 'btn-create-allowance', label: t('allowance.create'), icon: 'plus' }],\r
        })}\r
  </section>\r
\r
  <section class="card dashboard-card" aria-labelledby="goals-card-title">\r
    \${sectionHeader({\r
      id: 'goals-card-title', icon: 'target', title: t('goal.title'), help: 'goals',\r
      action: goals.length > 0\r
        ? { id: 'btn-manage-goals', icon: 'settings', label: t('common.manage'), ariaLabel: t('goal.manage') }\r
        : null,\r
    })}\r
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
    \${sectionHeader({ id: 'transactions-title', icon: 'list', title: t('transaction.recentTitle'), help: 'transactions' })}\r
    \${transactions.length > 0\r
      ? \`\${transactionList({ transactions: transactions.slice(0, 10), currency })}\r
        <a class="btn btn-ghost dashboard-card__more" id="link-all-transactions"\r
          href="#/wallet/\${child.id}/transactions">\r
          \${t('transaction.showAll')} \${icon('chevron-right', { size: 18 })}\r
        </a>\`\r
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
`);async function B(e,t){try{return await e()}catch(e){return console.error(e),t(),[]}}var V=class{constructor(e){this.childId=e,this.child=null,this._handlers=[],this._flashType=null,this._activityRange=`1m`,this._transactions=[]}async render(){let{children:e,settings:n}=a();if(this.child=e.find(e=>e.id===this.childId),!this.child)return l();t(this.child.colorPaletteIndex),document.getElementById(`toolbar-title`).textContent=this.child.name;let i=n.currency??`€`;this._loadFailed=!1;let o=()=>{this._loadFailed=!0},[s,c,d]=await Promise.all([B(()=>u.getTransactions(this.childId),o),B(()=>u.getGoals(this.childId),o),B(()=>u.getAllowances(this.childId),o)]),p=this.child.balance,m=c.filter(e=>!e.purchasedAt).sort((e,t)=>e.targetAmount-t.targetAmount),y=({allowance:e,currency:t})=>f(z.allowanceItem,{allowance:e,currency:t}),b=({goal:e,currency:t,balance:n})=>f(z.goalItem,{goal:e,currency:t,balance:n,status:v(e,n,t)}),x=({transactions:e,currency:t})=>C(e,t,r(`transaction.recentTitle`),{variant:`rows`}),S=d.filter(e=>e.isActive),w=d.length===0?null:S.length===0?{tone:`attention`,icon:`clock`,text:r(`allowance.paused`)}:(e=>e&&{tone:`info`,icon:`clock`,text:e.text})(h(S)),T=_({childId:this.childId,allowances:d,goals:c,balance:p}),E=g({goals:c,transactions:s});return this._transactions=s,this._currency=i,f(z.main,{child:this.child,transactions:s,goals:c,activeGoals:m,allowances:d,currency:i,balance:p,allowanceItem:y,goalItem:b,transactionList:x,allowanceStatus:w,statuses:T,heroFacts:E,activityRangeControl:L(this._activityRange),activityChart:s.length>0?R(s,this._activityRange,i):``})}mount(){let e=a().settings.currency??`€`;this._loadFailed&&s.error(r(`errors.loadFailed`),{action:{label:r(`common.retry`),onClick:()=>this._refresh()}});let t=document.querySelector(`.wallet-balance[data-balance]`);if(t){if(this._flashType){let e=this._flashType;this._flashType=null,t.classList.add(`wallet-balance--flash-${e}`),t.addEventListener(`animationend`,()=>t.classList.remove(`wallet-balance--flash-${e}`),{once:!0})}o(t,0,parseFloat(t.dataset.balance),e)}let n={"btn-earn":()=>this._book(`earn`),"btn-spend":()=>this._book(`spend`),"btn-empty-earn":()=>this._book(`earn`),"btn-empty-spend":()=>this._book(`spend`),"btn-edit-child":()=>this._editChild(),"btn-manage-allowances":()=>this._manageAllowances(),"btn-create-allowance":()=>this._createAllowance(),"btn-manage-goals":()=>{location.hash=`#/wallet/${this.childId}/goals`},"btn-create-goal":()=>this._createGoal()};for(let[e,t]of Object.entries(n)){let n=document.getElementById(e);n&&(n.addEventListener(`click`,t),this._handlers.push({el:n,type:`click`,fn:t}))}let i=document.getElementById(`activity-range`),c=document.getElementById(`activity-chart`);i&&c&&(this._unbindRange=I(i,e=>{this._activityRange=e,c.innerHTML=R(this._transactions,e,this._currency)}))}async _book(e){await x(this.childId,e)&&(this._flashType=e===`earn`?`pos`:`neg`,await this._refresh())}async _editChild(){await b(this.childId)&&await this._refresh()}_manageAllowances(){location.hash=`#/wallet/${this.childId}/allowances`}async _createAllowance(){await m(this.childId)&&await this._refresh()}async _createGoal(){await y(this.childId)&&await this._refresh()}async _refresh(){if(!document.querySelector(`.view-wallet`))return;let e={"#btn-create-goal":[`#btn-manage-goals`],"#btn-create-allowance":[`#btn-manage-allowances`],"#btn-empty-earn":[`#btn-earn`],"#btn-empty-spend":[`#btn-spend`]};await d(async()=>{let e=await this.render(),t=document.querySelector(`.view-wallet`);t&&(this.unmount(),t.outerHTML=e,this.mount())},t=>e[t]??[])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[],this._unbindRange?.(),this._unbindRange=null}};export{V as default};