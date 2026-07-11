import Review from '../models/Review.model.js';
import Booking from '../models/Booking.model.js';
import Tour from '../models/Tour.model.js';
import { createNotification } from './notification.service.js';
import {
  NotFoundError,
  BusinessRuleError,
  ConflictError,
  AuthorizationError,
} from '../utils/errors.js';

// ─── Write Review ─────────────────────────────────────────────────────────────

export const writeReview = async (touristId, input) => {
  const { tourId, bookingId, rating, comment, images, aspects } = input;

  // Must have a completed booking to review
  const booking = await Booking.findOne({
    _id: bookingId,
    tourist: touristId,
    tour: tourId,
    status: 'COMPLETED',
  });
  if (!booking) {
    throw new BusinessRuleError('You can only review tours you have completed.');
  }

  // Prevent duplicate review for same booking
  const existing = await Review.findOne({ booking: bookingId });
  if (existing) throw new ConflictError('You have already reviewed this tour.');

  const review = await Review.create({
    tourist: touristId,
    tour:    tourId,
    booking: bookingId,
    rating,
    comment,
    images:  images || [],
    aspects: aspects || {},
  });

  // Notify the tour organizer
  const tour = await Tour.findById(tourId).select('organizer title');
  if (tour) {
    await createNotification(tour.organizer, {
      type: 'REVIEW_RECEIVED',
      title: 'New Review Received',
      message: `A tourist left a ${rating}-star review on your tour "${tour.title}".`,
      metadata: { tourId, reviewId: review._id },
    });
  }

  return review.populate(['tourist', 'tour']);
};

// ─── Get Reviews by Tour ─────────────────────────────────────────────────────

export const getReviewsByTour = async (tourId, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;
  const [reviews, total] = await Promise.all([
    Review.find({ tour: tourId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tourist'),
    Review.countDocuments({ tour: tourId }),
  ]);
  return { reviews, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Get Average Rating for Organizer ────────────────────────────────────────

export const getOrganizerAverageRating = async (organizerId) => {
  const result = await Review.aggregate([
    {
      $lookup: {
        from: 'tours',
        localField: 'tour',
        foreignField: '_id',
        as: 'tourData',
      },
    },
    { $unwind: '$tourData' },
    { $match: { 'tourData.organizer': organizerId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) return { averageRating: 0, totalReviews: 0 };
  return {
    averageRating: parseFloat(result[0].averageRating.toFixed(1)),
    totalReviews:  result[0].totalReviews,
  };
};

// ─── Delete Review (admin moderation) ────────────────────────────────────────

export const deleteReview = async (adminId, reviewId) => {
  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) throw new NotFoundError('Review');
  return true;
};
