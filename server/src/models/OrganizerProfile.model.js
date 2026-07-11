import mongoose from 'mongoose';

const organizerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Basic info
    bio:              { type: String, default: '' },
    phone:            { type: String, required: true },
    organizationName: { type: String, required: true, trim: true },
    website:          { type: String, default: '' },
    socialLinks: {
      facebook:  { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter:   { type: String, default: '' },
      linkedin:  { type: String, default: '' },
    },

    // Review workflow
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
    },
    isApproved: { type: Boolean, default: false },

    // Admin review metadata
    reviewedBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt:      { type: Date, default: null },
    rejectionReason: { type: String, default: null },

    // Suspension
    suspendedAt:     { type: Date, default: null },
    suspendReason:   { type: String, default: null },
  },
  { timestamps: true }
);

// A user can have multiple applications over time (after rejection + re-apply)
// But only ONE can be APPROVED or PENDING at any time (enforced in service layer)
organizerProfileSchema.index({ user: 1, status: 1 });

export default mongoose.model('OrganizerProfile', organizerProfileSchema);