import { STORAGE_PROVIDER } from '../config';
import { fetchR2Albums } from '../services/r2';
import allowedAlbums from "../allowedAlbums";
import { logger } from '../utils/logger';

// Cache album list for 5 minutes
let albumsCache: { ids: Set<string>; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Validate if an album ID exists
 *
 * For R2 storage: Fetches the list of albums from R2 Worker API (cached)
 * For Imgur: Uses the hardcoded allowedAlbums list
 *
 * @param albumId - The album ID to validate
 * @returns Promise<boolean> - Whether the album exists
 */
const validateAlbum = async (albumId: string): Promise<boolean> => {
  const provider = STORAGE_PROVIDER.toLowerCase();

  if (provider === 'r2') {
    // Check if cache is valid
    const now = Date.now();
    if (albumsCache && (now - albumsCache.timestamp) < CACHE_DURATION) {
      return albumsCache.ids.has(albumId);
    }

    // Fetch albums dynamically from R2 and update cache
    try {
      const albums = await fetchR2Albums();
      albumsCache = {
        ids: new Set(albums.map(a => a.id)),
        timestamp: now
      };
      return albumsCache.ids.has(albumId);
    } catch (error) {
      logger.error('[validateAlbum] Failed to fetch R2 albums:', error);
      // Fallback to false on error
      return false;
    }
  }

  // For Imgur, use hardcoded list
  return Object.values(allowedAlbums).indexOf(albumId) > -1;
};

export default validateAlbum;