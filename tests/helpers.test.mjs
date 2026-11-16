import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, easeOutCubic, easeInOutCubic, easeInOutQuint, easeOutBack, mix, hexToRgb, rgbString } from '../assets/js/motion.js';
import { PRINT, printState } from '../assets/js/resume.js';
import { EMAIL, MODES, mailtoFor, irisRadius } from '../assets/js/contact.js';
import { lensBackground } from '../assets/js/lens.js';
import { fitFontSize, posterLayout } from '../assets/js/glass.js';

const near = (a, b, e = 1e-6) => assert.ok(Math.abs(a - b) < e, `${a} should be close to ${b}`);

test('motion: easings start at 0, end at 1 and meet in the middle', () => {
  for (const f of [easeOutCubic, easeInOutCubic, easeInOutQuint, easeOutBack]) { near(f(0), 0); near(f(1), 1); }
  near(easeOutCubic(0.5), 0.875);
  near(easeInOutCubic(0.5), 0.5);
  near(easeInOutQuint(0.5), 0.5);
  assert.ok(easeOutBack(0.8) > 1, 'back easing overshoots');
  near(easeOutCubic(-3), 0);
  near(easeOutCubic(9), 1);
});

test('motion: clamp, mix and colours', () => {
  assert.equal(clamp(2), 1);
  assert.equal(clamp(-1), 0);
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(mix(10, 20, 0.25), 12.5);
  assert.deepEqual(hexToRgb('#2B3CFF'), [43, 60, 255]);
  assert.equal(rgbString([43.4, 60, 254.6]), 'rgb(43,60,255)');
});

test('resume: the print timeline reads like a receipt', () => {
  assert.equal(printState(0).label, 'PRINTING 00%');
  assert.equal(printState(PRINT.start + PRINT.dur).label, 'PRINTING 100%');
  assert.equal(printState(PRINT.stampAt + 50).label, 'SAVING TO DOWNLOADS');
  const saved = printState(PRINT.fillAt + PRINT.fillDur + 10);
  assert.equal(saved.label, 'SAVED ✓ RESUME.PDF');
  assert.equal(saved.saved, true);
  near(saved.liquid, 1, 1e-3);
  assert.equal(printState(PRINT.resetAt + 10).label, null);
  assert.equal(printState(PRINT.end).done, true);
  near(printState(0).sheetY, 105);
  near(printState(PRINT.dropAt + PRINT.dropDur).sheetY, 118);
});

test('contact: pre-filled emails per work type', () => {
  assert.equal(EMAIL, 'designdadstudio@gmail.com');
  assert.equal(MODES.length, 3);
  const m = mailtoFor(0);
  assert.ok(m.startsWith('mailto:designdadstudio@gmail.com?subject=Full-time%20role%3A%20UI%2FUX%20%2B%20frontend&body='), m);
  assert.ok(m.includes('%0A'), 'newlines are encoded');
  assert.equal(mailtoFor(7), mailtoFor(0));
  assert.deepEqual(MODES.map((x) => x.head.length), [2, 2, 2]);
});

test('contact: the iris always reaches the farthest corner', () => {
  near(irisRadius(0, 0, 300, 400), 504);
  near(irisRadius(150, 200, 300, 400), 254);
});

test('lens: the magnified point stays under the cursor', () => {
  const b = lensBackground(100, 50, 400, 300, 2, 90);
  assert.deepEqual(b.size, [800, 600]);
  assert.deepEqual(b.pos, [-110, -10]);
});

test('glass: font fitting and poster geometry stay in bounds', () => {
  assert.equal(fitFontSize(500, 250, 140), 50);
  assert.equal(fitFontSize(200, 1000, 140), 140);
  for (const [w, h] of [[1440, 836], [768, 960], [375, 700], [320, 560]]) {
    const L = posterLayout(w, h);
    assert.ok(L.pad > 0 && L.pad < w / 4, `pad at ${w}`);
    assert.ok(L.circle.x - L.circle.r >= 0 && L.circle.x + L.circle.r <= w, `circle x at ${w}`);
    assert.ok(L.circle.y + L.circle.r <= h - L.bar, `circle y at ${w}`);
    assert.ok(L.nameMaxW > 0 && L.nameMaxW <= w, `name width at ${w}`);
  }
});
