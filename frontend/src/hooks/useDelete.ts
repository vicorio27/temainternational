import { useCallback, useRef } from "react";
import type { Point, Rect } from "../types/note";
import { RESIZE_HANDLE_SIZE } from "../types/note";
import { isNearBottomRight, pointInRect } from "../utils/geometry";

export function useDelete({
  onDelete,
}: {
  onDelete: () => void;
}) {
  const deleteConfirmRef = useRef(false);

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
        if (deleteConfirmRef.current) {
          deleteConfirmRef.current = false;
          onDelete();
        } else {
          deleteConfirmRef.current = true;
          // Reset after a short delay
          setTimeout(() => {
            deleteConfirmRef.current = false;
          }, 1500);
        }
      }
    },
    [onDelete]
  );

  return { handleDeleteClick, deleteConfirmRef };
}
