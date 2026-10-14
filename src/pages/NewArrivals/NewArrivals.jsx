import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import NewArrivalsHero from '../../components/new-arrivals/NewArrivalsHero';
import ProductCard from '../../components/product/ProductCard';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { SLUG_ALIAS_MAP } from '../../data/data';
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
  PackagePlus,
  X,
  Check,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useUiStore } from '../../store/uiStore';
import { useCategoryStore } from '../../store/categoryStore';
import '../../styles/home-premium.css';

export default function NewArrivals() {
  const { categories, fetchCategories } = useCategoryStore();
  const { addItem } = useCartStore();
  const { showToast } = useUiStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [activeSort, setActiveSort] = useState('newest'); // 'newest' | 'price-low' | 'price-high'
  const [priceRange, setPriceRange] = useState('all'); // 'all' | 'under500' | '500-1500' | '1500-3000' | 'above3000'
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'inStock' | 'outOfStock'
  const [discountFilter, setDiscountFilter] = useState('all'); // 'all' | '10' | '20' | '30' | '50'
  const [isFilterFolderOpen, setIsFilterFolderOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const catalogRef = useRef(null);

  // Lock body scroll when drawer is open so the viewport stays stationary
  useEffect(() => {
    if (isFilterFolderOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterFolderOpen]);

  // Helper to strictly filter for products with New Arrivals tag / flag
  const isNewArrivalProduct = (p) => {
    if (!p) return false;
    if (p.isNewArrival) return true;
    if (typeof p.badge === 'string') {
      const b = p.badge.toLowerCase();
      if (b.includes('new') || b.includes('arrival')) return true;
    }
    const rawTags = Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === 'string'
      ? p.tags.split(',')
      : [];
    return rawTags.some((t) => {
      if (!t) return false;
      const clean = String(t).trim().toLowerCase().replace(/[-_]/g, ' ');
      return clean.includes('new') || clean.includes('arrival');
    });
  };

  // Helper to filter for products with Best Sellers tag / flag (matches BestSellers page)
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

  // Fetch real products from database (New Arrivals for Catalog, Best Sellers for Marquee)
  const loadNewArrivals = async (retryCount = 1) => {
    const startTime = Date.now();
    try {
      setLoading(true);
      setFetchError(null);
      const res = await productService.list({ limit: 100, sort: 'newest' });
      const data = res?.data || res;
      const items = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      const newArrivalsOnly = items.filter(isNewArrivalProduct);
      setProducts(newArrivalsOnly.length > 0 ? newArrivalsOnly : items);

      // Best sellers filtering for live running marquee section
      const bestSellersOnly = items.filter(isBestSellerProduct);
      setBestSellerProducts(bestSellersOnly.length > 0 ? bestSellersOnly : items);


    } catch (err) {
      console.error('Failed to load products:', err);
      if (retryCount > 0) {
        return loadNewArrivals(retryCount - 1);
      }
      setFetchError('Unable to load products. Please try again.');
      setProducts([]);
      setBestSellerProducts([]);
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 2000 - elapsed);
      if (remainingDelay > 0) {
        await new Promise((r) => setTimeout(r, remainingDelay));
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewArrivals(1);
  }, []);

  // Dynamic DB Categories + All New Arrivals as Circular Story Avatars (100% Radius)
  const categoryStories = useMemo(() => {
    const list = [
      {
        id: 'all',
        label: 'All New Arrivals',
        icon: 'package-plus',
      },
    ];

    if (Array.isArray(categories) && categories.length > 0) {
      categories.forEach((cat) => {
        list.push({
          id: cat.slug || cat._id,
          label: cat.name,
          image: cat.image || null,
          _id: cat._id,
        });
      });
    }

    return list;
  }, [categories]);

  // Dynamic subcategories derived from products based on activeCategory
  const availableSubcategories = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const rawSlug = p.category?.slug || (typeof p.category === 'string' ? p.category : '');
      const normalizedCat = (SLUG_ALIAS_MAP[rawSlug] || rawSlug).toLowerCase();
      const normalizedActive = (SLUG_ALIAS_MAP[activeCategory] || activeCategory).toLowerCase();
      const pId = p.category?._id || (typeof p.category === 'object' ? p.category?._id : p.category);
      if (
        activeCategory === 'all' ||
        normalizedCat === normalizedActive ||
        rawSlug.toLowerCase() === normalizedActive ||
        pId === activeCategory
      ) {
        if (typeof p.subCategory === 'string' && p.subCategory) {
          map.set(p.subCategory.toLowerCase(), p.subCategory);
        } else if (p.subCategory?.slug && p.subCategory?.name) {
          map.set(p.subCategory.slug, p.subCategory.name);
        }
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [products, activeCategory]);


  // Filter & Sort Products Dynamically
  const processedProducts = useMemo(() => {
    let list = [...products];

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
      const targetCat = (SLUG_ALIAS_MAP[activeCategory] || activeCategory).toLowerCase();
      list = list.filter((p) => {
        const rawSlug = p.category?.slug || (typeof p.category === 'string' ? p.category : '');
        const pCat = (SLUG_ALIAS_MAP[rawSlug] || rawSlug).toLowerCase();
        const pId = p.category?._id || (typeof p.category === 'object' ? p.category?._id : p.category);
        return (
          pCat === targetCat ||
          rawSlug.toLowerCase() === targetCat ||
          pId === activeCategory
        );
      });
    }

    // 3. Subcategory Filter
    if (activeSubcategory !== 'all') {
      list = list.filter((p) => {
        const subSlug = p.subCategory?.slug || (typeof p.subCategory === 'string' ? p.subCategory.toLowerCase() : '');
        return subSlug.toLowerCase() === activeSubcategory.toLowerCase();
      });
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
    products,
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

  // Continuous infinite running cards list for Best Sellers
  const marqueeItems = useMemo(() => {
    const baseList = bestSellerProducts.length > 0 ? bestSellerProducts : products;
    if (!baseList.length) return [];

    let singleCycle = [...baseList];
    while (singleCycle.length < 6) {
      singleCycle = [...singleCycle, ...baseList];
    }

    return [...singleCycle, ...singleCycle];
  }, [bestSellerProducts, products]);

  const handleScrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <PageWrapper>
      <div style={{ background: 'transparent', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Celestial Dome Arc Hero Showcase (Full Width) ── */}
        <div style={{ position: 'relative' }}>
          <NewArrivalsHero
            products={products}
            isLoading={loading}
            onExploreClick={handleScrollToCatalog}
            categories={categoryStories}
            activeCategory={activeCategory}
            onSelectCategory={(id) => {
              setActiveCategory(id);
              setActiveSubcategory('all');
            }}
          />
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

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveCategory(item.id);
                      setActiveSubcategory('all');
                    }}
                    className={`category-story-item ${isActive ? 'active' : ''}`}
                    title={item.label}
                  >
                    {/* 100% Circular Avatar Container */}
                    <div className="story-circle-pod">
                      {/* Inner 100% Round Mask for High Detail Zoomed Content */}
                      <div className="story-circle-inner">
                        {item.icon === 'package-plus' ? (
                          <div className="story-all-drops-icon">
                            <PackagePlus size={24} strokeWidth={1.75} />
                          </div>
                        ) : item.image ? (
                          <img
                            src={item.image}
                            alt={item.label}
                            className={`story-circle-img img-${item.id}`}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#ede9fe',
                              color: '#7c3aed',
                            }}
                            title="No image in DB"
                          >
                            <Layers size={22} strokeWidth={2} />
                          </div>
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

          {/* ── Slide-Over Side Filter Drawer (From Left - Portaled to document.body) ── */}
          {isFilterFolderOpen &&
            typeof document !== 'undefined' &&
            createPortal(
              <div className="filter-drawer-overlay" onClick={() => setIsFilterFolderOpen(false)}>
              <div
                className="filter-drawer-container"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drawer Header */}
                <div className="drawer-header">
                  <div className="drawer-header-title">
                    <div className="drawer-icon-box">
                      <SlidersHorizontal size={18} color="#7c3aed" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <h3 className="drawer-title">Filters</h3>
                        {activeFiltersCount > 0 && (
                          <span className="drawer-active-badge">
                            {activeFiltersCount}
                          </span>
                        )}
                      </div>
                      <p className="drawer-subtitle">
                        Refine by category, price & deals
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsFilterFolderOpen(false)}
                    className="drawer-close-btn"
                    title="Close filters"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Drawer Body - Clean Scrollable Stack */}
                <div className="drawer-body">
                  {/* 1. Category Section */}
                  <div className="drawer-section">
                    <div className="drawer-section-header">
                      <div className="drawer-section-label">
                        <Layers size={14} color="#7c3aed" />
                        <span>Category</span>
                      </div>
                      {activeCategory !== 'all' && (
                        <button
                          onClick={() => {
                            setActiveCategory('all');
                            setActiveSubcategory('all');
                          }}
                          className="drawer-section-clear"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="drawer-pills-list">
                      {categoryStories.map((cat) => {
                        const isSelected = activeCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setActiveCategory(cat.id);
                              setActiveSubcategory('all');
                            }}
                            className={`drawer-pill ${isSelected ? 'active' : ''}`}
                          >
                            <span>{cat.label}</span>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Subcategory Section */}
                  {availableSubcategories.length > 0 && (
                    <div className="drawer-section">
                      <div className="drawer-section-header">
                        <div className="drawer-section-label">
                          <Tag size={14} color="#7c3aed" />
                          <span>Subcategory</span>
                        </div>
                        {activeSubcategory !== 'all' && (
                          <button
                            onClick={() => setActiveSubcategory('all')}
                            className="drawer-section-clear"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="drawer-pills-list">
                        <button
                          onClick={() => setActiveSubcategory('all')}
                          className={`drawer-pill ${activeSubcategory === 'all' ? 'active' : ''}`}
                        >
                          <span>All</span>
                          {activeSubcategory === 'all' && <Check size={12} strokeWidth={3} />}
                        </button>
                        {availableSubcategories.map((sub) => {
                          const isSelected = activeSubcategory === sub.slug;
                          return (
                            <button
                              key={sub.slug}
                              onClick={() => setActiveSubcategory(sub.slug)}
                              className={`drawer-pill ${isSelected ? 'active' : ''}`}
                            >
                              <span>{sub.name}</span>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Price Range Section */}
                  <div className="drawer-section">
                    <div className="drawer-section-header">
                      <div className="drawer-section-label">
                        <Coins size={14} color="#7c3aed" />
                        <span>Price Range</span>
                      </div>
                      {priceRange !== 'all' && (
                        <button
                          onClick={() => setPriceRange('all')}
                          className="drawer-section-clear"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="drawer-pills-list">
                      {[
                        { id: 'all', label: 'All Prices' },
                        { id: 'under500', label: 'Under ₹500' },
                        { id: '500-1500', label: '₹500 - ₹1,500' },
                        { id: '1500-3000', label: '₹1,500 - ₹3,000' },
                        { id: 'above3000', label: 'Above ₹3,000' },
                      ].map((item) => {
                        const isSelected = priceRange === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setPriceRange(item.id)}
                            className={`drawer-pill ${isSelected ? 'active' : ''}`}
                          >
                            <span>{item.label}</span>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Discounts Section */}
                  <div className="drawer-section">
                    <div className="drawer-section-header">
                      <div className="drawer-section-label">
                        <Percent size={14} color="#7c3aed" />
                        <span>Discounts</span>
                      </div>
                      {discountFilter !== 'all' && (
                        <button
                          onClick={() => setDiscountFilter('all')}
                          className="drawer-section-clear"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div className="drawer-pills-list">
                      {[
                        { id: 'all', label: 'All Deals' },
                        { id: '10', label: '10% OFF+' },
                        { id: '20', label: '20% OFF+' },
                        { id: '30', label: '30% OFF+' },
                        { id: '50', label: '50% OFF+' },
                      ].map((item) => {
                        const isSelected = discountFilter === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setDiscountFilter(item.id)}
                            className={`drawer-pill ${isSelected ? 'active' : ''}`}
                          >
                            <span>{item.label}</span>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Drawer Sticky Footer */}
                <div className="drawer-footer">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={handleResetAllFilters}
                      className="drawer-reset-btn"
                    >
                      <RotateCcw size={13} />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsFilterFolderOpen(false);
                      handleScrollToCatalog();
                    }}
                    className="drawer-apply-btn"
                  >
                    <span>Show {processedProducts.length} Items</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Products Grid with Generous Spacing */}
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: '6rem 2rem',
                background: '#ffffff',
                borderRadius: '24px',
                border: '1.5px solid #ede9fe',
                marginBottom: '4rem',
              }}
            >
              <div style={{ display: 'inline-block', marginBottom: '1rem' }}>
                <Spinner size={40} />
              </div>
              <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                Loading fresh new arrivals...
              </p>
            </div>
          ) : fetchError ? (
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
                Unable to load fresh arrivals
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {fetchError}
              </p>
              <button
                onClick={() => loadNewArrivals(1)}
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <RotateCcw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : processedProducts.length === 0 ? (
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
                <ProductCard key={prod._id || prod.id} product={prod} index={idx} />
              ))}
            </div>
          )}

          {/* ── 3. Continuous Running Showcase Section (Infinite Marquee for Best Sellers) ── */}
          {marqueeItems.length > 0 && (
            <section className="new-arrivals-marquee-section" aria-label="Best Sellers Live Showcase">
              <div className="new-arrivals-marquee-header-wrap">
                <div className="marquee-badge-pill">
                  <Flame size={14} className="marquee-sparkle-icon" color="#f97316" />
                  <span>Best Sellers • Top Customer Picks</span>
                </div>
                <h3 className="new-arrivals-marquee-title">
                  All Best Sellers <span>Running Live</span>
                </h3>
                <p className="new-arrivals-marquee-subtitle">
                  Continuous live stream of our top-rated, best-selling favorites. Hover over any card to pause and explore.
                </p>
              </div>

              {/* Viewport for infinite running ribbon */}
              <div className="new-arrivals-marquee-viewport">
                <div className="new-arrivals-marquee-track">
                  {marqueeItems.map((prod, idx) => (
                    <div
                      key={`marquee-${prod._id || prod.id || 'p'}-${idx}`}
                      className="new-arrivals-marquee-card-item"
                    >
                      <ProductCard product={prod} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── 4. Final Community CTA Banner (Exact Home Page Section) ── */}
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

        /* ── Slide-Over Side Filter Drawer (From Left) ── */
        .filter-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.48);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 99999;
          display: flex;
          justify-content: flex-start;
          animation: drawerFadeIn 0.22s ease-out;
        }

        @keyframes drawerFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .filter-drawer-container {
          width: 100%;
          max-width: 420px;
          height: 100vh;
          max-height: 100vh;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          box-shadow: 12px 0 40px rgba(15, 23, 42, 0.2);
          animation: drawerSlideInLeft 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        @keyframes drawerSlideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        /* Drawer Header */
        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1.5px solid #f1f5f9;
          background: #ffffff;
          flex-shrink: 0;
        }

        .drawer-header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .drawer-icon-box {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: #f5edff;
          border: 1.5px solid #ddd6fe;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .drawer-title {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 800;
          color: #1e1b4b;
          line-height: 1.2;
        }

        .drawer-active-badge {
          font-size: 0.7rem;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(135deg, #7c3aed, #9333ea);
          padding: 0.12rem 0.5rem;
          border-radius: 9999px;
        }

        .drawer-subtitle {
          margin: 0.2rem 0 0 0;
          font-size: 0.76rem;
          color: #64748b;
        }

        .drawer-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .drawer-close-btn:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
          transform: rotate(90deg);
        }

        /* Drawer Body */
        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.35rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
        }

        .drawer-body::-webkit-scrollbar {
          width: 5px;
        }

        .drawer-body::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 5px;
        }

        /* Drawer Section */
        .drawer-section {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .drawer-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .drawer-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .drawer-section-label {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.8rem;
          font-weight: 800;
          color: #1e1b4b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .drawer-section-clear {
          background: none;
          border: none;
          color: #7c3aed;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s ease;
        }

        .drawer-section-clear:hover {
          color: #dc2626;
          text-decoration: underline;
        }

        /* Drawer Pills */
        .drawer-pills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }

        .drawer-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.85rem;
          border-radius: 9999px;
          background: #f8fafc;
          border: 1.2px solid #e2e8f0;
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.18s ease;
          outline: none;
        }

        .drawer-pill:hover {
          border-color: #c084fc;
          color: #7c3aed;
          background: #faf5ff;
          transform: translateY(-1px);
        }

        .drawer-pill.active {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
          border-color: #7c3aed !important;
          color: #ffffff !important;
          font-weight: 700;
          box-shadow: 0 3px 10px rgba(124, 58, 237, 0.28);
          transform: translateY(-1px);
        }

        /* Drawer Sticky Footer */
        .drawer-footer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.15rem 1.5rem;
          border-top: 1.5px solid #f1f5f9;
          background: #ffffff;
          flex-shrink: 0;
        }

        .drawer-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #f8fafc;
          border: 1.2px solid #e2e8f0;
          color: #64748b;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 0.75rem 1.1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .drawer-reset-btn:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        .drawer-apply-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: #ffffff;
          border: none;
          font-size: 0.88rem;
          font-weight: 800;
          padding: 0.78rem 1.25rem;
          border-radius: 12px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.32);
          transition: all 0.2s ease;
        }

        .drawer-apply-btn:hover {
          background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
          box-shadow: 0 6px 18px rgba(124, 58, 237, 0.42);
          transform: translateY(-1px);
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
          .filter-drawer-container {
            max-width: 100%;
          }
        }

        /* ── Continuous Running Marquee Section Styles ── */
        .new-arrivals-marquee-section {
          margin-top: 3.5rem;
          margin-bottom: 2rem;
          width: 100%;
          position: relative;
        }

        .new-arrivals-marquee-header-wrap {
          text-align: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }

        .marquee-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: #f3e8ff;
          color: #7c3aed;
          border: 1px solid #ddd6fe;
          border-radius: 9999px;
          padding: 0.35rem 0.95rem;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .marquee-sparkle-icon {
          animation: spinPulse 3s infinite ease-in-out;
        }

        @keyframes spinPulse {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.2) rotate(180deg); }
        }

        .new-arrivals-marquee-title {
          font-size: clamp(1.6rem, 2.8vw, 2.2rem);
          font-weight: 900;
          color: #1e1b4b;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.02em;
        }

        .new-arrivals-marquee-title span {
          background: linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .new-arrivals-marquee-subtitle {
          font-size: 0.92rem;
          color: #64748b;
          max-width: 580px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .new-arrivals-marquee-viewport {
          width: 100%;
          overflow: hidden;
          position: relative;
          padding: 1.25rem 0 1.5rem 0;
          mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 4%, black 96%, transparent);
        }

        .new-arrivals-marquee-track {
          display: flex;
          align-items: stretch;
          gap: 1.5rem;
          width: max-content;
          will-change: transform;
          animation: newArrivalsMarqueeRun 35s linear infinite;
        }

        .new-arrivals-marquee-track:hover {
          animation-play-state: paused;
        }

        .new-arrivals-marquee-card-item {
          flex: 0 0 250px;
          width: 250px;
          min-width: 250px;
          transition: transform 0.25s ease;
        }

        .new-arrivals-marquee-card-item:hover {
          transform: translateY(-4px);
        }

        @keyframes newArrivalsMarqueeRun {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 768px) {
          .new-arrivals-marquee-card-item {
            flex: 0 0 190px;
            width: 190px;
            min-width: 190px;
          }
          .new-arrivals-marquee-track {
            gap: 1rem;
            animation-duration: 25s;
          }
          .new-arrivals-marquee-section {
            margin-top: 2.5rem;
            margin-bottom: 1.5rem;
          }
        }

      `}</style>
    </PageWrapper>
  );
}

