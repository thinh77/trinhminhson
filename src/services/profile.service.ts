/**
 * Profile API Service
 * API calls for user profile management
 */

import { api, API_BASE_URL } from "./api";

export interface UserProfile {
  id: number;
  username: string;
  name: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

/**
 * Get current user's profile
 */
export async function getProfile(): Promise<UserProfile> {
  return api.get<UserProfile>("/profile");
}

/**
 * Update current user's profile
 */
export async function updateProfile(
  data: UpdateProfileData
): Promise<UserProfile> {
  return api.patch<UserProfile>("/profile", data);
}

/**
 * Change password
 */
export async function changePassword(
  data: ChangePasswordData
): Promise<{ message: string }> {
  return api.patch<{ message: string }>("/profile/password", data);
}

/**
 * Upload avatar
 */
export async function uploadAvatar(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append("avatar", file);

  const token = localStorage.getItem("auth_token");
  const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload avatar");
  }

  return response.json();
}

/**
 * Delete avatar
 */
export async function deleteAvatar(): Promise<UserProfile> {
  return api.delete<UserProfile>("/profile/avatar");
}
