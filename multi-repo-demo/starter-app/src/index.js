const { greet } = require('./greeter.js');

const [, , name = 'World', locale = 'en'] = process.argv;
console.log(greet(name, { locale }));
