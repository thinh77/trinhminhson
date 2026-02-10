import { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PhotoComments } from "@/components/photos/PhotoComments";
import { ChevronLeft, ChevronRight, MapPin, X, RotateCcw } from "lucide-react";
import type { Photo } from "../types";
import type { Category } from "@/services/categories.service";
import { useImageZoom, ZOOM_LEVELS } from "../hooks/useImageZoom";

interface PhotoLightboxProps {
  photo: Photo | null;
  photos: Photo[];
  categoriesData: Category[];
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubcategoryClick: (categoryName: string, subcategoryName: string) => void;
}

export function PhotoLightbox({
  photo,
  photos,
  categoriesData,
  onClose,
  onPrevious,
  onNext,
  onSubcategoryClick,
}: PhotoLightboxProps): React.ReactElement {
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;
  const zoom = useImageZoom();
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });

  // Reset zoom when photo changes
  useEffect(() => {
    zoom.resetZoom();
  }, [photo?.id]);

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "ArrowLeft" && !zoom.isZoomedIn) onPrevious();
    if (e.key === "ArrowRight" && !zoom.isZoomedIn) onNext();
    if (e.key === "Escape" && zoom.isZoomedIn) {
      e.stopPropagation();
      zoom.resetZoom();
    }
  }

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!zoom.isZoomedIn) return;
      isDraggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [zoom.isZoomedIn]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || !zoom.isZoomedIn) return;
      const dx = (e.clientX - lastPointerRef.current.x) / zoom.zoomLevel;
      const dy = (e.clientY - lastPointerRef.current.y) / zoom.zoomLevel;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      zoom.setPosition({
        x: zoom.position.x + dx,
        y: zoom.position.y + dy,
      });
    },
    [zoom.isZoomedIn, zoom.zoomLevel, zoom.position, zoom.setPosition]
  );

  const handlePointerUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  const handleDoubleClick = useCallback(() => {
    zoom.cycleZoom();
  }, [zoom.cycleZoom]);

  function findParentCategory(subcategoryName: string): string | null {
    return (
      photo?.categories?.find((cat) => {
        const categoryData = categoriesData.find((c) => c.name === cat);
        return categoryData?.subcategories.some((s) => s.name === subcategoryName);
      }) ||
      photo?.categories?.[0] ||
      null
    );
  }

  if (!photo) return <></>;

  const imageSrc = zoom.shouldUseOriginal ? photo.srcOriginal : photo.srcLarge;

  return (
    <Dialog open={!!photo} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "max-w-full w-full h-dvh p-0 gap-0 overflow-hidden border-none rounded-none md:rounded-xl md:h-[90vh] md:grid md:grid-cols-[1fr_360px] flex flex-col bg-black text-white"
        )}
        onKeyDown={handleKeyDown}
      >
        <DialogTitle className="sr-only">{photo.title}</DialogTitle>

        {/* LEFT COLUMN: Image Area (Dark) */}
        <div
          ref={containerRef}
          className={cn(
            "relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-0",
            zoom.isZoomedIn ? "cursor-grab active:cursor-grabbing" : "cursor-default"
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={imageSrc}
            alt={photo.alt || photo.title}
            className="max-h-full max-w-full object-contain select-none w-auto h-auto transition-transform duration-150 origin-center"
            style={{ transform: zoom.imageTransform }}
            draggable={false}
          />

          {/* Zoom Controls */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1.5">
            {ZOOM_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => zoom.setZoomLevel(level)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer",
                  zoom.zoomLevel === level
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
                aria-label={`Zoom ${level}x`}
              >
                {level === 1 ? "Fit" : `${level}x`}
              </button>
            ))}
            {zoom.isZoomedIn && (
              <button
                onClick={zoom.resetZoom}
                className="ml-1 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
                aria-label="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Navigation Arrows - hidden when zoomed */}
          {!zoom.isZoomedIn && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-2 md:px-4">
              {currentIndex > 0 && (
                <button
                  onClick={onPrevious}
                  className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm cursor-pointer"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              )}
              <div className="flex-1" />
              {currentIndex < photos.length - 1 && (
                <button
                  onClick={onNext}
                  className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm cursor-pointer"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-2 left-2 md:top-4 md:left-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all backdrop-blur-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RIGHT COLUMN: Sidebar (Light) */}
        <div className="w-full md:w-[360px] bg-white text-gray-900 flex flex-col max-h-[60vh] md:max-h-full md:h-full border-t md:border-t-0 md:border-l border-gray-200 overflow-hidden">
          {/* Sidebar Header: Photo Info */}
          <div className="p-4 md:p-5 border-b border-gray-100 flex-shrink-0">
            <h2 className="text-base font-semibold leading-tight text-gray-900 mb-2">
              {photo.title}
            </h2>
            {photo.subcategories && photo.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-medium">
                {photo.subcategories.map((sub) => {
                  const parentCategory = findParentCategory(sub);
                  if (!parentCategory) return null;
                  return (
                    <button
                      key={sub}
                      onClick={() => onSubcategoryClick(parentCategory, sub)}
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                    >
                      #{sub}
                    </button>
                  );
                })}
              </div>
            )}

            {photo.location && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <MapPin className="w-3 h-3" />
                {photo.location}
              </div>
            )}
          </div>

          {/* Sidebar Body: Comments */}
          <div className="flex-1 min-h-0 overflow-hidden relative">
            <PhotoComments photoId={Number(photo.id)} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
