import { cn } from "@/lib/utils";
import {
  Filter,
  ChevronDown,
  Camera,
  RotateCcw,
  FolderOpen,
  Folder,
  Tag,
  Check,
} from "lucide-react";
import type { Category } from "@/services/categories.service";
import type { Photo } from "../types";

interface FilterPanelProps {
  isOpen: boolean;
  photos: Photo[];
  filteredPhotos: Photo[];
  categories: Category[];
  activeCategories: Set<string>;
  activeSubcategories: Set<string>;
  expandedCategories: Set<number>;
  onToggleCategoryExpand: (categoryId: number) => void;
  onToggleCategoryFilter: (categoryName: string, categoryId: number) => void;
  onToggleSubcategoryFilter: (
    categoryName: string,
    subcategoryName: string
  ) => void;
  onClearAllFilters: () => void;
  onSelectAllSubcategories: (category: Category) => void;
  onDeselectAllSubcategories: (categoryName: string) => void;
  getSubcategoryPhotoCount: (
    categoryName: string,
    subcategoryName: string
  ) => number;
  isAllSubcategoriesSelected: (category: Category) => boolean;
  isSomeSubcategoriesSelected: (categoryName: string) => boolean;
  getActiveFiltersCount: () => number;
}

export function FilterPanel({
  isOpen,
  photos,
  filteredPhotos,
  categories,
  activeCategories,
  activeSubcategories,
  expandedCategories,
  onToggleCategoryExpand,
  onToggleCategoryFilter,
  onToggleSubcategoryFilter,
  onClearAllFilters,
  onSelectAllSubcategories,
  onDeselectAllSubcategories,
  getSubcategoryPhotoCount,
  isAllSubcategoriesSelected,
  isSomeSubcategoriesSelected,
  getActiveFiltersCount,
}: FilterPanelProps): React.ReactElement {
  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div
      className={cn(
        "fixed right-4 top-40 z-40",
        "w-72 sm:w-80 max-h-[calc(100vh-12rem)]",
        "bg-card/95 backdrop-blur-sm border border-border/50",
        "rounded-xl shadow-xl shadow-black/10",
        "overflow-hidden",
        "transition-all duration-300 ease-out",
        isOpen
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-4 pointer-events-none"
      )}
    >
      <FilterPanelHeader
        activeFiltersCount={activeFiltersCount}
        onClearAll={onClearAllFilters}
      />

      <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
        <FilterStats
          filteredCount={filteredPhotos.length}
          totalCount={photos.length}
          activeFiltersCount={activeFiltersCount}
        />

        <div className="p-2">
          <AllPhotosButton
            isSelected={activeCategories.size === 0}
            totalCount={photos.length}
            onClick={onClearAllFilters}
          />

          <CategoriesSection
            categories={categories}
            photos={photos}
            activeCategories={activeCategories}
            activeSubcategories={activeSubcategories}
            expandedCategories={expandedCategories}
            onToggleCategoryExpand={onToggleCategoryExpand}
            onToggleCategoryFilter={onToggleCategoryFilter}
            onToggleSubcategoryFilter={onToggleSubcategoryFilter}
            onSelectAllSubcategories={onSelectAllSubcategories}
            onDeselectAllSubcategories={onDeselectAllSubcategories}
            getSubcategoryPhotoCount={getSubcategoryPhotoCount}
            isAllSubcategoriesSelected={isAllSubcategoriesSelected}
            isSomeSubcategoriesSelected={isSomeSubcategoriesSelected}
          />
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <div className="p-3 border-t border-border/50 bg-secondary/20">
          <p className="text-xs text-center text-muted-foreground">
            Filters apply automatically
          </p>
        </div>
      )}
    </div>
  );
}

function FilterPanelHeader({
  activeFiltersCount,
  onClearAll,
}: {
  activeFiltersCount: number;
  onClearAll: () => void;
}): React.ReactElement {
  return (
    <div className="p-3 border-b border-border/50 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Filter className="w-4 h-4 text-accent" />
        Filter Photos
      </h3>
      {activeFiltersCount > 0 && (
        <button
          onClick={onClearAll}
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
  );
}

function FilterStats({
  filteredCount,
  totalCount,
  activeFiltersCount,
}: {
  filteredCount: number;
  totalCount: number;
  activeFiltersCount: number;
}): React.ReactElement {
  return (
    <div className="px-3 py-2 bg-secondary/30 border-b border-border/30">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filteredCount} of {totalCount} photos
        </span>
        {activeFiltersCount > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-accent/20 text-accent font-medium">
            {activeFiltersCount} active
          </span>
        )}
      </div>
    </div>
  );
}

function AllPhotosButton({
  isSelected,
  totalCount,
  onClick,
}: {
  isSelected: boolean;
  totalCount: number;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm",
        "transition-all duration-150 cursor-pointer",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-secondary/50"
      )}
    >
      <Camera className="w-4 h-4" />
      <span className="font-medium flex-1 text-left">All Photos</span>
      <span className="text-xs opacity-70 tabular-nums">{totalCount}</span>
    </button>
  );
}

interface CategoriesSectionProps {
  categories: Category[];
  photos: Photo[];
  activeCategories: Set<string>;
  activeSubcategories: Set<string>;
  expandedCategories: Set<number>;
  onToggleCategoryExpand: (categoryId: number) => void;
  onToggleCategoryFilter: (categoryName: string, categoryId: number) => void;
  onToggleSubcategoryFilter: (
    categoryName: string,
    subcategoryName: string
  ) => void;
  onSelectAllSubcategories: (category: Category) => void;
  onDeselectAllSubcategories: (categoryName: string) => void;
  getSubcategoryPhotoCount: (
    categoryName: string,
    subcategoryName: string
  ) => number;
  isAllSubcategoriesSelected: (category: Category) => boolean;
  isSomeSubcategoriesSelected: (categoryName: string) => boolean;
}

function CategoriesSection({
  categories,
  photos,
  activeCategories,
  activeSubcategories,
  expandedCategories,
  onToggleCategoryExpand,
  onToggleCategoryFilter,
  onToggleSubcategoryFilter,
  onSelectAllSubcategories,
  onDeselectAllSubcategories,
  getSubcategoryPhotoCount,
  isAllSubcategoriesSelected,
  isSomeSubcategoriesSelected,
}: CategoriesSectionProps): React.ReactElement {
  return (
    <div className="mt-3">
      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Categories
      </div>
      <div className="space-y-0.5">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            photoCount={
              photos.filter((p) => p.categories.includes(category.name)).length
            }
            isExpanded={expandedCategories.has(category.id)}
            isSelected={activeCategories.has(category.name)}
            hasSomeSubsSelected={isSomeSubcategoriesSelected(category.name)}
            hasAllSubsSelected={isAllSubcategoriesSelected(category)}
            activeSubcategories={activeSubcategories}
            onToggleExpand={() => onToggleCategoryExpand(category.id)}
            onToggleFilter={() =>
              onToggleCategoryFilter(category.name, category.id)
            }
            onToggleSubcategoryFilter={onToggleSubcategoryFilter}
            onSelectAllSubcategories={() => onSelectAllSubcategories(category)}
            onDeselectAllSubcategories={() =>
              onDeselectAllSubcategories(category.name)
            }
            getSubcategoryPhotoCount={getSubcategoryPhotoCount}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
  photoCount: number;
  isExpanded: boolean;
  isSelected: boolean;
  hasSomeSubsSelected: boolean;
  hasAllSubsSelected: boolean;
  activeSubcategories: Set<string>;
  onToggleExpand: () => void;
  onToggleFilter: () => void;
  onToggleSubcategoryFilter: (
    categoryName: string,
    subcategoryName: string
  ) => void;
  onSelectAllSubcategories: () => void;
  onDeselectAllSubcategories: () => void;
  getSubcategoryPhotoCount: (
    categoryName: string,
    subcategoryName: string
  ) => number;
}

function CategoryItem({
  category,
  photoCount,
  isExpanded,
  isSelected,
  hasSomeSubsSelected,
  hasAllSubsSelected,
  activeSubcategories,
  onToggleExpand,
  onToggleFilter,
  onToggleSubcategoryFilter,
  onSelectAllSubcategories,
  onDeselectAllSubcategories,
  getSubcategoryPhotoCount,
}: CategoryItemProps): React.ReactElement {
  const hasSubcategories =
    category.subcategories && category.subcategories.length > 0;

  return (
    <div className="rounded-lg overflow-hidden">
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-2 rounded-lg",
          "transition-colors duration-150",
          isSelected ? "bg-accent/10" : "hover:bg-secondary/30"
        )}
      >
        {hasSubcategories ? (
          <button
            onClick={onToggleExpand}
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

        <label className="flex items-center gap-3 flex-1 cursor-pointer select-none py-0.5">
          <CategoryCheckbox
            isSelected={isSelected}
            hasSomeSubsSelected={hasSomeSubsSelected}
            onClick={onToggleFilter}
          />

          {isExpanded && isSelected ? (
            <FolderOpen className="w-4 h-4 text-accent" />
          ) : (
            <Folder
              className={cn(
                "w-4 h-4",
                isSelected ? "text-accent" : "text-muted-foreground"
              )}
            />
          )}

          <span
            className={cn(
              "font-medium truncate flex-1",
              isSelected ? "text-foreground" : "text-foreground/80"
            )}
          >
            {category.name}
          </span>

          <span
            className={cn(
              "text-xs tabular-nums px-1.5 py-0.5 rounded-md",
              isSelected ? "bg-accent/20 text-accent" : "text-muted-foreground"
            )}
          >
            {photoCount}
          </span>
        </label>
      </div>

      {hasSubcategories && isExpanded && (
        <SubcategoriesList
          category={category}
          isParentSelected={isSelected}
          activeSubcategories={activeSubcategories}
          hasAllSubsSelected={hasAllSubsSelected}
          hasSomeSubsSelected={hasSomeSubsSelected}
          onToggleSubcategoryFilter={onToggleSubcategoryFilter}
          onSelectAllSubcategories={onSelectAllSubcategories}
          onDeselectAllSubcategories={onDeselectAllSubcategories}
          getSubcategoryPhotoCount={getSubcategoryPhotoCount}
        />
      )}
    </div>
  );
}

function CategoryCheckbox({
  isSelected,
  hasSomeSubsSelected,
  onClick,
}: {
  isSelected: boolean;
  hasSomeSubsSelected: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-md border-2 flex items-center justify-center",
        "transition-all duration-150",
        isSelected
          ? "bg-accent border-accent"
          : hasSomeSubsSelected
          ? "bg-accent/30 border-accent/50"
          : "border-border hover:border-accent/50"
      )}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {isSelected && <Check className="w-3.5 h-3.5 text-accent-foreground" />}
      {!isSelected && hasSomeSubsSelected && (
        <div className="w-2 h-2 rounded-sm bg-accent" />
      )}
    </div>
  );
}

interface SubcategoriesListProps {
  category: Category;
  isParentSelected: boolean;
  activeSubcategories: Set<string>;
  hasAllSubsSelected: boolean;
  hasSomeSubsSelected: boolean;
  onToggleSubcategoryFilter: (
    categoryName: string,
    subcategoryName: string
  ) => void;
  onSelectAllSubcategories: () => void;
  onDeselectAllSubcategories: () => void;
  getSubcategoryPhotoCount: (
    categoryName: string,
    subcategoryName: string
  ) => number;
}

function SubcategoriesList({
  category,
  isParentSelected,
  activeSubcategories,
  hasAllSubsSelected,
  hasSomeSubsSelected,
  onToggleSubcategoryFilter,
  onSelectAllSubcategories,
  onDeselectAllSubcategories,
  getSubcategoryPhotoCount,
}: SubcategoriesListProps): React.ReactElement {
  return (
    <div
      className={cn(
        "ml-8 mt-1 mb-2 pl-3 border-l-2",
        isParentSelected ? "border-accent/30" : "border-border/30"
      )}
    >
      {category.subcategories.length > 1 && (
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <button
            onClick={onSelectAllSubcategories}
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
          <span className="text-muted-foreground/30">|</span>
          <button
            onClick={onDeselectAllSubcategories}
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
      )}

      <div className="space-y-0.5">
        {category.subcategories.map((sub) => {
          const subKey = `${category.name}:${sub.name}`;
          const isSubSelected = activeSubcategories.has(subKey);
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
                  : isParentSelected
                  ? "hover:bg-secondary/30"
                  : "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded border-2 flex items-center justify-center",
                  "transition-all duration-150",
                  !isParentSelected && "opacity-50",
                  isSubSelected
                    ? "bg-accent border-accent"
                    : "border-border/70 hover:border-accent/50"
                )}
                onClick={(e) => {
                  if (!isParentSelected) return;
                  e.preventDefault();
                  onToggleSubcategoryFilter(category.name, sub.name);
                }}
              >
                {isSubSelected && (
                  <Check className="w-3 h-3 text-accent-foreground" />
                )}
              </div>

              <Tag
                className={cn(
                  "w-3.5 h-3.5",
                  isSubSelected ? "text-accent" : "text-muted-foreground"
                )}
              />

              <span
                className={cn(
                  "text-sm truncate flex-1",
                  isSubSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {sub.name}
              </span>

              <span
                className={cn(
                  "text-xs tabular-nums",
                  isSubSelected ? "text-accent" : "text-muted-foreground/70"
                )}
              >
                {subPhotoCount}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
