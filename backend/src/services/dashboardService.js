const Resource = require('../models/Resource');
const ResourceRequest = require('../models/ResourceRequest');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

const getAdminDashboard = async () => {
  const [
    totalResources,
    availableResources,
    allocatedResources,
    pendingRequests,
    activeBookings,
    openMaintenance,
    recentActivity
  ] = await Promise.all([
    Resource.countDocuments(),
    Resource.countDocuments({ status: 'AVAILABLE' }),
    Resource.countDocuments({ status: 'ALLOCATED' }),
    ResourceRequest.countDocuments({ status: 'PENDING' }),
    Booking.countDocuments({ status: { $in: ['UPCOMING', 'ONGOING'] } }),
    Maintenance.countDocuments({ status: { $in: ['PENDING', 'IN_PROGRESS'] } }),
    ActivityLog.find().populate('user', 'name email role').sort({ timestamp: -1 }).limit(8)
  ]);

  return {
    metrics: {
      totalResources,
      availableResources,
      allocatedResources,
      pendingRequests,
      activeBookings,
      openMaintenance
    },
    recentActivity
  };
};

const getEmployeeDashboard = async (employeeId) => {
  const [
    myAllocations,
    myPendingRequests,
    myActiveBookings,
    myMaintenanceReports,
    unreadNotifications
  ] = await Promise.all([
    Allocation.find({ employee: employeeId, status: { $in: ['ACTIVE', 'RETURN_REQUESTED'] } })
      .populate('resource', 'name resourceId category location status')
      .sort({ allocatedAt: -1 }),
    ResourceRequest.find({ employee: employeeId, status: 'PENDING' })
      .populate('resource', 'name resourceId category location status')
      .sort({ requestedAt: -1 }),
    Booking.find({ bookedBy: employeeId, status: { $in: ['UPCOMING', 'ONGOING'] } })
      .populate('resource', 'name resourceId category location')
      .sort({ date: 1, startTime: 1 }),
    Maintenance.find({ reportedBy: employeeId, status: { $in: ['PENDING', 'IN_PROGRESS'] } })
      .populate('resource', 'name resourceId category')
      .sort({ createdAt: -1 }),
    Notification.countDocuments({ user: employeeId, isRead: false })
  ]);

  return {
    counts: {
      allocatedCount: myAllocations.length,
      pendingRequestsCount: myPendingRequests.length,
      activeBookingsCount: myActiveBookings.length,
      maintenanceCount: myMaintenanceReports.length,
      unreadNotifications
    },
    myAllocations,
    myPendingRequests,
    myActiveBookings,
    myMaintenanceReports
  };
};

module.exports = {
  getAdminDashboard,
  getEmployeeDashboard
};
