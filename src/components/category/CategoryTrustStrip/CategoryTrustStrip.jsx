import React from 'react';
import { ShieldCheck, Truck, RefreshCw, Headphones, CheckCircle2 } from 'lucide-react';

export default function CategoryTrustStrip() {
  const trustPillars = [
    {
      step: '01',
      id: 'quality',
      icon: ShieldCheck,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      color: '#2563eb',
      iconBg: '#eff6ff',
      shadowColor: 'rgba(37, 99, 235, 0.32)',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      badgeBorder: '#bfdbfe',
      title: '100% Quality Tested',
      desc: 'Every item physically inspected at our Madurai hub before packaging and dispatch.',
      badge: 'Zero Defect Policy',
    },
    {
      step: '02',
      id: 'dispatch',
      icon: Truck,
      gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
      color: '#0d9488',
      iconBg: '#f0fdfa',
      shadowColor: 'rgba(13, 148, 136, 0.32)',
      badgeBg: '#f0fdfa',
      badgeColor: '#0f766e',
      badgeBorder: '#99f6e4',
      title: '24-48h Express Dispatch',
      desc: 'Direct courier partners with instant SMS updates and live real-time AWB tracking to your doorstep.',
      badge: 'Live AWB Tracking',
    },
    {
      step: '03',
      id: 'replacement',
      icon: RefreshCw,
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      color: '#7c3aed',
      iconBg: '#f5f3ff',
      shadowColor: 'rgba(124, 58, 237, 0.32)',
      badgeBg: '#f5f3ff',
      badgeColor: '#6d28d9',
      badgeBorder: '#ddd6fe',
      title: '7-Day Easy Replacement',
      desc: 'Zero-hassle instant replacement guarantee on any size mismatch, transit damage, or defect.',
      badge: 'Hassle-Free Return',
    },
    {
      step: '04',
      id: 'support',
      icon: Headphones,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      color: '#db2777',
      iconBg: '#fdf2f8',
      shadowColor: 'rgba(219, 39, 119, 0.32)',
      badgeBg: '#fdf2f8',
      badgeColor: '#9d174d',
      badgeBorder: '#fbcfe8',
      title: '24/7 Dedicated Support',
      desc: 'Instant WhatsApp chat and phone assistance with real friendly humans whenever you need help.',
      badge: 'Direct WhatsApp Help',
    },
  ];

  return (
    <section className="category-trust-strip-section" style={{ marginBottom: '5rem', padding: '1rem 0' }}>
      {/* ── Section Header (Centered) ── */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2
          style={{
            fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
            fontWeight: 900,
            color: '#1e1b4b',
            margin: '0 0 0.35rem',
            letterSpacing: '-0.025em',
          }}
        >
          Picky Buyer Protection
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#64748b',
            margin: '0 0 0.85rem',
            fontWeight: 500,
          }}
        >
          Our 4-step quality assurance guarantee for every single order
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
          <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
          <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
        </div>
      </div>

      {/* ── Exact 3D Infographic Card Template Grid ── */}
      <div className="infographic-template-grid">
        {trustPillars.map((pillar) => {
          const IconComp = pillar.icon;

          return (
            <div key={pillar.id} className="infographic-card-item">
              {/* 3D Layer 1: Background Offset Gradient Plate (Pinterest Look) */}
              <div
                className="infographic-backplate"
                style={{
                  background: pillar.gradient,
                  boxShadow: `0 14px 28px -6px ${pillar.shadowColor}`,
                }}
              />

              {/* 3D Layer 2: Foreground Pure White Floating Card */}
              <div className="infographic-frontcard">
                {/* Top Centered Outline Icon Pod */}
                <div
                  className="infographic-icon-pod"
                  style={{
                    background: pillar.iconBg,
                    color: pillar.color,
                    border: `1.5px solid ${pillar.badgeBorder}`,
                    boxShadow: `0 6px 16px ${pillar.shadowColor}`,
                  }}
                >
                  <IconComp size={28} strokeWidth={2.3} />
                </div>

                {/* Centered Title */}
                <h3 className="infographic-card-title">{pillar.title}</h3>

                {/* Centered Description */}
                <p className="infographic-card-desc">{pillar.desc}</p>

                {/* Centered Verified Micro-Badge */}
                <div
                  className="infographic-badge-pill"
                  style={{
                    background: pillar.badgeBg,
                    color: pillar.badgeColor,
                    border: `1px solid ${pillar.badgeBorder}`,
                  }}
                >
                  <CheckCircle2 size={13} strokeWidth={2.8} />
                  <span>{pillar.badge}</span>
                </div>

                {/* 3D Layer 3: Solid Gradient Number Disc Overlapping Bottom Center (01, 02, 03, 04) */}
                <div
                  className="infographic-step-disc"
                  style={{
                    background: pillar.gradient,
                    boxShadow: `0 8px 20px -4px ${pillar.shadowColor}`,
                  }}
                >
                  <span>{pillar.step}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .infographic-template-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 2rem;
          padding: 1rem 0 2rem;
        }

        .infographic-card-item {
          position: relative;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* 3D Offset Backplate (Top-Right Angle) */
        .infographic-backplate {
          position: absolute;
          top: -9px;
          right: -9px;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          z-index: 1;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Front Clean White Card */
        .infographic-frontcard {
          position: relative;
          z-index: 2;
          background: #ffffff;
          border-radius: 24px;
          border: 1.5px solid #f1f5f9;
          box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02);
          padding: 2.2rem 1.5rem 2.85rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
          min-height: 335px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Centered Icon Pod */
        .infographic-icon-pod {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Centered Title */
        .infographic-card-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #1e1b4b;
          margin: 0 0 0.55rem;
          line-height: 1.3;
          letter-spacing: -0.015em;
        }

        /* Centered Description */
        .infographic-card-desc {
          font-size: 0.84rem;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 1.25rem;
          font-weight: 500;
          flex-grow: 1;
        }

        /* Verified Micro-Badge */
        .infographic-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.28rem 0.8rem;
          border-radius: 9999px;
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          margin-bottom: 0.4rem;
        }

        /* Solid Gradient Step Disc at Bottom Center */
        .infographic-step-disc {
          position: absolute;
          bottom: -22px;
          left: 50%;
          transform: translateX(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          color: #ffffff;
          font-weight: 900;
          font-size: 0.95rem;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3.5px solid #ffffff;
          z-index: 3;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
        }

        /* Hover Micro-Interactions */
        .infographic-card-item:hover {
          transform: translateY(-8px);
        }

        .infographic-card-item:hover .infographic-backplate {
          top: -13px;
          right: -13px;
          filter: brightness(1.05);
        }

        .infographic-card-item:hover .infographic-frontcard {
          box-shadow: 0 22px 48px -10px rgba(15, 23, 42, 0.16);
          border-color: #e2e8f0;
        }

        .infographic-card-item:hover .infographic-icon-pod {
          transform: scale(1.1) translateY(-3px);
        }

        .infographic-card-item:hover .infographic-step-disc {
          transform: translateX(-50%) scale(1.12);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1100px) {
          .infographic-template-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 2.25rem 1.5rem !important;
            padding-bottom: 2.5rem !important;
          }
        }

        @media (max-width: 600px) {
          .infographic-template-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            padding-bottom: 2.5rem !important;
          }
        }
      `}</style>
    </section>
  );
}
