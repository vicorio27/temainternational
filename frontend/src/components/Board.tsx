import { useEffect } from "react";
import { useNotesStore } from "../state/notesStore";
import { StickyNote } from "./StickyNote";

export function Board() {
  const notes = useNotesStore((s) => s.notes);
  const loadFromStorage = useNotesStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div
      className="board"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#f0f0f0",
      }}
    >
      {notes.map((note) => (
        <StickyNote key={note.id} note={note} />
      ))}
    </div>
  );
}
