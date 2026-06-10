/**
 * Imgur to R2 Album ID Redirects
 *
 * Dynamically builds a map of old Imgur album IDs to new R2 album IDs from the
 * dedicated /api/imgur-redirects endpoint, which returns the full map regardless
 * of album privacy. This ensures legacy /a/{imgurId} URLs continue to work for
 * private and unlisted albums — downstream album fetches still enforce privacy.
 */

import { fetchImgurRedirects } from '../services/r2';
import { logger } from '../utils/logger';

// Cache the redirect map to avoid repeated API calls
let redirectMapCache: Record<string, string> | null = null;
let redirectMapPromise: Promise<Record<string, string>> | null = null;

/**
 * Build the Imgur -> R2 redirect map from the worker's imgur-redirects endpoint
 * @returns Map of Imgur IDs to R2 album IDs
 */
async function buildRedirectMap(): Promise<Record<string, string>> {
  try {
    const redirects = await fetchImgurRedirects();

    for (const [imgurId, albumId] of Object.entries(redirects)) {
      logger.log(`[Redirects] Mapped ${imgurId} -> ${albumId}`);
    }

    logger.log(`[Redirects] Built redirect map with ${Object.keys(redirects).length} entries`);
    return redirects;
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
  // If albumCode looks like an R2 album ID (starts with "album_"), skip redirect lookup
  // This avoids fetching the full album list for direct R2 album access
  if (albumCode.startsWith('album_') || albumCode === 'default') {
    return albumCode;
  }

  // Only fetch redirect map for old Imgur IDs (short codes)
  const redirectMap = await getRedirectMap();
  return redirectMap[albumCode] || albumCode;
}
