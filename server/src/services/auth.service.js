import User from '../models/User.model.js';
import { generateToken, refreshToken } from '../utils/token.js';

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Pass plain password — the User model's pre-save hook handles hashing
  const user = await User.create({ name, email, password });

  return {
    accessToken: generateToken(user),
    refreshToken: refreshToken(user),
    user
  };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    accessToken: generateToken(user),
    refreshToken: refreshToken(user),
    user
  };
};

