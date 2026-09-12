import {
  createTour,
  getTours,
  getTourById,
  getOrganizerTours,
  updateTour,
  cancelTour,
} from '../../services/tour.service.js';

export default {
  Query: {
    tours: async (_, { filters }) => getTours(filters || {}),
    tour:  async (_, { id })       => getTourById(id),
    myTours: async (_, { page, limit, status }, { user }) =>
      getOrganizerTours(user._id, { page, limit, status }),
  },

  Mutation: {
    createTour: async (_, { input }, { user }) => createTour(user._id, input),
    updateTour: async (_, { id, input }, { user }) => updateTour(user._id, id, input),
    cancelTour: async (_, { id }, { user }) => cancelTour(user._id, id),
  },
};
