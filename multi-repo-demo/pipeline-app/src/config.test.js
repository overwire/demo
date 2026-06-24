const { test } = require('node:test');
const assert = require('node:assert/strict');
const { defaults, loadConfig, validateConfig } = require('./config.js');

test('defaults are frozen', () => {
  assert.equal(Object.isFrozen(defaults), true);
});

test('loadConfig returns defaults when no overrides', () => {
  const cfg = loadConfig();
  assert.equal(cfg.port, 3000);
  assert.equal(cfg.host, '0.0.0.0');
});

test('loadConfig merges valid overrides', () => {
  const cfg = loadConfig({ port: 8080, logLevel: 'debug' });
  assert.equal(cfg.port, 8080);
  assert.equal(cfg.logLevel, 'debug');
});

test('loadConfig ignores unknown keys', () => {
  const cfg = loadConfig({ unknown: true });
  assert.equal('unknown' in cfg, false);
});

test('validateConfig rejects invalid port', () => {
  assert.throws(() => validateConfig({ ...defaults, port: 0 }), { name: 'RangeError' });
  assert.throws(() => validateConfig({ ...defaults, port: 70000 }), { name: 'RangeError' });
});

test('validateConfig rejects empty host', () => {
  assert.throws(() => validateConfig({ ...defaults, host: '' }), { name: 'TypeError' });
});
