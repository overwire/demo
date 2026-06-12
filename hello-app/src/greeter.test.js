const { test } = require('node:test');
const assert = require('node:assert/strict');
const { greet, GREETINGS } = require('./greeter.js');

test('greet returns an English greeting by default', () => {
  assert.equal(greet('World'), 'Hello, World!');
});

test('greet honors a Spanish locale', () => {
  assert.equal(greet('Mundo', { locale: 'es' }), 'Hola, Mundo!');
});

test('greet falls back to English for an unknown locale', () => {
  assert.equal(greet('Universe', { locale: 'kl' }), 'Hello, Universe!');
});

test('greet rejects an empty name', () => {
  assert.throws(() => greet(''), { name: 'TypeError' });
  assert.throws(() => greet('   '), { name: 'TypeError' });
});

test('GREETINGS is frozen', () => {
  assert.equal(Object.isFrozen(GREETINGS), true);
});
