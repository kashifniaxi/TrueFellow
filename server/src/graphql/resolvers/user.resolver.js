import OrganizerProfile from "../../models/OrganizerProfile.model.js";
import User from "../../models/User.model.js";

export default {
  Query: {
    me: async (_, __, { user }) => {
      return user;
    },
  },

  Mutation: {
    applyForOrganizer: async (_, { input }, ctx) => {
      if (!ctx.user) throw new Error("Not authenticated");

      const existing = await OrganizerProfile.findOne({ user: ctx.user._id });
      if (existing) {
        throw new Error("Already applied");
      }

      const profile = await OrganizerProfile.create({
        user: ctx.user._id,
        ...input,
      });

      return profile.populate("user");
    },

    approveOrganizer: async (_, { userId }, ctx) => {
      if (!ctx.user || ctx.user.role !== "ADMIN") {
        throw new Error("Not authorized");
      }

      const profile = await OrganizerProfile.findOne({ user: userId });
      if (!profile) throw new Error("Profile not found");

      profile.status = "APPROVED";
      profile.isApproved = true;
      await profile.save();

      // Update user role
      await User.findByIdAndUpdate(userId, {
        role: "ORGANIZER",
        isVerified: true,
      });

      return profile.populate("user");
    },
  },
};
