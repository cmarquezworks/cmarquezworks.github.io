// reveal.js: each project composition assembles once as it scrolls into view
// (opacity + small move + blur that sharpens; images wipe in). Nothing hides without IntersectionObserver.
import { prefersReducedMotion, EASE_OUT } from './motion.js';

const FROM = {
  up: 'translateY(28px)',
  left: 'translateX(-40px)',
  right: 'translateX(40px)',
};

export function initAssemble(root = document) {
  const groups = root.querySelectorAll('[data-assemble]');
  if (!groups.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  const play = (g) => {
    g.classList.remove('asm-wait');
    g.querySelectorAll('[data-a]').forEach((el, i) => {
      const kind = el.dataset.a;
      const frames = kind === 'wipe'
        ? [{ clipPath: 'inset(0 100% 0 0)', transform: 'scale(1.04)' }, { clipPath: 'inset(0 0% 0 0)', transform: 'none' }]
        : [{ transform: FROM[kind] || FROM.up, opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }];
      el.animate(frames, { duration: kind === 'wipe' ? 1100 : 760, delay: i * 80, easing: EASE_OUT, fill: 'backwards' });
    });
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      play(e.target);
    }
  }, { threshold: 0.2 });
  groups.forEach((g) => {
    const r = g.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) return; // already on screen: leave it alone
    g.classList.add('asm-wait');
    io.observe(g);
  });
}
