// contact.js: "column shutter, then recompose". Every a.contact-btn is a real mailto: link (works with JS off);
// with JS it opens a full-screen panel that builds itself out of the button that was pressed.
import { prefersReducedMotion, EASE_OUT, EASE_IN, EASE_IN_OUT, WAVE } from './motion.js';

export const EMAIL = 'designdadstudio@gmail.com';
export const MODES = [
  { label: 'Full-time role', head: ['HIRE ME', 'FULL-TIME.'], subject: 'Full-time role: UI/UX + frontend',
    body: 'Hi Christian,\n\nWe have a full-time role and would like to talk.\n\nRole:\nTeam:\nLink:\n' },
  { label: 'Contract', head: ['BOOK A', 'CONTRACT.'], subject: 'Contract work: UI/UX + frontend',
    body: 'Hi Christian,\n\nWe have contract work and would like to talk.\n\nScope:\nTimeline:\nBudget:\n' },
  { label: 'Project', head: ['START A', 'PROJECT.'], subject: 'Project inquiry: UI/UX + frontend',
    body: 'Hi Christian,\n\nWe have a project and would like your help.\n\nWhat:\nTimeline:\nBudget:\n' },
];

export function mailtoFor(i) {
  const m = MODES[i] ?? MODES[0];
  return `mailto:${EMAIL}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.body)}`;
}

// Radius that lets a circle centred at (cx, cy) cover a w × h box.
export const irisRadius = (cx, cy, w, h) => Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 4;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    Object.assign(ta.style, { position: 'fixed', opacity: '0', top: '0', left: '0' });
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

export function initContact(root = document) {
  const triggers = [...root.querySelectorAll('a.contact-btn:not([data-plain])')];
  if (!triggers.length) return;
  const reduce = prefersReducedMotion();
  const cvHref = document.querySelector('a.resume-btn')?.getAttribute('href') || 'assets/resume.pdf';

  const dlg = document.createElement('div');
  dlg.className = 'ct';
  dlg.hidden = true;
  dlg.setAttribute('role', 'dialog');
  dlg.setAttribute('aria-modal', 'true');
  dlg.setAttribute('aria-labelledby', 'ct-h');
  dlg.innerHTML = `
    <div class="ct-iris"></div><div class="ct-rim" aria-hidden="true"></div>
    <div class="ct-body">
      <button class="ct-x" type="button" aria-label="Close">✕</button>
      <p class="ct-kick mono"><i aria-hidden="true"></i>Available now · Santa Rosa, PH · GMT+8</p>
      <h2 class="ct-big" id="ct-h"></h2>
      <div class="ct-modes" role="radiogroup" aria-label="Type of work">${MODES.map((m, i) => `<button type="button" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${m.label}</button>`).join('')}</div>
      <p class="ct-mail" aria-label="${EMAIL}"></p>
      <div class="ct-acts">
        <button class="ct-copy" type="button"><span class="rb-fill"><span class="rb-lq">${WAVE}</span></span><span class="ct-cl">Copy email</span></button>
        <a class="ct-send" href="${mailtoFor(0)}">Open email ↗</a>
        <a class="resume-btn resume-btn--ghost" href="${cvHref}" download="Christian-Marquez-Resume.pdf"><span class="rb-label">Résumé (PDF)</span><span class="rb-ic" aria-hidden="true">↓</span></a>
        <a class="ct-li" href="https://www.linkedin.com/in/marky939/" target="_blank" rel="noopener">LinkedIn ↗</a>
      </div>
      <p class="ct-subj mono"></p>
      <p class="sr" role="status" aria-live="polite"></p>
    </div>`;
  document.body.append(dlg);

  // Grid version: the panel arrives as 12 ink columns that close in from the trigger's column outward.
  const cols = Array.from({ length: 12 }, (_, i) => {
    const c = document.createElement('span');
    c.className = 'ct-col';
    c.style.left = `${(i * 100) / 12}%`;
    return c;
  });
  dlg.querySelector('.ct-iris').append(...cols);
  const colDistance = (i, x) => Math.abs(i + 0.5 - (x / innerWidth) * 12);
  const big = dlg.querySelector('.ct-big');
  const mail = dlg.querySelector('.ct-mail');
  const subj = dlg.querySelector('.ct-subj');
  const live = dlg.querySelector('[role="status"]');
  const copyB = dlg.querySelector('.ct-copy');
  const copyLabel = copyB.querySelector('.ct-cl');
  const copyLq = copyB.querySelector('.rb-lq');
  const send = dlg.querySelector('.ct-send');
  const xB = dlg.querySelector('.ct-x');
  const modeBs = [...dlg.querySelectorAll('.ct-modes button')];

  [...EMAIL].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'mc';
    s.setAttribute('aria-hidden', 'true');
    s.style.setProperty('--i', i);
    s.textContent = c;
    mail.append(s);
  });

  let mode = 0;
  let open = false;
  let busy = false;
  let opener = null;
  let subjTimer = 0;

  function buildHeadline(m, animate) {
    big.textContent = '';
    MODES[m].head.forEach((line, li) => {
      const ln = document.createElement('span');
      ln.className = li ? 'line o' : 'line';
      [...line].forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch === ' ' ? ' ' : ch;
        ln.append(s);
      });
      big.append(ln);
    });
    big.setAttribute('aria-label', MODES[m].head.join(' '));
    if (animate && !reduce) {
      big.querySelectorAll('.ch').forEach((c, i) => c.animate(
        [{ transform: 'translateY(-60%) rotate(-5deg)', opacity: 0, filter: 'blur(6px)', fontStretch: '62%' },
         { transform: 'none', opacity: 1, filter: 'blur(0)', fontStretch: '86%' }],
        { duration: 480, delay: i * 16, easing: EASE_OUT, fill: 'backwards' }));
    }
  }

  function typeSubject(m) {
    clearInterval(subjTimer);
    const full = `Subject → ${MODES[m].subject}`;
    if (reduce) { subj.textContent = full; return; }
    let i = 0;
    subj.textContent = '';
    subjTimer = setInterval(() => {
      i += 2;
      subj.textContent = full.slice(0, i);
      if (i >= full.length) clearInterval(subjTimer);
    }, 16);
  }

  function setMode(m, animate) {
    mode = m;
    modeBs.forEach((b, i) => { b.setAttribute('aria-checked', String(i === m)); b.tabIndex = i === m ? 0 : -1; });
    send.href = mailtoFor(m);
    typeSubject(m);
    if (!animate || reduce) { buildHeadline(m, false); return; }
    const old = [...big.querySelectorAll('.ch')];
    old.forEach((c, i) => c.animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateY(30%)', opacity: 0, filter: 'blur(4px)' }],
      { duration: 220, delay: i * 8, easing: EASE_IN, fill: 'forwards' }));
    setTimeout(() => buildHeadline(m, true), 220 + old.length * 4);
  }
  modeBs.forEach((b, i) => b.addEventListener('click', () => { if (i !== mode) setMode(i, true); }));

  const parts = () => [dlg.querySelector('.ct-kick'), ...big.querySelectorAll('.ch'), ...modeBs,
    ...mail.querySelectorAll('.mc'), ...dlg.querySelectorAll('.ct-acts > *'), subj, xB];

  function centerOf(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function doOpen(trigger) {
    if (open || busy) return;
    open = true;
    busy = true;
    opener = trigger;
    setMode(mode, false);
    dlg.hidden = false;
    document.documentElement.classList.add('ct-open');
    const finish = () => { busy = false; modeBs[mode].focus({ preventScroll: true }); };
    if (reduce) { finish(); return; }
    const c = centerOf(trigger);
    cols.forEach((col, i) => {
      col.getAnimations().forEach((a) => a.cancel());
      col.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
        { duration: 560, delay: colDistance(i, c.x) * 34, easing: EASE_IN_OUT, fill: 'backwards' });
    });
    parts().forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const dx = c.x - (r.left + r.width / 2);
      const dy = c.y - (r.top + r.height / 2);
      el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: 0, filter: 'blur(8px)' },
        { transform: 'none', opacity: 1, filter: 'blur(0)' }],
      { duration: 680, delay: 300 + i * 9, easing: EASE_OUT, fill: 'backwards' });
    });
    setTimeout(finish, 920);
  }

  function reset() {
    dlg.hidden = true;
    document.documentElement.classList.remove('ct-open');
    parts().forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    cols.forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    open = false;
    busy = false;
    opener?.focus({ preventScroll: true });
  }

  function doClose(instant) {
    if (!open || busy) return;
    if (instant || reduce || !opener) { reset(); return; } // keyboard (Esc) closes instantly
    busy = true;
    const c = centerOf(opener);
    parts().reverse().forEach((el, i) => el.animate(
      [{ transform: 'none', opacity: 1 }, { transform: 'translateY(10px) scale(.96)', opacity: 0, filter: 'blur(4px)' }],
      { duration: 260, delay: i * 3, easing: EASE_IN, fill: 'forwards' }));
    const shut = cols.map((col, i) => col.animate(
      [{ transform: 'scaleY(1)', transformOrigin: '50% 100%' }, { transform: 'scaleY(0)', transformOrigin: '50% 100%' }],
      { duration: 420, delay: 180 + (12 - colDistance(i, c.x)) * 22, easing: EASE_IN_OUT, fill: 'forwards' }));
    Promise.all(shut.map((a) => a.finished)).then(reset, reset);
  }

  triggers.forEach((t) => t.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let new-tab / new-window work
    e.preventDefault();
    doOpen(t);
  }));
  xB.addEventListener('click', () => doClose(false));

  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); doClose(true); return; }
    if (e.key === 'Tab') {
      const f = [...dlg.querySelectorAll('button:not([tabindex="-1"]), a[href]')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      return;
    }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.closest('.ct-modes')) {
      e.preventDefault();
      const n = (mode + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : MODES.length - 1)) % MODES.length;
      setMode(n, false); // keyboard-initiated: no headline animation
      modeBs[n].focus();
    }
  });

  let copyBusy = false;
  copyB.addEventListener('click', async () => {
    if (copyBusy) return;
    copyBusy = true;
    const ok = await copyText(EMAIL);
    live.textContent = ok ? 'Email address copied' : 'Copy failed. The address is designdadstudio@gmail.com';
    const label = ok ? 'Copied ✓' : 'Press Ctrl+C';
    if (reduce) {
      copyLabel.textContent = label;
      setTimeout(() => { copyLabel.textContent = 'Copy email'; copyBusy = false; }, 1600);
      return;
    }
    const cr = copyB.getBoundingClientRect();
    const cx = cr.left + cr.width / 2;
    const cy = cr.top + cr.height / 2;
    const chars = [...mail.querySelectorAll('.mc')];
    const flights = chars.map((c, i) => {
      const r = c.getBoundingClientRect();
      const d = [cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)];
      c.dataset.d = d.join(',');
      return c.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${d[0]}px, ${d[1]}px) scale(.3)`, opacity: 0 }],
        { duration: 520, delay: i * 14, easing: 'cubic-bezier(.6,0,.4,1)', fill: 'forwards' });
    });
    const t1 = 520 + chars.length * 14 - 120;
    setTimeout(() => {
      copyB.classList.add('is-filling');
      copyLq.animate([{ transform: 'translateY(112%)' }, { transform: 'translateY(0%)' }], { duration: 520, easing: EASE_OUT, fill: 'forwards' });
      copyLabel.animate([{ opacity: 0, filter: 'blur(4px)', transform: 'scale(.9)' }, { opacity: 1, filter: 'blur(0)', transform: 'none' }], { duration: 260, easing: EASE_OUT });
      copyLabel.textContent = label;
    }, t1);
    setTimeout(() => {
      chars.forEach((c, i) => {
        flights[i].cancel();
        const [dx, dy] = c.dataset.d.split(',');
        c.animate([{ transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: 0 }, { transform: 'none', opacity: 1 }],
          { duration: 560, delay: i * 12, easing: EASE_OUT, fill: 'backwards' });
      });
    }, t1 + 1100);
    setTimeout(() => {
      copyLq.animate([{ transform: 'translateY(0%)' }, { transform: 'translateY(112%)' }], { duration: 400, easing: EASE_IN, fill: 'forwards' });
      copyLabel.textContent = 'Copy email';
      copyBusy = false;
      setTimeout(() => copyB.classList.remove('is-filling'), 420);
    }, t1 + 2200);
  });
}
