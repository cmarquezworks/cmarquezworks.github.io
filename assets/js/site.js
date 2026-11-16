import { initAutoMachine } from './layout-machine.js';
import { initContact } from './contact.js';
import { initResume } from './resume.js';
import { initLens, initPeek } from './lens.js';
import { initAssemble } from './reveal.js';
import { initSections } from './sections.js';

document.documentElement.classList.add('js');

const hero = document.querySelector('.hero--grid');
if (hero) initAutoMachine(hero);
initContact(); // builds the contact panel, which has its own résumé button…
initResume(); // …so the résumé buttons are enhanced after it exists
initLens();
initPeek();
initAssemble();
initSections();

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
