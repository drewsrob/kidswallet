import{C as e,G as t,P as n,S as r,c as i,u as a}from"./security-CtCnMpu7.js";import{t as o}from"./api-D0XJvEL6.js";import{a as s}from"./Modal-DHEdphQb.js";import{n as c,t as l}from"./template-jTQYgMln.js";import{t as u}from"./AllowanceForm-C2FVr2T_.js";import{a as d,i as f,n as p,o as m,s as h,t as g}from"./status-tzF0Ti06.js";import{t as _}from"./GoalForm-BuuDFTr2.js";import{t as v}from"./ChildForm-tM6sI7KZ.js";import{n as y,t as b}from"./TransactionForm-CrrUEMB2.js";var x=l(`<!-- @block: main -->\r
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
    \${sectionHeader({ id: 'activity-card-title', icon: 'trending-up', title: t('dashboard.activityTitle'), help: 'activity' })}\r
    \${activity.total > 0\r
      ? \`<div class="activity-periods">\r
          \${activity.week.count > 0\r
            ? renderPeriodStats(activity.week, t('dashboard.activityWeek'), currency)\r
            : \`<div class="stat-group">\r
                <h3 class="stat-group__title">\${t('dashboard.activityWeek')}</h3>\r
                <p class="activity-note">\${t('dashboard.activityNoWeek')}</p>\r
              </div>\`}\r
          \${renderPeriodStats(activity.month, t('dashboard.activityMonth'), currency)}\r
        </div>\r
        \${activityTrend ? \`<div class="dashboard-card__status">\${renderStatusHint(activityTrend)}</div>\` : ''}\`\r
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
`);async function S(e,t){try{return await e()}catch(e){return console.error(e),t(),[]}}var C=class{constructor(e){this.childId=e,this.child=null,this._handlers=[],this._flashType=null}async render(){let{children:r,settings:i}=n();if(this.child=r.find(e=>e.id===this.childId),!this.child)return a();e(this.child.colorPaletteIndex),document.getElementById(`toolbar-title`).textContent=this.child.name;let s=i.currency??`€`;this._loadFailed=!1;let l=()=>{this._loadFailed=!0},[u,_,v]=await Promise.all([S(()=>o.getTransactions(this.childId),l),S(()=>o.getGoals(this.childId),l),S(()=>o.getAllowances(this.childId),l)]),b=this.child.balance,C=_.filter(e=>!e.purchasedAt).sort((e,t)=>e.targetAmount-t.targetAmount),w=({allowance:e,currency:t})=>c(x.allowanceItem,{allowance:e,currency:t}),T=({goal:e,currency:t,balance:n})=>c(x.goalItem,{goal:e,currency:t,balance:n,status:d(e,n,t)}),E=({transactions:e,currency:n})=>y(e,n,t(`transaction.recentTitle`),{variant:`rows`}),D=v.filter(e=>e.isActive),O=v.length===0?null:D.length===0?{tone:`attention`,icon:`clock`,text:t(`allowance.paused`)}:(e=>e&&{tone:`info`,icon:`clock`,text:e.text})(h(D)),k=f({childId:this.childId,allowances:v,goals:_,balance:b}),A=m({goals:_,transactions:u}),j=g(u),M=p(j);return c(x.main,{child:this.child,transactions:u,goals:_,activeGoals:C,allowances:v,currency:s,balance:b,allowanceItem:w,goalItem:T,transactionList:E,allowanceStatus:O,statuses:k,heroFacts:A,activity:j,activityTrend:M})}mount(){let e=n().settings.currency??`€`;this._loadFailed&&i.error(t(`errors.loadFailed`),{action:{label:t(`common.retry`),onClick:()=>this._refresh()}});let a=document.querySelector(`.wallet-balance[data-balance]`);if(a){if(this._flashType){let e=this._flashType;this._flashType=null,a.classList.add(`wallet-balance--flash-${e}`),a.addEventListener(`animationend`,()=>a.classList.remove(`wallet-balance--flash-${e}`),{once:!0})}r(a,0,parseFloat(a.dataset.balance),e)}let o={"btn-earn":()=>this._book(`earn`),"btn-spend":()=>this._book(`spend`),"btn-empty-earn":()=>this._book(`earn`),"btn-empty-spend":()=>this._book(`spend`),"btn-edit-child":()=>this._editChild(),"btn-manage-allowances":()=>this._manageAllowances(),"btn-create-allowance":()=>this._createAllowance(),"btn-manage-goals":()=>{location.hash=`#/wallet/${this.childId}/goals`},"btn-create-goal":()=>this._createGoal()};for(let[e,t]of Object.entries(o)){let n=document.getElementById(e);n&&(n.addEventListener(`click`,t),this._handlers.push({el:n,type:`click`,fn:t}))}}async _book(e){await b(this.childId,e)&&(this._flashType=e===`earn`?`pos`:`neg`,await this._refresh())}async _editChild(){await v(this.childId)&&await this._refresh()}_manageAllowances(){location.hash=`#/wallet/${this.childId}/allowances`}async _createAllowance(){await u(this.childId)&&await this._refresh()}async _createGoal(){await _(this.childId)&&await this._refresh()}async _refresh(){if(!document.querySelector(`.view-wallet`))return;let e={"#btn-create-goal":[`#btn-manage-goals`],"#btn-create-allowance":[`#btn-manage-allowances`],"#btn-empty-earn":[`#btn-earn`],"#btn-empty-spend":[`#btn-spend`]};await s(async()=>{let e=await this.render(),t=document.querySelector(`.view-wallet`);t&&(this.unmount(),t.outerHTML=e,this.mount())},t=>e[t]??[])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{C as default};