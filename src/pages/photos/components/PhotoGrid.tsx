import { cn } from "@/lib/utils";
import { Calendar, ZoomIn } from "lucide-react";
import type { Photo } from "../types";

interface PhotoGridProps {
  photos: Photo[];
  isLoaded: boolean;
  loadedImages: Set<string>;
  onImageLoad: (id: string) => void;
  onPhotoSelect: (photo: Photo) => void;
}

export function PhotoGrid({
  photos,
  isLoaded,
  loadedImages,
  onImageLoad,
  onPhotoSelect,
}: PhotoGridProps): React.ReactElement {
  return (
    <div
      className={cn(
        "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4",
        "transition-all duration-700 delay-150 ease-out",
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      {photos.map((photo, index) => (
        <PhotoCard
          key={photo.id}
          photo={photo}
          index={index}
          isLoaded={loadedImages.has(photo.id)}
          onImageLoad={() => onImageLoad(photo.id)}
          onSelect={() => onPhotoSelect(photo)}
        />
      ))}
    </div>
  );
}

interface PhotoCardProps {
  photo: Photo;
  index: number;
  isLoaded: boolean;
  onImageLoad: () => void;
  onSelect: () => void;
}

function PhotoCard({
  photo,
  index,
  isLoaded,
  onImageLoad,
  onSelect,
}: PhotoCardProps): React.ReactElement {
  function handleKeyDown(e: React.KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  }

  const aspectClass =
    photo.aspectRatio === "portrait"
      ? "aspect-[3/4]"
      : photo.aspectRatio === "square"
      ? "aspect-square"
      : "aspect-video";

  return (
    <div
      className={cn(
        "break-inside-avoid group relative",
        "rounded-xl overflow-hidden",
        "bg-secondary/30 cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-black/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${photo.title}`}
    >
      {!isLoaded && (
        <div className={cn("absolute inset-0 bg-secondary animate-pulse", aspectClass)} />
      )}

      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        onLoad={onImageLoad}
        className={cn(
          "w-full h-auto object-cover",
          "transition-all duration-500 ease-out",
          "group-hover:scale-105",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
      />

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300 ease-out",
          "flex flex-col justify-end p-4"
        )}
      >
        <p
          className="text-white font-semibold text-lg"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {photo.title}
        </p>

        {photo.date && (
          <div className="flex items-center gap-1 mt-1 text-sm text-white/90">
            <Calendar className="w-4 h-4" />
            <span>{new Date(photo.date).toLocaleDateString('vn-VN')}</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          "absolute top-3 right-3",
          "w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm",
          "flex items-center justify-center",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300 ease-out"
        )}
      >
        <ZoomIn className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}
