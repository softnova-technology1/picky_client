import React, { useState } from 'react';

export default function Gallery({ images = [] }) {
  const defaultImages =
    images && images.length > 0
      ? images
      : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'];
  const [selectedIdx, setSelectedIdx] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Main Large Image Container */}
      <div
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          background: '#f8fafc',
          border: '1.5px solid #e2e8f0',
          aspectRatio: '1 / 1',
          position: 'relative',
          boxShadow: '0 8px 24px rgba(124, 58, 237, 0.06)',
        }}
        className="main-gallery-frame"
      >
        <img
          src={defaultImages[selectedIdx] || defaultImages[0]}
          alt="Product view"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          className="main-gallery-img"
        />
      </div>

      {/* Thumbnails */}
      {defaultImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {defaultImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedIdx(i)}
              style={{
                width: 74,
                height: 74,
                borderRadius: '12px',
                overflow: 'hidden',
                padding: 0,
                border:
                  selectedIdx === i
                    ? '2.5px solid #7c3aed'
                    : '1.5px solid #e2e8f0',
                background: '#ffffff',
                boxShadow:
                  selectedIdx === i
                    ? '0 4px 14px rgba(124, 58, 237, 0.25)'
                    : 'none',
                opacity: selectedIdx === i ? 1 : 0.65,
                transform: selectedIdx === i ? 'scale(1.04)' : 'scale(1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              <img
                src={img}
                alt={`Thumb ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}

      <style>{`
        .main-gallery-frame:hover .main-gallery-img {
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
}

