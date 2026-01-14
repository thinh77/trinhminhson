import type { Photo as ApiPhoto } from "@/services/photos.service";
import { getPhotoUrl } from "@/services/photos.service";

export interface Photo {
  id: string;
  src: string;
  srcLarge: string;
  alt: string;
  title: string;
  date?: string;
  location?: string;
  category: string;
  subcategories: string[];
  aspectRatio: "landscape" | "portrait" | "square";
}

export function mapApiPhotoToDisplay(photo: ApiPhoto): Photo {
  return {
    id: String(photo.id),
    src: getPhotoUrl(photo.filename, "medium"),
    srcLarge: getPhotoUrl(photo.filename, "original"),
    alt: photo.alt || photo.title,
    title: photo.title,
    date: photo.date_taken
      ? new Date(photo.date_taken).toISOString().split("T")[0]
      : undefined,
    location: photo.location,
    category: photo.category,
    subcategories: photo.subcategories?.map((sub) => sub.name) || [],
    aspectRatio: photo.aspect_ratio || "landscape",
  };
}
