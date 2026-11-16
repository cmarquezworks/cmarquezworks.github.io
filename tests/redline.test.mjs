import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fmtType, fmtGap, fmtBox, contrast, readPref, writePref, rgbToHex, fmtContrast } from '../assets/js/redline.js';

test('rgbToHex: computed colours to hex, transparent to null', () => {
  assert.equal(rgbToHex('rgb(20, 20, 20)'), '#141414');
  assert.equal(rgbToHex('rgba(243, 240, 232, 1)'), '#F3F0E8');
  assert.equal(rgbToHex('rgba(0, 0, 0, 0)'), null);
  assert.equal(rgbToHex('transparent'), null);
});

test('fmtContrast: fg on bg with the WCAG ratio', () => {
  assert.equal(fmtContrast('#F3F0E8', '#141414'), '#F3F0E8 on #141414 · 16.2:1');
});

test('fmtType: display face with tight leading and negative tracking', () => {
  assert.equal(
    fmtType({ fontFamily: '"Instrument Serif", serif', fontSize: '76px', lineHeight: '69.92px', letterSpacing: '-1.52px' }),
    'Instrument Serif · 76/0.92 · −2%'
  );
});

test('fmtType: body face, normal tracking is omitted', () => {
  assert.equal(
    fmtType({ fontFamily: 'Instrument Sans', fontSize: '16px', lineHeight: '24.8px', letterSpacing: 'normal' }),
    'Instrument Sans · 16/1.55'
  );
});

test('fmtType: line-height "normal" is reported as such', () => {
  assert.equal(
    fmtType({ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', lineHeight: 'normal', letterSpacing: '0px' }),
    'JetBrains Mono · 11/normal'
  );
});

test('fmtGap and fmtBox round to whole pixels', () => {
  assert.equal(fmtGap(37.6), 'gap 38');
  assert.equal(fmtBox(190.2, 219.8), '190 × 220');
});

test('contrast: WCAG ratios for the palette', () => {
  assert.ok(contrast('#141414', '#F3F0E8') >= 15);
  assert.ok(contrast('#FF4A1C', '#141414') >= 4.5);
  assert.ok(contrast('#6B675E', '#F3F0E8') >= 4.5);
  assert.equal(contrast('#000000', '#ffffff'), 21);
});

test('readPref: defaults to on, survives blocked storage', () => {
  assert.equal(readPref({ getItem() { throw new Error('blocked'); } }), true);
  assert.equal(readPref({ getItem: () => null }), true);
  assert.equal(readPref({ getItem: () => '0' }), false);
  assert.equal(readPref({ getItem: () => '1' }), true);
  assert.equal(readPref(undefined), true);
});

test('writePref: never throws', () => {
  const box = {};
  writePref({ setItem: (k, v) => { box[k] = v; } }, false);
  assert.equal(Object.values(box)[0], '0');
  assert.doesNotThrow(() => writePref({ setItem() { throw new Error('quota'); } }, true));
  assert.doesNotThrow(() => writePref(undefined, true));
});
