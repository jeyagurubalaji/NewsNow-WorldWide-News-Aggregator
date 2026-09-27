const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/jwt');

async function register({ fullName, email, password, preferredCountry }) {
  const normalizedEmail = email.toLowerCase();

  if (await User.exists({ email: normalizedEmail })) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password: passwordHash,
    preferredCountry: preferredCountry || 'us',
  });

  const token = generateToken(user.email);
  return { token, email: user.email, fullName: user.fullName, preferredCountry: user.preferredCountry };
}

async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.password) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const matches = await bcrypt.compare(password, user.password);
  if (!matches) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user.email);
  return { token, email: user.email, fullName: user.fullName, preferredCountry: user.preferredCountry };
}

/**
 * Google OAuth2 login/registration.
 * NOTE: This scaffold trusts a pre-verified email/name pair passed from the controller,
 * same as the Spring Boot version it replaces — it does not itself verify a Google ID
 * token. Wire up the `google-auth-library` package's OAuth2Client.verifyIdToken() here
 * before using this in production.
 */
async function loginOrRegisterWithGoogle(email, fullName) {
  const normalizedEmail = email.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      fullName,
      password: null,
      preferredCountry: 'us',
    });
  }

  const token = generateToken(user.email);
  return { token, email: user.email, fullName: user.fullName, preferredCountry: user.preferredCountry };
}

module.exports = { register, login, loginOrRegisterWithGoogle };
