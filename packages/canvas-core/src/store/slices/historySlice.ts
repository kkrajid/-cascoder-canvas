// ---------------------------------------------------------------------------
// @cascoder/canvas-core — History Slice
// Command-pattern undo/redo with transaction batching and ring buffer.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { EditorStore } from '../createEditorStore';
import type { CanvasNode } from '../../types/node';

/** A single undoable command */
export interface HistoryCommand {
  name: string;
  timestamp: number;
  /** Snapshot of changed nodes BEFORE the command */
  before: Record<string, CanvasNode | null>;
  /** Snapshot of changed nodes AFTER the command */
  after: Record<string, CanvasNode | null>;
  /** Node order snapshots (if changed) */
  nodeOrderBefore?: Record<string, string[]>;
  nodeOrderAfter?: Record<string, string[]>;
}

const MAX_HISTORY = 500;

export interface HistorySlice {
  undoStack: HistoryCommand[];
  redoStack: HistoryCommand[];
  /** When non-null, mutations are batched into a single undo step */
  activeBatch: HistoryCommand | null;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  pushCommand: (command: HistoryCommand) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  /** Start a batch — all mutations until endBatch() become one undo step */
  startBatch: (name: string) => void;
  /** End the batch and push as a single command */
  endBatch: () => void;
  /** Record a snapshot for later undo (call before mutation) */
  captureBeforeState: (ids: string[]) => Record<string, CanvasNode | null>;
}

export const createHistorySlice: StateCreator<EditorStore, [], [], HistorySlice> = (set, get) => ({
  undoStack: [],
  redoStack: [],
  activeBatch: null,
  canUndo: false,
  canRedo: false,

  pushCommand: (command) => {
    set((state) => {
      // If batching, merge into active batch
      if (state.activeBatch) {
        const merged: HistoryCommand = {
          ...state.activeBatch,
          after: { ...state.activeBatch.after, ...command.after },
          nodeOrderAfter: command.nodeOrderAfter ?? state.activeBatch.nodeOrderAfter,
        };
        // Add before states only for keys not already present
        for (const key of Object.keys(command.before)) {
          if (!(key in merged.before)) {
            merged.before[key] = command.before[key];
          }
        }
        if (command.nodeOrderBefore) {
          if (!merged.nodeOrderBefore) merged.nodeOrderBefore = {};
          for (const key of Object.keys(command.nodeOrderBefore)) {
            if (!(key in merged.nodeOrderBefore)) {
              merged.nodeOrderBefore[key] = command.nodeOrderBefore[key];
            }
          }
        }
        return { activeBatch: merged };
      }

      // Normal push — add to undo stack, clear redo
      const newStack = [...state.undoStack, command];
      // Ring buffer: trim to MAX_HISTORY
      if (newStack.length > MAX_HISTORY) {
        newStack.splice(0, newStack.length - MAX_HISTORY);
      }
      return {
        undoStack: newStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const command = state.undoStack[state.undoStack.length - 1];

    // Apply "before" state
    set((s) => {
      const newNodes = { ...s.nodes };
      const removedIds: string[] = [];
      for (const [id, node] of Object.entries(command.before)) {
        if (node === null) {
          delete newNodes[id];
          removedIds.push(id);
        } else {
          newNodes[id] = node;
        }
      }

      const newNodeOrder = command.nodeOrderBefore
        ? { ...s.nodeOrder, ...command.nodeOrderBefore }
        : s.nodeOrder;

      // Clear any removed IDs from selection
      const removedSet = new Set(removedIds);
      const selectedIds = s.selectedIds.filter((sid) => !removedSet.has(sid));

      const newUndoStack = s.undoStack.slice(0, -1);
      return {
        nodes: newNodes,
        nodeOrder: newNodeOrder,
        undoStack: newUndoStack,
        redoStack: [...s.redoStack, command],
        canUndo: newUndoStack.length > 0,
        canRedo: true,
        selectedIds,
      };
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const command = state.redoStack[state.redoStack.length - 1];

    // Apply "after" state
    set((s) => {
      const newNodes = { ...s.nodes };
      for (const [id, node] of Object.entries(command.after)) {
        if (node === null) {
          delete newNodes[id];
        } else {
          newNodes[id] = node;
        }
      }

      const newNodeOrder = command.nodeOrderAfter
        ? { ...s.nodeOrder, ...command.nodeOrderAfter }
        : s.nodeOrder;

      const newRedoStack = s.redoStack.slice(0, -1);
      return {
        nodes: newNodes,
        nodeOrder: newNodeOrder,
        undoStack: [...s.undoStack, command],
        redoStack: newRedoStack,
        canUndo: true,
        canRedo: newRedoStack.length > 0,
      };
    });
  },

  clearHistory: () => {
    set({ undoStack: [], redoStack: [], canUndo: false, canRedo: false, activeBatch: null });
  },

  startBatch: (name) => {
    set({
      activeBatch: {
        name,
        timestamp: Date.now(),
        before: {},
        after: {},
      },
    });
  },

  endBatch: () => {
    const state = get();
    if (!state.activeBatch) return;

    const batch = state.activeBatch;
    // Only push if there are actual changes
    if (Object.keys(batch.before).length > 0 || Object.keys(batch.after).length > 0) {
      set({ activeBatch: null });
      state.pushCommand(batch);
    } else {
      set({ activeBatch: null });
    }
  },

  captureBeforeState: (ids) => {
    const state = get();
    const snapshot: Record<string, CanvasNode | null> = {};
    for (const id of ids) {
      snapshot[id] = state.nodes[id] ? structuredClone(state.nodes[id]) : null;
    }
    return snapshot;
  },
});
