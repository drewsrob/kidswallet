import{F as e,G as t,O as n,d as r,k as i,l as a,t as o,w as s}from"./errors-B_GFX16_.js";import{t as c}from"./api-0d9YJt6W.js";import{a as l,r as u}from"./Modal-BR3LSJ3m.js";import{o as d}from"./index-MuNmPWIB.js";import{n as f,t as p}from"./template-CY161wSk.js";import{t as m}from"./AllowanceForm-uwqQv-F4.js";import{a as h}from"./status--rfWzDs2.js";var g=p(`<!-- @block: main -->\r
<section class="view-section" aria-label="\${t('allowance.listTitle')}">\r
  \${sectionHeader({\r
    level: 1, icon: child.avatar, title: child.name, subtitle: t('allowance.listTitle'),\r
    action: { id: 'btn-add-allowance', variant: 'primary', icon: 'plus', label: t('allowance.create') },\r
  })}\r
\r
  \${allowances.length > 0\r
    ? \`<ul class="allowance-list" id="allowance-list" aria-label="\${t('allowance.listTitle')}">\r
        \${allowances.map(a => allowanceItem({ allowance: a, currency })).join('')}\r
      </ul>\`\r
    : renderEmptyState({\r
        icon: 'clock',\r
        title: t('allowance.emptyTitle'),\r
        text: t('allowance.emptyText'),\r
        actions: [{ id: 'btn-empty-add-allowance', label: t('allowance.create'), icon: 'plus' }],\r
      })}\r
\r
  <aside class="allowance-info-note">\r
    <p class="allowance-info-note__text">\r
      \${icon('info', { size: 16 })}\r
      \${t('allowance.autoPayoutNote')}\r
    </p>\r
  </aside>\r
</section>\r
\r
<!-- @block: allowanceItem -->\r
<li class="allowance-item" data-allowance-id="\${allowance.id}">\r
  <div class="allowance-info">\r
    <div class="allowance-amount">\${formatCurrency(allowance.amount, currency)}</div>\r
    <div class="allowance-schedule">\${formatAllowanceSchedule(allowance)}</div>\r
    \${allowance.lastExecuted\r
      ? \`<div class="text-xs text-muted">\${t('allowance.lastExecuted', { date: allowance.lastExecuted })}</div>\`\r
      : ''}\r
    \${status ? \`<div class="allowance-status">\${renderStatusHint(status)}</div>\` : ''}\r
  </div>\r
  <label class="allowance-switch">\r
    <span class="allowance-switch__text" aria-hidden="true">\${allowance.isActive ? t('allowance.activeBadge') : t('allowance.pausedBadge')}</span>\r
    <span class="toggle">\r
      <input type="checkbox"\r
        \${allowance.isActive ? 'checked' : ''}\r
        role="switch" aria-label="\${t('allowance.activeToggle')}"\r
        data-action="toggle"\r
        data-allowance-id="\${allowance.id}">\r
      <span class="toggle-slider"></span>\r
    </span>\r
  </label>\r
  <footer class="card-footer">\r
    <button class="btn btn-ghost card-footer__action"\r
      data-action="edit" data-allowance-id="\${allowance.id}"\r
      aria-label="\${t('allowance.titleEdit')}"\r
      type="button">\r
      \${icon('edit', { size: 18 })}<span>\${t('common.edit')}</span>\r
    </button>\r
    <button class="btn btn-ghost card-footer__action card-footer__action--danger"\r
      data-action="delete" data-allowance-id="\${allowance.id}"\r
      aria-label="\${t('allowance.deleteLabel')}"\r
      type="button">\r
      \${icon('trash', { size: 18 })}<span>\${t('common.delete')}</span>\r
    </button>\r
  </footer>\r
</li>\r
`);function _(e){if(!e.isActive)return{tone:`attention`,icon:`clock`,text:t(`allowance.paused`)};let n=h([e]);return n&&{tone:`info`,icon:`clock`,text:n.text}}var v=class{constructor(e){this.childId=e,this.child=null,this.allowances=[],this._handlers=[]}async render(){let{children:n,settings:i}=e();if(this.child=n.find(e=>e.id===this.childId),!this.child)return r();s(this.child.colorPaletteIndex),document.getElementById(`toolbar-title`).textContent=t(`allowance.toolbarTitle`,{name:this.child.name});try{this.allowances=await c.getAllowances(this.childId)}catch(e){console.error(e),this.allowances=[],this._loadFailed=!0}let a=i.currency??`€`;return f(g.main,{child:this.child,allowances:this.allowances,currency:a,allowanceItem:({allowance:e,currency:t})=>f(g.allowanceItem,{allowance:e,currency:t,status:_(e)})})}mount(){this._loadFailed&&(this._loadFailed=!1,a.error(t(`errors.loadFailed`),{action:{label:t(`common.retry`),onClick:()=>this._refreshAllowances()}}));for(let e of[`btn-add-allowance`,`btn-empty-add-allowance`]){let t=document.getElementById(e);if(!t)continue;let n=()=>this._showAllowanceForm();t.addEventListener(`click`,n),this._handlers.push({el:t,type:`click`,fn:n})}let e=document.getElementById(`allowance-list`);if(e){let t=e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,allowanceId:r}=t.dataset;n===`edit`&&this._showAllowanceForm(r),n===`delete`&&this._deleteAllowance(r)},n=e=>{let t=e.target.closest(`input[data-action="toggle"]`);t&&this._toggleAllowance(t.dataset.allowanceId,t.checked)};e.addEventListener(`click`,t),e.addEventListener(`change`,n),this._handlers.push({el:e,type:`click`,fn:t}),this._handlers.push({el:e,type:`change`,fn:n})}}async _showAllowanceForm(e=null){let t=e?this.allowances.find(t=>t.id===e):null;await m(this.childId,t)&&await this._refreshAllowances()}async _toggleAllowance(e,n){let r=this.allowances.find(t=>t.id===e);if(r){if(!await d(t(n?`pin.reasons.ruleActivate`:`pin.reasons.rulePause`))){await this._refreshAllowances();return}try{await c.updateAllowance(e,{amount:r.amount,frequency:r.frequency,dayOfWeek:r.dayOfWeek,dayOfMonth:r.dayOfMonth,isActive:n}),r.isActive=n,a.success(t(n?`allowance.activated`:`allowance.pausedToast`))}catch(r){console.error(r),a.error(o(r,t(`allowance.toggleFailed`)),{action:{label:t(`common.retry`),onClick:()=>this._toggleAllowance(e,n)}})}await this._refreshAllowances()}}async _deleteAllowance(r){let a=this.allowances.find(e=>e.id===r);a&&await u(t(`allowance.deleteTitle`),t(`allowance.deleteMessage`,{amount:i(a.amount,e().settings.currency??`€`),schedule:n(a)}))&&await d(t(`pin.reasons.ruleDelete`))&&await this._doDelete(r)}async _doDelete(e){try{await c.deleteAllowance(e),a.success(t(`allowance.deleted`)),await this._refreshAllowances()}catch(n){console.error(n),a.error(o(n,t(`allowance.deleteFailed`)),{action:{label:t(`common.retry`),onClick:()=>this._doDelete(e)}})}}async _refreshAllowances(){await l(async()=>{let e=await this.render();this.unmount(),document.getElementById(`app`).innerHTML=e,this.mount()},()=>[`#btn-add-allowance`])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{v as default};