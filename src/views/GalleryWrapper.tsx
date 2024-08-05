import React, { useEffect, useState } from "react";
import { PaginationContextProvider } from '../context/PaginationContext';
import Menu from '../components/Menu';
import Gallery from '../components/Gallery';
import getGalleryImages from "../components/getGalleryImages";
import validateAlbum from "../helpers/validateAlbum";

import { IMAGES_PER_PAGE } from "../config";

import '../App.css';

interface GalleryType {
  captions: string;
  loadedImages: any[];
  albumName: string;
  description: string;
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
        const validAlbum = validateAlbum(albumCode) ? albumCode : "6Hpyr";
        const data = await getGalleryImages(validAlbum);
        setGalleryObject(data);
      } catch (err) {
        console.error("Failed to fetch gallery images:", err);
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const numberOfPages = Math.ceil(galleryObject.loadedImages.length / IMAGES_PER_PAGE);

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