# Minimal Editor Example

The simplest possible design editor — under 20 lines of code.

## Setup

```bash
npm create vite@latest my-editor -- --template react-ts
cd my-editor
npm install @cascoder/canvas-core @cascoder/canvas-react
```

## Code

Replace `src/App.tsx` with:

```tsx
import { CanvasEditor } from '@cascoder/canvas-react';

function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>My Design Editor</h1>
      <CanvasEditor
        preset="instagram-post"
        height="80vh"
        onSave={(data) => {
          console.log('Saved:', data);
          localStorage.setItem('design', JSON.stringify(data));
        }}
        onExport={(blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url);
        }}
      />
    </div>
  );
}

export default App;
```

That's it. You have a working design editor with:
- Canvas with zoom/pan
- Add text, shapes
- Drag, resize, rotate
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z)
- Keyboard shortcuts
- PNG export
- Save to localStorage
