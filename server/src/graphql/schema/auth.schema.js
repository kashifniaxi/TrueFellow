import { gql } from "apollo-server-express";

export default gql`
  enum Role {
    TOURIST
    ORGANIZER
    ADMIN
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    isVerified: Boolean!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
  }
`;