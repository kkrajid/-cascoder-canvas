// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Selection Overlay
// Renders Konva Transformer on selected nodes.
// ---------------------------------------------------------------------------

import React, { memo, useRef, useEffect } from 'react';
import { Transformer } from 'react-konva';
import type Konva from 'konva';
import type { CanvasNode } from '@cascoder/canvas-core';

interface SelectionOverlayProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  selectedIds: string[];
  nodes: Record<string, CanvasNode>;
  onTransformEnd: (
    nodeId: string,
    attrs: { x: number; y: number; width: number; height: number; rotation: number; scaleX: number; scaleY: number }
  ) => void;
}

function SelectionOverlayInner({ stageRef, selectedIds, nodes, onTransformEnd }: SelectionOverlayProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    const tr = transformerRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;

    if (selectedIds.length === 0) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    // Find Konva nodes by ID
    const selectedKonvaNodes: Konva.Node[] = [];
    for (const id of selectedIds) {
      const node = stage.findOne(`#${id}`);
      if (node) {
        selectedKonvaNodes.push(node);
      }
    }

    tr.nodes(selectedKonvaNodes);
    tr.getLayer()?.batchDraw();
  }, [selectedIds, stageRef]);

  if (selectedIds.length === 0) return null;

  return (
    <Transformer
      ref={transformerRef}
      // Visual styling — premium look
      borderStroke="#6C5CE7"
      borderStrokeWidth={1.5}
      anchorStroke="#6C5CE7"
      anchorFill="#FFFFFF"
      anchorSize={8}
      anchorCornerRadius={2}
      rotateAnchorOffset={25}
      rotateAnchorCursor="grab"
      enabledAnchors={[
        'top-left', 'top-center', 'top-right',
        'middle-left', 'middle-right',
        'bottom-left', 'bottom-center', 'bottom-right',
      ]}
      // Rotation snapping
      rotationSnaps={[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345]}
      rotationSnapTolerance={5}
      // Minimum size
      boundBoxFunc={(oldBox, newBox) => {
        const minSize = 5;
        if (Math.abs(newBox.width) < minSize || Math.abs(newBox.height) < minSize) {
          return oldBox;
        }
        return newBox;
      }}
      // On transform end — sync back to store
      onTransformEnd={(e) => {
        const node = e.target;
        const id = node.id();
        if (!id) return;

        onTransformEnd(id, {
          x: node.x(),
          y: node.y(),
          width: node.width(),
          height: node.height(),
          rotation: node.rotation(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
        });

        // Reset scale to 1 (we store absolute width/height)
        node.scaleX(1);
        node.scaleY(1);
      }}
      listening={true}
      shouldOverdrawWholeArea={false}
      ignoreStroke={true}
      keepRatio={false}
      centeredScaling={false}
    />
  );
}

export const SelectionOverlay = memo(SelectionOverlayInner);
