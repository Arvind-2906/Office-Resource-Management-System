const logger = require('../utils/logger');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }

  logger.warn('ADMIN_ACCESS_DENIED', {
    userId: req.user ? req.user._id : 'anonymous',
    role: req.user ? req.user.role : 'none',
    path: req.originalUrl
  });

  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrator privileges required.',
    error: 'FORBIDDEN'
  });
};

module.exports = { adminOnly };
