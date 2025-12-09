import { useRef, useEffect } from "react";
import { MIN_ZOOM, MAX_ZOOM } from "./useZoom";

interface UsePinchZoomProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  setZoom: (zoom: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;
  isPanning: boolean;
  setIsPanning: (isPanning: boolean) => void;
}

export function usePinchZoom({
  boardRef,
  zoom,
  setZoom,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
}: UsePinchZoomProps) {
  const zoomRef = useRef(zoom);
  const panOffsetRef = useRef(panOffset);
  const isPanningRef = useRef(isPanning);
  
  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number>(1);
  const pinchCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pinchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanBeforePinchRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Keep refs in sync
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);

  // Calculate distance between two touch points
  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center point between two touches
  const getTouchCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  // Handle touch start for pinch zoom
  const handlePinchStart = (e: TouchEvent) => {
    if (e.touches.length === 2 && boardRef.current) {
      e.preventDefault();
      isPanningRef.current = false;
      setIsPanning(false);
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      pinchStartDistanceRef.current = getTouchDistance(touch1, touch2);
      pinchStartZoomRef.current = zoomRef.current;
      
      const hasInitialPan = initialPanBeforePinchRef.current.x !== 0 || 
                           initialPanBeforePinchRef.current.y !== 0 ||
                           (panOffsetRef.current.x !== initialPanBeforePinchRef.current.x || 
                            panOffsetRef.current.y !== initialPanBeforePinchRef.current.y);
      
      if (hasInitialPan) {
        panOffsetRef.current = { ...initialPanBeforePinchRef.current };
        setPanOffset({ ...initialPanBeforePinchRef.current });
      }
      
      pinchStartPanRef.current = { ...panOffsetRef.current };
      
      const board = boardRef.current.getBoundingClientRect();
      const center = getTouchCenter(touch1, touch2);
      pinchCenterRef.current = {
        x: center.x - board.left,
        y: center.y - board.top,
      };
      
      initialPanBeforePinchRef.current = { x: 0, y: 0 };
    }
  };

  // Handle touch move for pinch zoom
  const handlePinchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistanceRef.current !== null && boardRef.current) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      
      const currentDistance = getTouchDistance(touch1, touch2);
      const scale = currentDistance / pinchStartDistanceRef.current;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * scale));
      
      const canvasX = (pinchCenterRef.current.x - pinchStartPanRef.current.x) / pinchStartZoomRef.current;
      const canvasY = (pinchCenterRef.current.y - pinchStartPanRef.current.y) / pinchStartZoomRef.current;
      
      const newPanX = pinchCenterRef.current.x - canvasX * newZoom;
      const newPanY = pinchCenterRef.current.y - canvasY * newZoom;
      
      panOffsetRef.current = { x: newPanX, y: newPanY };
      setPanOffset({ x: newPanX, y: newPanY });
      zoomRef.current = newZoom;
      setZoom(newZoom);
    }
  };

  // Handle touch end for pinch zoom
  const handlePinchEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      pinchStartDistanceRef.current = null;
    }
    if (e.touches.length === 0) {
      initialPanBeforePinchRef.current = { x: 0, y: 0 };
    }
  };

  // Add pinch zoom listeners
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    
    board.addEventListener('touchstart', handlePinchStart, { passive: false });
    board.addEventListener('touchmove', handlePinchMove, { passive: false });
    board.addEventListener('touchend', handlePinchEnd);
    board.addEventListener('touchcancel', handlePinchEnd);
    
    return () => {
      board.removeEventListener('touchstart', handlePinchStart);
      board.removeEventListener('touchmove', handlePinchMove);
      board.removeEventListener('touchend', handlePinchEnd);
      board.removeEventListener('touchcancel', handlePinchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { initialPanBeforePinchRef };
}
