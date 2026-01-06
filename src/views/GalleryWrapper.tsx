import { useEffect, useState } from "react";
import "./GalleryWrapper.css";
import { PaginationContextProvider } from '../context/PaginationContext';
import Menu from '../components/Menu';
import Gallery from '../components/Gallery';
import getGalleryImages from "../components/getGalleryImages";

import { IMAGES_PER_PAGE } from "../config";
import { logger } from "../utils/logger";
import { resolveAlbumId } from "../config/albumRedirects";

import '../App.css';

interface GalleryType {
  captions: string;
  loadedImages: any[];
  albumName: string;
  description: string;
  totalImages?: number;
}

interface GalleryWrapperType {
  albumCode: string;
}

function GalleryWrapper({ albumCode }: GalleryWrapperType) {
  const [galleryObject, setGalleryObject] = useState<GalleryType>({
    captions: '',
    loadedImages: [],
    albumName: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGalleryObject() {
      setIsLoading(true);
      setError(null);
      try {
        // Resolve album ID (handles Imgur -> R2 redirects)
        const resolvedAlbumId = await resolveAlbumId(albumCode);

        // Try to fetch the album directly - if it doesn't exist, fall back to default
        let data;
        try {
          data = await getGalleryImages(resolvedAlbumId);
        } catch (err) {
          logger.warn(`Album ${resolvedAlbumId} not found, falling back to default`);
          data = await getGalleryImages("default");
        }
        setGalleryObject(data);
      } catch (err) {
        logger.error("Failed to fetch gallery images:", err);
        setError("Failed to load gallery images. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGalleryObject();
  }, [albumCode]);

  useEffect(() => {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.classList.remove("loading");
    }
  }, []);

  if (isLoading) {
    return (
      <div style={{ fontSize: "12px", padding: "8px", backgroundColor: "transparent" }}>
        Loading<span className="animated-dots">...</span>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Use totalImages if available (for R2 with progressive loading), otherwise use loadedImages.length
  const imageCount = galleryObject.totalImages || galleryObject.loadedImages.length;
  const numberOfPages = Math.ceil(imageCount / IMAGES_PER_PAGE);

  return (
    <div>
      <PaginationContextProvider numberOfPages={numberOfPages}>
        <Menu loadedImages={galleryObject.loadedImages} />
        <Gallery galleryObject={galleryObject} />
      </PaginationContextProvider>
    </div>
  );
}

export default GalleryWrapper;