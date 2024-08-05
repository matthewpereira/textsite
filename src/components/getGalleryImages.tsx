import { IMGUR_AUTHORIZATION } from '../config';

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
  const details = {
    headers: {
      Authorization: `Client-ID ${IMGUR_AUTHORIZATION}`,
    },
  };

  try {
    const response = await fetch(`https://api.imgur.com/3/album/${albumId}`, details);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
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