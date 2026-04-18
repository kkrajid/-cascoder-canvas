// ---------------------------------------------------------------------------
// @cascoder/canvas-react — Error Boundary for Node Rendering
// Catches render errors in individual nodes to prevent full canvas crashes.
// ---------------------------------------------------------------------------

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  nodeId: string;
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary that wraps individual node renderers.
 * If one node crashes (e.g., bad image URL, invalid shape path),
 * the error is contained and the rest of the canvas continues to render.
 */
export class NodeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      `[CanvasEditor] Node "${this.props.nodeId}" crashed:`,
      error,
      errorInfo.componentStack
    );
  }

  render() {
    if (this.state.hasError) {
      // Return nothing — the node silently disappears. This is better than
      // crashing the entire canvas, which would lose all user work.
      return this.props.fallback ?? null;
    }

    return this.props.children;
  }
}
