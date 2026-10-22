import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { heroSlides } from '../../../data/data';
import { usePageCustomization } from '../../../store/customizationStore';

export default function EditorialHero({ settings: propSettings }) {
  const { getSection } = usePageCustomization('home');
  const customSettings = propSettings || getSection('hero_banner')?.settings || {};

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const slides = useMemo(() => {
    // 1. If customSettings.slides array is configured by admin
    if (Array.isArray(customSettings.slides) && customSettings.slides.length > 0) {
      const active = customSettings.slides
        .filter((s) => s.enabled !== false)
        .map((s, idx) => {
          const fallback = heroSlides[idx] || heroSlides[0] || {};
          return {
            id: s.id || `slide_${idx + 1}`,
            enabled: s.enabled !== false,
            eyebrow: s.eyebrow ?? fallback.eyebrow ?? 'NEW ARRIVALS',
            title: s.title ?? fallback.title ?? 'LUXE',
            subtitle: s.subtitle ?? fallback.subtitle ?? 'NEW DROP',
            ctaText: s.ctaText ?? fallback.ctaText ?? 'SHOP NOW',
            ctaLink: s.ctaLink ?? fallback.ctaLink ?? '/products',
            leftImage: s.leftImage || fallback.leftImage || '/images/slide_1_left.jpg',
            rightImage: s.rightImage || fallback.rightImage || '/images/slide_1_right.jpg',
          };
        });
      if (active.length > 0) return active;
    }

    // 2. Fallback to default heroSlides + legacy single-slide overrides
    const base = (heroSlides || []).map((s) => ({ ...s }));
    if (base.length > 0 && (customSettings.headline || customSettings.imageUrl || customSettings.badge || customSettings.ctaText)) {
      base[0] = {
        ...base[0],
        ...(customSettings.badge ? { eyebrow: customSettings.badge } : {}),
        ...(customSettings.headline ? { title: customSettings.headline } : {}),
        ...(customSettings.subheadline
          ? {
              subtitle:
                customSettings.subheadline.length > 38
                  ? customSettings.subheadline.slice(0, 38) + '...'
                  : customSettings.subheadline,
            }
          : {}),
        ...(customSettings.ctaText ? { ctaText: customSettings.ctaText } : {}),
        ...(customSettings.ctaLink ? { ctaLink: customSettings.ctaLink } : {}),
        ...(customSettings.imageUrl
          ? { leftImage: customSettings.imageUrl, rightImage: customSettings.imageUrl }
          : {}),
      };
    }
    return base;
  }, [customSettings]);

  const totalSlides = slides.length;
  const autoplaySpeed = Math.max(1500, Number(customSettings.autoplaySpeed) || 3200);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, autoplaySpeed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides, autoplaySpeed]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  if (totalSlides === 0) return null;

  return (
    <section
      className="picky-hero-banner-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(400px, 45vw, 580px)',
        backgroundColor: '#0f1117',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* ── Desktop View (> 768px) ── */}
      <div className="hero-desktop-wrapper">
        {/* ── Diagonal Split Collage Slides (Loaded from mock data) ── */}
        {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id || index}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              visibility: isActive ? 'visible' : 'hidden',
              transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.4s ease',
              pointerEvents: isActive ? 'auto' : 'none',
              zIndex: isActive ? 1 : 0,
            }}
          >
            {/* Left Diagonal Image Container (58% width framing for full model view) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '58%',
                height: '100%',
                clipPath: 'polygon(0 0, 100% 0, 72% 100%, 0 100%)',
                WebkitClipPath: 'polygon(0 0, 100% 0, 72% 100%, 0 100%)',
                overflow: 'hidden',
              }}
            >
              <img
                src={slide.leftImage}
                alt={`${slide.title} Left`}
                className={isActive ? 'active-zoom-bg' : ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                }}
              />
            </div>

            {/* Right Diagonal Image Container (58% width framing for full model view) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '42%',
                width: '58%',
                height: '100%',
                clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)',
                WebkitClipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)',
                overflow: 'hidden',
              }}
            >
              <img
                src={slide.rightImage}
                alt={`${slide.title} Right`}
                className={isActive ? 'active-zoom-bg' : ''}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                }}
              />
            </div>

            {/* Subtle Overlay Shadow */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.06) 0%, transparent 60%)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          </div>
        );
      })}

      {/* ── Center Frosted Glass Card ── */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        if (!isActive) return null;
        return (
          <div
            key={`card_${slide.id}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 5,
              width: 'clamp(280px, 32vw, 360px)',
              padding: '2.2rem 2.2rem 2rem',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.14), 0 4px 14px rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              animation: 'centerCardPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.14em',
                color: '#777777',
                textTransform: 'uppercase',
                marginBottom: '0.4rem',
              }}
            >
              {slide.eyebrow}
            </span>

            <h2
              style={{
                fontSize: 'clamp(2rem, 3.2vw, 2.6rem)',
                fontWeight: 900,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#111111',
                textTransform: 'uppercase',
                margin: '0 0 0.15rem 0',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {slide.title}
            </h2>

            <h3
              style={{
                fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
                fontWeight: 800,
                letterSpacing: '0.02em',
                color: '#111111',
                textTransform: 'uppercase',
                margin: '0 0 1.1rem 0',
              }}
            >
              {slide.subtitle}
            </h3>

            {/* Divider bar */}
            <div
              style={{
                width: '36px',
                height: '2.5px',
                backgroundColor: '#111111',
                margin: '0 auto 1.3rem',
                borderRadius: '2px',
              }}
            />

            {/* CTA Button */}
            <button
              onClick={() => navigate(slide.ctaLink || '/products')}
              className="carousel-cta-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid #111111',
                paddingBottom: '3px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: '#111111',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              <span>{slide.ctaText || 'SHOP NOW'}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}

      {/* ── Left Circular Navigation Arrow ── */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="carousel-arrow-btn arrow-btn-left no-hover-fx"
        style={{
          position: 'absolute',
          left: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          color: '#111111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.25s ease',
        }}
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>

      {/* ── Right Circular Navigation Arrow ── */}
      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="carousel-arrow-btn arrow-btn-right no-hover-fx"
        style={{
          position: 'absolute',
          right: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          color: '#111111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.25s ease',
        }}
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>

      {/* ── Bottom Pagination Dots ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '22px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          gap: '9px',
          alignItems: 'center',
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: currentSlide === idx ? '10px' : '8px',
              height: currentSlide === idx ? '10px' : '8px',
              borderRadius: '50%',
              background: currentSlide === idx ? '#111111' : 'rgba(0, 0, 0, 0.3)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.25s ease',
            }}
          />
        ))}
        </div>
      </div>

      {/* ── Mobile View (320px - 768px ONLY) ── */}
      <div className="hero-mobile-wrapper">
        <div className="hero-mobile-card">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={`mob_slide_${slide.id || idx}`}
                className={`hero-mobile-slide ${isActive ? 'active' : ''}`}
              >
                <img
                  src={slide.leftImage || slide.image}
                  alt={slide.title}
                  className="hero-mobile-img"
                />
                <div className="hero-mobile-overlay" />
              </div>
            );
          })}

          {/* Frosted Glass Overlay Card */}
          {slides[currentSlide] && (
            <div className="hero-mobile-frosted-card">
              <span className="hero-mobile-eyebrow">
                {slides[currentSlide].eyebrow || 'EXCLUSIVE 1 DAY DEALS'}
              </span>
              <h2 className="hero-mobile-title">
                {slides[currentSlide].title || 'BRAND'}{' '}
                <span className="hero-mobile-highlight">
                  {slides[currentSlide].subtitle || '50% OFF'}
                </span>
              </h2>
              <button
                type="button"
                className="hero-mobile-cta"
                onClick={() => navigate(slides[currentSlide].ctaLink || '/products')}
              >
                <span>{slides[currentSlide].ctaText || 'SHOP NOW'}</span>
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Desktop isolation */
        .hero-mobile-wrapper {
          display: none;
        }
        .hero-desktop-wrapper {
          display: block;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        /* Fast & Smooth Zoom In Effect for active slide background */
        .active-zoom-bg {
          animation: carouselZoomIn 3.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        @keyframes carouselZoomIn {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.08);
          }
        }

        @keyframes centerCardPop {
          0% {
            opacity: 0;
            transform: translate(-50%, -46%) scale(0.94);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .carousel-arrow-btn:hover {
          background: #111111 !important;
          color: #ffffff !important;
          transform: translateY(-50%) scale(1.08) !important;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25) !important;
        }

        .carousel-cta-btn:hover {
          color: #663399 !important;
          border-color: #663399 !important;
          gap: 0.65rem !important;
        }

        /* Mobile Responsive View (320px - 768px) */
        @media (max-width: 768px) {
          .hero-desktop-wrapper {
            display: none !important;
          }
          .picky-hero-banner-carousel {
            min-height: auto !important;
            background: transparent !important;
            padding: 0 !important;
          }
          .hero-mobile-wrapper {
            display: block !important;
            position: relative;
            width: 100%;
            padding: 12px 14px 16px;
            box-sizing: border-box;
          }
          .hero-mobile-card {
            position: relative;
            width: 100%;
            height: clamp(250px, 62vw, 320px);
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 8px 24px rgba(124, 58, 237, 0.12);
            background: #181432;
          }
          .hero-mobile-slide {
            position: absolute;
            inset: 0;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.4s ease, visibility 0.4s ease;
          }
          .hero-mobile-slide.active {
            opacity: 1;
            visibility: visible;
          }
          .hero-mobile-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center 20%;
          }
          .hero-mobile-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%);
          }
          .hero-mobile-frosted-card {
            position: absolute;
            bottom: 12px;
            left: 14px;
            right: 14px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.7);
            padding: 12px 16px 14px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            z-index: 5;
          }
          .hero-mobile-eyebrow {
            font-size: 0.65rem;
            font-weight: 800;
            letter-spacing: 0.08em;
            color: #7c3aed;
            text-transform: uppercase;
          }
          .hero-mobile-title {
            font-size: 1.25rem;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin: 0;
            line-height: 1.15;
            text-transform: uppercase;
          }
          .hero-mobile-highlight {
            color: #7c3aed;
          }
          .hero-mobile-cta {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            color: #ffffff;
            border: none;
            border-radius: 9999px;
            padding: 8px 24px;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.04em;
            cursor: pointer;
            margin-top: 4px;
            box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
          }
          .hero-mobile-counter {
            position: absolute;
            bottom: 12px;
            right: 14px;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(4px);
            color: #ffffff;
            font-size: 0.62rem;
            font-weight: 800;
            padding: 2px 7px;
            border-radius: 6px;
            z-index: 6;
          }
        }
      `}</style>

    </section>
  );
}
