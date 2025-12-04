import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  Calendar,
  MapPin
} from "lucide-react";

// Photo data - replace with your actual photos
interface Photo {
  id: string;
  src: string;
  alt: string;
  title: string;
  date?: string;
  location?: string;
  category: string;
  aspectRatio: "landscape" | "portrait" | "square";
}

// Sample photos - replace with actual photo data
const photos: Photo[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    alt: "Mountain landscape at sunset",
    title: "Mountain Sunset",
    date: "2024-10-15",
    location: "Swiss Alps",
    category: "Nature",
    aspectRatio: "landscape"
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
    alt: "City skyline at night",
    title: "City Lights",
    date: "2024-09-20",
    location: "Tokyo, Japan",
    category: "Urban",
    aspectRatio: "portrait"
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800",
    alt: "Foggy forest path",
    title: "Misty Morning",
    date: "2024-08-05",
    location: "Black Forest, Germany",
    category: "Nature",
    aspectRatio: "landscape"
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    alt: "Lake reflection with mountains",
    title: "Mirror Lake",
    date: "2024-07-22",
    location: "New Zealand",
    category: "Nature",
    aspectRatio: "landscape"
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
    alt: "Starry night sky over mountains",
    title: "Stargazing",
    date: "2024-06-18",
    location: "Iceland",
    category: "Night",
    aspectRatio: "landscape"
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800",
    alt: "Ocean waves at sunrise",
    title: "Golden Hour",
    date: "2024-05-30",
    location: "Bali, Indonesia",
    category: "Ocean",
    aspectRatio: "portrait"
  },
  {
    id: "7",
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
    alt: "Autumn forest trail",
    title: "Fall Colors",
    date: "2024-11-01",
    location: "Vermont, USA",
    category: "Nature",
    aspectRatio: "landscape"
  },
  {
    id: "8",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    alt: "Desert dunes at sunset",
    title: "Sahara Dreams",
    date: "2024-04-12",
    location: "Morocco",
    category: "Desert",
    aspectRatio: "square"
  },
];

const categories = ["All", ...new Set(photos.map(p => p.category))];

export function PhotosPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredPhotos = activeCategory === "All" 
    ? photos 
    : photos.filter(p => p.category === activeCategory);

  const currentIndex = selectedPhoto 
    ? filteredPhotos.findIndex(p => p.id === selectedPhoto.id) 
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
    setLoadedImages(prev => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Navbar */}
      <Navbar className="fixed top-4 left-4 right-4 z-50 rounded-2xl shadow-lg shadow-black/5" />

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

          {/* Photo grid - Masonry-like layout */}
          <div 
            className={cn(
              "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4",
              "transition-all duration-700 delay-150 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
                  <div className={cn(
                    "absolute inset-0 bg-secondary animate-pulse",
                    photo.aspectRatio === "portrait" ? "aspect-[3/4]" : 
                    photo.aspectRatio === "square" ? "aspect-square" : "aspect-video"
                  )} />
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
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300 ease-out",
                  "flex flex-col justify-end p-4"
                )}>
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
                <div className={cn(
                  "absolute top-3 right-3",
                  "w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm",
                  "flex items-center justify-center",
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300 ease-out"
                )}>
                  <ZoomIn className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredPhotos.length === 0 && (
            <div className="text-center py-16">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No photos in this category yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent 
          className={cn(
            "max-w-[95vw] max-h-[95vh] w-auto h-auto p-0",
            "bg-black/95 border-none rounded-2xl overflow-hidden",
            "flex flex-col"
          )}
          onKeyDown={handleKeyDown}
        >
          <DialogTitle className="sr-only">{selectedPhoto?.title || "Photo"}</DialogTitle>
          <DialogDescription className="sr-only">{selectedPhoto?.alt || "Photo viewer"}</DialogDescription>
          
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
                  src={selectedPhoto.src}
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
                        {new Date(selectedPhoto.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
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
