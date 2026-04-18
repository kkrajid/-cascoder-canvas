// ---------------------------------------------------------------------------
// @cascoder/canvas-core — ClipboardManager
// Manages copy/paste state without polluting the global window object.
// ---------------------------------------------------------------------------

import type { CanvasNode } from '../types/node';

/**
 * ClipboardManager — handles copy/cut/paste for canvas nodes.
 *
 * Uses a module-scoped buffer instead of `window.__canvasClipboard`.
 * Integrates with the Zustand store for undo-tracked paste operations.
 */
export class ClipboardManager {
  private buffer: CanvasNode[] = [];
  private isCut = false;

  /** Copy nodes to clipboard buffer */
  copy(nodes: CanvasNode[]): void {
    if (nodes.length === 0) return;
    this.buffer = structuredClone(nodes);
    this.isCut = false;
  }

  /** Cut nodes — marks them for removal after paste */
  cut(nodes: CanvasNode[]): void {
    if (nodes.length === 0) return;
    this.buffer = structuredClone(nodes);
    this.isCut = true;
  }

  /** Get clipboard contents (cloned with new IDs applied externally) */
  getBuffer(): CanvasNode[] {
    return structuredClone(this.buffer);
  }

  /** Whether the last operation was a cut */
  wasCut(): boolean {
    return this.isCut;
  }

  /** Whether there's anything to paste */
  hasContent(): boolean {
    return this.buffer.length > 0;
  }

  /** Number of items in buffer */
  get count(): number {
    return this.buffer.length;
  }

  /** Clear the clipboard */
  clear(): void {
    this.buffer = [];
    this.isCut = false;
  }
}

/** Singleton clipboard instance for the editor */
export const clipboard = new ClipboardManager();
