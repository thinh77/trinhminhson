import type { BlogFormData } from "@/types/blog";

export type AdminBlogFormData = BlogFormData;

export interface PhotoFormData {
  files: File[];
  categoryIds: number[];
  subcategoryIds: number[];
  date: string;
}

export interface PhotoPreview {
  file: File;
  url: string;
  title: string;
}

export interface AlbumFormData {
  categoryIds: number[];
  subcategoryIds: number[];
  location: string;
  date: string;
}

export interface AlbumUploadProgress {
  uploading: boolean;
  uploaded: number;
  total: number;
  errors: Array<{ filename: string; error: string }>;
}

export interface EditPhotoFormData {
  title: string;
  alt: string;
  location: string;
  categoryIds: number[];
  subcategoryIds: number[];
  dateTaken: string;
}

export type TabType = "posts" | "users" | "create-post" | "photos" | "categories";

export interface ToastState {
  message: string;
  type: "success" | "error";
}
