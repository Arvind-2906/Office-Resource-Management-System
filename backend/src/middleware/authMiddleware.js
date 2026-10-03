const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  let token;

  // Check cookie first, then Bearer Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    logger.authEvent('UNAUTHORIZED_ACCESS_ATTEMPT', {
      path: req.originalUrl,
      ip: req.ip
    });
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login to access this resource.',
      error: 'NO_TOKEN_PROVIDED'
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_at_least_32_characters_long_for_security';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      logger.authEvent('USER_NOT_FOUND_FOR_TOKEN', { userId: decoded.id });
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
        error: 'USER_NOT_FOUND'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.authEvent('TOKEN_VERIFICATION_FAILED', {
      message: error.message,
      path: req.originalUrl
    });
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired.',
      error: error.message
    });
  }
};

module.exports = { protect };
