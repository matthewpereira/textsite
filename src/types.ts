export interface Album {
  albumName: string;
  captions: "right" | "bottom";
  description: string;
  loadedImages: GalleryImage[];
}

export type GalleryImageData = GalleryImage;

export interface GalleryImage {
  id: string;
  link: string;
  title?: string;
  description?: string;
  type: string;
  width: number;
  height: number;
  info?: string;
  datetime?: number;
  animated?: boolean;
  size?: number;
  // Set when this entry is a YouTube embed rather than a hosted image/video.
  // Mirrors the worker's R2ImageMetadata.embed shape.
  embed?: {
    provider: 'youtube';
    videoId: string;
    sourceUrl: string;
  };
}
