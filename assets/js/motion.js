// motion.js: shared easing, interpolation and colour helpers. Pure; nothing touches the DOM on import.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a, b, t) => a + (b - a) * t;

export const easeOutCubic = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const easeInCubic = (x) => Math.pow(clamp(x), 3);
export const easeInOutCubic = (x) => {
  const v = clamp(x);
  return v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2;
};
export const easeInOutQuint = (x) => {
  const v = clamp(x);
  return v < 0.5 ? 16 * v ** 5 : 1 - Math.pow(-2 * v + 2, 5) / 2;
};
export const easeOutBack = (x) => {
  const v = clamp(x);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2);
};

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
export const rgbString = (c) => `rgb(${c.map((v) => Math.round(v)).join(',')})`;

export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

// Brand easing curves for the Web Animations API (custom curves, never the browser defaults).
export const EASE_OUT = 'cubic-bezier(.2,.85,.25,1)';
export const EASE_IN = 'cubic-bezier(.6,0,.8,.3)';
export const EASE_IN_OUT = 'cubic-bezier(.7,0,.2,1)';

// The liquid wave used inside buttons: two periods wide so a -50% slide loops seamlessly.
export const WAVE =
  '<svg viewBox="0 0 600 70" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 10 Q 37.5 0 75 10 T 150 10 T 225 10 T 300 10 T 375 10 T 450 10 T 525 10 T 600 10 V70 H0 Z"/></svg>';
