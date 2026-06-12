import { useCallback, useEffect, useRef } from "react";
import type { Point } from "../types/note";

interface UsePointerTrackingOptions {
  onMove: (point: Point) => void;
  onEnd: () => void;
}

export function usePointerTracking({
  onMove,
  onEnd,
}: UsePointerTrackingOptions) {
  const isActiveRef = useRef(false);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isActiveRef.current) return;
      onMove({ x: e.clientX, y: e.clientY });
    },
    [onMove]
  );

  const handlePointerUp = useCallback(() => {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;
    onEnd();
  }, [onEnd]);

  const start = useCallback(() => {
    isActiveRef.current = true;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove, handlePointerUp]);

  const stop = useCallback(() => {
    isActiveRef.current = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return { start, stop, isActive: isActiveRef };
}
