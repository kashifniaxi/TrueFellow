import { gql } from 'apollo-server-express';

export default gql`
  type ReviewAspects {
    organization:   Int
    safety:         Int
    transportation: Int
    accommodation:  Int
    communication:  Int
  }

  type Review {
    id:        ID!
    tourist:   User!
    tour:      Tour!
    booking:   ID!
    rating:    Int!
    comment:   String
    images:    [String!]!
    aspects:   ReviewAspects
    createdAt: String
  }

  type PaginatedReviews {
    reviews:    [Review!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  input ReviewAspectsInput {
    organization:   Int
    safety:         Int
    transportation: Int
    accommodation:  Int
    communication:  Int
  }

  input WriteReviewInput {
    tourId:    ID!
    bookingId: ID!
    rating:    Int!
    comment:   String
    images:    [String!]
    aspects:   ReviewAspectsInput
  }

  extend type Query {
    reviews(tourId: ID!, page: Int, limit: Int): PaginatedReviews!
  }

  extend type Mutation {
    writeReview(input: WriteReviewInput!): Review!
    deleteReview(reviewId: ID!): Boolean!
  }
`;
