import emojify from "node-emojify";
import parseStringForLinks from "../helpers/textLinks.tsx";
import decodeHtmlEntities from "../helpers/decodeHtmlEntities.ts";
import { validateYouTubeUrl, extractYouTubeVideoId, createSafeYouTubeEmbedUrl } from "../helpers/validateYouTubeUrl";

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

  // Detect and validate YouTube videos
  if (image.description && image.description.toLowerCase().indexOf("youtube") > -1) {
    // Remove spaces and validate the URL
    const potentialUrl = image.description.split(" ").join("");
    const validation = validateYouTubeUrl(potentialUrl);

    if (validation.isValid && validation.sanitizedUrl) {
      // Try to extract video ID for cleaner embed URL
      const videoId = extractYouTubeVideoId(validation.sanitizedUrl);
      const embedUrl = videoId
        ? createSafeYouTubeEmbedUrl(videoId)
        : validation.sanitizedUrl;

      return (
        <div className="galleryImage galleryImage_youtube">
          <div></div>
          <div>
            <iframe
              title="Video"
              width="1280"
              height="720"
              src={embedUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }

    // Invalid YouTube URL - log warning and skip rendering
    console.warn('Invalid YouTube URL detected in image description:', potentialUrl);
    return null;
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

  // Remove private tag from description
  const imageCaption = image.description ? image.description.replace(/\[PRIVATE\]/gi, '').trim() : null;

  // Use description as alt text if available
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
