// lens.js: a glass magnifier over project screenshots, and a glass-bead preview for the shipped list.
import { prefersReducedMotion } from './motion.js';

// Background size and offset that keep the magnified point (x, y) centred in a lens of radius r.
export function lensBackground(x, y, w, h, z, r) {
  return { size: [w * z, h * z], pos: [-(x * z - r), -(y * z - r)] };
}

const finePointer = () => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

export function initLens(root = document) {
  if (!finePointer()) return;
  const R = 90;
  const Z = 2.2;
  root.querySelectorAll('figure.lensable[data-zoom]').forEach((fig) => {
    const lens = document.createElement('span');
    lens.className = 'lens';
    lens.setAttribute('aria-hidden', 'true');
    fig.append(lens);
    let loaded = false;
    fig.addEventListener('pointerenter', () => {
      if (!loaded) { lens.style.backgroundImage = `url("${fig.dataset.zoom}")`; loaded = true; }
      fig.classList.add('lens-on');
    });
    fig.addEventListener('pointerleave', () => fig.classList.remove('lens-on'));
    fig.addEventListener('pointermove', (e) => {
      const r = fig.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const b = lensBackground(x, y, r.width, r.height, Z, R);
      lens.style.transform = `translate(${(x - R).toFixed(1)}px, ${(y - R).toFixed(1)}px)`;
      lens.style.backgroundSize = `${b.size[0]}px ${b.size[1]}px`;
      lens.style.backgroundPosition = `${b.pos[0]}px ${b.pos[1]}px`;
    });
  });
}

export function initPeek(root = document) {
  const peek = root.querySelector('.peek');
  if (!peek || !finePointer() || prefersReducedMotion()) return;
  const img = peek.querySelector('img');
  let x = 0;
  let y = 0;
  let px = 0;
  let py = 0;
  let raf = 0;
  let on = false;
  const tick = () => {
    px += (x - px) * 0.18; // a little lag reads as weight
    py += (y - py) * 0.18;
    const w = peek.offsetWidth;
    let left = px + 32;
    if (left + w > innerWidth - 12) left = px - w - 32;
    const top = Math.max(12, Math.min(innerHeight - w - 12, py - w / 2));
    peek.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
    raf = on || Math.abs(x - px) + Math.abs(y - py) > 0.5 ? requestAnimationFrame(tick) : 0;
  };
  root.querySelectorAll('.parts tbody tr[data-img]').forEach((row) => {
    row.addEventListener('pointerenter', (e) => {
      img.src = row.dataset.img;
      if (!on) { px = e.clientX; py = e.clientY; }
      on = true;
      peek.classList.add('on');
      if (!raf) raf = requestAnimationFrame(tick);
    });
    row.addEventListener('pointerleave', () => { on = false; peek.classList.remove('on'); });
  });
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
}
