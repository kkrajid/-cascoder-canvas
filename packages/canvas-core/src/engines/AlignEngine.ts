// ---------------------------------------------------------------------------
// @cascoder/canvas-core — Align & Distribute Engine
// Alignment, distribution, and spacing tools for selected elements.
// ---------------------------------------------------------------------------

interface AlignTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AlignDirection =
  | 'left'
  | 'center-h'
  | 'right'
  | 'top'
  | 'center-v'
  | 'bottom';

export type DistributeDirection = 'horizontal' | 'vertical';

/**
 * Calculate aligned positions for a set of nodes.
 * Returns a map of { [id]: { x, y } } with the new positions.
 */
export function alignNodes(
  nodes: AlignTarget[],
  direction: AlignDirection,
  pageWidth?: number,
  pageHeight?: number,
): Record<string, { x: number; y: number }> {
  if (nodes.length === 0) return {};

  const result: Record<string, { x: number; y: number }> = {};

  // When single node selected + page dimensions, align to page
  // When multiple nodes, align to selection bounds
  const usePageBounds = nodes.length === 1 && pageWidth != null && pageHeight != null;

  const bounds = usePageBounds
    ? { minX: 0, minY: 0, maxX: pageWidth!, maxY: pageHeight! }
    : {
        minX: Math.min(...nodes.map((n) => n.x)),
        minY: Math.min(...nodes.map((n) => n.y)),
        maxX: Math.max(...nodes.map((n) => n.x + n.width)),
        maxY: Math.max(...nodes.map((n) => n.y + n.height)),
      };

  for (const node of nodes) {
    let x = node.x;
    let y = node.y;

    switch (direction) {
      case 'left':
        x = bounds.minX;
        break;
      case 'center-h':
        x = (bounds.minX + bounds.maxX) / 2 - node.width / 2;
        break;
      case 'right':
        x = bounds.maxX - node.width;
        break;
      case 'top':
        y = bounds.minY;
        break;
      case 'center-v':
        y = (bounds.minY + bounds.maxY) / 2 - node.height / 2;
        break;
      case 'bottom':
        y = bounds.maxY - node.height;
        break;
    }

    result[node.id] = { x, y };
  }

  return result;
}

/**
 * Calculate evenly distributed positions for nodes.
 * Requires 3+ nodes for distribution.
 */
export function distributeNodes(
  nodes: AlignTarget[],
  direction: DistributeDirection,
): Record<string, { x: number; y: number }> {
  if (nodes.length < 3) return {};

  const result: Record<string, { x: number; y: number }> = {};
  const sorted = [...nodes].sort((a, b) =>
    direction === 'horizontal' ? a.x - b.x : a.y - b.y,
  );

  if (direction === 'horizontal') {
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalWidth = sorted.reduce((sum, n) => sum + n.width, 0);
    const totalSpace = (last.x + last.width) - first.x - totalWidth;
    const gap = totalSpace / (sorted.length - 1);

    let currentX = first.x;
    for (const node of sorted) {
      result[node.id] = { x: currentX, y: node.y };
      currentX += node.width + gap;
    }
  } else {
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalHeight = sorted.reduce((sum, n) => sum + n.height, 0);
    const totalSpace = (last.y + last.height) - first.y - totalHeight;
    const gap = totalSpace / (sorted.length - 1);

    let currentY = first.y;
    for (const node of sorted) {
      result[node.id] = { x: node.x, y: currentY };
      currentY += node.height + gap;
    }
  }

  return result;
}
