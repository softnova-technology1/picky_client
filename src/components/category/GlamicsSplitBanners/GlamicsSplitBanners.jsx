import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function GlamicsSplitBanners() {
  const cards = [
    {
      badge: 'TRENDING COLLECTION',
      title: "WOMEN'S FASHION",
      subtext: 'Up to 35% Off Sarees & Kurtis',
      link: '/categories/fashion',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #be185d 0%, #ec4899 50%, #9333ea 100%)',
    },
    {
      badge: 'AUTHENTIC HERITAGE',
      title: 'TAMIL CRAFTS & BRASS',
      subtext: 'Handcrafted Nachiarkoil Vilakku',
      link: '/categories/traditional-tamil-products',
      image: 'https://images.unsplash.com/photo-1609137144822-26155986ec32?w=600&auto=format&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #7c3aed 100%)',
    },
    {
      badge: 'NATIVE SPECIALS',
      title: 'SNACKS & FOODS',
      subtext: 'Crispy Murukku & Desi Ghee Halwa',
      link: '/categories/snacks-foods',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      gradient: 'linear-gradient(135deg, #047857 0%, #10b981 50%, #6d28d9 100%)',
    },
  ];

  return (
    <div className="glamics-split-banners-section" style={{ marginBottom: '4.5rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {cards.map((card, idx) => (
          <Link
            key={idx}
            to={card.link}
            className="glamics-split-card"
            style={{
              borderRadius: '28px',
              overflow: 'hidden',
              position: 'relative',
              height: '310px',
              padding: '2rem 1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textDecoration: 'none',
              color: '#ffffff',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Background Image with Zoom */}
            <img
              src={card.image}
              alt={card.title}
              className="glamics-split-img"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 25%',
                zIndex: 1,
                transition: 'transform 0.5s ease',
              }}
            />

            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: card.gradient,
                opacity: 0.88,
                mixBlendMode: 'multiply',
                zIndex: 2,
              }}
            />

            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)',
                zIndex: 2,
              }}
            />

            {/* Top Badge */}
            <div style={{ position: 'relative', zIndex: 3 }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  color: '#18181b',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              >
                {card.badge}
              </span>
            </div>

            {/* Bottom Content & CTA */}
            <div style={{ position: 'relative', zIndex: 3 }}>
              <h3
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  margin: '0 0 0.4rem',
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.88)',
                  margin: '0 0 1.25rem',
                  fontWeight: 500,
                }}
              >
                {card.subtext}
              </p>

              <div
                className="glamics-split-cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <span>COLLECTION</span>
                <ArrowUpRight size={17} strokeWidth={2.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .glamics-split-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(124, 58, 237, 0.25) !important;
        }
        .glamics-split-card:hover .glamics-split-img {
          transform: scale(1.08);
        }
        .glamics-split-card:hover .glamics-split-cta {
          gap: 0.7rem;
          color: #f5d0fe !important;
        }
      `}</style>
    </div>
  );
}
