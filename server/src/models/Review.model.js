import mongoose from 'mongoose';

const aspectSchema = new mongoose.Schema(
  {
    organization:  { type: Number, min: 1, max: 5, default: null },
    safety:        { type: Number, min: 1, max: 5, default: null },
    transportation:{ type: Number, min: 1, max: 5, default: null },
    accommodation: { type: Number, min: 1, max: 5, default: null },
    communication: { type: Number, min: 1, max: 5, default: null },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    tourist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },

    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    images:  { type: [String], default: [] },
    aspects: { type: aspectSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// One review per completed booking
reviewSchema.index({ booking: 1 }, { unique: true });
// For calculating organizer average rating
reviewSchema.index({ tour: 1 });

export default mongoose.model('Review', reviewSchema);
