import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryCard({ category }) {
  if (!category) return null;
  const imageSrc = category.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600';

  return (
    <Link
      to={`/categories/${category.slug}`}
      style={{
        position: 'relative',
        borderRadius: '26px',
        overflow: 'hidden',
        aspectRatio: '4 / 3.4',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.4rem',
        textDecoration: 'none',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        background: '#180d2c',
      }}
      className="glamics-category-card"
    >
      {/* Background Image with Zoom Effect */}
      <img
        src={imageSrc}
        alt={category.name}
        loading="lazy"
        className="glamics-cat-img"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 25%',
          zIndex: 1,
          transition: 'transform 0.55s ease',
        }}
      />

      {/* Multi-layer Dark Violet Gradient Overlay for Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(24, 13, 44, 0.35) 0%, rgba(24, 13, 44, 0.15) 30%, rgba(24, 13, 44, 0.6) 60%, rgba(18, 8, 36, 0.96) 100%)',
          zIndex: 2,
        }}
      />

      {/* Top Header Row: Starting Price Pill & Discount / Popular Badge */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span
          style={{
            background: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(10px)',
            color: '#18181b',
            fontSize: '0.74rem',
            fontWeight: 800,
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>{category.icon || '✨'}</span>
          <span>From ₹129</span>
        </span>

        <span
          style={{
            background: category.badge
              ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
              : 'rgba(15, 23, 42, 0.85)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          {category.badge || `${category.itemCount || 30}+ Items`}
        </span>
      </div>

      {/* Bottom Content: Title, Subtext & Glamics Arrow Link */}
      <div style={{ position: 'relative', zIndex: 3, color: '#ffffff' }}>
        <h3
          style={{
            color: '#ffffff',
            fontSize: '1.32rem',
            fontWeight: 900,
            margin: '0 0 0.35rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          {category.name}
        </h3>

        {category.subtext && (
          <p
            style={{
              color: '#cbd5e1',
              fontSize: '0.82rem',
              margin: '0 0 0.85rem',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 500,
            }}
          >
            {category.subtext}
          </p>
        )}

        <div
          className="glamics-cat-cta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#c4b5fd',
            fontSize: '0.84rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            transition: 'all 0.2s ease',
          }}
        >
          <span>Explore Collection</span>
          <ArrowUpRight size={16} strokeWidth={2.4} />
        </div>
      </div>

      <style>{`
        .glamics-category-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.22) !important;
          border-color: rgba(192, 132, 252, 0.6) !important;
        }
        .glamics-category-card:hover .glamics-cat-img {
          transform: scale(1.08);
        }
        .glamics-category-card:hover .glamics-cat-cta {
          color: #ffffff !important;
          gap: 0.65rem;
        }
      `}</style>
    </Link>
  );
}

