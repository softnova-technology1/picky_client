import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Curated high-resolution photographic images for all departments
const CATEGORY_IMAGES = {
  'fashion': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/womens-fashion.webp',
  'womens-fashion': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/womens-fashion.webp',
  'home-kitchen': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/home-kitchen.webp',
  'artificial-jewellery': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/artificial-jewellery.webp',
  'beauty-personal-care': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/beauty-personal-care.webp',
  'mobile-accessories': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/mobile-accessories.webp',
  'traditional-tamil-products': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/traditional-tamil-products.webp',
  'snacks-foods': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/snacks-foods.webp',
  'home-decor': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/home-decor.webp',
  'kids-products': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/kids-products.webp',
  'fitness-products': 'https://picky-media-bucket.s3.ap-south-1.amazonaws.com/picky/categories/fitness-products.webp',
};

export default function GlamicsCategoryPills({ categories = [] }) {
  if (!categories || categories.length === 0) return null;

  return (
    <div className="glamics-pills-section" style={{ marginBottom: '2.5rem' }}>
      {/* Balanced Responsive Pill Grid (3 columns on desktop) */}
      <div
        className="glamics-pills-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '1.25rem',
        }}
      >
        {categories.map((cat) => {
          const imgSrc = cat.image || CATEGORY_IMAGES[cat.slug] || null;

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
                  {imgSrc ? (
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
                    />
                  ) : (
                    <span style={{ fontSize: '1.25rem' }}>{cat.icon || '📦'}</span>
                  )}
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
