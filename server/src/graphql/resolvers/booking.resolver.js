export default {
  Mutation: {
    bookTour: async (_, { input }, ctx) => {
      if (!ctx.user || ctx.user.role !== 'TOURIST') throw new Error('Unauthorized');
      // TODO: await bookTourService(input.tourId, ctx.user.id);
      return { id: '1', tour: { id: input.tourId }, user: ctx.user, status: 'BOOKED' }; // Stub
    },
    leaveTour: async (_, { bookingId }, ctx) => {
      if (!ctx.user || ctx.user.role !== 'TOURIST') throw new Error('Unauthorized');
      // TODO: await leaveTourService(bookingId);
      return true;
    },
  },
};
