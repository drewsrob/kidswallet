import{B as e,C as t,G as n,P as r,c as i,u as a}from"./security-BjFG_6IR.js";import{t as o}from"./api-DitHL2SU.js";import{a as s}from"./Modal-BZqi9zWF.js";import{n as c,t as l}from"./template-eUISzhwL.js";import{a as u,i as d,o as f,r as p}from"./stats-D_O02OKc.js";var m=l(`<!-- @block: main -->\r
<section class="view-transactions view-section" aria-labelledby="transactions-page-title">\r
  \${sectionHeader({\r
    level: 1, id: 'transactions-page-title', title: t('transaction.allTitle'),\r
    subtitle: t('transaction.countFor', { count: transactions.length, name: child.name }),\r
  })}\r
\r
  \${transactions.length === 0\r
    ? renderEmptyState({\r
        icon: 'list',\r
        title: t('transaction.emptyTitle'),\r
        text: t('transaction.emptyText'),\r
        actions: [\r
          { id: 'btn-empty-earn', label: t('transaction.earnTitle'), icon: 'plus-circle', variant: 'secondary' },\r
          { id: 'btn-empty-spend', label: t('transaction.spendTitle'), icon: 'minus-circle', variant: 'secondary' },\r
        ],\r
      })\r
    : \`\r
      <section class="card transactions-total" aria-labelledby="transactions-total-title">\r
        \${sectionHeader({\r
          id: 'transactions-total-title', icon: 'coin', title: t('transaction.totalTitle'),\r
          subtitle: sinceLabel ? t('transaction.totalSince', { date: sinceLabel }) : '',\r
        })}\r
        \${renderPeriodStats(totals, null, currency)}\r
      </section>\r
      \${groups.map(g => \`\r
        <section class="transactions-page__group" aria-labelledby="month-\${g.key}">\r
          \${monthSummary(g)}\r
          \${transactionList(g.items, g.label)}\r
        </section>\r
      \`).join('')}\r
    \`}\r
</section>\r
\r
<!-- @block: monthSummary -->\r
<header class="month-summary">\r
  <h2 class="transactions-page__month" id="month-\${g.key}">\${escapeHtml(g.label)}</h2>\r
  <dl class="month-summary__stats">\r
    <div class="month-summary__stat month-summary__stat--\${g.income ? 'pos' : 'muted'}">\r
      <dt class="sr-only">\${t('dashboard.statIncome')}</dt>\r
      <dd>\${escapeHtml(formatSignedCurrency(g.income, currency))}</dd>\r
    </div>\r
    <div class="month-summary__stat month-summary__stat--\${g.expense ? 'neg' : 'muted'}">\r
      <dt class="sr-only">\${t('dashboard.statExpense')}</dt>\r
      <dd>\${escapeHtml(formatSignedCurrency(-g.expense, currency))}</dd>\r
    </div>\r
    <div class="month-summary__stat month-summary__stat--net">\r
      <dt>\${t('dashboard.statNet')}</dt>\r
      <dd>\${escapeHtml(formatSignedCurrency(g.net, currency))}</dd>\r
    </div>\r
  </dl>\r
</header>\r
`),h=class{constructor(e){this.childId=e,this._handlers=[]}async render(){let{children:n,settings:i}=r(),s=n.find(e=>e.id===this.childId);if(!s)return a();t(s.colorPaletteIndex);let l=i.currency??`€`,u=[];this._loadFailed=!1;try{u=await o.getTransactions(this.childId)}catch(e){console.error(e),this._loadFailed=!0}u=[...u].sort((e,t)=>new Date(t.date)-new Date(e.date));let h=new Intl.DateTimeFormat(e(),{month:`long`,year:`numeric`}),g=p(u),_=d(u).map(e=>({...e,label:h.format(e.date)}));return c(m.main,{child:s,transactions:u,totals:g,sinceLabel:g.since?h.format(g.since):``,groups:_,currency:l,monthSummary:e=>c(m.monthSummary,{g:e,currency:l}),transactionList:(e,t)=>f(e,l,t)})}mount(){this._loadFailed&&i.error(n(`errors.loadFailed`),{action:{label:n(`common.retry`),onClick:()=>this._refresh()}});let e={"btn-empty-earn":()=>this._book(`earn`),"btn-empty-spend":()=>this._book(`spend`)};for(let[t,n]of Object.entries(e)){let e=document.getElementById(t);e&&(e.addEventListener(`click`,n),this._handlers.push({el:e,type:`click`,fn:n}))}}async _book(e){await u(this.childId,e)&&await this._refresh()}async _refresh(){document.querySelector(`.view-transactions`)&&await s(async()=>{let e=await this.render(),t=document.querySelector(`.view-transactions`);t&&(this.unmount(),t.outerHTML=e,this.mount())},()=>[`#transactions-page-title`])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{h as default};