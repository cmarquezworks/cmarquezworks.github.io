// ruler.js: the one scroll moment outside the hero. The career ruler's bars draw along the
// timeline when it comes into view, so each job's length reads as a length. Everything else is static.
import { prefersReducedMotion } from './motion.js';

export function initRuler(root = document) {
  const rulers = root.querySelectorAll('[data-draw]');
  if (!rulers.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('ruler-anim');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      e.target.classList.add('is-drawn');
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  rulers.forEach((el) => io.observe(el));
}
