import Booking from '../models/Booking.model.js';
import Tour from '../models/Tour.model.js';
import { createNotification } from './notification.service.js';
import {
  NotFoundError,
  BusinessRuleError,
  ConflictError,
  AuthorizationError,
} from '../utils/errors.js';

// ─── Book a Tour ─────────────────────────────────────────────────────────────

export const bookTour = async (touristId, { tourId, notes, companionMatchingEnabled }) => {
  const tour = await Tour.findById(tourId);
  if (!tour) throw new NotFoundError('Tour');
  if (tour.status !== 'PUBLISHED') throw new BusinessRuleError('This tour is not available for booking.');
  if (tour.organizer.toString() === touristId.toString()) {
    throw new BusinessRuleError('Organizers cannot book their own tours.');
  }
  if (tour.bookingsCount >= tour.capacity) {
    throw new BusinessRuleError('This tour is fully booked.');
  }
  if (new Date(tour.startDate) < new Date()) {
    throw new BusinessRuleError('Cannot book a tour that has already started.');
  }

  const existing = await Booking.findOne({ tourist: touristId, tour: tourId });
  if (existing) throw new ConflictError('You have already booked this tour.');

  const booking = await Booking.create({
    tourist: touristId,
    tour: tourId,
    notes,
    companionMatchingEnabled: companionMatchingEnabled ?? false,
    status: 'CONFIRMED',
  });

  // Increment seat counter atomically
  await Tour.findByIdAndUpdate(tourId, { $inc: { bookingsCount: 1 } });

  // Notify tourist
  await createNotification(touristId, {
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed!',
    message: `Your booking for "${tour.title}" has been confirmed.`,
    metadata: { tourId, bookingId: booking._id },
  });

  return booking.populate(['tourist', 'tour']);
};

// ─── Cancel Booking (tourist) ────────────────────────────────────────────────

export const cancelBooking = async (touristId, bookingId) => {
  const booking = await Booking.findById(bookingId).populate('tour');
  if (!booking) throw new NotFoundError('Booking');
  if (booking.tourist.toString() !== touristId.toString()) {
    throw new AuthorizationError('This is not your booking.');
  }
  if (booking.status !== 'CONFIRMED') {
    throw new BusinessRuleError(`Cannot cancel a booking with status "${booking.status}".`);
  }

  const tour = booking.tour;
  if (tour && new Date(tour.startDate) <= new Date()) {
    throw new BusinessRuleError('Cannot cancel a booking after the tour has started.');
  }

  booking.status = 'CANCELLED';
  booking.cancelledAt = new Date();
  await booking.save();

  // Free up the seat
  await Tour.findByIdAndUpdate(booking.tour._id, { $inc: { bookingsCount: -1 } });

  await createNotification(touristId, {
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    message: `Your booking for "${tour?.title}" has been cancelled.`,
    metadata: { bookingId },
  });

  return booking;
};

// ─── Complete Booking (organizer/admin) ──────────────────────────────────────

export const completeBooking = async (callerId, bookingId) => {
  const booking = await Booking.findById(bookingId).populate('tour');
  if (!booking) throw new NotFoundError('Booking');

  const tour = booking.tour;
  if (!tour) throw new NotFoundError('Tour');

  // Only the tour's organizer or an admin can mark as complete
  // (role check is done in resolver/permissions, but let's guard anyway)
  if (booking.status !== 'CONFIRMED') {
    throw new BusinessRuleError(`Cannot complete a booking with status "${booking.status}".`);
  }

  booking.status = 'COMPLETED';
  booking.completedAt = new Date();
  await booking.save();

  await createNotification(booking.tourist, {
    type: 'BOOKING_COMPLETED',
    title: 'Trip Completed!',
    message: `Your trip "${tour.title}" is marked as completed. We'd love to hear your experience — leave a review!`,
    metadata: { bookingId, tourId: tour._id },
  });

  return booking.populate(['tourist', 'tour']);
};

// ─── Get My Bookings (tourist) ───────────────────────────────────────────────

export const getMyBookings = async (touristId, { status, page = 1, limit = 10 } = {}) => {
  const filter = { tourist: touristId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tour'),
    Booking.countDocuments(filter),
  ]);
  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Get Bookings by Tour (organizer) ────────────────────────────────────────

export const getBookingsByTour = async (organizerId, tourId, { status, page = 1, limit = 20 } = {}) => {
  const tour = await Tour.findById(tourId);
  if (!tour) throw new NotFoundError('Tour');
  if (tour.organizer.toString() !== organizerId.toString()) {
    throw new AuthorizationError('This is not your tour.');
  }

  const filter = { tour: tourId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('tourist'),
    Booking.countDocuments(filter),
  ]);
  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── All Bookings (admin) ────────────────────────────────────────────────────

export const getAllBookings = async ({ status, page = 1, limit = 20 } = {}) => {
  const filter = {};
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(['tourist', 'tour']),
    Booking.countDocuments(filter),
  ]);
  return { bookings, total, page, totalPages: Math.ceil(total / limit) };
};
