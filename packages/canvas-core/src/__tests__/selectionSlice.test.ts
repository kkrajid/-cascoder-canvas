// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Selection Slice Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from 'vitest';
import { createEditorStore } from '../store/createEditorStore';
import { createShapeNode, createTextNode } from '../store/nodeFactories';
import type { StoreApi } from 'zustand';
import type { EditorStore } from '../store/createEditorStore';

type Store = StoreApi<EditorStore>;

function makeStore(): Store {
  const store = createEditorStore();
  const state = store.getState();
  if (state.pages.length === 0) state.addPage();
  return store;
}

describe('SelectionSlice', () => {
  let store: Store;
  let pageId: string;

  beforeEach(() => {
    store = makeStore();
    pageId = store.getState().pages[0].id;
  });

  it('should start with empty selection', () => {
    expect(store.getState().selectedIds).toHaveLength(0);
  });

  it('should select a single node', () => {
    const node = createShapeNode({ pageId });
    store.getState().addNode(node);
    store.getState().selectNode(node.id);

    expect(store.getState().selectedIds).toEqual([node.id]);
  });

  it('should select multiple nodes', () => {
    const a = createShapeNode({ pageId });
    const b = createShapeNode({ pageId });
    store.getState().addNodes([a, b]);
    store.getState().selectNodes([a.id, b.id]);

    expect(store.getState().selectedIds).toHaveLength(2);
  });

  it('should deselect all', () => {
    const node = createShapeNode({ pageId });
    store.getState().addNode(node);
    store.getState().selectNode(node.id);
    store.getState().deselectAll();

    expect(store.getState().selectedIds).toHaveLength(0);
  });

  it('should toggle selection', () => {
    const node = createShapeNode({ pageId });
    store.getState().addNode(node);

    store.getState().toggleSelection(node.id);
    expect(store.getState().selectedIds).toContain(node.id);

    store.getState().toggleSelection(node.id);
    expect(store.getState().selectedIds).not.toContain(node.id);
  });

  it('should select all nodes on active page', () => {
    const a = createShapeNode({ pageId });
    const b = createTextNode({ pageId });
    store.getState().addNodes([a, b]);
    store.getState().selectAll();

    expect(store.getState().selectedIds).toHaveLength(2);
  });
});
