import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import {
  formatEntityTag,
  parseEntityTag,
  parseEntityTagCondition,
  matchesEntityTag,
} from '../dist/esm/index.js';

test('formats and parses strong and weak entity tags', () => {
  for (const tag of [
    { weak: false, opaque: 'abc' },
    { weak: true, opaque: 'v1/2' },
  ])
    assert.deepEqual(parseEntityTag(formatEntityTag(tag)), tag);
});
test('parses entity-tag lists with commas inside quoted opaque values', () => {
  assert.deepEqual(parseEntityTagCondition('"a,b", W/"c"'), {
    any: false,
    tags: [
      { weak: false, opaque: 'a,b' },
      { weak: true, opaque: 'c' },
    ],
  });
});
test('If-None-Match weak comparison matches a weak tag', () => {
  assert.equal(matchesEntityTag('W/"v1"', '"v1"', 'weak'), true);
  assert.equal(matchesEntityTag('*', '"v1"', 'weak', false), false);
});
test('If-Match strong comparison rejects weak validators', () => {
  assert.equal(matchesEntityTag('W/"v1"', '"v1"', 'strong'), false);
  assert.equal(matchesEntityTag('"v1"', 'W/"v1"', 'strong'), false);
  assert.equal(matchesEntityTag('"v1"', '"v1"', 'strong'), true);
});
test('rejects malformed entity tags, list delimiters, and controls', () => {
  for (const value of ['abc', '"unterminated', 'W/ "x"', '"a"\r\nx:y', '"a"\n'])
    assert.throws(() => parseEntityTag(value), TypeError);
  assert.throws(() => parseEntityTagCondition('"a",,'), TypeError);
});
test('enforces list limits and opaque character validation', () => {
  assert.throws(() => formatEntityTag({ weak: false, opaque: 'bad\nvalue' }), TypeError);
  assert.throws(() => parseEntityTagCondition(Array(101).fill('"x"').join(',')), TypeError);
});
test('CommonJS exposes all entity tag helpers', () => {
  const api = createRequire(import.meta.url)('../dist/cjs/index.js');
  assert.deepEqual(Object.keys(api).sort(), [
    'formatEntityTag',
    'matchesEntityTag',
    'parseEntityTag',
    'parseEntityTagCondition',
  ]);
});
