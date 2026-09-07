import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ProductGrid from '../components/product/ProductGrid';
import { productService } from '../services/product.service';
import { categoryService } from '../services/category.service';
import { getProducts, categories as defaultCategories, searchProducts } from '../data';
import { Search, X, SlidersHorizontal, Sparkles, ArrowRight, RotateCcw, Check, ChevronRight } from 'lucide-react';
import BestSellersHeroSection from '../components/bestseller/BestSellersHeroSection';

export default function ProductList() {
  const { slug: routeCategorySlug, subSlug: routeSubSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedCategory = searchParams.get('category') || routeCategorySlug || '';
  const selectedSubCategory = searchParams.get('subCategory') || routeSubSlug || '';
  const searchQuery = searchParams.get('q') || searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'newest';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Sync search input if URL changes
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

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
        setCategories(defaultCategories);
      }
    }
    fetchCategories();
  }, []);

  // Fetch or filter products based on query, category, subCategory, and sort
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
          // Fallback to local mock data
        }

        if (Array.isArray(items) && items.length > 0) {
          setProducts(items);
        } else {
          // Fallback to local client mock data
          if (searchQuery.trim()) {
            setProducts(searchProducts(searchQuery, params));
          } else {
            setProducts(getProducts(params));
          }
        }
      } catch (err) {
        if (searchQuery.trim()) {
          setProducts(searchProducts(searchQuery, { sort, category: selectedCategory, subCategory: selectedSubCategory }));
        } else {
          setProducts(getProducts({ sort, category: selectedCategory, subCategory: selectedSubCategory }));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCategory, selectedSubCategory, searchQuery, sort]);

  // Current selected category object
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

  const handleCategoryChange = (catSlug) => {
    const next = new URLSearchParams();
    if (catSlug) {
      next.set('category', catSlug);
    }
    if (searchQuery) next.set('q', searchQuery);
    if (sort !== 'newest') next.set('sort', sort);
    setSearchParams(next);
  };

  const handleSubCategoryChange = (subSlug) => {
    const next = new URLSearchParams(searchParams);
    if (subSlug) {
      next.set('subCategory', subSlug);
    } else {
      next.delete('subCategory');
    }
    setSearchParams(next);
  };

  const handleSortChange = (newSort) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', newSort);
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      next.set('q', searchInput.trim());
    } else {
      next.delete('q');
      next.delete('search');
    }
    setSearchParams(next);
  };

  const clearSearch = () => {
    setSearchInput('');
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    next.delete('search');
    setSearchParams(next);
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
    if (routeCategorySlug) {
      navigate('/products');
    }
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) + (selectedSubCategory ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <PageWrapper>
      {/* Editorial Best Sellers Hero Section matching reference image */}
      {(sort === 'rating' || sort === 'featured' || (!selectedCategory && !searchQuery)) && (
        <BestSellersHeroSection />
      )}

      <div className="section" style={{ background: '#faf5ff', minHeight: '80vh', padding: '2rem 0 5rem' }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.85rem',
              color: '#64748b',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/" style={{ color: '#64748b' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" style={{ color: selectedCategory ? '#64748b' : '#7c3aed', fontWeight: selectedCategory ? 400 : 700 }}>
              Catalog
            </Link>
            {currentCategoryObj && (
              <>
                <ChevronRight size={14} />
                <Link to={`/categories/${currentCategoryObj.slug}`} style={{ color: selectedSubCategory ? '#64748b' : '#7c3aed', fontWeight: selectedSubCategory ? 400 : 700 }}>
                  {currentCategoryObj.name}
                </Link>
              </>
            )}
            {selectedSubCategory && (
              <>
                <ChevronRight size={14} />
                <span style={{ color: '#7c3aed', fontWeight: 700 }}>{selectedSubCategory}</span>
              </>
            )}
          </div>

          {/* Header & Controls Bar */}
          <div
            id="bestsellers-grid-start"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              padding: 'clamp(1.5rem, 3vw, 2.2rem)',
              boxShadow: '0 4px 24px rgba(124, 58, 237, 0.05)',
              border: '1.5px solid #f1f5f9',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    color: '#7c3aed',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Sparkles size={15} /> Curated Lifestyle Store
                </div>
                <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.3rem)', color: '#0f172a', margin: '0 0 0.35rem' }}>
                  {currentCategoryObj
                    ? `${currentCategoryObj.icon ? currentCategoryObj.icon + ' ' : ''}${currentCategoryObj.name}`
                    : searchQuery
                    ? `Results for "${searchQuery}"`
                    : 'Explore All Products'}
                </h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
                  Showing <strong>{products.length}</strong> {products.length === 1 ? 'item' : 'curated items'} ready for quick 24-hour dispatch.
                </p>
              </div>

              {/* Instant Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '0.3rem 0.6rem 0.3rem 1rem',
                  width: '100%',
                  maxWidth: '380px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                <Search size={17} color="#64748b" style={{ flexShrink: 0, marginRight: '0.5rem' }} />
                <input
                  type="text"
                  placeholder="Search sarees, jewellery, snacks..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.92rem',
                    width: '100%',
                    color: '#0f172a',
                  }}
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginLeft: '0.4rem',
                    flexShrink: 0,
                  }}
                >
                  Search
                </button>
              </form>
            </div>

            {/* Department Quick Tabs (Horizontal Scrollable) */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                overflowX: 'auto',
                paddingBottom: '0.6rem',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '1.25rem',
              }}
            >
              <button
                onClick={() => handleCategoryChange('')}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  border: !selectedCategory ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                  background: !selectedCategory ? '#7c3aed' : '#ffffff',
                  color: !selectedCategory ? '#ffffff' : '#475569',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                ✨ All Departments
              </button>
              {categories.map((cat) => {
                const isCatActive =
                  selectedCategory === cat.slug ||
                  selectedCategory === cat._id ||
                  selectedCategory.toLowerCase() === cat.slug?.toLowerCase();
                return (
                  <button
                    key={cat._id || cat.slug}
                    onClick={() => handleCategoryChange(cat.slug || cat._id)}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '9999px',
                      border: isCatActive ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                      background: isCatActive ? '#7c3aed' : '#ffffff',
                      color: isCatActive ? '#ffffff' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    <span>{cat.icon || '🛍️'}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter & Sort Controls Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              {/* Subcategories Row (If department selected) */}
              {currentCategoryObj && Array.isArray(currentCategoryObj.subcategories) && currentCategoryObj.subcategories.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                    Filter by:
                  </span>
                  <button
                    onClick={() => handleSubCategoryChange('')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: !selectedSubCategory ? '#f3e8ff' : '#f8fafc',
                      color: !selectedSubCategory ? '#6b21a8' : '#64748b',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    All {currentCategoryObj.name}
                  </button>
                  {currentCategoryObj.subcategories.map((sub) => {
                    const isSubActive =
                      selectedSubCategory === sub.slug ||
                      selectedSubCategory === sub._id ||
                      selectedSubCategory.toLowerCase() === sub.slug?.toLowerCase();
                    return (
                      <button
                        key={sub._id || sub.slug}
                        onClick={() => handleSubCategoryChange(sub.slug || sub._id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: isSubActive ? '#7c3aed' : '#f1f5f9',
                          color: isSubActive ? '#ffffff' : '#475569',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Showing curated verified items across all 10 departments
                </div>
              )}

              {/* Sort Selector & Reset button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Sort:</span>
                <select
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="form-select"
                  style={{
                    padding: '0.5rem 0.9rem',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    color: '#1e293b',
                    cursor: 'pointer',
                    background: '#ffffff',
                    width: 'auto',
                  }}
                  aria-label="Sort products"
                >
                  <option value="newest">✨ Newest Arrivals</option>
                  <option value="price_asc">💵 Price: Low to High</option>
                  <option value="price_desc">💎 Price: High to Low</option>
                  <option value="featured">🔥 Best Sellers & Featured</option>
                </select>

                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem 0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.82rem',
                      borderRadius: '10px',
                    }}
                    title="Reset all filters"
                  >
                    <RotateCcw size={13} /> Reset ({activeFiltersCount})
                  </button>
                )}
              </div>
            </div>

            {/* Active search pill tag */}
            {searchQuery && (
              <div
                style={{
                  marginTop: '1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#f3e8ff',
                  color: '#6b21a8',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <Search size={13} />
                <span>Search keyword: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  onClick={clearSearch}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b21a8',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Product Grid or Empty State */}
          {products.length === 0 && !loading ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '24px',
                padding: '4rem 2rem',
                textAlign: 'center',
                boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
                maxWidth: '560px',
                margin: '0 auto',
                border: '1.5px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#faf5ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Search size={32} />
              </div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.3rem', color: '#0f172a' }}>No products found</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                We couldn&rsquo;t find any items matching your current filters. Try resetting your filters to browse our full lifestyle collection.
              </p>
              <button
                onClick={resetAllFilters}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', borderRadius: '9999px' }}
              >
                Reset All Filters <RotateCcw size={16} />
              </button>
            </div>
          ) : (
            <ProductGrid products={products} loading={loading} />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

