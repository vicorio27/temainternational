import { useCallback, useRef } from "react";
import type { Point } from "../types/note";
import { usePointerTracking } from "./usePointerTracking";
import { MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH } from "../types/note";

interface UseResizeOptions {
  initialWidth: number;
  initialHeight: number;
  onResizeStart: () => void;
  onResize: (width: number, height: number) => void;
  onResizeEnd: () => void;
}

export function useResize({
  initialWidth,
  initialHeight,
  onResizeStart,
  onResize,
  onResizeEnd,
}: UseResizeOptions) {
  const startRef = useRef<Point>({ x: 0, y: 0 });
  const sizeRef = useRef({ width: initialWidth, height: initialHeight });

  const handleMove = useCallback(
    (point: Point) => {
      const dx = point.x - startRef.current.x;
      const dy = point.y - startRef.current.y;
      const newWidth = Math.max(MIN_NOTE_WIDTH, sizeRef.current.width + dx);
      const newHeight = Math.max(MIN_NOTE_HEIGHT, sizeRef.current.height + dy);
      onResize(newWidth, newHeight);
    },
    [onResize]
  );

  const handleEnd = useCallback(() => {
    onResizeEnd();
  }, [onResizeEnd]);

  const { start: startTracking } = usePointerTracking({
    onMove: handleMove,
    onEnd: handleEnd,
  });

  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startRef.current = { x: e.clientX, y: e.clientY };
      sizeRef.current = { width: initialWidth, height: initialHeight };
      onResizeStart();
      startTracking();
    },
    [initialWidth, initialHeight, onResizeStart, startTracking]
  );

  return { startResize };
}
