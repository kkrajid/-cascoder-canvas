// ---------------------------------------------------------------------------
// @cascoder/canvas-core — IndexedDB Storage Adapter
// Production-grade IndexedDB adapter with crash recovery partition.
// ---------------------------------------------------------------------------

import type { StorageAdapter, ProjectMeta } from './StorageAdapter';

const DB_NAME = 'cascoder-canvas';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_META = 'project-meta';
const STORE_RECOVERY = 'recovery';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS);
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        const metaStore = db.createObjectStore(STORE_META, { keyPath: 'id' });
        metaStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_RECOVERY)) {
        db.createObjectStore(STORE_RECOVERY);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txOperation<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = operation(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export class IndexedDBAdapter implements StorageAdapter {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = openDB();
    }
    return this.dbPromise;
  }

  async save(id: string, data: unknown): Promise<void> {
    const db = await this.getDB();
    await txOperation(db, STORE_PROJECTS, 'readwrite', (store) =>
      store.put(data, id)
    );
  }

  async load(id: string): Promise<unknown | null> {
    const db = await this.getDB();
    const result = await txOperation(db, STORE_PROJECTS, 'readonly', (store) =>
      store.get(id)
    );
    return result ?? null;
  }

  async delete(id: string): Promise<void> {
    const db = await this.getDB();
    await txOperation(db, STORE_PROJECTS, 'readwrite', (store) =>
      store.delete(id)
    );
    await txOperation(db, STORE_META, 'readwrite', (store) =>
      store.delete(id)
    );
  }

  async list(): Promise<ProjectMeta[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_META, 'readonly');
      const store = tx.objectStore(STORE_META);
      const index = store.index('updatedAt');
      const request = index.openCursor(null, 'prev'); // newest first
      const results: ProjectMeta[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value as ProjectMeta);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updateMeta(id: string, meta: Partial<ProjectMeta>): Promise<void> {
    const db = await this.getDB();
    // Load existing first
    const existing = await txOperation(db, STORE_META, 'readonly', (store) =>
      store.get(id)
    );
    const merged = { ...(existing ?? { id }), ...meta, id };
    await txOperation(db, STORE_META, 'readwrite', (store) =>
      store.put(merged)
    );
  }

  async saveRecovery(data: unknown): Promise<void> {
    const db = await this.getDB();
    await txOperation(db, STORE_RECOVERY, 'readwrite', (store) =>
      store.put(data, 'latest')
    );
  }

  async loadRecovery(): Promise<unknown | null> {
    const db = await this.getDB();
    const result = await txOperation(db, STORE_RECOVERY, 'readonly', (store) =>
      store.get('latest')
    );
    return result ?? null;
  }

  async clearRecovery(): Promise<void> {
    const db = await this.getDB();
    await txOperation(db, STORE_RECOVERY, 'readwrite', (store) =>
      store.delete('latest')
    );
  }
}
