import { useNotesStore } from "../state/notesStore";
import { TRASH_ZONE_HEIGHT } from "../types/note";

export function TrashZone() {
  const draggingId = useNotesStore((s) => s.draggingId);

  return (
    <div
      className={`trash-zone ${draggingId ? "trash-zone--active" : ""}`}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: TRASH_ZONE_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 9998,
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          opacity: draggingId ? 0.6 : 0,
          transition: "opacity 0.2s",
        }}
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </div>
  );
}
