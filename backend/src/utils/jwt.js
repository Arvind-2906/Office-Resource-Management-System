import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

export const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken({
    id: user._id,
    role: user.role,
    email: user.email
  });

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        isActive: user.isActive
      }
    }
  });
};

export default {
  generateToken,
  verifyToken,
  sendTokenResponse
};
