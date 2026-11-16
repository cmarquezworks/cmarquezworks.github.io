// resume.js: "print, then save". The link is a real <a download>, so the browser downloads the PDF
// on click; this module only plays the receipt animation around it.
import { clamp, easeOutCubic, easeInCubic, easeInOutCubic, easeOutBack, prefersReducedMotion, WAVE } from './motion.js';

export const PRINT = {
  start: 120, dur: 950,
  stampAt: 1100, stampDur: 380,
  dropAt: 1350, dropDur: 420,
  fillAt: 1550, fillDur: 620,
  savedAt: 1800,
  drainAt: 3400, drainDur: 480,
  resetAt: 3550, end: 3900,
};

// State of the whole sequence at time t (ms since the click). Pure, so it is unit-tested.
export function printState(t) {
  const p = easeInOutCubic((t - PRINT.start) / PRINT.dur);
  let sheetY = (1 - p) * 105;
  let sheetScale = 1;
  if (t >= PRINT.dropAt) {
    const d = easeInCubic((t - PRINT.dropAt) / PRINT.dropDur);
    sheetY = d * 118;
    sheetScale = 1 - d * 0.14;
  }
  let liquid = easeOutCubic((t - PRINT.fillAt) / PRINT.fillDur);
  if (t > PRINT.drainAt) liquid = 1 - easeInOutCubic((t - PRINT.drainAt) / PRINT.drainDur);
  let label;
  if (t < PRINT.stampAt) label = `PRINTING ${String(Math.round(p * 100)).padStart(2, '0')}%`;
  else if (t < PRINT.savedAt) label = 'SAVING TO DOWNLOADS';
  else if (t < PRINT.resetAt) label = 'SAVED ✓ RESUME.PDF';
  else label = null;
  return {
    p,
    sheetY,
    sheetScale,
    scanOn: t > PRINT.start && t < PRINT.stampAt + 20,
    press: t < 240 ? Math.sin((clamp(t / 240)) * Math.PI) : 0,
    stamp: clamp((t - PRINT.stampAt) / PRINT.stampDur),
    liquid,
    label,
    saved: t >= PRINT.savedAt && t < PRINT.resetAt,
    done: t >= PRINT.end,
  };
}

// The mini résumé printed on the sheet: [top, left, width, height, colour | 'o' for an outlined chip].
const SHEET = [
  [14, 12, 92, 9, '#121317'], [28, 12, 70, 4, '#6B7080'], [40, 12, 120, 1, '#C2C7D1'],
  [52, 12, 18, 4, '#9AA0AC'], [52, 36, 84, 4, '#121317'], [66, 12, 18, 4, '#9AA0AC'], [66, 36, 64, 4, '#121317'],
  [80, 12, 18, 4, '#9AA0AC'], [80, 36, 92, 4, '#121317'], [94, 12, 18, 4, '#9AA0AC'], [94, 36, 56, 4, '#121317'],
  [112, 12, 120, 1, '#C2C7D1'], [124, 12, 26, 9, '#2B3CFF'], [124, 42, 26, 9, 'o'], [124, 72, 26, 9, 'o'],
  [124, 102, 26, 9, 'o'], [150, 12, 70, 4, '#2B3CFF'], [162, 12, 44, 4, '#9AA0AC'], [176, 12, 120, 1, '#C2C7D1'],
];
const SHEET_H = 196;

function play(btn, lq, setLabel, done) {
  const r = btn.getBoundingClientRect();
  const up = r.top > 240; // print upward when there is room above the button, otherwise downward
  const slot = document.createElement('div');
  slot.className = `rb-slot${up ? '' : ' rb-slot--down'}`;
  slot.setAttribute('aria-hidden', 'true');
  slot.style.left = `${r.left + window.scrollX + r.width / 2 - 80}px`;
  slot.style.top = `${up ? r.top + window.scrollY - 206 : r.bottom + window.scrollY}px`;
  const sheet = document.createElement('div');
  sheet.className = 'rb-sheet';
  const scan = document.createElement('div');
  scan.className = 'rb-scan';
  const stamp = document.createElement('div');
  stamp.className = 'rb-stamp';
  stamp.textContent = 'PDF';
  sheet.append(scan, stamp);
  const lines = SHEET.map(([t, l, w, h, c]) => {
    const d = document.createElement('div');
    d.className = c === 'o' ? 'rb-ln rb-ln--o' : 'rb-ln';
    Object.assign(d.style, { top: `${t}px`, left: `${l}px`, width: `${w}px`, height: `${h}px` });
    if (c !== 'o') d.style.background = c;
    sheet.append(d);
    return { d, top: t, at: null };
  });
  slot.append(sheet);
  document.body.append(slot);
  const dir = up ? 1 : -1;
  btn.classList.add('is-printing');
  const t0 = performance.now();
  function frame(now) {
    const t = now - t0;
    const s = printState(t);
    btn.style.transform = `scale(${(1 - s.press * 0.045).toFixed(3)})`;
    sheet.style.transform = `translateY(${(dir * s.sheetY).toFixed(2)}%) scale(${s.sheetScale.toFixed(3)})`;
    const y = s.p * SHEET_H;
    const edge = up ? y : SHEET_H - y; // where the slot edge sits on the sheet: the print head
    scan.style.transform = `translateY(${edge.toFixed(1)}px)`;
    scan.style.opacity = s.scanOn ? '1' : '0';
    for (const ln of lines) {
      if (ln.at === null && s.scanOn && (up ? y >= ln.top : edge <= ln.top)) ln.at = t;
      const q = ln.at === null ? 0 : easeOutCubic((t - ln.at) / 240);
      ln.d.style.clipPath = `inset(0 ${((1 - q) * 100).toFixed(1)}% 0 0)`;
    }
    const k = s.stamp;
    stamp.style.opacity = k ? '1' : '0';
    stamp.style.transform = `scale(${(0.6 + 0.4 * easeOutBack(k)).toFixed(3)}) rotate(${((1 - k) * -20).toFixed(1)}deg)`;
    lq.style.transform = `translateY(${((1 - s.liquid) * 112).toFixed(1)}%)`;
    btn.classList.toggle('is-saved', s.saved);
    setLabel(s.label);
    if (!s.done) requestAnimationFrame(frame);
    else {
      slot.remove();
      btn.style.transform = '';
      btn.classList.remove('is-saved', 'is-printing');
      setLabel(null);
      done();
    }
  }
  requestAnimationFrame(frame);
}

export function initResume(root = document) {
  const reduce = prefersReducedMotion();
  root.querySelectorAll('a.resume-btn').forEach((btn) => {
    if (btn.dataset.rbReady) return;
    btn.dataset.rbReady = '1';
    const label = btn.querySelector('.rb-label');
    const idle = label ? label.textContent : '';
    const compact = btn.classList.contains('resume-btn--icon');
    const fill = document.createElement('span');
    fill.className = 'rb-fill';
    fill.innerHTML = `<span class="rb-lq">${WAVE}</span>`;
    btn.prepend(fill);
    const lq = fill.firstElementChild;
    const bead = document.createElement('span');
    bead.className = 'rb-bead';
    bead.setAttribute('aria-hidden', 'true');
    btn.append(bead);
    const status = document.createElement('span');
    status.className = 'sr';
    status.setAttribute('role', 'status');
    btn.append(status);
    let shown = idle;
    const setLabel = (text) => {
      if (!label || compact) return;
      const next = text ?? idle;
      if (next !== shown) { label.textContent = next; shown = next; }
    };
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      bead.style.transform = `translate(${(e.clientX - r.left - 27).toFixed(1)}px, ${(e.clientY - r.top - 27).toFixed(1)}px)`;
    });
    let busy = false;
    btn.addEventListener('click', () => {
      // No preventDefault: the browser starts the download right now; the animation is the receipt.
      status.textContent = 'Downloading the résumé PDF';
      if (busy) return;
      busy = true;
      if (reduce) {
        btn.classList.add('is-saved');
        lq.style.transform = 'translateY(0)';
        setLabel('SAVED ✓');
        setTimeout(() => { btn.classList.remove('is-saved'); lq.style.transform = ''; setLabel(null); busy = false; }, 2000);
        return;
      }
      play(btn, lq, setLabel, () => { busy = false; });
    });
  });
}
