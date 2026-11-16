// notes.js: the notebook's interactions. Each one adds motion on top of HTML that already works:
// links download and mail without it, and reduced motion keeps only the written notes.
import { tiltFor, writeDuration } from './marks.js';

const reduce = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

// Restart the handwriting reveal on an element (CSS .w writes it left to right over --d).
export function rewrite(el) {
  el.style.setProperty('--d', `${writeDuration(el.textContent)}ms`);
  el.classList.remove('w');
  void el.offsetWidth;
  el.classList.add('w');
}

// A short red note beside `anchor` ("copied ✓", "saved ✓ résumé.pdf") that fades after a moment.
export function note(anchor, text, hold = 2400) {
  let n = anchor.nextElementSibling;
  if (!n || !n.classList.contains('pop')) {
    n = document.createElement('span');
    n.className = 'hand pop';
    n.setAttribute('aria-hidden', 'true');
    anchor.after(n);
  }
  clearTimeout(n.hideTimer);
  n.textContent = text;
  n.classList.remove('out');
  rewrite(n);
  n.hideTimer = setTimeout(() => n.classList.add('out'), hold);
}

// Screen readers hear what the notes say.
let live;
export function announce(text) {
  if (!live) {
    live = document.createElement('p');
    live.className = 'sr';
    live.setAttribute('aria-live', 'polite');
    document.body.append(live);
  }
  live.textContent = '';
  setTimeout(() => { live.textContent = text; }, 40);
}

// Prints lean toward the cursor (mouse only). The hero's red circle scribbles itself again on hover.
export function initPrints(root = document) {
  if (reduce() || !finePointer()) return;
  root.querySelectorAll('.print-in').forEach((p) => {
    p.addEventListener('pointermove', (e) => {
      const r = p.getBoundingClientRect();
      const { rx, ry } = tiltFor(e.clientX - r.left, e.clientY - r.top, r.width, r.height, 2);
      p.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    p.addEventListener('pointerleave', () => { p.style.transform = ''; });
  });
  root.querySelectorAll('[data-rescribble]').forEach((zone) => {
    zone.addEventListener('pointerenter', () => {
      if (!zone.closest('.is-drawn')) return;
      zone.querySelectorAll('.ink .mark').forEach((m) => {
        m.style.transition = 'none';
        m.style.strokeDashoffset = '1.02';
        void m.getBoundingClientRect();
        m.style.setProperty('--delay', '0ms');
        m.style.transition = '';
        m.style.strokeDashoffset = '';
      });
    });
  });
}

// Shipped: a taped polaroid of the site follows the cursor over its row (mouse only).
export function initPolaroid(root = document) {
  const pol = root.querySelector('.polaroid');
  const table = root.querySelector('.shipped table');
  if (!pol || !table || !finePointer()) return;
  const img = pol.querySelector('img');
  let x = 0;
  let y = 0;
  let raf = 0;
  const place = () => {
    raf = 0;
    pol.style.transform = `translate(${x + 28}px, ${y - 170}px) rotate(-4deg)`;
  };
  table.addEventListener('pointerenter', () => {
    table.querySelectorAll('tr[data-img]').forEach((row) => { new Image().src = row.dataset.img; });
  }, { once: true });
  table.querySelectorAll('tr[data-img]').forEach((row) => {
    row.addEventListener('pointerenter', () => { img.src = row.dataset.img; pol.classList.add('on'); });
    row.addEventListener('pointerleave', () => pol.classList.remove('on'));
    row.addEventListener('pointermove', (e) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(place);
    });
  });
}

// Résumé: a page tears off the notebook and drops away, then "saved ✓" is written beside the link.
// The download itself starts on the click; nothing waits for the animation.
export function initResume(root = document) {
  root.querySelectorAll('a[data-resume]').forEach((a) => a.addEventListener('click', () => {
    if (!reduce()) {
      const r = a.getBoundingClientRect();
      const t = document.createElement('span');
      t.className = 'torn';
      t.setAttribute('aria-hidden', 'true');
      t.style.left = `${Math.round(r.left + Math.min(r.width, 80) / 2 - 22)}px`;
      t.style.top = `${Math.round(r.top - 36)}px`;
      document.body.append(t);
      t.animate([
        { transform: 'translateY(6px) rotate(0deg)', opacity: 0 },
        { transform: 'translateY(-12px) rotate(-3deg)', opacity: 1, offset: 0.22 },
        { transform: 'translateY(130px) rotate(-18deg)', opacity: 0 },
      ], { duration: 1050, easing: 'cubic-bezier(.45, 0, .75, .35)' }).onfinish = () => t.remove();
    }
    note(a, 'saved ✓ résumé.pdf');
    announce('Downloading the résumé PDF');
  }));
}
