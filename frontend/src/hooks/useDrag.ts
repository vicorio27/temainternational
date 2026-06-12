import { useCallback, useRef } from "react";
import type { Point } from "../types/note";
import { usePointerTracking } from "./usePointerTracking";

interface UseDragOptions {
  onDragStart: () => void;
  onDragMove: (dx: number, dy: number) => void;
  onDragEnd: () => void;
}

export function useDrag({
  onDragStart,
  onDragMove,
  onDragEnd,
}: UseDragOptions) {
  const startRef = useRef<Point>({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  const handleMove = useCallback(
    (point: Point) => {
      const dx = point.x - startRef.current.x;
      const dy = point.y - startRef.current.y;
      if (!hasMovedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        hasMovedRef.current = true;
      }
      if (hasMovedRef.current) {
        onDragMove(dx, dy);
      }
    },
    [onDragMove]
  );

  const handleEnd = useCallback(() => {
    if (hasMovedRef.current) {
      onDragEnd();
    }
    hasMovedRef.current = false;
  }, [onDragEnd]);

  const { start: startTracking, stop: stopTracking } = usePointerTracking({
    onMove: handleMove,
    onEnd: handleEnd,
  });

  const startDrag = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startRef.current = { x: e.clientX, y: e.clientY };
      hasMovedRef.current = false;
      onDragStart();
      startTracking();
    },
    [onDragStart, startTracking]
  );

  return { startDrag, stopTracking };
}
