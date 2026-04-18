// ---------------------------------------------------------------------------
// @cascoder/playground — Editor Shell
// Assembles the full editor layout with autosave, context menu, page panel.
// ---------------------------------------------------------------------------

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useKeyboardShortcuts, useEditor, useEditorStore } from '@cascoder/canvas-react';
import { AutosaveEngine, IndexedDBAdapter, generateDocumentId } from '@cascoder/canvas-core';
import type { SaveStatus } from '@cascoder/canvas-core';
import { TopBar } from './TopBar';
import { ToolRail } from './ToolRail';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { BottomBar } from './BottomBar';
import { PagePanel } from './PagePanel';
import { ContextMenu } from './ContextMenu';
import { RecoveryDialog } from './RecoveryDialog';
import { ProjectManager } from './ProjectManager';

// Singleton storage adapter
const storage = new IndexedDBAdapter();

export function EditorShell() {
  useKeyboardShortcuts();
  const editor = useEditor();

  // Autosave state
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryData, setRecoveryData] = useState<unknown>(null);
  const [projectId] = useState(() => {
    // Check URL for project ID, otherwise generate new
    const params = new URLSearchParams(window.location.search);
    return params.get('project') || generateDocumentId();
  });

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // Project manager state
  const [showProjectManager, setShowProjectManager] = useState(false);

  // Autosave engine ref
  const autosaveRef = useRef<AutosaveEngine | null>(null);

  // Initialize autosave
  useEffect(() => {
    const engine = new AutosaveEngine(
      storage,
      projectId,
      () => editor.toJSON(),
      () => {
        const state = editor.store.getState();
        return {
          id: projectId,
          name: 'Untitled Design',
          preset: state.pages[0]?.name || 'custom',
          thumbnail: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          pageCount: state.pages.length,
          nodeCount: Object.keys(state.nodes).length,
        };
      },
      {
        interval: 3000,
        onStatusChange: setSaveStatus,
        onRecoveryFound: async (data: unknown) => {
          setRecoveryData(data);
          setShowRecovery(true);
          return false; // Don't auto-accept; wait for user choice
        },
      },
    );

    autosaveRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
    };
  }, [projectId, editor]);

  // Subscribe to DOCUMENT state changes only (not viewport/UI) to trigger autosave
  useEffect(() => {
    let prevNodes = editor.store.getState().nodes;
    let prevNodeOrder = editor.store.getState().nodeOrder;
    let prevPages = editor.store.getState().pages;

    const unsub = editor.store.subscribe(() => {
      const state = editor.store.getState();
      // Only mark dirty if document content changed (skip zoom, pan, selection, hover etc.)
      if (
        state.nodes !== prevNodes ||
        state.nodeOrder !== prevNodeOrder ||
        state.pages !== prevPages
      ) {
        prevNodes = state.nodes;
        prevNodeOrder = state.nodeOrder;
        prevPages = state.pages;
        autosaveRef.current?.markDirty();
      }
    });
    return unsub;
  }, [editor.store]);

  // Recovery handlers
  const handleRestore = useCallback(() => {
    if (recoveryData) {
      editor.load(recoveryData as any);
    }
    setShowRecovery(false);
    setRecoveryData(null);
    storage.clearRecovery();
  }, [recoveryData, editor]);

  const handleDiscardRecovery = useCallback(() => {
    setShowRecovery(false);
    setRecoveryData(null);
    storage.clearRecovery();
  }, []);

  // Handle project load from manager
  const handleProjectLoad = useCallback((data: unknown) => {
    editor.load(data as any);
  }, [editor]);

  // Context menu handler
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <div className="editor-layout" onContextMenu={handleContextMenu}>
      <TopBar
        saveStatus={saveStatus}
        onSaveNow={() => autosaveRef.current?.saveNow()}
        onOpenProjects={() => setShowProjectManager(true)}
      />
      <ToolRail />
      <LeftSidebar />
      <div className="editor-canvas-area">
        <Canvas />
      </div>
      <RightSidebar />
      <div className="editor-bottom-section">
        <PagePanel />
        <BottomBar />
      </div>

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Recovery dialog */}
      {showRecovery && (
        <RecoveryDialog
          onRestore={handleRestore}
          onDiscard={handleDiscardRecovery}
        />
      )}

      {/* Project manager */}
      {showProjectManager && (
        <ProjectManager
          storage={storage}
          currentProjectId={projectId}
          onLoad={handleProjectLoad}
          onClose={() => setShowProjectManager(false)}
        />
      )}
    </div>
  );
}
