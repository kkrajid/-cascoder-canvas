// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Math Utilities
// Geometry helpers for bounding boxes, points, transforms, and intersections.
// ---------------------------------------------------------------------------

import type { Rect, Point } from '../types/renderer';

/** Degrees to radians */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Radians to degrees */
export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Round to N decimal places */
export function roundTo(value: number, decimals: number = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Snap a value to the nearest step (e.g., snap rotation to 15°) */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/** Distance between two points */
export function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Midpoint of two points */
export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Rotate a point around a center by angle (degrees) */
export function rotatePoint(point: Point, center: Point, angleDeg: number): Point {
  const rad = degToRad(angleDeg);
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

/** Get the center of a Rect */
export function rectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

/** Check if a point is inside a rect */
export function pointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/** Check if two rects overlap */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Check if rect `a` fully contains rect `b` */
export function rectContains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

/** Compute the union bounding box of multiple rects */
export function unionRects(rects: Rect[]): Rect {
  if (rects.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/** Get corners of a rotated rect */
export function getRotatedRectCorners(rect: Rect, rotation: number): Point[] {
  const center = rectCenter(rect);
  const corners: Point[] = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  return corners.map((c) => rotatePoint(c, center, rotation));
}

/** Get the axis-aligned bounding box of a rotated rect */
export function getRotatedBoundingBox(rect: Rect, rotation: number): Rect {
  if (rotation === 0) return { ...rect };
  const corners = getRotatedRectCorners(rect, rotation);
  const xs = corners.map((c) => c.x);
  const ys = corners.map((c) => c.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  };
}

/** Normalize an angle to 0-360 range */
export function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/** Snap angle to nearest increment (e.g., 15 degrees) */
export function snapAngle(angle: number, increment: number = 15, threshold: number = 5): number {
  const normalized = normalizeAngle(angle);
  const snapped = snapToGrid(normalized, increment);
  if (Math.abs(normalized - snapped) <= threshold) {
    return snapped;
  }
  return normalized;
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map value from one range to another */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
