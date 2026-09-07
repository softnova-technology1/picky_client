import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, Sparkles, Copy, Check, ChevronRight, Zap, Tag } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

export default function ShopHeroSpotlight({
  totalProducts = 0,
  categoryName = '',
  searchQuery = '',
  onSearchSubmit,
  onSearchClear,
}) {
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [copied, setCopied] = useState(false);
  const { showToast } = useUiStore();

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText('PICKY60');
    setCopied(true);
    showToast('Coupon "PICKY60" copied! Get 60% OFF at checkout', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchInput);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    if (onSearchClear) {
      onSearchClear();
    }
  };

  return (
    <div
      className="shop-hero-spotlight-premium"
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #2e1065 55%, #3b0764 100%)',
        color: '#ffffff',
        position: 'relative',
        padding: '2rem 0 2.5rem',
        marginBottom: '2.5rem',
        boxShadow: '0 14px 34px -10px rgba(30, 27, 75, 0.35)',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambient Glows */}
      <div
        style={{
          position: 'absolute',
          top: '-30%',
          left: '15%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-40%',
          right: '5%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.16) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* ── Breadcrumbs in White / Translucent ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            color: 'rgba(255, 255, 255, 0.65)',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ color: 'rgba(255, 255, 255, 0.65)', textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={13} />
          <Link
            to="/shop"
            style={{
              color: categoryName ? 'rgba(255, 255, 255, 0.65)' : '#e9d5ff',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Shop Catalog
          </Link>
          {categoryName && (
            <>
              <ChevronRight size={13} />
              <span style={{ color: '#ffffff', fontWeight: 800 }}>{categoryName}</span>
            </>
          )}
          {searchQuery && (
            <>
              <ChevronRight size={13} />
              <span style={{ color: '#fed7aa', fontWeight: 700 }}>&ldquo;{searchQuery}&rdquo;</span>
            </>
          )}
        </div>

        {/* ── Main Header Content Row ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          {/* Left Title & Status Badges */}
          <div style={{ maxWidth: '640px' }}>
            {/* Live Frosted Status Badges */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                flexWrap: 'wrap',
                marginBottom: '0.85rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(8px)',
                  color: '#f5d0fe',
                  padding: '0.28rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Sparkles size={12} strokeWidth={2.6} /> Curated Lifestyle Store
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(16, 185, 129, 0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#a7f3d0',
                  padding: '0.28rem 0.85rem',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  border: '1px solid rgba(110, 231, 183, 0.3)',
                }}
              >
                <Zap size={12} strokeWidth={2.6} /> 24h Express Dispatch
              </span>
            </div>

            {/* Main Heading in Crisp White */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 2.9rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: '0 0 0.55rem',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
              }}
            >
              {categoryName ? categoryName : searchQuery ? `Results for "${searchQuery}"` : 'Explore Curated Collections'}
            </h1>

            <p
              style={{
                color: 'rgba(255, 255, 255, 0.84)',
                fontSize: '0.96rem',
                margin: 0,
                fontWeight: 400,
                lineHeight: 1.5,
              }}
            >
              Discover <strong style={{ color: '#ffffff', fontWeight: 800 }}>{totalProducts}</strong> handpicked, verified items directly dispatched from our Madurai hub.
            </p>
          </div>

          {/* Right Action Cluster: Coupon Chip & Search */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              minWidth: 'min(100%, 390px)',
            }}
          >
            {/* Click-to-Copy Coupon Card */}
            <div
              onClick={handleCopyCoupon}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCopyCoupon()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '1.5px dashed rgba(255, 255, 255, 0.32)',
                borderRadius: '16px',
                padding: '0.65rem 1.1rem',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.15)',
              }}
              className="premium-coupon-chip"
              title="Click to copy 60% discount code"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#1e1b4b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Tag size={16} strokeWidth={2.6} />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#fed7aa', fontWeight: 800, textTransform: 'uppercase' }}>
                    Mega Deal Discount
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 900, letterSpacing: '0.04em' }}>
                    PICKY60 • 60% OFF
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: copied ? '#047857' : '#1e1b4b',
                  background: copied ? '#a7f3d0' : '#ffffff',
                  padding: '0.32rem 0.75rem',
                  borderRadius: '9999px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
                }}
              >
                {copied ? (
                  <>
                    <Check size={13} strokeWidth={2.8} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={13} strokeWidth={2.4} /> Tap to Copy
                  </>
                )}
              </div>
            </div>

            {/* Live Search Bar */}
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '0.35rem 0.5rem 0.35rem 1rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
              }}
            >
              <Search size={17} color="#64748b" style={{ flexShrink: 0, marginRight: '0.55rem' }} />
              <input
                type="text"
                placeholder="Search sarees, jewellery, gadgets..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '0.9rem',
                  width: '100%',
                  color: '#0f172a',
                  fontWeight: 500,
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '0.4rem',
                  flexShrink: 0,
                  transition: 'background 0.2s ease',
                }}
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .premium-coupon-chip:hover {
          background: rgba(255, 255, 255, 0.18) !important;
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.5) !important;
        }
      `}</style>
    </div>
  );
}
