import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./GalleryWrapper.css";
import { PaginationContextProvider } from '../context/PaginationContext';
import Menu from '../components/Menu';
import Gallery from '../components/Gallery';
import getGalleryImages, { NotFoundError } from "../components/getGalleryImages";

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
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [galleryObject, setGalleryObject] = useState<GalleryType>({
    captions: '',
    loadedImages: [],
    albumName: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchGalleryObject() {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      try {
        // Resolve album ID (handles Imgur -> R2 redirects)
        const resolvedAlbumId = await resolveAlbumId(albumCode);

        // Pass the Auth0 token when the user is logged in so private and
        // unlisted albums are visible. Failure to fetch the token falls back
        // to anonymous — same as if they were signed out.
        let token: string | undefined;
        if (isAuthenticated) {
          try {
            token = await getAccessTokenSilently();
          } catch (err) {
            logger.warn('Failed to get access token, falling back to anonymous:', err);
          }
        }

        // Try to fetch the album directly - if it's not found (404), show not-found
        let data;
        try {
          data = await getGalleryImages(resolvedAlbumId, token);
        } catch (err) {
          if (err instanceof NotFoundError) {
            logger.warn(`Album ${resolvedAlbumId} not found (404)`);
            setNotFound(true);
            setIsLoading(false);
            return;
          }
          logger.warn(`Album ${resolvedAlbumId} fetch error, falling back to default`, err);
          data = await getGalleryImages("default", token);
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
  }, [albumCode, isAuthenticated, getAccessTokenSilently]);

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

  if (notFound) {
    return (
      <div>
        <Menu loadedImages={{ loadedImages: [] }} />
        <div style={{ textAlign: "center", padding: "50px" }}>
          Album not found
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Menu loadedImages={{ loadedImages: [] }} />
        <div style={{ textAlign: "center", padding: "50px", color: "#dc3545" }}>
          Error: {error}
        </div>
      </div>
    );
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