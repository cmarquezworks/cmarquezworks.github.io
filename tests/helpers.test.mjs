import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clamp, easeOutCubic, easeInOutCubic, easeInOutQuint, easeOutBack, mix, hexToRgb, rgbString } from '../assets/js/motion.js';
import { EMAIL, MODES, mailtoFor } from '../assets/js/contact.js';

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

test('contact: pre-filled emails per kind of work', () => {
  assert.equal(EMAIL, 'cmarquezworks@gmail.com');
  assert.deepEqual(MODES.map((m) => m.label), ['full-time', 'contract', 'project']);
  const m = mailtoFor(0);
  assert.ok(m.startsWith('mailto:cmarquezworks@gmail.com?subject=Full-time%20role%3A%20UI%2FUX%20%2B%20frontend&body='), m);
  assert.ok(m.includes('%0A'), 'newlines are encoded');
  assert.ok(mailtoFor(1).includes('subject=Contract%20work'), 'contract has its own subject');
  assert.equal(mailtoFor(7), mailtoFor(0));
});
