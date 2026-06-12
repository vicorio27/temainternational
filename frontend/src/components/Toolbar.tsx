import { useCallback } from "react";
import {
  DEFAULT_NOTE_HEIGHT,
  DEFAULT_NOTE_WIDTH,
  NOTE_COLORS,
} from "../types/note";
import { useNotesStore } from "../state/notesStore";

export function Toolbar() {
  const addNote = useNotesStore((s) => s.addNote);
  const persistToStorage = useNotesStore((s) => s.persistToStorage);

  const handleAddNote = useCallback(() => {
    const color =
      NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    const x = Math.random() * (window.innerWidth - DEFAULT_NOTE_WIDTH - 100);
    const y = Math.random() * (window.innerHeight - DEFAULT_NOTE_HEIGHT - 100);

    addNote({
      id: crypto.randomUUID(),
      x,
      y,
      width: DEFAULT_NOTE_WIDTH,
      height: DEFAULT_NOTE_HEIGHT,
      color,
      zIndex: 0, // will be set by store
    });
    persistToStorage();
  }, [addNote, persistToStorage]);

  return (
    <div
      className="toolbar"
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        gap: 8,
      }}
    >
      <button onClick={handleAddNote}>Add Note</button>
    </div>
  );
}
