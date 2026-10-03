const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, entity, entityId, description) => {
  try {
    return await ActivityLog.create({
      user: userId,
      action,
      entity,
      entityId: entityId ? entityId.toString() : '',
      description
    });
  } catch (error) {
    console.error(`[ActivityLog Error] Failed to log activity: ${error.message}`);
  }
};

const getActivityLogs = async (limit = 100) => {
  return await ActivityLog.find()
    .populate('user', 'name email role')
    .sort({ timestamp: -1 })
    .limit(limit);
};

module.exports = {
  logActivity,
  getActivityLogs
};
