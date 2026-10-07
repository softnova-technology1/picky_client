import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { heroSlides } from '../../../data/data';

export default function EditorialHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const slides = heroSlides || [];
  const totalSlides = slides.length;

  useEffect(() => {
    if (isPaused || totalSlides === 0) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

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

      <style>{`
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
      `}</style>
    </section>
  );
}
