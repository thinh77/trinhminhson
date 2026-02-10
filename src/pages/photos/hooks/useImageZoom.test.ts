import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useImageZoom, ZOOM_LEVELS } from "./useImageZoom";

describe("useImageZoom", () => {
  describe("ZOOM_LEVELS", () => {
    it("has zoom levels 1, 2, 4, and 10", () => {
      expect(ZOOM_LEVELS).toEqual([1, 2, 4, 10]);
    });
  });

  describe("initial state", () => {
    it("starts at zoom level 1 (fit)", () => {
      const { result } = renderHook(() => useImageZoom());
      expect(result.current.zoomLevel).toBe(1);
    });

    it("starts with position centered at origin", () => {
      const { result } = renderHook(() => useImageZoom());
      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });

    it("is not zoomed in at level 1", () => {
      const { result } = renderHook(() => useImageZoom());
      expect(result.current.isZoomedIn).toBe(false);
    });
  });

  describe("setZoomLevel", () => {
    it("sets zoom to x2", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(2);
      });

      expect(result.current.zoomLevel).toBe(2);
      expect(result.current.isZoomedIn).toBe(true);
    });

    it("sets zoom to x4", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(4);
      });

      expect(result.current.zoomLevel).toBe(4);
    });

    it("sets zoom to x10", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(10);
      });

      expect(result.current.zoomLevel).toBe(10);
    });

    it("resets position when zooming back to 1", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(4);
      });
      act(() => {
        result.current.setPosition({ x: 100, y: 50 });
      });
      act(() => {
        result.current.setZoomLevel(1);
      });

      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });

    it("ignores invalid zoom levels", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(3);
      });

      expect(result.current.zoomLevel).toBe(1);
    });
  });

  describe("cycleZoom", () => {
    it("cycles from 1 to 2", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.cycleZoom();
      });

      expect(result.current.zoomLevel).toBe(2);
    });

    it("cycles from 2 to 4", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(2);
      });
      act(() => {
        result.current.cycleZoom();
      });

      expect(result.current.zoomLevel).toBe(4);
    });

    it("cycles from 4 to 10", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(4);
      });
      act(() => {
        result.current.cycleZoom();
      });

      expect(result.current.zoomLevel).toBe(10);
    });

    it("cycles from 10 back to 1 and resets position", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(10);
      });
      act(() => {
        result.current.setPosition({ x: 50, y: 50 });
      });
      act(() => {
        result.current.cycleZoom();
      });

      expect(result.current.zoomLevel).toBe(1);
      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });
  });

  describe("resetZoom", () => {
    it("resets zoom to 1 and position to origin", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(4);
      });
      act(() => {
        result.current.setPosition({ x: 200, y: 100 });
      });
      act(() => {
        result.current.resetZoom();
      });

      expect(result.current.zoomLevel).toBe(1);
      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });
  });

  describe("setPosition", () => {
    it("updates position when zoomed in", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(2);
      });
      act(() => {
        result.current.setPosition({ x: 100, y: -50 });
      });

      expect(result.current.position).toEqual({ x: 100, y: -50 });
    });

    it("does not update position when at zoom level 1", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setPosition({ x: 100, y: 50 });
      });

      expect(result.current.position).toEqual({ x: 0, y: 0 });
    });
  });

  describe("imageTransform", () => {
    it("returns identity transform at zoom level 1", () => {
      const { result } = renderHook(() => useImageZoom());
      expect(result.current.imageTransform).toBe(
        "scale(1) translate(0px, 0px)"
      );
    });

    it("returns correct transform when zoomed and panned", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(4);
      });
      act(() => {
        result.current.setPosition({ x: 50, y: -30 });
      });

      expect(result.current.imageTransform).toBe(
        "scale(4) translate(50px, -30px)"
      );
    });
  });

  describe("shouldUseOriginal", () => {
    it("returns false at zoom level 1", () => {
      const { result } = renderHook(() => useImageZoom());
      expect(result.current.shouldUseOriginal).toBe(false);
    });

    it("returns false at zoom level 2", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(2);
      });

      expect(result.current.shouldUseOriginal).toBe(false);
    });

    it("returns true at zoom level 4", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(4);
      });

      expect(result.current.shouldUseOriginal).toBe(true);
    });

    it("returns true at zoom level 10", () => {
      const { result } = renderHook(() => useImageZoom());

      act(() => {
        result.current.setZoomLevel(10);
      });

      expect(result.current.shouldUseOriginal).toBe(true);
    });
  });
});
