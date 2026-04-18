# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-alpha.1] — 2026-04-18

### 🎉 First Alpha Release

Initial public alpha of the `@cascoder/canvas` design editor engine.

### Added

- **canvas-core**: Zustand-based store with 7 composable slices (scene, selection, history, viewport, page, UI, guides)
- **canvas-core**: Normalized node system with typed discriminated unions (text, image, shape, line, group)
- **canvas-core**: Command-pattern undo/redo with batch transactions and 500-step ring buffer
- **canvas-core**: Multi-page document model with deep-clone page duplication
- **canvas-core**: SnapEngine with center, edge, spacing, grid, and ruler guide snapping
- **canvas-core**: AlignEngine for 6-direction alignment and H/V distribution
- **canvas-core**: StorageAdapter interface with IndexedDB implementation
- **canvas-core**: AutosaveEngine with debounced dirty-tracking and crash recovery
- **canvas-core**: Plugin system with dependency resolution and lifecycle hooks
- **canvas-core**: Typed EventBus for editor lifecycle events
- **canvas-react**: EditorProvider with Zustand context and plugin manager
- **canvas-react**: Canvas component with Konva Stage, zoom/pan, drag/drop, transform
- **canvas-react**: 5 node renderers (Text, Image, Shape, Line, Group)
- **canvas-react**: SelectionOverlay with resize handles and rotation snapping
- **canvas-react**: MarqueeSelect with rubber-band selection (now wired)
- **canvas-react**: TextEditorOverlay for inline text editing
- **canvas-react**: SnapGuideLines and RulerGuideLines rendering
- **canvas-react**: useEditor hook with full CRUD API
- **canvas-react**: useKeyboardShortcuts with 25+ bindings
- **canvas-react**: PNG export with actual image loading (async)

### Fixed

- Image export now loads actual images instead of rendering gray placeholders
- GroupElement prop spread order fixed (handlers no longer overwritten)
- Circle shapes now use Konva Ellipse for proper radiusX/radiusY
- Plugin system wired — `setEditorAPI()` now called in EditorProvider
- Marquee selection connected to canvas mouse events
- Autosave only triggers on document changes (not zoom/pan/hover)
- Element placement uses dynamic page dimensions instead of hard-coded 540px

### Removed

- Unused `immer` dependency from canvas-core
