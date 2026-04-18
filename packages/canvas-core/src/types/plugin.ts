// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Plugin Types
// Plugin architecture for extending the editor.
// ---------------------------------------------------------------------------

import type { CanvasNode } from './node';
import type { EditorEventType, EditorEventHandler } from './events';

/** UI extension point for toolbar items */
export interface ToolbarExtension {
  id: string;
  label: string;
  icon?: string;
  position?: 'left' | 'center' | 'right';
  onClick: () => void;
  isActive?: () => boolean;
  isVisible?: () => boolean;
}

/** UI extension point for sidebar panels */
export interface PanelExtension {
  id: string;
  label: string;
  icon?: string;
  position: 'left' | 'right';
  render: () => HTMLElement | null;
  order?: number;
}

/** UI extension point for context menu items */
export interface ContextMenuExtension {
  id: string;
  label: string;
  icon?: string;
  onClick: (selectedNodes: CanvasNode[]) => void;
  isVisible?: (selectedNodes: CanvasNode[]) => boolean;
  separator?: boolean;
}

/** Editor API exposed to plugins for interacting with the editor */
export interface PluginEditorAPI {
  // State
  getNodes(): Record<string, CanvasNode>;
  getNode(id: string): CanvasNode | undefined;
  getSelectedIds(): string[];
  // Mutations
  addNode(node: Partial<CanvasNode> & { type: CanvasNode['type'] }): string;
  updateNode(id: string, changes: Partial<CanvasNode>): void;
  deleteNode(id: string): void;
  // Selection
  select(ids: string[]): void;
  deselect(): void;
  // Events
  on<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): () => void;
  off<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): void;
  // History
  undo(): void;
  redo(): void;
  // Export
  toJSON(): unknown;
  // Custom data
  setPluginData(key: string, value: unknown): void;
  getPluginData(key: string): unknown;
}

/** Plugin interface — implement this to create editor plugins */
export interface CanvasPlugin {
  /** Unique plugin name */
  name: string;
  /** Semantic version */
  version: string;
  /** Dependencies on other plugins (by name) */
  dependencies?: string[];

  /** Called when the plugin is registered */
  init(editor: PluginEditorAPI): void | Promise<void>;
  /** Called when the plugin is removed */
  destroy?(): void;

  // Lifecycle hooks
  onNodeCreated?(node: CanvasNode): void;
  onNodeUpdated?(node: CanvasNode, prev: CanvasNode): void;
  onNodeDeleted?(id: string): void;
  onSelectionChanged?(ids: string[]): void;
  onBeforeExport?(format: string): void;
  onAfterExport?(format: string, data: Blob): void;
  onPageChanged?(pageId: string): void;

  // UI extension points
  toolbar?: ToolbarExtension[];
  panels?: PanelExtension[];
  contextMenu?: ContextMenuExtension[];
}
