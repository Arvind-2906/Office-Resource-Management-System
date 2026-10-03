const authService = require('../services/authService');
const { sendTokenResponse } = require('../utils/jwt');
const ApiResponse = require('../utils/apiResponse');

const signup = async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    return sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    return sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true
  });
  return ApiResponse.success(res, 'Logged out successfully', {});
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user._id);
    return ApiResponse.success(res, 'Current user profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe
};
