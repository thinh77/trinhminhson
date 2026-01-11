import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { PhotoComments } from "@/components/photos/PhotoComments";
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
  Filter,
  ChevronDown,
  FolderOpen,
  Folder,
  Tag,
  Check,
  RotateCcw,
} from "lucide-react";
import {
  getPhotos,
  getPhotoUrl,
  type Photo as ApiPhoto,
} from "@/services/photos.service";
import { getAllCategories, type Category } from "@/services/categories.service";

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
  subcategories: string[]; // subcategory names
  aspectRatio: "landscape" | "portrait" | "square";
}

// Convert API photo to display photo
function mapApiPhotoToDisplay(photo: ApiPhoto): Photo {
  return {
    id: String(photo.id),
    src: getPhotoUrl(photo.filename, "medium"), // Medium size for gallery
    srcLarge: getPhotoUrl(photo.filename, "original"), // Original size for lightbox (HD)
    alt: photo.alt || photo.title,
    title: photo.title,
    date: photo.date_taken
      ? new Date(photo.date_taken).toISOString().split("T")[0]
      : undefined,
    location: photo.location,
    category: photo.category,
    subcategories: photo.subcategories?.map((sub) => sub.name) || [],
    aspectRatio: photo.aspect_ratio || "landscape",
  };
}

export function PhotosPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set()
  );
  const [activeSubcategories, setActiveSubcategories] = useState<Set<string>>(
    new Set()
  );
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  // Load photos and categories on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [photosData, categories] = await Promise.all([
          getPhotos(),
          getAllCategories(false),
        ]);
        setPhotos(photosData.map(mapApiPhotoToDisplay));
        setCategoriesData(categories);
      } catch (error) {
        console.error("Failed to load photos:", error);
      } finally {
        setIsLoading(false);
        setTimeout(() => setIsLoaded(true), 100);
      }
    }
    loadData();
  }, []);

  const filteredPhotos = photos.filter((p) => {
    // If no categories selected, show all photos
    if (activeCategories.size === 0) return true;

    // Check if photo's category is selected
    const categoryMatch = activeCategories.has(p.category);
    if (!categoryMatch) return false;

    // If subcategories are selected for this category, check subcategory match
    if (activeSubcategories.size > 0) {
      const hasMatchingSubcategory = p.subcategories.some((sub) =>
        activeSubcategories.has(`${p.category}:${sub}`)
      );
      // Only filter by subcategory if some subcategories are selected for this photo's category
      const categoryHasSelectedSubs = Array.from(activeSubcategories).some(
        (sub) => sub.startsWith(`${p.category}:`)
      );
      if (categoryHasSelectedSubs) {
        return hasMatchingSubcategory;
      }
    }

    return true;
  });

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

  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleCategoryFilter = (categoryName: string, categoryId: number) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
        // Remove all subcategories of this category
        setActiveSubcategories((prevSubs) => {
          const nextSubs = new Set(prevSubs);
          Array.from(nextSubs).forEach((sub) => {
            if (sub.startsWith(`${categoryName}:`)) {
              nextSubs.delete(sub);
            }
          });
          return nextSubs;
        });
      } else {
        next.add(categoryName);
        // Auto-expand category when selected
        setExpandedCategories((prev) => new Set(prev).add(categoryId));
      }
      return next;
    });
  };

  const toggleSubcategoryFilter = (
    categoryName: string,
    subcategoryName: string
  ) => {
    const key = `${categoryName}:${subcategoryName}`;
    setActiveSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const clearAllFilters = () => {
    setActiveCategories(new Set());
    setActiveSubcategories(new Set());
  };

  const selectAllSubcategories = (category: Category) => {
    const allSubs = category.subcategories.map(
      (sub) => `${category.name}:${sub.name}`
    );
    setActiveSubcategories((prev) => {
      const next = new Set(prev);
      allSubs.forEach((sub) => next.add(sub));
      return next;
    });
  };

  const deselectAllSubcategories = (categoryName: string) => {
    setActiveSubcategories((prev) => {
      const next = new Set(prev);
      Array.from(next).forEach((sub) => {
        if (sub.startsWith(`${categoryName}:`)) {
          next.delete(sub);
        }
      });
      return next;
    });
  };

  const getSubcategoryPhotoCount = (
    categoryName: string,
    subcategoryName: string
  ) => {
    return photos.filter(
      (p) =>
        p.category === categoryName && p.subcategories.includes(subcategoryName)
    ).length;
  };

  const isAllSubcategoriesSelected = (category: Category) => {
    return category.subcategories.every((sub) =>
      activeSubcategories.has(`${category.name}:${sub.name}`)
    );
  };

  const isSomeSubcategoriesSelected = (categoryName: string) => {
    return Array.from(activeSubcategories).some((sub) =>
      sub.startsWith(`${categoryName}:`)
    );
  };

  const getActiveFilterLabel = () => {
    if (activeCategories.size === 0) return "All Photos";
    const subCount = activeSubcategories.size;
    if (activeCategories.size === 1 && subCount === 0) {
      return Array.from(activeCategories)[0];
    }
    if (activeCategories.size === 1 && subCount > 0) {
      const category = Array.from(activeCategories)[0];
      return `${category} (${subCount} sub)`;
    }
    return `${activeCategories.size} Categories${
      subCount > 0 ? `, ${subCount} sub` : ""
    }`;
  };

  const getActiveFiltersCount = () => {
    return activeCategories.size + activeSubcategories.size;
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

      {/* Fixed Filter Button */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className={cn(
          "fixed right-4 top-24 z-40",
          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
          "bg-card/95 backdrop-blur-sm border border-border/50",
          "shadow-lg shadow-black/10",
          "text-sm font-medium",
          "transition-all duration-200",
          "cursor-pointer",
          "hover:bg-card hover:shadow-xl",
          isFilterOpen && "bg-accent text-accent-foreground",
          getActiveFiltersCount() > 0 && !isFilterOpen && "border-accent/50"
        )}
      >
        <div className="relative">
          <Filter className="w-4 h-4" />
          {getActiveFiltersCount() > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        <span className="hidden sm:inline">{getActiveFilterLabel()}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            isFilterOpen && "rotate-180"
          )}
        />
      </button>

      {/* Fixed Filter Panel */}
      <div
        className={cn(
          "fixed right-4 top-40 z-40",
          "w-72 sm:w-80 max-h-[calc(100vh-12rem)]",
          "bg-card/95 backdrop-blur-sm border border-border/50",
          "rounded-xl shadow-xl shadow-black/10",
          "overflow-hidden",
          "transition-all duration-300 ease-out",
          isFilterOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-4 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="p-3 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4 text-accent" />
            Filter Photos
          </h3>
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearAllFilters}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-xs",
                "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                "transition-colors duration-150 cursor-pointer"
              )}
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
          {/* Quick Stats */}
          <div className="px-3 py-2 bg-secondary/30 border-b border-border/30">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredPhotos.length} of {photos.length} photos
              </span>
              {getActiveFiltersCount() > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent font-medium">
                  {getActiveFiltersCount()} active
                </span>
              )}
            </div>
          </div>

          <div className="p-2">
            {/* All Photos Option */}
            <button
              onClick={clearAllFilters}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
                "transition-all duration-150",
                "cursor-pointer",
                activeCategories.size === 0
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground hover:bg-secondary/50"
              )}
            >
              <Camera className="w-4 h-4" />
              <span className="font-medium flex-1 text-left">All Photos</span>
              <span className="text-xs opacity-70 tabular-nums">
                {photos.length}
              </span>
            </button>

            {/* Categories Section */}
            <div className="mt-3">
              <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Categories
              </div>

              <div className="space-y-0.5">
                {categoriesData.map((category) => {
                  const isExpanded = expandedCategories.has(category.id);
                  const hasSubcategories =
                    category.subcategories && category.subcategories.length > 0;
                  const categoryPhotoCount = photos.filter(
                    (p) => p.category === category.name
                  ).length;
                  const isCategorySelected = activeCategories.has(
                    category.name
                  );
                  const hasSomeSubsSelected = isSomeSubcategoriesSelected(
                    category.name
                  );
                  const hasAllSubsSelected =
                    hasSubcategories && isAllSubcategoriesSelected(category);

                  return (
                    <div
                      key={category.id}
                      className="rounded-lg overflow-hidden"
                    >
                      {/* Category Row */}
                      <div
                        className={cn(
                          "flex items-center gap-2 px-2 py-2 rounded-lg",
                          "transition-colors duration-150",
                          isCategorySelected
                            ? "bg-accent/10"
                            : "hover:bg-secondary/30"
                        )}
                      >
                        {/* Expand/Collapse Button */}
                        {hasSubcategories ? (
                          <button
                            onClick={() => toggleCategoryExpand(category.id)}
                            className={cn(
                              "p-1 rounded-md transition-colors duration-150 cursor-pointer",
                              "hover:bg-secondary/50"
                            )}
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                                !isExpanded && "-rotate-90"
                              )}
                            />
                          </button>
                        ) : (
                          <div className="w-6" />
                        )}

                        {/* Custom Checkbox */}
                        <label
                          className={cn(
                            "flex items-center gap-3 flex-1 cursor-pointer select-none py-0.5"
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center",
                              "transition-all duration-150",
                              isCategorySelected
                                ? "bg-accent border-accent"
                                : hasSomeSubsSelected
                                ? "bg-accent/30 border-accent/50"
                                : "border-border hover:border-accent/50"
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              toggleCategoryFilter(category.name, category.id);
                            }}
                          >
                            {isCategorySelected && (
                              <Check className="w-3.5 h-3.5 text-accent-foreground" />
                            )}
                            {!isCategorySelected && hasSomeSubsSelected && (
                              <div className="w-2 h-2 rounded-sm bg-accent" />
                            )}
                          </div>

                          {/* Folder Icon */}
                          {isExpanded && isCategorySelected ? (
                            <FolderOpen className="w-4 h-4 text-accent" />
                          ) : (
                            <Folder
                              className={cn(
                                "w-4 h-4",
                                isCategorySelected
                                  ? "text-accent"
                                  : "text-muted-foreground"
                              )}
                            />
                          )}

                          {/* Category Name */}
                          <span
                            className={cn(
                              "font-medium truncate flex-1",
                              isCategorySelected
                                ? "text-foreground"
                                : "text-foreground/80"
                            )}
                          >
                            {category.name}
                          </span>

                          {/* Photo Count Badge */}
                          <span
                            className={cn(
                              "text-xs tabular-nums px-1.5 py-0.5 rounded-md",
                              isCategorySelected
                                ? "bg-accent/20 text-accent"
                                : "text-muted-foreground"
                            )}
                          >
                            {categoryPhotoCount}
                          </span>
                        </label>
                      </div>

                      {/* Subcategories */}
                      {hasSubcategories && isExpanded && (
                        <div
                          className={cn(
                            "ml-8 mt-1 mb-2 pl-3 border-l-2",
                            isCategorySelected
                              ? "border-accent/30"
                              : "border-border/30"
                          )}
                        >
                          {/* Select All / Deselect All for subcategories */}
                          {
                            /* {isCategorySelected && */
                            category.subcategories.length > 1 && (
                              <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                                <button
                                  onClick={() =>
                                    selectAllSubcategories(category)
                                  }
                                  disabled={hasAllSubsSelected}
                                  className={cn(
                                    "text-xs px-2 py-1 rounded-md transition-colors cursor-pointer",
                                    hasAllSubsSelected
                                      ? "text-muted-foreground/50 cursor-not-allowed"
                                      : "text-accent hover:bg-accent/10"
                                  )}
                                >
                                  Select all
                                </button>
                                <span className="text-muted-foreground/30">
                                  |
                                </span>
                                <button
                                  onClick={() =>
                                    deselectAllSubcategories(category.name)
                                  }
                                  disabled={!hasSomeSubsSelected}
                                  className={cn(
                                    "text-xs px-2 py-1 rounded-md transition-colors cursor-pointer",
                                    !hasSomeSubsSelected
                                      ? "text-muted-foreground/50 cursor-not-allowed"
                                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                  )}
                                >
                                  Clear
                                </button>
                              </div>
                            )
                          }

                          {/* Subcategory List */}
                          <div className="space-y-0.5">
                            {category.subcategories.map((sub) => {
                              const subKey = `${category.name}:${sub.name}`;
                              const isSubSelected =
                                activeSubcategories.has(subKey);
                              const subPhotoCount = getSubcategoryPhotoCount(
                                category.name,
                                sub.name
                              );

                              return (
                                <label
                                  key={sub.id}
                                  className={cn(
                                    "flex items-center gap-3 px-2 py-1.5 rounded-md cursor-pointer",
                                    "transition-all duration-150",
                                    isSubSelected
                                      ? "bg-accent/10"
                                      : isCategorySelected
                                      ? "hover:bg-secondary/30"
                                      : "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {/* Subcategory Checkbox */}
                                  <div
                                    className={cn(
                                      "w-4 h-4 rounded border-2 flex items-center justify-center",
                                      "transition-all duration-150",
                                      !isCategorySelected && "opacity-50",
                                      isSubSelected
                                        ? "bg-accent border-accent"
                                        : "border-border/70 hover:border-accent/50"
                                    )}
                                    onClick={(e) => {
                                      if (!isCategorySelected) return;
                                      e.preventDefault();
                                      toggleSubcategoryFilter(
                                        category.name,
                                        sub.name
                                      );
                                    }}
                                  >
                                    {isSubSelected && (
                                      <Check className="w-3 h-3 text-accent-foreground" />
                                    )}
                                  </div>

                                  <Tag
                                    className={cn(
                                      "w-3.5 h-3.5",
                                      isSubSelected
                                        ? "text-accent"
                                        : "text-muted-foreground"
                                    )}
                                  />

                                  <span
                                    className={cn(
                                      "text-sm truncate flex-1",
                                      isSubSelected
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    )}
                                  >
                                    {sub.name}
                                  </span>

                                  <span
                                    className={cn(
                                      "text-xs tabular-nums",
                                      isSubSelected
                                        ? "text-accent"
                                        : "text-muted-foreground/70"
                                    )}
                                  >
                                    {subPhotoCount}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Apply hint */}
        {getActiveFiltersCount() > 0 && (
          <div className="p-3 border-t border-border/50 bg-secondary/20">
            <p className="text-xs text-center text-muted-foreground">
              Filters apply automatically
            </p>
          </div>
        )}
      </div>

      {/* Backdrop when filter is open */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

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

            {/* Active filter indicator */}
            {(activeCategories.size > 0 || activeSubcategories.size > 0) && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-muted-foreground">
                  Filtering by:
                </span>
                {/* Category chips */}
                {Array.from(activeCategories).map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium"
                  >
                    <Folder className="w-3 h-3" />
                    {cat}
                    <button
                      onClick={() => {
                        const category = categoriesData.find(
                          (c) => c.name === cat
                        );
                        if (category) {
                          toggleCategoryFilter(cat, category.id);
                        }
                      }}
                      className="ml-0.5 p-0.5 rounded-full hover:bg-accent/20 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {/* Subcategory chips */}
                {Array.from(activeSubcategories).map((subKey) => {
                  const [categoryName, subName] = subKey.split(":");
                  return (
                    <span
                      key={subKey}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground/80 text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {subName}
                      <button
                        onClick={() =>
                          toggleSubcategoryFilter(categoryName, subName)
                        }
                        className="ml-0.5 p-0.5 rounded-full hover:bg-secondary/80 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
                {/* Clear all button */}
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear all
                </button>
              </div>
            )}
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

      {/* Lightbox Dialog - Facebook Style */}
      <Dialog
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      >
        <DialogContent
          className={cn(
            "max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 m-0",
            "bg-[#1c1e21] border-none rounded-none overflow-hidden",
            "flex flex-col lg:flex-row"
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
              {/* Close button - Facebook style */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className={cn(
                  "absolute top-3 left-3 z-20",
                  "w-10 h-10 rounded-full bg-[#3a3b3c]",
                  "flex items-center justify-center",
                  "text-[#e4e6eb] hover:bg-[#4e4f50]",
                  "transition-colors duration-200",
                  "cursor-pointer",
                  "focus:outline-none"
                )}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left side - Image Area (Facebook dark background) */}
              <div className="relative flex-1 flex items-center justify-center bg-[#18191a] min-h-[50vh] lg:min-h-full">
                {/* Navigation - Previous */}
                {currentIndex > 0 && (
                  <button
                    onClick={handlePrevious}
                    className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                      "w-12 h-12 rounded-full bg-[#3a3b3c]",
                      "flex items-center justify-center",
                      "text-[#e4e6eb] hover:bg-[#4e4f50]",
                      "transition-colors duration-200",
                      "cursor-pointer shadow-lg"
                    )}
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                )}

                {/* Navigation - Next */}
                {currentIndex < filteredPhotos.length - 1 && (
                  <button
                    onClick={handleNext}
                    className={cn(
                      "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                      "w-12 h-12 rounded-full bg-[#3a3b3c]",
                      "flex items-center justify-center",
                      "text-[#e4e6eb] hover:bg-[#4e4f50]",
                      "transition-colors duration-200",
                      "cursor-pointer shadow-lg"
                    )}
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                )}

                {/* Main image */}
                <img
                  src={selectedPhoto.srcLarge}
                  alt={selectedPhoto.alt}
                  className="max-w-full max-h-full w-auto h-auto object-contain"
                />

                {/* Photo counter - mobile */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:hidden px-3 py-1.5 rounded-full bg-[#3a3b3c] text-[#e4e6eb] text-sm font-medium">
                  {currentIndex + 1} / {filteredPhotos.length}
                </div>
              </div>

              {/* Right Sidebar - Facebook Style */}
              <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-[#242526] flex flex-col max-h-[50vh] lg:max-h-full lg:h-full border-t lg:border-t-0 lg:border-l border-[#3e4042]">
                {/* Photo Info Header - Facebook Style */}
                <div className="p-4 border-b border-[#3e4042] flex-shrink-0">
                  {/* Caption/Title */}
                  <p className="text-[#e4e6eb] text-[15px] leading-relaxed mb-3">
                    {selectedPhoto.title}
                  </p>

                  {/* Tags - Facebook hashtag style */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="text-[#2d88ff] text-[15px] hover:underline cursor-pointer">
                      #
                      {selectedPhoto.category.toLowerCase().replace(/\s+/g, "")}
                    </span>
                    {selectedPhoto.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="text-[#2d88ff] text-[15px] hover:underline cursor-pointer"
                      >
                        #{sub.toLowerCase().replace(/\s+/g, "")}
                      </span>
                    ))}
                  </div>

                  {/* Meta info - Location & Date */}
                  <div className="flex flex-wrap items-center gap-3 text-[#b0b3b8] text-[13px]">
                    {selectedPhoto.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedPhoto.location}
                      </span>
                    )}
                    {selectedPhoto.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selectedPhoto.date).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    )}
                    {/* Photo counter - desktop */}
                    <span className="hidden lg:inline text-[#b0b3b8]">
                      {currentIndex + 1}/{filteredPhotos.length}
                    </span>
                  </div>
                </div>

                {/* Comments Section - Facebook Style */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <PhotoComments photoId={Number(selectedPhoto.id)} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
