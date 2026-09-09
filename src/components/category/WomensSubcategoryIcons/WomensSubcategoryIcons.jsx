import React, { useState } from 'react';

export default function WomensSubcategoryIcons({ onSelectSubcategory }) {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    {
      id: 'all',
      name: 'All',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
    {
      id: 'sarees',
      name: 'Sarees',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v18M6 7l8-4v18L6 17M14 3l4 2v14l-4 2" />
        </svg>
      ),
    },
    {
      id: 'kurtis',
      name: 'Kurtis',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v2l3 1v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9l3-1v-2a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        </svg>
      ),
    },
    {
      id: 'dresses',
      name: 'Dresses',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l2 4-2 3 4 11H5l4-11-2-3 2-4z" />
        </svg>
      ),
    },
    {
      id: 'denim',
      name: 'Denim',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16l-2 16-6-2-6 2L4 4zM12 4v14" />
        </svg>
      ),
    },
    {
      id: 'jackets',
      name: 'Jackets',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7l3-3 6 4 6-4 3 3v13H3V7zM12 8v12" />
        </svg>
      ),
    },
    {
      id: 'jewellery',
      name: 'Jewellery',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
        </svg>
      ),
    },
    {
      id: 'shoes',
      name: 'Shoes',
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l4-9h4l2 5 6 1v3H4v-3z" />
          <circle cx="8" cy="18" r="1" />
        </svg>
      ),
    },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    if (onSelectSubcategory) {
      onSelectSubcategory(id);
    }
  };

  return (
    <div className="womens-subcat-section" style={{ marginBottom: '3.5rem' }}>
      {/* ── Category Header (Glamics style with diamond ornament) ── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h3
          style={{
            fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
            fontWeight: 900,
            color: '#1e1b4b',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}
        >
          Category
        </h3>

        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
          <span style={{ color: '#7c3aed', fontSize: '0.72rem' }}>✦ ❖ ✦</span>
          <div style={{ width: '40px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
        </div>
      </div>

      {/* ── Silhouette Icons Horizontal Strip ── */}
      <div
        className="womens-subcat-strip"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(1rem, 2.5vw, 2.5rem)',
          flexWrap: 'wrap',
        }}
      >
        {categories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleSelect(cat.id)}
              className={`womens-subcat-item ${isActive ? 'active' : ''}`}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.5rem 0.65rem',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Circular Icon Container */}
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: isActive ? 'linear-gradient(135deg, #ede9fe 0%, #ddd0fa 100%)' : '#ffffff',
                  border: isActive ? '2px solid #7c3aed' : '1.5px solid rgba(216, 180, 254, 0.45)',
                  color: isActive ? '#7c3aed' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isActive
                    ? '0 6px 18px rgba(124, 58, 237, 0.22)'
                    : '0 4px 12px rgba(0, 0, 0, 0.04)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="subcat-circle"
              >
                {cat.iconSvg}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#7c3aed' : '#475569',
                  letterSpacing: '0.01em',
                  transition: 'color 0.2s ease',
                }}
              >
                {cat.name}
              </span>

              {/* Bottom Active Red/Purple Indicator (Glamics signature) */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-4px',
                    width: '24px',
                    height: '2.5px',
                    borderRadius: '2px',
                    background: '#7c3aed',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      <style>{`
        .womens-subcat-item:hover .subcat-circle {
          transform: translateY(-3px) scale(1.05);
          border-color: #a855f7;
          color: #7c3aed;
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.16);
        }
        .womens-subcat-item:hover span {
          color: #7c3aed;
        }
      `}</style>
    </div>
  );
}
