// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Viewport Slice
// Zoom, pan, and viewport calculations.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { EditorStore } from '../createEditorStore';
import { clamp } from '../../utils/math';

const MIN_ZOOM = 0.05;  // 5%
const MAX_ZOOM = 64;     // 6400%
const ZOOM_STEP = 0.1;

export interface ViewportSlice {
  viewportX: number;        // Pan offset X
  viewportY: number;        // Pan offset Y
  zoom: number;             // Scale factor (1 = 100%)
  containerWidth: number;   // Container element width
  containerHeight: number;  // Container element height
  isPanning: boolean;

  // Actions
  setZoom: (zoom: number, focalPoint?: { x: number; y: number }) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  zoomToSelection: () => void;
  setZoomPreset: (percent: number) => void;
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  setIsPanning: (panning: boolean) => void;
  setContainerSize: (width: number, height: number) => void;
  fitToPage: () => void;
  centerOnPoint: (worldX: number, worldY: number) => void;

  // Coordinate transforms
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number };
  worldToScreen: (worldX: number, worldY: number) => { x: number; y: number };
}

export const createViewportSlice: StateCreator<EditorStore, [], [], ViewportSlice> = (set, get) => ({
  viewportX: 0,
  viewportY: 0,
  zoom: 1,
  containerWidth: 0,
  containerHeight: 0,
  isPanning: false,

  setZoom: (newZoom, focalPoint) => {
    set((state) => {
      const clamped = clamp(newZoom, MIN_ZOOM, MAX_ZOOM);
      if (focalPoint) {
        // Zoom towards focal point (like Figma/Canva)
        const scale = clamped / state.zoom;
        const newX = focalPoint.x - (focalPoint.x - state.viewportX) * scale;
        const newY = focalPoint.y - (focalPoint.y - state.viewportY) * scale;
        return { zoom: clamped, viewportX: newX, viewportY: newY };
      }
      return { zoom: clamped };
    });
  },

  zoomIn: () => {
    const state = get();
    const newZoom = clamp(state.zoom * (1 + ZOOM_STEP), MIN_ZOOM, MAX_ZOOM);
    state.setZoom(newZoom, {
      x: state.containerWidth / 2,
      y: state.containerHeight / 2,
    });
  },

  zoomOut: () => {
    const state = get();
    const newZoom = clamp(state.zoom * (1 - ZOOM_STEP), MIN_ZOOM, MAX_ZOOM);
    state.setZoom(newZoom, {
      x: state.containerWidth / 2,
      y: state.containerHeight / 2,
    });
  },

  zoomToFit: () => {
    const state = get();
    const page = state.pages.find((p) => p.id === state.activePageId);
    if (!page) return;

    const padding = 60;
    const scaleX = (state.containerWidth - padding * 2) / page.width;
    const scaleY = (state.containerHeight - padding * 2) / page.height;
    const newZoom = clamp(Math.min(scaleX, scaleY), MIN_ZOOM, MAX_ZOOM);

    const newX = (state.containerWidth - page.width * newZoom) / 2;
    const newY = (state.containerHeight - page.height * newZoom) / 2;

    set({ zoom: newZoom, viewportX: newX, viewportY: newY });
  },

  zoomToSelection: () => {
    const state = get();
    if (state.selectedIds.length === 0) return;

    const nodes = state.selectedIds.map((id) => state.nodes[id]).filter(Boolean);
    if (nodes.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, n.x);
      minY = Math.min(minY, n.y);
      maxX = Math.max(maxX, n.x + n.width);
      maxY = Math.max(maxY, n.y + n.height);
    }

    const padding = 80;
    const w = maxX - minX;
    const h = maxY - minY;
    const scaleX = (state.containerWidth - padding * 2) / w;
    const scaleY = (state.containerHeight - padding * 2) / h;
    const newZoom = clamp(Math.min(scaleX, scaleY), MIN_ZOOM, MAX_ZOOM);

    const centerX = minX + w / 2;
    const centerY = minY + h / 2;
    const newX = state.containerWidth / 2 - centerX * newZoom;
    const newY = state.containerHeight / 2 - centerY * newZoom;

    set({ zoom: newZoom, viewportX: newX, viewportY: newY });
  },

  setZoomPreset: (percent) => {
    const state = get();
    state.setZoom(percent / 100, {
      x: state.containerWidth / 2,
      y: state.containerHeight / 2,
    });
  },

  setPan: (x, y) => set({ viewportX: x, viewportY: y }),

  panBy: (dx, dy) => {
    set((state) => ({
      viewportX: state.viewportX + dx,
      viewportY: state.viewportY + dy,
    }));
  },

  setIsPanning: (panning) => set({ isPanning: panning }),

  setContainerSize: (width, height) => set({ containerWidth: width, containerHeight: height }),

  fitToPage: () => get().zoomToFit(),

  centerOnPoint: (worldX, worldY) => {
    const state = get();
    set({
      viewportX: state.containerWidth / 2 - worldX * state.zoom,
      viewportY: state.containerHeight / 2 - worldY * state.zoom,
    });
  },

  screenToWorld: (screenX, screenY) => {
    const state = get();
    return {
      x: (screenX - state.viewportX) / state.zoom,
      y: (screenY - state.viewportY) / state.zoom,
    };
  },

  worldToScreen: (worldX, worldY) => {
    const state = get();
    return {
      x: worldX * state.zoom + state.viewportX,
      y: worldY * state.zoom + state.viewportY,
    };
  },
});
