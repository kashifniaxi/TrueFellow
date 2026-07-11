import Tour from '../models/Tour.model.js';
import Booking from '../models/Booking.model.js';
import { createNotification } from './notification.service.js';
import { NotFoundError, AuthorizationError, ValidationError, BusinessRuleError } from '../utils/errors.js';

// ─── Create Tour ─────────────────────────────────────────────────────────────

export const createTour = async (organizerId, input) => {
  if (new Date(input.startDate) >= new Date(input.endDate)) {
    throw new ValidationError('Start date must be before end date.');
  }
  const tour = await Tour.create({ ...input, organizer: organizerId });
  return tour.populate('organizer');
};

// ─── Get All Tours (with filters + pagination) ───────────────────────────────

export const getTours = async ({
  category,
  departureCity,
  destinationCity,
  minPrice,
  maxPrice,
  minDuration,
  maxDuration,
  startDate,
  endDate,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  page = 1,
  limit = 12,
} = {}) => {
  const filter = { status: 'PUBLISHED' };

  if (category)        filter.category = category;
  if (departureCity)   filter.departureCity = new RegExp(departureCity, 'i');
  if (destinationCity) filter.destinationCity = new RegExp(destinationCity, 'i');
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }
  if (minDuration !== undefined || maxDuration !== undefined) {
    filter.duration = {};
    if (minDuration !== undefined) filter.duration.$gte = minDuration;
    if (maxDuration !== undefined) filter.duration.$lte = maxDuration;
  }
  if (startDate) filter.startDate = { $gte: new Date(startDate) };
  if (endDate)   filter.endDate   = { $lte: new Date(endDate) };
  if (search) {
    filter.$or = [
      { title:           new RegExp(search, 'i') },
      { description:     new RegExp(search, 'i') },
      { destinationCity: new RegExp(search, 'i') },
    ];
  }

  const skip      = (page - 1) * limit;
  const sortField = ['price', 'createdAt', 'startDate', 'bookingsCount'].includes(sortBy) ? sortBy : 'createdAt';
  const sort      = { [sortField]: sortOrder === 'asc' ? 1 : -1 };

  const [tours, total] = await Promise.all([
    Tour.find(filter).sort(sort).skip(skip).limit(limit).populate('organizer'),
    Tour.countDocuments(filter),
  ]);

  return { tours, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Get Tour by ID ──────────────────────────────────────────────────────────

export const getTourById = async (id) => {
  const tour = await Tour.findById(id).populate('organizer');
  if (!tour) throw new NotFoundError('Tour');
  return tour;
};

// ─── Get Organizer's Tours ───────────────────────────────────────────────────

export const getOrganizerTours = async (organizerId, { page = 1, limit = 12, status } = {}) => {
  const filter = { organizer: organizerId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [tours, total] = await Promise.all([
    Tour.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Tour.countDocuments(filter),
  ]);
  return { tours, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Update Tour ─────────────────────────────────────────────────────────────

export const updateTour = async (organizerId, tourId, updates) => {
  const tour = await Tour.findById(tourId);
  if (!tour) throw new NotFoundError('Tour');
  if (tour.organizer.toString() !== organizerId.toString()) {
    throw new AuthorizationError('You can only edit your own tours.');
  }
  if (tour.status === 'CANCELLED') {
    throw new BusinessRuleError('Cannot update a cancelled tour.');
  }
  if (updates.startDate && updates.endDate && new Date(updates.startDate) >= new Date(updates.endDate)) {
    throw new ValidationError('Start date must be before end date.');
  }

  Object.assign(tour, updates);
  await tour.save();
  return tour.populate('organizer');
};

// ─── Cancel Tour ─────────────────────────────────────────────────────────────

export const cancelTour = async (organizerId, tourId) => {
  const tour = await Tour.findById(tourId);
  if (!tour) throw new NotFoundError('Tour');
  if (tour.organizer.toString() !== organizerId.toString()) {
    throw new AuthorizationError('You can only cancel your own tours.');
  }
  if (tour.status === 'CANCELLED') {
    throw new BusinessRuleError('Tour is already cancelled.');
  }

  tour.status = 'CANCELLED';
  await tour.save();

  // Notify all confirmed tourists
  const bookings = await Booking.find({ tour: tourId, status: 'CONFIRMED' }).select('tourist');
  const notifications = bookings.map((b) =>
    createNotification(b.tourist, {
      type: 'TOUR_CANCELLED',
      title: 'Tour Cancelled',
      message: `The tour "${tour.title}" has been cancelled by the organizer.`,
      metadata: { tourId },
    })
  );
  await Promise.all(notifications);

  return tour.populate('organizer');
};
