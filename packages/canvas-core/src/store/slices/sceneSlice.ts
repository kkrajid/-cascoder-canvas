// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Scene Slice
// Normalized node store for the scene graph.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { CanvasNode } from '../../types/node';
import type { EditorStore } from '../createEditorStore';
import { generateId } from '../../utils/id';
import { unionRects } from '../../utils/math';

export interface SceneSlice {
  /** Flat map of all nodes indexed by ID */
  nodes: Record<string, CanvasNode>;
  /** Ordered node IDs per page */
  nodeOrder: Record<string, string[]>;

  // ---- CRUD ----
  addNode: (node: CanvasNode) => void;
  addNodes: (nodes: CanvasNode[]) => void;
  updateNode: (id: string, changes: Partial<CanvasNode>) => void;
  updateNodes: (updates: Array<{ id: string; changes: Partial<CanvasNode> }>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  duplicateNode: (id: string) => string | null;

  // ---- Ordering ----
  moveNodeInOrder: (pageId: string, fromIndex: number, toIndex: number) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  // ---- Grouping ----
  groupNodes: (ids: string[]) => string | null;
  ungroupNode: (groupId: string) => string[];

  // ---- Queries ----
  getNode: (id: string) => CanvasNode | undefined;
  getNodesForPage: (pageId: string) => CanvasNode[];
  getChildren: (parentId: string) => CanvasNode[];
}

export const createSceneSlice: StateCreator<EditorStore, [], [], SceneSlice> = (set, get) => ({
  nodes: {},
  nodeOrder: {},

  addNode: (node) => {
    set((state) => {
      const newNodes = { ...state.nodes, [node.id]: node };
      const pageOrder = state.nodeOrder[node.pageId] ?? [];
      const newNodeOrder = {
        ...state.nodeOrder,
        [node.pageId]: [...pageOrder, node.id],
      };
      return { nodes: newNodes, nodeOrder: newNodeOrder };
    });
  },

  addNodes: (nodes) => {
    set((state) => {
      const newNodes = { ...state.nodes };
      const newNodeOrder = { ...state.nodeOrder };
      for (const node of nodes) {
        newNodes[node.id] = node;
        if (!newNodeOrder[node.pageId]) {
          newNodeOrder[node.pageId] = [];
        }
        newNodeOrder[node.pageId] = [...newNodeOrder[node.pageId], node.id];
      }
      return { nodes: newNodes, nodeOrder: newNodeOrder };
    });
  },

  updateNode: (id, changes) => {
    set((state) => {
      const existing = state.nodes[id];
      if (!existing) return state;
      return {
        nodes: {
          ...state.nodes,
          [id]: { ...existing, ...changes, updatedAt: Date.now() } as CanvasNode,
        },
      };
    });
  },

  updateNodes: (updates) => {
    set((state) => {
      const newNodes = { ...state.nodes };
      const now = Date.now();
      for (const { id, changes } of updates) {
        const existing = newNodes[id];
        if (existing) {
          newNodes[id] = { ...existing, ...changes, updatedAt: now } as CanvasNode;
        }
      }
      return { nodes: newNodes };
    });
  },

  deleteNode: (id) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node) return state;
      const newNodes = { ...state.nodes };
      delete newNodes[id];
      const pageOrder = state.nodeOrder[node.pageId] ?? [];
      const newNodeOrder = {
        ...state.nodeOrder,
        [node.pageId]: pageOrder.filter((nid) => nid !== id),
      };
      // Remove from selection
      const selectedIds = state.selectedIds.filter((sid) => sid !== id);
      return { nodes: newNodes, nodeOrder: newNodeOrder, selectedIds };
    });
  },

  deleteNodes: (ids) => {
    set((state) => {
      const newNodes = { ...state.nodes };
      const newNodeOrder = { ...state.nodeOrder };
      const idSet = new Set(ids);

      for (const id of ids) {
        const node = newNodes[id];
        if (node) {
          delete newNodes[id];
          if (newNodeOrder[node.pageId]) {
            newNodeOrder[node.pageId] = newNodeOrder[node.pageId].filter(
              (nid) => !idSet.has(nid)
            );
          }
        }
      }

      const selectedIds = state.selectedIds.filter((sid) => !idSet.has(sid));
      return { nodes: newNodes, nodeOrder: newNodeOrder, selectedIds };
    });
  },

  duplicateNode: (id) => {
    const state = get();
    const original = state.nodes[id];
    if (!original) return null;

    const newId = generateId(original.type.slice(0, 3));
    const duplicate: CanvasNode = {
      ...structuredClone(original),
      id: newId,
      name: `${original.name} copy`,
      x: original.x + 20,
      y: original.y + 20,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    state.addNode(duplicate);
    return newId;
  },

  moveNodeInOrder: (pageId, fromIndex, toIndex) => {
    set((state) => {
      const order = [...(state.nodeOrder[pageId] ?? [])];
      if (fromIndex < 0 || fromIndex >= order.length) return state;
      if (toIndex < 0 || toIndex >= order.length) return state;
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      return { nodeOrder: { ...state.nodeOrder, [pageId]: order } };
    });
  },

  bringToFront: (id) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node) return state;
      const order = state.nodeOrder[node.pageId] ?? [];
      const filtered = order.filter((nid) => nid !== id);
      return {
        nodeOrder: {
          ...state.nodeOrder,
          [node.pageId]: [...filtered, id],
        },
      };
    });
  },

  sendToBack: (id) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node) return state;
      const order = state.nodeOrder[node.pageId] ?? [];
      const filtered = order.filter((nid) => nid !== id);
      return {
        nodeOrder: {
          ...state.nodeOrder,
          [node.pageId]: [id, ...filtered],
        },
      };
    });
  },

  bringForward: (id) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node) return state;
      const order = [...(state.nodeOrder[node.pageId] ?? [])];
      const idx = order.indexOf(id);
      if (idx === -1 || idx >= order.length - 1) return state;
      [order[idx], order[idx + 1]] = [order[idx + 1], order[idx]];
      return { nodeOrder: { ...state.nodeOrder, [node.pageId]: order } };
    });
  },

  sendBackward: (id) => {
    set((state) => {
      const node = state.nodes[id];
      if (!node) return state;
      const order = [...(state.nodeOrder[node.pageId] ?? [])];
      const idx = order.indexOf(id);
      if (idx <= 0) return state;
      [order[idx], order[idx - 1]] = [order[idx - 1], order[idx]];
      return { nodeOrder: { ...state.nodeOrder, [node.pageId]: order } };
    });
  },

  groupNodes: (ids) => {
    if (ids.length < 2) return null;
    const state = get();
    const nodes = ids.map((id) => state.nodes[id]).filter(Boolean);
    if (nodes.length < 2) return null;

    const bounds = unionRects(
      nodes.map((n) => ({ x: n.x, y: n.y, width: n.width, height: n.height }))
    );

    const groupId = generateId('grp');
    const pageId = nodes[0].pageId;

    // Create group node
    const group: CanvasNode = {
      id: groupId,
      type: 'group',
      name: 'Group',
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: 0,
      parentId: null,
      pageId,
      blendMode: 'normal',
      shadow: null,
      constraints: { locked: false, preventDelete: false, preventMove: false, preventResize: false, preventRotate: false, preventEdit: false },
      flipX: false,
      flipY: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      childIds: ids,
    } as any;

    // Update children to reference group parent
    const updates = ids.map((id) => ({
      id,
      changes: { parentId: groupId } as Partial<CanvasNode>,
    }));

    set((s) => {
      const newNodes = { ...s.nodes, [groupId]: group };
      for (const { id, changes } of updates) {
        if (newNodes[id]) {
          newNodes[id] = { ...newNodes[id], ...changes } as CanvasNode;
        }
      }
      // In node order: replace first child position with group, remove others
      const order = [...(s.nodeOrder[pageId] ?? [])];
      const firstIdx = Math.min(...ids.map((id) => order.indexOf(id)).filter((i) => i >= 0));
      const filtered = order.filter((nid) => !ids.includes(nid));
      filtered.splice(firstIdx, 0, groupId);
      return {
        nodes: newNodes,
        nodeOrder: { ...s.nodeOrder, [pageId]: filtered },
        selectedIds: [groupId],
      };
    });

    return groupId;
  },

  ungroupNode: (groupId) => {
    const state = get();
    const group = state.nodes[groupId];
    if (!group || group.type !== 'group') return [];

    const childIds = (group as any).childIds as string[];

    set((s) => {
      const newNodes = { ...s.nodes };
      delete newNodes[groupId];

      for (const cid of childIds) {
        if (newNodes[cid]) {
          newNodes[cid] = { ...newNodes[cid], parentId: null } as CanvasNode;
        }
      }

      const order = [...(s.nodeOrder[group.pageId] ?? [])];
      const groupIdx = order.indexOf(groupId);
      if (groupIdx >= 0) {
        order.splice(groupIdx, 1, ...childIds);
      }

      return {
        nodes: newNodes,
        nodeOrder: { ...s.nodeOrder, [group.pageId]: order },
        selectedIds: childIds,
      };
    });

    return childIds;
  },

  getNode: (id) => get().nodes[id],

  getNodesForPage: (pageId) => {
    const state = get();
    const order = state.nodeOrder[pageId] ?? [];
    return order.map((id) => state.nodes[id]).filter(Boolean);
  },

  getChildren: (parentId) => {
    const state = get();
    return Object.values(state.nodes).filter((n) => n.parentId === parentId);
  },
});
