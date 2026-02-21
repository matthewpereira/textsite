export interface Album {
  albumName: string;
  captions: "right" | "bottom";
  description: string;
  loadedImages: GalleryImage[];
}

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
  blurHash?: string;
}
