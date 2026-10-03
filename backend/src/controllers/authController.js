const authService = require('../services/authService');
const { setTokenCookie, clearTokenCookie } = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const { user, token } = await authService.register({ name, email, password, phone });

    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null
  });
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Current user profile fetched successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const user = await authService.updateUserAddress(req.user._id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Address added successfully',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  addAddress
};
