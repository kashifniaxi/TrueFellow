import Booking from '../models/Booking.model.js';
import Tour from '../models/Tour.model.js';
import Review from '../models/Review.model.js';
import Notification from '../models/Notification.model.js';
import User from '../models/User.model.js';
import OrganizerProfile from '../models/OrganizerProfile.model.js';

// ─── Tourist Dashboard ────────────────────────────────────────────────────────

export const getUserDashboard = async (userId) => {
  const [
    upcomingBookings,
    completedBookings,
    cancelledBookings,
    unreadNotifications,
    savedTours,
  ] = await Promise.all([
    Booking.find({ tourist: userId, status: 'CONFIRMED' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('tour'),
    Booking.countDocuments({ tourist: userId, status: 'COMPLETED' }),
    Booking.countDocuments({ tourist: userId, status: 'CANCELLED' }),
    Notification.countDocuments({ recipient: userId, isRead: false }),
    User.findById(userId).select('savedTours').populate('savedTours'),
  ]);

  return {
    upcomingBookings,
    completedTripsCount: completedBookings,
    cancelledBookingsCount: cancelledBookings,
    unreadNotificationsCount: unreadNotifications,
    savedToursCount: savedTours?.savedTours?.length || 0,
  };
};

// ─── Organizer Dashboard ──────────────────────────────────────────────────────

export const getOrganizerDashboard = async (organizerId) => {
  const [
    activeTours,
    totalBookings,
    pendingBookings,
    completedBookings,
    recentBookings,
    reviewStats,
  ] = await Promise.all([
    Tour.countDocuments({ organizer: organizerId, status: 'PUBLISHED' }),
    Booking.countDocuments({ tour: { $in: await Tour.find({ organizer: organizerId }).distinct('_id') } }),
    Booking.countDocuments({
      tour: { $in: await Tour.find({ organizer: organizerId }).distinct('_id') },
      status: 'CONFIRMED',
    }),
    Booking.countDocuments({
      tour: { $in: await Tour.find({ organizer: organizerId }).distinct('_id') },
      status: 'COMPLETED',
    }),
    Booking.find({
      tour: { $in: await Tour.find({ organizer: organizerId }).distinct('_id') },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate(['tourist', 'tour']),
    Review.aggregate([
      { $lookup: { from: 'tours', localField: 'tour', foreignField: '_id', as: 'tourData' } },
      { $unwind: '$tourData' },
      { $match: { 'tourData.organizer': organizerId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
  ]);

  return {
    activeToursCount: activeTours,
    totalBookingsCount: totalBookings,
    confirmedBookingsCount: pendingBookings,
    completedBookingsCount: completedBookings,
    recentBookings,
    averageRating: reviewStats[0] ? parseFloat(reviewStats[0].avg.toFixed(1)) : 0,
    totalReviews: reviewStats[0]?.count || 0,
  };
};

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export const getAdminDashboard = async () => {
  const [
    totalUsers,
    totalOrganizers,
    totalTourists,
    pendingApplications,
    totalTours,
    activeTours,
    totalBookings,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'ORGANIZER', isActive: true }),
    User.countDocuments({ role: 'TOURIST', isActive: true }),
    OrganizerProfile.countDocuments({ status: 'PENDING' }),
    Tour.countDocuments(),
    Tour.countDocuments({ status: 'PUBLISHED' }),
    Booking.countDocuments(),
    User.find({ isActive: true }).sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
  ]);

  return {
    totalUsers,
    totalOrganizers,
    totalTourists,
    pendingOrganizerApplications: pendingApplications,
    totalTours,
    activeTours,
    totalBookings,
    recentUsers,
  };
};
