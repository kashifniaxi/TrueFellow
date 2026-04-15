import bcrypt from 'bcrypt';
import User from '../models/User.model.js';
import { generateToken, refreshToken } from '../utils/token.js';

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email already in use');
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });
  
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
  
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  return {
    accessToken: generateToken(user),
    refreshToken: refreshToken(user),
    user
  };
};

