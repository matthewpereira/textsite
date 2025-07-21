import { useEffect } from 'react';
import { useLocation } from "react-router-dom";

import GalleryImage from './GalleryImage';
import { usePaginationContext } from '../context/PaginationContext';

import handleKeypress from '../helpers/handleKeypress';
import removeHashFromHashString from '../helpers/removeHashFromHashString';

import { IMAGES_PER_PAGE } from '../config';

import { useAuth0 } from "@auth0/auth0-react";

// Don't show the album name and description on default gallery
export const isAlbumPage = (pathname: string) => (
  pathname.startsWith('/a/')
);

export const filterArrayToPage = (array: {}[], pageNumber: number, itemsPerGroup: number) => {
  const startIndex = pageNumber === 0 ? 0 : pageNumber * itemsPerGroup;
  const endIndex = (pageNumber + 1) * itemsPerGroup;

  return array.slice(startIndex, endIndex);
}

let eventListenerAdded = false;

const Gallery = (galleryObject: any) => {

  const { isAuthenticated } = useAuth0();

  const location = useLocation();
  const { numberOfPages } = usePaginationContext();

  const keypressWrapper = (event: KeyboardEvent) => {
    if (!numberOfPages) {
      return null;
    }

    handleKeypress(event, numberOfPages);
  }

  useEffect(() => {
    if (!eventListenerAdded && numberOfPages !== 0) {
      eventListenerAdded = true;
      document.addEventListener('keydown', keypressWrapper);
    }
  }, [numberOfPages]);

  if (!galleryObject.galleryObject.loadedImages || !galleryObject.galleryObject.loadedImages.length) {
    return null;
  }

  const handlePagination = (array: [], currentPage: number, itemsPerGroup: number) => {
    
    return filterArrayToPage(array, currentPage, itemsPerGroup);
  }

  const pageHash = Number(removeHashFromHashString(location.hash)) - 1;
  const currentPage = pageHash > 0 ? pageHash : 0;

  const thisPageImages = handlePagination(galleryObject.galleryObject.loadedImages, currentPage, IMAGES_PER_PAGE);

  let galleryClass = ['gallery'];
  
  if (isAlbumPage(location.pathname)) {
    galleryClass.push('gallery_album');
  }

  return (
    <div className={galleryClass.join(' ')}>
      {currentPage === 0 && isAlbumPage(location.pathname) ?
        <TitleCard
          albumName={galleryObject.galleryObject.albumName}
          description={galleryObject.galleryObject.description}
        /> : null}
      {thisPageImages.map((image: any, index: number) => 
        <GalleryImage
          captions={galleryObject.galleryObject.captions}
          isPrivate={image.description && image.description.indexOf("[PRIVATE]") > -1 && !isAuthenticated}
          height={image.height}
          image={image}
          index={index}
          key={index}
          type={image.type}
          width={image.width}
        />
      )}
    </div>
  )
}

const TitleCard = (props: { albumName?: any, description?: any }) => {
  return (
    <div className="gallery__titlecard">
      <div className="gallery__titlecard-albumname">{props.albumName}</div>
      <div className="gallery__titlecard-description">{props.description}</div>
    </div>
  );
}

export default Gallery;
