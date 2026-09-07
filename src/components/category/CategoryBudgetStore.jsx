import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function CategoryBudgetStore() {
  const budgetCards = [
    {
      id: 'tier-499',
      tag: 'UNDER ₹499 • BESTSELLER BAZAAR',
      title: 'Wake Up to Daily Fresh Deals',
      subtext: 'Multi-blade vegetable choppers, cotton graphic tees & crispy Manapparai snacks.',
      btnLabel: 'Shop Under ₹499',
      link: '/products?maxPrice=499',
      isWide: true,
      badgeBg: 'rgba(45, 212, 191, 0.25)',
      badgeColor: '#99f6e4',
      badgeBorder: 'rgba(45, 212, 191, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.35) 42%, rgba(15, 23, 42, 0.94) 100%)',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80',
    },
    {
      id: 'tier-299',
      tag: 'UNDER ₹299',
      title: 'Smart Tech & Sound',
      subtext: '65W braided fast charge cables, mobile stands & travel adapters.',
      btnLabel: 'Explore ₹299',
      link: '/products?maxPrice=299',
      isWide: false,
      badgeBg: 'rgba(251, 191, 36, 0.25)',
      badgeColor: '#fde68a',
      badgeBorder: 'rgba(251, 191, 36, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.38) 42%, rgba(15, 23, 42, 0.94) 100%)',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'tier-999',
      tag: 'UNDER ₹999',
      title: 'Festive Ethnic Glow',
      subtext: 'Rayon embroidered Anarkalis, sungudi dupattas & choker necklace sets.',
      btnLabel: 'Explore ₹999',
      link: '/products?maxPrice=999',
      isWide: false,
      badgeBg: 'rgba(244, 114, 182, 0.25)',
      badgeColor: '#fbcfe8',
      badgeBorder: 'rgba(244, 114, 182, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(55, 19, 39, 0.12) 0%, rgba(55, 19, 39, 0.45) 45%, rgba(26, 8, 18, 0.95) 100%)',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'tier-luxe',
      tag: '₹999+ LUXE • HERITAGE SPECIAL',
      title: 'Pure Handloom & Royal Crafts',
      subtext: 'Madurai pure handloom Sungudi silks, solid Nachiarkoil brass lamps & 22k gold foil Tanjore art.',
      btnLabel: 'Shop Luxe Store',
      link: '/products?minPrice=1000',
      isWide: true,
      badgeBg: 'rgba(239, 68, 68, 0.25)',
      badgeColor: '#fecaca',
      badgeBorder: 'rgba(239, 68, 68, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(69, 10, 23, 0.15) 0%, rgba(69, 10, 23, 0.48) 45%, rgba(30, 4, 10, 0.96) 100%)',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <section className="category-budget-store-section" style={{ marginBottom: '4.5rem' }}>
      {/* ── Section Header (Centered) ── */}
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
          Shop By Budget
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#64748b',
            margin: '0 0 0.85rem',
            fontWeight: 500,
          }}
        >
          Discover handpicked collections curated for every wallet size
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
          <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
        </div>
      </div>

      {/* ── Alternating 4-Card Asymmetrical Bento Grid ── */}
      <div className="budget-bento-grid">
        {budgetCards.map((card) => {
          return (
            <Link
              key={card.id}
              to={card.link}
              className={`budget-bento-card ${card.isWide ? 'bento-wide' : 'bento-compact'}`}
            >
              {/* Full Photographic Background */}
              <div className="bento-photo-wrapper">
                <img
                  src={card.image}
                  alt={card.title}
                  className="bento-bg-photo"
                  loading="lazy"
                />
                {/* Contrast-enhancing directional scrim overlay */}
                <div
                  className="bento-scrim-overlay"
                  style={{ background: card.scrimGradient }}
                />
              </div>

              {/* Top Row: Floating Frosted Pill Badge */}
              <div className="bento-top-row">
                <div
                  className="bento-frosted-badge"
                  style={{
                    background: card.badgeBg,
                    borderColor: card.badgeBorder,
                    color: card.badgeColor,
                  }}
                >
                  {card.tag}
                </div>
              </div>

              {/* Bottom Row: Typography & Signature Tactile White Button */}
              <div className="bento-bottom-content">
                <h3 className="bento-card-title">{card.title}</h3>
                <p className="bento-card-subtext">{card.subtext}</p>

                <div className="bento-white-btn">
                  <span>{card.btnLabel}</span>
                  <ArrowUpRight size={16} strokeWidth={2.8} className="bento-btn-arrow" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .budget-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .budget-bento-card {
          position: relative;
          border-radius: 26px;
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          min-height: 350px;
          padding: 1.5rem 1.65rem;
          box-sizing: border-box;
          box-shadow: 0 14px 34px -10px rgba(15, 23, 42, 0.28), 0 3px 10px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          cursor: pointer;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Bento Span Rules: Row 1 = 2fr + 1fr, Row 2 = 1fr + 2fr */
        .bento-wide {
          grid-column: span 2;
        }
        .bento-compact {
          grid-column: span 1;
        }

        .budget-bento-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 48px -10px rgba(15, 23, 42, 0.42), 0 6px 16px rgba(0, 0, 0, 0.12);
        }

        .bento-photo-wrapper {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        .bento-bg-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .budget-bento-card:hover .bento-bg-photo {
          transform: scale(1.07);
        }

        .bento-scrim-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* Top Row & Pill */
        .bento-top-row {
          position: relative;
          z-index: 3;
          display: flex;
          align-items: center;
        }

        .bento-frosted-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.38rem 0.85rem;
          border-radius: 9999px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1px solid;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
        }

        /* Bottom Row Content */
        .bento-bottom-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.45rem;
          margin-top: auto;
        }

        .bento-card-title {
          color: #ffffff;
          font-weight: 800;
          font-size: 1.55rem;
          margin: 0;
          line-height: 1.22;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }

        .bento-compact .bento-card-title {
          font-size: 1.32rem;
        }

        .bento-card-subtext {
          color: rgba(255, 255, 255, 0.85);
          font-size: 0.86rem;
          margin: 0 0 0.5rem;
          line-height: 1.38;
          font-weight: 400;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
        }

        /* Signature White Tactile Action Button */
        .bento-white-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          color: #0f172a;
          padding: 0.62rem 1.25rem;
          border-radius: 12px;
          font-size: 0.86rem;
          font-weight: 800;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .budget-bento-card:hover .bento-white-btn {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
          background: #f8fafc;
        }

        .bento-btn-arrow {
          transition: transform 0.25s ease;
        }

        .budget-bento-card:hover .bento-btn-arrow {
          transform: translate(3px, -3px);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .budget-bento-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1.25rem !important;
          }
          .bento-wide, .bento-compact {
            grid-column: span 1 !important;
          }
          .budget-bento-card {
            min-height: 320px !important;
          }
        }

        @media (max-width: 640px) {
          .budget-bento-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          .bento-wide, .bento-compact {
            grid-column: span 1 !important;
          }
          .budget-bento-card {
            min-height: 290px !important;
            padding: 1.25rem 1.25rem !important;
          }
          .bento-card-title {
            font-size: 1.25rem !important;
          }
          .bento-card-subtext {
            font-size: 0.82rem !important;
          }
        }
      `}</style>
    </section>
  );
}
