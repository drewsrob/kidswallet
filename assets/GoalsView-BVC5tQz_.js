import{C as e,D as t,F as n,G as r,I as i,d as a,k as o,l as s,m as c,t as l,w as u}from"./errors-B_GFX16_.js";import{o as d,u as f}from"./finance-BduCd0kS.js";import{t as p}from"./api-0d9YJt6W.js";import{a as m,r as h,t as g}from"./Modal-BR3LSJ3m.js";import{a as _,c as v,n as y,o as b,t as x}from"./template-CY161wSk.js";import{r as S}from"./status--rfWzDs2.js";import{t as C}from"./GoalForm-CrNCMGFA.js";var w=x(`<!-- @block: main -->\r
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
          ? t('goal.paid', { amount: \`<strong>\${          formatCurrency(goal.purchasePrice ?? goal.targetAmount, currency)}</strong>\` })\r
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
  <footer class="card-footer">\r
    \${!isPurchased && isReachable ? \`\r
      <button class="btn btn-ghost card-footer__action goal-footer__buy" data-action="purchase" data-goal-id="\${goal.id}" type="button">\r
        \${icon('shopping-bag', { size: 18 })}<span>\${t('goal.buyWithAmount', { amount: formatCurrency(goal.targetAmount, currency) })}</span>\r
      </button>\r
    \` : ''}\r
    \${!isPurchased ? \`\r
      <button class="btn btn-ghost card-footer__action" data-action="edit" data-goal-id="\${goal.id}" type="button"\r
        aria-label="\${t(isReachable ? 'goal.adjustLabel' : 'goal.editLabel', { name: escapeHtml(goal.name) })}">\r
        \${icon('edit', { size: 18 })}<span>\${isReachable ? t('goal.adjust') : t('common.edit')}</span>\r
      </button>\r
    \` : ''}\r
    <button class="btn btn-ghost card-footer__action card-footer__action--danger" data-action="delete" data-goal-id="\${goal.id}" type="button"\r
      aria-label="\${t('goal.deleteLabel', { name: escapeHtml(goal.name) })}">\r
      \${icon('trash', { size: 18 })}<span>\${t('common.delete')}</span>\r
    </button>\r
  </footer>\r
</li>\r
`),T=99999,E=class{constructor(e){this.childId=e,this.child=null,this.goals=[],this._handlers=[]}_makeGoalCard(e,t){return({goal:n,currency:r=e})=>{let i=!!n.purchasedAt,a=!i&&t>=n.targetAmount,o=i?null:S(n,t,r),s=o?o.pct:100;return y(w.goalCard,{goal:n,currency:r,pct:s,isPurchased:i,isReachable:a,walletBalance:t,status:o})}}async render(){let{children:e,settings:t}=n();if(this.child=e.find(e=>e.id===this.childId),!this.child)return a();u(this.child.colorPaletteIndex);let r=t.currency??`€`;try{this.goals=await p.getGoals(this.childId)}catch(e){console.error(e),this.goals=[],this._loadFailed=!0}let i=this.child.balance,o=this.goals.filter(e=>!e.purchasedAt).sort((e,t)=>i/t.targetAmount-i/e.targetAmount),s=this.goals.filter(e=>!!e.purchasedAt),c=this._makeGoalCard(r,i);return y(w.main,{child:this.child,activeGoals:o,doneGoals:s,currency:r,goalCard:c})}mount(){let{settings:t}=n(),r=t.currency??`€`,i=document.getElementById(`current-balance`);i&&i.dataset.balance&&e(i,0,parseFloat(i.dataset.balance),r),this._loadFailed&&(this._loadFailed=!1,this._showLoadError());let a=document.querySelector(`.view-goals`);if(!a)return;let o=document.getElementById(`btn-new-goal`);if(o){let e=()=>this._createGoal();o.addEventListener(`click`,e),this._handlers.push({el:o,type:`click`,fn:e})}let s=e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,goalId:r}=t.dataset;n===`create`&&this._createGoal(),n===`edit`&&this._editGoal(r),n===`purchase`&&this._purchaseGoal(r),n===`delete`&&this._deleteGoal(r)};a.addEventListener(`click`,s),this._handlers.push({el:a,type:`click`,fn:s})}async _createGoal(){await C(this.childId)&&await this._refresh()}async _editGoal(e,t){let n=this.goals.find(t=>t.id===e);if(!n)return;let r=!n.purchasedAt&&this.child.balance>=n.targetAmount;await C(this.childId,n,{adjust:r,...t})&&await this._refresh()}async _purchaseGoal(e){let a=this.goals.find(t=>t.id===e);if(!a)return;let{settings:u}=n(),m=u.currency??`€`,h=d(this.child),y=f(h.availableBalance),x=y+f(h.remainingAdvance),S=h.advanceActive?0:h.fixedFee,C=e=>v(e.querySelector(`#goal-purchase-price`)?.value),w=new g({title:r(`goal.purchaseTitle`,{name:t(a.name)}),icon:`shopping-bag`,tone:`goal`,help:`goals`,sheet:!0,content:`
        <dl class="goal-purchase-planned">
          <dt>${r(`goal.plannedPrice`)}</dt>
          <dd>${o(a.targetAmount,m)}</dd>
        </dl>
        <div class="form-group form-group--primary">
          <label class="form-label" for="goal-purchase-price">${r(`goal.actualPrice`,{currency:t(m)})}</label>
          <div class="input-affix">
            <input class="form-input form-input--amount" id="goal-purchase-price" type="text" inputmode="decimal"
              enterkeyhint="done" aria-required="true" autocomplete="off" aria-describedby="goal-purchase-hint"
              value="${b(a.targetAmount)}">
            <span class="input-affix__unit" aria-hidden="true">${t(m)}</span>
          </div>
          <p class="form-hint" id="goal-purchase-hint" aria-live="polite"></p>
        </div>
        <div class="goal-purchase-shortfall" id="goal-purchase-shortfall" role="alert" hidden>
          <p>${r(`goal.notEnoughFunds`)}</p>
          <button type="button" class="btn btn-secondary btn-sm" data-value="adjust">
            ${c(`edit`,{size:16})} ${r(`goal.adjustGoal`)}
          </button>
        </div>`,actions:[{label:r(`common.cancel`),value:`cancel`,variant:`secondary`},{label:r(`goal.buy`),value:`buy`,variant:`primary`}],fields:{"goal-purchase-price":_({max:T,currency:m})},validate:(e,t)=>e!==`buy`||f(C(t.root).value)<=x,submit:(e,t)=>e===`buy`?p.updateGoal(a.id,{purchaseGoal:!0,purchasePrice:C(t.root).value}):void 0,errorMessage:e=>l(e,r(`goal.purchaseFailed`))}),E=w.open(),D=document.getElementById(`goal-purchase-price`).closest(`.modal`),O=D.querySelector(`#goal-purchase-hint`),k=D.querySelector(`#goal-purchase-shortfall`),A=D.querySelector(`.modal-actions [data-value="buy"]`),j=()=>{let{value:e,error:t,empty:n}=C(D),i=!n&&!t&&e>0&&e<=T,a=i?f(e):0,s=a<=x;if(k.hidden=!i||s,A.disabled=i&&!s,!i||!s){O.textContent=``;return}let c=Math.max(0,a-y)/100;O.innerHTML=c>0?r(S>0?`goal.purchaseAdvanceFee`:`goal.purchaseAdvance`,{amount:`<strong>${o(c,m)}</strong>`,fee:o(S,m)}):r(`goal.purchaseBalanceAfter`,{amount:`<strong>${o((y-a)/100,m)}</strong>`})};D.addEventListener(`input`,j),j();let M=await E;if(M===`adjust`){await this._editGoal(a.id,{targetAmount:C(D).value});return}if(M!==`buy`)return;let{child:N}=w.result;i({children:n().children.map(e=>e.id===this.childId?{...e,...N}:e)}),this.child={...this.child,...N},s.success(r(`goal.purchased`,{name:t(a.name)})),await this._refresh()}async _deleteGoal(e){let n=this.goals.find(t=>t.id===e);n&&await h(r(`goal.deleteTitle`),r(`goal.deleteMessage`,{name:t(n.name)}))&&await this._doDelete(n)}async _doDelete(e){try{await p.deleteGoal(e.id),s.success(r(`goal.deleted`)),await this._refresh()}catch(t){console.error(t),s.error(l(t,r(`goal.deleteFailed`)),{action:{label:r(`common.retry`),onClick:()=>this._doDelete(e)}})}}async _refresh(){try{this.goals=await p.getGoals(this.childId)}catch(e){console.error(e),this._showLoadError();return}let{settings:e,children:t}=n();this.child=t.find(e=>e.id===this.childId)||this.child;let r=e.currency??`€`,i=this.child.balance,a=this.goals.filter(e=>!e.purchasedAt).sort((e,t)=>i/t.targetAmount-i/e.targetAmount),o=this.goals.filter(e=>!!e.purchasedAt),s=this._makeGoalCard(r,i),c=document.querySelector(`.view-goals`);c&&await m(()=>{this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[],c.outerHTML=y(w.main,{child:this.child,activeGoals:a,doneGoals:o,currency:r,goalCard:s}),this.mount()},()=>[`#btn-new-goal`])}_showLoadError(){s.error(r(`errors.loadFailed`),{action:{label:r(`common.retry`),onClick:()=>this._refresh()}})}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{E as default};