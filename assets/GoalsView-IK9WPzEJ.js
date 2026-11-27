import{C as e,E as t,F as n,G as r,L as i,O as a,P as o,S as s,c,u as l}from"./security-CtCnMpu7.js";import{t as u}from"./api-D0XJvEL6.js";import{a as d,r as f,t as p}from"./Modal-DHEdphQb.js";import{n as m,t as h}from"./template-jTQYgMln.js";import{a as g}from"./status-tzF0Ti06.js";import{t as _}from"./GoalForm-BuuDFTr2.js";var v=h(`<!-- @block: main -->\r
<section class="view-goals view-section" aria-label="\${t('goal.pageLabel', { name: escapeHtml(child.name) })}">\r
\r
  <div class="goals-balance-info">\r
    <span class="goals-balance-label">\${t('goal.availableBalance')}</span>\r
    <span class="goals-balance-amount" id="current-balance" data-balance="\${child.balance}">\r
      \${formatCurrency(child.balance, currency)}\r
    </span>\r
  </div>\r
\r
  \${sectionHeader({\r
    level: 1, title: t('goal.title'),\r
    action: { id: 'btn-new-goal', variant: 'primary', icon: 'plus', label: t('goal.create') },\r
  })}\r
\r
  \${activeGoals.length > 0\r
    ? \`<ul class="goals-list" aria-label="\${t('goal.activeLabel')}">\r
        \${activeGoals.map(g => goalCard({ goal: g, currency })).join('')}\r
      </ul>\`\r
    : renderEmptyState({\r
        icon: doneGoals.length > 0 ? 'trophy' : 'target',\r
        title: doneGoals.length > 0 ? t('goal.allDoneTitle') : t('goal.emptyTitle'),\r
        text: doneGoals.length > 0 ? t('goal.allDoneText') : t('goal.emptyText'),\r
        actions: [{ action: 'create', label: t('goal.create'), icon: 'plus' }],\r
      })}\r
\r
  \${doneGoals.length > 0 ? \`\r
    <section aria-labelledby="goals-done-title" class="mt-lg">\r
      \${sectionHeader({ id: 'goals-done-title', icon: 'trophy', title: t('goal.purchasedTitle') })}\r
      <ul class="goals-list goals-list--completed">\r
        \${doneGoals.map(g => goalCard({ goal: g, currency, completed: true })).join('')}\r
      </ul>\r
    </section>\r
  \` : ''}\r
\r
</section>\r
\r
<!-- @block: goalCard -->\r
<li class="goal-card\${isPurchased ? ' purchased' : (isReachable ? ' reachable' : '')}\${status?.state === 'almost' ? ' goal-card--almost' : ''}" data-goal-id="\${goal.id}">\r
  <div class="goal-header">\r
    <span class="goal-icon" aria-hidden="true">\${icon(goal.icon, { size: 28 })}</span>\r
    <div class="goal-info">\r
      <div class="goal-name">\${escapeHtml(goal.name)}</div>\r
      <div class="goal-amounts">\r
        \${isPurchased\r
          ? t('goal.paid', { amount: \`<strong>\${formatCurrency(goal.targetAmount, currency)}</strong>\` })\r
          : isReachable\r
            ? t('goal.canBuy', { amount: \`<strong class="goal-reachable">\${formatCurrency(goal.targetAmount, currency)}</strong>\` })\r
            : escapeHtml(status.text)\r
        }\r
      </div>\r
    </div>\r
    \${isPurchased ? \`\r
      <span class="goal-complete-badge goal-purchased-badge" aria-label="\${t('goal.purchasedBadge')}">\r
        🎉 \${t('goal.purchasedBadgeText')}\r
      </span>\r
    \` : isReachable ? renderStatusHint({ tone: 'success', icon: 'trophy', text: status.text }) : ''}\r
  </div>\r
\r
  \${!isPurchased ? \`\r
    <div>\r
      <div class="goal-progress-label">\r
        <span>\${t('goal.targetShort', { amount: formatCurrency(goal.targetAmount, currency) })}</span><span>\${pct}%</span>\r
      </div>\r
      <div class="progress-bar">\r
        <div class="progress-fill\${isReachable ? ' complete' : ''}" style="--target-width: \${pct}%;"\r
          role="progressbar" aria-valuenow="\${pct}" aria-valuemin="0" aria-valuemax="100"\r
          aria-label="\${t('goal.progressLabel', { name: escapeHtml(goal.name) })}"></div>\r
      </div>\r
    </div>\r
  \` : ''}\r
\r
  <footer class="goal-footer">\r
    \${!isPurchased && isReachable ? \`\r
      <button class="btn btn-primary btn-sm" data-action="purchase" data-goal-id="\${goal.id}" type="button">\r
        🛍️ \${t('goal.buyWithAmount', { amount: formatCurrency(goal.targetAmount, currency) })}\r
      </button>\r
    \` : ''}\r
    \${!isPurchased ? \`\r
      <button class="btn btn-ghost btn-sm" data-action="edit" data-goal-id="\${goal.id}" type="button"\r
        aria-label="\${t('goal.editLabel', { name: escapeHtml(goal.name) })}">\r
        \${icon('edit', { size: 16 })} \${t('common.edit')}\r
      </button>\r
    \` : ''}\r
    <button class="btn btn-ghost btn-sm" data-action="delete" data-goal-id="\${goal.id}" type="button"\r
      aria-label="\${t('goal.deleteLabel', { name: escapeHtml(goal.name) })}">\r
      \${icon('trash', { size: 16 })} \${t('common.delete')}\r
    </button>\r
  </footer>\r
</li>\r
`),y=class{constructor(e){this.childId=e,this.child=null,this.goals=[],this._handlers=[]}_makeGoalCard(e,t){return({goal:n,currency:r=e})=>{let i=!!n.purchasedAt,a=!i&&t>=n.targetAmount,o=i?null:g(n,t,r),s=o?o.pct:100;return m(v.goalCard,{goal:n,currency:r,pct:s,isPurchased:i,isReachable:a,walletBalance:t,status:o})}}async render(){let{children:t,settings:n}=o();if(this.child=t.find(e=>e.id===this.childId),!this.child)return l();e(this.child.colorPaletteIndex);let r=n.currency??`€`;try{this.goals=await u.getGoals(this.childId)}catch(e){console.error(e),this.goals=[],this._loadFailed=!0}let i=this.child.balance,a=this.goals.filter(e=>!e.purchasedAt).sort((e,t)=>i/t.targetAmount-i/e.targetAmount),s=this.goals.filter(e=>!!e.purchasedAt),c=this._makeGoalCard(r,i);return m(v.main,{child:this.child,activeGoals:a,doneGoals:s,currency:r,goalCard:c})}mount(){let{settings:e}=o(),t=e.currency??`€`,n=document.getElementById(`current-balance`);n&&n.dataset.balance&&s(n,0,parseFloat(n.dataset.balance),t),this._loadFailed&&(this._loadFailed=!1,this._showLoadError());let r=document.querySelector(`.view-goals`);if(!r)return;let i=document.getElementById(`btn-new-goal`);if(i){let e=()=>this._createGoal();i.addEventListener(`click`,e),this._handlers.push({el:i,type:`click`,fn:e})}let a=e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,goalId:r}=t.dataset;n===`create`&&this._createGoal(),n===`edit`&&this._editGoal(r),n===`purchase`&&this._purchaseGoal(r),n===`delete`&&this._deleteGoal(r)};r.addEventListener(`click`,a),this._handlers.push({el:r,type:`click`,fn:a})}async _createGoal(){await _(this.childId)&&await this._refresh()}async _editGoal(e){let t=this.goals.find(t=>t.id===e);t&&await _(this.childId,t)&&await this._refresh()}async _purchaseGoal(e){let n=this.goals.find(t=>t.id===e);if(!n)return;let{settings:i}=o(),s=i.currency??`€`;await new p({title:r(`goal.purchaseTitle`,{name:t(n.name)}),content:`<p>${r(`goal.purchaseDeducted`,{amount:a(n.targetAmount,s)})}</p>
               <p>${r(`goal.purchaseBalanceAfter`,{amount:`<strong>${a(this.child.balance-n.targetAmount,s)}</strong>`})}</p>`,actions:[{label:r(`common.cancel`),value:`cancel`,variant:`secondary`},{label:r(`goal.buy`),value:`confirm`,variant:`primary`}]}).open()===`confirm`&&await this._doPurchase(n)}async _doPurchase(e){try{let i=await u.updateGoal(e.id,{purchaseGoal:!0}),{children:a}=o();n({children:a.map(e=>e.id===this.childId?{...e,balance:i.newBalance}:e)}),this.child={...this.child,balance:i.newBalance},c.success(r(`goal.purchased`,{name:t(e.name)})),await this._refresh()}catch(t){console.error(t),c.error(i(t,r(`goal.purchaseFailed`)),{action:{label:r(`common.retry`),onClick:()=>this._doPurchase(e)}})}}async _deleteGoal(e){let n=this.goals.find(t=>t.id===e);n&&await f(r(`goal.deleteTitle`),r(`goal.deleteMessage`,{name:t(n.name)}))&&await this._doDelete(n)}async _doDelete(e){try{await u.deleteGoal(e.id),c.success(r(`goal.deleted`)),await this._refresh()}catch(t){console.error(t),c.error(i(t,r(`goal.deleteFailed`)),{action:{label:r(`common.retry`),onClick:()=>this._doDelete(e)}})}}async _refresh(){try{this.goals=await u.getGoals(this.childId)}catch(e){console.error(e),this._showLoadError();return}let{settings:e,children:t}=o();this.child=t.find(e=>e.id===this.childId)||this.child;let n=e.currency??`€`,r=this.child.balance,i=this.goals.filter(e=>!e.purchasedAt).sort((e,t)=>r/t.targetAmount-r/e.targetAmount),a=this.goals.filter(e=>!!e.purchasedAt),s=this._makeGoalCard(n,r),c=document.querySelector(`.view-goals`);c&&await d(()=>{this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[],c.outerHTML=m(v.main,{child:this.child,activeGoals:i,doneGoals:a,currency:n,goalCard:s}),this.mount()},()=>[`#btn-new-goal`])}_showLoadError(){c.error(r(`errors.loadFailed`),{action:{label:r(`common.retry`),onClick:()=>this._refresh()}})}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{y as default};