import { API_BASE_URL } from './config';

export const DEFAULT_TOUR_COVER =
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80';

export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

/**
 * Normalizes image URLs to ensure relative backend upload paths (e.g. /uploads/abc.jpg)
 * get prepended with the API base server URL.
 */
export const getImageUrl = (url, fallback = DEFAULT_TOUR_COVER) => {
  if (!url) return fallback;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanPath}`;
};
