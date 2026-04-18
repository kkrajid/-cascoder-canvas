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

/**
 * RendererAdapter — The abstract rendering interface.
 *
 * The scene graph and business logic interact ONLY through this interface.
 * Concrete implementations (KonvaRenderer, future PixiRenderer) handle
 * the actual drawing, hit detection, and transformer UIs.
 */
export interface RendererAdapter {
  // ---- Lifecycle ----
  init(container: HTMLElement, options: RendererOptions): void;
  destroy(): void;
  getContainer(): HTMLElement | null;

  // ---- Node management ----
  addNode(node: CanvasNode): void;
  updateNode(id: string, changes: Partial<CanvasNode>): void;
  removeNode(id: string): void;
  batchUpdate(updates: Array<{ id: string; changes: Partial<CanvasNode> }>): void;

  // ---- Viewport ----
  setViewport(state: Partial<ViewportState>): void;
  getViewport(): ViewportState;
  screenToWorld(screenPoint: Point): Point;
  worldToScreen(worldPoint: Point): Point;

  // ---- Hit detection ----
  getNodeAtPoint(worldPoint: Point): string | null;
  getNodesInRect(worldRect: Rect): string[];

  // ---- Selection / Transform UI ----
  setSelectedNodes(ids: string[]): void;
  clearSelection(): void;

  // ---- Snap guides ----
  setSnapGuides(guides: Array<{ points: number[]; orientation: 'horizontal' | 'vertical' }>): void;
  clearSnapGuides(): void;

  // ---- Ruler guides ----
  setRulerGuides(guides: Array<{ axis: 'horizontal' | 'vertical'; position: number; color: string }>): void;

  // ---- Export ----
  toDataURL(options: RendererExportOptions): Promise<string>;
  toBlob(options: RendererExportOptions): Promise<Blob>;

  // ---- Events ----
  on<T extends RendererEventType>(event: T, handler: (payload: RendererEventMap[T]) => void): () => void;
  off<T extends RendererEventType>(event: T, handler: (payload: RendererEventMap[T]) => void): void;

  // ---- Escape hatch to native backend ----
  getBackend<T = unknown>(): T;
}
