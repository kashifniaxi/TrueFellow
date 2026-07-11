import { gql } from 'apollo-server-express';

export default gql`
  enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
    REFUNDED
  }

  type Booking {
    id:                       ID!
    tourist:                  User!
    tour:                     Tour!
    status:                   BookingStatus!
    notes:                    String
    companionMatchingEnabled: Boolean!
    bookedAt:                 String!
    cancelledAt:              String
    completedAt:              String
    createdAt:                String
  }

  type PaginatedBookings {
    bookings:   [Booking!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  input BookTourInput {
    tourId:                   ID!
    notes:                    String
    companionMatchingEnabled: Boolean
  }

  extend type Query {
    myBookings(status: BookingStatus, page: Int, limit: Int): PaginatedBookings!
    bookingsByTour(tourId: ID!, status: BookingStatus, page: Int, limit: Int): PaginatedBookings!
    allBookings(status: BookingStatus, page: Int, limit: Int): PaginatedBookings!
  }

  extend type Mutation {
    bookTour(input: BookTourInput!): Booking!
    cancelBooking(bookingId: ID!): Booking!
    completeBooking(bookingId: ID!): Booking!
    toggleCompanionMatching(bookingId: ID!, enabled: Boolean!): Booking!
  }
`;