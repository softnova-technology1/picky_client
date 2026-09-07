import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { getProducts } from '../../data';

export default function CategoryHeroCarousel({ categories = [] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const safeCategories = categories && categories.length > 0 ? categories : [];
  const currentCategory = safeCategories[currentIdx] || null;

  // Grab the top-selling product in this active category for the innovative mini-preview
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

  // Auto-play interval: exactly 1 second (1000ms) gap as requested by user
  useEffect(() => {
    if (isPaused || safeCategories.length <= 1) return;
    timerRef.current = setInterval(() => {
      handleNext();
    }, 1000);

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
        height: 'calc(100vh - 175px)',
        minHeight: '520px',
        maxHeight: '740px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.15fr)',
        gap: 'clamp(1rem, 2vw, 1.5rem)',
        alignItems: 'stretch',
      }}
    >
      {/* ── 1. Master Showcase Card (Glamics High-Fashion Editorial) ── */}
      <div
        className="hero-static-card"
        style={{
          background: 'linear-gradient(135deg, #e4e4e4 0%, #dfdfdf 50%, #d8d8d8 100%)',
          borderRadius: '32px',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          padding: 'clamp(1.75rem, 4vw, 3.5rem) clamp(1.75rem, 4vw, 3.5rem)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(215, 215, 215, 0.9)',
        }}
      >
        {/* Left Typography & CTAs (Strictly constrained to left 48% column) */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            maxWidth: '450px',
          }}
        >
          {/* Subtitle (Glamics Clean Text Style) */}
          <div
            style={{
              color: '#7c3aed',
              fontSize: 'clamp(0.85rem, 1.1vw, 0.98rem)',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Perfect for Summer Evenings
          </div>

          {/* Big Bold Editorial Headline (Deep Ink Violet Contrast) */}
          <h1
            style={{
              fontSize: 'clamp(2.3rem, 4vw, 3.6rem)',
              fontWeight: 900,
              color: '#181126',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              margin: '0 0 1.25rem',
            }}
          >
            Casual and Stylish for All Seasons
          </h1>

          {/* Price Callout */}
          <div
            style={{
              fontSize: 'clamp(0.95rem, 1.2vw, 1.1rem)',
              color: '#52525b',
              fontWeight: 600,
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <span>Starting From</span>
            <span
              style={{
                color: '#7c3aed',
                fontSize: 'clamp(1.5rem, 2.2vw, 2rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
              }}
            >
              ₹129
            </span>
          </div>

          {/* Shop Now Glamics Minimalist Outline Pill Button */}
          <Link
            to="/products"
            className="glamics-outline-shop-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 2.25rem',
              borderRadius: '9999px',
              border: '2px solid #181126',
              background: 'transparent',
              color: '#181126',
              fontWeight: 800,
              fontSize: '0.9rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              transition: 'all 0.25s ease',
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
            right: 0,
            bottom: 0,
            top: 0,
            width: '68%',
            pointerEvents: 'none',
            overflow: 'hidden',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 15%, black 35%)',
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.85) 15%, black 35%)',
          }}
        >
          <img
            src="/images/glamics_yellow_model.jpg"
            alt="Casual and stylish fashion collection"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 10%',
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
              background: '#ffffff',
              borderRadius: '9999px',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.16)',
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

      {/* ── 2. Category Carousel Card (Right - Glamics Matching Bright Fashion Style) ── */}
      {currentCategory && (
        <div
          className="hero-category-carousel-card"
          style={{
            background: '#eef0f4',
            borderRadius: '32px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.06)',
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
              background: '#e8ebf0',
            }}
          >
            <img
              key={currentCategory.slug || currentCategory._id}
              src={currentCategory.slug === 'womens-fashion' ? '/images/glamics_summer_model.jpg' : (currentCategory.image || '/images/glamics_summer_model.jpg')}
              alt={currentCategory.name}
              className={`category-carousel-img ${isTransitioning ? 'fade-out' : 'fade-in'}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 10%',
                display: 'block',
                transition: 'transform 0.4s ease, opacity 0.25s ease',
              }}
            />

            {/* Deep Violet Gradient Scrim at Bottom for Clean Readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, transparent 0%, rgba(20, 10, 36, 0.15) 50%, rgba(15, 6, 28, 0.88) 100%)',
              }}
            />
          </div>

          {/* Bottom Floating Card: Clean Title & Explore CTA */}
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
                fontSize: 'clamp(1.7rem, 2.5vw, 2.3rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 1.35rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              {currentCategory.name}
            </h2>

            {/* Explore Department CTA Button */}
            <Link
              to={`/categories/${currentCategory.slug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.85rem 1.4rem',
                borderRadius: '9999px',
                background: '#ffffff',
                color: '#7c3aed',
                fontWeight: 800,
                fontSize: '0.88rem',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="category-card-cta"
            >
              <span>EXPLORE {currentCategory.name.toUpperCase()}</span>
              <ArrowUpRight size={18} strokeWidth={2.4} />
            </Link>

            {/* Interactive Dots / Progress Tracker with Purple Gradient Glow */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.35rem',
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
                    height: '4px',
                    width: currentIdx === idx ? '26px' : '6px',
                    borderRadius: '9999px',
                    background: currentIdx === idx ? 'linear-gradient(90deg, #a855f7 0%, #c084fc 100%)' : 'rgba(255, 255, 255, 0.28)',
                    boxShadow: currentIdx === idx ? '0 0 10px rgba(168, 85, 247, 0.8)' : 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                  aria-label={`Go to category ${idx + 1}`}
                  title={cat.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .hero-shop-pill-btn:hover,
        .glamics-outline-shop-btn:hover {
          background: #7c3aed !important;
          color: #ffffff !important;
          border-color: #7c3aed !important;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 30px rgba(124, 58, 237, 0.4) !important;
        }
        .carousel-arrow-btn:hover {
          background: #f5f3ff !important;
          color: #7c3aed !important;
          transform: scale(1.12);
        }
        .category-carousel-img.fade-in {
          opacity: 1;
          transform: scale(1);
        }
        .category-carousel-img.fade-out {
          opacity: 0.75;
          transform: scale(1.03);
        }
        .hero-category-carousel-card:hover .category-carousel-img {
          transform: scale(1.05);
        }
        .hero-category-carousel-card:hover .category-card-cta,
        .category-card-cta:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%) !important;
          color: #ffffff !important;
          box-shadow: 0 10px 30px rgba(124, 58, 237, 0.55) !important;
        }
        .carousel-top-product-pill:hover {
          background: rgba(124, 58, 237, 0.35) !important;
          border-color: rgba(216, 180, 254, 0.7) !important;
          transform: translateY(-1px);
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
            opacity: 0.4 !important;
            width: 75% !important;
          }
        }
      `}</style>
    </div>
  );
}

