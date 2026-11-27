import{C as e,D as t,G as n,L as r,O as i,P as a,c as o,u as s}from"./security-CtCnMpu7.js";import{t as c}from"./api-D0XJvEL6.js";import{a as l,r as u}from"./Modal-DHEdphQb.js";import{o as d}from"./index-C__9U8Hp.js";import{n as f,t as p}from"./template-jTQYgMln.js";import{t as m}from"./AllowanceForm-C2FVr2T_.js";import{s as h}from"./status-tzF0Ti06.js";var g=p(`<!-- @block: main -->\r
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
  <div class="allowance-actions">\r
    <label class="toggle">\r
      <input type="checkbox"\r
        \${allowance.isActive ? 'checked' : ''}\r
        role="switch" aria-label="\${t('allowance.activeToggle')}"\r
        data-action="toggle"\r
        data-allowance-id="\${allowance.id}">\r
      <span class="toggle-slider"></span>\r
    </label>\r
    <button class="btn btn-ghost btn-sm"\r
      data-action="edit" data-allowance-id="\${allowance.id}"\r
      aria-label="\${t('allowance.titleEdit')}"\r
      type="button">\r
      \${icon('edit', { size: 18 })} \${t('common.edit')}\r
    </button>\r
    <button class="btn btn-ghost btn-sm"\r
      data-action="delete" data-allowance-id="\${allowance.id}"\r
      aria-label="\${t('allowance.deleteLabel')}"\r
      type="button">\r
      \${icon('trash', { size: 18 })} \${t('common.delete')}\r
    </button>\r
  </div>\r
</li>\r
`);function _(e){if(!e.isActive)return{tone:`attention`,icon:`clock`,text:n(`allowance.paused`)};let t=h([e]);return t&&{tone:`info`,icon:`clock`,text:t.text}}var v=class{constructor(e){this.childId=e,this.child=null,this.allowances=[],this._handlers=[]}async render(){let{children:t,settings:r}=a();if(this.child=t.find(e=>e.id===this.childId),!this.child)return s();e(this.child.colorPaletteIndex),document.getElementById(`toolbar-title`).textContent=n(`allowance.toolbarTitle`,{name:this.child.name});try{this.allowances=await c.getAllowances(this.childId)}catch(e){console.error(e),this.allowances=[],this._loadFailed=!0}let i=r.currency??`€`;return f(g.main,{child:this.child,allowances:this.allowances,currency:i,allowanceItem:({allowance:e,currency:t})=>f(g.allowanceItem,{allowance:e,currency:t,status:_(e)})})}mount(){this._loadFailed&&(this._loadFailed=!1,o.error(n(`errors.loadFailed`),{action:{label:n(`common.retry`),onClick:()=>this._refreshAllowances()}}));for(let e of[`btn-add-allowance`,`btn-empty-add-allowance`]){let t=document.getElementById(e);if(!t)continue;let n=()=>this._showAllowanceForm();t.addEventListener(`click`,n),this._handlers.push({el:t,type:`click`,fn:n})}let e=document.getElementById(`allowance-list`);if(e){let t=e=>{let t=e.target.closest(`button[data-action]`);if(!t)return;let{action:n,allowanceId:r}=t.dataset;n===`edit`&&this._showAllowanceForm(r),n===`delete`&&this._deleteAllowance(r)},n=e=>{let t=e.target.closest(`input[data-action="toggle"]`);t&&this._toggleAllowance(t.dataset.allowanceId,t.checked)};e.addEventListener(`click`,t),e.addEventListener(`change`,n),this._handlers.push({el:e,type:`click`,fn:t}),this._handlers.push({el:e,type:`change`,fn:n})}}async _showAllowanceForm(e=null){let t=e?this.allowances.find(t=>t.id===e):null;await m(this.childId,t)&&await this._refreshAllowances()}async _toggleAllowance(e,t){let i=this.allowances.find(t=>t.id===e);if(i){if(!await d(n(t?`pin.reasons.ruleActivate`:`pin.reasons.rulePause`))){await this._refreshAllowances();return}try{await c.updateAllowance(e,{amount:i.amount,frequency:i.frequency,dayOfWeek:i.dayOfWeek,dayOfMonth:i.dayOfMonth,isActive:t}),i.isActive=t,o.success(n(t?`allowance.activated`:`allowance.pausedToast`))}catch(i){console.error(i),o.error(r(i,n(`allowance.toggleFailed`)),{action:{label:n(`common.retry`),onClick:()=>this._toggleAllowance(e,t)}})}await this._refreshAllowances()}}async _deleteAllowance(e){let r=this.allowances.find(t=>t.id===e);r&&await u(n(`allowance.deleteTitle`),n(`allowance.deleteMessage`,{amount:i(r.amount,a().settings.currency??`€`),schedule:t(r)}))&&await d(n(`pin.reasons.ruleDelete`))&&await this._doDelete(e)}async _doDelete(e){try{await c.deleteAllowance(e),o.success(n(`allowance.deleted`)),await this._refreshAllowances()}catch(t){console.error(t),o.error(r(t,n(`allowance.deleteFailed`)),{action:{label:n(`common.retry`),onClick:()=>this._doDelete(e)}})}}async _refreshAllowances(){await l(async()=>{let e=await this.render();this.unmount(),document.getElementById(`app`).innerHTML=e,this.mount()},()=>[`#btn-add-allowance`])}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{v as default};