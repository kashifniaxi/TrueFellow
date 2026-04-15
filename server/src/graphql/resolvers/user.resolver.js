export default {
  Query: {
    me: async (_, __, { user }) => {
      return user;
    }
  }
};
