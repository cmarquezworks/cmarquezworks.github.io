// layout-machine.js: a Swiss poster that recomposes itself on a 12 × 8 grid as you scroll through About.
// Compositions are data; scroll position picks two of them and how far to blend between them.
import { clamp, mix, easeInOutQuint, hexToRgb, rgbString, prefersReducedMotion } from './motion.js';

const INK = '#121317';
const PAP = '#EEF0F3';
const BLUE = '#2B3CFF';
const ORG = '#FF5A1F';

export const ELEMENTS = [
  { kind: 'text', text: 'CHRISTIAN', weight: 900 }, { kind: 'text', text: 'MARQUEZ', weight: 900 },
  { kind: 'text', text: 'UI/UX DESIGNER', weight: 600 }, { kind: 'text', text: 'FRONTEND DEVELOPER', weight: 600 },
  { kind: 'text', text: '9+', weight: 900 }, { kind: 'text', text: '03', weight: 900 },
  { kind: 'shape' }, { kind: 'shape' }, { kind: 'shape' },
  { kind: 'text', text: 'YEARS', weight: 500 }, { kind: 'text', text: 'CLIENT COUNTRIES', weight: 500 },
  { kind: 'text', text: 'SANTA ROSA, LAGUNA — GMT+8', weight: 500 }, { kind: 'text', text: 'AVAILABLE NOW ●', weight: 700 },
  { kind: 'text', text: 'DESIGN + BUILD', weight: 800 },
];

export const NAMES = ['CLASSIC', 'VERTICAL', 'GIANT FIGURES', 'DIAGONAL', 'AXIS', 'BLOCKS'];
export const CAPTIONS = [
  'Christian Marquez: UI/UX designer and frontend developer.',
  '9+ years on both sides of the handoff.',
  'Clients in the Philippines, Canada and Japan.',
  'Design and build, by the same person.',
  'Based in Santa Rosa, Laguna · GMT+8.',
  'Available now for full-time, contract or project work.',
];

// Text: [col, row, fontPx, rotateDeg, widthAxis%, colour]. Shape: [col, row, wCols, hCols, rotateDeg, colour, radius%].
export const LAYOUTS = [
  [[0, 0.55, 96, 0, 100, INK], [0, 2.25, 96, 0, 100, BLUE], [0, 4.35, 15, 0, 100, INK], [0, 4.8, 15, 0, 100, INK], [6.2, 4.2, 100, 0, 80, INK], [9.5, 4.2, 100, 0, 80, INK], [9.3, 0.3, 2.5, 2.5, 0, ORG, 50], [0, 4.05, 12, 0.07, 0, INK, 0], [11.2, 7.25, 0.7, 0.7, 0, ORG, 0], [6.25, 7.35, 11, 0, 100, INK], [9.55, 7.35, 11, 0, 100, INK], [0, 7.35, 11, 0, 100, INK], [0, 6.75, 12, 0, 100, ORG], [11.95, 0.3, 13, 90, 100, INK]],
  [[0.15, 7.95, 100, -90, 64, INK], [1.9, 7.95, 100, -90, 64, BLUE], [4.6, 4.3, 20, 0, 100, INK], [4.6, 4.85, 20, 0, 100, INK], [4.6, 0.1, 190, 0, 62, INK], [8.2, 0.1, 190, 0, 62, ORG], [10.6, 4.2, 1.3, 1.3, 0, ORG, 50], [4.6, 3.75, 7.4, 0.07, 0, INK, 0], [4.6, 5.62, 0.45, 0.45, 0, ORG, 0], [4.65, 3.4, 11, 0, 100, INK], [8.25, 3.4, 11, 0, 100, INK], [4.6, 7.4, 11, 0, 100, INK], [9.3, 7.4, 12, 0, 100, ORG], [4.6, 6.35, 26, 0, 125, INK]],
  [[0.1, 5.6, 40, 0, 125, INK], [0.1, 6.4, 40, 0, 125, BLUE], [6.2, 0.35, 14, 0, 100, INK], [6.2, 0.75, 14, 0, 100, INK], [-0.15, -0.35, 300, 0, 62, ORG], [5.9, 2.4, 300, 0, 62, INK], [10.4, 0.35, 1.3, 1.3, 0, ORG, 50], [0, 5.3, 5.6, 0.05, 0, INK, 0], [11.3, 7.4, 0.5, 0.5, 0, INK, 0], [0.15, 4.85, 11, 0, 100, INK], [5.95, 2, 11, 0, 100, INK], [0.1, 7.45, 11, 0, 100, INK], [6.2, 1.3, 12, 0, 100, ORG], [11.95, 2.4, 13, 90, 100, INK]],
  [[0.3, 2, 104, -10, 92, INK], [1, 3.75, 104, -10, 92, BLUE], [8.1, 5, 14, 0, 100, INK], [8.1, 5.4, 14, 0, 100, INK], [0.3, -0.05, 70, 0, 80, INK], [2.4, -0.05, 70, 0, 80, ORG], [7.7, -0.9, 5.2, 5.2, 0, ORG, 50], [-1, 6.6, 14, 0.35, -10, INK, 0], [10.2, 6, 1.4, 1.4, 45, INK, 0], [0.35, 1.25, 11, 0, 100, INK], [2.45, 1.25, 11, 0, 100, INK], [0.3, 7.45, 11, 0, 100, INK], [8.1, 7.45, 12, 0, 100, ORG], [6.6, 4.1, 24, 0, 125, INK]],
  [[3, 2.5, 62, 0, 125, INK], [3, 3.55, 62, 0, 125, BLUE], [7.2, 5.25, 13, 0, 100, INK], [7.2, 5.65, 13, 0, 100, INK], [3, 5.2, 46, 0, 90, INK], [4.6, 5.2, 46, 0, 90, ORG], [5.5, 0.7, 0.8, 0.8, 0, ORG, 50], [3, 4.85, 6, 0.04, 0, INK, 0], [6.5, 0.7, 0.8, 0.8, 0, INK, 0], [3, 6.2, 10, 0, 100, INK], [4.6, 6.2, 10, 0, 100, INK], [7.2, 6.2, 10, 0, 100, INK], [3, 1.75, 12, 0, 100, ORG], [3, 7.3, 12, 0, 100, INK]],
  [[0.3, 0.4, 58, 0, 100, PAP], [0.3, 1.75, 58, 0, 100, PAP], [0, 4.85, 18, 0, 100, INK], [0, 5.35, 18, 0, 100, INK], [7.6, 0.35, 130, 0, 70, PAP], [7.6, 4.6, 130, 0, 70, INK], [7.25, 0, 4.75, 4.1, 0, INK, 0], [0, 4.5, 7, 0.06, 0, INK, 0], [0, 0, 7, 4.1, 0, BLUE, 0], [10.2, 3.55, 11, 0, 100, PAP], [10.2, 7.45, 11, 0, 100, INK], [0, 7.45, 11, 0, 100, INK], [0, 6.65, 12, 0, 100, ORG], [3.9, 7.45, 11, 0, 100, INK]],
];

// Scroll progress 0..1 → which two compositions and how far between them (hold 30%, move 40%, hold 30%).
export function scrubState(progress, n = LAYOUTS.length) {
  const x = clamp(progress) * (n - 1);
  const i = Math.min(n - 2, Math.floor(x));
  const t = easeInOutQuint(clamp((x - i - 0.3) / 0.4));
  return { i, j: i + 1, t };
}

// Bright orange fails text contrast on paper (2.7:1), so orange *text* uses a darker burnt orange (4.6:1).
const ORG_TEXT = '#C2410C';

export function stateFor(v, def, cw, rh, k) {
  if (def.kind === 'text') return { x: v[0] * cw, y: v[1] * rh, fs: v[2] * k, rot: v[3], wd: v[4], c: hexToRgb(v[5] === ORG ? ORG_TEXT : v[5]), w: 0, h: 0, rad: 0 };
  return { x: v[0] * cw, y: v[1] * rh, w: v[2] * cw, h: v[3] * cw, rot: v[4], c: hexToRgb(v[5]), rad: v[6], fs: 0, wd: 100 };
}

const KEYS = ['x', 'y', 'w', 'h', 'fs', 'rot', 'wd', 'rad'];
export function blend(a, b, t) {
  const o = {};
  for (const key of KEYS) o[key] = mix(a[key], b[key], t);
  o.c = (t < 0.5 ? a.c : b.c).slice(); // swap at the midpoint: an RGB mix of ink and orange is a muddy brown
  return o;
}

export function initLayoutMachine(section) {
  const stage = section.querySelector('.lm-stage');
  if (!stage) return;
  const cap = section.querySelector('.lm-cap');
  const hud = section.querySelector('.lm-hud');
  const reduce = prefersReducedMotion();
  if (reduce) section.classList.add('lm-static');
  const grid = document.createElement('div');
  grid.className = 'lm-grid';
  stage.append(grid);
  const els = ELEMENTS.map((d) => {
    const e = document.createElement('div');
    e.className = d.kind === 'shape' ? 'lm-el lm-shape' : 'lm-el';
    if (d.kind === 'text') { e.textContent = d.text; e.style.fontWeight = String(d.weight); }
    stage.append(e);
    return e;
  });
  const ol = document.createElement('div');
  ol.className = 'lm-ol';
  ol.innerHTML = '<span></span>';
  stage.append(ol);

  let cw = 1;
  let rh = 1;
  let k = 1;
  let targets = [];
  let current = 0;
  let lastKey = '';
  let raf = 0;

  function measure() {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    cw = W / 12;
    rh = H / 8;
    k = W / 636;
    targets = LAYOUTS.map((L) => L.map((v, i) => stateFor(v, ELEMENTS[i], cw, rh, k)));
    grid.textContent = '';
    for (let i = 1; i < 12; i++) { const l = document.createElement('i'); l.style.left = `${(i * cw).toFixed(1)}px`; grid.append(l); }
    for (let j = 1; j < 8; j++) { const l = document.createElement('b'); l.style.top = `${(j * rh).toFixed(1)}px`; grid.append(l); }
    lastKey = '';
  }

  function apply(n, s) {
    const e = els[n];
    const col = rgbString(s.c);
    if (ELEMENTS[n].kind === 'text') {
      e.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(2)}deg)`;
      e.style.fontSize = `${s.fs.toFixed(1)}px`;
      e.style.fontStretch = `${s.wd.toFixed(1)}%`;
      e.style.color = col;
    } else {
      // shapes are a 100 × 100 box scaled with transforms (no layout work)
      e.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(2)}deg) scale(${(s.w / 100).toFixed(4)}, ${(s.h / 100).toFixed(4)})`;
      e.style.background = col;
      e.style.borderRadius = `${s.rad.toFixed(1)}%`;
    }
  }

  function render() {
    raf = 0;
    const r = section.getBoundingClientRect();
    const total = section.offsetHeight - innerHeight;
    const p = reduce ? 0 : clamp(-r.top / Math.max(1, total));
    const { i, j, t } = scrubState(p);
    const key = `${i}:${t.toFixed(4)}`;
    if (key === lastKey) return;
    lastKey = key;
    for (let n = 0; n < els.length; n++) apply(n, blend(targets[i][n], targets[j][n], t));
    grid.style.opacity = (Math.sin(t * Math.PI) * 0.45).toFixed(3);
    const near = t < 0.5 ? i : j;
    if (near !== current || !cap.textContent) {
      current = near;
      cap.textContent = CAPTIONS[near];
      if (hud) hud.textContent = `Composition ${String(near + 1).padStart(2, '0')} / 06 · ${NAMES[near]}`;
    }
  }
  const request = () => { if (!raf) raf = requestAnimationFrame(render); };

  measure();
  render();
  if (!reduce) addEventListener('scroll', () => { request(); ol.style.display = 'none'; }, { passive: true });
  new ResizeObserver(() => { measure(); request(); }).observe(stage);

  const canHover = matchMedia('(hover: hover)').matches;
  els.forEach((e, n) => {
    e.addEventListener('pointerenter', () => {
      if (!canHover) return;
      const v = LAYOUTS[current][n];
      const r = e.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      Object.assign(ol.style, { display: 'block', left: `${r.left - sr.left - 3}px`, top: `${r.top - sr.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` });
      ol.firstChild.textContent = ELEMENTS[n].kind === 'text'
        ? `C${v[0]} R${v[1]} · ${Math.round(v[2] * k)}PX · WDTH ${v[4]}`
        : `C${v[0]} R${v[1]} · ${Math.round(v[2] * cw)}×${Math.round(v[3] * cw)}`;
    });
    e.addEventListener('pointerleave', () => { ol.style.display = 'none'; });
  });
}

// ---------- auto mode: the hero recomposes itself every few seconds ----------
export const AUTO = { dur: 1150, stagger: 28, hold: 2600 };
// Progress (0..1, eased) of element i, `elapsed` ms after a recompose starts.
export const staggerT = (elapsed, i) => easeInOutQuint(clamp((elapsed - i * AUTO.stagger) / AUTO.dur));

export function initAutoMachine(section) {
  const stage = section.querySelector('.lm-stage');
  if (!stage) return;
  const hud = section.querySelector('.lm-hud');
  const pauseB = section.querySelector('.hero-pause');
  const reduce = prefersReducedMotion();
  const grid = document.createElement('div');
  grid.className = 'lm-grid';
  stage.append(grid);
  const els = ELEMENTS.map((d) => {
    const e = document.createElement('div');
    e.className = d.kind === 'shape' ? 'lm-el lm-shape' : 'lm-el';
    if (d.kind === 'text') { e.textContent = d.text; e.style.fontWeight = String(d.weight); }
    stage.append(e);
    return e;
  });
  const ol = document.createElement('div');
  ol.className = 'lm-ol';
  ol.innerHTML = '<span></span>';
  stage.append(ol);

  let cw = 1;
  let rh = 1;
  let k = 1;
  let targets = [];
  let cur = [];
  let fromStates = [];
  let to = 0;
  let t0 = 0;
  let moving = false;
  let paused = reduce;
  let vis = true;
  let raf = 0;
  let hold = 0;

  const apply = (n, s) => {
    const e = els[n];
    const col = rgbString(s.c);
    if (ELEMENTS[n].kind === 'text') {
      e.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(2)}deg)`;
      e.style.fontSize = `${s.fs.toFixed(1)}px`;
      e.style.fontStretch = `${s.wd.toFixed(1)}%`;
      e.style.color = col;
    } else {
      e.style.transform = `translate(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px) rotate(${s.rot.toFixed(2)}deg) scale(${(s.w / 100).toFixed(4)}, ${(s.h / 100).toFixed(4)})`;
      e.style.background = col;
      e.style.borderRadius = `${s.rad.toFixed(1)}%`;
    }
  };
  const measure = () => {
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    cw = W / 12;
    rh = H / 8;
    k = W / 636;
    targets = LAYOUTS.map((L) => L.map((v, i) => stateFor(v, ELEMENTS[i], cw, rh, k)));
    grid.textContent = '';
    for (let i = 1; i < 12; i++) { const l = document.createElement('i'); l.style.left = `${(i * cw).toFixed(1)}px`; grid.append(l); }
    for (let j = 1; j < 8; j++) { const l = document.createElement('b'); l.style.top = `${(j * rh).toFixed(1)}px`; grid.append(l); }
  };
  const label = () => { if (hud) hud.textContent = `Composition ${String(to + 1).padStart(2, '0')} / 06 · ${NAMES[to]}`; };

  function draw(now) {
    raf = 0;
    const el = now - t0;
    let done = true;
    for (let n = 0; n < els.length; n++) {
      const t = staggerT(el, n);
      if (t < 1) done = false;
      cur[n] = blend(fromStates[n], targets[to][n], t);
      apply(n, cur[n]);
    }
    grid.style.opacity = (Math.sin(clamp(el / (AUTO.dur + AUTO.stagger * els.length)) * Math.PI) * 0.45).toFixed(3);
    if (!done) raf = requestAnimationFrame(draw);
    else { moving = false; grid.style.opacity = '0'; schedule(); }
  }
  function go(n) {
    clearTimeout(hold);
    fromStates = cur.map((s) => ({ ...s, c: s.c.slice() }));
    to = n;
    label();
    ol.style.display = 'none';
    if (reduce) { cur = targets[to].map((s) => ({ ...s, c: s.c.slice() })); cur.forEach((s, i) => apply(i, s)); return; }
    t0 = performance.now();
    moving = true;
    if (!raf) raf = requestAnimationFrame(draw);
  }
  function schedule() {
    clearTimeout(hold);
    if (paused || !vis || moving) return;
    hold = setTimeout(() => go((to + 1) % LAYOUTS.length), AUTO.hold);
  }

  measure();
  cur = targets[0].map((s) => ({ ...s, c: s.c.slice() }));
  cur.forEach((s, i) => apply(i, s));
  label();
  stage.addEventListener('click', () => go((to + 1) % LAYOUTS.length));
  if (pauseB) {
    const sync = () => { pauseB.setAttribute('aria-pressed', String(paused)); pauseB.querySelector('.hp-l').textContent = paused ? 'Play layout' : 'Pause layout'; };
    sync();
    pauseB.addEventListener('click', () => { paused = !paused; sync(); schedule(); });
  }
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; schedule(); }).observe(stage);
  new ResizeObserver(() => { measure(); if (!moving) { cur = targets[to].map((s) => ({ ...s, c: s.c.slice() })); cur.forEach((s, i) => apply(i, s)); } }).observe(stage);

  const canHover = matchMedia('(hover: hover)').matches;
  els.forEach((e, n) => {
    e.addEventListener('pointerenter', () => {
      if (!canHover || moving) return;
      const v = LAYOUTS[to][n];
      const r = e.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      Object.assign(ol.style, { display: 'block', left: `${r.left - sr.left - 3}px`, top: `${r.top - sr.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` });
      ol.firstChild.textContent = ELEMENTS[n].kind === 'text'
        ? `C${v[0]} R${v[1]} · ${Math.round(v[2] * k)}PX · WDTH ${v[4]}`
        : `C${v[0]} R${v[1]} · ${Math.round(v[2] * cw)}×${Math.round(v[3] * cw)}`;
    });
    e.addEventListener('pointerleave', () => { ol.style.display = 'none'; });
  });
  schedule();
}
