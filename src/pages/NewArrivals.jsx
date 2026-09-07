import React, { useState, useMemo, useRef } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import NewArrivalsHero from '../components/new-arrivals/NewArrivalsHero';
import ProductCard from '../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../data/adminMockData';
import { Sparkles, ShieldCheck, Truck, RefreshCw, Headphones, Flame, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewArrivals() {
  const [activeCategory, setActiveCategory] = useState('all');
  const catalogRef = useRef(null);

  // Filter tabs for New Arrivals
  const filterTabs = [
    { id: 'all', label: 'All Fresh Drops' },
    { id: 'womens-fashion', label: "Women's Fashion" },
    { id: 'artificial-jewellery', label: 'Jewellery & Sets' },
    { id: 'home-kitchen', label: 'Home & Kitchen' },
    { id: 'traditional-tamil-products', label: 'Tamil Heritage' },
    { id: 'mobile-accessories', label: 'Tech & Lifestyle' },
  ];

  // Compute counts for each category tab
  const tabCounts = useMemo(() => {
    const counts = { all: MOCK_PRODUCTS.length };
    MOCK_PRODUCTS.forEach((p) => {
      const slug = p.category?.slug;
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, []);

  // Pick freshest items from MOCK_PRODUCTS
  const filteredProducts = useMemo(() => {
    let list = MOCK_PRODUCTS;
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category?.slug === activeCategory);
    }
    // Return top new products
    return list;
  }, [activeCategory]);

  const handleScrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageWrapper>
      <div style={{ background: '#faf5ff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Streetwear Hero Showcase ── */}
        <div style={{ paddingTop: '1.75rem' }}>
          <NewArrivalsHero onExploreClick={handleScrollToCatalog} />
        </div>

        {/* ── 2. New Arrivals Catalog Section ── */}
        <div className="container" ref={catalogRef} style={{ scrollMarginTop: '100px' }}>
          {/* Header Row: Title & Active Count */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.75rem',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#7c3aed',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.35rem',
                }}
              >
                <Flame size={16} />
                <span>Just Dropped For You</span>
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
                  fontWeight: 900,
                  color: '#1e1b4b',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Explore Fresh Arrivals ({filteredProducts.length})
              </h2>
            </div>

            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.4rem',
                borderRadius: '9999px',
                background: '#ffffff',
                color: '#7c3aed',
                fontWeight: 800,
                fontSize: '0.85rem',
                textDecoration: 'none',
                border: '1.5px solid #ede9fe',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)',
                transition: 'all 0.2s ease',
              }}
              className="view-catalog-link"
            >
              <span>View Full Store Catalog</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Department Filter Tabs with Dynamic Counts */}
          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              marginBottom: '2.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {filterTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              const count = tabCounts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
                      : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    border: isActive ? 'none' : '1px solid #e2e8f0',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 6px 18px rgba(124, 58, 237, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  className="filter-pill-tab"
                >
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.12rem 0.48rem',
                      borderRadius: '9999px',
                      background: isActive ? 'rgba(255, 255, 255, 0.28)' : '#f3e8ff',
                      color: isActive ? '#ffffff' : '#7c3aed',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Products Grid with Generous Spacing */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '2.2rem 1.6rem',
              marginBottom: '4.5rem',
            }}
          >
            {filteredProducts.map((prod, idx) => (
              <ProductCard key={prod._id || prod.id} product={prod} index={idx} />
            ))}
          </div>

          {/* ── 3. Customer Assurance Strip ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '32px',
              padding: '2.5rem 2rem',
              boxShadow: '0 15px 40px rgba(124, 58, 237, 0.05)',
              border: '1.5px solid rgba(216, 180, 254, 0.4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '2rem',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#f3e8ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>100% Quality Tested</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Every product physically inspected</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
                }}
              >
                <Truck size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>24-48h Express Dispatch</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Direct courier with live AWB tracking</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                }}
              >
                <RefreshCw size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>7-Day Easy Replacement</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Hassle-free replacement guarantee</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#ede9fe',
                  color: '#6d28d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.15)',
                }}
              >
                <Headphones size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>24/7 Dedicated Support</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Instant WhatsApp & Phone help</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .view-catalog-link:hover {
          background: #7c3aed !important;
          color: #ffffff !important;
          border-color: #7c3aed !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3) !important;
        }
        .filter-pill-tab:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: #c4b5fd !important;
        }
      `}</style>
    </PageWrapper>
  );
}
