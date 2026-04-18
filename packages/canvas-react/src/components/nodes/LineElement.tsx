// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Line Element
// ---------------------------------------------------------------------------

import React, { memo } from 'react';
import { Line } from 'react-konva';
import type Konva from 'konva';
import type { LineNode } from '@cascoder/canvas-core';

interface LineElementProps {
  node: LineNode;
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
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDblClick: () => void;
  onDragStart: () => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: () => void;
}

function LineElementInner({ node, ...props }: LineElementProps) {
  const fill = node.fill?.type === 'solid' ? node.fill.color ?? undefined : undefined;

  return (
    <Line
      {...props}
      points={node.points}
      stroke={node.stroke.color}
      strokeWidth={node.stroke.width}
      dash={node.stroke.dash}
      lineCap={node.lineCap}
      lineJoin={node.lineJoin}
      closed={node.closed}
      fill={node.closed ? fill : undefined}
      tension={node.tension}
      hitStrokeWidth={Math.max(node.stroke.width, 10)}
    />
  );
}

export const LineElement = memo(LineElementInner);
