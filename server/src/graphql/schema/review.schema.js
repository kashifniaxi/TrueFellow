import { gql } from "apollo-server-express";

export default gql`
  type Review {
    id: ID!
    tour: Tour!
    user: User!
    rating: Int!
    comment: String
  }

  input WriteReviewInput {
    tourId: ID!
    rating: Int!
    comment: String!
  }

  extend type Query {
    reviews(tourId: ID!): [Review!]!
  }

  extend type Mutation {
    writeReview(input: WriteReviewInput!): Review!
  }
`;
