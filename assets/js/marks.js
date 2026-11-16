// marks.js: the maths behind the pen. Pure functions with no DOM, shared by the browser and
// tools/cases.mjs, which draws the red circles on the case-study screenshots at build time.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const round2 = (v) => Math.round(v * 100) / 100 + 0; // + 0 turns -0 into 0

// How long a stroke of `len` pixels takes at a steady pen speed (px per ms), within limits.
export const drawDuration = (len, speed = 0.9, min = 280, max = 900) => Math.round(clamp(len / speed, min, max));

// How long a handwritten note takes to write, by its length.
export const writeDuration = (text, perChar = 38, min = 320, max = 1100) => Math.round(clamp(String(text).length * perChar, min, max));

export const stagger = (i, step, base = 0) => base + i * step;

// Tilt (degrees) for a print under the cursor at (px, py) in a w × h box: it leans toward the pointer.
export function tiltFor(px, py, w, h, max = 2) {
  const ry = clamp((px / w - 0.5) * 2 * max, -max, max);
  const rx = clamp(-(py / h - 0.5) * 2 * max, -max, max);
  return { rx: round2(rx), ry: round2(ry) };
}

// Small seeded random generator (mulberry32), so a mark looks the same on every visit.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A red-pen loop around the box (x, y, w, h): starts up-left like a hand would, wobbles a little,
// and runs past its start instead of closing neatly.
export function roughEllipse(x, y, w, h, seed = 1) {
  const r = rng(seed);
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rx = (w / 2) * 1.1 + 3;
  const ry = (h / 2) * 1.18 + 3;
  const start = -Math.PI * (0.55 + r() * 0.2);
  const sweep = Math.PI * 2 + 0.35 + r() * 0.25;
  const n = 26;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = start + (sweep * i) / n;
    const k = 1 + (r() - 0.5) * 0.08;
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  const f = (v) => Math.round(v * 10) / 10;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${f(last[0])} ${f(last[1])}`;
}
