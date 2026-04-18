// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Event Types
// Typed event bus for all editor events.
// ---------------------------------------------------------------------------

import type { CanvasNode } from './node';
import type { Page } from './document';

/** All event names the editor emits */
export type EditorEventType =
  // Node lifecycle
  | 'node:created'
  | 'node:updated'
  | 'node:deleted'
  | 'node:moved'
  | 'node:resized'
  | 'node:rotated'
  // Selection
  | 'selection:changed'
  | 'selection:cleared'
  // History
  | 'history:push'
  | 'history:undo'
  | 'history:redo'
  | 'history:clear'
  // Pages
  | 'page:added'
  | 'page:deleted'
  | 'page:switched'
  | 'page:reordered'
  // Viewport
  | 'viewport:zoom'
  | 'viewport:pan'
  // Document
  | 'document:loaded'
  | 'document:saved'
  | 'document:exported'
  // Guides
  | 'guide:added'
  | 'guide:removed'
  | 'guide:moved'
  // Plugin
  | 'plugin:registered'
  | 'plugin:removed'
  // Autosave
  | 'autosave:saving'
  | 'autosave:saved'
  | 'autosave:error'
  | 'autosave:recovered';

/** Event payload map */
export interface EditorEventMap {
  'node:created': { node: CanvasNode };
  'node:updated': { node: CanvasNode; prev: CanvasNode };
  'node:deleted': { id: string; node: CanvasNode };
  'node:moved': { id: string; x: number; y: number };
  'node:resized': { id: string; width: number; height: number };
  'node:rotated': { id: string; rotation: number };
  'selection:changed': { ids: string[] };
  'selection:cleared': Record<string, never>;
  'history:push': { commandName: string };
  'history:undo': { commandName: string };
  'history:redo': { commandName: string };
  'history:clear': Record<string, never>;
  'page:added': { page: Page };
  'page:deleted': { id: string };
  'page:switched': { id: string };
  'page:reordered': { ids: string[] };
  'viewport:zoom': { scale: number };
  'viewport:pan': { x: number; y: number };
  'document:loaded': { documentId: string };
  'document:saved': { documentId: string };
  'document:exported': { format: string };
  'guide:added': { id: string; axis: 'horizontal' | 'vertical'; position: number };
  'guide:removed': { id: string };
  'guide:moved': { id: string; position: number };
  'plugin:registered': { name: string };
  'plugin:removed': { name: string };
  'autosave:saving': Record<string, never>;
  'autosave:saved': { timestamp: number };
  'autosave:error': { error: Error };
  'autosave:recovered': { documentId: string };
}

/** Typed event handler */
export type EditorEventHandler<T extends EditorEventType> = (
  payload: EditorEventMap[T]
) => void;

/** Typed event emitter interface */
export interface EditorEventEmitter {
  on<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): () => void;
  off<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): void;
  emit<T extends EditorEventType>(event: T, payload: EditorEventMap[T]): void;
  once<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): () => void;
}

// ---------------------------------------------------------------------------
// Concrete EventEmitter implementation
// ---------------------------------------------------------------------------
export class EventBus implements EditorEventEmitter {
  private listeners = new Map<string, Set<Function>>();

  on<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<T extends EditorEventType>(event: T, payload: EditorEventMap[T]): void {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}":`, err);
      }
    });
  }

  once<T extends EditorEventType>(event: T, handler: EditorEventHandler<T>): () => void {
    const wrappedHandler = ((payload: EditorEventMap[T]) => {
      handler(payload);
      this.off(event, wrappedHandler);
    }) as EditorEventHandler<T>;
    return this.on(event, wrappedHandler);
  }

  removeAllListeners(event?: EditorEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
