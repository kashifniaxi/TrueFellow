import authResolver         from './auth.resolver.js';
import userResolver         from './user.resolver.js';
import tourResolver         from './tour.resolver.js';
import bookingResolver      from './booking.resolver.js';
import reviewResolver       from './review.resolver.js';
import notificationResolver from './notification.resolver.js';
import travelPartnerResolver from './travelPartner.resolver.js';
import dashboardResolver    from './dashboard.resolver.js';
import analyticsResolver    from './analytics.resolver.js';
import messageResolver      from './message.resolver.js';

export default {
  Query: {
    ...authResolver.Query,
    ...userResolver.Query,
    ...tourResolver.Query,
    ...bookingResolver.Query,
    ...reviewResolver.Query,
    ...notificationResolver.Query,
    ...travelPartnerResolver.Query,
    ...dashboardResolver.Query,
    ...analyticsResolver.Query,
    ...messageResolver.Query,
  },
  Mutation: {
    ...authResolver.Mutation,
    ...userResolver.Mutation,
    ...tourResolver.Mutation,
    ...bookingResolver.Mutation,
    ...reviewResolver.Mutation,
    ...notificationResolver.Mutation,
    ...travelPartnerResolver.Mutation,
    ...messageResolver.Mutation,
  },
};
