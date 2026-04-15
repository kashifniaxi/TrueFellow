import authResolver from "./auth.resolver.js";
import reviewResolver from "./review.resolver.js";
import tourResolver from "./tour.resolver.js";
import bookingResolver from "./booking.resolver.js";

import userResolver from "./user.resolver.js";

export default {
    Query: {
        ...userResolver.Query,
    },
    Mutation : {
        ...authResolver.Mutation,
        ...reviewResolver.Mutation,
        ...tourResolver.Mutation,
        ...bookingResolver.Mutation,
    },
};
