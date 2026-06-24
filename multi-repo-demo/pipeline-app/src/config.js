const defaults = Object.freeze({
  port: 3000,
  host: '0.0.0.0',
  logLevel: 'info',
  maxRetries: 3,
});

function loadConfig(overrides = {}) {
  const merged = { ...defaults };
  for (const [key, value] of Object.entries(overrides)) {
    if (key in defaults && value !== undefined) {
      merged[key] = value;
    }
  }
  return Object.freeze(merged);
}

function validateConfig(config) {
  if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    throw new RangeError(`invalid port: ${config.port}`);
  }
  if (typeof config.host !== 'string' || config.host.trim() === '') {
    throw new TypeError('host must be a non-empty string');
  }
  return true;
}

module.exports = { defaults, loadConfig, validateConfig };
