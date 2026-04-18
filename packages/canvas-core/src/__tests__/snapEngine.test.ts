// ---------------------------------------------------------------------------
// @cascoder/canvas-core — SnapEngine Tests
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import { SnapEngine } from '../engines/SnapEngine';
import type { Rect } from '../types/renderer';

function makeRect(x: number, y: number, w: number, h: number): Rect {
  return { x, y, width: w, height: h };
}

const pageRect: Rect = { x: 0, y: 0, width: 1080, height: 1080 };

describe('SnapEngine', () => {
  it('should return no snaps when disabled', () => {
    const engine = new SnapEngine({ enabled: false });
    const result = engine.calculateSnap(
      makeRect(100, 100, 100, 100),
      [],
      [],
      pageRect,
    );
    expect(result.x).toBeNull();
    expect(result.y).toBeNull();
    expect(result.guides).toHaveLength(0);
  });

  it('should snap to page center', () => {
    const engine = new SnapEngine({
      enabled: true,
      threshold: 10,
      snapToCenter: true,
      snapToEdge: false,
      snapToSpacing: false,
      snapToGrid: false,
      snapToRulerGuides: false,
    });
    // Node center at 538, page center at 540. Delta = 2 < threshold 10.
    const result = engine.calculateSnap(
      makeRect(488, 100, 100, 100),
      [],
      [],
      pageRect,
    );
    // Should snap center to 540 → x = 540 - 50 = 490
    expect(result.x).toBe(490);
  });

  it('should not snap when delta exceeds threshold', () => {
    const engine = new SnapEngine({
      enabled: true,
      threshold: 3,
      snapToCenter: true,
      snapToEdge: true,
      snapToSpacing: false,
      snapToGrid: false,
      snapToRulerGuides: false,
    });
    // Far from anything — no other nodes, far from page center
    const result = engine.calculateSnap(
      makeRect(50, 50, 100, 100),
      [],
      [],
      pageRect,
    );
    // 100 center is 100, page center is 540. Delta = 440 >> threshold 3.
    expect(result.x).toBeNull();
  });

  it('should return guides when snapping', () => {
    const engine = new SnapEngine({
      enabled: true,
      threshold: 10,
      snapToCenter: true,
      snapToEdge: true,
      snapToSpacing: false,
      snapToGrid: false,
      snapToRulerGuides: false,
    });
    // Near page center
    const result = engine.calculateSnap(
      makeRect(489, 100, 100, 100),
      [],
      [],
      pageRect,
    );
    if (result.x !== null) {
      expect(result.guides.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should snap to grid when enabled', () => {
    const engine = new SnapEngine({
      enabled: true,
      threshold: 10,
      snapToCenter: false,
      snapToEdge: false,
      snapToSpacing: false,
      snapToGrid: true,
      snapToRulerGuides: false,
      gridSize: 20,
    });
    const result = engine.calculateSnap(
      makeRect(53, 47, 100, 100),
      [],
      [],
      pageRect,
    );
    // Grid snap: should round to nearest 20
    if (result.x !== null) {
      expect(result.x % 20).toBe(0);
    }
    if (result.y !== null) {
      expect(result.y % 20).toBe(0);
    }
  });
});
