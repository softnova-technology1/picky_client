import React, { useState } from 'react';

export default function AWBBox({ trackingId, courier }) {
  const [copied, setCopied] = useState(false);

  if (!trackingId) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="awb-box">
      <div>
        <span style={{ fontSize: '0.8rem', color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>
          Courier Partner: <strong style={{ color: 'white' }}>{courier || 'Express Delivery'}</strong>
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="awb-number">{trackingId}</span>
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'var(--transition)',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy AWB'}
          </button>
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: '#c7d2fe', maxWidth: '280px' }}>
        🚀 Track this package on the courier website using your AWB number. Updates are also sent live to your WhatsApp.
      </div>
    </div>
  );
}
