interface GalleryImageType {
    image: any;
    index: number;
    type: string;
    width: number;
    height: string;
    captions: string;
}
declare const GalleryImage: ({ image, type, width, height }: GalleryImageType) => import("react/jsx-runtime").JSX.Element;
export default GalleryImage;
