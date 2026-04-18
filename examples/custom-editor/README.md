# Custom Editor Example

Build a fully customized editor using low-level components.

## Code

```tsx
import {
  EditorProvider,
  Canvas,
  useEditor,
  useEditorStore,
  useKeyboardShortcuts,
} from '@cascoder/canvas-react';

function App() {
  return (
    <EditorProvider preset="presentation">
      <EditorShell />
    </EditorProvider>
  );
}

function EditorShell() {
  useKeyboardShortcuts();
  const editor = useEditor();
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const canUndo = useEditorStore((s) => s.canUndo);
  const zoom = useEditorStore((s) => s.zoom);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Left sidebar */}
      <aside style={{ width: 240, padding: 16, background: '#1a1a2e', color: '#fff' }}>
        <h3>Elements</h3>
        <button onClick={() => editor.addText({ content: 'Hello' })}>Add Text</button>
        <button onClick={() => editor.addShape('rectangle')}>Rectangle</button>
        <button onClick={() => editor.addShape('circle')}>Circle</button>
        <button onClick={() => editor.addShape('star')}>Star</button>

        <h3>Actions</h3>
        <button onClick={() => editor.undo()} disabled={!canUndo}>Undo</button>
        <button onClick={() => editor.deleteSelected()} disabled={!selectedIds.length}>
          Delete
        </button>
        <button onClick={() => editor.duplicateSelected()} disabled={!selectedIds.length}>
          Duplicate
        </button>

        <h3>Zoom: {Math.round(zoom * 100)}%</h3>
      </aside>

      {/* Canvas */}
      <main style={{ flex: 1 }}>
        <Canvas />
      </main>

      {/* Right sidebar */}
      <aside style={{ width: 280, padding: 16, background: '#1a1a2e', color: '#fff' }}>
        <h3>Properties</h3>
        {selectedIds.length === 0 ? (
          <p>Select an element to edit</p>
        ) : (
          <p>{selectedIds.length} element(s) selected</p>
        )}
      </aside>
    </div>
  );
}

export default App;
```

## What this demonstrates

- **EditorProvider** wraps the React tree with editor state
- **Canvas** renders the Konva stage with all interactions
- **useEditor()** provides CRUD operations
- **useEditorStore()** subscribes to reactive state
- **useKeyboardShortcuts()** enables all built-in shortcuts
- Full control over layout, styling, and available tools
