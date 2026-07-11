import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED'],
      default: 'CONFIRMED',
    },

    notes: { type: String, default: '' }, // tourist note at booking time

    // Companion matching opt-in
    companionMatchingEnabled: { type: Boolean, default: false },

    // Lifecycle timestamps
    bookedAt:    { type: Date, default: Date.now },
    cancelledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prevent a tourist from booking the same tour twice
bookingSchema.index({ tourist: 1, tour: 1 }, { unique: true });

export default mongoose.model('Booking', bookingSchema);
