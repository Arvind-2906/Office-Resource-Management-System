import ResourceRequest from '../models/ResourceRequest.js';
import Resource from '../models/Resource.js';
import Allocation from '../models/Allocation.js';
import { createNotification } from './notificationService.js';
import { logActivity } from './activityService.js';

export const createRequest = async (employeeId, resourceId, reason) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (resource.status !== 'AVAILABLE') {
    const error = new Error(`Resource is currently ${resource.status} and cannot be requested.`);
    error.statusCode = 400;
    throw error;
  }

  // Check if employee already has a pending request for this resource
  const existingPending = await ResourceRequest.findOne({
    employee: employeeId,
    resource: resourceId,
    status: 'PENDING'
  });

  if (existingPending) {
    const error = new Error('You already have a pending request for this resource');
    error.statusCode = 409;
    throw error;
  }

  const request = await ResourceRequest.create({
    employee: employeeId,
    resource: resourceId,
    reason,
    status: 'PENDING'
  });

  await logActivity(
    employeeId,
    'SUBMIT_REQUEST',
    'ResourceRequest',
    request._id,
    `Submitted request for resource: ${resource.name} (${resource.resourceId})`
  );

  return await request.populate([
    { path: 'resource', select: 'name resourceId category location status' },
    { path: 'employee', select: 'name email department' }
  ]);
};

export const getRequests = async (user, query = {}) => {
  const filter = {};

  // Employees can only see their own requests
  if (user.role === 'EMPLOYEE') {
    filter.employee = user._id;
  } else if (query.employeeId) {
    filter.employee = query.employeeId;
  }

  if (query.status) {
    filter.status = query.status;
  }

  return await ResourceRequest.find(filter)
    .populate('resource', 'name resourceId category location status isBookable')
    .populate('employee', 'name email department')
    .populate('reviewedBy', 'name email')
    .sort({ requestedAt: -1 });
};

export const getRequestById = async (id, user) => {
  const request = await ResourceRequest.findById(id)
    .populate('resource', 'name resourceId category location status')
    .populate('employee', 'name email department')
    .populate('reviewedBy', 'name email');

  if (!request) {
    const error = new Error('Resource request not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'EMPLOYEE' && request.employee._id.toString() !== user._id.toString()) {
    const error = new Error('Unauthorized to view this request');
    error.statusCode = 403;
    throw error;
  }

  return request;
};

export const approveRequest = async (requestId, adminId, expectedReturnDate, notes) => {
  const request = await ResourceRequest.findById(requestId).populate('resource');
  if (!request) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error(`Request has already been processed (status: ${request.status})`);
    error.statusCode = 400;
    throw error;
  }

  const resource = await Resource.findById(request.resource._id);
  if (!resource || resource.status !== 'AVAILABLE') {
    const error = new Error(
      `Cannot allocate: Resource is currently ${resource ? resource.status : 'not found'}. Duplicate allocation prevented.`
    );
    error.statusCode = 409;
    throw error;
  }

  // Update request
  request.status = 'APPROVED';
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  await request.save();

  // Create Allocation
  const allocation = await Allocation.create({
    resource: resource._id,
    employee: request.employee,
    request: request._id,
    allocatedBy: adminId,
    allocatedAt: new Date(),
    expectedReturnDate: expectedReturnDate || null,
    status: 'ACTIVE',
    notes: notes || ''
  });

  // Update Resource status to ALLOCATED
  resource.status = 'ALLOCATED';
  await resource.save();

  // Notify employee
  await createNotification(
    request.employee,
    `Your request for resource "${resource.name} (${resource.resourceId})" has been approved and allocated.`,
    'REQUEST'
  );

  // Log activity
  await logActivity(
    adminId,
    'APPROVE_REQUEST',
    'ResourceRequest',
    request._id,
    `Admin approved request for resource ${resource.resourceId} to user ${request.employee}`
  );

  return { request, allocation };
};

export const rejectRequest = async (requestId, adminId, rejectionReason) => {
  const request = await ResourceRequest.findById(requestId).populate('resource');
  if (!request) {
    const error = new Error('Request not found');
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== 'PENDING') {
    const error = new Error(`Request has already been processed (status: ${request.status})`);
    error.statusCode = 400;
    throw error;
  }

  request.status = 'REJECTED';
  request.reviewedBy = adminId;
  request.reviewedAt = new Date();
  request.rejectionReason = rejectionReason || 'Request rejected by administrator';
  await request.save();

  // Notify employee
  await createNotification(
    request.employee,
    `Your request for resource "${request.resource.name}" was rejected. Reason: ${request.rejectionReason}`,
    'REQUEST'
  );

  // Log activity
  await logActivity(
    adminId,
    'REJECT_REQUEST',
    'ResourceRequest',
    request._id,
    `Admin rejected request for resource ${request.resource.resourceId}`
  );

  return request;
};

export default {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest
};
