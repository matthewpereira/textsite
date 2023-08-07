export interface Album {
  albumName: string;
  captions: "right" | "bottom";
  description: "string";
  loadedImages: [Image];
}

export interface Image {
  src: string;
  caption: string;
  type: ImageType;
}

export type ImageType = "jpg" | "gif" | "youtube";


