import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductCard from '../../components/product/ProductCard';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { useCategoryStore } from '../../store/categoryStore';
import {
  Tag,
  Percent,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  SlidersHorizontal,
  Flame,
  Zap,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';
import '../../styles/home-premium.css';

export default function Discounts() {
  const navigate = useNavigate();
  const { categories, fetchCategories } = useCategoryStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('highest-discount'); // 'highest-discount' | 'price-low' | 'price-high' | 'newest'

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    async function loadDiscounts() {
      try {
        setLoading(true);
        const res = await productService.list({ limit: 200, includeInactive: false });
        const list = res?.data?.data || res?.data || [];
        setProducts(list);
      } catch (err) {
        console.error('Failed to load discount products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadDiscounts();
  }, []);

  // Helper to check tags
  const hasTag = (p, keyword) => {
    if (!p) return false;
    const kw = keyword.toLowerCase();
    if (Array.isArray(p.tags)) {
      return p.tags.some(
        (t) => typeof t === 'string' && t.toLowerCase().includes(kw)
      );
    }
    if (typeof p.tags === 'string') {
      return p.tags.toLowerCase().includes(kw);
    }
    if (typeof p.tag === 'string') {
      return p.tag.toLowerCase().includes(kw);
    }
    return false;
  };

  // Filter products: either has active discount from Admin OR has "limited deals" tag
  const activeDiscountProducts = useMemo(() => {
    const now = Date.now();
    return products.filter((p) => {
      // 1. Check if product has "Limited Deals" / "deal" / "limited" tag
      const isTaggedLimitedDeal = hasTag(p, 'limited') || hasTag(p, 'deal');

      // 2. Check if product has active discount configured in Admin Discounts
      let isConfiguredDiscount = false;
      if (p.isDiscountActive) {
        const hasDiscount = p.discountPrice !== undefined && p.discountPrice !== null && p.discountPrice < p.price;
        if (hasDiscount) {
          const startDateValid = !p.offerStartDate || isNaN(new Date(p.offerStartDate).getTime()) || new Date(p.offerStartDate).getTime() <= now;
          const endDate = p.offerEndDate || p.validTill || p.endDate;
          const endDateValid = !endDate || isNaN(new Date(endDate).getTime()) || new Date(endDate).getTime() >= now;
          if (startDateValid && endDateValid) {
            isConfiguredDiscount = true;
          }
        }
      }

      // Show if either has active discount OR has limited deals tag
      return isConfiguredDiscount || isTaggedLimitedDeal;
    });
  }, [products]);

  // Available categories among discounted items
  const availableCategories = useMemo(() => {
    const catMap = new Map();
    activeDiscountProducts.forEach((p) => {
      const catName =
        typeof p.category === 'object' && p.category?.name
          ? p.category.name
          : p.subCategory || (typeof p.category === 'string' ? p.category : null);
      const catId = typeof p.category === 'object' && p.category?.slug ? p.category.slug : catName;
      if (catName && catId) {
        catMap.set(catId, catName);
      }
    });
    return Array.from(catMap.entries()).map(([id, label]) => ({ id, label }));
  }, [activeDiscountProducts]);

  // Search, Category filter, and Sorting
  const filteredProducts = useMemo(() => {
    let result = activeDiscountProducts;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.offerLabel?.toLowerCase().includes(q) ||
          (typeof p.category === 'object' && p.category?.name?.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => {
        const catSlug = typeof p.category === 'object' && p.category?.slug ? p.category.slug : '';
        const catName = typeof p.category === 'object' && p.category?.name ? p.category.name : p.subCategory || p.category;
        return catSlug === selectedCategory || catName === selectedCategory;
      });
    }

    // Sort
    return [...result].sort((a, b) => {
      const discPctA = ((a.price - a.discountPrice) / a.price) * 100 || 0;
      const discPctB = ((b.price - b.discountPrice) / b.price) * 100 || 0;

      if (sortBy === 'highest-discount') {
        return discPctB - discPctA;
      }
      if (sortBy === 'price-low') {
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      }
      if (sortBy === 'price-high') {
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return 0;
    });
  }, [activeDiscountProducts, searchQuery, selectedCategory, sortBy]);

  // Max discount stat
  const maxDiscountPct = useMemo(() => {
    const discountsWithSavings = activeDiscountProducts
      .filter((p) => p.price && p.discountPrice && p.discountPrice < p.price)
      .map((p) => Math.round(((p.price - p.discountPrice) / p.price) * 100));

    if (!discountsWithSavings.length) return 0;
    return Math.max(...discountsWithSavings);
  }, [activeDiscountProducts]);

  return (
    <PageWrapper>
      <div style={{ background: '#fdfbf7', minHeight: '100vh', paddingBottom: '5rem' }}>
        {/* ── 1. Hero Banner ── */}
        <section
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #170733 0%, #2b0f55 50%, #4c1d95 100%)',
            color: '#ffffff',
            padding: '4.5rem 1.5rem 4rem',
            overflow: 'hidden',
          }}
        >
          {/* Decorative Background Elements */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-25%',
              left: '-5%',
              width: '420px',
              height: '420px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(234, 88, 12, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              position: 'relative',
              zIndex: 2,
              textAlign: 'center',
            }}
          >
            {/* Live Indicator Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                color: '#fef08a',
                marginBottom: '1.25rem',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  boxShadow: '0 0 10px #22c55e',
                }}
              />
              LIMITED DEALS • LIVE NOW
            </div>

            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
                fontWeight: 800,
                lineHeight: 1.15,
                margin: '0 0 1rem',
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              Limited <span
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f472b6 50%, #c084fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Deals
              </span>
            </h1>

            <p
              style={{
                maxWidth: '640px',
                margin: '0 auto 2rem',
                fontSize: 'clamp(0.95rem, 1.8vw, 1.12rem)',
                color: '#e2e8f0',
                lineHeight: 1.6,
              }}
            >
              Discover curated artisanal luxury and handcrafted treasures at limited deal prices. All discounts are verified and applied automatically at checkout.
            </p>

            {/* Stat Counters Row */}
            <div
              style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '1.5rem',
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(12px)',
                padding: '0.9rem 1.8rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Zap size={18} color="#fbbf24" />
                <span style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
                  <strong>{activeDiscountProducts.length}</strong> Active Deals Live
                </span>
              </div>
              {maxDiscountPct > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Flame size={18} color="#f97316" />
                  <span style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
                    Up to <strong>{maxDiscountPct}% OFF</strong>
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={18} color="#c084fc" />
                <span style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
                  100% Authentic Products
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Filters & Search Toolbar ── */}
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            padding: '2rem 1.5rem 1rem',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 4px 20px rgba(109, 40, 217, 0.05)',
              border: '1px solid #ede9fe',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            {/* Search Box */}
            <div style={{ position: 'relative', width: '320px', flex: '1 1 260px' }}>
              <Search
                size={17}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search limited deals, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  paddingLeft: '40px',
                  paddingRight: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#fafafa',
                  fontSize: '0.88rem',
                  color: '#1e293b',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                <SlidersHorizontal size={15} />
                <span>Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  height: '42px',
                  padding: '0 1rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="highest-discount">Highest Discount (% OFF)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Deals</option>
              </select>

              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  style={{
                    height: '42px',
                    padding: '0 1rem',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          {availableCategories.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                overflowX: 'auto',
                paddingTop: '1.25rem',
                paddingBottom: '0.5rem',
                scrollbarWidth: 'none',
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '0.45rem 1.1rem',
                  borderRadius: '999px',
                  border: selectedCategory === 'all' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                  background: selectedCategory === 'all' ? '#7c3aed' : '#ffffff',
                  color: selectedCategory === 'all' ? '#ffffff' : '#475569',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedCategory === 'all' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                }}
              >
                All Deals ({activeDiscountProducts.length})
              </button>

              {availableCategories.map((c) => {
                const count = activeDiscountProducts.filter((p) => {
                  const catSlug = typeof p.category === 'object' && p.category?.slug ? p.category.slug : '';
                  const catName = typeof p.category === 'object' && p.category?.name ? p.category.name : p.subCategory || p.category;
                  return catSlug === c.id || catName === c.id;
                }).length;

                const isSelected = selectedCategory === c.id;

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.id)}
                    style={{
                      padding: '0.45rem 1.1rem',
                      borderRadius: '999px',
                      border: isSelected ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                      background: isSelected ? '#7c3aed' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                    }}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Products Grid Section ── */}
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '1rem 1.5rem 2rem' }}>
          {loading ? (
            <div style={{ padding: '5rem 0', textAlign: 'center' }}>
              <Spinner size="lg" />
              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.92rem' }}>
                Loading live limited deals...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '4.5rem 1.5rem',
                textAlign: 'center',
                border: '1px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Tag size={28} />
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '1.45rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  margin: '0 0 0.5rem',
                }}
              >
                No limited deals found
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
                {searchQuery || selectedCategory !== 'all'
                  ? 'No products match your current filters. Try resetting search or category filter.'
                  : 'There are currently no active limited deals configured. Check back soon for new deals!'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  navigate('/shop');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '10px',
                  background: '#7c3aed',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.25)',
                }}
              >
                <span>Browse All Products</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '1.25rem', fontSize: '0.86rem', color: '#64748b', fontWeight: 500 }}>
                Showing <strong style={{ color: '#0f172a' }}>{filteredProducts.length}</strong> active limited deals
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {filteredProducts.map((p) => (
                  <ProductCard key={p._id || p.id || p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
