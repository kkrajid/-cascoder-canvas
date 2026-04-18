// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Scene Slice Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from 'vitest';
import { createEditorStore } from '../store/createEditorStore';
import { createTextNode, createShapeNode, createImageNode } from '../store/nodeFactories';
import type { EditorStore } from '../store/createEditorStore';
import type { StoreApi } from 'zustand';

type Store = StoreApi<EditorStore>;

function makeStore(): Store {
  const store = createEditorStore();
  // Ensure a page exists for testing
  const state = store.getState();
  if (state.pages.length === 0) {
    state.addPage('instagram-post');
  }
  return store;
}

function getPageId(store: Store): string {
  return store.getState().pages[0]?.id ?? '';
}

describe('SceneSlice', () => {
  let store: Store;
  let pageId: string;

  beforeEach(() => {
    store = makeStore();
    pageId = getPageId(store);
  });

  // ---- addNode ----
  it('should add a node to the store', () => {
    const node = createTextNode({ pageId, content: 'Hello' });
    store.getState().addNode(node);

    expect(store.getState().nodes[node.id]).toBeDefined();
    expect(store.getState().nodes[node.id].type).toBe('text');
  });

  it('should add node to nodeOrder for the correct page', () => {
    const node = createShapeNode({ pageId, shapeType: 'rectangle' });
    store.getState().addNode(node);

    const order = store.getState().nodeOrder[pageId];
    expect(order).toContain(node.id);
  });

  it('should add multiple nodes with addNodes', () => {
    const a = createTextNode({ pageId, content: 'A' });
    const b = createTextNode({ pageId, content: 'B' });
    store.getState().addNodes([a, b]);

    expect(Object.keys(store.getState().nodes)).toHaveLength(2);
    expect(store.getState().nodeOrder[pageId]).toHaveLength(2);
  });

  // ---- updateNode ----
  it('should update node properties', () => {
    const node = createTextNode({ pageId, content: 'Old' });
    store.getState().addNode(node);
    store.getState().updateNode(node.id, { x: 100, y: 200 });

    const updated = store.getState().nodes[node.id];
    expect(updated.x).toBe(100);
    expect(updated.y).toBe(200);
  });

  it('should preserve untouched properties on update', () => {
    const node = createTextNode({ pageId, content: 'Keep me' });
    store.getState().addNode(node);
    store.getState().updateNode(node.id, { x: 50 });

    const updated = store.getState().nodes[node.id] as any;
    expect(updated.content).toBe('Keep me');
  });

  // ---- deleteNode ----
  it('should delete a node from store and nodeOrder', () => {
    const node = createShapeNode({ pageId });
    store.getState().addNode(node);
    store.getState().deleteNode(node.id);

    expect(store.getState().nodes[node.id]).toBeUndefined();
    expect(store.getState().nodeOrder[pageId] ?? []).not.toContain(node.id);
  });

  it('should delete multiple nodes with deleteNodes', () => {
    const a = createTextNode({ pageId });
    const b = createTextNode({ pageId });
    store.getState().addNodes([a, b]);
    store.getState().deleteNodes([a.id, b.id]);

    expect(Object.keys(store.getState().nodes)).toHaveLength(0);
  });

  // ---- duplicateNode ----
  it('should duplicate a node with new ID and offset', () => {
    const node = createShapeNode({ pageId, x: 100, y: 100 });
    store.getState().addNode(node);
    const newId = store.getState().duplicateNode(node.id);

    expect(newId).toBeTruthy();
    expect(newId).not.toBe(node.id);
    const dup = store.getState().nodes[newId!];
    expect(dup).toBeDefined();
    expect(dup.x).toBeGreaterThan(100); // Offset applied
  });

  // ---- Ordering ----
  it('should bring node to front', () => {
    const a = createShapeNode({ pageId });
    const b = createShapeNode({ pageId });
    store.getState().addNodes([a, b]);
    store.getState().bringToFront(a.id);

    const order = store.getState().nodeOrder[pageId];
    expect(order[order.length - 1]).toBe(a.id);
  });

  it('should send node to back', () => {
    const a = createShapeNode({ pageId });
    const b = createShapeNode({ pageId });
    store.getState().addNodes([a, b]);
    store.getState().sendToBack(b.id);

    const order = store.getState().nodeOrder[pageId];
    expect(order[0]).toBe(b.id);
  });

  // ---- Grouping ----
  it('should group nodes and create group node', () => {
    const a = createShapeNode({ pageId });
    const b = createShapeNode({ pageId });
    store.getState().addNodes([a, b]);
    const groupId = store.getState().groupNodes([a.id, b.id]);

    expect(groupId).toBeTruthy();
    const group = store.getState().nodes[groupId!];
    expect(group.type).toBe('group');
  });

  it('should ungroup and remove group node', () => {
    const a = createShapeNode({ pageId });
    const b = createShapeNode({ pageId });
    store.getState().addNodes([a, b]);
    const groupId = store.getState().groupNodes([a.id, b.id])!;
    const children = store.getState().ungroupNode(groupId);

    expect(children.length).toBe(2);
    expect(store.getState().nodes[groupId]).toBeUndefined();
  });

  // ---- Queries ----
  it('should get node by ID', () => {
    const node = createTextNode({ pageId });
    store.getState().addNode(node);
    expect(store.getState().getNode(node.id)).toBeDefined();
  });

  it('should return undefined for non-existent node', () => {
    expect(store.getState().getNode('nonexistent')).toBeUndefined();
  });
});
