import Notification from '../models/Notification.js';

export const createNotification = async (userId, message, type = 'SYSTEM') => {
  try {
    const notification = await Notification.create({
      user: userId,
      message,
      type
    });
    return notification;
  } catch (error) {
    console.error(`[Notification Error] Failed to create notification: ${error.message}`);
  }
};

export const getUserNotifications = async (userId) => {
  return await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
};

export const markAsRead = async (notificationId, userId) => {
  return await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead
};
