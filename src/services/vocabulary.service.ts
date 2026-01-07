/**
 * Vocabulary API Service
 * Frontend API calls for vocabulary sets and flashcards
 */

import { api, API_BASE_URL } from "./api";

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
export interface VocabularySet {
  id: number;
  owner_id?: number | null;
  owner_name?: string | null;
  original_owner_id?: number | null;
  original_owner_name?: string | null;
  is_shared?: boolean;
  shared_at?: string | null;
  cloned_from_set_id?: number | null;
  name: string;
  description: string;
  sort_order: number;
  default_face: number;
  face_count: number;
  created_at: string;
  updated_at: string;
  card_count: number;
}

export interface Flashcard {
  id: number;
  set_id: number;
  face1?: string;
  face2?: string;
  face3?: string;
  face4?: string;
  face5?: string;
  face6?: string;
  face7?: string;
  face8?: string;
  face9?: string;
  face10?: string;
  learned: number;
  created_at: string;
}

export interface VocabularySetWithFlashcards extends VocabularySet {
  flashcards: Flashcard[];
  totalCount: number;
  learnedCount: number;
  is_owner?: boolean;
}

export interface UploadResult {
  message: string;
  setId: number;
  cardCount: number;
  faceCount: number;
}

export interface CloneResult {
  message: string;
  setId: number;
  cardCount: number;
}

// API Functions
export async function getVocabularySets(
  scope?: "personal" | "community"
): Promise<VocabularySet[]> {
  const query = scope ? `?scope=${encodeURIComponent(scope)}` : "";
  return api.get<VocabularySet[]>(`/vocabulary/sets${query}`);
}

export async function getVocabularySet(
  id: number | string,
  includeAll = false
): Promise<VocabularySetWithFlashcards> {
  const query = includeAll ? "?includeAll=true" : "";
  return api.get<VocabularySetWithFlashcards>(`/vocabulary/sets/${id}${query}`);
}

export async function uploadVocabularySet(
  file: File,
  name: string,
  description = ""
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("description", description);

  const response = await fetch(`${API_BASE_URL}/vocabulary/upload`, {
    method: "POST",
    body: formData,
    headers: getAuthHeaders(), // Don't set Content-Type for FormData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to upload file");
  }

  return response.json();
}

export async function updateVocabularySet(
  id: number,
  data: Partial<
    Pick<VocabularySet, "name" | "description" | "default_face" | "is_shared">
  >
): Promise<VocabularySet> {
  return api.patch<VocabularySet>(`/vocabulary/sets/${id}`, data);
}

export async function cloneVocabularySet(id: number): Promise<CloneResult> {
  return api.post<CloneResult>(`/vocabulary/sets/${id}/clone`, {});
}

export async function deleteVocabularySet(id: number): Promise<void> {
  await api.delete(`/vocabulary/sets/${id}`);
}

export async function reorderVocabularySets(
  orderedIds: number[]
): Promise<void> {
  await api.post("/vocabulary/sets/reorder", { orderedIds });
}

export async function markFlashcardLearned(
  id: number,
  learned: boolean
): Promise<{ message: string; learned: boolean }> {
  const response = await fetch(
    `${API_BASE_URL}/vocabulary/flashcards/${id}/learned`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ learned }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update flashcard");
  }

  return response.json();
}

export async function resetVocabularySet(
  id: number | string
): Promise<{ message: string; count: number }> {
  const response = await fetch(`${API_BASE_URL}/vocabulary/sets/${id}/reset`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to reset vocabulary set");
  }

  return response.json();
}
