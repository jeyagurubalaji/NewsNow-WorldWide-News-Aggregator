const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(email) {
  return jwt.sign({ sub: email }, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: Math.floor(env.jwtExpirationMs / 1000),
  });
}

/** Returns the email (JWT subject) if the token is valid, otherwise null — never throws. */
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
    return decoded.sub || null;
  } catch {
    return null;
  }
}

module.exports = { generateToken, verifyToken };
