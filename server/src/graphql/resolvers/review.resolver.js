import {
  writeReview,
  getReviewsByTour,
  deleteReview,
} from '../../services/review.service.js';

export default {
  Query: {
    reviews: async (_, { tourId, page, limit }) =>
      getReviewsByTour(tourId, { page, limit }),
  },

  Mutation: {
    writeReview: async (_, { input }, { user }) =>
      writeReview(user._id, input),

    deleteReview: async (_, { reviewId }, { user }) =>
      deleteReview(user._id, reviewId),
  },
};
