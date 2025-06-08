import { useParams } from 'react-router-dom';
import GalleryWrapper from "../views/GalleryWrapper";

const AlbumView = () => {
  const { albumId } = useParams<{ albumId: string }>();
  
  if (!albumId) {
    return <div>Album not found</div>;
  }
  
  return <GalleryWrapper albumCode={albumId} />;
};

export default AlbumView;