import { useEffect }                  from 'react';
import handleScrollKeypress           from '../helpers/handleScrollKeypress';
import GalleryImage                   from './GalleryImage.js';
// import { Album }                   from '../types'; 

interface GalleryType {
  captions: string,
  loadedImages: []
}

const Gallery = ({captions, loadedImages }: GalleryType) => {

  let eventListenerAdded = false;

    useEffect(() => {
        if (!eventListenerAdded) {
            eventListenerAdded = true;
            document.addEventListener('keydown', handleScrollKeypress);
        }
    }, []);

  if (!loadedImages || !loadedImages.length) {
    return null;
  }

  // const hash = location.hash.replace(/#/, '');
  // const pageNumber = hash.length && hash > 0 ? hash : 1;
  
  let currentImages = loadedImages;

  return (
    <div>
      {currentImages.map((image:any, index: number) =>
        <GalleryImage
          captions={captions}
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

export default Gallery;
