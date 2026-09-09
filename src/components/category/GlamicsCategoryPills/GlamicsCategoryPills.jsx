import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Curated high-resolution photographic images for the 6 departments
const CATEGORY_IMAGES = {
  'beauty-personal-care': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
  'traditional-tamil-products': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
  'snacks-foods': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
  'home-decor': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&auto=format&fit=crop&q=80',
  'kids-products': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&auto=format&fit=crop&q=80',
  'fitness-products': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
};

export default function GlamicsCategoryPills({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="glamics-pills-section" style={{ marginBottom: '2.5rem' }}>
      {/* 2-Row Balanced Responsive Pill Grid (3x2 on desktop) */}
      <div
        className="glamics-pills-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '1.25rem',
        }}
      >
        {categories.map((cat) => {
          const imgSrc = CATEGORY_IMAGES[cat.slug] || cat.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400';

          return (
            <Link
              key={cat._id || cat.slug}
              to={`/categories/${cat.slug}`}
              className="glamics-category-pill"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem 0.85rem 1.05rem',
                minHeight: '74px',
                borderRadius: '9999px',
                background: '#ffffff',
                border: '1.5px solid rgba(226, 232, 240, 0.9)',
                boxShadow: '0 3px 14px rgba(0, 0, 0, 0.03)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
              }}
            >
              {/* Left Real Photographic Thumbnail & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem', minWidth: 0 }}>
                {/* 6 Real HD Category Images */}
                <div
                  className="glamics-pill-img-box"
                  style={{
                    width: 46,
                    height: 46,
                    minWidth: 46,
                    minHeight: 46,
                    borderRadius: '13px',
                    overflow: 'hidden',
                    background: '#f1f5f9',
                    border: '1.5px solid rgba(226, 232, 240, 0.95)',
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.06)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className="glamics-cat-img"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400';
                    }}
                  />
                </div>

                {/* Category Name & Clean Product Count (Badges Removed) */}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#1e1b4b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '0.2rem',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    {cat.itemCount || 30}+ Products
                  </div>
                </div>
              </div>

              {/* Right Circular Navigation Chevron Button */}
              <div
                className="glamics-pill-arrow-btn"
                title={`Explore ${cat.name}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.22s ease',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)',
                }}
              >
                <ChevronRight size={17} strokeWidth={2.5} className="glamics-chevron-icon" />
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .glamics-category-pill:hover {
          transform: translateY(-3px);
          border-color: #c084fc !important;
          box-shadow: 0 14px 28px -4px rgba(124, 58, 237, 0.14), 0 0 0 1px #d8b4fe !important;
          background: #faf8ff !important;
        }
        .glamics-category-pill:hover .glamics-pill-img-box {
          transform: scale(1.06);
          border-color: #c084fc !important;
          box-shadow: 0 6px 16px rgba(124, 58, 237, 0.2) !important;
        }
        .glamics-category-pill:hover .glamics-cat-img {
          transform: scale(1.1);
        }
        .glamics-category-pill:hover .glamics-pill-arrow-btn {
          background: #7c3aed !important;
          color: #ffffff !important;
          transform: scale(1.06);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35) !important;
        }
        .glamics-category-pill:hover .glamics-chevron-icon {
          transform: translateX(2px);
        }
        .glamics-chevron-icon {
          transition: transform 0.2s ease;
        }
        @media (max-width: 1024px) {
          .glamics-pills-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          .glamics-pills-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
