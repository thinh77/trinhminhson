import { useRef, useEffect } from "react";

interface UsePanProps {
    boardRef: React.RefObject<HTMLDivElement | null>;
    panOffset: { x: number; y: number };
    setPanOffset: (offset: { x: number; y: number }) => void;
    isPanning: boolean;
    setIsPanning: (isPanning: boolean) => void;
    initialPanBeforePinchRef: React.RefObject<{ x: number; y: number }>;
    draggingNoteId: number | null;
}

export function usePan({
    boardRef,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    initialPanBeforePinchRef,
    draggingNoteId,
}: UsePanProps) {
    const panOffsetRef = useRef(panOffset);
    const isPanningRef = useRef(isPanning);
    const panStartRef = useRef({ x: 0, y: 0 });
    const draggingNoteIdRef = useRef(draggingNoteId);

    // Keep refs in sync
    useEffect(() => {
        panOffsetRef.current = panOffset;
    }, [panOffset]);

    useEffect(() => {
        isPanningRef.current = isPanning;
    }, [isPanning]);

    useEffect(() => {
        draggingNoteIdRef.current = draggingNoteId;
    }, [draggingNoteId]);

    // Mouse pan handlers - match original code logic
    const handlePanStart = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only pan if clicking on the board itself, not on notes
        if ((e.target as HTMLElement).closest(".sticky-note")) return;
        // Don't pan if dragging a note
        if (draggingNoteIdRef.current !== null) return;

        e.preventDefault();
        setIsPanning(true);
        isPanningRef.current = true;
        // Store start point relative to current pan offset (original logic)
        panStartRef.current = {
            x: e.clientX - panOffsetRef.current.x,
            y: e.clientY - panOffsetRef.current.y,
        };
    };

    const handlePanMove = (e: MouseEvent) => {
        if (!isPanningRef.current) return;

        e.preventDefault();
        // Calculate new pan directly from mouse position (original logic)
        const newX = e.clientX - panStartRef.current.x;
        const newY = e.clientY - panStartRef.current.y;

        panOffsetRef.current = { x: newX, y: newY };
        setPanOffset({ x: newX, y: newY });
    };

    const handlePanEnd = () => {
        isPanningRef.current = false;
        setIsPanning(false);
        panStartRef.current = { x: 0, y: 0 };
    };

    // Touch pan handlers - match original code logic
    const handlePanTouchStart = (e: TouchEvent) => {
        // Only pan with single finger, not during pinch
        if (e.touches.length !== 1) return;
        // Don't pan if touching on a note - let note handle its own drag
        const target = e.target as HTMLElement;
        if (target.closest(".sticky-note")) return;
        // Don't pan if dragging a note
        if (draggingNoteIdRef.current !== null) return;

        // Save initial pan offset BEFORE any panning - for potential pinch zoom later
        if (initialPanBeforePinchRef.current) {
            initialPanBeforePinchRef.current.x = panOffsetRef.current.x;
            initialPanBeforePinchRef.current.y = panOffsetRef.current.y;
        }

        const touch = e.touches[0];
        setIsPanning(true);
        isPanningRef.current = true;
        // Store start point relative to current pan offset (original logic)
        panStartRef.current = {
            x: touch.clientX - panOffsetRef.current.x,
            y: touch.clientY - panOffsetRef.current.y,
        };
    };

    const handlePanTouchMove = (e: TouchEvent) => {
        // Stop panning if pinching (2 fingers)
        if (e.touches.length !== 1) {
            isPanningRef.current = false;
            return;
        }
        if (!isPanningRef.current) return;

        e.preventDefault();
        const touch = e.touches[0];
        // Calculate new pan directly from touch position (original logic)
        const newX = touch.clientX - panStartRef.current.x;
        const newY = touch.clientY - panStartRef.current.y;

        panOffsetRef.current = { x: newX, y: newY };
        setPanOffset({ x: newX, y: newY });
    };

    const handlePanTouchEnd = () => {
        setIsPanning(false);
        isPanningRef.current = false;
    };

    // Add event listeners
    useEffect(() => {
        const board = boardRef.current;
        if (!board) return;

        // Mouse events
        const handleMouseMove = (e: MouseEvent) => handlePanMove(e);
        const handleMouseUp = () => handlePanEnd();

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        // Touch events
        board.addEventListener("touchstart", handlePanTouchStart, {
            passive: false,
        });
        board.addEventListener("touchmove", handlePanTouchMove, {
            passive: false,
        });
        board.addEventListener("touchend", handlePanTouchEnd);
        board.addEventListener("touchcancel", handlePanTouchEnd);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            board.removeEventListener("touchstart", handlePanTouchStart);
            board.removeEventListener("touchmove", handlePanTouchMove);
            board.removeEventListener("touchend", handlePanTouchEnd);
            board.removeEventListener("touchcancel", handlePanTouchEnd);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { handlePanStart };
}
