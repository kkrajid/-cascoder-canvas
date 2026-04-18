// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Page Slice Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from 'vitest';
import { createEditorStore } from '../store/createEditorStore';
import { createShapeNode } from '../store/nodeFactories';
import type { StoreApi } from 'zustand';
import type { EditorStore } from '../store/createEditorStore';

type Store = StoreApi<EditorStore>;

function makeStore(): Store {
  const store = createEditorStore();
  const state = store.getState();
  if (state.pages.length === 0) state.addPage();
  return store;
}

describe('PageSlice', () => {
  let store: Store;

  beforeEach(() => {
    store = makeStore();
  });

  it('should have at least one page', () => {
    expect(store.getState().pages.length).toBeGreaterThanOrEqual(1);
  });

  it('should add a new page', () => {
    const before = store.getState().pages.length;
    store.getState().addPage();
    expect(store.getState().pages.length).toBe(before + 1);
  });

  it('should set active page', () => {
    store.getState().addPage();
    const pages = store.getState().pages;
    const secondPage = pages[pages.length - 1];
    store.getState().setActivePage(secondPage.id);
    expect(store.getState().activePageId).toBe(secondPage.id);
  });

  it('should duplicate a page', () => {
    const firstPageId = store.getState().pages[0].id;
    const node = createShapeNode({ pageId: firstPageId });
    store.getState().addNode(node);

    const before = store.getState().pages.length;
    store.getState().duplicatePage(firstPageId);
    expect(store.getState().pages.length).toBe(before + 1);
  });

  it('should delete a page (if more than 1)', () => {
    store.getState().addPage();
    const pages = store.getState().pages;
    expect(pages.length).toBe(2);

    store.getState().deletePage(pages[1].id);
    expect(store.getState().pages.length).toBe(1);
  });

  it('should not delete the last page', () => {
    const onlyPageId = store.getState().pages[0].id;
    store.getState().deletePage(onlyPageId);
    expect(store.getState().pages.length).toBeGreaterThanOrEqual(1);
  });
});
