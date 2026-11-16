// Fills d="" on every <path data-ellipse="x y w h seed"> with a hand-drawn loop from assets/js/marks.js,
// so the HTML stays readable and the red circles look the same on every visit.
// Run after editing a box: node tools/ink.mjs index.html
import { readFileSync, writeFileSync } from 'node:fs';
import { roughEllipse } from '../assets/js/marks.js';

for (const file of process.argv.slice(2)) {
  let n = 0;
  const html = readFileSync(file, 'utf8').replace(/(data-ellipse="([^"]+)")\s+d="[^"]*"/g, (_, attr, box) => {
    const [x, y, w, h, seed] = box.trim().split(/\s+/).map(Number);
    n++;
    return `${attr} d="${roughEllipse(x, y, w, h, seed)}"`;
  });
  writeFileSync(file, html);
  console.log(`${file}: ${n} loops drawn`);
}
