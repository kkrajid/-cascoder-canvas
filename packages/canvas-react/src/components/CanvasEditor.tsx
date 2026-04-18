// ---------------------------------------------------------------------------
// @cascoder/canvas-react — CanvasEditor (Turnkey Component)
// Drop-in full editor with built-in toolbar, sidebar, and canvas.
// ---------------------------------------------------------------------------

import React, { useState, useCallback } from 'react';
import { EditorProvider } from './EditorProvider';
import { Canvas } from './Canvas';
import { useEditor } from '../hooks/useEditor';
import { useEditorStore } from './EditorProvider';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { CanvasDocument, CanvasPlugin, PagePreset, SnapConfig } from '@cascoder/canvas-core';

/** CanvasEditor props */
export interface CanvasEditorProps {
  /** Page size preset */
  preset?: PagePreset;
  /** Load existing document */
  document?: CanvasDocument;
  /** Snap engine config */
  snapConfig?: Partial<SnapConfig>;
  /** Plugins to register */
  plugins?: CanvasPlugin[];
  /** Called when user triggers save */
  onSave?: (data: unknown) => void;
  /** Called when user exports */
  onExport?: (blob: Blob) => void;
  /** Called when editor is ready */
  onReady?: (editor: ReturnType<typeof useEditor>) => void;
  /** Custom CSS class */
  className?: string;
  /** Editor height */
  height?: string | number;
  /** Show built-in toolbar */
  showToolbar?: boolean;
  /** Editor theme */
  theme?: 'dark' | 'light';
}

/** Built-in minimal toolbar for the turnkey editor */
function EditorToolbar({
  onSave,
  onExport,
}: {
  onSave?: (data: unknown) => void;
  onExport?: (blob: Blob) => void;
}) {
  const editor = useEditor();
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);

  const handleExport = useCallback(async () => {
    const blob = await editor.exportPNG();
    if (blob && onExport) {
      onExport(blob);
    } else if (blob) {
      // Default: download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'design.png';
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [editor, onExport]);

  const handleSave = useCallback(() => {
    const data = editor.toJSON();
    onSave?.(data);
  }, [editor, onSave]);

  return (
    <div style={toolbarStyles.bar}>
      <div style={toolbarStyles.group}>
        <ToolbarButton onClick={() => editor.addText({ content: 'Text' })} title="Add Text">
          T
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.addShape('rectangle')} title="Add Rectangle">
          ▮
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.addShape('circle')} title="Add Circle">
          ●
        </ToolbarButton>
      </div>

      <div style={toolbarStyles.divider} />

      <div style={toolbarStyles.group}>
        <ToolbarButton onClick={() => editor.undo()} disabled={!canUndo} title="Undo">
          ↩
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.redo()} disabled={!canRedo} title="Redo">
          ↪
        </ToolbarButton>
      </div>

      <div style={toolbarStyles.divider} />

      <div style={toolbarStyles.group}>
        <ToolbarButton onClick={() => editor.deleteSelected()} disabled={selectedIds.length === 0} title="Delete">
          🗑
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.duplicateSelected()} disabled={selectedIds.length === 0} title="Duplicate">
          ⧉
        </ToolbarButton>
      </div>

      <div style={{ flex: 1 }} />

      <div style={toolbarStyles.group}>
        {onSave && (
          <ToolbarButton onClick={handleSave} title="Save">
            💾
          </ToolbarButton>
        )}
        <ToolbarButton onClick={handleExport} title="Export PNG" accent>
          ⬇ Export
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  disabled,
  title,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  accent?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...toolbarStyles.button,
        ...(accent ? toolbarStyles.accent : {}),
        ...(hovered && !disabled ? toolbarStyles.buttonHover : {}),
        ...(disabled ? toolbarStyles.buttonDisabled : {}),
      }}
    >
      {children}
    </button>
  );
}

/** Inner editor shell with keyboard shortcuts */
function EditorShell({
  onSave,
  onExport,
  showToolbar,
  height,
  className,
}: {
  onSave?: (data: unknown) => void;
  onExport?: (blob: Blob) => void;
  showToolbar: boolean;
  height: string | number;
  className?: string;
}) {
  useKeyboardShortcuts();

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height,
        width: '100%',
        background: '#1a1a2e',
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {showToolbar && <EditorToolbar onSave={onSave} onExport={onExport} />}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas />
      </div>
    </div>
  );
}

/**
 * CanvasEditor — Turnkey design editor component.
 *
 * Drop this into your React app for a complete design editor
 * with toolbar, canvas, keyboard shortcuts, and export.
 *
 * @example
 * ```tsx
 * <CanvasEditor
 *   preset="instagram-post"
 *   onSave={(data) => saveToServer(data)}
 *   onExport={(blob) => download(blob)}
 * />
 * ```
 */
export function CanvasEditor({
  preset = 'instagram-post',
  document: initialDoc,
  snapConfig,
  plugins,
  onSave,
  onExport,
  onReady,
  className,
  height = '600px',
  showToolbar = true,
}: CanvasEditorProps) {
  return (
    <EditorProvider
      preset={preset}
      document={initialDoc}
      snapConfig={snapConfig}
      plugins={plugins}
      onReady={onReady ? (ctx) => onReady(ctx as any) : undefined}
    >
      <EditorShell
        onSave={onSave}
        onExport={onExport}
        showToolbar={showToolbar}
        height={height}
        className={className}
      />
    </EditorProvider>
  );
}

// --- Built-in styles (no external CSS dependency) ---
const toolbarStyles: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '8px 12px',
    background: '#16213e',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    minHeight: 44,
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 24,
    background: 'rgba(255,255,255,0.1)',
    margin: '0 6px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: '6px 10px',
    border: 'none',
    borderRadius: 6,
    background: 'transparent',
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
  },
  buttonHover: {
    background: 'rgba(255,255,255,0.08)',
  },
  buttonDisabled: {
    opacity: 0.35,
    cursor: 'default',
  },
  accent: {
    background: '#6C5CE7',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: 6,
    fontWeight: 600,
  },
};
