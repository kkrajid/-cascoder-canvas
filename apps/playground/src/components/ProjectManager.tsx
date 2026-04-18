// ---------------------------------------------------------------------------
// @cascoder/playground — Project Manager Dialog
// Save, load, and manage local projects stored in IndexedDB.
// ---------------------------------------------------------------------------

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, useEditorStore } from '@cascoder/canvas-react';
import type { ProjectMeta, IndexedDBAdapter } from '@cascoder/canvas-core';

interface ProjectManagerProps {
  storage: IndexedDBAdapter;
  onClose: () => void;
  onLoad: (data: unknown) => void;
  currentProjectId: string;
}

export function ProjectManager({ storage, onClose, onLoad, currentProjectId }: ProjectManagerProps) {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const list = await storage.list();
      setProjects(list);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
    setLoading(false);
  };

  const handleLoad = async (id: string) => {
    try {
      const data = await storage.load(id);
      if (data) {
        onLoad(data);
        onClose();
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await storage.delete(id);
      setProjects((p) => p.filter((proj) => proj.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
    setDeletingId(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-fadeIn"
        style={{
          background: 'var(--color-bg-surface, #22223a)',
          borderRadius: 16,
          border: '1px solid var(--color-border, #2a2a4a)',
          width: 520,
          maxWidth: '90vw',
          maxHeight: '80vh',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--color-border, #2a2a4a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary, #EAEAF0)', marginBottom: 4 }}>
              📁 My Designs
            </h2>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted, #6B6B8A)' }}>
              {projects.length} project{projects.length !== 1 ? 's' : ''} saved locally
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: 'none',
              background: 'var(--color-bg-tertiary, #1e1e3a)',
              color: 'var(--color-text-secondary, #A0A0BC)',
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Project list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
          }}
        >
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted, #6B6B8A)' }}>
              Loading...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🎨</div>
              <p style={{ color: 'var(--color-text-muted, #6B6B8A)', fontSize: 13 }}>
                No saved projects yet
              </p>
              <p style={{ color: 'var(--color-text-muted, #6B6B8A)', fontSize: 11, marginTop: 4 }}>
                Your designs will be saved automatically
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                  border: project.id === currentProjectId
                    ? '1px solid var(--color-accent, #6C5CE7)'
                    : '1px solid transparent',
                  background: project.id === currentProjectId
                    ? 'rgba(108, 92, 231, 0.08)'
                    : 'transparent',
                  marginBottom: 4,
                }}
                onClick={() => handleLoad(project.id)}
                onMouseEnter={(e) => {
                  if (project.id !== currentProjectId) {
                    e.currentTarget.style.background = 'var(--color-bg-hover, #32325a)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (project.id !== currentProjectId) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: '#FFFFFF',
                    flexShrink: 0,
                    border: '1px solid var(--color-border, #2a2a4a)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                  }}
                >
                  🎨
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--color-text-primary, #EAEAF0)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {project.name || 'Untitled Design'}
                    {project.id === currentProjectId && (
                      <span style={{ fontSize: 10, color: 'var(--color-accent, #6C5CE7)', marginLeft: 6 }}>
                        (current)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted, #6B6B8A)', marginTop: 2 }}>
                    {project.preset} · {project.pageCount} page{project.pageCount !== 1 ? 's' : ''} · {project.nodeCount} element{project.nodeCount !== 1 ? 's' : ''} · {formatDate(project.updatedAt)}
                  </div>
                </div>

                {/* Delete button */}
                {project.id !== currentProjectId && (
                  <button
                    title="Delete project"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    disabled={deletingId === project.id}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-text-muted, #6B6B8A)',
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                      opacity: deletingId === project.id ? 0.3 : 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-danger, #E17055)';
                      e.currentTarget.style.background = 'rgba(225, 112, 85, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--color-text-muted, #6B6B8A)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
