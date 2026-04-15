import { gql } from "apollo-server-express";

export default gql`
    type Review {
        id: ID!
        tour: Tour!
        user: User!
        rating: Int!
        comment: String
    }

    input WriteReviewInput {  # ✅ Capitalized, matches resolver
        tourId: ID!
        rating: Int!
        comment: String!
    }

    type Query {
        reviews(tourId: ID!): [Review!]!
    }

    type Mutation {
        writeReview(input: WriteReviewInput!): Review!  # ✅ Matches input
    }
`;
