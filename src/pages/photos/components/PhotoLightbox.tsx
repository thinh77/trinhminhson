import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PhotoComments } from "@/components/photos/PhotoComments";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import type { Photo } from "../types";
import type { Category } from "@/services/categories.service";

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

  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "ArrowLeft") onPrevious();
    if (e.key === "ArrowRight") onNext();
  }

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
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[40vh] md:min-h-0">
          <img
            src={photo.srcLarge}
            alt={photo.alt || photo.title}
            className="max-h-full max-w-full object-contain select-none w-auto h-auto"
            draggable={false}
          />

          {/* Navigation Arrows */}
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
            <div className="flex-1" /> {/* Spacer */}
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

            {/* Description or extra meta could go here */}
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
