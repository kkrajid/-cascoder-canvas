// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Public API
// ---------------------------------------------------------------------------

// Components
export { EditorProvider, useEditorContext, useEditorStore } from './components/EditorProvider';
export type { EditorProviderProps, EditorContextValue } from './components/EditorProvider';
export { Canvas } from './components/Canvas';
export { CanvasEditor } from './components/CanvasEditor';
export type { CanvasEditorProps } from './components/CanvasEditor';

// Node components (for custom renderers)
export { NodeRenderer } from './components/nodes/NodeRenderer';
export { TextElement } from './components/nodes/TextElement';
export { ImageElement } from './components/nodes/ImageElement';
export { ShapeElement } from './components/nodes/ShapeElement';
export { LineElement } from './components/nodes/LineElement';
export { GroupElement } from './components/nodes/GroupElement';

// Selection
export { SelectionOverlay } from './components/selection/SelectionOverlay';
export { MarqueeSelect } from './components/selection/MarqueeSelect';

// Guides
export { SnapGuideLines } from './components/guides/SnapGuides';
export { RulerGuideLines } from './components/guides/RulerGuideLines';

// Text editing
export { TextEditorOverlay } from './components/text/TextEditorOverlay';

// Hooks
export { useEditor } from './hooks/useEditor';
export { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
