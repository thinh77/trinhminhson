import { useRef, useEffect } from "react";

interface UsePanProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  panOffset: { x: number; y: number };
  setPanOffset: (offset: { x: number; y: number }) => void;
  isPanning: boolean;
  setIsPanning: (isPanning: boolean) => void;
  initialPanBeforePinchRef: React.RefObject<{ x: number; y: number }>;
}

export function usePan({
  boardRef,
  panOffset,
  setPanOffset,
  isPanning,
  setIsPanning,
  initialPanBeforePinchRef,
}: UsePanProps) {
  const panOffsetRef = useRef(panOffset);
  const isPanningRef = useRef(isPanning);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keep refs in sync
  useEffect(() => {
    panOffsetRef.current = panOffset;
  }, [panOffset]);

  useEffect(() => {
    isPanningRef.current = isPanning;
  }, [isPanning]);

  // Mouse pan handlers
  const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) {
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanMove = (e: MouseEvent) => {
    if (isPanningRef.current && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      
      const newPanX = panOffsetRef.current.x + dx;
      const newPanY = panOffsetRef.current.y + dy;
      
      panOffsetRef.current = { x: newPanX, y: newPanY };
      setPanOffset({ x: newPanX, y: newPanY });
      
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePanEnd = () => {
    isPanningRef.current = false;
    setIsPanning(false);
    panStartRef.current = null;
  };

  // Touch pan handlers
  const handlePanTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      e.preventDefault();
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      
      // Save initial pan offset when first touch occurs
      if (initialPanBeforePinchRef.current) {
        initialPanBeforePinchRef.current.x = panOffsetRef.current.x;
        initialPanBeforePinchRef.current.y = panOffsetRef.current.y;
      }
    } else {
      // When second finger touches, stop panning
      isPanningRef.current = false;
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  const handlePanTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isPanningRef.current && panStartRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - panStartRef.current.x;
      const dy = touch.clientY - panStartRef.current.y;
      
      const newPanX = panOffsetRef.current.x + dx;
      const newPanY = panOffsetRef.current.y + dy;
      
      panOffsetRef.current = { x: newPanX, y: newPanY };
      setPanOffset({ x: newPanX, y: newPanY });
      
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
      
      // Update initial pan during single-finger movement
      if (initialPanBeforePinchRef.current) {
        initialPanBeforePinchRef.current.x = newPanX;
        initialPanBeforePinchRef.current.y = newPanY;
      }
    }
  };

  const handlePanTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      isPanningRef.current = false;
      setIsPanning(false);
      panStartRef.current = null;
    }
  };

  // Add event listeners
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    // Mouse events
    const handleMouseMove = (e: MouseEvent) => handlePanMove(e);
    const handleMouseUp = () => handlePanEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Touch events
    board.addEventListener('touchstart', handlePanTouchStart, { passive: false });
    board.addEventListener('touchmove', handlePanTouchMove, { passive: false });
    board.addEventListener('touchend', handlePanTouchEnd);
    board.addEventListener('touchcancel', handlePanTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      board.removeEventListener('touchstart', handlePanTouchStart);
      board.removeEventListener('touchmove', handlePanTouchMove);
      board.removeEventListener('touchend', handlePanTouchEnd);
      board.removeEventListener('touchcancel', handlePanTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { handlePanStart };
}
