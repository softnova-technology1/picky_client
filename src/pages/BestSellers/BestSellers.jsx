import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import BestSellersHeroSection from '../../components/bestseller/BestSellersHeroSection';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { MOCK_PRODUCTS } from '../../data/adminMockData';
import { getProducts } from '../../data';
import {
  Flame,
  Award,
  Star,
  Zap,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Gem,
  Smartphone,
  UtensilsCrossed,
  Crown,
  Heart,
  Tag,
  Percent,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

export default function BestSellers() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [highDiscountFilter, setHighDiscountFilter] = useState(false);
  const [fastDispatchFilter, setFastDispatchFilter] = useState(false);
  const catalogRef = useRef(null);

  // Load products (API first, fallback to mock data)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        const res = await productService.list({ sort: 'rating' });
        if (isMounted) {
          const items = res?.data?.data || res?.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setAllProducts(items);
          } else {
            setAllProducts(MOCK_PRODUCTS);
          }
        }
      } catch (err) {
        if (isMounted) {
          const fallback = getProducts() || MOCK_PRODUCTS;
          setAllProducts(fallback);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Department filter tabs with Lucide vector icons (Zero emojis)
  const filterTabs = [
    { id: 'all', label: 'All Best Sellers', icon: Sparkles },
    { id: 'womens-fashion', label: "Women's Fashion", icon: Tag },
    { id: 'artificial-jewellery', label: 'Jewellery & Sets', icon: Gem },
    { id: 'home-kitchen', label: 'Home & Kitchen', icon: UtensilsCrossed },
    { id: 'traditional-tamil-products', label: 'Tamil Heritage', icon: Crown },
    { id: 'mobile-accessories', label: 'Tech & Lifestyle', icon: Smartphone },
    { id: 'beauty-personal-care', label: 'Beauty & Care', icon: Heart },
  ];

  // Dynamic counts for each tab
  const tabCounts = useMemo(() => {
    const counts = { all: allProducts.length };
    allProducts.forEach((p) => {
      const slug = p.category?.slug || (typeof p.category === 'string' ? p.category : '');
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Category filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => {
        const slug = p.category?.slug || (typeof p.category === 'string' ? p.category : '');
        return slug === activeCategory;
      });
    }


    // 30%+ discount
    if (highDiscountFilter) {
      list = list.filter((p) => {
        const disc = p.discount || (p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0);
        return disc >= 30;
      });
    }

    // Fast dispatch
    if (fastDispatchFilter) {
      list = list.filter((p) => p.inStock !== false);
    }

    // Sorting
    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.soldCount || b.orderCount || b.price || 0) - (a.soldCount || a.orderCount || a.price || 0);
      }
      if (sortBy === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      }
      if (sortBy === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

    return list;
  }, [allProducts, activeCategory, highDiscountFilter, fastDispatchFilter, sortBy]);

  const hasActiveFilters = highDiscountFilter || fastDispatchFilter || activeCategory !== 'all';

  const handleResetFilters = () => {
    setActiveCategory('all');
    setMinRatingFilter(false);
    setHighDiscountFilter(false);
    setFastDispatchFilter(false);
    setSortBy('rating');
  };

  return (
    <PageWrapper>
      <div style={{ background: '#faf5ff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Hero Showcase with SVG Doodles & Stamp ── */}
        <BestSellersHeroSection />

        {/* ── 3. Catalog & Interactive Filter Grid Anchor ── */}
        <div className="container" id="bestsellers-grid-start" ref={catalogRef} style={{ scrollMarginTop: '90px' }}>
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.25rem',
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
                <Award size={16} />
                <span>Picky Verified Bestsellers</span>
              </div>
              <h2
                style={{
                  fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
                  fontWeight: 900,
                  color: '#1e1b4b',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Customer Favorites & Top Ranked ({filteredProducts.length})
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Sort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    color: '#1e293b',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <option value="popular">Most Popular & Sales</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

              {/* View Full Catalog Link */}
              <Link
                to="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.3rem',
                  borderRadius: '9999px',
                  background: '#ffffff',
                  color: '#7c3aed',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  border: '1.5px solid #ede9fe',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>Shop All</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.65rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              marginBottom: '1.5rem',
              scrollbarWidth: 'none',
            }}
          >
            {filterTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              const count = tabCounts[tab.id] || 0;
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  style={{
                    background: isActive ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    border: isActive ? 'none' : '1px solid #e2e8f0',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 6px 18px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <IconComponent size={15} />
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

          {/* Quick Filter Badges Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              flexWrap: 'wrap',
              marginBottom: '2.5rem',
            }}
          >

            <button
              onClick={() => setHighDiscountFilter(!highDiscountFilter)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: highDiscountFilter ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                background: highDiscountFilter ? '#f3e8ff' : '#ffffff',
                color: highDiscountFilter ? '#7c3aed' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              <Percent size={14} />
              <span>30%+ OFF Only</span>
            </button>

            <button
              onClick={() => setFastDispatchFilter(!fastDispatchFilter)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.95rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: fastDispatchFilter ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                background: fastDispatchFilter ? '#f3e8ff' : '#ffffff',
                color: fastDispatchFilter ? '#7c3aed' : '#64748b',
                transition: 'all 0.15s ease',
              }}
            >
              <Zap size={14} />
              <span>Ready in 24h</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1.5px solid #fee2e2',
                  background: '#fef2f2',
                  color: '#dc2626',
                  marginLeft: '0.5rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={13} />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '5rem 0' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e9d5ff',
                  borderTopColor: '#7c3aed',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  margin: '0 auto 1rem auto',
                }}
              />
              <p style={{ color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>Loading verified bestsellers...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="bestsellers-grid-5">
              {filteredProducts.map((prod, idx) => (
                <div key={prod._id || prod.id} style={{ position: 'relative' }}>

                  <ProductCard product={prod} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '4rem 2rem',
                textAlign: 'center',
                border: '1.5px dashed #e2e8f0',
                marginBottom: '4rem',
              }}
            >
              <Award size={48} color="#c084fc" style={{ margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '0.5rem' }}>
                No Best Sellers Matched These Filters
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                Try relaxing the rating or discount filter to see more top items.
              </p>
              <button
                onClick={handleResetFilters}
                style={{
                  padding: '0.65rem 1.6rem',
                  borderRadius: '9999px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* ── 4. Quality Guarantee & Buyer Trust Strip ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '28px',
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
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#f3e8ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1e1b4b' }}>100% Quality Inspected</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Every bestseller is multi-point verified by our QA team before dispatch.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Zap size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1e1b4b' }}>24h Express Dispatch</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Priority packed and shipped directly from our Tamil Nadu regional fulfillment center.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#d1fae5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <RotateCcw size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1e1b4b' }}>7-Day Easy Replacement</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Simple, doorstep reverse pickup with zero hassles or hidden questions asked.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#ede9fe',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#1e1b4b' }}>COD & UPI Storewide</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Pay conveniently with Cash on Delivery or 100% encrypted instant UPI checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
