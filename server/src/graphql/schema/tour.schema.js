import { gql } from 'apollo-server-express';

export default gql`
  enum TourCategory {
    ADVENTURE
    CULTURAL
    HIKING
    FAMILY
    LUXURY
    WILDLIFE
    BEACH
    RELIGIOUS
    PHOTOGRAPHY
    OTHER
  }

  enum TourStatus {
    DRAFT
    PUBLISHED
    CANCELLED
  }

  type FAQ {
    question: String!
    answer:   String!
  }

  type Tour {
    id:               ID!
    title:            String!
    description:      String!
    departureCity:    String!
    destinationCity:  String!
    location:         String!
    category:         TourCategory!
    price:            Float!
    capacity:         Int!
    availableSeats:   Int!
    duration:         Int!
    startDate:        String!
    endDate:          String!
    meetingPoint:     String
    cancellationPolicy: String
    includedServices: [String!]!
    excludedServices: [String!]!
    itinerary:        [String!]!
    images:           [String!]!
    faqs:             [FAQ!]!
    status:           TourStatus!
    bookingsCount:    Int!
    organizer:        User!
    createdAt:        String
  }

  type PaginatedTours {
    tours:      [Tour!]!
    total:      Int!
    page:       Int!
    totalPages: Int!
  }

  input FAQInput {
    question: String!
    answer:   String!
  }

  input CreateTourInput {
    title:              String!
    description:        String!
    departureCity:      String!
    destinationCity:    String!
    location:           String!
    category:           TourCategory!
    price:              Float!
    capacity:           Int!
    duration:           Int!
    startDate:          String!
    endDate:            String!
    meetingPoint:       String
    cancellationPolicy: String
    includedServices:   [String!]
    excludedServices:   [String!]
    itinerary:          [String!]
    images:             [String!]
    faqs:               [FAQInput]
  }

  input UpdateTourInput {
    title:              String
    description:        String
    departureCity:      String
    destinationCity:    String
    location:           String
    category:           TourCategory
    price:              Float
    capacity:           Int
    duration:           Int
    startDate:          String
    endDate:            String
    meetingPoint:       String
    cancellationPolicy: String
    includedServices:   [String!]
    excludedServices:   [String!]
    itinerary:          [String!]
    images:             [String!]
    faqs:               [FAQInput]
    status:             TourStatus
  }

  input TourFilters {
    category:        TourCategory
    departureCity:   String
    destinationCity: String
    minPrice:        Float
    maxPrice:        Float
    minDuration:     Int
    maxDuration:     Int
    startDate:       String
    endDate:         String
    search:          String
    sortBy:          String
    sortOrder:       String
    page:            Int
    limit:           Int
  }

  extend type Query {
    tours(filters: TourFilters): PaginatedTours!
    tour(id: ID!): Tour!
    myTours(page: Int, limit: Int, status: TourStatus): PaginatedTours!
  }

  extend type Mutation {
    createTour(input: CreateTourInput!): Tour!
    updateTour(id: ID!, input: UpdateTourInput!): Tour!
    cancelTour(id: ID!): Tour!
  }
`;
