import { useEffect, useState, useCallback } from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";

import { PaginationContextProvider } from '../context/PaginationContext.tsx'; 
import Menu from './Menu.tsx';
import AlbumSelector from "./AlbumSelector";
import AlbumGrid from "./AlbumGrid";

import allowedAlbums from "../allowedAlbums";
import { IMGUR_AUTHORIZATION } from '../config';
import { getCachedAlbums, setCachedAlbum, AlbumMetadata } from '../utils/albumCache';
import { imgurRateLimiter } from '../utils/rateLimiter';
import { hasStaticMetadata, getStaticMetadata } from '../data/albumMetadata';

// Because we have the default gallery in the index 0 spot
const stripFirstAlbum = (originalObject: any) =>
  Object.fromEntries(
    Object.entries(originalObject).slice(1, originalObject.length)
  );

const ALBUMS_PER_PAGE = 20;

const AlbumList = () => {
  const [albumCovers, setAlbumCovers] = useState<AlbumMetadata[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const allAlbums = Object.values(stripFirstAlbum(allowedAlbums)) as string[];
  const totalPages = Math.ceil(allAlbums.length / ALBUMS_PER_PAGE);

  const fetchAlbumBatch = useCallback(async (albumIds: string[]) => {
    const { cached, missing } = getCachedAlbums(albumIds);
    
    // Add cached albums immediately
    if (cached.length > 0) {
      setAlbumCovers(prev => [...prev, ...cached]);
    }

    // Check for static metadata for missing albums
    const staticAlbums: AlbumMetadata[] = [];
    const needsApiFetch: string[] = [];

    missing.forEach(albumId => {
      if (hasStaticMetadata(albumId)) {
        const staticData = getStaticMetadata(albumId);
        if (staticData) {
          staticAlbums.push({
            albumId,
            cover: staticData.cover,
            title: staticData.title,
            lastFetched: Date.now()
          });
        }
      } else {
        needsApiFetch.push(albumId);
      }
    });

    // Add static albums immediately
    if (staticAlbums.length > 0) {
      setAlbumCovers(prev => [...prev, ...staticAlbums]);
      // Cache the static albums
      staticAlbums.forEach(album => setCachedAlbum(album));
    }

    // Fetch remaining albums with rate limiting
    if (needsApiFetch.length > 0) {
      setLoading(true);
      
      try {
        const fetchPromises = needsApiFetch.map(albumId =>
          imgurRateLimiter.add(() =>
            fetch(`https://api.imgur.com/3/album/${albumId}`, {
              headers: {
                Authorization: `Client-ID ${IMGUR_AUTHORIZATION}`,
              },
            }).then(r => r.json())
          )
        );

        const responses = await Promise.all(fetchPromises);
        const newAlbums: AlbumMetadata[] = responses
          .filter(response => response && response.data)
          .map(response => ({
            albumId: response.data.id,
            cover: response.data.cover,
            title: response.data.title,
            lastFetched: Date.now()
          }));

        // Cache the new albums
        newAlbums.forEach(album => setCachedAlbum(album));
        
        // Add to state
        setAlbumCovers(prev => [...prev, ...newAlbums]);
      } catch (error) {
        console.error('Failed to fetch albums:', error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  const loadNextPage = useCallback(() => {
    if (loading || !hasMore) return;

    const startIndex = currentPage * ALBUMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ALBUMS_PER_PAGE, allAlbums.length);
    const albumsToLoad = allAlbums.slice(startIndex, endIndex);

    if (albumsToLoad.length > 0) {
      fetchAlbumBatch(albumsToLoad);
      setCurrentPage(prev => prev + 1);
      
      if (currentPage + 1 >= totalPages) {
        setHasMore(false);
      }
    }
  }, [currentPage, loading, hasMore, allAlbums, fetchAlbumBatch, totalPages]);

  useEffect(() => {
    loadNextPage(); // Load first page
  }, []);

  return (
    <div>
      <PaginationContextProvider numberOfPages={totalPages}>
        <Menu />
        <AlbumSelector />
        <AlbumGrid 
          albums={albumCovers} 
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadNextPage}
        />
      </PaginationContextProvider>
    </div>
  );
};

export default withAuthenticationRequired(AlbumList);
