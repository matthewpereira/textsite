import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import removeHashFromHashString from "../helpers/removeHashFromHashString.ts";

import { IMAGES_PER_PAGE } from "../config";

interface PaginationButtonType {
  currentPage: number;
  pathName: string;
  pageNumber?: number;
  numberOfPages?: number;
}

const nextPagePath = (pathName: string, currentPage: number) => {
  const increment = currentPage + 1;

  return pathName + "#" + increment;
}

const prevPagePath = (pathName: string, currentPage: number) => {
  const decrement = currentPage - 1;

  return pathName + "#"  + decrement;
}

const PrevButton = ({ currentPage, pathName }: PaginationButtonType) => {
  if (currentPage === 1) {
    return <div className="pagination__gallery__placeholder">&lt;</div>;
  }

  return (
    <div className="pagination__gallery__pageArrow">
      <Link to={prevPagePath(pathName, currentPage)} onClick={() => window.scrollTo(0, 0)}>&lt;</Link>
    </div>
  );
};

const NextButton = ({
  currentPage,
  numberOfPages,
  pathName,
}: PaginationButtonType) => {
  if (numberOfPages && currentPage === numberOfPages) {
    return <div className="pagination__gallery__placeholder">&gt;</div>;
  }

  return (
    <div className="pagination__gallery__pageArrow">
      <Link to={nextPagePath(pathName, currentPage)} onClick={() => window.scrollTo(0, 0)}>&gt;</Link>
    </div>
  );
};

const PageNumber = ({
  currentPage,
  pathName,
  pageNumber,
}: PaginationButtonType) => {

  if (pageNumber && currentPage === pageNumber || pageNumber === 1 && currentPage === 0) {
    return (
      <div className="pagination__gallery__pageNumber__current">
        {pageNumber}
      </div>
    );
  }

  return (
    <div className="pagination__gallery__pageNumber">
      <Link to={`${pathName}#${pageNumber}`} onClick={() => window.scrollTo(0, 0)}>{pageNumber}</Link>
    </div>
  );
};

const Pagination = ({ loadedImages }: any) => {

  // Protects /about page and other routes that don't have loaded images
  if (!loadedImages.loadedImages) {
    return null;
  }
  
  const location = useLocation();
  const [pathName, setPathName] = useState("");

  useEffect(() => {
    setPathName(location.pathname)
  }, [location.pathname]);

  let pageNumbers = [];

  // Extract photo ID from URL hash (e.g., #p/abc123)
  const photoIdMatch = location.hash.match(/#p\/([^/?#]+)/);
  const targetPhotoId = photoIdMatch ? photoIdMatch[1] : null;

  // Find which page contains the target photo
  const findPageForPhoto = (photoId: string): number | null => {
    const allImages = loadedImages.loadedImages;
    const imageIndex = allImages.findIndex((img: any) => img.id === photoId);

    if (imageIndex === -1) return null;

    return Math.floor(imageIndex / IMAGES_PER_PAGE);
  };

  // Determine current page
  let currentPage = 0;

  if (targetPhotoId) {
    // If viewing a specific photo, find its page
    const photoPage = findPageForPhoto(targetPhotoId);
    if (photoPage !== null) {
      currentPage = photoPage + 1; // +1 because pagination displays 1-indexed pages
    }
  } else {
    // Otherwise, parse page number from hash (e.g., #2)
    currentPage = Number(removeHashFromHashString(location.hash));
  }

  const numberOfPages = Math.ceil(loadedImages.loadedImages.length / IMAGES_PER_PAGE);

  if (numberOfPages) {
    for (let i = 0; i < numberOfPages; i++) {
      // +1 so that we turn index 0 into page 1, index 1 into page 2, and so on
      pageNumbers.push(i + 1);
    }
  }

  return (
    <div className="pagination__gallery__pagination">
      Page:
      <PrevButton
        currentPage={currentPage}
        pathName={pathName}
      />
      {pageNumbers.map((pageNumber) => (
        <PageNumber
          key={pageNumber}
          pageNumber={pageNumber}
          currentPage={currentPage}
          pathName={pathName}
        />
      ))}
      <NextButton
        currentPage={currentPage}
        numberOfPages={numberOfPages}
        pathName={pathName}
      />
    </div>
  );
};

export default Pagination;

