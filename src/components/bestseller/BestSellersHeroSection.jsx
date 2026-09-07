import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import '../../styles/bestseller_hero.css';

export default function BestSellersHeroSection() {
  const scrollToGrid = () => {
    const el = document.getElementById('bestsellers-grid-start');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bestseller-playful-hero-wrapper">
      <div className="bestseller-playful-container">
        {/* ── 1. Top Left Floating Cutout & Curly Arrow Doodle ──────── */}
        <div className="playful-left-cutout-wrap">
          <div className="playful-left-avatar-circle">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Happy Shopper"
            />
          </div>

          {/* SVG Curly Loop Arrow Doodle matching reference image */}
          <svg className="playful-curly-arrow" viewBox="0 0 100 100" fill="none">
            <path
              d="M 20, 10 C 10, 40 40, 60 25, 45 C 10, 30 50, 70 80, 80"
              stroke="#7c3aed"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <polyline points="70,68 82,81 68,88" stroke="#7c3aed" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        {/* ── 2. Top Right Circular Stamp Badge matching reference image ── */}
        <div className="playful-stamp-badge">
          <svg className="playful-stamp-spin-svg" viewBox="0 0 100 100">
            <path
              id="stampCirclePath"
              d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
              fill="none"
            />
            <text fontSize="8.5" fontWeight="800" fill="#7c3aed" letterSpacing="1.8px">
              <textPath href="#stampCirclePath">
                ✦ PICKY CHOICE ✦ VERIFIED QUALITY ✦
              </textPath>
            </text>
          </svg>

          {/* Center 4-Petal Flower Icon */}
          <div className="playful-stamp-center-flower">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#7c3aed">
              <circle cx="12" cy="7" r="4" />
              <circle cx="12" cy="17" r="4" />
              <circle cx="7" cy="12" r="4" />
              <circle cx="17" cy="12" r="4" />
            </svg>
          </div>
        </div>

        {/* ── 3. Bottom Left Concentric Ring Circle Doodle ───────────── */}
        <svg className="playful-concentric-doodle" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="42" stroke="#c084fc" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="32" stroke="#c084fc" strokeWidth="2" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="22" stroke="#c084fc" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="12" stroke="#c084fc" strokeWidth="2" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="4" fill="#7c3aed" />
        </svg>

        {/* ── 4. Bottom Right Floating Cutout & Blob Shape ────────────── */}
        <div className="playful-right-cutout-wrap">
          <div className="playful-blob-bg">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
              alt="Satisfied Customer"
            />
          </div>
          <div className="playful-right-badge-text">
            <span className="playful-right-badge-title">16k+ Happy</span>
            <span className="playful-right-badge-sub">Verified Shoppers</span>
          </div>
        </div>

        {/* ── 5. Headline Typography Stack matching reference image ───── */}
        <div className="playful-title-stack">
          {/* Line 1 */}
          <div className="playful-title-line">The best place to</div>

          {/* Line 2 with Italic Script Purple & Yellow Highlights & Underlines */}
          <div className="playful-title-line" style={{ marginTop: '0.2rem' }}>
            <span className="playful-script-purple">
              discover
              {/* SVG Wavy Lavender Underline */}
              <svg className="playful-purple-wave-underline" viewBox="0 0 160 20" fill="none">
                <path
                  d="M 5 10 Q 30 2, 55 10 T 105 10 T 155 10"
                  stroke="#c084fc"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            {' '}and{' '}
            <span className="playful-script-yellow">
              shop
              {/* SVG Yellow Brush Underline */}
              <svg className="playful-yellow-brush-underline" viewBox="0 0 140 20" fill="none">
                <path
                  d="M 5 12 Q 45 4, 135 8"
                  stroke="#f59e0b"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </div>

          {/* Line 3 */}
          <div className="playful-title-line" style={{ marginTop: '0.2rem' }}>
            for best sellers
          </div>
        </div>

        {/* ── 6. Centered Subtitle & Purple Pill CTA Button ──────────── */}
        <p className="playful-subtitle">
          Discover thousands of top-rated, quality-verified products to elevate your lifestyle with 24h fast dispatch.
        </p>

        <button type="button" className="playful-cta-pill" onClick={scrollToGrid}>
          <span>Get started</span>
          <div className="playful-cta-arrow-circle">
            <ArrowUpRight size={18} />
          </div>
        </button>
      </div>
    </section>
  );
}
