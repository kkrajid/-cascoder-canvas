// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Public API Barrel Export
// ---------------------------------------------------------------------------

// Types
export type {
  NodeType, ShapeType, TextAlign, TextVerticalAlign, ObjectFit,
  LineCap, LineJoin, BlendMode, FillStyle, GradientDef, StrokeStyle,
  ShadowDef, TextRange, CropRect, ImageFilters, TextEffect,
  NodeConstraints, TextResizeMode, BaseNode, TextNode, ImageNode,
  ShapeNode, LineNode, GroupNode, VideoNode, CanvasNode,
} from './types/node';
export {
  isTextNode, isImageNode, isShapeNode, isLineNode, isGroupNode, isVideoNode,
  DEFAULT_FILL, DEFAULT_STROKE, DEFAULT_CONSTRAINTS, DEFAULT_IMAGE_FILTERS, DEFAULT_CROP_RECT,
} from './types/node';

export type {
  PagePreset, Page, PageBackground, AssetReference, GlobalStyles,
  DocumentMetadata, RulerGuide, CanvasDocument,
} from './types/document';
export { PAGE_PRESETS, CURRENT_SCHEMA_VERSION, createBlankDocument } from './types/document';

export type {
  EditorEventType, EditorEventMap, EditorEventHandler, EditorEventEmitter,
} from './types/events';
export { EventBus } from './types/events';

export type {
  CanvasPlugin, PluginEditorAPI, ToolbarExtension, PanelExtension, ContextMenuExtension,
} from './types/plugin';

export type {
  Rect, Point, ViewportState, RendererExportOptions, RendererOptions,
  HandlePosition, TransformEvent, RendererPointerEvent,
  RendererEventMap, RendererEventType, RendererAdapter,
} from './types/renderer';

// Store
export { createEditorStore } from './store/createEditorStore';
export type { EditorStore, EditorStoreInstance } from './store/createEditorStore';

// Node factories
export {
  createTextNode, createImageNode, createShapeNode,
  createLineNode, createGroupNode,
} from './store/nodeFactories';
export type {
  CreateTextOptions, CreateImageOptions, CreateShapeOptions,
  CreateLineOptions, CreateGroupOptions,
} from './store/nodeFactories';

// Engines
export { SnapEngine, DEFAULT_SNAP_CONFIG } from './engines/SnapEngine';
export type { SnapGuideLine, SnapResult, SnapConfig } from './engines/SnapEngine';

// Plugins
export { PluginManager } from './plugins/PluginManager';

// Storage
export type { StorageAdapter, ProjectMeta } from './storage/StorageAdapter';
export { IndexedDBAdapter } from './storage/IndexedDBAdapter';

// Autosave
export { AutosaveEngine } from './engines/AutosaveEngine';
export type { AutosaveConfig, SaveStatus } from './engines/AutosaveEngine';

// Align & Distribute
export { alignNodes, distributeNodes } from './engines/AlignEngine';
export type { AlignDirection, DistributeDirection } from './engines/AlignEngine';

// Utils
export * from './utils/math';
export { generateId, generatePageId, generateGuideId, generateDocumentId } from './utils/id';
