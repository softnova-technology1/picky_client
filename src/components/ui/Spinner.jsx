import React from 'react';

export default function Spinner({ size = 32, color = 'var(--color-primary)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid ${color}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
