import Notification from '../models/Notification.model.js';
import { NotFoundError } from '../utils/errors.js';

// ─── Create Notification (internal use) ──────────────────────────────────────

export const createNotification = async (recipientId, { type, title, message, metadata = {} }) => {
  return Notification.create({ recipient: recipientId, type, title, message, metadata });
};

// ─── Get My Notifications ─────────────────────────────────────────────────────

export const getMyNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const filter = { recipient: userId };
  if (unreadOnly) filter.isRead = false;

  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return { notifications, total, unreadCount, page, totalPages: Math.ceil(total / limit) };
};

// ─── Mark One as Read ─────────────────────────────────────────────────────────

export const markNotificationRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new NotFoundError('Notification');
  return notification;
};

// ─── Mark All as Read ─────────────────────────────────────────────────────────

export const markAllNotificationsRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  return true;
};
