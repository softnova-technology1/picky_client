import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Copy, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

export default function CategoryPromoBanner() {
  const [copied, setCopied] = useState(false);
  const { showToast } = useUiStore();

  const handleCopyCode = () => {
    navigator.clipboard.writeText('PICKYFIRST');
    setCopied(true);
    if (showToast) {
      showToast('Coupon code "PICKYFIRST" copied! ✨', 'success');
    }
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <section className="category-promo-banner-section" style={{ marginBottom: '4.5rem' }}>
      <div
        className="promo-banner-card"
        style={{
          position: 'relative',
          borderRadius: '32px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 35%, #7c3aed 70%, #9333ea 100%)',
          color: '#ffffff',
          padding: 'clamp(2rem, 3.8vw, 3.25rem) clamp(1.75rem, 3.5vw, 3.5rem)',
          boxShadow: '0 20px 50px rgba(109, 40, 217, 0.32)',
          border: '1.5px solid rgba(216, 180, 254, 0.35)',
          display: 'grid',
          gridTemplateColumns: '1.35fr 1fr',
          alignItems: 'center',
          gap: '2.5rem',
        }}
      >
        {/* Background Ambient Glow Orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '25%',
            width: '420px',
            height: '420px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-25%',
            left: '10%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(192, 132, 252, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── Left Column: Editorial Offer Headline & Trust Checks ── */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(10px)',
              color: '#ffffff',
              padding: '0.38rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '1.15rem',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            <Zap size={14} fill="#fde047" color="#fde047" />
            <span>Mega Department Carnival 2026</span>
          </div>

          <h2
            style={{
              fontSize: 'clamp(2rem, 3.2vw, 2.9rem)',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 0.85rem',
              lineHeight: 1.12,
              letterSpacing: '-0.025em',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            }}
          >
            Grab Up to 60% OFF Across All Departments
          </h2>

          <p
            style={{
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.92)',
              margin: '0 0 1.5rem',
              lineHeight: 1.5,
              maxWidth: '520px',
            }}
          >
            Handloom sarees, traditional snacks, smart electronics & kitchen gadgets at unmatched direct-from-artisan prices.
          </p>

          {/* 3 Value Checkmark Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', fontWeight: 700 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span>Free Express Delivery (₹499+)</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', fontWeight: 700 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span>100% Verified Quality</span>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', fontWeight: 700 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={12} strokeWidth={3} />
              </div>
              <span>24-48h Same-Day Dispatch</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Interactive Coupon Box & Action CTA ── */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(16px)',
            borderRadius: '26px',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            padding: '2rem 1.75rem',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
            textAlign: 'center',
            gap: '1.15rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fde047' }}>
              ✦ EXCLUSIVE FESTIVE COUPON ✦
            </span>
            <strong style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
              Get Extra 15% OFF On Your Cart
            </strong>
          </div>

          {/* Interactive Click-to-Copy Coupon Capsule */}
          <button
            onClick={handleCopyCode}
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              width: '100%',
              maxWidth: '280px',
              padding: '0.75rem 1.25rem',
              borderRadius: '9999px',
              background: '#ffffff',
              color: '#4c1d95',
              border: '2px dashed #a855f7',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
              transition: 'all 0.22s ease',
            }}
            className="coupon-copy-btn"
            title="Click to copy coupon code"
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>Tap to copy</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.08em', color: '#1e1b4b' }}>PICKYFIRST</span>
            </div>

            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: copied ? '#059669' : '#f3e8ff',
                color: copied ? '#ffffff' : '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
              }}
            >
              {copied ? <Check size={16} strokeWidth={3} /> : <Copy size={16} />}
            </div>
          </button>

          {/* Explore Mega Deals Button */}
          <Link
            to="/products?sort=discount"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              maxWidth: '280px',
              padding: '0.75rem 1.4rem',
              borderRadius: '9999px',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              textDecoration: 'none',
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.35)',
              transition: 'all 0.25s ease',
            }}
            className="promo-action-btn"
          >
            <span>Explore Mega Deals</span>
            <ArrowUpRight size={16} strokeWidth={2.6} className="promo-arrow-icon" />
          </Link>
        </div>
      </div>

      <style>{`
        .coupon-copy-btn:hover {
          transform: scale(1.03);
          border-color: #7c3aed !important;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.18) !important;
        }
        .promo-action-btn:hover {
          background: #1e1b4b !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.5) !important;
        }
        .promo-action-btn:hover .promo-arrow-icon {
          transform: translate(2px, -2px);
        }
        .promo-arrow-icon {
          transition: transform 0.2s ease;
        }
        @media (max-width: 960px) {
          .promo-banner-card {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}
