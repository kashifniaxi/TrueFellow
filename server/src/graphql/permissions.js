import { rule, shield, and, or, allow, deny } from 'graphql-shield';

// ─── Base Rules ───────────────────────────────────────────────────────────────

const isAuthenticated = rule({ cache: 'contextual' })(
  (_, __, ctx) => ctx.user !== null && ctx.user !== undefined && ctx.user.isActive !== false
);

const isRole = (role) =>
  rule({ cache: 'contextual' })(
    (_, __, ctx) => ctx.user?.role === role
  );

const isTourist   = isRole('TOURIST');
const isOrganizer = isRole('ORGANIZER');
const isAdmin     = isRole('ADMIN');

// ─── Permissions Map ──────────────────────────────────────────────────────────

export const permissions = shield(
  {
    // ── Queries ────────────────────────────────────────────────────────────────
    Query: {
      // Auth / Profile
      me:                    isAuthenticated,

      // Tours — public discovery
      tours:                 allow,
      tour:                  allow,

      // Reviews — public
      reviews:               allow,

      // Organizer's own tours
      myTours:               and(isAuthenticated, isOrganizer),

      // Booking views
      myBookings:            and(isAuthenticated, isTourist),
      bookingsByTour:        and(isAuthenticated, isOrganizer),
      allBookings:           and(isAuthenticated, isAdmin),

      // User management (admin only)
      pendingApplications:   and(isAuthenticated, isAdmin),
      allUsers:              and(isAuthenticated, isAdmin),

      // Dashboards
      myDashboard:           and(isAuthenticated, isTourist),
      organizerDashboard:    and(isAuthenticated, isOrganizer),
      adminDashboard:        and(isAuthenticated, isAdmin),

      // Analytics
      platformStats:         and(isAuthenticated, isAdmin),
      myOrganizerStats:      and(isAuthenticated, isOrganizer),

      // Notifications
      myNotifications:       isAuthenticated,

      // Travel matching
      matchCompanions:       and(isAuthenticated, isTourist),

      // Messaging
      conversation:          isAuthenticated,
      myConversations:       isAuthenticated,
      unreadMessageCount:    isAuthenticated,
    },

    // ── Mutations ──────────────────────────────────────────────────────────────
    Mutation: {
      // Public auth
      register: allow,
      login:    allow,

      // Profile management
      updateProfile:    isAuthenticated,
      changePassword:   isAuthenticated,
      deactivateAccount:isAuthenticated,
      saveTour:         and(isAuthenticated, isTourist),
      unsaveTour:       and(isAuthenticated, isTourist),

      // Organizer workflow
      applyForOrganizer:  and(isAuthenticated, isTourist),
      approveOrganizer:   and(isAuthenticated, isAdmin),
      rejectOrganizer:    and(isAuthenticated, isAdmin),
      suspendUser:        and(isAuthenticated, isAdmin),
      activateUser:       and(isAuthenticated, isAdmin),

      // Tour management
      createTour: and(isAuthenticated, isOrganizer),
      updateTour: and(isAuthenticated, isOrganizer),
      cancelTour: and(isAuthenticated, isOrganizer),

      // Bookings
      bookTour:             and(isAuthenticated, isTourist),
      cancelBooking:        and(isAuthenticated, isTourist),
      completeBooking:      and(isAuthenticated, or(isOrganizer, isAdmin)),
      toggleCompanionMatching: and(isAuthenticated, isTourist),

      // Reviews
      writeReview:  and(isAuthenticated, isTourist),
      deleteReview: and(isAuthenticated, isAdmin),

      // Notifications
      markNotificationRead:     isAuthenticated,
      markAllNotificationsRead: isAuthenticated,

      // Travel matching
      toggleCompanionMatchingOnBooking: and(isAuthenticated, isTourist),

      // Messaging
      sendMessage: isAuthenticated,
    },
  },
  {
    allowExternalErrors: true,
    fallbackError:       'Not authorized.',
  }
);
