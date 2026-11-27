import{D as e,F as t,G as n,I as r,N as i,l as a,n as o,t as s}from"./errors-B_GFX16_.js";import{t as c}from"./api-0d9YJt6W.js";import{a as l,t as u}from"./Modal-BR3LSJ3m.js";import{n as d,t as f}from"./template-CY161wSk.js";import{t as p}from"./ChildForm-BTQezad2.js";/* empty css              */var m=f(`<!-- @block: childrenList -->\r
<section class="view-section" aria-label="\${t('navigation.children')}">\r
  \${sectionHeader({\r
    level: 1, title: t('navigation.children'),\r
    action: { id: 'btn-admin-add-child', variant: 'primary', icon: 'plus', label: t('child.create') },\r
  })}\r
  <p class="text-muted text-sm mb-md">\r
    \${t('management.childrenIntro')}\r
  </p>\r
\r
  \${children.length > 0\r
    ? \`<ul class="admin-children-list" id="children-list" aria-label="\${t('navigation.children')}">\r
        \${children.map(child => childItem({ child, currency })).join('')}\r
      </ul>\`\r
    : renderEmptyState({\r
        icon: 'users',\r
        title: t('child.emptyTitle'),\r
        text: t('child.emptyText'),\r
        actions: [{ id: 'btn-admin-empty-add-child', label: t('child.create'), icon: 'plus' }],\r
      })}\r
</section>\r
\r
<!-- @block: childItem -->\r
<li class="admin-child-item" style="--child-color: \${colors.primary}; --child-ink: \${colors.ink}">\r
  <span class="admin-child-avatar"\r
    aria-hidden="true">\${icon(child.avatar, { size: 28 })}</span>\r
  <div class="admin-child-info">\r
    <div class="admin-child-name">\${escapeHtml(child.name)}</div>\r
    <div class="admin-child-balance">\${t('management.childBalance', { amount: formatCurrency(child.balance, currency) })}</div>\r
  </div>\r
  <div class="admin-child-actions">\r
    <button class="btn btn-ghost btn-sm"\r
      data-action="delete" data-child-id="\${child.id}" type="button"\r
      aria-label="\${t('management.deleteChildLabel', { name: escapeHtml(child.name) })}">\r
      \${icon('trash', { size: 18 })} \${t('common.delete')}\r
    </button>\r
  </div>\r
</li>\r
`),h=class{constructor(){this._handlers=[]}_guardAuth(){return o()?!0:(location.hash=`#/admin`,!1)}async render(){if(!this._guardAuth())return`<div></div>`;let e=[];try{e=await c.getChildren(),r({children:e})}catch(e){console.error(e),a.error(n(`errors.loadFailed`),{action:{label:n(`common.retry`),onClick:()=>this._refresh()}})}let o=t().settings.currency??`€`;return d(m.childrenList,{children:e,currency:o,childItem:({child:e,currency:t})=>{let n=i(e.colorPaletteIndex);return d(m.childItem,{child:e,currency:t,colors:n})}})}mount(){[`btn-admin-add-child`,`btn-admin-empty-add-child`].forEach(e=>{let t=document.getElementById(e);if(!t)return;let n=()=>this._addChild();t.addEventListener(`click`,n),this._handlers.push({el:t,type:`click`,fn:n})});let e=document.getElementById(`children-list`);if(e){let t=e=>{let t=e.target.closest(`[data-action="delete"]`);t&&this._deleteChild(t.dataset.childId)};e.addEventListener(`click`,t),this._handlers.push({el:e,type:`click`,fn:t})}}async _addChild(){await p()&&await this._refresh()}async _deleteChild(r){let i=t().children.find(e=>e.id===r);i&&await new u({title:n(`child.deleteTitle`),content:`
        <p>${n(`child.deleteMessage`,{name:e(i.name)})}</p>
        <p class="text-danger text-sm">
          ${n(`child.deleteWarning`)}
        </p>
      `,actions:[{label:n(`common.cancel`),value:`cancel`,variant:`secondary`},{label:n(`common.delete`),value:`confirm`,variant:`danger`}]}).open()===`confirm`&&await this._doDelete(i)}async _doDelete(t){try{await c.deleteChild(t.id),a.success(n(`child.deleted`,{name:e(t.name)})),await this._refresh()}catch(e){console.error(e),a.error(s(e,n(`child.deleteFailed`)),{action:{label:n(`common.retry`),onClick:()=>this._doDelete(t)}})}}async _refresh(){await l(async()=>{let e=await this.render();this.unmount(),document.getElementById(`app`).innerHTML=e,this.mount()},()=>[`#children-list [data-action="delete"]`,`main h1`])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{h as default};