import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import BestSellersHeroSection from '../../components/bestseller/BestSellersHeroSection';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { getProducts, SLUG_ALIAS_MAP } from '../../data';
import { usePageCustomization } from '../../store/customizationStore';
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
  Clock,
  Gift,
  Package,
} from 'lucide-react';

const renderTrustIcon = (iconName, fallbackIcon, size = 26) => {
  const iconMap = {
    Award: <Award size={size} />,
    ShoppingBag: <ShoppingBag size={size} />,
    Truck: <Truck size={size} />,
    Headphones: <Headphones size={size} />,
    ShieldCheck: <ShieldCheck size={size} />,
    Sparkles: <Sparkles size={size} />,
    RotateCcw: <RotateCcw size={size} />,
    Heart: <Heart size={size} />,
    Star: <Star size={size} />,
    Zap: <Zap size={size} />,
    CheckCircle2: <CheckCircle2 size={size} />,
    Tag: <Tag size={size} />,
    Clock: <Clock size={size} />,
    Gift: <Gift size={size} />,
    Package: <Package size={size} />,
  };
  return iconMap[iconName] || fallbackIcon;
};

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
  const { isEnabled, getSetting } = usePageCustomization('best_sellers');
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState(() => getSetting('best_sellers_feed', 'defaultSort', 'popular'));
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
          const sourceList = Array.isArray(items) ? items : [];
          const bestSellersOnly = sourceList.filter(isBestSellerProduct);
          setAllProducts(bestSellersOnly);
        }
      } catch (err) {
        if (isMounted) {
          setAllProducts([]);
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
        {isEnabled('best_sellers_hero') && <BestSellersHeroSection />}

        {/* ── 2. Catalog & Interactive Filter Grid Anchor ── */}
        {isEnabled('best_sellers_feed') && (
          <div className="container bestsellers-catalog-container" id="bestsellers-grid-start" ref={catalogRef}>
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

            {/* ── 1. Filter & Budget Pill Bar (Horizontal Scrollable) ── */}
            {getSetting('best_sellers_feed', 'showBudgetFilters', true) && (
              <div className="bestsellers-budget-pill-bar">
                <div className="bestsellers-budget-label-pill">
                  <span className="budget-currency-icon">₹</span>
                  <span>{getSetting('best_sellers_feed', 'budgetLabel', 'BUDGET')}</span>
                </div>
                <div className="bestsellers-budget-scroll-track no-scrollbar" role="group" aria-label="Filter by price">
                  {PRICE_FILTERS.map((f) => {
                    const isActive = selectedPriceFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        className={`bestsellers-budget-pill ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedPriceFilter(isActive && f.id !== 'all' ? 'all' : f.id)}
                        title={`Filter: ${f.label}`}
                        aria-pressed={isActive}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 2. Category & Sort By Selectors Card ── */}
            <div className="bestsellers-compact-controls-box">
              {/* Category & Sort By Selectors in 2-Column Grid */}
              <div className="bestsellers-compact-selectors-grid">
                {/* Category Selector */}
                <div className="bestsellers-compact-select-btn">
                  <div className="bestsellers-select-btn-content">
                    <span className="bestsellers-select-btn-label">CATEGORY</span>
                    <span className="bestsellers-select-btn-value">
                      {filterTabs.find((t) => t.id === activeCategory)?.label || 'All Best Sellers'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="bestsellers-select-btn-chevron" />
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="bestsellers-invisible-native-select"
                    aria-label="Filter by category"
                  >
                    {filterTabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By Selector */}
                <div className="bestsellers-compact-select-btn">
                  <div className="bestsellers-select-btn-content">
                    <span className="bestsellers-select-btn-label">SORT BY</span>
                    <span className="bestsellers-select-btn-value">
                      {sortBy === 'popular'
                        ? 'Best Selling'
                        : sortBy === 'newest'
                        ? 'Newest'
                        : sortBy === 'price-low'
                        ? 'Price Low → High'
                        : sortBy === 'price-high'
                        ? 'Price High → Low'
                        : 'Best Selling'}
                    </span>
                  </div>
                  <ChevronDown size={14} className="bestsellers-select-btn-chevron" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bestsellers-invisible-native-select"
                    aria-label="Sort products"
                  >
                    <option value="popular">Best Selling</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price Low → High</option>
                    <option value="price-high">Price High → Low</option>
                  </select>
                </div>
              </div>

              {/* Reset active filters */}
              {hasActiveFilters && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="bestsellers-reset-btn"
                    title="Reset all filters"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Filters</span>
                  </button>
                </div>
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
                  {getSetting('best_sellers_feed', 'emptyMessage', 'No Best Sellers Matched These Filters')}
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
          </div>
        )}

        <div className="container" style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1rem' }}>
          {/* ── 3. Buyer Value Proposition (Trust 4 Features Card) ── */}
          {isEnabled('best_sellers_trust_strip') && (
            <div className="bestsellers-trust-card">
              {/* Feature 1 */}
              <div className="bestsellers-trust-item">
                <div className="trust-squircle-badge purple">
                  {getSetting('best_sellers_trust_strip', 'pillar1CustomIcon', '') ? (
                    <img
                      src={getSetting('best_sellers_trust_strip', 'pillar1CustomIcon', '')}
                      alt={getSetting('best_sellers_trust_strip', 'pillar1Title', 'CAREFULLY SELECTED PRODUCTS')}
                      className="trust-custom-img"
                    />
                  ) : (
                    renderTrustIcon(getSetting('best_sellers_trust_strip', 'pillar1Icon', 'Award'), <Award size={20} />, 20)
                  )}
                </div>
                <div className="trust-text-wrap">
                  <h4 className="trust-pillar-title">
                    {getSetting('best_sellers_trust_strip', 'pillar1Title', 'CAREFULLY SELECTED PRODUCTS')}
                  </h4>
                  <p className="trust-pillar-desc">
                    {getSetting('best_sellers_trust_strip', 'pillar1Desc', 'Thoughtfully selected products for fashion, home, lifestyle, and everyday needs.')}
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bestsellers-trust-item border-top">
                <div className="trust-squircle-badge amber">
                  {getSetting('best_sellers_trust_strip', 'pillar2CustomIcon', '') ? (
                    <img
                      src={getSetting('best_sellers_trust_strip', 'pillar2CustomIcon', '')}
                      alt={getSetting('best_sellers_trust_strip', 'pillar2Title', 'EASY SHOPPING EXPERIENCE')}
                      className="trust-custom-img"
                    />
                  ) : (
                    renderTrustIcon(getSetting('best_sellers_trust_strip', 'pillar2Icon', 'ShoppingBag'), <ShoppingBag size={20} />, 20)
                  )}
                </div>
                <div className="trust-text-wrap">
                  <h4 className="trust-pillar-title">
                    {getSetting('best_sellers_trust_strip', 'pillar2Title', 'EASY SHOPPING EXPERIENCE')}
                  </h4>
                  <p className="trust-pillar-desc">
                    {getSetting('best_sellers_trust_strip', 'pillar2Desc', 'Simple product discovery, clear pricing, and a smooth shopping journey.')}
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bestsellers-trust-item border-top">
                <div className="trust-squircle-badge emerald">
                  {getSetting('best_sellers_trust_strip', 'pillar3CustomIcon', '') ? (
                    <img
                      src={getSetting('best_sellers_trust_strip', 'pillar3CustomIcon', '')}
                      alt={getSetting('best_sellers_trust_strip', 'pillar3Title', 'RELIABLE ORDER UPDATES')}
                      className="trust-custom-img"
                    />
                  ) : (
                    renderTrustIcon(getSetting('best_sellers_trust_strip', 'pillar3Icon', 'Truck'), <Truck size={20} />, 20)
                  )}
                </div>
                <div className="trust-text-wrap">
                  <h4 className="trust-pillar-title">
                    {getSetting('best_sellers_trust_strip', 'pillar3Title', 'RELIABLE ORDER UPDATES')}
                  </h4>
                  <p className="trust-pillar-desc">
                    {getSetting('best_sellers_trust_strip', 'pillar3Desc', 'Track your order from confirmation to shipping and delivery through your order details.')}
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bestsellers-trust-item border-top">
                <div className="trust-squircle-badge indigo">
                  {getSetting('best_sellers_trust_strip', 'pillar4CustomIcon', '') ? (
                    <img
                      src={getSetting('best_sellers_trust_strip', 'pillar4CustomIcon', '')}
                      alt={getSetting('best_sellers_trust_strip', 'pillar4Title', 'CUSTOMER SUPPORT')}
                      className="trust-custom-img"
                    />
                  ) : (
                    renderTrustIcon(getSetting('best_sellers_trust_strip', 'pillar4Icon', 'Headphones'), <Headphones size={20} />, 20)
                  )}
                </div>
                <div className="trust-text-wrap">
                  <h4 className="trust-pillar-title">
                    {getSetting('best_sellers_trust_strip', 'pillar4Title', 'CUSTOMER SUPPORT')}
                  </h4>
                  <p className="trust-pillar-desc">
                    {getSetting('best_sellers_trust_strip', 'pillar4Desc', 'Get help with your order, products, delivery, or other shopping questions.')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── 4. Illustrated Shopping Divider ── */}
          <div className="bestsellers-illustrated-divider" aria-hidden="true">
            <div className="bestsellers-illustrated-divider-track">
              <span className="divider-icon">🛒</span>
              <span className="divider-icon">🛍️</span>
              <span className="divider-icon">📦</span>
              <span className="divider-icon">🏷️</span>
              <span className="divider-icon">🛍️</span>
              <span className="divider-icon">🛒</span>
              <span className="divider-icon">🎁</span>
            </div>
          </div>

          {/* ── 5. Community Connection Banner ── */}
          {isEnabled('best_sellers_community') && (
            <div className="bestsellers-community-section">
              <div className="bestsellers-editorial-card">
                <div className="bestsellers-glow-ambient" />
                <div className="bestsellers-community-badge">
                  {getSetting('best_sellers_community', 'badgeText', '✦ JOIN OUR COMMUNITY')}
                </div>
                <h3 className="bestsellers-community-title">
                  {getSetting('best_sellers_community', 'title', 'Connect With Us @picky.co.in')}
                </h3>
                <p className="bestsellers-community-desc">
                  {getSetting('best_sellers_community', 'subtitle', 'Follow us on Instagram & WhatsApp for daily style inspiration and exclusive drops.')}
                </p>
                <div className="bestsellers-community-actions">
                  <a
                    className="bestsellers-ig-btn"
                    href={getSetting('best_sellers_community', 'instagramLink', 'https://instagram.com/picky.co.in')}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Follow on Instagram</span>
                    <ArrowRight size={14} />
                  </a>
                  <a
                    aria-label="WhatsApp Community"
                    className="bestsellers-wa-bubble"
                    href={`https://wa.me/${getSetting('best_sellers_community', 'whatsappNumber', '918300295721').replace(/\D/g, '')}?text=Hi%20Picky!%20I%20would%20like%20to%20join%20the%20community.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="wa-bubble-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.149.929 3.182 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.768-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.062-2.124-.531-1.745-.724-2.87-2.484-2.957-2.6-.088-.115-.705-.939-.705-1.792 0-.853.448-1.272.607-1.446.16-.175.348-.219.464-.219.116 0 .232.001.333.006.107.005.25-.041.391.298.144.348.493 1.202.536 1.29.043.087.072.189.014.304-.058.116-.087.189-.174.29-.087.102-.183.228-.261.306-.087.087-.178.182-.077.355.101.174.45 7.42 1.488 1.933.268.239.494.391.668.447.175.056.333.049.458.03.14-.021.433-.177.494-.348zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.982-1.308C8.423 21.536 10.151 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
