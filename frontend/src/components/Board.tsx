import { useCallback, useEffect } from "react";
import { useNotesStore } from "../state/notesStore";
import { StickyNote } from "./StickyNote";
import { TrashZone } from "./TrashZone";
import {
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  NOTE_COLORS,
} from "../types/note";

export function Board() {
  const notes = useNotesStore((s) => s.notes);
  const loadFromStorage = useNotesStore((s) => s.loadFromStorage);
  const addNote = useNotesStore((s) => s.addNote);
  const pendingPlacement = useNotesStore((s) => s.pendingPlacement);
  const setPendingPlacement = useNotesStore((s) => s.setPendingPlacement);
  const persistToStorage = useNotesStore((s) => s.persistToStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleBoardClick = useCallback(
    (e: React.MouseEvent) => {
      if (!pendingPlacement) return;

      // Only handle clicks directly on the board, not on child notes
      if (e.target !== e.currentTarget) return;

      const color =
        NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
      const x = e.clientX - DEFAULT_NOTE_WIDTH / 2;
      const y = e.clientY - DEFAULT_NOTE_HEIGHT / 2;

      addNote({
        id: crypto.randomUUID(),
        x,
        y,
        width: DEFAULT_NOTE_WIDTH,
        height: DEFAULT_NOTE_HEIGHT,
        color,
        zIndex: 0,
      });
      setPendingPlacement(false);
      persistToStorage();
    },
    [pendingPlacement, addNote, setPendingPlacement, persistToStorage]
  );

  return (
    <>
      <div
        className={`board ${pendingPlacement ? "board--placing" : ""}`}
        style={{
          position: "relative",
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: "#f0f0f0",
        }}
        onClick={handleBoardClick}
      >
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} />
        ))}
      </div>
      <TrashZone />
    </>
  );
}
