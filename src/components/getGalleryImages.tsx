import { IMGUR_AUTHORIZATION } from '../config';
import jsonData from './galleryImagesResponse.json' assert { type: 'json' };

const DEFAULTGALLERY = "6Hpyr";

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

const styleCaptions = (albumId: string): string => {
  return !albumId || albumId === DEFAULTGALLERY ? "right" : "bottom";
};

const getGalleryImages = async (albumId: string): Promise<GalleryState> => { 
  if (window.location.href === 'http://localhost:5173/' || window.location.href === 'https://localhost:5173/') {
    // The browser is at localhost:5173
    return hydrateGalleryState(jsonData);
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
    const response = await fetch(apiUrl, details);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error response body: ${errorBody}`);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }

    const data: GalleryData = await response.json();

    return hydrateGalleryState(data);
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
