import { useState, useCallback } from "react";
import { notesApi, type CreateNoteData, type Note as ApiNote } from "@/services/notes.api";

// Internal Note type with Date object
export interface Note extends Omit<ApiNote, 'createdAt' | 'updatedAt'> {
  createdAt: Date;
  updatedAt?: Date;
}

interface UseNoteManagementProps {
  zoomRef: React.RefObject<number>;
  panOffsetRef: React.RefObject<{ x: number; y: number }>;
  boardRef: React.RefObject<HTMLDivElement | null>;
}

export function useNoteManagement({ zoomRef, panOffsetRef, boardRef }: UseNoteManagementProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedNoteId, setHighlightedNoteId] = useState<number | null>(null);

  // Load notes from API
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await notesApi.getAllNotes();
      setNotes(data.map(note => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined,
      })));
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate position at current viewport center
  const getViewportCenterPosition = useCallback(() => {
    if (!boardRef.current) return { x: 100, y: 100 };
    const board = boardRef.current.getBoundingClientRect();
    const noteSize = 200;
    
    // Calculate center of visible viewport, accounting for pan and zoom
    const centerX = (board.width / 2 - panOffsetRef.current!.x) / zoomRef.current! - noteSize / 2;
    const centerY = (board.height / 2 - panOffsetRef.current!.y) / zoomRef.current! - noteSize / 2;
    
    // Add some randomness to avoid stacking
    const randomOffsetX = (Math.random() - 0.5) * 100;
    const randomOffsetY = (Math.random() - 0.5) * 100;
    
    return { 
      x: Math.max(20, centerX + randomOffsetX), 
      y: Math.max(20, centerY + randomOffsetY) 
    };
  }, [boardRef, panOffsetRef, zoomRef]);

  // Create new note
  const handleCreateNote = useCallback(async (noteData: CreateNoteData) => {
    try {
      const createdNote = await notesApi.createNote(noteData);
      const newNoteWithDate: Note = {
        ...createdNote,
        createdAt: new Date(createdNote.createdAt),
        updatedAt: createdNote.updatedAt ? new Date(createdNote.updatedAt) : undefined,
      };
      
      setNotes((prev) => [...prev, newNoteWithDate]);
      
      // Highlight the newly created note
      setHighlightedNoteId(createdNote.id);
      
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedNoteId(null);
      }, 3000);
      
      return newNoteWithDate;
    } catch (error) {
      console.error("Failed to create note:", error);
      throw error;
    }
  }, []);

  // Delete note
  const handleDeleteNote = useCallback(async (id: number) => {
    const note = notes.find(n => n.id === id);
    if (note?.isLocked) return;
    
    try {
      await notesApi.deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
      throw error;
    }
  }, [notes]);

  // Lock/unlock note
  const handleLockNote = useCallback(async (id: number) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      const updatedNote = await notesApi.updateNote(id, { isLocked: !note.isLocked });
      setNotes((prev) => prev.map((n) => 
        n.id === id 
          ? { 
              ...updatedNote, 
              createdAt: new Date(updatedNote.createdAt),
              updatedAt: updatedNote.updatedAt ? new Date(updatedNote.updatedAt) : undefined,
            } 
          : n
      ));
    } catch (error) {
      console.error("Failed to lock/unlock note:", error);
      throw error;
    }
  }, [notes]);

  // Clear highlighted note
  const clearHighlight = useCallback((noteId: number) => {
    if (highlightedNoteId === noteId) {
      setHighlightedNoteId(null);
    }
  }, [highlightedNoteId]);

  // Clear all notes
  const handleClearAll = useCallback(async () => {
    try {
      await Promise.all(
        notes.filter(n => !n.isLocked).map(note => notesApi.deleteNote(note.id))
      );
      setNotes((prev) => prev.filter(note => note.isLocked));
    } catch (error) {
      console.error("Failed to clear notes:", error);
      throw error;
    }
  }, [notes]);

  return {
    notes,
    setNotes,
    isLoading,
    highlightedNoteId,
    loadNotes,
    getViewportCenterPosition,
    handleCreateNote,
    handleDeleteNote,
    handleLockNote,
    clearHighlight,
    handleClearAll,
  };
}
