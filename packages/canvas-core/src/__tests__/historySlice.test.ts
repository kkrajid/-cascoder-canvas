// ---------------------------------------------------------------------------
// @cascoder/canvas-core — History Slice Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from 'vitest';
import { createEditorStore } from '../store/createEditorStore';
import { createShapeNode } from '../store/nodeFactories';
import type { EditorStore } from '../store/createEditorStore';
import type { StoreApi } from 'zustand';

type Store = StoreApi<EditorStore>;

function makeStore(): Store {
  const store = createEditorStore();
  const state = store.getState();
  if (state.pages.length === 0) state.addPage();
  return store;
}

describe('HistorySlice', () => {
  let store: Store;

  beforeEach(() => {
    store = makeStore();
  });

  it('should start with empty history', () => {
    const s = store.getState();
    expect(s.canUndo).toBe(false);
    expect(s.canRedo).toBe(false);
  });

  it('should enable undo after pushCommand', () => {
    store.getState().pushCommand({
      name: 'Test',
      timestamp: Date.now(),
      before: {},
      after: {},
    });
    expect(store.getState().canUndo).toBe(true);
  });

  it('should undo a command', () => {
    const pageId = store.getState().pages[0].id;
    const node = createShapeNode({ pageId, x: 0 });
    store.getState().addNode(node);

    // Record a move command
    const before = { [node.id]: structuredClone(store.getState().nodes[node.id]) };
    store.getState().updateNode(node.id, { x: 200 });
    const after = { [node.id]: structuredClone(store.getState().nodes[node.id]) };

    store.getState().pushCommand({
      name: 'Move',
      timestamp: Date.now(),
      before,
      after,
    });

    // Node should be at 200
    expect(store.getState().nodes[node.id].x).toBe(200);

    // Undo should restore to 0
    store.getState().undo();
    expect(store.getState().nodes[node.id].x).toBe(0);
  });

  it('should redo after undo', () => {
    const pageId = store.getState().pages[0].id;
    const node = createShapeNode({ pageId, x: 0 });
    store.getState().addNode(node);

    const before = { [node.id]: structuredClone(store.getState().nodes[node.id]) };
    store.getState().updateNode(node.id, { x: 300 });
    const after = { [node.id]: structuredClone(store.getState().nodes[node.id]) };

    store.getState().pushCommand({
      name: 'Move',
      timestamp: Date.now(),
      before,
      after,
    });

    store.getState().undo();
    expect(store.getState().nodes[node.id].x).toBe(0);

    store.getState().redo();
    expect(store.getState().nodes[node.id].x).toBe(300);
  });

  it('should clear redo stack on new command after undo', () => {
    store.getState().pushCommand({ name: 'A', timestamp: 1, before: {}, after: {} });
    store.getState().pushCommand({ name: 'B', timestamp: 2, before: {}, after: {} });
    store.getState().undo();
    expect(store.getState().canRedo).toBe(true);

    store.getState().pushCommand({ name: 'C', timestamp: 3, before: {}, after: {} });
    expect(store.getState().canRedo).toBe(false);
  });

  it('should clearHistory', () => {
    store.getState().pushCommand({ name: 'A', timestamp: 1, before: {}, after: {} });
    store.getState().clearHistory();
    expect(store.getState().canUndo).toBe(false);
    expect(store.getState().canRedo).toBe(false);
  });

  it('should support batch operations', () => {
    store.getState().startBatch('batch-test');
    store.getState().pushCommand({
      name: 'Inner1',
      timestamp: 1,
      before: { 'fake-1': null },
      after: { 'fake-1': null },
    });
    store.getState().pushCommand({
      name: 'Inner2',
      timestamp: 2,
      before: { 'fake-2': null },
      after: { 'fake-2': null },
    });
    store.getState().endBatch();

    // Should be one undo operation for the whole batch
    expect(store.getState().canUndo).toBe(true);
    store.getState().undo();
    expect(store.getState().canUndo).toBe(false);
  });
});
