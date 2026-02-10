import { useState, useCallback, useMemo } from "react";

export const ZOOM_LEVELS = [1, 2, 4, 10] as const;

type ZoomLevel = (typeof ZOOM_LEVELS)[number];

interface Position {
  x: number;
  y: number;
}

export interface UseImageZoomReturn {
  zoomLevel: ZoomLevel;
  position: Position;
  isZoomedIn: boolean;
  shouldUseOriginal: boolean;
  imageTransform: string;
  setZoomLevel: (level: number) => void;
  setPosition: (pos: Position) => void;
  cycleZoom: () => void;
  resetZoom: () => void;
}

const ORIGIN: Position = { x: 0, y: 0 };
const ORIGINAL_THRESHOLD = 4;

function isValidZoomLevel(level: number): level is ZoomLevel {
  return (ZOOM_LEVELS as readonly number[]).includes(level);
}

export function useImageZoom(): UseImageZoomReturn {
  const [zoomLevel, setZoomLevelState] = useState<ZoomLevel>(1);
  const [position, setPositionState] = useState<Position>(ORIGIN);

  const isZoomedIn = zoomLevel > 1;
  const shouldUseOriginal = zoomLevel >= ORIGINAL_THRESHOLD;

  const setZoomLevel = useCallback((level: number) => {
    if (!isValidZoomLevel(level)) return;
    setZoomLevelState(level);
    if (level === 1) {
      setPositionState(ORIGIN);
    }
  }, []);

  const setPosition = useCallback(
    (pos: Position) => {
      setZoomLevelState((currentZoom) => {
        if (currentZoom === 1) return currentZoom;
        setPositionState(pos);
        return currentZoom;
      });
    },
    []
  );

  const cycleZoom = useCallback(() => {
    setZoomLevelState((current) => {
      const currentIndex = ZOOM_LEVELS.indexOf(current);
      const nextIndex = (currentIndex + 1) % ZOOM_LEVELS.length;
      const nextLevel = ZOOM_LEVELS[nextIndex];
      if (nextLevel === 1) {
        setPositionState(ORIGIN);
      }
      return nextLevel;
    });
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevelState(1);
    setPositionState(ORIGIN);
  }, []);

  const imageTransform = useMemo(
    () => `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
    [zoomLevel, position]
  );

  return {
    zoomLevel,
    position,
    isZoomedIn,
    shouldUseOriginal,
    imageTransform,
    setZoomLevel,
    setPosition,
    cycleZoom,
    resetZoom,
  };
}
