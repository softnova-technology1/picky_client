import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import CategoryHeroCarousel from '../components/category/CategoryHeroCarousel';
import WomensPillShowcase from '../components/category/WomensPillShowcase';
import WomensSubcategoryIcons from '../components/category/WomensSubcategoryIcons';
import GlamicsCategoryPills from '../components/category/GlamicsCategoryPills';
import GlamicsPromoBanner from '../components/category/GlamicsPromoBanner';
import GlamicsSplitBanners from '../components/category/GlamicsSplitBanners';
import CategoryCard from '../components/product/CategoryCard';
import { MOCK_CATEGORIES } from '../data/adminMockData';
import { Sparkles, ArrowUpRight, ShieldCheck, Truck, RefreshCw, Headphones } from 'lucide-react';

export default function Categories() {
  // Use strictly mock data from adminMockData.js as instructed
  const [categories] = useState(MOCK_CATEGORIES);
  const [activeFilter, setActiveFilter] = useState('all');

  // Filter tabs for Glamics-style department container
  const filterTabs = [
    { id: 'all', label: 'All Departments' },
    { id: 'fashion-jewellery', label: 'Fashion & Jewellery', slugs: ['womens-fashion', 'artificial-jewellery', 'beauty-personal-care'] },
    { id: 'traditional-foods', label: 'Tamil & Foods', slugs: ['traditional-tamil-products', 'snacks-foods'] },
    { id: 'home-living', label: 'Home & Décor', slugs: ['home-kitchen', 'home-decor'] },
    { id: 'tech-lifestyle', label: 'Tech & Fitness', slugs: ['mobile-accessories', 'fitness-products', 'kids-products'] },
  ];

  const filteredCategories = useMemo(() => {
    if (activeFilter === 'all') return categories;
    const tab = filterTabs.find((t) => t.id === activeFilter);
    if (tab && tab.slugs) {
      return categories.filter((cat) => tab.slugs.includes(cat.slug));
    }
    // If user clicked an individual category slug from pills
    const singleMatch = categories.filter((cat) => cat.slug === activeFilter);
    return singleMatch.length > 0 ? singleMatch : categories;
  }, [activeFilter, categories]);

  return (
    <PageWrapper>
      <div style={{ background: '#faf5ff', minHeight: '100vh', paddingBottom: '6rem' }}>
        {/* ── 1. Glamics-Style Double-Card Hero Section (Fitted to 100vh) ── */}
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '1.25rem clamp(1rem, 2.5vw, 2.5rem) 1.5rem',
            marginBottom: '3rem',
          }}
        >
          <CategoryHeroCarousel categories={categories} />
        </div>

        <div className="container">
          {/* ── 2. Exclusive Women's 4-Pill Showcase (User Requested Premium Shades 3D Cutout Pills) ── */}
          <WomensPillShowcase />

          {/* ── 3. Silhouette Subcategory Strip (Glamics Category Icon Strip) ── */}
          <WomensSubcategoryIcons
            onSelectSubcategory={(subcatId) => {
              if (subcatId === 'all') {
                setActiveFilter('all');
              } else if (subcatId === 'jewellery') {
                setActiveFilter('artificial-jewellery');
              } else {
                setActiveFilter('womens-fashion');
              }
            }}
          />

          {/* ── 4. Glamics 2-Row Category Quick Pills Bar ── */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#7c3aed',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.9rem',
              }}
            >
              <Sparkles size={15} />
              <span>Quick Category Access</span>
            </div>
            <GlamicsCategoryPills
              categories={categories}
              activeFilter={activeFilter}
              onSelectFilter={(slug) => {
                // Toggle filter or set active
                setActiveFilter((prev) => (prev === slug ? 'all' : slug));
              }}
            />
          </div>

          {/* ── 4. Glamics-Style Department Showcase Container ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '36px',
              padding: 'clamp(1.5rem, 3vw, 2.75rem)',
              border: '1px solid rgba(216, 180, 254, 0.45)',
              boxShadow: '0 20px 50px rgba(124, 58, 237, 0.05)',
              marginBottom: '4.5rem',
            }}
          >
            {/* Header: Title, Filter Tabs & Catalog CTA */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: '2.25rem',
                flexWrap: 'wrap',
                gap: '1.25rem',
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
                    letterSpacing: '0.1em',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Sparkles size={15} /> Curated Departments
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
                    color: '#1e1b4b',
                    margin: 0,
                    fontWeight: 900,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Explore All 10 Categories
                </h2>
              </div>

              {/* View Full Catalog Pill Button */}
              <Link
                to="/products"
                className="glamics-header-catalog-btn"
                style={{
                  color: '#6b21a8',
                  background: '#f5f0ff',
                  border: '1.5px solid #ede9fe',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  padding: '0.65rem 1.4rem',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)',
                  transition: 'all 0.25s ease',
                }}
              >
                <span>View Full Catalog</span>
                <ArrowUpRight size={17} strokeWidth={2.4} />
              </Link>
            </div>

            {/* Filter Tabs Row (Glamics Style) */}
            <div
              style={{
                display: 'flex',
                gap: '0.6rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                marginBottom: '2rem',
                scrollbarWidth: 'none',
              }}
            >
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
                        : '#f8fafc',
                      color: isActive ? '#ffffff' : '#475569',
                      border: isActive ? 'none' : '1px solid #e2e8f0',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: isActive ? '0 6px 18px rgba(124, 58, 237, 0.35)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* 10 Departments Responsive Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
              }}
            >
              {filteredCategories.map((cat) => (
                <CategoryCard key={cat._id || cat.slug} category={cat} />
              ))}
            </div>
          </div>

          {/* ── 5. Glamics Full-Width Promotional Gradient Banner ── */}
          <GlamicsPromoBanner />

          {/* ── 6. Glamics 3-Column Split Category Showcase Banners ── */}
          <GlamicsSplitBanners />

          {/* ── 7. Glamics 4-Badge Customer Assurance Strip ── */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '28px',
              padding: '2.25rem 1.75rem',
              boxShadow: '0 12px 35px rgba(0, 0, 0, 0.04)',
              border: '1px solid rgba(216, 180, 254, 0.35)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.75rem',
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
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>100% Quality Tested</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Every product physically inspected</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.15)',
                }}
              >
                <Truck size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>24-48h Express Dispatch</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Direct courier with live AWB tracking</span>
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
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
                }}
              >
                <RefreshCw size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>7-Day Easy Replacement</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Hassle-free replacement guarantee</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#ede9fe',
                  color: '#6d28d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(109, 40, 217, 0.15)',
                }}
              >
                <Headphones size={26} />
              </div>
              <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>24/7 Dedicated Support</strong>
              <span style={{ color: '#64748b', fontSize: '0.84rem' }}>Instant WhatsApp & Phone help</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .glamics-header-catalog-btn:hover {
          background: #7c3aed !important;
          color: #ffffff !important;
          border-color: #7c3aed !important;
          box-shadow: 0 8px 22px rgba(124, 58, 237, 0.35) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </PageWrapper>
  );
}
