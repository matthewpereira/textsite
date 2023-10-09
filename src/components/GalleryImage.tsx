import emojify from "node-emojify";
import parseStringForLinks from "../helpers/textLinks.tsx";

interface GalleryImageType {
  image: any;
  index: number;
  type: string;
  width: number;
  height: string;
  captions: string;
}

const GalleryImage = ({ image, type, width, height }: GalleryImageType) => {

  
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
          {image.title ? <div>{image.title}</div> : null}
          {image.description ? <div>{image.description}</div> : null}
          {image.info ? <div>{image.info}</div> : null}
        </div>
        <video
          width={width || 640}
          height={height || 480}
          autoPlay={true}
          controls={true}
          loop={true}
        >
          <source src={image.link} type="video/mp4" />
        </video>
      </div>
    );
  }

  const altText = image.description ? image.description : "photograph";

  const Caption = () => {
    if (!image.title) {
      return null;
    }
    
    return (
      <div className="galleryImage__caption">
        {image.title ? (
          <div className="galleryImage__headline">{emojify(image.title)}</div>
        ) : null}
        {image.description ? (
          <div className="galleryImage__subtitle">
            {parseStringForLinks(image.description)}
          </div>
        ) : null}
        {image.info ? (
          <div className="galleryImage__moreInfo">{emojify(image.info)}</div>
        ) : null}
      </div>
    );
  }

  // JPG and GIFs
  return (
    <div className="galleryImage">
      <img
        alt={altText}
        src={image.link}
        height={image.height}
        width={image.width}
      />
      <Caption />
    </div>
  );
};

export default GalleryImage;
