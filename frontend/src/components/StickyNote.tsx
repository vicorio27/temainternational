import { useCallback, useRef, useState } from "react";
import type { InteractionMode, Note } from "../types/note";
import { RESIZE_HANDLE_SIZE, TRASH_ZONE_HEIGHT } from "../types/note";
import { useDrag } from "../hooks/useDrag";
import { useResize } from "../hooks/useResize";
import { useDelete } from "../hooks/useDelete";
import { useNotesStore } from "../state/notesStore";

interface StickyNoteProps {
  note: Note;
}

export function StickyNote({ note }: StickyNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<InteractionMode>("NONE");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOverTrash, setIsOverTrash] = useState(false);

  const updateNote = useNotesStore((s) => s.updateNote);
  const bringToFront = useNotesStore((s) => s.bringToFront);
  const removeNote = useNotesStore((s) => s.removeNote);
  const persistToStorage = useNotesStore((s) => s.persistToStorage);
  const setDraggingId = useNotesStore((s) => s.setDraggingId);

  // Refs for transient drag/resize data to avoid re-renders
  const positionRef = useRef({ x: note.x, y: note.y });
  const sizeRef = useRef({ width: note.width, height: note.height });

  const isOverTrashRef = useRef(false);

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    setTimeout(() => {
      removeNote(note.id);
      persistToStorage();
    }, 200);
  }, [note.id, removeNote, persistToStorage]);

  const { handleDeleteClick, showConfirmHint } = useDelete({
    onDelete: handleDelete,
  });

  // Trash zone detection during drag
  const checkTrashZone = useCallback((visualY: number) => {
    const trashTop = window.innerHeight - TRASH_ZONE_HEIGHT;
    const overTrash = visualY + 200 / 2 > trashTop; // 200 = default height estimate
    if (overTrash !== isOverTrashRef.current) {
      isOverTrashRef.current = overTrash;
      setIsOverTrash(overTrash);
    }
  }, []);

  const handleDragStart = useCallback(() => {
    setMode("DRAGGING");
    setDraggingId(note.id);
    bringToFront(note.id);
    positionRef.current = { x: note.x, y: note.y };
    isOverTrashRef.current = false;
    setIsOverTrash(false);
  }, [bringToFront, note.id, note.x, note.y, setDraggingId]);

  const handleDragMove = useCallback(
    (dx: number, dy: number) => {
      if (noteRef.current) {
        const newX = positionRef.current.x + dx;
        const newY = positionRef.current.y + dy;
        noteRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        checkTrashZone(newY);
      }
    },
    [checkTrashZone]
  );

  const handleDragEnd = useCallback(() => {
    setMode("NONE");
    setDraggingId(null);

    if (isOverTrashRef.current) {
      // Delete: note was over trash zone
      setIsOverTrash(false);
      isOverTrashRef.current = false;
      handleDelete();
      return;
    }

    // Normal drag end: persist position
    if (noteRef.current) {
      const transform = noteRef.current.style.transform;
      const match = transform.match(/translate\((.+?)px,\s*(.+?)px\)/);
      if (match) {
        const finalX = parseFloat(match[1]);
        const finalY = parseFloat(match[2]);
        updateNote(note.id, { x: finalX, y: finalY });
        persistToStorage();
      }
    }
  }, [note.id, updateNote, persistToStorage, setDraggingId, handleDelete]);

  const { startDrag } = useDrag({
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
  });

  const handleResizeStart = useCallback(() => {
    setMode("RESIZING");
    bringToFront(note.id);
    sizeRef.current = { width: note.width, height: note.height };
  }, [bringToFront, note.id, note.width, note.height]);

  const handleResize = useCallback(
    (width: number, height: number) => {
      if (noteRef.current) {
        noteRef.current.style.width = `${width}px`;
        noteRef.current.style.height = `${height}px`;
      }
    },
    []
  );

  const handleResizeEnd = useCallback(() => {
    setMode("NONE");
    if (noteRef.current) {
      const width = parseFloat(noteRef.current.style.width);
      const height = parseFloat(noteRef.current.style.height);
      updateNote(note.id, { width, height });
      persistToStorage();
    }
  }, [note.id, updateNote, persistToStorage]);

  const { startResize } = useResize({
    initialWidth: note.width,
    initialHeight: note.height,
    onResizeStart: handleResizeStart,
    onResize: handleResize,
    onResizeEnd: handleResizeEnd,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "NONE") return;

      // Use live bounding rect for resize hit detection (fixes stale position after drag)
      if (noteRef.current) {
        const rect = noteRef.current.getBoundingClientRect();
        const isResizeArea =
          e.clientX > rect.right - RESIZE_HANDLE_SIZE &&
          e.clientY > rect.bottom - RESIZE_HANDLE_SIZE;

        if (isResizeArea) {
          startResize(e);
        } else {
          startDrag(e);
        }
      }
    },
    [mode, startDrag, startResize]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      handleDeleteClick(e as unknown as React.PointerEvent, {
        x: note.x,
        y: note.y,
        width: note.width,
        height: note.height,
      });
    },
    [note, handleDeleteClick]
  );

  return (
    <div
      ref={noteRef}
      className={`sticky-note ${isDeleting ? "deleting" : ""} ${isOverTrash ? "over-trash" : ""}`}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: note.width,
        height: note.height,
        backgroundColor: note.color,
        zIndex: note.zIndex,
        transform: `translate(${note.x}px, ${note.y}px)`,
        cursor: mode === "DRAGGING" ? "grabbing" : "grab",
        userSelect: "none",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className="note-content">
        {showConfirmHint && (
          <div className="delete-hint">Double-click again to delete</div>
        )}
      </div>
      <div
        className="resize-handle"
        style={{
          position: "absolute",
          right: 0,
          bottom: 0,
          width: RESIZE_HANDLE_SIZE,
          height: RESIZE_HANDLE_SIZE,
          cursor: "nwse-resize",
        }}
      />
    </div>
  );
}
