const { authenticate } = require('./auth.js');

function createHandler(options = {}) {
  const { cache } = options;

  return function handle(request) {
    if (!request || typeof request.method !== 'string') {
      return { status: 400, body: { error: 'invalid request' } };
    }

    const { method, path, headers } = request;

    if (path === '/health') {
      return { status: 200, body: { status: 'ok', cacheSize: cache?.size() ?? 0 } };
    }

    const auth = authenticate(headers);
    if (!auth.valid) {
      return { status: 401, body: { error: 'unauthorized' } };
    }

    if (method === 'GET' && path === '/data') {
      const cached = cache?.get('data');
      if (cached) return { status: 200, body: cached };
      const data = { items: [], timestamp: Date.now() };
      cache?.set('data', data);
      return { status: 200, body: data };
    }

    return { status: 404, body: { error: 'not found' } };
  };
}

module.exports = { createHandler };
