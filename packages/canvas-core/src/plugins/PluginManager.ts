// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Plugin Manager
// Manages plugin lifecycle, dependency resolution, and event routing.
// ---------------------------------------------------------------------------

import type { CanvasPlugin, PluginEditorAPI } from '../types/plugin';
import type { CanvasNode } from '../types/node';

export class PluginManager {
  private plugins = new Map<string, CanvasPlugin>();
  private editorAPI: PluginEditorAPI | null = null;
  private pluginData = new Map<string, unknown>();

  setEditorAPI(api: PluginEditorAPI): void {
    this.editorAPI = api;
  }

  async use(plugin: CanvasPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      console.warn(`[PluginManager] Plugin "${plugin.name}" is already registered.`);
      return;
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(
            `[PluginManager] Plugin "${plugin.name}" depends on "${dep}" which is not registered.`
          );
        }
      }
    }

    this.plugins.set(plugin.name, plugin);

    // Initialize
    if (this.editorAPI) {
      const api: PluginEditorAPI = {
        ...this.editorAPI,
        setPluginData: (key, value) => this.pluginData.set(`${plugin.name}:${key}`, value),
        getPluginData: (key) => this.pluginData.get(`${plugin.name}:${key}`),
      };
      await plugin.init(api);
    }
  }

  remove(name: string): void {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    // Check if other plugins depend on this one
    for (const [otherName, otherPlugin] of this.plugins) {
      if (otherPlugin.dependencies?.includes(name)) {
        throw new Error(
          `[PluginManager] Cannot remove "${name}" — plugin "${otherName}" depends on it.`
        );
      }
    }

    plugin.destroy?.();
    this.plugins.delete(name);

    // Clean up plugin data
    for (const key of this.pluginData.keys()) {
      if (key.startsWith(`${name}:`)) {
        this.pluginData.delete(key);
      }
    }
  }

  getPlugin<T extends CanvasPlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T | undefined;
  }

  getAll(): CanvasPlugin[] {
    return Array.from(this.plugins.values());
  }

  // --- Lifecycle event routing ---

  notifyNodeCreated(node: CanvasNode): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onNodeCreated?.(node);
      } catch (err) {
        console.error(`[PluginManager] Error in ${plugin.name}.onNodeCreated:`, err);
      }
    }
  }

  notifyNodeUpdated(node: CanvasNode, prev: CanvasNode): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onNodeUpdated?.(node, prev);
      } catch (err) {
        console.error(`[PluginManager] Error in ${plugin.name}.onNodeUpdated:`, err);
      }
    }
  }

  notifyNodeDeleted(id: string): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onNodeDeleted?.(id);
      } catch (err) {
        console.error(`[PluginManager] Error in ${plugin.name}.onNodeDeleted:`, err);
      }
    }
  }

  notifySelectionChanged(ids: string[]): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onSelectionChanged?.(ids);
      } catch (err) {
        console.error(`[PluginManager] Error in ${plugin.name}.onSelectionChanged:`, err);
      }
    }
  }

  notifyBeforeExport(format: string): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onBeforeExport?.(format);
      } catch (err) {
        console.error(`[PluginManager] Error in ${plugin.name}.onBeforeExport:`, err);
      }
    }
  }

  notifyAfterExport(format: string, data: Blob): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onAfterExport?.(format, data);
      } catch (err) {
        console.error(`[PluginManager] Error in ${plugin.name}.onAfterExport:`, err);
      }
    }
  }

  notifyPageChanged(pageId: string): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.onPageChanged?.(pageId);
      } catch (err) {
        console.error(`[PluginManager] Error in ${plugin.name}.onPageChanged:`, err);
      }
    }
  }

  // --- UI Extensions ---

  getToolbarExtensions(): Array<{ pluginName: string; extensions: NonNullable<CanvasPlugin['toolbar']> }> {
    const result: Array<{ pluginName: string; extensions: NonNullable<CanvasPlugin['toolbar']> }> = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.toolbar && plugin.toolbar.length > 0) {
        result.push({ pluginName: plugin.name, extensions: plugin.toolbar });
      }
    }
    return result;
  }

  getPanelExtensions(): Array<{ pluginName: string; extensions: NonNullable<CanvasPlugin['panels']> }> {
    const result: Array<{ pluginName: string; extensions: NonNullable<CanvasPlugin['panels']> }> = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.panels && plugin.panels.length > 0) {
        result.push({ pluginName: plugin.name, extensions: plugin.panels });
      }
    }
    return result;
  }

  getContextMenuExtensions(): Array<{ pluginName: string; extensions: NonNullable<CanvasPlugin['contextMenu']> }> {
    const result: Array<{ pluginName: string; extensions: NonNullable<CanvasPlugin['contextMenu']> }> = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.contextMenu && plugin.contextMenu.length > 0) {
        result.push({ pluginName: plugin.name, extensions: plugin.contextMenu });
      }
    }
    return result;
  }

  destroy(): void {
    for (const plugin of this.plugins.values()) {
      try {
        plugin.destroy?.();
      } catch (err) {
        console.error(`[PluginManager] Error destroying ${plugin.name}:`, err);
      }
    }
    this.plugins.clear();
    this.pluginData.clear();
  }
}
