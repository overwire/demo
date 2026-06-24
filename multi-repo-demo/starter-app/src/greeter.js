function greet(name, options = {}) {
  if (typeof name !== 'string' || name.trim() === '') {
    throw new TypeError('greet(name): name must be a non-empty string');
  }
  const locale = typeof options.locale === 'string' ? options.locale : 'en';
  const greeting = GREETINGS[locale] ?? GREETINGS.en;
  return `${greeting}, ${name}!`;
}

const GREETINGS = Object.freeze({
  en: 'Hello',
  es: 'Hola',
  fr: 'Bonjour',
});

module.exports = { greet, GREETINGS };
