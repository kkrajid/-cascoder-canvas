// ---------------------------------------------------------------------------
// @cascoder/playground — Right Sidebar (Property Panel)
// Context-aware property editing based on selected node type.
// ---------------------------------------------------------------------------

import React, { useCallback } from 'react';
import { useEditorStore } from '@cascoder/canvas-react';
import type { CanvasNode, TextNode, ShapeNode, ImageNode } from '@cascoder/canvas-core';
import { isTextNode, isShapeNode, isImageNode, alignNodes, distributeNodes } from '@cascoder/canvas-core';
import type { AlignDirection, DistributeDirection } from '@cascoder/canvas-core';
import {
  FiTrash, FiCopy, FiLock, FiUnlock, FiEye, FiEyeOff,
} from './icons';

export function RightSidebar() {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNode = useEditorStore((s) => s.updateNode);
  const deleteNode = useEditorStore((s) => s.deleteNode);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);

  const selectedNode = selectedIds.length === 1 ? nodes[selectedIds[0]] : null;

  if (!selectedNode) {
    return (
      <aside className="editor-right-sidebar">
        <div className="panel-section">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-3xl mb-3" style={{ color: 'var(--color-text-muted)' }}>🎨</div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Select an element to edit its properties
            </p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="editor-right-sidebar">
      {/* Actions */}
      <div className="panel-section">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            {selectedNode.type.toUpperCase()}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="tool-btn tool-btn-sm"
              title="Duplicate"
              onClick={() => { /* handled via shortcut */ }}
            >
              <FiCopy />
            </button>
            <button
              className="tool-btn tool-btn-sm"
              title={selectedNode.locked ? 'Unlock' : 'Lock'}
              onClick={() => updateNode(selectedNode.id, { locked: !selectedNode.locked })}
            >
              {selectedNode.locked ? <FiLock /> : <FiUnlock />}
            </button>
            <button
              className="tool-btn tool-btn-sm"
              title={selectedNode.visible ? 'Hide' : 'Show'}
              onClick={() => updateNode(selectedNode.id, { visible: !selectedNode.visible })}
            >
              {selectedNode.visible ? <FiEye /> : <FiEyeOff />}
            </button>
            <button
              className="tool-btn tool-btn-sm"
              title="Delete"
              onClick={() => deleteNode(selectedNode.id)}
              style={{ color: 'var(--color-danger)' }}
            >
              <FiTrash />
            </button>
          </div>
        </div>
      </div>

      {/* Position & Size */}
      <div className="panel-section animate-fadeIn">
        <h3 className="panel-title">Position & Size</h3>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={Math.round(selectedNode.x)} onChange={(v) => updateNode(selectedNode.id, { x: v })} />
          <NumberField label="Y" value={Math.round(selectedNode.y)} onChange={(v) => updateNode(selectedNode.id, { y: v })} />
          <NumberField label="W" value={Math.round(selectedNode.width)} onChange={(v) => updateNode(selectedNode.id, { width: Math.max(1, v) })} />
          <NumberField label="H" value={Math.round(selectedNode.height)} onChange={(v) => updateNode(selectedNode.id, { height: Math.max(1, v) })} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <NumberField label="R" value={Math.round(selectedNode.rotation)} onChange={(v) => updateNode(selectedNode.id, { rotation: v })} suffix="°" />
          <NumberField label="O" value={Math.round(selectedNode.opacity * 100)} onChange={(v) => updateNode(selectedNode.id, { opacity: Math.min(1, Math.max(0, v / 100)) })} suffix="%" />
        </div>
      </div>

      {/* Alignment Tools */}
      <AlignmentSection />

      {/* Type-specific properties */}
      {isTextNode(selectedNode) && <TextProperties node={selectedNode} updateNode={updateNode} />}
      {isShapeNode(selectedNode) && <ShapeProperties node={selectedNode} updateNode={updateNode} />}
      {isImageNode(selectedNode) && <ImageProperties node={selectedNode} updateNode={updateNode} />}

      {/* Layer Order */}
      <div className="panel-section animate-fadeIn">
        <h3 className="panel-title">Layer Order</h3>
        <div className="flex gap-2">
          <button
            className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-[var(--color-bg-hover)]"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            onClick={() => bringToFront(selectedNode.id)}
          >
            To Front
          </button>
          <button
            className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-[var(--color-bg-hover)]"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            onClick={() => sendToBack(selectedNode.id)}
          >
            To Back
          </button>
        </div>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Alignment & Distribution Section
// ---------------------------------------------------------------------------

function AlignmentSection() {
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNodes = useEditorStore((s) => s.updateNodes);
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);

  const page = pages.find((p) => p.id === activePageId);

  const handleAlign = useCallback((direction: AlignDirection) => {
    const targets = selectedIds.map((id) => nodes[id]).filter(Boolean).map((n) => ({
      id: n.id, x: n.x, y: n.y, width: n.width, height: n.height,
    }));
    const result = alignNodes(targets, direction, page?.width, page?.height);
    const updates = Object.entries(result).map(([id, pos]) => ({ id, changes: pos }));
    updateNodes(updates);
  }, [selectedIds, nodes, page, updateNodes]);

  const handleDistribute = useCallback((direction: DistributeDirection) => {
    const targets = selectedIds.map((id) => nodes[id]).filter(Boolean).map((n) => ({
      id: n.id, x: n.x, y: n.y, width: n.width, height: n.height,
    }));
    const result = distributeNodes(targets, direction);
    const updates = Object.entries(result).map(([id, pos]) => ({ id, changes: pos }));
    updateNodes(updates);
  }, [selectedIds, nodes, updateNodes]);

  if (selectedIds.length === 0) return null;

  const alignBtns: { label: string; dir: AlignDirection; icon: string }[] = [
    { label: 'Left', dir: 'left', icon: '⬅' },
    { label: 'Center', dir: 'center-h', icon: '↔' },
    { label: 'Right', dir: 'right', icon: '➡' },
    { label: 'Top', dir: 'top', icon: '⬆' },
    { label: 'Middle', dir: 'center-v', icon: '↕' },
    { label: 'Bottom', dir: 'bottom', icon: '⬇' },
  ];

  return (
    <div className="panel-section animate-fadeIn">
      <h3 className="panel-title">Alignment</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginBottom: 8 }}>
        {alignBtns.map((btn) => (
          <button
            key={btn.dir}
            className="tool-btn tool-btn-sm"
            title={`Align ${btn.label}`}
            onClick={() => handleAlign(btn.dir)}
            style={{ fontSize: 12, width: '100%', height: 30 }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
      {selectedIds.length >= 3 && (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-[var(--color-bg-hover)]"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            onClick={() => handleDistribute('horizontal')}
          >
            ↔ Distribute H
          </button>
          <button
            className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all hover:bg-[var(--color-bg-hover)]"
            style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
            onClick={() => handleDistribute('vertical')}
          >
            ↕ Distribute V
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Type-specific property panels
// ---------------------------------------------------------------------------

function TextProperties({ node, updateNode }: { node: TextNode; updateNode: (id: string, c: Partial<CanvasNode>) => void }) {
  const isEditingText = useEditorStore((s) => s.isEditingText);
  const editingTextNodeId = useEditorStore((s) => s.editingTextNodeId);
  const startTextEditing = useEditorStore((s) => s.startTextEditing);
  const stopTextEditing = useEditorStore((s) => s.stopTextEditing);

  const isEditing = isEditingText && editingTextNodeId === node.id;

  return (
    <div className="panel-section animate-fadeIn">
      <h3 className="panel-title">Text</h3>
      <div className="flex flex-col gap-2">
        {/* Edit Text Button */}
        <button
          className="w-full py-2 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: isEditing
              ? 'var(--color-danger)'
              : 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => isEditing ? stopTextEditing() : startTextEditing(node.id)}
        >
          {isEditing ? '✓ Done Editing' : '✏️ Edit Text'}
        </button>
        <div className="panel-row">
          <span className="panel-label">Font</span>
          <input
            className="input-field input-field-sm flex-1"
            value={node.fontFamily}
            onChange={(e) => updateNode(node.id, { fontFamily: e.target.value } as any)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Size" value={node.fontSize} onChange={(v) => updateNode(node.id, { fontSize: Math.max(1, v) } as any)} />
          <NumberField label="Weight" value={node.fontWeight} onChange={(v) => updateNode(node.id, { fontWeight: v } as any)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Spacing" value={node.letterSpacing} onChange={(v) => updateNode(node.id, { letterSpacing: v } as any)} />
          <NumberField label="Height" value={node.lineHeight} onChange={(v) => updateNode(node.id, { lineHeight: v } as any)} step={0.1} />
        </div>
        <div className="panel-row">
          <span className="panel-label">Align</span>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                className={`tool-btn tool-btn-sm ${node.textAlign === align ? 'active' : ''}`}
                onClick={() => updateNode(node.id, { textAlign: align } as any)}
                style={{ fontSize: 11 }}
              >
                {align[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="panel-row">
          <span className="panel-label">Color</span>
          <input
            type="color"
            className="w-8 h-8 rounded cursor-pointer border-0"
            value={node.fill.color ?? '#2D3436'}
            onChange={(e) => updateNode(node.id, { fill: { type: 'solid', color: e.target.value } } as any)}
          />
        </div>
      </div>
    </div>
  );
}

function ShapeProperties({ node, updateNode }: { node: ShapeNode; updateNode: (id: string, c: Partial<CanvasNode>) => void }) {
  return (
    <div className="panel-section animate-fadeIn">
      <h3 className="panel-title">Fill & Stroke</h3>
      <div className="flex flex-col gap-2">
        <div className="panel-row">
          <span className="panel-label">Fill</span>
          <input
            type="color"
            className="w-8 h-8 rounded cursor-pointer border-0"
            value={node.fill.color ?? '#6C5CE7'}
            onChange={(e) => updateNode(node.id, { fill: { type: 'solid', color: e.target.value } } as any)}
          />
        </div>
        {node.stroke && (
          <>
            <div className="panel-row">
              <span className="panel-label">Stroke</span>
              <input
                type="color"
                className="w-8 h-8 rounded cursor-pointer border-0"
                value={node.stroke.color}
                onChange={(e) => updateNode(node.id, { stroke: { ...node.stroke!, color: e.target.value } } as any)}
              />
            </div>
            <NumberField
              label="Width"
              value={node.stroke.width}
              onChange={(v) => updateNode(node.id, { stroke: { ...node.stroke!, width: Math.max(0, v) } } as any)}
            />
          </>
        )}
        <NumberField
          label="Radius"
          value={node.cornerRadius}
          onChange={(v) => updateNode(node.id, { cornerRadius: Math.max(0, v) } as any)}
        />
      </div>
    </div>
  );
}

function ImageProperties({ node, updateNode }: { node: ImageNode; updateNode: (id: string, c: Partial<CanvasNode>) => void }) {
  const handleReplace = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateNode(node.id, { src: ev.target?.result as string } as any);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  return (
    <div className="panel-section animate-fadeIn">
      <h3 className="panel-title">Image</h3>
      <div className="flex flex-col gap-2">
        <button
          className="w-full py-2 rounded-lg text-xs font-medium transition-all hover:bg-[var(--color-bg-hover)]"
          style={{ background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}
          onClick={handleReplace}
        >
          Replace Image
        </button>
        <NumberField
          label="Radius"
          value={node.cornerRadius}
          onChange={(v) => updateNode(node.id, { cornerRadius: Math.max(0, v) } as any)}
        />
        <NumberField
          label="Bright"
          value={node.filters.brightness}
          onChange={(v) => updateNode(node.id, { filters: { ...node.filters, brightness: v } } as any)}
        />
        <NumberField
          label="Contrast"
          value={node.filters.contrast}
          onChange={(v) => updateNode(node.id, { filters: { ...node.filters, contrast: v } } as any)}
        />
        <NumberField
          label="Blur"
          value={node.filters.blur}
          onChange={(v) => updateNode(node.id, { filters: { ...node.filters, blur: Math.max(0, v) } } as any)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reusable number field
// ---------------------------------------------------------------------------

function NumberField({
  label,
  value,
  onChange,
  suffix = '',
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="panel-label text-[11px]">{label}</span>
      <input
        type="number"
        className="input-field input-field-sm flex-1"
        value={value}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
      />
      {suffix && <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{suffix}</span>}
    </div>
  );
}
