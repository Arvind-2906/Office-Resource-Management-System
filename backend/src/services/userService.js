import User from '../models/User.js';
import { logActivity } from './activityService.js';

export const getAllUsers = async (query = {}) => {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.department) filter.department = query.department;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } }
    ];
  }
  return await User.find(filter).sort({ createdAt: -1 });
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const createUser = async (userData, adminId) => {
  const { name, email, password, role, department, phone } = userData;

  const existing = await User.findOne({ email });
  if (existing) {
    const error = new Error('User with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({
    name,
    email,
    password: password || 'Welcome@123',
    role: role || 'EMPLOYEE',
    department: department || 'General',
    phone: phone || '',
    isActive: true
  });

  await logActivity(adminId, 'CREATE_USER', 'User', user._id, `Admin created user: ${user.name} (${user.email})`);
  return user;
};

export const updateUser = async (id, updateData, adminId) => {
  // Prevent password update through generic update
  delete updateData.password;

  const user = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await logActivity(adminId, 'UPDATE_USER', 'User', user._id, `Admin updated user details for: ${user.email}`);
  return user;
};

export const updateUserStatus = async (id, isActive, adminId) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.isActive = isActive;
  await user.save();

  const statusText = isActive ? 'activated' : 'deactivated';
  await logActivity(adminId, 'UPDATE_USER_STATUS', 'User', user._id, `Admin ${statusText} user: ${user.email}`);
  return user;
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus
};
