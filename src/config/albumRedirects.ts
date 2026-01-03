/**
 * Imgur to R2 Album ID Redirects
 *
 * Dynamically builds a map of old Imgur album IDs to new R2 album IDs from album metadata.
 * When users visit old Imgur URLs, they'll be automatically redirected to the new R2 album.
 */

import { fetchR2Albums } from '../services/r2';
import { logger } from '../utils/logger';

// Cache the redirect map to avoid repeated API calls
let redirectMapCache: Record<string, string> | null = null;
let redirectMapPromise: Promise<Record<string, string>> | null = null;

/**
 * Build the Imgur -> R2 redirect map from album metadata
 * @returns Map of Imgur IDs to R2 album IDs
 */
async function buildRedirectMap(): Promise<Record<string, string>> {
  try {
    const albums = await fetchR2Albums();
    const map: Record<string, string> = {};

    for (const album of albums) {
      if (album.imgurId) {
        map[album.imgurId] = album.id;
        logger.log(`[Redirects] Mapped ${album.imgurId} -> ${album.id} (${album.title})`);
      }
    }

    logger.log(`[Redirects] Built redirect map with ${Object.keys(map).length} entries`);
    return map;
  } catch (error) {
    logger.error('[Redirects] Failed to build redirect map:', error);
    return {};
  }
}

/**
 * Get the redirect map (cached)
 * @returns Map of Imgur IDs to R2 album IDs
 */
async function getRedirectMap(): Promise<Record<string, string>> {
  // Return cached map if available
  if (redirectMapCache) {
    return redirectMapCache;
  }

  // If already fetching, wait for that promise
  if (redirectMapPromise) {
    return redirectMapPromise;
  }

  // Start fetching and cache the promise
  redirectMapPromise = buildRedirectMap();
  redirectMapCache = await redirectMapPromise;
  redirectMapPromise = null;

  return redirectMapCache;
}

/**
 * Get the R2 album ID for a given album code (handles both Imgur IDs and R2 IDs)
 * @param albumCode - Either an old Imgur ID or a new R2 album ID
 * @returns The R2 album ID to use
 */
export async function resolveAlbumId(albumCode: string): Promise<string> {
  const redirectMap = await getRedirectMap();
  return redirectMap[albumCode] || albumCode;
}
