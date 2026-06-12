# AGENTS.md

## What this repo is

Two independent subprojects:

1. **Java 21 assessment** (root) — `HierarchyFilter.filter()` + tests, plus a written `SimpleCache` review in `README.md`.
2. **Sticky Notes Board** (`frontend/`) — React + TypeScript + Vite app with drag, resize, delete, persistence, and layer management.

## Java (root)

### Key data structure

Hierarchy is a forest stored as two parallel arrays in DFS order: `nodeIds[]` and `depths[]`. Roots have depth 0. A child's depth is parent depth + 1. Siblings share the same depth.

### Filter rule

A node is included iff its own nodeId passes the predicate **and** all ancestors pass. If any ancestor fails, the entire subtree beneath it is excluded.

### Implementation constraints

- Process directly from the DFS arrays; do not build an intermediate tree.
- O(n) time, O(d) space (d = max depth).
- Preserve original traversal order in output.

### Build & test

```bash
mvn test
```

### Task 2 (review)

The SimpleCache review is complete in `README.md`. No code changes needed.

---

## Frontend (`frontend/`)

### Stack

React 19 + TypeScript + Vite + Zustand.

### Commands

```bash
cd frontend
npm install
npm run dev      # dev server
npm run build    # tsc + vite build
```

### Architecture

```
src/
├── components/   Board, StickyNote, Toolbar (rendering only)
├── hooks/        useDrag, useResize, useDelete, usePointerTracking
├── state/        notesStore.ts (Zustand)
├── utils/        geometry, persistence
└── types/        note.ts (types + constants)
```

### Critical design decisions

- **Interaction isolation**: `InteractionMode` = `NONE | DRAGGING | RESIZING | DELETING`. Only one active at a time. Never mix.
- **Global pointer tracking**: `window.addEventListener("pointermove"/"pointerup")` during active interactions so drag/resize works when cursor leaves the note.
- **Refs for performance**: `positionRef`/`sizeRef` mutate DOM directly during drag/resize — no React re-renders per pixel.
- **Persist on end only**: `persistToStorage()` is called on drag-end and resize-end, not on every pointermove.
- **Bring to front**: clicking a note bumps its z-index via `bringToFront()`.
- **Delete**: double-click to confirm, second double-click to delete. Visual fade-out feedback.
- **Geometry**: use `getBoundingClientRect()` refs, never `document.querySelector`.

### When editing frontend code

- Keep JSX/components lean; move logic into hooks or utils.
- Avoid unnecessary re-renders during drag/resize flows.
- Do not add storage writes inside pointermove handlers.
- Ensure drag, resize, and delete remain fully isolated — one action must never trigger another.

---

## Docker

### Quick start

```bash
docker compose up --build
```

### Services

- `java-tests` — runs `mvn test` in a Maven + JDK 21 container, exits on completion.
- `frontend` — builds production bundle, serves via Nginx on `http://localhost:3000`.

### Run individually

```bash
docker compose run --rm java-tests    # Java tests only
docker compose up --build frontend    # Frontend only
```

### Notes

- `java-tests` mounts local source as a volume — tests run against your code without rebuilding the image.
- No hot-reload in Docker; use `npm run dev` locally for frontend development.
