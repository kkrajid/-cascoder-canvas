// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Text Editor Overlay
// DOM-based contenteditable overlay for rich text editing.
// Positioned precisely over the Konva text node using viewport transforms.
// ---------------------------------------------------------------------------

import React, { useRef, useEffect, useCallback, memo } from 'react';
import type { TextNode } from '@cascoder/canvas-core';
import { useEditorContext } from '../EditorProvider';

interface TextEditorOverlayProps {
  node: TextNode;
  zoom: number;
  viewportX: number;
  viewportY: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

function TextEditorOverlayInner({
  node,
  zoom,
  viewportX,
  viewportY,
  containerRef,
}: TextEditorOverlayProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { store } = useEditorContext();

  // Calculate screen position of the text node
  const screenX = node.x * zoom + viewportX;
  const screenY = node.y * zoom + viewportY;
  const screenW = node.width * zoom;
  const screenH = Math.max(node.height * zoom, node.fontSize * zoom * 1.5);

  const fill = node.fill.type === 'solid' ? (node.fill.color ?? '#2D3436') : '#2D3436';

  // Focus on mount
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    // Select all text
    textarea.setSelectionRange(0, textarea.value.length);
  }, []);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      store.getState().updateNode(node.id, { content: newContent } as any);
    },
    [store, node.id]
  );

  const handleBlur = useCallback(() => {
    store.getState().stopTextEditing();
  }, [store]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // ESC to finish editing
      if (e.key === 'Escape') {
        e.preventDefault();
        store.getState().stopTextEditing();
        return;
      }
      // Prevent keyboard shortcuts from firing while editing
      e.stopPropagation();
    },
    [store]
  );

  const fontWeight = node.fontWeight >= 700 ? 'bold' : 'normal';
  const fontStyle = node.fontStyle === 'italic' ? 'italic' : 'normal';

  return (
    <textarea
      ref={textareaRef}
      value={node.content}
      onChange={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      style={{
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${screenW}px`,
        minHeight: `${screenH}px`,
        fontFamily: node.fontFamily,
        fontSize: `${node.fontSize * zoom}px`,
        fontWeight,
        fontStyle,
        color: fill,
        textAlign: node.textAlign as any,
        lineHeight: node.lineHeight,
        letterSpacing: `${node.letterSpacing * zoom}px`,
        padding: `${node.padding * zoom}px`,
        margin: 0,
        border: `2px solid #6C5CE7`,
        borderRadius: '2px',
        outline: 'none',
        background: 'rgba(255,255,255,0.95)',
        resize: 'none',
        overflow: 'hidden',
        zIndex: 1000,
        boxShadow: '0 0 0 4px rgba(108, 92, 231, 0.2), 0 4px 12px rgba(0,0,0,0.15)',
        transform: `rotate(${node.rotation}deg)`,
        transformOrigin: '0 0',
        caretColor: '#6C5CE7',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}
    />
  );
}

export const TextEditorOverlay = memo(TextEditorOverlayInner);
