import dashboardService from '../services/dashboardService.js';
import ApiResponse from '../utils/apiResponse.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getAdminDashboard();
    return ApiResponse.success(res, 'Admin dashboard summary retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getEmployeeDashboard(req.user._id);
    return ApiResponse.success(res, 'Employee dashboard summary retrieved', data);
  } catch (error) {
    next(error);
  }
};

export default {
  getAdminDashboard,
  getEmployeeDashboard
};
