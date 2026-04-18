// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Shape Element
// Renders rectangles, circles, triangles, polygons, stars, arrows.
// ---------------------------------------------------------------------------

import React, { memo, useRef } from 'react';
import { Rect, Ellipse, RegularPolygon, Star, Arrow, Line, Path, Group } from 'react-konva';
import type Konva from 'konva';
import type { ShapeNode } from '@cascoder/canvas-core';

interface ShapeElementProps {
  node: ShapeNode;
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

function ShapeElementInner({ node, ...props }: ShapeElementProps) {
  const fill = node.fill.type === 'solid' ? (node.fill.color ?? '#6C5CE7') : '#6C5CE7';
  const stroke = node.stroke?.color;
  const strokeWidth = node.stroke?.width ?? 0;
  const dash = node.stroke?.dash;

  const shadowProps = node.shadow
    ? {
        shadowColor: node.shadow.color,
        shadowBlur: node.shadow.blur,
        shadowOffsetX: node.shadow.offsetX,
        shadowOffsetY: node.shadow.offsetY,
        shadowEnabled: true,
      }
    : {};

  const commonShapeProps = {
    fill,
    stroke,
    strokeWidth,
    dash,
    ...shadowProps,
  };

  switch (node.shapeType) {
    case 'rectangle':
      return (
        <Rect
          {...props}
          width={node.width}
          height={node.height}
          cornerRadius={node.cornerRadius}
          {...commonShapeProps}
        />
      );

    case 'circle':
      return (
        <Ellipse
          {...props}
          // Ellipse uses radiusX/radiusY, center at node center
          x={props.x + node.width / 2}
          y={props.y + node.height / 2}
          radiusX={node.width / 2}
          radiusY={node.height / 2}
          {...commonShapeProps}
        />
      );

    case 'triangle':
      return (
        <RegularPolygon
          {...props}
          x={props.x + node.width / 2}
          y={props.y + node.height / 2}
          sides={3}
          radius={Math.min(node.width, node.height) / 2}
          {...commonShapeProps}
        />
      );

    case 'polygon':
      return (
        <RegularPolygon
          {...props}
          x={props.x + node.width / 2}
          y={props.y + node.height / 2}
          sides={node.sides ?? 6}
          radius={Math.min(node.width, node.height) / 2}
          {...commonShapeProps}
        />
      );

    case 'star':
      return (
        <Star
          {...props}
          x={props.x + node.width / 2}
          y={props.y + node.height / 2}
          numPoints={node.sides ?? 5}
          innerRadius={(Math.min(node.width, node.height) / 2) * (node.innerRadius ?? 0.4)}
          outerRadius={Math.min(node.width, node.height) / 2}
          {...commonShapeProps}
        />
      );

    case 'arrow':
      return (
        <Arrow
          {...props}
          points={[0, node.height / 2, node.width, node.height / 2]}
          pointerLength={12}
          pointerWidth={12}
          {...commonShapeProps}
        />
      );

    case 'line':
      return (
        <Line
          {...props}
          points={[0, 0, node.width, 0]}
          stroke={stroke ?? fill}
          strokeWidth={strokeWidth || 2}
          dash={dash}
          lineCap="round"
        />
      );

    case 'custom':
      if (node.pathData) {
        return (
          <Path
            {...props}
            data={node.pathData}
            {...commonShapeProps}
            scaleX={(props.scaleX * node.width) / 100}
            scaleY={(props.scaleY * node.height) / 100}
          />
        );
      }
      return (
        <Rect
          {...props}
          width={node.width}
          height={node.height}
          {...commonShapeProps}
        />
      );

    default:
      return (
        <Rect
          {...props}
          width={node.width}
          height={node.height}
          {...commonShapeProps}
        />
      );
  }
}

export const ShapeElement = memo(ShapeElementInner);
