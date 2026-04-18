// ---------------------------------------------------------------------------
// @cascoder/canvas-core — ClipboardManager Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from 'vitest';
import { ClipboardManager } from '../clipboard/ClipboardManager';
import { createTextNode, createShapeNode } from '../store/nodeFactories';

describe('ClipboardManager', () => {
  let cb: ClipboardManager;

  beforeEach(() => {
    cb = new ClipboardManager();
  });

  it('should start empty', () => {
    expect(cb.hasContent()).toBe(false);
    expect(cb.count).toBe(0);
  });

  it('should copy nodes to buffer', () => {
    const node = createTextNode({ pageId: 'p', content: 'Test' });
    cb.copy([node]);

    expect(cb.hasContent()).toBe(true);
    expect(cb.count).toBe(1);
    expect(cb.wasCut()).toBe(false);
  });

  it('should return cloned buffer (not same reference)', () => {
    const node = createShapeNode({ pageId: 'p' });
    cb.copy([node]);

    const buf1 = cb.getBuffer();
    const buf2 = cb.getBuffer();
    expect(buf1).not.toBe(buf2);
    expect(buf1[0]).not.toBe(buf2[0]);
    expect(buf1[0].id).toBe(buf2[0].id);
  });

  it('should mark cut operations', () => {
    const node = createTextNode({ pageId: 'p' });
    cb.cut([node]);

    expect(cb.wasCut()).toBe(true);
    expect(cb.hasContent()).toBe(true);
  });

  it('should clear the buffer', () => {
    const node = createTextNode({ pageId: 'p' });
    cb.copy([node]);
    cb.clear();

    expect(cb.hasContent()).toBe(false);
    expect(cb.count).toBe(0);
  });

  it('should not copy empty array', () => {
    cb.copy([]);
    expect(cb.hasContent()).toBe(false);
  });

  it('should handle multiple nodes', () => {
    const a = createTextNode({ pageId: 'p' });
    const b = createShapeNode({ pageId: 'p' });
    cb.copy([a, b]);

    expect(cb.count).toBe(2);
    const buffer = cb.getBuffer();
    expect(buffer).toHaveLength(2);
  });
});
