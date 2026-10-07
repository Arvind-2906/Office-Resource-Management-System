import activityService from '../services/activityService.js';
import ApiResponse from '../utils/apiResponse.js';

export const getActivityLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = await activityService.getActivityLogs(limit);
    return ApiResponse.success(res, 'Activity logs retrieved', { logs });
  } catch (error) {
    next(error);
  }
};

export default {
  getActivityLogs
};
