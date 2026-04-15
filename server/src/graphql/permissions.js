import { rule, shield, and, or, allow } from "graphql-shield";

// Rule to check if user is authenticated
const isAuthenticated = rule({ cache : 'contextual'})((parent, args, ctx) => {
    return ctx.user !== null; 
});

// Rule to check role
const isRole = (role) => rule({ cache : 'contextual'})((parent, args, ctx) => {
    return ctx.user && ctx.user.role === role;
});


export const permissions = shield({
    Query: {
        me: isAuthenticated,
        tours: true,
        tour: true,
        reviews: true,
        bookings: isAuthenticated,
    },
    Mutation: {
        // Example: only authenticated users can access this mutation
        register: allow, // Allow anyone to register
        login: allow, // Allow anyone to login
        createTour : and(isAuthenticated, isRole('ORGANIZER')), // Only authenticated organizers can create tours
        verifyOrganizer: and(isAuthenticated, isRole('ADMIN')), // Only authenticated admins can verify organizers
        bookTour: and(isAuthenticated, isRole('TOURIST')), // Only authenticated tourists can book tours
        leaveTour : and(isAuthenticated, isRole('TOURIST')), // Only authenticated tourists can leave tours
        writeReview : and(isAuthenticated, isRole('TOURIST')), // Only authenticated tourists can write reviews
    },
});

