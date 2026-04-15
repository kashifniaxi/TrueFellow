export default {
  Mutation: {
    writeReview: async (_, { input }, ctx) => {
      if (!ctx.user || ctx.user.role !== 'TOURIST') throw new Error('Unauthorized');
      // TODO: await writeReviewService(input, ctx.user.id);
      return { id: '1', ...input, user: ctx.user }; // Stub
    },
  },
};
