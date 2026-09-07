import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';

export default function WomensPillShowcase() {
  const pillCards = [
    {
      id: 'ethnic-sarees',
      title: 'Ethnic Sarees',
      subtitle: 'Silk, Banarasi & Drapes',
      link: '/categories/womens-fashion',
      modelImg: '/images/pill_model_saree.png',
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #e0d7fe 100%)',
      borderColor: 'rgba(168, 85, 247, 0.38)',
      shadowColor: 'rgba(124, 58, 237, 0.14)',
      btnBg: '#ffffff',
      btnColor: '#7c3aed',
      badge: 'Bestseller',
    },
    {
      id: 'western-gallery',
      title: 'Western Edit',
      subtitle: 'Hoodies, Co-ords & Fits',
      link: '/categories/womens-fashion',
      modelImg: '/images/pill_model_western.png',
      bgGradient: 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)',
      borderColor: 'rgba(217, 70, 239, 0.38)',
      shadowColor: 'rgba(217, 70, 239, 0.14)',
      btnBg: '#ffffff',
      btnColor: '#c026d3',
      badge: 'Trending',
    },
    {
      id: 'kurtis-fusion',
      title: 'Kurtis & Fusion',
      subtitle: 'Anarkali, A-Line & Sets',
      link: '/categories/womens-fashion',
      modelImg: '/images/pill_model_kurti.png',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      borderColor: 'rgba(245, 158, 11, 0.38)',
      shadowColor: 'rgba(245, 158, 11, 0.14)',
      btnBg: '#ffffff',
      btnColor: '#b45309',
      badge: 'New Styles',
    },
    {
      id: 'glam-jewellery',
      title: 'Glam Jewellery',
      subtitle: 'Sets, Jhumkas & Chains',
      link: '/categories/artificial-jewellery',
      modelImg: '/images/pill_model_jewellery.png',
      bgGradient: 'linear-gradient(135deg, #ede4fc 0%, #ddd0f8 100%)',
      borderColor: 'rgba(147, 51, 234, 0.38)',
      shadowColor: 'rgba(147, 51, 234, 0.14)',
      btnBg: '#ffffff',
      btnColor: '#6b21a8',
      badge: 'Handcrafted',
    },
  ];

  return (
    <section className="womens-pill-section" style={{ marginBottom: '3.5rem' }}>
      {/* ── Section Header (Glamics Style with decorative divider) ── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            color: '#7c3aed',
            fontSize: '0.84rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.4rem',
          }}
        >
          <Sparkles size={14} />
          <span>Exclusive Women's Gallery</span>
          <Sparkles size={14} />
        </div>

        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 900,
            color: '#1e1b4b',
            margin: '0 0 0.6rem',
            letterSpacing: '-0.02em',
          }}
        >
          Premium Shades
        </h2>

        {/* Decorative Diamond Ornament Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
          <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
        </div>
      </div>

      {/* ── 4 Overlapping 3D Pill Cards Grid ── */}
      <div
        className="womens-pills-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '1.25rem',
          paddingTop: '35px', /* Room for overlapping model heads */
        }}
      >
        {pillCards.map((card) => (
          <div
            key={card.id}
            className="womens-pill-card"
            style={{
              position: 'relative',
              background: card.bgGradient,
              borderRadius: '9999px',
              border: `1.5px solid ${card.borderColor}`,
              boxShadow: `0 12px 28px -6px ${card.shadowColor}`,
              height: '145px',
              display: 'flex',
              alignItems: 'center',
              overflow: 'visible',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            }}
          >
            {/* Left Content Column */}
            <div
              style={{
                position: 'relative',
                zIndex: 3,
                paddingLeft: '1.6rem',
                paddingRight: '120px', /* Leave space for model cutout */
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'center',
              }}
            >
              <h3
                style={{
                  fontSize: 'clamp(1rem, 1.2vw, 1.18rem)',
                  fontWeight: 900,
                  color: '#1e1b4b',
                  margin: '0 0 0.25rem',
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                }}
              >
                {card.title}
              </h3>

              <p
                style={{
                  fontSize: '0.74rem',
                  color: '#475569',
                  fontWeight: 600,
                  margin: '0 0 0.75rem',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {card.subtitle}
              </p>

              {/* Pill Button */}
              <Link
                to={card.link}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.38rem 0.95rem',
                  borderRadius: '9999px',
                  background: card.btnBg,
                  color: card.btnColor,
                  fontWeight: 800,
                  fontSize: '0.74rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.2s ease',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                }}
                className="womens-pill-btn"
              >
                <span>Click Now</span>
                <ArrowUpRight size={13} strokeWidth={2.5} />
              </Link>
            </div>

            {/* Overlapping 3D Model Cutout (Pops 35px above pill boundary!) */}
            <div
              style={{
                position: 'absolute',
                right: '6px',
                bottom: 0,
                width: '135px',
                height: '180px',
                pointerEvents: 'none',
                zIndex: 2,
                overflow: 'visible',
              }}
            >
              <img
                src={card.modelImg}
                alt={card.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'bottom center',
                  display: 'block',
                  filter: `drop-shadow(0 12px 16px ${card.shadowColor})`,
                  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="womens-pill-img"
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .womens-pill-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 36px -8px rgba(124, 58, 237, 0.22) !important;
        }
        .womens-pill-card:hover .womens-pill-img {
          transform: scale(1.06) translateY(-4px);
        }
        .womens-pill-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.25) !important;
        }
        @media (max-width: 1200px) {
          .womens-pills-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            row-gap: 40px !important;
          }
        }
        @media (max-width: 640px) {
          .womens-pills-grid {
            grid-template-columns: 1fr !important;
            row-gap: 35px !important;
          }
        }
      `}</style>
    </section>
  );
}
