// pen.js: the pen. Each [data-pen] group tapes down its prints, then draws its marks and writes its
// notes in the order they appear in the HTML: the hero on load (data-pen="load"), the rest the first
// time they scroll into view. Without this script, or with reduced motion, everything is already drawn.
import { drawDuration, writeDuration, stagger } from './marks.js';

const own = (group, el) => el.closest('[data-pen]') === group;

function lengthOf(path) {
  const svg = path.ownerSVGElement;
  const vb = svg && svg.viewBox && svg.viewBox.baseVal;
  const scale = vb && vb.width ? svg.getBoundingClientRect().width / vb.width : 1;
  try { return path.getTotalLength() * scale; } catch { return 300; }
}

// Give every part of a group its start (--delay) and length of time (--d).
export function plan(group) {
  const prints = [...group.querySelectorAll('[data-print]')].filter((el) => own(group, el));
  prints.forEach((p, i) => {
    const at = stagger(i, 140);
    p.style.setProperty('--delay', `${at}ms`);
    p.querySelectorAll('.tape').forEach((t, j) => t.style.setProperty('--delay', `${at + 380 + j * 90}ms`));
  });
  const inkStart = prints.length ? 560 + (prints.length - 1) * 140 : 0;
  const ink = [...group.querySelectorAll('.mark, .hand')].filter((el) => own(group, el) && !el.classList.contains('pop'));
  const step = Number(group.dataset.step) || 230; // busy groups (the timeline) can write faster
  ink.forEach((el, i) => {
    const d = el.classList.contains('mark') ? drawDuration(lengthOf(el)) : writeDuration(el.textContent);
    el.style.setProperty('--delay', `${stagger(i, step, inkStart)}ms`);
    el.style.setProperty('--d', `${d}ms`);
  });
}

export function initPen(root = document) {
  const html = document.documentElement;
  html.classList.add('pen-live');
  if (!html.classList.contains('pen-ready')) return;
  const groups = [...root.querySelectorAll('[data-pen]')];
  const play = (g) => {
    if (g.classList.contains('is-drawn')) return;
    plan(g);
    requestAnimationFrame(() => g.classList.add('is-drawn'));
  };
  const fonts = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]) : Promise.resolve();
  fonts.then(() => groups.filter((g) => g.dataset.pen === 'load').forEach(play));
  const rest = groups.filter((g) => g.dataset.pen !== 'load');
  if (!('IntersectionObserver' in window)) { rest.forEach(play); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      fonts.then(() => play(e.target));
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
  rest.forEach((g) => io.observe(g));
}
