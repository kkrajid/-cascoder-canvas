// ---------------------------------------------------------------------------
// @cascoder/playground — Left Sidebar
// Shape gallery, text presets, and section navigation.
// ---------------------------------------------------------------------------

import React from 'react';
import { useEditor, useEditorStore } from '@cascoder/canvas-react';
import {
  FiSquare, FiCircle, FiTriangle, FiStar, FiHexagon,
  FiArrowRight, FiSlash, FiType, FiUpload,
} from './icons';
import type { ShapeType } from '@cascoder/canvas-core';

const shapes: Array<{ type: ShapeType; icon: React.FC; label: string }> = [
  { type: 'rectangle', icon: FiSquare, label: 'Rectangle' },
  { type: 'circle', icon: FiCircle, label: 'Circle' },
  { type: 'triangle', icon: FiTriangle, label: 'Triangle' },
  { type: 'polygon', icon: FiHexagon, label: 'Polygon' },
  { type: 'star', icon: FiStar, label: 'Star' },
  { type: 'arrow', icon: FiArrowRight, label: 'Arrow' },
  { type: 'line', icon: FiSlash, label: 'Line' },
];

const textPresets = [
  { label: 'Add a heading', fontSize: 48, fontWeight: 700 },
  { label: 'Add a subheading', fontSize: 28, fontWeight: 600 },
  { label: 'Add body text', fontSize: 18, fontWeight: 400 },
  { label: 'Add a caption', fontSize: 14, fontWeight: 400 },
];

export function LeftSidebar() {
  const editor = useEditor();
  const leftPanelTab = useEditorStore((s) => s.leftPanelTab);
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);

  // Get active page dimensions for centering elements
  const activePage = pages.find((p) => p.id === activePageId);
  const pageW = activePage?.width ?? 1080;
  const pageH = activePage?.height ?? 1080;

  const handleAddShape = (type: ShapeType) => {
    const centerX = pageW / 2 - 100;
    const centerY = pageH / 2 - 100;
    editor.addShape(type, { x: centerX, y: centerY });
  };

  const handleAddText = (preset: typeof textPresets[0]) => {
    editor.addText({
      content: preset.label,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      x: pageW / 2 - 150,
      y: pageH / 2 - 30,
    });
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const src = ev.target?.result as string;
        editor.addImage(src, {
          x: 540 - 150,
          y: 540 - 150,
          width: 300,
          height: 300,
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <aside className="editor-left-sidebar">
      {/* Shapes Section */}
      <div className="panel-section animate-fadeIn">
        <h3 className="panel-title">Shapes</h3>
        <div className="shape-grid">
          {shapes.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              className="shape-card"
              title={label}
              onClick={() => handleAddShape(type)}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      {/* Text Presets */}
      <div className="panel-section animate-fadeIn">
        <h3 className="panel-title">Text</h3>
        <div className="flex flex-col gap-2">
          {textPresets.map((preset, i) => (
            <button
              key={i}
              className="w-full text-left px-3 py-2.5 rounded-lg border transition-all hover:border-[var(--color-accent)]"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-tertiary)',
                fontSize: Math.min(preset.fontSize * 0.5, 18),
                fontWeight: preset.fontWeight,
                color: 'var(--color-text-primary)',
              }}
              onClick={() => handleAddText(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Image */}
      <div className="panel-section animate-fadeIn">
        <h3 className="panel-title">Uploads</h3>
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed transition-all hover:border-[var(--color-accent)] hover:bg-[var(--color-bg-hover)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontSize: 13,
          }}
          onClick={handleImageUpload}
        >
          <FiUpload />
          Upload an image
        </button>
      </div>

      {/* Stress Test */}
      <div className="panel-section animate-fadeIn">
        <h3 className="panel-title">Performance</h3>
        <button
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #E17055, #FDCB6E)',
            color: '#1a1a2e',
          }}
          onClick={() => {
            const shapeTypes: ShapeType[] = ['rectangle', 'circle', 'triangle', 'star', 'polygon'];
            const colors = ['#6C5CE7', '#A29BFE', '#00B894', '#FDCB6E', '#E17055', '#74B9FF', '#FD79A8', '#00CEC9', '#FF7675', '#636E72'];
            const t0 = performance.now();
            for (let i = 0; i < 250; i++) {
              const x = Math.random() * 900 + 50;
              const y = Math.random() * 900 + 50;
              const size = 30 + Math.random() * 80;
              const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
              const fill = colors[Math.floor(Math.random() * colors.length)];
              editor.addShape(shapeType, {
                x, y,
                width: size,
                height: size,
                fill: { type: 'solid', color: fill },
              });
            }
            const ms = Math.round(performance.now() - t0);
            console.log(`[Perf] Added 250 nodes in ${ms}ms`);
            alert(`Added 250 nodes in ${ms}ms`);
          }}
        >
          🚀 Stress Test (250 nodes)
        </button>
      </div>
    </aside>
  );
}
