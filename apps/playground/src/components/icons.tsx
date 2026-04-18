// ---------------------------------------------------------------------------
// Inline SVG icons to avoid external dependencies in the playground.
// Using simple functional components.
// ---------------------------------------------------------------------------

import React from 'react';

const iconStyle: React.CSSProperties = { width: '1em', height: '1em', strokeWidth: 2, stroke: 'currentColor', fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as any;

export function FiChevronLeft() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><polyline points="15 18 9 12 15 6" /></svg>;
}

export function FiUndo() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>;
}

export function FiRedo() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>;
}

export function FiDownload() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}

export function FiShare2() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>;
}

export function FiMousePointer() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /><path d="M13 13l6 6" /></svg>;
}

export function FiType() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>;
}

export function FiSquare() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>;
}

export function FiCircle() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><circle cx="12" cy="12" r="10" /></svg>;
}

export function FiTriangle() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>;
}

export function FiStar() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

export function FiImage() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
}

export function FiHand() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M18 11V6a2 2 0 0 0-4 0v1" /><path d="M14 10V4a2 2 0 0 0-4 0v2" /><path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" /></svg>;
}

export function FiMinus() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

export function FiPlus() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}

export function FiMaximize() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>;
}

export function FiLayers() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
}

export function FiSlash() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><line x1="5" y1="4" x2="19" y2="20" /></svg>;
}

export function FiHexagon() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
}

export function FiArrowRight() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
}

export function FiTrash() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
}

export function FiCopy() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
}

export function FiLock() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
}

export function FiUnlock() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>;
}

export function FiEye() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
}

export function FiEyeOff() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>;
}

export function FiGrid() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
}

export function FiUpload() {
  return <svg viewBox="0 0 24 24" style={iconStyle}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
}
