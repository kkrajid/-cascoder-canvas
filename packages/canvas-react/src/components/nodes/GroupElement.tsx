// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Group Element
// Recursively renders child nodes inside a Konva Group.
// ---------------------------------------------------------------------------

import React, { memo } from 'react';
import { Group } from 'react-konva';
import type Konva from 'konva';
import type { CanvasNode, GroupNode } from '@cascoder/canvas-core';
import { NodeRenderer } from './NodeRenderer';

interface GroupElementProps {
  node: GroupNode;
  allNodes: Record<string, CanvasNode>;
  isSelected: boolean;
  id: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
  draggable: boolean;
  onClick: (id: string, e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string) => void;
}

function GroupElementInner({
  node,
  allNodes,
  isSelected,
  onClick,
  onDblClick,
  onDragStart,
  onDragMove,
  onDragEnd,
  ...props
}: GroupElementProps) {
  return (
    <Group {...props}>
      {node.childIds.map((childId) => {
        const child = allNodes[childId];
        if (!child || !child.visible) return null;
        return (
          <NodeRenderer
            key={childId}
            node={{
              ...child,
              // Child positions relative to group
              x: child.x - node.x,
              y: child.y - node.y,
            }}
            allNodes={allNodes}
            isSelected={false}
            onClick={onClick}
            onDblClick={onDblClick}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
          />
        );
      })}
    </Group>
  );
}

export const GroupElement = memo(GroupElementInner);
