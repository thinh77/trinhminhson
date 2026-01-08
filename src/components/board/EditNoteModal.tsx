import { useState, useRef, useEffect } from "react";
import { X, Type, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderTextWithLinks } from "@/lib/renderTextWithLinks";
import {
  textColors,
  fontFamilies,
  fontWeights,
  fontSizes,
} from "@/constants/noteStyles";
import type { Note } from "@/types/note";

interface EditNoteModalProps {
  note: Note;
  onClose: () => void;
  onSave: (
    noteId: number,
    additionalContent: string,
    textColor: string,
    fontFamily: string,
    fontWeight: string,
    fontSize: string
  ) => Promise<void>;
}

export function EditNoteModal({ note, onClose, onSave }: EditNoteModalProps) {
  const [additionalContent, setAdditionalContent] = useState("");

  // Get the most recent text color (from last segment or original note)
  const lastTextColor =
    note.textSegments && note.textSegments.length > 0
      ? note.textSegments[note.textSegments.length - 1].textColor
      : note.textColor;

  // Filter out the last used color from available colors
  const availableTextColors = textColors.filter(
    (color) => color.color !== lastTextColor
  );

  const [textColor, setTextColor] = useState(
    availableTextColors[0]?.color || textColors[0].color
  );
  const [fontFamily, setFontFamily] = useState(fontFamilies[0].value);
  const [fontWeight, setFontWeight] = useState(fontWeights[1].value);
  const [fontSize, setFontSize] = useState(fontSizes[1].value);
  const [isSaving, setIsSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = async () => {
    if (!additionalContent.trim()) return;

    setIsSaving(true);
    try {
      console.log("Saving additional content:", {
        noteId: note.id,
        additionalContent,
        textColor,
        fontFamily,
        fontWeight,
        fontSize,
      });
      await onSave(
        note.id,
        additionalContent,
        textColor,
        fontFamily,
        fontWeight,
        fontSize
      );
      console.log("Content saved successfully");
      onClose();
    } catch (error) {
      console.error("Failed to update note:", error);
      alert("Không thể cập nhật ghi chú. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm md:flex md:items-center md:justify-center md:p-4"
      onClick={onClose}
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
        <div className="flex items-center justify-between p-4 border-b border-border bg-white sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-foreground">
            Ghi thêm nội dung
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current note preview */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Nội dung hiện tại
            </label>
            <div
              className="relative p-4 rounded-sm shadow-md"
              style={{ backgroundColor: note.color }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm" />

              {/* Display existing content with segments */}
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
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
            </div>
          </div>

          {/* New content input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Plus className="w-4 h-4" />
              Nội dung thêm vào
            </label>
            <div
              className="relative p-4 rounded-sm shadow-md"
              style={{ backgroundColor: note.color }}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-amber-200/60 rounded-sm" />

              <textarea
                ref={textareaRef}
                value={additionalContent}
                onChange={(e) => setAdditionalContent(e.target.value)}
                placeholder="Viết thêm nội dung..."
                className={cn(
                  "w-full h-24 bg-transparent resize-none leading-relaxed",
                  "placeholder:text-gray-400 focus:outline-none",
                  "text-base"
                )}
                style={{
                  color: textColor,
                  fontFamily: fontFamily,
                  fontWeight: fontWeight,
                  fontSize:
                    window.innerWidth < 768
                      ? Math.max(16, parseInt(fontSize)) + "px"
                      : fontSize,
                }}
                maxLength={200}
              />

              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {additionalContent.length}/200
              </div>
            </div>
          </div>

          {/* Text color picker */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Type className="w-4 h-4" />
              Màu chữ
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTextColors.map((color) => (
                <button
                  key={color.color}
                  onClick={() => setTextColor(color.color)}
                  className={cn(
                    "w-10 h-10 md:w-8 md:h-8 rounded-lg transition-all duration-200 cursor-pointer",
                    "active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
                    "flex items-center justify-center text-white text-xs font-bold",
                    textColor === color.color &&
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
                  onClick={() => setFontFamily(font.value)}
                  className={cn(
                    "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                    "active:bg-secondary focus:outline-none",
                    "text-sm border border-border",
                    fontFamily === font.value &&
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
                  onClick={() => setFontWeight(weight.value)}
                  className={cn(
                    "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                    "active:bg-secondary focus:outline-none",
                    "text-sm border border-border",
                    fontWeight === weight.value &&
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
                  onClick={() => setFontSize(size.value)}
                  className={cn(
                    "px-3 py-2 md:py-1.5 rounded-lg transition-all duration-200 cursor-pointer",
                    "active:bg-secondary focus:outline-none",
                    "text-sm border border-border",
                    fontSize === size.value &&
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

        {/* Actions */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 p-4 border-t border-border bg-white/95 backdrop-blur-sm">
          <button
            onClick={onClose}
            disabled={isSaving}
            className={cn(
              "flex-1 md:flex-none px-4 py-3 md:py-2 rounded-xl text-sm font-medium",
              "text-muted-foreground hover:bg-secondary active:bg-secondary transition-colors",
              "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!additionalContent.trim() || isSaving}
            className={cn(
              "flex-1 md:flex-none px-6 py-3 md:py-2 rounded-xl text-sm font-medium",
              "bg-accent text-accent-foreground",
              "hover:bg-accent/90 active:bg-accent/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "cursor-pointer"
            )}
          >
            {isSaving ? "Đang lưu..." : "Thêm vào ghi chú"}
          </button>
        </div>
      </div>
    </div>
  );
}
