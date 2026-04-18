// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Selection Slice
// Manages selected node IDs, hovered state, and selection mode.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { EditorStore } from '../createEditorStore';

export type SelectionMode = 'single' | 'multi' | 'marquee';

export interface SelectionSlice {
  selectedIds: string[];
  hoveredId: string | null;
  selectionMode: SelectionMode;
  marqueeRect: { x: number; y: number; width: number; height: number } | null;

  // Actions
  selectNode: (id: string, additive?: boolean) => void;
  selectNodes: (ids: string[]) => void;
  deselectNode: (id: string) => void;
  deselectAll: () => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  setHoveredId: (id: string | null) => void;
  setMarqueeRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;
  commitMarqueeSelection: () => void;
}

export const createSelectionSlice: StateCreator<EditorStore, [], [], SelectionSlice> = (set, get) => ({
  selectedIds: [],
  hoveredId: null,
  selectionMode: 'single',
  marqueeRect: null,

  selectNode: (id, additive = false) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node || node.locked) return state;

      if (additive) {
        const alreadySelected = state.selectedIds.includes(id);
        if (alreadySelected) {
          return { selectedIds: state.selectedIds.filter((sid) => sid !== id) };
        }
        return {
          selectedIds: [...state.selectedIds, id],
          selectionMode: 'multi' as SelectionMode,
        };
      }

      return {
        selectedIds: [id],
        selectionMode: 'single' as SelectionMode,
      };
    });
  },

  selectNodes: (ids) => {
    set({
      selectedIds: ids,
      selectionMode: ids.length > 1 ? 'multi' : 'single',
    });
  },

  deselectNode: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  deselectAll: () => {
    set({ selectedIds: [], selectionMode: 'single', marqueeRect: null });
  },

  toggleSelection: (id) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node || node.locked) return state;

      const isSelected = state.selectedIds.includes(id);
      const newSelected = isSelected
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id];
      return {
        selectedIds: newSelected,
        selectionMode: newSelected.length > 1 ? 'multi' : 'single',
      };
    });
  },

  selectAll: () => {
    const state = get();
    const activePageId = state.activePageId;
    const pageOrder = state.nodeOrder[activePageId] ?? [];
    const selectableIds = pageOrder.filter((id) => {
      const node = state.nodes[id];
      return node && !node.locked && node.visible && !node.parentId;
    });
    set({
      selectedIds: selectableIds,
      selectionMode: selectableIds.length > 1 ? 'multi' : 'single',
    });
  },

  setHoveredId: (id) => set({ hoveredId: id }),

  setMarqueeRect: (rect) => set({ marqueeRect: rect, selectionMode: rect ? 'marquee' : 'single' }),

  commitMarqueeSelection: () => {
    const state = get();
    const rect = state.marqueeRect;
    if (!rect) return;

    const activePageId = state.activePageId;
    const pageOrder = state.nodeOrder[activePageId] ?? [];
    const matchedIds: string[] = [];

    for (const id of pageOrder) {
      const node = state.nodes[id];
      if (!node || node.locked || !node.visible || node.parentId) continue;

      // Simple AABB intersection check
      const overlaps =
        node.x < rect.x + rect.width &&
        node.x + node.width > rect.x &&
        node.y < rect.y + rect.height &&
        node.y + node.height > rect.y;

      if (overlaps) {
        matchedIds.push(id);
      }
    }

    set({
      selectedIds: matchedIds,
      marqueeRect: null,
      selectionMode: matchedIds.length > 1 ? 'multi' : 'single',
    });
  },
});
