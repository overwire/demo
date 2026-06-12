const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formatDuration, slugify } = require('./utils.js');

test('formatDuration renders milliseconds', () => {
  assert.equal(formatDuration(42), '42ms');
  assert.equal(formatDuration(999), '999ms');
});

test('formatDuration renders seconds', () => {
  assert.equal(formatDuration(1000), '1s');
  assert.equal(formatDuration(59000), '59s');
});

test('formatDuration renders minutes and seconds', () => {
  assert.equal(formatDuration(90000), '1m 30s');
  assert.equal(formatDuration(125000), '2m 5s');
});

test('formatDuration rejects negative values', () => {
  assert.throws(() => formatDuration(-1), { name: 'RangeError' });
});

test('slugify converts to slug', () => {
  assert.equal(slugify('Hello World'), 'hello-world');
  assert.equal(slugify('foo--bar__baz'), 'foo-bar-baz');
});

test('slugify trims leading and trailing hyphens', () => {
  assert.equal(slugify('--hello--'), 'hello');
});

test('slugify rejects non-string', () => {
  assert.throws(() => slugify(42), { name: 'TypeError' });
});
