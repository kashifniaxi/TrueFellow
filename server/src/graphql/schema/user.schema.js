import { gql } from 'apollo-server-express';

export default gql`
  type SocialLinks {
    facebook:  String
    instagram: String
    twitter:   String
    linkedin:  String
  }

  type OrganizerProfile {
    id:               ID!
    user:             User!
    bio:              String
    phone:            String!
    organizationName: String!
    website:          String
    socialLinks:      SocialLinks
    status:           String!
    isApproved:       Boolean!
    rejectionReason:  String
    reviewedBy:       User
    reviewedAt:       String
    createdAt:        String
  }

  type PaginatedProfiles {
    profiles:   [OrganizerProfile!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  type PaginatedUsers {
    users:      [User!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  input ApplyOrganizerInput {
    bio:              String
    phone:            String!
    organizationName: String!
    website:          String
    socialLinks:      SocialLinksInput
  }

  input SocialLinksInput {
    facebook:  String
    instagram: String
    twitter:   String
    linkedin:  String
  }

  extend type Query {
    pendingApplications(page: Int, limit: Int): PaginatedProfiles!
    allUsers(page: Int, limit: Int, role: String, isActive: Boolean): PaginatedUsers!
  }

  extend type Mutation {
    applyForOrganizer(input: ApplyOrganizerInput!): OrganizerProfile!
    approveOrganizer(userId: ID!): OrganizerProfile!
    rejectOrganizer(userId: ID!, reason: String): OrganizerProfile!
    suspendUser(userId: ID!, reason: String!): User!
    activateUser(userId: ID!): User!
  }
`;
