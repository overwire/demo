function createCache(options = {}) {
  const maxSize = options.maxSize ?? 256;
  const store = new Map();

  return {
    get(key) {
      if (typeof key !== 'string') throw new TypeError('cache key must be a string');
      return store.get(key) ?? null;
    },
    set(key, value) {
      if (typeof key !== 'string') throw new TypeError('cache key must be a string');
      if (store.size >= maxSize && !store.has(key)) {
        const oldest = store.keys().next().value;
        store.delete(oldest);
      }
      store.set(key, value);
    },
    has(key) {
      return store.has(key);
    },
    size() {
      return store.size;
    },
    clear() {
      store.clear();
    },
  };
}

module.exports = { createCache };
