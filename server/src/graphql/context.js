import { verifyToken } from '../utils/token.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

export const context = async ({ req }) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null };
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('name email role isVerified isActive');

    if (!user || !user.isActive) {
      return { user: null };
    }

    return { user };
  } catch (err) {
    logger.debug('GraphQL context token verification failed', { error: err.message });
    return { user: null };
  }
};