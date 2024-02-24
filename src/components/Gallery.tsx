import { useEffect } from 'react';
import { useLocation } from "react-router-dom";

import GalleryImage from './GalleryImage.js';
import { usePaginationContext } from '../context/PaginationContext.js';

import handleKeypress from '../helpers/handleKeypress';
import removeHashFromHashString from '../helpers/removeHashFromHashString.js';

import { IMAGES_PER_PAGE } from '../config';

let eventListenerAdded = false;

const Gallery = (galleryObject: any) => {

  const location          = useLocation();
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

  const filterArrayToPage = (array: [], pageNumber: number, itemsPerGroup: number) => {
    if (pageNumber < 0) {
      return array;
    }

    const startIndex = pageNumber === 0 ? 0 : pageNumber * itemsPerGroup;
    const endIndex   = (pageNumber + 1) * itemsPerGroup;

    return array.slice(startIndex, endIndex);
  }

  const currentPage = Number(removeHashFromHashString(location.hash)) - 1;

  const thisPageImages = handlePagination(galleryObject.galleryObject.loadedImages, currentPage, IMAGES_PER_PAGE);

  // Don't show the album name and description on default gallery
  const firstPage = () => (
    (location.search.length !== 0 && location.hash === "#1") ||
    (location.search.length !== 0 && location.hash === "")
  );

  const titleCard = firstPage() ?
    <TitleCard
      albumName={galleryObject.galleryObject.albumName}
      description={galleryObject.galleryObject.description}
    /> :
    null;

  return (
    <div className="gallery">
      {titleCard}
      {thisPageImages.map((image: any, index: number) =>
        <GalleryImage
          captions={galleryObject.galleryObject.captions}
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
