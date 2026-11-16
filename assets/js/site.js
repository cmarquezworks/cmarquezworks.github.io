import { initPen } from './pen.js';
import { initPrints, initPolaroid, initResume } from './notes.js';
import { initNotepad } from './contact.js';

initPen();
initPrints();
initPolaroid();
initResume();
initNotepad();

// Footer: what this visit actually downloaded.
addEventListener('load', () => setTimeout(() => {
  const out = document.querySelector('[data-weight]');
  if (!out) return;
  const size = (e) => e.transferSize || e.encodedBodySize || 0;
  const nav = performance.getEntriesByType('navigation')[0];
  let bytes = nav ? size(nav) : 0;
  for (const r of performance.getEntriesByType('resource')) bytes += size(r);
  out.textContent = bytes ? `${Math.round(bytes / 1024)} KB downloaded` : 'served from cache';
}, 400));
