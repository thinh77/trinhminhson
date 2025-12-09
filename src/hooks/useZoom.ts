import { useRef, useEffect } from "react";

// Zoom limits
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 2;
export const ZOOM_STEP = 0.1;

interface UseZoomProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  panOffset: { x: number; y: number };
  zoom: number;
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
}

export function useZoom({ boardRef, panOffset, zoom, setZoom, setPanOffset }: UseZoomProps) {
  const zoomRef = useRef(zoom);
  const panOffsetRef = useRef(panOffset);

  // Keep refs in sync
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  // Zoom with center point preservation
  const handleZoom = (newZoom: number) => {
    if (!boardRef.current) {
      setZoom(newZoom);
      return;
    }
    
    // Clamp zoom value
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    
    const board = boardRef.current.getBoundingClientRect();
    const centerX = board.width / 2;
    const centerY = board.height / 2;
    
    // Calculate the point in canvas coordinates that's at the center of viewport
    const canvasCenterX = (centerX - panOffset.x) / zoom;
    const canvasCenterY = (centerY - panOffset.y) / zoom;
    
    // Calculate new pan offset to keep the same canvas point at center after zoom
    const newPanX = centerX - canvasCenterX * clampedZoom;
    const newPanY = centerY - canvasCenterY * clampedZoom;
    
    setPanOffset({ x: newPanX, y: newPanY });
    setZoom(clampedZoom);
  };

  // Handle wheel zoom (desktop)
  const handleWheel = (e: WheelEvent) => {
    if (!boardRef.current) return;
    
    e.preventDefault();
    
    const board = boardRef.current.getBoundingClientRect();
    const cursorX = e.clientX - board.left;
    const cursorY = e.clientY - board.top;
    
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current + delta));
    
    if (newZoom === zoomRef.current) return;
    
    const canvasX = (cursorX - panOffsetRef.current.x) / zoomRef.current;
    const canvasY = (cursorY - panOffsetRef.current.y) / zoomRef.current;
    
    const newPanX = cursorX - canvasX * newZoom;
    const newPanY = cursorY - canvasY * newZoom;
    
    panOffsetRef.current = { x: newPanX, y: newPanY };
    setPanOffset({ x: newPanX, y: newPanY });
    zoomRef.current = newZoom;
    setZoom(newZoom);
  };

  // Add wheel zoom listener
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    
    board.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      board.removeEventListener('wheel', handleWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { handleZoom, zoomRef };
}
