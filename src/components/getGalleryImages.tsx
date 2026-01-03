import { IMGUR_AUTHORIZATION, STORAGE_PROVIDER, IMAGES_PER_PAGE } from '../config';
import jsonData from './galleryImagesResponse.json' assert { type: 'json' };
import { fetchR2Album } from '../services/r2';
import { logger } from '../utils/logger';

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
    images: any[];
    title?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    date?: string;
    totalImages?: number;
  };
}

interface GalleryState {
  albumName: string;
  captions: string;
  description: string;
  loadedImages: any[];
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

/**
 * Fetch remaining images in batches
 * @param albumId - Album ID
 * @param alreadyFetched - Number of images already fetched
 * @param totalImages - Total number of images in album
 */
const fetchRemainingImages = async (
  albumId: string,
  alreadyFetched: number,
  totalImages: number
): Promise<any[]> => {
  const remainingImages: any[] = [];
  const batchSize = IMAGES_PER_PAGE;

  // Fetch remaining images in batches
  for (let offset = alreadyFetched; offset < totalImages; offset += batchSize) {
    const limit = Math.min(batchSize, totalImages - offset);
    logger.log(`[R2] Fetching batch: offset=${offset}, limit=${limit}`);

    try {
      const batch = await fetchR2Album(albumId, limit, offset);
      remainingImages.push(...batch.images);
    } catch (error) {
      logger.error(`[R2] Failed to fetch batch at offset ${offset}:`, error);
      // Continue fetching other batches even if one fails
    }
  }

  return remainingImages;
};

const getGalleryImages = async (albumId: string): Promise<GalleryState> => {
  // Check cache first
  const cached = getCachedGallery(albumId);
  if (cached) {
    logger.log(`Using cached data for album ${albumId}`);
    return cached;
  }

  // Local development mode
  if (window.location.href === 'http://localhost:5173/' || window.location.href === 'https://localhost:5173/') {
    // The browser is at localhost:5173
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
      // Fetch from R2 with progressive loading
      // Strategy: Load first page of images immediately for fast initial render
      const initialBatch = IMAGES_PER_PAGE;
      logger.log(`[R2] Fetching album ${albumId} from R2 (first ${initialBatch} images for fast display)`);

      // First, fetch only a small batch to show something VERY quickly
      const r2Album = await fetchR2Album(albumId, initialBatch, 0);
      const totalImages = r2Album.totalImages || r2Album.images.length;

      logger.log(`[R2] Loaded ${r2Album.images.length} of ${totalImages} total images`);

      // If there are more images, fetch them in the background
      if (totalImages > initialBatch) {
        // Fetch remaining images asynchronously without blocking
        fetchRemainingImages(albumId, r2Album.images.length, totalImages).then((remainingImages: any[]) => {
          // Update cache with all images
          const allImages = [...r2Album.images, ...remainingImages];
          const completeGalleryState = hydrateGalleryState({
            data: {
              id: r2Album.id,
              images: allImages,
              title: r2Album.title,
              description: r2Album.description,
              createdAt: r2Album.createdAt,
              updatedAt: r2Album.updatedAt,
              date: r2Album.date,
            },
          });
          setCachedGallery(albumId, completeGalleryState);
          logger.log(`[R2] Background fetch complete: ${allImages.length} total images cached`);
        }).catch((err: any) => {
          logger.error('[R2] Failed to fetch remaining images in background:', err);
        });
      }

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
          totalImages: totalImages,
        },
      };
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
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
      }

      data = await response.json();
    }

    const galleryState = hydrateGalleryState(data);

    // Cache the successful response
    setCachedGallery(albumId, galleryState);

    return galleryState;
  } catch (error) {
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
