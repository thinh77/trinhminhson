import { useState, useCallback, useMemo } from "react";
import type { Category } from "@/services/categories.service";
import type { Photo } from "../types";

export interface UsePhotoFiltersReturn {
  activeCategories: Set<string>;
  activeSubcategories: Set<string>;
  expandedCategories: Set<number>;
  filteredPhotos: Photo[];
  toggleCategoryExpand: (categoryId: number) => void;
  toggleCategoryFilter: (categoryName: string, categoryId: number) => void;
  toggleSubcategoryFilter: (categoryName: string, subcategoryName: string) => void;
  clearAllFilters: () => void;
  selectAllSubcategories: (category: Category) => void;
  deselectAllSubcategories: (categoryName: string) => void;
  getSubcategoryPhotoCount: (categoryName: string, subcategoryName: string) => number;
  isAllSubcategoriesSelected: (category: Category) => boolean;
  isSomeSubcategoriesSelected: (categoryName: string) => boolean;
  getActiveFilterLabel: () => string;
  getActiveFiltersCount: () => number;
}

export function usePhotoFilters(photos: Photo[]): UsePhotoFiltersReturn {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [activeSubcategories, setActiveSubcategories] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      if (activeCategories.size === 0) return true;

      const categoryMatch = p.categories.some((cat) => activeCategories.has(cat));
      if (!categoryMatch) return false;

      if (activeSubcategories.size > 0) {
        const subsArray = Array.from(activeSubcategories);

        // Group selected subcategories by their parent category
        const subsByCategory = new Map<string, string[]>();
        for (const sub of subsArray) {
          const [cat, subName] = sub.split(":");
          const existing = subsByCategory.get(cat) || [];
          subsByCategory.set(cat, [...existing, subName]);
        }

        // Categories that have subcategory filters
        const categoriesWithSubs = new Set(subsByCategory.keys());

        // Check which active categories the photo belongs to
        const photoActiveCategories = p.categories.filter((cat) =>
          activeCategories.has(cat)
        );

        // Photo must satisfy subcategory filters for each of its categories
        // that have selected subcategories (intersection logic)
        const hasSubFilteredCategory = photoActiveCategories.some((cat) =>
          categoriesWithSubs.has(cat)
        );

        if (hasSubFilteredCategory) {
          // For each of photo's categories that have sub filters,
          // photo must have ALL selected subcategories (intersection)
          return photoActiveCategories.every((cat) => {
            const requiredSubs = subsByCategory.get(cat);
            if (!requiredSubs) return true; // no sub filter for this category
            return requiredSubs.every((subName) =>
              p.subcategories.includes(subName)
            );
          });
        }

        // Photo only belongs to categories without sub filters - show it
        return true;
      }

      return true;
    });
  }, [photos, activeCategories, activeSubcategories]);

  const toggleCategoryExpand = useCallback((categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const toggleCategoryFilter = useCallback((categoryName: string, categoryId: number) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
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
        setExpandedCategories((prev) => new Set(prev).add(categoryId));
      }
      return next;
    });
  }, []);

  const toggleSubcategoryFilter = useCallback(
    (categoryName: string, subcategoryName: string) => {
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
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    setActiveCategories(new Set());
    setActiveSubcategories(new Set());
  }, []);

  const selectAllSubcategories = useCallback((category: Category) => {
    const allSubs = category.subcategories.map(
      (sub) => `${category.name}:${sub.name}`
    );
    setActiveSubcategories((prev) => {
      const next = new Set(prev);
      allSubs.forEach((sub) => next.add(sub));
      return next;
    });
  }, []);

  const deselectAllSubcategories = useCallback((categoryName: string) => {
    setActiveSubcategories((prev) => {
      const next = new Set(prev);
      Array.from(next).forEach((sub) => {
        if (sub.startsWith(`${categoryName}:`)) {
          next.delete(sub);
        }
      });
      return next;
    });
  }, []);

  const getSubcategoryPhotoCount = useCallback(
    (categoryName: string, subcategoryName: string) => {
      return photos.filter(
        (p) =>
          p.categories.includes(categoryName) && p.subcategories.includes(subcategoryName)
      ).length;
    },
    [photos]
  );

  const isAllSubcategoriesSelected = useCallback(
    (category: Category) => {
      return category.subcategories.every((sub) =>
        activeSubcategories.has(`${category.name}:${sub.name}`)
      );
    },
    [activeSubcategories]
  );

  const isSomeSubcategoriesSelected = useCallback(
    (categoryName: string) => {
      return Array.from(activeSubcategories).some((sub) =>
        sub.startsWith(`${categoryName}:`)
      );
    },
    [activeSubcategories]
  );

  const getActiveFilterLabel = useCallback(() => {
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
  }, [activeCategories, activeSubcategories]);

  const getActiveFiltersCount = useCallback(() => {
    return activeCategories.size + activeSubcategories.size;
  }, [activeCategories, activeSubcategories]);

  return {
    activeCategories,
    activeSubcategories,
    expandedCategories,
    filteredPhotos,
    toggleCategoryExpand,
    toggleCategoryFilter,
    toggleSubcategoryFilter,
    clearAllFilters,
    selectAllSubcategories,
    deselectAllSubcategories,
    getSubcategoryPhotoCount,
    isAllSubcategoriesSelected,
    isSomeSubcategoriesSelected,
    getActiveFilterLabel,
    getActiveFiltersCount,
  };
}
