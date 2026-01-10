/**
 * Photo Categories Service
 * API calls for photo categories management
 */

import { api, ApiResponse } from "./api";

export interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subcategories: Subcategory[];
}

// ========== CATEGORIES ==========

export async function getAllCategories(includeInactive = false): Promise<Category[]> {
  const endpoint = includeInactive ? "/categories?includeInactive=true" : "/categories";
  const response = await api.get<ApiResponse<Category[]>>(endpoint);
  return response.data || [];
}

export async function getCategoryById(id: number): Promise<Category> {
  const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
  if (!response.data) throw new Error("Category not found");
  return response.data;
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}): Promise<Category> {
  const response = await api.post<ApiResponse<Category>>("/categories", data);
  if (!response.data) throw new Error("Failed to create category");
  return response.data;
}

export async function updateCategory(
  id: number,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
  }>
): Promise<Category> {
  const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
  if (!response.data) throw new Error("Failed to update category");
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/categories/${id}`);
}

// ========== SUBCATEGORIES ==========

export async function getSubcategoryById(id: number): Promise<Subcategory> {
  const response = await api.get<ApiResponse<Subcategory>>(`/categories/subcategory/${id}`);
  if (!response.data) throw new Error("Subcategory not found");
  return response.data;
}

export async function createSubcategory(data: {
  categoryId: number;
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}): Promise<Subcategory> {
  const response = await api.post<ApiResponse<Subcategory>>("/categories/subcategory", data);
  if (!response.data) throw new Error("Failed to create subcategory");
  return response.data;
}

export async function updateSubcategory(
  id: number,
  data: Partial<{
    categoryId: number;
    name: string;
    slug: string;
    description: string;
    displayOrder: number;
    isActive: boolean;
  }>
): Promise<Subcategory> {
  const response = await api.put<ApiResponse<Subcategory>>(`/categories/subcategory/${id}`, data);
  if (!response.data) throw new Error("Failed to update subcategory");
  return response.data;
}

export async function deleteSubcategory(id: number): Promise<void> {
  await api.delete(`/categories/subcategory/${id}`);
}

// ========== PHOTO-SUBCATEGORY RELATIONS ==========

export async function getPhotoSubcategories(photoId: number): Promise<Subcategory[]> {
  const response = await api.get<ApiResponse<Subcategory[]>>(`/categories/photo/${photoId}`);
  return response.data || [];
}

export async function setPhotoSubcategories(
  photoId: number,
  subcategoryIds: number[]
): Promise<Subcategory[]> {
  const response = await api.put<ApiResponse<Subcategory[]>>(`/categories/photo/${photoId}`, {
    subcategoryIds,
  });
  return response.data || [];
}

// ========== INITIALIZATION ==========

export async function initializeCategories(): Promise<void> {
  await api.post("/categories/initialize", {});
}

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubcategoryById,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getPhotoSubcategories,
  setPhotoSubcategories,
  initializeCategories,
};
