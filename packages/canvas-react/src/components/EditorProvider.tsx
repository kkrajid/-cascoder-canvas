// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Editor Context & Provider
// Creates and provides the Zustand store + plugin manager to the React tree.
// ---------------------------------------------------------------------------

import React, { createContext, useContext, useRef, useEffect, useMemo } from 'react';
import { useStore as useZustandStore } from 'zustand';
import {
  createEditorStore,
  createBlankDocument,
  EventBus,
  PluginManager,
  SnapEngine,
} from '@cascoder/canvas-core';
import type {
  EditorStore,
  EditorStoreInstance,
  CanvasDocument,
  CanvasPlugin,
  PagePreset,
  SnapConfig,
} from '@cascoder/canvas-core';

/** Editor context value — store + singletons */
export interface EditorContextValue {
  store: EditorStoreInstance;
  eventBus: EventBus;
  pluginManager: PluginManager;
  snapEngine: SnapEngine;
}

const EditorContext = createContext<EditorContextValue | null>(null);

/** Props for EditorProvider */
export interface EditorProviderProps {
  children: React.ReactNode;
  /** Pre-existing document to load */
  document?: CanvasDocument;
  /** Page preset if starting fresh */
  preset?: PagePreset;
  /** Snap engine configuration */
  snapConfig?: Partial<SnapConfig>;
  /** Plugins to register on mount */
  plugins?: CanvasPlugin[];
  /** Callback when editor is ready */
  onReady?: (context: EditorContextValue) => void;
}

export function EditorProvider({
  children,
  document: initialDoc,
  preset = 'instagram-post',
  snapConfig,
  plugins,
  onReady,
}: EditorProviderProps) {
  const storeRef = useRef<EditorStoreInstance | null>(null);
  const eventBusRef = useRef<EventBus | null>(null);
  const pluginManagerRef = useRef<PluginManager | null>(null);
  const snapEngineRef = useRef<SnapEngine | null>(null);

  // Initialize once
  if (!storeRef.current) {
    storeRef.current = createEditorStore();
    eventBusRef.current = new EventBus();
    pluginManagerRef.current = new PluginManager();
    snapEngineRef.current = new SnapEngine(snapConfig);

    const store = storeRef.current;
    const eb = eventBusRef.current;

    // Wire PluginManager to store — without this, plugin.init() never fires
    pluginManagerRef.current.setEditorAPI({
      getNodes: () => store.getState().nodes,
      getNode: (id: string) => store.getState().nodes[id],
      getSelectedIds: () => store.getState().selectedIds,
      addNode: (partial: any) => {
        const state = store.getState();
        state.addNode(partial as any);
        return partial.id ?? '';
      },
      updateNode: (id: string, changes: any) => store.getState().updateNode(id, changes),
      deleteNode: (id: string) => store.getState().deleteNode(id),
      select: (ids: string[]) => store.getState().selectNodes(ids),
      deselect: () => store.getState().deselectAll(),
      on: (event: any, handler: any) => { eb.on(event, handler); return () => eb.off(event, handler); },
      off: (event: any, handler: any) => eb.off(event, handler),
      undo: () => store.getState().undo(),
      redo: () => store.getState().redo(),
      toJSON: () => store.getState(),
      setPluginData: () => {},
      getPluginData: () => undefined,
    });

    // Load document or create blank
    if (initialDoc) {
      store.setState({
        nodes: initialDoc.nodes,
        nodeOrder: initialDoc.nodeOrder,
        pages: initialDoc.pages,
        activePageId: initialDoc.pages[0]?.id ?? '',
        guides: initialDoc.guides,
      });
    } else {
      const doc = createBlankDocument('doc-1', preset);
      store.setState({
        nodes: doc.nodes,
        nodeOrder: doc.nodeOrder,
        pages: doc.pages,
        activePageId: doc.pages[0]?.id ?? '',
        guides: doc.guides,
      });
    }

    // Zoom to fit after mount
    requestAnimationFrame(() => {
      store.getState().zoomToFit();
    });
  }

  const contextValue = useMemo<EditorContextValue>(
    () => ({
      store: storeRef.current!,
      eventBus: eventBusRef.current!,
      pluginManager: pluginManagerRef.current!,
      snapEngine: snapEngineRef.current!,
    }),
    []
  );

  // Register plugins
  useEffect(() => {
    if (plugins) {
      for (const plugin of plugins) {
        pluginManagerRef.current?.use(plugin);
      }
    }
    onReady?.(contextValue);

    return () => {
      pluginManagerRef.current?.destroy();
      eventBusRef.current?.removeAllListeners();
    };
  }, []);

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

/** Hook to access the full editor context */
export function useEditorContext(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return ctx;
}

/** Hook to select state from the Zustand store (with automatic re-renders) */
export function useEditorStore<T>(selector: (state: EditorStore) => T): T {
  const { store } = useEditorContext();
  return useZustandStore(store, selector);
}
