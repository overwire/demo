function authenticate(headers) {
  if (!headers || typeof headers !== 'object') {
    return { valid: false, reason: 'no headers' };
  }
  const auth = headers.authorization || headers.Authorization;
  if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
    return { valid: false, reason: 'missing or invalid bearer token' };
  }
  const token = auth.slice(7);
  if (token.length === 0) {
    return { valid: false, reason: 'empty token' };
  }
  return { valid: true, token };
}

module.exports = { authenticate };
