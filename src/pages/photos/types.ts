import type { Photo as ApiPhoto } from "@/services/photos.service";
import { getPhotoUrl } from "@/services/photos.service";

export interface Photo {
  id: string;
  src: string;           // thumb WebP for grid
  srcLarge: string;      // large WebP for lightbox
  srcOriginal: string;   // original file for download
  alt: string;
  title: string;
  date?: string;
  location?: string;
  categories: string[];
  subcategories: string[];
  aspectRatio: "landscape" | "portrait" | "square";
}

export function mapApiPhotoToDisplay(photo: ApiPhoto): Photo {
  return {
    id: String(photo.id),
    src: getPhotoUrl(photo.filename, "thumb"),
    srcLarge: getPhotoUrl(photo.filename, "large"),
    srcOriginal: getPhotoUrl(photo.filename, "original"),
    alt: photo.alt || photo.title,
    title: photo.title,
    date: photo.date_taken
      ? new Date(photo.date_taken).toISOString().split("T")[0]
      : undefined,
    location: photo.location,
    categories: photo.categories?.map((cat) => cat.name) || [],
    subcategories: photo.subcategories?.map((sub) => sub.name) || [],
    aspectRatio: photo.aspect_ratio || "landscape",
  };
}
