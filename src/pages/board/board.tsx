import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Plus, X, Palette, Type, Trash2, StickyNote, Sparkles, Lock, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Note type
interface Note {
  id: string;
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
  createdAt: Date;
}

// Predefined note colors (pastel sticky note colors)
const noteColors = [
  { bg: "#FEF3C7", name: "Yellow" },      // Warm yellow
  { bg: "#FECACA", name: "Pink" },        // Soft pink
  { bg: "#BBF7D0", name: "Green" },       // Mint green
  { bg: "#BFDBFE", name: "Blue" },        // Sky blue
  { bg: "#DDD6FE", name: "Purple" },      // Lavender
  { bg: "#FED7AA", name: "Orange" },      // Peach
  { bg: "#FBCFE8", name: "Rose" },        // Rose
  { bg: "#A5F3FC", name: "Cyan" },        // Cyan
];

// Text colors
const textColors = [
  { color: "#1F2937", name: "Dark" },     // Gray 800
  { color: "#7C2D12", name: "Brown" },    // Orange 900
  { color: "#1E3A8A", name: "Navy" },     // Blue 900
  { color: "#14532D", name: "Forest" },   // Green 900
  { color: "#581C87", name: "Purple" },   // Purple 900
  { color: "#9F1239", name: "Wine" },     // Rose 900
];

// Font families
const fontFamilies = [
  { value: "'Work Sans', sans-serif", name: "Work Sans" },
  { value: "'Outfit', sans-serif", name: "Outfit" },
  { value: "serif", name: "Serif" },
  { value: "monospace", name: "Mono" },
  { value: "cursive", name: "Cursive" },
];

// Font weights
const fontWeights = [
  { value: "300", name: "Light" },
  { value: "400", name: "Normal" },
  { value: "500", name: "Medium" },
  { value: "600", name: "Semi Bold" },
  { value: "700", name: "Bold" },
];

// Font sizes
const fontSizes = [
  { value: "12px", name: "XS" },
  { value: "14px", name: "S" },
  { value: "16px", name: "M" },
  { value: "18px", name: "L" },
  { value: "20px", name: "XL" },
];

export function BoardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [notes, setNotes] = useState<Note[]>(() => {
    // Load notes from localStorage
    const saved = localStorage.getItem("sticky-notes");
    return saved ? JSON.parse(saved) : [];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({
    content: "",
    color: noteColors[0].bg,
    textColor: textColors[0].color,
    fontFamily: fontFamilies[0].value,
    fontWeight: fontWeights[1].value,
    fontSize: fontSizes[1].value,
  });
  const [draggingNote, setDraggingNote] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem("sticky-notes", JSON.stringify(notes));
  }, [notes]);

  // Focus textarea when creating
  useEffect(() => {
    if (isCreating && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isCreating]);

  // Generate random position on board
  const getRandomPosition = () => {
    if (!boardRef.current) return { x: 100, y: 100 };
    const board = boardRef.current.getBoundingClientRect();
    const noteSize = 200;
    const padding = 100;
    
    // Random position within board bounds
    const x = padding + Math.random() * (board.width - noteSize - padding * 2);
    const y = padding + Math.random() * (board.height - noteSize - padding * 2);
    
    return { x: Math.max(50, x), y: Math.max(50, y) };
  };

  // Create new note
  const handleCreateNote = () => {
    if (!newNote.content.trim()) return;

    const position = getRandomPosition();
    const note: Note = {
      id: Date.now().toString(),
      content: newNote.content,
      color: newNote.color,
      textColor: newNote.textColor,
      fontFamily: newNote.fontFamily,
      fontWeight: newNote.fontWeight,
      fontSize: newNote.fontSize,
      x: position.x,
      y: position.y,
      rotation: Math.random() * 10 - 5, // Random rotation between -5 and 5 degrees
      isLocked: false,
      createdAt: new Date(),
    };

    setNotes((prev) => [...prev, note]);
    setNewNote({ 
      content: "", 
      color: noteColors[0].bg, 
      textColor: textColors[0].color,
      fontFamily: fontFamilies[0].value,
      fontWeight: fontWeights[1].value,
      fontSize: fontSizes[1].value,
    });
    setIsCreating(false);
  };

  // Delete note
  const handleDeleteNote = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note?.isLocked) return;
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  // Lock/unlock note
  const handleLockNote = (id: string) => {
    setNotes((prev) => prev.map((note) => 
      note.id === id ? { ...note, isLocked: !note.isLocked } : note
    ));
  };

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note?.isLocked) return;
    
    e.preventDefault();
    const noteElement = e.currentTarget as HTMLElement;
    const rect = noteElement.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingNote(noteId);
  };

  // Handle drag with useRef for smooth updates
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggingNote || !boardRef.current) return;
    
    e.preventDefault();
    const board = boardRef.current.getBoundingClientRect();
    const newX = e.clientX - board.left - dragOffset.x;
    const newY = e.clientY - board.top - dragOffset.y;
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setNotes((prev) => prev.map((note) => 
        note.id === draggingNote 
          ? { ...note, x: Math.max(0, newX), y: Math.max(0, newY) } 
          : note
      ));
    });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggingNote(null);
  };

  // Clear all notes
  const handleClearAll = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả ghi chú?")) {
      setNotes([]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-stone-100 overflow-hidden">
      {/* Navbar */}
      <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

      {/* Board header - fixed */}
      <div 
        className={cn(
          "fixed top-24 left-4 right-4 flex items-center justify-between z-30",
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
          "flex-1 relative mt-20 overflow-auto",
          "bg-[linear-gradient(#e5e5e5_1px,transparent_1px),linear-gradient(90deg,#e5e5e5_1px,transparent_1px)]",
          "bg-[size:20px_20px]"
        )}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* Inner container for scrollable content */}
        <div 
          className="relative"
          style={{ 
            minWidth: Math.max(800, ...notes.map(n => n.x + 250)),
            minHeight: Math.max(600, ...notes.map(n => n.y + 250)),
          }}
        >

        {/* Empty state */}
        {notes.length === 0 && !isCreating && (
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

        {/* Sticky notes */}
        {notes.map((note, index) => (
          <div
            key={note.id}
            className={cn(
              "absolute w-48 min-h-48 p-4 rounded-sm shadow-lg",
              "hover:shadow-xl hover:z-20",
              "group",
              !note.isLocked && "cursor-move",
              draggingNote === note.id && "z-50 shadow-2xl scale-105 cursor-grabbing",
              draggingNote !== note.id && "transition-shadow duration-300"
            )}
            style={{
              left: note.x,
              top: note.y,
              backgroundColor: note.color,
              transform: `rotate(${draggingNote === note.id ? 0 : note.rotation}deg)`,
              animationDelay: `${index * 50}ms`,
              willChange: draggingNote === note.id ? 'left, top' : 'auto',
            }}
            onMouseDown={(e) => handleDragStart(e, note.id)}
          >
            {/* Tape effect */}
            <div 
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm"
              style={{ transform: `translateX(-50%) rotate(${-note.rotation}deg)` }}
            />

            {/* Lock indicator */}
            {/* {note.isLocked && (
              <div className="absolute -top-2 -left-2 p-1.5 rounded-full bg-green-500 text-white shadow-md z-10">
                <Lock className="w-3 h-3" />
              </div>
            )} */}

            {/* Action buttons */}
            <div className={cn(
              "absolute -top-2 -right-2 flex gap-1",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            )}>
              {/* Lock/Unlock button */}
              {!note.isLocked && (<button
                onClick={(e) => { e.stopPropagation(); handleLockNote(note.id); }}
                className={cn(
                  "p-1.5 rounded-full shadow-md cursor-pointer z-10",
                  "bg-white/90 text-gray-500 hover:bg-green-100 hover:text-green-600"
                )}
                aria-label="Lock note"
                title="Khóa ghi chú"
              >
                <Check className="w-3.5 h-3.5" />
              </button>)}
              {/* Delete button - only show if not locked */}
              {!note.isLocked && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                  className={cn(
                    "p-1.5 rounded-full",
                    "bg-white/90 text-gray-500 shadow-md",
                    "hover:bg-red-100 hover:text-red-600",
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
            <p 
              className="text-sm leading-relaxed whitespace-pre-wrap break-words select-none"
              style={{ 
                color: note.textColor,
                fontFamily: note.fontFamily,
                fontWeight: note.fontWeight,
                fontSize: note.fontSize,
              }}
            >
              {note.content}
            </p>

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

      {/* Create note modal */}
      {isCreating && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsCreating(false)}
        >
          <div 
            className="w-full max-w-md max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 
                className="text-lg font-semibold text-foreground"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Tạo ghi chú mới
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {/* Preview */}
              <div 
                className="relative p-4 rounded-sm min-h-32 shadow-md"
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
                    "w-full h-32 bg-transparent resize-none leading-relaxed",
                    "placeholder:text-gray-400 focus:outline-none"
                  )}
                  style={{ 
                    color: newNote.textColor,
                    fontFamily: newNote.fontFamily,
                    fontWeight: newNote.fontWeight,
                    fontSize: newNote.fontSize,
                  }}
                  maxLength={200}
                />

                {/* Character count */}
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {newNote.content.length}/200
                </div>
              </div>

              {/* Color picker */}
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
                        "w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
                        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                        newNote.color === color.bg && "ring-2 ring-foreground ring-offset-2"
                      )}
                      style={{ backgroundColor: color.bg }}
                      aria-label={color.name}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

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
                        "w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
                        "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                        "flex items-center justify-center text-white text-xs font-bold",
                        newNote.textColor === color.color && "ring-2 ring-foreground ring-offset-2"
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
                        "px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                        "hover:bg-secondary focus:outline-none",
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
                        "px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                        "hover:bg-secondary focus:outline-none",
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
                        "px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                        "hover:bg-secondary focus:outline-none",
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

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-secondary/30">
              <button
                onClick={() => setIsCreating(false)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium",
                  "text-muted-foreground hover:bg-secondary transition-colors",
                  "cursor-pointer"
                )}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateNote}
                disabled={!newNote.content.trim()}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-medium",
                  "bg-accent text-accent-foreground",
                  "hover:bg-accent/90 transition-colors",
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
    </div>
  );
}
