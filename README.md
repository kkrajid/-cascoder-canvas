<div align="center">

# @cascoder/canvas

### The React Design Editor Engine

Build Canva-like design editors in your React application.

[![CI](https://github.com/kkrajid/-cascoder-canvas/actions/workflows/ci.yml/badge.svg)](https://github.com/kkrajid/-cascoder-canvas/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@cascoder/canvas-core.svg)](https://www.npmjs.com/package/@cascoder/canvas-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)

[Demo](https://cascoder-canvas.vercel.app) · [Docs](#documentation) · [Examples](#examples) · [Discord](#)

</div>

---

## What is this?

**@cascoder/canvas** is a production-grade design editor engine for React. It provides everything you need to build professional visual design tools — poster makers, social media editors, certificate builders, invoice designers, and more.

Think of it as the engine that powers Canva-like experiences, available as an npm package.

## Features

- 🎨 **Rich Node System** — Text, Image, Shape, Line, Group with typed properties
- ↩️ **Undo/Redo** — Command-pattern history with batch transactions (500 steps)
- 📐 **Smart Snapping** — Center, edge, spacing, grid, and ruler guide snapping
- 📄 **Multi-Page Documents** — Add, duplicate, reorder, delete pages
- 🔌 **Plugin System** — Extend with custom tools, panels, and node types
- ⌨️ **Keyboard Shortcuts** — 25+ shortcuts out of the box
- 💾 **Autosave** — IndexedDB persistence with crash recovery
- 📏 **Alignment Tools** — 6-direction alignment and distribution
- 🖼️ **PNG Export** — Async image export with proper asset loading
- 📦 **TypeScript-First** — Full type safety with discriminated unions
- ⚡ **Zustand-Powered** — Reactive state management with composable slices

## Quick Start

### Install

```bash
npm install @cascoder/canvas-core @cascoder/canvas-react
```

### Basic Editor (10 lines)

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
    <div style={{ width: '100vw', height: '100vh' }}>
      <button onClick={() => editor.addText({ content: 'Hello!' })}>
        Add Text
      </button>
      <button onClick={() => editor.addShape('rectangle')}>
        Add Shape
      </button>
      <button onClick={() => editor.exportPNG()}>
        Export
      </button>
      <Canvas />
    </div>
  );
}
```

## Architecture

```
@cascoder/canvas-core          @cascoder/canvas-react
┌─────────────────────┐        ┌──────────────────────┐
│  Store (7 Slices)   │        │  EditorProvider      │
│  ├── sceneSlice     │◄───────│  Canvas              │
│  ├── selectionSlice │        │  NodeRenderer        │
│  ├── historySlice   │        │  SelectionOverlay    │
│  ├── viewportSlice  │        │  MarqueeSelect       │
│  ├── pageSlice      │        │  TextEditorOverlay   │
│  ├── uiSlice        │        │  useEditor()         │
│  └── guidesSlice    │        │  useEditorStore()    │
│                     │        │  useKeyboardShortcuts│
│  Engines            │        └──────────────────────┘
│  ├── SnapEngine     │
│  ├── AlignEngine    │
│  └── AutosaveEngine │
│                     │
│  Types              │
│  ├── CanvasNode     │
│  ├── CanvasDocument │
│  ├── CanvasPlugin   │
│  └── EditorStore    │
└─────────────────────┘
```

### Design Principles

| Principle | How |
|-----------|-----|
| **Framework-agnostic core** | `canvas-core` has zero React/DOM dependencies |
| **TypeScript-first** | Discriminated unions for nodes, typed events, full inference |
| **Zustand-powered** | Composable slices, reactive subscriptions, middleware-ready |
| **Plugin-friendly** | Lifecycle hooks, UI extension points, custom data storage |
| **Renderer-independent** | Core logic doesn't depend on Konva — React package provides the renderer |

## Packages

| Package | Description | Size |
|---------|-------------|------|
| [`@cascoder/canvas-core`](./packages/canvas-core) | Store, types, engines — framework-agnostic | ~15KB gzip |
| [`@cascoder/canvas-react`](./packages/canvas-react) | React components, hooks, Konva renderer | ~25KB gzip |

## Examples

### Add Elements Programmatically

```tsx
const editor = useEditor();

// Text
editor.addText({ content: 'Hello World', fontSize: 48 });

// Shape
editor.addShape('rectangle', { x: 100, y: 100, width: 200, height: 150 });
editor.addShape('circle', { x: 300, y: 200 });
editor.addShape('star', { x: 500, y: 200 });

// Image
editor.addImage('https://example.com/photo.jpg');

// Group selected
editor.groupSelected();
```

### Undo/Redo

```tsx
const editor = useEditor();

editor.undo();
editor.redo();

// Batch operations (single undo point)
const state = editor.store.getState();
state.startBatch('Align all');
// ... multiple operations ...
state.endBatch();
```

### Export

```tsx
const editor = useEditor();

// Export as PNG
const blob = await editor.exportPNG();

// Download
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'design.png';
a.click();
```

### Serialize / Load

```tsx
const editor = useEditor();

// Save
const json = editor.toJSON();
localStorage.setItem('design', JSON.stringify(json));

// Load
const saved = JSON.parse(localStorage.getItem('design'));
editor.load(saved);
```

### Use Plugins

```tsx
const myPlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  init(editor) {
    console.log('Plugin initialized with', Object.keys(editor.getNodes()).length, 'nodes');
  },
  onNodeCreated(node) {
    console.log('Node created:', node.type, node.id);
  },
};

<EditorProvider plugins={[myPlugin]} preset="a4-portrait">
  <Canvas />
</EditorProvider>
```

## Page Presets

| Preset | Dimensions | Use Case |
|--------|-----------|----------|
| `instagram-post` | 1080 × 1080 | Social media posts |
| `instagram-story` | 1080 × 1920 | Stories / reels |
| `facebook-post` | 1200 × 630 | Facebook posts |
| `twitter-post` | 1200 × 675 | Twitter/X posts |
| `a4-portrait` | 2480 × 3508 | Print documents |
| `a4-landscape` | 3508 × 2480 | Print documents |
| `presentation` | 1920 × 1080 | Slides |
| `youtube-thumbnail` | 1280 × 720 | YouTube thumbnails |
| `business-card` | 1050 × 600 | Business cards |

## Comparison

| Feature | @cascoder/canvas | Fabric.js | Polotno | tldraw |
|---------|:---|:---|:---|:---|
| React-first | ✅ | ❌ Vanilla JS | ✅ | ✅ |
| TypeScript-first | ✅ | ⚠️ Retrofitted | ❌ Closed | ✅ |
| Undo/Redo built-in | ✅ | ❌ Manual | ✅ | ✅ |
| Multi-page | ✅ | ❌ | ✅ | ❌ |
| Smart snapping | ✅ | ⚠️ Basic | ✅ | ✅ |
| Plugin system | ✅ | ❌ | ❌ | ✅ |
| MIT license | ✅ | ✅ | ❌ $30/mo | ✅* |
| Bundle size | ~40KB | ~300KB | N/A | ~200KB |

## Documentation

- [canvas-core API](./packages/canvas-core/README.md) — Store, types, and engines
- [canvas-react API](./packages/canvas-react/README.md) — Components and hooks
- [Contributing](./CONTRIBUTING.md) — Development setup and guidelines
- [Changelog](./CHANGELOG.md) — Release history

## Development

```bash
# Install
pnpm install

# Dev mode (all packages)
pnpm run dev

# Run playground
pnpm run playground

# Build all
pnpm run build

# Type check
pnpm run typecheck

# Run tests
pnpm run test
```

## Roadmap

- [x] Core node system (text, image, shape, line, group)
- [x] Undo/redo with batch transactions
- [x] Multi-page documents
- [x] Smart snapping engine
- [x] Alignment & distribution
- [x] Plugin architecture
- [x] Autosave with IndexedDB
- [x] PNG export
- [ ] Rich text editing (inline bold/italic)
- [ ] SVG & PDF export
- [ ] Font manager
- [ ] Image crop tool
- [ ] Template engine
- [ ] Gradient rendering
- [ ] Collaboration (Y.js)
- [ ] `<CanvasEditor />` turnkey component

## License

[MIT](./LICENSE) — free for personal and commercial use.

## Author

Built by [Cascoder AI Technologies](https://cascoder.com).

---

<div align="center">

**[⬆ Back to top](#cascodercanvas)**

</div>
