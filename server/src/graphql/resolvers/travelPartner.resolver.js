import {
  matchCompanions,
  toggleCompanionMatching,
} from '../../services/travelPartner.service.js';

export default {
  Query: {
    matchCompanions: async (_, { tourId }, { user }) =>
      matchCompanions(user._id, tourId),
  },

  Mutation: {
    toggleCompanionMatchingOnBooking: async (_, { bookingId, enabled }, { user }) =>
      toggleCompanionMatching(user._id, bookingId, enabled),
  },
};
