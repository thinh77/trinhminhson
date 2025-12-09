import { useRef, useEffect } from "react";
import { notesApi } from "@/services/notes.api";
import type { Note } from "./useNoteManagement";

interface UseNoteDragProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  panOffset: { x: number; y: number };
  notes: Note[];
  setNotes: (notes: Note[]) => void;
}

export function useNoteDrag({
  boardRef,
  zoom,
  panOffset,
  notes,
  setNotes,
}: UseNoteDragProps) {
  const zoomRef = useRef(zoom);
  const panOffsetRef = useRef(panOffset);
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

  // Mouse drag handlers
  const handleDragStart = (noteId: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    
    draggingNoteRef.current = noteId;
    
    const board = boardRef.current?.getBoundingClientRect();
    if (board) {
      const noteScreenX = note.x * zoomRef.current + panOffsetRef.current.x;
      const noteScreenY = note.y * zoomRef.current + panOffsetRef.current.y;
      
      dragOffsetRef.current = {
        x: e.clientX - board.left - noteScreenX,
        y: e.clientY - board.top - noteScreenY,
      };
    }
  };

  const handleDrag = (e: MouseEvent) => {
    if (!draggingNoteRef.current) return;
    
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return;
    
    const mouseX = e.clientX - board.left;
    const mouseY = e.clientY - board.top;
    
    const newX = (mouseX - dragOffsetRef.current.x - panOffsetRef.current.x) / zoomRef.current;
    const newY = (mouseY - dragOffsetRef.current.y - panOffsetRef.current.y) / zoomRef.current;
    
    latestPositionRef.current = { x: newX, y: newY };
    
    setNotes(
      notes.map((note) =>
        note.id === draggingNoteRef.current
          ? { ...note, x: newX, y: newY }
          : note
      )
    );
  };

  const handleDragEnd = async () => {
    if (draggingNoteRef.current && latestPositionRef.current) {
      try {
        await notesApi.updateNote(draggingNoteRef.current, {
          x: latestPositionRef.current.x,
          y: latestPositionRef.current.y,
        });
      } catch (error) {
        console.error("Failed to update note position:", error);
      }
    }
    draggingNoteRef.current = null;
    latestPositionRef.current = null;
  };

  // Touch drag handlers
  const handleTouchStart = (noteId: number, e: React.TouchEvent) => {
    e.stopPropagation();
    
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    
    draggingNoteRef.current = noteId;
    const touch = e.touches[0];
    
    const board = boardRef.current?.getBoundingClientRect();
    if (board) {
      const noteScreenX = note.x * zoomRef.current + panOffsetRef.current.x;
      const noteScreenY = note.y * zoomRef.current + panOffsetRef.current.y;
      
      dragOffsetRef.current = {
        x: touch.clientX - board.left - noteScreenX,
        y: touch.clientY - board.top - noteScreenY,
      };
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!draggingNoteRef.current) return;
    e.preventDefault();
    
    const board = boardRef.current?.getBoundingClientRect();
    if (!board) return;
    
    const touch = e.touches[0];
    const touchX = touch.clientX - board.left;
    const touchY = touch.clientY - board.top;
    
    const newX = (touchX - dragOffsetRef.current.x - panOffsetRef.current.x) / zoomRef.current;
    const newY = (touchY - dragOffsetRef.current.y - panOffsetRef.current.y) / zoomRef.current;
    
    latestPositionRef.current = { x: newX, y: newY };
    
    setNotes(
      notes.map((note) =>
        note.id === draggingNoteRef.current
          ? { ...note, x: newX, y: newY }
          : note
      )
    );
  };

  // Add event listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  return {
    handleDragStart,
    handleTouchStart,
  };
}
