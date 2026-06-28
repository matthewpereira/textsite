import { IMGUR_AUTHORIZATION, STORAGE_PROVIDER } from '../config';
import defaultGalleryData from './defaultGalleryData';
import { fetchR2Album } from '../services/r2';
import { logger } from '../utils/logger';
import { GalleryImageData } from '../types';

const DEFAULTGALLERY = "6Hpyr";
const CACHE_KEY_PREFIX = 'textsite_gallery_';
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

const IN_CASE_OF_ERROR: GalleryData = {
  data: {
    id: DEFAULTGALLERY,
    images: [],
    title: "Default Gallery",
    description: "Unable to load the requested gallery."
  },
};

interface GalleryData {
  data: {
    id: string;
    images: GalleryImageData[];
    title?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    date?: string;
    totalImages?: number;
  };
}

// Special error class to distinguish 404 Not Found from other errors
class NotFoundError extends Error {
  constructor(albumId: string) {
    super(`Album not found: ${albumId}`);
    this.name = 'NotFoundError';
  }
}

interface GalleryState {
  albumName: string;
  captions: string;
  description: string;
  loadedImages: GalleryImageData[];
  createdAt?: string;
  updatedAt?: string;
  date?: string;
  totalImages?: number;
}

interface CachedGallery {
  data: GalleryState;
  timestamp: number;
}

const styleCaptions = (albumId: string): string => {
  return !albumId || albumId === DEFAULTGALLERY ? "right" : "bottom";
};

const getCachedGallery = (albumId: string): GalleryState | null => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${albumId}`;
    const cached = sessionStorage.getItem(cacheKey);

    if (!cached) return null;

    const cachedData: CachedGallery = JSON.parse(cached);

    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    return cachedData.data;
  } catch {
    return null;
  }
};

const setCachedGallery = (albumId: string, data: GalleryState): void => {
  try {
    const cacheKey = `${CACHE_KEY_PREFIX}${albumId}`;
    const cachedData: CachedGallery = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem(cacheKey, JSON.stringify(cachedData));
  } catch (error) {
    logger.warn('Failed to cache gallery data:', error);
  }
};

const getGalleryImages = async (albumId: string, token?: string): Promise<GalleryState> => {
  // Return hardcoded default gallery without any network call
  if (albumId === 'default') {
    return defaultGalleryData;
  }

  // sessionStorage cache is anonymous-only — authed responses can include
  // private/unlisted album content that mustn't be served to a later
  // anonymous session in the same tab.
  if (!token) {
    const cached = getCachedGallery(albumId);
    if (cached) {
      logger.log(`Using cached data for album ${albumId}`);
      return cached;
    }
  }

  // Local development mode
  if (window.location.hostname === 'localhost') {
    const { default: jsonData } = await import('./galleryImagesResponse.json', { with: { type: 'json' } });
    const data = hydrateGalleryState(jsonData);
    setCachedGallery(albumId, data);
    return data;
  }

  // Route to appropriate storage provider
  const provider = STORAGE_PROVIDER.toLowerCase();
  logger.log(`[Storage] Using provider: ${provider} for album ${albumId}`);

  try {
    let data: GalleryData;

    if (provider === 'r2') {
      // Fetch all images from R2 at once (now fast with parallel metadata fetching)
      logger.log(`[R2] Fetching album ${albumId} from R2`);

      try {
        const r2Album = await fetchR2Album(albumId, undefined, 0, token); // Fetch all images, no pagination
        logger.log(`[R2] Loaded ${r2Album.images.length} images`);

        // Convert R2 format to GalleryData format
        data = {
          data: {
            id: r2Album.id,
            images: r2Album.images,
            title: r2Album.title,
            description: r2Album.description,
            createdAt: r2Album.createdAt,
            updatedAt: r2Album.updatedAt,
            date: r2Album.date,
          },
        };
      } catch (error) {
        // Check if the error is a 404 from the Worker API
        if (error instanceof Error && error.message.includes('404')) {
          logger.log(`[R2] Album ${albumId} not found (404)`);
          throw new NotFoundError(albumId);
        }
        throw error;
      }
    } else {
      // Default to Imgur
      logger.log(`[Imgur] Fetching album ${albumId} from Imgur API`);
      const apiUrl = `https://api.imgur.com/3/album/${albumId}`;

      const details = {
        method: 'GET',
        headers: {
          'Authorization': `Client-ID ${IMGUR_AUTHORIZATION}`,
          'Accept': 'application/json',
        },
      };

      const response = await fetch(apiUrl, details);

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(`[Imgur] Error response body: ${errorBody}`);
        if (response.status === 404) {
          throw new NotFoundError(albumId);
        }
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      data = await response.json();
    }

    const galleryState = hydrateGalleryState(data);

    // Cache anonymous responses only; authed responses can include
    // private/unlisted content that mustn't be served to anonymous reads.
    if (!token) {
      setCachedGallery(albumId, galleryState);
    }

    return galleryState;
  } catch (error) {
    // Re-throw NotFoundError so the caller can handle 404s differently
    if (error instanceof NotFoundError) {
      throw error;
    }
    logger.error(`[${provider.toUpperCase()}] Failed to fetch gallery images:`, error);
    return hydrateGalleryState(IN_CASE_OF_ERROR);
  }
};

const hydrateGalleryState = (data: GalleryData): GalleryState => {
  const captions = styleCaptions(data.data.id);
  const loadedImages = data.data.images || [];
  const description = data.data.description || "";
  const albumName = data.data.title || "Matthew Pereira";

  return {
    albumName,
    captions,
    description,
    loadedImages,
    createdAt: data.data.createdAt,
    updatedAt: data.data.updatedAt,
    date: data.data.date,
    totalImages: data.data.totalImages,
  };
};

export default getGalleryImages;
export { NotFoundError };
