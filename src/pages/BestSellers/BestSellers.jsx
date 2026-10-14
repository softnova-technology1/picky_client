import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import BestSellersHeroSection from '../../components/bestseller/BestSellersHeroSection';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { MOCK_PRODUCTS } from '../../data/adminMockData';
import { getProducts, SLUG_ALIAS_MAP } from '../../data';
import '../../styles/home-premium.css';
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
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  Truck,
  Headphones,
  Filter,
  ArrowUpDown,
  ChevronDown,
  X,
} from 'lucide-react';

const isBestSellerProduct = (p) => {
  if (!p) return false;
  if (p.isBestSeller) return true;
  if (typeof p.badge === 'string') {
    const b = p.badge.toLowerCase();
    if (b.includes('best') || b.includes('seller')) return true;
  }
  const rawTags = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string'
    ? p.tags.split(',')
    : [];
  return rawTags.some((t) => {
    if (!t) return false;
    const clean = String(t).trim().toLowerCase().replace(/[-_]/g, ' ');
    return clean.includes('best') || clean.includes('seller');
  });
};

const PRICE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'below-199', label: 'Below ₹199', max: 199 },
  { id: 'under-299', label: 'Under ₹299', max: 299 },
  { id: 'under-399', label: 'Under ₹399', max: 399 },
  { id: 'under-499', label: 'Under ₹499', max: 499 },
  { id: 'above-499', label: 'Above ₹499', min: 499 },
];

export default function BestSellers() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('all');
  const catalogRef = useRef(null);
  const tabsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isPointerDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);

  const checkScroll = () => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollTabs = (dir) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    const amount = dir === 'left' ? -260 : 260;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const handleTabsWheel = (e) => {
    const el = tabsScrollRef.current;
    if (!el) return;
    if (e.deltaY !== 0) {
      el.scrollLeft += e.deltaY;
      checkScroll();
    }
  };

  const handleMouseDown = (e) => {
    if (!tabsScrollRef.current) return;
    isPointerDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - tabsScrollRef.current.offsetLeft;
    scrollLeftStart.current = tabsScrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isPointerDown.current || !tabsScrollRef.current) return;
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = x - startX.current;
    if (Math.abs(walk) > 4) {
      hasDragged.current = true;
      tabsScrollRef.current.scrollLeft = scrollLeftStart.current - walk;
      checkScroll();
    }
  };

  const handleMouseUp = () => {
    isPointerDown.current = false;
    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  // Load products (Strictly filter for products with Best Sellers tag)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      const startTime = Date.now();
      try {
        const res = await productService.list({ limit: 100, sort: 'rating' });
        if (isMounted) {
          const items = res?.data?.data || res?.data || [];
          const sourceList = Array.isArray(items) && items.length > 0 ? items : (getProducts() || MOCK_PRODUCTS || []);
          const bestSellersOnly = sourceList.filter(isBestSellerProduct);
          setAllProducts(bestSellersOnly);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = getProducts() || MOCK_PRODUCTS || [];
          const bestSellersOnly = fallback.filter(isBestSellerProduct);
          setAllProducts(bestSellersOnly);
        }
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
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
    { id: 'home-kitchen', label: 'Home & Kitchen', icon: UtensilsCrossed },
    { id: 'artificial-jewellery', label: 'Artificial Jewellery', icon: Gem },
    { id: 'beauty-personal-care', label: 'Beauty & Personal Care', icon: Heart },
    { id: 'mobile-accessories', label: 'Mobile Accessories', icon: Smartphone },
    { id: 'traditional-tamil-products', label: 'Traditional Tamil Products', icon: Crown },
  ];



  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Category filter with slug alias support
    if (activeCategory !== 'all') {
      const targetCat = (SLUG_ALIAS_MAP?.[activeCategory] || activeCategory).toLowerCase();
      list = list.filter((p) => {
        const rawSlug = p.category?.slug || (typeof p.category === 'string' ? p.category : '');
        const pCat = (SLUG_ALIAS_MAP?.[rawSlug] || rawSlug).toLowerCase();
        return pCat === targetCat;
      });
    }

    // Price filter
    if (selectedPriceFilter !== 'all') {
      const f = PRICE_FILTERS.find((item) => item.id === selectedPriceFilter);
      if (f) {
        list = list.filter((p) => {
          const price = Number(p.discountPrice || p.price || 0);
          if (f.max !== undefined && f.min !== undefined) {
            return price >= f.min && price <= f.max;
          }
          if (f.max !== undefined) {
            return price <= f.max;
          }
          if (f.min !== undefined) {
            return price >= f.min;
          }
          return true;
        });
      }
    }

    // Search filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => 
        p.name?.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
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
  }, [allProducts, activeCategory, selectedPriceFilter, sortBy, searchQuery]);

  const hasActiveFilters = activeCategory !== 'all' || searchQuery.trim() !== '' || sortBy !== 'popular' || selectedPriceFilter !== 'all';

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortBy('popular');
    setSelectedPriceFilter('all');
  };

  return (
    <PageWrapper>
      <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Hero Showcase with SVG Doodles & Stamp ── */}
        <BestSellersHeroSection />

        {/* ── 2. Catalog & Interactive Filter Grid Anchor ── */}
        <div className="container" id="bestsellers-grid-start" ref={catalogRef} style={{ scrollMarginTop: '90px', paddingTop: '4.5rem' }}>
          {/* Header Title Section */}
          <div className="bestsellers-catalog-header">
            <div className="bestsellers-badge-kicker">
              <Sparkles size={13} className="bestsellers-badge-kicker-icon" />
              <span>Curated & Top Ranked</span>
            </div>
            <h2 className="bestsellers-main-title">
              Customer Favorites & Top Ranked
            </h2>
            <p className="bestsellers-main-subtitle">
              Explore our best-performing, customer-loved products backed by authentic high ratings
            </p>
          </div>

          {/* ── Unified Premium Filter & Search Hub ── */}
          <div className="bestsellers-premium-hub">
            {/* Top Tier: Budget Quick Filters */}
            <div className="bestsellers-hub-top-row">
              <div className="bestsellers-filter-label-group">
                <span className="bestsellers-filter-label-icon">₹</span>
                <span>BUDGET</span>
              </div>
              <div className="bestsellers-price-filter-cluster" role="group" aria-label="Filter by price">
                {PRICE_FILTERS.map((f) => {
                  const isActive = selectedPriceFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      className={`bestsellers-price-pill ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedPriceFilter(isActive && f.id !== 'all' ? 'all' : f.id)}
                      title={`Filter: ${f.label}`}
                      aria-pressed={isActive}
                    >
                      <span className="price-pill-dot">₹</span>
                      <span className="price-pill-label">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hub Divider */}
            <div className="bestsellers-hub-divider" />

            {/* Bottom Tier: Search & Controls Bar */}
            <div className="bestsellers-hub-controls-row">
              {/* Premium Search Bar with Glowing Icon */}
              <div className="bestsellers-search-premium">
                <div className="bestsellers-search-icon-badge">
                  <Search size={17} strokeWidth={2.4} />
                </div>
                <input
                  type="text"
                  placeholder="Search top products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bestsellers-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="bestsellers-search-clear-btn"
                    title="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Right Controls: Category, Sort, Reset */}
              <div className="bestsellers-hub-right-controls">
                {/* Category Select Dropdown */}
                <div className="bestsellers-select-wrapper">
                  <div className="bestsellers-select-icon">
                    <Filter size={15} strokeWidth={2.2} />
                  </div>
                  <div className="bestsellers-select-content">
                    <span className="bestsellers-select-label">CATEGORY</span>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="bestsellers-custom-select"
                    >
                      {filterTabs.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                          {tab.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ChevronDown size={14} className="bestsellers-select-chevron" />
                </div>

                {/* Sort Selector Dropdown */}
                <div className="bestsellers-select-wrapper">
                  <div className="bestsellers-select-icon">
                    <ArrowUpDown size={15} strokeWidth={2.2} />
                  </div>
                  <div className="bestsellers-select-content">
                    <span className="bestsellers-select-label">SORT BY</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bestsellers-custom-select"
                    >
                      <option value="popular">Best Selling</option>
                      <option value="newest">Newest</option>
                      <option value="price-low">Price Low → High</option>
                      <option value="price-high">Price High → Low</option>
                    </select>
                  </div>
                  <ChevronDown size={14} className="bestsellers-select-chevron" />
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="bestsellers-reset-btn"
                    title="Reset all filters"
                  >
                    <RotateCcw size={14} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
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
                Try relaxing the rating or search filter to see more top items.
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

          {/* ── 3. Quality Guarantee & Buyer Trust Strip ── */}
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
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: '#1e1b4b' }}>CAREFULLY SELECTED PRODUCTS</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Thoughtfully selected products for fashion, home, lifestyle, and everyday needs.
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
                <ShoppingBag size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: '#1e1b4b' }}>EASY SHOPPING EXPERIENCE</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Simple product discovery, clear pricing, and a smooth shopping journey.
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
                <Truck size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: '#1e1b4b' }}>RELIABLE ORDER UPDATES</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Track your order from confirmation to shipping and delivery through your order details.
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
                <Headphones size={26} />
              </div>
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.98rem', color: '#1e1b4b' }}>CUSTOMER SUPPORT</h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Get help with your order, products, delivery, or other shopping questions.
              </p>
            </div>
          </div>

          {/* ── 4. Final Community CTA Banner ── */}
          <section className="hp-final-cta-section" style={{ paddingTop: '3.5rem', paddingBottom: '0.5rem' }}>
            <div className="hp-final-cta-container" style={{ padding: 0 }}>
              <div className="hp-final-cta-box">
                <span className="hp-final-cta-badge">✦ JOIN OUR COMMUNITY</span>
                <h2 className="hp-final-title">Connect With Us @picky.co.in</h2>
                <p className="hp-final-subtitle">
                  Follow us on Instagram & WhatsApp for daily style inspiration, exclusive drops, and behind-the-scenes stories.
                </p>
                <div className="hp-final-cta-btn-group no-hover-fx">
                  <button
                    type="button"
                    className="hp-final-cta-btn no-hover-fx"
                    onClick={() => window.open('https://www.instagram.com/picky.co.in/', '_blank', 'noopener,noreferrer')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>Follow on Instagram</span>
                    <ArrowRight size={16} />
                  </button>

                  <button
                    type="button"
                    className="hp-final-cta-outline-btn no-hover-fx"
                    onClick={() => window.open('https://wa.me/918300295721?text=Hi%20Picky!%20I%20would%20like%20to%20join%20the%20community.', '_blank', 'noopener,noreferrer')}
                    aria-label="Join WhatsApp Group"
                    title="Join WhatsApp Group"
                  >
                    <svg className="hp-cta-wa-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                    </svg>
                    <span className="hp-cta-wa-label">
                      <span>Join WhatsApp Group</span>
                      <ArrowRight size={16} />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
