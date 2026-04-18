// ---------------------------------------------------------------------------
// @cascoder/canvas-core — AlignEngine Tests
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import { alignNodes, distributeNodes } from '../engines/AlignEngine';
import { createShapeNode } from '../store/nodeFactories';

describe('AlignEngine', () => {
  it('should align nodes left', () => {
    const a = createShapeNode({ pageId: 'p', x: 100, y: 50, width: 80, height: 60 });
    const b = createShapeNode({ pageId: 'p', x: 300, y: 150, width: 80, height: 60 });
    const result = alignNodes([a, b], 'left');

    // Both should have the same x (the minimum: 100)
    expect(result[a.id].x).toBe(100);
    expect(result[b.id].x).toBe(100);
  });

  it('should align nodes center-horizontal', () => {
    const a = createShapeNode({ pageId: 'p', x: 100, y: 50, width: 80, height: 60 });
    const b = createShapeNode({ pageId: 'p', x: 300, y: 150, width: 120, height: 60 });
    const result = alignNodes([a, b], 'center-h');

    // Centers should match: (100 + 80/2) and (result[b].x + 120/2)
    const centerA = result[a.id].x + 80 / 2;
    const centerB = result[b.id].x + 120 / 2;
    expect(Math.abs(centerA - centerB)).toBeLessThan(0.1);
  });

  it('should align nodes right', () => {
    const a = createShapeNode({ pageId: 'p', x: 100, y: 50, width: 80, height: 60 });
    const b = createShapeNode({ pageId: 'p', x: 300, y: 150, width: 100, height: 60 });
    const result = alignNodes([a, b], 'right');

    // Right edges should match
    const rightA = result[a.id].x + 80;
    const rightB = result[b.id].x + 100;
    expect(Math.abs(rightA - rightB)).toBeLessThan(0.1);
  });

  it('should align nodes top', () => {
    const a = createShapeNode({ pageId: 'p', x: 100, y: 50, width: 80, height: 60 });
    const b = createShapeNode({ pageId: 'p', x: 300, y: 150, width: 80, height: 60 });
    const result = alignNodes([a, b], 'top');

    expect(result[a.id].y).toBe(50);
    expect(result[b.id].y).toBe(50);
  });

  it('should distribute horizontally with 3+ nodes', () => {
    const a = createShapeNode({ pageId: 'p', x: 0, y: 50, width: 50, height: 50 });
    const b = createShapeNode({ pageId: 'p', x: 100, y: 50, width: 50, height: 50 });
    const c = createShapeNode({ pageId: 'p', x: 400, y: 50, width: 50, height: 50 });
    const result = distributeNodes([a, b, c], 'horizontal');

    // Should return positions for all 3 nodes
    expect(Object.keys(result)).toHaveLength(3);
  });

  it('should return empty for distribute with < 3 nodes', () => {
    const a = createShapeNode({ pageId: 'p', x: 0, y: 50, width: 50, height: 50 });
    const b = createShapeNode({ pageId: 'p', x: 100, y: 50, width: 50, height: 50 });
    const result = distributeNodes([a, b], 'horizontal');

    expect(Object.keys(result)).toHaveLength(0);
  });
});
