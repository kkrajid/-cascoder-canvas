// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Ruler Guide Lines
// Renders user-placed draggable guide lines on the canvas.
// ---------------------------------------------------------------------------

import React, { memo } from 'react';
import { Line } from 'react-konva';
import type { RulerGuide } from '@cascoder/canvas-core';

interface RulerGuideLinesProps {
  guides: RulerGuide[];
  pageWidth: number;
  pageHeight: number;
}

function RulerGuideLinesInner({ guides, pageWidth, pageHeight }: RulerGuideLinesProps) {
  if (guides.length === 0) return null;

  // Extend lines well beyond the page
  const extend = 5000;

  return (
    <>
      {guides.map((guide) => {
        const points =
          guide.axis === 'vertical'
            ? [guide.position, -extend, guide.position, pageHeight + extend]
            : [-extend, guide.position, pageWidth + extend, guide.position];

        return (
          <Line
            key={guide.id}
            points={points}
            stroke={guide.color || '#6C5CE7'}
            strokeWidth={1}
            dash={[6, 3]}
            opacity={0.7}
            listening={false}
          />
        );
      })}
    </>
  );
}

export const RulerGuideLines = memo(RulerGuideLinesInner);
