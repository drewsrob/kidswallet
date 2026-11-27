import{C as e,D as t,F as n,I as r,N as i,m as a}from"./errors-B_GFX16_.js";import{o}from"./finance-BduCd0kS.js";import{t as s}from"./api-0d9YJt6W.js";import{n as c,t as l}from"./template-CY161wSk.js";import{t as u}from"./status--rfWzDs2.js";import{t as d}from"./ChildForm-BTQezad2.js";var f=l(`<!-- @block: main -->\r
<section class="view-home view-section" aria-label="\${t('home.label')}">\r
\r
  \${children.length > 0\r
    ? \`<section aria-label="\${t('home.childrenLabel')}">\r
        <div class="children-grid" id="children-grid">\r
          \${children.map((child, i) => childCard({ child, currency, childIndex: i })).join('')}\r
          <button class="child-card child-card--add" id="btn-home-add-child" type="button"\r
            style="--card-index: \${children.length}" aria-label="\${t('child.create')}">\r
            <span class="child-card__avatar" aria-hidden="true">\${icon('plus', { size: 36 })}</span>\r
            <span class="child-card__name">\${t('child.create')}</span>\r
          </button>\r
        </div>\r
      </section>\`\r
    : renderEmptyState({\r
        icon: 'users',\r
        title: t('child.emptyTitle'),\r
        text: t('child.emptyText'),\r
        actions: [{ id: 'btn-home-add-child', label: t('child.create'), icon: 'plus' }],\r
      })}\r
\r
</section>\r
\r
<!-- @block: childCard -->\r
<article\r
  class="child-card"\r
  data-child-id="\${child.id}"\r
  role="button"\r
  tabindex="0"\r
  aria-label="\${goalSummary
    ? t('home.cardLabelWithGoal', { name: escapeHtml(child.name), balance: formatCurrency(child.balance, currency), goal: escapeHtml(goalSummary) })
    : t('home.cardLabel', { name: escapeHtml(child.name), balance: formatCurrency(child.balance, currency) })}\${finance.advanceActive ? \`, \${t('finance.openDebt')}: \${formatCurrency(finance.totalDebt, currency)}\` : ''}"\r
  style="--card-index: \${childIndex}; --card-primary: \${colors.primary}; --card-light: \${colors.light}; --card-start-l: \${colors.hero.startL}; --card-end-l: \${colors.hero.endL}; --card-start-d: \${colors.hero.startD}; --card-end-d: \${colors.hero.endD}; --card-ink-l: \${colors.hero.inkL}">\r
  <div class="child-card__avatar" aria-hidden="true">\r
    \${icon(child.avatar, { size: 36 })}\r
  </div>\r
  <div class="child-card__name">\${escapeHtml(child.name)}</div>\r
  <div class="child-card__balance" data-balance="\${child.balance}">\r
    \${formatCurrency(child.balance, currency)}\r
  </div>\r
  \${finance.advanceActive ? \`<div class="child-card__debt">\${t('finance.openDebt')}: \${formatCurrency(finance.totalDebt, currency)}</div>\` : ''}\r
  \${goalFooter}\r
</article>\r
`),p=class{constructor(){this._handlers=[]}async render(){try{let e=await s.getState();r({children:e.children,settings:e.settings})}catch{}let{children:e,settings:l}=n(),d=l.currency??`€`;return c(f.main,{children:e,currency:d,childCard:({child:e,currency:n,childIndex:r=0})=>{let s=i(e.colorPaletteIndex),l=u(e.goals,e.balance,n),d=``;if(l){let{status:e}=l,n=e.state===`reached`;d=`
          <div class="child-card__goals${n?` child-card__goals--reached`:``}" aria-hidden="true">
            <div class="child-card__goals-count">${a(`target`,{size:14})}<span>${l.countText}</span></div>
            <div class="child-card__goals-row">
              <span class="child-card__goals-name">${t(l.goal.name)}</span>
              <span class="child-card__goals-pct">${n?a(`check-circle`,{size:14}):``}${l.progressText}</span>
            </div>
            <div class="progress-bar child-card__goals-bar">
              <div class="progress-fill" style="--target-width: ${e.pct}%;"></div>
            </div>
          </div>`}let p=l?l.summary:``;return c(f.childCard,{child:e,currency:n,colors:s,goalFooter:d,goalSummary:p,childIndex:r,finance:o(e)})}})}mount(){let{settings:t}=n(),r=t.currency??`€`;document.querySelectorAll(`.child-card__balance[data-balance]`).forEach(t=>{e(t,0,parseFloat(t.dataset.balance),r)});let i=document.getElementById(`btn-home-add-child`);if(i){let e=()=>this._addChild();i.addEventListener(`click`,e),this._handlers.push({el:i,type:`click`,fn:e})}let a=document.getElementById(`children-grid`);if(a){let e=e=>{let t=e.target.closest(`[data-child-id]`);t&&(location.hash=`#/wallet/${t.dataset.childId}`)};a.addEventListener(`click`,e),this._handlers.push({el:a,type:`click`,fn:e});let t=e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`[data-child-id]`);t&&(e.preventDefault(),location.hash=`#/wallet/${t.dataset.childId}`)};a.addEventListener(`keydown`,t),this._handlers.push({el:a,type:`keydown`,fn:t})}}async _addChild(){if(!await d())return;let e=document.getElementById(`app`),t=await this.render();this.unmount(),e.innerHTML=t,this.mount()}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{p as default};