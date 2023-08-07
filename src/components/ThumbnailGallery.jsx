import LazyLoad from "react-lazyload";
import styles   from "./Albums.module.scss";

const Thumbnail = ({ album: { albumId, cover, title } }) => {
  // imgur uses s / m / l / h to return different sized images
  // choose the appropriate one based on how big our thumbnails need to be
  const thumbnailSize = window.innerWidth > 320 ? "l" : "m";

  return (
    <div className={styles.album} key={albumId}>
      <a className={styles.album_link} href={`/?${albumId}`}>
        <div className={styles.album_imageContainer}>
          <LazyLoad offset={3000}>
            <img
              className={styles.album_image}
              src={`https://i.imgur.com/${cover}${thumbnailSize}.jpg`}
              alt={title}
            />
          </LazyLoad>
        </div>
        <div className={styles.album_title}>{title}</div>
      </a>
    </div>
  );
};

const ThumbnailGallery = ({ albumCovers }) => (
  <div className={styles.albumList}>
    {albumCovers.map((album, iterator) => (
      <Thumbnail album={album} key={iterator} />
    ))}
  </div>
);

export default ThumbnailGallery;
