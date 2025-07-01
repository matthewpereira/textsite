import emojify from "node-emojify";
import parseStringForLinks from "../helpers/textLinks.tsx";
import decodeHtmlEntities from "../helpers/decodeHtmlEntities.ts";

interface GalleryImageType {
  image: any;
  index: number;
  type: string;
  width: number;
  height: string;
  captions: string;
  isPrivate: boolean;
}

const GalleryImage = ({ image, type, width, height, isPrivate }: GalleryImageType) => {

  if (isPrivate) {
    return null;
  }

  // Detect youtube videos
  if (image.description && image.description.indexOf("youtube") > -1) {
    return (
      <div className="galleryImage galleryImage_youtube">
        <div></div>
        <div>
          <iframe
            title="Video"
            width="1280"
            height="720"
            src={image.description.split(" ").join("")}
            frameBorder="0"
            data-allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // Detect imgur videos
  if (type.indexOf("video") > -1) {
    return (
      <div className="galleryImage galleryImage_video">
        <div>
          {image.title ? <div>{decodeHtmlEntities(image.title)}</div> : null}
          {image.description ? <div>{image.description}</div> : null}
          {image.info ? <div>{image.info}</div> : null}
        </div>
        <video
          width={width || 1280}
          height={height || 960}
          autoPlay={false}
          controls={true}
          loop={true}
          muted={true}
          style={{"maxWidth": "100%"}}
        >
          <source src={image.link} type="video/mp4" />
        </video>
      </div>
    );
  }

  const imageCaption = image.description ? image.description.replace(/\[PRIVATE\]/gi, '').trim() : null;
  const altText = imageCaption ? imageCaption : "Photograph";

  const Caption = () => {
    if (!imageCaption) {
      return null;
    }
    
    return (
      <div className="galleryImage__caption">
        {image.title ? (
          <div className="galleryImage__headline">{emojify(decodeHtmlEntities(image.title))}</div>
        ) : null}
        {imageCaption ? (
          <div className="galleryImage__subtitle">
            {parseStringForLinks(decodeHtmlEntities(imageCaption))}
          </div>
        ) : null}
        {image.info ? (
          <div className="galleryImage__moreInfo">{emojify(decodeHtmlEntities(image.info))}</div>
        ) : null}
      </div>
    );
  }

  // JPG and GIFs
  return (
    <div className="galleryImage">
      <img
        alt={decodeHtmlEntities(altText)}
        src={image.link}
        height={image.height}
        width={image.width}
      />
      <Caption />
    </div>
  );
};

export default GalleryImage;
