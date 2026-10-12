import React, { useMemo, useState } from 'react';
import { ArrowRight, PackagePlus, ChevronLeft, ChevronRight } from 'lucide-react';

const FALLBACK_CATEGORIES = [
  { id: 'all', label: 'All New Arrivals', icon: 'package-plus' },
  { id: 'medicine', label: 'medicine', image: '/images/products/saree.png' },
  { id: 'fashion', label: 'Fashion', image: '/images/top_category_fashion.jpg' },
  { id: 'home-kitchen', label: 'Home & Kitchen', image: '/images/top_category_kitchen.jpg' },
  { id: 'artificial-jewellery', label: 'Artificial Jewellery', image: '/images/top_category_jewellery.jpg' },
  { id: 'beauty-personal-care', label: 'Beauty & Personal Care', image: '/images/pill_beauty_product.jpg' },
  { id: 'mobile-accessories', label: 'Mobile Accessories', image: '/images/top_category_tech.jpg' },
  { id: 'traditional-tamil-products', label: 'Traditional Tamil Products', image: '/images/products/saree.png' },
  { id: 'snacks-foods', label: 'Snacks & Foods', image: '/images/products/saree.png' },
  { id: 'home-decor', label: 'Home Décor', image: '/images/pill_model_decor.png' },
  { id: 'kids-products', label: 'Kids Products', image: '/images/pill_model_western.png' },
  { id: 'fitness-products', label: 'Fitness Products', image: '/images/pill_tech_product.jpg' },
];

export default function NewArrivalsHero({
  onExploreClick,
  categories = [],
  activeCategory = 'all',
  onSelectCategory,
}) {
  const [manualOffset, setManualOffset] = useState(0);

  const rawList = categories && categories.length > 0 ? categories : FALLBACK_CATEGORIES;

  // Build a seamless circular constellation of category items (24 items for full circle)
  const orbitalItems = useMemo(() => {
    let list = [...rawList];
    while (list.length < 24) {
      list = [...list, ...rawList];
    }
    return list;
  }, [rawList]);

  // Rotate opposite direction on manual click
  const handleStepRotate = (dir) => {
    const step = 360 / orbitalItems.length;
    setManualOffset((prev) => prev + (dir === 'left' ? -step : step));
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (onSelectCategory) {
      onSelectCategory(item.id);
    }
  };

  return (
    <section className="new-arrivals-hero-wrapper">
      <div className="new-arrivals-dome-hero">
        {/* Soft Ambient Lighting Orbs */}
        <div className="dome-ambient-orb orb-top" />
        <div className="dome-ambient-orb orb-bottom" />

        {/* ── 1. CENTERED EDITORIAL CONTENT ── */}
        <div className="dome-center-content">
          <div className="hero-live-pill">
            <span className="live-pulse-dot" />
            <span className="pill-text">PICKY EXCLUSIVE ✦ FRESH DROPS 2026</span>
          </div>

          <h1 className="hero-heading">
            Fresh Drops & <br />
            <span className="hero-heading-gradient">Statement Fits</span>
          </h1>

          <p className="hero-subtext">
            Discover this week's handpicked styles, fresh gadgets, and latest arrivals before they sell out.
          </p>

          <button
            onClick={onExploreClick}
            className="explore-now-btn"
            type="button"
          >
            <span>Explore Catalog</span>
            <div className="arrow-circle">
              <ArrowRight size={14} />
            </div>
          </button>
        </div>

        {/* ── 2. CURVED ARCH CATEGORY RUNNER (Clean Floating Arc, No Lines) ── */}
        <div className="dome-horizon-stage">
          {/* Interactive Step Nudge Controls */}
          <button
            type="button"
            className="dome-nav-arrow arrow-left"
            onClick={() => handleStepRotate('left')}
            aria-label="Rotate categories left"
          >
            <ChevronLeft size={20} strokeWidth={2.6} />
          </button>

          <button
            type="button"
            className="dome-nav-arrow arrow-right"
            onClick={() => handleStepRotate('right')}
            aria-label="Rotate categories right"
          >
            <ChevronRight size={20} strokeWidth={2.6} />
          </button>

          {/* Rotating Planetary Wheel running along the arc (Opposite Direction: Right to Left) */}
          <div
            className="dome-orbit-wheel"
            style={{
              transform: `translate(-50%, 0) rotate(${manualOffset}deg)`,
            }}
          >
            {orbitalItems.map((item, idx) => {
              const total = orbitalItems.length;
              const angleDeg = (idx / total) * 360;
              const isActive = activeCategory === item.id;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="dome-orbit-node"
                  style={{
                    '--node-angle': `${angleDeg}deg`,
                  }}
                >
                  {/* Upright holder cancels the static node angle */}
                  <div
                    className="dome-upright-holder"
                    style={{
                      transform: `rotate(-${angleDeg}deg)`,
                    }}
                  >
                    {/* Button continuously counter-spins to stay 100% upright at all angles */}
                    <button
                      type="button"
                      onClick={(e) => handleItemClick(e, item)}
                      className={`dome-item-button ${isActive ? 'active' : ''}`}
                      title={item.label}
                    >
                      {/* Circle Avatar Pod */}
                      <div className="dome-avatar-pod">
                        <div className="dome-avatar-inner">
                          {item.icon === 'package-plus' ? (
                            <div className="all-drops-icon-wrap">
                              <PackagePlus size={22} strokeWidth={2} />
                            </div>
                          ) : (
                            <img
                              src={item.image || '/images/products/saree.png'}
                              alt={item.label}
                              className="dome-avatar-img"
                              loading="lazy"
                            />
                          )}
                        </div>
                        {/* Active Indicator Dot */}
                        {isActive && <div className="active-radiant-glow" />}
                      </div>

                      {/* Category Label */}
                      <span className="dome-item-label">{item.label}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .new-arrivals-hero-wrapper {
          width: 100%;
          position: relative;
          overflow: hidden;
        }

        /* ── Full Width Cosmic Deep Purple Hero Card ── */
        .new-arrivals-dome-hero {
          position: relative;
          width: 100%;
          min-height: 560px;
          background: 
            radial-gradient(circle at 50% 12%, rgba(168, 85, 247, 0.42) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 85%, rgba(124, 58, 237, 0.28) 0%, transparent 50%),
            radial-gradient(ellipse at 15% 85%, rgba(192, 132, 252, 0.25) 0%, transparent 50%),
            linear-gradient(180deg, #110426 0%, #1c0838 45%, #2a0b52 75%, #180630 100%);
          overflow: hidden;
          border-bottom: 1.5px solid rgba(255, 255, 255, 0.14);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding-top: clamp(2rem, 3.5vw, 3rem);
          box-sizing: border-box;
        }

        /* Ambient Lighting Orbs */
        .dome-ambient-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 1;
        }
        .orb-top {
          width: 500px;
          height: 350px;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(192, 132, 252, 0.35);
        }
        .orb-bottom {
          width: 650px;
          height: 250px;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(124, 58, 237, 0.35);
        }

        /* ── 1. Centered Editorial Content ── */
        .dome-center-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 780px;
          padding: 0 1.5rem;
          margin-bottom: 1.25rem;
        }

        .hero-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          color: #f3e8ff;
          padding: 0.42rem 1.25rem;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
          margin-bottom: 0.85rem;
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 10px #4ade80;
          animation: pulseGreen 1.8s infinite;
        }

        @keyframes pulseGreen {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.35); }
        }

        .pill-text {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero-heading {
          font-family: var(--font-primary, serif);
          font-size: clamp(2.3rem, 4.2vw, 3.8rem);
          font-weight: 900;
          line-height: 1.1;
          color: #ffffff;
          margin: 0 0 0.75rem 0;
          letter-spacing: -0.025em;
          text-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);
        }

        .hero-heading-gradient {
          background: linear-gradient(135deg, #ffffff 0%, #e9d5ff 40%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtext {
          font-size: clamp(0.92rem, 1.15vw, 1.05rem);
          line-height: 1.6;
          color: rgba(243, 232, 255, 0.92);
          margin: 0 0 1.25rem 0;
          max-width: 580px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .explore-now-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          background: #ffffff;
          color: #1e0b38;
          border: none;
          border-radius: 9999px;
          padding: 0.75rem 1.75rem;
          font-size: 0.94rem;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 25px rgba(255, 255, 255, 0.25);
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .explore-now-btn:hover {
          transform: translateY(-2px) scale(1.02);
          background: #fdfcff;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 0 0 35px rgba(192, 132, 252, 0.6);
        }

        .arrow-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #7c3aed;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.22s ease;
        }

        .explore-now-btn:hover .arrow-circle {
          transform: translateX(3px);
          background: #6d28d9;
        }

        /* ── 2. Curved Arc Category Runner Stage (Clean Background, No Planet Graphic) ── */
        .dome-horizon-stage {
          position: relative;
          width: 100%;
          height: 230px;
          overflow: hidden;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 5;
          margin-top: 0.5rem;
          --wheel-radius: 800px;
          --wheel-pivot-top: 830px;
        }

        /* Nav Nudge Buttons */
        .dome-nav-arrow {
          position: absolute;
          top: 45px;
          z-index: 20;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.14);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
        }

        .dome-nav-arrow:hover {
          background: rgba(255, 255, 255, 0.28);
          transform: scale(1.1);
          color: #f3e8ff;
        }

        .arrow-left { left: clamp(1rem, 4vw, 3rem); }
        .arrow-right { right: clamp(1rem, 4vw, 3rem); }

        /* ── Rotating Wheel running in OPPOSITE DIRECTION (Right to Left: 360deg -> 0deg) ── */
        .dome-orbit-wheel {
          position: absolute;
          top: var(--wheel-pivot-top);
          left: 50%;
          width: 0;
          height: 0;
          z-index: 6;
          animation: spinDomeWheelReverse 50s linear infinite;
          will-change: transform;
        }

        /* Hover pauses rotation for easy clicking */
        .dome-horizon-stage:hover .dome-orbit-wheel,
        .dome-horizon-stage:hover .dome-item-button {
          animation-play-state: paused !important;
        }

        /* Reverse direction: Rotates counter-clockwise so items move RIGHT to LEFT across the top */
        @keyframes spinDomeWheelReverse {
          from {
            transform: translate(-50%, 0) rotate(360deg);
          }
          to {
            transform: translate(-50%, 0) rotate(0deg);
          }
        }

        /* ── Each Node Positioned on the Perimeter Rim ── */
        .dome-orbit-node {
          position: absolute;
          top: 0;
          left: 0;
          transform: translate(-50%, -50%) rotate(var(--node-angle)) translateY(calc(-1 * var(--wheel-radius)));
          width: 100px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        /* Upright Holder counter-rotates the static node angle */
        .dome-upright-holder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
        }

        /* Item button continuously counter-spins clockwise to cancel wheel rotation (Always 100% Upright) */
        .dome-item-button {
          background: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.45rem;
          animation: counterSpinClockwise 50s linear infinite;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          user-select: none;
          padding: 4px;
        }

        @keyframes counterSpinClockwise {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .dome-item-button:hover {
          transform: scale(1.15) !important;
        }

        /* Avatar Pod */
        .dome-avatar-pod {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #ffffff;
          padding: 3px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35), 0 0 15px rgba(255, 255, 255, 0.2);
          transition: all 0.22s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dome-item-button:hover .dome-avatar-pod {
          box-shadow: 0 8px 25px rgba(168, 85, 247, 0.6), 0 0 20px rgba(255, 255, 255, 0.8);
          transform: translateY(-2px);
        }

        .dome-item-button.active .dome-avatar-pod {
          background: #c084fc;
          box-shadow: 0 0 22px rgba(233, 213, 255, 0.95), 0 6px 20px rgba(124, 58, 237, 0.7);
        }

        .dome-avatar-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          background: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dome-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .all-drops-icon-wrap {
          width: 100%;
          height: 100%;
          background: #ffffff;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .active-radiant-glow {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: #4ade80;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px #4ade80;
        }

        /* Label Text */
        .dome-item-label {
          font-size: 0.73rem;
          font-weight: 700;
          color: #ffffff;
          max-width: 92px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
          transition: color 0.18s ease;
        }

        .dome-item-button:hover .dome-item-label,
        .dome-item-button.active .dome-item-label {
          color: #f3e8ff;
          font-weight: 800;
          text-shadow: 0 0 12px rgba(216, 180, 254, 0.9);
        }

        /* ── Responsive Adaptations ── */
        @media (max-width: 900px) {
          .dome-horizon-stage {
            height: 210px;
            --wheel-radius: 650px;
            --wheel-pivot-top: 675px;
          }
          .dome-avatar-pod {
            width: 52px;
            height: 52px;
          }
          .dome-item-label {
            font-size: 0.68rem;
          }
        }

        @media (max-width: 600px) {
          .dome-horizon-stage {
            height: 190px;
            --wheel-radius: 480px;
            --wheel-pivot-top: 500px;
          }
          .dome-avatar-pod {
            width: 46px;
            height: 46px;
          }
          .dome-item-label {
            font-size: 0.64rem;
            max-width: 75px;
          }
          .dome-nav-arrow {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
