// ---------------------------------------------------------------------------
// @cascoder/playground — Top Bar
// File name, save status, undo/redo, export, project manager.
// ---------------------------------------------------------------------------

import React, { useState } from 'react';
import { useEditor, useEditorStore } from '@cascoder/canvas-react';
import type { SaveStatus } from '@cascoder/canvas-core';
import { FiChevronLeft, FiUndo, FiRedo, FiDownload, FiShare2 } from './icons';

interface TopBarProps {
  saveStatus: SaveStatus;
  onSaveNow: () => void;
  onOpenProjects: () => void;
}

const saveStatusConfig: Record<SaveStatus, { text: string; color: string; dotColor: string }> = {
  idle: { text: 'All changes saved', color: 'var(--color-text-muted)', dotColor: 'var(--color-success)' },
  saving: { text: 'Saving...', color: 'var(--color-text-muted)', dotColor: 'var(--color-warning)' },
  saved: { text: 'All changes saved', color: 'var(--color-text-muted)', dotColor: 'var(--color-success)' },
  error: { text: 'Save failed', color: 'var(--color-danger)', dotColor: 'var(--color-danger)' },
  recovering: { text: 'Recovering...', color: 'var(--color-warning)', dotColor: 'var(--color-warning)' },
};

export function TopBar({ saveStatus, onSaveNow, onOpenProjects }: TopBarProps) {
  const editor = useEditor();
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const statusCfg = saveStatusConfig[saveStatus];

  const handleExportJSON = async () => {
    const json = editor.toJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design.json';
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handleExportPNG = async () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const blob = await editor.exportPNG({ pixelRatio: 2 });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'design.png';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export PNG failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="editor-topbar">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)' }}
        >
          C
        </div>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
          Canvas Editor
        </span>
      </div>

      {/* File name + Projects button */}
      <button
        onClick={onOpenProjects}
        className="ml-4 px-3 py-1 rounded-md text-sm transition-all hover:bg-[var(--color-bg-hover)]"
        style={{
          background: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
        title="Open project manager"
      >
        📁 Untitled Design
      </button>

      {/* Save status */}
      <div
        className="flex items-center gap-1 text-xs cursor-pointer"
        style={{ color: statusCfg.color }}
        onClick={onSaveNow}
        title="Click to save now"
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: statusCfg.dotColor,
            transition: 'background 0.3s',
            animation: saveStatus === 'saving' ? 'pulse 1s infinite' : 'none',
          }}
        />
        {statusCfg.text}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          className="tool-btn tool-btn-sm"
          onClick={editor.undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          style={{ opacity: canUndo ? 1 : 0.3 }}
        >
          <FiUndo />
        </button>
        <button
          className="tool-btn tool-btn-sm"
          onClick={editor.redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
          style={{ opacity: canRedo ? 1 : 0.3 }}
        >
          <FiRedo />
        </button>
      </div>

      {/* Share */}
      <button className="tool-btn tool-btn-sm" title="Share">
        <FiShare2 />
      </button>

      {/* Export with dropdown */}
      <div style={{ position: 'relative' }}>
        <button
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={exporting}
          style={{
            background: exporting
              ? 'var(--color-bg-hover)'
              : 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
          }}
        >
          <FiDownload />
          {exporting ? 'Exporting...' : 'Export'}
        </button>

        {showExportMenu && (
          <div
            className="animate-fadeIn"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 4,
              minWidth: 160,
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <button
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-bg-hover)]"
              style={{ color: 'var(--color-text-primary)', borderBottom: '1px solid var(--color-border)' }}
              onClick={handleExportPNG}
            >
              📸 Export as PNG
            </button>
            <button
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-bg-hover)]"
              style={{ color: 'var(--color-text-primary)' }}
              onClick={handleExportJSON}
            >
              📄 Export as JSON
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
