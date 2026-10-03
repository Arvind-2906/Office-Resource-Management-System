const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user
 * @param {string} userId - Mongo ID of the user
 * @param {string} role - User role (CUSTOMER, ADMIN)
 * @returns {string} Signed JWT
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_at_least_32_characters_long_for_security';
  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: '7d'
  });
};

/**
 * Set HTTP-only JWT cookie on response object
 * @param {object} res - Express response
 * @param {string} token - JWT token string
 */
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

/**
 * Clear JWT cookie on logout
 * @param {object} res - Express response
 */
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(0)
  });
};

module.exports = {
  generateToken,
  setTokenCookie,
  clearTokenCookie
};
