import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '../../data';
import { ArrowRight } from 'lucide-react';

const BUTTON_COLORS = {
  sparklers: '#7c3aed',
  fountains: '#6d28d9',
  'aerial-shots': '#581c87',
  'combo-packs': '#9333ea',
  'ground-spinners': '#4c1d95',
  'novelty-items': '#86198f',
};

export default function FestiveCategoryRow() {
  const categoryList = categories || [];

  return (
    <section
      className="festive-category-section"
      style={{
        background: 'linear-gradient(180deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)',
        padding: '1rem 0 3.5rem',
        position: 'relative',
      }}
    >
      <div className="container">
        {/* Category Row Container */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'clamp(0.85rem, 1.6vw, 1.35rem)',
            alignItems: 'stretch',
          }}
        >
          {categoryList.map((cat) => {
            const btnColor = BUTTON_COLORS[cat.slug] || '#7c3aed';

            return (
              <Link
                key={cat._id || cat.slug}
                to={`/categories/${cat.slug}`}
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '24px',
                  background: 'white',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.08), 0 2px 6px rgba(0,0,0,0.04)',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(192, 132, 252, 0.35)',
                }}
                className="festive-cat-card"
              >
                {/* Slanted / Rounded Image Container */}
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '4 / 3.4',
                    overflow: 'hidden',
                    background: '#1e1035',
                  }}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.4s ease',
                    }}
                    className="festive-cat-img"
                  />
                  {/* Subtle Inner Glow Overlay */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(180deg, transparent 50%, rgba(30, 16, 53, 0.4) 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                </div>

                {/* Bottom Pill Label & Action Button */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    marginTop: 'auto',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 'clamp(0.85rem, 1vw, 0.95rem)',
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {cat.name}
                  </span>

                  {/* Circular Arrow Button */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      minWidth: '28px',
                      borderRadius: '50%',
                      background: btnColor,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                      transition: 'transform 0.2s ease, background-color 0.2s ease',
                    }}
                    className="festive-arrow-btn"
                  >
                    <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .festive-cat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px rgba(124, 58, 237, 0.18), 0 4px 12px rgba(0,0,0,0.06) !important;
          border-color: rgba(147, 51, 234, 0.6) !important;
        }
        .festive-cat-card:hover .festive-cat-img {
          transform: scale(1.08);
        }
        .festive-cat-card:hover .festive-arrow-btn {
          transform: translateX(2px) scale(1.1);
        }
      `}</style>
    </section>
  );
}
