import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ELEMENTS, LAYOUTS, NAMES, CAPTIONS, scrubState, stateFor, blend } from '../assets/js/layout-machine.js';

test('layout machine: every composition places every element', () => {
  assert.equal(LAYOUTS.length, 6);
  assert.equal(NAMES.length, 6);
  assert.equal(CAPTIONS.length, 6);
  for (const L of LAYOUTS) {
    assert.equal(L.length, ELEMENTS.length);
    L.forEach((v, i) => {
      assert.equal(v.length, ELEMENTS[i].kind === 'text' ? 6 : 7);
      assert.match(v[5], /^#[0-9A-F]{6}$/i);
      v.forEach((x) => { if (typeof x === 'number') assert.ok(Number.isFinite(x)); });
    });
  }
});

test('layout machine: scroll maps to hold, move, hold', () => {
  assert.deepEqual(scrubState(0), { i: 0, j: 1, t: 0 });
  assert.deepEqual(scrubState(1), { i: 4, j: 5, t: 1 });
  const mid = scrubState(0.1);
  assert.equal(mid.i, 0);
  assert.ok(Math.abs(mid.t - 0.5) < 1e-9);
  assert.equal(scrubState(0.02).t, 0);
});

test('layout machine: grid units become pixels and states blend', () => {
  const s = stateFor([1, 2, 40, 0, 100, '#121317'], ELEMENTS[0], 10, 20, 1);
  assert.equal(s.x, 10);
  assert.equal(s.y, 40);
  assert.equal(s.fs, 40);
  assert.deepEqual(s.c, [18, 19, 23]);
  const sh = stateFor([1, 1, 2, 3, 0, '#FF5A1F', 50], ELEMENTS[6], 10, 20, 1);
  assert.equal(sh.w, 20);
  assert.equal(sh.h, 30);
  assert.equal(sh.rad, 50);
  const b = blend(s, { ...s, x: 30, c: [38, 39, 43] }, 0.5);
  assert.equal(b.x, 20);
  // colours swap at the midpoint instead of mixing (an ink→orange mix is a muddy brown)
  assert.deepEqual(blend(s, { ...s, c: [38, 39, 43] }, 0.49).c, [18, 19, 23]);
  assert.deepEqual(b.c, [38, 39, 43]);
});
