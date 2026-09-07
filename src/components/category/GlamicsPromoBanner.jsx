import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';

export default function GlamicsPromoBanner() {
  return (
    <div
      className="glamics-promo-banner"
      style={{
        position: 'relative',
        borderRadius: '32px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #581c87 0%, #7c3aed 45%, #9333ea 80%, #a855f7 100%)',
        color: '#ffffff',
        padding: 'clamp(2rem, 4vw, 3.5rem) clamp(1.75rem, 4vw, 3.5rem)',
        boxShadow: '0 20px 50px rgba(124, 58, 237, 0.28)',
        marginBottom: '4.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '2rem',
      }}
    >
      {/* Background Decorative Rings */}
      <div
        style={{
          position: 'absolute',
          top: '-40%',
          right: '15%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '20%',
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
        {/* Accent Tag Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 255, 255, 0.18)',
            backdropFilter: 'blur(10px)',
            color: '#fdf4ff',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            marginBottom: '1.25rem',
            border: '1px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          <Sparkles size={14} />
          <span>Trending Departments</span>
        </div>

        {/* Big Bold Headline */}
        <h2
          style={{
            fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            margin: '0 0 1.25rem',
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}
        >
          Get Up to 40% Discount On Traditional Crafts & Fashion!
        </h2>

        {/* Value Proposition Checkmarks */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(0.75rem, 1.5vw, 1.5rem)',
            flexWrap: 'wrap',
            marginBottom: '1.75rem',
          }}
        >
          {[
            '100% Quality Inspected',
            '24-48h Express Dispatch',
            '7-Day Easy Replacement',
            'COD Available',
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#f3e8ff',
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 900,
                }}
              >
                ✓
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Action Button & Graphic */}
      <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <Link
          to="/products"
          className="glamics-promo-cta-btn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            background: '#ffffff',
            color: '#6b21a8',
            fontSize: '0.92rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '1rem 2.25rem',
            borderRadius: '9999px',
            textDecoration: 'none',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <span>CHECK OFFERS</span>
          <ArrowUpRight size={19} strokeWidth={2.4} />
        </Link>
      </div>

      <style>{`
        .glamics-promo-cta-btn:hover {
          transform: translateY(-3px) scale(1.03);
          background: #faf5ff !important;
          color: #581c87 !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35) !important;
        }
      `}</style>
    </div>
  );
}
