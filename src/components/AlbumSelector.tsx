import { useNavigate } from "react-router-dom";
import allowedAlbums from "../allowedAlbums.js";

const AlbumSelector = () => {
  const navigate = useNavigate();

  const handleAlbumClick = (albumTitle: string) => {
    // Find the album ID by title
    const albumEntries = Object.entries(allowedAlbums).slice(1); // Skip first entry
    const albumEntry = albumEntries.find(([title]) => title === albumTitle);
    
    if (albumEntry) {
      const albumId = albumEntry[1];
      navigate(`/a/${albumId}`);
    }
  };

  const albumTitles = Object.keys(allowedAlbums).slice(1); // Skip first entry

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "48px auto",
        padding: "0 20px",
      }}
    >
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
              fontSize: "16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e9ecef";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
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
