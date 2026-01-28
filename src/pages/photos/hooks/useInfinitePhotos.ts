import { useState, useEffect, useCallback, useRef } from "react";
import { getPhotos, type Photo as ApiPhoto } from "@/services/photos.service";
import { mapApiPhotoToDisplay, type Photo } from "../types";

const PAGE_SIZE = 3;

interface UseInfinitePhotosReturn {
  photos: Photo[];
  apiPhotos: ApiPhoto[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  loadAll: () => Promise<void>;
  refresh: () => Promise<void>;
  setApiPhotos: React.Dispatch<React.SetStateAction<ApiPhoto[]>>;
  error: string | null;
}

export function useInfinitePhotos(): UseInfinitePhotosReturn {
  const [apiPhotos, setApiPhotos] = useState<ApiPhoto[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef(0);
  const allLoadedRef = useRef(false);

  // Sync display photos when apiPhotos changes
  useEffect(() => {
    setPhotos(apiPhotos.map(mapApiPhotoToDisplay));
  }, [apiPhotos]);

  useEffect(() => {
    async function loadInitialPhotos(): Promise<void> {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getPhotos({ limit: PAGE_SIZE, offset: 0 });
        setApiPhotos(data);
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
      
      setApiPhotos((prev) => [...prev, ...data]);
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
      setApiPhotos(data);
      allLoadedRef.current = true;
      setHasMore(false);
    } catch (err) {
      console.error("Failed to load all photos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore]);

  // Refresh all photos from server
  const refresh = useCallback(async () => {
    try {
      const data = await getPhotos();
      setApiPhotos(data);
      allLoadedRef.current = true;
      setHasMore(false);
    } catch (err) {
      console.error("Failed to refresh photos:", err);
    }
  }, []);

  return {
    photos,
    apiPhotos,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    loadAll,
    refresh,
    setApiPhotos,
    error,
  };
}
