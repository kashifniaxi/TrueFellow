import { verifyToken } from '../utils/token.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

/**
 * Express middleware to authenticate Bearer JWT token.
 * Attaches active user document to `req.user`.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.warn('Authentication middleware failure', { error: err.message });
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

export default authenticate;
