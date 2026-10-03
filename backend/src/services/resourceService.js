const Resource = require('../models/Resource');
const { logActivity } = require('./activityService');

const getAllResources = async (query = {}) => {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }
  if (query.status) {
    filter.status = query.status;
  }
  if (query.isBookable !== undefined) {
    filter.isBookable = query.isBookable === 'true' || query.isBookable === true;
  }
  if (query.location) {
    filter.location = { $regex: query.location, $options: 'i' };
  }
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { resourceId: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } }
    ];
  }

  return await Resource.find(filter)
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

const getResourceById = async (id) => {
  const resource = await Resource.findById(id).populate('createdBy', 'name email');
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }
  return resource;
};

const createResource = async (resourceData, adminId) => {
  const existing = await Resource.findOne({ resourceId: resourceData.resourceId.toUpperCase() });
  if (existing) {
    const error = new Error(`Resource with ID '${resourceData.resourceId}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  const resource = await Resource.create({
    ...resourceData,
    resourceId: resourceData.resourceId.toUpperCase(),
    createdBy: adminId
  });

  await logActivity(adminId, 'CREATE_RESOURCE', 'Resource', resource._id, `Admin created resource: ${resource.name} (${resource.resourceId})`);
  return resource;
};

const updateResource = async (id, updateData, adminId) => {
  if (updateData.resourceId) {
    updateData.resourceId = updateData.resourceId.toUpperCase();
    const existing = await Resource.findOne({ resourceId: updateData.resourceId, _id: { $ne: id } });
    if (existing) {
      const error = new Error(`Resource with ID '${updateData.resourceId}' already exists`);
      error.statusCode = 409;
      throw error;
    }
  }

  const resource = await Resource.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  await logActivity(adminId, 'UPDATE_RESOURCE', 'Resource', resource._id, `Admin updated resource: ${resource.name} (${resource.resourceId})`);
  return resource;
};

const updateResourceStatus = async (id, status, adminId) => {
  const validStatuses = ['AVAILABLE', 'ALLOCATED', 'BOOKED', 'UNDER_MAINTENANCE', 'INACTIVE'];
  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const resource = await Resource.findById(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  resource.status = status;
  await resource.save();

  await logActivity(adminId, 'UPDATE_RESOURCE_STATUS', 'Resource', resource._id, `Resource ${resource.resourceId} status changed to ${status}`);
  return resource;
};

const deleteResource = async (id, adminId) => {
  const resource = await Resource.findById(id);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (resource.status === 'ALLOCATED' || resource.status === 'BOOKED') {
    const error = new Error(`Cannot delete resource while it is ${resource.status}`);
    error.statusCode = 400;
    throw error;
  }

  await Resource.findByIdAndDelete(id);
  await logActivity(adminId, 'DELETE_RESOURCE', 'Resource', id, `Admin deleted resource: ${resource.name} (${resource.resourceId})`);
  return { message: 'Resource deleted successfully' };
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  updateResourceStatus,
  deleteResource
};
