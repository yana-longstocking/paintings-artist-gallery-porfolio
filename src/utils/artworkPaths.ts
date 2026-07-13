import type { ArtworkItem, GalleryData } from "../types/gallery";

export function getArtworkStaticPaths(galleryData: GalleryData) {
  const allImages: ArtworkItem[] = [
    ...galleryData.freedomCollection,
    ...galleryData.allPaintingCollection,
    ...galleryData.artCollection,
    galleryData.galleryContent.featured,
    ...galleryData.galleryContent.items,
  ];

  return allImages.map((image) => ({
    params: { id: image.id },
    props: { image },
  }));
}
