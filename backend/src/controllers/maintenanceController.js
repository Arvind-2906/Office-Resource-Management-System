import maintenanceService from '../services/maintenanceService.js';
import ApiResponse from '../utils/apiResponse.js';

export const reportMaintenance = async (req, res, next) => {
  try {
    const { resourceId, issue, priority } = req.body;
    if (!resourceId || !issue) {
      return ApiResponse.badRequest(res, 'resourceId and issue description are required');
    }

    const record = await maintenanceService.reportMaintenance(req.user._id, req.body);
    return ApiResponse.created(res, 'Maintenance issue reported successfully', { record });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceList = async (req, res, next) => {
  try {
    const records = await maintenanceService.getMaintenanceList(req.user, req.query);
    return ApiResponse.success(res, 'Maintenance records retrieved successfully', { records });
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceById = async (req, res, next) => {
  try {
    const record = await maintenanceService.getMaintenanceById(req.params.id, req.user);
    return ApiResponse.success(res, 'Maintenance record retrieved successfully', { record });
  } catch (error) {
    next(error);
  }
};

export const updateMaintenanceStatus = async (req, res, next) => {
  try {
    const { status, resolutionNote } = req.body;
    if (!status) {
      return ApiResponse.badRequest(res, 'status is required (PENDING, IN_PROGRESS, RESOLVED)');
    }

    const record = await maintenanceService.updateMaintenanceStatus(
      req.params.id,
      req.user._id,
      status,
      resolutionNote
    );
    return ApiResponse.success(res, 'Maintenance status updated successfully', { record });
  } catch (error) {
    next(error);
  }
};

export default {
  reportMaintenance,
  getMaintenanceList,
  getMaintenanceById,
  updateMaintenanceStatus
};
