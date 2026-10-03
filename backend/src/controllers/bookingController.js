const bookingService = require('../services/bookingService');
const ApiResponse = require('../utils/apiResponse');

const createBooking = async (req, res, next) => {
  try {
    const { resourceId, title, date, startTime, endTime } = req.body;
    if (!resourceId || !title || !date || !startTime || !endTime) {
      return ApiResponse.badRequest(res, 'resourceId, title, date, startTime, and endTime are required');
    }

    const booking = await bookingService.createBooking(req.user._id, req.user.role, req.body);
    return ApiResponse.created(res, 'Booking created successfully', { booking });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getBookings(req.user, req.query);
    return ApiResponse.success(res, 'Bookings retrieved successfully', { bookings });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    return ApiResponse.success(res, 'Booking retrieved successfully', { booking });
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);
    return ApiResponse.success(res, 'Booking cancelled successfully', { booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
