import { useState, useEffect, useCallback, useRef } from "react";
import { getPhotos, type Photo as ApiPhoto } from "@/services/photos.service";
import { mapApiPhotoToDisplay, type Photo } from "../types";

export const PAGE_SIZE = 45;

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalPhotos: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UsePaginatedPhotosReturn {
  photos: Photo[];
  apiPhotos: ApiPhoto[];
  isLoading: boolean;
  pagination: PaginationState;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => Promise<void>;
  setApiPhotos: React.Dispatch<React.SetStateAction<ApiPhoto[]>>;
  error: string | null;
}

const initialPagination: PaginationState = {
  currentPage: 1,
  totalPages: 1,
  totalPhotos: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export function usePaginatedPhotos(): UsePaginatedPhotosReturn {
  const [apiPhotos, setApiPhotos] = useState<ApiPhoto[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationState>(initialPagination);
  const totalPhotosRef = useRef(0);

  // Sync display photos when apiPhotos changes
  useEffect(() => {
    setPhotos(apiPhotos.map(mapApiPhotoToDisplay));
  }, [apiPhotos]);

  // Load photos for a specific page
  const loadPage = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const offset = (page - 1) * PAGE_SIZE;
      const data = await getPhotos({ limit: PAGE_SIZE, offset });

      setApiPhotos(data);

      // Update pagination state
      const totalPages = Math.max(1, Math.ceil(totalPhotosRef.current / PAGE_SIZE));
      setPagination({
        currentPage: page,
        totalPages,
        totalPhotos: totalPhotosRef.current,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    } catch (err) {
      console.error("Failed to load photos:", err);
      setError("Failed to load photos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load total count on mount
  const loadTotalCount = useCallback(async () => {
    try {
      const allPhotos = await getPhotos();
      totalPhotosRef.current = allPhotos.length;
      return allPhotos.length;
    } catch {
      return 0;
    }
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      const total = await loadTotalCount();
      totalPhotosRef.current = total;

      // Load first page
      await loadPage(1);
    }
    init();
  }, [loadPage, loadTotalCount]);

  const goToPage = useCallback(
    (page: number) => {
      const totalPages = Math.ceil(totalPhotosRef.current / PAGE_SIZE);
      if (page < 1 || page > totalPages) return;
      loadPage(page);
    },
    [loadPage]
  );

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination.hasNextPage, pagination.currentPage, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination.hasPrevPage, pagination.currentPage, goToPage]);

  const refresh = useCallback(async () => {
    const total = await loadTotalCount();
    totalPhotosRef.current = total;
    await loadPage(pagination.currentPage);
  }, [loadPage, loadTotalCount, pagination.currentPage]);

  return {
    photos,
    apiPhotos,
    isLoading,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    setApiPhotos,
    error,
  };
}
