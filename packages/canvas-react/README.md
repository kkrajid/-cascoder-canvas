# @cascoder/canvas-react

> React components, hooks, and Konva renderer for `@cascoder/canvas` design editor.

## Install

```bash
npm install @cascoder/canvas-core @cascoder/canvas-react
```

### Peer Dependencies

```bash
npm install react react-dom
```

## Quick Start

```tsx
import { EditorProvider, Canvas, useEditor } from '@cascoder/canvas-react';

function App() {
  return (
    <EditorProvider preset="instagram-post">
      <MyEditor />
    </EditorProvider>
  );
}

function MyEditor() {
  const editor = useEditor();

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside style={{ width: 240, padding: 16 }}>
        <button onClick={() => editor.addText({ content: 'Hello!' })}>Add Text</button>
        <button onClick={() => editor.addShape('rectangle')}>Add Rectangle</button>
        <button onClick={() => editor.addShape('circle')}>Add Circle</button>
        <button onClick={() => editor.exportPNG()}>Export PNG</button>
      </aside>
      <main style={{ flex: 1 }}>
        <Canvas />
      </main>
    </div>
  );
}
```

## Components

### `<EditorProvider>`

Root context provider. Must wrap all editor components.

```tsx
<EditorProvider
  preset="instagram-post"     // Page preset (optional)
  document={savedDoc}          // Pre-existing document (optional)
  snapConfig={{ threshold: 5 }} // Snap engine config (optional)
  plugins={[myPlugin]}         // Plugins to register (optional)
  onReady={(ctx) => {}}        // Callback when editor is ready (optional)
>
  {children}
</EditorProvider>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `PagePreset` | `'instagram-post'` | Page size preset |
| `document` | `CanvasDocument` | — | Load existing document |
| `snapConfig` | `Partial<SnapConfig>` | — | Snap engine settings |
| `plugins` | `CanvasPlugin[]` | — | Plugins to register |
| `onReady` | `(ctx) => void` | — | Called when editor initializes |

### `<Canvas>`

The main canvas rendering surface. Handles zoom, pan, drag, selection, and snapping.

```tsx
<Canvas className="my-canvas" />
```

Must be inside an `<EditorProvider>`.

## Hooks

### `useEditor()`

Primary hook for interacting with the editor. Returns an ergonomic API object.

```tsx
const editor = useEditor();
```

**Returns:**

| Method | Description |
|--------|-------------|
| `addText(options)` | Add a text node |
| `addImage(src, options?)` | Add an image node |
| `addShape(type, options?)` | Add a shape node |
| `deleteSelected()` | Delete selected nodes |
| `duplicateSelected()` | Duplicate selected nodes |
| `groupSelected()` | Group selected nodes |
| `ungroupSelected()` | Ungroup selected group |
| `undo()` | Undo last operation |
| `redo()` | Redo last undone operation |
| `exportPNG()` | Export canvas as PNG blob |
| `toJSON()` | Serialize document to JSON |
| `load(data)` | Load a serialized document |
| `store` | Direct Zustand store access |

### `useEditorStore(selector)`

Select reactive state from the Zustand store (auto-rerenders on change).

```tsx
const selectedIds = useEditorStore((s) => s.selectedIds);
const zoom = useEditorStore((s) => s.zoom);
const nodes = useEditorStore((s) => s.nodes);
const activeTool = useEditorStore((s) => s.activeTool);
```

### `useEditorContext()`

Access the full editor context (store, event bus, plugin manager, snap engine).

```tsx
const { store, eventBus, pluginManager, snapEngine } = useEditorContext();
```

### `useKeyboardShortcuts()`

Register all built-in keyboard shortcuts. Call once in your editor shell.

```tsx
function EditorShell() {
  useKeyboardShortcuts();
  return <Canvas />;
}
```

**Built-in shortcuts:**

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+C` | Copy |
| `Ctrl+V` | Paste |
| `Ctrl+D` | Duplicate |
| `Ctrl+A` | Select all |
| `Delete` / `Backspace` | Delete selected |
| `Ctrl+G` | Group |
| `Ctrl+Shift+G` | Ungroup |
| `]` | Bring forward |
| `[` | Send backward |
| `Arrow keys` | Move 1px |
| `Shift+Arrow` | Move 10px |
| `Ctrl+=` | Zoom in |
| `Ctrl+-` | Zoom out |
| `Ctrl+0` | Zoom to fit |

## Node Renderers

The package includes renderers for all core node types:

| Renderer | Node Type | Features |
|----------|-----------|----------|
| `TextElement` | text | Font, size, weight, alignment, line height |
| `ImageElement` | image | Lazy loading, filters (brightness, contrast, blur, grayscale, sepia) |
| `ShapeElement` | shape | Rectangle, ellipse, triangle, polygon, star, arrow, line, SVG path |
| `LineElement` | line | Stroke, dash, cap, join |
| `GroupElement` | group | Recursive child rendering |

## Selection

- **Click** — Select single node
- **Shift+Click** — Add to selection
- **Ctrl+Click** — Toggle selection
- **Drag on empty canvas** — Marquee selection
- **Escape** — Deselect all

The `SelectionOverlay` component provides resize handles and rotation with 15° snapping.

## Export

```tsx
const editor = useEditor();

// Export current page as PNG
const blob = await editor.exportPNG();

// Use the blob
const url = URL.createObjectURL(blob);
window.open(url); // Preview
```

Images are loaded asynchronously before export — actual images appear in the output, not placeholders.

## TypeScript

All components and hooks are fully typed. Import types from canvas-core:

```tsx
import type {
  CanvasNode,
  TextNode,
  ImageNode,
  ShapeNode,
  CanvasDocument,
  PagePreset,
  EditorStore,
} from '@cascoder/canvas-core';
```

## License

[MIT](./LICENSE)
