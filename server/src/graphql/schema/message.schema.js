import { gql } from 'apollo-server-express';

export default gql`
  type Message {
    id:        ID!
    sender:    User!
    recipient: User!
    tour:      Tour
    content:   String!
    isRead:    Boolean!
    createdAt: String!
  }

  type ConversationList {
    messages:   [Message!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  input SendMessageInput {
    recipientId: ID!
    tourId:      ID
    content:     String!
  }

  extend type Query {
    conversation(otherUserId: ID!, page: Int, limit: Int): ConversationList!
    myConversations: [Message!]!
    unreadMessageCount: Int!
  }

  extend type Mutation {
    sendMessage(input: SendMessageInput!): Message!
  }
`;
