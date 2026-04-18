# @cascoder/canvas-core

> Framework-agnostic design editor engine — state management, type system, and engines.

## Install

```bash
npm install @cascoder/canvas-core
```

## Overview

`canvas-core` provides the headless engine for a design editor. It contains no React or DOM dependencies and can be used with any rendering framework.

### What's included

| Module | Description |
|--------|-------------|
| **Store** | Zustand-based state with 7 composable slices |
| **Types** | Typed node system with discriminated unions |
| **SnapEngine** | Smart snapping (center, edge, spacing, grid, ruler) |
| **AlignEngine** | 6-direction alignment and H/V distribution |
| **AutosaveEngine** | Debounced persistence with crash recovery |
| **PluginManager** | Plugin lifecycle, dependency resolution, event routing |
| **EventBus** | Typed pub/sub for editor lifecycle events |
| **StorageAdapter** | Abstracted storage interface with IndexedDB implementation |

## Store Architecture

The editor store is composed of 7 independent slices:

```
createEditorStore()
├── sceneSlice       — Node CRUD, ordering, grouping
├── selectionSlice   — Single, multi, marquee selection
├── historySlice     — Undo/redo with batch transactions
├── viewportSlice    — Zoom, pan, coordinate transforms
├── pageSlice        — Multi-page management
├── uiSlice          — Tool state, panel toggles, cursor modes
└── guidesSlice      — Ruler guides management
```

### Usage

```ts
import { createEditorStore, createTextNode, createShapeNode } from '@cascoder/canvas-core';

const store = createEditorStore();

// Add a text node
const textNode = createTextNode({
  pageId: 'page_1',
  content: 'Hello World',
  fontSize: 48,
});
store.getState().addNode(textNode);

// Undo
store.getState().undo();

// Get all nodes
const nodes = store.getState().nodes;
```

## Node Types

| Type | Factory | Key Properties |
|------|---------|---------------|
| `text` | `createTextNode()` | content, fontFamily, fontSize, fontWeight, textAlign |
| `image` | `createImageNode()` | src, naturalWidth, naturalHeight, filters |
| `shape` | `createShapeNode()` | shapeType, cornerRadius, sides, innerRadius |
| `line` | `createLineNode()` | points, strokeCap, strokeJoin |
| `group` | `createGroupNode()` | childIds |

All nodes share a base interface with: id, type, x, y, width, height, rotation, opacity, visible, locked, zIndex, parentId, pageId, blendMode, shadow, constraints, flipX, flipY.

## Engines

### SnapEngine

```ts
import { SnapEngine } from '@cascoder/canvas-core';

const snap = new SnapEngine({
  threshold: 5,      // Snap distance in pixels
  gridSize: 10,      // Grid snap interval
  enableCenter: true,
  enableEdge: true,
  enableSpacing: true,
});

const result = snap.snapNode(movingNode, otherNodes, pageWidth, pageHeight);
// result: { x, y, guides: SnapGuideLine[] }
```

### AlignEngine

```ts
import { AlignEngine } from '@cascoder/canvas-core';

const updates = AlignEngine.align(selectedNodes, 'center-h', pageWidth, pageHeight);
// updates: { id, x?, y? }[]

const distUpdates = AlignEngine.distribute(selectedNodes, 'horizontal');
```

### AutosaveEngine

```ts
import { AutosaveEngine, IndexedDBAdapter } from '@cascoder/canvas-core';

const storage = new IndexedDBAdapter();
const autosave = new AutosaveEngine(storage, 'project-1', getState, getMeta, {
  interval: 3000,
  onStatusChange: (status) => console.log(status), // 'idle' | 'saving' | 'saved' | 'error'
});

autosave.start();
autosave.markDirty();
autosave.saveNow();
autosave.destroy();
```

## Page Presets

```ts
import { createBlankDocument } from '@cascoder/canvas-core';

const doc = createBlankDocument('my-doc', 'instagram-post');
// Available: instagram-post, instagram-story, facebook-post, twitter-post,
//            a4-portrait, a4-landscape, presentation, youtube-thumbnail, business-card
```

## Plugin System

```ts
import type { CanvasPlugin } from '@cascoder/canvas-core';

const myPlugin: CanvasPlugin = {
  name: 'analytics',
  version: '1.0.0',
  init(editor) {
    console.log('Connected to editor with', Object.keys(editor.getNodes()).length, 'nodes');
  },
  onNodeCreated(node) {
    trackEvent('node_created', { type: node.type });
  },
  onNodeDeleted(id) {
    trackEvent('node_deleted', { id });
  },
};
```

## API Reference

### Store Methods

#### Scene
- `addNode(node)` — Add a node to the scene
- `addNodes(nodes)` — Batch add
- `updateNode(id, changes)` — Update node properties
- `deleteNode(id)` — Delete a node
- `duplicateNode(id)` — Duplicate with offset
- `bringToFront(id)` / `sendToBack(id)` — Z-ordering
- `groupNodes(ids)` / `ungroupNode(id)` — Grouping

#### Selection
- `selectNode(id)` — Select single node
- `selectNodes(ids)` — Select multiple
- `toggleSelection(id)` — Toggle selection
- `deselectAll()` — Clear selection
- `selectAll()` — Select all on active page

#### History
- `pushCommand(cmd)` — Record a change
- `undo()` / `redo()` — Navigate history
- `startBatch(name)` / `endBatch()` — Group operations
- `clearHistory()` — Reset history

#### Viewport
- `setZoom(zoom, focalX?, focalY?)` — Zoom with focal point
- `zoomToFit()` — Fit page in viewport
- `panBy(dx, dy)` — Pan viewport

#### Pages
- `addPage(preset?)` — Add page
- `duplicatePage(id)` — Deep clone with ID remapping
- `deletePage(id)` — Delete page
- `setActivePage(id)` — Switch active page

## License

[MIT](./LICENSE)
