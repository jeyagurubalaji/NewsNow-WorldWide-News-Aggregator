const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

/** Strict auth: 401s if there's no valid Bearer token. Used on /api/bookmarks/**. */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const token = authHeader.substring(7);
  const email = verifyToken(token);

  if (!email) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }

  req.userEmail = email;
  next();
}

module.exports = { requireAuth };
