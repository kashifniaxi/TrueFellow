import { gql } from "apollo-server-express";

export default gql`
  type OrganizerProfile {
    id: ID!
    user: User!
    bio: String
    phone: String!
    organizationName: String!
    status: String!
    isApproved: Boolean!
  }

  input ApplyOrganizerInput {
    bio: String
    phone: String!
    organizationName: String!
  }

  extend type Mutation {
    applyForOrganizer(input: ApplyOrganizerInput!): OrganizerProfile!
    approveOrganizer(userId: ID!): OrganizerProfile!
  }
`;
