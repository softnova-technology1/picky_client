import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ProductCard from '../components/product/ProductCard';
import ShopHeroSpotlight from '../components/shop/ShopHeroSpotlight';
import ShopSidebarFilter from '../components/shop/ShopSidebarFilter';
import ShopFilterDrawer from '../components/shop/ShopFilterDrawer';
import ShopInFeedBanner from '../components/shop/ShopInFeedBanner';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { getProducts, categories as defaultCategories, searchProducts } from '../data';
import { MOCK_CATEGORIES } from '../data/adminMockData';
import { Search, RotateCcw, ArrowDown, SlidersHorizontal, X, Grid3X3, LayoutGrid, Sparkles, ArrowRight, Check, ChevronRight } from 'lucide-react';

export default function ProductList() {
  const { slug: routeCategorySlug, subSlug: routeSubSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL parameters
  const selectedCategory = searchParams.get('category') || routeCategorySlug || '';
  const selectedSubCategory = searchParams.get('subCategory') || routeSubSlug || '';
  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';
  const urlMaxPrice = searchParams.get('maxPrice') || '';

  // Local state
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(MOCK_CATEGORIES || defaultCategories);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(3); // 3-col editorial or 4-col
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);

  // Quick Filters State
  const [quickFilters, setQuickFilters] = useState({
    rating4Plus: false,
    discount40: false,
    fastDispatch: false,
  });

  // Load Categories list
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await categoryService.list();
        const items = res?.data || res;
        if (Array.isArray(items) && items.length > 0) {
          setCategories(items);
        }
      } catch (err) {
        setCategories(MOCK_CATEGORIES || defaultCategories);
      }
    }
    fetchCategories();
  }, []);

  // Fetch or filter products based on query and sort
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = { sort };
        if (selectedCategory) params.category = selectedCategory;
        if (selectedSubCategory) params.subCategory = selectedSubCategory;

        let items = [];
        try {
          if (searchQuery.trim()) {
            const res = await productService.search(searchQuery.trim(), params);
            items = res?.data?.data || res?.data || [];
          } else {
            const res = await productService.list(params);
            items = res?.data?.data || res?.data || [];
          }
        } catch (_) {
          // fallback
        }

        if (Array.isArray(items) && items.length > 0) {
          setAllProducts(items);
        } else {
          if (searchQuery.trim()) {
            setAllProducts(searchProducts(searchQuery, params));
          } else {
            setAllProducts(getProducts(params));
          }
        }
      } catch (err) {
        if (searchQuery.trim()) {
          setAllProducts(searchProducts(searchQuery, { sort, category: selectedCategory, subCategory: selectedSubCategory }));
        } else {
          setAllProducts(getProducts({ sort, category: selectedCategory, subCategory: selectedSubCategory }));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, selectedSubCategory, searchQuery, sort]);

  // Current category details
  const currentCategoryObj = useMemo(() => {
    if (!selectedCategory) return null;
    return (
      categories.find(
        (c) =>
          c._id === selectedCategory ||
          c.slug === selectedCategory ||
          c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
          c.name?.toLowerCase() === selectedCategory.toLowerCase()
      ) || null
    );
  }, [categories, selectedCategory]);

  // Multi-facet filtering on loaded products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Price Filter
    if (urlMaxPrice) {
      const maxP = Number(urlMaxPrice);
      result = result.filter((p) => {
        const price = Number(p.price || p.discountPrice || 0);
        return price <= maxP;
      });
    }

    // Min Rating Filter
    if (quickFilters.rating4Plus) {
      result = result.filter((p) => Number(p.rating || p.ratings?.average || 4.2) >= 4.5);
    }

    // Discount Filter (40%+)
    if (quickFilters.discount40) {
      result = result.filter((p) => {
        const discount = Number(p.discount || p.discountPercentage || 0);
        if (discount >= 40) return true;
        if (p.originalPrice && p.price) {
          const calc = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
          return calc >= 40;
        }
        return false;
      });
    }

    // Fast Dispatch Filter
    if (quickFilters.fastDispatch) {
      result = result.filter((p) => p.isFastDispatch !== false);
    }

    // Sorting
    if (sort === 'price_asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sort === 'price_desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sort === 'rating') {
      result.sort((a, b) => (b.rating || 4.2) - (a.rating || 4.2));
    }

    return result;
  }, [allProducts, quickFilters, urlMaxPrice, sort]);

  // Handle Category Selection
  const handleCategoryChange = (catSlug) => {
    const next = new URLSearchParams(searchParams);
    if (catSlug) {
      next.set('category', catSlug);
    } else {
      next.delete('category');
    }
    next.delete('subCategory');
    setSearchParams(next);
  };

  // Handle SubCategory Selection
  const handleSubCategoryChange = (subSlug) => {
    const next = new URLSearchParams(searchParams);
    if (subSlug) {
      next.set('subCategory', subSlug);
    } else {
      next.delete('subCategory');
    }
    setSearchParams(next);
  };

  // Handle Max Price Selection
  const handleMaxPriceChange = (maxP) => {
    const next = new URLSearchParams(searchParams);
    if (maxP) {
      next.set('maxPrice', maxP);
    } else {
      next.delete('maxPrice');
    }
    setSearchParams(next);
  };

  // Handle Search Submission
  const handleSearchSubmit = (query) => {
    const next = new URLSearchParams(searchParams);
    if (query?.trim()) {
      next.set('q', query.trim());
    } else {
      next.delete('q');
      next.delete('search');
    }
    setSearchParams(next);
  };

  const handleSearchClear = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    next.delete('search');
    setSearchParams(next);
  };

  // Handle Quick Filter Toggle
  const handleToggleQuickFilter = (key) => {
    setQuickFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset all filters
  const handleResetAll = () => {
    setQuickFilters({
      rating4Plus: false,
      discount40: false,
      fastDispatch: false,
    });
    setSearchParams({});
    if (routeCategorySlug) {
      navigate('/shop');
    }
  };

  // Active filter count calculation
  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedSubCategory ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (urlMaxPrice ? 1 : 0) +
    (quickFilters.rating4Plus ? 1 : 0) +
    (quickFilters.discount40 ? 1 : 0) +
    (quickFilters.fastDispatch ? 1 : 0);

  // Pagination slice
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <PageWrapper>
      <div style={{ background: '#ffffff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Hero Spotlight: Rich Indigo Gradient + Crisp White Text ── */}
        <ShopHeroSpotlight
          totalProducts={filteredProducts.length}
          categoryName={currentCategoryObj ? currentCategoryObj.name : ''}
          searchQuery={searchQuery}
          onSearchSubmit={handleSearchSubmit}
          onSearchClear={handleSearchClear}
        />

        {/* ── 2. Master 2-Column Shopping Catalog ── */}
        <div className="container">
          <div
            className="shop-main-layout"
            style={{
              display: 'flex',
              alignItems: 'stretch',
              gap: '2.25rem',
              position: 'relative',
            }}
          >
            {/* ── Left Sticky Filter Sidebar ── */}
            <ShopSidebarFilter
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onSelectCategory={handleCategoryChange}
              onSelectSubCategory={handleSubCategoryChange}
              urlMaxPrice={urlMaxPrice}
              onSelectMaxPrice={handleMaxPriceChange}
              quickFilters={quickFilters}
              onToggleQuickFilter={handleToggleQuickFilter}
              activeFilterCount={activeFilterCount}
              onResetAll={handleResetAll}
            />

            {/* ── Right Product Catalog Main Area ── */}
            <main style={{ flexGrow: 1, minWidth: 0, width: '100%' }}>
              {/* Catalog Control Header Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.35rem',
                  background: '#f8fafc',
                  borderRadius: '18px',
                  border: '1.5px solid #e2e8f0',
                  marginBottom: '1.75rem',
                }}
              >
                {/* Left: Mobile Filter Button + Product Count + Active Filter Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  {/* Mobile Filter Drawer Button (Visible on <= 990px) */}
                  <button
                    type="button"
                    onClick={() => setIsMobileDrawerOpen(true)}
                    className="shop-mobile-filter-btn"
                    style={{
                      display: 'none',
                      alignItems: 'center',
                      gap: '0.45rem',
                      padding: '0.45rem 0.95rem',
                      borderRadius: '10px',
                      background: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    <SlidersHorizontal size={14} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#7c3aed',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                    Showing <strong style={{ color: '#0f172a' }}>{filteredProducts.length}</strong> items
                  </span>

                  {/* Active Dismissible Tags */}
                  {selectedCategory && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#f3e8ff',
                        color: '#7c3aed',
                        padding: '0.22rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                      }}
                    >
                      <span>{currentCategoryObj?.name || selectedCategory}</span>
                      <X
                        size={13}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleCategoryChange('')}
                      />
                    </span>
                  )}

                  {urlMaxPrice && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#ecfdf5',
                        color: '#059669',
                        padding: '0.22rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                      }}
                    >
                      <span>Under ₹{urlMaxPrice}</span>
                      <X
                        size={13}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleMaxPriceChange('')}
                      />
                    </span>
                  )}

                  {quickFilters.rating4Plus && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#fffbeb',
                        color: '#b45309',
                        padding: '0.22rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                      }}
                    >
                      <span>4.5★+</span>
                      <X
                        size={13}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleToggleQuickFilter('rating4Plus')}
                      />
                    </span>
                  )}

                  {quickFilters.discount40 && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: '#fdf2f8',
                        color: '#be185d',
                        padding: '0.22rem 0.65rem',
                        borderRadius: '9999px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                      }}
                    >
                      <span>40%+ OFF</span>
                      <X
                        size={13}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleToggleQuickFilter('discount40')}
                      />
                    </span>
                  )}

                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetAll}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Right: Sort Dropdown & Grid View Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Sort:
                    </span>
                    <select
                      value={sort}
                      onChange={(e) => {
                        const next = new URLSearchParams(searchParams);
                        next.set('sort', e.target.value);
                        setSearchParams(next);
                      }}
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#1e293b',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                      aria-label="Sort products"
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="featured">Best Sellers & Featured</option>
                      <option value="rating">Customer Ratings</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Grid Layout Switcher */}
                  <div
                    className="shop-grid-switcher"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '0.18rem',
                      borderRadius: '10px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setGridCols(3)}
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '7px',
                        border: 'none',
                        background: gridCols === 3 ? '#7c3aed' : 'transparent',
                        color: gridCols === 3 ? '#ffffff' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      title="3-Column Editorial Grid"
                    >
                      <LayoutGrid size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setGridCols(4)}
                      style={{
                        padding: '0.35rem 0.5rem',
                        borderRadius: '7px',
                        border: 'none',
                        background: gridCols === 4 ? '#7c3aed' : 'transparent',
                        color: gridCols === 4 ? '#ffffff' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      title="4-Column Compact Grid"
                    >
                      <Grid3X3 size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Catalog Grid */}
              {loading ? (
                <div
                  className="shop-catalog-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                    gap: '1.5rem',
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      style={{
                        height: '380px',
                        borderRadius: '24px',
                        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'pulse 1.5s infinite',
                      }}
                    />
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                /* Empty State */
                <div
                  style={{
                    background: '#faf5ff',
                    borderRadius: '24px',
                    padding: '4.5rem 2rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(124, 58, 237, 0.04)',
                    maxWidth: '560px',
                    margin: '3rem auto',
                    border: '1.5px solid #e9d5ff',
                  }}
                >
                  <div
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      color: '#7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.25rem',
                      boxShadow: '0 6px 18px rgba(124, 58, 237, 0.15)',
                    }}
                  >
                    <Search size={32} strokeWidth={2.3} />
                  </div>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 900, color: '#1e1b4b' }}>
                    No Matching Products Found
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    We couldn&rsquo;t find anything matching your exact filter selection. Try resetting filters to explore the full catalog.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAll}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.85rem',
                      borderRadius: '9999px',
                      background: '#7c3aed',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(124, 58, 237, 0.28)',
                    }}
                  >
                    <RotateCcw size={16} /> Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="shop-catalog-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                      gap: '1.5rem',
                    }}
                  >
                    {visibleProducts.map((product, idx) => {
                      const showBazaarBanner = idx === 6;

                      return (
                        <React.Fragment key={product._id || product.id || idx}>
                          {/* In-Feed Editorial Break: Bazaar (after item 6) */}
                          {showBazaarBanner && (
                            <ShopInFeedBanner
                              variant="bazaar"
                              onFilterClick={(budget) => handleMaxPriceChange(budget)}
                            />
                          )}

                          {/* Product Card */}
                          <ProductCard product={product} />
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* ── Clean Load More Action (No awkward progress text) ── */}
                  {hasMore && (
                    <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 12)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.85rem 2.5rem',
                          borderRadius: '9999px',
                          background: '#ffffff',
                          color: '#1e1b4b',
                          border: '2px solid #e2e8f0',
                          fontSize: '0.92rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                        className="clean-loadmore-btn"
                      >
                        <span>Load Next 12 Products</span>
                        <ArrowDown size={16} strokeWidth={2.6} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* ── Mobile/Tablet Slide-Over Filter Drawer ── */}
      <ShopFilterDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        categories={categories}
        filterState={{
          category: selectedCategory,
          maxPrice: urlMaxPrice,
          minRating: quickFilters.rating4Plus ? '4.5' : '',
          minDiscount: quickFilters.discount40 ? '40' : '',
        }}
        onUpdateFilter={(key, val) => {
          if (key === 'category') handleCategoryChange(val);
          if (key === 'maxPrice') handleMaxPriceChange(val);
          if (key === 'minRating') setQuickFilters((p) => ({ ...p, rating4Plus: val === '4.5' }));
          if (key === 'minDiscount') setQuickFilters((p) => ({ ...p, discount40: val === '40' || val === '50' }));
        }}
        onResetAll={handleResetAll}
        matchingCount={filteredProducts.length}
      />

      <style>{`
        .clean-loadmore-btn:hover {
          background: #7c3aed !important;
          color: #ffffff !important;
          border-color: #7c3aed !important;
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.28) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 990px) {
          .shop-mobile-filter-btn {
            display: inline-flex !important;
          }
          .shop-main-layout {
            flex-direction: column !important;
          }
        }
        @media (max-width: 1200px) {
          .shop-catalog-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 768px) {
          .shop-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }
        }
        @media (max-width: 480px) {
          .shop-catalog-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }
        }
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </PageWrapper>
  );
}
