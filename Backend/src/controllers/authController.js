const authService = require('../services/authService');
const ApiError = require('../utils/ApiError');

async function register(req, res, next) {
  try {
    const { fullName, email, password, preferredCountry } = req.body;

    if (!fullName || !fullName.trim()) throw new ApiError(400, 'Full name is required');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, 'Email must be valid');
    if (!password || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

    const result = await authService.register({ fullName, email, password, preferredCountry });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new ApiError(400, 'Email and password are required');

    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// NOTE: expects the frontend to have already validated the Google Sign-In response
// and forwarded the verified email/name — see authService.js's doc comment.
async function googleAuth(req, res, next) {
  try {
    const { email, fullName } = req.query;
    if (!email || !fullName) throw new ApiError(400, 'email and fullName are required');

    const result = await authService.loginOrRegisterWithGoogle(email, fullName);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, googleAuth };
