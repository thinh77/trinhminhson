import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, ZoomIn, Loader2, Edit, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Photo } from "../types";

interface PhotoGridProps {
  photos: Photo[];
  isLoaded: boolean;
  loadedImages: Set<string>;
  onImageLoad: (id: string) => void;
  onPhotoSelect: (photo: Photo) => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  // Admin props
  isAdmin?: boolean;
  isDragEnabled?: boolean;
  deletingPhotoId?: string | null;
  onEdit?: (photo: Photo) => void;
  onDelete?: (photoId: string) => void;
  onReorder?: (fromId: string, toId: string) => void;
}

export function PhotoGrid({
  photos,
  isLoaded,
  loadedImages,
  onImageLoad,
  onPhotoSelect,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  isAdmin = false,
  isDragEnabled = false,
  deletingPhotoId = null,
  onEdit,
  onDelete,
  onReorder,
}: PhotoGridProps): React.ReactElement {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: "400px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  function handleDragStart(e: React.DragEvent, photoId: string): void {
    if (!isDragEnabled) return;
    setDraggedId(photoId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, photoId: string): void {
    if (!isDragEnabled) return;
    e.preventDefault();
    if (draggedId === photoId) return;
    setDragOverId(photoId);
  }

  function handleDragLeave(): void {
    setDragOverId(null);
  }

  function handleDrop(e: React.DragEvent, targetId: string): void {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !onReorder) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    onReorder(draggedId, targetId);
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd(): void {
    setDraggedId(null);
    setDragOverId(null);
  }

  return (
    <>
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
            isAdmin={isAdmin}
            isDragEnabled={isDragEnabled}
            isDragging={draggedId === photo.id}
            isDragOver={dragOverId === photo.id}
            isDeleting={deletingPhotoId === photo.id}
            onEdit={onEdit ? () => onEdit(photo) : undefined}
            onDelete={onDelete ? () => onDelete(photo.id) : undefined}
            onDragStart={(e) => handleDragStart(e, photo.id)}
            onDragOver={(e) => handleDragOver(e, photo.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, photo.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8" data-testid="loading-more">
          {isLoadingMore && (
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          )}
        </div>
      )}
    </>
  );
}

interface PhotoCardProps {
  photo: Photo;
  index: number;
  isLoaded: boolean;
  onImageLoad: () => void;
  onSelect: () => void;
  // Admin props
  isAdmin?: boolean;
  isDragEnabled?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  isDeleting?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

function PhotoCard({
  photo,
  index,
  isLoaded,
  onImageLoad,
  onSelect,
  isAdmin = false,
  isDragEnabled = false,
  isDragging = false,
  isDragOver = false,
  isDeleting = false,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: PhotoCardProps): React.ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

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
      ref={cardRef}
      data-testid="photo-card"
      draggable={isDragEnabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "break-inside-avoid group relative",
        "rounded-xl overflow-hidden",
        "bg-secondary/30 cursor-pointer",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-black/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isDragging && "opacity-50 scale-95",
        isDragOver && "ring-2 ring-accent scale-105"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View ${photo.title}`}
    >
      {/* Drag handle for admin */}
      {isAdmin && isDragEnabled && (
        <div
          data-testid="drag-handle"
          className="absolute top-2 left-2 z-10 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      {!isLoaded && (
        <div
          className={cn(
            "absolute inset-0 bg-secondary animate-pulse",
            aspectClass
          )}
        />
      )}

      {isVisible ? (
        <img
          src={photo.src}
          alt={photo.alt}
          loading="lazy"
          onLoad={onImageLoad}
          draggable={false}
          className={cn(
            "w-full h-auto object-cover",
            "transition-all duration-500 ease-out",
            "group-hover:scale-105",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      ) : (
        <div className={cn("w-full bg-secondary/50", aspectClass)} />
      )}

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity duration-300 ease-out",
          "flex flex-col justify-end p-4"
        )}
      >
        <p
          className="text-white font-semibold text-lg line-clamp-1"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {photo.title}
        </p>

        {photo.date && (
          <div className="flex items-center gap-1 mt-1 text-sm text-white/90">
            <Calendar className="w-4 h-4" />
            <span>{new Date(photo.date).toLocaleDateString("vn-VN")}</span>
          </div>
        )}
      </div>

      {/* Zoom icon for non-admin or admin controls */}
      {isAdmin && (onEdit || onDelete) ? (
        <div
          className={cn(
            "absolute top-3 right-3",
            "flex items-center gap-2",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity duration-300 ease-out"
          )}
        >
          {onEdit && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="h-8 w-8 p-0 cursor-pointer"
              aria-label="Edit photo"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="h-8 w-8 p-0 cursor-pointer"
              aria-label="Delete photo"
            >
              {isDeleting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
}
