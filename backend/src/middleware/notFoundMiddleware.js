const ApiResponse = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  return ApiResponse.notFound(res, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

module.exports = notFound;
