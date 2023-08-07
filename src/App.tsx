import { useEffect, useState }        from "react";

import Menu                           from './components/Menu.tsx';
import Gallery                        from './components/Gallery';
import Shortcuts                      from './components/Shortcuts'

import getGalleryImages               from "./components/getGalleryImages.jsx";
import validateAlbum                  from "./helpers/validateAlbum.js";

import './App.css'

const DEFAULTGALLERY = "6Hpyr";

interface GalleryType {
  captions: string,
  loadedImages: []
}

function App(props: any) {

  document.getElementById("root")?.classList.remove("loading");

  const [galleryObject, setGalleryObject] = useState({});

  useEffect(() => {
    let counter = 0;

    async function getGalleryObject(props: any): Promise<void | GalleryType> {

      if (counter === 1) {
        return;
      }

      counter = 1;

      if (!validateAlbum(props.albumCode) || props.albumCode === DEFAULTGALLERY) {
        // props.history.push("/");

        return setGalleryObject(await getGalleryImages(DEFAULTGALLERY));
      }

      return setGalleryObject(await getGalleryImages(props.albumCode));
    }

    setGalleryObject(getGalleryObject(props));

  }, []);

  return (
    <div>
      <Menu />
      <Shortcuts />
      <Gallery
        // albumName={galleryObject.albumName}
        captions={galleryObject.captions}
        // description={galleryObject.description}
        loadedImages={galleryObject.loadedImages} />
    </div>
  )
}

export default App;
