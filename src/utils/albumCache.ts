export interface AlbumMetadata {
  albumId: string;
  cover: string;
  title: string;
  lastFetched: number;
}

const CACHE_KEY = 'textsite_album_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export const getCachedAlbum = (albumId: string): AlbumMetadata | null => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;
    
    const albumCache = JSON.parse(cache);
    const album = albumCache[albumId];
    
    if (!album) return null;
    
    // Check if cache is expired
    if (Date.now() - album.lastFetched > CACHE_EXPIRY) {
      delete albumCache[albumId];
      localStorage.setItem(CACHE_KEY, JSON.stringify(albumCache));
      return null;
    }
    
    return album;
  } catch {
    return null;
  }
};

export const setCachedAlbum = (album: AlbumMetadata): void => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    const albumCache = cache ? JSON.parse(cache) : {};
    
    albumCache[album.albumId] = {
      ...album,
      lastFetched: Date.now()
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(albumCache));
  } catch (error) {
    console.warn('Failed to cache album metadata:', error);
  }
};

export const getCachedAlbums = (albumIds: string[]): { cached: AlbumMetadata[], missing: string[] } => {
  const cached: AlbumMetadata[] = [];
  const missing: string[] = [];
  
  for (const albumId of albumIds) {
    const cachedAlbum = getCachedAlbum(albumId);
    if (cachedAlbum) {
      cached.push(cachedAlbum);
    } else {
      missing.push(albumId);
    }
  }
  
  return { cached, missing };
};
