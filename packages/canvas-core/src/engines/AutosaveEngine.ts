// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Autosave Engine
// Debounced autosave with crash recovery, configurable intervals.
// ---------------------------------------------------------------------------

import type { StorageAdapter, ProjectMeta } from '../storage/StorageAdapter';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'recovering';

export interface AutosaveConfig {
  /** Debounce interval in ms (default: 3000) */
  interval: number;
  /** Enable autosave (default: true) */
  enabled: boolean;
  /** Max recovery age in ms (default: 24h) */
  maxRecoveryAge: number;
  /** Callback when save status changes */
  onStatusChange?: (status: SaveStatus) => void;
  /** Callback when recovery data is found */
  onRecoveryFound?: (data: unknown) => Promise<boolean>;
}

const DEFAULT_CONFIG: AutosaveConfig = {
  interval: 3000,
  enabled: true,
  maxRecoveryAge: 24 * 60 * 60 * 1000,
};

export class AutosaveEngine {
  private config: AutosaveConfig;
  private storage: StorageAdapter;
  private projectId: string;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isDirty = false;
  private status: SaveStatus = 'idle';
  private getDocument: () => unknown;
  private getProjectMeta: () => Partial<ProjectMeta>;
  private lastSavedJSON: string = '';
  private destroyed = false;

  constructor(
    storage: StorageAdapter,
    projectId: string,
    getDocument: () => unknown,
    getProjectMeta: () => Partial<ProjectMeta>,
    config: Partial<AutosaveConfig> = {},
  ) {
    this.storage = storage;
    this.projectId = projectId;
    this.getDocument = getDocument;
    this.getProjectMeta = getProjectMeta;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Start the autosave engine. Also checks for crash recovery. */
  async start(): Promise<void> {
    if (!this.config.enabled) return;

    // Check for crash recovery first
    try {
      const recoveryData = await this.storage.loadRecovery();
      if (recoveryData) {
        const recovery = recoveryData as { timestamp: number; data: unknown };
        const age = Date.now() - (recovery.timestamp || 0);
        if (age < this.config.maxRecoveryAge && this.config.onRecoveryFound) {
          this.setStatus('recovering');
          const accepted = await this.config.onRecoveryFound(recovery.data);
          if (!accepted) {
            await this.storage.clearRecovery();
          }
        } else {
          // Too old, clear it
          await this.storage.clearRecovery();
        }
      }
    } catch (err) {
      console.warn('[AutosaveEngine] Recovery check failed:', err);
    }

    if (this.status === 'recovering') return;
    this.setStatus('idle');
  }

  /** Mark the document as dirty — triggers a debounced save */
  markDirty(): void {
    if (!this.config.enabled || this.destroyed) return;
    this.isDirty = true;
    this.scheduleSave();
  }

  /** Force an immediate save */
  async saveNow(): Promise<void> {
    if (this.destroyed) return;
    this.cancelScheduled();

    const doc = this.getDocument();
    const docJSON = JSON.stringify(doc);

    // Skip if nothing changed
    if (docJSON === this.lastSavedJSON) {
      this.isDirty = false;
      return;
    }

    this.setStatus('saving');

    try {
      // Save document
      await this.storage.save(this.projectId, doc);

      // Clear recovery data — document is safely saved
      await this.storage.clearRecovery();

      // Update project metadata
      const meta = this.getProjectMeta();
      await this.storage.updateMeta(this.projectId, {
        ...meta,
        id: this.projectId,
        updatedAt: Date.now(),
      } as Partial<ProjectMeta>);

      this.lastSavedJSON = docJSON;
      this.isDirty = false;
      this.setStatus('saved');

      // Reset status to idle after 2s
      setTimeout(() => {
        if (this.status === 'saved' && !this.destroyed) {
          this.setStatus('idle');
        }
      }, 2000);
    } catch (err) {
      console.error('[AutosaveEngine] Save failed:', err);
      this.setStatus('error');
    }
  }

  /** Change the project ID (when loading a different project) */
  setProjectId(id: string): void {
    this.projectId = id;
    this.lastSavedJSON = '';
  }

  /** Stop the engine and clean up */
  destroy(): void {
    this.destroyed = true;
    this.cancelScheduled();
  }

  getStatus(): SaveStatus {
    return this.status;
  }

  // Internal helpers
  private scheduleSave(): void {
    this.cancelScheduled();
    this.timer = setTimeout(() => {
      this.saveNow();
    }, this.config.interval);
  }

  private cancelScheduled(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private setStatus(status: SaveStatus): void {
    this.status = status;
    this.config.onStatusChange?.(status);
  }
}
