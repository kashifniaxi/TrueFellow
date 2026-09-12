import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const travelPreferencesSchema = new mongoose.Schema(
  {
    interests:   { type: [String], default: [] },   // e.g. ['hiking', 'photography', 'food']
    travelStyle: {
      type: String,
      enum: ['SOLO', 'GROUP', 'FAMILY', 'COUPLE', 'ADVENTURE', 'LUXURY', 'BUDGET'],
      default: 'GROUP',
    },
    languages:   { type: [String], default: ['English'] },
    budgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['TOURIST', 'ORGANIZER', 'ADMIN'],
      default: 'TOURIST',
    },
    isVerified: { type: Boolean, default: false },
    isActive:   { type: Boolean, default: true },

    // Profile extras
    profilePicture: { type: String, default: null },
    bio:   { type: String, default: '' },
    phone: { type: String, default: null },

    // Saved tours list
    savedTours: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tour' }],

    // Travel partner matching preferences
    travelPreferences: { type: travelPreferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare plain password against stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;