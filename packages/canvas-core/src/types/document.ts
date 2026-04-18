// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Document Types
// Represents the full serializable document structure.
// ---------------------------------------------------------------------------

import type { CanvasNode, FillStyle } from './node';

/** Page size presets */
export type PagePreset =
  | 'custom'
  | 'instagram-post'      // 1080x1080
  | 'instagram-story'     // 1080x1920
  | 'facebook-post'       // 1200x630
  | 'twitter-post'        // 1600x900
  | 'youtube-thumbnail'   // 1280x720
  | 'presentation'        // 1920x1080
  | 'a4-portrait'         // 2480x3508
  | 'a4-landscape'        // 3508x2480
  | 'letter-portrait'     // 2550x3300
  | 'letter-landscape';   // 3300x2550

/** Page dimension preset map */
export const PAGE_PRESETS: Record<Exclude<PagePreset, 'custom'>, { width: number; height: number; label: string }> = {
  'instagram-post':    { width: 1080, height: 1080, label: 'Instagram Post' },
  'instagram-story':   { width: 1080, height: 1920, label: 'Instagram Story' },
  'facebook-post':     { width: 1200, height: 630,  label: 'Facebook Post' },
  'twitter-post':      { width: 1600, height: 900,  label: 'Twitter Post' },
  'youtube-thumbnail': { width: 1280, height: 720,  label: 'YouTube Thumbnail' },
  'presentation':      { width: 1920, height: 1080, label: 'Presentation' },
  'a4-portrait':       { width: 2480, height: 3508, label: 'A4 Portrait' },
  'a4-landscape':      { width: 3508, height: 2480, label: 'A4 Landscape' },
  'letter-portrait':   { width: 2550, height: 3300, label: 'US Letter Portrait' },
  'letter-landscape':  { width: 3300, height: 2550, label: 'US Letter Landscape' },
};

/** A single page/artboard in the document */
export interface Page {
  id: string;
  name: string;
  width: number;
  height: number;
  background: PageBackground;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

/** Page background definition */
export interface PageBackground {
  type: 'color' | 'image' | 'gradient';
  fill: FillStyle;
  imageSrc?: string;
  imageOpacity?: number;
}

/** Reference to an asset used in the document */
export interface AssetReference {
  id: string;
  type: 'image' | 'video' | 'font' | 'svg';
  src: string;
  name: string;
}

/** Global styles applied to the document */
export interface GlobalStyles {
  defaultFontFamily: string;
  defaultFontSize: number;
  defaultFontColor: string;
  brandColors: string[];
}

/** Document metadata */
export interface DocumentMetadata {
  title: string;
  description: string;
  author: string;
  tags: string[];
  preset: PagePreset;
  thumbnail?: string;
}

/** Ruler guide definition */
export interface RulerGuide {
  id: string;
  axis: 'horizontal' | 'vertical';
  position: number; // World coordinate
  locked: boolean;
  color: string;
}

/** The complete canvas document — serializable to JSON */
export interface CanvasDocument {
  /** Schema version for migration */
  schemaVersion: number;
  /** Unique document ID */
  id: string;
  /** Document metadata */
  metadata: DocumentMetadata;
  /** All pages in order */
  pages: Page[];
  /** Flattened node map — all nodes across all pages */
  nodes: Record<string, CanvasNode>;
  /** Ordered node IDs per page */
  nodeOrder: Record<string, string[]>;
  /** Ruler guides */
  guides: RulerGuide[];
  /** Global styles */
  globalStyles: GlobalStyles;
  /** Asset references */
  assets: AssetReference[];
  /** Timestamps */
  createdAt: number;
  updatedAt: number;
}

/** Current schema version */
export const CURRENT_SCHEMA_VERSION = 1;

/** Create a blank document */
export function createBlankDocument(
  id: string,
  preset: PagePreset = 'instagram-post',
  pageId: string = 'page-1',
): CanvasDocument {
  const presetDims = preset !== 'custom'
    ? PAGE_PRESETS[preset]
    : { width: 1080, height: 1080, label: 'Custom' };

  const page: Page = {
    id: pageId,
    name: 'Page 1',
    width: presetDims.width,
    height: presetDims.height,
    background: {
      type: 'color',
      fill: { type: 'solid', color: '#FFFFFF' },
    },
    sortOrder: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    id,
    metadata: {
      title: 'Untitled Design',
      description: '',
      author: '',
      tags: [],
      preset,
    },
    pages: [page],
    nodes: {},
    nodeOrder: { [pageId]: [] },
    guides: [],
    globalStyles: {
      defaultFontFamily: 'Inter',
      defaultFontSize: 16,
      defaultFontColor: '#2D3436',
      brandColors: ['#6C5CE7', '#A29BFE', '#00B894', '#FDCB6E', '#E17055'],
    },
    assets: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
