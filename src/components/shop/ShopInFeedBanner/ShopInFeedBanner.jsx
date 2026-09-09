import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Flame, Sparkles } from 'lucide-react';

export default function ShopInFeedBanner({ variant = 'bazaar', onFilterClick }) {
  if (variant === 'bazaar') {
    return (
      <div
        className="shop-infeed-banner"
        style={{
          gridColumn: '1 / -1',
          margin: '1.5rem 0',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%)',
          color: '#ffffff',
          position: 'relative',
          padding: '2.25rem clamp(1.5rem, 4vw, 3.25rem)',
          boxShadow: '0 16px 36px -10px rgba(5, 150, 105, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        {/* Subtle decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(110, 231, 183, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '620px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              marginBottom: '0.65rem',
              color: '#a7f3d0',
            }}
          >
            <Flame size={13} strokeWidth={2.8} /> DAILY VALUE BAZAAR
          </div>

          <h3
            style={{
              fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
              fontWeight: 900,
              margin: '0 0 0.45rem',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Looking for Great Value? Explore Under ₹499
          </h3>

          <p
            style={{
              fontSize: '0.92rem',
              color: 'rgba(255, 255, 255, 0.88)',
              margin: 0,
              lineHeight: 1.45,
            }}
          >
            Multi-blade vegetable choppers, cotton graphic tees, authentic snacks & everyday accessories with zero compromise on quality.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <button
            type="button"
            onClick={() => onFilterClick && onFilterClick('499')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#ffffff',
              color: '#065f46',
              padding: '0.75rem 1.6rem',
              borderRadius: '9999px',
              fontSize: '0.92rem',
              fontWeight: 900,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
            className="infeed-action-btn"
          >
            <span>Filter Under ₹499</span>
            <ArrowUpRight size={17} strokeWidth={2.8} />
          </button>
        </div>
      </div>
    );
  }

  // Heritage Luxe variant
  return (
    <div
      className="shop-infeed-banner"
      style={{
        gridColumn: '1 / -1',
        margin: '1.5rem 0',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #4a044e 0%, #701a75 50%, #86198f 100%)',
        color: '#ffffff',
        position: 'relative',
        padding: '2.25rem clamp(1.5rem, 4vw, 3.25rem)',
        boxShadow: '0 16px 36px -10px rgba(134, 25, 143, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}
    >
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '620px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            marginBottom: '0.65rem',
            color: '#f5d0fe',
          }}
        >
          <Sparkles size={13} strokeWidth={2.8} /> TAMIL HERITAGE SPECIAL
        </div>

        <h3
          style={{
            fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
            fontWeight: 900,
            margin: '0 0 0.45rem',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          Pure Madurai Handloom Silks & Temple Crafts
        </h3>

        <p
          style={{
            fontSize: '0.92rem',
            color: 'rgba(255, 255, 255, 0.88)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          Direct from certified master weavers of Tamil Nadu — Sungudi sarees, solid brass lamps & gold foil art.
        </p>
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <Link
          to="/categories/traditional-tamil-products"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#ffffff',
            color: '#701a75',
            padding: '0.75rem 1.6rem',
            borderRadius: '9999px',
            fontSize: '0.92rem',
            fontWeight: 900,
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
          }}
          className="infeed-action-btn"
        >
          <span>Explore Heritage Store</span>
          <ArrowUpRight size={17} strokeWidth={2.8} />
        </Link>
      </div>
    </div>
  );
}
