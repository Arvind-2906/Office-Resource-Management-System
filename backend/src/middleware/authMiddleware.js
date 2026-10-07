import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.js';
import ApiResponse from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Check cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return ApiResponse.unauthorized(res, 'Authentication required. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return ApiResponse.unauthorized(res, 'User belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      return ApiResponse.forbidden(res, 'Your account has been deactivated. Please contact an Administrator.');
    }

    req.user = user;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, 'Invalid or expired token.');
  }
};

export default { protect };
