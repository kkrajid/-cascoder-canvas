// ---------------------------------------------------------------------------
// @cascoder/playground — Main App
// Full Canva-like editor layout with all panels.
// ---------------------------------------------------------------------------

import React from 'react';
import { EditorProvider } from '@cascoder/canvas-react';
import { EditorShell } from './components/EditorShell';

export function App() {
  return (
    <EditorProvider preset="instagram-post">
      <EditorShell />
    </EditorProvider>
  );
}
