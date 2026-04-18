// ---------------------------------------------------------------------------
// @cascoder/playground — Recovery Dialog
// Shows a modal when crash recovery data is found.
// ---------------------------------------------------------------------------

import React from 'react';

interface RecoveryDialogProps {
  onRestore: () => void;
  onDiscard: () => void;
}

export function RecoveryDialog({ onRestore, onDiscard }: RecoveryDialogProps) {
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
    >
      <div
        style={{
          background: 'var(--color-bg-surface, #22223a)',
          borderRadius: 16,
          border: '1px solid var(--color-border, #2a2a4a)',
          padding: 32,
          maxWidth: 420,
          width: '90%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(225, 112, 85, 0.2), rgba(253, 203, 110, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 28,
            marginBottom: 20,
          }}
        >
          🔄
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-text-primary, #EAEAF0)',
            marginBottom: 8,
          }}
        >
          Recover unsaved changes?
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--color-text-secondary, #A0A0BC)',
            marginBottom: 24,
          }}
        >
          We found an unsaved version of your design from a previous session. 
          Would you like to restore it or start fresh?
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onDiscard}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: '1px solid var(--color-border, #2a2a4a)',
              background: 'var(--color-bg-tertiary, #1e1e3a)',
              color: 'var(--color-text-secondary, #A0A0BC)',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-hover, #32325a)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary, #1e1e3a)';
            }}
          >
            Start Fresh
          </button>
          <button
            onClick={onRestore}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #6C5CE7, #A29BFE)',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 4px 16px rgba(108, 92, 231, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(108, 92, 231, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(108, 92, 231, 0.3)';
            }}
          >
            ✨ Restore
          </button>
        </div>
      </div>
    </div>
  );
}
