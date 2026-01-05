import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Plus, X, Palette, Type, StickyNote, Sparkles, Check, Loader2, Move, RotateCcw, ChevronDown, ZoomIn, ZoomOut, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useZoom, MIN_ZOOM, MAX_ZOOM } from "@/hooks/useZoom";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { usePan } from "@/hooks/usePan";
import { useNoteDrag } from "@/hooks/useNoteDrag";
import { useNoteManagement } from "@/hooks/useNoteManagement";
import { noteColors, textColors, fontFamilies, fontWeights, fontSizes } from "@/constants/noteStyles";
import { EditNoteModal } from "@/components/board/EditNoteModal";
import type { Note } from "@/types/note";

export function BoardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    content: "",
    color: noteColors[0].bg,
    textColor: textColors[0].color,
    fontFamily: fontFamilies[0].value,
    fontWeight: fontWeights[1].value,
    fontSize: fontSizes[1].value,
  });
  
  // Advanced options toggle for mobile
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Overlapping notes overlay
  const [overlappingNotes, setOverlappingNotes] = useState<Note[]>([]);
  const [overlayPosition, setOverlayPosition] = useState<{ x: number; y: number } | null>(null);
  
  // Refs
  const boardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const zoomRef = useRef(1);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  
  // State for pan and zoom
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  
  // Initialize custom hooks
  const { handleZoom } = useZoom({
    boardRef,
    panOffset,
    zoom,
    setZoom,
    setPanOffset,
  });

  const { initialPanBeforePinchRef } = usePinchZoom({
    boardRef,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
  });

  const {
    notes,
    setNotes,
    isLoading,
    highlightedNoteId,
    loadNotes,
    getViewportCenterPosition,
    handleCreateNote: createNote,
    handleDeleteNote,
    handleLockNote,
    handleAddContent,
    clearHighlight,
  } = useNoteManagement({ zoomRef, panOffsetRef, boardRef });

  const { handleDragStart: handleNoteDragStart, handleTouchStart: handleNoteTouchStart, draggingNoteId } = useNoteDrag({
    boardRef,
    zoom,
    panOffset,
    notes,
    setNotes,
  });

  const { handlePanStart } = usePan({
    boardRef,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    initialPanBeforePinchRef,
    draggingNoteId,
  });

  // Keep refs in sync
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    setIsLoaded(true);
    loadNotes();
  }, [loadNotes]);

  // Focus textarea when creating
  useEffect(() => {
    if (isCreating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isCreating]);

  // Create new note handler
  const handleCreateNote = async () => {
    if (!newNote.content.trim()) return;

    try {
      const position = getViewportCenterPosition();
      await createNote({
        content: newNote.content,
        color: newNote.color,
        textColor: newNote.textColor,
        fontFamily: newNote.fontFamily,
        fontWeight: newNote.fontWeight,
        fontSize: newNote.fontSize,
        x: position.x,
        y: position.y,
        rotation: Math.random() * 10 - 5,
        isLocked: false,
      });
      
      setNewNote({ 
        content: "", 
        color: noteColors[0].bg, 
        textColor: textColors[0].color,
        fontFamily: fontFamilies[0].value,
        fontWeight: fontWeights[1].value,
        fontSize: fontSizes[1].value,
      });
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Không thể tạo ghi chú. Vui lòng thử lại.");
    }
  };

  // Handle note drag start
  const handleDragStart = (e: React.MouseEvent, noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.isLocked) return;
    
    clearHighlight(noteId);
    handleNoteDragStart(noteId, e);
  };

  // Handle touch start (mobile)
  const handleTouchStart = (e: React.TouchEvent, noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.isLocked) return;
    
    // Check if touch is on action buttons area
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    clearHighlight(noteId);
    handleNoteTouchStart(noteId, e);
  };

  // Find notes that overlap at a given point (canvas coordinates)
  const findOverlappingNotes = (canvasX: number, canvasY: number): Note[] => {
    const NOTE_WIDTH = 192; // w-48 = 12rem = 192px
    const NOTE_HEIGHT = 192; // min-h-48
    
    return notes.filter(note => {
      const noteLeft = note.x;
      const noteTop = note.y;
      const noteRight = noteLeft + NOTE_WIDTH;
      const noteBottom = noteTop + NOTE_HEIGHT;
      
      return canvasX >= noteLeft && canvasX <= noteRight &&
             canvasY >= noteTop && canvasY <= noteBottom;
    });
  };

  // Handle note click to check for overlapping notes
  const handleNoteClick = (e: React.MouseEvent, clickedNote: Note) => {
    // Don't show overlay if dragging
    if (draggingNoteId !== null) return;
    
    // Don't show overlay if clicking on buttons
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    // Clear highlight if this note is highlighted
    if (highlightedNoteId === clickedNote.id) {
      clearHighlight(clickedNote.id);
      return;
    }
    
    // Calculate click position in canvas coordinates
    if (!boardRef.current) return;
    const board = boardRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - board.left - panOffset.x) / zoom;
    const canvasY = (e.clientY - board.top - panOffset.y) / zoom;
    
    // Find all notes at this position
    const overlapping = findOverlappingNotes(canvasX, canvasY);
    
    // Only show overlay if there are multiple overlapping notes
    if (overlapping.length > 1) {
      setOverlappingNotes(overlapping);
      setOverlayPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle selecting a note from overlay
  const handleSelectFromOverlay = (note: Note) => {
    // Move selected note to the beginning of array (top of stack, since z-index = notes.length - index)
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== note.id);
      return [note, ...filtered];
    });
    
    // Close overlay
    setOverlappingNotes([]);
    setOverlayPosition(null);
  };

  // Close overlay
  const closeOverlay = () => {
    setOverlappingNotes([]);
    setOverlayPosition(null);
  };

  return (
    <div className="h-screen flex flex-col bg-stone-100 overflow-hidden select-none">
      {/* Navbar */}
      <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

      {/* Board header - fixed */}
      <div 
        className={cn(
          "fixed top-16 left-4 right-4 flex items-center justify-between z-30",
          "transition-all duration-700",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white shadow-md">
            <StickyNote className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h1 
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Bảng Ghi Chú
            </h1>
            <p className="text-sm text-muted-foreground">
              {notes.length} ghi chú
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset view button - only show when panned or zoomed */}
          {(panOffset.x !== 0 || panOffset.y !== 0 || zoom !== 1) && (
            <button
              onClick={() => { setPanOffset({ x: 0, y: 0 }); setZoom(1); }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl",
                "bg-white/90 text-muted-foreground shadow-md",
                "hover:bg-white hover:text-foreground transition-colors duration-200",
                "cursor-pointer"
              )}
              title="Về vị trí ban đầu"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Reset</span>
            </button>
          )}
          
          <button
            onClick={() => setIsCreating(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl",
              "bg-accent text-accent-foreground shadow-md",
              "hover:bg-accent/90 transition-colors duration-200",
              "cursor-pointer"
            )}
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline text-sm font-medium">Thêm ghi chú</span>
          </button>
        </div>
      </div>

      {/* Board area */}
      <div 
        ref={boardRef}
        className={cn(
          "flex-1 relative mt-20",
          "bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)]",
          "bg-[size:20px_20px]",
          "overflow-hidden", // Hide scrollbars - infinite canvas with pan
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          touchAction: 'none', // Prevent browser pinch-to-zoom on this element
        }}
        onMouseDown={handlePanStart}
      >
        {/* Pan indicator - bottom right */}
        <div className={cn(
          "absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-white/80 backdrop-blur-sm shadow-md text-xs text-muted-foreground",
          "transition-opacity duration-200",
          (panOffset.x !== 0 || panOffset.y !== 0 || zoom !== 1) ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <Move className="w-3.5 h-3.5" />
          <span>
            {Math.round(panOffset.x)}, {Math.round(panOffset.y)} · {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Zoom controls - bottom left */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm shadow-md rounded-xl p-1">
          <button
            onClick={() => handleZoom(zoom - 0.25)}
            disabled={zoom <= MIN_ZOOM}
            className={cn(
              "p-2 rounded-lg transition-colors cursor-pointer",
              "hover:bg-secondary active:bg-secondary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Thu nhỏ (Scroll down)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setPanOffset({ x: 0, y: 0 }); setZoom(1); }}
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer",
              "hover:bg-secondary active:bg-secondary",
              zoom === 1 && "bg-secondary"
            )}
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => handleZoom(zoom + 0.25)}
            disabled={zoom >= MAX_ZOOM}
            className={cn(
              "p-2 rounded-lg transition-colors cursor-pointer",
              "hover:bg-secondary active:bg-secondary",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Phóng to (Scroll up)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Inner container - infinite canvas with pan and zoom transform */}
        <div 
          ref={canvasRef}
          className="relative w-full h-full origin-top-left"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            willChange: isPanning ? 'transform' : 'auto',
          }}
        >

        {/* Empty state */}
        {notes.length === 0 && !isCreating && !isLoading && (
          <div 
            className={cn(
              "fixed inset-0 flex flex-col items-center justify-center pt-32 pointer-events-none",
              "transition-all duration-700 delay-200",
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl text-center max-w-md pointer-events-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-amber-500" />
              </div>
              <h2 
                className="text-2xl font-bold text-foreground mb-2"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Bảng trắng của bạn
              </h2>
              <p className="text-muted-foreground mb-6">
                Bắt đầu dán những ghi chú đầu tiên lên đây nhé!<br />
                Ghi chú sẽ được lưu tự động.
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className={cn(
                  "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
                  "bg-accent text-accent-foreground font-medium",
                  "hover:bg-accent/90 transition-colors duration-200",
                  "cursor-pointer"
                )}
              >
                <Plus className="w-5 h-5" />
                <span>Tạo ghi chú đầu tiên</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="fixed inset-0 flex items-center justify-center pt-32">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-sm text-muted-foreground">Đang tải ghi chú...</p>
            </div>
          </div>
        )}

        {/* Sticky notes */}
        {notes.map((note, index) => {
          const isHighlighted = highlightedNoteId === note.id;
          return (
          <div
            key={note.id}
            className={cn(
              "sticky-note absolute w-48 min-h-48 p-4 rounded-sm shadow-lg",
              "hover:shadow-xl",
              "group",
              !note.isLocked && "cursor-move",
              // Dragging state - disable transition and boost shadow
              draggingNoteId === note.id && "shadow-2xl scale-105 cursor-grabbing",
              // Only apply transition when NOT dragging this note
              draggingNoteId !== note.id && "transition-all duration-300",
              // Highlight effect for newly created note
              isHighlighted && "scale-105"
            )}
            style={{
              left: note.x,
              top: note.y,
              backgroundColor: note.color,
              transform: `rotate(${draggingNoteId === note.id ? 0 : note.rotation}deg)${isHighlighted ? ' scale(1.05)' : ''}`,
              animationDelay: `${index * 50}ms`,
              touchAction: 'none',
              willChange: draggingNoteId === note.id ? 'left, top' : 'auto',
              // z-index based on creation time - newer notes (start of array from API) appear on top
              zIndex: draggingNoteId === note.id ? 50 : (isHighlighted ? 40 : notes.length - index),
              // Glowing border effect for highlighted note
              boxShadow: isHighlighted 
                ? '0 0 0 3px #fbbf24, 0 0 20px 5px rgba(251, 191, 36, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                : undefined,
            }}
            onMouseDown={(e) => handleDragStart(e, note.id)}
            onTouchStart={(e) => handleTouchStart(e, note.id)}
            onClick={(e) => handleNoteClick(e, note)}
          >
            {/* Tape effect */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm"
              style={{ transform: `translateX(-50%) rotate(${-note.rotation}deg)` }}
            />

            {/* Action buttons */}
            <div className={cn(
              "absolute -top-2 -right-2 flex gap-1",
              "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
            )}>
              {/* Edit button - show for locked notes */}
              {note.isLocked && (
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); setEditingNote(note); }}
                  onTouchStart={(e) => { e.stopPropagation(); }}
                  onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); setEditingNote(note); }}
                  className={cn(
                    "p-1.5 rounded-full shadow-md cursor-pointer z-10",
                    "bg-white/90 text-gray-500 hover:bg-blue-100 hover:text-blue-600",
                    "active:bg-blue-100 active:text-blue-600"
                  )}
                  aria-label="Edit note"
                  title="Ghi thêm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Lock/Unlock button - only show for unlocked notes */}
              {!note.isLocked && (<button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleLockNote(note.id); }}
                onTouchStart={(e) => { e.stopPropagation(); }}
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleLockNote(note.id); }}
                className={cn(
                  "p-1.5 rounded-full shadow-md cursor-pointer z-10",
                  "bg-white/90 text-gray-500 hover:bg-green-100 hover:text-green-600",
                  "active:bg-green-100 active:text-green-600"
                )}
                aria-label="Lock note"
                title="Khóa ghi chú"
              >
                <Check className="w-3.5 h-3.5" />
              </button>)}
              {/* Delete button - only show if not locked */}
              {!note.isLocked && (
                <button
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteNote(note.id); }}
                  onTouchStart={(e) => { e.stopPropagation(); }}
                  onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteNote(note.id); }}
                  className={cn(
                    "p-1.5 rounded-full",
                    "bg-white/90 text-gray-500 shadow-md",
                    "hover:bg-red-100 hover:text-red-600",
                    "active:bg-red-100 active:text-red-600",
                    "cursor-pointer z-10"
                  )}
                  aria-label="Delete note"
                  title="Xóa ghi chú"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Note content */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words select-text">
              <span
                style={{ 
                  color: note.textColor,
                  fontFamily: note.fontFamily,
                  fontWeight: note.fontWeight,
                  fontSize: note.fontSize,
                }}
              >
                {note.content}
              </span>
              {note.textSegments?.map((segment, idx) => (
                <span
                  key={idx}
                  style={{
                    color: segment.textColor,
                    fontFamily: segment.fontFamily,
                    fontWeight: segment.fontWeight,
                    fontSize: segment.fontSize,
                  }}
                >
                  {segment.content}
                </span>
              ))}
            </div>

            {/* Bottom fold effect */}
            <div 
              className="absolute bottom-0 right-0 w-6 h-6"
              style={{
                background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)`,
              }}
            />
          </div>
        );
        })}
        </div>
      </div>

      {/* Overlapping notes overlay - Fullscreen */}
      {overlappingNotes.length > 1 && overlayPosition && (
        <div 
          className="fixed inset-0 z-[90] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md"
          onClick={closeOverlay}
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between">
            <div>
              <h2 
                className="text-xl md:text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {overlappingNotes.length} ghi chú chồng chéo
              </h2>
              <p className="text-sm text-slate-400">
                Chọn một ghi chú để đưa lên trên cùng
              </p>
            </div>
            <button
              onClick={closeOverlay}
              className={cn(
                "p-3 rounded-xl bg-white/10 text-white",
                "hover:bg-white/20 transition-colors duration-200",
                "cursor-pointer"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notes Grid */}
          <div 
            className="absolute inset-0 pt-24 pb-8 px-4 md:px-8 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {overlappingNotes.map((note, idx) => (
                  <button
                    key={note.id}
                    onClick={() => handleSelectFromOverlay(note)}
                    className={cn(
                      "group relative w-full min-h-[200px] p-4 rounded-lg shadow-xl text-left",
                      "transition-all duration-300 ease-out",
                      "hover:scale-105 hover:-rotate-1 hover:shadow-2xl",
                      "active:scale-100 active:rotate-0",
                      "cursor-pointer",
                      "ring-2 ring-transparent hover:ring-amber-400/50"
                    )}
                    style={{ 
                      backgroundColor: note.color,
                      transform: `rotate(${note.rotation * 0.5}deg)`,
                    }}
                  >
                    {/* Tape effect */}
                    <div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm shadow-sm"
                      style={{ transform: `translateX(-50%) rotate(${-note.rotation * 0.5}deg)` }}
                    />

                    {/* Badge number */}
                    <span 
                      className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shadow-lg"
                    >
                      {idx + 1}
                    </span>

                    {/* Content */}
                    <div 
                      className="text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-6"
                      style={{ 
                        color: note.textColor,
                        fontFamily: note.fontFamily,
                        fontWeight: note.fontWeight,
                        fontSize: note.fontSize,
                      }}
                    >
                      {note.content}
                    </div>

                    {/* Locked indicator */}
                    {note.isLocked && (
                      <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full shadow-sm">
                        <Check className="w-3 h-3" />
                        Đã khóa
                      </span>
                    )}

                    {/* Hover overlay */}
                    <div className={cn(
                      "absolute inset-0 rounded-lg bg-amber-500/0 group-hover:bg-amber-500/10",
                      "transition-colors duration-200",
                      "flex items-center justify-center opacity-0 group-hover:opacity-100"
                    )}>
                      <span className="px-4 py-2 rounded-full bg-slate-900/90 text-white text-sm font-medium shadow-lg">
                        Chọn ghi chú này
                      </span>
                    </div>

                    {/* Bottom fold effect */}
                    <div 
                      className="absolute bottom-0 right-0 w-6 h-6"
                      style={{
                        background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer hint */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
            <p className="text-sm text-slate-500">
              Nhấn vào bất kỳ đâu bên ngoài để đóng
            </p>
          </div>
        </div>
      )}

      {/* Create note modal */}
      {isCreating && (
        <div 
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-4"
          onClick={() => setIsCreating(false)}
        >
          <div 
            className={cn(
              "bg-white flex flex-col",
              "h-full w-full md:h-auto md:w-full md:max-w-md md:max-h-[90vh]",
              "md:rounded-3xl md:shadow-2xl md:animate-fade-in-up",
              "overflow-hidden"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-4 border-b border-border bg-white sticky top-0 z-10">
              <h3 
                className="text-lg md:text-lg font-semibold text-foreground"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Tạo ghi chú mới
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-4">
              {/* Preview */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <StickyNote className="w-4 h-4" />
                  Nội dung
                </label>
                <div 
                  className="relative p-4 rounded-sm shadow-md"
                  style={{ backgroundColor: newNote.color }}
                >
                  {/* Tape effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm" />
                  
                  <textarea
                    ref={textareaRef}
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Viết gì đó..."
                    className={cn(
                      "w-full h-32 md:h-32 bg-transparent resize-none leading-relaxed",
                      "placeholder:text-gray-400 focus:outline-none",
                      "text-base" // Minimum 16px to prevent iOS auto-zoom
                    )}
                    style={{ 
                      color: newNote.textColor,
                      fontFamily: newNote.fontFamily,
                      fontWeight: newNote.fontWeight,
                      // Use at least 16px on mobile to prevent iOS zoom, respect user choice on desktop
                      fontSize: window.innerWidth < 768 ? Math.max(16, parseInt(newNote.fontSize)) + 'px' : newNote.fontSize,
                    }}
                    maxLength={200}
                  />

                  {/* Character count */}
                  <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                    {newNote.content.length}/200
                  </div>
                </div>
              </div>

              {/* Color picker - Always visible */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Palette className="w-4 h-4" />
                  Màu giấy
                </label>
                <div className="flex flex-wrap gap-2">
                  {noteColors.map((color) => (
                    <button
                      key={color.bg}
                      onClick={() => setNewNote({ ...newNote, color: color.bg })}
                      className={cn(
                        "w-10 h-10 md:w-8 md:h-8 rounded-lg transition-all duration-200 cursor-pointer",
                        "active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                        newNote.color === color.bg && "ring-2 ring-foreground ring-offset-2 scale-110"
                      )}
                      style={{ backgroundColor: color.bg }}
                      aria-label={color.name}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Advanced Options Toggle - Mobile only */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl",
                  "bg-secondary/50 hover:bg-secondary active:bg-secondary transition-colors",
                  "md:hidden cursor-pointer"
                )}
              >
                <span className="text-sm font-medium text-foreground">
                  Tùy chọn nâng cao
                </span>
                <ChevronDown 
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    showAdvanced && "rotate-180"
                  )} 
                />
              </button>

              {/* Advanced options - Hidden on mobile by default, always visible on desktop */}
              <div className={cn(
                "space-y-4",
                "md:block", // Always show on desktop
                showAdvanced ? "block" : "hidden" // Toggle on mobile
              )}>
                {/* Text color picker */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Type className="w-4 h-4" />
                    Màu chữ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {textColors.map((color) => (
                      <button
                        key={color.color}
                        onClick={() => setNewNote({ ...newNote, textColor: color.color })}
                        className={cn(
                          "w-10 h-10 md:w-8 md:h-8 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                          "flex items-center justify-center text-white text-xs font-bold",
                          newNote.textColor === color.color && "ring-2 ring-foreground ring-offset-2 scale-110"
                        )}
                        style={{ backgroundColor: color.color }}
                        aria-label={color.name}
                        title={color.name}
                      >
                        A
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font family picker */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Type className="w-4 h-4" />
                    Kiểu chữ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {fontFamilies.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => setNewNote({ ...newNote, fontFamily: font.value })}
                        className={cn(
                          "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:bg-secondary focus:outline-none",
                          "text-sm border border-border",
                          newNote.fontFamily === font.value && "ring-2 ring-foreground bg-secondary"
                        )}
                        style={{ fontFamily: font.value }}
                        title={font.name}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font weight picker */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Type className="w-4 h-4" />
                    Độ đậm
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {fontWeights.map((weight) => (
                      <button
                        key={weight.value}
                        onClick={() => setNewNote({ ...newNote, fontWeight: weight.value })}
                        className={cn(
                          "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:bg-secondary focus:outline-none",
                          "text-sm border border-border",
                          newNote.fontWeight === weight.value && "ring-2 ring-foreground bg-secondary"
                        )}
                        style={{ fontWeight: weight.value }}
                        title={weight.name}
                      >
                        {weight.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size picker */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Type className="w-4 h-4" />
                    Cỡ chữ
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {fontSizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => setNewNote({ ...newNote, fontSize: size.value })}
                        className={cn(
                          "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:bg-secondary focus:outline-none",
                          "text-sm border border-border",
                          newNote.fontSize === size.value && "ring-2 ring-foreground bg-secondary"
                        )}
                        title={size.name}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions - Fixed bottom on mobile, static on desktop */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t border-border bg-white/95 backdrop-blur-sm">
              <button
                onClick={() => setIsCreating(false)}
                className={cn(
                  "flex-1 md:flex-none px-4 py-3 md:py-2 rounded-xl text-sm font-medium",
                  "text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors",
                  "cursor-pointer"
                )}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateNote}
                disabled={!newNote.content.trim()}
                className={cn(
                  "flex-1 md:flex-none px-6 py-3 md:py-2 rounded-xl text-sm font-medium",
                  "bg-accent text-accent-foreground",
                  "hover:bg-accent/90 active:bg-accent/90 transition-colors",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "cursor-pointer"
                )}
              >
                Dán lên bảng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit note modal */}
      {editingNote && (
        <EditNoteModal
          note={editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleAddContent}
        />
      )}
    </div>
  );
}

// import { useState, useEffect, useRef } from "react";
// import { Navbar } from "@/components/layout/navbar";
// import { Plus, X, Palette, Type, StickyNote, Sparkles, Check, Loader2, Move, RotateCcw, ChevronDown, ZoomIn, ZoomOut } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { notesApi, type CreateNoteData } from "@/services/notes.api";

// // Note type
// interface Note {
//   id: number;
//   content: string;
//   color: string;
//   textColor: string;
//   fontFamily: string;
//   fontWeight: string;
//   fontSize: string;
//   x: number;
//   y: number;
//   rotation: number;
//   isLocked: boolean;
//   createdAt: Date;
// }

// // Predefined note colors (pastel sticky note colors)
// const noteColors = [
//   { bg: "#FEF3C7", name: "Yellow" },      // Warm yellow
//   { bg: "#FECACA", name: "Pink" },        // Soft pink
//   { bg: "#BBF7D0", name: "Green" },       // Mint green
//   { bg: "#BFDBFE", name: "Blue" },        // Sky blue
//   { bg: "#DDD6FE", name: "Purple" },      // Lavender
//   { bg: "#FED7AA", name: "Orange" },      // Peach
//   { bg: "#FBCFE8", name: "Rose" },        // Rose
//   { bg: "#A5F3FC", name: "Cyan" },        // Cyan
// ];

// // Text colors
// const textColors = [
//   { color: "#1F2937", name: "Dark" },     // Gray 800
//   { color: "#7C2D12", name: "Brown" },    // Orange 900
//   { color: "#1E3A8A", name: "Navy" },     // Blue 900
//   { color: "#14532D", name: "Forest" },   // Green 900
//   { color: "#581C87", name: "Purple" },   // Purple 900
//   { color: "#9F1239", name: "Wine" },     // Rose 900
// ];

// // Font families
// const fontFamilies = [
//   { value: "'Work Sans', sans-serif", name: "Work Sans" },
//   { value: "'Outfit', sans-serif", name: "Outfit" },
//   { value: "serif", name: "Serif" },
//   { value: "monospace", name: "Mono" },
//   { value: "cursive", name: "Cursive" },
// ];

// // Font weights
// const fontWeights = [
//   { value: "300", name: "Light" },
//   { value: "400", name: "Normal" },
//   { value: "500", name: "Medium" },
//   { value: "600", name: "Semi Bold" },
//   { value: "700", name: "Bold" },
// ];

// // Font sizes
// const fontSizes = [
//   { value: "12px", name: "XS" },
//   { value: "14px", name: "S" },
//   { value: "16px", name: "M" },
//   { value: "18px", name: "L" },
//   { value: "20px", name: "XL" },
// ];

// export function BoardPage() {
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [notes, setNotes] = useState<Note[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isCreating, setIsCreating] = useState(false);
//   const [newNote, setNewNote] = useState({
//     content: "",
//     color: noteColors[0].bg,
//     textColor: textColors[0].color,
//     fontFamily: fontFamilies[0].value,
//     fontWeight: fontWeights[1].value,
//     fontSize: fontSizes[1].value,
//   });
//   const [draggingNote, setDraggingNote] = useState<number | null>(null);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
//   // Pan state for infinite canvas
//   const [isPanning, setIsPanning] = useState(false);
//   const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
//   const panStartRef = useRef({ x: 0, y: 0 });
//   const panOffsetRef = useRef({ x: 0, y: 0 });
//   const isPanningRef = useRef(false);
  
//   // Advanced options toggle for mobile
//   const [showAdvanced, setShowAdvanced] = useState(false);
  
//   // Zoom state
//   const [zoom, setZoom] = useState(1);
//   const zoomRef = useRef(1);
  
//   // Zoom with center point preservation
//   const handleZoom = (newZoom: number) => {
//     if (!boardRef.current) {
//       setZoom(newZoom);
//       return;
//     }
    
//     // Clamp zoom value
//     const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    
//     const board = boardRef.current.getBoundingClientRect();
//     const centerX = board.width / 2;
//     const centerY = board.height / 2;
    
//     // Calculate the point in canvas coordinates that's at the center of viewport
//     const canvasCenterX = (centerX - panOffset.x) / zoom;
//     const canvasCenterY = (centerY - panOffset.y) / zoom;
    
//     // Calculate new pan offset to keep the same canvas point at center after zoom
//     const newPanX = centerX - canvasCenterX * clampedZoom;
//     const newPanY = centerY - canvasCenterY * clampedZoom;
    
//     setPanOffset({ x: newPanX, y: newPanY });
//     setZoom(clampedZoom);
//   };
  
//   // Highlight newly created note
//   const [highlightedNoteId, setHighlightedNoteId] = useState<number | null>(null);
  
//   const boardRef = useRef<HTMLDivElement>(null);
//   const canvasRef = useRef<HTMLDivElement>(null);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   useEffect(() => {
//     setIsLoaded(true);
//     loadNotes();
//   }, []);

//   // Load notes from API
//   const loadNotes = async () => {
//     try {
//       setIsLoading(true);
//       const data = await notesApi.getAllNotes();
//       setNotes(data.map(note => ({
//         ...note,
//         createdAt: new Date(note.createdAt),
//       })));
//     } catch (error) {
//       console.error("Failed to load notes:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Focus textarea when creating
//   useEffect(() => {
//     if (isCreating && textareaRef.current) {
//       textareaRef.current.focus();
//     }
//   }, [isCreating]);

//   // Generate position at current viewport center
//   const getViewportCenterPosition = () => {
//     if (!boardRef.current) return { x: 100, y: 100 };
//     const board = boardRef.current.getBoundingClientRect();
//     const noteSize = 200;
    
//     // Calculate center of visible viewport, accounting for pan and zoom
//     const centerX = (board.width / 2 - panOffsetRef.current.x) / zoomRef.current - noteSize / 2;
//     const centerY = (board.height / 2 - panOffsetRef.current.y) / zoomRef.current - noteSize / 2;
    
//     // Add some randomness to avoid stacking
//     const randomOffsetX = (Math.random() - 0.5) * 100;
//     const randomOffsetY = (Math.random() - 0.5) * 100;
    
//     return { 
//       x: Math.max(20, centerX + randomOffsetX), 
//       y: Math.max(20, centerY + randomOffsetY) 
//     };
//   };

//   // Create new note
//   const handleCreateNote = async () => {
//     if (!newNote.content.trim()) return;

//     try {
//       const position = getViewportCenterPosition();
//       const noteData: CreateNoteData = {
//         content: newNote.content,
//         color: newNote.color,
//         textColor: newNote.textColor,
//         fontFamily: newNote.fontFamily,
//         fontWeight: newNote.fontWeight,
//         fontSize: newNote.fontSize,
//         x: position.x,
//         y: position.y,
//         rotation: Math.random() * 10 - 5,
//         isLocked: false,
//       };

//       const createdNote = await notesApi.createNote(noteData);
//       const newNoteWithDate = {
//         ...createdNote,
//         createdAt: new Date(createdNote.createdAt),
//       };
      
//       setNotes((prev) => [...prev, newNoteWithDate]);
      
//       // Highlight the newly created note
//       setHighlightedNoteId(createdNote.id);
      
//       // Remove highlight after 3 seconds
//       setTimeout(() => {
//         setHighlightedNoteId(null);
//       }, 3000);
      
//       setNewNote({ 
//         content: "", 
//         color: noteColors[0].bg, 
//         textColor: textColors[0].color,
//         fontFamily: fontFamilies[0].value,
//         fontWeight: fontWeights[1].value,
//         fontSize: fontSizes[1].value,
//       });
//       setIsCreating(false);
//     } catch (error) {
//       console.error("Failed to create note:", error);
//       alert("Không thể tạo ghi chú. Vui lòng thử lại.");
//     }
//   };

//   // Delete note
//   const handleDeleteNote = async (id: number) => {
//     const note = notes.find(n => n.id === id);
//     if (note?.isLocked) return;
    
//     try {
//       await notesApi.deleteNote(id);
//       setNotes((prev) => prev.filter((note) => note.id !== id));
//     } catch (error) {
//       console.error("Failed to delete note:", error);
//       alert("Không thể xóa ghi chú. Vui lòng thử lại.");
//     }
//   };

//   // Lock/unlock note
//   const handleLockNote = async (id: number) => {
//     const note = notes.find(n => n.id === id);
//     if (!note) return;

//     try {
//       const updatedNote = await notesApi.updateNote(id, { isLocked: !note.isLocked });
//       setNotes((prev) => prev.map((n) => 
//         n.id === id ? { ...updatedNote, createdAt: new Date(updatedNote.createdAt) } : n
//       ));
//     } catch (error) {
//       console.error("Failed to lock/unlock note:", error);
//       alert("Không thể cập nhật ghi chú. Vui lòng thử lại.");
//     }
//   };

//   // Handle drag start (mouse)
//   const handleDragStart = (e: React.MouseEvent, noteId: number) => {
//     const note = notes.find(n => n.id === noteId);
//     if (note?.isLocked) return;
    
//     // Clear highlight when starting to drag
//     if (highlightedNoteId === noteId) {
//       setHighlightedNoteId(null);
//     }
    
//     e.preventDefault();
//     e.stopPropagation();
//     const noteElement = e.currentTarget as HTMLElement;
//     const rect = noteElement.getBoundingClientRect();
//     // Account for zoom when calculating offset
//     setDragOffset({
//       x: (e.clientX - rect.left) / zoomRef.current,
//       y: (e.clientY - rect.top) / zoomRef.current,
//     });
//     setDraggingNote(noteId);
//   };

//   // Handle touch start (mobile)
//   const handleTouchStart = (e: React.TouchEvent, noteId: number) => {
//     const note = notes.find(n => n.id === noteId);
//     if (note?.isLocked) return;
    
//     // Check if touch is on action buttons area
//     const target = e.target as HTMLElement;
//     if (target.closest('button')) return;
    
//     // Clear highlight when starting to drag
//     if (highlightedNoteId === noteId) {
//       setHighlightedNoteId(null);
//     }
    
//     const touch = e.touches[0];
//     const noteElement = e.currentTarget as HTMLElement;
//     const rect = noteElement.getBoundingClientRect();
//     // Account for zoom when calculating offset
//     setDragOffset({
//       x: (touch.clientX - rect.left) / zoomRef.current,
//       y: (touch.clientY - rect.top) / zoomRef.current,
//     });
//     setDraggingNote(noteId);
//   };

//   // Use ref to track latest position for saving
//   const latestPositionRef = useRef<{ x: number; y: number } | null>(null);
//   const draggingNoteRef = useRef<number | null>(null);
//   const dragOffsetRef = useRef({ x: 0, y: 0 });

//   // Keep refs in sync with state
//   useEffect(() => {
//     draggingNoteRef.current = draggingNote;
//   }, [draggingNote]);

//   useEffect(() => {
//     dragOffsetRef.current = dragOffset;
//   }, [dragOffset]);

//   // Keep pan offset ref in sync
//   useEffect(() => {
//     panOffsetRef.current = panOffset;
//   }, [panOffset]);

//   useEffect(() => {
//     isPanningRef.current = isPanning;
//   }, [isPanning]);

//   // Keep zoom ref in sync
//   useEffect(() => {
//     zoomRef.current = zoom;
//   }, [zoom]);

//   // Zoom limits
//   const MIN_ZOOM = 0.25;
//   const MAX_ZOOM = 2;
//   const ZOOM_STEP = 0.1;

//   // Handle wheel zoom (desktop)
//   const handleWheel = (e: WheelEvent) => {
//     // Only zoom if not creating note modal
//     if (!boardRef.current) return;
    
//     e.preventDefault();
    
//     const board = boardRef.current.getBoundingClientRect();
//     // Get cursor position relative to board
//     const cursorX = e.clientX - board.left;
//     const cursorY = e.clientY - board.top;
    
//     // Calculate zoom direction
//     const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
//     const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current + delta));
    
//     if (newZoom === zoomRef.current) return;
    
//     // Calculate the point in canvas coordinates under the cursor
//     const canvasX = (cursorX - panOffsetRef.current.x) / zoomRef.current;
//     const canvasY = (cursorY - panOffsetRef.current.y) / zoomRef.current;
    
//     // Calculate new pan offset to keep the same canvas point under cursor after zoom
//     const newPanX = cursorX - canvasX * newZoom;
//     const newPanY = cursorY - canvasY * newZoom;
    
//     panOffsetRef.current = { x: newPanX, y: newPanY };
//     setPanOffset({ x: newPanX, y: newPanY });
//     zoomRef.current = newZoom;
//     setZoom(newZoom);
//   };

//   // Pinch zoom state (mobile)
//   const pinchStartDistanceRef = useRef<number | null>(null);
//   const pinchStartZoomRef = useRef<number>(1);
//   const pinchCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
//   const pinchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
//   const initialPanBeforePinchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

//   // Calculate distance between two touch points
//   const getTouchDistance = (touch1: Touch, touch2: Touch) => {
//     const dx = touch1.clientX - touch2.clientX;
//     const dy = touch1.clientY - touch2.clientY;
//     return Math.sqrt(dx * dx + dy * dy);
//   };

//   // Calculate center point between two touches
//   const getTouchCenter = (touch1: Touch, touch2: Touch) => {
//     return {
//       x: (touch1.clientX + touch2.clientX) / 2,
//       y: (touch1.clientY + touch2.clientY) / 2,
//     };
//   };

//   // Handle touch start for pinch zoom
//   const handlePinchStart = (e: TouchEvent) => {
//     if (e.touches.length === 2 && boardRef.current) {
//       e.preventDefault();
//       // Stop any panning and note dragging
//       isPanningRef.current = false;
//       setIsPanning(false);
      
//       const touch1 = e.touches[0];
//       const touch2 = e.touches[1];
      
//       pinchStartDistanceRef.current = getTouchDistance(touch1, touch2);
//       pinchStartZoomRef.current = zoomRef.current;
      
//       // Check if we have a saved initial pan (from single finger touch that turned into pinch)
//       const hasInitialPan = initialPanBeforePinchRef.current.x !== 0 || 
//                            initialPanBeforePinchRef.current.y !== 0 ||
//                            // Also check if current pan is at origin but we saved origin
//                            (panOffsetRef.current.x !== initialPanBeforePinchRef.current.x || 
//                             panOffsetRef.current.y !== initialPanBeforePinchRef.current.y);
      
//       if (hasInitialPan) {
//         // Restore to the pan position BEFORE any single-finger panning
//         panOffsetRef.current = { ...initialPanBeforePinchRef.current };
//         setPanOffset({ ...initialPanBeforePinchRef.current });
//       }
      
//       pinchStartPanRef.current = { ...panOffsetRef.current };
      
//       const board = boardRef.current.getBoundingClientRect();
//       const center = getTouchCenter(touch1, touch2);
//       pinchCenterRef.current = {
//         x: center.x - board.left,
//         y: center.y - board.top,
//       };
      
//       // Clear the initial pan ref since we've used it
//       initialPanBeforePinchRef.current = { x: 0, y: 0 };
//     }
//   };

//   // Handle touch move for pinch zoom
//   const handlePinchMove = (e: TouchEvent) => {
//     if (e.touches.length === 2 && pinchStartDistanceRef.current !== null && boardRef.current) {
//       e.preventDefault();
//       const touch1 = e.touches[0];
//       const touch2 = e.touches[1];
      
//       const currentDistance = getTouchDistance(touch1, touch2);
//       const scale = currentDistance / pinchStartDistanceRef.current;
//       const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * scale));
      
//       // Calculate the point in canvas coordinates at pinch center using START values
//       const canvasX = (pinchCenterRef.current.x - pinchStartPanRef.current.x) / pinchStartZoomRef.current;
//       const canvasY = (pinchCenterRef.current.y - pinchStartPanRef.current.y) / pinchStartZoomRef.current;
      
//       // Calculate new pan offset to keep the same canvas point at pinch center
//       const newPanX = pinchCenterRef.current.x - canvasX * newZoom;
//       const newPanY = pinchCenterRef.current.y - canvasY * newZoom;
      
//       panOffsetRef.current = { x: newPanX, y: newPanY };
//       setPanOffset({ x: newPanX, y: newPanY });
//       zoomRef.current = newZoom;
//       setZoom(newZoom);
//     }
//   };

//   // Handle touch end for pinch zoom
//   const handlePinchEnd = (e: TouchEvent) => {
//     if (e.touches.length < 2) {
//       pinchStartDistanceRef.current = null;
//     }
//     // Reset initial pan ref when all touches end
//     if (e.touches.length === 0) {
//       initialPanBeforePinchRef.current = { x: 0, y: 0 };
//     }
//   };

//   // Handle pan start (mouse) - on empty board area
//   const handlePanStart = (e: React.MouseEvent) => {
//     // Only pan if clicking on the board itself, not on notes
//     if ((e.target as HTMLElement).closest('.sticky-note')) return;
//     if (draggingNoteRef.current !== null) return;
    
//     e.preventDefault();
//     setIsPanning(true);
//     isPanningRef.current = true;
//     panStartRef.current = {
//       x: e.clientX - panOffsetRef.current.x,
//       y: e.clientY - panOffsetRef.current.y,
//     };
//   };

//   // Handle pan start (touch) - on empty board area
//   const handlePanTouchStart = (e: React.TouchEvent) => {
//     // Only pan with single finger, not during pinch
//     if (e.touches.length !== 1) return;
//     // Only pan if touching on the board itself, not on notes
//     if ((e.target as HTMLElement).closest('.sticky-note')) return;
//     if (draggingNoteRef.current !== null) return;
    
//     // Save initial pan offset BEFORE any panning - for potential pinch zoom later
//     initialPanBeforePinchRef.current = { ...panOffsetRef.current };
    
//     const touch = e.touches[0];
//     setIsPanning(true);
//     isPanningRef.current = true;
//     panStartRef.current = {
//       x: touch.clientX - panOffsetRef.current.x,
//       y: touch.clientY - panOffsetRef.current.y,
//     };
//   };

//   // Handle pan move (mouse)
//   const handlePanMove = (e: MouseEvent) => {
//     if (!isPanningRef.current) return;
    
//     e.preventDefault();
//     const newX = e.clientX - panStartRef.current.x;
//     const newY = e.clientY - panStartRef.current.y;
    
//     panOffsetRef.current = { x: newX, y: newY };
//     setPanOffset({ x: newX, y: newY });
//   };

//   // Handle pan move (touch)
//   const handlePanTouchMove = (e: TouchEvent) => {
//     // Stop panning if pinching (2 fingers)
//     if (e.touches.length !== 1) {
//       isPanningRef.current = false;
//       return;
//     }
//     if (!isPanningRef.current) return;
    
//     e.preventDefault();
//     const touch = e.touches[0];
//     const newX = touch.clientX - panStartRef.current.x;
//     const newY = touch.clientY - panStartRef.current.y;
    
//     panOffsetRef.current = { x: newX, y: newY };
//     setPanOffset({ x: newX, y: newY });
//   };

//   // Handle pan end
//   const handlePanEnd = () => {
//     setIsPanning(false);
//     isPanningRef.current = false;
//   };

//   // Handle drag with useRef for smooth updates (mouse)
//   const handleDrag = (e: MouseEvent) => {
//     if (draggingNoteRef.current === null || !boardRef.current) return;
    
//     e.preventDefault();
//     const board = boardRef.current.getBoundingClientRect();
//     // Account for pan offset and zoom when calculating note position
//     const newX = (e.clientX - board.left - panOffsetRef.current.x) / zoomRef.current - dragOffsetRef.current.x;
//     const newY = (e.clientY - board.top - panOffsetRef.current.y) / zoomRef.current - dragOffsetRef.current.y;
    
//     // Store latest position for saving (no clamping - allow negative values for infinite canvas)
//     latestPositionRef.current = { x: newX, y: newY };
    
//     const noteId = draggingNoteRef.current;
//     // Use requestAnimationFrame for smoother updates
//     requestAnimationFrame(() => {
//       setNotes((prev) => prev.map((note) => 
//         note.id === noteId 
//           ? { ...note, x: newX, y: newY } 
//           : note
//       ));
//     });
//   };

//   // Handle touch move (mobile)
//   const handleTouchMove = (e: TouchEvent) => {
//     if (draggingNoteRef.current === null || !boardRef.current) return;
    
//     e.preventDefault();
//     const touch = e.touches[0];
//     const board = boardRef.current.getBoundingClientRect();
//     // Account for pan offset and zoom when calculating note position
//     const newX = (touch.clientX - board.left - panOffsetRef.current.x) / zoomRef.current - dragOffsetRef.current.x;
//     const newY = (touch.clientY - board.top - panOffsetRef.current.y) / zoomRef.current - dragOffsetRef.current.y;
    
//     // Store latest position for saving (no clamping - allow negative values for infinite canvas)
//     latestPositionRef.current = { x: newX, y: newY };
    
//     const noteId = draggingNoteRef.current;
//     // Use requestAnimationFrame for smoother updates
//     requestAnimationFrame(() => {
//       setNotes((prev) => prev.map((note) => 
//         note.id === noteId 
//           ? { ...note, x: newX, y: newY } 
//           : note
//       ));
//     });
//   };

//   // Handle drag end - save to backend
//   const handleDragEnd = async () => {
//     if (draggingNoteRef.current !== null && latestPositionRef.current) {
//       const noteId = draggingNoteRef.current;
//       const position = { ...latestPositionRef.current };
      
//       // Reset state first
//       setDraggingNote(null);
//       draggingNoteRef.current = null;
//       latestPositionRef.current = null;
      
//       try {
//         // Update position in backend
//         await notesApi.updateNote(noteId, { x: position.x, y: position.y });
//       } catch (error) {
//         console.error("Failed to update note position:", error);
//       }
//     } else {
//       setDraggingNote(null);
//       draggingNoteRef.current = null;
//       latestPositionRef.current = null;
//     }
//   };

//   // Add/remove window event listeners for drag and pan
//   useEffect(() => {
//     // Drag listeners
//     window.addEventListener('mousemove', handleDrag);
//     window.addEventListener('mouseup', handleDragEnd);
//     window.addEventListener('touchmove', handleTouchMove, { passive: false });
//     window.addEventListener('touchend', handleDragEnd);
//     window.addEventListener('touchcancel', handleDragEnd);
    
//     // Pan listeners
//     window.addEventListener('mousemove', handlePanMove);
//     window.addEventListener('mouseup', handlePanEnd);
//     window.addEventListener('touchmove', handlePanTouchMove, { passive: false });
//     window.addEventListener('touchend', handlePanEnd);
//     window.addEventListener('touchcancel', handlePanEnd);
    
//     return () => {
//       window.removeEventListener('mousemove', handleDrag);
//       window.removeEventListener('mouseup', handleDragEnd);
//       window.removeEventListener('touchmove', handleTouchMove);
//       window.removeEventListener('touchend', handleDragEnd);
//       window.removeEventListener('touchcancel', handleDragEnd);
      
//       window.removeEventListener('mousemove', handlePanMove);
//       window.removeEventListener('mouseup', handlePanEnd);
//       window.removeEventListener('touchmove', handlePanTouchMove);
//       window.removeEventListener('touchend', handlePanEnd);
//       window.removeEventListener('touchcancel', handlePanEnd);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Add wheel zoom listener (desktop)
//   useEffect(() => {
//     const board = boardRef.current;
//     if (!board) return;
    
//     board.addEventListener('wheel', handleWheel, { passive: false });
    
//     return () => {
//       board.removeEventListener('wheel', handleWheel);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Add pinch zoom listeners (mobile)
//   useEffect(() => {
//     const board = boardRef.current;
//     if (!board) return;
    
//     board.addEventListener('touchstart', handlePinchStart, { passive: false });
//     board.addEventListener('touchmove', handlePinchMove, { passive: false });
//     board.addEventListener('touchend', handlePinchEnd);
//     board.addEventListener('touchcancel', handlePinchEnd);
    
//     return () => {
//       board.removeEventListener('touchstart', handlePinchStart);
//       board.removeEventListener('touchmove', handlePinchMove);
//       board.removeEventListener('touchend', handlePinchEnd);
//       board.removeEventListener('touchcancel', handlePinchEnd);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Clear all notes
//   const handleClearAll = async () => {
//     if (window.confirm("Bạn có chắc muốn xóa tất cả ghi chú?")) {
//       try {
//         await notesApi.deleteAllNotes();
//         setNotes([]);
//       } catch (error) {
//         console.error("Failed to clear all notes:", error);
//         alert("Không thể xóa tất cả ghi chú. Vui lòng thử lại.");
//       }
//     }
//   };

//   return (
//     <div className="h-screen flex flex-col bg-stone-100 overflow-hidden">
//       {/* Navbar */}
//       <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

//       {/* Board header - fixed */}
//       <div 
//         className={cn(
//           "fixed top-16 left-4 right-4 flex items-center justify-between z-30",
//           "transition-all duration-700",
//           isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
//         )}
//       >
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-xl bg-white shadow-md">
//             <StickyNote className="w-6 h-6 text-amber-500" />
//           </div>
//           <div>
//             <h1 
//               className="text-xl font-bold text-foreground"
//               style={{ fontFamily: "'Outfit', sans-serif" }}
//             >
//               Bảng Ghi Chú
//             </h1>
//             <p className="text-sm text-muted-foreground">
//               {notes.length} ghi chú
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           {/* Reset view button - only show when panned or zoomed */}
//           {(panOffset.x !== 0 || panOffset.y !== 0 || zoom !== 1) && (
//             <button
//               onClick={() => { setPanOffset({ x: 0, y: 0 }); setZoom(1); }}
//               className={cn(
//                 "flex items-center gap-2 px-3 py-2 rounded-xl",
//                 "bg-white/90 text-muted-foreground shadow-md",
//                 "hover:bg-white hover:text-foreground transition-colors duration-200",
//                 "cursor-pointer"
//               )}
//               title="Về vị trí ban đầu"
//             >
//               <RotateCcw className="w-4 h-4" />
//               <span className="hidden sm:inline text-sm">Reset</span>
//             </button>
//           )}
          
//           <button
//             onClick={() => setIsCreating(true)}
//             className={cn(
//               "flex items-center gap-2 px-4 py-2 rounded-xl",
//               "bg-accent text-accent-foreground shadow-md",
//               "hover:bg-accent/90 transition-colors duration-200",
//               "cursor-pointer"
//             )}
//           >
//             <Plus className="w-5 h-5" />
//             <span className="hidden sm:inline text-sm font-medium">Thêm ghi chú</span>
//           </button>
//         </div>
//       </div>

//       {/* Board area */}
//       <div 
//         ref={boardRef}
//         className={cn(
//           "flex-1 relative mt-20",
//           "bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)]",
//           "bg-[size:20px_20px]",
//           "overflow-hidden", // Hide scrollbars - infinite canvas with pan
//           isPanning ? "cursor-grabbing" : "cursor-grab"
//         )}
//         style={{
//           touchAction: 'none', // Prevent browser pinch-to-zoom on this element
//         }}
//         onMouseDown={handlePanStart}
//         onTouchStart={handlePanTouchStart}
//       >
//         {/* Pan indicator - bottom right */}
//         <div className={cn(
//           "absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg",
//           "bg-white/80 backdrop-blur-sm shadow-md text-xs text-muted-foreground",
//           "transition-opacity duration-200",
//           (panOffset.x !== 0 || panOffset.y !== 0 || zoom !== 1) ? "opacity-100" : "opacity-0 pointer-events-none"
//         )}>
//           <Move className="w-3.5 h-3.5" />
//           <span>
//             {Math.round(panOffset.x)}, {Math.round(panOffset.y)} · {Math.round(zoom * 100)}%
//           </span>
//         </div>

//         {/* Zoom controls - bottom left */}
//         <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-sm shadow-md rounded-xl p-1">
//           <button
//             onClick={() => handleZoom(zoom - 0.25)}
//             disabled={zoom <= MIN_ZOOM}
//             className={cn(
//               "p-2 rounded-lg transition-colors cursor-pointer",
//               "hover:bg-secondary active:bg-secondary",
//               "disabled:opacity-50 disabled:cursor-not-allowed"
//             )}
//             title="Thu nhỏ (Scroll down)"
//           >
//             <ZoomOut className="w-4 h-4" />
//           </button>
//           <button
//             onClick={() => { setPanOffset({ x: 0, y: 0 }); setZoom(1); }}
//             className={cn(
//               "px-2 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer",
//               "hover:bg-secondary active:bg-secondary",
//               zoom === 1 && "bg-secondary"
//             )}
//             title="Reset zoom"
//           >
//             {Math.round(zoom * 100)}%
//           </button>
//           <button
//             onClick={() => handleZoom(zoom + 0.25)}
//             disabled={zoom >= MAX_ZOOM}
//             className={cn(
//               "p-2 rounded-lg transition-colors cursor-pointer",
//               "hover:bg-secondary active:bg-secondary",
//               "disabled:opacity-50 disabled:cursor-not-allowed"
//             )}
//             title="Phóng to (Scroll up)"
//           >
//             <ZoomIn className="w-4 h-4" />
//           </button>
//         </div>

//         {/* Inner container - infinite canvas with pan and zoom transform */}
//         <div 
//           ref={canvasRef}
//           className="relative w-full h-full origin-top-left"
//           style={{
//             transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
//             willChange: isPanning ? 'transform' : 'auto',
//           }}
//         >

//         {/* Empty state */}
//         {notes.length === 0 && !isCreating && !isLoading && (
//           <div 
//             className={cn(
//               "fixed inset-0 flex flex-col items-center justify-center pt-32 pointer-events-none",
//               "transition-all duration-700 delay-200",
//               isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
//             )}
//           >
//             <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl text-center max-w-md pointer-events-auto">
//               <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
//                 <Sparkles className="w-10 h-10 text-amber-500" />
//               </div>
//               <h2 
//                 className="text-2xl font-bold text-foreground mb-2"
//                 style={{ fontFamily: "'Outfit', sans-serif" }}
//               >
//                 Bảng trắng của bạn
//               </h2>
//               <p className="text-muted-foreground mb-6">
//                 Bắt đầu dán những ghi chú đầu tiên lên đây nhé!<br />
//                 Ghi chú sẽ được lưu tự động.
//               </p>
//               <button
//                 onClick={() => setIsCreating(true)}
//                 className={cn(
//                   "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
//                   "bg-accent text-accent-foreground font-medium",
//                   "hover:bg-accent/90 transition-colors duration-200",
//                   "cursor-pointer"
//                 )}
//               >
//                 <Plus className="w-5 h-5" />
//                 <span>Tạo ghi chú đầu tiên</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Loading state */}
//         {isLoading && (
//           <div className="fixed inset-0 flex items-center justify-center pt-32">
//             <div className="flex flex-col items-center gap-3">
//               <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
//               <p className="text-sm text-muted-foreground">Đang tải ghi chú...</p>
//             </div>
//           </div>
//         )}

//         {/* Sticky notes */}
//         {notes.map((note, index) => {
//           const isHighlighted = highlightedNoteId === note.id;
//           return (
//           <div
//             key={note.id}
//             className={cn(
//               "sticky-note absolute w-48 min-h-48 p-4 rounded-sm shadow-lg",
//               "hover:shadow-xl hover:z-20",
//               "group",
//               !note.isLocked && "cursor-move",
//               draggingNote === note.id && "z-50 shadow-2xl scale-105 cursor-grabbing",
//               draggingNote !== note.id && "transition-all duration-300",
//               // Highlight effect for newly created note
//               isHighlighted && "z-40 scale-105"
//             )}
//             style={{
//               left: note.x,
//               top: note.y,
//               backgroundColor: note.color,
//               transform: `rotate(${draggingNote === note.id ? 0 : note.rotation}deg)${isHighlighted ? ' scale(1.05)' : ''}`,
//               animationDelay: `${index * 50}ms`,
//               willChange: draggingNote === note.id ? 'left, top' : 'auto',
//               touchAction: 'none',
//               // Glowing border effect for highlighted note
//               boxShadow: isHighlighted 
//                 ? '0 0 0 3px #fbbf24, 0 0 20px 5px rgba(251, 191, 36, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
//                 : undefined,
//             }}
//             onMouseDown={(e) => handleDragStart(e, note.id)}
//             onTouchStart={(e) => handleTouchStart(e, note.id)}
//             onClick={() => isHighlighted && setHighlightedNoteId(null)}
//           >
//             {/* Tape effect */}
//             <div 
//               className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm"
//               style={{ transform: `translateX(-50%) rotate(${-note.rotation}deg)` }}
//             />

//             {/* Lock indicator */}
//             {/* {note.isLocked && (
//               <div className="absolute -top-2 -left-2 p-1.5 rounded-full bg-green-500 text-white shadow-md z-10">
//                 <Lock className="w-3 h-3" />
//               </div>
//             )} */}

//             {/* Action buttons */}
//             <div className={cn(
//               "absolute -top-2 -right-2 flex gap-1",
//               "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
//             )}>
//               {/* Lock/Unlock button */}
//               {!note.isLocked && (<button
//                 onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleLockNote(note.id); }}
//                 onTouchStart={(e) => { e.stopPropagation(); }}
//                 onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleLockNote(note.id); }}
//                 className={cn(
//                   "p-1.5 rounded-full shadow-md cursor-pointer z-10",
//                   "bg-white/90 text-gray-500 hover:bg-green-100 hover:text-green-600",
//                   "active:bg-green-100 active:text-green-600"
//                 )}
//                 aria-label="Lock note"
//                 title="Khóa ghi chú"
//               >
//                 <Check className="w-3.5 h-3.5" />
//               </button>)}
//               {/* Delete button - only show if not locked */}
//               {!note.isLocked && (
//                 <button
//                   onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteNote(note.id); }}
//                   onTouchStart={(e) => { e.stopPropagation(); }}
//                   onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteNote(note.id); }}
//                   className={cn(
//                     "p-1.5 rounded-full",
//                     "bg-white/90 text-gray-500 shadow-md",
//                     "hover:bg-red-100 hover:text-red-600",
//                     "active:bg-red-100 active:text-red-600",
//                     "cursor-pointer z-10"
//                   )}
//                   aria-label="Delete note"
//                   title="Xóa ghi chú"
//                 >
//                   <X className="w-3.5 h-3.5" />
//                 </button>
//               )}
//             </div>

//             {/* Note content */}
//             <p 
//               className="text-sm leading-relaxed whitespace-pre-wrap break-words select-none"
//               style={{ 
//                 color: note.textColor,
//                 fontFamily: note.fontFamily,
//                 fontWeight: note.fontWeight,
//                 fontSize: note.fontSize,
//               }}
//             >
//               {note.content}
//             </p>

//             {/* Bottom fold effect */}
//             <div 
//               className="absolute bottom-0 right-0 w-6 h-6"
//               style={{
//                 background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)`,
//               }}
//             />
//           </div>
//         );
//         })}
//         </div>
//       </div>

//       {/* Create note modal */}
//       {isCreating && (
//         <div 
//           className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-4"
//           onClick={() => setIsCreating(false)}
//         >
//           <div 
//             className={cn(
//               "bg-white flex flex-col",
//               "h-full w-full md:h-auto md:w-full md:max-w-md md:max-h-[90vh]",
//               "md:rounded-3xl md:shadow-2xl md:animate-fade-in-up",
//               "overflow-hidden"
//             )}
//             onClick={(e) => e.stopPropagation()}
//           >
//             {/* Header */}
//             <div className="flex items-center justify-between p-4 md:p-4 border-b border-border bg-white sticky top-0 z-10">
//               <h3 
//                 className="text-lg md:text-lg font-semibold text-foreground"
//                 style={{ fontFamily: "'Outfit', sans-serif" }}
//               >
//                 Tạo ghi chú mới
//               </h3>
//               <button
//                 onClick={() => setIsCreating(false)}
//                 className="p-2 rounded-lg text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors cursor-pointer"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Content - Scrollable */}
//             <div className="flex-1 overflow-y-auto p-4 md:p-4 space-y-4">
//               {/* Preview */}
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
//                   <StickyNote className="w-4 h-4" />
//                   Nội dung
//                 </label>
//                 <div 
//                   className="relative p-4 rounded-sm shadow-md"
//                   style={{ backgroundColor: newNote.color }}
//                 >
//                   {/* Tape effect */}
//                   <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm" />
                  
//                   <textarea
//                     ref={textareaRef}
//                     value={newNote.content}
//                     onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
//                     placeholder="Viết gì đó..."
//                     className={cn(
//                       "w-full h-32 md:h-32 bg-transparent resize-none leading-relaxed",
//                       "placeholder:text-gray-400 focus:outline-none",
//                       "text-base" // Minimum 16px to prevent iOS auto-zoom
//                     )}
//                     style={{ 
//                       color: newNote.textColor,
//                       fontFamily: newNote.fontFamily,
//                       fontWeight: newNote.fontWeight,
//                       // Use at least 16px on mobile to prevent iOS zoom, respect user choice on desktop
//                       fontSize: window.innerWidth < 768 ? Math.max(16, parseInt(newNote.fontSize)) + 'px' : newNote.fontSize,
//                     }}
//                     maxLength={200}
//                   />

//                   {/* Character count */}
//                   <div className="absolute bottom-2 right-2 text-xs text-gray-400">
//                     {newNote.content.length}/200
//                   </div>
//                 </div>
//               </div>

//               {/* Color picker - Always visible */}
//               <div>
//                 <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
//                   <Palette className="w-4 h-4" />
//                   Màu giấy
//                 </label>
//                 <div className="flex flex-wrap gap-2">
//                   {noteColors.map((color) => (
//                     <button
//                       key={color.bg}
//                       onClick={() => setNewNote({ ...newNote, color: color.bg })}
//                       className={cn(
//                         "w-10 h-10 md:w-8 md:h-8 rounded-lg transition-all duration-200 cursor-pointer",
//                         "active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
//                         newNote.color === color.bg && "ring-2 ring-foreground ring-offset-2 scale-110"
//                       )}
//                       style={{ backgroundColor: color.bg }}
//                       aria-label={color.name}
//                       title={color.name}
//                     />
//                   ))}
//                 </div>
//               </div>

//               {/* Advanced Options Toggle - Mobile only */}
//               <button
//                 onClick={() => setShowAdvanced(!showAdvanced)}
//                 className={cn(
//                   "w-full flex items-center justify-between p-3 rounded-xl",
//                   "bg-secondary/50 hover:bg-secondary active:bg-secondary transition-colors",
//                   "md:hidden cursor-pointer"
//                 )}
//               >
//                 <span className="text-sm font-medium text-foreground">
//                   Tùy chọn nâng cao
//                 </span>
//                 <ChevronDown 
//                   className={cn(
//                     "w-4 h-4 text-muted-foreground transition-transform duration-200",
//                     showAdvanced && "rotate-180"
//                   )} 
//                 />
//               </button>

//               {/* Advanced options - Hidden on mobile by default, always visible on desktop */}
//               <div className={cn(
//                 "space-y-4",
//                 "md:block", // Always show on desktop
//                 showAdvanced ? "block" : "hidden" // Toggle on mobile
//               )}>
//                 {/* Text color picker */}
//                 <div>
//                   <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
//                     <Type className="w-4 h-4" />
//                     Màu chữ
//                   </label>
//                   <div className="flex flex-wrap gap-2">
//                     {textColors.map((color) => (
//                       <button
//                         key={color.color}
//                         onClick={() => setNewNote({ ...newNote, textColor: color.color })}
//                         className={cn(
//                           "w-10 h-10 md:w-8 md:h-8 rounded-lg transition-all duration-200 cursor-pointer",
//                           "active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
//                           "flex items-center justify-center text-white text-xs font-bold",
//                           newNote.textColor === color.color && "ring-2 ring-foreground ring-offset-2 scale-110"
//                         )}
//                         style={{ backgroundColor: color.color }}
//                         aria-label={color.name}
//                         title={color.name}
//                       >
//                         A
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Font family picker */}
//                 <div>
//                   <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
//                     <Type className="w-4 h-4" />
//                     Kiểu chữ
//                   </label>
//                   <div className="flex flex-wrap gap-2">
//                     {fontFamilies.map((font) => (
//                       <button
//                         key={font.value}
//                         onClick={() => setNewNote({ ...newNote, fontFamily: font.value })}
//                         className={cn(
//                           "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
//                           "active:bg-secondary focus:outline-none",
//                           "text-sm border border-border",
//                           newNote.fontFamily === font.value && "ring-2 ring-foreground bg-secondary"
//                         )}
//                         style={{ fontFamily: font.value }}
//                         title={font.name}
//                       >
//                         {font.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Font weight picker */}
//                 <div>
//                   <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
//                     <Type className="w-4 h-4" />
//                     Độ đậm
//                   </label>
//                   <div className="flex flex-wrap gap-2">
//                     {fontWeights.map((weight) => (
//                       <button
//                         key={weight.value}
//                         onClick={() => setNewNote({ ...newNote, fontWeight: weight.value })}
//                         className={cn(
//                           "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
//                           "active:bg-secondary focus:outline-none",
//                           "text-sm border border-border",
//                           newNote.fontWeight === weight.value && "ring-2 ring-foreground bg-secondary"
//                         )}
//                         style={{ fontWeight: weight.value }}
//                         title={weight.name}
//                       >
//                         {weight.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Font size picker */}
//                 <div>
//                   <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
//                     <Type className="w-4 h-4" />
//                     Cỡ chữ
//                   </label>
//                   <div className="flex flex-wrap gap-2">
//                     {fontSizes.map((size) => (
//                       <button
//                         key={size.value}
//                         onClick={() => setNewNote({ ...newNote, fontSize: size.value })}
//                         className={cn(
//                           "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
//                           "active:bg-secondary focus:outline-none",
//                           "text-sm border border-border",
//                           newNote.fontSize === size.value && "ring-2 ring-foreground bg-secondary"
//                         )}
//                         title={size.name}
//                       >
//                         {size.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Actions - Fixed bottom on mobile, static on desktop */}
//             <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t border-border bg-white/95 backdrop-blur-sm">
//               <button
//                 onClick={() => setIsCreating(false)}
//                 className={cn(
//                   "flex-1 md:flex-none px-4 py-3 md:py-2 rounded-xl text-sm font-medium",
//                   "text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors",
//                   "cursor-pointer"
//                 )}
//               >
//                 Hủy
//               </button>
//               <button
//                 onClick={handleCreateNote}
//                 disabled={!newNote.content.trim()}
//                 className={cn(
//                   "flex-1 md:flex-none px-6 py-3 md:py-2 rounded-xl text-sm font-medium",
//                   "bg-accent text-accent-foreground",
//                   "hover:bg-accent/90 active:bg-accent/90 transition-colors",
//                   "disabled:opacity-50 disabled:cursor-not-allowed",
//                   "cursor-pointer"
//                 )}
//               >
//                 Dán lên bảng
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
