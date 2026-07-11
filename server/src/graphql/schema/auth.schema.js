import { gql } from 'apollo-server-express';

export default gql`
  enum Role {
    TOURIST
    ORGANIZER
    ADMIN
  }

  type TravelPreferences {
    interests:   [String!]!
    travelStyle: String
    languages:   [String!]!
    budgetRange: BudgetRange
  }

  type BudgetRange {
    min: Float!
    max: Float!
  }

  type User {
    id:                 ID!
    name:               String!
    email:              String!
    role:               Role!
    isVerified:         Boolean!
    isActive:           Boolean!
    profilePicture:     String
    bio:                String
    phone:              String
    savedTours:         [Tour!]
    travelPreferences:  TravelPreferences
    createdAt:          String
  }

  type AuthPayload {
    accessToken:  String!
    refreshToken: String!
    user:         User!
  }

  input RegisterInput {
    name:     String!
    email:    String!
    password: String!
  }

  input LoginInput {
    email:    String!
    password: String!
  }

  input TravelPreferencesInput {
    interests:   [String!]
    travelStyle: String
    languages:   [String!]
    budgetRange: BudgetRangeInput
  }

  input BudgetRangeInput {
    min: Float!
    max: Float!
  }

  input UpdateProfileInput {
    name:               String
    bio:                String
    phone:              String
    profilePicture:     String
    travelPreferences:  TravelPreferencesInput
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword:     String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
    deactivateAccount(password: String!): Boolean!
    saveTour(tourId: ID!): User!
    unsaveTour(tourId: ID!): User!
  }
`;