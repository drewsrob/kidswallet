import{G as e,R as t,T as n,W as r,l as i,n as a,t as o,z as s}from"./errors-B_GFX16_.js";import{d as c,l,u}from"./index-MuNmPWIB.js";import{n as d,t as f}from"./template-CY161wSk.js";var p=`<!-- @block: layout -->\r
<section class="appearance-view view-section" aria-label="\${t('navigation.appearance')}">\r
  \${sectionHeader({ level: 1, title: t('navigation.appearance') })}\r
\r
  <div class="appearance-card card">\r
    \${sectionHeader({ icon: 'moon', id: 'appearance-theme-title', title: t('appearance.themeTitle'), help: 'theme' })}\r
    <div class="appearance-choices appearance-themes" role="radiogroup"\r
      aria-labelledby="appearance-theme-title" aria-describedby="appearance-theme-hint">\r
      \${themes.map(th => \`\r
        <label class="appearance-choice\${th.value === theme ? ' active' : ''}">\r
          <input type="radio" name="app-theme" id="appearance-theme-\${th.value}"\r
            value="\${th.value}"\${th.value === theme ? ' checked' : ''}>\r
          <span>\${th.label}</span>\r
        </label>\r
      \`).join('')}\r
    </div>\r
    <p class="appearance-hint" id="appearance-theme-hint">\${t('appearance.themeSystemHint')}</p>\r
  </div>\r
\r
  <div class="appearance-card card">\r
    \${sectionHeader({\r
      icon: 'palette', title: t('appearance.accentTitle'), help: 'accentColor',\r
      subtitle: t('appearance.accentSubtitle'),\r
    })}\r
\r
    <!-- Preset swatches -->\r
    <div class="appearance-presets" role="group" aria-label="\${t('appearance.presetsLabel')}">\r
      \${presets.map(p => \`\r
        <button\r
          class="appearance-preset\${p.hex.toLowerCase() === current.toLowerCase() ? ' active' : ''}"\r
          data-color="\${p.hex}"\r
          style="--swatch-color: \${p.hex}"\r
          type="button"\r
          aria-label="\${p.label}"\r
          aria-pressed="\${p.hex.toLowerCase() === current.toLowerCase()}"\r
        >\r
          <span class="appearance-preset-dot"></span>\r
          <span class="appearance-preset-label">\${p.label}</span>\r
        </button>\r
      \`).join('')}\r
    </div>\r
\r
    <!-- Beliebige Farbe via Color Wheel -->\r
    <label class="appearance-wheel-row" for="appearance-color-input">\r
      <span class="appearance-wheel-swatch" id="appearance-wheel-swatch" style="background: \${current}"></span>\r
      <span class="appearance-wheel-text">\${t('appearance.customColor')}</span>\r
      <span class="appearance-wheel-arrow" aria-hidden="true">›</span>\r
      <input\r
        type="color"\r
        id="appearance-color-input"\r
        class="appearance-color-input"\r
        value="\${current}"\r
        aria-label="\${t('appearance.colorPickerLabel')}"\r
      >\r
    </label>\r
\r
    <!-- Live-Vorschau -->\r
    <div class="appearance-preview">\r
      <span class="appearance-preview-label">\${t('appearance.preview')}</span>\r
      <div class="appearance-preview-row">\r
        <button class="btn btn-primary" id="appearance-preview-btn" type="button" tabindex="-1" aria-hidden="true">\${t('appearance.previewButton')}</button>\r
        <div\r
          class="appearance-preview-badge"\r
          id="appearance-preview-badge"\r
          style="background: color-mix(in srgb, \${current} 15%, transparent); color: var(--accent-text)"\r
        >\${t('appearance.previewBadge')}</div>\r
      </div>\r
    </div>\r
\r
    <button class="btn btn-primary btn-full mt-lg" id="appearance-save" type="button">\r
      \${t('common.save')}\r
    </button>\r
  </div>\r
\r
  <div class="appearance-card card">\r
    \${sectionHeader({ icon: 'globe', id: 'appearance-language-title', title: t('appearance.languageTitle'), help: 'language' })}\r
    <div class="appearance-choices appearance-languages" role="radiogroup"\r
      aria-labelledby="appearance-language-title" aria-describedby="appearance-language-hint">\r
      \${languages.map(l => \`\r
        <label class="appearance-choice\${l.code === language ? ' active' : ''}" lang="\${l.code}">\r
          <input type="radio" name="app-language" id="appearance-language-\${l.code}"\r
            value="\${l.code}"\${l.code === language ? ' checked' : ''}>\r
          <span>\${l.label}</span>\r
        </label>\r
      \`).join('')}\r
    </div>\r
    <p class="appearance-hint" id="appearance-language-hint">\${t('appearance.instantHint')}</p>\r
  </div>\r
</section>\r
`,m=`kidswallet-accent`,h=`#6c63ff`,g=[{hex:`#6c63ff`,key:`purple`},{hex:`#9b5de5`,key:`violet`},{hex:`#ef476f`,key:`pink`},{hex:`#ff6b6b`,key:`coral`},{hex:`#f9a826`,key:`orange`},{hex:`#43aa8b`,key:`green`},{hex:`#118ab2`,key:`blue`},{hex:`#60656b`,key:`grey`}],_=class{constructor(){this._current=(localStorage.getItem(m)||h).trim(),this._blocks=f(p)}render(){return a()?d(this._blocks.layout,{current:this._current,presets:g.map(t=>({...t,label:e(`appearance.colors.${t.key}`)})),themes:l.map(t=>({value:t,label:e(`appearance.themes.${t}`)})),theme:u(),languages:t,language:s()}):(this._blocked=!0,location.replace(`#/admin`),`<div></div>`)}mount(){if(this._blocked)return;let t=document.querySelector(`.appearance-themes`);t.addEventListener(`change`,n=>{let r=n.target.closest(`input[name="app-theme"]`)?.value;if(r){t.querySelectorAll(`.appearance-choice`).forEach(e=>{e.classList.toggle(`active`,e.querySelector(`input`).value===r)});try{c(r)}catch(t){console.error(t),i.error(o(t,e(`errors.saveFailed`)))}}});let a=document.getElementById(`appearance-color-input`),l=document.getElementById(`appearance-wheel-swatch`);document.getElementById(`appearance-preview-btn`);let u=document.getElementById(`appearance-preview-badge`),d=document.getElementById(`appearance-save`),f=document.querySelector(`.appearance-view`),p=e=>{this._current=e,document.documentElement.style.setProperty(`--color-primary`,e),document.documentElement.style.setProperty(`--child-primary`,e),document.documentElement.style.setProperty(`--child-light`,`color-mix(in srgb, ${e} 15%, transparent)`),n(`accent`,e),n(`child`,e),l.style.background=e,a.value=e,f.querySelectorAll(`.appearance-preset`).forEach(t=>{let n=t.dataset.color.toLowerCase()===e.toLowerCase();t.classList.toggle(`active`,n),t.setAttribute(`aria-pressed`,String(n))}),u.style.background=`color-mix(in srgb, ${e} 15%, transparent)`,u.style.color=`var(--accent-text)`};f.addEventListener(`click`,e=>{let t=e.target.closest(`.appearance-preset`);t&&p(t.dataset.color)}),a.addEventListener(`input`,e=>p(e.target.value)),d.addEventListener(`click`,()=>{try{localStorage.setItem(m,this._current),i.success(e(`settings.accentSaved`))}catch(t){console.error(t),i.error(o(t,e(`errors.saveFailed`)))}}),f.querySelector(`.appearance-languages`)?.addEventListener(`change`,async t=>{let n=t.target.closest(`input[name="app-language"]`)?.value;if(!(!n||n===s()))try{await r(n),i.success(e(`appearance.languageSaved`))}catch(t){console.error(t);let n=document.getElementById(`appearance-language-${s()}`);n&&(n.checked=!0),i.error(o(t,e(`errors.saveFailed`)))}})}};export{_ as default};