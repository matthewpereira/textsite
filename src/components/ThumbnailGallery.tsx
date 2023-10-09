// import LazyLoad from "react-lazyload";
// import styles   from "./Albums.module.scss";

interface Album {
  albumId: string,
  cover: string,
  title: string
}

const Thumbnail = (album: any, key: number) => {
  // imgur uses s / m / l / h to return different sized images
  // choose the appropriate one based on how big our thumbnails need to be
  const thumbnailSize = window.innerWidth > 320 ? "l" : "m";

  return (
    <div className="thumbnail__album" key={key}>
      <a className="thumbnail__album_link" href={`/?${album.albumId}`}>
        <div className="thumbnail__album_imageContainer">
            <img
              className="thumbnail__album_image"
              src={`https://i.imgur.com/${album.cover}${thumbnailSize}.jpg`}
              alt={album.title}
            />
        </div>
        <div className="thumbnail__album_title">{album.title}</div>
      </a>
    </div>
  );
};

const ThumbnailGallery = ({ albumCovers }:any) => (
  <div className="thumbnail__albumList">
    {albumCovers.map((album: Album, iterator: number) => (
      <Thumbnail album={album} key={iterator} />
    ))}
  </div>
);

export default ThumbnailGallery;
