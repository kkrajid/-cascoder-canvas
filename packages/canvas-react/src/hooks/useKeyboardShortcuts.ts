// ---------------------------------------------------------------------------
// @cascoder/canvas-react — useKeyboardShortcuts Hook
// Global keyboard shortcut handler for the editor.
// ---------------------------------------------------------------------------

import { useEffect } from 'react';
import { useEditorContext } from '../components/EditorProvider';
import { useEditor } from './useEditor';
import { generateId } from '@cascoder/canvas-core';
import { clipboard } from '@cascoder/canvas-core';
import type { CanvasNode } from '@cascoder/canvas-core';

export function useKeyboardShortcuts() {
  const { store } = useEditorContext();
  const editor = useEditor();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const state = store.getState();

      // Don't handle shortcuts when editing text
      if (state.isEditingText) return;

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      // ---- Undo / Redo ----
      if (isCtrl && !isShift && e.key === 'z') {
        e.preventDefault();
        editor.undo();
        return;
      }
      if (isCtrl && isShift && e.key === 'z') {
        e.preventDefault();
        editor.redo();
        return;
      }
      if (isCtrl && e.key === 'y') {
        e.preventDefault();
        editor.redo();
        return;
      }

      // ---- Delete ----
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        editor.deleteSelected();
        return;
      }

      // ---- Duplicate ----
      if (isCtrl && e.key === 'd') {
        e.preventDefault();
        editor.duplicateSelected();
        return;
      }

      // ---- Copy / Paste / Cut ----
      if (isCtrl && e.key === 'c') {
        e.preventDefault();
        const selectedNodes = state.selectedIds.map((id) => state.nodes[id]).filter(Boolean);
        if (selectedNodes.length > 0) {
          clipboard.copy(selectedNodes as CanvasNode[]);
        }
        return;
      }
      if (isCtrl && e.key === 'x') {
        e.preventDefault();
        const selectedNodes = state.selectedIds.map((id) => state.nodes[id]).filter(Boolean);
        if (selectedNodes.length > 0) {
          clipboard.cut(selectedNodes as CanvasNode[]);
          editor.deleteSelected();
        }
        return;
      }
      if (isCtrl && e.key === 'v') {
        e.preventDefault();
        if (!clipboard.hasContent()) return;
        const buffer = clipboard.getBuffer();
        const newIds: string[] = [];
        for (const node of buffer) {
          const newId = generateId(node.type.slice(0, 3));
          const newNode = {
            ...structuredClone(node),
            id: newId,
            x: node.x + 20,
            y: node.y + 20,
            pageId: state.activePageId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          state.addNode(newNode);
          newIds.push(newId);
        }
        state.selectNodes(newIds);
        return;
      }

      // ---- Select All ----
      if (isCtrl && e.key === 'a') {
        e.preventDefault();
        state.selectAll();
        return;
      }

      // ---- Group / Ungroup ----
      if (isCtrl && !isShift && e.key === 'g') {
        e.preventDefault();
        editor.group();
        return;
      }
      if (isCtrl && isShift && e.key === 'g') {
        e.preventDefault();
        editor.ungroup();
        return;
      }

      // ---- Arrow keys — move selected ----
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (state.selectedIds.length === 0) return;
        e.preventDefault();

        const step = isShift ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;

        const beforeState = state.captureBeforeState(state.selectedIds);
        const updates = state.selectedIds.map((id) => {
          const n = state.nodes[id];
          if (!n) return null;
          return { id, changes: { x: n.x + dx, y: n.y + dy } };
        }).filter(Boolean) as any[];

        state.updateNodes(updates);

        const afterState: Record<string, any> = {};
        for (const id of state.selectedIds) {
          afterState[id] = structuredClone(state.nodes[id]);
        }
        state.pushCommand({
          name: 'Nudge elements',
          timestamp: Date.now(),
          before: beforeState,
          after: afterState,
        });
        return;
      }

      // ---- Space = hand tool (toggle) ----
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        state.setActiveTool('hand');
        return;
      }

      // ---- Escape = deselect ----
      if (e.key === 'Escape') {
        if (state.isEditingText) {
          state.stopTextEditing();
        } else {
          state.deselectAll();
          state.setActiveTool('select');
        }
        return;
      }

      // ---- Tool shortcuts ----
      if (e.key === 'v' || e.key === 'V') {
        state.setActiveTool('select');
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        state.setActiveTool('text');
        return;
      }
      if (e.key === 'h' || e.key === 'H') {
        state.setActiveTool('hand');
        return;
      }

      // ---- Zoom shortcuts ----
      if (isCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        state.zoomIn();
        return;
      }
      if (isCtrl && e.key === '-') {
        e.preventDefault();
        state.zoomOut();
        return;
      }
      if (isCtrl && e.key === '0') {
        e.preventDefault();
        state.zoomToFit();
        return;
      }

      // ---- Layer order ----
      if (e.key === ']' && isCtrl) {
        e.preventDefault();
        if (state.selectedIds.length === 1) {
          state.bringForward(state.selectedIds[0]);
        }
        return;
      }
      if (e.key === '[' && isCtrl) {
        e.preventDefault();
        if (state.selectedIds.length === 1) {
          state.sendBackward(state.selectedIds[0]);
        }
        return;
      }

      // ---- Toggle guides ----
      if (e.key === ';' && isCtrl) {
        e.preventDefault();
        state.toggleGuides();
        return;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      // Release hand tool on space up
      if (e.key === ' ') {
        const state = store.getState();
        if (state.activeTool === 'hand') {
          state.setActiveTool('select');
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [store, editor]);
}
