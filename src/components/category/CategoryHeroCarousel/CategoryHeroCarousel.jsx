import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { getProducts } from '../../../data';

export default function CategoryHeroCarousel({ categories = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const safeCategories = categories && categories.length > 0 ? categories : [];
  const currentCategory = safeCategories[currentIdx] || null;

  // Top product preview (if any)
  const topProduct = useMemo(() => {
    if (!currentCategory) return null;
    const catSlug = currentCategory.slug || currentCategory._id;
    const prods = getProducts({ category: catSlug });
    return prods && prods.length > 0 ? prods[0] : null;
  }, [currentCategory]);

  const handleNext = () => {
    if (safeCategories.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIdx((prev) => (prev + 1) % safeCategories.length);
    setTimeout(() => setIsTransitioning(false), 250);
  };

  const handlePrev = () => {
    if (safeCategories.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIdx((prev) => (prev - 1 + safeCategories.length) % safeCategories.length);
    setTimeout(() => setIsTransitioning(false), 250);
  };

  // Auto-play interval: smooth 3.5s with pause on hover for calm, premium interaction
  useEffect(() => {
    if (isPaused || safeCategories.length <= 1) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, 3500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, safeCategories.length, currentIdx]);

  return (
    <div
      className="category-hero-wrapper"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        width: '100%',
        height: 'clamp(520px, 78vh, 720px)',
        minHeight: '520px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1.05fr)',
        gap: 'clamp(1rem, 2vw, 1.75rem)',
        alignItems: 'stretch',
      }}
    >
      {/* ── 1. Master Editorial Showcase Card (Glamics High-Fashion Editorial) ── */}
      <div
        className="hero-static-card"
        style={{
          background: 'linear-gradient(135deg, #f8f6fd 0%, #f1ecfa 45%, #e7def7 100%)',
          borderRadius: '32px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          padding: 'clamp(2rem, 4vw, 3.8rem) clamp(2rem, 4vw, 3.8rem)',
          boxShadow: '0 20px 50px -12px rgba(124, 58, 237, 0.12)',
          border: '1px solid rgba(216, 180, 254, 0.55)',
        }}
      >
        {/* Left Column Typography & Actions */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: '520px',
          }}
        >
          {/* Subtle Tag Pill */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              color: '#7c3aed',
              fontSize: 'clamp(0.75rem, 0.95vw, 0.86rem)',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '0.35rem 0.9rem',
              borderRadius: '9999px',
              marginBottom: '1.25rem',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Sparkles size={14} className="hero-sparkle-spin" />
            <span>Summer Editorial 2026</span>
          </div>

          {/* Big Bold Editorial Headline */}
          <h1
            style={{
              fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)',
              fontWeight: 900,
              color: '#181126',
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              margin: '0 0 1.25rem',
            }}
          >
            Casual &amp; Stylish <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              for All Seasons
            </span>
          </h1>

          {/* Price Callout & Feature Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2.25rem',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'baseline',
                gap: '0.5rem',
                background: '#ffffff',
                padding: '0.45rem 1.1rem',
                borderRadius: '9999px',
                border: '1px solid #e9d5ff',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)',
              }}
            >
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Starting From</span>
              <span
                style={{
                  color: '#7c3aed',
                  fontSize: 'clamp(1.4rem, 2vw, 1.85rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                }}
              >
                ₹129
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '0.45rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid rgba(221, 214, 254, 0.7)',
                color: '#6b21a8',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <span>🔥 100% Quality Inspected</span>
            </div>
          </div>

          {/* Shop Now High-Fashion Capsule CTA */}
          <Link
            to="/products"
            className="glamics-hero-cta-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.95rem 2.4rem',
              borderRadius: '9999px',
              background: '#181126',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.92rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(24, 17, 38, 0.25)',
              transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span>SHOP NOW</span>
            <ArrowUpRight size={19} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Clean Studio Model Image Seamlessly Blended */}
        <div
          className="hero-model-bg"
          style={{
            position: 'absolute',
            right: '-2%',
            bottom: 0,
            top: 0,
            width: '62%',
            pointerEvents: 'none',
            overflow: 'hidden',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 18%, black 42%)',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 18%, black 42%)',
          }}
        >
          <img
            src="/images/glamics_yellow_model.jpg"
            alt="Casual and stylish fashion collection"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 12%',
              display: 'block',
            }}
          />
        </div>

        {/* Vertical Arrow Navigation Pill on the Right Border */}
        {safeCategories.length > 1 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '9999px',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.18)',
              display: 'flex',
              flexDirection: 'column',
              padding: '0.4rem 0.25rem',
              border: '1.5px solid rgba(216, 180, 254, 0.8)',
            }}
          >
            <button
              onClick={handlePrev}
              aria-label="Previous Category"
              title="Previous Category"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: '#7c3aed',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="carousel-arrow-btn"
            >
              <ChevronUp size={19} strokeWidth={2.5} />
            </button>

            <div style={{ height: '1px', background: '#ede9fe', margin: '3px 4px' }} />

            <button
              onClick={handleNext}
              aria-label="Next Category"
              title="Next Category"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
                color: '#7c3aed',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="carousel-arrow-btn"
            >
              <ChevronDown size={19} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* ── 2. Category Carousel Card (Right - Curated Department Showcase) ── */}
      {currentCategory && (
        <div
          className="hero-category-carousel-card"
          style={{
            background: '#1a0f2e',
            borderRadius: '32px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 20px 50px -12px rgba(124, 58, 237, 0.2)',
            border: '1px solid rgba(215, 215, 222, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {/* Category Background Photo */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              background: '#24143f',
            }}
          >
            <img
              key={currentCategory.slug || currentCategory._id}
              src={
                currentCategory.slug === 'womens-fashion'
                  ? '/images/glamics_summer_model.jpg'
                  : currentCategory.image || '/images/glamics_summer_model.jpg'
              }
              alt={currentCategory.name}
              className={`category-carousel-img ${isTransitioning ? 'fade-out' : 'fade-in'}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 12%',
                display: 'block',
                transition: 'transform 0.5s ease, opacity 0.25s ease',
              }}
            />

            {/* Radiant Top & Bottom Gradient Scrim for Flawless Readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(16, 8, 30, 0.55) 0%, rgba(16, 8, 30, 0.1) 35%, rgba(12, 5, 24, 0.92) 85%, rgba(12, 5, 24, 0.98) 100%)',
              }}
            />
          </div>

          {/* Top Status Header */}
          <div
            style={{
              position: 'relative',
              zIndex: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'clamp(1.2rem, 2.5vw, 1.75rem) clamp(1.2rem, 2.5vw, 1.75rem) 0',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                fontSize: '0.76rem',
                fontWeight: 800,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                letterSpacing: '0.06em',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <span>{String(currentIdx + 1).padStart(2, '0')}</span>
              <span style={{ opacity: 0.6 }}>/</span>
              <span>{String(safeCategories.length).padStart(2, '0')}</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span>DEPARTMENT</span>
            </div>

            {currentCategory.badge && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #c026d3 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                }}
              >
                {currentCategory.badge}
              </span>
            )}
          </div>

          {/* Bottom Floating Information: Department Name, Subtext & Explore CTA */}
          <div
            style={{
              marginTop: 'auto',
              position: 'relative',
              zIndex: 4,
              padding: 'clamp(1.25rem, 2.5vw, 1.85rem)',
              color: '#ffffff',
            }}
          >
            {/* Category Title */}
            <h2
              style={{
                fontSize: 'clamp(1.8rem, 2.8vw, 2.5rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 0.5rem',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.6)',
              }}
            >
              {currentCategory.name}
            </h2>

            {/* Subtext description */}
            {currentCategory.subtext && (
              <p
                style={{
                  fontSize: '0.86rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: '0 0 1.25rem',
                  lineHeight: 1.45,
                  textShadow: '0 1px 6px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {currentCategory.subtext}
              </p>
            )}

            {/* Explore Department CTA Button */}
            <Link
              to={`/categories/${currentCategory.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.9rem 1.5rem',
                borderRadius: '9999px',
                background: '#ffffff',
                color: '#6b21a8',
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="category-card-cta"
            >
              <span>EXPLORE {currentCategory.name.toUpperCase()}</span>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f5f0ff 0%, #e9ddfd 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed',
                }}
              >
                <ArrowUpRight size={17} strokeWidth={2.6} />
              </div>
            </Link>

            {/* Interactive Dots / Progress Tracker with Purple Gradient Glow */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '1.25rem',
              }}
            >
              {safeCategories.map((cat, idx) => (
                <button
                  key={cat._id || cat.slug || idx}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentIdx(idx);
                    setTimeout(() => setIsTransitioning(false), 250);
                  }}
                  style={{
                    height: '5px',
                    width: currentIdx === idx ? '28px' : '6px',
                    borderRadius: '9999px',
                    background:
                      currentIdx === idx
                        ? 'linear-gradient(90deg, #a855f7 0%, #d8b4fe 100%)'
                        : 'rgba(255, 255, 255, 0.35)',
                    boxShadow: currentIdx === idx ? '0 0 10px rgba(168, 85, 247, 0.9)' : 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  aria-label={`Go to category ${idx + 1}`}
                  title={cat.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Embedded Component Styles */}
      <style>{`
        .glamics-hero-cta-btn:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%) !important;
          color: #ffffff !important;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 14px 32px rgba(124, 58, 237, 0.45) !important;
        }
        .carousel-arrow-btn:hover {
          background: #f5f3ff !important;
          color: #7c3aed !important;
          transform: scale(1.14);
        }
        .category-carousel-img.fade-in {
          opacity: 1;
          transform: scale(1);
        }
        .category-carousel-img.fade-out {
          opacity: 0.8;
          transform: scale(1.04);
        }
        .hero-category-carousel-card:hover .category-carousel-img {
          transform: scale(1.06);
        }
        .hero-category-carousel-card:hover .category-card-cta,
        .category-card-cta:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 12px 30px rgba(124, 58, 237, 0.55) !important;
        }
        .category-card-cta:hover div {
          background: #ffffff !important;
          color: #7c3aed !important;
        }
        .hero-sparkle-spin {
          animation: sparkleGlow 2.5s ease-in-out infinite;
        }
        @keyframes sparkleGlow {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15) rotate(15deg); }
        }
        @media (max-width: 1024px) {
          .category-hero-wrapper {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }
          .hero-static-card {
            min-height: 480px !important;
          }
          .hero-category-carousel-card {
            min-height: 480px !important;
          }
          .hero-model-bg {
            opacity: 0.35 !important;
            width: 75% !important;
          }
        }
      `}</style>
    </div>
  );
}
