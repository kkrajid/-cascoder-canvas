// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Text Element
// Renders text nodes on the Konva canvas.
// Double-click activates DOM overlay editing (handled by TextEditor).
// ---------------------------------------------------------------------------

import React, { memo } from 'react';
import { Text } from 'react-konva';
import type Konva from 'konva';
import type { TextNode } from '@cascoder/canvas-core';

interface TextElementProps {
  node: TextNode;
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

function TextElementInner({ node, ...props }: TextElementProps) {
  const fill = node.fill.type === 'solid' ? (node.fill.color ?? '#2D3436') : '#2D3436';

  const textDecorationMap: Record<string, string> = {
    'underline': 'underline',
    'line-through': 'line-through',
    'none': '',
  };

  const shadowProps = node.shadow
    ? {
        shadowColor: node.shadow.color,
        shadowBlur: node.shadow.blur,
        shadowOffsetX: node.shadow.offsetX,
        shadowOffsetY: node.shadow.offsetY,
        shadowEnabled: true,
      }
    : {};

  return (
    <Text
      {...props}
      text={node.content}
      width={node.width}
      height={node.resizeMode === 'fixed' ? node.height : undefined}
      fontFamily={node.fontFamily}
      fontSize={node.fontSize}
      fontStyle={
        `${node.fontStyle === 'italic' ? 'italic ' : ''}${node.fontWeight >= 700 ? 'bold' : 'normal'}`
      }
      fill={fill}
      stroke={node.stroke?.color}
      strokeWidth={node.stroke?.width ?? 0}
      align={node.textAlign}
      verticalAlign={node.verticalAlign}
      lineHeight={node.lineHeight}
      letterSpacing={node.letterSpacing}
      textDecoration={textDecorationMap[node.textDecoration] ?? ''}
      padding={node.padding}
      wrap="word"
      ellipsis={false}
      {...shadowProps}
    />
  );
}

export const TextElement = memo(TextElementInner);
