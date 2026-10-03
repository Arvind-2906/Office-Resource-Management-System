const activityService = require('../services/activityService');
const ApiResponse = require('../utils/apiResponse');

const getActivityLogs = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = await activityService.getActivityLogs(limit);
    return ApiResponse.success(res, 'Activity logs retrieved', { logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs
};
