const dashboardService = require('../services/dashboardService');
const ApiResponse = require('../utils/apiResponse');

const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    return ApiResponse.success(res, 'Admin dashboard summary retrieved', data);
  } catch (error) {
    next(error);
  }
};

const getEmployeeDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getEmployeeDashboard(req.user._id);
    return ApiResponse.success(res, 'Employee dashboard summary retrieved', data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getEmployeeDashboard
};
