import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import BestSellersHeroSection from '../../components/bestseller/BestSellersHeroSection';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { MOCK_PRODUCTS } from '../../data/adminMockData';
import { getProducts, SLUG_ALIAS_MAP } from '../../data';
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

export default function BestSellers() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Dynamic counts for each tab
  const tabCounts = useMemo(() => {
    const counts = { all: allProducts.length };
    allProducts.forEach((p) => {
      const rawSlug = p.category?.slug || (typeof p.category === 'string' ? p.category : '');
      const slug = (SLUG_ALIAS_MAP?.[rawSlug] || rawSlug).toLowerCase();
      if (slug) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

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
  }, [allProducts, activeCategory, sortBy, searchQuery]);

  const hasActiveFilters = activeCategory !== 'all' || searchQuery.trim() !== '' || sortBy !== 'popular';

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchQuery('');
    setSortBy('popular');
  };

  return (
    <PageWrapper bg="#faf5ff">
      <div style={{ background: '#faf5ff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Hero Showcase with SVG Doodles & Stamp ── */}
        <BestSellersHeroSection />

        {/* ── 2. Catalog & Interactive Filter Grid Anchor ── */}
        <div className="container" id="bestsellers-grid-start" ref={catalogRef} style={{ scrollMarginTop: '90px', paddingTop: '4.5rem' }}>
          {/* Header Title Row */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h2
              style={{
                fontFamily: 'var(--font-primary, system-ui, sans-serif)',
                fontSize: 'clamp(1.7rem, 3.2vw, 2.4rem)',
                fontWeight: 900,
                color: '#1e1b4b',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Customer Favorites & Top Ranked
            </h2>
          </div>

          {/* Full Width Controls Bar (Search, Category, Sort, Reset, Shop All) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              gap: '1rem',
              flexWrap: 'wrap',
              marginBottom: '2rem',
            }}
          >
            {/* Search Bar (flex 1 on left) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '0.55rem 1rem',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                flex: '1 1 280px',
                maxWidth: '420px',
              }}
            >
              <Search size={16} color="#64748b" style={{ marginRight: '0.5rem', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: '0.86rem',
                  color: '#1e293b',
                  background: 'transparent',
                }}
              />
            </div>

            {/* Right Controls Group */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginLeft: 'auto',
              }}
            >
              {/* Category Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>CATEGORY:</span>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  style={{
                    padding: '0.55rem 1rem',
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
                  {filterTabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label} ({tabCounts[tab.id] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>SORT:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '0.55rem 1rem',
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
                  <option value="popular">Best Selling</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price Low → High</option>
                  <option value="price-high">Price High → Low</option>
                </select>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.55rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1.5px solid #fee2e2',
                    background: '#fef2f2',
                    color: '#dc2626',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              )}

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
        </div>
      </div>
    </PageWrapper>
  );
}
