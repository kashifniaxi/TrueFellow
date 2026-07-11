import User from '../models/User.model.js';
import { generateToken, generateRefreshToken } from '../utils/token.js';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
} from '../utils/errors.js';

// ─── Register ────────────────────────────────────────────────────────────────

export const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ConflictError('An account with this email already exists.');

  const user = await User.create({ name, email, password });

  return {
    accessToken:  generateToken(user),
    refreshToken: generateRefreshToken(user),
    user,
  };
};

// ─── Login ───────────────────────────────────────────────────────────────────

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email, isActive: true });
  if (!user) throw new AuthenticationError('Invalid email or password.');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AuthenticationError('Invalid email or password.');

  return {
    accessToken:  generateToken(user),
    refreshToken: generateRefreshToken(user),
    user,
  };
};

// ─── Update Profile ──────────────────────────────────────────────────────────

export const updateProfile = async (userId, { name, bio, phone, profilePicture, travelPreferences }) => {
  const update = {};
  if (name !== undefined)            update.name = name;
  if (bio !== undefined)             update.bio = bio;
  if (phone !== undefined)           update.phone = phone;
  if (profilePicture !== undefined)  update.profilePicture = profilePicture;
  if (travelPreferences !== undefined) update.travelPreferences = travelPreferences;

  const user = await User.findByIdAndUpdate(userId, update, { new: true, runValidators: true });
  if (!user) throw new NotFoundError('User');
  return user;
};

// ─── Change Password ─────────────────────────────────────────────────────────

export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ValidationError('Current password is incorrect.');

  user.password = newPassword;
  await user.save();
  return true;
};

// ─── Deactivate Account ──────────────────────────────────────────────────────

export const deactivateAccount = async (userId, password) => {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ValidationError('Password is incorrect.');

  user.isActive = false;
  await user.save();
  return true;
};

// ─── Get My Profile ──────────────────────────────────────────────────────────

export const getMyProfile = async (userId) => {
  const user = await User.findById(userId).populate('savedTours');
  if (!user) throw new NotFoundError('User');
  return user;
};

// ─── Save / Unsave Tour ──────────────────────────────────────────────────────

export const saveTour = async (userId, tourId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { savedTours: tourId } },
    { new: true }
  );
  return user;
};

export const unsaveTour = async (userId, tourId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { savedTours: tourId } },
    { new: true }
  );
  return user;
};
