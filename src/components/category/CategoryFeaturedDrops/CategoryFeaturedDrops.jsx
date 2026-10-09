import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../../product/ProductCard';
import { productService } from '../../../services/product.service';

// Top frequent primary quick tabs (clean text only)
const PRIMARY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'womens-fashion', label: 'Fashion' },
  { id: 'artificial-jewellery', label: 'Jewellery' },
];

// All available categories for the dropdown menu (clean text only)
const DROPDOWN_CATEGORIES = [
  { id: 'home-kitchen', label: 'Home & Kitchen' },
  { id: 'mobile-accessories', label: 'Smart Tech' },
  { id: 'snacks-foods', label: 'Snacks & Foods' },
  { id: 'traditional-tamil-products', label: 'Heritage & Puja' },
  { id: 'fitness-products', label: 'Fitness & Living' },
];

const ALL_CATEGORY_LOOKUP = [
  ...PRIMARY_TABS,
  ...DROPDOWN_CATEGORIES,
];

export default function CategoryFeaturedDrops() {
  const [activeTab, setActiveTab] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch products when activeTab changes
  useEffect(() => {
    setLoading(true);
    const params = { limit: 10, sort: '-createdAt' };
    if (activeTab !== 'all') {
      params.category = activeTab;
    }
    
    productService.list(params)
      .then((res) => {
        // ApiResponse.paginated returns { success: true, data: [...], pagination: {...} }
        setDisplayProducts(res.data || []);
      })
      .catch((err) => console.error('Failed to load featured drops', err))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const activeCategoryObj = useMemo(() => {
    return ALL_CATEGORY_LOOKUP.find((t) => t.id === activeTab);
  }, [activeTab]);

  // Is selected item from the dropdown list?
  const isDropdownCategorySelected = useMemo(() => {
    return DROPDOWN_CATEGORIES.some((c) => c.id === activeTab);
  }, [activeTab]);

  const dropdownButtonLabel = isDropdownCategorySelected
    ? (activeCategoryObj?.label || 'More')
    : 'More Categories';

  return (
    <section className="category-featured-drops-section" style={{ marginBottom: '4.5rem' }}>
      {/* ── Section Header Row: Clean Title on Left, Text Tabs & Dropdown on Right ── */}
      <div
        className="featured-header-container"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
          marginBottom: '2rem',
          paddingBottom: '1.25rem',
          borderBottom: '1.5px solid #f1f5f9',
        }}
      >
        {/* Left Side: Title & Dynamic Count (No Flagship Badge) */}
        <div>
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 2.8vw, 2.3rem)',
              fontWeight: 900,
              color: '#1e1b4b',
              margin: '0 0 0.35rem',
              letterSpacing: '-0.025em',
            }}
          >
            Top Products
          </h2>

          <p
            style={{
              fontSize: '0.88rem',
              color: '#64748b',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Showing <strong style={{ color: '#1e1b4b' }}>{displayProducts.length} top products</strong>{' '}
            {activeTab !== 'all' ? (
              <span>
                in <strong style={{ color: '#7c3aed' }}>{activeCategoryObj?.label}</strong>
              </span>
            ) : (
              'across all departments'
            )}
          </p>
        </div>

        {/* Top Right Side: Clean Text Tabs + Dropdown Selector */}
        <div
          className="featured-filter-bar"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: '#f8fafc',
            padding: '0.3rem',
            borderRadius: '9999px',
            border: '1.5px solid #e2e8f0',
            position: 'relative',
          }}
        >
          {/* Quick Primary Tabs (Pure Text) */}
          {PRIMARY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsDropdownOpen(false);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.45rem 1.05rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 800 : 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: isActive
                    ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
                    : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.28)' : 'none',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                }}
                className={isActive ? '' : 'quick-tab-hover'}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Clean Dropdown Selector for More Categories (No Icons) */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: isDropdownCategorySelected ? 800 : 600,
                border: isDropdownCategorySelected ? 'none' : '1px solid #cbd5e1',
                cursor: 'pointer',
                background: isDropdownCategorySelected
                  ? 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)'
                  : '#ffffff',
                color: isDropdownCategorySelected ? '#ffffff' : '#1e1b4b',
                boxShadow: isDropdownCategorySelected
                  ? '0 4px 12px rgba(124, 58, 237, 0.28)'
                  : '0 1px 3px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
              }}
              className={isDropdownCategorySelected ? '' : 'quick-tab-hover'}
              title="Filter by department"
            >
              <span>{dropdownButtonLabel}</span>
              <span
                style={{
                  fontSize: '0.72rem',
                  marginLeft: '0.15rem',
                  display: 'inline-block',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                ▾
              </span>
            </button>

            {/* Floating Dropdown Popover */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  zIndex: 60,
                  minWidth: '200px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1.5px solid #ede9fe',
                  boxShadow: '0 16px 36px rgba(15, 23, 42, 0.16)',
                  padding: '0.45rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  animation: 'popoverFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <div
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#94a3b8',
                    borderBottom: '1px solid #f1f5f9',
                    marginBottom: '0.25rem',
                  }}
                >
                  Select Department
                </div>

                {DROPDOWN_CATEGORIES.map((cat) => {
                  const isCurrent = activeTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(cat.id);
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: isCurrent ? '#faf5ff' : 'transparent',
                        color: isCurrent ? '#7c3aed' : '#334155',
                        fontWeight: isCurrent ? 800 : 500,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      className="dropdown-menu-row"
                    >
                      <span>{cat.label}</span>
                      {isCurrent && <span style={{ color: '#7c3aed', fontWeight: 900, fontSize: '0.86rem' }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 10 Cards in 2 Rows (5 columns × 2 rows on desktop) ── */}
      <div
        key={activeTab}
        className="category-featured-grid tab-fade-in"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        {displayProducts.map((prod, idx) => (
          <ProductCard key={prod._id || prod.id} product={prod} index={idx} />
        ))}
      </div>

      {/* Centered View All CTA */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Link
          to={activeTab === 'all' ? '/products' : `/products?category=${activeTab}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.7rem 1.8rem',
            borderRadius: '9999px',
            background: '#ffffff',
            color: '#7c3aed',
            fontWeight: 800,
            fontSize: '0.86rem',
            textDecoration: 'none',
            border: '1.5px solid #ede9fe',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.08)',
            transition: 'all 0.2s ease',
          }}
          className="featured-view-all-link"
        >
          <span>View All in {activeCategoryObj?.label || 'Top Products'}</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      <style>{`
        .quick-tab-hover:hover {
          background: #e2e8f0 !important;
          color: #0f172a !important;
        }
        .dropdown-menu-row:hover {
          background: #f1f5f9 !important;
          color: #7c3aed !important;
        }
        .tab-fade-in {
          animation: tabFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes tabFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes popoverFadeIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .featured-view-all-link:hover {
          background: #7c3aed !important;
          color: #ffffff !important;
          border-color: #7c3aed !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.28) !important;
        }
        @media (max-width: 1100px) {
          .category-featured-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            gap: 1rem !important;
          }
        }
        @media (max-width: 768px) {
          .featured-header-container {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          .featured-filter-bar {
            width: 100% !important;
            justify-content: flex-start !important;
            overflow-x: auto !important;
          }
          .category-featured-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem !important;
          }
        }
      `}</style>
    </section>
  );
}
