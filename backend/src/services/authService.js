import User from '../models/User.js';
import { logActivity } from './activityService.js';

export const signup = async (userData) => {
  const { name, email, password, department, phone } = userData;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 409;
    throw error;
  }

  // Force role to EMPLOYEE on public signup
  const user = await User.create({
    name,
    email,
    password,
    department: department || 'General',
    phone: phone || '',
    role: 'EMPLOYEE',
    isActive: true
  });

  await logActivity(user._id, 'SIGNUP', 'User', user._id, `New employee account created: ${user.email}`);

  return user;
};

export const login = async (email, password) => {
  if (!email || !password) {
    const error = new Error('Please provide an email and password');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact an Administrator.');
    error.statusCode = 403;
    throw error;
  }

  await logActivity(user._id, 'LOGIN', 'User', user._id, `User logged in: ${user.email}`);

  return user;
};

export const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export default {
  signup,
  login,
  getMe
};
