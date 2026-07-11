import express from 'express';
import multer from 'multer';
import { uploadImage } from '../services/upload.service.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Multer — store file in memory, max 5MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

// ─── Auth Guard for REST routes ───────────────────────────────────────────────

const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided.' });
    }
    const token   = authHeader.split(' ')[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Authentication failed.' });
  }
};

// ─── Upload Profile Picture ───────────────────────────────────────────────────

router.post(
  '/profile-picture',
  authGuard,
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
      const url = await uploadImage(req.file.buffer, 'profiles');
      res.json({ url });
    } catch (err) {
      logger.error('Profile picture upload failed', { error: err.message });
      res.status(500).json({ error: err.message });
    }
  }
);

// ─── Upload Tour Images (up to 5 at once) ────────────────────────────────────

router.post(
  '/tour-images',
  authGuard,
  upload.array('images', 5),
  async (req, res) => {
    try {
      if (!req.files?.length) return res.status(400).json({ error: 'No image files provided.' });
      const urls = await Promise.all(
        req.files.map((f) => uploadImage(f.buffer, 'tours'))
      );
      res.json({ urls });
    } catch (err) {
      logger.error('Tour image upload failed', { error: err.message });
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
