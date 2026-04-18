// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Node Factory Tests
// ---------------------------------------------------------------------------

import { describe, it, expect } from 'vitest';
import {
  createTextNode,
  createImageNode,
  createShapeNode,
  createLineNode,
  createGroupNode,
} from '../store/nodeFactories';

describe('Node Factories', () => {
  it('should create text node with defaults', () => {
    const node = createTextNode({ pageId: 'p1' });
    expect(node.type).toBe('text');
    expect(node.pageId).toBe('p1');
    expect(node.content).toBeDefined();
    expect(node.fontSize).toBeGreaterThan(0);
    expect(node.id).toBeTruthy();
    expect(node.visible).toBe(true);
    expect(node.locked).toBe(false);
  });

  it('should create text node with custom content', () => {
    const node = createTextNode({ pageId: 'p1', content: 'Hello World', fontSize: 72 });
    expect(node.content).toBe('Hello World');
    expect(node.fontSize).toBe(72);
  });

  it('should create shape node with defaults', () => {
    const node = createShapeNode({ pageId: 'p1' });
    expect(node.type).toBe('shape');
    expect(node.shapeType).toBeDefined();
    expect(node.width).toBeGreaterThan(0);
    expect(node.height).toBeGreaterThan(0);
  });

  it('should create circle shape', () => {
    const node = createShapeNode({ pageId: 'p1', shapeType: 'circle' });
    expect(node.shapeType).toBe('circle');
  });

  it('should create image node', () => {
    const node = createImageNode({ pageId: 'p1', src: 'https://example.com/img.jpg' });
    expect(node.type).toBe('image');
    expect(node.src).toBe('https://example.com/img.jpg');
  });

  it('should create line node', () => {
    const node = createLineNode({ pageId: 'p1' });
    expect(node.type).toBe('line');
    expect(node.points).toBeDefined();
    expect(node.points.length).toBeGreaterThan(0);
  });

  it('should create group node', () => {
    const node = createGroupNode({ pageId: 'p1', childIds: ['a', 'b'] });
    expect(node.type).toBe('group');
    expect(node.childIds).toEqual(['a', 'b']);
  });

  it('should generate unique IDs for each node', () => {
    const a = createTextNode({ pageId: 'p1' });
    const b = createTextNode({ pageId: 'p1' });
    expect(a.id).not.toBe(b.id);
  });
});
