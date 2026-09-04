import React, { useState } from 'react';

export default function Gallery({ images = [] }) {
  const defaultImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Main Large Image */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'white',
          border: '1px solid var(--color-border)',
          aspectRatio: '1 / 1',
        }}
      >
        <img
          src={defaultImages[selectedIdx]}
          alt="Product view"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Thumbnails */}
      {defaultImages.length > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {defaultImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              style={{
                width: 70,
                height: 70,
                borderRadius: '8px',
                overflow: 'hidden',
                border: selectedIdx === i ? '2.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                opacity: selectedIdx === i ? 1 : 0.65,
                transition: 'var(--transition)',
                flexShrink: 0,
              }}
            >
              <img src={img} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
