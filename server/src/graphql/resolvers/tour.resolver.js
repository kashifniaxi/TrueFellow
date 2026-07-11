import Tour from "../../models/Tour.model.js";

export default {
  Query: {
    tours: async () => {
      return Tour.find().populate("organizer");
    },
  },

  Mutation: {
    createTour: async (_, { input }, ctx) => {
      if (!ctx.user || ctx.user.role !== "ORGANIZER") {
        throw new Error("Only organizers can create tours");
      }

      const tour = await Tour.create({
        ...input,
        organizer: ctx.user._id,
      });

      return tour.populate("organizer");
    },
  },
};
