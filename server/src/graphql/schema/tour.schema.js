import { gql } from "apollo-server-express";

export default gql`
  type Tour {
    id: ID!
    title: String!
    description: String!
    location: String!
    price: Float!
    capacity: Int!
    bookingsCount: Int!
    organizer: User!
  }

  input CreateTourInput {
    title: String!
    description: String!
    location: String!
    price: Float!
    capacity: Int!
  }

  extend type Mutation {
    createTour(input: CreateTourInput!): Tour!
  }

  extend type Query {
    tours: [Tour!]!
  }
`;
