import { gql } from "apollo-server-express";

export default gql`
    type Tour {
        id: ID!
        title: String!
        description: String!
        price: Float!
        location: String!
        date: String!
        organizer: User!
    }

    input CreateTourInput {
        title: String!
        description: String!
        price: Float!
        location: String!
        date: String!
    }

    type Query {
        tours: [Tour!]!
        tour(id: ID!): Tour
    }

    type Mutation {
        createTour(input: CreateTourInput!): Tour!
        verifyOrganizer(organizerId: ID!): User!  # ✅ Fixed typo
    }
`;
