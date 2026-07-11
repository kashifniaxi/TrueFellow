import {
  bookTour,
  cancelBooking,
  completeBooking,
  getMyBookings,
  getBookingsByTour,
  getAllBookings,
} from '../../services/booking.service.js';
import { toggleCompanionMatching } from '../../services/travelPartner.service.js';

export default {
  Query: {
    myBookings: async (_, { status, page, limit }, { user }) =>
      getMyBookings(user._id, { status, page, limit }),

    bookingsByTour: async (_, { tourId, status, page, limit }, { user }) =>
      getBookingsByTour(user._id, tourId, { status, page, limit }),

    allBookings: async (_, { status, page, limit }) =>
      getAllBookings({ status, page, limit }),
  },

  Mutation: {
    bookTour: async (_, { input }, { user }) =>
      bookTour(user._id, input),

    cancelBooking: async (_, { bookingId }, { user }) =>
      cancelBooking(user._id, bookingId),

    completeBooking: async (_, { bookingId }, { user }) =>
      completeBooking(user._id, bookingId),

    toggleCompanionMatching: async (_, { bookingId, enabled }, { user }) =>
      toggleCompanionMatching(user._id, bookingId, enabled),
  },
};
