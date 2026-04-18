// ---------------------------------------------------------------------------
// @cascoder/playground — Bottom Bar (Zoom Controls)
// ---------------------------------------------------------------------------

import React from 'react';
import { useEditorStore } from '@cascoder/canvas-react';
import { FiMinus, FiPlus, FiMaximize } from './icons';

const zoomPresets = [25, 50, 75, 100, 150, 200, 400];

export function BottomBar() {
  const zoom = useEditorStore((s) => s.zoom);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const zoomToFit = useEditorStore((s) => s.zoomToFit);
  const setZoomPreset = useEditorStore((s) => s.setZoomPreset);
  const showRulers = useEditorStore((s) => s.showRulers);
  const toggleRulers = useEditorStore((s) => s.toggleRulers);
  const showGrid = useEditorStore((s) => s.showGrid);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <footer className="editor-bottombar">
      {/* Left: view toggles */}
      <div className="flex items-center gap-2 mr-auto">
        <button
          className={`text-[11px] px-2 py-0.5 rounded ${showRulers ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
          onClick={toggleRulers}
        >
          Rulers
        </button>
        <button
          className={`text-[11px] px-2 py-0.5 rounded ${showGrid ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}
          onClick={toggleGrid}
        >
          Grid
        </button>
      </div>

      {/* Center: zoom controls */}
      <div className="flex items-center gap-2">
        <button className="tool-btn tool-btn-sm" onClick={zoomOut} title="Zoom Out (Ctrl+-)">
          <FiMinus />
        </button>

        <select
          className="text-xs font-medium px-2 py-1 rounded-md cursor-pointer"
          style={{
            background: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            minWidth: 70,
            textAlign: 'center',
          }}
          value={zoomPercent}
          onChange={(e) => setZoomPreset(parseInt(e.target.value))}
        >
          {zoomPresets.map((p) => (
            <option key={p} value={p}>{p}%</option>
          ))}
          {!zoomPresets.includes(zoomPercent) && (
            <option value={zoomPercent}>{zoomPercent}%</option>
          )}
        </select>

        <button className="tool-btn tool-btn-sm" onClick={zoomIn} title="Zoom In (Ctrl+=)">
          <FiPlus />
        </button>

        <button className="tool-btn tool-btn-sm" onClick={zoomToFit} title="Fit to Page (Ctrl+0)">
          <FiMaximize />
        </button>
      </div>

      {/* Right spacer */}
      <div className="ml-auto" />
    </footer>
  );
}
