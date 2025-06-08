import { useNavigate } from "react-router-dom";
import { useState } from "react";
import allowedAlbums from "../allowedAlbums.js";

const AlbumSelector = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");

  const handleAlbumClick = (albumTitle: string) => {
    // Find the album ID by title
    const albumEntries = Object.entries(allowedAlbums).slice(1); // Skip first entry
    const albumEntry = albumEntries.find(([title]) => title === albumTitle);
    
    if (albumEntry) {
      const albumId = albumEntry[1];
      navigate(`/a/${albumId}`);
    }
  };

  const allAlbumTitles = Object.keys(allowedAlbums).slice(1); // Skip first entry
  const albumTitles = allAlbumTitles.filter(title => 
    title.toLowerCase().includes(filter.toLowerCase())
  );

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
        {albumTitles.map((albumTitle, index) => (
          <li
            key={index}
            onClick={() => handleAlbumClick(albumTitle)}
            style={{
              padding: "16px 20px",
              margin: "8px 0",
              backgroundColor: "#f8f9fa",
              border: "1px solid #e9ecef",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e9ecef";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
          >
            {albumTitle}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlbumSelector;
