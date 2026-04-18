// ---------------------------------------------------------------------------
// @cascoder/playground — Page Panel
// Bottom strip showing page thumbnails with add/duplicate/delete controls.
// ---------------------------------------------------------------------------

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useEditorStore } from '@cascoder/canvas-react';
import type { Page } from '@cascoder/canvas-core';

export function PagePanel() {
  const pages = useEditorStore((s) => s.pages);
  const activePageId = useEditorStore((s) => s.activePageId);
  const setActivePage = useEditorStore((s) => s.setActivePage);
  const addPage = useEditorStore((s) => s.addPage);
  const duplicatePage = useEditorStore((s) => s.duplicatePage);
  const deletePage = useEditorStore((s) => s.deletePage);
  const nodes = useEditorStore((s) => s.nodes);
  const nodeOrder = useEditorStore((s) => s.nodeOrder);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredPage, setHoveredPage] = useState<string | null>(null);
  const [renamingPage, setRenamingPage] = useState<string | null>(null);

  const handleAddPage = useCallback(() => {
    addPage();
    // Scroll to end after adding
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      }
    });
  }, [addPage]);

  const handleDeletePage = useCallback((pageId: string) => {
    if (pages.length <= 1) return; // Don't delete last page
    deletePage(pageId);
  }, [pages.length, deletePage]);

  return (
    <div
      style={{
        background: 'var(--color-bg-secondary, #16162a)',
        borderTop: '1px solid var(--color-border, #2a2a4a)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Page label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--color-text-muted, #6B6B8A)',
          whiteSpace: 'nowrap',
        }}
      >
        Pages
      </span>

      {/* Scrollable page strip */}
      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: 8,
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          padding: '2px 0',
        }}
        className="page-strip-scroll"
      >
        {pages.map((page, index) => (
          <PageThumbnail
            key={page.id}
            page={page}
            index={index}
            isActive={page.id === activePageId}
            isHovered={page.id === hoveredPage}
            nodeCount={(nodeOrder[page.id] || []).length}
            canDelete={pages.length > 1}
            onClick={() => setActivePage(page.id)}
            onDuplicate={() => duplicatePage(page.id)}
            onDelete={() => handleDeletePage(page.id)}
            onMouseEnter={() => setHoveredPage(page.id)}
            onMouseLeave={() => setHoveredPage(null)}
          />
        ))}
      </div>

      {/* Add page button */}
      <button
        onClick={handleAddPage}
        title="Add Page"
        style={{
          width: 36,
          height: 52,
          borderRadius: 8,
          border: '2px dashed var(--color-border, #2a2a4a)',
          background: 'transparent',
          color: 'var(--color-text-muted, #6B6B8A)',
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent, #6C5CE7)';
          e.currentTarget.style.color = 'var(--color-accent, #6C5CE7)';
          e.currentTarget.style.background = 'rgba(108, 92, 231, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border, #2a2a4a)';
          e.currentTarget.style.color = 'var(--color-text-muted, #6B6B8A)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        +
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page Thumbnail Card
// ---------------------------------------------------------------------------

interface PageThumbnailProps {
  page: Page;
  index: number;
  isActive: boolean;
  isHovered: boolean;
  nodeCount: number;
  canDelete: boolean;
  onClick: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function PageThumbnail({
  page,
  index,
  isActive,
  isHovered,
  nodeCount,
  canDelete,
  onClick,
  onDuplicate,
  onDelete,
  onMouseEnter,
  onMouseLeave,
}: PageThumbnailProps) {
  const bgColor = page.background.fill.type === 'solid'
    ? (page.background.fill.color ?? '#FFFFFF')
    : '#FFFFFF';

  const aspectRatio = page.width / page.height;
  const thumbHeight = 48;
  const thumbWidth = thumbHeight * aspectRatio;

  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {/* Thumbnail card */}
      <div
        style={{
          width: Math.max(thumbWidth, 36),
          height: thumbHeight,
          borderRadius: 6,
          background: bgColor,
          border: isActive
            ? '2px solid var(--color-accent, #6C5CE7)'
            : '1px solid var(--color-border, #2a2a4a)',
          boxShadow: isActive
            ? '0 0 0 3px rgba(108, 92, 231, 0.2), 0 2px 8px rgba(0,0,0,0.2)'
            : isHovered
            ? '0 2px 8px rgba(0,0,0,0.2)'
            : '0 1px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.15s ease',
          position: 'relative',
          overflow: 'hidden',
          transform: isHovered && !isActive ? 'translateY(-2px)' : 'none',
        }}
      >
        {/* Mini node count indicator */}
        {nodeCount > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              fontSize: 8,
              padding: '1px 4px',
              borderRadius: 3,
              background: 'rgba(0,0,0,0.5)',
              color: '#fff',
              fontWeight: 600,
            }}
          >
            {nodeCount}
          </div>
        )}
      </div>

      {/* Page number */}
      <span
        style={{
          fontSize: 9,
          fontWeight: isActive ? 700 : 500,
          color: isActive
            ? 'var(--color-accent, #6C5CE7)'
            : 'var(--color-text-muted, #6B6B8A)',
          transition: 'color 0.15s',
        }}
      >
        {index + 1}
      </span>

      {/* Hover actions */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            top: -4,
            right: -6,
            display: 'flex',
            gap: 2,
          }}
        >
          <MiniButton
            icon="📋"
            title="Duplicate page"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
          />
          {canDelete && (
            <MiniButton
              icon="✕"
              title="Delete page"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              danger
            />
          )}
        </div>
      )}
    </div>
  );
}

function MiniButton({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: string;
  title: string;
  onClick: (e: React.MouseEvent) => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: 'none',
        background: danger
          ? 'var(--color-danger, #E17055)'
          : 'var(--color-bg-elevated, #2a2a4a)',
        color: '#fff',
        fontSize: 8,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        padding: 0,
      }}
    >
      {icon}
    </button>
  );
}
