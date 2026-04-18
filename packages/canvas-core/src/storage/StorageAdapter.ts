// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Storage Adapter Interface
// Abstract interface for persisting documents. Default: IndexedDB.
// ---------------------------------------------------------------------------

export interface ProjectMeta {
  id: string;
  name: string;
  preset: string;
  thumbnail: string | null;
  createdAt: number;
  updatedAt: number;
  pageCount: number;
  nodeCount: number;
}

export interface StorageAdapter {
  /** Save a document */
  save(id: string, data: unknown): Promise<void>;
  /** Load a document */
  load(id: string): Promise<unknown | null>;
  /** Delete a document */
  delete(id: string): Promise<void>;
  /** List all saved documents */
  list(): Promise<ProjectMeta[]>;
  /** Save crash recovery data */
  saveRecovery(data: unknown): Promise<void>;
  /** Load crash recovery data */
  loadRecovery(): Promise<unknown | null>;
  /** Clear crash recovery data */
  clearRecovery(): Promise<void>;
  /** Update project metadata */
  updateMeta(id: string, meta: Partial<ProjectMeta>): Promise<void>;
}
