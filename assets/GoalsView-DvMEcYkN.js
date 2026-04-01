import{a as e,c as t,g as n,h as r,m as i,o as a,r as o,s,u as c}from"./index-CAzKeS1O.js";import{n as l,t as u}from"./template-CRf3gOUw.js";import{t as d}from"./Modal-Bo7RHeCF.js";import{t as f}from"./Toast-BYCYXKyv.js";var p=u(`<!-- @block: main -->\r
<section class="view-goals view-section" aria-label="Sparziele von \${escapeHtml(child.name)}">\r
\r
  <div class="goals-balance-info">\r
    <span class="goals-balance-label">Verfügbares Guthaben</span>\r
    <span class="goals-balance-amount" id="current-balance" data-balance="\${child.balance}">\r
      \${formatCurrency(child.balance, currency)}\r
    </span>\r
  </div>\r
\r
  <div class="view-header">\r
    <h1>Sparziele</h1>\r
    <button class="btn btn-primary" id="btn-new-goal" type="button">+ Neues Ziel</button>\r
  </div>\r
\r
  \${activeGoals.length > 0\r
    ? \`<ul class="goals-list" aria-label="Aktive Ziele">\r
        \${activeGoals.map(g => goalCard({ goal: g, currency })).join('')}\r
      </ul>\`\r
    : \`<div class="empty-state">\r
        <span class="empty-icon">\${icon('target', { size: 48 })}</span>\r
        <p>Noch keine Sparziele – leg jetzt eins an!</p>\r
      </div>\`}\r
\r
  \${doneGoals.length > 0 ? \`\r
    <section aria-label="Gekaufte Ziele">\r
      <h2 class="mt-lg">\r
        \${icon('trophy', { size: 20, className: 'inline-icon' })} Gekaufte Ziele\r
      </h2>\r
      <ul class="goals-list goals-list--completed" aria-label="Erreichte Ziele">\r
        \${doneGoals.map(g => goalCard({ goal: g, currency, completed: true })).join('')}\r
      </ul>\r
    </section>\r
  \` : ''}\r
\r
</section>\r
\r
<!-- @block: goalCard -->\r
<li class="goal-card\${isPurchased ? ' purchased' : (isReachable ? ' reachable' : '')}" data-goal-id="\${goal.id}">\r
  <div class="goal-header">\r
    <span class="goal-icon" aria-hidden="true">\${icon(goal.icon, { size: 28 })}</span>\r
    <div class="goal-info">\r
      <div class="goal-name">\${escapeHtml(goal.name)}</div>\r
      <div class="goal-amounts">\r
        \${isPurchased\r
          ? \`<strong>\${formatCurrency(goal.targetAmount, currency)}</strong> bezahlt\`\r
          : isReachable\r
            ? \`<strong class="goal-reachable">\${formatCurrency(goal.targetAmount, currency)}</strong> – du kannst es kaufen! 🎉\`\r
            : \`noch <strong>\${formatCurrency(goal.targetAmount - walletBalance, currency)}</strong> fehlen\`\r
        }\r
      </div>\r
    </div>\r
    \${isPurchased ? \`\r
      <span class="goal-complete-badge goal-purchased-badge" aria-label="Gekauft">\r
        🎉 Gekauft!\r
      </span>\r
    \` : ''}\r
  </div>\r
\r
  \${!isPurchased ? \`\r
    <div>\r
      <div class="goal-progress-label">\r
        <span>Ziel: \${formatCurrency(goal.targetAmount, currency)}</span><span>\${pct}%</span>\r
      </div>\r
      <div class="progress-bar">\r
        <div class="progress-fill\${isReachable ? ' complete' : ''}" style="--target-width: \${pct}%;"\r
          role="progressbar" aria-valuenow="\${pct}" aria-valuemin="0" aria-valuemax="100"></div>\r
      </div>\r
    </div>\r
  \` : ''}\r
\r
  <footer class="goal-footer">\r
    \${!isPurchased && isReachable ? \`\r
      <button class="btn btn-primary btn-sm" data-action="purchase" data-goal-id="\${goal.id}" type="button">\r
        🛍️ Kaufen (\${formatCurrency(goal.targetAmount, currency)})\r
      </button>\r
    \` : ''}\r
    <button class="btn btn-ghost btn-sm" data-action="delete" data-goal-id="\${goal.id}" type="button">\r
      \${icon('trash', { size: 16 })} Löschen\r
    </button>\r
  </footer>\r
</li>\r
\r
<!-- @block: goalCreateModal -->\r
<div class="form-group">\r
  <label class="form-label" for="goal-name-input">Name des Ziels</label>\r
  <input class="form-input" id="goal-name-input" type="text"\r
    placeholder="z.B. Neues Fahrrad" maxlength="60" autocomplete="off" required>\r
</div>\r
<div class="form-group">\r
  <label class="form-label" for="goal-target-input">Zielbetrag (\${currency})</label>\r
  <input class="form-input" id="goal-target-input" type="number"\r
    min="0.01" max="99999" step="0.01" placeholder="z.B. 50.00" required>\r
</div>\r
<div class="form-group">\r
  <p class="form-label">Symbol wählen</p>\r
  <div class="goal-icon-picker" id="goal-icon-picker">\r
    \${GOAL_ICON_KEYS.map(key => \`\r
      <button type="button" class="goal-icon-option" data-icon="\${key}">\r
        \${icon(key, { size: 24 })}\r
      </button>\r
    \`).join('')}\r
  </div>\r
</div>\r
`),m=class{constructor(e){this.childId=e,this.child=null,this.goals=[],this._handlers=[]}_makeGoalCard(e,t){return({goal:n,currency:r=e})=>{let i=s(Math.min(t,n.targetAmount),n.targetAmount),a=!!n.purchasedAt,o=!a&&t>=n.targetAmount;return l(p.goalCard,{goal:n,currency:r,pct:i,isPurchased:a,isReachable:o,walletBalance:t})}}async render(){let{children:e,settings:t}=i();if(this.child=e.find(e=>e.id===this.childId),!this.child)return`
        <div class="empty-state">
          <span class="empty-icon">${o(`alert-circle`,{size:48})}</span>
          <h2>Kind nicht gefunden</h2>
          <button class="btn btn-primary mt-lg" onclick="location.hash='#/'">Zurück</button>
        </div>
      `;a(this.child.colorPaletteIndex);let r=t.currency??`€`;try{this.goals=await n.getGoals(this.childId)}catch{this.goals=[],f.error(`Sparziele konnten nicht geladen werden.`)}let s=this.child.balance,c=this.goals.filter(e=>!e.purchasedAt).sort((e,t)=>s/t.targetAmount-s/e.targetAmount),u=this.goals.filter(e=>!!e.purchasedAt),d=this._makeGoalCard(r,s);return l(p.main,{child:this.child,activeGoals:c,doneGoals:u,currency:r,goalCard:d})}mount(){let{settings:t}=i(),n=t.currency??`€`,r=document.getElementById(`current-balance`);r&&r.dataset.balance&&e(r,0,parseFloat(r.dataset.balance),n);let a=document.querySelector(`.view-goals`);if(!a)return;let o=document.getElementById(`btn-new-goal`);if(o){let e=()=>this._createGoal();o.addEventListener(`click`,e),this._handlers.push({el:o,type:`click`,fn:e})}let s=e=>{let t=e.target.closest(`[data-action]`);if(!t)return;let{action:n,goalId:r}=t.dataset;n===`purchase`&&this._purchaseGoal(r),n===`delete`&&this._deleteGoal(r)};a.addEventListener(`click`,s),this._handlers.push({el:a,type:`click`,fn:s})}async _createGoal(){let{settings:e}=i(),t=e.currency??`€`,r=`bike`,a=new d({title:`Neues Sparziel`,content:l(p.goalCreateModal,{currency:t,child:this.child}),actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:`Erstellen`,value:`create`,variant:`primary`}],validate:e=>{if(e!==`create`)return!0;let t=document.getElementById(`goal-name-input`)?.value?.trim(),n=parseFloat(document.getElementById(`goal-target-input`)?.value);return t?isNaN(n)||n<=0?(f.error(`Bitte einen Zielbetrag eingeben.`),!1):!0:(f.error(`Bitte einen Namen eingeben.`),!1)}});if(await new Promise(e=>{let t=a.open();requestAnimationFrame(()=>{let e=document.getElementById(`goal-icon-picker`);e&&(e.querySelector(`[data-icon="${r}"]`)?.classList.add(`selected`),e.addEventListener(`click`,t=>{let n=t.target.closest(`[data-icon]`);n&&(r=n.dataset.icon,e.querySelectorAll(`.goal-icon-option`).forEach(e=>{e.classList.toggle(`selected`,e.dataset.icon===r)}))}))}),t.then(e)})!==`create`)return;let o=document.getElementById(`goal-name-input`)?.value?.trim(),s=parseFloat(document.getElementById(`goal-target-input`)?.value);try{await n.createGoal(this.childId,{name:o,targetAmount:s,icon:r}),f.success(`Sparziel erstellt!`),await this._refresh()}catch(e){f.error(e.message)}}async _purchaseGoal(e){let a=this.goals.find(t=>t.id===e);if(!a)return;let{settings:o}=i(),s=o.currency??`€`;if(await new d({title:`${t(a.name)} kaufen?`,content:`<p>${c(a.targetAmount,s)} werden von deinem Guthaben abgezogen.</p>
               <p>Guthaben danach: <strong>${c(this.child.balance-a.targetAmount,s)}</strong></p>`,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:`🛍️ Kaufen!`,value:`confirm`,variant:`primary`}]}).open()===`confirm`)try{let o=await n.updateGoal(e,{purchaseGoal:!0}),{children:s}=i();r({children:s.map(e=>e.id===this.childId?{...e,balance:o.newBalance}:e)}),this.child={...this.child,balance:o.newBalance},f.success(`Glückwunsch! 🎉 ${t(a.name)} ist jetzt deins!`),await this._refresh()}catch(e){f.error(e.message)}}async _deleteGoal(e){let r=this.goals.find(t=>t.id===e);if(r&&await new d({title:`Sparziel löschen?`,content:`<p>${`Das Sparziel "${t(r.name)}" wirklich löschen?`}</p>`,actions:[{label:`Abbrechen`,value:`cancel`,variant:`secondary`},{label:`Löschen`,value:`confirm`,variant:`danger`}]}).open()===`confirm`)try{await n.deleteGoal(e),f.success(`Sparziel gelöscht.`),await this._refresh()}catch(e){f.error(e.message)}}async _refresh(){try{this.goals=await n.getGoals(this.childId)}catch{return}let{settings:e,children:t}=i();this.child=t.find(e=>e.id===this.childId)||this.child;let r=e.currency??`€`,a=this.child.balance,o=this.goals.filter(e=>!e.purchasedAt).sort((e,t)=>a/t.targetAmount-a/e.targetAmount),s=this.goals.filter(e=>!!e.purchasedAt),c=this._makeGoalCard(r,a),u=document.querySelector(`.view-goals`);u&&(this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[],u.outerHTML=l(p.main,{child:this.child,activeGoals:o,doneGoals:s,currency:r,goalCard:c}),this.mount())}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{m as default};