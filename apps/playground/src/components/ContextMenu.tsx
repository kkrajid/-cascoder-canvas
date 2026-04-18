// ---------------------------------------------------------------------------
// @cascoder/playground — Context Menu
// Premium right-click context menu for canvas elements.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef } from 'react';
import { useEditorStore, useEditor } from '@cascoder/canvas-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  danger?: boolean;
  dividerAfter?: boolean;
  disabled?: boolean;
}

export function ContextMenu({ x, y, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useEditor();
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const nodes = useEditorStore((s) => s.nodes);
  const updateNode = useEditorStore((s) => s.updateNode);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);

  const hasSelection = selectedIds.length > 0;
  const singleSelected = selectedIds.length === 1 ? nodes[selectedIds[0]] : null;
  const isGroup = singleSelected?.type === 'group';
  const isLocked = singleSelected?.locked ?? false;

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    // Delay to avoid the context menu event itself closing it
    requestAnimationFrame(() => {
      window.addEventListener('mousedown', handleClick);
      window.addEventListener('keydown', handleEscape);
    });
    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 400);

  const items: MenuItem[] = [
    {
      label: 'Copy',
      icon: '📋',
      shortcut: 'Ctrl+C',
      action: () => {
        const selectedNodes = selectedIds.map((id) => nodes[id]).filter(Boolean);
        if (selectedNodes.length > 0) {
          (window as any).__canvasClipboard = structuredClone(selectedNodes);
        }
        onClose();
      },
      disabled: !hasSelection,
    },
    {
      label: 'Paste',
      icon: '📄',
      shortcut: 'Ctrl+V',
      action: () => {
        // Trigger paste via keyboard shortcut simulation
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'v', ctrlKey: true }));
        onClose();
      },
      disabled: !(window as any).__canvasClipboard,
    },
    {
      label: 'Duplicate',
      icon: '✨',
      shortcut: 'Ctrl+D',
      action: () => { editor.duplicateSelected(); onClose(); },
      disabled: !hasSelection,
      dividerAfter: true,
    },
    {
      label: 'Bring to Front',
      icon: '⬆️',
      shortcut: 'Ctrl+]',
      action: () => { if (singleSelected) bringToFront(singleSelected.id); onClose(); },
      disabled: !singleSelected,
    },
    {
      label: 'Bring Forward',
      icon: '↑',
      action: () => { if (singleSelected) bringForward(singleSelected.id); onClose(); },
      disabled: !singleSelected,
    },
    {
      label: 'Send Backward',
      icon: '↓',
      action: () => { if (singleSelected) sendBackward(singleSelected.id); onClose(); },
      disabled: !singleSelected,
    },
    {
      label: 'Send to Back',
      icon: '⬇️',
      shortcut: 'Ctrl+[',
      action: () => { if (singleSelected) sendToBack(singleSelected.id); onClose(); },
      disabled: !singleSelected,
      dividerAfter: true,
    },
    {
      label: selectedIds.length > 1 ? 'Group' : 'Group',
      icon: '📦',
      shortcut: 'Ctrl+G',
      action: () => { editor.group(); onClose(); },
      disabled: selectedIds.length < 2,
    },
    {
      label: 'Ungroup',
      icon: '📤',
      shortcut: 'Ctrl+Shift+G',
      action: () => { editor.ungroup(); onClose(); },
      disabled: !isGroup,
      dividerAfter: true,
    },
    {
      label: isLocked ? 'Unlock' : 'Lock',
      icon: isLocked ? '🔓' : '🔒',
      action: () => {
        if (singleSelected) {
          updateNode(singleSelected.id, { locked: !isLocked });
        }
        onClose();
      },
      disabled: !singleSelected,
    },
    {
      label: 'Delete',
      icon: '🗑️',
      shortcut: 'Del',
      action: () => { editor.deleteSelected(); onClose(); },
      disabled: !hasSelection,
      danger: true,
    },
  ];

  return (
    <div
      ref={ref}
      className="animate-fadeIn"
      style={{
        position: 'fixed',
        left: adjustedX,
        top: adjustedY,
        zIndex: 9000,
        minWidth: 200,
        background: 'var(--color-bg-surface, #22223a)',
        border: '1px solid var(--color-border, #2a2a4a)',
        borderRadius: 10,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
        padding: '6px 0',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <button
            disabled={item.disabled}
            onClick={item.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              color: item.disabled
                ? 'var(--color-text-muted, #6B6B8A)'
                : item.danger
                ? 'var(--color-danger, #E17055)'
                : 'var(--color-text-primary, #EAEAF0)',
              fontSize: 12,
              fontFamily: 'inherit',
              cursor: item.disabled ? 'default' : 'pointer',
              transition: 'background 0.1s',
              opacity: item.disabled ? 0.4 : 1,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) {
                e.currentTarget.style.background = 'var(--color-bg-hover, #32325a)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--color-text-muted, #6B6B8A)',
                  fontFamily: 'monospace',
                }}
              >
                {item.shortcut}
              </span>
            )}
          </button>
          {item.dividerAfter && (
            <div
              style={{
                height: 1,
                background: 'var(--color-border, #2a2a4a)',
                margin: '4px 10px',
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
