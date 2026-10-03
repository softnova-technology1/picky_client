import React, { useState, useMemo, useRef } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import NewArrivalsHero from '../../components/new-arrivals/NewArrivalsHero';
import ProductCard from '../../components/product/ProductCard';
import { MOCK_PRODUCTS } from '../../data/adminMockData';
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Flame,
  CheckCircle2,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Coins,
  IndianRupee,
  Crown,
  Layers,
  Tag,
  Percent,
  BadgePercent,
  X,
  Check,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';

export default function NewArrivals() {
  const { addItem } = useCartStore();
  const { showToast } = useUiStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [activeSort, setActiveSort] = useState('newest'); // 'newest' | 'price-low' | 'price-high'
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under500' | '500-1500' | '1500-3000' | 'above3000'
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'inStock' | 'outOfStock'
  const [discountFilter, setDiscountFilter] = useState('all'); // 'all' | '10' | '20' | '30' | '50'
  const [isFilterFolderOpen, setIsFilterFolderOpen] = useState(false);
  const catalogRef = useRef(null);

  // 10 Core Store Categories + All New Arrivals as Circular Story Avatars (100% Radius)
  const categoryStories = [
    {
      id: 'all',
      label: 'All New Arrivals',
      icon: 'sparkles',
    },
    {
      id: 'womens-fashion',
      label: "Women's Fashion",
      image: '/images/products/saree.png',
    },
    {
      id: 'home-kitchen',
      label: 'Home & Kitchen',
      image: '/images/products/chopper.png',
    },
    {
      id: 'artificial-jewellery',
      label: 'Artificial Jewellery',
      image: '/images/products/necklace.png',
    },
    {
      id: 'beauty-personal-care',
      label: 'Beauty & Personal Care',
      image: '/images/products/sunglasses.png',
    },
    {
      id: 'mobile-accessories',
      label: 'Mobile Accessories',
      image: '/images/products/headphones.png',
    },
    {
      id: 'traditional-tamil-products',
      label: 'Traditional Tamil Products',
      image: '/images/products/gold_ring.png',
    },
    {
      id: 'snacks-foods',
      label: 'Snacks & Foods',
      image: '/images/products/murukku.png',
    },
    {
      id: 'home-decor',
      label: 'Home Décor',
      image: '/images/products/speaker.png',
    },
    {
      id: 'kids-products',
      label: 'Kids Products',
      image: '/images/products/camera.png',
    },
    {
      id: 'fitness-products',
      label: 'Fitness Products',
      image: '/images/products/yogamat.png',
    },
  ];

  // Dynamic subcategories derived from mock data based on activeCategory
  const availableSubcategories = useMemo(() => {
    const map = new Map();
    MOCK_PRODUCTS.forEach((p) => {
      if (activeCategory === 'all' || p.category?.slug === activeCategory) {
        if (p.subCategory?.slug && p.subCategory?.name) {
          map.set(p.subCategory.slug, p.subCategory.name);
        }
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [activeCategory]);

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

    // 1. Search Filter: Search by Product Name or SKU
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const skuMatch = (p.sku || '').toLowerCase().includes(q);
        const idMatch =
          (p._id || '').toLowerCase().includes(q) ||
          String(p.id || '').toLowerCase() === q;
        const slugMatch = (p.slug || '').toLowerCase().includes(q);
        return nameMatch || skuMatch || idMatch || slugMatch;
      });
    }

    // 2. Category Filter
    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category?.slug === activeCategory);
    }

    // 3. Subcategory Filter
    if (activeSubcategory !== 'all') {
      list = list.filter((p) => p.subCategory?.slug === activeSubcategory);
    }

    // 4. Price Range Filter
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

    // 5. Availability Filter
    if (availabilityFilter === 'inStock') {
      list = list.filter((p) => p.stock === undefined || p.stock > 0);
    } else if (availabilityFilter === 'outOfStock') {
      list = list.filter((p) => p.stock !== undefined && p.stock === 0);
    }

    // 6. Discount Tier Filter
    if (discountFilter !== 'all') {
      const minDisc = parseInt(discountFilter, 10);
      list = list.filter((p) => {
        if (!p.discountPrice || p.discountPrice >= p.price) return false;
        const disc = Math.round(((p.price - p.discountPrice) / p.price) * 100);
        return disc >= minDisc;
      });
    }

    // 7. Sort Order
    if (activeSort === 'price-low') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (activeSort === 'price-high') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }
    // Default 'newest' preserves fresh catalog order

    return list;
  }, [
    searchQuery,
    activeCategory,
    activeSubcategory,
    priceRange,
    availabilityFilter,
    discountFilter,
    activeSort,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (activeCategory !== 'all') count++;
    if (activeSubcategory !== 'all') count++;
    if (priceRange !== 'all') count++;
    if (availabilityFilter !== 'all') count++;
    if (discountFilter !== 'all') count++;
    if (activeSort !== 'newest') count++;
    return count;
  }, [
    searchQuery,
    activeCategory,
    activeSubcategory,
    priceRange,
    availabilityFilter,
    discountFilter,
    activeSort,
  ]);

  const activeFilterTags = useMemo(() => {
    const tags = [];
    if (searchQuery.trim()) {
      tags.push({
        key: 'search',
        label: `Search: "${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (activeCategory !== 'all') {
      const cat = categoryStories.find((c) => c.id === activeCategory);
      tags.push({
        key: 'category',
        label: `Category: ${cat ? cat.label : activeCategory}`,
        onRemove: () => {
          setActiveCategory('all');
          setActiveSubcategory('all');
        },
      });
    }
    if (activeSubcategory !== 'all') {
      const sub = availableSubcategories.find((s) => s.slug === activeSubcategory);
      tags.push({
        key: 'subcategory',
        label: `Subcategory: ${sub ? sub.name : activeSubcategory}`,
        onRemove: () => setActiveSubcategory('all'),
      });
    }
    if (priceRange !== 'all') {
      const priceLabels = {
        under500: 'Under ₹500',
        '500-1500': '₹500 - ₹1,500',
        '1500-3000': '₹1,500 - ₹3,000',
        above3000: 'Above ₹3,000',
      };
      tags.push({
        key: 'price',
        label: priceLabels[priceRange] || priceRange,
        onRemove: () => setPriceRange('all'),
      });
    }
    if (availabilityFilter !== 'all') {
      tags.push({
        key: 'availability',
        label: availabilityFilter === 'inStock' ? 'In Stock' : 'Out of Stock',
        onRemove: () => setAvailabilityFilter('all'),
      });
    }
    if (discountFilter !== 'all') {
      tags.push({
        key: 'discount',
        label: `${discountFilter}% OFF+`,
        onRemove: () => setDiscountFilter('all'),
      });
    }
    if (activeSort !== 'newest') {
      const sortLabels = {
        'price-low': 'Price: Low to High',
        'price-high': 'Price: High to Low',
      };
      tags.push({
        key: 'sort',
        label: sortLabels[activeSort] || activeSort,
        onRemove: () => setActiveSort('newest'),
      });
    }
    return tags;
  }, [
    searchQuery,
    activeCategory,
    activeSubcategory,
    priceRange,
    availabilityFilter,
    discountFilter,
    activeSort,
    availableSubcategories,
  ]);

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setActiveSubcategory('all');
    setActiveSort('newest');
    setPriceRange('all');
    setAvailabilityFilter('all');
    setDiscountFilter('all');
  };

  const handleScrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageWrapper>
      <div style={{ background: '#faf5ff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Streetwear Hero Showcase ── */}
        <div style={{ paddingTop: '2.5rem', position: 'relative' }}>
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

          {/* ── 7 Circular Category Stories (All New Arrivals + 6 Categories) ── */}
          <div className="circular-categories-wrapper">
            <div className="circular-categories-track">
              {categoryStories.map((item) => {
                const isActive = activeCategory === item.id;
                const count = tabCounts[item.id] || 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveCategory(item.id);
                      setActiveSubcategory('all');
                    }}
                    className={`category-story-item ${isActive ? 'active' : ''}`}
                    title={`${item.label} (${count} new arrivals)`}
                  >
                    {/* 100% Circular Avatar Container */}
                    <div className="story-circle-pod">
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
                            <Sparkles size={24} strokeWidth={1.75} />
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

          {/* ── Filter Bar & Product Search ── */}
          <div className="sort-filter-bar">
            {/* Left Group: Folder Toggle Button & Product Search Field */}
            <div className="bar-left-group">
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

              {/* Product Search Field by Name or SKU */}
              <div className="new-arrivals-search-box">
                <Search size={16} className="search-box-icon" />
                <input
                  type="text"
                  placeholder="Search by Product Name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="new-arrivals-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="search-clear-btn"
                    title="Clear search"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Group: Sort Selector & Clear All */}
            <div className="bar-right-group">
              <div className="bar-sort-selector">
                <ArrowDownNarrowWide size={14} color="#7c3aed" />
                <span className="bar-sort-label">Sort:</span>
                <select
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value)}
                  className="bar-sort-select"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>

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
                      Filter new arrivals by category, subcategory, price, availability, discount & sorting
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

              {/* Symmetrical 6-Card Grid (3 columns on desktop) */}
              <div className="folder-cards-grid">
                {/* 1. Category Filter Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <Layers size={15} color="#7c3aed" />
                      <span className="col-label">Category</span>
                    </div>
                    {activeCategory !== 'all' && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack" style={{ maxHeight: '230px', overflowY: 'auto', paddingRight: '2px' }}>
                    {categoryStories.map((cat) => {
                      const isSelected = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setActiveCategory(cat.id);
                            setActiveSubcategory('all');
                          }}
                          className={`folder-chip ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span>{cat.label}</span>
                          </div>
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Subcategory Filter Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <Tag size={15} color="#7c3aed" />
                      <span className="col-label">Subcategory</span>
                    </div>
                    {activeSubcategory !== 'all' && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack" style={{ maxHeight: '230px', overflowY: 'auto', paddingRight: '2px' }}>
                    <button
                      onClick={() => setActiveSubcategory('all')}
                      className={`folder-chip ${activeSubcategory === 'all' ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span>All Subcategories</span>
                      </div>
                      {activeSubcategory === 'all' && <Check size={13} strokeWidth={3} />}
                    </button>
                    {availableSubcategories.map((sub) => {
                      const isSelected = activeSubcategory === sub.slug;
                      return (
                        <button
                          key={sub.slug}
                          onClick={() => setActiveSubcategory(sub.slug)}
                          className={`folder-chip ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span>{sub.name}</span>
                          </div>
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Price Range Card */}
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

                {/* 4. Availability Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <CheckCircle2 size={15} color="#7c3aed" />
                      <span className="col-label">Availability</span>
                    </div>
                    {availabilityFilter !== 'all' && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack">
                    {[
                      { id: 'all', label: 'All Items' },
                      { id: 'inStock', label: 'In Stock' },
                      { id: 'outOfStock', label: 'Out of Stock' },
                    ].map((item) => {
                      const isSelected = availabilityFilter === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setAvailabilityFilter(item.id)}
                          className={`folder-chip ${isSelected ? 'active' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <CheckCircle2 size={13} strokeWidth={2.2} />
                            <span>{item.label}</span>
                          </div>
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Discount Tiers Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <Percent size={15} color="#7c3aed" />
                      <span className="col-label">Discount</span>
                    </div>
                    {discountFilter !== 'all' && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack">
                    {[
                      { id: 'all', label: 'All Discounts', icon: Layers },
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

                {/* 6. Sorting Card */}
                <div className="folder-group-card">
                  <div className="group-card-header">
                    <div className="group-header-left">
                      <ArrowDownNarrowWide size={15} color="#7c3aed" />
                      <span className="col-label">Sorting</span>
                    </div>
                    {activeSort !== 'newest' && (
                      <span className="group-active-indicator">Active</span>
                    )}
                  </div>
                  <div className="group-chips-stack">
                    {[
                      { id: 'newest', label: 'Newest (default)', icon: Sparkles },
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
                  Showing <strong>{processedProducts.length}</strong> matching new arrivals
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
                    <span>Apply & View New Arrivals ({processedProducts.length})</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid with Generous Spacing */}
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
                Try selecting "All New Arrivals" or reset your search & filter criteria.
              </p>
              <button
                onClick={handleResetAllFilters}
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
            <div className="new-arrivals-product-grid">
              {processedProducts.map((prod, idx) => (
                <ProductCard key={prod._id || prod.id} product={prod} index={idx} hideBadge={true} />
              ))}
            </div>
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

        /* ── 7 Circular Category Stories Bar ── */
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

        /* Individual Story Avatar Item - Distributed Cleanly */
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
          min-width: 68px;
          max-width: 108px;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        .category-story-item:hover {
          transform: translateY(-2px);
        }

        /* 100% Round Circular Pod (Avatar) with Single Clean 0.5px Border */
        .story-circle-pod {
          width: 74px;
          height: 74px;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 0.5px solid #cbd5e1;
          box-shadow: none;
          transition: all 0.2s ease;
          overflow: visible;
        }

        .category-story-item:hover .story-circle-pod {
          border-color: #a855f7;
          box-shadow: none;
        }

        /* Active Selected Story Circle - Single Clean Border */
        .category-story-item.active .story-circle-pod {
          border: 1.5px solid #7c3aed !important;
          box-shadow: none !important;
          background: #ffffff !important;
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
          top: -3px;
          right: -3px;
          background: #7c3aed;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 800;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          border: 2px solid #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          z-index: 5;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .category-story-item.active .story-notification-badge {
          background: #6d28d9;
          box-shadow: none;
        }

        /* All New Arrivals Simple Clean Icon Circle */
        .story-all-drops-icon {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7c3aed;
          transition: all 0.2s ease;
        }

        .category-story-item:hover .story-all-drops-icon {
          background: #faf5ff;
          color: #6d28d9;
        }

        .category-story-item.active .story-all-drops-icon {
          background: #f5edff;
          color: #7c3aed;
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
        .story-circle-img.img-snacks-foods {
          transform: scale(1.42);
        }
        .story-circle-img.img-home-decor {
          transform: scale(1.44);
        }
        .story-circle-img.img-kids-products {
          transform: scale(1.45);
        }
        .story-circle-img.img-fitness-products {
          transform: scale(1.42);
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
          font-size: 0.78rem;
          font-weight: 700;
          text-align: center;
          white-space: normal;
          line-height: 1.2;
          max-width: 95px;
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

        /* ── Filter Bar & Search Field ── */
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
          gap: 0.75rem;
          flex-wrap: wrap;
          flex: 1 1 auto;
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

        /* 🔎 Product Search Input (Picky Style) */
        .new-arrivals-search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #ffffff;
          border: 1.5px solid #ede9fe;
          border-radius: 9999px;
          padding: 0.45rem 0.95rem;
          min-width: 280px;
          max-width: 360px;
          flex: 1 1 280px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.04);
        }

        .new-arrivals-search-box:focus-within {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.15);
        }

        .new-arrivals-search-box .search-box-icon {
          color: #7c3aed;
          flex-shrink: 0;
        }

        .new-arrivals-search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.82rem;
          color: #1e1b4b;
          font-weight: 600;
          width: 100%;
        }

        .new-arrivals-search-input::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        .search-clear-btn {
          border: none;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }

        .search-clear-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Sort Selector in Bar */
        .bar-sort-selector {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #ffffff;
          border: 1.5px solid #ede9fe;
          border-radius: 9999px;
          padding: 0.38rem 0.85rem;
          transition: all 0.2s ease;
        }

        .bar-sort-selector:hover {
          border-color: #c084fc;
        }

        .bar-sort-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
        }

        .bar-sort-select {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.82rem;
          font-weight: 700;
          color: #1e1b4b;
          cursor: pointer;
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

        /* Symmetrical 6-Card Folder Grid (3 columns on desktop) */
        .folder-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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

        @media (max-width: 1024px) {
          .folder-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 990px) {
          .circular-categories-track {
            justify-content: flex-start;
            gap: 1.15rem;
          }
          .category-story-item {
            flex: 0 0 auto;
            min-width: 76px;
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
            max-width: 85px;
          }
        }

        @media (max-width: 640px) {
          .sort-filter-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          .bar-left-group {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }
          .new-arrivals-search-box {
            min-width: 100%;
            max-width: 100%;
          }
          .bar-right-group {
            justify-content: space-between;
            width: 100%;
            margin-left: 0;
          }
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

