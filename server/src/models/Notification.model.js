import mongoose from 'mongoose';

const NOTIFICATION_TYPES = [
  'BOOKING_CONFIRMED',
  'BOOKING_CANCELLED',
  'BOOKING_COMPLETED',
  'ORGANIZER_APPROVED',
  'ORGANIZER_REJECTED',
  'ORGANIZER_SUSPENDED',
  'TOUR_CANCELLED',
  'REVIEW_RECEIVED',
  'COMPANION_MATCH',
  'SYSTEM',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type:    { type: String, enum: NOTIFICATION_TYPES, required: true },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    // Flexible metadata (e.g. { tourId, bookingId })
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
