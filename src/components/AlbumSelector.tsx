import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { STORAGE_PROVIDER } from "../config";
import { fetchR2Albums, R2Album } from "../services/r2";
import { formatAlbumDate, sortAlbumsByDate } from "../helpers/formatDate.ts";
import allowedAlbums from "../allowedAlbums.js";
import { logger } from "../utils/logger";

const AlbumSelector = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [albums, setAlbums] = useState<R2Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadAlbums() {
      logger.log('[AlbumSelector] Starting to load albums...');
      setIsLoading(true);
      setError(null);

      try {
        const provider = STORAGE_PROVIDER.toLowerCase();
        logger.log('[AlbumSelector] Storage provider:', provider);

        if (provider === 'r2') {
          // Fetch albums dynamically from R2
          logger.log('[AlbumSelector] Fetching R2 albums...');
          const r2Albums = await fetchR2Albums();

          // Ignore stale response (from React StrictMode double-invoke)
          if (ignore) return;

          logger.log('[AlbumSelector] Fetched albums:', r2Albums);

          // Sort albums by date (newest first)
          logger.log('[AlbumSelector] Sorting albums...');
          const sortedAlbums = sortAlbumsByDate(r2Albums);
          logger.log('[AlbumSelector] Sorted albums:', sortedAlbums);

          setAlbums(sortedAlbums);
          logger.log('[AlbumSelector] Albums set successfully');
        } else {
          // Ignore stale response
          if (ignore) return;

          // For Imgur, convert allowedAlbums to R2Album format
          const imgurAlbums = Object.entries(allowedAlbums)
            .slice(1) // Skip first entry
            .map(([title, id]) => ({
              id,
              title,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
          setAlbums(imgurAlbums);
        }
      } catch (err) {
        if (ignore) return;
        logger.error('[AlbumSelector] Failed to load albums:', err);
        logger.error('[AlbumSelector] Error details:', err instanceof Error ? err.message : String(err));
        setError('Failed to load albums. Please try again later.');
      } finally {
        if (!ignore) {
          logger.log('[AlbumSelector] Setting isLoading to false');
          setIsLoading(false);
        }
      }
    }

    loadAlbums();

    return () => {
      ignore = true;
    };
  }, []);

  const handleAlbumClick = (albumId: string) => {
    navigate(`/a/${albumId}`);
  };

  const filteredAlbums = albums.filter(album =>
    album.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Loading albums...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#dc3545" }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "48px auto",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: "0",
          zIndex: "10",
          paddingTop: "36px",
          background: "#F0F0F0",
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Type to filter albums..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 40px 12px 16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
          {filter && (
            <button
              onClick={() => setFilter("")}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-60%)",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#6c757d",
                padding: "0",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6c757d";
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: "0",
          margin: "0",
        }}
      >
        {filteredAlbums.map((album) => {
          const displayDate = formatAlbumDate(album.date || album.createdAt);

          return (
            <li
              key={album.id}
              onClick={() => handleAlbumClick(album.id)}
              style={{
                padding: "16px 20px",
                margin: "8px 0",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontSize: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
            >
              <span>{album.title}</span>
              {displayDate && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    fontWeight: "400",
                    marginLeft: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayDate}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AlbumSelector;
