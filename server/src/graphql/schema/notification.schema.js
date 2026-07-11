import { gql } from 'apollo-server-express';

export default gql`
  type Notification {
    id:        ID!
    type:      String!
    title:     String!
    message:   String!
    isRead:    Boolean!
    metadata:  NotificationMetadata
    createdAt: String!
  }

  type NotificationMetadata {
    tourId:    ID
    bookingId: ID
    reviewId:  ID
    userId:    ID
  }

  type NotificationFeed {
    notifications:        [Notification!]!
    total:                Int!
    unreadCount:          Int!
    page:                 Int!
    totalPages:           Int!
  }

  extend type Query {
    myNotifications(page: Int, limit: Int, unreadOnly: Boolean): NotificationFeed!
  }

  extend type Mutation {
    markNotificationRead(notificationId: ID!): Notification!
    markAllNotificationsRead: Boolean!
  }
`;
