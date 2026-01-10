import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  getPhotos,
  getCategories,
  getPhotoUrl,
  type Photo as ApiPhoto,
} from "@/services/photos.service";

// Photo type for display
interface Photo {
  id: string;
  src: string;
  srcLarge: string; // Large version for lightbox
  alt: string;
  title: string;
  date?: string;
  location?: string;
  category: string;
  aspectRatio: "landscape" | "portrait" | "square";
}

// Convert API photo to display photo
function mapApiPhotoToDisplay(photo: ApiPhoto): Photo {
  return {
    id: String(photo.id),
    src: getPhotoUrl(photo.filename, "medium"), // Medium size for gallery
    srcLarge: getPhotoUrl(photo.filename, "large"), // Large size for lightbox
    alt: photo.alt || photo.title,
    title: photo.title,
    date: photo.date_taken
      ? new Date(photo.date_taken).toISOString().split("T")[0]
      : undefined,
    location: photo.location,
    category: photo.category,
    aspectRatio: photo.aspect_ratio || "landscape",
  };
}

export function PhotosPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Load photos and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [photosData, categoriesData] = await Promise.all([
          getPhotos(),
          getCategories(),
        ]);
        setPhotos(photosData.map(mapApiPhotoToDisplay));
        setCategories(["All", ...categoriesData]);
      } catch (error) {
        console.error("Failed to load photos:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => setIsLoaded(true), 100);
      }
    }
    loadData();
  }, []);

  const filteredPhotos =
    activeCategory === "All"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const currentIndex = selectedPhoto
    ? filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevious();
    if (e.key === "ArrowRight") handleNext();
    if (e.key === "Escape") setSelectedPhoto(null);
  };

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      {/* Main content */}
      <main className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className={cn(
              "mb-12 transition-all duration-700 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1
                  className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Photos
                </h1>
                <p className="text-muted-foreground text-sm">
                  Moments captured through my lens
                </p>
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mt-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium",
                    "transition-all duration-200 ease-out",
                    "cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    activeCategory === category
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
              <p className="text-muted-foreground">Loading photos...</p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filteredPhotos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {photos.length === 0
                  ? "No photos yet. Upload your first photo!"
                  : "No photos in this category."}
              </p>
            </div>
          )}

          {/* Photo grid - Masonry-like layout */}
          {!isLoading && filteredPhotos.length > 0 && (
            <div
              className={cn(
                "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4",
                "transition-all duration-700 delay-150 ease-out",
                isLoaded
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              )}
            >
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={cn(
                    "break-inside-avoid group relative",
                    "rounded-xl overflow-hidden",
                    "bg-secondary/30",
                    "cursor-pointer",
                    "transition-all duration-300 ease-out",
                    "hover:shadow-xl hover:shadow-black/20",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                  onClick={() => setSelectedPhoto(photo)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPhoto(photo);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${photo.title}`}
                >
                  {/* Skeleton loader */}
                  {!loadedImages.has(photo.id) && (
                    <div
                      className={cn(
                        "absolute inset-0 bg-secondary animate-pulse",
                        photo.aspectRatio === "portrait"
                          ? "aspect-[3/4]"
                          : photo.aspectRatio === "square"
                          ? "aspect-square"
                          : "aspect-video"
                      )}
                    />
                  )}

                  {/* Image */}
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    onLoad={() => handleImageLoad(photo.id)}
                    className={cn(
                      "w-full h-auto object-cover",
                      "transition-all duration-500 ease-out",
                      "group-hover:scale-105",
                      loadedImages.has(photo.id) ? "opacity-100" : "opacity-0"
                    )}
                  />

                  {/* Hover overlay */}
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
                    {photo.location && (
                      <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {photo.location}
                      </p>
                    )}
                  </div>

                  {/* Zoom icon indicator */}
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
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Dialog */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      >
        <DialogContent
          className={cn(
            "max-w-[95vw] max-h-[95vh] w-auto h-auto p-0",
            "bg-black/95 border-none rounded-2xl overflow-hidden",
            "flex flex-col"
          )}
          onKeyDown={handleKeyDown}
        >
          <DialogTitle className="sr-only">
            {selectedPhoto?.title || "Photo"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {selectedPhoto?.alt || "Photo viewer"}
          </DialogDescription>

          {selectedPhoto && (
            <>
              {/* Close button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className={cn(
                  "absolute top-4 right-4 z-10",
                  "w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm",
                  "flex items-center justify-center",
                  "text-white hover:bg-white/20",
                  "transition-colors duration-200",
                  "cursor-pointer",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                )}
                aria-label="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Navigation buttons */}
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                    "w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm",
                    "flex items-center justify-center",
                    "text-white hover:bg-white/20",
                    "transition-colors duration-200",
                    "cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  )}
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {currentIndex < filteredPhotos.length - 1 && (
                <button
                  onClick={handleNext}
                  className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                    "w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm",
                    "flex items-center justify-center",
                    "text-white hover:bg-white/20",
                    "transition-colors duration-200",
                    "cursor-pointer",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  )}
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Main image */}
              <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                <img
                  src={selectedPhoto.srcLarge}
                  alt={selectedPhoto.alt}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg"
                />
              </div>

              {/* Photo info */}
              <div className="bg-black/80 backdrop-blur-sm p-4 sm:p-6">
                <div className="max-w-2xl mx-auto">
                  <h3
                    className="text-white text-xl font-semibold mb-2"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {selectedPhoto.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm">
                    {selectedPhoto.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedPhoto.location}
                      </span>
                    )}
                    {selectedPhoto.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedPhoto.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                      {selectedPhoto.category}
                    </span>
                  </div>
                </div>

                {/* Photo counter */}
                <div className="text-center mt-4 text-white/50 text-sm">
                  {currentIndex + 1} / {filteredPhotos.length}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
