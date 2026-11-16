// sections.js: each section enters with its own motion, in the site's style.
//   data-split    a heading whose words (glass) or letters (grid) animate in
//   data-stagger  a list or group whose children arrive one after another
//   data-draw     a career ruler whose bars draw themselves
// The style comes from <html data-motion="glass|grid"> or the CSS variable --motion (glass by default).
import { prefersReducedMotion, EASE_OUT } from './motion.js';

// Words and the runs of spaces between them, in order. Pure, so it is unit-tested.
export function tokenize(text) {
  return text.match(/\s+|[^\s]+/g) || [];
}

function split(el, chars) {
  el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.ELEMENT_NODE) { walk(child); continue; }
      if (child.nodeType !== Node.TEXT_NODE) continue;
      const frag = document.createDocumentFragment();
      for (const t of tokenize(child.textContent)) {
        if (/^\s+$/.test(t)) { frag.append(t); continue; }
        const word = document.createElement('span');
        word.className = chars ? 'tokw' : 'tokw tok';
        word.setAttribute('aria-hidden', 'true');
        if (chars) for (const ch of t) { const c = document.createElement('span'); c.className = 'tok'; c.textContent = ch; word.append(c); }
        else word.textContent = t;
        frag.append(word);
      }
      child.replaceWith(frag);
    }
  };
  walk(el);
  return [...el.querySelectorAll('.tok')];
}

export function initSections(root = document) {
  if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  const html = document.documentElement;
  const grid = html.dataset.motion === 'grid' || getComputedStyle(html).getPropertyValue('--motion').trim() === 'grid';
  html.classList.add('sec-anim');
  const plays = new Map();

  root.querySelectorAll('[data-split]').forEach((el) => {
    const toks = split(el, grid);
    plays.set(el, () => {
      const final = getComputedStyle(el).fontStretch || '100%';
      toks.forEach((t, i) => t.animate(grid
        ? [{ fontStretch: '62%', opacity: 0, transform: 'translateY(.22em)' }, { fontStretch: final, opacity: 1, transform: 'none' }]
        : [{ transform: 'translateY(.5em)', opacity: 0, filter: 'blur(10px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }],
      { duration: grid ? 760 : 1000, delay: i * (grid ? 22 : 70), easing: EASE_OUT, fill: 'backwards' }));
    });
  });

  root.querySelectorAll('[data-stagger]').forEach((el) => {
    plays.set(el, () => [...el.children].forEach((c, i) => c.animate(grid
      ? [{ transform: 'translateX(-28px)', opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { transform: 'none', opacity: 1, clipPath: 'inset(0 0 0 0)' }]
      : [{ transform: 'translateY(22px) scale(.985)', opacity: 0, filter: 'blur(6px)' }, { transform: 'none', opacity: 1, filter: 'blur(0)' }],
    { duration: grid ? 640 : 820, delay: i * (grid ? 45 : 70), easing: EASE_OUT, fill: 'backwards' })));
  });

  root.querySelectorAll('[data-draw]').forEach((el) => plays.set(el, () => el.classList.add('is-drawn')));

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      e.target.classList.remove('sec-wait');
      plays.get(e.target)?.();
    }
  }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
  plays.forEach((_, el) => { el.classList.add('sec-wait'); io.observe(el); });
}
