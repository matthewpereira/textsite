/**
 * Cloudflare R2 Storage Service
 *
 * Fetches album and image data from Cloudflare Worker API.
 *
 * Security considerations:
 * - No credentials in frontend code
 * - All R2 access handled by Worker with proper authentication
 * - Worker enforces CORS and rate limiting
 *
 * Performance considerations:
 * - Metadata cached at Worker level (30 min)
 * - Additional caching in sessionStorage (30 min)
 * - Public R2 URLs served via Cloudflare CDN
 */

import { R2_API_URL } from '../config';
import { logger } from '../utils/logger';

interface R2Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  size: number;
  type: string;
  width: number;
  height: number;
  datetime: number;
  animated?: boolean;
}

interface AlbumResponse {
  id: string;
  title: string;
  description?: string;
  images: R2Image[];
  createdAt: string;
  updatedAt: string;
  date?: string;
  totalImages?: number;
}

export interface R2Album {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  date?: string;
  imgurId?: string;
}

/**
 * Fetch list of all albums from Cloudflare Worker API
 *
 * @returns Array of album data with IDs, titles, and dates
 */
export async function fetchR2Albums(): Promise<R2Album[]> {
  try {
    logger.log('[R2] Fetching albums list from Worker API');

    const response = await fetch(`${R2_API_URL}/api/albums`);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[R2] Worker API error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch albums: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    logger.log(`[R2] Successfully loaded ${data.albums.length} albums`);

    return data.albums;
  } catch (error) {
    logger.error('[R2] Failed to fetch albums:', error);
    return [];
  }
}

/**
 * Fetch album data from Cloudflare Worker API
 *
 * @param albumId - The album ID to fetch
 * @param limit - Maximum number of images to fetch (optional, fetches all if not specified)
 * @param offset - Number of images to skip (default: 0)
 * @returns Album data in Imgur-compatible format
 */
export async function fetchR2Album(
  albumId: string,
  limit?: number,
  offset: number = 0
): Promise<{
  id: string;
  title: string;
  description?: string;
  images: R2Image[];
  createdAt: string;
  updatedAt: string;
  date?: string;
  totalImages?: number;
}> {
  try {
    // Build URL with pagination parameters
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', limit.toString());
    if (offset) params.set('offset', offset.toString());
    const queryString = params.toString();
    const url = `${R2_API_URL}/api/albums/${albumId}${queryString ? `?${queryString}` : ''}`;

    logger.log(`[R2] Fetching album ${albumId} from Worker API (limit: ${limit || 'all'}, offset: ${offset})`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`[R2] Worker API error (${response.status}):`, errorText);
      throw new Error(`Failed to fetch album: ${response.status} ${response.statusText}`);
    }

    const album: AlbumResponse = await response.json();
    logger.log(`[R2] Successfully loaded album ${albumId} with ${album.images.length} images`);

    // Map R2 image format to Imgur-compatible format
    // GalleryImage component expects 'link' field instead of 'url'
    const mappedImages = album.images.map(img => {
      const mapped = {
        ...img,
        link: img.url, // Map 'url' to 'link' for compatibility
      };
      logger.log('[R2] Mapped image:', { id: img.id, url: img.url, link: mapped.link });
      return mapped;
    });

    return {
      id: album.id,
      title: album.title,
      description: album.description,
      images: mappedImages as any,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt,
      date: album.date,
      totalImages: album.totalImages,
    };
  } catch (error) {
    logger.error(`[R2] Failed to fetch album ${albumId}:`, error);
    throw new Error(`Failed to fetch album from R2: ${albumId}`);
  }
}
