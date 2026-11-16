// Writes work/<slug>.html from the data below: node tools/cases.mjs
// The pages are plain HTML afterwards; this script only keeps the three in step.
import { writeFileSync } from 'node:fs';

const NOTE = 'I last worked on this in 2024; the live site may have changed since. The screenshot shows my version.';
const MAILTO = 'mailto:designdadstudio@gmail.com?subject=Full-time%20role%3A%20UI%2FUX%20%2B%20frontend';

const cases = [
  {
    slug: 'allcare', name: 'AllCare', no: '01', live: 'https://www.allcare.ph/', liveLabel: 'allcare.ph',
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
      { x: 81, y: 2.5, w: 8, h: 5.5, label: 'secondary action, outlined', cls: 'right' },
      { x: 5, y: 15, w: 19.5, h: 60, label: 'dashboard: one action per card', cls: '' },
      { x: 58, y: 25, w: 31.5, h: 40, label: 'headline → detail → one button', cls: 'right' },
    ],
  },
  {
    slug: 'asklex', name: 'Ask Lex PH Academy', no: '02', live: 'https://asklexph.com/', liveLabel: 'asklexph.com',
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
      { x: 83, y: 1.5, w: 8.5, h: 4.8, label: 'the only filled button', cls: 'right' },
      { x: 5, y: 56, w: 90, h: 15.5, label: 'proof row: figure, label, context', cls: 'above' },
      { x: 5, y: 88.5, w: 90, h: 11, label: 'browse by category or by mentor', cls: 'above' },
    ],
  },
  {
    slug: 'marygrace', name: 'Mary Grace Café', no: '03', live: 'https://www.marygracecafe.com/', liveLabel: 'marygracecafe.com',
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
      { x: 0.4, y: 0.4, w: 99.2, h: 4.4, label: 'delivery offer, always on top', cls: '' },
      { x: 47.3, y: 5.4, w: 5.4, h: 9.4, label: 'logo centred, nav split around it', cls: '' },
      { x: 78.4, y: 7.1, w: 10.6, h: 5.9, label: 'one button: Order Online', cls: 'right' },
    ],
  },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

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
<meta name="theme-color" content="#EEF0F3">
<link rel="canonical" href="https://csmarquez939.github.io/work/${c.slug}.html">
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(c.sum)}">
<meta property="og:image" content="https://csmarquez939.github.io/assets/img/work/${c.slug}-1600.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=JetBrains+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="../assets/css/site.css">
<script type="module" src="../assets/js/site.js"></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

<header class="site-head">
  <div class="wrap">
    <a class="mark" href="../index.html" aria-label="Christian Marquez, home">cm<b>/</b></a>
    <nav class="nav" aria-label="Main">
      <a href="../index.html#work">Work</a>
      <a href="../index.html#about">About</a>
      <a href="../index.html#contact">Contact</a>
    </nav>
    <span class="status"><i aria-hidden="true"></i>Available now</span>
    <a class="resume-btn resume-btn--icon" href="../assets/resume.pdf" download="Christian-Marquez-Resume.pdf" aria-label="Download résumé (PDF)"><span class="rb-label">CV</span><span class="rb-ic" aria-hidden="true">↓</span></a>
    <a class="contact-btn contact-btn--sm" href="${MAILTO}">Work with me <span aria-hidden="true">→</span></a>
  </div>
</header>

<main id="main">
  <section class="cs-head">
    <div class="wrap grid">
      <a class="back link" href="../index.html#work">← All work</a>
      <h1 data-split>${esc(c.name)}</h1>
      <table class="tb">
        <tr><th scope="row">Case</th><td>${c.no} / 03</td></tr>
        <tr><th scope="row">Role</th><td>${esc(c.role)}</td></tr>
        <tr><th scope="row">Stack</th><td>${esc(c.stack)}</td></tr>
        <tr><th scope="row">Until</th><td>2024</td></tr>
        <tr><th scope="row">Live</th><td><a class="link" href="${c.live}" target="_blank" rel="noopener">${c.liveLabel} ↗</a></td></tr>
      </table>
      <p class="sum">${esc(c.sum)}</p>
      <p class="note">${NOTE}</p>
    </div>
  </section>

  <section class="cs-body" aria-label="Case study" data-assemble>
    <div class="wrap grid">
      <figure class="shot lensable" data-zoom="../assets/img/work/${c.slug}-2400.webp" data-a="wipe">
        <picture>
          <source type="image/webp" srcset="../assets/img/work/${c.slug}-800.webp 800w, ../assets/img/work/${c.slug}-1600.webp 1600w, ../assets/img/work/${c.slug}-2400.webp 2400w" sizes="(max-width: 1400px) 92vw, 1320px">
          <img src="../assets/img/work/${c.slug}-1600.jpg" width="1600" height="1066" alt="${esc(c.alt)}">
        </picture>
${c.callouts.map((k, n) => `        <div class="callout ${k.cls}" style="--x:${k.x}%;--y:${k.y}%;--w:${k.w}%;--h:${k.h}%" aria-hidden="true"><span data-n="${n + 1}">${esc(k.label)}</span></div>`).join('\n')}
      </figure>
      <ol class="legend" aria-label="Notes on the screenshot">
${c.callouts.map((k) => `        <li>${esc(k.label)}</li>`).join('\n')}
      </ol>

      <h2 class="label">The brief</h2>
      <p class="text">${esc(c.brief)}</p>

      <h2 class="label">What I did</h2>
      <ol class="keys" data-stagger>
${c.did.map((d) => `        <li><span>${esc(d)}</span></li>`).join('\n')}
      </ol>

      <h2 class="label">What shipped</h2>
      <p class="text">${esc(c.shipped)} <a class="link" href="${c.live}" target="_blank" rel="noopener">See it live ↗</a></p>
    </div>
  </section>

  <section class="cs-cta" aria-labelledby="cta-h">
    <div class="wrap">
      <h2 id="cta-h" data-split>Like this work? <em>Let's talk.</em></h2>
      <div class="contact-actions">
        <a class="contact-btn contact-btn--xl" href="${MAILTO}">Work with me <span aria-hidden="true">→</span></a>
        <a class="resume-btn resume-btn--xl" href="../assets/resume.pdf" download="Christian-Marquez-Resume.pdf"><span class="rb-label">Download résumé</span><span class="rb-ic" aria-hidden="true">↓</span></a>
      </div>
    </div>
  </section>

  <nav class="wrap pager" aria-label="More case studies">
    <a href="${prev.slug}.html"><small>← Previous</small><b>${esc(prev.name)}</b></a>
    <a href="${next.slug}.html"><small>Next →</small><b>${esc(next.name)}</b></a>
  </nav>
</main>

<footer class="site-foot">
  <div class="wrap">
    <span>© 2026 Christian Marquez</span>
    <a class="link" href="mailto:designdadstudio@gmail.com">designdadstudio@gmail.com</a>
    <a class="link" href="https://www.linkedin.com/in/cmarquezworks/" target="_blank" rel="noopener">LinkedIn ↗</a>
    <span>This page: <span data-weight>measuring…</span></span>
  </div>
</footer>
</body>
</html>
`;
}

cases.forEach((c, i) => writeFileSync(new URL(`../work/${c.slug}.html`, import.meta.url), page(c, i)));
console.log(`wrote ${cases.length} case studies`);
