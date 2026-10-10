import React, { useEffect } from 'react';
import {
  X,
  RotateCcw,
  Check,
  SlidersHorizontal,
  Coins,
  Layers,
  Percent,
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

export default function ShopFilterDrawer({
  isOpen = false,
  onClose,
  categories = [],
  filterState = {},
  onUpdateFilter,
  onResetAll,
  matchingCount = 0,
}) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const budgetBuckets = [
    { label: 'All Prices', val: '' },
    { label: 'Under ₹299', val: '299' },
    { label: 'Under ₹499', val: '499' },
    { label: 'Under ₹999', val: '999' },
    { label: '₹1,000 - ₹2,500', val: '2500' },
    { label: '₹2,500+ Luxe', val: '5000' },
  ];


  const discountOptions = [
    { label: '50% or more', badge: 'Mega Deal', val: '50' },
    { label: '40% or more', badge: 'Special', val: '40' },
    { label: '20% or more', badge: 'Popular', val: '20' },
  ];

  return (
    <div
      className="shop-drawer-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.25s ease',
      }}
      onClick={onClose}
    >
      <div
        className="shop-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Drawer Header ── */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1.5px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: '#f3e8ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SlidersHorizontal size={17} strokeWidth={2.4} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 900, color: '#1e1b4b' }}>
                Filter & Refine
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                {matchingCount} products match your search
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── 2. Scrollable Filters Body ── */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
          }}
        >
          {/* Section: Price Budget */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <Coins size={16} color="#059669" strokeWidth={2.3} />
              <h4
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: '#1e1b4b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                Price & Budget Range
              </h4>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {budgetBuckets.map((bucket) => {
                const isSelected = filterState.maxPrice === bucket.val;
                return (
                  <button
                    key={bucket.label}
                    type="button"
                    onClick={() => onUpdateFilter('maxPrice', bucket.val)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #059669' : '1px solid #e2e8f0',
                      background: isSelected ? '#ecfdf5' : '#ffffff',
                      color: isSelected ? '#047857' : '#475569',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {bucket.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Categories */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <Layers size={16} color="#7c3aed" strokeWidth={2.3} />
              <h4
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: '#1e1b4b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                Departments
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '12px',
                  background: !filterState.category ? '#f3e8ff' : '#ffffff',
                  border: !filterState.category ? '1px solid #c4b5fd' : '1px solid #f1f5f9',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="drawer-cat"
                  checked={!filterState.category}
                  onChange={() => onUpdateFilter('category', '')}
                  style={{ accentColor: '#7c3aed' }}
                />
                <Store size={15} color="#7c3aed" />
                <span style={{ fontSize: '0.86rem', fontWeight: !filterState.category ? 800 : 600, color: !filterState.category ? '#7c3aed' : '#1e293b' }}>
                  All Departments
                </span>
              </label>

              {categories.map((cat) => {
                const isChecked = filterState.category === cat.slug;
                const CatIcon = CATEGORY_LUCIDE_ICONS[cat.slug] || Tag;

                return (
                  <label
                    key={cat._id || cat.slug}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '12px',
                      background: isChecked ? '#f3e8ff' : '#ffffff',
                      border: isChecked ? '1px solid #c4b5fd' : '1px solid #f1f5f9',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <input
                      type="radio"
                      name="drawer-cat"
                      checked={isChecked}
                      onChange={() => onUpdateFilter('category', cat.slug)}
                      style={{ accentColor: '#7c3aed' }}
                    />
                    <CatIcon size={15} color={isChecked ? '#7c3aed' : '#64748b'} />
                    <span style={{ fontSize: '0.86rem', fontWeight: isChecked ? 800 : 600, color: isChecked ? '#6b21a8' : '#334155' }}>
                      {cat.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>


          {/* Section: Minimum Discount */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
              <Percent size={16} color="#7c3aed" strokeWidth={2.3} />
              <h4
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: '#1e1b4b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0,
                }}
              >
                Discount Offers
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {discountOptions.map((opt) => {
                const isSelected = filterState.minDiscount === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() =>
                      onUpdateFilter('minDiscount', isSelected ? '' : opt.val)
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '10px',
                      border: isSelected ? '1.5px solid #c4b5fd' : '1px solid #e2e8f0',
                      background: isSelected ? '#f5edff' : '#ffffff',
                      color: isSelected ? '#6d28d9' : '#475569',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{opt.label}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, background: isSelected ? '#ede9fe' : '#f1f5f9', color: isSelected ? '#7c3aed' : '#64748b', padding: '0.12rem 0.45rem', borderRadius: '9999px' }}>
                      {opt.badge}
                    </span>
                    {isSelected && <Check size={14} color="#7c3aed" strokeWidth={2.8} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── 3. Sticky Bottom Action Bar ── */}
        <div
          style={{
            padding: '1.15rem 1.5rem',
            borderTop: '1.5px solid #f1f5f9',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <button
            type="button"
            onClick={onResetAll}
            style={{
              padding: '0.75rem 1.15rem',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              fontWeight: 800,
              fontSize: '0.86rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            <RotateCcw size={14} /> Reset
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              flexGrow: 1,
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              border: 'none',
              background: '#7c3aed',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
              textAlign: 'center',
            }}
          >
            View {matchingCount} Items
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
