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
      
      // Add to beginning of array so newest notes appear on top (matching API order)
      setNotes((prev) => [newNoteWithDate, ...prev]);
      
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
  const handleDeleteNote = useCallback(async (id: number, forceDelete: boolean = false) => {
    const note = notes.find(n => n.id === id);
    if (note?.isLocked && !forceDelete) return;
    
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

  // Add content to existing note
  const handleAddContent = useCallback(async (
    id: number, 
    additionalContent: string,
    textColor: string,
    fontFamily: string,
    fontWeight: string,
    fontSize: string
  ) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      const newSegment = {
        content: '\n' + additionalContent,
        textColor,
        fontFamily,
        fontWeight,
        fontSize,
      };
      
      const textSegments = [...(note.textSegments || []), newSegment];
      
      console.log('Calling API to update note:', { id, textSegments });
      const updatedNote = await notesApi.updateNote(id, { textSegments });
      console.log('API response:', updatedNote);
      
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
      console.error("Failed to add content to note:", error);
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

  // Bring note to front (admin only)
  const bringToFront = useCallback(async (noteId: number) => {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1 || noteIndex === 0) return; // Already at front or not found
    
    try {
      // Move note to front of array
      const newOrder = [
        notes[noteIndex],
        ...notes.slice(0, noteIndex),
        ...notes.slice(noteIndex + 1)
      ];
      
      // Update local state immediately for responsiveness
      setNotes(newOrder);
      
      // Save order to backend
      const noteIds = newOrder.map(n => n.id);
      await notesApi.reorderNotes(noteIds);
    } catch (error) {
      console.error("Failed to bring note to front:", error);
      // Reload notes to restore correct order on error
      loadNotes();
      throw error;
    }
  }, [notes, loadNotes]);

  // Send note to back (admin only)
  const sendToBack = useCallback(async (noteId: number) => {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1 || noteIndex === notes.length - 1) return; // Already at back or not found
    
    try {
      // Move note to back of array
      const newOrder = [
        ...notes.slice(0, noteIndex),
        ...notes.slice(noteIndex + 1),
        notes[noteIndex]
      ];
      
      // Update local state immediately for responsiveness
      setNotes(newOrder);
      
      // Save order to backend
      const noteIds = newOrder.map(n => n.id);
      await notesApi.reorderNotes(noteIds);
    } catch (error) {
      console.error("Failed to send note to back:", error);
      // Reload notes to restore correct order on error
      loadNotes();
      throw error;
    }
  }, [notes, loadNotes]);

  // Reorder overlapping notes by providing new order of IDs (admin only)
  // This only reorders the specified notes, keeping other notes in place
  const reorderNotes = useCallback(async (noteIds: number[]) => {
    try {
      // Get the notes being reordered
      const notesToReorder = noteIds.map(id => notes.find(n => n.id === id)!).filter(Boolean);
      
      // Get the indices of these notes in the original array
      const originalIndices = noteIds.map(id => notes.findIndex(n => n.id === id)).sort((a, b) => a - b);
      
      // Create new order by placing reordered notes at the same positions
      const newOrder = [...notes];
      notesToReorder.forEach((note, idx) => {
        newOrder[originalIndices[idx]] = note;
      });
      
      // Update local state immediately for responsiveness
      setNotes(newOrder);
      
      // Save order to backend - send full order
      const allNoteIds = newOrder.map(n => n.id);
      await notesApi.reorderNotes(allNoteIds);
    } catch (error) {
      console.error("Failed to reorder notes:", error);
      // Reload notes to restore correct order on error
      loadNotes();
      throw error;
    }
  }, [notes, loadNotes]);

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
    handleAddContent,
    clearHighlight,
    handleClearAll,
    bringToFront,
    sendToBack,
    reorderNotes,
  };
}
