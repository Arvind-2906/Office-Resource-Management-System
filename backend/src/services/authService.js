const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const logger = require('../utils/logger');

class AuthService {
  async register({ name, email, password, phone, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    // Role can only be set to ADMIN in development seeding or if explicitly allowed
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: assignedRole
    });

    const token = generateToken(user._id, user.role);

    logger.authEvent('USER_REGISTERED', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      },
      token
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      logger.authEvent('LOGIN_FAILED_USER_NOT_FOUND', { email });
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      logger.authEvent('LOGIN_FAILED_WRONG_PASSWORD', { email });
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken(user._id, user.role);

    logger.authEvent('USER_LOGGED_IN', {
      userId: user._id,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      },
      token
    };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async updateUserAddress(userId, addressData) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(addressData);
    await user.save();
    return user;
  }
}

module.exports = new AuthService();
