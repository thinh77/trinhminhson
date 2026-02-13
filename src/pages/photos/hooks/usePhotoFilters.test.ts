import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { usePhotoFilters } from "./usePhotoFilters";
import type { Photo } from "../types";

function makePhoto(
  id: string,
  categories: string[],
  subcategories: string[]
): Photo {
  return {
    id,
    src: "",
    srcLarge: "",
    srcOriginal: "",
    alt: "",
    title: id,
    categories,
    subcategories,
    aspectRatio: "landscape",
  };
}

describe("usePhotoFilters", () => {
  const photos: Photo[] = [
    makePhoto("1", ["Travel"], ["Beach", "Mountain"]),
    makePhoto("2", ["Travel"], ["Beach"]),
    makePhoto("3", ["Travel"], ["Mountain"]),
    makePhoto("4", ["Travel", "Nature"], ["Beach", "Forest"]),
    makePhoto("5", ["Nature"], ["Forest"]),
  ];

  it("returns all photos when no filters selected", () => {
    const { result } = renderHook(() => usePhotoFilters(photos));
    expect(result.current.filteredPhotos).toHaveLength(5);
  });

  it("filters by category", () => {
    const { result } = renderHook(() => usePhotoFilters(photos));

    act(() => {
      result.current.toggleCategoryFilter("Travel", 1);
    });

    expect(result.current.filteredPhotos).toHaveLength(4);
    expect(result.current.filteredPhotos.map((p) => p.id)).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
  });

  it("filters by single subcategory", () => {
    const { result } = renderHook(() => usePhotoFilters(photos));

    act(() => {
      result.current.toggleCategoryFilter("Travel", 1);
    });
    act(() => {
      result.current.toggleSubcategoryFilter("Travel", "Beach");
    });

    // Photos 1, 2, 4 have Beach subcategory under Travel
    expect(result.current.filteredPhotos.map((p) => p.id)).toEqual([
      "1",
      "2",
      "4",
    ]);
  });

  it("uses intersection when multiple subcategories selected within same category", () => {
    const { result } = renderHook(() => usePhotoFilters(photos));

    act(() => {
      result.current.toggleCategoryFilter("Travel", 1);
    });
    act(() => {
      result.current.toggleSubcategoryFilter("Travel", "Beach");
    });
    act(() => {
      result.current.toggleSubcategoryFilter("Travel", "Mountain");
    });

    // Only photo 1 has BOTH Beach AND Mountain under Travel
    expect(result.current.filteredPhotos.map((p) => p.id)).toEqual(["1"]);
  });

  it("requires intersection for selected subcategories across categories", () => {
    const { result } = renderHook(() => usePhotoFilters(photos));

    act(() => {
      result.current.toggleCategoryFilter("Travel", 1);
    });
    act(() => {
      result.current.toggleCategoryFilter("Nature", 2);
    });
    act(() => {
      result.current.toggleSubcategoryFilter("Travel", "Beach");
    });
    act(() => {
      result.current.toggleSubcategoryFilter("Nature", "Forest");
    });

    // Selected subcategories from different categories should still use AND logic:
    // only photo 4 has BOTH Beach and Forest.
    expect(result.current.filteredPhotos.map((p) => p.id)).toEqual(["4"]);
  });

  it("clears all filters", () => {
    const { result } = renderHook(() => usePhotoFilters(photos));

    act(() => {
      result.current.toggleCategoryFilter("Travel", 1);
    });
    act(() => {
      result.current.toggleSubcategoryFilter("Travel", "Beach");
    });
    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.filteredPhotos).toHaveLength(5);
  });

  it("category without selected subcategories shows all photos in that category", () => {
    const { result } = renderHook(() => usePhotoFilters(photos));

    // Select Travel category + Travel:Beach subcategory
    // Also select Nature category but NO Nature subcategories
    act(() => {
      result.current.toggleCategoryFilter("Travel", 1);
    });
    act(() => {
      result.current.toggleCategoryFilter("Nature", 2);
    });
    act(() => {
      result.current.toggleSubcategoryFilter("Travel", "Beach");
    });

    // Travel photos must match Beach subcategory: 1, 2, 4
    // Nature photos (no sub filter): 4, 5
    // Combined (union of category results): 1, 2, 4, 5
    expect(result.current.filteredPhotos.map((p) => p.id)).toEqual([
      "1",
      "2",
      "4",
      "5",
    ]);
  });
});
