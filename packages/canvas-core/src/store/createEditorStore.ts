// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Editor Store Factory
// Composes all Zustand slices into a single unified store.
// ---------------------------------------------------------------------------

import { createStore } from 'zustand/vanilla';
import type { SceneSlice } from './slices/sceneSlice';
import type { SelectionSlice } from './slices/selectionSlice';
import type { HistorySlice } from './slices/historySlice';
import type { ViewportSlice } from './slices/viewportSlice';
import type { PageSlice } from './slices/pageSlice';
import type { UISlice } from './slices/uiSlice';
import type { GuidesSlice } from './slices/guidesSlice';
import { createSceneSlice } from './slices/sceneSlice';
import { createSelectionSlice } from './slices/selectionSlice';
import { createHistorySlice } from './slices/historySlice';
import { createViewportSlice } from './slices/viewportSlice';
import { createPageSlice } from './slices/pageSlice';
import { createUISlice } from './slices/uiSlice';
import { createGuidesSlice } from './slices/guidesSlice';

/**
 * The unified editor store type — union of all slices.
 * Every slice can see the full store for cross-slice reads.
 */
export type EditorStore =
  & SceneSlice
  & SelectionSlice
  & HistorySlice
  & ViewportSlice
  & PageSlice
  & UISlice
  & GuidesSlice;

/**
 * Creates a vanilla (framework-agnostic) Zustand store.
 * Used by EditorProvider in canvas-react to inject into React context.
 */
export function createEditorStore() {
  return createStore<EditorStore>()((...args) => ({
    ...createSceneSlice(...args),
    ...createSelectionSlice(...args),
    ...createHistorySlice(...args),
    ...createViewportSlice(...args),
    ...createPageSlice(...args),
    ...createUISlice(...args),
    ...createGuidesSlice(...args),
  }));
}

export type EditorStoreInstance = ReturnType<typeof createEditorStore>;
