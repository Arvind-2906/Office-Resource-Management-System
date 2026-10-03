const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const { createNotification } = require('./notificationService');
const { logActivity } = require('./activityService');

const createBooking = async (userId, userRole, bookingData) => {
  const { resourceId, title, date, startTime, endTime } = bookingData;

  // Validate start time < end time
  if (startTime >= endTime) {
    const error = new Error('Booking start time must be before end time');
    error.statusCode = 400;
    throw error;
  }

  const resource = await Resource.findById(resourceId);
  if (!resource) {
    const error = new Error('Resource not found');
    error.statusCode = 404;
    throw error;
  }

  if (!resource.isBookable) {
    const error = new Error(`Resource "${resource.name}" is not designated as a shared/bookable resource`);
    error.statusCode = 400;
    throw error;
  }

  if (resource.status === 'UNDER_MAINTENANCE') {
    const error = new Error('Cannot book resource: Currently under maintenance');
    error.statusCode = 400;
    throw error;
  }

  if (resource.status === 'INACTIVE') {
    const error = new Error('Cannot book resource: Resource is inactive');
    error.statusCode = 400;
    throw error;
  }

  // Check for overlapping bookings on the same resource and date
  // Overlap condition: (newStart < existingEnd) && (newEnd > existingStart)
  const existingBookings = await Booking.find({
    resource: resourceId,
    date,
    status: { $in: ['UPCOMING', 'ONGOING'] }
  });

  const hasOverlap = existingBookings.some((b) => {
    return startTime < b.endTime && endTime > b.startTime;
  });

  if (hasOverlap) {
    const error = new Error(
      `Booking conflict: Resource "${resource.name}" is already booked during this time window on ${date}.`
    );
    error.statusCode = 409;
    throw error;
  }

  const booking = await Booking.create({
    resource: resourceId,
    bookedBy: userId,
    title,
    date,
    startTime,
    endTime,
    status: 'UPCOMING'
  });

  await createNotification(
    userId,
    `Booking confirmed for "${resource.name}" on ${date} from ${startTime} to ${endTime}`,
    'BOOKING'
  );

  await logActivity(
    userId,
    'CREATE_BOOKING',
    'Booking',
    booking._id,
    `Booked resource ${resource.name} (${date} ${startTime}-${endTime})`
  );

  return await booking.populate([
    { path: 'resource', select: 'name resourceId category location isBookable' },
    { path: 'bookedBy', select: 'name email department' }
  ]);
};

const getBookings = async (user, query = {}) => {
  const filter = {};

  if (user.role === 'EMPLOYEE') {
    filter.bookedBy = user._id;
  } else if (query.bookedBy) {
    filter.bookedBy = query.bookedBy;
  }

  if (query.resourceId) {
    filter.resource = query.resourceId;
  }
  if (query.date) {
    filter.date = query.date;
  }
  if (query.status) {
    filter.status = query.status;
  }

  return await Booking.find(filter)
    .populate('resource', 'name resourceId category location isBookable')
    .populate('bookedBy', 'name email department')
    .sort({ date: 1, startTime: 1 });
};

const getBookingById = async (id, user) => {
  const booking = await Booking.findById(id)
    .populate('resource', 'name resourceId category location isBookable')
    .populate('bookedBy', 'name email department');

  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'EMPLOYEE' && booking.bookedBy._id.toString() !== user._id.toString()) {
    const error = new Error('Unauthorized to view this booking');
    error.statusCode = 403;
    throw error;
  }

  return booking;
};

const cancelBooking = async (id, user) => {
  const booking = await Booking.findById(id).populate('resource');
  if (!booking) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'EMPLOYEE' && booking.bookedBy.toString() !== user._id.toString()) {
    const error = new Error('You can only cancel your own bookings');
    error.statusCode = 403;
    throw error;
  }

  if (booking.status === 'CANCELLED') {
    const error = new Error('Booking is already cancelled');
    error.statusCode = 400;
    throw error;
  }

  booking.status = 'CANCELLED';
  await booking.save();

  await createNotification(
    booking.bookedBy,
    `Your booking for "${booking.resource.name}" on ${booking.date} (${booking.startTime}-${booking.endTime}) was cancelled.`,
    'BOOKING'
  );

  await logActivity(
    user._id,
    'CANCEL_BOOKING',
    'Booking',
    booking._id,
    `${user.role} cancelled booking for ${booking.resource.name}`
  );

  return booking;
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
};
