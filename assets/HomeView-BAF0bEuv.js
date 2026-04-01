import{a as e,c as t,f as n,g as r,h as i,m as a,r as o}from"./index-CAzKeS1O.js";import{n as s,t as c}from"./template-CRf3gOUw.js";var l=c(`<!-- @block: main -->\r
<section class="view-home view-section" aria-label="Startseite">\r
\r
  \${children.length > 0\r
    ? \`<section aria-label="Kinder">\r
        <div class="children-grid" id="children-grid">\r
          \${children.map((child, i) => childCard({ child, currency, childIndex: i })).join('')}\r
        </div>\r
      </section>\`\r
    : \`<div class="empty-state">\r
        <span class="empty-icon">\${icon('users', { size: 48 })}</span>\r
        <h2>Noch keine Kinder</h2>\r
        <p>Öffne das Menü und gehe in den Admin-Bereich, um Kinder hinzuzufügen.</p>\r
      </div>\`}\r
\r
</section>\r
\r
<!-- @block: childCard -->\r
<article\r
  class="child-card"\r
  data-child-id="\${child.id}"\r
  role="button"\r
  tabindex="0"\r
  aria-label="\${escapeHtml(child.name)}, Kontostand: \${formatCurrency(child.balance, currency)}"\r
  style="--card-index: \${childIndex}; --card-primary: \${colors.primary}; --card-light: \${colors.light}">\r
  <div class="child-card__avatar" aria-hidden="true">\r
    \${icon(child.avatar, { size: 36 })}\r
  </div>\r
  <div class="child-card__name">\${escapeHtml(child.name)}</div>\r
  <div class="child-card__balance" data-balance="\${child.balance}">\r
    \${formatCurrency(child.balance, currency)}\r
  </div>\r
  \${goalFooter}\r
</article>\r
`),u=class{constructor(){this._handlers=[]}async render(){try{let e=await r.getState();i({children:e.children,settings:e.settings})}catch{}let{children:e,settings:c}=a(),u=c.currency??`€`;return s(l.main,{children:e,currency:u,childCard:({child:e,currency:r,childIndex:i=0})=>{let a=n(e.colorPaletteIndex),c=e.goals??[],u=c.length,d=``;if(u>0){let n=c.map(t=>({...t,pct:t.targetAmount>0?Math.min(100,Math.round(e.balance/t.targetAmount*100)):0})).sort((e,t)=>t.pct-e.pct)[0],r=u===1?`1 Ziel`:`${u} Ziele`;d=`
          <footer class="child-card__goals">
            <div class="child-card__goals-meta">
              <span class="child-card__goals-count">${o(`target`,{size:13})} ${r}</span>
              <span class="child-card__goals-sep" aria-hidden="true">·</span>
              <span class="child-card__goals-name">${t(n.name)}</span>
              <span class="child-card__goals-pct">${n.pct}%</span>
            </div>
            <div class="progress-bar child-card__goals-bar" role="progressbar"
              aria-valuenow="${n.pct}" aria-valuemin="0" aria-valuemax="100"
              aria-label="${t(n.name)}: ${n.pct}%">
              <div class="progress-fill${n.pct>=100?` complete`:``}" style="--target-width: ${n.pct}%;"></div>
            </div>
          </footer>`}return s(l.childCard,{child:e,currency:r,colors:a,goalFooter:d,childIndex:i})}})}mount(){let{settings:t}=a(),n=t.currency??`€`;document.querySelectorAll(`.child-card__balance[data-balance]`).forEach(t=>{e(t,0,parseFloat(t.dataset.balance),n)});let r=document.getElementById(`children-grid`);if(r){let e=e=>{let t=e.target.closest(`[data-child-id]`);t&&(location.hash=`#/wallet/${t.dataset.childId}`)};r.addEventListener(`click`,e),this._handlers.push({el:r,type:`click`,fn:e});let t=e=>{if(e.key!==`Enter`&&e.key!==` `)return;let t=e.target.closest(`[data-child-id]`);t&&(e.preventDefault(),location.hash=`#/wallet/${t.dataset.childId}`)};r.addEventListener(`keydown`,t),this._handlers.push({el:r,type:`keydown`,fn:t})}}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{u as default};