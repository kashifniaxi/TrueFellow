import cloudinary from '../config/cloudinary.js';
import logger from '../utils/logger.js';

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer      - File buffer from multer
 * @param {string} folder      - Cloudinary folder (e.g. 'profiles', 'tours')
 * @param {Object} options     - Extra Cloudinary transform options
 * @returns {Promise<string>}  - Secure URL of the uploaded image
 */
export const uploadImage = (buffer, folder = 'general', options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
        ...options,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', { error: error.message });
          return reject(new Error('Image upload failed. Please try again.'));
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Delete an image from Cloudinary by its public ID.
 * @param {string} publicId  - Cloudinary public ID
 */
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn('Cloudinary deletion warning', { publicId, error: err.message });
  }
};

/**
 * Extract the public ID from a Cloudinary secure URL.
 * Example: "https://res.cloudinary.com/demo/image/upload/v123/profiles/abc.jpg"
 *   → "profiles/abc"
 */
export const extractPublicId = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  // Skip the version segment (vXXX)
  const relevantParts = parts.slice(uploadIndex + 2);
  return relevantParts.join('/').replace(/\.[^/.]+$/, '');
};
