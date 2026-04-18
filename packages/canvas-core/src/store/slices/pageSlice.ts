// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Page Slice
// Multi-page/artboard management.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { EditorStore } from '../createEditorStore';
import type { Page, PageBackground } from '../../types/document';
import { generatePageId, generateId } from '../../utils/id';

export interface PageSlice {
  pages: Page[];
  activePageId: string;

  // Actions
  addPage: (options?: Partial<Page>) => string;
  deletePage: (id: string) => void;
  duplicatePage: (id: string) => string | null;
  setActivePage: (id: string) => void;
  updatePage: (id: string, changes: Partial<Page>) => void;
  reorderPages: (fromIndex: number, toIndex: number) => void;
  setPageBackground: (id: string, background: PageBackground) => void;
  setPageSize: (id: string, width: number, height: number) => void;
}

export const createPageSlice: StateCreator<EditorStore, [], [], PageSlice> = (set, get) => ({
  pages: [],
  activePageId: '',

  addPage: (options) => {
    const state = get();
    const id = options?.id ?? generatePageId();
    const activePage = state.pages.find((p) => p.id === state.activePageId);
    const now = Date.now();

    const newPage: Page = {
      id,
      name: options?.name ?? `Page ${state.pages.length + 1}`,
      width: options?.width ?? activePage?.width ?? 1080,
      height: options?.height ?? activePage?.height ?? 1080,
      background: options?.background ?? {
        type: 'color',
        fill: { type: 'solid', color: '#FFFFFF' },
      },
      sortOrder: state.pages.length,
      createdAt: now,
      updatedAt: now,
    };

    set((s) => ({
      pages: [...s.pages, newPage],
      activePageId: id,
      nodeOrder: { ...s.nodeOrder, [id]: [] },
    }));

    return id;
  },

  deletePage: (id) => {
    set((state) => {
      if (state.pages.length <= 1) return state; // Must have at least 1 page

      const newPages = state.pages.filter((p) => p.id !== id);
      // Recompute sort orders
      newPages.forEach((p, i) => (p.sortOrder = i));

      // Delete all nodes on this page
      const newNodes = { ...state.nodes };
      const pageNodeIds = state.nodeOrder[id] ?? [];
      for (const nodeId of pageNodeIds) {
        delete newNodes[nodeId];
      }
      const newNodeOrder = { ...state.nodeOrder };
      delete newNodeOrder[id];

      // Switch active page if needed
      let activePageId = state.activePageId;
      if (activePageId === id) {
        activePageId = newPages[0]?.id ?? '';
      }

      return {
        pages: newPages,
        activePageId,
        nodes: newNodes,
        nodeOrder: newNodeOrder,
        selectedIds: state.activePageId === id ? [] : state.selectedIds,
      };
    });
  },

  duplicatePage: (id) => {
    const state = get();
    const page = state.pages.find((p) => p.id === id);
    if (!page) return null;

    const newPageId = generatePageId();
    const now = Date.now();

    const newPage: Page = {
      ...structuredClone(page),
      id: newPageId,
      name: `${page.name} (copy)`,
      sortOrder: state.pages.length,
      createdAt: now,
      updatedAt: now,
    };

    // Duplicate all nodes on this page
    const pageNodeIds = state.nodeOrder[id] ?? [];
    const idMapping = new Map<string, string>();
    const newNodes: Record<string, any> = {};

    for (const nodeId of pageNodeIds) {
      const node = state.nodes[nodeId];
      if (!node) continue;
      const newNodeId = generateId(node.type.slice(0, 3));
      idMapping.set(nodeId, newNodeId);
      newNodes[newNodeId] = {
        ...structuredClone(node),
        id: newNodeId,
        pageId: newPageId,
        createdAt: now,
        updatedAt: now,
      };
    }

    // Update parent references in duplicated nodes
    for (const newNode of Object.values(newNodes) as any[]) {
      if (newNode.parentId && idMapping.has(newNode.parentId)) {
        newNode.parentId = idMapping.get(newNode.parentId);
      }
      if (newNode.childIds) {
        newNode.childIds = newNode.childIds.map(
          (cid: string) => idMapping.get(cid) ?? cid
        );
      }
    }

    const newNodeOrder = pageNodeIds.map((nid) => idMapping.get(nid) ?? nid);

    set((s) => ({
      pages: [...s.pages, newPage],
      nodes: { ...s.nodes, ...newNodes },
      nodeOrder: { ...s.nodeOrder, [newPageId]: newNodeOrder },
      activePageId: newPageId,
      selectedIds: [],
    }));

    return newPageId;
  },

  setActivePage: (id) => {
    set({ activePageId: id, selectedIds: [] });
  },

  updatePage: (id, changes) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, ...changes, updatedAt: Date.now() } : p
      ),
    }));
  },

  reorderPages: (fromIndex, toIndex) => {
    set((state) => {
      const pages = [...state.pages];
      const [moved] = pages.splice(fromIndex, 1);
      pages.splice(toIndex, 0, moved);
      pages.forEach((p, i) => (p.sortOrder = i));
      return { pages };
    });
  },

  setPageBackground: (id, background) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, background, updatedAt: Date.now() } : p
      ),
    }));
  },

  setPageSize: (id, width, height) => {
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id ? { ...p, width, height, updatedAt: Date.now() } : p
      ),
    }));
  },
});
