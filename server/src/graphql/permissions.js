import { rule, shield, and, or, allow } from "graphql-shield";

// Rule to check if user is authenticated
const isAuthenticated = rule({ cache: "contextual" })((parent, args, ctx) => {
  return ctx.user !== null;
});

// Rule to check role
const isRole = (role) =>
  rule({ cache: "contextual" })((parent, args, ctx) => {
    return ctx.user && ctx.user.role === role;
  });

export const permissions = shield(
  {
    Query: {
      me: isAuthenticated,
      tours: allow,
      reviews: allow,
      bookings: isAuthenticated,
    },
    Mutation: {
      register: allow,
      login: allow,
      applyForOrganizer: isAuthenticated,
      approveOrganizer: and(isAuthenticated, isRole("ADMIN")),
      createTour: and(isAuthenticated, isRole("ORGANIZER")),
      bookTour: and(isAuthenticated, isRole("TOURIST")),
      leaveTour: and(isAuthenticated, isRole("TOURIST")),
      writeReview: and(isAuthenticated, isRole("TOURIST")),
    },
  },
  {
    allowExternalErrors: true,
  }
);
