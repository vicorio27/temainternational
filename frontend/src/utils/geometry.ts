import type { Point, Rect } from "../types/note";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function isNearBottomRight(
  point: Point,
  rect: Rect,
  threshold: number
): boolean {
  const bottomRight: Point = {
    x: rect.x + rect.width,
    y: rect.y + rect.height,
  };
  return distance(point, bottomRight) < threshold;
}
