import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";
import {
  Camera,
  X,
  Loader2,
  Filter,
  ChevronDown,
  Folder,
  Tag,
  RotateCcw,
} from "lucide-react";
import { getAllCategories, type Category } from "@/services/categories.service";
import { useAuth } from "@/contexts/AuthContext";
import { FilterPanel, PhotoGrid, PhotoLightbox, EditPhotoModal, PhotoUploadPanel } from "./components";
import { usePhotoFilters } from "./hooks/usePhotoFilters";
import { useInfinitePhotos } from "./hooks/useInfinitePhotos";
import { usePhotoAdmin } from "./hooks/usePhotoAdmin";
import type { Photo } from "./types";

export function PhotosPage(): React.ReactElement {
  const [isLoaded, setIsLoaded] = useState(false);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { photos, apiPhotos, isLoading, isLoadingMore, hasMore, loadMore, loadAll, refresh, setApiPhotos } =
    useInfinitePhotos();

  // Admin photo management
  const photoAdmin = usePhotoAdmin(apiPhotos, setApiPhotos);

  const filters = usePhotoFilters(photos);

  // Check if any filter is active
  const hasActiveFilters =
    filters.activeCategories.size > 0 || filters.activeSubcategories.size > 0;

  // Disable drag when filtering
  const isDragEnabled = isAdmin && !hasActiveFilters;

  // Load all photos when filter is applied
  useEffect(() => {
    if (hasActiveFilters && hasMore) {
      loadAll();
    }
  }, [hasActiveFilters, hasMore, loadAll]);

  useEffect(() => {
    async function loadCategories(): Promise<void> {
      try {
        const categories = await getAllCategories(false);
        setCategoriesData(categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [isLoading]);

  const currentIndex = selectedPhoto
    ? filters.filteredPhotos.findIndex((p) => p.id === selectedPhoto.id)
    : -1;

  function handlePrevious(): void {
    if (currentIndex > 0) {
      setSelectedPhoto(filters.filteredPhotos[currentIndex - 1]);
    }
  }

  function handleNext(): void {
    if (currentIndex < filters.filteredPhotos.length - 1) {
      setSelectedPhoto(filters.filteredPhotos[currentIndex + 1]);
    }
  }

  // Admin handlers that work with display Photo type
  function handleEditPhoto(photo: Photo): void {
    const apiPhoto = apiPhotos.find((p) => String(p.id) === photo.id);
    if (apiPhoto) {
      photoAdmin.handleEditPhoto(apiPhoto);
    }
  }

  function handleDeletePhoto(photoId: string): void {
    photoAdmin.handleDeletePhoto(photoId);
  }

  function handleImageLoad(id: string): void {
    setLoadedImages((prev) => new Set(prev).add(id));
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />

      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      <FilterButton
        isOpen={isFilterOpen}
        activeFiltersCount={filters.getActiveFiltersCount()}
        label={filters.getActiveFilterLabel()}
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      />

      <FilterPanel
        isOpen={isFilterOpen}
        photos={photos}
        filteredPhotos={filters.filteredPhotos}
        categories={categoriesData}
        activeCategories={filters.activeCategories}
        activeSubcategories={filters.activeSubcategories}
        expandedCategories={filters.expandedCategories}
        onToggleCategoryExpand={filters.toggleCategoryExpand}
        onToggleCategoryFilter={filters.toggleCategoryFilter}
        onToggleSubcategoryFilter={filters.toggleSubcategoryFilter}
        onClearAllFilters={filters.clearAllFilters}
        onSelectAllSubcategories={filters.selectAllSubcategories}
        onDeselectAllSubcategories={filters.deselectAllSubcategories}
        getSubcategoryPhotoCount={filters.getSubcategoryPhotoCount}
        isAllSubcategoriesSelected={filters.isAllSubcategoriesSelected}
        isSomeSubcategoriesSelected={filters.isSomeSubcategoriesSelected}
        getActiveFiltersCount={filters.getActiveFiltersCount}
      />

      {isFilterOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      <main className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            isLoaded={isLoaded}
            activeCategories={filters.activeCategories}
            activeSubcategories={filters.activeSubcategories}
            categoriesData={categoriesData}
            onToggleCategoryFilter={filters.toggleCategoryFilter}
            onToggleSubcategoryFilter={filters.toggleSubcategoryFilter}
            onClearAllFilters={filters.clearAllFilters}
          />

          {/* Admin Upload Panel */}
          {isAdmin && (
            <div className="mb-8">
              <PhotoUploadPanel onUploadComplete={refresh} />
            </div>
          )}

          {isLoading && <LoadingState />}

          {!isLoading && filters.filteredPhotos.length === 0 && (
            <EmptyState hasPhotos={photos.length > 0} />
          )}

          {!isLoading && filters.filteredPhotos.length > 0 && (
            <PhotoGrid
              photos={filters.filteredPhotos}
              isLoaded={isLoaded}
              loadedImages={loadedImages}
              onImageLoad={handleImageLoad}
              onPhotoSelect={setSelectedPhoto}
              hasMore={!hasActiveFilters && hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
              // Admin props
              isAdmin={isAdmin}
              isDragEnabled={isDragEnabled}
              deletingPhotoId={photoAdmin.deletingPhotoId}
              onEdit={isAdmin ? handleEditPhoto : undefined}
              onDelete={isAdmin ? handleDeletePhoto : undefined}
            />
          )}
        </div>
      </main>

      {/* Edit Photo Modal */}
      {photoAdmin.editingPhoto && (
        <EditPhotoModal
          photo={photoAdmin.editingPhoto}
          form={photoAdmin.editForm}
          categories={photoAdmin.categories}
          onFormChange={photoAdmin.setEditForm}
          onSave={() => photoAdmin.handleSavePhoto(photoAdmin.editingPhoto!.id)}
          onCancel={photoAdmin.handleCancelEdit}
        />
      )}

      <PhotoLightbox
        photo={selectedPhoto}
        photos={filters.filteredPhotos}
        categoriesData={categoriesData}
        onClose={() => setSelectedPhoto(null)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onCategoryClick={(categoryName, categoryId) => {
          setSelectedPhoto(null);
          filters.toggleCategoryFilter(categoryName, categoryId);
        }}
        onSubcategoryClick={(categoryName, subcategoryName) => {
          setSelectedPhoto(null);
          if (!filters.activeCategories.has(categoryName)) {
            const category = categoriesData.find(
              (c) => c.name === categoryName
            );
            if (category) {
              filters.toggleCategoryFilter(categoryName, category.id);
            }
          }
          filters.toggleSubcategoryFilter(categoryName, subcategoryName);
        }}
      />
    </div>
  );
}

interface FilterButtonProps {
  isOpen: boolean;
  activeFiltersCount: number;
  label: string;
  onClick: () => void;
}

function FilterButton({
  isOpen,
  activeFiltersCount,
  label,
  onClick,
}: FilterButtonProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed right-4 top-24 z-40",
        "flex items-center gap-2 px-4 py-2.5 rounded-xl",
        "bg-card/95 backdrop-blur-sm border border-border/50",
        "shadow-lg shadow-black/10",
        "text-sm font-medium",
        "transition-all duration-200 cursor-pointer",
        "hover:bg-card hover:shadow-xl",
        isOpen && "bg-accent text-accent-foreground",
        activeFiltersCount > 0 && !isOpen && "border-accent/50"
      )}
    >
      <div className="relative">
        <Filter className="w-4 h-4" />
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-accent-foreground">
            {activeFiltersCount}
          </span>
        )}
      </div>
      <span className="hidden sm:inline">{label}</span>
      <ChevronDown
        className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

interface PageHeaderProps {
  isLoaded: boolean;
  activeCategories: Set<string>;
  activeSubcategories: Set<string>;
  categoriesData: Category[];
  onToggleCategoryFilter: (categoryName: string, categoryId: number) => void;
  onToggleSubcategoryFilter: (
    categoryName: string,
    subcategoryName: string
  ) => void;
  onClearAllFilters: () => void;
}

function PageHeader({
  isLoaded,
  activeCategories,
  activeSubcategories,
  categoriesData,
  onToggleCategoryFilter,
  onToggleSubcategoryFilter,
  onClearAllFilters,
}: PageHeaderProps): React.ReactElement {
  const hasActiveFilters =
    activeCategories.size > 0 || activeSubcategories.size > 0;

  return (
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

      {hasActiveFilters && (
        <ActiveFiltersDisplay
          activeCategories={activeCategories}
          activeSubcategories={activeSubcategories}
          categoriesData={categoriesData}
          onToggleCategoryFilter={onToggleCategoryFilter}
          onToggleSubcategoryFilter={onToggleSubcategoryFilter}
          onClearAllFilters={onClearAllFilters}
        />
      )}
    </div>
  );
}

interface ActiveFiltersDisplayProps {
  activeCategories: Set<string>;
  activeSubcategories: Set<string>;
  categoriesData: Category[];
  onToggleCategoryFilter: (categoryName: string, categoryId: number) => void;
  onToggleSubcategoryFilter: (
    categoryName: string,
    subcategoryName: string
  ) => void;
  onClearAllFilters: () => void;
}

function ActiveFiltersDisplay({
  activeCategories,
  activeSubcategories,
  categoriesData,
  onToggleCategoryFilter,
  onToggleSubcategoryFilter,
  onClearAllFilters,
}: ActiveFiltersDisplayProps): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-sm text-muted-foreground">Filtering by:</span>

      {Array.from(activeCategories).map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium"
        >
          <Folder className="w-3 h-3" />
          {cat}
          <button
            onClick={() => {
              const category = categoriesData.find((c) => c.name === cat);
              if (category) {
                onToggleCategoryFilter(cat, category.id);
              }
            }}
            className="ml-0.5 p-0.5 rounded-full hover:bg-accent/20 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

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
              onClick={() => onToggleSubcategoryFilter(categoryName, subName)}
              className="ml-0.5 p-0.5 rounded-full hover:bg-secondary/80 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      <button
        onClick={onClearAllFilters}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 cursor-pointer transition-colors"
      >
        <RotateCcw className="w-3 h-3" />
        Clear all
      </button>
    </div>
  );
}

function LoadingState(): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
      <p className="text-muted-foreground">Loading photos...</p>
    </div>
  );
}

function EmptyState({ hasPhotos }: { hasPhotos: boolean }): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">
        {hasPhotos
          ? "No photos in this category."
          : "No photos yet. Upload your first photo!"}
      </p>
    </div>
  );
}
