import { gql } from 'apollo-server-express';

export default gql`
  type TopDestination {
    destination: String!
    bookings:    Int!
  }

  type TopCategory {
    category: String!
    count:    Int!
  }

  type MonthlyBooking {
    year:  Int!
    month: Int!
    count: Int!
  }

  type PlatformStats {
    totalUsers:              Int!
    newUsersThisMonth:       Int!
    totalTours:              Int!
    totalBookings:           Int!
    bookingsThisMonth:       Int!
    platformAverageRating:   Float!
    totalReviews:            Int!
    topDestinations:         [TopDestination!]!
    topCategories:           [TopCategory!]!
  }

  type OrganizerStats {
    totalTours:       Int!
    publishedTours:   Int!
    totalBookings:    Int!
    averageRating:    Float!
    totalReviews:     Int!
    monthlyBookings:  [MonthlyBooking!]!
  }

  extend type Query {
    platformStats:     PlatformStats!
    myOrganizerStats:  OrganizerStats!
  }
`;
