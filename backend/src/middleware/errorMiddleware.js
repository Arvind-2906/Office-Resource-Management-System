import ApiResponse from '../utils/apiResponse.js';
import env from '../config/env.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    return ApiResponse.notFound(res, message);
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for ${field}: '${err.keyValue[field]}'. Please use another value.`;
    return ApiResponse.conflict(res, message, [message]);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return ApiResponse.badRequest(res, 'Validation Error', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Authentication token expired');
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  return ApiResponse.error(
    res,
    error.message || 'Internal Server Error',
    env.NODE_ENV === 'production' ? [] : [err.stack],
    statusCode
  );
};

export default errorHandler;
