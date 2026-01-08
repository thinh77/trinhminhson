import { API_BASE_URL } from './api';

export interface TextSegment {
  content: string;
  textColor: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
}

export interface Note {
  id: number;
  content: string;
  color: string;
  textColor: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  textSegments?: TextSegment[];
  x: number;
  y: number;
  rotation: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  content: string;
  color: string;
  textColor: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  x: number;
  y: number;
  rotation: number;
  isLocked: boolean;
}

export interface UpdateNoteData {
  content?: string;
  color?: string;
  textColor?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: string;
  textSegments?: TextSegment[];
  x?: number;
  y?: number;
  rotation?: number;
  isLocked?: boolean;
}

export const notesApi = {
  // Get all notes
  getAllNotes: async (): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes`);
    if (!response.ok) throw new Error("Failed to fetch notes");
    const data = await response.json();
    return data.data;
  },

  // Get note by ID
  getNoteById: async (id: number): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`);
    if (!response.ok) throw new Error("Failed to fetch note");
    const data = await response.json();
    return data.data;
  },

  // Create new note
  createNote: async (noteData: CreateNoteData): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error("Failed to create note");
    const data = await response.json();
    return data.data;
  },

  // Update note
  updateNote: async (id: number, noteData: UpdateNoteData): Promise<Note> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error("Failed to update note");
    const data = await response.json();
    return data.data;
  },

  // Delete note
  deleteNote: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete note");
  },

  // Delete all notes
  deleteAllNotes: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete all notes");
  },

  // Reorder notes (admin only)
  reorderNotes: async (noteIds: number[]): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/notes/reorder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ noteIds }),
    });
    if (!response.ok) throw new Error("Failed to reorder notes");
    const data = await response.json();
    return data.data;
  },
};
