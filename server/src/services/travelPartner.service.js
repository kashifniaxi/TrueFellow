import Booking from '../models/Booking.model.js';
import User from '../models/User.model.js';
import Tour from '../models/Tour.model.js';
import { NotFoundError, BusinessRuleError } from '../utils/errors.js';

/**
 * Calculate a compatibility score (0–100) between two users
 * based on their travelPreferences.
 */
const scoreCompatibility = (prefs1, prefs2) => {
  if (!prefs1 || !prefs2) return 0;

  let score = 0;
  const MAX = 100;

  const interests1 = prefs1.interests || [];
  const interests2 = prefs2.interests || [];
  const languages1 = prefs1.languages || [];
  const languages2 = prefs2.languages || [];
  const budget1 = prefs1.budgetRange || {};
  const budget2 = prefs2.budgetRange || {};

  // Shared interests: each shared interest = 10 pts (max 40)
  const sharedInterests = interests1.filter((i) => interests2.includes(i));
  score += Math.min(sharedInterests.length * 10, 40);

  // Same travel style: 25 pts
  if (prefs1.travelStyle && prefs1.travelStyle === prefs2.travelStyle) score += 25;

  // Shared languages: 10 pts per shared language (max 20)
  const sharedLangs = languages1.filter((l) => languages2.includes(l));
  score += Math.min(sharedLangs.length * 10, 20);

  // Overlapping budget range: 15 pts
  const hasOverlap =
    (budget1.max || 0) > 0 &&
    (budget2.max || 0) > 0 &&
    (budget1.min || 0) <= (budget2.max || 0) &&
    (budget2.min || 0) <= (budget1.max || 0);
  if (hasOverlap) score += 15;

  return Math.round((score / MAX) * 100);
};

// ─── Opt In / Out of Companion Matching ──────────────────────────────────────

export const toggleCompanionMatching = async (touristId, bookingId, enabled) => {
  const booking = await Booking.findOne({ _id: bookingId, tourist: touristId });
  if (!booking) throw new NotFoundError('Booking');
  if (booking.status !== 'CONFIRMED') {
    throw new BusinessRuleError('Companion matching can only be toggled for confirmed bookings.');
  }
  booking.companionMatchingEnabled = enabled;
  await booking.save();
  return booking.populate(['tourist', 'tour']);
};

// ─── Match Companions on a Tour ──────────────────────────────────────────────

export const matchCompanions = async (requestingUserId, tourId) => {
  const tour = await Tour.findById(tourId);
  if (!tour) throw new NotFoundError('Tour');

  // Requesting user must have a confirmed booking on this tour
  const myBooking = await Booking.findOne({
    tourist: requestingUserId,
    tour:    tourId,
    status:  'CONFIRMED',
  });
  if (!myBooking) {
    throw new BusinessRuleError('You must have a confirmed booking on this tour to match with companions.');
  }
  if (!myBooking.companionMatchingEnabled) {
    throw new BusinessRuleError('You must enable companion matching on your booking before viewing matches.');
  }

  const requestingUser = await User.findById(requestingUserId);

  // Get all other confirmed, opt-in bookings for this tour
  const otherBookings = await Booking.find({
    tour:   tourId,
    status: 'CONFIRMED',
    companionMatchingEnabled: true,
    tourist: { $ne: requestingUserId },
  }).populate('tourist');

  const matches = otherBookings
    .filter((b) => Boolean(b.tourist))
    .map((b) => {
      const other = b.tourist;
      const score = scoreCompatibility(
        requestingUser.travelPreferences,
        other.travelPreferences
      );
      return {
        user:            other,
        compatibilityScore: score,
        sharedInterests: (requestingUser.travelPreferences?.interests || []).filter((i) =>
          (other.travelPreferences?.interests || []).includes(i)
        ),
      };
    });

  // Sort by compatibility descending
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
