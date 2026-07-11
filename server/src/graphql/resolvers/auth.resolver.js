import {
  register,
  login,
  updateProfile,
  changePassword,
  deactivateAccount,
  getMyProfile,
  saveTour,
  unsaveTour,
} from '../../services/auth.service.js';

export default {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) return null;
      return getMyProfile(user._id);
    },
  },

  Mutation: {
    register: async (_, { input }) => register(input),

    login: async (_, { input }) => login(input),

    updateProfile: async (_, { input }, { user }) => updateProfile(user._id, input),

    changePassword: async (_, { input }, { user }) => changePassword(user._id, input),

    deactivateAccount: async (_, { password }, { user }) => deactivateAccount(user._id, password),

    saveTour: async (_, { tourId }, { user }) => saveTour(user._id, tourId),

    unsaveTour: async (_, { tourId }, { user }) => unsaveTour(user._id, tourId),
  },
};
