// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Node Types
// Complete scene graph node schema with discriminated union types.
// Every element on the canvas is represented as a CanvasNode.
// ---------------------------------------------------------------------------

/** Supported node types */
export type NodeType = 'text' | 'image' | 'shape' | 'line' | 'group' | 'video';

/** Shape sub-types */
export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'polygon'
  | 'star'
  | 'arrow'
  | 'line'
  | 'custom';

/** Text alignment */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/** Text vertical alignment */
export type TextVerticalAlign = 'top' | 'middle' | 'bottom';

/** Object-fit mode for images */
export type ObjectFit = 'fill' | 'contain' | 'cover' | 'none';

/** Line cap style */
export type LineCap = 'butt' | 'round' | 'square';

/** Line join style */
export type LineJoin = 'miter' | 'round' | 'bevel';

/** Blending modes */
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten';

/** Fill type — solid color or gradient */
export interface FillStyle {
  type: 'solid' | 'linear-gradient' | 'radial-gradient';
  color?: string;
  gradient?: GradientDef;
}

export interface GradientDef {
  stops: Array<{ offset: number; color: string }>;
  angle?: number; // linear
  cx?: number;    // radial
  cy?: number;    // radial
  r?: number;     // radial
}

/** Stroke style */
export interface StrokeStyle {
  color: string;
  width: number;
  dash?: number[];
  lineCap?: LineCap;
  lineJoin?: LineJoin;
}

/** Shadow definition */
export interface ShadowDef {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

/** Rich text inline range — describes a styled range within a text block */
export interface TextRange {
  start: number;
  end: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  textDecoration?: string;
  link?: string;
}

/** Crop rectangle (relative 0–1 coordinates) */
export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Image filter settings */
export interface ImageFilters {
  brightness: number;   // -100 to 100, default 0
  contrast: number;     // -100 to 100, default 0
  saturation: number;   // -100 to 100, default 0
  blur: number;         // 0+, default 0
  hue: number;          // -180 to 180, default 0
  sepia: number;        // 0 to 100, default 0
  grayscale: number;    // 0 to 100, default 0
}

/** Text effect */
export interface TextEffect {
  type: 'shadow' | 'glow' | 'outline' | 'lift';
  color?: string;
  blur?: number;
  offsetX?: number;
  offsetY?: number;
  width?: number; // outline width
}

/** Node constraints for permissions */
export interface NodeConstraints {
  locked?: boolean;
  preventDelete?: boolean;
  preventMove?: boolean;
  preventResize?: boolean;
  preventRotate?: boolean;
  preventEdit?: boolean;
}

/** Text resize behavior */
export type TextResizeMode = 'auto-width' | 'auto-height' | 'fixed';

// ---------------------------------------------------------------------------
// Base Node — shared properties for all node types
// ---------------------------------------------------------------------------
export interface BaseNode {
  id: string;
  type: NodeType;
  name: string;                  // Display name in layers panel
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;              // Degrees
  opacity: number;               // 0–1
  visible: boolean;
  locked: boolean;
  zIndex: number;
  parentId: string | null;       // Group parent
  pageId: string;                // Which page this node belongs to
  blendMode: BlendMode;
  shadow: ShadowDef | null;
  constraints: NodeConstraints;
  // Flip state
  flipX: boolean;
  flipY: boolean;
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// ---------------------------------------------------------------------------
// Concrete Node Types
// ---------------------------------------------------------------------------

export interface TextNode extends BaseNode {
  type: 'text';
  content: string;               // Plain text content
  richTextRanges: TextRange[];   // Inline style ranges
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textAlign: TextAlign;
  verticalAlign: TextVerticalAlign;
  lineHeight: number;            // Multiplier (1.2 = 120%)
  letterSpacing: number;         // px
  fill: FillStyle;
  stroke: StrokeStyle | null;
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  resizeMode: TextResizeMode;
  effects: TextEffect[];
  padding: number;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string;                   // Image URL or data URL
  alt: string;
  cropRect: CropRect;           // Normalized crop 0–1
  filters: ImageFilters;
  objectFit: ObjectFit;
  cornerRadius: number;
  stroke: StrokeStyle | null;
  // Placeholder for background removal
  backgroundRemoved: boolean;
  originalSrc: string | null;   // Pre-edit source
}

export interface ShapeNode extends BaseNode {
  type: 'shape';
  shapeType: ShapeType;
  fill: FillStyle;
  stroke: StrokeStyle | null;
  cornerRadius: number;
  // Polygon / star specifics
  sides?: number;               // polygon: 3+, star: points
  innerRadius?: number;         // star inner radius ratio 0–1
  // Custom SVG path
  pathData?: string;
}

export interface LineNode extends BaseNode {
  type: 'line';
  points: number[];             // [x1,y1, x2,y2, ...]
  stroke: StrokeStyle;
  lineCap: LineCap;
  lineJoin: LineJoin;
  closed: boolean;
  fill: FillStyle | null;
  tension: number;              // Bezier tension 0–1
}

export interface GroupNode extends BaseNode {
  type: 'group';
  childIds: string[];
}

export interface VideoNode extends BaseNode {
  type: 'video';
  src: string;
  posterSrc: string | null;
  currentTime: number;
  duration: number;
  muted: boolean;
  loop: boolean;
  playing: boolean;
  cornerRadius: number;
}

// ---------------------------------------------------------------------------
// Union Type
// ---------------------------------------------------------------------------
export type CanvasNode =
  | TextNode
  | ImageNode
  | ShapeNode
  | LineNode
  | GroupNode
  | VideoNode;

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------
export function isTextNode(node: CanvasNode): node is TextNode {
  return node.type === 'text';
}

export function isImageNode(node: CanvasNode): node is ImageNode {
  return node.type === 'image';
}

export function isShapeNode(node: CanvasNode): node is ShapeNode {
  return node.type === 'shape';
}

export function isLineNode(node: CanvasNode): node is LineNode {
  return node.type === 'line';
}

export function isGroupNode(node: CanvasNode): node is GroupNode {
  return node.type === 'group';
}

export function isVideoNode(node: CanvasNode): node is VideoNode {
  return node.type === 'video';
}

// ---------------------------------------------------------------------------
// Defaults Factory
// ---------------------------------------------------------------------------
export const DEFAULT_IMAGE_FILTERS: ImageFilters = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  hue: 0,
  sepia: 0,
  grayscale: 0,
};

export const DEFAULT_CROP_RECT: CropRect = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
};

export const DEFAULT_FILL: FillStyle = {
  type: 'solid',
  color: '#6C5CE7',
};

export const DEFAULT_STROKE: StrokeStyle = {
  color: '#2D3436',
  width: 2,
  lineCap: 'round',
  lineJoin: 'round',
};

export const DEFAULT_CONSTRAINTS: NodeConstraints = {
  locked: false,
  preventDelete: false,
  preventMove: false,
  preventResize: false,
  preventRotate: false,
  preventEdit: false,
};
