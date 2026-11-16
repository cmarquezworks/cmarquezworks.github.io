import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from '../assets/js/sections.js';

test('sections: headings split into words, keeping the spaces between them', () => {
  assert.deepEqual(tokenize('Three sites, taken apart.'), ['Three', ' ', 'sites,', ' ', 'taken', ' ', 'apart.']);
  assert.deepEqual(tokenize(' Let\'s  work. '), [' ', 'Let\'s', '  ', 'work.', ' ']);
  assert.deepEqual(tokenize(''), []);
});
