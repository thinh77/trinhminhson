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
  category: string;
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
  alt: string;
  location?: string;
  category: string;
  subcategoryIds?: number[];
  dateTaken?: string;
  isPublic?: boolean;
}

export interface UpdatePhotoData {
  title?: string;
  alt?: string;
  location?: string;
  category?: string;
  subcategoryIds?: number[];
  dateTaken?: string;
  isPublic?: boolean;
  displayOrder?: number;
}

/**
 * Get photo URL from filename
 * @param filename - Original filename
 * @param size - Size variant: 'thumb' (400px), 'medium' (800px), 'large' (1600px), 'original'
 */
export function getPhotoUrl(filename: string, size: 'thumb' | 'medium' | 'large' | 'original' = 'original'): string {
  if (size === 'original') {
    return `${STATIC_BASE_URL}/uploads/photos/${filename}`;
  }

  // Get base name without extension and add size suffix
  const baseName = filename.replace(/\.[^/.]+$/, '');
  return `${STATIC_BASE_URL}/uploads/photos/${baseName}_${size}.jpg`;
}

/**
 * Get all photos
 */
export async function getPhotos(params?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<Photo[]> {
  const queryParams = new URLSearchParams();
  if (params?.category) queryParams.set("category", params.category);
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
 * Get all categories
 */
export async function getCategories(): Promise<string[]> {
  return api.get<string[]>("/photos/categories");
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
  formData.append("alt", data.alt);
  if (data.location) formData.append("location", data.location);
  formData.append("category", data.category);
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
  category: string;
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

  formData.append("category", data.category);
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
