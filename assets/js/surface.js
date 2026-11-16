// surface.js: the liquid-glass surfaces. Poster shapes behind frosted panels drift with scroll,
// so the glass visibly refracts moving colour; each panel's highlight follows the cursor.
import { prefersReducedMotion } from './motion.js';

export function initDrift(root = document) {
  const els = [...root.querySelectorAll('[data-drift]')];
  if (!els.length || prefersReducedMotion()) return;
  let raf = 0;
  const run = () => {
    raf = 0;
    const vh = innerHeight;
    for (const el of els) {
      const sec = el.closest('section');
      if (!sec) continue;
      const r = sec.getBoundingClientRect();
      if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) continue; // off screen: skip the work
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.transform = `translate3d(0, ${(p * parseFloat(el.dataset.drift) * vh).toFixed(1)}px, 0)`;
    }
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(run); }, { passive: true });
  addEventListener('resize', run);
  run();
}

export function initGlassPanels(root = document) {
  if (typeof matchMedia !== 'function' || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  root.querySelectorAll('.glass').forEach((p) => p.addEventListener('pointermove', (e) => {
    const r = p.getBoundingClientRect();
    p.style.setProperty('--mx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    p.style.setProperty('--my', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  }));
}
