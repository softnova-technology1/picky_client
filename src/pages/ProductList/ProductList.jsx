import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductCard from '../../components/product/ProductCard';
import ShopHeroSpotlight from '../../components/shop/ShopHeroSpotlight';
import ShopSidebarFilter from '../../components/shop/ShopSidebarFilter';
import ShopFilterDrawer from '../../components/shop/ShopFilterDrawer';
import ShopInFeedBanner from '../../components/shop/ShopInFeedBanner';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { getProducts, categories as defaultCategories, searchProducts } from '../../data';
import { Search, RotateCcw, ArrowDown, SlidersHorizontal, X, Sparkles, ArrowRight, Check, ChevronRight } from 'lucide-react';

export default function ProductList() {
  const { slug: routeCategorySlug, subSlug: routeSubSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL parameters
  const selectedCategory = searchParams.get('category') || routeCategorySlug || '';
  const selectedSubCategory = searchParams.get('subCategory') || routeSubSlug || '';
  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'all';
  const urlMaxPrice = searchParams.get('maxPrice') || '';
  const urlMinDiscount = searchParams.get('discount') || '';

  // Local state
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridCols, setGridCols] = useState(4); // 4-col compact grid default
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);

  // Quick Filters State
  const [quickFilters, setQuickFilters] = useState({
    discount40: false,
  });

  // Load Categories list
  useEffect(() => {
    async function fetchCategories() {
      try {
        const [catRes, subRes] = await Promise.all([
          categoryService.list().catch(() => null),
          categoryService.getSubCategories().catch(() => null),
        ]);
        const cItems = catRes?.data || [];
        const sItems = subRes?.data || [];
        if (Array.isArray(cItems) && cItems.length > 0) {
          setCategories(cItems);
        }
        if (Array.isArray(sItems) && sItems.length > 0) {
          setSubcategories(sItems);
        }
      } catch (err) {
        setCategories(defaultCategories);
        setSubcategories([]);
      }
    }
    fetchCategories();
  }, []);

  // Fetch or filter products based on query and sort
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = { sort: sort === 'all' ? 'newest' : sort };
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
          setAllProducts(searchProducts(searchQuery, { sort: sort === 'all' ? 'newest' : sort, category: selectedCategory, subCategory: selectedSubCategory }));
        } else {
          setAllProducts(getProducts({ sort: sort === 'all' ? 'newest' : sort, category: selectedCategory, subCategory: selectedSubCategory }));
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
    const cat = categories.find(
      (c) =>
        c._id === selectedCategory ||
        c.slug === selectedCategory ||
        c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
        c.name?.toLowerCase() === selectedCategory.toLowerCase()
    ) || null;
    
    if (cat) {
      cat.subcategories = subcategories.filter(s => s.categoryId === cat._id || s.categoryId?._id === cat._id);
    }
    return cat;
  }, [categories, subcategories, selectedCategory]);

  // Multi-facet filtering on loaded products
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Category Filter
    if (selectedCategory) {
      const catTarget = String(selectedCategory).toLowerCase();
      result = result.filter((p) => {
        if (!p.category) return false;
        if (typeof p.category === 'object') {
          return (
            String(p.category.slug || '').toLowerCase() === catTarget ||
            String(p.category._id || '').toLowerCase() === catTarget ||
            String(p.category.name || '').toLowerCase() === catTarget
          );
        }
        return String(p.category).toLowerCase() === catTarget;
      });
    }

    // SubCategory Filter
    if (selectedSubCategory) {
      const subTarget = String(selectedSubCategory).toLowerCase();
      result = result.filter((p) => {
        if (!p.subCategory) return false;
        if (typeof p.subCategory === 'object') {
          return (
            String(p.subCategory.slug || '').toLowerCase() === subTarget ||
            String(p.subCategory._id || '').toLowerCase() === subTarget ||
            String(p.subCategory.name || '').toLowerCase() === subTarget
          );
        }
        return String(p.subCategory).toLowerCase() === subTarget;
      });
    }

    // Search Filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Price Filter
    if (urlMaxPrice) {
      result = result.filter((p) => {
        const effectivePrice = Number(p.discountPrice || p.price || 0);
        if (urlMaxPrice === '2500' || urlMaxPrice === '1000-2500') {
          return effectivePrice >= 1000 && effectivePrice <= 2500;
        }
        if (urlMaxPrice === '5000' || urlMaxPrice === '2500+' || urlMaxPrice === 'above_2500') {
          return effectivePrice >= 2500;
        }
        const maxP = Number(urlMaxPrice);
        if (!isNaN(maxP) && maxP > 0) {
          return effectivePrice <= maxP;
        }
        return true;
      });
    }

    // Discount Filter
    const activeDiscountThreshold = urlMinDiscount ? Number(urlMinDiscount) : (quickFilters.discount40 ? 40 : 0);
    if (activeDiscountThreshold > 0) {
      result = result.filter((p) => {
        if (p.discount && Number(p.discount) >= activeDiscountThreshold) return true;
        if (p.discountPercentage && Number(p.discountPercentage) >= activeDiscountThreshold) return true;

        const p1 = Number(p.price || 0);
        const p2 = Number(p.discountPrice || 0);
        if (p1 > 0 && p2 > 0 && p1 > p2) {
          const pct = Math.round(((p1 - p2) / p1) * 100);
          return pct >= activeDiscountThreshold;
        }

        const orig = Number(p.originalPrice || 0);
        const curr = Number(p.price || p.discountPrice || 0);
        if (orig > 0 && curr > 0 && orig > curr) {
          const pct = Math.round(((orig - curr) / orig) * 100);
          return pct >= activeDiscountThreshold;
        }

        return false;
      });
    }

    // Sorting
    if (sort === 'price_asc') {
      result.sort((a, b) => {
        const pa = Number(a.discountPrice || a.price || 0);
        const pb = Number(b.discountPrice || b.price || 0);
        return pa - pb;
      });
    } else if (sort === 'price_desc') {
      result.sort((a, b) => {
        const pa = Number(a.discountPrice || a.price || 0);
        const pb = Number(b.discountPrice || b.price || 0);
        return pb - pa;
      });
    } else if (sort === 'featured') {
      result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [allProducts, quickFilters, urlMaxPrice, urlMinDiscount, selectedCategory, selectedSubCategory, searchQuery, sort]);

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

  // Handle Discount Selection
  const handleDiscountChange = (minDiscount) => {
    const next = new URLSearchParams(searchParams);
    if (minDiscount) {
      next.set('discount', minDiscount);
    } else {
      next.delete('discount');
    }
    setSearchParams(next);
    if (quickFilters.discount40 && minDiscount !== '40') {
      setQuickFilters((prev) => ({ ...prev, discount40: false }));
    }
  };

  // Handle Quick Filter Toggle
  const handleToggleQuickFilter = (key) => {
    setQuickFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset all filters
  const handleResetAll = () => {
    setQuickFilters({
      discount40: false,
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
    (urlMinDiscount || quickFilters.discount40 ? 1 : 0);

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
              urlMinDiscount={urlMinDiscount}
              onSelectDiscount={handleDiscountChange}
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
                {/* Left: Mobile Filter Button + Clean Product Count & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
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

                  {/* Clean Product Title & Count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentCategoryObj ? currentCategoryObj.name : 'All Products'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#6d28d9',
                        background: '#f5edff',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '9999px',
                        border: '1px solid #ddd6fe',
                      }}
                    >
                      {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                </div>

                {/* Right: Sort Dropdown */}
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
                      <option value="all">All Products</option>
                      <option value="newest">Newest Arrivals</option>
                      <option value="featured">Best Sellers & Featured</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
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
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
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
                      gap: '2.25rem 1.35rem',
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
          minDiscount: urlMinDiscount || (quickFilters.discount40 ? '40' : ''),
        }}
        onUpdateFilter={(key, val) => {
          if (key === 'category') handleCategoryChange(val);
          if (key === 'maxPrice') handleMaxPriceChange(val);
          if (key === 'minRating') setQuickFilters((p) => ({ ...p, rating4Plus: val === '4.5' }));
          if (key === 'minDiscount') handleDiscountChange(val);
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
        @media (min-width: 1081px) {
          .shop-catalog-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
            gap: 1.25rem !important;
          }
        }
        @media (max-width: 1080px) and (min-width: 769px) {
          .shop-catalog-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }
        }
        @media (max-width: 768px) {
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
