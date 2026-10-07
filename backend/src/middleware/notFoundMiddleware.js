import ApiResponse from '../utils/apiResponse.js';

const notFound = (req, res, next) => {
  return ApiResponse.notFound(res, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

export default notFound;
