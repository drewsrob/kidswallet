import{B as e,C as t,G as n,P as r,c as i,u as a}from"./security-CtCnMpu7.js";import{t as o}from"./api-D0XJvEL6.js";import{a as s}from"./Modal-DHEdphQb.js";import{n as c,t as l}from"./template-jTQYgMln.js";import{n as u,t as d}from"./TransactionForm-CrrUEMB2.js";var f=l(`<!-- @block: main -->\r
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
    : groups.map(g => \`\r
      <section class="transactions-page__group" aria-label="\${escapeHtml(g.label)}">\r
        <h2 class="transactions-page__month">\${escapeHtml(g.label)}</h2>\r
        \${transactionList(g.items, g.label)}\r
      </section>\r
    \`).join('')}\r
</section>\r
`);function p(t){let n=new Intl.DateTimeFormat(e(),{month:`long`,year:`numeric`}),r=[];for(let e of t){let t=n.format(new Date(e.date)),i=r[r.length-1];i&&i.label===t?i.items.push(e):r.push({label:t,items:[e]})}return r}var m=class{constructor(e){this.childId=e,this._handlers=[]}async render(){let{children:e,settings:n}=r(),i=e.find(e=>e.id===this.childId);if(!i)return a();t(i.colorPaletteIndex);let s=n.currency??`€`,l=[];this._loadFailed=!1;try{l=await o.getTransactions(this.childId)}catch(e){console.error(e),this._loadFailed=!0}return l=[...l].sort((e,t)=>new Date(t.date)-new Date(e.date)),c(f.main,{child:i,transactions:l,groups:p(l),transactionList:(e,t)=>u(e,s,t)})}mount(){this._loadFailed&&i.error(n(`errors.loadFailed`),{action:{label:n(`common.retry`),onClick:()=>this._refresh()}});let e={"btn-empty-earn":()=>this._book(`earn`),"btn-empty-spend":()=>this._book(`spend`)};for(let[t,n]of Object.entries(e)){let e=document.getElementById(t);e&&(e.addEventListener(`click`,n),this._handlers.push({el:e,type:`click`,fn:n}))}}async _book(e){await d(this.childId,e)&&await this._refresh()}async _refresh(){document.querySelector(`.view-transactions`)&&await s(async()=>{let e=await this.render(),t=document.querySelector(`.view-transactions`);t&&(this.unmount(),t.outerHTML=e,this.mount())},()=>[`#transactions-page-title`])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{m as default};