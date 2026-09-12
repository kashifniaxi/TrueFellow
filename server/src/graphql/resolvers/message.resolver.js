import {
  sendMessage,
  getConversation,
  getMyConversations,
  getUnreadCount,
} from '../../services/message.service.js';

export default {
  Query: {
    conversation: async (_, { otherUserId, page, limit }, { user }) =>
      getConversation(user._id, otherUserId, { page, limit }),

    myConversations: async (_, __, { user }) =>
      getMyConversations(user._id),

    unreadMessageCount: async (_, __, { user }) =>
      getUnreadCount(user._id),
  },

  Mutation: {
    sendMessage: async (_, { input }, { user }) =>
      sendMessage(user._id, input),
  },
};
