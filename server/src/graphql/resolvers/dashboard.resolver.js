import {
  getUserDashboard,
  getOrganizerDashboard,
  getAdminDashboard,
} from '../../services/dashboard.service.js';

export default {
  Query: {
    myDashboard:        async (_, __, { user }) => getUserDashboard(user._id),
    organizerDashboard: async (_, __, { user }) => getOrganizerDashboard(user._id),
    adminDashboard:     async ()                => getAdminDashboard(),
  },
};
