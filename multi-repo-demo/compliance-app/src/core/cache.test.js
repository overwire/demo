const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createCache } = require('./cache.js');

test('get returns null for missing key', () => {
  const cache = createCache();
  assert.equal(cache.get('missing'), null);
});

test('set and get round-trip', () => {
  const cache = createCache();
  cache.set('key', 'value');
  assert.equal(cache.get('key'), 'value');
});

test('evicts oldest entry when maxSize reached', () => {
  const cache = createCache({ maxSize: 2 });
  cache.set('a', 1);
  cache.set('b', 2);
  cache.set('c', 3);
  assert.equal(cache.has('a'), false);
  assert.equal(cache.get('c'), 3);
});

test('rejects non-string key', () => {
  const cache = createCache();
  assert.throws(() => cache.get(42), { name: 'TypeError' });
  assert.throws(() => cache.set(42, 'v'), { name: 'TypeError' });
});

test('clear empties the cache', () => {
  const cache = createCache();
  cache.set('x', 1);
  cache.clear();
  assert.equal(cache.size(), 0);
});
