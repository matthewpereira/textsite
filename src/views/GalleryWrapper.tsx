import { useEffect, useState } from "react";
import Menu from '../components/Menu.tsx';
import Gallery from '../components/Gallery.tsx';
import getGalleryImages from "../components/getGalleryImages.jsx";
import { PaginationContextProvider } from '../context/PaginationContext.tsx';
import validateAlbum from "../helpers/validateAlbum.js";

import { IMAGES_PER_PAGE } from "../config";

import '../App.css';

interface GalleryType {
  captions: string;
  loadedImages: [];
}
interface GalleryWrapperType {
  albumCode: string;
}

function GalleryWrapper(props: GalleryWrapperType) {
  document.getElementById("root")?.classList.remove("loading");

  const [galleryObject, setGalleryObject] = useState<GalleryType>({
    captions: '',
    loadedImages: []
  });

  let counter = 0;

  useEffect(() => {
    async function getGalleryObject(album: string): Promise<void> {

      if (counter === 1) {
        return;
      }

      counter = 1;

      if (!validateAlbum(album)) {
        // clear the bad query string if it's not on the list of allowed albums
        window.history.replaceState(null, '', window.location.pathname);

        const data = await getGalleryImages("6Hpyr");

        return setGalleryObject(data);
      }

      const data = await getGalleryImages(album);

      return setGalleryObject(data);
    }


    getGalleryObject(props.albumCode);
  }, [props.albumCode]);

  const numberOfPages = Math.round(galleryObject.loadedImages?.length / IMAGES_PER_PAGE);

  return (
    <div>
      <PaginationContextProvider numberOfPages={numberOfPages}>
        <Menu loadedImages={galleryObject?.loadedImages} />
        <Gallery
          galleryObject={galleryObject}
        />
      </PaginationContextProvider>
    </div>
  )
}

export default GalleryWrapper;
