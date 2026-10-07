import bookingService from '../services/bookingService.js';
import ApiResponse from '../utils/apiResponse.js';

export const createBooking = async (req, res, next) => {
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

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getBookings(req.user, req.query);
    return ApiResponse.success(res, 'Bookings retrieved successfully', { bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    return ApiResponse.success(res, 'Booking retrieved successfully', { booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user);
    return ApiResponse.success(res, 'Booking cancelled successfully', { booking });
  } catch (error) {
    next(error);
  }
};

export default {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
