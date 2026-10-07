import allocationService from '../services/allocationService.js';
import ApiResponse from '../utils/apiResponse.js';

export const getAllocations = async (req, res, next) => {
  try {
    const allocations = await allocationService.getAllocations(req.user, req.query);
    return ApiResponse.success(res, 'Allocations retrieved successfully', { allocations });
  } catch (error) {
    next(error);
  }
};

export const getAllocationById = async (req, res, next) => {
  try {
    const allocation = await allocationService.getAllocationById(req.params.id, req.user);
    return ApiResponse.success(res, 'Allocation details retrieved', { allocation });
  } catch (error) {
    next(error);
  }
};

export const createAllocation = async (req, res, next) => {
  try {
    const { resourceId, employeeId, expectedReturnDate, notes } = req.body;
    if (!resourceId || !employeeId) {
      return ApiResponse.badRequest(res, 'Resource ID and Employee ID are required');
    }
    const allocation = await allocationService.createDirectAllocation(
      resourceId,
      employeeId,
      req.user._id,
      expectedReturnDate,
      notes
    );
    return ApiResponse.created(res, 'Resource directly allocated successfully', { allocation });
  } catch (error) {
    next(error);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const { returnNotes } = req.body;
    const allocation = await allocationService.requestReturn(req.params.id, req.user._id, returnNotes);
    return ApiResponse.success(res, 'Return request submitted successfully', { allocation });
  } catch (error) {
    next(error);
  }
};

export const confirmReturn = async (req, res, next) => {
  try {
    const { conditionNotes } = req.body;
    const allocation = await allocationService.confirmReturn(req.params.id, req.user._id, conditionNotes);
    return ApiResponse.success(res, 'Resource return confirmed. Status set to AVAILABLE.', { allocation });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllocations,
  getAllocationById,
  createAllocation,
  requestReturn,
  confirmReturn
};
