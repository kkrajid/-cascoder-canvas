// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Image Element
// Renders image nodes with lazy loading and filter support.
// ---------------------------------------------------------------------------

import React, { memo, useRef, useState, useEffect } from 'react';
import { Image as KonvaImage, Rect } from 'react-konva';
import Konva from 'konva';
import type { ImageNode } from '@cascoder/canvas-core';

// Global image cache
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

interface ImageElementProps {
  node: ImageNode;
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

function ImageElementInner({ node, ...props }: ImageElementProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef<Konva.Image>(null);

  useEffect(() => {
    setLoading(true);
    loadImage(node.src)
      .then((img) => {
        setImage(img);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [node.src]);

  // Apply filters when image loads or filter settings change
  useEffect(() => {
    if (!imageRef.current || !image) return;

    const konvaNode = imageRef.current;
    const filters: any[] = [];

    if (node.filters.brightness !== 0) {
      filters.push(Konva.Filters.Brighten);
      konvaNode.brightness(node.filters.brightness / 100);
    }
    if (node.filters.contrast !== 0) {
      filters.push(Konva.Filters.Contrast);
      konvaNode.contrast(node.filters.contrast);
    }
    if (node.filters.blur > 0) {
      filters.push(Konva.Filters.Blur);
      konvaNode.blurRadius(node.filters.blur);
    }
    if (node.filters.grayscale > 0) {
      filters.push(Konva.Filters.Grayscale);
    }
    if (node.filters.sepia > 0) {
      filters.push(Konva.Filters.Sepia);
    }

    konvaNode.filters(filters);
    if (filters.length > 0) {
      konvaNode.cache();
    }
  }, [image, node.filters]);

  const shadowProps = node.shadow
    ? {
        shadowColor: node.shadow.color,
        shadowBlur: node.shadow.blur,
        shadowOffsetX: node.shadow.offsetX,
        shadowOffsetY: node.shadow.offsetY,
        shadowEnabled: true,
      }
    : {};

  // Show placeholder while loading
  if (loading || !image) {
    return (
      <Rect
        {...props}
        width={node.width}
        height={node.height}
        fill="#E8E8E8"
        cornerRadius={node.cornerRadius}
        stroke="#D0D0D0"
        strokeWidth={1}
        dash={[4, 4]}
      />
    );
  }

  // Calculate crop from normalized rect
  const cropX = node.cropRect.x * image.naturalWidth;
  const cropY = node.cropRect.y * image.naturalHeight;
  const cropWidth = node.cropRect.width * image.naturalWidth;
  const cropHeight = node.cropRect.height * image.naturalHeight;

  return (
    <KonvaImage
      ref={imageRef}
      {...props}
      image={image}
      width={node.width}
      height={node.height}
      crop={{ x: cropX, y: cropY, width: cropWidth, height: cropHeight }}
      cornerRadius={node.cornerRadius}
      stroke={node.stroke?.color}
      strokeWidth={node.stroke?.width ?? 0}
      {...shadowProps}
    />
  );
}

export const ImageElement = memo(ImageElementInner);
