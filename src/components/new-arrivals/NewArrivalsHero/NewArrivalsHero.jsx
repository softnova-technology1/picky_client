import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const HERO_BUBBLE_CATEGORIES = [
  {
    id: 'beauty-personal-care',
    label: 'Beauty',
    image: '/images/new-arrivals-hero/orb-beauty-v2.png',
  },
  {
    id: 'mobile-accessories',
    label: 'Accessories',
    image: '/images/new-arrivals-hero/orb-accessories.png',
  },
  {
    id: 'traditional-tamil-products',
    label: 'Tamil Products',
    image: '/images/new-arrivals-hero/orb-tamil.png',
  },
  {
    id: 'snacks-foods',
    label: 'Snacks',
    image: '/images/new-arrivals-hero/orb-snacks.png',
  },
  {
    id: 'artificial-jewellery',
    label: 'Jewellery',
    image: '/images/new-arrivals-hero/orb-jewellery.png',
  },
];

export default function NewArrivalsHero({
  onExploreClick,
  categories = [],
  activeCategory = 'all',
  onSelectCategory,
}) {
  const [hoveredOrb, setHoveredOrb] = useState(null);

  const handleOrbClick = (catId) => {
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  return (
    <section className="fresh-drops-hero-stage">
      {/* ── AMBIENT COSMIC GRADIENT BLOBS & CURVES ── */}
      <div className="hero-cosmic-bg">
        <div className="cosmic-blob blob-top-right" />
        <div className="cosmic-blob blob-bottom-left" />
        <div className="cosmic-blob blob-top-left" />
        <div className="cosmic-blob blob-center-violet" />
        <div className="cosmic-bottom-wave" />
      </div>

      {/* ── 4 FLOATING SHOWCASE LIFESTYLE CLUSTERS ── */}
      {/* Top Left: Unboxing box with sneaker & apparel */}
      <div className="hero-lifestyle-cluster cluster-top-left" aria-hidden="true">
        <img
          src="/images/new-arrivals-hero/cluster-fashion-box.png"
          alt="Fashion Drops Unboxing"
          className="cluster-img"
          loading="eager"
        />
      </div>

      {/* Top Right: Holographic smartphones with cyan neon light trail */}
      <div className="hero-lifestyle-cluster cluster-top-right" aria-hidden="true">
        <img
          src="/images/new-arrivals-hero/cluster-phones.png"
          alt="Gadgets & Accessories"
          className="cluster-img"
          loading="eager"
        />
      </div>

      {/* Middle Left: Traditional Brass pooja items & silk saree */}
      <div className="hero-lifestyle-cluster cluster-mid-left" aria-hidden="true">
        <img
          src="/images/new-arrivals-hero/cluster-pooja.png"
          alt="Traditional Heritage"
          className="cluster-img"
          loading="eager"
        />
      </div>

      {/* Middle Right: Organic snacks, samosas & crisps */}
      <div className="hero-lifestyle-cluster cluster-mid-right" aria-hidden="true">
        <img
          src="/images/new-arrivals-hero/cluster-snacks.png"
          alt="Crispy Snacks & Delights"
          className="cluster-img"
          loading="eager"
        />
      </div>

      {/* ── CENTER EDITORIAL CONTENT ── */}
      <div className="hero-editorial-center">
        {/* Top Capsule Badge */}
        <div className="hero-sparkle-pill">
          <span className="pill-star">✦</span>
          <span className="pill-title">PICKY EXCLUSIVE ✦ FRESH DROPS 2026</span>
          <span className="pill-star">✦</span>
        </div>

        {/* Display Typography */}
        <h1 className="hero-main-title">
          <span className="title-serif-white">Fresh Drops &</span>
          <br />
          <span className="title-gradient-sunset">Statement Fits</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-description">
          Discover this week's handpicked styles, fresh gadgets,
          <br className="hero-desc-br" />
          and latest arrivals before they sell out.
        </p>

        {/* Explore CTA Button */}
        <div className="hero-cta-halo">
          <button
            type="button"
            className="hero-sunset-cta"
            onClick={onExploreClick}
          >
            <span className="cta-label">Explore Catalog</span>
            <span className="cta-icon-disc">
              <ArrowRight size={14} strokeWidth={3} />
            </span>
          </button>
        </div>
      </div>

      {/* ── 5 CRYSTAL 3D GLASS BUBBLE CATEGORY PODS ── */}
      <div className="hero-bubble-dock-container">
        <div className="hero-bubble-dock">
          {HERO_BUBBLE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            const isHovered = hoveredOrb === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                className={`bubble-card-item ${isActive ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''}`}
                onClick={() => handleOrbClick(cat.id)}
                onMouseEnter={() => setHoveredOrb(cat.id)}
                onMouseLeave={() => setHoveredOrb(null)}
                aria-label={`Select ${cat.label}`}
              >
                {/* 3D Glass Bubble Orb */}
                <div className="bubble-sphere-wrapper">
                  <div className="bubble-sphere-glass">
                    {/* Inner image */}
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="bubble-inner-img"
                      loading="eager"
                    />

                    {/* Specular curved reflection layer */}
                    <div className="bubble-specular-sheen" />

                    {/* Translucent rim inner shadow */}
                    <div className="bubble-rim-refraction" />
                  </div>

                  {/* Active radiant halo */}
                  {isActive && <div className="bubble-active-ring" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── STYLES (MATCHING MOCKUP WITH PIXEL PRECISION & RESPONSIVE POLISH) ── */}
      <style>{`
        /* ── Container Stage ── */
        .fresh-drops-hero-stage {
          position: relative;
          width: 100%;
          min-height: 560px;
          background: 
            radial-gradient(ellipse at 15% 15%, rgba(168, 85, 247, 0.25) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(109, 40, 217, 0.2) 0%, transparent 60%),
            linear-gradient(140deg, #110324 0%, #1c063b 30%, #2a0a54 60%, #160430 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 2.2rem 1.5rem 2rem;
          box-sizing: border-box;
          user-select: none;
        }

        /* ── Background Organic Glow Curves & Nebulas (Purple Family) ── */
        .hero-cosmic-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .cosmic-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.88;
        }

        /* Top Right Soft Lavender/Purple Glow */
        .blob-top-right {
          top: -80px;
          right: -60px;
          width: 480px;
          height: 420px;
          background: radial-gradient(circle at 60% 40%, rgba(192, 132, 252, 0.38) 0%, rgba(139, 92, 246, 0.28) 45%, rgba(109, 40, 217, 0.15) 70%, transparent 100%);
          filter: blur(85px);
          opacity: 0.9;
        }

        /* Bottom Left Deep Amethyst/Violet fluid blob */
        .blob-bottom-left {
          bottom: -70px;
          left: -80px;
          width: 460px;
          height: 400px;
          background: radial-gradient(circle at 40% 60%, rgba(168, 85, 247, 0.35) 0%, rgba(124, 58, 237, 0.25) 45%, rgba(76, 29, 149, 0.15) 75%, transparent 100%);
          filter: blur(85px);
          opacity: 0.85;
        }

        /* Top Left violet glow */
        .blob-top-left {
          top: -60px;
          left: 10%;
          width: 340px;
          height: 280px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(76, 29, 149, 0.18) 60%, transparent 100%);
          filter: blur(80px);
          opacity: 0.75;
        }

        /* Center violet ambient nebula */
        .blob-center-violet {
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 650px;
          height: 380px;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.28) 0%, rgba(88, 28, 135, 0.15) 60%, transparent 100%);
          filter: blur(95px);
          opacity: 0.85;
        }

        /* Fluid curved bottom wave */
        .cosmic-bottom-wave {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 180px;
          background: linear-gradient(180deg, transparent 0%, rgba(28, 8, 56, 0.45) 40%, rgba(17, 4, 36, 0.95) 100%);
          pointer-events: none;
        }

        /* ── Floating Lifestyle Showcase Clusters ── */
        .hero-lifestyle-cluster {
          position: absolute;
          z-index: 4;
          pointer-events: none;
          transition: transform 0.4s ease-out;
        }

        .cluster-img {
          display: block;
          width: 100%;
          height: auto;
          filter: drop-shadow(0 15px 35px rgba(0, 0, 0, 0.45));
        }

        /* Top Left: Fashion Box */
        .cluster-top-left {
          top: 24px;
          left: 4.5%;
          width: clamp(170px, 19vw, 240px);
          animation: floatSway1 6s ease-in-out infinite alternate;
        }

        /* Top Right: Holographic Phones */
        .cluster-top-right {
          top: 28px;
          right: 4.5%;
          width: clamp(160px, 17vw, 220px);
          animation: floatSway2 6.5s ease-in-out infinite alternate;
        }

        /* Middle Left: Traditional Pooja & Saree */
        .cluster-mid-left {
          top: 230px;
          left: 8.5%;
          width: clamp(140px, 15vw, 190px);
          animation: floatSway3 7s ease-in-out infinite alternate;
        }

        /* Middle Right: Crispy Snacks */
        .cluster-mid-right {
          top: 200px;
          right: 5%;
          width: clamp(155px, 17vw, 225px);
          animation: floatSway1 5.5s ease-in-out infinite alternate;
        }

        @keyframes floatSway1 {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-10px) rotate(1.2deg); }
        }
        @keyframes floatSway2 {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-8px) rotate(-1.5deg); }
        }
        @keyframes floatSway3 {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-7px) scale(1.02); }
        }

        /* ── Center Editorial Content ── */
        .hero-editorial-center {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 680px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Sparkle Pill */
        .hero-sparkle-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          padding: 0.45rem 1.3rem;
          border-radius: 9999px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.2);
          margin-bottom: 1.15rem;
        }

        .pill-star {
          color: #fbbf24;
          font-size: 0.85rem;
          text-shadow: 0 0 8px rgba(251, 191, 36, 0.7);
        }

        .pill-title {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #f5f3ff;
          text-transform: uppercase;
        }

        /* Main Heading */
        .hero-main-title {
          margin: 0 0 0.85rem;
          line-height: 1.12;
          letter-spacing: -0.015em;
        }

        .title-serif-white {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-size: clamp(2.4rem, 4.6vw, 3.8rem);
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        }

        .title-gradient-sunset {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-size: clamp(2.5rem, 4.8vw, 4rem);
          font-weight: 800;
          background: linear-gradient(90deg, #ffd3b6 0%, #ff859d 48%, #f472b6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 14px rgba(244, 63, 94, 0.35));
          display: inline-block;
        }

        /* Subtitle */
        .hero-description {
          font-size: clamp(0.95rem, 1.25vw, 1.08rem);
          line-height: 1.55;
          color: rgba(243, 232, 255, 0.9);
          margin: 0 0 1.5rem;
          font-weight: 400;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .hero-desc-br {
          display: block;
        }

        /* ── Explore CTA Button (Halo + Signature Purple Gradient Pill) ── */
        .hero-cta-halo {
          padding: 5px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(216, 180, 254, 0.35);
          box-shadow: 0 8px 30px rgba(124, 58, 237, 0.4), 0 0 20px rgba(168, 85, 247, 0.25);
          display: inline-block;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .hero-cta-halo:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 38px rgba(147, 51, 234, 0.6), 0 0 26px rgba(192, 38, 211, 0.45);
        }

        .hero-sunset-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.9rem;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%);
          border: none;
          padding: 0.68rem 1.6rem 0.68rem 1.85rem;
          border-radius: 9999px;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.01em;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45), 0 4px 15px rgba(124, 58, 237, 0.35);
          transition: filter 0.2s ease, box-shadow 0.2s ease;
        }

        .hero-sunset-cta:hover {
          filter: brightness(1.1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), 0 6px 20px rgba(147, 51, 234, 0.5);
        }

        .cta-icon-disc {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
          transition: transform 0.2s ease;
        }

        .hero-sunset-cta:hover .cta-icon-disc {
          transform: translateX(3px);
        }

        /* ── 5 Crystal 3D Glass Bubble Category Pods (Bottom Dock) ── */
        .hero-bubble-dock-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1100px;
          margin-top: 2rem;
          display: flex;
          justify-content: center;
        }

        .hero-bubble-dock {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: clamp(1.2rem, 3.6vw, 3.8rem);
          width: 100%;
          padding: 0.5rem 0.5rem 0.75rem;
          box-sizing: border-box;
        }

        .bubble-card-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          outline: none;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bubble-card-item:hover,
        .bubble-card-item.is-hovered {
          transform: translateY(-8px);
        }

        .bubble-card-item.is-active {
          transform: translateY(-10px);
        }

        /* The 3D Glass Sphere */
        .bubble-sphere-wrapper {
          position: relative;
          width: clamp(86px, 9.5vw, 126px);
          height: clamp(86px, 9.5vw, 126px);
        }

        .bubble-sphere-glass {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(18, 5, 42, 0.65) 100%);
          box-shadow:
            inset 0 2px 8px rgba(255, 255, 255, 0.42),
            inset 0 -8px 20px rgba(124, 58, 237, 0.35),
            0 12px 28px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bubble-card-item:hover .bubble-sphere-glass {
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow:
            inset 0 3px 12px rgba(255, 255, 255, 0.6),
            inset 0 -8px 24px rgba(168, 85, 247, 0.45),
            0 16px 36px rgba(0, 0, 0, 0.6),
            0 0 25px rgba(168, 85, 247, 0.4);
        }

        .bubble-card-item.is-active .bubble-sphere-glass {
          border-color: #a855f7;
          box-shadow:
            inset 0 3px 14px rgba(255, 255, 255, 0.7),
            inset 0 -8px 25px rgba(147, 51, 234, 0.5),
            0 18px 40px rgba(0, 0, 0, 0.65),
            0 0 28px #a855f7;
        }

        /* Bubble image */
        .bubble-inner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          border-radius: 50%;
          transform: scale(1.02);
          transition: transform 0.35s ease;
        }

        .bubble-card-item:hover .bubble-inner-img {
          transform: scale(1.08);
        }

        /* Specular Curved Highlight */
        .bubble-specular-sheen {
          position: absolute;
          top: 3%;
          left: 12%;
          width: 60%;
          height: 38%;
          border-radius: 50%;
          background: radial-gradient(ellipse at 45% 20%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 70%);
          pointer-events: none;
          transform: rotate(-15deg);
        }

        /* Rim Refraction */
        .bubble-rim-refraction {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          box-shadow: inset 0 0 14px rgba(255, 255, 255, 0.25);
          pointer-events: none;
        }

        /* Active Radiant Halo Ring */
        .bubble-active-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 2px dashed rgba(192, 132, 252, 0.9);
          animation: spinRing 12s linear infinite;
          pointer-events: none;
        }

        @keyframes spinRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Category Label */
        .bubble-category-text {
          margin-top: 0.75rem;
          font-size: clamp(0.82rem, 1vw, 0.96rem);
          font-weight: 600;
          color: rgba(245, 243, 255, 0.88);
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
          letter-spacing: 0.01em;
          transition: color 0.2s ease, text-shadow 0.2s ease;
        }

        .bubble-card-item:hover .bubble-category-text,
        .bubble-card-item.is-hovered .bubble-category-text {
          color: #ffffff;
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.7);
        }

        .bubble-card-item.is-active .bubble-category-text {
          color: #ffedd5;
          font-weight: 800;
          text-shadow: 0 0 14px rgba(251, 146, 60, 0.9);
        }

        /* ── RESPONSIVE DESIGN (320px–768px MOBILE RULES APPLIED) ── */
        @media (max-width: 1024px) {
          .cluster-mid-left,
          .cluster-mid-right {
            opacity: 0.7;
          }
        }

        @media (max-width: 768px) {
          .fresh-drops-hero-stage {
            min-height: auto;
            padding: 1.8rem 1rem 1.6rem;
          }

          /* Hide complex side clusters on mobile so text & orbs are clean and uncluttered */
          .hero-lifestyle-cluster {
            display: none;
          }

          .hero-desc-br {
            display: none;
          }

          .hero-description {
            font-size: 0.88rem;
            margin-bottom: 1.25rem;
          }

          .hero-sparkle-pill {
            padding: 0.38rem 1rem;
            margin-bottom: 0.85rem;
          }

          .pill-title {
            font-size: 0.7rem;
          }

          .hero-sunset-cta {
            padding: 0.58rem 1.35rem;
            font-size: 0.88rem;
          }

          .hero-bubble-dock-container {
            margin-top: 1.6rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 0.4rem;
          }

          .hero-bubble-dock-container::-webkit-scrollbar {
            display: none;
          }

          .hero-bubble-dock {
            justify-content: flex-start;
            gap: 1.1rem;
            padding: 0.25rem 0.5rem;
            width: max-content;
            margin: 0 auto;
          }

          .bubble-sphere-wrapper {
            width: 76px;
            height: 76px;
          }

          .bubble-category-text {
            font-size: 0.75rem;
            margin-top: 0.55rem;
          }
        }

        @media (max-width: 480px) {
          .bubble-sphere-wrapper {
            width: 68px;
            height: 68px;
          }

          .hero-bubble-dock {
            gap: 0.9rem;
          }

          .bubble-category-text {
            font-size: 0.72rem;
          }
        }
      `}</style>
    </section>
  );
}
