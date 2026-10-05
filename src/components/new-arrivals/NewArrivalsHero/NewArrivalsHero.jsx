import React from 'react';
import { Sparkles, ArrowRight, ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';

export default function NewArrivalsHero({ onExploreClick }) {
  const { addItem } = useCartStore();
  const { showToast } = useUiStore();

  const handleAddFeaturedLook = (e) => {
    e.preventDefault();
    const featuredProduct = {
      _id: 'featured_tech_hub',
      id: 'featured_tech_2026',
      name: 'Pro Wireless Headphones',
      slug: 'pro-wireless-headphones',
      price: 4999,
      discountPrice: 2499,
      image: '/images/pill_tech_product.jpg',
      images: ['/images/pill_tech_product.jpg'],
      category: { name: "Electronics", slug: 'electronics' },
      stock: 45,
    };
    addItem(featuredProduct, 1);
    showToast('Added "Pro Wireless Headphones" to cart! ✨', 'success');
  };

  return (
    <section className="new-arrivals-hero-wrapper">
      {/* ── Main Rounded Purple Card (Full Width Picky Theme) ── */}
      <div className="new-arrivals-purple-card">
        {/* Soft Organic Curved Ribbon Waves in Background */}
        <svg
          className="card-bg-waves"
          viewBox="0 0 1440 560"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M-50 180 C 300 80, 580 340, 880 160 C 1150 20, 1320 220, 1500 140"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="100"
            strokeLinecap="round"
          />
          <path
            d="M-80 380 C 240 520, 540 280, 820 440 C 1100 580, 1350 360, 1520 420"
            stroke="rgba(216, 180, 254, 0.15)"
            strokeWidth="85"
            strokeLinecap="round"
          />
        </svg>

        {/* ── 3-Column Layout: Left Text | Center Model | Right Featured Look ── */}
        <div className="card-columns-grid">
          {/* 1. LEFT COLUMN: Editorial Text & CTAs */}
          <div className="col-left">
            <div className="new-collection-pill">
              <Sparkles size={13} />
              <span>New Arrivals 2026</span>
            </div>

            <h1 className="hero-heading">
              Fresh Drops & <br />
              New Arrivals
            </h1>

            <p className="hero-subtext">
              Discover this week's handpicked styles, fresh gadgets, and latest arrivals before they sell out.
            </p>

            <button
              onClick={onExploreClick}
              className="explore-now-btn"
              type="button"
            >
              <span>Explore New Arrivals</span>
              <div className="arrow-circle">
                <ArrowRight size={14} />
              </div>
            </button>
          </div>

          {/* 2. CENTER COLUMN: Flawless Overlapping Streetwear Girl Model */}
          <div className="col-center">
            {/* Wireframe Concentric Loops Behind Beanie */}
            <div className="beanie-wireframe-rings">
              <div className="wire-loop ring-1" />
              <div className="wire-loop ring-2" />
            </div>

            {/* Flawless Waist-up Cutout Model (No box artifact, 100% solid white shirt) */}
            <img
              src="/images/streetwear_hero_girl_clean.png"
              alt="Picky Streetwear Model"
              className="center-girl-cutout"
            />
          </div>

          {/* 3. RIGHT COLUMN: Floating "Featured Look" Card */}
          <div className="col-right">
            {/* Featured Look Label & Card */}
            <div className="featured-look-wrapper">
              <div className="featured-look-title-label">
                <span>Featured Drop</span>
              </div>

              <div className="featured-look-card-box">
                <div className="featured-card-img">
                  <img
                    src="/images/pill_tech_product.jpg"
                    alt="Pro Wireless Headphones - Electronics"
                  />
                </div>

                <div className="featured-card-meta">
                  <h4 className="card-item-title">Pro Wireless Headphones</h4>
                  <p className="card-item-sub">Premium Electronics</p>

                  <button
                    onClick={handleAddFeaturedLook}
                    className="card-item-price-btn"
                    type="button"
                    title="Add to cart"
                  >
                    <ShoppingCart size={13} />
                    <span>₹2,499</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .new-arrivals-hero-wrapper {
          width: 100%;
          max-width: 1440px; /* Full-width matching Picky layout */
          margin: 0 auto 0; /* Docked timing bar overlaps bottom edge by 50% */
          padding: 0 clamp(1rem, 2.5vw, 2.5rem);
          position: relative;
        }

        /* ── Luminous Light Purple & Lavender Luxury Gradient Card ── */
        .new-arrivals-purple-card {
          position: relative;
          background: 
            radial-gradient(circle at 14% 18%, rgba(255, 255, 255, 0.45) 0%, transparent 40%),
            radial-gradient(circle at 86% 82%, rgba(233, 213, 255, 0.5) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(192, 132, 252, 0.25) 0%, transparent 60%),
            linear-gradient(135deg, #c084fc 0%, #a855f7 35%, #8b5cf6 70%, #7c3aed 100%);
          border-radius: 36px;
          min-height: 480px;
          padding: clamp(2rem, 3.5vw, 3rem);
          box-shadow: 0 25px 60px -15px rgba(168, 85, 247, 0.35), 0 8px 24px rgba(124, 58, 237, 0.15);
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.65);
        }

        .card-bg-waves {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          border-radius: 36px;
          overflow: hidden;
        }

        /* ── 3-Column Grid ── */
        .card-columns-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.15fr 1fr 1fr;
          align-items: center;
          gap: 1.5rem;
          min-height: 420px;
        }

        /* ── Column 1: Left Editorial ── */
        .col-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 1.15rem;
          z-index: 3;
        }

        .new-collection-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(12px);
          color: #ffffff;
          padding: 0.4rem 1.1rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.15);
        }

        .hero-heading {
          font-family: var(--font-primary);
          font-size: clamp(2.1rem, 3.2vw, 3.4rem);
          font-weight: 800;
          line-height: 1.08;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.025em;
          text-shadow: 0 4px 18px rgba(91, 33, 182, 0.35);
        }

        .hero-subtext {
          font-size: clamp(0.92rem, 1.1vw, 1.05rem);
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.95);
          margin: 0;
          max-width: 360px;
          text-shadow: 0 2px 8px rgba(91, 33, 182, 0.25);
        }

        .explore-now-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          padding: 0.85rem 1.6rem 0.85rem 1.8rem;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.35);
          transition: all 0.25s ease;
        }

        .explore-now-btn:hover {
          background: #1e1b4b;
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(15, 23, 42, 0.45);
        }

        .arrow-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .explore-now-btn:hover .arrow-circle {
          transform: translateX(3px);
          border-color: #ffffff;
        }

        /* ── Column 2: Center Streetwear Girl (Clean Chroma Cutout) ── */
        .col-center {
          position: relative;
          height: 100%;
          min-height: 420px;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          z-index: 4;
        }

        /* Wireframe Rings behind head */
        .beanie-wireframe-rings {
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%);
          width: 240px;
          height: 150px;
          pointer-events: none;
          z-index: 1;
        }

        .wire-loop {
          position: absolute;
          border-radius: 50%;
        }

        .ring-1 {
          inset: 0;
          border: 1.5px solid rgba(216, 180, 254, 0.55);
          transform: rotate(-14deg);
        }

        .ring-2 {
          inset: 16px;
          border: 1.5px solid rgba(255, 255, 255, 0.35);
          transform: rotate(8deg);
        }

        .center-girl-cutout {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: clamp(280px, 28vw, 390px);
          max-width: none;
          height: 100%;
          max-height: 430px;
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 20px 30px rgba(24, 15, 60, 0.35));
          pointer-events: none;
          z-index: 2;
          transition: transform 0.35s ease;
        }

        .new-arrivals-purple-card:hover .center-girl-cutout {
          transform: translateX(-50%) scale(1.02);
        }

        /* ── Column 3: Right Badges & Featured Look ── */
        .col-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          height: 100%;
          gap: 1.5rem;
          z-index: 3;
        }

        .right-feature-badges {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 1.25rem;
          width: 100%;
        }

        .mini-badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          text-align: center;
        }

        .badge-icon-wrap {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(8px);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(255, 255, 255, 0.55);
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.15);
          transition: transform 0.2s ease;
        }

        .mini-badge-item:hover .badge-icon-wrap {
          transform: scale(1.08);
          background: rgba(255, 255, 255, 0.38);
        }

        .mini-badge-item span {
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          max-width: 75px;
          line-height: 1.15;
          text-shadow: 0 2px 6px rgba(91, 33, 182, 0.25);
        }

        /* Featured Look Card */
        .featured-look-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .featured-look-title-label {
          font-size: 0.78rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.28);
          backdrop-filter: blur(8px);
          border: 1.5px solid rgba(255, 255, 255, 0.55);
          border-radius: 9999px;
          padding: 0.25rem 0.85rem;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.15);
        }

        .featured-look-card-box {
          background: #ffffff;
          border-radius: 24px;
          padding: 0.95rem;
          width: 215px;
          box-shadow: 0 18px 45px rgba(109, 40, 217, 0.22), 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .featured-look-card-box:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 50px rgba(109, 40, 217, 0.32);
        }

        .featured-card-img {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 16px;
          overflow: hidden;
          background: #ede9fe;
        }

        .featured-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }

        .featured-look-card-box:hover .featured-card-img img {
          transform: scale(1.05);
        }

        .featured-card-meta {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.2rem;
        }

        .card-item-title {
          font-size: 0.94rem;
          font-weight: 800;
          color: #1e1b4b;
          margin: 0;
        }

        .card-item-sub {
          font-size: 0.74rem;
          color: #64748b;
          margin: 0 0 0.45rem;
          font-weight: 600;
        }

        .card-item-price-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          padding: 0.5rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.38);
          transition: all 0.2s ease;
          width: 100%;
        }

        .card-item-price-btn:hover {
          background: #6d28d9;
          transform: scale(1.02);
        }

        /* ── Responsive Breakpoints ── */
        @media (max-width: 1100px) {
          .card-columns-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
          .col-center {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .card-columns-grid {
            grid-template-columns: 1fr;
          }
          .col-right {
            align-items: flex-start;
          }
          .right-feature-badges {
            justify-content: space-between;
          }
          .featured-look-card-box {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
