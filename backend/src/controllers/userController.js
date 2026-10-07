import userService from '../services/userService.js';
import ApiResponse from '../utils/apiResponse.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req.query);
    return ApiResponse.success(res, 'Users retrieved successfully', { users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return ApiResponse.success(res, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body, req.user._id);
    return ApiResponse.created(res, 'User created successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await userService.updateUserStatus(req.params.id, isActive, req.user._id);
    return ApiResponse.success(res, `User ${isActive ? 'activated' : 'deactivated'} successfully`, { user });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus
};
