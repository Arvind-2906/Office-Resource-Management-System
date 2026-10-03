const ApiResponse = require('../utils/apiResponse');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Role '${req.user.role}' is not authorized to access this resource. Required role: ${roles.join(' or ')}`
      );
    }

    next();
  };
};

module.exports = { authorize };
