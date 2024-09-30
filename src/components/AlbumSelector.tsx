import { ChangeEvent } from "react";
import allowedAlbums   from "../allowedAlbums.js";

const AlbumSelector = () => {
  const onAlbumListChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const albumRef = Object.values(allowedAlbums)[Number(e.target.value)];

    window.location.href = `${window.location.origin}/?${albumRef}`;
  };

  const albumListItems = () => {
    const albums = Object.keys(allowedAlbums).slice(1);
    const dropdown = ["Click here"].concat(albums);

    return dropdown.map((album, iterator) => (

      <option key={iterator} value={iterator}>
        {album}
      </option>
    ));
  };

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "48px",
        justifyContent: "center",
        margin: "48px auto 0",
        width: "100vw",
        zIndex: "1000",
      }}
    >
      Select an album
      <select onChange={onAlbumListChange}>{albumListItems()}</select>
    </div>
  );
};

export default AlbumSelector;
