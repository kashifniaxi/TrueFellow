import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  { question: String, answer: String },
  { _id: false }
);

const tourSchema = new mongoose.Schema(
  {
    title:          { type: String, required: true, trim: true },
    description:    { type: String, required: true },
    departureCity:  { type: String, required: true, trim: true },
    destinationCity:{ type: String, required: true, trim: true },
    location:       { type: String, required: true, trim: true }, // general area / landmark

    category: {
      type: String,
      enum: ['ADVENTURE', 'CULTURAL', 'HIKING', 'FAMILY', 'LUXURY', 'WILDLIFE', 'BEACH', 'RELIGIOUS', 'PHOTOGRAPHY', 'OTHER'],
      required: true,
    },

    price:    { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    duration: { type: Number, required: true, min: 1 }, // in days

    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    meetingPoint:       { type: String, default: '' },
    cancellationPolicy: { type: String, default: '' },

    includedServices: { type: [String], default: [] },
    excludedServices: { type: [String], default: [] },
    itinerary:        { type: [String], default: [] },
    images:           { type: [String], default: [] },
    faqs:             { type: [faqSchema], default: [] },

    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
      default: 'PUBLISHED',
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    bookingsCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Virtual: remaining seats
tourSchema.virtual('availableSeats').get(function () {
  return this.capacity - this.bookingsCount;
});

// Indexes for search & filtering
tourSchema.index({ status: 1, startDate: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ departureCity: 1 });
tourSchema.index({ price: 1 });
tourSchema.index({ organizer: 1 });

export default mongoose.model('Tour', tourSchema);