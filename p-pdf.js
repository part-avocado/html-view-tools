const PDFJS_VERSION = '4.4.168';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 4.0];
const RENDER_BUFFER = 1;
const CLEAR_DISTANCE = 6;

let pdfjsLibPromise = null;
function getPdfjsLib() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import(`${PDFJS_CDN}/pdf.min.mjs`).then(lib => {
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.mjs`;
      return lib;
    });
  }
  return pdfjsLibPromise;
}

const I = {
  prev: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  next: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  zoomOut: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  zoomIn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  fullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  exitFullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>`,
  doc: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.4,12l5.3-5.3c0.4-0.4,0.4-1,0-1.4s-1-0.4-1.4,0L12,10.6L6.7,5.3c-0.4-0.4-1-0.4-1.4,0s-0.4,1,0,1.4l5.3,5.3l-5.3,5.3c-0.4,0.4-0.4,1,0,1.4C5.5,18.9,5.7,19,6,19s0.5-0.1,0.7-0.3l5.3-5.3l5.3,5.3c0.2,0.2,0.5,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z"/></svg>`,
  arrowUp:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m12 20 0 -16m0 0 6 6m-6 -6 -6 6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"/></svg>`,
  arrowDown: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m12 4 0 16m0 0 6 -6m-6 6 -6 -6" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75"/></svg>`,
};

const template = document.createElement('template');
template.innerHTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    width: 100%;
    height: 600px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: #3c4043;
    --accent: #1a73e8;
    --accent-light: rgba(26, 115, 232, 0.15);
  }

  :host(:fullscreen), :host(:-webkit-full-screen) {
    height: 100vh !important;
    width: 100vw !important;
  }

  .root {
    display: flex; flex-direction: column;
    height: 100%; border: 1px solid #e0e0e0; border-radius: 6px;
    overflow: hidden; background: #525659;
  }
  :host(:fullscreen) .root, :host(:-webkit-full-screen) .root { border-radius: 0; border: none; }

  .toolbar {
    display: flex; align-items: center; height: 44px; padding: 0 8px;
    background: #f8f9fa; border-bottom: 1px solid #e0e0e0;
    flex-shrink: 0; gap: 2px; user-select: none; z-index: 10;
  }
  .tb-group { display: flex; align-items: center; gap: 2px; }
  .tb-spacer { flex: 1; min-width: 8px; }
  .tb-divider { width: 1px; height: 20px; background: #dadce0; margin: 0 4px; flex-shrink: 0; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center;
    border: none; background: transparent; cursor: pointer;
    padding: 5px; border-radius: 4px; color: #444;
    min-width: 32px; height: 32px;
    transition: background 0.1s; line-height: 1; flex-shrink: 0;
    touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  }
  .btn:hover:not(:disabled) { background: #e8eaed; }
  .btn:active:not(:disabled) { background: #dadce0; }
  .btn:disabled { opacity: 0.38; cursor: default; }
  .btn.active { background: #e8f0fe; color: var(--accent); }

  .page-nav { display: flex; align-items: center; gap: 4px; font-size: 13px; color: #5f6368; padding: 0 2px; flex-shrink: 0; }
  .page-input {
    width: 40px; height: 26px; text-align: center;
    border: 1px solid #dadce0; border-radius: 4px;
    font-size: 13px; color: #3c4043; padding: 0 4px;
    -moz-appearance: textfield; appearance: textfield;
    outline: none; transition: border-color 0.15s, box-shadow 0.15s;
    touch-action: manipulation;
  }
  .page-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-light); }
  .page-input::-webkit-inner-spin-button, .page-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .page-sep, .page-total { color: #80868b; font-size: 13px; white-space: nowrap; }

  .zoom-display { font-size: 13px; color: #5f6368; min-width: 40px; text-align: center; padding: 0 2px; white-space: nowrap; }

  .search-bar {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 10px; background: #fff;
    border-bottom: 1px solid #e0e0e0; flex-shrink: 0; z-index: 10;
  }
  .search-bar[hidden] { display: none; }
  .search-input {
    flex: 1; max-width: 280px; height: 30px;
    padding: 0 10px; border: 1px solid #dadce0; border-radius: 4px;
    font-size: 13px; color: #3c4043; outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    touch-action: manipulation;
  }
  .search-input:focus { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-light); }
  .search-count { font-size: 12px; color: #80868b; white-space: nowrap; min-width: 72px; }
  .search-count.no-results { color: #d93025; }

  .viewport {
    flex: 1; overflow-x: auto; overflow-y: auto;
    -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
    position: relative; background: #525659;
    touch-action: pan-x pan-y;
  }

  .pages-container {
    display: flex; flex-direction: column; align-items: center;
    gap: 12px; padding: 24px 16px; min-height: 100%;
    transform-origin: center top; will-change: transform;
  }

  .page-item {
    position: relative; flex-shrink: 0;
    background: white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.25), 0 8px 28px rgba(0,0,0,0.2);
    border-radius: 1px;
  }
  .pdf-canvas { display: block; }

  .text-layer {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    overflow: clip; line-height: 1; pointer-events: auto;
  }
  .text-layer span, .text-layer br {
    color: transparent; position: absolute;
    white-space: pre; cursor: text; transform-origin: 0% 0%;
  }
  .text-layer ::selection { background: rgba(26,115,232,0.25); color: transparent; }

  mark.highlight { background: rgba(255, 213, 0, 0.55); color: transparent; border-radius: 2px; }
  mark.highlight.selected { background: rgba(255, 140, 0, 0.7); }
  mark.highlight::selection { background: rgba(26,115,232,0.35); color: transparent; }

  .overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    background: #525659; z-index: 20;
  }
  .overlay[hidden] { display: none; }
  .overlay-card {
    background: white; border-radius: 10px;
    padding: 36px 44px; text-align: center; max-width: 380px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  }
  .overlay-card .spinner {
    width: 36px; height: 36px;
    border: 3px solid #e8eaed; border-top-color: var(--accent);
    border-radius: 50%; animation: spin 0.7s linear infinite;
    margin: 0 auto 16px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .overlay-card .ov-icon { margin-bottom: 12px; color: #80868b; }
  .overlay-card h3 { font-size: 15px; font-weight: 600; color: #3c4043; margin-bottom: 8px; }
  .overlay-card p { font-size: 13px; color: #5f6368; line-height: 1.55; }
  .overlay-card .error-icon { font-size: 32px; margin-bottom: 12px; }

  @media (max-width: 540px) {
    .toolbar { padding: 0 4px; gap: 1px; height: 48px; }
    .btn { min-width: 36px; height: 36px; }
    .zoom-display { display: none; }
    .tb-divider { margin: 0 2px; }
    .pages-container { padding: 12px 8px; gap: 8px; }
    .overlay-card { padding: 28px 24px; margin: 16px; }
  }
  @media (max-width: 380px) {
    .page-sep, .page-total { display: none; }
    .tb-divider:last-of-type { display: none; }
  }
</style>

<div class="root">
  <div class="toolbar">
    <div class="tb-group">
      <button class="btn btn-prev" title="Previous page" disabled>${I.prev}</button>
      <span class="page-nav">
        <input class="page-input" type="number" min="1" value="1" aria-label="Page">
        <span class="page-sep">/</span>
        <span class="page-total">—</span>
      </span>
      <button class="btn btn-next" title="Next page" disabled>${I.next}</button>
    </div>
    <div class="tb-spacer"></div>
    <div class="tb-group">
      <button class="btn btn-zoom-out" title="Zoom out">${I.zoomOut}</button>
      <span class="zoom-display">100%</span>
      <button class="btn btn-zoom-in" title="Zoom in">${I.zoomIn}</button>
    </div>
    <div class="tb-divider"></div>
    <div class="tb-group">
      <button class="btn btn-search" title="Find in document">${I.search}</button>
      <button class="btn btn-fullscreen" title="Fullscreen">${I.fullscreen}</button>
    </div>
  </div>

  <div class="search-bar" hidden>
    <input class="search-input" type="text" placeholder="Find in document…" spellcheck="false" autocomplete="off">
    <span class="search-count"></span>
    <button class="btn btn-search-prev" title="Previous match">${I.arrowUp}</button>
    <button class="btn btn-search-next" title="Next match">${I.arrowDown}</button>
    <button class="btn btn-search-close" title="Close">${I.close}</button>
  </div>

  <div class="viewport">
    <div class="pages-container"></div>
    <div class="overlay">
      <div class="overlay-card">
        <div class="ov-icon">${I.doc}</div>
        <h3>No document</h3>
        <p>Set the <code>src</code> attribute to a PDF URL to display it here.</p>
      </div>
    </div>
  </div>
</div>
`;

class PdfInline extends HTMLElement {
  static get observedAttributes() { return ['src']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._pdfDoc = null;
    this._totalPages = 0;
    this._currentPage = 1;
    this._zoom = 1.0;
    this._fitZoom = 1.0;
    this._userZoomed = false;
    this._pageItems = [];
    this._intersecting = new Set();
    this._renderVersions = new Map();
    this._renderTimer = null;

    this._pinchActive = false;
    this._pinchStartDist = 0;
    this._pinchStartZoom = 1;
    this._pinchTargetZoom = null;
    this._lastTap = 0;
    this._lastTapPos = null;

    this._searchQuery = '';
    this._searchMatches = [];
    this._searchMatchIndex = -1;
    this._searchOpen = false;

    this._io = null;
    this._pageTrackIO = null;
    this._resizeObserver = null;
    this._resizeRaf = null;

    const sr = this.shadowRoot;
    this._viewport       = sr.querySelector('.viewport');
    this._pagesContainer = sr.querySelector('.pages-container');
    this._overlay        = sr.querySelector('.overlay');
    this._searchBar      = sr.querySelector('.search-bar');
    this._searchInput    = sr.querySelector('.search-input');
    this._searchCount    = sr.querySelector('.search-count');
    this._btnPrev        = sr.querySelector('.btn-prev');
    this._btnNext        = sr.querySelector('.btn-next');
    this._pageInput      = sr.querySelector('.page-input');
    this._pageTotal      = sr.querySelector('.page-total');
    this._zoomDisplay    = sr.querySelector('.zoom-display');
    this._btnZoomOut     = sr.querySelector('.btn-zoom-out');
    this._btnZoomIn      = sr.querySelector('.btn-zoom-in');
    this._btnSearch      = sr.querySelector('.btn-search');
    this._btnFull        = sr.querySelector('.btn-fullscreen');
  }

  connectedCallback() {
    this.tabIndex = 0;
    this._bindEvents();
    const src = this.getAttribute('src');
    if (src) this._loadPdf(src);
  }

  disconnectedCallback() {
    this._io?.disconnect();
    this._pageTrackIO?.disconnect();
    this._resizeObserver?.disconnect();
    this._pdfDoc?.destroy();
    this._pdfDoc = null;
    document.removeEventListener('fullscreenchange', this._onFSChange);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'src' && newVal !== oldVal && this.isConnected) this._loadPdf(newVal);
  }

  _bindEvents() {
    const sr = this.shadowRoot;
    this._btnPrev.addEventListener('click', () => this._prevPage());
    this._btnNext.addEventListener('click', () => this._nextPage());
    this._pageInput.addEventListener('change', () => {
      const n = parseInt(this._pageInput.value, 10);
      if (!isNaN(n)) this._goToPage(n);
    });
    this._pageInput.addEventListener('keydown', e => { if (e.key === 'Enter') this._pageInput.blur(); });
    this._btnZoomOut.addEventListener('click', () => this._zoomOut());
    this._btnZoomIn.addEventListener('click',  () => this._zoomIn());
    this._btnSearch.addEventListener('click',  () => this._toggleSearch());
    this._btnFull.addEventListener('click',    () => this._toggleFullscreen());

    this._searchInput.addEventListener('input', () => this._performSearch(this._searchInput.value));
    this._searchInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.shiftKey ? this._searchPrev() : this._searchNext(); }
      if (e.key === 'Escape') this._closeSearch();
    });
    sr.querySelector('.btn-search-prev').addEventListener('click', () => this._searchPrev());
    sr.querySelector('.btn-search-next').addEventListener('click', () => this._searchNext());
    sr.querySelector('.btn-search-close').addEventListener('click', () => this._closeSearch());

    this.addEventListener('keydown', e => this._onKeyDown(e));

    this._onFSChange = () => this._updateFSButton();
    document.addEventListener('fullscreenchange', this._onFSChange);

    this._viewport.addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) this._zoomIn(); else this._zoomOut();
      }
    }, { passive: false });

    this._bindTouchEvents();

    this._resizeObserver = new ResizeObserver(() => {
      if (!this._pdfDoc) return;
      cancelAnimationFrame(this._resizeRaf);
      this._resizeRaf = requestAnimationFrame(async () => {
        await this._calcFitZoom();
        if (!this._userZoomed && this._zoom !== this._fitZoom) {
          this._zoom = this._fitZoom;
          this._updateZoomDisplay();
          this._updatePageDimensions();
        }
        this._scheduleRender();
      });
    });
    this._resizeObserver.observe(this._viewport);
  }

  _bindTouchEvents() {
    const vp = this._viewport;
    vp.addEventListener('touchstart', e => {
      if (e.touches.length >= 2) {
        this._pinchActive = true;
        const [a, b] = e.touches;
        this._pinchStartDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        this._pinchStartZoom = this._zoom;
        this._pinchTargetZoom = this._zoom;
        e.preventDefault();
      } else if (e.touches.length === 1) {
        const now = Date.now();
        const t = e.touches[0];
        const pos = this._lastTapPos;
        if (now - this._lastTap < 300 && pos &&
            Math.abs(t.clientX - pos.x) < 40 &&
            Math.abs(t.clientY - pos.y) < 40) {
          this._handleDoubleTap();
          e.preventDefault();
          this._lastTap = 0; this._lastTapPos = null;
        } else {
          this._lastTap = now;
          this._lastTapPos = { x: t.clientX, y: t.clientY };
        }
      }
    }, { passive: false });

    vp.addEventListener('touchmove', e => {
      if (this._pinchActive && e.touches.length >= 2) {
        const [a, b] = e.touches;
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        const ratio = dist / this._pinchStartDist;
        const raw = this._pinchStartZoom * ratio;
        this._pinchTargetZoom = Math.max(ZOOM_STEPS[0], Math.min(ZOOM_STEPS.at(-1), raw));
        const scaleVis = this._pinchTargetZoom / this._zoom;
        this._pagesContainer.style.transformOrigin = 'center top';
        this._pagesContainer.style.transform = `scale(${scaleVis})`;
        e.preventDefault();
      }
    }, { passive: false });

    const endPinch = () => {
      if (!this._pinchActive) return;
      this._pinchActive = false;
      this._pagesContainer.style.transform = '';
      if (this._pinchTargetZoom !== null) {
        const nearest = ZOOM_STEPS.reduce((a, b) =>
          Math.abs(b - this._pinchTargetZoom) < Math.abs(a - this._pinchTargetZoom) ? b : a
        );
        this._applyZoom(nearest);
        this._pinchTargetZoom = null;
      }
    };
    vp.addEventListener('touchend',    endPinch, { passive: true });
    vp.addEventListener('touchcancel', endPinch, { passive: true });
  }

  _handleDoubleTap() {
    const target = this._zoom > this._fitZoom * 1.05
      ? this._fitZoom
      : Math.min(this._fitZoom * 2, ZOOM_STEPS.at(-1));
    const nearest = ZOOM_STEPS.reduce((a, b) =>
      Math.abs(b - target) < Math.abs(a - target) ? b : a
    );
    this._applyZoom(nearest);
  }

  _onKeyDown(e) {
    const ctrl = e.ctrlKey || e.metaKey;
    if (!this._searchOpen) {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); this._nextPage(); }
      if (e.key === 'ArrowUp'   || e.key === 'PageUp')   { e.preventDefault(); this._prevPage(); }
    }
    if (ctrl && e.key === 'f') { e.preventDefault(); this._openSearch(); }
    if (ctrl && (e.key === '+' || e.key === '=')) { e.preventDefault(); this._zoomIn(); }
    if (ctrl && e.key === '-') { e.preventDefault(); this._zoomOut(); }
    if (ctrl && e.key === '0') { e.preventDefault(); this._applyZoom(this._fitZoom, { fromUser: false }); }
    if (e.key === 'Escape') {
      if (this._searchOpen) this._closeSearch();
      else if (document.fullscreenElement === this) document.exitFullscreen();
    }
  }

  async _loadPdf(url) {
    if (!url) return;
    this._showLoading();
    this._destroyPageItems();
    try {
      const lib = await getPdfjsLib();
      if (this._pdfDoc) { this._pdfDoc.destroy(); this._pdfDoc = null; }
      this._pdfDoc = await lib.getDocument({
        url, withCredentials: false,
        cMapUrl: `${PDFJS_CDN}/cmaps/`, cMapPacked: true,
      }).promise;
      this._totalPages = this._pdfDoc.numPages;
      this._currentPage = 1;
      this._userZoomed = false;
      await this._calcFitZoom();
      this._zoom = this._fitZoom;
      await this._buildPageItems();
      this._setupObservers();
      this._updatePageDisplay();
      this._updateZoomDisplay();
      this._hideOverlay();
    } catch (err) {
      console.error('p-pdf load error:', err);
      const isCors = err?.status === 0 || err?.name === 'UnexpectedResponseException' ||
                     (err?.message || '').includes('fetch');
      this._showError(
        isCors
          ? 'This server may not allow CORS requests.'
          : `Failed to load PDF. ${err?.message || err}`
      );
    }
  }

  async _calcFitZoom() {
    if (!this._pdfDoc) return;
    try {
      const page = await this._pdfDoc.getPage(1);
      const vp = page.getViewport({ scale: 1 });
      const available = Math.max(this._viewport.clientWidth - 32, 200);
      this._fitZoom = Math.min(Math.max(available / vp.width, ZOOM_STEPS[0]), ZOOM_STEPS.at(-1));
    } catch (_) {}
  }

  async _buildPageItems() {
    const pages = await Promise.all(
      Array.from({ length: this._totalPages }, (_, i) => this._pdfDoc.getPage(i + 1))
    );
    this._pagesContainer.innerHTML = '';
    this._pageItems = pages.map((page, i) => {
      const vp = page.getViewport({ scale: 1 });
      const cssW = Math.round(vp.width * this._zoom);
      const cssH = Math.round(vp.height * this._zoom);
      const item = document.createElement('div');
      item.className = 'page-item';
      item.dataset.page = i + 1;
      item.style.width = cssW + 'px';
      item.style.height = cssH + 'px';
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      const tl = document.createElement('div');
      tl.className = 'text-layer';
      item.appendChild(canvas);
      item.appendChild(tl);
      this._pagesContainer.appendChild(item);
      return {
        el: item, canvas, textLayer: tl,
        naturalW: vp.width, naturalH: vp.height,
        rendered: false, rendering: false, activeTask: null,
      };
    });
  }

  _destroyPageItems() {
    this._io?.disconnect();
    this._pageTrackIO?.disconnect();
    this._io = null;
    this._pageTrackIO = null;
    for (const item of this._pageItems) item.activeTask?.cancel?.();
    this._pagesContainer.innerHTML = '';
    this._pageItems = [];
    this._intersecting.clear();
    this._renderVersions.clear();
  }

  _updatePageDimensions() {
    for (const item of this._pageItems) {
      const cssW = Math.round(item.naturalW * this._zoom);
      const cssH = Math.round(item.naturalH * this._zoom);
      item.el.style.width = cssW + 'px';
      item.el.style.height = cssH + 'px';
      item.canvas.style.width = cssW + 'px';
      item.canvas.style.height = cssH + 'px';
      item.textLayer.innerHTML = '';
      item.rendered = false;
    }
  }

  _setupObservers() {
    this._io?.disconnect();
    this._pageTrackIO?.disconnect();

    this._io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const n = parseInt(e.target.dataset.page, 10);
        e.isIntersecting ? this._intersecting.add(n) : this._intersecting.delete(n);
      }
      this._scheduleRender();
    }, { root: this._viewport, rootMargin: '400px 0px', threshold: 0 });

    this._pageTrackIO = new IntersectionObserver(entries => {
      let best = null, bestRatio = -1;
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio > bestRatio) {
          bestRatio = e.intersectionRatio;
          best = parseInt(e.target.dataset.page, 10);
        }
      }
      if (best !== null && best !== this._currentPage) {
        this._currentPage = best;
        this._updatePageDisplay();
      }
    }, { root: this._viewport, threshold: [0, 0.25, 0.5, 0.75, 1] });

    for (const item of this._pageItems) {
      this._io.observe(item.el);
      this._pageTrackIO.observe(item.el);
    }
  }

  _scheduleRender() {
    clearTimeout(this._renderTimer);
    this._renderTimer = setTimeout(() => this._renderVisiblePages(), 30);
  }

  _renderVisiblePages() {
    const toRender = new Set();
    for (const p of this._intersecting) {
      for (let i = Math.max(1, p - RENDER_BUFFER); i <= Math.min(this._totalPages, p + RENDER_BUFFER); i++) {
        toRender.add(i);
      }
    }
    for (const n of toRender) {
      const item = this._pageItems[n - 1];
      if (item && !item.rendered && !item.rendering) this._renderPage(n);
    }
    for (let i = 0; i < this._pageItems.length; i++) {
      const n = i + 1;
      if (toRender.has(n)) continue;
      const item = this._pageItems[i];
      if (!item.rendered) continue;
      const dist = this._intersecting.size
        ? Math.min(...[...this._intersecting].map(p => Math.abs(p - n)))
        : Infinity;
      if (dist > CLEAR_DISTANCE) this._freePage(item);
    }
  }

  async _renderPage(pageNum) {
    const item = this._pageItems[pageNum - 1];
    if (!item) return;
    item.activeTask?.cancel?.();
    item.activeTask = null;

    item.rendering = true;
    const version = (this._renderVersions.get(pageNum) || 0) + 1;
    this._renderVersions.set(pageNum, version);
    const stale = () => this._renderVersions.get(pageNum) !== version;

    try {
      const lib = await getPdfjsLib();              if (stale()) return;
      const page = await this._pdfDoc.getPage(pageNum); if (stale()) return;

      const dpr = window.devicePixelRatio || 1;
      const cssVp = page.getViewport({ scale: this._zoom });
      const physVp = page.getViewport({ scale: this._zoom * dpr });
      const { canvas, textLayer } = item;
      const ctx = canvas.getContext('2d');

      canvas.width = physVp.width;
      canvas.height = physVp.height;
      canvas.style.width = cssVp.width + 'px';
      canvas.style.height = cssVp.height + 'px';
      item.el.style.width = cssVp.width + 'px';
      item.el.style.height = cssVp.height + 'px';

      const renderTask = page.render({ canvasContext: ctx, viewport: physVp });
      item.activeTask = renderTask;
      await renderTask.promise;                     if (stale()) return;
      item.activeTask = null;

      textLayer.innerHTML = '';
      const tc = await page.getTextContent();       if (stale()) return;
      await this._renderTextLayer(lib, tc, cssVp, textLayer);
      if (stale()) return;

      item.rendered = true;

      if (this._searchOpen && this._searchQuery.trim()) {
        requestAnimationFrame(() => this._applyHighlightsToPage(pageNum));
      }
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error(`p-pdf page ${pageNum}:`, err);
      }
    } finally {
      item.rendering = false;
      item.activeTask = null;
      if (!item.rendered) this._scheduleRender();
    }
  }

  _freePage(item) {
    item.activeTask?.cancel?.();
    item.activeTask = null;
    const ctx = item.canvas.getContext('2d');
    ctx.clearRect(0, 0, item.canvas.width, item.canvas.height);
    item.textLayer.innerHTML = '';
    item.rendered = false;
    item.rendering = false;
  }

  async _renderTextLayer(lib, textContent, viewport, container) {
    try {
      if (lib.renderTextLayer) {
        const task = lib.renderTextLayer({
          textContentSource: textContent, container, viewport, textDivs: [],
        });
        if (task?.promise) await task.promise;
      } else if (lib.TextLayer) {
        await new lib.TextLayer({ textContentSource: textContent, container, viewport }).render();
      }
    } catch (_) {}
  }

  _goToPage(n) {
    n = Math.max(1, Math.min(n, this._totalPages));
    const item = this._pageItems[n - 1];
    if (!item) return;
    this._viewport.scrollTo({ top: item.el.offsetTop, behavior: 'smooth' });
    this._currentPage = n;
    this._updatePageDisplay();
  }
  _prevPage() { this._goToPage(this._currentPage - 1); }
  _nextPage() { this._goToPage(this._currentPage + 1); }

  _updatePageDisplay() {
    this._pageInput.value = this._currentPage;
    this._pageTotal.textContent = this._totalPages;
    this._btnPrev.disabled = this._currentPage <= 1;
    this._btnNext.disabled = this._currentPage >= this._totalPages;
  }

  _zoomIn() {
    const idx = ZOOM_STEPS.findIndex(s => s >= this._zoom - 0.001);
    if (idx < ZOOM_STEPS.length - 1) this._applyZoom(ZOOM_STEPS[idx + 1]);
  }
  _zoomOut() {
    const idx = ZOOM_STEPS.findIndex(s => s >= this._zoom - 0.001);
    if (idx > 0) this._applyZoom(ZOOM_STEPS[idx - 1]);
  }

  _applyZoom(newZoom, { fromUser = true } = {}) {
    if (newZoom === this._zoom) return;
    const anchor = this._getScrollAnchor();
    this._zoom = newZoom;
    this._userZoomed = fromUser && Math.abs(newZoom - this._fitZoom) > 0.01;
    this._updateZoomDisplay();
    this._updatePageDimensions();
    this._restoreScrollAnchor(anchor);
    this._renderVisiblePages();
    if (this._searchOpen && this._searchQuery.trim()) {
      clearTimeout(this._searchReapplyTimer);
      this._searchReapplyTimer = setTimeout(() => this._performSearch(this._searchQuery), 200);
    }
  }

  _getScrollAnchor() {
    const vpRect = this._viewport.getBoundingClientRect();
    const mid = vpRect.top + vpRect.height / 2;
    for (let i = 0; i < this._pageItems.length; i++) {
      const r = this._pageItems[i].el.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) return { idx: i, relY: (mid - r.top) / r.height };
    }
    return { idx: 0, relY: 0 };
  }

  _restoreScrollAnchor({ idx, relY }) {
    const item = this._pageItems[idx];
    if (!item) return;
    const newH = item.naturalH * this._zoom;
    const targetTop = item.el.offsetTop + relY * newH - this._viewport.clientHeight / 2;
    this._viewport.scrollTop = Math.max(0, targetTop);
  }

  _updateZoomDisplay() {
    this._zoomDisplay.textContent = Math.round(this._zoom * 100) + '%';
    this._btnZoomOut.disabled = this._zoom <= ZOOM_STEPS[0];
    this._btnZoomIn.disabled = this._zoom >= ZOOM_STEPS.at(-1);
  }

  _toggleSearch() { this._searchOpen ? this._closeSearch() : this._openSearch(); }

  _openSearch() {
    this._searchOpen = true;
    this._searchBar.hidden = false;
    this._btnSearch.classList.add('active');
    this._searchInput.focus();
    this._searchInput.select();
  }

  _closeSearch() {
    this._searchOpen = false;
    this._searchBar.hidden = true;
    this._btnSearch.classList.remove('active');
    this._clearHighlights();
    this._searchMatches = [];
    this._searchMatchIndex = -1;
    this._searchQuery = '';
    this._searchCount.textContent = '';
    this._searchCount.classList.remove('no-results');
  }

  _performSearch(query) {
    this._searchQuery = query;
    this._clearHighlights();
    this._searchMatches = [];
    this._searchMatchIndex = -1;

    if (!query.trim()) {
      this._searchCount.textContent = '';
      this._searchCount.classList.remove('no-results');
      return;
    }
    const marks = this._highlightInLayers(query, this.shadowRoot.querySelectorAll('.text-layer'));
    this._searchMatches = marks;
    if (marks.length > 0) {
      this._searchMatchIndex = 0;
      marks[0].classList.add('selected');
      this._searchCount.textContent = `1 of ${marks.length}`;
      this._searchCount.classList.remove('no-results');
      this._scrollMatchIntoView(0);
    } else {
      this._searchCount.textContent = 'No results';
      this._searchCount.classList.add('no-results');
    }
  }

  _applyHighlightsToPage(pageNum) {
    if (!this._searchQuery.trim()) return;
    const item = this._pageItems[pageNum - 1];
    if (!item) return;
    const newMarks = this._highlightInLayers(this._searchQuery, [item.textLayer]);
    if (newMarks.length) {
      this._searchMatches = [...this._searchMatches, ...newMarks];
      this._searchCount.textContent = `${this._searchMatchIndex + 1} of ${this._searchMatches.length}`;
    }
  }

  _highlightInLayers(query, layers) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const marks = [];
    for (const tl of layers) {
      for (const span of tl.querySelectorAll('span')) {
        const text = span.textContent;
        if (!text) continue;
        const hits = [];
        let m;
        regex.lastIndex = 0;
        while ((m = regex.exec(text)) !== null) hits.push({ start: m.index, end: m.index + m[0].length });
        if (!hits.length) continue;
        const frag = document.createDocumentFragment();
        let cursor = 0;
        for (const { start, end } of hits) {
          if (start > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, start)));
          const mark = document.createElement('mark');
          mark.className = 'highlight';
          mark.textContent = text.slice(start, end);
          frag.appendChild(mark);
          marks.push(mark);
          cursor = end;
        }
        if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
        span.innerHTML = '';
        span.appendChild(frag);
      }
    }
    return marks;
  }

  _clearHighlights() {
    for (const mark of this.shadowRoot.querySelectorAll('mark.highlight')) {
      const p = mark.parentNode;
      if (p) { p.replaceChild(document.createTextNode(mark.textContent), mark); p.normalize(); }
    }
  }

  _searchNext() {
    const m = this._searchMatches;
    if (!m.length) return;
    m[this._searchMatchIndex]?.classList.remove('selected');
    this._searchMatchIndex = (this._searchMatchIndex + 1) % m.length;
    m[this._searchMatchIndex].classList.add('selected');
    this._searchCount.textContent = `${this._searchMatchIndex + 1} of ${m.length}`;
    this._scrollMatchIntoView(this._searchMatchIndex);
  }
  _searchPrev() {
    const m = this._searchMatches;
    if (!m.length) return;
    m[this._searchMatchIndex]?.classList.remove('selected');
    this._searchMatchIndex = (this._searchMatchIndex - 1 + m.length) % m.length;
    m[this._searchMatchIndex].classList.add('selected');
    this._searchCount.textContent = `${this._searchMatchIndex + 1} of ${m.length}`;
    this._scrollMatchIntoView(this._searchMatchIndex);
  }
  _scrollMatchIntoView(idx) {
    this._searchMatches[idx]?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.requestFullscreen().catch(err => console.warn('Fullscreen error:', err));
    } else {
      document.exitFullscreen();
    }
  }
  _updateFSButton() {
    const isFS = document.fullscreenElement === this;
    this._btnFull.innerHTML = isFS ? I.exitFullscreen : I.fullscreen;
    this._btnFull.title = isFS ? 'Exit fullscreen (Esc)' : 'Fullscreen';
  }

  _showLoading() {
    this._overlay.hidden = false;
    this._overlay.querySelector('.overlay-card').innerHTML = `<div class="spinner"></div><h3>Loading…</h3>`;
  }
  _hideOverlay() { this._overlay.hidden = true; }
  _showError(msg) {
    this._overlay.hidden = false;
    this._overlay.querySelector('.overlay-card').innerHTML = `
      <div class="error-icon">oh no!</div>
      <h3>Could not load PDF</h3>
      <p>${msg}</p>`;
  }
}

customElements.define('p-pdf', PdfInline);