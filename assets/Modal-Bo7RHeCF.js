var e=class{constructor({title:e,content:t,actions:n,validate:r}){this.title=e,this.content=t,this.actions=n??[{label:`Schließen`,value:`close`,variant:`secondary`}],this.validate=r??null}open(){return new Promise(e=>{let t=document.createElement(`div`);t.className=`modal-overlay`,t.setAttribute(`role`,`dialog`),t.setAttribute(`aria-modal`,`true`),t.setAttribute(`aria-labelledby`,`modal-title-text`),t.innerHTML=`
        <div class="modal">
          <header class="modal-header">
            <h2 id="modal-title-text">${this.title}</h2>
          </header>
          <div class="modal-content">
            ${this.content}
          </div>
          <footer class="modal-actions">
            ${this.actions.map(e=>`
              <button
                class="btn btn-${e.variant??`secondary`}"
                data-value="${e.value}"
                type="button"
              >${e.label}</button>
            `).join(``)}
          </footer>
        </div>
      `;let n=n=>{e(n),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},0)};t.addEventListener(`click`,e=>{let r=e.target.closest(`[data-value]`);if(r){if(this.validate&&this.validate(r.dataset.value)===!1)return;n(r.dataset.value)}e.target===t&&n(`backdrop`)});let r=e=>{e.key===`Escape`&&(document.removeEventListener(`keydown`,r),n(`escape`))};document.addEventListener(`keydown`,r),document.body.appendChild(t),requestAnimationFrame(()=>{let e=t.querySelector(`button`);e&&e.focus()})})}};export{e as t};