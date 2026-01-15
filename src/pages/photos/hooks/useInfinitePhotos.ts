import { useState, useEffect, useCallback, useRef } from "react";
import { getPhotos } from "@/services/photos.service";
import { mapApiPhotoToDisplay, type Photo } from "../types";

const PAGE_SIZE = 3;

interface UseInfinitePhotosReturn {
  photos: Photo[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  loadAll: () => Promise<void>;
  error: string | null;
}

export function useInfinitePhotos(): UseInfinitePhotosReturn {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const allLoadedRef = useRef(false);

  useEffect(() => {
    async function loadInitialPhotos(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPhotos({ limit: PAGE_SIZE, offset: 0 });
        setPhotos(data.map(mapApiPhotoToDisplay));
        offsetRef.current = data.length;
        setHasMore(data.length === PAGE_SIZE);
      } catch (err) {
        console.error("Failed to load photos:", err);
        setError("Failed to load photos");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialPhotos();
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || allLoadedRef.current) return;

    try {
      setIsLoadingMore(true);
      const data = await getPhotos({ limit: PAGE_SIZE, offset: offsetRef.current });
      const newPhotos = data.map(mapApiPhotoToDisplay);
      
      setPhotos((prev) => [...prev, ...newPhotos]);
      offsetRef.current += data.length;
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to load more photos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  // Load all remaining photos (for filtering)
  const loadAll = useCallback(async () => {
    if (allLoadedRef.current || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const data = await getPhotos(); // Load all without pagination
      setPhotos(data.map(mapApiPhotoToDisplay));
      allLoadedRef.current = true;
      setHasMore(false);
    } catch (err) {
      console.error("Failed to load all photos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore]);

  return {
    photos,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    loadAll,
    error,
  };
}
