// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Snap Guide Lines
// Renders animated snap guide lines on the UI layer during drag.
// ---------------------------------------------------------------------------

import React, { memo } from 'react';
import { Line } from 'react-konva';
import type { SnapGuideLine } from '@cascoder/canvas-core';

interface SnapGuideLinesProps {
  guides: SnapGuideLine[];
}

function SnapGuideLinesInner({ guides }: SnapGuideLinesProps) {
  if (guides.length === 0) return null;

  return (
    <>
      {guides.map((guide, i) => {
        const points =
          guide.orientation === 'vertical'
            ? [guide.position, guide.start, guide.position, guide.end]
            : [guide.start, guide.position, guide.end, guide.position];

        const color =
          guide.type === 'center' ? '#E17055' :
          guide.type === 'spacing' ? '#00B894' :
          guide.type === 'ruler' ? '#6C5CE7' :
          '#E17055';

        return (
          <Line
            key={`snap-${i}`}
            points={points}
            stroke={color}
            strokeWidth={1}
            dash={guide.type === 'grid' ? [4, 4] : undefined}
            listening={false}
          />
        );
      })}
    </>
  );
}

export const SnapGuideLines = memo(SnapGuideLinesInner);
