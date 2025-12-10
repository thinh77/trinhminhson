import { useRef, useEffect, useState } from "react";
import { notesApi } from "@/services/notes.api";
import type { Note } from "./useNoteManagement";

interface UseNoteDragProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  panOffset: { x: number; y: number };
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export function useNoteDrag({
  boardRef,
  zoom,
  panOffset,
  notes,
  setNotes,
}: UseNoteDragProps) {
  // State to track which note is being dragged (for UI updates like disabling transitions)
  const [draggingNoteId, setDraggingNoteId] = useState<number | null>(null);
  
  const zoomRef = useRef(zoom);
  const panOffsetRef = useRef(panOffset);
  const notesRef = useRef(notes);
  const draggingNoteRef = useRef<number | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const latestPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Keep refs in sync
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Mouse drag handlers - using element rect for smoother offset calculation
  const handleDragStart = (noteId: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    
    const note = notesRef.current.find((n) => n.id === noteId);
    if (!note) return;
    
    draggingNoteRef.current = noteId;
    setDraggingNoteId(noteId);
    
    // Calculate offset accounting for zoom from the start
    const noteElement = e.currentTarget as HTMLElement;
    const rect = noteElement.getBoundingClientRect();
    
    dragOffsetRef.current = {
      x: (e.clientX - rect.left) / zoomRef.current,
      y: (e.clientY - rect.top) / zoomRef.current,
    };
  };

  const handleDrag = (e: MouseEvent) => {
    if (draggingNoteRef.current === null || !boardRef.current) return;
    
    e.preventDefault();
    const board = boardRef.current.getBoundingClientRect();
    // Account for pan offset and zoom when calculating note position
    const newX = (e.clientX - board.left - panOffsetRef.current.x) / zoomRef.current - dragOffsetRef.current.x;
    const newY = (e.clientY - board.top - panOffsetRef.current.y) / zoomRef.current - dragOffsetRef.current.y;
    
    // Store latest position for saving (no clamping - allow negative values for infinite canvas)
    latestPositionRef.current = { x: newX, y: newY };
    
    const noteId = draggingNoteRef.current;
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setNotes((prev) => prev.map((note) => 
        note.id === noteId 
          ? { ...note, x: newX, y: newY } 
          : note
      ));
    });
  };

  const handleDragEnd = async () => {
    if (draggingNoteRef.current !== null && latestPositionRef.current) {
      const noteId = draggingNoteRef.current;
      const position = { ...latestPositionRef.current };
      
      // Reset state first
      draggingNoteRef.current = null;
      latestPositionRef.current = null;
      setDraggingNoteId(null);
      
      try {
        // Update position in backend
        await notesApi.updateNote(noteId, { x: position.x, y: position.y });
      } catch (error) {
        console.error("Failed to update note position:", error);
      }
    } else {
      draggingNoteRef.current = null;
      latestPositionRef.current = null;
      setDraggingNoteId(null);
    }
  };

  // Touch drag handlers - using element rect for smoother offset calculation
  const handleTouchStart = (noteId: number, e: React.TouchEvent) => {
    e.stopPropagation();
    
    const note = notesRef.current.find((n) => n.id === noteId);
    if (!note) return;
    
    draggingNoteRef.current = noteId;
    setDraggingNoteId(noteId);
    const touch = e.touches[0];
    
    // Calculate offset accounting for zoom from the start
    const noteElement = e.currentTarget as HTMLElement;
    const rect = noteElement.getBoundingClientRect();
    
    dragOffsetRef.current = {
      x: (touch.clientX - rect.left) / zoomRef.current,
      y: (touch.clientY - rect.top) / zoomRef.current,
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (draggingNoteRef.current === null || !boardRef.current) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const board = boardRef.current.getBoundingClientRect();
    // Account for pan offset and zoom when calculating note position
    const newX = (touch.clientX - board.left - panOffsetRef.current.x) / zoomRef.current - dragOffsetRef.current.x;
    const newY = (touch.clientY - board.top - panOffsetRef.current.y) / zoomRef.current - dragOffsetRef.current.y;
    
    // Store latest position for saving (no clamping - allow negative values for infinite canvas)
    latestPositionRef.current = { x: newX, y: newY };
    
    const noteId = draggingNoteRef.current;
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setNotes((prev) => prev.map((note) => 
        note.id === noteId 
          ? { ...note, x: newX, y: newY } 
          : note
      ));
    });
  };

  // Add event listeners - only once on mount
  useEffect(() => {
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    handleDragStart,
    handleTouchStart,
    draggingNoteId,
  };
}
