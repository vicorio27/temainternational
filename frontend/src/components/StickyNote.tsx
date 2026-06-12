import { useCallback, useRef, useState } from "react";
import type { InteractionMode, Note } from "../types/note";
import { RESIZE_HANDLE_SIZE } from "../types/note";
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

  const updateNote = useNotesStore((s) => s.updateNote);
  const bringToFront = useNotesStore((s) => s.bringToFront);
  const removeNote = useNotesStore((s) => s.removeNote);
  const persistToStorage = useNotesStore((s) => s.persistToStorage);

  // Refs for transient drag/resize data to avoid re-renders
  const positionRef = useRef({ x: note.x, y: note.y });
  const sizeRef = useRef({ width: note.width, height: note.height });

  const handleDragStart = useCallback(() => {
    setMode("DRAGGING");
    bringToFront(note.id);
    positionRef.current = { x: note.x, y: note.y };
  }, [bringToFront, note.id, note.x, note.y]);

  const handleDragMove = useCallback(
    (dx: number, dy: number) => {
      if (noteRef.current) {
        const newX = positionRef.current.x + dx;
        const newY = positionRef.current.y + dy;
        noteRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setMode("NONE");
    // Calculate final position from the transform
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
  }, [note.id, updateNote, persistToStorage]);

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

  const handleDelete = useCallback(() => {
    setIsDeleting(true);
    // Short delay for visual feedback before removal
    setTimeout(() => {
      removeNote(note.id);
      persistToStorage();
    }, 200);
  }, [note.id, removeNote, persistToStorage]);

  const { handleDeleteClick, deleteConfirmRef } = useDelete({
    onDelete: handleDelete,
  });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (mode !== "NONE") return;

      // Check if click is near resize handle
      const isResizeArea =
        e.clientX > note.x + note.width - RESIZE_HANDLE_SIZE &&
        e.clientY > note.y + note.height - RESIZE_HANDLE_SIZE;

      if (isResizeArea) {
        startResize(e);
      } else {
        startDrag(e);
      }
    },
    [mode, note, startDrag, startResize]
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
      className={`sticky-note ${isDeleting ? "deleting" : ""}`}
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
        {deleteConfirmRef.current && (
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
