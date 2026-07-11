import {
  getPlatformStats,
  getOrganizerStats,
} from '../../services/analytics.service.js';

export default {
  Query: {
    platformStats:    async () => getPlatformStats(),
    myOrganizerStats: async (_, __, { user }) => getOrganizerStats(user._id),
  },
};
