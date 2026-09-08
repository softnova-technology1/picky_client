import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Star,
  Check,
  Zap,
  Layers,
  Coins,
  Percent,
  Truck,
  Sparkles,
  Gem,
  Smartphone,
  UtensilsCrossed,
  Flower,
  Flame,
  Cookie,
  Home,
  Baby,
  Dumbbell,
  Shirt,
  Store,
  Tag,
} from 'lucide-react';

// Pure Lucide icon mapping for all 10 departments + All Departments
const CATEGORY_LUCIDE_ICONS = {
  'all': Store,
  'womens-fashion': Shirt,
  'home-kitchen': UtensilsCrossed,
  'artificial-jewellery': Gem,
  'beauty-personal-care': Flower,
  'mobile-accessories': Smartphone,
  'traditional-tamil-products': Flame,
  'snacks-foods': Cookie,
  'home-decor': Home,
  'kids-products': Baby,
  'fitness-products': Dumbbell,
};

export default function ShopSidebarFilter({
  categories = [],
  selectedCategory = '',
  selectedSubCategory = '',
  onSelectCategory,
  onSelectSubCategory,
  urlMaxPrice = '',
  onSelectMaxPrice,
  quickFilters = {},
  onToggleQuickFilter,
  activeFilterCount = 0,
  onResetAll,
}) {
  const budgetOptions = [
    { label: 'All Prices', val: '', min: 0 },
    { label: 'Under ₹299', subtext: 'Pocket Finds', val: '299' },
    { label: 'Under ₹499', subtext: 'Daily Bazaar', val: '499' },
    { label: 'Under ₹999', subtext: 'Festive Ethnic', val: '999' },
    { label: '₹1,000 - ₹2,500', subtext: 'Premium Picks', val: '2500' },
    { label: '₹2,500+ Luxe', subtext: 'Heritage Special', val: '5000' },
  ];

  const ratingOptions = [
    { label: '4.5 & above', subtext: 'Top Rated', val: '4.5', stars: 5 },
    { label: '4.0 & above', subtext: 'Very Good', val: '4.0', stars: 4 },
    { label: '3.5 & above', subtext: 'Good Value', val: '3.5', stars: 3 },
  ];

  const discountOptions = [
    { label: '50% or more', badge: 'Mega Deal', val: '50' },
    { label: '40% or more', badge: 'Special', val: '40' },
    { label: '20% or more', badge: 'Popular', val: '20' },
  ];

  const currentCategoryObj = categories.find(
    (c) =>
      c._id === selectedCategory ||
      c.slug === selectedCategory ||
      c.slug?.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <aside className="shop-sidebar-filter">
      <div className="shop-sidebar-card">
        {/* ── Header: Title & Clear All ── */}
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <div className="filter-header-icon-pod">
              <SlidersHorizontal size={15} strokeWidth={2.4} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#1e1b4b', letterSpacing: '-0.02em' }}>
                Filter Catalog
              </h3>
            </div>
            {activeFilterCount > 0 && (
              <span className="sidebar-active-badge">
                {activeFilterCount}
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={onResetAll}
              className="sidebar-reset-btn"
              title="Reset all filters"
            >
              <RotateCcw size={11} className="reset-spin-icon" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* ── 1. Departments & Categories (Permanently Static & Open) ── */}
        <div className="sidebar-section">
          <div className="sidebar-section-title-wrap">
            <div className="section-title-icon-pod">
              <Layers size={13} strokeWidth={2.3} />
            </div>
            <span className="sidebar-section-title">Departments</span>
          </div>

          <div className="sidebar-content-body">
            <button
              type="button"
              onClick={() => onSelectCategory('')}
              className={`sidebar-category-row ${!selectedCategory ? 'active' : ''}`}
            >
              <div className="row-icon-pod">
                <Store size={14} strokeWidth={2.2} />
              </div>
              <span style={{ flexGrow: 1, textAlign: 'left', fontWeight: !selectedCategory ? 800 : 600 }}>
                All Departments
              </span>
              {!selectedCategory && <Check size={13} strokeWidth={3} className="check-indicator" />}
            </button>

            {categories.map((cat) => {
              const isChecked =
                selectedCategory === cat.slug ||
                selectedCategory === cat._id ||
                selectedCategory.toLowerCase() === cat.slug?.toLowerCase();

              const CatIcon = CATEGORY_LUCIDE_ICONS[cat.slug] || Sparkles;

              return (
                <div key={cat._id || cat.slug}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.slug || cat._id)}
                    className={`sidebar-category-row ${isChecked ? 'active' : ''}`}
                  >
                    <div className="row-icon-pod">
                      <CatIcon size={14} strokeWidth={2.2} />
                    </div>
                    <span style={{ flexGrow: 1, textAlign: 'left', fontWeight: isChecked ? 800 : 600 }}>
                      {cat.name}
                    </span>
                    {isChecked && <Check size={13} strokeWidth={3} className="check-indicator" />}
                  </button>

                  {/* Subcategories (If Category Selected) */}
                  {isChecked &&
                    currentCategoryObj &&
                    Array.isArray(currentCategoryObj.subcategories) &&
                    currentCategoryObj.subcategories.length > 0 && (
                      <div className="sidebar-subcategories-wrap">
                        <button
                          type="button"
                          onClick={() => onSelectSubCategory('')}
                          className={`sidebar-sub-item ${!selectedSubCategory ? 'active' : ''}`}
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
                              type="button"
                              onClick={() => onSelectSubCategory(sub.slug || sub._id)}
                              className={`sidebar-sub-item ${isSubActive ? 'active' : ''}`}
                            >
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 2. Budget & Price Range (Permanently Static & Open) ── */}
        <div className="sidebar-section">
          <div className="sidebar-section-title-wrap">
            <div className="section-title-icon-pod">
              <Coins size={13} strokeWidth={2.3} />
            </div>
            <span className="sidebar-section-title">Price & Budget</span>
          </div>

          <div className="sidebar-content-body">
            {budgetOptions.map((opt) => {
              const isSelected = urlMaxPrice === opt.val;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onSelectMaxPrice(opt.val)}
                  className={`sidebar-budget-row ${isSelected ? 'active' : ''}`}
                >
                  <div className="budget-bullet">
                    {isSelected && <span className="budget-bullet-dot" />}
                  </div>
                  <div style={{ flexGrow: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#065f46' : '#1e293b' }}>
                      {opt.label}
                    </div>
                    {opt.subtext && (
                      <div style={{ fontSize: '0.7rem', color: isSelected ? '#047857' : '#64748b' }}>
                        {opt.subtext}
                      </div>
                    )}
                  </div>
                  {isSelected && <Check size={13} color="#059669" strokeWidth={2.8} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 3. Customer Ratings (Permanently Static & Open) ── */}
        <div className="sidebar-section">
          <div className="sidebar-section-title-wrap">
            <div className="section-title-icon-pod">
              <Star size={13} strokeWidth={2.3} />
            </div>
            <span className="sidebar-section-title">Customer Reviews</span>
          </div>

          <div className="sidebar-content-body">
            {ratingOptions.map((opt) => {
              const isSelected = quickFilters.rating4Plus && opt.val === '4.5';
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => onToggleQuickFilter('rating4Plus')}
                  className={`sidebar-rating-row ${isSelected ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {[...Array(opt.stars)].map((_, i) => (
                      <Star key={i} size={12} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? 800 : 600, color: '#334155', marginLeft: '0.25rem', flexGrow: 1, textAlign: 'left' }}>
                    {opt.label}
                  </span>
                  {isSelected && <Check size={13} color="#d97706" strokeWidth={2.8} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 4. Discounts & Deals (Permanently Static & Open) ── */}
        <div className="sidebar-section">
          <div className="sidebar-section-title-wrap">
            <div className="section-title-icon-pod">
              <Percent size={13} strokeWidth={2.3} />
            </div>
            <span className="sidebar-section-title">Deals & Discounts</span>
          </div>

          <div className="sidebar-content-body">
            {discountOptions.map((opt) => {
              const isSelected = quickFilters.discount40 && opt.val === '40';
              return (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => onToggleQuickFilter('discount40')}
                  className={`sidebar-discount-row ${isSelected ? 'active' : ''}`}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#be185d' : '#334155' }}>
                    {opt.label}
                  </span>
                  <span className="discount-pill-badge">
                    {opt.badge}
                  </span>
                  {isSelected && <Check size={13} color="#db2777" strokeWidth={2.8} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 5. Express Delivery ── */}
        <div className="sidebar-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div className="sidebar-switch-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="switch-icon-pod">
                <Truck size={15} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e1b4b' }}>
                  24h Dispatch
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  Ready to ship today
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleQuickFilter('fastDispatch')}
              className={`tactile-switch ${quickFilters.fastDispatch ? 'on' : 'off'}`}
              aria-label="Toggle 24h express dispatch"
            >
              <span className="switch-knob" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .shop-sidebar-filter {
          width: 270px;
          flex-shrink: 0;
          align-self: stretch;
          position: relative;
        }
        .shop-sidebar-card {
          position: sticky !important;
          top: 90px !important;
          background: #ffffff;
          border-radius: 24px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 30px -6px rgba(15, 23, 42, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02);
          padding: 1.35rem 1.25rem;
          max-height: calc(100vh - 110px);
          overflow-y: auto;
          z-index: 15;
        }
        .shop-sidebar-card::-webkit-scrollbar {
          width: 4px;
        }
        .shop-sidebar-card::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.85rem;
          border-bottom: 1.5px solid #f1f5f9;
          margin-bottom: 0.95rem;
        }
        .filter-header-icon-pod {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid rgba(192, 132, 252, 0.45);
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.08);
          flex-shrink: 0;
        }
        .section-title-icon-pod {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid rgba(192, 132, 252, 0.45);
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 1px 4px rgba(124, 58, 237, 0.06);
        }
        .sidebar-active-badge {
          width: 19px;
          height: 19px;
          border-radius: 50%;
          background: #7c3aed;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.35);
        }
        .sidebar-reset-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.25rem 0.6rem;
          border-radius: 7px;
          color: #64748b;
          font-size: 0.74rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sidebar-reset-btn:hover {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fecaca;
        }
        .sidebar-reset-btn:hover .reset-spin-icon {
          transform: rotate(-180deg);
        }
        .reset-spin-icon {
          transition: transform 0.3s ease;
        }
        .sidebar-section {
          padding-bottom: 0.95rem;
          margin-bottom: 0.95rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .sidebar-section-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 0.65rem;
        }
        .sidebar-section-title {
          font-size: 0.78rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .sidebar-content-body {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        /* Category Rows */
        .sidebar-category-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.42rem 0.65rem;
          border-radius: 50px;
          border: 1.5px solid transparent;
          background: transparent;
          color: #334155;
          font-size: 0.84rem;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-category-row:hover {
          background: #fbf9fe;
          border-color: rgba(221, 214, 254, 0.6);
        }
        .sidebar-category-row.active {
          background: #f5edff;
          border-color: #c4b5fd;
          color: #6d28d9;
        }
        .row-icon-pod {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid rgba(192, 132, 252, 0.45);
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.08);
          transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-category-row:hover .row-icon-pod {
          transform: scale(1.08);
          border-color: #7c3aed;
          box-shadow: 0 3px 10px rgba(124, 58, 237, 0.18);
        }
        .sidebar-category-row.active .row-icon-pod {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-color: #7c3aed;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
        }
        .switch-icon-pod {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          border: 1.5px solid rgba(192, 132, 252, 0.45);
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.08);
          flex-shrink: 0;
        }
        .check-indicator {
          color: #7c3aed;
        }
        .sidebar-subcategories-wrap {
          margin: 0.3rem 0 0.45rem 1.3rem;
          padding-left: 0.6rem;
          border-left: 2px solid #e9d5ff;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .sidebar-sub-item {
          text-align: left;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 500;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sidebar-sub-item:hover {
          color: #7c3aed;
          background: #faf5ff;
        }
        .sidebar-sub-item.active {
          color: #7c3aed;
          font-weight: 800;
          background: #f3e8ff;
        }
        /* Budget Rows */
        .sidebar-budget-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.4rem 0.6rem;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sidebar-budget-row:hover {
          background: #f8fafc;
        }
        .sidebar-budget-row.active {
          background: #ecfdf5;
          border-color: #a7f3d0;
        }
        .budget-bullet {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1.5px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sidebar-budget-row.active .budget-bullet {
          border-color: #059669;
        }
        .budget-bullet-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #059669;
        }
        /* Rating & Discount Rows */
        .sidebar-rating-row, .sidebar-discount-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.4rem 0.6rem;
          border-radius: 10px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sidebar-rating-row:hover, .sidebar-discount-row:hover {
          background: #f8fafc;
        }
        .sidebar-rating-row.active {
          background: #fffbeb;
          border-color: #fde68a;
        }
        .sidebar-discount-row.active {
          background: #fdf2f8;
          border-color: #fbcfe8;
        }
        .discount-pill-badge {
          font-size: 0.66rem;
          font-weight: 800;
          text-transform: uppercase;
          background: #f1f5f9;
          color: #64748b;
          padding: 0.12rem 0.4rem;
          border-radius: 9999px;
        }
        .sidebar-discount-row.active .discount-pill-badge {
          background: #fbcfe8;
          color: #be185d;
        }
        /* Switch Card */
        .sidebar-switch-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #faf5ff;
          border: 1px solid #e9d5ff;
          padding: 0.55rem 0.75rem;
          border-radius: 14px;
        }
        .switch-icon-pod {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #ffffff;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.12);
        }
        .tactile-switch {
          width: 38px;
          height: 20px;
          border-radius: 9999px;
          border: none;
          background: #cbd5e1;
          position: relative;
          cursor: pointer;
          transition: background 0.25s ease;
          padding: 0;
        }
        .tactile-switch.on {
          background: #7c3aed;
        }
        .switch-knob {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ffffff;
          position: absolute;
          top: 3px;
          left: 3px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        }
        .tactile-switch.on .switch-knob {
          transform: translateX(18px);
        }
        @media (max-width: 990px) {
          .shop-sidebar-filter {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
}
