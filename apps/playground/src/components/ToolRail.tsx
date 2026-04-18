// ---------------------------------------------------------------------------
// @cascoder/playground — Tool Rail (vertical left bar)
// ---------------------------------------------------------------------------

import React from 'react';
import { useEditorStore } from '@cascoder/canvas-react';
import {
  FiMousePointer, FiType, FiSquare, FiImage, FiHand, FiLayers,
} from './icons';
const tools: Array<{ id: string; icon: React.FC; label: string; tool?: string }> = [
  { id: 'select', icon: FiMousePointer, label: 'Select (V)' },
  { id: 'hand', icon: FiHand, label: 'Hand (H)' },
  { id: 'text', icon: FiType, label: 'Text (T)' },
  { id: 'shape', icon: FiSquare, label: 'Shape' },
  { id: 'image', icon: FiImage, label: 'Image' },
  { id: 'layers', icon: FiLayers, label: 'Layers' },
];

export function ToolRail() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const toggleLayerPanel = useEditorStore((s) => s.toggleLayerPanel);

  return (
    <nav className="editor-tool-rail">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`tool-btn ${activeTool === id ? 'active' : ''}`}
          title={label}
          onClick={() => {
            if (id === 'layers') {
              toggleLayerPanel();
            } else {
              setActiveTool(id as any);
            }
          }}
        >
          <Icon />
        </button>
      ))}
    </nav>
  );
}
