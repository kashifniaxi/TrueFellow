import { gql } from 'apollo-server-express';

export default gql`
  type CompanionMatch {
    user:               User!
    compatibilityScore: Int!
    sharedInterests:    [String!]!
  }

  extend type Query {
    matchCompanions(tourId: ID!): [CompanionMatch!]!
  }

  extend type Mutation {
    toggleCompanionMatchingOnBooking(bookingId: ID!, enabled: Boolean!): Booking!
  }
`;
