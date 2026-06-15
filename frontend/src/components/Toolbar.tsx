import { useCallback } from "react";
import { useNotesStore } from "../state/notesStore";

export function Toolbar() {
  const pendingPlacement = useNotesStore((s) => s.pendingPlacement);
  const setPendingPlacement = useNotesStore((s) => s.setPendingPlacement);

  const handleAddNote = useCallback(() => {
    setPendingPlacement(true);
  }, [setPendingPlacement]);

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
      <button onClick={handleAddNote}>
        {pendingPlacement ? "Click board to place" : "Add Note"}
      </button>
    </div>
  );
}
