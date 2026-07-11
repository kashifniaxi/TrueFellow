import { gql } from "apollo-server-express";

export default gql`
  type Booking {
    id: ID!
    tour: Tour!
    user: User!
    status: String!
  }

  input BookTourInput {
    tourId: ID!
  }

  extend type Query {
    bookings: [Booking!]!
  }

  extend type Mutation {
    bookTour(input: BookTourInput!): Booking!
    leaveTour(bookingId: ID!): Boolean!
  }
`;