const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHandler } = require('./handler.js');
const { createCache } = require('../core/cache.js');

test('health endpoint returns ok', () => {
  const handler = createHandler({ cache: createCache() });
  const res = handler({ method: 'GET', path: '/health' });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('invalid request returns 400', () => {
  const handler = createHandler();
  const res = handler(null);
  assert.equal(res.status, 400);
});

test('missing auth returns 401', () => {
  const handler = createHandler({ cache: createCache() });
  const res = handler({ method: 'GET', path: '/data', headers: {} });
  assert.equal(res.status, 401);
});

test('authenticated GET /data returns 200', () => {
  const handler = createHandler({ cache: createCache() });
  const res = handler({
    method: 'GET',
    path: '/data',
    headers: { authorization: 'Bearer test-token' },
  });
  assert.equal(res.status, 200);
  assert.ok(res.body.items);
});

test('unknown path returns 404', () => {
  const handler = createHandler({ cache: createCache() });
  const res = handler({
    method: 'GET',
    path: '/unknown',
    headers: { authorization: 'Bearer test-token' },
  });
  assert.equal(res.status, 404);
});
