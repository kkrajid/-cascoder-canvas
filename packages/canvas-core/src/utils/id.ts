// ---------------------------------------------------------------------------
// @cascoder/canvas-core — ID Generator
// Uses nanoid for globally unique, URL-safe node IDs.
// ---------------------------------------------------------------------------

import { nanoid } from 'nanoid';

/** Generate a unique node ID */
export function generateId(prefix?: string): string {
  const id = nanoid(12);
  return prefix ? `${prefix}_${id}` : id;
}

/** Generate a page ID */
export function generatePageId(): string {
  return generateId('page');
}

/** Generate a guide ID */
export function generateGuideId(): string {
  return generateId('guide');
}

/** Generate a document ID */
export function generateDocumentId(): string {
  return generateId('doc');
}
