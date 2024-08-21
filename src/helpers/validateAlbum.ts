import allowedAlbums from "../allowedAlbums";

const validateAlbum = (albumId: string): Boolean => Object.values(allowedAlbums).indexOf(albumId) > -1;

export default validateAlbum;