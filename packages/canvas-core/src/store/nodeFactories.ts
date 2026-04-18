// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Node Factories
// Factory functions to create new nodes with proper defaults.
// ---------------------------------------------------------------------------

import { generateId } from '../utils/id';
import type {
  TextNode,
  ImageNode,
  ShapeNode,
  LineNode,
  GroupNode,
  VideoNode,
  CanvasNode,
  ShapeType,
  FillStyle,
  StrokeStyle,
  NodeConstraints,
  TextRange,
  ImageFilters,
  CropRect,
  TextEffect,
} from '../types/node';
import {
  DEFAULT_FILL,
  DEFAULT_STROKE,
  DEFAULT_CONSTRAINTS,
  DEFAULT_IMAGE_FILTERS,
  DEFAULT_CROP_RECT,
} from '../types/node';

interface BaseNodeOptions {
  id?: string;
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
  parentId?: string | null;
  pageId: string;
}

// ---------------------------------------------------------------------------
// Text Node
// ---------------------------------------------------------------------------
export interface CreateTextOptions extends BaseNodeOptions {
  content?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fill?: FillStyle;
  lineHeight?: number;
  letterSpacing?: number;
}

export function createTextNode(options: CreateTextOptions): TextNode {
  const now = Date.now();
  return {
    id: options.id ?? generateId('txt'),
    type: 'text',
    name: options.name ?? 'Text',
    x: options.x ?? 100,
    y: options.y ?? 100,
    width: options.width ?? 300,
    height: options.height ?? 50,
    rotation: options.rotation ?? 0,
    opacity: options.opacity ?? 1,
    visible: options.visible ?? true,
    locked: options.locked ?? false,
    zIndex: options.zIndex ?? 0,
    parentId: options.parentId ?? null,
    pageId: options.pageId,
    blendMode: 'normal',
    shadow: null,
    constraints: { ...DEFAULT_CONSTRAINTS },
    flipX: false,
    flipY: false,
    createdAt: now,
    updatedAt: now,
    // Text-specific
    content: options.content ?? 'Add text',
    richTextRanges: [],
    fontFamily: options.fontFamily ?? 'Inter',
    fontSize: options.fontSize ?? 24,
    fontWeight: options.fontWeight ?? 400,
    fontStyle: options.fontStyle ?? 'normal',
    textAlign: options.textAlign ?? 'left',
    verticalAlign: 'top',
    lineHeight: options.lineHeight ?? 1.4,
    letterSpacing: options.letterSpacing ?? 0,
    fill: options.fill ?? { type: 'solid', color: '#2D3436' },
    stroke: null,
    textDecoration: 'none',
    textTransform: 'none',
    resizeMode: 'auto-height',
    effects: [],
    padding: 8,
  };
}

// ---------------------------------------------------------------------------
// Image Node
// ---------------------------------------------------------------------------
export interface CreateImageOptions extends BaseNodeOptions {
  src: string;
  alt?: string;
  cornerRadius?: number;
}

export function createImageNode(options: CreateImageOptions): ImageNode {
  const now = Date.now();
  return {
    id: options.id ?? generateId('img'),
    type: 'image',
    name: options.name ?? 'Image',
    x: options.x ?? 100,
    y: options.y ?? 100,
    width: options.width ?? 300,
    height: options.height ?? 300,
    rotation: options.rotation ?? 0,
    opacity: options.opacity ?? 1,
    visible: options.visible ?? true,
    locked: options.locked ?? false,
    zIndex: options.zIndex ?? 0,
    parentId: options.parentId ?? null,
    pageId: options.pageId,
    blendMode: 'normal',
    shadow: null,
    constraints: { ...DEFAULT_CONSTRAINTS },
    flipX: false,
    flipY: false,
    createdAt: now,
    updatedAt: now,
    // Image-specific
    src: options.src,
    alt: options.alt ?? '',
    cropRect: { ...DEFAULT_CROP_RECT },
    filters: { ...DEFAULT_IMAGE_FILTERS },
    objectFit: 'cover',
    cornerRadius: options.cornerRadius ?? 0,
    stroke: null,
    backgroundRemoved: false,
    originalSrc: null,
  };
}

// ---------------------------------------------------------------------------
// Shape Node
// ---------------------------------------------------------------------------
export interface CreateShapeOptions extends BaseNodeOptions {
  shapeType?: ShapeType;
  fill?: FillStyle;
  stroke?: StrokeStyle | null;
  cornerRadius?: number;
  sides?: number;
  innerRadius?: number;
  pathData?: string;
}

export function createShapeNode(options: CreateShapeOptions): ShapeNode {
  const now = Date.now();
  return {
    id: options.id ?? generateId('shp'),
    type: 'shape',
    name: options.name ?? capitalize(options.shapeType ?? 'rectangle'),
    x: options.x ?? 100,
    y: options.y ?? 100,
    width: options.width ?? 200,
    height: options.height ?? 200,
    rotation: options.rotation ?? 0,
    opacity: options.opacity ?? 1,
    visible: options.visible ?? true,
    locked: options.locked ?? false,
    zIndex: options.zIndex ?? 0,
    parentId: options.parentId ?? null,
    pageId: options.pageId,
    blendMode: 'normal',
    shadow: null,
    constraints: { ...DEFAULT_CONSTRAINTS },
    flipX: false,
    flipY: false,
    createdAt: now,
    updatedAt: now,
    // Shape-specific
    shapeType: options.shapeType ?? 'rectangle',
    fill: options.fill ?? { ...DEFAULT_FILL },
    stroke: options.stroke !== undefined ? options.stroke : { ...DEFAULT_STROKE },
    cornerRadius: options.cornerRadius ?? 0,
    sides: options.sides,
    innerRadius: options.innerRadius,
    pathData: options.pathData,
  };
}

// ---------------------------------------------------------------------------
// Line Node
// ---------------------------------------------------------------------------
export interface CreateLineOptions extends BaseNodeOptions {
  points?: number[];
  stroke?: StrokeStyle;
  closed?: boolean;
  tension?: number;
}

export function createLineNode(options: CreateLineOptions): LineNode {
  const now = Date.now();
  return {
    id: options.id ?? generateId('ln'),
    type: 'line',
    name: options.name ?? 'Line',
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? 0,
    height: options.height ?? 0,
    rotation: options.rotation ?? 0,
    opacity: options.opacity ?? 1,
    visible: options.visible ?? true,
    locked: options.locked ?? false,
    zIndex: options.zIndex ?? 0,
    parentId: options.parentId ?? null,
    pageId: options.pageId,
    blendMode: 'normal',
    shadow: null,
    constraints: { ...DEFAULT_CONSTRAINTS },
    flipX: false,
    flipY: false,
    createdAt: now,
    updatedAt: now,
    // Line-specific
    points: options.points ?? [0, 0, 200, 0],
    stroke: options.stroke ?? { ...DEFAULT_STROKE },
    lineCap: 'round',
    lineJoin: 'round',
    closed: options.closed ?? false,
    fill: null,
    tension: options.tension ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Group Node
// ---------------------------------------------------------------------------
export interface CreateGroupOptions extends BaseNodeOptions {
  childIds?: string[];
}

export function createGroupNode(options: CreateGroupOptions): GroupNode {
  const now = Date.now();
  return {
    id: options.id ?? generateId('grp'),
    type: 'group',
    name: options.name ?? 'Group',
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? 0,
    height: options.height ?? 0,
    rotation: options.rotation ?? 0,
    opacity: options.opacity ?? 1,
    visible: options.visible ?? true,
    locked: options.locked ?? false,
    zIndex: options.zIndex ?? 0,
    parentId: options.parentId ?? null,
    pageId: options.pageId,
    blendMode: 'normal',
    shadow: null,
    constraints: { ...DEFAULT_CONSTRAINTS },
    flipX: false,
    flipY: false,
    createdAt: now,
    updatedAt: now,
    // Group-specific
    childIds: options.childIds ?? [],
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
