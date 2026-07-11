import authResolver from "./auth.resolver.js";
import userResolver from "./user.resolver.js";
import tourResolver from "./tour.resolver.js";
import bookingResolver from "./booking.resolver.js";
import reviewResolver from "./review.resolver.js";

export default {
  Query: {
    ...userResolver.Query,
    ...tourResolver.Query,
  },
  Mutation: {
    ...authResolver.Mutation,
    ...userResolver.Mutation,
    ...tourResolver.Mutation,
    ...bookingResolver.Mutation,
    ...reviewResolver.Mutation,
  },
};
