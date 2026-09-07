import React, { useState, useMemo, useRef, useEffect } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import NewArrivalsHero from '../components/new-arrivals/NewArrivalsHero';
import ProductCard from '../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../data/adminMockData';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NewArrivals() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSort, setActiveSort] = useState('fresh'); // 'fresh' | 'trending' | 'price-low' | 'price-high'
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under500' | '500-1500' | '1500-3000' | 'above3000'
  const [discountFilter, setDiscountFilter] = useState('all'); // 'all' | '10' | '20' | '30' | '50'
  const [expressOnly, setExpressOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);
  const [artisanOnly, setArtisanOnly] = useState(false);
  const [isFilterFolderOpen, setIsFilterFolderOpen] = useState(false);
  const catalogRef = useRef(null);

  // 1. Live Countdown Timer for Next Drop (Ticks every second)
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 38,
    seconds: 24,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 6, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 10 Core Store Categories + All Drops as Circular Story Avatars (100% Radius)
  const categoryStories = [
    {
      id: 'all',
      label: 'All Drops',
      icon: 'sparkles',
    },
    {
      id: 'womens-fashion',
      label: "Women's",
      image: '/images/products/saree.png',
    },
    {
      id: 'home-kitchen',
      label: 'Kitchen',
      image: '/images/products/chopper.png',
    },
    {
      id: 'artificial-jewellery',
      label: 'Jewellery',
      image: '/images/products/necklace.png',
    },
    {
      id: 'beauty-personal-care',
      label: 'Beauty',
      image: '/images/products/sunglasses.png',
    },
    {
      id: 'mobile-accessories',
      label: 'Mobiles',
      image: '/images/products/headphones.png',
    },
    {
      id: 'traditional-tamil-products',
      label: 'Heritage',
      image: '/images/products/gold_ring.png',
    },
    {
      id: 'snacks-foods',
      label: 'Snacks',
      image: '/images/products/murukku.png',
    },
    {
      id: 'home-decor',
      label: 'Décor',
      image: '/images/products/speaker.png',
    },
    {
      id: 'kids-products',
      label: 'Kids',
      image: '/images/products/camera.png',
    },
    {
      id: 'fitness-products',
      label: 'Fitness',
      image: '/images/products/yogamat.png',
    },
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

  // Filter & Sort Products Dynamically
  const processedProducts = useMemo(() => {
    let list = [...MOCK_PRODUCTS];

    // 1. Category Filter (synced with 10 circular bubbles)
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category?.slug === activeCategory);
    }

    // 2. Price Range Filter
    if (priceRange === 'under500') {
      list = list.filter((p) => (p.discountPrice || p.price) < 500);
    } else if (priceRange === '500-1500') {
      list = list.filter((p) => {
        const pr = p.discountPrice || p.price;
        return pr >= 500 && pr <= 1500;
      });
    } else if (priceRange === '1500-3000') {
      list = list.filter((p) => {
        const pr = p.discountPrice || p.price;
        return pr > 1500 && pr <= 3000;
      });
    } else if (priceRange === 'above3000') {
      list = list.filter((p) => (p.discountPrice || p.price) > 3000);
    }

    // 3. Discount Tier Filter
    if (discountFilter !== 'all') {
      const minDisc = parseInt(discountFilter, 10);
      list = list.filter((p) => {
        if (!p.discountPrice || p.discountPrice >= p.price) return false;
        const disc = Math.round(((p.price - p.discountPrice) / p.price) * 100);
        return disc >= minDisc;
      });
    }

    // 4. Express Dispatch Filter
    if (expressOnly) {
      list = list.filter(
        (p) =>
          p.isExpress ||
          p.tags?.includes('Express') ||
          p.category?.slug === 'womens-fashion' ||
          p.category?.slug === 'mobile-accessories'
      );
    }

    // 5. In-Stock Only
    if (inStockOnly) {
      list = list.filter((p) => (p.stock || 0) > 0);
    }

    // 6. Free Delivery Filter
    if (freeDeliveryOnly) {
      list = list.filter((p) => {
        const pr = p.discountPrice || p.price;
        return pr >= 699 || p.tags?.includes('Free Delivery') || p.isFreeDelivery;
      });
    }

    // 7. Artisan / Handcrafted & Heritage Only
    if (artisanOnly) {
      list = list.filter((p) => {
        const cat = p.category?.slug;
        const tags = (p.tags || []).join(' ').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return (
          cat === 'traditional-tamil-products' ||
          cat === 'artificial-jewellery' ||
          tags.includes('handloom') ||
          tags.includes('artisan') ||
          tags.includes('zari') ||
          tags.includes('traditional') ||
          desc.includes('handloom') ||
          desc.includes('handcrafted')
        );
      });
    }

    // 8. Sort Order
    if (activeSort === 'trending') {
      list.sort(
        (a, b) =>
          (b.discountPrice ? b.price - b.discountPrice : 0) -
          (a.discountPrice ? a.price - a.discountPrice : 0)
      );
    } else if (activeSort === 'price-low') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (activeSort === 'price-high') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }

    return list;
  }, [
    activeCategory,
    activeSort,
    priceRange,
    discountFilter,
    expressOnly,
    inStockOnly,
    freeDeliveryOnly,
    artisanOnly,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (priceRange !== 'all') count++;
    if (discountFilter !== 'all') count++;
    if (expressOnly) count++;
    if (inStockOnly) count++;
    if (freeDeliveryOnly) count++;
    if (artisanOnly) count++;
    if (activeSort !== 'fresh') count++;
    return count;
  }, [priceRange, discountFilter, expressOnly, inStockOnly, freeDeliveryOnly, artisanOnly, activeSort]);

  const handleResetAllFilters = () => {
    setActiveCategory('all');
    setActiveSort('fresh');
    setPriceRange('all');
    setDiscountFilter('all');
    setExpressOnly(false);
    setInStockOnly(false);
    setFreeDeliveryOnly(false);
    setArtisanOnly(false);
  };

  const handleScrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageWrapper>
      <div style={{ background: '#faf5ff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Streetwear Hero Showcase & Docked Floating Drop Timing Island (50% Bottom Overlap) ── */}
        <div style={{ paddingTop: '1.75rem', position: 'relative' }}>
          <NewArrivalsHero onExploreClick={handleScrollToCatalog} />

          {/* Floating Drop Status & Urgency Island (Overlaps bottom edge 50%) */}
          <div className="hero-docked-timing-bar">
            <div className="container">
              <div className="drop-status-bar">
                {/* Feature 1: Live Next Drop Countdown */}
                <div className="drop-countdown-pod">
                  <span className="countdown-pulse-dot" />
                  <div className="countdown-label-group">
                    <Clock size={16} strokeWidth={2.4} color="#7c3aed" />
                    <span className="countdown-title">Next Fresh Drop In:</span>
                  </div>
                  <div className="countdown-digits-cluster">
                    <span className="digit-box">{String(timeLeft.hours).padStart(2, '0')}h</span>
                    <span className="digit-sep">:</span>
                    <span className="digit-box">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                    <span className="digit-sep">:</span>
                    <span className="digit-box digit-sec">{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </div>
                </div>

                {/* Feature 5: Live Activity Social Proof (NO Rating!) */}
                <div className="drop-activity-pod">
                  <div className="activity-live-badge">
                    <span className="live-ping-dot" />
                    <span>LIVE ACTIVITY</span>
                  </div>
                  <span className="activity-text">
                    <strong style={{ color: '#1e1b4b' }}>38 shoppers</strong> viewing drops right now • <strong style={{ color: '#059669' }}>19 orders</strong> dispatched in the last 2h
                  </span>
                </div>
              </div>
            </div>
          </div>
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
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
                  fontWeight: 900,
                  color: '#1e1b4b',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Explore Fresh Arrivals
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

          {/* ── 10 Circular Category Stories with Top-Right Notification Count Badges (Radius 100%) ── */}
          <div className="circular-categories-wrapper">
            <div className="circular-categories-track">
              {categoryStories.map((item) => {
                const isActive = activeCategory === item.id;
                const count = tabCounts[item.id] || 0;
                const hasNew = count > 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveCategory(item.id)}
                    className={`category-story-item ${isActive ? 'active' : ''}`}
                    title={`${item.label} (${count} fresh drops)`}
                  >
                    {/* 100% Circular Avatar Container */}
                    <div className={`story-circle-pod ${hasNew ? 'has-new-border' : ''}`}>
                      {/* Notification Count Badge (Top-Right) */}
                      {count > 0 && (
                        <span className="story-notification-badge">
                          {count}
                        </span>
                      )}

                      {/* Inner 100% Round Mask for High Detail Zoomed Content */}
                      <div className="story-circle-inner">
                        {item.icon === 'sparkles' ? (
                          <div className="story-all-drops-icon">
                            <Sparkles size={28} strokeWidth={2.5} />
                          </div>
                        ) : (
                          <img
                            src={item.image}
                            alt={item.label}
                            className={`story-circle-img img-${item.id}`}
                            loading="lazy"
                          />
                        )}
                      </div>
                    </div>

                    {/* Category Label Below Circle */}
                    <span className="story-label-text">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Feature 2: Dedicated Filter Folder Bar ── */}
          <div className="sort-filter-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* 📁 Filter Folder Toggle Button */}
              <button
                onClick={() => setIsFilterFolderOpen((prev) => !prev)}
                className={`sort-pill folder-toggle-btn ${isFilterFolderOpen ? 'open' : ''} ${
                  activeFiltersCount > 0 ? 'has-active' : ''
                }`}
                title="Open Advanced Filter Folder"
              >
                <SlidersHorizontal size={15} />
                <span>Filter Folder</span>
                {activeFiltersCount > 0 && (
                  <span className="folder-count-badge">{activeFiltersCount}</span>
                )}
                <ChevronDown
                  size={15}
                  style={{
                    transform: isFilterFolderOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s ease',
                  }}
                />
              </button>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetAllFilters}
                  className="clear-all-pill-btn"
                  title="Reset all filters"
                >
                  <RotateCcw size={13} />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Expandable Filter Folder Tray (Unfolds when toggled) ── */}
          {isFilterFolderOpen && (
            <div className="filter-folder-panel">
              <div className="folder-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <SlidersHorizontal size={17} color="#7c3aed" />
                  <strong style={{ color: '#1e1b4b', fontSize: '1rem', fontWeight: 800 }}>
                    Curated Filter Folder
                  </strong>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    • Tailor your fresh drops
                  </span>
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={handleResetAllFilters} className="folder-reset-link">
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="folder-sections-grid">
                {/* 1. Price Range Filters */}
                <div className="folder-filter-col">
                  <span className="col-label">Price Range</span>
                  <div className="col-chips-group">
                    {[
                      { id: 'all', label: 'All Prices' },
                      { id: 'under500', label: 'Under ₹500' },
                      { id: '500-1500', label: '₹500 - ₹1,500' },
                      { id: '1500-3000', label: '₹1,500 - ₹3,000' },
                      { id: 'above3000', label: 'Above ₹3,000' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setPriceRange(item.id)}
                        className={`folder-chip ${priceRange === item.id ? 'active' : ''}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Discount Tiers */}
                <div className="folder-filter-col">
                  <span className="col-label">Discount Tiers</span>
                  <div className="col-chips-group">
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: '10', label: '10% OFF+' },
                      { id: '20', label: '20% OFF+' },
                      { id: '30', label: '30% OFF+' },
                      { id: '50', label: '50% OFF+' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setDiscountFilter(item.id)}
                        className={`folder-chip ${discountFilter === item.id ? 'active' : ''}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Sort Priority */}
                <div className="folder-filter-col">
                  <span className="col-label">Sort Priority</span>
                  <div className="col-chips-group">
                    {[
                      { id: 'fresh', label: '✨ Freshest Drop' },
                      { id: 'trending', label: '🔥 Fast Moving' },
                      { id: 'price-low', label: 'Price: Low to High' },
                      { id: 'price-high', label: 'Price: High to Low' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSort(item.id)}
                        className={`folder-chip ${activeSort === item.id ? 'active' : ''}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Special Drops & Craft */}
                <div className="folder-filter-col">
                  <span className="col-label">Special Drops & Craft</span>
                  <div className="col-chips-group">
                    <button
                      onClick={() => setArtisanOnly((prev) => !prev)}
                      className={`folder-chip ${artisanOnly ? 'active' : ''}`}
                    >
                      ✨ Handloom & Artisan
                    </button>
                    <button
                      onClick={() => setFreeDeliveryOnly((prev) => !prev)}
                      className={`folder-chip ${freeDeliveryOnly ? 'active' : ''}`}
                    >
                      🚚 Free Shipping
                    </button>
                  </div>
                </div>

                {/* 5. Speed & Availability */}
                <div className="folder-filter-col">
                  <span className="col-label">Speed & Availability</span>
                  <div className="col-chips-group">
                    <button
                      onClick={() => setExpressOnly((prev) => !prev)}
                      className={`folder-chip ${expressOnly ? 'active' : ''}`}
                    >
                      ⚡ 24h Express Only
                    </button>
                    <button
                      onClick={() => setInStockOnly((prev) => !prev)}
                      className={`folder-chip ${inStockOnly ? 'active' : ''}`}
                    >
                      ✅ In Stock Only
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid with Generous Spacing & Spotlight Banner */}
          {processedProducts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #ede9fe',
                marginBottom: '4rem',
              }}
            >
              <h3 style={{ color: '#1e1b4b', fontWeight: 800, marginBottom: '0.5rem' }}>
                No products match this filter
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Try selecting "All Drops" or reset your sort criteria.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveSort('fresh');
                }}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* First 4 Products Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                  gap: '2.2rem 1.6rem',
                  marginBottom: processedProducts.length > 4 ? '3rem' : '4.5rem',
                }}
              >
                {processedProducts.slice(0, 4).map((prod, idx) => (
                  <ProductCard key={prod._id || prod.id} product={prod} index={idx} />
                ))}
              </div>

              {/* ── Feature 4: Curated Drop of the Week Editorial Spotlight Banner ── */}
              <div className="curated-drop-banner">
                <div className="curated-drop-content">
                  <div className="curated-drop-badge">
                    <Sparkles size={14} />
                    <span>Curated Drop of the Week</span>
                  </div>
                  <h3 className="curated-drop-title">
                    The Minimalist Streetwear Edit
                  </h3>
                  <p className="curated-drop-desc">
                    Handcrafted 100% bio-washed heavy cotton silhouette paired with tactical expedition accessories. Freshly dropped & ready to ship.
                  </p>

                  <div className="curated-drop-perks">
                    <div className="perk-item">
                      <Zap size={15} color="#c084fc" />
                      <span>Ready for 24h Express Dispatch</span>
                    </div>
                    <div className="perk-item">
                      <ShieldCheck size={15} color="#c084fc" />
                      <span>Quality Inspected Heavy Cotton Fabric</span>
                    </div>
                  </div>

                  <div className="curated-drop-cta-row">
                    <button
                      onClick={() => {
                        setActiveCategory('womens-fashion');
                        setActiveSort('fresh');
                        handleScrollToCatalog();
                      }}
                      className="curated-drop-btn"
                    >
                      <span>Explore Featured Drop</span>
                      <ArrowRight size={16} />
                    </button>
                    <span className="curated-drop-counter-tag">⚡ Only 22 Sets Remaining</span>
                  </div>
                </div>

                <div className="curated-drop-visual">
                  <div className="curated-visual-card">
                    <img
                      src="/images/featured_look_hoodie.jpg"
                      alt="Curated Streetwear Edit"
                      className="curated-visual-img"
                      loading="lazy"
                    />
                    <div className="curated-visual-glass-pill">
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.92rem', color: '#ffffff' }}>
                          Oversized Core Hoodie
                        </strong>
                        <span style={{ fontSize: '0.78rem', color: '#e9d5ff' }}>
                          Heavy 380 GSM Cotton Fleece
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '1.15rem', fontWeight: 900, color: '#facc15' }}>
                          ₹899
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', textDecoration: 'line-through' }}>
                          ₹1,499
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remaining Products Grid */}
              {processedProducts.length > 4 && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
                    gap: '2.2rem 1.6rem',
                    marginBottom: '4.5rem',
                  }}
                >
                  {processedProducts.slice(4).map((prod, idx) => (
                    <ProductCard key={prod._id || prod.id} product={prod} index={idx + 4} />
                  ))}
                </div>
              )}
            </>
          )}
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

        /* ── 10 Circular Category Stories Bar ── */
        .circular-categories-wrapper {
          margin: 0.5rem 0 2.5rem 0;
          width: 100%;
          position: relative;
        }

        .circular-categories-track {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          width: 100%;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.8rem 0.2rem 1.2rem 0.2rem;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .circular-categories-track::-webkit-scrollbar {
          display: none;
        }

        /* Individual Story Avatar Item - Distributed Full Width */
        .category-story-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.55rem;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          outline: none;
          flex: 1 1 0px;
          min-width: 66px;
          max-width: 105px;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        .category-story-item:hover {
          transform: translateY(-4px);
        }

        /* 100% Round Circular Pod (Avatar) */
        .story-circle-pod {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 2.5px solid #ede9fe;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: visible;
        }

        /* 🌟 Theme Matched Border Color for Categories with New Products / Notifications */
        .story-circle-pod.has-new-border {
          border: 2.5px solid #a855f7;
          box-shadow: 0 0 0 2px #ffffff, 0 0 0 4.5px rgba(168, 85, 247, 0.35), 0 6px 18px rgba(124, 58, 237, 0.18);
        }

        .category-story-item:hover .story-circle-pod.has-new-border {
          border-color: #7c3aed;
          box-shadow: 0 0 0 2px #ffffff, 0 0 0 5.5px rgba(124, 58, 237, 0.5), 0 8px 22px rgba(124, 58, 237, 0.28);
        }

        /* Active Selected Story Ring (Dual Luxury Ring) */
        .category-story-item.active .story-circle-pod {
          border-color: #7c3aed !important;
          background: linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%) !important;
          box-shadow: 0 0 0 2.5px #ffffff, 0 0 0 5.5px #7c3aed, 0 8px 24px rgba(124, 58, 237, 0.35) !important;
          transform: scale(1.06);
        }

        /* Inner 100% Round Mask for High-Detail Zoomed Image */
        .story-circle-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
        }

        /* Top-Right Notification Count Badge */
        .story-notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
          color: #ffffff;
          font-size: 0.74rem;
          font-weight: 900;
          min-width: 23px;
          height: 23px;
          padding: 0 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.5);
          z-index: 5;
          letter-spacing: -0.01em;
          line-height: 1;
          transition: transform 0.2s ease, background 0.2s ease;
        }

        .category-story-item.active .story-notification-badge {
          background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%);
          box-shadow: 0 3px 10px rgba(109, 40, 217, 0.65);
          transform: scale(1.1);
        }

        /* All Drops Sparkles Circle */
        .story-all-drops-icon {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.3);
        }

        /* 100% Round Category Small Image - Zoomed & High Detail */
        .story-circle-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 2px;
          transform: scale(1.36);
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.08));
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Individual category fine-tuned zoom for optimal visual fill */
        .story-circle-img.img-home-kitchen {
          transform: scale(1.48);
        }
        .story-circle-img.img-beauty-personal-care {
          transform: scale(1.48);
        }
        .story-circle-img.img-artificial-jewellery {
          transform: scale(1.38);
        }
        .story-circle-img.img-traditional-tamil-products {
          transform: scale(1.44);
        }
        .story-circle-img.img-womens-fashion {
          transform: scale(1.36);
        }

        .category-story-item:hover .story-circle-img {
          transform: scale(1.52);
        }
        .category-story-item:hover .story-circle-img.img-home-kitchen,
        .category-story-item:hover .story-circle-img.img-beauty-personal-care,
        .category-story-item:hover .story-circle-img.img-traditional-tamil-products {
          transform: scale(1.6);
        }

        /* Category Label Text Below Circle */
        .story-label-text {
          font-size: 0.82rem;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          max-width: 88px;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #475569;
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }

        .category-story-item:hover .story-label-text {
          color: #7c3aed;
        }

        .category-story-item.active .story-label-text {
          color: #7c3aed;
          font-weight: 800;
        }

        /* ── Feature 1 & 5: Live Drop Countdown & Activity Bar (50% Overlap Docked Island, NO RATING) ── */
        .hero-docked-timing-bar {
          position: relative;
          margin-top: -38px; /* 50% bottom overlap docking into the hero section */
          z-index: 30;
          margin-bottom: 2.8rem;
        }

        .drop-status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 72px; /* Increased height as requested */
          background: linear-gradient(180deg, #ffffff 0%, #faf8ff 50%, #f5edff 100%); /* Gorgeous rich background */
          border: 2px solid #ede9fe;
          border-radius: 9999px;
          padding: 1rem 2.2rem;
          box-shadow: 0 16px 45px -8px rgba(124, 58, 237, 0.22), 0 4px 18px rgba(0, 0, 0, 0.05);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .drop-countdown-pod {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .countdown-pulse-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.25);
          animation: pingDot 1.8s infinite;
        }

        .countdown-label-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .countdown-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e1b4b;
        }

        .countdown-digits-cluster {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .digit-box {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff;
          font-size: 0.9rem;
          font-weight: 900;
          padding: 0.32rem 0.65rem;
          border-radius: 8px;
          box-shadow: 0 3px 10px rgba(124, 58, 237, 0.35);
          font-family: monospace;
          letter-spacing: 0.04em;
        }

        .digit-sep {
          color: #7c3aed;
          font-weight: 900;
          font-size: 0.95rem;
        }

        .drop-activity-pod {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.9rem;
          color: #475569;
        }

        .activity-live-badge {
          background: #ecfdf5;
          color: #059669;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
          border: 1.5px solid rgba(16, 185, 129, 0.35);
          display: flex;
          align-items: center;
          gap: 0.45rem;
          letter-spacing: 0.06em;
        }

        .live-ping-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          animation: pingDot 1.5s infinite;
        }

        @keyframes pingDot {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.6;
          }
        }

        /* ── Feature 2: Quick Sort & Filter Pills + Folder System ── */
        .sort-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 0.2rem 0;
        }

        .sort-pills-scroll {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
          padding: 0.25rem 0;
        }

        .sort-pills-scroll::-webkit-scrollbar {
          display: none;
        }

        .sort-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.1rem;
          border-radius: 9999px;
          background: #ffffff;
          border: 1.5px solid #ede9fe;
          color: #475569;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          outline: none;
        }

        .sort-pill:hover {
          border-color: #a855f7;
          color: #7c3aed;
          transform: translateY(-1px);
        }

        .sort-pill.active {
          background: #7c3aed !important;
          color: #ffffff !important;
          border-color: #7c3aed !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.28);
        }

        /* 📁 Filter Folder Toggle Button */
        .folder-toggle-btn {
          background: #f5edff !important;
          color: #6d28d9 !important;
          border: 1.5px solid #d8b4fe !important;
          font-weight: 800 !important;
        }

        .folder-toggle-btn:hover {
          background: #ede9fe !important;
          border-color: #a855f7 !important;
          color: #5b21b6 !important;
        }

        .folder-toggle-btn.open,
        .folder-toggle-btn.has-active {
          background: #7c3aed !important;
          color: #ffffff !important;
          border-color: #7c3aed !important;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.28);
        }

        .folder-count-badge {
          background: #ffffff;
          color: #7c3aed;
          font-size: 0.7rem;
          font-weight: 900;
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          line-height: 1.2;
        }

        .folder-toggle-btn:not(.open):not(.has-active) .folder-count-badge {
          background: #7c3aed;
          color: #ffffff;
        }

        .clear-all-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.95rem;
          border-radius: 9999px;
          background: #fef2f2;
          border: 1.5px solid #fecaca;
          color: #dc2626;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .clear-all-pill-btn:hover {
          background: #fee2e2;
          border-color: #f87171;
          color: #b91c1c;
          transform: translateY(-1px);
        }

        .sort-active-count {
          font-size: 0.82rem;
          font-weight: 700;
          color: #7c3aed;
          background: #f5edff;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid #ede9fe;
          white-space: nowrap;
        }

        /* ── Expandable Filter Folder Panel Tray ── */
        .filter-folder-panel {
          background: #ffffff;
          border: 2px solid #ede9fe;
          border-radius: 28px;
          padding: 1.6rem 2rem;
          margin-bottom: 2.25rem;
          box-shadow: 0 14px 40px -8px rgba(124, 58, 237, 0.1), 0 4px 14px rgba(0, 0, 0, 0.03);
          animation: folderSlideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes folderSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .folder-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.1rem;
          margin-bottom: 1.35rem;
          border-bottom: 1.5px solid #f1f5f9;
        }

        .folder-reset-link {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          text-decoration: underline;
          padding: 0.2rem 0.5rem;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .folder-reset-link:hover {
          background: #fef2f2;
        }

        .folder-sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 1.6rem;
        }

        .folder-filter-col {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .col-label {
          font-size: 0.78rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .col-chips-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .folder-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          color: #334155;
          padding: 0.45rem 0.95rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
        }

        .folder-chip:hover {
          border-color: #c084fc;
          color: #7c3aed;
          background: #faf5ff;
          transform: translateY(-1px);
        }

        .folder-chip.active {
          background: #7c3aed !important;
          border-color: #7c3aed !important;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.28);
        }

        /* ── Feature 4: Curated Drop of the Week Editorial Spotlight ── */
        .curated-drop-banner {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 2.5rem;
          align-items: center;
          background: linear-gradient(135deg, #1e1b4b 0%, #2e1065 50%, #4c1d95 100%);
          border-radius: 32px;
          padding: 3rem 2.8rem;
          margin: 3.5rem 0;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 45px rgba(30, 27, 75, 0.18);
          border: 1.5px solid rgba(168, 85, 247, 0.3);
        }

        .curated-drop-banner::before {
          content: '';
          position: absolute;
          top: -80px;
          right: -80px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .curated-drop-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(168, 85, 247, 0.25);
          color: #e9d5ff;
          border: 1px solid rgba(192, 132, 252, 0.4);
          font-size: 0.76rem;
          font-weight: 800;
          padding: 0.3rem 0.85rem;
          border-radius: 9999px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }

        .curated-drop-title {
          color: #ffffff;
          font-size: clamp(1.6rem, 2.5vw, 2.3rem);
          font-weight: 900;
          margin: 0 0 0.85rem 0;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .curated-drop-desc {
          color: #cbd5e1;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0 0 1.5rem 0;
          max-width: 520px;
        }

        .curated-drop-perks {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 1.75rem;
        }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #e2e8f0;
          font-size: 0.88rem;
          font-weight: 600;
        }

        .curated-drop-cta-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .curated-drop-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          background: #ffffff;
          color: #1e1b4b;
          border: none;
          padding: 0.85rem 1.75rem;
          border-radius: 9999px;
          font-size: 0.92rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .curated-drop-btn:hover {
          background: #f5edff;
          color: #7c3aed;
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.4);
        }

        .curated-drop-counter-tag {
          color: #facc15;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }

        .curated-visual-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);
          border: 2px solid rgba(255, 255, 255, 0.15);
          aspect-ratio: 1 / 1;
        }

        .curated-visual-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }

        .curated-visual-card:hover .curated-visual-img {
          transform: scale(1.05);
        }

        .curated-visual-glass-pill {
          position: absolute;
          bottom: 14px;
          left: 14px;
          right: 14px;
          background: rgba(15, 23, 42, 0.82);
          backdrop-filter: blur(12px);
          border-radius: 18px;
          padding: 0.85rem 1.1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 990px) {
          .curated-drop-banner {
            grid-template-columns: 1fr;
            padding: 2rem 1.5rem;
            gap: 2rem;
          }
          .drop-status-bar {
            border-radius: 20px;
            padding: 0.85rem 1.1rem;
          }
          .circular-categories-track {
            justify-content: flex-start;
            gap: 1.15rem;
          }
          .category-story-item {
            flex: 0 0 auto;
            min-width: 66px;
          }
          .story-circle-pod {
            width: 64px;
            height: 64px;
          }
          .story-notification-badge {
            min-width: 21px;
            height: 21px;
            font-size: 0.7rem;
            top: -3px;
            right: -3px;
          }
          .story-label-text {
            font-size: 0.74rem;
            max-width: 70px;
          }
        }
      `}</style>
    </PageWrapper>
  );
}
