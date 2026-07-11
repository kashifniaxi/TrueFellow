import { gql } from 'apollo-server-express';

export default gql`
  type UpcomingBookingPreview {
    id:     ID!
    tour:   Tour!
    status: BookingStatus!
  }

  type UserDashboard {
    upcomingBookings:          [Booking!]!
    completedTripsCount:       Int!
    cancelledBookingsCount:    Int!
    unreadNotificationsCount:  Int!
    savedToursCount:           Int!
  }

  type OrganizerDashboard {
    activeToursCount:       Int!
    totalBookingsCount:     Int!
    confirmedBookingsCount: Int!
    completedBookingsCount: Int!
    recentBookings:         [Booking!]!
    averageRating:          Float!
    totalReviews:           Int!
  }

  type AdminDashboard {
    totalUsers:                    Int!
    totalOrganizers:               Int!
    totalTourists:                 Int!
    pendingOrganizerApplications:  Int!
    totalTours:                    Int!
    activeTours:                   Int!
    totalBookings:                 Int!
    recentUsers:                   [User!]!
  }

  extend type Query {
    myDashboard:         UserDashboard!
    organizerDashboard:  OrganizerDashboard!
    adminDashboard:      AdminDashboard!
  }
`;
