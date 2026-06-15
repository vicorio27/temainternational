import { useCallback, useRef, useState } from "react";
import type { Point, Rect } from "../types/note";
import { RESIZE_HANDLE_SIZE } from "../types/note";
import { isNearBottomRight, pointInRect } from "../utils/geometry";

export function useDelete({
  onDelete,
}: {
  onDelete: () => void;
}) {
  const [showConfirmHint, setShowConfirmHint] = useState(false);
  const confirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleteClick = useCallback(
    (e: React.PointerEvent, noteRect: Rect) => {
      e.preventDefault();
      e.stopPropagation();

      const point: Point = { x: e.clientX, y: e.clientY };

      // Check if click is NOT in the resize handle area
      const inResizeArea = isNearBottomRight(
        point,
        noteRect,
        RESIZE_HANDLE_SIZE
      );

      if (!inResizeArea && pointInRect(point, noteRect)) {
        if (showConfirmHint) {
          // Second click: delete
          setShowConfirmHint(false);
          if (confirmTimeoutRef.current) {
            clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = null;
          }
          onDelete();
        } else {
          // First click: show hint
          setShowConfirmHint(true);
          if (confirmTimeoutRef.current) {
            clearTimeout(confirmTimeoutRef.current);
          }
          confirmTimeoutRef.current = setTimeout(() => {
            setShowConfirmHint(false);
            confirmTimeoutRef.current = null;
          }, 1500);
        }
      }
    },
    [onDelete, showConfirmHint]
  );

  return { handleDeleteClick, showConfirmHint };
}
