import { gql } from '@apollo/client';

// ─── AUTH OPERATIONS ─────────────────────────────────────────────────────────

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
        profilePicture
        isVerified
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      profilePicture
      bio
      phone
      isVerified
      isActive
      savedTours {
        id
        title
        price
        duration
        images
        destinationCity
      }
      travelPreferences {
        interests
        travelStyle
        languages
        budgetRange {
          min
          max
        }
      }
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      bio
      phone
      profilePicture
      travelPreferences {
        interests
        travelStyle
        languages
        budgetRange {
          min
          max
        }
      }
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const DEACTIVATE_ACCOUNT_MUTATION = gql`
  mutation DeactivateAccount($password: String!) {
    deactivateAccount(password: $password)
  }
`;

export const SAVE_TOUR_MUTATION = gql`
  mutation SaveTour($tourId: ID!) {
    saveTour(tourId: $tourId) {
      id
      savedTours {
        id
      }
    }
  }
`;

export const UNSAVE_TOUR_MUTATION = gql`
  mutation UnsaveTour($tourId: ID!) {
    unsaveTour(tourId: $tourId) {
      id
      savedTours {
        id
      }
    }
  }
`;

// ─── USER & ORGANIZER WORKFLOWS ──────────────────────────────────────────────

export const APPLY_ORGANIZER_MUTATION = gql`
  mutation ApplyForOrganizer($input: ApplyOrganizerInput!) {
    applyForOrganizer(input: $input) {
      id
      status
      organizationName
      phone
    }
  }
`;

export const PENDING_APPLICATIONS_QUERY = gql`
  query PendingApplications($page: Int, $limit: Int) {
    pendingApplications(page: $page, limit: $limit) {
      profiles {
        id
        organizationName
        phone
        website
        bio
        status
        createdAt
        user {
          id
          name
          email
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const APPROVE_ORGANIZER_MUTATION = gql`
  mutation ApproveOrganizer($userId: ID!) {
    approveOrganizer(userId: $userId) {
      id
      status
    }
  }
`;

export const REJECT_ORGANIZER_MUTATION = gql`
  mutation RejectOrganizer($userId: ID!, $reason: String) {
    rejectOrganizer(userId: $userId, reason: $reason) {
      id
      status
      rejectionReason
    }
  }
`;

export const ALL_USERS_QUERY = gql`
  query AllUsers($page: Int, $limit: Int, $role: String, $isActive: Boolean) {
    allUsers(page: $page, limit: $limit, role: $role, isActive: $isActive) {
      users {
        id
        name
        email
        role
        isActive
        isVerified
        createdAt
      }
      total
      page
      totalPages
    }
  }
`;

export const SUSPEND_USER_MUTATION = gql`
  mutation SuspendUser($userId: ID!, $reason: String!) {
    suspendUser(userId: $userId, reason: $reason) {
      id
      isActive
    }
  }
`;

export const ACTIVATE_USER_MUTATION = gql`
  mutation ActivateUser($userId: ID!) {
    activateUser(userId: $userId) {
      id
      isActive
    }
  }
`;

// ─── TOUR OPERATIONS ─────────────────────────────────────────────────────────

export const TOURS_QUERY = gql`
  query Tours($filters: TourFilters) {
    tours(filters: $filters) {
      tours {
        id
        title
        description
        price
        duration
        capacity
        availableSeats
        startDate
        endDate
        destinationCity
        departureCity
        category
        images
        organizer {
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const TOUR_QUERY = gql`
  query Tour($id: ID!) {
    tour(id: $id) {
      id
      title
      description
      price
      duration
      capacity
      availableSeats
      startDate
      endDate
      destinationCity
      departureCity
      location
      category
      meetingPoint
      cancellationPolicy
      includedServices
      excludedServices
      itinerary
      images
      faqs {
        question
        answer
      }
      status
      organizer {
        id
        name
        bio
        profilePicture
      }
    }
  }
`;

export const MY_TOURS_QUERY = gql`
  query MyTours($page: Int, $limit: Int, $status: TourStatus) {
    myTours(page: $page, limit: $limit, status: $status) {
      tours {
        id
        title
        price
        duration
        status
        capacity
        bookingsCount
        startDate
        endDate
        destinationCity
        images
      }
      total
      page
      totalPages
    }
  }
`;

export const CREATE_TOUR_MUTATION = gql`
  mutation CreateTour($input: CreateTourInput!) {
    createTour(input: $input) {
      id
      title
    }
  }
`;

export const UPDATE_TOUR_MUTATION = gql`
  mutation UpdateTour($id: ID!, $input: UpdateTourInput!) {
    updateTour(id: $id, input: $input) {
      id
      title
      status
    }
  }
`;

export const CANCEL_TOUR_MUTATION = gql`
  mutation CancelTour($id: ID!) {
    cancelTour(id: $id) {
      id
      status
    }
  }
`;

// ─── BOOKING OPERATIONS ──────────────────────────────────────────────────────

export const MY_BOOKINGS_QUERY = gql`
  query MyBookings($status: BookingStatus, $page: Int, $limit: Int) {
    myBookings(status: $status, page: $page, limit: $limit) {
      bookings {
        id
        status
        notes
        companionMatchingEnabled
        bookedAt
        tour {
          id
          title
          price
          duration
          startDate
          endDate
          destinationCity
          images
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const BOOKINGS_BY_TOUR_QUERY = gql`
  query BookingsByTour($tourId: ID!, $status: BookingStatus, $page: Int, $limit: Int) {
    bookingsByTour(tourId: $tourId, status: $status, page: $page, limit: $limit) {
      bookings {
        id
        status
        notes
        companionMatchingEnabled
        bookedAt
        tourist {
          id
          name
          email
          phone
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const ALL_BOOKINGS_QUERY = gql`
  query AllBookings($status: BookingStatus, $page: Int, $limit: Int) {
    allBookings(status: $status, page: $page, limit: $limit) {
      bookings {
        id
        status
        bookedAt
        tour {
          title
          price
        }
        tourist {
          name
          email
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const BOOK_TOUR_MUTATION = gql`
  mutation BookTour($input: BookTourInput!) {
    bookTour(input: $input) {
      id
      status
      bookedAt
    }
  }
`;

export const CANCEL_BOOKING_MUTATION = gql`
  mutation CancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId) {
      id
      status
    }
  }
`;

export const COMPLETE_BOOKING_MUTATION = gql`
  mutation CompleteBooking($bookingId: ID!) {
    completeBooking(bookingId: $bookingId) {
      id
      status
    }
  }
`;

// ─── REVIEW OPERATIONS ───────────────────────────────────────────────────────

export const REVIEWS_QUERY = gql`
  query Reviews($tourId: ID!, $page: Int, $limit: Int) {
    reviews(tourId: $tourId, page: $page, limit: $limit) {
      reviews {
        id
        rating
        comment
        images
        createdAt
        aspects {
          organization
          safety
          transportation
          accommodation
          communication
        }
        tourist {
          name
          profilePicture
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const WRITE_REVIEW_MUTATION = gql`
  mutation WriteReview($input: WriteReviewInput!) {
    writeReview(input: $input) {
      id
      rating
    }
  }
`;

export const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId)
  }
`;

// ─── NOTIFICATION OPERATIONS ─────────────────────────────────────────────────

export const MY_NOTIFICATIONS_QUERY = gql`
  query MyNotifications($page: Int, $limit: Int, $unreadOnly: Boolean) {
    myNotifications(page: $page, limit: $limit, unreadOnly: $unreadOnly) {
      notifications {
        id
        type
        title
        message
        isRead
        createdAt
        metadata {
          tourId
          bookingId
          reviewId
          userId
        }
      }
      total
      unreadCount
      page
      totalPages
    }
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($notificationId: ID!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;

// ─── TRAVEL COMPANION MATCHING ───────────────────────────────────────────────

export const MATCH_COMPANIONS_QUERY = gql`
  query MatchCompanions($tourId: ID!) {
    matchCompanions(tourId: $tourId) {
      user {
        id
        name
        profilePicture
        travelPreferences {
          interests
          travelStyle
          languages
          budgetRange {
            min
            max
          }
        }
      }
      compatibilityScore
      sharedInterests
    }
  }
`;

export const TOGGLE_COMPANION_MATCHING_ON_BOOKING_MUTATION = gql`
  mutation ToggleCompanionMatchingOnBooking($bookingId: ID!, $enabled: Boolean!) {
    toggleCompanionMatchingOnBooking(bookingId: $bookingId, enabled: $enabled) {
      id
      companionMatchingEnabled
    }
  }
`;

// ─── MESSAGING / CHAT ────────────────────────────────────────────────────────

export const CONVERSATION_QUERY = gql`
  query Conversation($otherUserId: ID!, $page: Int, $limit: Int) {
    conversation(otherUserId: $otherUserId, page: $page, limit: $limit) {
      messages {
        id
        content
        createdAt
        isRead
        sender {
          id
          name
        }
        recipient {
          id
          name
        }
      }
      total
      page
      totalPages
    }
  }
`;

export const MY_CONVERSATIONS_QUERY = gql`
  query MyConversations {
    myConversations {
      id
      content
      createdAt
      isRead
      sender {
        id
        name
        profilePicture
      }
      recipient {
        id
        name
        profilePicture
      }
    }
  }
`;

export const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      content
      createdAt
      sender {
        id
        name
      }
      recipient {
        id
        name
      }
    }
  }
`;

// ─── DASHBOARDS ─────────────────────────────────────────────────────────────

export const MY_DASHBOARD_QUERY = gql`
  query MyDashboard {
    myDashboard {
      upcomingBookings {
        id
        status
        tour {
          id
          title
          startDate
          destinationCity
        }
      }
      completedTripsCount
      cancelledBookingsCount
      unreadNotificationsCount
      savedToursCount
    }
  }
`;

export const ORGANIZER_DASHBOARD_QUERY = gql`
  query OrganizerDashboard {
    organizerDashboard {
      activeToursCount
      totalBookingsCount
      confirmedBookingsCount
      completedBookingsCount
      averageRating
      totalReviews
      recentBookings {
        id
        status
        bookedAt
        tour {
          title
        }
        tourist {
          name
        }
      }
    }
  }
`;

export const ADMIN_DASHBOARD_QUERY = gql`
  query AdminDashboard {
    adminDashboard {
      totalUsers
      totalOrganizers
      totalTourists
      pendingOrganizerApplications
      totalTours
      activeTours
      totalBookings
      recentUsers {
        id
        name
        email
        role
        createdAt
      }
    }
  }
`;

// ─── ANALYTICS ──────────────────────────────────────────────────────────────

export const PLATFORM_STATS_QUERY = gql`
  query PlatformStats {
    platformStats {
      totalUsers
      newUsersThisMonth
      totalTours
      totalBookings
      bookingsThisMonth
      platformAverageRating
      totalReviews
      topDestinations {
        destination
        bookings
      }
      topCategories {
        category
        count
      }
    }
  }
`;

export const MY_ORGANIZER_STATS_QUERY = gql`
  query MyOrganizerStats {
    myOrganizerStats {
      totalTours
      publishedTours
      totalBookings
      averageRating
      totalReviews
      monthlyBookings {
        year
        month
        count
      }
    }
  }
`;
