const { verifyToken } = require('../utils/jwt');

/**
 * Optional auth: attaches req.userEmail if a valid Bearer token is present, but
 * never rejects the request.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  req.userEmail = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    req.userEmail = verifyToken(token); // null if invalid/expired
  }

  next();
}

/**
 * Required auth: rejects with 401 if token is missing, invalid, or expired.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.substring(7);
  const email = verifyToken(token);

  if (!email) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.userEmail = email;
  next();
}

module.exports = { optionalAuth, requireAuth };