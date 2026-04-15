export default {
  Mutation: {
    createTour: async (_, { input }, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ORGANIZER') throw new Error('Unauthorized');
      // TODO: await createTourService(input, ctx.user.id);
      return { id: '1', ...input, organizer: ctx.user }; // Stub
    },
    verifyOrganizer: async (_, { organizerId }, ctx) => {
      if (!ctx.user || ctx.user.role !== 'ADMIN') throw new Error('Unauthorized');
      // TODO: await verifyOrganizerService(organizerId);
      return { id: organizerId, isVerified: true }; // Stub
    },
  },
};
