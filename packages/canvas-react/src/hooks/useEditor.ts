// ---------------------------------------------------------------------------
// @cascoder/canvas-react — useEditor Hook
// Main editor API hook for consumer applications.
// ---------------------------------------------------------------------------

import { useCallback, useRef } from 'react';
import { useEditorContext, useEditorStore } from '../components/EditorProvider';
import {
  createTextNode,
  createImageNode,
  createShapeNode,
  createLineNode,
  generateId,
} from '@cascoder/canvas-core';
import type {
  CanvasDocument,
  CreateTextOptions,
  CreateImageOptions,
  CreateShapeOptions,
  CreateLineOptions,
  CanvasPlugin,
  CanvasNode,
  ShapeType,
} from '@cascoder/canvas-core';

export function useEditor() {
  const { store, eventBus, pluginManager, snapEngine } = useEditorContext();

  const addText = useCallback(
    (options?: Partial<CreateTextOptions>) => {
      const state = store.getState();
      const nodeOrderBefore = structuredClone(state.nodeOrder);
      const node = createTextNode({
        pageId: state.activePageId,
        ...options,
      });
      state.addNode(node);
      state.selectNode(node.id);
      const nodeOrderAfter = structuredClone(store.getState().nodeOrder);
      state.pushCommand({
        name: 'Add text',
        timestamp: Date.now(),
        before: { [node.id]: null },
        after: { [node.id]: structuredClone(node) },
        nodeOrderBefore,
        nodeOrderAfter,
      });
      eventBus.emit('node:created', { node });
      return node.id;
    },
    [store, eventBus]
  );

  const addImage = useCallback(
    (src: string, options?: Partial<CreateImageOptions>) => {
      const state = store.getState();
      const nodeOrderBefore = structuredClone(state.nodeOrder);
      const node = createImageNode({
        src,
        pageId: state.activePageId,
        ...options,
      });
      state.addNode(node);
      state.selectNode(node.id);
      const nodeOrderAfter = structuredClone(store.getState().nodeOrder);
      state.pushCommand({
        name: 'Add image',
        timestamp: Date.now(),
        before: { [node.id]: null },
        after: { [node.id]: structuredClone(node) },
        nodeOrderBefore,
        nodeOrderAfter,
      });
      eventBus.emit('node:created', { node });
      return node.id;
    },
    [store, eventBus]
  );

  const addShape = useCallback(
    (shapeType: ShapeType = 'rectangle', options?: Partial<CreateShapeOptions>) => {
      const state = store.getState();
      const nodeOrderBefore = structuredClone(state.nodeOrder);
      const node = createShapeNode({
        shapeType,
        pageId: state.activePageId,
        ...options,
      });
      state.addNode(node);
      state.selectNode(node.id);
      const nodeOrderAfter = structuredClone(store.getState().nodeOrder);
      state.pushCommand({
        name: 'Add shape',
        timestamp: Date.now(),
        before: { [node.id]: null },
        after: { [node.id]: structuredClone(node) },
        nodeOrderBefore,
        nodeOrderAfter,
      });
      eventBus.emit('node:created', { node });
      return node.id;
    },
    [store, eventBus]
  );

  const addLine = useCallback(
    (options?: Partial<CreateLineOptions>) => {
      const state = store.getState();
      const nodeOrderBefore = structuredClone(state.nodeOrder);
      const node = createLineNode({
        pageId: state.activePageId,
        ...options,
      });
      state.addNode(node);
      state.selectNode(node.id);
      const nodeOrderAfter = structuredClone(store.getState().nodeOrder);
      state.pushCommand({
        name: 'Add line',
        timestamp: Date.now(),
        before: { [node.id]: null },
        after: { [node.id]: structuredClone(node) },
        nodeOrderBefore,
        nodeOrderAfter,
      });
      return node.id;
    },
    [store, eventBus]
  );

  const deleteSelected = useCallback(() => {
    const state = store.getState();
    if (state.selectedIds.length === 0) return;

    const beforeState = state.captureBeforeState(state.selectedIds);
    const nodeOrderBefore = structuredClone(state.nodeOrder);
    const idsToDelete = [...state.selectedIds];

    state.deleteNodes(idsToDelete);

    const afterState: Record<string, null> = {};
    for (const id of idsToDelete) {
      afterState[id] = null;
    }
    const nodeOrderAfter = structuredClone(store.getState().nodeOrder);

    state.pushCommand({
      name: 'Delete elements',
      timestamp: Date.now(),
      before: beforeState,
      after: afterState,
      nodeOrderBefore,
      nodeOrderAfter,
    });
  }, [store]);

  const duplicateSelected = useCallback(() => {
    const state = store.getState();
    if (state.selectedIds.length === 0) return;

    const newIds: string[] = [];
    for (const id of state.selectedIds) {
      const newId = state.duplicateNode(id);
      if (newId) newIds.push(newId);
    }
    if (newIds.length > 0) {
      state.selectNodes(newIds);
    }
  }, [store]);

  const group = useCallback(() => {
    const state = store.getState();
    state.groupNodes(state.selectedIds);
  }, [store]);

  const ungroup = useCallback(() => {
    const state = store.getState();
    if (state.selectedIds.length === 1) {
      state.ungroupNode(state.selectedIds[0]);
    }
  }, [store]);

  const undo = useCallback(() => store.getState().undo(), [store]);
  const redo = useCallback(() => store.getState().redo(), [store]);

  const toJSON = useCallback((): CanvasDocument => {
    const state = store.getState();
    return {
      schemaVersion: 1,
      id: 'doc-1',
      metadata: {
        title: 'Untitled Design',
        description: '',
        author: '',
        tags: [],
        preset: 'custom',
      },
      pages: state.pages,
      nodes: structuredClone(state.nodes),
      nodeOrder: structuredClone(state.nodeOrder),
      guides: structuredClone(state.guides),
      globalStyles: {
        defaultFontFamily: 'Inter',
        defaultFontSize: 16,
        defaultFontColor: '#2D3436',
        brandColors: ['#6C5CE7', '#A29BFE', '#00B894', '#FDCB6E', '#E17055'],
      },
      assets: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }, [store]);

  /** Export the canvas as a PNG blob */
  const exportPNG = useCallback(
    async (options?: { pixelRatio?: number; quality?: number }): Promise<Blob> => {
      const state = store.getState();
      const page = state.pages.find((p) => p.id === state.activePageId);
      if (!page) throw new Error('No active page');

      const pixelRatio = options?.pixelRatio ?? 2;
      const quality = options?.quality ?? 1;

      // Create offscreen Konva Stage
      const Konva = (await import('konva')).default;
      const offStage = new Konva.Stage({
        container: document.createElement('div'),
        width: page.width,
        height: page.height,
      });

      const layer = new Konva.Layer();
      offStage.add(layer);

      // Draw page background
      const bgColor = page.background.fill.type === 'solid'
        ? (page.background.fill.color ?? '#FFFFFF')
        : '#FFFFFF';
      const bg = new Konva.Rect({
        x: 0, y: 0,
        width: page.width, height: page.height,
        fill: bgColor,
      });
      layer.add(bg);

      // Draw each node — collect promises for async image loads
      const imageLoadPromises: Promise<void>[] = [];
      const nodeIds = state.nodeOrder[state.activePageId] ?? [];
      for (const nodeId of nodeIds) {
        const node = state.nodes[nodeId];
        if (!node || !node.visible || node.parentId) continue;

        const fill = node.type !== 'line'
          ? ('fill' in node && node.fill?.type === 'solid' ? node.fill.color ?? '#6C5CE7' : '#6C5CE7')
          : undefined;

        switch (node.type) {
          case 'text': {
            const textNode = node as any;
            const text = new Konva.Text({
              x: textNode.x, y: textNode.y,
              text: textNode.content,
              width: textNode.width,
              fontFamily: textNode.fontFamily,
              fontSize: textNode.fontSize,
              fontStyle: `${textNode.fontStyle === 'italic' ? 'italic ' : ''}${textNode.fontWeight >= 700 ? 'bold' : 'normal'}`,
              fill,
              align: textNode.textAlign,
              verticalAlign: textNode.verticalAlign,
              lineHeight: textNode.lineHeight,
              letterSpacing: textNode.letterSpacing,
              padding: textNode.padding,
              rotation: textNode.rotation,
              opacity: textNode.opacity,
            });
            layer.add(text);
            break;
          }
          case 'shape': {
            const shapeNode = node as any;
            if (shapeNode.shapeType === 'rectangle') {
              const rect = new Konva.Rect({
                x: shapeNode.x, y: shapeNode.y,
                width: shapeNode.width, height: shapeNode.height,
                fill,
                cornerRadius: shapeNode.cornerRadius,
                stroke: shapeNode.stroke?.color,
                strokeWidth: shapeNode.stroke?.width ?? 0,
                rotation: shapeNode.rotation,
                opacity: shapeNode.opacity,
              });
              layer.add(rect);
            } else if (shapeNode.shapeType === 'circle') {
              const ellipse = new Konva.Ellipse({
                x: shapeNode.x + shapeNode.width / 2,
                y: shapeNode.y + shapeNode.height / 2,
                radiusX: shapeNode.width / 2,
                radiusY: shapeNode.height / 2,
                fill,
                stroke: shapeNode.stroke?.color,
                strokeWidth: shapeNode.stroke?.width ?? 0,
                rotation: shapeNode.rotation,
                opacity: shapeNode.opacity,
              });
              layer.add(ellipse);
            } else if (shapeNode.shapeType === 'star') {
              const star = new Konva.Star({
                x: shapeNode.x + shapeNode.width / 2,
                y: shapeNode.y + shapeNode.height / 2,
                numPoints: shapeNode.sides ?? 5,
                innerRadius: (Math.min(shapeNode.width, shapeNode.height) / 2) * (shapeNode.innerRadius ?? 0.4),
                outerRadius: Math.min(shapeNode.width, shapeNode.height) / 2,
                fill,
                stroke: shapeNode.stroke?.color,
                strokeWidth: shapeNode.stroke?.width ?? 0,
                rotation: shapeNode.rotation,
                opacity: shapeNode.opacity,
              });
              layer.add(star);
            } else if (shapeNode.shapeType === 'triangle') {
              const tri = new Konva.RegularPolygon({
                x: shapeNode.x + shapeNode.width / 2,
                y: shapeNode.y + shapeNode.height / 2,
                sides: 3,
                radius: Math.min(shapeNode.width, shapeNode.height) / 2,
                fill,
                stroke: shapeNode.stroke?.color,
                strokeWidth: shapeNode.stroke?.width ?? 0,
                rotation: shapeNode.rotation,
                opacity: shapeNode.opacity,
              });
              layer.add(tri);
            } else {
              // Fallback rectangle for polygon, arrow, etc.
              const rect = new Konva.Rect({
                x: shapeNode.x, y: shapeNode.y,
                width: shapeNode.width, height: shapeNode.height,
                fill,
                rotation: shapeNode.rotation,
                opacity: shapeNode.opacity,
              });
              layer.add(rect);
            }
            break;
          }
          case 'image': {
            const imgNode = node as any;
            // Load actual image asynchronously
            const loadPromise = new Promise<void>((resolve) => {
              const htmlImg = new Image();
              htmlImg.crossOrigin = 'anonymous';
              htmlImg.onload = () => {
                const konvaImg = new Konva.Image({
                  x: imgNode.x,
                  y: imgNode.y,
                  width: imgNode.width,
                  height: imgNode.height,
                  image: htmlImg,
                  cornerRadius: imgNode.cornerRadius,
                  stroke: imgNode.stroke?.color,
                  strokeWidth: imgNode.stroke?.width ?? 0,
                  rotation: imgNode.rotation,
                  opacity: imgNode.opacity,
                });
                layer.add(konvaImg);
                resolve();
              };
              htmlImg.onerror = () => {
                // Fallback: draw a placeholder rect if image fails to load
                const placeholder = new Konva.Rect({
                  x: imgNode.x, y: imgNode.y,
                  width: imgNode.width, height: imgNode.height,
                  fill: '#E8E8E8',
                  cornerRadius: imgNode.cornerRadius,
                  stroke: '#CCCCCC',
                  strokeWidth: 1,
                  rotation: imgNode.rotation,
                  opacity: imgNode.opacity,
                });
                layer.add(placeholder);
                resolve();
              };
              htmlImg.src = imgNode.src;
            });
            imageLoadPromises.push(loadPromise);
            break;
          }
        }
      }

      // Wait for all images to load before rendering
      await Promise.all(imageLoadPromises);

      layer.draw();

      // Export as PNG blob
      return new Promise<Blob>((resolve, reject) => {
        try {
          const dataURL = offStage.toDataURL({
            pixelRatio,
            quality,
            mimeType: 'image/png',
          });
          // Convert data URL to blob
          fetch(dataURL)
            .then((res) => res.blob())
            .then((blob) => {
              offStage.destroy();
              resolve(blob);
            })
            .catch(reject);
        } catch (err) {
          offStage.destroy();
          reject(err);
        }
      });
    },
    [store]
  );

  const load = useCallback(
    (doc: CanvasDocument) => {
      store.setState({
        nodes: doc.nodes,
        nodeOrder: doc.nodeOrder,
        pages: doc.pages,
        activePageId: doc.pages[0]?.id ?? '',
        guides: doc.guides ?? [],
        selectedIds: [],
      });
      store.getState().clearHistory();
      requestAnimationFrame(() => {
        store.getState().zoomToFit();
      });
    },
    [store]
  );

  const use = useCallback(
    (plugin: CanvasPlugin) => {
      pluginManager.use(plugin);
    },
    [pluginManager]
  );

  return {
    addText,
    addImage,
    addShape,
    addLine,
    deleteSelected,
    duplicateSelected,
    group,
    ungroup,
    undo,
    redo,
    toJSON,
    exportPNG,
    load,
    use,
    eventBus,
    store,
  };
}
