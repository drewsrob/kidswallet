import{E as e,F as t,M as n,P as r,S as i,p as a}from"./security-CtCnMpu7.js";import{t as o}from"./api-D0XJvEL6.js";import{n as s,t as c}from"./template-jTQYgMln.js";import{r as l}from"./status-tzF0Ti06.js";import{t as u}from"./ChildForm-tM6sI7KZ.js";var d=c(`<!-- @block: main -->\r
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
    : t('home.cardLabel', { name: escapeHtml(child.name), balance: formatCurrency(child.balance, currency) })}"\r
  style="--card-index: \${childIndex}; --card-primary: \${colors.primary}; --card-light: \${colors.light}; --card-start-l: \${colors.hero.startL}; --card-end-l: \${colors.hero.endL}; --card-start-d: \${colors.hero.startD}; --card-end-d: \${colors.hero.endD}; --card-ink-l: \${colors.hero.inkL}">\r
  <div class="child-card__avatar" aria-hidden="true">\r
    \${icon(child.avatar, { size: 36 })}\r
  </div>\r
  <div class="child-card__name">\${escapeHtml(child.name)}</div>\r
  <div class="child-card__balance" data-balance="\${child.balance}">\r
    \${formatCurrency(child.balance, currency)}\r
  </div>\r
  \${goalFooter}\r
</article>\r
`),f=class{constructor(){this._handlers=[]}async render(){try{let e=await o.getState();t({children:e.children,settings:e.settings})}catch{}let{children:i,settings:c}=r(),u=c.currency??`€`;return s(d.main,{children:i,currency:u,childCard:({child:t,currency:r,childIndex:i=0})=>{let o=n(t.colorPaletteIndex),c=l(t.goals,t.balance,r),u=``;if(c){let{status:t}=c,n=t.state===`reached`;u=`
          <div class="child-card__goals${n?` child-card__goals--reached`:``}" aria-hidden="true">
            <div class="child-card__goals-count">${a(`target`,{size:14})}<span>${c.countText}</span></div>
            <div class="child-card__goals-row">
              <span class="child-card__goals-name">${e(c.goal.name)}</span>
              <span class="child-card__goals-pct">${n?a(`check-circle`,{size:14}):``}${c.progressText}</span>
            </div>
            <div class="progress-bar child-card__goals-bar">
              <div class="progress-fill" style="--target-width: ${t.pct}%;"></div>
            </div>
          </div>`}let f=c?c.summary:``;return s(d.childCard,{child:t,currency:r,colors:o,goalFooter:u,goalSummary:f,childIndex:i})}})}mount(){let{settings:e}=r(),t=e.currency??`€`;document.querySelectorAll(`.child-card__balance[data-balance]`).forEach(e=>{i(e,0,parseFloat(e.dataset.balance),t)});let n=document.getElementById(`btn-home-add-child`);if(n){let e=()=>this._addChild();n.addEventListener(`click`,e),this._handlers.push({el:n,type:`click`,fn:e})}let a=document.getElementById(`children-grid`);if(a){let e=e=>{let t=e.target.closest(`[data-child-id]`);t&&(location.hash=`#/wallet/${t.dataset.childId}`)};a.addEventListener(`click`,e),this._handlers.push({el:a,type:`click`,fn:e});let t=e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`[data-child-id]`);t&&(e.preventDefault(),location.hash=`#/wallet/${t.dataset.childId}`)};a.addEventListener(`keydown`,t),this._handlers.push({el:a,type:`keydown`,fn:t})}}async _addChild(){if(!await u())return;let e=document.getElementById(`app`),t=await this.render();this.unmount(),e.innerHTML=t,this.mount()}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{f as default};