import React, { useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown,
  Layers,
  Coins,
  Percent,
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
  'fashion': Shirt,
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
  urlMinDiscount = '',
  onSelectDiscount,
  quickFilters = {},
  onToggleQuickFilter,
  activeFilterCount = 0,
  onResetAll,
}) {
  const [openSections, setOpenSections] = useState({
    departments: true,
    price: true,
    discounts: true,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const activeDiscountVal = urlMinDiscount || (quickFilters.discount40 ? '40' : '');

  const handleDiscountClick = (val) => {
    if (onSelectDiscount) {
      onSelectDiscount(activeDiscountVal === val ? '' : val);
    } else if (onToggleQuickFilter) {
      onToggleQuickFilter('discount40');
    }
  };

  const budgetOptions = [
    { label: 'All Prices', val: '', min: 0 },
    { label: 'Under ₹299', subtext: 'Pocket Finds', val: '299' },
    { label: 'Under ₹499', subtext: 'Daily Bazaar', val: '499' },
    { label: 'Under ₹999', subtext: 'Festive Ethnic', val: '999' },
    { label: '₹1,000 - ₹2,500', subtext: 'Premium Picks', val: '2500' },
    { label: '₹2,500+ Luxe', subtext: 'Heritage Special', val: '5000' },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <div className="filter-header-icon-pod">
              <SlidersHorizontal size={14} strokeWidth={2.4} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 900, color: '#1e1b4b', letterSpacing: '-0.02em' }}>
                Filter Catalog
              </h3>
            </div>
            {activeFilterCount > 0 && (
              <span className="sidebar-active-badge">
                {activeFilterCount}
              </span>
            )}
          </div>
        </div>

        {/* ── 1. Departments List (Collapsible Dropdown) ── */}
        <div className="sidebar-section">
          <button
            type="button"
            onClick={() => toggleSection('departments')}
            className="sidebar-section-header-btn"
            aria-expanded={openSections.departments}
            title={openSections.departments ? 'Click to close departments' : 'Click to open departments'}
          >
            <div className="sidebar-section-header-left">
              <div className="section-title-icon-pod">
                <Layers size={12} strokeWidth={2.3} />
              </div>
              <span className="sidebar-section-title">Departments</span>
              {!openSections.departments && selectedCategory && (
                <span className="section-active-indicator" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                  {currentCategoryObj?.name || 'Selected'}
                </span>
              )}
            </div>
            <div className={`chevron-toggle-pod ${openSections.departments ? 'open' : ''}`}>
              <ChevronDown size={13} strokeWidth={2.5} />
            </div>
          </button>

          {openSections.departments && (
            <div className="sidebar-content-body">
              <button
                type="button"
                onClick={() => onSelectCategory('')}
                className={`sidebar-category-row ${!selectedCategory ? 'active' : ''}`}
              >
                <div className="row-icon-pod">
                  <Store size={13} strokeWidth={2.2} />
                </div>
                <span style={{ flexGrow: 1, textAlign: 'left', fontWeight: !selectedCategory ? 800 : 600 }}>
                  All Departments
                </span>
                {!selectedCategory && <Check size={12} strokeWidth={3} className="check-indicator" />}
              </button>

              {categories.map((cat) => {
                const isChecked =
                  selectedCategory === cat.slug ||
                  selectedCategory === cat._id ||
                  selectedCategory.toLowerCase() === cat.slug?.toLowerCase();

                const CatIcon = CATEGORY_LUCIDE_ICONS[cat.slug] || Tag;

                return (
                  <div key={cat._id || cat.slug}>
                    <button
                      type="button"
                      onClick={() => onSelectCategory(cat.slug || cat._id)}
                      className={`sidebar-category-row ${isChecked ? 'active' : ''}`}
                    >
                      <div className="row-icon-pod">
                        <CatIcon size={13} strokeWidth={2.2} />
                      </div>
                      <span style={{ flexGrow: 1, textAlign: 'left', fontWeight: isChecked ? 800 : 600 }}>
                        {cat.name}
                      </span>
                      {isChecked && <Check size={12} strokeWidth={3} className="check-indicator" />}
                    </button>

                    {/* Subcategories if this category is selected */}
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
          )}
        </div>

        {/* ── 2. Budget & Price Range (Collapsible Dropdown) ── */}
        <div className="sidebar-section">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="sidebar-section-header-btn"
            aria-expanded={openSections.price}
            title={openSections.price ? 'Click to close price options' : 'Click to open price options'}
          >
            <div className="sidebar-section-header-left">
              <div className="section-title-icon-pod">
                <Coins size={12} strokeWidth={2.3} />
              </div>
              <span className="sidebar-section-title">Price & Budget</span>
              {!openSections.price && urlMaxPrice && (
                <span className="section-active-indicator" style={{ background: '#ecfdf5', color: '#059669' }}>
                  Under ₹{urlMaxPrice}
                </span>
              )}
            </div>
            <div className={`chevron-toggle-pod ${openSections.price ? 'open' : ''}`}>
              <ChevronDown size={13} strokeWidth={2.5} />
            </div>
          </button>

          {openSections.price && (
            <div className="sidebar-content-body">
              {budgetOptions.map((opt) => {
                const isSelected = urlMaxPrice === opt.val;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => onSelectMaxPrice(urlMaxPrice === opt.val ? '' : opt.val)}
                    className={`sidebar-budget-row ${isSelected ? 'active' : ''}`}
                  >
                    <div className="budget-bullet">
                      {isSelected && <span className="budget-bullet-dot" />}
                    </div>
                    <div style={{ flexGrow: 1, textAlign: 'left' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#065f46' : '#1e293b' }}>
                        {opt.label}
                      </div>
                      {opt.subtext && (
                        <div style={{ fontSize: '0.68rem', color: isSelected ? '#047857' : '#64748b' }}>
                          {opt.subtext}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. Discounts & Deals (Collapsible Dropdown) ── */}
        <div className="sidebar-section" style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0 }}>
          <button
            type="button"
            onClick={() => toggleSection('discounts')}
            className="sidebar-section-header-btn"
            aria-expanded={openSections.discounts}
            title={openSections.discounts ? 'Click to close deals options' : 'Click to open deals options'}
          >
            <div className="sidebar-section-header-left">
              <div className="section-title-icon-pod">
                <Percent size={12} strokeWidth={2.3} />
              </div>
              <span className="sidebar-section-title">Deals & Discounts</span>
              {!openSections.discounts && activeDiscountVal && (
                <span className="section-active-indicator" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                  {activeDiscountVal}%+ OFF
                </span>
              )}
            </div>
            <div className={`chevron-toggle-pod ${openSections.discounts ? 'open' : ''}`}>
              <ChevronDown size={13} strokeWidth={2.5} />
            </div>
          </button>

          {openSections.discounts && (
            <div className="sidebar-content-body">
              {discountOptions.map((opt) => {
                const isSelected = activeDiscountVal === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleDiscountClick(opt.val)}
                    className={`sidebar-discount-row ${isSelected ? 'active' : ''}`}
                  >
                    <div className="discount-bullet">
                      {isSelected && <span className="discount-bullet-dot" />}
                    </div>
                    <span
                      style={{
                        flexGrow: 1,
                        textAlign: 'left',
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? '#6d28d9' : '#1e293b',
                      }}
                    >
                      {opt.label}
                    </span>
                    <span className="discount-pill-badge">
                      {opt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 4. Unified Bottom Filter Reset Action ── */}
        {activeFilterCount > 0 && (
          <div className="sidebar-bottom-action">
            <button
              type="button"
              onClick={onResetAll}
              className="sidebar-bottom-clear-btn"
              title="Clear all active filters"
            >
              <RotateCcw size={13} className="reset-spin-icon" />
              <span>Clear All Filters ({activeFilterCount})</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .shop-sidebar-filter {
          width: 250px;
          flex-shrink: 0;
          align-self: stretch;
          position: relative;
        }
        .shop-sidebar-card {
          position: sticky !important;
          top: 90px !important;
          background: #ffffff;
          border-radius: 20px;
          border: 1.5px solid #e2e8f0;
          box-shadow: 0 8px 30px -6px rgba(15, 23, 42, 0.05), 0 2px 8px rgba(0, 0, 0, 0.02);
          padding: 1.1rem 0.95rem;
          max-height: calc(100vh - 110px);
          overflow-y: auto;
          scrollbar-width: none; /* Hide scrollbar Firefox */
          -ms-overflow-style: none; /* Hide scrollbar IE & Edge */
          z-index: 15;
        }
        /* Completely hide scrollbar in Chrome, Safari, Edge */
        .shop-sidebar-card::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
          background: transparent !important;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 0.65rem;
          border-bottom: 1.5px solid #f1f5f9;
          margin-bottom: 0.75rem;
        }
        .filter-header-icon-pod {
          width: 26px;
          height: 26px;
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
          width: 22px;
          height: 22px;
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
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7c3aed;
          color: #ffffff;
          font-size: 0.68rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(124, 58, 237, 0.35);
        }
        .sidebar-bottom-action {
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1.5px dashed #e2e8f0;
        }
        .sidebar-bottom-clear-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.58rem 0.85rem;
          border-radius: 12px;
          background: #f5f3ff;
          color: #7c3aed;
          border: 1.5px solid #ddd6fe;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-bottom-clear-btn:hover {
          background: #ede9fe;
          border-color: #c4b5fd;
          color: #6d28d9;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.15);
        }
        .sidebar-bottom-clear-btn:hover .reset-spin-icon {
          transform: rotate(-180deg);
        }
        .reset-spin-icon {
          transition: transform 0.3s ease;
        }
        .sidebar-section {
          padding-bottom: 0.75rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #f1f5f9;
        }
        /* Collapsible Dropdown Header Button */
        .sidebar-section-header-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          border: none;
          padding: 0.22rem 0.15rem;
          margin-bottom: 0.45rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s ease;
          user-select: none;
        }
        .sidebar-section-header-btn:hover {
          background: #f8fafc;
        }
        .sidebar-section-header-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .chevron-toggle-pod {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          background: #f1f5f9;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), background 0.18s ease, color 0.18s ease;
        }
        .sidebar-section-header-btn:hover .chevron-toggle-pod {
          background: #ede9fe;
          color: #7c3aed;
        }
        .chevron-toggle-pod.open {
          transform: rotate(180deg);
          background: #ede9fe;
          color: #7c3aed;
        }
        .section-active-indicator {
          font-size: 0.64rem;
          font-weight: 800;
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          white-space: nowrap;
          max-width: 95px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sidebar-section-title {
          font-size: 0.74rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        @keyframes fadeInDropdown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .sidebar-content-body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          animation: fadeInDropdown 0.2s ease-out;
        }
        /* Category Rows */
        .sidebar-category-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.3rem 0.55rem;
          border-radius: 50px;
          border: 1.5px solid transparent;
          background: transparent;
          color: #334155;
          font-size: 0.8rem;
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
          width: 25px;
          height: 25px;
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
          transform: scale(1.06);
          border-color: #7c3aed;
          box-shadow: 0 3px 10px rgba(124, 58, 237, 0.18);
        }
        .sidebar-category-row.active .row-icon-pod {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          border-color: #7c3aed;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
        }
        .check-indicator {
          color: #7c3aed;
        }
        .sidebar-subcategories-wrap {
          margin: 0.2rem 0 0.35rem 1.1rem;
          padding-left: 0.5rem;
          border-left: 2px solid #e9d5ff;
          display: flex;
          flex-direction: column;
          gap: 0.18rem;
        }
        .sidebar-sub-item {
          text-align: left;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.74rem;
          font-weight: 500;
          padding: 0.2rem 0.45rem;
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
          gap: 0.45rem;
          padding: 0.28rem 0.5rem;
          border-radius: 8px;
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
          width: 13px;
          height: 13px;
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
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #059669;
        }
        /* Discount Rows */
        .sidebar-discount-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.32rem 0.5rem;
          border-radius: 8px;
          border: 1.2px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .sidebar-discount-row:hover {
          background: #f8fafc;
        }
        .sidebar-discount-row.active {
          background: #f5edff;
          border-color: #c4b5fd;
        }
        .discount-bullet {
          width: 13px;
          height: 13px;
          border-radius: 50%;
          border: 1.5px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .sidebar-discount-row.active .discount-bullet {
          border-color: #7c3aed;
        }
        .discount-bullet-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #7c3aed;
        }
        .discount-pill-badge {
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          background: #f1f5f9;
          color: #64748b;
          padding: 0.1rem 0.4rem;
          border-radius: 9999px;
          flex-shrink: 0;
          transition: all 0.15s ease;
        }
        .sidebar-discount-row.active .discount-pill-badge {
          background: #ede9fe;
          color: #7c3aed;
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
