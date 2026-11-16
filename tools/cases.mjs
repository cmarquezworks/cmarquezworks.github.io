// Writes work/<slug>.html from the data below: node tools/cases.mjs
// The pages are plain HTML afterwards; this script keeps the three in step and draws the red-pen
// loops at each callout with the same maths the home page uses (assets/js/marks.js).
import { writeFileSync } from 'node:fs';
import { roughEllipse } from '../assets/js/marks.js';
import { mailtoFor } from '../assets/js/contact.js';

const MARGIN = 'last worked on this in 2024: the live site may have changed since';
const MAILTO = mailtoFor(0).replace(/&/g, '&amp;');
const PEN_FLAG = `<script>(function (d) { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; d.classList.add('pen-ready'); setTimeout(function () { if (!d.classList.contains('pen-live')) d.classList.remove('pen-ready'); }, 3000); })(document.documentElement);</script>`;

const cases = [
  {
    slug: 'allcare', name: 'AllCare', live: 'https://www.allcare.ph/', liveLabel: 'allcare.ph',
    role: 'Lead: redesign + frontend', stack: 'Ruby on Rails',
    alt: 'AllCare home page: a woman at a laptop beside the MyBenefits app on a phone',
    sum: 'AllCare bundles worker benefits (HMO, life insurance, teleconsultation, dental care and more) into one membership. I led the redesign of the public site and the whole logged-in side, then built both inside the Rails app.',
    brief: 'Make a benefits platform easy to understand and easy to use: public pages that tell people what they get, and a logged-in area where members find each benefit and act on it.',
    did: [
      'Redesigned the public landing pages around one headline, a plain list of what is covered, and one primary button.',
      'Designed the logged-in side, the MyBenefits dashboard: each benefit is a card with a single action, such as requesting a letter of guarantee.',
      'Built the screens inside the Ruby on Rails app, responsive from phone to desktop.',
      'Tightened usability and layout across the platform, from the landing pages to the account screens.',
    ],
    shipped: 'The redesigned public site and the member dashboard, live in the Rails app.',
    callouts: [
      { x: 81, y: 2.5, w: 8, h: 5.5, label: 'secondary action, outlined' },
      { x: 5, y: 15, w: 19.5, h: 60, label: 'dashboard: one action per card' },
      { x: 58, y: 25, w: 31.5, h: 40, label: 'headline → detail → one button' },
    ],
  },
  {
    slug: 'asklex', name: 'Ask Lex PH Academy', live: 'https://asklexph.com/', liveLabel: 'asklexph.com',
    role: 'Lead UI/UX, frontend support', stack: 'Ruby on Rails',
    alt: 'Ask Lex PH Academy home page with a green hero, a row of figures and course categories',
    sum: 'Ask Lex PH Academy runs courses, mentoring and events for students and professionals. I led the UI/UX design of the platform and supported its frontend build in Ruby on Rails.',
    brief: 'Give a growing catalogue of courses a clear shape, so a visitor can browse by topic or by mentor and register without hunting for the button.',
    did: [
      'Led the interface design of the platform, with clarity and ease of use as the test for every screen.',
      'Set the catalogue up to be browsed two ways, by category or by mentor, as two tabs.',
      'Kept one filled button in the header, Register, so the main action is never in doubt.',
      'Supported the frontend build inside the Rails app.',
    ],
    shipped: 'The platform design and the public pages, live in the Rails app.',
    callouts: [
      { x: 83, y: 1.5, w: 8.5, h: 4.8, label: 'the only filled button' },
      { x: 5, y: 56, w: 90, h: 15.5, label: 'proof row: figure, label, context' },
      { x: 5, y: 88.5, w: 90, h: 11, label: 'browse by category or by mentor' },
    ],
  },
  {
    slug: 'marygrace', name: 'Mary Grace Café', live: 'https://www.marygracecafe.com/', liveLabel: 'marygracecafe.com',
    role: 'Frontend developer', stack: 'Ruby on Rails',
    alt: 'Mary Grace Café home page: the lit shopfront at night with a script welcome',
    sum: 'Mary Grace is a well-loved Filipino café and bakery. I built the frontend of its website from the design, inside a Ruby on Rails app, and kept the brand’s warmth on every screen size.',
    brief: 'Turn the approved design into a responsive site that feels like the cafés themselves, with online ordering one tap away.',
    did: [
      'Built the frontend inside the Rails app, responsive from phone to desktop.',
      'Kept the brand’s details intact on every screen: the script lettering, the cream and maroon, the centred logo.',
      'Kept the delivery offer and the Order Online button at the top of the page.',
      'Matched the design closely, so the brand team saw their layout, not an approximation.',
    ],
    shipped: 'The public website, live in the Rails app.',
    callouts: [
      { x: 0.4, y: 0.4, w: 99.2, h: 4.4, label: 'delivery offer, always on top' },
      { x: 47.3, y: 5.4, w: 5.4, h: 9.4, label: 'logo centred, nav split around it' },
      { x: 78.4, y: 7.1, w: 10.6, h: 5.9, label: 'one button: Order Online' },
    ],
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const W = 1600;
const H = 1066;

// A loop round each callout; a box nearly as wide as the screenshot gets a wavy underline instead.
function inkFor(k, seed) {
  const x = (k.x * W) / 100;
  const y = (k.y * H) / 100;
  const w = (k.w * W) / 100;
  const h = (k.h * H) / 100;
  if (k.w > 92) {
    const b = Math.round(y + h + 10);
    return `M${Math.round(x + 8)} ${b} C ${Math.round(x + w * 0.3)} ${b - 9}, ${Math.round(x + w * 0.65)} ${b + 9}, ${Math.round(x + w - 8)} ${b - 3}`;
  }
  return roughEllipse(x, y, w, h, seed);
}

function page(c, i) {
  const prev = cases[(i + cases.length - 1) % cases.length];
  const next = cases[(i + 1) % cases.length];
  const title = `${c.name} case study · Christian Marquez`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(c.sum)}">
<meta name="theme-color" content="#F6F3EC">
<link rel="canonical" href="https://cmarquezworks.github.io/work/${c.slug}.html">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(c.sum)}">
<meta property="og:image" content="https://cmarquezworks.github.io/assets/img/work/${c.slug}-1600.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@900&family=Caveat:wght@500;700&family=Courier+Prime:wght@400;700&display=swap">
<link rel="stylesheet" href="../assets/css/site.css">
${PEN_FLAG}
<script type="module" src="../assets/js/site.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="head">
  <div class="wrap">
    <a class="logo" href="../index.html" aria-label="Christian Marquez, home">cm/</a>
    <nav aria-label="Main"><a href="../index.html#work">work</a><a href="../index.html#about">about</a><a href="../index.html#contact">contact</a></nav>
  </div>
</header>

<main id="main">
  <article class="cs" aria-labelledby="cs-h">
    <div class="wrap">
      <a class="back" href="../index.html#work">← all work</a>
      <div class="cs-top">
        <div>
          <h1 id="cs-h">${esc(c.name)}</h1>
          <p class="typed">${esc(c.sum)}</p>
        </div>
        <div data-pen="load">
          <dl class="spec"><div><dt>role</dt><dd>${esc(c.role)}</dd></div><div><dt>stack</dt><dd>${esc(c.stack)}</dd></div><div><dt>until</dt><dd>2024</dd></div><div><dt>live</dt><dd><a href="${c.live}" target="_blank" rel="noopener">${c.liveLabel} ↗</a></dd></div></dl>
          <p class="hand cs-margin">${MARGIN}</p>
        </div>
      </div>

      <div class="cs-shot" data-pen>
        <figure class="print print--wide" data-print style="--r: -.6deg">
          <span class="tape"></span><span class="tape tape-r"></span>
          <div class="print-in">
            <span class="shot">
              <picture>
                <source type="image/webp" srcset="../assets/img/work/${c.slug}-800.webp 800w, ../assets/img/work/${c.slug}-1600.webp 1600w, ../assets/img/work/${c.slug}-2400.webp 2400w" sizes="(max-width: 1400px) 92vw, 1240px">
                <img src="../assets/img/work/${c.slug}-1600.jpg" width="1600" height="1066" alt="${esc(c.alt)}">
              </picture>
              <svg class="ink ink-shot" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
${c.callouts.map((k, n) => `                <path class="mark" pathLength="1" d="${inkFor(k, 100 + i * 10 + n)}"/>`).join('\n')}
              </svg>
${c.callouts.map((k, n) => `              <span class="callnum" style="--x: ${k.x}%; --y: ${k.y}%" aria-hidden="true">${n + 1}</span>`).join('\n')}
            </span>
            <span class="cap">${c.liveLabel} · as I left it in 2024</span>
          </div>
        </figure>
        <ol class="legend" aria-label="Notes on the screenshot">
${c.callouts.map((k) => `          <li><span class="hand">${esc(k.label)}</span></li>`).join('\n')}
        </ol>
      </div>

      <div class="cs-body">
        <h2>the brief</h2>
        <p class="typed">${esc(c.brief)}</p>
        <h2>what I did</h2>
        <ul class="checks" data-pen>
${c.did.map((d) => `          <li><svg class="ink" viewBox="0 0 28 28" aria-hidden="true"><path class="mark" pathLength="1" d="M4 15 L 11 22 L 24 5"/></svg><span>${esc(d)}</span></li>`).join('\n')}
        </ul>
        <h2>what shipped</h2>
        <p class="typed">${esc(c.shipped)} <a href="${c.live}" target="_blank" rel="noopener">see it live ↗</a></p>
      </div>

      <div class="cs-cta">
        <a class="sticky" href="${MAILTO}" data-mail style="--r: 2deg">like this work?<small>tell me about your role, contract or project</small><span>→ email me</span></a>
        <ul class="raw">
          <li><a href="../assets/resume.pdf" download="Christian-Marquez-Resume.pdf" data-resume>résumé.pdf</a> <span>(3 pages)</span></li>
          <li><a href="https://www.linkedin.com/in/cmarquezworks/" target="_blank" rel="noopener">linkedin</a></li>
        </ul>
      </div>

      <nav class="pager" aria-label="More case studies">
        <a class="tab" href="${prev.slug}.html"><small>← previous</small><b>${esc(prev.name)}</b></a>
        <a class="tab" href="${next.slug}.html"><small>next →</small><b>${esc(next.name)}</b></a>
      </nav>
    </div>
  </article>
</main>

<footer class="foot">
  <div class="wrap">
    <span>© 2026 Christian Marquez</span>
    <span>HTML, CSS, JS. No frameworks, no template.</span>
    <span>this page: <span data-weight>measuring…</span></span>
    <a href="https://github.com/cmarquezworks/cmarquezworks.github.io" target="_blank" rel="noopener">view the source ↗</a>
  </div>
</footer>
</body>
</html>
`;
}

cases.forEach((c, i) => writeFileSync(new URL(`../work/${c.slug}.html`, import.meta.url), page(c, i)));
console.log(`wrote ${cases.length} case studies`);
