import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ChevronRight } from 'lucide-react';

export default function ShopHeroSpotlight({
  totalProducts = 0,
  categoryName = '',
  searchQuery = '',
  onSearchSubmit,
  onSearchClear,
}) {
  const [searchInput, setSearchInput] = useState(searchQuery);

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
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #fdf4ff 100%)',
        color: '#1e1b4b',
        position: 'relative',
        padding: '2rem 0 2.3rem',
        marginBottom: '2.2rem',
        borderBottom: '1.5px solid #e2d9f3',
        boxShadow: '0 4px 20px -5px rgba(124, 58, 237, 0.08)',
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
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* ── Breadcrumbs in Crisp Slate / Purple ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.82rem',
            color: '#64748b',
            marginBottom: '1.15rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/" style={{ color: '#6d28d9', fontWeight: 600, textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={13} color="#94a3b8" />
          <Link
            to="/shop"
            style={{
              color: categoryName ? '#6d28d9' : '#1e1b4b',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Shop Catalog
          </Link>
          {categoryName && (
            <>
              <ChevronRight size={13} color="#94a3b8" />
              <span style={{ color: '#1e1b4b', fontWeight: 800 }}>{categoryName}</span>
            </>
          )}
          {searchQuery && (
            <>
              <ChevronRight size={13} color="#94a3b8" />
              <span style={{ color: '#7c3aed', fontWeight: 700 }}>&ldquo;{searchQuery}&rdquo;</span>
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
          {/* Left Title */}
          <div style={{ maxWidth: '640px' }}>
            {/* Main Heading in Deep Purple */}
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 2.85rem)',
                fontWeight: 900,
                color: '#1e1b4b',
                margin: '0 0 0.5rem',
                letterSpacing: '-0.025em',
                lineHeight: 1.15,
              }}
            >
              {categoryName ? categoryName : searchQuery ? `Results for "${searchQuery}"` : 'Explore Curated Collections'}
            </h1>

            <p
              style={{
                color: '#475569',
                fontSize: '0.96rem',
                margin: 0,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              Discover handpicked, verified products directly dispatched from our Madurai hub.
            </p>
          </div>

          {/* Right Action Cluster: Search */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              minWidth: 'min(100%, 390px)',
            }}
          >
            {/* Live Search Bar */}
            <form
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid #ddd6fe',
                padding: '0.35rem 0.5rem 0.35rem 1rem',
                boxShadow: '0 4px 18px rgba(124, 58, 237, 0.07)',
              }}
            >
              <Search size={17} color="#7c3aed" style={{ flexShrink: 0, marginRight: '0.55rem' }} />
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
                  padding: '0.5rem 1.15rem',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  marginLeft: '0.4rem',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
                }}
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
