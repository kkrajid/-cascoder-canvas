// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Node Renderer
// Dispatches rendering to the correct component based on node type.
// Wrapped in ErrorBoundary to prevent one bad node from crashing the canvas.
// ---------------------------------------------------------------------------

import React, { memo } from 'react';
import { Group } from 'react-konva';
import type Konva from 'konva';
import type { CanvasNode } from '@cascoder/canvas-core';
import { TextElement } from './TextElement';
import { ImageElement } from './ImageElement';
import { ShapeElement } from './ShapeElement';
import { LineElement } from './LineElement';
import { GroupElement } from './GroupElement';
import { NodeErrorBoundary } from './NodeErrorBoundary';

interface NodeRendererProps {
  node: CanvasNode;
  allNodes: Record<string, CanvasNode>;
  isSelected: boolean;
  isBeingEdited?: boolean;
  onClick: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
}

function NodeRendererInner({
  node,
  allNodes,
  isSelected,
  isBeingEdited,
  onClick,
  onDblClick,
  onDragStart,
  onDragMove,
  onDragEnd,
}: NodeRendererProps) {
  if (!node.visible) return null;

  const commonProps = {
    id: node.id,
    x: node.x,
    y: node.y,
    rotation: node.rotation,
    opacity: isBeingEdited ? 0 : node.opacity, // Hide when DOM editor is active
    scaleX: node.flipX ? -1 : 1,
    scaleY: node.flipY ? -1 : 1,
    offsetX: node.flipX ? node.width : 0,
    offsetY: node.flipY ? node.height : 0,
    draggable: !node.locked && !isBeingEdited,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => onClick(node.id, e),
    onDblClick: () => onDblClick(node.id),
    onDragStart: () => onDragStart(node.id),
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
      const target = e.target;
      onDragMove(node.id, target.x(), target.y());
    },
    onDragEnd: () => onDragEnd(node.id),
  };

  let content: React.ReactNode;

  switch (node.type) {
    case 'text':
      content = <TextElement node={node} {...commonProps} />;
      break;
    case 'image':
      content = <ImageElement node={node} {...commonProps} />;
      break;
    case 'shape':
      content = <ShapeElement node={node} {...commonProps} />;
      break;
    case 'line':
      content = <LineElement node={node} {...commonProps} />;
      break;
    case 'group':
      content = (
        <GroupElement
          {...commonProps}
          node={node}
          allNodes={allNodes}
          isSelected={isSelected}
          onClick={onClick}
          onDblClick={onDblClick}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        />
      );
      break;
    default:
      return null;
  }

  return (
    <NodeErrorBoundary nodeId={node.id}>
      {content}
    </NodeErrorBoundary>
  );
}

export const NodeRenderer = memo(NodeRendererInner);
