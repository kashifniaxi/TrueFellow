import Tour from '../models/Tour.model.js';
import Booking from '../models/Booking.model.js';
import Review from '../models/Review.model.js';
import User from '../models/User.model.js';

// ─── Platform-wide Analytics (admin) ─────────────────────────────────────────

export const getPlatformStats = async () => {
  const [
    totalUsers,
    newUsersThisMonth,
    totalTours,
    totalBookings,
    bookingsThisMonth,
    bookingsByStatus,
    topDestinations,
    topCategories,
    avgRating,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),

    User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),

    Tour.countDocuments({ status: 'PUBLISHED' }),

    Booking.countDocuments(),

    Booking.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),

    Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Tour.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$destinationCity', count: { $sum: '$bookingsCount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { destination: '$_id', bookings: '$count', _id: 0 } },
    ]),

    Tour.aggregate([
      { $match: { status: 'PUBLISHED' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } },
    ]),
  ]);

  return {
    totalUsers,
    newUsersThisMonth,
    totalTours,
    totalBookings,
    bookingsThisMonth,
    bookingsByStatus: bookingsByStatus.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
    topDestinations,
    topCategories: topCategories.map((c) => ({ category: c._id, count: c.count })),
    platformAverageRating: avgRating[0] ? parseFloat(avgRating[0].avg.toFixed(1)) : 0,
    totalReviews: avgRating[0]?.total || 0,
  };
};

// ─── Organizer-specific Stats ─────────────────────────────────────────────────

export const getOrganizerStats = async (organizerId) => {
  const tourIds = await Tour.find({ organizer: organizerId }).distinct('_id');

  const [
    totalTours,
    publishedTours,
    totalBookings,
    bookingsByStatus,
    monthlyBookings,
    ratingStats,
  ] = await Promise.all([
    Tour.countDocuments({ organizer: organizerId }),
    Tour.countDocuments({ organizer: organizerId, status: 'PUBLISHED' }),
    Booking.countDocuments({ tour: { $in: tourIds } }),

    Booking.aggregate([
      { $match: { tour: { $in: tourIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Last 6 months bookings
    Booking.aggregate([
      { $match: { tour: { $in: tourIds }, createdAt: { $gte: new Date(Date.now() - 180 * 86400000) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),

    Review.aggregate([
      { $match: { tour: { $in: tourIds } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, total: { $sum: 1 } } },
    ]),
  ]);

  return {
    totalTours,
    publishedTours,
    totalBookings,
    bookingsByStatus: bookingsByStatus.reduce((acc, s) => {
      acc[s._id] = s.count;
      return acc;
    }, {}),
    monthlyBookings: monthlyBookings.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      count: m.count,
    })),
    averageRating: ratingStats[0] ? parseFloat(ratingStats[0].avg.toFixed(1)) : 0,
    totalReviews: ratingStats[0]?.total || 0,
  };
};
