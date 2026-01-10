import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import {
  Plus,
  X,
  Palette,
  Type,
  StickyNote,
  Sparkles,
  Check,
  Loader2,
  Move,
  RotateCcw,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  Edit3,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { renderTextWithLinks } from "@/lib/renderTextWithLinks";
import { useZoom, MIN_ZOOM, MAX_ZOOM } from "@/hooks/useZoom";
import { usePinchZoom } from "@/hooks/usePinchZoom";
import { usePan } from "@/hooks/usePan";
import { useNoteDrag } from "@/hooks/useNoteDrag";
import { useNoteManagement } from "@/hooks/useNoteManagement";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/hooks/useConfirm";
import {
  noteColors,
  textColors,
  fontFamilies,
  fontWeights,
  fontSizes,
} from "@/constants/noteStyles";
import { EditNoteModal } from "@/components/board/EditNoteModal";
import { OverlappingNotesOverlay } from "@/components/board/OverlappingNotesOverlay";
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
  const [overlayPosition, setOverlayPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

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
    reorderNotes,
  } = useNoteManagement({ zoomRef, panOffsetRef, boardRef });

  // Auth context for admin check
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const confirm = useConfirm();

  const {
    handleDragStart: handleNoteDragStart,
    handleTouchStart: handleNoteTouchStart,
    draggingNoteId,
  } = useNoteDrag({
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
    const note = notes.find((n) => n.id === noteId);
    // Allow admin to drag locked notes
    if (note?.isLocked && !isAdmin) return;

    clearHighlight(noteId);
    handleNoteDragStart(noteId, e);
  };

  // Handle touch start (mobile)
  const handleTouchStart = (e: React.TouchEvent, noteId: number) => {
    const note = notes.find((n) => n.id === noteId);
    // Allow admin to drag locked notes
    if (note?.isLocked && !isAdmin) return;

    // Check if touch is on action buttons area
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    clearHighlight(noteId);
    handleNoteTouchStart(noteId, e);
  };

  // Find notes that overlap with a given note (bounding box intersection)
  const findOverlappingNotes = (targetNote: Note): Note[] => {
    const NOTE_WIDTH = 192; // w-48 = 12rem = 192px
    const NOTE_HEIGHT = 192; // min-h-48

    // Target note bounding box
    const targetLeft = targetNote.x;
    const targetTop = targetNote.y;
    const targetRight = targetLeft + NOTE_WIDTH;
    const targetBottom = targetTop + NOTE_HEIGHT;

    return notes.filter((note) => {
      const noteLeft = note.x;
      const noteTop = note.y;
      const noteRight = noteLeft + NOTE_WIDTH;
      const noteBottom = noteTop + NOTE_HEIGHT;

      // Check if two rectangles intersect
      return (
        targetLeft < noteRight &&
        targetRight > noteLeft &&
        targetTop < noteBottom &&
        targetBottom > noteTop
      );
    });
  };

  // Show overlapping notes for a specific note
  const showOverlappingNotes = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    e.preventDefault();

    // Find all notes that intersect with this note's bounding box
    const overlapping = findOverlappingNotes(note);

    // Only show overlay if there are multiple overlapping notes
    if (overlapping.length > 1) {
      setOverlappingNotes(overlapping);
      setOverlayPosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle selecting a note from overlay
  const handleSelectFromOverlay = (note: Note) => {
    // Move selected note to the beginning of array (top of stack, since z-index = notes.length - index)
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== note.id);
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
    <div className="h-screen flex flex-col bg-stone-100 overflow-hidden">
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
              onClick={() => {
                setPanOffset({ x: 0, y: 0 });
                setZoom(1);
              }}
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
            <span className="hidden sm:inline text-sm font-medium">
              Thêm ghi chú
            </span>
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
          touchAction: "none", // Prevent browser pinch-to-zoom on this element
        }}
        onMouseDown={handlePanStart}
      >
        {/* Pan indicator - bottom right */}
        <div
          className={cn(
            "absolute bottom-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-lg",
            "bg-white/80 backdrop-blur-sm shadow-md text-xs text-muted-foreground",
            "transition-opacity duration-200",
            panOffset.x !== 0 || panOffset.y !== 0 || zoom !== 1
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          )}
        >
          <Move className="w-3.5 h-3.5" />
          <span>
            {Math.round(panOffset.x)}, {Math.round(panOffset.y)} ·{" "}
            {Math.round(zoom * 100)}%
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
            onClick={() => {
              setPanOffset({ x: 0, y: 0 });
              setZoom(1);
            }}
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
            willChange: isPanning ? "transform" : "auto",
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
                  Bắt đầu dán những ghi chú đầu tiên lên đây nhé!
                  <br />
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
                <p className="text-sm text-muted-foreground">
                  Đang tải ghi chú...
                </p>
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
                  // Admin can move locked notes, regular users cannot
                  (!note.isLocked || isAdmin) && "cursor-move",
                  // Dragging state - disable transition and boost shadow
                  draggingNoteId === note.id &&
                    "shadow-2xl scale-105 cursor-grabbing",
                  // Only apply transition when NOT dragging this note
                  draggingNoteId !== note.id && "transition-all duration-300",
                  // Highlight effect for newly created note
                  isHighlighted && "scale-105"
                )}
                style={{
                  left: note.x,
                  top: note.y,
                  backgroundColor: note.color,
                  transform: `rotate(${
                    draggingNoteId === note.id ? 0 : note.rotation
                  }deg)${isHighlighted ? " scale(1.05)" : ""}`,
                  animationDelay: `${index * 50}ms`,
                  touchAction: "none",
                  willChange: draggingNoteId === note.id ? "left, top" : "auto",
                  // z-index based on creation time - newer notes (start of array from API) appear on top
                  zIndex:
                    draggingNoteId === note.id
                      ? 50
                      : isHighlighted
                      ? 40
                      : notes.length - index,
                  // Glowing border effect for highlighted note
                  boxShadow: isHighlighted
                    ? "0 0 0 3px #fbbf24, 0 0 20px 5px rgba(251, 191, 36, 0.5), 0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                    : undefined,
                }}
                onMouseDown={(e) => handleDragStart(e, note.id)}
                onTouchStart={(e) => handleTouchStart(e, note.id)}
              >
                {/* Tape effect */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm"
                  style={{
                    transform: `translateX(-50%) rotate(${-note.rotation}deg)`,
                  }}
                />

                {/* Action buttons */}
                <div
                  className={cn(
                    "absolute -top-2 -right-2 flex gap-1",
                    "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200"
                  )}
                >
                  {/* Layers button - show overlapping notes */}
                  <button
                    onClick={(e) => showOverlappingNotes(e, note)}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const overlapping = findOverlappingNotes(note);
                      if (overlapping.length > 1) {
                        setOverlappingNotes(overlapping);
                        setOverlayPosition({
                          x: e.changedTouches[0].clientX,
                          y: e.changedTouches[0].clientY,
                        });
                      }
                    }}
                    className={cn(
                      "p-1.5 rounded-full shadow-md cursor-pointer z-10",
                      "bg-white/90 text-gray-500 hover:bg-amber-100 hover:text-amber-600",
                      "active:bg-amber-100 active:text-amber-600"
                    )}
                    aria-label="Show overlapping notes"
                    title="Chọn ghi chú chồng chéo"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>
                  {/* Edit button - show for locked notes */}
                  {note.isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingNote(note);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setEditingNote(note);
                      }}
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
                  {!note.isLocked && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleLockNote(note.id);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                      }}
                      onTouchEnd={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleLockNote(note.id);
                      }}
                      className={cn(
                        "p-1.5 rounded-full shadow-md cursor-pointer z-10",
                        "bg-white/90 text-gray-500 hover:bg-green-100 hover:text-green-600",
                        "active:bg-green-100 active:text-green-600"
                      )}
                      aria-label="Lock note"
                      title="Khóa ghi chú"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Delete button - show for unlocked notes OR admin */}
                  {(!note.isLocked || isAdmin) && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const confirmed = await confirm({
                          title: "Xóa ghi chú",
                          message: "Bạn có chắc muốn xóa ghi chú này?",
                          confirmText: "Xóa",
                          cancelText: "Hủy",
                          type: "danger",
                        });
                        if (confirmed) {
                          handleDeleteNote(note.id, isAdmin);
                        }
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                      }}
                      onTouchEnd={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const confirmed = await confirm({
                          title: "Xóa ghi chú",
                          message: "Bạn có chắc muốn xóa ghi chú này?",
                          confirmText: "Xóa",
                          cancelText: "Hủy",
                          type: "danger",
                        });
                        if (confirmed) {
                          handleDeleteNote(note.id, isAdmin);
                        }
                      }}
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
                    {renderTextWithLinks(note.content)}
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
                      {renderTextWithLinks(segment.content)}
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
        <OverlappingNotesOverlay
          notes={overlappingNotes}
          isAdmin={isAdmin}
          onClose={closeOverlay}
          onSelect={handleSelectFromOverlay}
          onReorder={reorderNotes}
          onDelete={async (noteId) => {
            const confirmed = await confirm({
              title: "Xóa ghi chú",
              message: "Bạn có chắc muốn xóa ghi chú này?",
              confirmText: "Xóa",
              cancelText: "Hủy",
              type: "danger",
            });
            if (confirmed) {
              handleDeleteNote(noteId, true);
              // If only one note left, close overlay
              if (overlappingNotes.length <= 2) {
                closeOverlay();
              }
            }
          }}
        />
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
                    onChange={(e) =>
                      setNewNote({ ...newNote, content: e.target.value })
                    }
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
                      fontSize:
                        window.innerWidth < 768
                          ? Math.max(16, parseInt(newNote.fontSize)) + "px"
                          : newNote.fontSize,
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
                      onClick={() =>
                        setNewNote({ ...newNote, color: color.bg })
                      }
                      className={cn(
                        "w-10 h-10 md:w-8 md:h-8 rounded-lg transition-all duration-200 cursor-pointer",
                        "active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                        newNote.color === color.bg &&
                          "ring-2 ring-foreground ring-offset-2 scale-110"
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
              <div
                className={cn(
                  "space-y-4",
                  "md:block", // Always show on desktop
                  showAdvanced ? "block" : "hidden" // Toggle on mobile
                )}
              >
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
                        onClick={() =>
                          setNewNote({ ...newNote, textColor: color.color })
                        }
                        className={cn(
                          "w-10 h-10 md:w-8 md:h-8 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                          "flex items-center justify-center text-white text-xs font-bold",
                          newNote.textColor === color.color &&
                            "ring-2 ring-foreground ring-offset-2 scale-110"
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
                        onClick={() =>
                          setNewNote({ ...newNote, fontFamily: font.value })
                        }
                        className={cn(
                          "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:bg-secondary focus:outline-none",
                          "text-sm border border-border",
                          newNote.fontFamily === font.value &&
                            "ring-2 ring-foreground bg-secondary"
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
                        onClick={() =>
                          setNewNote({ ...newNote, fontWeight: weight.value })
                        }
                        className={cn(
                          "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:bg-secondary focus:outline-none",
                          "text-sm border border-border",
                          newNote.fontWeight === weight.value &&
                            "ring-2 ring-foreground bg-secondary"
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
                        onClick={() =>
                          setNewNote({ ...newNote, fontSize: size.value })
                        }
                        className={cn(
                          "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                          "active:bg-secondary focus:outline-none",
                          "text-sm border border-border",
                          newNote.fontSize === size.value &&
                            "ring-2 ring-foreground bg-secondary"
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
