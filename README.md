# Christian Marquez · portfolio

**Live:** https://csmarquez939.github.io/

A hand-coded portfolio that inspects itself. Orange "redlines" mark the page's own fonts, sizes, gaps and colour contrast, measured live from the page, so they change when you resize the window. Press **I** or use the **Inspect** switch to turn them off.

- Plain HTML, CSS and vanilla JavaScript; no framework, no build step.
- `assets/js/redline.js`: the measuring and drawing module (`npm test` runs its unit tests with `node --test`).
- `assets/js/site.js`: the Inspect switch, the cursor preview on the project list, the live page-weight readout.
- `work/*.html`: case studies, generated from `tools/cases.mjs` (`node tools/cases.mjs` after editing the text there).
- `tools/images.sh`: turns screenshots into WebP at 800/1600/2400 px plus a JPG fallback.
- `tools/serve.mjs`: a tiny local server: `node tools/serve.mjs`, then open http://127.0.0.1:4173/.

© 2026 Christian Marquez
