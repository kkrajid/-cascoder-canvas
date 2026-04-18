// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Main Canvas Component
// Renders the Konva Stage with zoom/pan, background, nodes, and selection UI.
// ---------------------------------------------------------------------------

import React, { useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { Stage, Layer, Rect, Group } from 'react-konva';
import type Konva from 'konva';
import { useEditorStore, useEditorContext } from './EditorProvider';
import { NodeRenderer } from './nodes/NodeRenderer';
import { SelectionOverlay } from './selection/SelectionOverlay';
import { MarqueeSelect } from './selection/MarqueeSelect';
import { SnapGuideLines } from './guides/SnapGuides';
import { RulerGuideLines } from './guides/RulerGuideLines';
import { TextEditorOverlay } from './text/TextEditorOverlay';
import type { SnapGuideLine, CanvasNode } from '@cascoder/canvas-core';

interface CanvasProps {
  className?: string;
}

function CanvasInner({ className }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const { store, snapEngine } = useEditorContext();

  // Subscribe to store slices
  const zoom = useEditorStore((s) => s.zoom);
  const viewportX = useEditorStore((s) => s.viewportX);
  const viewportY = useEditorStore((s) => s.viewportY);
  const containerWidth = useEditorStore((s) => s.containerWidth);
  const containerHeight = useEditorStore((s) => s.containerHeight);
  const activePageId = useEditorStore((s) => s.activePageId);
  const pages = useEditorStore((s) => s.pages);
  const nodeOrder = useEditorStore((s) => s.nodeOrder);
  const nodes = useEditorStore((s) => s.nodes);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const isPanning = useEditorStore((s) => s.isPanning);
  const activeTool = useEditorStore((s) => s.activeTool);
  const showGuides = useEditorStore((s) => s.showGuides);
  const guides = useEditorStore((s) => s.guides);
  const isEditingText = useEditorStore((s) => s.isEditingText);
  const editingTextNodeId = useEditorStore((s) => s.editingTextNodeId);

  // Active page
  const activePage = useMemo(
    () => pages.find((p) => p.id === activePageId),
    [pages, activePageId]
  );

  // Node IDs for the active page
  const activeNodeIds = useMemo(
    () => nodeOrder[activePageId] ?? [],
    [nodeOrder, activePageId]
  );

  // Snap guide state — use ref to avoid re-renders during drag
  const snapGuidesRef = useRef<SnapGuideLine[]>([]);
  const [snapGuides, setSnapGuides] = React.useState<SnapGuideLine[]>([]);

  // Drag before state ref
  const dragBeforeStateRef = useRef<Record<string, CanvasNode | null>>({});

  // Marquee drag state refs
  const isMarqueeRef = useRef(false);
  const marqueeStartRef = useRef({ x: 0, y: 0 });

  // --- Resize observer ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        store.getState().setContainerSize(
          entry.contentRect.width,
          entry.contentRect.height
        );
      }
    });
    observer.observe(el);

    // Initial size
    store.getState().setContainerSize(el.clientWidth, el.clientHeight);

    // Zoom to fit once we have a size
    requestAnimationFrame(() => {
      store.getState().zoomToFit();
    });

    return () => observer.disconnect();
  }, [store]);

  // --- Wheel zoom ---
  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const state = store.getState();
      const scaleBy = 1.08;
      const stage = stageRef.current;
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0
        ? state.zoom * scaleBy
        : state.zoom / scaleBy;

      state.setZoom(newScale, { x: pointer.x, y: pointer.y });
    },
    [store]
  );

  // --- Pan with space+drag or middle mouse ---
  const isPanningRef = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const state = store.getState();

      // Middle mouse button or hand tool
      if (e.evt.button === 1 || state.activeTool === 'hand') {
        isPanningRef.current = true;
        lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY };
        state.setIsPanning(true);
        e.evt.preventDefault();
        return;
      }

      // Click on empty stage — start marquee or deselect
      const clickedOnStage = e.target === e.target.getStage();
      const clickedOnBackground = e.target.getParent()?.getParent() === e.target.getStage();
      if ((clickedOnStage || clickedOnBackground) && state.activeTool === 'select') {
        state.deselectAll();
        setSnapGuides([]);
        if (state.isEditingText) {
          state.stopTextEditing();
        }

        // Start marquee selection — convert screen position to world coordinates
        const stage = stageRef.current;
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            const worldX = (pointer.x - state.viewportX) / state.zoom;
            const worldY = (pointer.y - state.viewportY) / state.zoom;
            isMarqueeRef.current = true;
            marqueeStartRef.current = { x: worldX, y: worldY };
            state.setMarqueeRect({ x: worldX, y: worldY, width: 0, height: 0 });
          }
        }
      }
    },
    [store]
  );

  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isPanningRef.current) {
        const state = store.getState();
        const dx = e.evt.clientX - lastPanPos.current.x;
        const dy = e.evt.clientY - lastPanPos.current.y;
        state.panBy(dx, dy);
        lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY };
        return;
      }

      // Marquee selection drag
      if (isMarqueeRef.current) {
        const stage = stageRef.current;
        const state = store.getState();
        if (stage) {
          const pointer = stage.getPointerPosition();
          if (pointer) {
            const worldX = (pointer.x - state.viewportX) / state.zoom;
            const worldY = (pointer.y - state.viewportY) / state.zoom;
            const startX = marqueeStartRef.current.x;
            const startY = marqueeStartRef.current.y;
            // Normalize for negative drag directions
            const x = Math.min(startX, worldX);
            const y = Math.min(startY, worldY);
            const width = Math.abs(worldX - startX);
            const height = Math.abs(worldY - startY);
            state.setMarqueeRect({ x, y, width, height });
          }
        }
      }
    },
    [store]
  );

  const handleStageMouseUp = useCallback(
    () => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        store.getState().setIsPanning(false);
      }

      // Commit marquee selection
      if (isMarqueeRef.current) {
        isMarqueeRef.current = false;
        const state = store.getState();
        if (state.marqueeRect && (state.marqueeRect.width > 3 || state.marqueeRect.height > 3)) {
          state.commitMarqueeSelection();
        } else {
          // Click without drag — just clear the marquee
          state.setMarqueeRect(null);
        }
      }
    },
    [store]
  );

  // --- Node interaction handlers ---
  const handleNodeClick = useCallback(
    (nodeId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;
      const state = store.getState();
      if (state.activeTool !== 'select') return;

      // Stop text editing if clicking a different node
      if (state.isEditingText && state.editingTextNodeId !== nodeId) {
        state.stopTextEditing();
      }

      const additive = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      state.selectNode(nodeId, additive);
    },
    [store]
  );

  const handleNodeDblClick = useCallback(
    (nodeId: string) => {
      const state = store.getState();
      const node = state.nodes[nodeId];
      if (node?.type === 'text') {
        state.startTextEditing(nodeId);
      }
    },
    [store]
  );

  const handleNodeDragStart = useCallback(
    (nodeId: string) => {
      const state = store.getState();
      // Stop text editing on drag
      if (state.isEditingText) {
        state.stopTextEditing();
      }
      // Ensure dragged node is selected
      if (!state.selectedIds.includes(nodeId)) {
        state.selectNode(nodeId);
      }
      // Capture before state
      const selectedIds = store.getState().selectedIds;
      dragBeforeStateRef.current = store.getState().captureBeforeState(selectedIds);
    },
    [store]
  );

  const handleNodeDragMove = useCallback(
    (nodeId: string, x: number, y: number) => {
      const state = store.getState();
      const node = state.nodes[nodeId];
      if (!node || !activePage) return;

      // Calculate snap
      const otherNodes = activeNodeIds
        .filter((id) => !state.selectedIds.includes(id))
        .map((id) => state.nodes[id])
        .filter(Boolean);

      const movingRect = { x, y, width: node.width, height: node.height };
      const pageRect = { x: 0, y: 0, width: activePage.width, height: activePage.height };

      const snap = snapEngine.calculateSnap(
        movingRect,
        otherNodes as CanvasNode[],
        state.guides,
        pageRect,
        state.zoom
      );

      const finalX = snap.x ?? x;
      const finalY = snap.y ?? y;

      // Move delta for multi-select
      const dx = finalX - node.x;
      const dy = finalY - node.y;

      // Batch update: primary node + all other selected nodes
      if (state.selectedIds.length > 1) {
        const updates = state.selectedIds.map((id) => {
          const n = state.nodes[id];
          if (!n) return null;
          if (id === nodeId) {
            return { id, changes: { x: finalX, y: finalY } };
          }
          return { id, changes: { x: n.x + dx, y: n.y + dy } };
        }).filter(Boolean) as Array<{ id: string; changes: Partial<CanvasNode> }>;
        state.updateNodes(updates);
      } else {
        state.updateNode(nodeId, { x: finalX, y: finalY });
      }

      // Update snap guides for rendering
      snapGuidesRef.current = snap.guides;
      setSnapGuides(snap.guides);
    },
    [store, snapEngine, activePage, activeNodeIds]
  );

  const handleNodeDragEnd = useCallback(
    (nodeId: string) => {
      const state = store.getState();
      // Capture after state and push command
      const afterState: Record<string, CanvasNode | null> = {};
      for (const id of state.selectedIds) {
        afterState[id] = state.nodes[id] ? structuredClone(state.nodes[id]) : null;
      }
      const beforeState = dragBeforeStateRef.current;
      state.pushCommand({
        name: 'Move elements',
        timestamp: Date.now(),
        before: beforeState,
        after: afterState,
      });
      setSnapGuides([]);
      snapGuidesRef.current = [];
    },
    [store]
  );

  const handleTransformEnd = useCallback(
    (nodeId: string, attrs: { x: number; y: number; width: number; height: number; rotation: number; scaleX: number; scaleY: number }) => {
      const state = store.getState();
      const node = state.nodes[nodeId];
      if (!node) return;

      const beforeState = state.captureBeforeState([nodeId]);

      // Apply transform — normalize scale into width/height
      const newWidth = Math.max(1, attrs.width * Math.abs(attrs.scaleX));
      const newHeight = Math.max(1, attrs.height * Math.abs(attrs.scaleY));

      state.updateNode(nodeId, {
        x: attrs.x,
        y: attrs.y,
        width: newWidth,
        height: newHeight,
        rotation: attrs.rotation,
      });

      const afterState: Record<string, CanvasNode | null> = {
        [nodeId]: structuredClone(store.getState().nodes[nodeId]),
      };

      state.pushCommand({
        name: 'Transform element',
        timestamp: Date.now(),
        before: beforeState,
        after: afterState,
      });
    },
    [store]
  );

  // --- Text editing overlay position helpers ---
  const editingNode = isEditingText && editingTextNodeId
    ? nodes[editingTextNodeId]
    : null;

  // --- Cursor ---
  const cursor = useMemo(() => {
    if (isPanning) return 'grabbing';
    if (activeTool === 'hand') return 'grab';
    if (activeTool === 'text') return 'text';
    return 'default';
  }, [isPanning, activeTool]);

  if (!activePage) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        cursor,
        background: '#1a1a2e',
      }}
    >
      {containerWidth > 0 && containerHeight > 0 && (
        <Stage
          ref={stageRef}
          width={containerWidth}
          height={containerHeight}
          scaleX={zoom}
          scaleY={zoom}
          x={viewportX}
          y={viewportY}
          onWheel={handleWheel}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={handleStageMouseUp}
        >
          {/* Background Layer — page background */}
          <Layer listening={false}>
            {/* Page shadow */}
            <Rect
              x={2}
              y={2}
              width={activePage.width}
              height={activePage.height}
              fill="rgba(0,0,0,0.15)"
              cornerRadius={2}
            />
            {/* Page background */}
            <Rect
              x={0}
              y={0}
              width={activePage.width}
              height={activePage.height}
              fill={
                activePage.background.fill.type === 'solid'
                  ? activePage.background.fill.color ?? '#FFFFFF'
                  : '#FFFFFF'
              }
              cornerRadius={0}
            />
          </Layer>

          {/* Content Layer — nodes */}
          <Layer>
            {activeNodeIds.map((nodeId) => {
              const node = nodes[nodeId];
              if (!node || !node.visible || node.parentId) return null;

              // Viewport culling — skip nodes entirely outside visible area
              // Converting viewport to world coordinates
              const worldLeft = -viewportX / zoom;
              const worldTop = -viewportY / zoom;
              const worldRight = worldLeft + containerWidth / zoom;
              const worldBottom = worldTop + containerHeight / zoom;
              const margin = 50; // Buffer to avoid pop-in
              if (
                node.x + node.width < worldLeft - margin ||
                node.x > worldRight + margin ||
                node.y + node.height < worldTop - margin ||
                node.y > worldBottom + margin
              ) {
                return null; // Node is off-screen, skip rendering
              }

              // Hide text node when editing (DOM overlay replaces it)
              const isBeingEdited = isEditingText && editingTextNodeId === nodeId;
              return (
                <NodeRenderer
                  key={nodeId}
                  node={node}
                  allNodes={nodes}
                  isSelected={selectedIds.includes(nodeId)}
                  isBeingEdited={isBeingEdited}
                  onClick={handleNodeClick}
                  onDblClick={handleNodeDblClick}
                  onDragStart={handleNodeDragStart}
                  onDragMove={handleNodeDragMove}
                  onDragEnd={handleNodeDragEnd}
                />
              );
            })}
          </Layer>

          {/* Selection/Transform Layer — MUST be listening for resize handles */}
          <Layer>
            <SelectionOverlay
              stageRef={stageRef}
              selectedIds={selectedIds}
              nodes={nodes}
              onTransformEnd={handleTransformEnd}
            />
          </Layer>

          {/* UI Layer — guides only */}
          <Layer listening={false}>
            <SnapGuideLines guides={snapGuides} />
            {showGuides && (
              <RulerGuideLines
                guides={guides}
                pageWidth={activePage.width}
                pageHeight={activePage.height}
              />
            )}
          </Layer>

          {/* Marquee selection layer */}
          <Layer>
            <MarqueeSelect stageRef={stageRef} />
          </Layer>
        </Stage>
      )}

      {/* Text editing DOM overlay */}
      {editingNode && editingNode.type === 'text' && (
        <TextEditorOverlay
          node={editingNode}
          zoom={zoom}
          viewportX={viewportX}
          viewportY={viewportY}
          containerRef={containerRef}
        />
      )}
    </div>
  );
}

export const Canvas = memo(CanvasInner);
