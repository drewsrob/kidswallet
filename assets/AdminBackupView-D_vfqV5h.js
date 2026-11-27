const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/esm-gJJrSN7Z.js","assets/index-C__9U8Hp.js","assets/security-CtCnMpu7.js","assets/security-BjglXnga.css","assets/api-D0XJvEL6.js","assets/Modal-DHEdphQb.js","assets/index-DpDov5yy.css","assets/definitions-R0B7eI3W.js","assets/esm-FIHuxNCM.js"])))=>i.map(i=>d[i]);
import{E as e,G as t,L as n,U as r,c as i,k as a,l as o,t as s}from"./security-CtCnMpu7.js";import{t as c}from"./Modal-DHEdphQb.js";import{n as l,t as u}from"./index-C__9U8Hp.js";import{n as d,t as f}from"./template-jTQYgMln.js";/* empty css              */var p=`KidsWallet`,m=[1],h=[`children`,`allowances`,`transactions`,`goals`],g=class extends Error{constructor(e,t){super(t??e),this.name=`BackupError`,this.code=e}},_={data:`kidswallet-data`,theme:`kidswallet-theme`,accent:`kidswallet-accent`,language:`kidswallet-language`,meta:`kidswallet-backup-meta`},v={read(){let e={};try{e=JSON.parse(localStorage.getItem(_.data)??`{}`)??{}}catch{e={}}let t={...e};for(let n of h)t[n]=Array.isArray(e[n])?e[n]:[];return t.settings=O(e.settings)?e.settings:{},t.preferences={theme:localStorage.getItem(_.theme),accent:localStorage.getItem(_.accent),language:localStorage.getItem(_.language)},t},write(e){let{preferences:t,...n}=e,r=[_.data,_.theme,_.accent,_.language].map(e=>[e,localStorage.getItem(e)]);try{localStorage.setItem(_.data,JSON.stringify(n)),y(_.theme,t?.theme),y(_.accent,t?.accent),t&&`language`in t&&y(_.language,t.language)}catch(e){throw r.forEach(([e,t])=>y(e,t)),e}},readMeta(){try{return JSON.parse(localStorage.getItem(_.meta)??`null`)}catch{return null}},writeMeta(e){localStorage.setItem(_.meta,JSON.stringify(e))}};function y(e,t){t==null?localStorage.removeItem(e):localStorage.setItem(e,t)}function b({adapter:e=v,now:t=new Date}={}){return{version:1,createdAt:t.toISOString(),app:p,data:e.read()}}function x(e){return JSON.stringify(e,null,2)}function S(e=new Date){let t=e=>String(e).padStart(2,`0`);return`kidswallet-backup-${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}.json`}function C(e,{adapter:t=v}={}){let n={...t.readMeta()??{},lastBackupAt:e.createdAt,version:e.version};return t.writeMeta(n),n}function w({adapter:e=v}={}){return e.readMeta()}function T(e){let t;try{t=JSON.parse(String(e).replace(/^\uFEFF/,``))}catch{throw new g(/"app"\s*:\s*"KidsWallet"/.test(String(e))?`corrupt`:`invalid`)}return E(t)}function E(e){if(!O(e)||e.app!==`KidsWallet`)throw new g(`invalid`);if(!Number.isInteger(e.version)||!m.includes(e.version))throw new g(`unsupportedVersion`);if(typeof e.createdAt!=`string`||Number.isNaN(Date.parse(e.createdAt)))throw new g(`corrupt`,`createdAt`);let{data:t}=e;if(!O(t))throw new g(`corrupt`,`data`);for(let e of h)if(!Array.isArray(t[e]))throw new g(`corrupt`,e);let n=(e,t,n)=>{let r=new Set;for(let i of e){if(!O(i)||!j(i.id)||r.has(i.id))throw new g(`corrupt`,t);r.add(i.id);for(let[e,r]of Object.entries(n))if(!r(i[e]))throw new g(`corrupt`,`${t}.${e}`)}};n(t.children,`children`,{name:k,balance:A}),n(t.allowances,`allowances`,{childId:j,amount:A}),n(t.transactions,`transactions`,{childId:j,amount:A}),n(t.goals,`goals`,{childId:j,name:k,targetAmount:A});let{settings:r,preferences:i}=t;if(!O(r)||!k(r.currency)||!(r.adminPinHash==null||typeof r.adminPinHash==`string`&&/^[0-9a-f]{64}$/.test(r.adminPinHash))||!(r.pinConfigured===void 0||typeof r.pinConfigured==`boolean`))throw new g(`corrupt`,`settings`);if(!O(i)||!(i.theme==null||[`system`,`light`,`dark`].includes(i.theme))||!(i.accent==null||/^#[0-9a-f]{6}$/i.test(i.accent))||!(i.language==null||/^[a-z]{2,3}$/.test(i.language)))throw new g(`corrupt`,`preferences`);return e}function D(e,{adapter:t=v}={}){E(e),t.write(e.data)}function O(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function k(e){return typeof e==`string`&&e.trim()!==``}function A(e){return typeof e==`number`&&Number.isFinite(e)}function j(e){return k(e)||Number.isInteger(e)}var M=class extends Error{constructor(){super(`cancelled`),this.name=`FileTransferCancelled`}};async function N(e,t,{mimeType:n=`application/json`,title:r}={}){if(l.isNativePlatform()){let[{Filesystem:n,Directory:i,Encoding:a},{Share:o}]=await Promise.all([u(()=>import(`./esm-gJJrSN7Z.js`),__vite__mapDeps([0,1,2,3,4,5,6,7])),u(()=>import(`./esm-FIHuxNCM.js`),__vite__mapDeps([8,1,2,3,4,5,6]))]),{uri:s}=await n.writeFile({path:e,data:t,directory:i.Cache,encoding:a.UTF8});try{await o.share({title:r??e,files:[s],dialogTitle:r??e})}catch(e){throw/cancel/i.test(e?.message??``)?new M:e}return}let i=URL.createObjectURL(new Blob([t],{type:n})),a=Object.assign(document.createElement(`a`),{href:i,download:e,hidden:!0});document.body.appendChild(a),a.click(),a.remove(),setTimeout(()=>URL.revokeObjectURL(i),1e3)}function P({accept:e=`application/json,.json`}={}){return new Promise((t,n)=>{let r=Object.assign(document.createElement(`input`),{type:`file`,accept:e,hidden:!0}),i=!1,a=(e,t)=>{i||(i=!0,r.remove(),e(t))};r.addEventListener(`change`,async()=>{let e=r.files?.[0];if(!e)return a(t,null);try{a(t,{name:e.name,text:await e.text()})}catch(e){a(n,e)}}),r.addEventListener(`cancel`,()=>a(t,null)),window.addEventListener(`focus`,()=>{setTimeout(()=>{r.files?.length||a(t,null)},1e3)},{once:!0}),document.body.appendChild(r),r.click()})}var F=f(`<!-- @block: main -->\r
<section class="view-section view-backup" aria-labelledby="backup-title">\r
  \${sectionHeader({ level: 1, id: 'backup-title', title: t('backup.title'), subtitle: t('backup.intro') })}\r
\r
  <div class="settings-list">\r
\r
    <div class="settings-item" id="backup-status">\r
      \${status}\r
    </div>\r
\r
    <div class="settings-item">\r
      \${sectionHeader({ icon: 'download', title: t('backup.exportTitle') })}\r
      <p class="backup-text">\${t('backup.exportText')}</p>\r
      <button class="btn btn-primary" type="button" id="btn-backup-export">\r
        \${icon('download', { size: 18 })} \${t('backup.create')}\r
      </button>\r
    </div>\r
\r
    <div class="settings-item">\r
      \${sectionHeader({ icon: 'upload', title: t('backup.importTitle') })}\r
      <p class="backup-text">\${t('backup.importText')}</p>\r
      <button class="btn btn-secondary" type="button" id="btn-backup-import">\r
        \${icon('upload', { size: 18 })} \${t('backup.restore')}\r
      </button>\r
    </div>\r
\r
  </div>\r
</section>\r
\r
<!-- @block: status -->\r
\${sectionHeader({ icon: 'clock', title: t('backup.statusTitle') })}\r
<dl class="backup-status">\r
  <div class="backup-status-row">\r
    <dt>\${t('backup.lastBackup')}</dt>\r
    <dd>\${lastBackup}</dd>\r
  </div>\r
  <div class="backup-status-row">\r
    <dt>\${t('backup.version')}</dt>\r
    <dd>\${version}</dd>\r
  </div>\r
</dl>\r
`),I=class{constructor(){this._handlers=[],this._busy=!1}_guardAuth(){return s()?!0:(location.hash=`#/admin`,!1)}_renderStatus(){let e=w();return d(F.status,{lastBackup:e?.lastBackupAt?a(e.lastBackupAt):t(`backup.never`),version:e?.version??1})}async render(){return this._guardAuth()?d(F.main,{status:this._renderStatus()}):`<div></div>`}mount(){this._on(`btn-backup-export`,()=>this._export()),this._on(`btn-backup-import`,()=>this._import())}_on(e,t){let n=document.getElementById(e);if(!n)return;let r=async()=>{if(!this._busy){this._busy=!0,n.disabled=!0;try{await t()}finally{this._busy=!1,n.disabled=!1}}};n.addEventListener(`click`,r),this._handlers.push({el:n,type:`click`,fn:r})}async _export(){try{let e=b();await N(S(new Date(e.createdAt)),x(e),{title:t(`backup.shareTitle`)}),C(e);let n=document.getElementById(`backup-status`);n&&(n.innerHTML=this._renderStatus()),i.success(t(`backup.exported`))}catch(e){if(e instanceof M)return;console.error(e),i.error(n(e,t(`backup.exportFailed`)),{action:{label:t(`common.retry`),onClick:()=>document.getElementById(`btn-backup-export`)?.click()}})}}async _import(){let s;try{s=await P({accept:`.json,application/json,text/plain,application/octet-stream`})}catch(e){console.error(e),i.error(t(`backup.readFailed`));return}if(!s)return;let l;try{l=T(s.text)}catch(e){console.warn(`Backup abgelehnt:`,e),i.error(t(`backup.errors.${e instanceof g?e.code:`invalid`}`));return}let{children:u,transactions:d}=l.data;if(await new c({title:t(`backup.confirmTitle`),icon:`alert-triangle`,describeContent:!0,content:`
        <p><strong>${t(`backup.confirmWarning`)}</strong></p>
        <p class="text-sm text-muted">${e(t(`backup.confirmSummary`,{date:a(l.createdAt),children:t(`backup.childrenCount`,{count:u.length}),transactions:t(`backup.transactionsCount`,{count:d.length})}))}</p>
        <p class="text-sm">${t(`backup.confirmPinNote`)}</p>
      `,actions:[{label:t(`common.cancel`),value:`cancel`,variant:`secondary`},{label:t(`backup.confirmAction`),value:`confirm`,variant:`danger`}]}).open()===`confirm`){try{D(l)}catch(e){console.error(e),i.error(e instanceof g?t(`backup.errors.${e.code}`):n(e,t(`backup.restoreFailed`)));return}try{await r()}catch(e){console.error(e)}o(t(`backup.restored`)),history.replaceState(null,``,`#/`),location.reload()}}unmount(){this._handlers.forEach(({el:e,type:t,fn:n})=>e.removeEventListener(t,n)),this._handlers=[]}};export{I as default};