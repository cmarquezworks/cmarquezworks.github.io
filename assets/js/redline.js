// redline.js: measures marked elements on the live page and draws spec annotations.
// The pure helpers are exported for tests; mountRedlines() touches the DOM only when called.

const MINUS = '−';
const PREF_KEY = 'cm-inspect';

const px = (v) => parseFloat(v);
const trim = (n, d = 2) => String(Number(n.toFixed(d)));

export function fmtType(cs) {
  const family = String(cs.fontFamily).split(',')[0].trim().replace(/^["']|["']$/g, '');
  const size = px(cs.fontSize);
  const lh = cs.lineHeight === 'normal' ? 'normal' : trim(px(cs.lineHeight) / size);
  const parts = [family, `${Math.round(size)}/${lh}`];
  const ls = cs.letterSpacing === 'normal' ? 0 : px(cs.letterSpacing);
  const pct = Math.round((ls / size) * 100);
  if (pct !== 0) parts.push(`${pct < 0 ? MINUS : '+'}${Math.abs(pct)}%`);
  return parts.join(' · ');
}

export const fmtGap = (n) => `gap ${Math.round(n)}`;
export const fmtBox = (w, h) => `${Math.round(w)} × ${Math.round(h)}`;

function luminance(hex) {
  const h = hex.replace('#', '');
  const ch = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = ch.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10;
}

export function rgbToHex(value) {
  const m = String(value).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(',').map((s) => parseFloat(s));
  if (a === 0) return null;
  return '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export const fmtContrast = (fg, bg) => `${fg} on ${bg} · ${contrast(fg, bg)}:1`;

export function readPref(storage) {
  try {
    const v = storage && storage.getItem(PREF_KEY);
    return v === null || v === undefined ? true : v !== '0';
  } catch {
    return true;
  }
}

export function writePref(storage, on) {
  try {
    storage && storage.setItem(PREF_KEY, on ? '1' : '0');
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
}

// ---- DOM ----

function el(tag, cls, text) {
  const n = document.createElement(tag);
  n.className = cls;
  if (text) n.textContent = text;
  return n;
}

function labelFor(node) {
  const kind = node.dataset.spec;
  const r = node.getBoundingClientRect();
  let text = '';
  if (kind === 'type') text = fmtType(getComputedStyle(node));
  else if (kind === 'box') text = fmtBox(r.width, r.height);
  else if (kind === 'inset') text = String(Math.round(r.left));
  else if (kind === 'contrast') {
    const fg = rgbToHex(getComputedStyle(node).color);
    let bg = null;
    for (let n = node; n && !bg; n = n.parentElement) bg = rgbToHex(getComputedStyle(n).backgroundColor);
    if (fg) text = fmtContrast(fg, bg || '#FFFFFF');
  }
  const note = node.dataset.specNote;
  return note ? (text ? `${text} · ${note}` : note) : text;
}

export function mountRedlines(root = document.body, { animate = false } = {}) {
  const layer = el('div', 'rl-layer');
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (animate && !reduce) layer.classList.add('rl-animate');

  const nodes = [...root.querySelectorAll('[data-spec]')];
  const marks = new Map(); // node -> [elements in layer]
  let frame = 0;
  let timer = 0;

  function place(tag, x, y, maxX) {
    tag.style.left = `${x}px`;
    tag.style.top = `${y}px`;
    const w = tag.offsetWidth;
    if (x + w > maxX) tag.style.left = `${Math.max(4, maxX - w)}px`;
  }

  function draw() {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    frame = 0;
    timer = 0;
    layer.replaceChildren();
    marks.clear();
    const sx = window.scrollX;
    const sy = window.scrollY;
    const maxX = document.documentElement.clientWidth - 4;
    layer.style.height = '0px'; // measure the page without the layer's own old height
    layer.style.height = `${document.documentElement.scrollHeight}px`;

    for (const node of nodes) {
      const r = node.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      const kind = node.dataset.spec;
      const tone = node.dataset.specTone === 'ink' ? ' rl-ink' : '';
      const group = [];
      const x = r.left + sx;
      const y = r.top + sy;

      if (kind === 'gap') {
        const to = document.querySelector(node.dataset.specTo);
        if (!to) continue;
        const t = to.getBoundingClientRect();
        const gx = x + (parseFloat(node.dataset.specX) || 24);
        const top = r.bottom + sy;
        const h = t.top + sy - top;
        if (h <= 0) continue;
        const line = el('div', 'rl-mark rl-vline');
        Object.assign(line.style, { left: `${gx}px`, top: `${top}px`, height: `${h}px` });
        const tag = el('div', `rl-mark rl-tag${tone}`, fmtGap(h));
        layer.append(line, tag);
        place(tag, gx + 6, top + h / 2 - 9, maxX);
        group.push(line, tag);
      } else if (kind === 'inset') {
        const line = el('div', 'rl-mark rl-hline');
        const ly = y + (parseFloat(node.dataset.specY) || r.height / 2);
        Object.assign(line.style, { left: `${sx}px`, top: `${ly}px`, width: `${r.left}px` });
        const tag = el('div', `rl-mark rl-tag${tone}`, labelFor(node));
        layer.append(line, tag);
        place(tag, sx + Math.max(4, r.left / 2 - 12), ly + 6, maxX);
        group.push(line, tag);
      } else {
        const box = el('div', 'rl-mark rl-box');
        Object.assign(box.style, { left: `${x - 4}px`, top: `${y - 4}px`, width: `${r.width + 8}px`, height: `${r.height + 8}px` });
        const tag = el('div', `rl-mark rl-tag${tone}`, labelFor(node));
        layer.append(box, tag);
        const below = node.dataset.specPos === 'below';
        place(tag, x - 4, below ? y + r.height + 8 : y - 24, maxX);
        group.push(box, tag);
      }

      const always = node.hasAttribute('data-spec-always');
      for (const m of group) m.classList.toggle('is-always', always);
      marks.set(node, group);
    }
  }

  // rAF for smooth redraws; the timer covers tabs where frames are paused.
  const schedule = () => {
    if (frame || timer) return;
    frame = requestAnimationFrame(draw);
    timer = setTimeout(draw, 150);
  };
  const hot = (node, on) => (marks.get(node) || []).forEach((m) => m.classList.toggle('is-hot', on));

  for (const node of nodes) {
    if (node.hasAttribute('data-spec-always')) continue;
    node.addEventListener('pointerenter', () => hot(node, true));
    node.addEventListener('pointerleave', () => hot(node, false));
    node.addEventListener('focusin', () => hot(node, true));
    node.addEventListener('focusout', () => hot(node, false));
  }

  const ro = new ResizeObserver(schedule);
  ro.observe(document.body);
  window.addEventListener('load', schedule);
  // Entrance animations move elements; measure again once each one settles.
  const settle = (e) => { if (!layer.contains(e.target)) schedule(); };
  document.addEventListener('animationend', settle, true);
  // The draw-in plays once; later redraws appear without replaying it.
  if (layer.classList.contains('rl-animate')) setTimeout(() => layer.classList.remove('rl-animate'), 1800);
  if (document.fonts) document.fonts.ready.then(schedule);
  draw();

  return {
    refresh: schedule,
    setOn(on) { layer.hidden = !on; },
    destroy() { ro.disconnect(); document.removeEventListener('animationend', settle, true); layer.remove(); },
  };
}
