import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notification.service.js';

export default {
  Query: {
    myNotifications: async (_, { page, limit, unreadOnly }, { user }) =>
      getMyNotifications(user._id, { page, limit, unreadOnly }),
  },

  Mutation: {
    markNotificationRead: async (_, { notificationId }, { user }) =>
      markNotificationRead(user._id, notificationId),

    markAllNotificationsRead: async (_, __, { user }) =>
      markAllNotificationsRead(user._id),
  },
};
