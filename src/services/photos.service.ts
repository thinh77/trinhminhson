/**
 * Photos API Service
 * Frontend API calls for photo gallery
 */

import { api, API_BASE_URL, STATIC_BASE_URL } from "./api";

// Helper to get auth token
function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

// Helper to create auth headers
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Types
export interface PhotoCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PhotoSubcategory {
  id: number;
  name: string;
  slug: string;
}

export interface Photo {
  id: number;
  title: string;
  filename: string;
  original_name: string;
  alt: string;
  location?: string;
  categories?: PhotoCategory[];
  subcategories?: PhotoSubcategory[];
  date_taken?: string;
  aspect_ratio: "landscape" | "portrait" | "square";
  width?: number;
  height?: number;
  file_size?: number;
  mime_type?: string;
  uploaded_by?: number;
  is_public: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface UploadPhotoData {
  title: string;
  categoryIds?: number[];
  subcategoryIds?: number[];
  dateTaken?: string;
  isPublic?: boolean;
}

export interface UpdatePhotoData {
  title?: string;
  alt?: string;
  location?: string;
  categoryIds?: number[];
  subcategoryIds?: number[];
  dateTaken?: string;
  isPublic?: boolean;
  displayOrder?: number;
}

/**
 * Get photo URL from filename
 * @param filename - Original filename
 * @param size - Size variant: 'thumb' (400px), 'medium' (800px), 'large' (1600px), 'original'
 * All display sizes use WebP format, 'original' returns the uploaded file for download
 */
export function getPhotoUrl(filename: string, size: 'thumb' | 'medium' | 'large' | 'original' = 'original'): string {
  // Original file for download
  if (size === 'original') {
    return `${STATIC_BASE_URL}/uploads/photos/${filename}`;
  }

  // All display sizes use WebP format
  const baseName = filename.replace(/\.[^/.]+$/, '');
  return `${STATIC_BASE_URL}/uploads/photos/${baseName}_${size}.webp`;
}

/**
 * Get all photos
 */
export async function getPhotos(params?: {
  categoryId?: number;
  limit?: number;
  offset?: number;
}): Promise<Photo[]> {
  const queryParams = new URLSearchParams();
  if (params?.categoryId) queryParams.set("categoryId", params.categoryId.toString());
  if (params?.limit) queryParams.set("limit", params.limit.toString());
  if (params?.offset) queryParams.set("offset", params.offset.toString());

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/photos?${queryString}` : "/photos";

  return api.get<Photo[]>(endpoint);
}

/**
 * Get photo by ID
 */
export async function getPhotoById(id: number): Promise<Photo> {
  return api.get<Photo>(`/photos/${id}`);
}

/**
 * Upload a new photo
 */
export async function uploadPhoto(
  file: File,
  data: UploadPhotoData
): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("title", data.title);
  if (data.categoryIds && data.categoryIds.length > 0) {
    formData.append("categoryIds", JSON.stringify(data.categoryIds));
  }
  if (data.subcategoryIds && data.subcategoryIds.length > 0) {
    formData.append("subcategoryIds", JSON.stringify(data.subcategoryIds));
  }
  if (data.dateTaken) formData.append("dateTaken", data.dateTaken);
  formData.append("isPublic", String(data.isPublic !== false));

  const response = await fetch(`${API_BASE_URL}/photos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload photo");
  }

  return response.json();
}

/**
 * Update a photo
 */
export async function updatePhoto(
  id: number,
  data: UpdatePhotoData
): Promise<Photo> {
  return api.patch<Photo>(`/photos/${id}`, data);
}

/**
 * Delete a photo
 */
export async function deletePhoto(id: number): Promise<{ message: string }> {
  return api.delete<{ message: string }>(`/photos/${id}`);
}

/**
 * Bulk upload data for album upload
 */
export interface BulkUploadData {
  categoryIds?: number[];
  subcategoryIds?: number[];
  location?: string;
  dateTaken?: string;
  isPublic?: boolean;
}

/**
 * Bulk upload response
 */
export interface BulkUploadResponse {
  message: string;
  uploaded: Photo[];
  errors: Array<{ filename: string; error: string }>;
  total: number;
}

/**
 * Upload multiple photos with shared metadata (Album upload)
 */
export async function uploadMultiplePhotos(
  files: File[],
  data: BulkUploadData
): Promise<BulkUploadResponse> {
  const formData = new FormData();

  // Append each file
  files.forEach((file) => {
    formData.append("files", file);
  });

  if (data.categoryIds && data.categoryIds.length > 0) {
    formData.append("categoryIds", JSON.stringify(data.categoryIds));
  }
  if (data.subcategoryIds && data.subcategoryIds.length > 0) {
    formData.append("subcategoryIds", JSON.stringify(data.subcategoryIds));
  }
  if (data.location) formData.append("location", data.location);
  if (data.dateTaken) formData.append("dateTaken", data.dateTaken);
  formData.append("isPublic", String(data.isPublic !== false));

  const response = await fetch(`${API_BASE_URL}/photos/bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload photos");
  }

  return response.json();
}

/**
 * Reorder photos by updating their display order
 */
export async function reorderPhotos(
  orderedPhotos: Array<{ id: number; displayOrder: number }>
): Promise<{ message: string }> {
  return api.patch("/photos/reorder", { orderedPhotos });
}
