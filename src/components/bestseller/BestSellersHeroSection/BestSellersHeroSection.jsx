import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import '../../../styles/bestseller_hero.css';

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
