// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Guides Slice
// Ruler guide management (horizontal/vertical draggable guides).
// ---------------------------------------------------------------------------

import type { StateCreator } from 'zustand';
import type { EditorStore } from '../createEditorStore';
import type { RulerGuide } from '../../types/document';
import { generateGuideId } from '../../utils/id';

export interface GuidesSlice {
  guides: RulerGuide[];
  guidesLocked: boolean;
  activeGuideId: string | null;

  // Actions
  addGuide: (axis: 'horizontal' | 'vertical', position: number) => string;
  removeGuide: (id: string) => void;
  moveGuide: (id: string, position: number) => void;
  lockGuide: (id: string, locked: boolean) => void;
  clearGuides: () => void;
  toggleGuidesLocked: () => void;
  setActiveGuide: (id: string | null) => void;
}

export const createGuidesSlice: StateCreator<EditorStore, [], [], GuidesSlice> = (set) => ({
  guides: [],
  guidesLocked: false,
  activeGuideId: null,

  addGuide: (axis, position) => {
    const id = generateGuideId();
    const guide: RulerGuide = {
      id,
      axis,
      position,
      locked: false,
      color: '#6C5CE7',
    };
    set((state) => ({ guides: [...state.guides, guide] }));
    return id;
  },

  removeGuide: (id) => {
    set((state) => ({
      guides: state.guides.filter((g) => g.id !== id),
      activeGuideId: state.activeGuideId === id ? null : state.activeGuideId,
    }));
  },

  moveGuide: (id, position) => {
    set((state) => ({
      guides: state.guides.map((g) =>
        g.id === id && !g.locked ? { ...g, position } : g
      ),
    }));
  },

  lockGuide: (id, locked) => {
    set((state) => ({
      guides: state.guides.map((g) =>
        g.id === id ? { ...g, locked } : g
      ),
    }));
  },

  clearGuides: () => set({ guides: [], activeGuideId: null }),

  toggleGuidesLocked: () => set((state) => ({ guidesLocked: !state.guidesLocked })),

  setActiveGuide: (id) => set({ activeGuideId: id }),
});
