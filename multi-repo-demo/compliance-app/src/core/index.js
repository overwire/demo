const { createCache } = require('./cache.js');
const { createHandler } = require('../api/handler.js');

const cache = createCache({ maxSize: 100 });
const handler = createHandler({ cache });

const method = process.argv[2] || 'GET';
const path = process.argv[3] || '/health';

const result = handler({ method, path });
console.log(JSON.stringify(result, null, 2));
