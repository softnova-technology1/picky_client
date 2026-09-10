import React, { useState, useMemo, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import NewArrivalsHero from '../../components/new-arrivals/NewArrivalsHero';
import ProductCard from '../../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../../data/adminMockData';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Flame,
  Truck,
  CheckCircle2,
  Palette,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Coins,
  IndianRupee,
  Crown,
  Layers,
  Percent,
  BadgePercent,
  X,
  Check,
  ShoppingCart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';

export default function NewArrivals() {
  const { addItem } = useCartStore();
  const { showToast } = useUiStore();
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

  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (priceRange !== 'all') {
      const priceLabels = {
        under500: 'Under ₹500',
        '500-1500': '₹500 - ₹1,500',
        '1500-3000': '₹1,500 - ₹3,000',
        above3000: 'Above ₹3,000',
      };
      tags.push({ key: 'price', label: priceLabels[priceRange] || priceRange, onRemove: () => setPriceRange('all') });
    }
    if (discountFilter !== 'all') {
      tags.push({ key: 'discount', label: `${discountFilter}% OFF+`, onRemove: () => setDiscountFilter('all') });
    }
    if (expressOnly) {
      tags.push({ key: 'express', label: '24h Express', onRemove: () => setExpressOnly(false) });
    }
    if (freeDeliveryOnly) {
      tags.push({ key: 'freeDelivery', label: 'Free Shipping', onRemove: () => setFreeDeliveryOnly(false) });
    }
    if (inStockOnly) {
      tags.push({ key: 'inStock', label: 'In Stock', onRemove: () => setInStockOnly(false) });
    }
    if (artisanOnly) {
      tags.push({ key: 'artisan', label: 'Handloom & Artisan', onRemove: () => setArtisanOnly(false) });
    }
    if (activeSort !== 'fresh') {
      const sortLabels = {
        trending: 'Fast Moving',
        'price-low': 'Price: Low to High',
        'price-high': 'Price: High to Low',
      };
      tags.push({ key: 'sort', label: sortLabels[activeSort] || activeSort, onRemove: () => setActiveSort('fresh') });
    }
    return tags;
  }, [priceRange, discountFilter, expressOnly, freeDeliveryOnly, inStockOnly, artisanOnly, activeSort]);

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

  // ── Curated Drop Spotlight derived directly from Store MOCK_PRODUCTS ──
  const featuredCuratedDrop = useMemo(() => {
    if (activeCategory !== 'all') {
      const match = MOCK_PRODUCTS.find((p) => p.category?.slug === activeCategory && p.isFeatured);
      if (match) return match;
      const anyMatch = MOCK_PRODUCTS.find((p) => p.category?.slug === activeCategory);
      if (anyMatch) return anyMatch;
    }
    // Default flagship drop of the week (Pure Handloom Sungudi Saree)
    return MOCK_PRODUCTS.find((p) => p._id === 'prod_wf_1') || MOCK_PRODUCTS[0];
  }, [activeCategory]);

  const curatedVisualImage = useMemo(() => {
    if (!featuredCuratedDrop) return '/images/pill_model_saree.jpg';
    if (featuredCuratedDrop._id === 'prod_wf_1') return '/images/pill_model_saree.jpg';
    if (featuredCuratedDrop._id === 'prod_aj_1') return '/images/pill_model_jewellery.jpg';
    if (featuredCuratedDrop._id === 'prod_wf_2') return '/images/pill_model_kurti.jpg';
    if (featuredCuratedDrop._id === 'prod_hk_1') return '/images/pill_model_kitchen.jpg';
    if (featuredCuratedDrop._id === 'prod_ma_1') return '/images/pill_model_tech.jpg';
    return featuredCuratedDrop.image || featuredCuratedDrop.images?.[0] || '/images/pill_model_saree.jpg';
  }, [featuredCuratedDrop]);

  const handleAddCuratedDrop = (e) => {
    e.preventDefault();
    if (!featuredCuratedDrop) return;
    addItem(featuredCuratedDrop, 1);
    showToast(`Added "${featuredCuratedDrop.name}" to cart! ✨`, 'success');
  };

  return (
    <PageWrapper>
      <div style={{ background: '#faf5ff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Streetwear Hero Showcase ── */}
        <div style={{ paddingTop: '1.75rem', position: 'relative' }}>
          <NewArrivalsHero onExploreClick={handleScrollToCatalog} />
        </div>

        {/* ── 2. New Arrivals Catalog Section ── */}
        <div className="container" ref={catalogRef} style={{ scrollMarginTop: '100px', marginTop: '2.5rem' }}>
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

          {/* ── Feature 2: Highly Intuitive Quick Filter & Sort Bar ── */}
          <div className="sort-filter-bar">
            {/* Left Group: Folder Toggle & Quick Filters */}
            <div className="bar-left-group">
              {/* 📁 Filter Folder Toggle Button */}
              <button
                onClick={() => setIsFilterFolderOpen((prev) => !prev)}
                className={`sort-pill folder-toggle-btn ${isFilterFolderOpen ? 'open' : ''} ${
                  activeFiltersCount > 0 ? 'has-active' : ''
                }`}
                title="Open Curated Filter Folder"
              >
                <SlidersHorizontal size={15} />
                <span>All Filters</span>
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

              <div className="bar-divider" />

              {/* Quick Sort Options directly accessible on bar */}
              <div className="quick-pill-cluster">
                <button
                  onClick={() => setActiveSort('fresh')}
                  className={`sort-pill quick-pill ${activeSort === 'fresh' ? 'active' : ''}`}
                >
                  <Sparkles size={13} />
                  <span>Freshest</span>
                </button>
                <button
                  onClick={() => setActiveSort('trending')}
                  className={`sort-pill quick-pill ${activeSort === 'trending' ? 'active' : ''}`}
                >
                  <Flame size={13} />
                  <span>Trending</span>
                </button>
                <button
                  onClick={() => setActiveSort(activeSort === 'price-low' ? 'price-high' : 'price-low')}
                  className={`sort-pill quick-pill ${activeSort.startsWith('price-') ? 'active' : ''}`}
                  title="Toggle Price Sort"
                >
                  {activeSort === 'price-high' ? (
                    <ArrowUpNarrowWide size={13} />
                  ) : (
                    <ArrowDownNarrowWide size={13} />
                  )}
                  <span>{activeSort === 'price-high' ? 'Price: High to Low' : 'Price: Low to High'}</span>
                </button>
              </div>

              <div className="bar-divider desktop-only" />

              {/* Quick Perks / Delivery Toggles directly on bar */}
              <div className="quick-pill-cluster desktop-only">
                <button
                  onClick={() => setExpressOnly((prev) => !prev)}
                  className={`sort-pill quick-pill ${expressOnly ? 'active' : ''}`}
                >
                  <Zap size={13} />
                  <span>24h Express</span>
                </button>
                <button
                  onClick={() => setFreeDeliveryOnly((prev) => !prev)}
                  className={`sort-pill quick-pill ${freeDeliveryOnly ? 'active' : ''}`}
                >
                  <Truck size={13} />
                  <span>Free Shipping</span>
                </button>
                <button
                  onClick={() => setInStockOnly((prev) => !prev)}
                  className={`sort-pill quick-pill ${inStockOnly ? 'active' : ''}`}
                >
                  <CheckCircle2 size={13} />
                  <span>In Stock</span>
                </button>
              </div>
            </div>

            {/* Right Group: Product Count & Clear All */}
            <div className="bar-right-group">
              <span className="sort-active-count">
                <strong>{processedProducts.length}</strong> Drops
              </span>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetAllFilters}
                  className="clear-all-pill-btn"
                  title="Reset all filters"
                >
                  <RotateCcw size={13} />
                  <span>Reset All</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Active Filter Tags Row (1-click dismissable tags) ── */}
          {activeFilterTags.length > 0 && (
            <div className="active-filter-tags-row">
              <span className="active-tags-label">Applied:</span>
              <div className="active-tags-list">
                {activeFilterTags.map((tag) => (
                  <button
                    key={tag.key}
                    onClick={tag.onRemove}
                    className="active-tag-chip"
                    title={`Remove ${tag.label}`}
                  >
                    <span>{tag.label}</span>
                    <X size={13} strokeWidth={2.5} />
                  </button>
                ))}
                <button
                  onClick={handleResetAllFilters}
                  className="active-tags-clear-link"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* ── Expandable Filter Folder Panel Tray ── */}
          {isFilterFolderOpen && (
            <div className="filter-folder-panel">
              {/* Folder Header */}
              <div className="folder-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div className="folder-header-icon-box">
                    <SlidersHorizontal size={18} color="#7c3aed" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: '#1e1b4b', fontSize: '1.05rem', fontWeight: 800 }}>
                        Curated Filter Folder
                      </strong>
                      {activeFiltersCount > 0 && (
                        <span className="folder-active-count-tag">
                          {activeFiltersCount} active
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                      Filter drops by price range, perks, discounts & sorting priority
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {activeFiltersCount > 0 && (
                    <button onClick={handleResetAllFilters} className="folder-reset-link">
                      <RotateCcw size={13} />
                      <span>Reset Filters</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsFilterFolderOpen(false)}
                    className="folder-close-btn"
                    title="Close Filter Folder"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Symmetrical 4-Card Grid */}
              <div className="folder-cards-grid">
                {/* 1. Price Range Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <Coins size={15} color="#7c3aed" />
                      <span className="col-label">Price Range</span>
                    </div>
                    {priceRange !== 'all' && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack">
                    {[
                      { id: 'all', label: 'All Prices', icon: Coins },
                      { id: 'under500', label: 'Under ₹500', icon: IndianRupee },
                      { id: '500-1500', label: '₹500 - ₹1,500', icon: IndianRupee },
                      { id: '1500-3000', label: '₹1,500 - ₹3,000', icon: IndianRupee },
                      { id: 'above3000', label: 'Above ₹3,000', icon: Crown },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = priceRange === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setPriceRange(item.id)}
                          className={`folder-chip ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <IconComp size={13} strokeWidth={2.2} />
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Discount Tiers Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <Percent size={15} color="#7c3aed" />
                      <span className="col-label">Discount Tiers</span>
                    </div>
                    {discountFilter !== 'all' && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack">
                    {[
                      { id: 'all', label: 'All Items', icon: Layers },
                      { id: '10', label: '10% OFF+', icon: Percent },
                      { id: '20', label: '20% OFF+', icon: Percent },
                      { id: '30', label: '30% OFF+', icon: BadgePercent },
                      { id: '50', label: '50% OFF+', icon: Flame },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = discountFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setDiscountFilter(item.id)}
                          className={`folder-chip ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <IconComp size={13} strokeWidth={2.2} />
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Perks & Delivery Card (Combined & Balanced!) */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <Zap size={15} color="#7c3aed" />
                      <span className="col-label">Perks & Delivery</span>
                    </div>
                    {(expressOnly || freeDeliveryOnly || artisanOnly || inStockOnly) && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack">
                    <button
                      onClick={() => setExpressOnly((prev) => !prev)}
                      className={`folder-chip ${expressOnly ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Zap size={13} strokeWidth={2.2} />
                        <span>24h Express Only</span>
                      </div>
                      {expressOnly && <Check size={13} strokeWidth={3} />}
                    </button>
                    <button
                      onClick={() => setFreeDeliveryOnly((prev) => !prev)}
                      className={`folder-chip ${freeDeliveryOnly ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Truck size={13} strokeWidth={2.2} />
                        <span>Free Shipping</span>
                      </div>
                      {freeDeliveryOnly && <Check size={13} strokeWidth={3} />}
                    </button>
                    <button
                      onClick={() => setArtisanOnly((prev) => !prev)}
                      className={`folder-chip ${artisanOnly ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <Palette size={13} strokeWidth={2.2} />
                        <span>Handloom & Artisan</span>
                      </div>
                      {artisanOnly && <Check size={13} strokeWidth={3} />}
                    </button>
                    <button
                      onClick={() => setInStockOnly((prev) => !prev)}
                      className={`folder-chip ${inStockOnly ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <CheckCircle2 size={13} strokeWidth={2.2} />
                        <span>In Stock Only</span>
                      </div>
                      {inStockOnly && <Check size={13} strokeWidth={3} />}
                    </button>
                  </div>
                </div>

                {/* 4. Sort Priority Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <ArrowDownNarrowWide size={15} color="#7c3aed" />
                      <span className="col-label">Sort Priority</span>
                    </div>
                    {activeSort !== 'fresh' && (
                      <span className="group-active-indicator">Custom</span>
                    )}
                  </div>
                  <div className="group-chips-stack">
                    {[
                      { id: 'fresh', label: 'Freshest Drop', icon: Sparkles },
                      { id: 'trending', label: 'Fast Moving', icon: Flame },
                      { id: 'price-low', label: 'Price: Low to High', icon: ArrowDownNarrowWide },
                      { id: 'price-high', label: 'Price: High to Low', icon: ArrowUpNarrowWide },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isSelected = activeSort === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSort(item.id)}
                          className={`folder-chip ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <IconComp size={13} strokeWidth={2.2} />
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Folder Bottom Action Bar */}
              <div className="folder-footer-bar">
                <div className="folder-footer-counter">
                  Showing <strong>{processedProducts.length}</strong> matching drops
                </div>
                <div className="folder-footer-actions">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetAllFilters}
                      className="folder-footer-clear-btn"
                    >
                      Reset All
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsFilterFolderOpen(false);
                      handleScrollToCatalog();
                    }}
                    className="folder-apply-btn"
                  >
                    <span>Apply & View Drops ({processedProducts.length})</span>
                    <ArrowRight size={15} />
                  </button>
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
              {/* First 5 Products Grid */}
              <div className="new-arrivals-product-grid">
                {processedProducts.slice(0, 5).map((prod, idx) => (
                  <ProductCard key={prod._id || prod.id} product={prod} index={idx} />
                ))}
              </div>

              {/* ── Feature 4: Curated Drop of the Week Editorial Spotlight Banner ── */}
              {featuredCuratedDrop && (
                <div className="curated-drop-banner">
                  <div className="curated-drop-content">
                    <div className="curated-drop-badge">
                      <Sparkles size={14} />
                      <span>
                        Curated Drop of the Week • {featuredCuratedDrop.category?.name || "Women's Collection"}
                      </span>
                    </div>
                    <h3 className="curated-drop-title">
                      {featuredCuratedDrop.name}
                    </h3>
                    <p className="curated-drop-desc">
                      {featuredCuratedDrop.description ||
                        'Handcrafted certified authentic collection from premier artisan weavers. Freshly dropped & ready to ship.'}
                    </p>

                    <div className="curated-drop-perks">
                      <div className="perk-item">
                        <Zap size={15} color="#c084fc" />
                        <span>Ready for 24h Express Dispatch</span>
                      </div>
                      <div className="perk-item">
                        <ShieldCheck size={15} color="#c084fc" />
                        <span>
                          {featuredCuratedDrop.characteristics?.[0]
                            ? `${featuredCuratedDrop.characteristics[0].key}: ${featuredCuratedDrop.characteristics[0].value}`
                            : '100% Certified Authentic Picky Quality'}
                        </span>
                      </div>
                    </div>

                    <div className="curated-drop-cta-row">
                      <button
                        onClick={handleAddCuratedDrop}
                        className="curated-drop-btn"
                        type="button"
                        title="Add this drop to your cart"
                      >
                        <ShoppingCart size={16} />
                        <span>
                          Add to Bag • ₹{featuredCuratedDrop.discountPrice || featuredCuratedDrop.price}
                        </span>
                      </button>
                      <Link
                        to={`/product/${featuredCuratedDrop.slug || featuredCuratedDrop._id}`}
                        className="curated-drop-link-btn"
                      >
                        <span>View Details</span>
                        <ArrowRight size={14} />
                      </Link>
                      <span className="curated-drop-counter-tag">
                        <Zap
                          size={13}
                          style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }}
                        />
                        <span>Only {featuredCuratedDrop.stock || 15} Sets Remaining</span>
                      </span>
                    </div>
                  </div>

                  <div className="curated-drop-visual">
                    <div className="curated-visual-card">
                      <img
                        src={curatedVisualImage}
                        alt={featuredCuratedDrop.name}
                        className="curated-visual-img"
                        loading="lazy"
                      />
                      <div className="curated-visual-glass-pill">
                        <div style={{ maxWidth: '65%' }}>
                          <strong
                            style={{
                              display: 'block',
                              fontSize: '0.92rem',
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {featuredCuratedDrop.name}
                          </strong>
                          <span style={{ fontSize: '0.78rem', color: '#e9d5ff' }}>
                            {featuredCuratedDrop.subCategory?.name ||
                              featuredCuratedDrop.category?.name ||
                              "Women's Fashion"}
                          </span>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '1.18rem',
                              fontWeight: 900,
                              color: '#facc15',
                            }}
                          >
                            ₹{featuredCuratedDrop.discountPrice || featuredCuratedDrop.price}
                          </span>
                          {featuredCuratedDrop.discountPrice && (
                            <span
                              style={{
                                fontSize: '0.72rem',
                                color: '#cbd5e1',
                                textDecoration: 'line-through',
                              }}
                            >
                              ₹{featuredCuratedDrop.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Remaining Products Grid */}
              {processedProducts.length > 5 && (
                <div className="new-arrivals-product-grid">
                  {processedProducts.slice(5).map((prod, idx) => (
                    <ProductCard key={prod._id || prod.id} product={prod} index={idx + 5} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .new-arrivals-product-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1.5rem 1.2rem;
          margin-bottom: 4rem;
        }
        @media (max-width: 1100px) {
          .new-arrivals-product-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
          }
        }
        @media (max-width: 768px) {
          .new-arrivals-product-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }
        }

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

        /* ── Feature 2: Highly Intuitive Quick Sort & Filter System ── */
        .sort-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
          padding: 0.25rem 0;
        }

        .bar-left-group {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .bar-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
          margin: 0 0.15rem;
        }

        .quick-pill-cluster {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-wrap: wrap;
        }

        .bar-right-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-left: auto;
        }

        .sort-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.52rem 1.05rem;
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
          border-color: #c084fc;
          color: #7c3aed;
          background: #faf5ff;
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
          padding: 0.4rem 0.9rem;
          border-radius: 9999px;
          border: 1px solid #ede9fe;
          white-space: nowrap;
        }

        /* ── Active Filter Tags Row (1-click dismissable chips) ── */
        .active-filter-tags-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
          padding: 0.65rem 1rem;
          background: #fdfcff;
          border: 1px dashed #d8b4fe;
          border-radius: 16px;
          animation: folderFadeIn 0.2s ease;
        }

        @keyframes folderFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .active-tags-label {
          font-size: 0.76rem;
          font-weight: 800;
          color: #7c3aed;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .active-tags-list {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .active-tag-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          background: #ede9fe;
          color: #6d28d9;
          border: 1px solid #c4b5fd;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .active-tag-chip:hover {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #dc2626;
          transform: translateY(-1px);
        }

        .active-tags-clear-link {
          background: none;
          border: none;
          color: #dc2626;
          font-size: 0.78rem;
          font-weight: 800;
          cursor: pointer;
          text-decoration: underline;
          margin-left: 0.25rem;
        }

        /* ── Expandable Filter Folder Panel Tray ── */
        .filter-folder-panel {
          background: #ffffff;
          border: 2px solid #ede9fe;
          border-radius: 28px;
          padding: 1.75rem 2rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 16px 45px -10px rgba(124, 58, 237, 0.12), 0 4px 16px rgba(0, 0, 0, 0.03);
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
          padding-bottom: 1.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 1.5px solid #f1f5f9;
        }

        .folder-header-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: #f5edff;
          border: 1.5px solid #d8b4fe;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .folder-active-count-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          padding: 0.15rem 0.55rem;
          border-radius: 9999px;
          line-height: 1.3;
        }

        .folder-reset-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          padding: 0.4rem 0.85rem;
          border-radius: 9999px;
          transition: all 0.2s ease;
        }

        .folder-reset-link:hover {
          background: #fee2e2;
          border-color: #f87171;
          color: #b91c1c;
          transform: translateY(-1px);
        }

        .folder-close-btn {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .folder-close-btn:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
          transform: rotate(90deg);
        }

        /* Symmetrical 4-Card Folder Grid */
        .folder-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .folder-group-card {
          background: #fcfaff;
          border: 1.5px solid #ede9fe;
          border-radius: 20px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .folder-group-card:hover {
          border-color: #d8b4fe;
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.07);
        }

        .group-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid #f1edfa;
        }

        .group-header-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .col-label {
          font-size: 0.8rem;
          font-weight: 800;
          color: #1e1b4b;
          letter-spacing: -0.01em;
        }

        .group-active-indicator {
          font-size: 0.68rem;
          font-weight: 800;
          color: #7c3aed;
          background: #ede9fe;
          padding: 0.12rem 0.45rem;
          border-radius: 9999px;
        }

        .group-chips-stack {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .group-chips-stack .folder-chip {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.85rem;
          border-radius: 12px;
          background: #ffffff;
          border: 1.2px solid #e2e8f0;
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
          transition: all 0.18s ease;
          cursor: pointer;
          outline: none;
        }

        .group-chips-stack .folder-chip svg {
          flex-shrink: 0;
        }

        .group-chips-stack .folder-chip:hover {
          border-color: #c084fc;
          color: #7c3aed;
          background: #faf5ff;
          transform: translateX(2px);
        }

        .group-chips-stack .folder-chip.active {
          background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%) !important;
          border-color: #7c3aed !important;
          color: #ffffff !important;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.28);
        }

        /* Folder Footer Bar */
        .folder-footer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1.25rem;
          border-top: 1.5px solid #f1f5f9;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .folder-footer-counter {
          font-size: 0.88rem;
          color: #64748b;
        }

        .folder-footer-counter strong {
          color: #1e1b4b;
          font-weight: 800;
        }

        .folder-footer-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .folder-footer-clear-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.6rem 1.15rem;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .folder-footer-clear-btn:hover {
          background: #fee2e2;
          border-color: #fca5a5;
          color: #dc2626;
        }

        .folder-apply-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff;
          border: none;
          font-size: 0.85rem;
          font-weight: 800;
          padding: 0.65rem 1.4rem;
          border-radius: 9999px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
          transition: all 0.2s ease;
        }

        .folder-apply-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.45);
          background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
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

        .curated-drop-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #e9d5ff;
          font-size: 0.88rem;
          font-weight: 700;
          text-decoration: none;
          padding: 0.8rem 1.35rem;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .curated-drop-link-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.22);
          border-color: rgba(255, 255, 255, 0.45);
          transform: translateY(-2px);
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

        @media (max-width: 1100px) {
          .folder-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 990px) {
          .desktop-only {
            display: none !important;
          }
          .folder-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .curated-drop-banner {
            grid-template-columns: 1fr;
            padding: 2rem 1.5rem;
            gap: 2rem;
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

        @media (max-width: 640px) {
          .folder-cards-grid {
            grid-template-columns: 1fr;
          }
          .filter-folder-panel {
            padding: 1.25rem 1rem;
          }
          .folder-footer-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .folder-apply-btn {
            justify-content: center;
          }
        }
      `}</style>
    </PageWrapper>
  );
}
