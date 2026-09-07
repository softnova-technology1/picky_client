import React from 'react';

export default function GlamicsMarqueeTicker() {
  const items = [
    'LIMITED TIME OFFER',
    'FREE EXPRESS DELIVERY ON ORDERS OVER ₹999',
    '100% QUALITY INSPECTED',
    'AUTHENTIC TAMIL TRADITIONAL CRAFTS',
    'COD AVAILABLE STOREWIDE',
    'USE CODE: PICKYFREE',
    'EASY 7-DAY REPLACEMENT',
  ];

  return (
    <div
      className="glamics-top-marquee-ticker"
      style={{
        width: '100%',
        background: 'linear-gradient(90deg, #7c3aed 0%, #9333ea 50%, #c084fc 100%)',
        color: '#ffffff',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        fontSize: '0.78rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        boxShadow: '0 2px 12px rgba(124, 58, 237, 0.25)',
        margin: 0,
        position: 'relative',
        zIndex: 1001,
      }}
    >
      <div className="glamics-marquee-track">
        {[...items, ...items, ...items].map((text, idx) => (
          <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 1.25rem' }}>
            <span>{text}</span>
            <span style={{ color: '#f5d0fe', margin: '0 0.8rem', fontSize: '0.65rem' }}>✦</span>
          </span>
        ))}
      </div>

      <style>{`
        .glamics-marquee-track {
          display: inline-block;
          animation: glamicsMarquee 35s linear infinite;
        }
        @keyframes glamicsMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
