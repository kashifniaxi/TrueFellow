import {
  applyForOrganizer,
  approveOrganizer,
  rejectOrganizer,
  listPendingApplications,
  suspendUser,
  activateUser,
  listAllUsers,
} from '../../services/user.service.js';

export default {
  Query: {
    pendingApplications: async (_, { page, limit }) =>
      listPendingApplications({ page, limit }),

    allUsers: async (_, { page, limit, role, isActive }) =>
      listAllUsers({ page, limit, role, isActive }),
  },

  Mutation: {
    applyForOrganizer: async (_, { input }, { user }) =>
      applyForOrganizer(user._id, input),

    approveOrganizer: async (_, { userId }, { user }) =>
      approveOrganizer(user._id, userId),

    rejectOrganizer: async (_, { userId, reason }, { user }) =>
      rejectOrganizer(user._id, userId, reason),

    suspendUser: async (_, { userId, reason }, { user }) =>
      suspendUser(user._id, userId, reason),

    activateUser: async (_, { userId }) =>
      activateUser(userId),
  },
};
