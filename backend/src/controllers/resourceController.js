import resourceService from '../services/resourceService.js';
import ApiResponse from '../utils/apiResponse.js';

export const getAllResources = async (req, res, next) => {
  try {
    const resources = await resourceService.getAllResources(req.query);
    return ApiResponse.success(res, 'Resources retrieved successfully', { resources });
  } catch (error) {
    next(error);
  }
};

export const getResourceById = async (req, res, next) => {
  try {
    const resource = await resourceService.getResourceById(req.params.id);
    return ApiResponse.success(res, 'Resource details retrieved', { resource });
  } catch (error) {
    next(error);
  }
};

export const createResource = async (req, res, next) => {
  try {
    const resource = await resourceService.createResource(req.body, req.user._id);
    return ApiResponse.created(res, 'Resource created successfully', { resource });
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (req, res, next) => {
  try {
    const resource = await resourceService.updateResource(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, 'Resource updated successfully', { resource });
  } catch (error) {
    next(error);
  }
};

export const updateResourceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const resource = await resourceService.updateResourceStatus(req.params.id, status, req.user._id);
    return ApiResponse.success(res, `Resource status updated to ${status}`, { resource });
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (req, res, next) => {
  try {
    const result = await resourceService.deleteResource(req.params.id, req.user._id);
    return ApiResponse.success(res, result.message, {});
  } catch (error) {
    next(error);
  }
};

export default {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  updateResourceStatus,
  deleteResource
};
