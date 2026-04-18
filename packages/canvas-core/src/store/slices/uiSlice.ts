// ---------------------------------------------------------------------------
// @cascoder/canvas-core — UI Slice
// UI state: active tool, panel visibility, cursor mode, editing state.
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { EditorStore } from '../createEditorStore';

export type ActiveTool =
  | 'select'
  | 'text'
  | 'shape'
  | 'line'
  | 'hand'
  | 'crop'
  | 'eyedropper';

export type CursorMode =
  | 'default'
  | 'pointer'
  | 'grab'
  | 'grabbing'
  | 'crosshair'
  | 'text'
  | 'move'
  | 'resize-nw'
  | 'resize-ne'
  | 'resize-sw'
  | 'resize-se'
  | 'resize-n'
  | 'resize-s'
  | 'resize-e'
  | 'resize-w'
  | 'rotate';

export type LeftPanelTab =
  | 'templates'
  | 'uploads'
  | 'text'
  | 'shapes'
  | 'pages'
  | 'brand';

export interface UISlice {
  activeTool: ActiveTool;
  cursorMode: CursorMode;
  leftPanelTab: LeftPanelTab;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  layerPanelOpen: boolean;
  isEditingText: boolean;
  editingTextNodeId: string | null;
  showGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showGuides: boolean;
  showSnapGuides: boolean;
  contextMenuPosition: { x: number; y: number } | null;

  // Actions
  setActiveTool: (tool: ActiveTool) => void;
  setCursorMode: (mode: CursorMode) => void;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleLayerPanel: () => void;
  startTextEditing: (nodeId: string) => void;
  stopTextEditing: () => void;
  toggleGrid: () => void;
  setGridSize: (size: number) => void;
  toggleRulers: () => void;
  toggleGuides: () => void;
  toggleSnapGuides: () => void;
  setContextMenu: (position: { x: number; y: number } | null) => void;
}

export const createUISlice: StateCreator<EditorStore, [], [], UISlice> = (set) => ({
  activeTool: 'select',
  cursorMode: 'default',
  leftPanelTab: 'shapes',
  leftPanelOpen: true,
  rightPanelOpen: true,
  layerPanelOpen: false,
  isEditingText: false,
  editingTextNodeId: null,
  showGrid: false,
  gridSize: 20,
  showRulers: true,
  showGuides: true,
  showSnapGuides: true,
  contextMenuPosition: null,

  setActiveTool: (tool) => set({ activeTool: tool, cursorMode: tool === 'hand' ? 'grab' : 'default' }),
  setCursorMode: (mode) => set({ cursorMode: mode }),
  setLeftPanelTab: (tab) => set({ leftPanelTab: tab, leftPanelOpen: true }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleLayerPanel: () => set((s) => ({ layerPanelOpen: !s.layerPanelOpen })),
  startTextEditing: (nodeId) => set({ isEditingText: true, editingTextNodeId: nodeId }),
  stopTextEditing: () => set({ isEditingText: false, editingTextNodeId: null }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setGridSize: (size) => set({ gridSize: size }),
  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
  toggleGuides: () => set((s) => ({ showGuides: !s.showGuides })),
  toggleSnapGuides: () => set((s) => ({ showSnapGuides: !s.showSnapGuides })),
  setContextMenu: (position) => set({ contextMenuPosition: position }),
});
