# Sticky Notes Board

## Overview

This project implements an interactive sticky notes board with support for:

* Creating notes
* Dragging notes
* Resizing notes
* Deleting notes
* Persistent storage
* Layer management (stacking order)

The implementation prioritizes:

* Correctness
* Reliability
* Performance
* Separation of concerns
* User experience

The goal is to ensure all interactions remain predictable and robust, even under fast or imprecise mouse movements.

---

# Requirements Addressed

## Interaction Reliability

The application supports interaction flows beyond the happy path.

Special attention was given to:

* Fast cursor movements
* Cursor leaving component boundaries
* Overlapping interaction areas
* Unexpected mouse paths
* Rapid user actions

Interactions continue functioning correctly even when the pointer leaves the note element.

---

## Interaction Isolation

Drag, resize, and delete behaviors are fully isolated.

Only one interaction mode can be active at a time.

```text
NONE
DRAGGING
RESIZING
DELETING
```

This prevents unintended side effects such as:

```text
Resize triggering drag

or

Delete triggering selection
```

Each interaction owns its own state and lifecycle.

---

# Architecture

The application follows a separation of concerns approach.

```text
src/
├── components/
│   ├── Board.tsx
│   ├── StickyNote.tsx
│   └── Toolbar.tsx
│
├── hooks/
│   ├── useDrag.ts
│   ├── useResize.ts
│   ├── useDelete.ts
│   └── usePointerTracking.ts
│
├── state/
│   └── notesStore.ts
│
├── utils/
│   ├── geometry.ts
│   ├── collision.ts
│   └── persistence.ts
│
└── types/
    └── note.ts
```

Responsibilities are separated as follows:

| Layer      | Responsibility       |
| ---------- | -------------------- |
| Components | Rendering            |
| Hooks      | Interaction logic    |
| State      | Application state    |
| Utils      | Geometry and helpers |

This keeps components small and easy to maintain.

---

# Drag Implementation

Dragging is handled through dedicated interaction hooks.

Pointer tracking is attached globally during active interactions.

Example:

```javascript
window.addEventListener("pointermove", handleMove);
window.addEventListener("pointerup", handleEnd);
```

This ensures dragging continues even when the cursor leaves the note boundaries.

---

# Resize Implementation

Resize handles are isolated from drag regions.

Geometry calculations are based on element references.

Preferred approach:

```javascript
noteRef.current.getBoundingClientRect()
```

Avoid:

```javascript
document.querySelector(...)
```

This reduces coupling and improves reliability.

---

# State Management

State updates are scoped to the minimum required data.

Interaction state is separated from rendering state.

Example:

```typescript
type InteractionMode =
  | "NONE"
  | "DRAGGING"
  | "RESIZING"
  | "DELETING";
```

This prevents conflicting actions during user interactions.

---

# Performance Considerations

## Avoiding Excessive Re-Renders

Drag and resize operations can generate hundreds of events per second.

To reduce rendering overhead:

* useRef is used for transient interaction data
* requestAnimationFrame is used when appropriate
* State updates are minimized

Example:

```javascript
const positionRef = useRef(position);
```

instead of triggering React updates for every pointer movement.

---

## Efficient Event Handling

Pointer listeners are attached only while interactions are active.

Example flow:

```text
Pointer Down
    ↓
Attach Listeners
    ↓
Track Movement
    ↓
Pointer Up
    ↓
Cleanup Listeners
```

This avoids unnecessary global listeners.

---

# Persistence Strategy

Persistence is intentionally decoupled from pointer movement.

Avoid:

```text
Persist on every pixel movement
```

Preferred flow:

```text
Drag Start
    ↓
Update In-Memory State
    ↓
Drag End
    ↓
Persist Changes
```

Benefits:

* Fewer storage writes
* Better performance
* Reduced browser workload

---

# Stacking Order

The board maintains predictable stacking behavior.

When a note becomes active:

```text
Bring To Front
```

This ensures:

* Expected visual ordering
* Consistent interaction behavior
* Better usability

---

# Deletion Workflow

Deletion is isolated from drag and resize actions.

The application provides immediate visual feedback before removal.

Goals:

* Predictability
* User confidence
* Reduced accidental deletion

---

# Geometry Handling

Position and size calculations are performed using explicit geometry.

Example:

```javascript
const rect = noteRef.current.getBoundingClientRect();
```

Benefits:

* Improved accuracy
* Better testability
* Reduced DOM coupling

---

# Edge Cases Covered

The implementation considers:

### Fast Mouse Movements

Drag continues even if the cursor moves outside the note.

### Cursor Leaving Component

Interactions remain active until pointer release.

### Rapid Click Sequences

Interaction state remains consistent.

### Resize Near Boundaries

Resize calculations remain stable.

### Delete During Interaction

Deletion is isolated and cannot accidentally trigger drag or resize.

### Multiple Notes

Stacking order remains predictable.

### Large Number Of Notes

Rendering and interaction logic remain performant.

---

# Running The Project

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build production bundle:

```bash
npm run build
```

Run tests:

```bash
npm test
```

---

# Design Principles

The implementation prioritizes:

1. Correctness before features
2. Clear separation of responsibilities
3. Predictable user interactions
4. Performance during drag/resize operations
5. Maintainable and testable code

The objective is not only to make the application work, but to ensure it behaves reliably under real user interaction patterns.
