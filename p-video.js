const VI = {
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg>`,
  pause: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  volOn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
  volOff: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  fullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  exitFullscreen: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/></svg>`,
};

const videoTemplate = document.createElement('template');
videoTemplate.innerHTML = `
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    width: 100%;
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
    border: 1px solid #e0e0e0; border-radius: 6px;
    overflow: hidden; background: #000;
  }
  :host(:fullscreen) .root, :host(:-webkit-full-screen) .root {
    border-radius: 0; border: none; height: 100vh;
  }

  .video-area {
    position: relative; flex: 1;
    display: flex; align-items: center; justify-content: center;
    background: #000; cursor: pointer; aspect-ratio: 16 / 9;
  }
  :host(:fullscreen) .video-area, :host(:-webkit-full-screen) .video-area {
    aspect-ratio: unset; flex: 1;
  }

  video {
    width: 100%; height: 100%;
    object-fit: contain; display: block;
  }

  .toolbar {
    display: flex; align-items: center; height: 44px; padding: 0 8px;
    background: #f8f9fa; border-top: 1px solid #e0e0e0;
    flex-shrink: 0; gap: 4px; user-select: none;
  }

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

  .time-display {
    font-size: 12px; color: #5f6368; white-space: nowrap;
    padding: 0 4px; flex-shrink: 0;
    font-variant-numeric: tabular-nums; letter-spacing: 0.01em;
  }

  .scrubber-wrap { flex: 1; display: flex; align-items: center; padding: 0 4px; }
  .scrubber {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 4px; border-radius: 2px;
    outline: none; cursor: pointer;
    background: linear-gradient(to right, var(--accent) var(--p, 0%), #dadce0 var(--p, 0%));
    transition: height 0.12s;
  }
  .scrubber:hover { height: 6px; }
  .scrubber::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 13px; height: 13px; border-radius: 50%;
    background: var(--accent); cursor: pointer;
    transition: transform 0.1s;
  }
  .scrubber:hover::-webkit-slider-thumb { transform: scale(1.25); }
  .scrubber::-moz-range-thumb {
    width: 13px; height: 13px; border-radius: 50%;
    background: var(--accent); border: none; cursor: pointer;
  }

  .tb-divider { width: 1px; height: 20px; background: #dadce0; margin: 0 2px; flex-shrink: 0; }
</style>

<div class="root">
  <div class="video-area">
    <video preload="metadata"></video>
  </div>
  <div class="toolbar">
    <button class="btn btn-play" title="Play / Pause (Space)">${VI.play}</button>
    <span class="time-display">0:00 / 0:00</span>
    <div class="scrubber-wrap">
      <input class="scrubber" type="range" min="0" max="1000" value="0" step="1">
    </div>
    <div class="tb-divider"></div>
    <button class="btn btn-vol" title="Mute / Unmute (m)">${VI.volOn}</button>
    <button class="btn btn-full" title="Fullscreen (f)">${VI.fullscreen}</button>
  </div>
</div>
`;

function fmtTime(secs) {
  if (!isFinite(secs) || isNaN(secs)) return '0:00';
  secs = Math.floor(secs);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

class VideoInline extends HTMLElement {
  static get observedAttributes() { return ['src', 'poster']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(videoTemplate.content.cloneNode(true));

    const sr = this.shadowRoot;
    this._video     = sr.querySelector('video');
    this._btnPlay   = sr.querySelector('.btn-play');
    this._btnVol    = sr.querySelector('.btn-vol');
    this._btnFull   = sr.querySelector('.btn-full');
    this._scrubber  = sr.querySelector('.scrubber');
    this._timeDisp  = sr.querySelector('.time-display');
    this._videoArea = sr.querySelector('.video-area');

    this._dragging = false;
    this._onFSChange = () => this._updateFSBtn();
  }

  connectedCallback() {
    this.tabIndex = 0;
    this._bindEvents();
    this._sync();
  }

  disconnectedCallback() {
    document.removeEventListener('fullscreenchange', this._onFSChange);
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal && this.isConnected) this._sync();
  }

  _sync() {
    const src    = this.getAttribute('src')    || '';
    const poster = this.getAttribute('poster') || '';
    if (src    !== this._video.src)    this._video.src    = src;
    if (poster !== this._video.poster) this._video.poster = poster;
  }

  _bindEvents() {
    const v = this._video;

    this._btnPlay.addEventListener('click', () => this._togglePlay());
    this._videoArea.addEventListener('click', e => {
      if (e.target === this._videoArea || e.target === v) this._togglePlay();
    });

    this._btnVol.addEventListener('click', () => {
      v.muted = !v.muted;
      this._updateVolBtn();
    });

    this._btnFull.addEventListener('click', () => this._toggleFullscreen());
    document.addEventListener('fullscreenchange', this._onFSChange);

    v.addEventListener('play',       () => this._updatePlayBtn());
    v.addEventListener('pause',      () => this._updatePlayBtn());
    v.addEventListener('ended',      () => this._updatePlayBtn());
    v.addEventListener('timeupdate', () => { if (!this._dragging) this._updateProgress(); });
    v.addEventListener('loadedmetadata', () => this._updateProgress());
    v.addEventListener('volumechange', () => this._updateVolBtn());

    this._scrubber.addEventListener('mousedown', () => { this._dragging = true; });
    this._scrubber.addEventListener('input', () => {
      const t = (this._scrubber.value / 1000) * (v.duration || 0);
      v.currentTime = t;
      this._updateProgress();
    });
    this._scrubber.addEventListener('change', () => { this._dragging = false; });

    this.addEventListener('keydown', e => this._onKey(e));
  }

  _togglePlay() {
    const v = this._video;
    if (v.paused || v.ended) v.play(); else v.pause();
  }

  _updatePlayBtn() {
    const paused = this._video.paused || this._video.ended;
    this._btnPlay.innerHTML = paused ? VI.play : VI.pause;
    this._btnPlay.title = paused ? 'Play (Space)' : 'Pause (Space)';
  }

  _updateVolBtn() {
    const muted = this._video.muted || this._video.volume === 0;
    this._btnVol.innerHTML = muted ? VI.volOff : VI.volOn;
    this._btnVol.title = muted ? 'Unmute (m)' : 'Mute (m)';
  }

  _updateProgress() {
    const v = this._video;
    const cur = v.currentTime || 0;
    const dur = v.duration || 0;
    const pct = dur > 0 ? (cur / dur) * 100 : 0;

    this._scrubber.value = Math.round((cur / (dur || 1)) * 1000);
    this._scrubber.style.setProperty('--p', pct.toFixed(2) + '%');
    this._timeDisp.textContent = `${fmtTime(cur)} / ${fmtTime(dur)}`;
  }

  _onKey(e) {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl) return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); this._togglePlay(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); this._video.currentTime = Math.min(this._video.currentTime + 5, this._video.duration || 0); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); this._video.currentTime = Math.max(this._video.currentTime - 5, 0); }
    if (e.key === 'm') { this._video.muted = !this._video.muted; }
    if (e.key === 'f') { this._toggleFullscreen(); }
    if (e.key === 'Escape' && document.fullscreenElement === this) document.exitFullscreen();
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.requestFullscreen().catch(err => console.warn('p-video fullscreen:', err));
    } else {
      document.exitFullscreen();
    }
  }

  _updateFSBtn() {
    const isFS = document.fullscreenElement === this;
    this._btnFull.innerHTML = isFS ? VI.exitFullscreen : VI.fullscreen;
    this._btnFull.title = isFS ? 'Exit fullscreen (Esc)' : 'Fullscreen (f)';
  }
}

customElements.define('p-video', VideoInline);
