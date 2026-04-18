// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Renderer Abstraction Types
// Decouples the scene graph from the rendering backend.
// Default implementation: KonvaRenderer (in canvas-react).
// Future: PixiRenderer, WebGPURenderer.
// ---------------------------------------------------------------------------

import type { CanvasNode } from './node';

/** Axis-aligned bounding rectangle */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 2D point */
export interface Point {
  x: number;
  y: number;
}

/** Viewport state */
export interface ViewportState {
  x: number;      // Pan offset X
  y: number;      // Pan offset Y
  scale: number;  // Zoom scale
  width: number;  // Container width
  height: number; // Container height
}

/** Export options for toDataURL / toBlob */
export interface RendererExportOptions {
  format: 'png' | 'jpeg';
  quality?: number;       // 0–1 for JPEG
  pixelRatio?: number;    // DPI multiplier
  backgroundColor?: string | null; // null = transparent
  area?: Rect;           // Crop area (world coords)
}

/** Renderer initialization options */
export interface RendererOptions {
  width: number;
  height: number;
  pixelRatio?: number;
  backgroundColor?: string;
}

/** Transform handle positions */
export type HandlePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'middle-left'
  | 'middle-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'rotate';

/** Transform event data emitted by the renderer */
export interface TransformEvent {
  nodeId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

/** Pointer event data normalized from the renderer */
export interface RendererPointerEvent {
  worldX: number;
  worldY: number;
  screenX: number;
  screenY: number;
  nodeId: string | null;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
}

/** Renderer event map */
export interface RendererEventMap {
  'pointer:down': RendererPointerEvent;
  'pointer:move': RendererPointerEvent;
  'pointer:up': RendererPointerEvent;
  'pointer:dblclick': RendererPointerEvent;
  'node:dragstart': { nodeId: string };
  'node:dragmove': { nodeId: string; x: number; y: number };
  'node:dragend': { nodeId: string; x: number; y: number };
  'node:transformstart': TransformEvent;
  'node:transform': TransformEvent;
  'node:transformend': TransformEvent;
  'stage:click': RendererPointerEvent;
  'stage:wheel': { deltaY: number; screenX: number; screenY: number };
}

export type RendererEventType = keyof RendererEventMap;
