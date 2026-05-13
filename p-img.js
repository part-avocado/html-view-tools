const IMG_ZOOM_STEPS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0];

class ImgInline extends HTMLElement {
  static get observedAttributes() { return ['src', 'alt']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._lbOverlay = null;
    this._lbImg     = null;
    this._lbZoom    = 1;
    this._onDocKey   = this._onDocKey.bind(this);
    this._onDocWheel = this._onDocWheel.bind(this);

    this.shadowRoot.innerHTML = `
<style>
  :host { display: inline-block; cursor: zoom-in; line-height: 0; }
  img   { display: block; max-width: 100%; height: auto; border-radius: 4px; }
</style>
<img>`;

    this._img = this.shadowRoot.querySelector('img');
    this._img.addEventListener('click', () => this._open());
  }

  connectedCallback()                 { this._sync(); }
  attributeChangedCallback()          { if (this.isConnected) this._sync(); }
  disconnectedCallback()              { this._close(); }

  _sync() {
    this._img.src = this.getAttribute('src') || '';
    this._img.alt = this.getAttribute('alt') || '';
  }

  _open() {
    if (this._lbOverlay) return;
    this._lbZoom = 1;

    const ov = document.createElement('div');
    Object.assign(ov.style, {
      position: 'fixed', inset: '0', zIndex: '9999',
      background: '#ebe7df',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: '0', transition: 'opacity 0.18s ease',
    });

    // close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '[×]';
    Object.assign(closeBtn.style, {
      position: 'absolute', top: '16px', right: '20px',
      background: 'none', border: 'none', cursor: 'pointer',
      fontFamily: 'monospace', fontSize: '16px', color: '#555',
      padding: '4px 8px', lineHeight: '1',
      opacity: '0.6', transition: 'opacity 0.12s',
    });
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.6');
    closeBtn.addEventListener('click', e => { e.stopPropagation(); this._close(); });

    // image
    const img = document.createElement('img');
    img.src = this.getAttribute('src') || '';
    img.alt = this.getAttribute('alt') || '';
    Object.assign(img.style, {
      maxWidth: '90vw', maxHeight: '85vh',
      borderRadius: '12px',
      boxShadow: '0 8px 48px rgba(0,0,0,0.22), 0 2px 12px rgba(0,0,0,0.12)',
      display: 'block',
      transformOrigin: 'center center',
      transition: 'transform 0.15s ease',
      userSelect: 'none', pointerEvents: 'none',
    });
    this._lbImg = img;

    // caption (alt text, if any)
    const alt = this.getAttribute('alt');
    if (alt) {
      const cap = document.createElement('div');
      cap.textContent = alt;
      Object.assign(cap.style, {
        position: 'absolute', bottom: '44px', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'monospace', fontSize: '12px', color: '#777',
        whiteSpace: 'nowrap', pointerEvents: 'none',
      });
      ov.appendChild(cap);
    }

    // hint
    const hint = document.createElement('div');
    hint.textContent = 'press [esc] to close  ·  ⌘+/− to zoom';
    Object.assign(hint.style, {
      position: 'absolute', bottom: '20px', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'monospace', fontSize: '12px', color: '#aaa',
      whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.02em',
    });

    ov.appendChild(closeBtn);
    ov.appendChild(img);
    ov.appendChild(hint);
    ov.addEventListener('click', e => { if (e.target === ov) this._close(); });

    document.body.appendChild(ov);
    this._lbOverlay = ov;
    requestAnimationFrame(() => { ov.style.opacity = '1'; });

    document.addEventListener('keydown', this._onDocKey);
    ov.addEventListener('wheel', this._onDocWheel, { passive: false });
  }

  _close() {
    if (!this._lbOverlay) return;
    const ov = this._lbOverlay;
    ov.style.opacity = '0';
    ov.addEventListener('transitionend', () => ov.remove(), { once: true });
    this._lbOverlay = null;
    this._lbImg     = null;
    document.removeEventListener('keydown', this._onDocKey);
  }

  _onDocKey(e) {
    if (e.key === 'Escape') { this._close(); return; }
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && (e.key === '+' || e.key === '=')) { e.preventDefault(); this._zoomStep(1); }
    if (ctrl &&  e.key === '-')                   { e.preventDefault(); this._zoomStep(-1); }
    if (ctrl &&  e.key === '0')                   { e.preventDefault(); this._applyZoom(1); }
  }

  _onDocWheel(e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      this._zoomStep(e.deltaY < 0 ? 1 : -1);
    }
  }

  _zoomStep(dir) {
    const idx  = IMG_ZOOM_STEPS.findIndex(s => s >= this._lbZoom - 0.001);
    const next = dir > 0
      ? Math.min(idx + 1, IMG_ZOOM_STEPS.length - 1)
      : Math.max(idx - 1, 0);
    this._applyZoom(IMG_ZOOM_STEPS[next]);
  }

  _applyZoom(z) {
    this._lbZoom = z;
    if (this._lbImg) this._lbImg.style.transform = `scale(${z})`;
  }
}

customElements.define('p-img', ImgInline);
