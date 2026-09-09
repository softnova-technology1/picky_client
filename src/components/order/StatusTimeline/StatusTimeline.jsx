import React from 'react';
import { formatDate } from '../../../utils/formatDate';

export default function StatusTimeline({ statusHistory = [] }) {
  if (!statusHistory || statusHistory.length === 0) return null;

  // Show newest on top
  const sorted = [...statusHistory].reverse();

  return (
    <div style={{ marginTop: '2rem' }}>
      <h4 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: '#1e293b' }}>Shipment Updates</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e2e8f0' }}>
        {sorted.map((item, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            {/* Dot */}
            <span
              style={{
                position: 'absolute',
                left: '-1.85rem',
                top: '0.2rem',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: idx === 0 ? 'var(--color-primary)' : '#94a3b8',
                boxShadow: idx === 0 ? '0 0 0 4px rgba(124, 58, 237, 0.2)' : 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.92rem', textTransform: 'capitalize', color: '#0f172a' }}>
                {item.status === 'confirmed' ? 'Order Placed & Confirmed' : item.status === 'shipped' ? 'Package Dispatched' : item.status}
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                {formatDate(item.timestamp)}
              </span>
            </div>
            {item.note && <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.2rem 0 0' }}>{item.note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
