// ---------------------------------------------------------------------------
// @cascoder/canvas-core — TemplateEngine Tests
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateEngine } from '../templates/TemplateEngine';
import type { CanvasTemplate } from '../templates/TemplateEngine';
import { createBlankDocument } from '../types/document';

function makeTemplate(overrides: Partial<CanvasTemplate> = {}): CanvasTemplate {
  return {
    id: overrides.id ?? 'tpl-1',
    name: overrides.name ?? 'Test Template',
    category: overrides.category ?? 'social',
    tags: overrides.tags ?? ['test'],
    preset: overrides.preset ?? 'instagram-post',
    thumbnail: overrides.thumbnail ?? 'https://example.com/thumb.jpg',
    premium: overrides.premium ?? false,
    document: overrides.document ?? createBlankDocument('doc-tpl', 'instagram-post'),
  };
}

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  it('should start empty', () => {
    expect(engine.count).toBe(0);
    expect(engine.getAll()).toHaveLength(0);
  });

  it('should register a template', () => {
    engine.register(makeTemplate());
    expect(engine.count).toBe(1);
  });

  it('should register multiple templates', () => {
    engine.registerAll([
      makeTemplate({ id: 'a' }),
      makeTemplate({ id: 'b' }),
      makeTemplate({ id: 'c' }),
    ]);
    expect(engine.count).toBe(3);
  });

  it('should get template by ID', () => {
    engine.register(makeTemplate({ id: 'my-tpl', name: 'My Template' }));
    const tpl = engine.get('my-tpl');
    expect(tpl).toBeDefined();
    expect(tpl!.name).toBe('My Template');
  });

  it('should return undefined for non-existent ID', () => {
    expect(engine.get('nonexistent')).toBeUndefined();
  });

  it('should filter by category', () => {
    engine.registerAll([
      makeTemplate({ id: 'a', category: 'social' }),
      makeTemplate({ id: 'b', category: 'business' }),
      makeTemplate({ id: 'c', category: 'social' }),
    ]);
    expect(engine.getByCategory('social')).toHaveLength(2);
    expect(engine.getByCategory('business')).toHaveLength(1);
  });

  it('should filter free vs premium', () => {
    engine.registerAll([
      makeTemplate({ id: 'a', premium: false }),
      makeTemplate({ id: 'b', premium: true }),
      makeTemplate({ id: 'c', premium: false }),
    ]);
    expect(engine.getFree()).toHaveLength(2);
    expect(engine.getPremium()).toHaveLength(1);
  });

  it('should search by name', () => {
    engine.registerAll([
      makeTemplate({ id: 'a', name: 'Instagram Story' }),
      makeTemplate({ id: 'b', name: 'YouTube Thumbnail' }),
    ]);
    expect(engine.search('instagram')).toHaveLength(1);
    expect(engine.search('thumb')).toHaveLength(1);
  });

  it('should search by tags', () => {
    engine.registerAll([
      makeTemplate({ id: 'a', tags: ['social', 'instagram'] }),
      makeTemplate({ id: 'b', tags: ['print', 'poster'] }),
    ]);
    expect(engine.search('poster')).toHaveLength(1);
  });

  it('should return all on empty search', () => {
    engine.registerAll([makeTemplate({ id: 'a' }), makeTemplate({ id: 'b' })]);
    expect(engine.search('')).toHaveLength(2);
  });

  it('should apply template (deep clone)', () => {
    const original = makeTemplate({ id: 'tpl' });
    engine.register(original);

    const doc = engine.apply('tpl');
    expect(doc).toBeDefined();
    expect(doc).not.toBe(original.document); // Different reference
    expect(doc!.pages[0].id).toBe(original.document.pages[0].id);
  });

  it('should return null when applying non-existent template', () => {
    expect(engine.apply('nonexistent')).toBeNull();
  });

  it('should unregister a template', () => {
    engine.register(makeTemplate({ id: 'x' }));
    expect(engine.unregister('x')).toBe(true);
    expect(engine.count).toBe(0);
  });

  it('should get available categories', () => {
    engine.registerAll([
      makeTemplate({ id: 'a', category: 'social' }),
      makeTemplate({ id: 'b', category: 'business' }),
      makeTemplate({ id: 'c', category: 'social' }),
    ]);
    const cats = engine.getCategories();
    expect(cats).toContain('social');
    expect(cats).toContain('business');
    expect(cats).toHaveLength(2);
  });
});
