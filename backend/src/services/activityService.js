import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, action, entity, entityId, description) => {
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

export const getActivityLogs = async (limit = 100) => {
  return await ActivityLog.find()
    .populate('user', 'name email role')
    .sort({ timestamp: -1 })
    .limit(limit);
};

export default {
  logActivity,
  getActivityLogs
};
