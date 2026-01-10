import { useState, useRef, useCallback } from "react";
import { X, Check, GripVertical, Save, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderTextWithLinks } from "@/lib/renderTextWithLinks";
import type { Note } from "@/types/note";

interface OverlappingNotesOverlayProps {
  notes: Note[];
  isAdmin: boolean;
  onClose: () => void;
  onSelect: (note: Note) => void;
  onReorder: (noteIds: number[]) => Promise<void>;
  onDelete?: (noteId: number) => Promise<void>;
}

export function OverlappingNotesOverlay({
  notes,
  isAdmin,
  onClose,
  onSelect,
  onReorder,
  onDelete,
}: OverlappingNotesOverlayProps) {
  const [orderedNotes, setOrderedNotes] = useState<Note[]>([...notes]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  // For touch drag
  const touchStartY = useRef<number>(0);
  const touchCurrentIndex = useRef<number | null>(null);

  // Check if order has changed
  const hasChanges = orderedNotes.some(
    (note, index) => note.id !== notes[index]?.id
  );

  // Handle drag start (desktop)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isAdmin) return;

    setDraggedIndex(index);
    dragNodeRef.current = e.currentTarget as HTMLDivElement;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());

    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = "0.5";
      }
    }, 0);
  };

  const handleDragEnd = () => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = "1";
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragNodeRef.current = null;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Swap items instead of insert
    const newOrder = [...orderedNotes];
    const temp = newOrder[draggedIndex];
    newOrder[draggedIndex] = newOrder[dropIndex];
    newOrder[dropIndex] = temp;
    setOrderedNotes(newOrder);

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Touch handlers for mobile drag
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, index: number) => {
      if (!isAdmin) return;

      touchStartY.current = e.touches[0].clientY;
      touchCurrentIndex.current = index;
      setDraggedIndex(index);
    },
    [isAdmin]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isAdmin || touchCurrentIndex.current === null) return;

      const touch = e.touches[0];
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);

      for (const el of elements) {
        const noteEl = el.closest("[data-note-index]");
        if (noteEl) {
          const index = parseInt(
            noteEl.getAttribute("data-note-index") || "-1"
          );
          if (index !== -1 && index !== touchCurrentIndex.current) {
            setDragOverIndex(index);
          }
          break;
        }
      }
    },
    [isAdmin]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isAdmin || touchCurrentIndex.current === null) return;

    if (dragOverIndex !== null && dragOverIndex !== touchCurrentIndex.current) {
      // Swap items instead of insert
      const newOrder = [...orderedNotes];
      const temp = newOrder[touchCurrentIndex.current];
      newOrder[touchCurrentIndex.current] = newOrder[dragOverIndex];
      newOrder[dragOverIndex] = temp;
      setOrderedNotes(newOrder);
    }

    touchCurrentIndex.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [isAdmin, dragOverIndex, orderedNotes]);

  // Save order
  const handleSave = async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      const noteIds = orderedNotes.map((n) => n.id);
      await onReorder(noteIds);
      onClose();
    } catch (error) {
      console.error("Failed to save order:", error);
      alert("Không thể lưu thứ tự. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle note click - for non-admin or when not dragging
  const handleNoteClick = (note: Note) => {
    if (!isAdmin) {
      onSelect(note);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-md"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2
            className="text-xl md:text-2xl font-bold text-white mb-1"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {orderedNotes.length} ghi chú chồng chéo
          </h2>
          <p className="text-sm text-slate-400">
            {isAdmin
              ? "Kéo thả để sắp xếp thứ tự hiển thị, hoặc nhấn để đưa lên trên"
              : "Chọn một ghi chú để đưa lên trên cùng"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save button for admin */}
          {isAdmin && hasChanges && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl",
                "bg-green-500 text-white font-medium",
                "hover:bg-green-600 transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "cursor-pointer"
              )}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Lưu thứ tự</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "p-3 rounded-xl bg-white/10 text-white",
              "hover:bg-white/20 transition-colors duration-200",
              "cursor-pointer"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="absolute top-24 bottom-16 left-0 right-0 px-4 md:px-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto" onClick={(e) => e.stopPropagation()}>
          {/* Layer order hint for admin */}
          {isAdmin && (
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
              <span className="px-2 py-1 bg-slate-700 rounded">1</span>
              <span>= Trên cùng</span>
              <span className="mx-2">→</span>
              <span className="px-2 py-1 bg-slate-700 rounded">
                {orderedNotes.length}
              </span>
              <span>= Dưới cùng</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {orderedNotes.map((note, idx) => (
              <div
                key={note.id}
                data-note-index={idx}
                draggable={isAdmin}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onTouchStart={(e) => handleTouchStart(e, idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNoteClick(note);
                }}
                className={cn(
                  "group relative w-full min-h-[200px] p-4 rounded-lg shadow-xl text-left",
                  "transition-all duration-300 ease-out",
                  !isAdmin &&
                    "hover:scale-105 hover:-rotate-1 hover:shadow-2xl",
                  !isAdmin && "active:scale-100 active:rotate-0",
                  "cursor-pointer",
                  "ring-2 ring-transparent",
                  !isAdmin && "hover:ring-amber-400/50",
                  // Drag states for admin
                  isAdmin && draggedIndex === idx && "opacity-50 scale-95",
                  isAdmin &&
                    dragOverIndex === idx &&
                    "ring-2 ring-purple-400 scale-105"
                )}
                style={{
                  backgroundColor: note.color,
                  transform: !isAdmin
                    ? `rotate(${note.rotation * 0.5}deg)`
                    : undefined,
                }}
              >
                {/* Drag handle for admin */}
                {isAdmin && (
                  <div className="absolute top-2 left-2 p-1 rounded bg-black/20 text-white/80 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                )}

                {/* Tape effect */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm shadow-sm"
                  style={{
                    transform: `translateX(-50%) rotate(${
                      -note.rotation * 0.5
                    }deg)`,
                  }}
                />

                {/* Badge number - indicates layer order */}
                <span
                  className={cn(
                    "absolute -top-2 -right-2 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-lg",
                    isAdmin ? "bg-purple-600" : "bg-slate-900"
                  )}
                  title={
                    isAdmin
                      ? `Lớp ${idx + 1} (${
                          idx === 0
                            ? "trên cùng"
                            : idx === orderedNotes.length - 1
                            ? "dưới cùng"
                            : ""
                        })`
                      : undefined
                  }
                >
                  {idx + 1}
                </span>

                {/* Content */}
                <div
                  className={cn(
                    "text-sm leading-relaxed whitespace-pre-wrap break-words line-clamp-6",
                    isAdmin && "ml-6" // Make room for drag handle
                  )}
                  style={{
                    color: note.textColor,
                    fontFamily: note.fontFamily,
                    fontWeight: note.fontWeight,
                    fontSize: note.fontSize,
                  }}
                >
                  {renderTextWithLinks(note.content)}
                </div>

                {/* Locked indicator */}
                {note.isLocked && (
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full shadow-sm">
                    <Check className="w-3 h-3" />
                    Đã khóa
                  </span>
                )}

                {/* Delete button for admin */}
                {isAdmin && onDelete && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onDelete(note.id);
                      setOrderedNotes((prev) =>
                        prev.filter((n) => n.id !== note.id)
                      );
                    }}
                    className={cn(
                      "absolute bottom-2 left-2 p-2 rounded-full",
                      "bg-red-500 text-white shadow-lg",
                      "hover:bg-red-600 transition-colors",
                      "opacity-0 group-hover:opacity-100",
                      "cursor-pointer"
                    )}
                    title="Xóa ghi chú"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Hover overlay - only for non-admin */}
                {!isAdmin && (
                  <div
                    className={cn(
                      "absolute inset-0 rounded-lg bg-amber-500/0 group-hover:bg-amber-500/10",
                      "transition-colors duration-200",
                      "flex items-center justify-center opacity-0 group-hover:opacity-100"
                    )}
                  >
                    <span className="px-4 py-2 rounded-full bg-slate-900/90 text-white text-sm font-medium shadow-lg">
                      Chọn ghi chú này
                    </span>
                  </div>
                )}

                {/* Bottom fold effect */}
                <div
                  className="absolute bottom-0 right-0 w-6 h-6"
                  style={{
                    background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-slate-500">
          {isAdmin && hasChanges
            ? "Nhấn 'Lưu thứ tự' để lưu thay đổi"
            : "Nhấn vào bất kỳ đâu bên ngoài để đóng"}
        </p>
      </div>
    </div>
  );
}
