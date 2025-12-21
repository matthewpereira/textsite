import { IMGUR_AUTHORIZATION } from '../config';
import jsonData from './galleryImagesResponse.json' assert { type: 'json' };

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
  };
}

interface GalleryState {
  albumName: string;
  captions: string;
  description: string;
  loadedImages: any[];
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
    console.warn('Failed to cache gallery data:', error);
  }
};

const getGalleryImages = async (albumId: string): Promise<GalleryState> => {
  // Check cache first
  const cached = getCachedGallery(albumId);
  if (cached) {
    console.log(`Using cached data for album ${albumId}`);
    return cached;
  }

  if (window.location.href === 'http://localhost:5173/' || window.location.href === 'https://localhost:5173/') {
    // The browser is at localhost:5173
    const data = hydrateGalleryState(jsonData);
    setCachedGallery(albumId, data);
    return data;
  }

  const apiUrl = `https://api.imgur.com/3/album/${albumId}`;

  const details = {
    method: 'GET',
    headers: {
      'Authorization': `Client-ID ${IMGUR_AUTHORIZATION}`,
      'Accept': 'application/json',
    },
  };

  try {
    console.log(`Fetching album ${albumId} from API`);
    const response = await fetch(apiUrl, details);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data: GalleryData = await response.json();
    const galleryState = hydrateGalleryState(data);

    // Cache the successful response
    setCachedGallery(albumId, galleryState);

    return galleryState;
  } catch (error) {
    console.error("Failed to fetch gallery images:", error);
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
  };
};

export default getGalleryImages;
