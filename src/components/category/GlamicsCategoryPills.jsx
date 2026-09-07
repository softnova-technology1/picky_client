import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function GlamicsCategoryPills({ categories = [], activeFilter = 'all', onSelectFilter }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="glamics-pills-section" style={{ marginBottom: '3.5rem' }}>
      {/* 2-Row Responsive Pill Grid matching Glamics Template */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {categories.map((cat) => {
          const isActive = activeFilter === cat.slug;
          return (
            <div
              key={cat._id || cat.slug}
              onClick={() => onSelectFilter && onSelectFilter(cat.slug)}
              className="glamics-category-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.65rem 0.55rem 0.8rem',
                borderRadius: '9999px',
                background: isActive
                  ? 'linear-gradient(135deg, #f3e8ff 0%, #faf5ff 100%)'
                  : '#ffffff',
                border: isActive
                  ? '1.5px solid #a855f7'
                  : '1px solid rgba(226, 232, 240, 0.9)',
                boxShadow: isActive
                  ? '0 8px 24px rgba(124, 58, 237, 0.12)'
                  : '0 4px 14px rgba(0, 0, 0, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Left Circular Thumbnail Photo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1.5px solid #ede9fe',
                    background: '#f8fafc',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </div>

                {/* Category Name & Short Item Count */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      color: isActive ? '#6b21a8' : '#1e1b4b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>
                    {cat.itemCount || 30}+ Products
                  </div>
                </div>
              </div>

              {/* Right Circular Navigation Chevron Button */}
              <Link
                to={`/categories/${cat.slug}`}
                onClick={(e) => e.stopPropagation()}
                className="glamics-pill-arrow-btn"
                title={`Explore ${cat.name}`}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: isActive ? '#7c3aed' : '#f5f3ff',
                  color: isActive ? '#ffffff' : '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)',
                }}
              >
                <ChevronRight size={17} strokeWidth={2.4} />
              </Link>
            </div>
          );
        })}
      </div>

      <style>{`
        .glamics-category-pill:hover {
          transform: translateY(-2px);
          border-color: #c084fc !important;
          box-shadow: 0 10px 24px rgba(124, 58, 237, 0.1) !important;
          background: #faf5ff !important;
        }
        .glamics-category-pill:hover .glamics-pill-arrow-btn {
          background: #7c3aed !important;
          color: #ffffff !important;
          transform: scale(1.08);
        }
      `}</style>
    </div>
  );
}
