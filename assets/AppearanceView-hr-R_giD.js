import{n as e,t}from"./template-CRf3gOUw.js";var n=`<!-- @block: layout -->\r
<section class="appearance-view view-section">\r
  <div class="appearance-card card">\r
    <h2 class="appearance-section-title">Akzentfarbe</h2>\r
    <p class="appearance-desc">\r
      Die Akzentfarbe wird für Buttons, Icons und Fortschrittsbalken in der gesamten App verwendet.\r
    </p>\r
\r
    <!-- Preset swatches -->\r
    <div class="appearance-presets" role="group" aria-label="Farbvorschläge">\r
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
      <span class="appearance-wheel-text">Beliebige Farbe …</span>\r
      <span class="appearance-wheel-arrow">›</span>\r
      <input\r
        type="color"\r
        id="appearance-color-input"\r
        class="appearance-color-input"\r
        value="\${current}"\r
        aria-label="Farbauswahl"\r
      >\r
    </label>\r
\r
    <!-- Live-Vorschau -->\r
    <div class="appearance-preview">\r
      <span class="appearance-preview-label">Vorschau</span>\r
      <div class="appearance-preview-row">\r
        <button class="btn btn-primary" id="appearance-preview-btn" type="button">Beispiel-Button</button>\r
        <div\r
          class="appearance-preview-badge"\r
          id="appearance-preview-badge"\r
          style="background: color-mix(in srgb, \${current} 15%, transparent); color: \${current}"\r
        >Badge</div>\r
      </div>\r
    </div>\r
\r
    <button class="btn btn-primary btn-full mt-lg" id="appearance-save" type="button">\r
      Farbe übernehmen\r
    </button>\r
  </div>\r
</section>\r
`,r=`kidswallet-accent`,i=`#6c63ff`,a=[{hex:`#6c63ff`,label:`Lila`},{hex:`#9b5de5`,label:`Violett`},{hex:`#ef476f`,label:`Pink`},{hex:`#ff6b6b`,label:`Koralle`},{hex:`#f9a826`,label:`Orange`},{hex:`#43aa8b`,label:`Grün`},{hex:`#118ab2`,label:`Blau`},{hex:`#60656b`,label:`Grau`}],o=class{constructor(){this._current=(localStorage.getItem(r)||i).trim(),this._blocks=t(n)}render(){return e(this._blocks.layout,{current:this._current,presets:a})}mount(){let e=document.getElementById(`appearance-color-input`),t=document.getElementById(`appearance-wheel-swatch`);document.getElementById(`appearance-preview-btn`);let n=document.getElementById(`appearance-preview-badge`),i=document.getElementById(`appearance-save`),a=document.querySelector(`.appearance-view`),o=r=>{this._current=r,document.documentElement.style.setProperty(`--color-primary`,r),document.documentElement.style.setProperty(`--child-primary`,r),document.documentElement.style.setProperty(`--child-light`,`color-mix(in srgb, ${r} 15%, transparent)`),t.style.background=r,e.value=r,a.querySelectorAll(`.appearance-preset`).forEach(e=>{let t=e.dataset.color.toLowerCase()===r.toLowerCase();e.classList.toggle(`active`,t),e.setAttribute(`aria-pressed`,String(t))}),n.style.background=`color-mix(in srgb, ${r} 15%, transparent)`,n.style.color=r};a.addEventListener(`click`,e=>{let t=e.target.closest(`.appearance-preset`);t&&o(t.dataset.color)}),e.addEventListener(`input`,e=>o(e.target.value)),i.addEventListener(`click`,()=>{localStorage.setItem(r,this._current),i.textContent=`Gespeichert ✓`,i.disabled=!0,setTimeout(()=>{i.textContent=`Farbe übernehmen`,i.disabled=!1},1800)})}};export{o as default};