// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Marquee Select
// Rubber-band selection rectangle drawn by dragging on empty canvas.
// ---------------------------------------------------------------------------

import React, { memo, useCallback, useRef, useState } from 'react';
import { Rect } from 'react-konva';
import type Konva from 'konva';
import { useEditorContext, useEditorStore } from '../EditorProvider';

interface MarqueeSelectProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

function MarqueeSelectInner({ stageRef }: MarqueeSelectProps) {
  const { store } = useEditorContext();
  const marqueeRect = useEditorStore((s) => s.marqueeRect);
  const activeTool = useEditorStore((s) => s.activeTool);

  if (!marqueeRect || activeTool !== 'select') return null;

  // Normalize rect (handle negative dimensions from dragging backwards)
  const x = marqueeRect.width < 0 ? marqueeRect.x + marqueeRect.width : marqueeRect.x;
  const y = marqueeRect.height < 0 ? marqueeRect.y + marqueeRect.height : marqueeRect.y;
  const width = Math.abs(marqueeRect.width);
  const height = Math.abs(marqueeRect.height);

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(108, 92, 231, 0.1)"
      stroke="#6C5CE7"
      strokeWidth={1}
      dash={[4, 4]}
      listening={false}
    />
  );
}

export const MarqueeSelect = memo(MarqueeSelectInner);
