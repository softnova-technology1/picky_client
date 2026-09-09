import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides } from '../../../data';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Truck,
  ShieldCheck,
  Zap,
  Tag,
  Gift,
  Package,
  Sparkles,
} from 'lucide-react';

const BADGE_ICON_MAP = {
  '🚚': Truck,
  '🛡️': ShieldCheck,
  '⚡': Zap,
  '🏷️': Tag,
  '🎁': Gift,
  '📦': Package,
  '✨': Sparkles,
};

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = heroSlides || [];

  // Auto-play interval
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  return (
    <section
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: 'clamp(460px, 62vw, 680px)',
        backgroundColor: '#0a0d18',
        overflow: 'hidden',
        color: 'white',
      }}
    >
      {/* ── Slide Images & Overlays ── */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id || index}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'scale(1)' : 'scale(1.04)',
              transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              pointerEvents: isActive ? 'auto' : 'none',
              zIndex: isActive ? 1 : 0,
            }}
          >
            {/* Background High-Res Image */}
            <img
              src={slide.image}
              alt={slide.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
              }}
            />

            {/* Subtle Gradient Shadow for text readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(90deg, rgba(10, 13, 24, 0.65) 0%, rgba(10, 13, 24, 0.2) 45%, rgba(10, 13, 24, 0.05) 100%)',
                zIndex: 2,
              }}
            />

            {/* Content Overlay */}
            <div
              className="container"
              style={{
                position: 'relative',
                zIndex: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingBottom: 'clamp(3.5rem, 7vw, 5.5rem)',
                paddingTop: '3rem',
              }}
            >
              <div style={{ maxWidth: '640px' }}>
                {/* Main CTA Purple Button */}
                <div style={{ marginBottom: 'clamp(1.5rem, 3.5vw, 2.5rem)' }}>
                  <Link
                    to={slide.ctaLink || '/products'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 50%, #6d28d9 100%)',
                      color: '#ffffff',
                      fontSize: 'clamp(1.05rem, 1.6vw, 1.25rem)',
                      fontWeight: 800,
                      padding: 'clamp(0.85rem, 1.5vw, 1.1rem) clamp(1.8rem, 3vw, 2.6rem)',
                      borderRadius: '9999px',
                      textDecoration: 'none',
                      boxShadow: '0 8px 25px rgba(124, 58, 237, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.5)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      letterSpacing: '0.01em',
                    }}
                    className="hero-cta-btn"
                  >
                    <span>{slide.ctaText || 'Shop Crackers'}</span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#2e1065',
                        color: '#f3e8ff',
                        marginLeft: '0.2rem',
                      }}
                    >
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                </div>

                {/* 3 Value Proposition Badges matching Mockup */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'clamp(1rem, 2.5vw, 2rem)',
                    flexWrap: 'wrap',
                  }}
                >
                  {slide.badges?.map((badge, bIdx) => {
                    const IconComponent = BADGE_ICON_MAP[badge.icon] || Sparkles;
                    return (
                      <div
                        key={bIdx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          color: 'white',
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.15)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                          }}
                        >
                          <IconComponent size={18} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.92rem', display: 'block', lineHeight: 1.2, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                            {badge.title}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: '#e2e8f0', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                            {badge.subtitle}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ── Prev / Next Navigation Arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            style={{
              position: 'absolute',
              top: '50%',
              left: '20px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(30, 16, 53, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(192, 132, 252, 0.35)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="carousel-nav-btn"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            style={{
              position: 'absolute',
              top: '50%',
              right: '20px',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'rgba(30, 16, 53, 0.65)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(192, 132, 252, 0.35)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            className="carousel-nav-btn"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* ── Slide Indicator Dots ── */}
      {slides.length > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'clamp(2.5rem, 5vw, 4rem)',
            right: 'clamp(1.5rem, 4vw, 3.5rem)',
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: currentSlide === idx ? '28px' : '9px',
                height: '9px',
                borderRadius: '9999px',
                background: currentSlide === idx ? '#c084fc' : 'rgba(255, 255, 255, 0.45)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Smooth Bottom Wavy Curve Divider ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          overflow: 'hidden',
          lineHeight: 0,
          zIndex: 4,
          pointerEvents: 'none',
        }}
      >
        <svg
          viewBox="0 0 1440 64"
          preserveAspectRatio="none"
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            height: 'clamp(24px, 4.5vw, 52px)',
          }}
        >
          <path
            fill="#faf5ff"
            d="M0,0 C320,60 1120,60 1440,0 L1440,64 L0,64 Z"
          />
        </svg>
      </div>

      <style>{`
        .hero-cta-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 32px rgba(124, 58, 237, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.8) !important;
        }
        .carousel-nav-btn:hover {
          background: rgba(124, 58, 237, 0.85) !important;
          color: #ffffff !important;
          border-color: #c084fc !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
      `}</style>
    </section>
  );
}
