import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ChevronRight, Sparkles, Star, ShieldCheck, Truck, Lock, CheckCircle2 } from 'lucide-react';

const EDITORIAL_SLIDES = [
  {
    id: 'slide_1',
    eyebrow: 'NEW COLLECTION 2026',
    titleLine1: 'Made to',
    titleAccent: 'Belong.',
    subtitle: 'Discover thoughtfully selected products that bring timeless character and contemporary style into everyday life.',
    primaryCtaText: 'SHOP COLLECTION',
    primaryCtaLink: '/categories/womens-fashion',
    secondaryCtaText: 'EXPLORE PRODUCTS',
    secondaryCtaLink: '/categories',
    giantText: 'BELONG',
    productImage: '/images/products/saree.png',
    secondaryCutoutImage: '/images/products/gold_ring.png',
    secondaryCutoutLabel: '22K Gold Accent',
    productAlt: 'Pure Cotton Handloom Madurai Sungudi Saree',
    cardLabel: 'FEATURED PICK',
    cardTitle: 'Handcrafted Sungudi Saree',
    cardPrice: '₹1,299',
    cardOriginalPrice: '₹1,899',
    cardRating: 4.8,
    cardReviews: 168,
    cardBadge: '100% PURE COTTON',
    cardLink: '/products/pure-cotton-handloom-madurai-sungudi-saree',
    tags: ['Handcrafted', 'Madurai Zari', '100% Combed Cotton'],
  },
  {
    id: 'slide_2',
    eyebrow: 'TIMELESS DETAILS 2026',
    titleLine1: 'Crafted With',
    titleAccent: 'Character.',
    subtitle: 'Artisanal craftsmanship designed to elevate your living spaces with understated luxury and warm ambient light.',
    primaryCtaText: 'SHOP COLLECTION',
    primaryCtaLink: '/categories/home-decor',
    secondaryCtaText: 'EXPLORE PRODUCTS',
    secondaryCtaLink: '/categories',
    giantText: 'CRAFTED',
    productImage: '/images/products/speaker.png',
    secondaryCutoutImage: '/images/products/sunglasses.png',
    secondaryCutoutLabel: 'UV400 Polarized',
    productAlt: 'BoomPulse 360 Portable Wireless Speaker & Lamp',
    cardLabel: 'CURATOR CHOICE',
    cardTitle: 'Ambient Speaker & Lamp',
    cardPrice: '₹1,399',
    cardOriginalPrice: '₹1,999',
    cardRating: 4.9,
    cardReviews: 210,
    cardBadge: '360° SPATIAL SOUND',
    cardLink: '/products/boompulse-360-portable-wireless-bluetooth-speaker',
    tags: ['Solid Pine Wood', 'Warm 3000K LED', 'Bluetooth 5.3'],
  },
  {
    id: 'slide_3',
    eyebrow: 'EVERYDAY ELEGANCE 2026',
    titleLine1: 'Designed for',
    titleAccent: 'Today.',
    subtitle: 'Exquisite heritage jewellery and handcrafted accessories designed for timeless distinction in every moment.',
    primaryCtaText: 'SHOP COLLECTION',
    primaryCtaLink: '/categories/artificial-jewellery',
    secondaryCtaText: 'EXPLORE PRODUCTS',
    secondaryCtaLink: '/categories',
    giantText: 'ELEGANCE',
    productImage: '/images/products/necklace.png',
    secondaryCutoutImage: '/images/products/jhumkas.png',
    secondaryCutoutLabel: 'Matching Jhumkas',
    productAlt: 'Antique Matte Gold Temple Choker Necklace Set',
    cardLabel: 'HERITAGE EDITION',
    cardTitle: 'Temple Choker Set',
    cardPrice: '₹1,299',
    cardOriginalPrice: '₹2,499',
    cardRating: 4.9,
    cardReviews: 220,
    cardBadge: '24K MICRO GOLD',
    cardLink: '/product/antique-matte-gold-temple-choker-necklace-set',
    tags: ['Matte Gold Polish', 'Kemp Stones', 'Festive Bridal'],
  },
];

// ── Subtle Tamil Heritage SVG Line Art Motifs (3-5% Opacity) ──
const TamilKolamMotif = () => (
  <svg
    className="editorial-tamil-motif motif-kolam"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M100 20 C110 50, 150 50, 150 100 C150 150, 110 150, 100 180 C90 150, 50 150, 50 100 C50 50, 90 50, 100 20 Z"
      stroke="#663399"
      strokeWidth="1.2"
      strokeDasharray="4 2"
    />
    <path
      d="M20 100 C50 110, 50 150, 100 150 C150 150, 150 110, 180 100 C150 90, 150 50, 100 50 C50 50, 50 90, 20 100 Z"
      stroke="#663399"
      strokeWidth="1.2"
    />
    <circle cx="100" cy="100" r="30" stroke="#663399" strokeWidth="1" />
    <circle cx="100" cy="100" r="10" stroke="#663399" strokeWidth="1.5" />
    <circle cx="100" cy="50" r="4" fill="#663399" />
    <circle cx="100" cy="150" r="4" fill="#663399" />
    <circle cx="50" cy="100" r="4" fill="#663399" />
    <circle cx="150" cy="100" r="4" fill="#663399" />
  </svg>
);

const TempleArchMotif = () => (
  <svg
    className="editorial-tamil-motif motif-temple"
    viewBox="0 0 240 240"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M120 15 L145 45 H95 L120 15 Z" stroke="#663399" strokeWidth="1.2" />
    <path d="M85 45 H155 V75 H85 Z" stroke="#663399" strokeWidth="1.2" />
    <path d="M70 75 H170 V115 H70 Z" stroke="#663399" strokeWidth="1.2" />
    <path d="M55 115 H185 V165 H55 Z" stroke="#663399" strokeWidth="1.2" />
    <path d="M40 165 H200 V225 H40 Z" stroke="#663399" strokeWidth="1.2" />
    <path d="M100 225 C100 190, 140 190, 140 225" stroke="#663399" strokeWidth="1.5" />
    <line x1="120" y1="45" x2="120" y2="225" stroke="#663399" strokeWidth="0.8" strokeDasharray="3 3" />
  </svg>
);

const FloralTamilMotif = () => (
  <svg
    className="editorial-tamil-motif motif-floral"
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M90 10 C100 45, 135 45, 170 90 C135 135, 100 135, 90 170 C80 135, 45 135, 10 90 C45 45, 80 45, 90 10 Z" stroke="#663399" strokeWidth="1" />
    <circle cx="90" cy="90" r="22" stroke="#663399" strokeWidth="1" />
    <path d="M90 35 L90 145 M35 90 L145 90" stroke="#663399" strokeWidth="0.8" strokeDasharray="2 2" />
  </svg>
);

export default function EditorialHero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const totalSlides = EDITORIAL_SLIDES.length;

  // Mouse Parallax Effect (Desktop)
  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    setParallaxOffset({
      x: Math.max(-1, Math.min(1, normX)),
      y: Math.max(-1, Math.min(1, normY)),
    });
  };

  const handleMouseLeave = () => {
    setParallaxOffset({ x: 0, y: 0 });
    setIsPaused(false);
  };

  const SLIDE_DURATION = 5000;

  // Auto-play Timer (5s continuous cycle)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSlide, totalSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  return (
    <section
      ref={containerRef}
      className="editorial-hero-section"
      onMouseMove={handleMouseMove}
      aria-label="Editorial Hero Section"
    >
      {/* ── Slide Timer Progress Line (Directly Below Navbar Border) ── */}
      <div className="editorial-hero-timer-bar">
        <div
          key={currentSlide}
          className="editorial-hero-timer-progress"
          style={{ animationDuration: `${SLIDE_DURATION}ms` }}
        />
      </div>

      {/* ── Single Premium Editorial Background Image ── */}
      <div className="editorial-hero-single-bg">
        <img src="/images/hero-bg.png" alt="" className="editorial-hero-single-bg-img" />
        <div className="editorial-hero-single-bg-overlay" />
      </div>

      {/* ── Subtle Tamil Motifs in Background (3-5% Opacity) ── */}
      <TamilKolamMotif />
      <TempleArchMotif />
      <FloralTamilMotif />

      {/* ── Background Ambient Glow & Pulsing Aura Ring ── */}
      <div
        className="editorial-hero-bg-glow"
        style={{
          transform: `translate3d(${parallaxOffset.x * 4}px, ${parallaxOffset.y * 4}px, 0)`,
        }}
      />
      <div className="editorial-hero-aura-ring" />
      <div className="editorial-hero-bg-mesh" />

      {/* ── Main Composition Container ── */}
      <div className="editorial-hero-container">
        
        {/* Left Editorial Content Column */}
        <div className="editorial-hero-content-col">
          {EDITORIAL_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                className={`editorial-hero-slide-text ${isActive ? 'active' : ''}`}
                aria-hidden={!isActive}
              >
                <div className="editorial-eyebrow">
                  <span className="editorial-eyebrow-dot" />
                  <span>{slide.eyebrow}</span>
                </div>

                <h1 className="editorial-hero-title">
                  <span className="title-line-1">{slide.titleLine1}</span>
                  <span className="editorial-purple-accent">{slide.titleAccent}</span>
                </h1>

                <p className="editorial-hero-desc">{slide.subtitle}</p>

                {/* Micro Feature Tags */}
                <div className="editorial-hero-tags">
                  {slide.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="hero-tag-pill">
                      <ShieldCheck size={12} className="tag-icon" /> {tag}
                    </span>
                  ))}
                </div>

                {/* Primary & Secondary Action CTAs */}
                <div className="editorial-hero-cta-group">
                  <button
                    className="editorial-btn-primary"
                    onClick={() => navigate(slide.primaryCtaLink)}
                  >
                    <span>{slide.primaryCtaText}</span>
                    <ArrowRight size={18} className="btn-arrow-icon" />
                  </button>

                  <button
                    className="editorial-btn-secondary"
                    onClick={() => navigate(slide.secondaryCtaLink)}
                  >
                    {slide.secondaryCtaText}
                  </button>
                </div>

                {/* Social Proof & Rating Trust Bar */}
                <div className="editorial-hero-social-proof">
                  <div className="avatar-group">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Customer" className="avatar-img" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Customer" className="avatar-img" />
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Customer" className="avatar-img" />
                  </div>
                  <div className="social-proof-info">
                    <div className="social-proof-stars">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} fill="#facc15" color="#facc15" />
                      ))}
                      <strong style={{ fontSize: '0.85rem', marginLeft: '4px' }}>4.9/5</strong>
                    </div>
                    <span className="social-proof-text">10,000+ Happy Shoppers Across India</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Right Stage: Floating Cutouts + Giant Typography + Info Badge Card */}
        <div className="editorial-hero-stage-col">
          {EDITORIAL_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={slide.id}
                className={`editorial-hero-slide-stage ${isActive ? 'active' : ''}`}
              >
                {/* Giant Low-Opacity Background Typography */}
                <div
                  className="editorial-giant-word"
                  style={{
                    transform: `translate3d(${parallaxOffset.x * 5}px, ${parallaxOffset.y * 5}px, 0)`,
                  }}
                >
                  {slide.giantText}
                </div>

                {/* Main Floating Studio Product Cutout */}
                <div
                  className="editorial-product-cutout-wrapper"
                  style={{
                    transform: `translate3d(${parallaxOffset.x * 8}px, ${parallaxOffset.y * 8}px, 0)`,
                  }}
                >
                  <div className="editorial-product-float-inner">
                    <img
                      src={slide.productImage}
                      alt={slide.productAlt}
                      className="editorial-product-img"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                    {/* Soft Studio Radial Oval Shadow */}
                    <div className="editorial-product-shadow" />
                  </div>
                </div>

                {/* Secondary Mini Floating Product Cutout */}
                {slide.secondaryCutoutImage && (
                  <div
                    className="editorial-secondary-cutout-float"
                    style={{
                      transform: `translate3d(${parallaxOffset.x * 12}px, ${parallaxOffset.y * 12}px, 0)`,
                    }}
                  >
                    <div className="secondary-cutout-inner">
                      <img src={slide.secondaryCutoutImage} alt={slide.secondaryCutoutLabel} />
                    </div>
                    <span className="secondary-cutout-tag">{slide.secondaryCutoutLabel}</span>
                  </div>
                )}

                {/* Floating Product Details Badge Card */}
                <div
                  className="editorial-floating-badge-card"
                  onClick={() => navigate(slide.cardLink)}
                  style={{
                    transform: `translate3d(${parallaxOffset.x * 10}px, ${parallaxOffset.y * 10}px, 0)`,
                  }}
                >
                  <div className="floating-card-thumb">
                    <img src={slide.productImage} alt={slide.cardTitle} />
                  </div>
                  <div className="floating-card-body">
                    <div className="floating-card-header">
                      <Sparkles size={13} className="floating-card-sparkle" />
                      <span className="floating-card-label">{slide.cardLabel}</span>
                      <span className="floating-card-badge">{slide.cardBadge}</span>
                    </div>
                    <h4 className="floating-card-title">{slide.cardTitle}</h4>
                    
                    <div className="floating-card-rating">
                      <Star size={12} fill="#facc15" color="#facc15" />
                      <span>{slide.cardRating}</span>
                      <span className="rating-count">({slide.cardReviews})</span>
                    </div>

                    <div className="floating-card-footer">
                      <div className="card-prices">
                        <span className="floating-card-price">{slide.cardPrice}</span>
                        {slide.cardOriginalPrice && (
                          <span className="floating-card-orig-price">{slide.cardOriginalPrice}</span>
                        )}
                      </div>
                      <span className="floating-card-action">
                        VIEW <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ── Slide Navigation & Editorial Controls Footer ── */}
      <div className="editorial-hero-controls-bar">
        <div className="editorial-controls-inner">
          
          {/* Slide Counter */}
          <div className="editorial-slide-counter">
            <span className="counter-current">
              {String(currentSlide + 1).padStart(2, '0')}
            </span>
            <span className="counter-divider">/</span>
            <span className="counter-total">
              {String(totalSlides).padStart(2, '0')}
            </span>
          </div>

          {/* Interactive Progress Step Indicators */}
          <div className="editorial-progress-container">
            {EDITORIAL_SLIDES.map((_, sIdx) => {
              const isSelected = sIdx === currentSlide;
              return (
                <button
                  key={sIdx}
                  className={`editorial-step-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(sIdx)}
                  aria-label={`Go to hero slide ${sIdx + 1}`}
                >
                  <span className="step-pill-fill" />
                </button>
              );
            })}
          </div>

          {/* 3 Quick Store Value Props */}
          <div className="editorial-hero-trust-props">
            <div className="trust-prop-item">
              <Truck size={14} className="trust-prop-icon" />
              <span>Fast Courier Dispatch</span>
            </div>
            <div className="trust-prop-item">
              <Lock size={14} className="trust-prop-icon" />
              <span>Razorpay Encrypted</span>
            </div>
            <div className="trust-prop-item">
              <CheckCircle2 size={14} className="trust-prop-icon" />
              <span>100% Quality Curated</span>
            </div>
          </div>

          {/* Previous & Next Circular Navigation Buttons */}
          <div className="editorial-nav-buttons">
            <button
              className="editorial-nav-btn"
              onClick={handlePrev}
              onMouseEnter={() => setIsPaused(true)}
              onFocus={() => setIsPaused(true)}
              aria-label="Previous Hero Slide"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              className="editorial-nav-btn"
              onClick={handleNext}
              onMouseEnter={() => setIsPaused(true)}
              onFocus={() => setIsPaused(true)}
              aria-label="Next Hero Slide"
            >
              <ArrowRight size={18} />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}
