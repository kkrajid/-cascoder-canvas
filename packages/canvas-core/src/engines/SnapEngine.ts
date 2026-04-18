// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Snap Engine
// Calculates snap positions and generates guide lines for Canva-like snapping.
// Supports center, edge, spacing, grid, and ruler guide snapping.
// ---------------------------------------------------------------------------

import type { Rect, Point } from '../types/renderer';
import type { CanvasNode } from '../types/node';
import type { RulerGuide } from '../types/document';

/** Snap guide line for visual rendering */
export interface SnapGuideLine {
  orientation: 'horizontal' | 'vertical';
  position: number; // World coordinate
  start: number;    // Start of the line (world coordinate on the other axis)
  end: number;      // End of the line
  type: 'center' | 'edge' | 'spacing' | 'grid' | 'ruler';
}

/** Result of a snap calculation */
export interface SnapResult {
  /** Snapped X position (null if no snap on X) */
  x: number | null;
  /** Snapped Y position (null if no snap on Y) */
  y: number | null;
  /** Guide lines to render */
  guides: SnapGuideLine[];
}

/** Configuration for the snap engine */
export interface SnapConfig {
  enabled: boolean;
  threshold: number;       // Snap distance in px (screen space)
  snapToCenter: boolean;
  snapToEdge: boolean;
  snapToSpacing: boolean;
  snapToGrid: boolean;
  snapToRulerGuides: boolean;
  gridSize: number;
}

export const DEFAULT_SNAP_CONFIG: SnapConfig = {
  enabled: true,
  threshold: 8,
  snapToCenter: true,
  snapToEdge: true,
  snapToSpacing: true,
  snapToGrid: false,
  snapToRulerGuides: true,
  gridSize: 20,
};

/**
 * SnapEngine — computes snap positions during drag/resize.
 * Designed to be called on every frame during interaction.
 */
export class SnapEngine {
  private config: SnapConfig;

  constructor(config: Partial<SnapConfig> = {}) {
    this.config = { ...DEFAULT_SNAP_CONFIG, ...config };
  }

  updateConfig(config: Partial<SnapConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Calculate snap for a moving element.
   *
   * @param movingRect     - The current bounding rect of the element being moved
   * @param otherNodes     - All other visible, unlocked nodes on the same page
   * @param rulerGuides    - Active ruler guides
   * @param pageRect       - The page/artboard bounding rect
   * @param zoom           - Current zoom level (for threshold scaling)
   */
  calculateSnap(
    movingRect: Rect,
    otherNodes: CanvasNode[],
    rulerGuides: RulerGuide[],
    pageRect: Rect,
    zoom: number = 1,
  ): SnapResult {
    if (!this.config.enabled) {
      return { x: null, y: null, guides: [] };
    }

    const threshold = this.config.threshold / zoom;
    const guides: SnapGuideLine[] = [];
    let snapX: number | null = null;
    let snapY: number | null = null;

    // Moving element edges and center
    const movingCX = movingRect.x + movingRect.width / 2;
    const movingCY = movingRect.y + movingRect.height / 2;
    const movingLeft = movingRect.x;
    const movingRight = movingRect.x + movingRect.width;
    const movingTop = movingRect.y;
    const movingBottom = movingRect.y + movingRect.height;

    // Collect all X and Y snap targets
    const xTargets: Array<{ value: number; type: SnapGuideLine['type']; label: string }> = [];
    const yTargets: Array<{ value: number; type: SnapGuideLine['type']; label: string }> = [];

    // --- Page center + edges ---
    const pageCX = pageRect.x + pageRect.width / 2;
    const pageCY = pageRect.y + pageRect.height / 2;

    if (this.config.snapToCenter) {
      xTargets.push({ value: pageCX, type: 'center', label: 'page-cx' });
      yTargets.push({ value: pageCY, type: 'center', label: 'page-cy' });
    }
    if (this.config.snapToEdge) {
      xTargets.push({ value: pageRect.x, type: 'edge', label: 'page-left' });
      xTargets.push({ value: pageRect.x + pageRect.width, type: 'edge', label: 'page-right' });
      yTargets.push({ value: pageRect.y, type: 'edge', label: 'page-top' });
      yTargets.push({ value: pageRect.y + pageRect.height, type: 'edge', label: 'page-bottom' });
    }

    // --- Other nodes ---
    for (const node of otherNodes) {
      const nCX = node.x + node.width / 2;
      const nCY = node.y + node.height / 2;

      if (this.config.snapToCenter) {
        xTargets.push({ value: nCX, type: 'center', label: `${node.id}-cx` });
        yTargets.push({ value: nCY, type: 'center', label: `${node.id}-cy` });
      }

      if (this.config.snapToEdge) {
        xTargets.push({ value: node.x, type: 'edge', label: `${node.id}-left` });
        xTargets.push({ value: node.x + node.width, type: 'edge', label: `${node.id}-right` });
        yTargets.push({ value: node.y, type: 'edge', label: `${node.id}-top` });
        yTargets.push({ value: node.y + node.height, type: 'edge', label: `${node.id}-bottom` });
      }
    }

    // --- Ruler guides ---
    if (this.config.snapToRulerGuides) {
      for (const guide of rulerGuides) {
        if (guide.axis === 'vertical') {
          xTargets.push({ value: guide.position, type: 'ruler', label: `ruler-${guide.id}` });
        } else {
          yTargets.push({ value: guide.position, type: 'ruler', label: `ruler-${guide.id}` });
        }
      }
    }

    // --- Grid snap ---
    if (this.config.snapToGrid) {
      const gs = this.config.gridSize;
      // Snap moving edges to grid
      const nearestGridX = Math.round(movingLeft / gs) * gs;
      const nearestGridY = Math.round(movingTop / gs) * gs;
      xTargets.push({ value: nearestGridX, type: 'grid', label: 'grid-x' });
      yTargets.push({ value: nearestGridY, type: 'grid', label: 'grid-y' });
    }

    // --- Find best X snap ---
    let bestXDist = threshold;
    // Check: moving left edge -> target, moving center -> target, moving right edge -> target
    const xEdges = [movingLeft, movingCX, movingRight];
    const xOffsets = [0, movingRect.width / 2, movingRect.width]; // offset from movingRect.x

    for (const target of xTargets) {
      for (let i = 0; i < xEdges.length; i++) {
        const dist = Math.abs(xEdges[i] - target.value);
        if (dist < bestXDist) {
          bestXDist = dist;
          snapX = target.value - xOffsets[i];
          // Generate guide line
          const guideLine: SnapGuideLine = {
            orientation: 'vertical',
            position: target.value,
            start: Math.min(movingTop, pageRect.y) - 20,
            end: Math.max(movingBottom, pageRect.y + pageRect.height) + 20,
            type: target.type,
          };
          // Replace or add guide
          const existingIdx = guides.findIndex((g) => g.orientation === 'vertical' && Math.abs(g.position - target.value) < 1);
          if (existingIdx >= 0) {
            guides[existingIdx] = guideLine;
          } else {
            guides.push(guideLine);
          }
        }
      }
    }

    // --- Find best Y snap ---
    let bestYDist = threshold;
    const yEdges = [movingTop, movingCY, movingBottom];
    const yOffsets = [0, movingRect.height / 2, movingRect.height];

    for (const target of yTargets) {
      for (let i = 0; i < yEdges.length; i++) {
        const dist = Math.abs(yEdges[i] - target.value);
        if (dist < bestYDist) {
          bestYDist = dist;
          snapY = target.value - yOffsets[i];
          const guideLine: SnapGuideLine = {
            orientation: 'horizontal',
            position: target.value,
            start: Math.min(movingLeft, pageRect.x) - 20,
            end: Math.max(movingRight, pageRect.x + pageRect.width) + 20,
            type: target.type,
          };
          const existingIdx = guides.findIndex((g) => g.orientation === 'horizontal' && Math.abs(g.position - target.value) < 1);
          if (existingIdx >= 0) {
            guides[existingIdx] = guideLine;
          } else {
            guides.push(guideLine);
          }
        }
      }
    }

    return { x: snapX, y: snapY, guides };
  }

  /**
   * Calculate spacing snap — equal distribution between three objects.
   */
  calculateSpacingSnap(
    movingRect: Rect,
    otherNodes: CanvasNode[],
    threshold: number,
  ): SnapResult {
    // Spacing snap: find pairs of adjacent nodes and snap to equal spacing
    const guides: SnapGuideLine[] = [];
    let snapX: number | null = null;
    let snapY: number | null = null;

    if (!this.config.snapToSpacing || otherNodes.length < 2) {
      return { x: null, y: null, guides: [] };
    }

    // Sort nodes by X position for horizontal spacing
    const sortedByX = [...otherNodes].sort((a, b) => a.x - b.x);

    for (let i = 0; i < sortedByX.length - 1; i++) {
      const a = sortedByX[i];
      const b = sortedByX[i + 1];
      const gap = b.x - (a.x + a.width);

      if (gap <= 0) continue;

      // Check if placing moving element before a, between a-b, or after b with same gap
      const beforeX = a.x - gap - movingRect.width;
      const betweenX = a.x + a.width + gap;
      const afterX = b.x + b.width + gap;

      const candidates = [
        { x: beforeX, label: 'before' },
        { x: betweenX - (betweenX - (a.x + a.width)), label: 'between' },
        { x: afterX, label: 'after' },
      ];

      for (const candidate of candidates) {
        if (Math.abs(movingRect.x - candidate.x) < threshold) {
          snapX = candidate.x;
          guides.push({
            orientation: 'vertical',
            position: candidate.x,
            start: Math.min(a.y, b.y, movingRect.y) - 10,
            end: Math.max(a.y + a.height, b.y + b.height, movingRect.y + movingRect.height) + 10,
            type: 'spacing',
          });
          break;
        }
      }
    }

    return { x: snapX, y: snapY, guides };
  }
}
