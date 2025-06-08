import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import GalleryWrapper from "../views/GalleryWrapper";

const AlbumView = () => {
  const { albumId } = useParams<{ albumId: string }>();
  
  useEffect(() => {
    // Add gallery_album class to body
    document.body.classList.add('gallery_album');
    
    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('gallery_album');
    };
  }, []);
  
  if (!albumId) {
    return <div>Album not found</div>;
  }
  
  return <GalleryWrapper albumCode={albumId} />;
};

export default AlbumView;