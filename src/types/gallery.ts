import type galleryData from "../data/gallery.json";

export type GalleryData = typeof galleryData;
export type ArtworkItem = GalleryData["freedomCollection"][number];
export type ArtistBioImage = GalleryData["artistBio"];
