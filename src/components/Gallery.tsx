import { useEffect } from 'react';
import { useLocation } from "react-router-dom";

import GalleryImage from './GalleryImage';
import { usePaginationContext } from '../context/PaginationContext';

import handleKeypress from '../helpers/handleKeypress';
import removeHashFromHashString from '../helpers/removeHashFromHashString';
import { formatAlbumDate } from '../helpers/formatDate';

import { IMAGES_PER_PAGE } from '../config';

import { useAuth0 } from "@auth0/auth0-react";
import { GalleryImage as GalleryImageType } from '../types';

// Don't show the album name and description on default gallery
export const isAlbumPage = (pathname: string) => (
  pathname.startsWith('/a/')
);

export const filterArrayToPage = (array: GalleryImageType[], pageNumber: number, itemsPerGroup: number) => {
  const startIndex = pageNumber === 0 ? 0 : pageNumber * itemsPerGroup;
  const endIndex = (pageNumber + 1) * itemsPerGroup;

  return array.slice(startIndex, endIndex);
}

interface GalleryProps {
  galleryObject: {
    loadedImages: GalleryImageType[];
    albumName: string;
    description: string;
    date?: string;
    createdAt?: string;
    captions: string;
  };
}

const Gallery = ({ galleryObject }: GalleryProps) => {

  const { isAuthenticated } = useAuth0();

  const location = useLocation();
  const { numberOfPages } = usePaginationContext();

  // Extract photo ID from URL hash (e.g., #p/abc123)
  const photoIdMatch = location.hash.match(/#p\/([^/?#]+)/);
  const targetPhotoId = photoIdMatch ? photoIdMatch[1] : null;

  // Find which page contains the target photo
  const findPageForPhoto = (photoId: string): number | null => {
    const allImages = galleryObject.loadedImages;
    const imageIndex = allImages.findIndex(img => img.id === photoId);

    if (imageIndex === -1) return null;

    return Math.floor(imageIndex / IMAGES_PER_PAGE);
  };

  // Determine current page for pagination and keyboard navigation
  let currentPageNumber = 0;

  if (targetPhotoId) {
    const photoPage = findPageForPhoto(targetPhotoId);
    if (photoPage !== null) {
      currentPageNumber = photoPage + 1; // +1 because pagination displays 1-indexed pages
    }
  } else {
    currentPageNumber = Number(removeHashFromHashString(location.hash));
    if (isNaN(currentPageNumber) || currentPageNumber <= 0) {
      currentPageNumber = 1;
    }
  }

  useEffect(() => {
    // Only add listener if there are pages to navigate
    if (!numberOfPages || numberOfPages === 0) {
      return;
    }

    const keypressWrapper = (event: KeyboardEvent) => {
      handleKeypress(event, numberOfPages, currentPageNumber);
    };

    // Add event listener
    document.addEventListener('keydown', keypressWrapper);

    // Cleanup: Remove event listener when component unmounts or numberOfPages changes
    return () => {
      document.removeEventListener('keydown', keypressWrapper);
    };
  }, [numberOfPages, currentPageNumber]);

  // Auto-scroll to target photo
  useEffect(() => {
    if (!targetPhotoId) return;

    // Wait for images to render and load
    const scrollToImage = () => {
      const imageElement = document.getElementById(`image-${targetPhotoId}`);

      if (imageElement) {
        // Calculate center position
        const elementRect = imageElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);

        // Smooth scroll to center the image
        window.scrollTo({
          top: Math.max(0, middle),
          behavior: 'smooth'
        });

        // Add visual highlight
        imageElement.classList.add('galleryImage--highlighted');
        const timer = setTimeout(() => {
          imageElement.classList.remove('galleryImage--highlighted');
        }, 2000);

        return () => clearTimeout(timer);
      }
    };

    // Delay to ensure images are loaded
    const timer = setTimeout(scrollToImage, 300);

    return () => clearTimeout(timer);
  }, [targetPhotoId, location.pathname]);

  // Preload images from adjacent pages for smoother navigation
  // This ensures that when users page forward/back, key images are already cached
  useEffect(() => {
    const allImages = galleryObject.loadedImages;
    if (!allImages || allImages.length === 0) return;

    const currentPage = currentPageNumber > 0 ? currentPageNumber - 1 : 0;
    const imagesToPreload: string[] = [];

    // Preload first image of next page (if exists)
    // When user goes forward, this will display immediately
    const nextPageFirstIndex = (currentPage + 1) * IMAGES_PER_PAGE;
    if (nextPageFirstIndex < allImages.length) {
      const nextPageFirstImage = allImages[nextPageFirstIndex];
      if (nextPageFirstImage?.link) {
        imagesToPreload.push(nextPageFirstImage.link);
      }
    }

    // Preload last image of previous page (if exists)
    // When user goes back, this will display immediately
    if (currentPage > 0) {
      const prevPageLastIndex = currentPage * IMAGES_PER_PAGE - 1;
      if (prevPageLastIndex >= 0 && prevPageLastIndex < allImages.length) {
        const prevPageLastImage = allImages[prevPageLastIndex];
        if (prevPageLastImage?.link) {
          imagesToPreload.push(prevPageLastImage.link);
        }
      }
    }

    // Preload the images by creating Image objects
    // Browser will cache them automatically
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [currentPageNumber, galleryObject.loadedImages]);

  if (!galleryObject.loadedImages || !galleryObject.loadedImages.length) {
    return null;
  }

  const handlePagination = (array: GalleryImageType[], currentPage: number, itemsPerGroup: number) => {

    return filterArrayToPage(array, currentPage, itemsPerGroup);
  }

  // Convert 1-indexed currentPageNumber to 0-indexed for array slicing
  const currentPage = currentPageNumber > 0 ? currentPageNumber - 1 : 0;

  const thisPageImages = handlePagination(galleryObject.loadedImages, currentPage, IMAGES_PER_PAGE);

  let galleryClass = ['gallery'];
  
  if (isAlbumPage(location.pathname)) {
    galleryClass.push('gallery_album');
  }

  return (
    <div className={galleryClass.join(' ')}>
      {currentPage === 0 && isAlbumPage(location.pathname) ?
        <TitleCard
          albumName={galleryObject.albumName}
          description={galleryObject.description}
          date={galleryObject.date}
          createdAt={galleryObject.createdAt}
        /> : null}
      {thisPageImages.map((image, index) =>
        <GalleryImage
          captions={galleryObject.captions}
          isPrivate={!!(image.description && image.description.indexOf("[PRIVATE]") > -1 && !isAuthenticated)}
          isHighlighted={targetPhotoId === image.id}
          height={image.height}
          image={image}
          index={index}
          key={image.id}
          type={image.type}
          width={image.width}
        />
      )}
    </div>
  )
}

const TitleCard = (props: {
  albumName?: string;
  description?: string;
  date?: string;
  createdAt?: string;
}) => {
  const displayDate = formatAlbumDate(props.date || props.createdAt);

  return (
    <div className="gallery__titlecard">
      <div className="gallery__titlecard-albumname">{props.albumName}</div>
      {displayDate && (
        <div className="gallery__titlecard-date">{displayDate}</div>
      )}
      <div className="gallery__titlecard-description">{props.description}</div>
    </div>
  );
}

export default Gallery;
