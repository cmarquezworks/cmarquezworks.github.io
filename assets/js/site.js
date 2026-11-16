import { mountRedlines, readPref, writePref } from './redline.js';

const body = document.body;
const touch = matchMedia('(hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let store;
try { store = window.localStorage; } catch { store = undefined; }

// Redlines and the Inspect toggle
const rl = mountRedlines(document.querySelector('main') || body, { animate: !!document.querySelector('[data-enter]') });
const btn = document.querySelector('.inspect');
let on = readPref(store);

function apply(next) {
  on = next;
  body.classList.toggle('inspect-off', !on);
  body.classList.toggle('inspect-all', on && touch);
  if (btn) {
    btn.setAttribute('aria-pressed', String(on));
    const state = btn.querySelector('.state');
    if (state) state.textContent = on ? 'on' : 'off';
  }
  rl.setOn(on);
  rl.refresh();
}

function flip() {
  apply(!on);
  writePref(store, on);
}

apply(on);
btn?.addEventListener('click', flip);
addEventListener('keydown', (e) => {
  if (e.key !== 'i' && e.key !== 'I') return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
  flip();
});

// Shipped list: a preview that follows the cursor (pointer devices only)
const peek = document.querySelector('.peek');
if (peek && !touch && !reduce) {
  const img = peek.querySelector('img');
  let x = 0;
  let y = 0;
  let raf = 0;
  const move = () => {
    raf = 0;
    const w = peek.offsetWidth;
    const h = peek.offsetHeight;
    let px = x + 28;
    if (px + w > innerWidth - 12) px = x - w - 28;
    const py = Math.max(12, Math.min(innerHeight - h - 12, y - h / 2));
    peek.style.transform = `translate(${px}px, ${py}px)`;
  };
  for (const row of document.querySelectorAll('.parts tbody tr[data-img]')) {
    row.addEventListener('pointerenter', () => {
      img.src = row.dataset.img;
      peek.classList.add('on');
    });
    row.addEventListener('pointerleave', () => peek.classList.remove('on'));
  }
  addEventListener('pointermove', (e) => {
    x = e.clientX;
    y = e.clientY;
    if (!raf) raf = requestAnimationFrame(move);
  }, { passive: true });
}

// Footer: what this visit actually downloaded
addEventListener('load', () => setTimeout(() => {
  const out = document.querySelector('[data-weight]');
  if (!out) return;
  const size = (e) => e.transferSize || e.encodedBodySize || 0;
  const nav = performance.getEntriesByType('navigation')[0];
  let bytes = nav ? size(nav) : 0;
  for (const r of performance.getEntriesByType('resource')) bytes += size(r);
  out.textContent = bytes ? `${Math.round(bytes / 1024)} KB downloaded` : 'served from cache';
}, 400));
