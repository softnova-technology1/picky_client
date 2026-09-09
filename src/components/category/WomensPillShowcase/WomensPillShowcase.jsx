import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function WomensPillShowcase() {
  // Top 4 flagship store categories with authentic category-matching visuals
  const pillCards = [
    {
      id: 'womens-fashion',
      title: "Women's Fashion",
      link: '/categories/womens-fashion',
      image: '/images/pill_model_saree.png',
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 50%, #e9d5ff 100%)',
      borderColor: 'rgba(168, 85, 247, 0.4)',
      shadowColor: 'rgba(124, 58, 237, 0.16)',
      btnColor: '#7c3aed',
      imgHeight: '178px',
      imgBottom: '0px',
      imgRight: '4px',
    },
    {
      id: 'artificial-jewellery',
      title: 'Artificial Jewellery',
      link: '/categories/artificial-jewellery',
      image: '/images/pill_model_jewellery.png',
      bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fae8ff 100%)',
      borderColor: 'rgba(217, 70, 239, 0.4)',
      shadowColor: 'rgba(217, 70, 239, 0.16)',
      btnColor: '#c026d3',
      imgHeight: '178px',
      imgBottom: '0px',
      imgRight: '4px',
    },
    {
      id: 'mobile-accessories',
      title: 'Mobile Accessories',
      link: '/categories/mobile-accessories',
      image: '/images/pill_tech_product.png',
      bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      borderColor: 'rgba(59, 130, 246, 0.4)',
      shadowColor: 'rgba(59, 130, 246, 0.16)',
      btnColor: '#2563eb',
      imgHeight: '168px',
      imgBottom: '2px',
      imgRight: '8px',
    },
    {
      id: 'home-kitchen',
      title: 'Home & Kitchen',
      link: '/categories/home-kitchen',
      image: '/images/pill_kitchen_product.png',
      bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)',
      borderColor: 'rgba(234, 179, 8, 0.4)',
      shadowColor: 'rgba(234, 179, 8, 0.16)',
      btnColor: '#b45309',
      imgHeight: '164px',
      imgBottom: '4px',
      imgRight: '6px',
    },
  ];

  return (
    <section className="womens-pill-section" style={{ marginBottom: '4.5rem' }}>
      {/* ── Section Header ── */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 900,
            color: '#1e1b4b',
            margin: '0 0 0.35rem',
            letterSpacing: '-0.025em',
          }}
        >
          Curated Store Departments
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#64748b',
            margin: '0 0 0.85rem',
            fontWeight: 500,
          }}
        >
          Explore our top flagship lifestyle & ethnic collections
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
          <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
        </div>
      </div>

      {/* ── 4 Capsule Pill Cards (Full-Card Clickable with Tailored Hover Glow) ── */}
      <div
        className="womens-pills-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1.25rem',
          paddingTop: '35px', /* Generous headroom for 3D cutout popping out over the top */
        }}
      >
        {pillCards.map((card) => (
          <Link
            key={card.id}
            to={card.link}
            className="womens-pill-card"
            style={{
              '--card-glow': card.shadowColor,
              position: 'relative',
              background: card.bgGradient,
              borderRadius: '9999px',
              border: `1.5px solid ${card.borderColor}`,
              boxShadow: `0 12px 28px -6px ${card.shadowColor}`,
              height: '144px',
              display: 'flex',
              alignItems: 'center',
              overflow: 'visible',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            {/* Left Content Column */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                paddingLeft: '1.65rem',
                paddingRight: '120px', /* Safe clearance away from right cutout image */
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {/* Category Title */}
              <h3
                style={{
                  fontSize: 'clamp(1.08rem, 1.25vw, 1.32rem)',
                  fontWeight: 900,
                  color: '#1e1b4b',
                  margin: '0 0 0.85rem',
                  lineHeight: 1.16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  letterSpacing: '-0.015em',
                }}
                title={card.title}
              >
                {card.title}
              </h3>

              {/* White Pill Button (Shop Now ↗) */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.42rem 1.15rem',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  color: card.btnColor,
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                }}
                className="womens-pill-btn"
              >
                <span>Shop Now</span>
                <ArrowUpRight size={13} strokeWidth={2.6} className="pill-btn-arrow" />
              </div>
            </div>

            {/* Right Cutout Image: Popping out over the top rim of the pill card! */}
            <div
              style={{
                position: 'absolute',
                right: card.imgRight || '6px',
                bottom: card.imgBottom || '0px',
                height: card.imgHeight || '175px',
                width: '135px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                zIndex: 4,
                pointerEvents: 'none',
                overflow: 'visible',
              }}
              className="pill-cutout-container"
            >
              <img
                src={card.image}
                alt={card.title}
                style={{
                  height: '100%',
                  width: 'auto',
                  maxWidth: '135px',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  display: 'block',
                  filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.14))',
                  transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease',
                }}
                className="pill-cutout-img"
              />
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .womens-pill-card:hover {
          transform: translateY(-5px) scale(1.015);
          box-shadow: 0 20px 42px -6px var(--card-glow, rgba(124, 58, 237, 0.25)) !important;
        }
        .womens-pill-card:hover .pill-cutout-img {
          transform: translateY(-6px) scale(1.06);
          filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.2)) !important;
        }
        .womens-pill-card:hover .womens-pill-btn {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14) !important;
        }
        .womens-pill-card:hover .pill-btn-arrow {
          transform: translate(2px, -2px);
        }
        .pill-btn-arrow {
          transition: transform 0.2s ease;
        }
        @media (max-width: 1200px) {
          .womens-pills-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 3rem 1.25rem !important;
          }
        }
        @media (max-width: 640px) {
          .womens-pills-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </section>
  );
}

