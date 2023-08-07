import App from "../App";
import { useParams } from 'react-router-dom';

const AlbumView = () => {

    const { albumId } = useParams();

    console.log('victory', albumId);

    return <App albumCode={"test"}/>
    
}

export default AlbumView;