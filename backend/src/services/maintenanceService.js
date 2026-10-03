const Maintenance = require('../models/Maintenance');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { createNotification } = require('./notificationService');
const { logActivity } = require('./activityService');

const reportMaintenance = async (userId, data) => {
  const { resourceId, issue, priority } = data;

  const resource = await Resource.findById(resourceId);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  const maintenance = await Maintenance.create({
    resource: resourceId,
    reportedBy: userId,
    issue,
    priority: priority || 'MEDIUM',
    status: 'PENDING'
  });

  // Resource status transitions to UNDER_MAINTENANCE
  resource.status = 'UNDER_MAINTENANCE';
  await resource.save();

  // Notify Admins
  const admins = await User.find({ role: 'ADMIN', isActive: true });
  for (const admin of admins) {
    await createNotification(
      admin._id,
      `New maintenance issue reported for ${resource.name} (${resource.resourceId}): ${issue}`,
      'MAINTENANCE'
    );
  }

  await logActivity(
    userId,
    'REPORT_MAINTENANCE',
    'Maintenance',
    maintenance._id,
    `Reported maintenance issue on ${resource.name} (${resource.resourceId})`
  );

  return await maintenance.populate([
    { path: 'resource', select: 'name resourceId category location status' },
    { path: 'reportedBy', select: 'name email department' }
  ]);
};

const getMaintenanceList = async (user, query = {}) => {
  const filter = {};

  if (user.role === 'EMPLOYEE') {
    filter.reportedBy = user._id;
  }

  if (query.status) {
    filter.status = query.status;
  }
  if (query.priority) {
    filter.priority = query.priority;
  }
  if (query.resourceId) {
    filter.resource = query.resourceId;
  }

  return await Maintenance.find(filter)
    .populate('resource', 'name resourceId category location status')
    .populate('reportedBy', 'name email department')
    .sort({ createdAt: -1 });
};

const getMaintenanceById = async (id, user) => {
  const record = await Maintenance.findById(id)
    .populate('resource', 'name resourceId category location status')
    .populate('reportedBy', 'name email department');

  if (!record) {
    const error = new Error('Maintenance record not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'EMPLOYEE' && record.reportedBy._id.toString() !== user._id.toString()) {
    const error = new Error('Unauthorized to view this maintenance record');
    error.statusCode = 403;
    throw error;
  }

  return record;
};

const updateMaintenanceStatus = async (id, adminId, status, resolutionNote) => {
  const record = await Maintenance.findById(id).populate('resource');
  if (!record) {
    const error = new Error('Maintenance record not found');
    error.statusCode = 404;
    throw error;
  }

  const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED'];
  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  record.status = status;
  if (resolutionNote) {
    record.resolutionNote = resolutionNote;
  }

  const resource = await Resource.findById(record.resource._id);

  if (status === 'RESOLVED') {
    record.resolvedAt = new Date();
    // After resolution, resource returns to AVAILABLE
    if (resource) {
      resource.status = 'AVAILABLE';
      await resource.save();
    }
  } else if (status === 'IN_PROGRESS') {
    if (resource) {
      resource.status = 'UNDER_MAINTENANCE';
      await resource.save();
    }
  }

  await record.save();

  // Notify reporter
  await createNotification(
    record.reportedBy,
    `Maintenance issue for "${record.resource.name}" updated to ${status}${resolutionNote ? `: ${resolutionNote}` : ''}`,
    'MAINTENANCE'
  );

  await logActivity(
    adminId,
    'UPDATE_MAINTENANCE',
    'Maintenance',
    record._id,
    `Admin updated maintenance on ${record.resource.name} to ${status}`
  );

  return record;
};

module.exports = {
  reportMaintenance,
  getMaintenanceList,
  getMaintenanceById,
  updateMaintenanceStatus
};
