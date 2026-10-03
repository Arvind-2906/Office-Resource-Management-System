const requestService = require('../services/requestService');
const ApiResponse = require('../utils/apiResponse');

const createRequest = async (req, res, next) => {
  try {
    const { resourceId, reason } = req.body;
    if (!resourceId || !reason) {
      return ApiResponse.badRequest(res, 'Resource ID and reason are required');
    }
    const request = await requestService.createRequest(req.user._id, resourceId, reason);
    return ApiResponse.created(res, 'Resource request submitted successfully', { request });
  } catch (error) {
    next(error);
  }
};

const getRequests = async (req, res, next) => {
  try {
    const requests = await requestService.getRequests(req.user, req.query);
    return ApiResponse.success(res, 'Requests retrieved successfully', { requests });
  } catch (error) {
    next(error);
  }
};

const getRequestById = async (req, res, next) => {
  try {
    const request = await requestService.getRequestById(req.params.id, req.user);
    return ApiResponse.success(res, 'Request details retrieved', { request });
  } catch (error) {
    next(error);
  }
};

const approveRequest = async (req, res, next) => {
  try {
    const { expectedReturnDate, notes } = req.body;
    const result = await requestService.approveRequest(req.params.id, req.user._id, expectedReturnDate, notes);
    return ApiResponse.success(res, 'Request approved and resource allocated successfully', result);
  } catch (error) {
    next(error);
  }
};

const rejectRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const request = await requestService.rejectRequest(req.params.id, req.user._id, rejectionReason);
    return ApiResponse.success(res, 'Request rejected', { request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest
};
