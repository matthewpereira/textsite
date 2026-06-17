import { useState } from "react";
import emojify from "node-emojify";
import parseStringForLinks from "../helpers/textLinks.tsx";
import decodeHtmlEntities from "../helpers/decodeHtmlEntities.ts";
import YouTubeEmbed from "./YouTubeEmbed";
import { GalleryImage } from "../types";

interface GalleryImageType {
  image: GalleryImage;
  index: number;
  type: string;
  width: number;
  height: number;
  captions: string;
  isPrivate: boolean;
  isHighlighted?: boolean;
}

const GalleryImage = ({ image, type, width, height, isPrivate, isHighlighted }: GalleryImageType) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (isPrivate) {
    return null;
  }

  const copyPermalink = async () => {
    const permalink = `${window.location.origin}${window.location.pathname}#p/${image.id}`;

    try {
      await navigator.clipboard.writeText(permalink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy permalink:', err);
    }
  };

  const ShareButton = () => (
    <button
      className="galleryImage__share-button"
      onClick={copyPermalink}
      title={copySuccess ? "Link copied!" : "Copy link to this image"}
      aria-label="Copy permalink"
    >
      {copySuccess ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" fill="transparent" />
          <path d="M5 13.3636L8.03559 16.3204C8.42388 16.6986 9.04279 16.6986 9.43108 16.3204L19 7" stroke="#666" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.0464 14C8.54044 12.4882 8.67609 9.90087 10.3494 8.22108L15.197 3.35462C16.8703 1.67483 19.4476 1.53865 20.9536 3.05046C22.4596 4.56228 22.3239 7.14956 20.6506 8.82935L18.2268 11.2626" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M13.9536 10C15.4596 11.5118 15.3239 14.0991 13.6506 15.7789L11.2268 18.2121L8.80299 20.6454C7.12969 22.3252 4.55237 22.4613 3.0464 20.9495C1.54043 19.4377 1.67609 16.8504 3.34939 15.1706L5.77323 12.7373" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );

  // YouTube embed. All legacy "description = YT URL" rows were migrated to
  // image.embed by the worker-side backfill (scripts/backfill-youtube-embeds.mjs),
  // so this is the only YouTube render path now.
  if (image.embed?.provider === 'youtube') {
    return (
      <div
        className={`galleryImage galleryImage_youtube${isHighlighted ? ' galleryImage--highlighted' : ''}`}
        id={`image-${image.id}`}
        data-image-id={image.id}
      >
        <ShareButton />
        <YouTubeEmbed videoId={image.embed.videoId} title={image.title} />
        {(image.title || image.description) && (
          <div className="galleryImage__caption">
            {image.title && <div className="galleryImage__headline">{emojify(decodeHtmlEntities(image.title))}</div>}
            {image.description && (
              <div className="galleryImage__subtitle">
                {parseStringForLinks(decodeHtmlEntities(image.description))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Detect imgur videos
  if (type.indexOf("video") > -1) {
    return (
      <div
        className={`galleryImage galleryImage_video${isHighlighted ? ' galleryImage--highlighted' : ''}`}
        id={`image-${image.id}`}
        data-image-id={image.id}
      >
        <ShareButton />
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
          style={{ "maxWidth": "100%" }}
        >
          {/* Some album metadata records video URLs as .jpg even though the R2 object is .mp4 */}
          <source src={image.link.replace(/\.jpe?g$/i, '.mp4')} type="video/mp4" />
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
    <div
      className={`galleryImage${isHighlighted ? ' galleryImage--highlighted' : ''}`}
      id={`image-${image.id}`}
      data-image-id={image.id}
    >
      <ShareButton />
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
