const Allocation = require('../models/Allocation');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { createNotification } = require('./notificationService');
const { logActivity } = require('./activityService');

const getAllocations = async (user, query = {}) => {
  const filter = {};

  if (user.role === 'EMPLOYEE') {
    filter.employee = user._id;
  } else if (query.employeeId) {
    filter.employee = query.employeeId;
  }

  if (query.status) {
    filter.status = query.status;
  }
  if (query.resourceId) {
    filter.resource = query.resourceId;
  }

  return await Allocation.find(filter)
    .populate('resource', 'name resourceId category location status isBookable')
    .populate('employee', 'name email department phone')
    .populate('allocatedBy', 'name email')
    .sort({ allocatedAt: -1 });
};

const getAllocationById = async (id, user) => {
  const allocation = await Allocation.findById(id)
    .populate('resource', 'name resourceId category location status')
    .populate('employee', 'name email department phone')
    .populate('allocatedBy', 'name email');

  if (!allocation) {
    const error = new Error('Allocation record not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'EMPLOYEE' && allocation.employee._id.toString() !== user._id.toString()) {
    const error = new Error('Unauthorized to view this allocation');
    error.statusCode = 403;
    throw error;
  }

  return allocation;
};

const createDirectAllocation = async (resourceId, employeeId, adminId, expectedReturnDate, notes) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (resource.status !== 'AVAILABLE') {
    const error = new Error(`Resource is currently ${resource.status}. Cannot allocate.`);
    error.statusCode = 409;
    throw error;
  }

  const employee = await User.findById(employeeId);
  if (!employee || !employee.isActive) {
    const error = new Error('Target employee not found or inactive');
    error.statusCode = 400;
    throw error;
  }

  const allocation = await Allocation.create({
    resource: resource._id,
    employee: employeeId,
    allocatedBy: adminId,
    allocatedAt: new Date(),
    expectedReturnDate: expectedReturnDate || null,
    status: 'ACTIVE',
    notes: notes || ''
  });

  resource.status = 'ALLOCATED';
  await resource.save();

  await createNotification(
    employeeId,
    `Resource "${resource.name} (${resource.resourceId})" has been directly allocated to you by Admin.`,
    'ALLOCATION'
  );

  await logActivity(
    adminId,
    'DIRECT_ALLOCATE',
    'Allocation',
    allocation._id,
    `Admin directly allocated ${resource.resourceId} to ${employee.name}`
  );

  return allocation;
};

const requestReturn = async (allocationId, employeeId, returnNotes) => {
  const allocation = await Allocation.findById(allocationId).populate('resource');
  if (!allocation) {
    const error = new Error('Allocation not found');
    error.statusCode = 404;
    throw error;
  }

  if (allocation.employee.toString() !== employeeId.toString()) {
    const error = new Error('You can only request return for your own allocations');
    error.statusCode = 403;
    throw error;
  }

  if (allocation.status !== 'ACTIVE') {
    const error = new Error(`Return request cannot be made for an allocation that is ${allocation.status}`);
    error.statusCode = 400;
    throw error;
  }

  allocation.status = 'RETURN_REQUESTED';
  if (returnNotes) {
    allocation.notes = allocation.notes ? `${allocation.notes} | Return note: ${returnNotes}` : `Return note: ${returnNotes}`;
  }
  await allocation.save();

  // Notify Admins
  const admins = await User.find({ role: 'ADMIN', isActive: true });
  for (const admin of admins) {
    await createNotification(
      admin._id,
      `Employee submitted a return request for resource: ${allocation.resource.name} (${allocation.resource.resourceId})`,
      'ALLOCATION'
    );
  }

  await logActivity(
    employeeId,
    'REQUEST_RETURN',
    'Allocation',
    allocation._id,
    `Employee requested return for resource ${allocation.resource.resourceId}`
  );

  return allocation;
};

const confirmReturn = async (allocationId, adminId, conditionNotes) => {
  const allocation = await Allocation.findById(allocationId).populate('resource');
  if (!allocation) {
    const error = new Error('Allocation not found');
    error.statusCode = 404;
    throw error;
  }

  if (allocation.status === 'RETURNED') {
    const error = new Error('This resource has already been marked as returned');
    error.statusCode = 400;
    throw error;
  }

  allocation.status = 'RETURNED';
  allocation.returnedAt = new Date();
  if (conditionNotes) {
    allocation.notes = allocation.notes ? `${allocation.notes} | Return Condition: ${conditionNotes}` : `Return Condition: ${conditionNotes}`;
  }
  await allocation.save();

  // Reset resource status to AVAILABLE
  const resource = await Resource.findById(allocation.resource._id);
  if (resource) {
    resource.status = 'AVAILABLE';
    await resource.save();
  }

  // Notify employee
  await createNotification(
    allocation.employee,
    `Return confirmed for resource "${allocation.resource.name} (${allocation.resource.resourceId})". Status is now AVAILABLE.`,
    'ALLOCATION'
  );

  await logActivity(
    adminId,
    'CONFIRM_RETURN',
    'Allocation',
    allocation._id,
    `Admin confirmed return for resource ${allocation.resource.resourceId}`
  );

  return allocation;
};

module.exports = {
  getAllocations,
  getAllocationById,
  createDirectAllocation,
  requestReturn,
  confirmReturn
};
