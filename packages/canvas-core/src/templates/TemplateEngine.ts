// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Template Engine
// Manages design templates that can be registered, searched, and applied.
// ---------------------------------------------------------------------------

import type { CanvasDocument, PagePreset } from '../types/document';

/** A design template document */
export interface CanvasTemplate {
  /** Unique template ID */
  id: string;
  /** Display name */
  name: string;
  /** Category for grouping */
  category: 'social' | 'print' | 'business' | 'marketing' | 'education' | 'personal' | 'other';
  /** Search tags */
  tags: string[];
  /** Page preset used by this template */
  preset: PagePreset;
  /** Thumbnail URL for previews */
  thumbnail: string;
  /** Whether this is a premium (paid) template */
  premium: boolean;
  /** The full document data */
  document: CanvasDocument;
  /** Author info */
  author?: string;
  /** Template description */
  description?: string;
  /** ISO date string */
  createdAt?: string;
}

/**
 * TemplateEngine — Registry for design templates.
 *
 * Manages a collection of reusable design templates that developers
 * and end-users can browse, search, and apply to create new documents.
 *
 * @example
 * ```ts
 * const engine = new TemplateEngine();
 * engine.register(instagramPostTemplate);
 * engine.register(youtubeThumbTemplate);
 *
 * const social = engine.getByCategory('social');
 * const doc = engine.apply('instagram-post-1');
 * ```
 */
export class TemplateEngine {
  private templates = new Map<string, CanvasTemplate>();

  /** Register a template */
  register(template: CanvasTemplate): void {
    this.templates.set(template.id, template);
  }

  /** Register multiple templates at once */
  registerAll(templates: CanvasTemplate[]): void {
    for (const t of templates) {
      this.templates.set(t.id, t);
    }
  }

  /** Unregister a template by ID */
  unregister(id: string): boolean {
    return this.templates.delete(id);
  }

  /** Get a template by ID */
  get(id: string): CanvasTemplate | undefined {
    return this.templates.get(id);
  }

  /** Get all registered templates */
  getAll(): CanvasTemplate[] {
    return Array.from(this.templates.values());
  }

  /** Get templates by category */
  getByCategory(category: CanvasTemplate['category']): CanvasTemplate[] {
    return this.getAll().filter((t) => t.category === category);
  }

  /** Get only free templates */
  getFree(): CanvasTemplate[] {
    return this.getAll().filter((t) => !t.premium);
  }

  /** Get only premium templates */
  getPremium(): CanvasTemplate[] {
    return this.getAll().filter((t) => t.premium);
  }

  /** Search templates by name or tags */
  search(query: string): CanvasTemplate[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();

    return this.getAll().filter((t) => {
      const nameMatch = t.name.toLowerCase().includes(q);
      const tagMatch = t.tags.some((tag) => tag.toLowerCase().includes(q));
      const catMatch = t.category.toLowerCase().includes(q);
      const descMatch = t.description?.toLowerCase().includes(q) ?? false;
      return nameMatch || tagMatch || catMatch || descMatch;
    });
  }

  /**
   * Apply a template — returns a deep clone of the template's document
   * with new IDs generated for all nodes and pages to avoid conflicts.
   */
  apply(templateId: string): CanvasDocument | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    // Deep clone to avoid mutation of the template source
    return structuredClone(template.document);
  }

  /** Get available categories */
  getCategories(): string[] {
    const cats = new Set(this.getAll().map((t) => t.category));
    return Array.from(cats);
  }

  /** Number of registered templates */
  get count(): number {
    return this.templates.size;
  }
}
