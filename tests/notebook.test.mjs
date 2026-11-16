import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawDuration, writeDuration, stagger, tiltFor, roughEllipse } from '../assets/js/marks.js';

test('marks: pen speed sets how long a stroke takes to draw, within limits', () => {
  assert.equal(drawDuration(90), 280); // a short tick: the floor
  assert.equal(drawDuration(450), 500); // 450px at 0.9px per ms
  assert.equal(drawDuration(5000), 900); // a long stroke: the ceiling
});

test('marks: handwriting time grows with the note, within limits', () => {
  assert.equal(writeDuration('ok'), 320);
  assert.equal(writeDuration('one action per card'), 722); // 19 characters at 38ms
  assert.equal(writeDuration('x'.repeat(80)), 1100);
});

test('marks: stagger spaces steps evenly from a base', () => {
  assert.equal(stagger(0, 220), 0);
  assert.equal(stagger(3, 220, 100), 760);
});

test('marks: a print tilts toward the cursor, flat at the centre and capped at the corners', () => {
  assert.deepEqual(tiltFor(100, 50, 200, 100), { rx: 0, ry: 0 });
  assert.deepEqual(tiltFor(0, 0, 200, 100), { rx: 2, ry: -2 });
  assert.deepEqual(tiltFor(200, 100, 200, 100), { rx: -2, ry: 2 });
  assert.deepEqual(tiltFor(-500, 900, 200, 100, 3), { rx: -3, ry: -3 }); // outside the box stays capped
});

test('marks: a rough ellipse is a deterministic hand-drawn loop around its box', () => {
  const a = roughEllipse(100, 50, 200, 80, 7);
  assert.equal(a, roughEllipse(100, 50, 200, 80, 7), 'same seed, same stroke');
  assert.notEqual(a, roughEllipse(100, 50, 200, 80, 8), 'another seed, another stroke');
  assert.match(a, /^M\d+(\.\d)? \d+(\.\d)? Q/);
  const nums = a.match(/-?\d+(\.\d+)?/g).map(Number);
  assert.ok(nums.length >= 40, 'enough points to look drawn');
  for (let i = 0; i < nums.length; i += 2) {
    const k = Math.hypot((nums[i] - 200) / 100, (nums[i + 1] - 90) / 40);
    assert.ok(k <= 1.35, `point ${nums[i]},${nums[i + 1]} strays too far from the box`);
    assert.ok(k >= 1, `point ${nums[i]},${nums[i + 1]} cuts into the box`);
  }
});
