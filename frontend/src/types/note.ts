export interface Note {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  zIndex: number;
}

export type InteractionMode = "NONE" | "DRAGGING" | "RESIZING" | "DELETING";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const NOTE_COLORS = [
  "#fef08a", // yellow
  "#bbf7d0", // green
  "#bfdbfe", // blue
  "#fecaca", // red
  "#e9d5ff", // purple
  "#fed7aa", // orange
] as const;

export const DEFAULT_NOTE_WIDTH = 200;
export const DEFAULT_NOTE_HEIGHT = 200;
export const MIN_NOTE_WIDTH = 100;
export const MIN_NOTE_HEIGHT = 100;
export const RESIZE_HANDLE_SIZE = 16;
export const TRASH_ZONE_HEIGHT = 80;
