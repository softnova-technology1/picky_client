import React from 'react';
import { SlidersHorizontal, Check, RotateCcw, LayoutGrid, Grid3X3, Flame, Star, Tag, Zap } from 'lucide-react';

export default function ShopFilterBar({
  onOpenDrawer,
  activeFilterCount = 0,
  quickFilters = {},
  onToggleQuickFilter,
  sort = 'newest',
  onSortChange,
  gridCols = 4,
  onChangeGridCols,
  onResetAll,
}) {
  return (
    <div
      className="shop-filter-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '0.9rem 1.25rem',
        background: '#ffffff',
        borderRadius: '18px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        marginBottom: '1.75rem',
      }}
    >
      {/* ── Left Side: Drawer Trigger + Quick Toggle Chips ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Filter Drawer Trigger Button */}
        <button
          type="button"
          onClick={onOpenDrawer}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.48rem 1rem',
            borderRadius: '12px',
            background: activeFilterCount > 0 ? '#f3e8ff' : '#0f172a',
            color: activeFilterCount > 0 ? '#7c3aed' : '#ffffff',
            border: activeFilterCount > 0 ? '1.5px solid #c084fc' : 'none',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s ease',
          }}
        >
          <SlidersHorizontal size={15} strokeWidth={2.4} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#7c3aed',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.2rem',
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        <div style={{ width: 1, height: 26, background: '#e2e8f0', margin: '0 0.15rem' }} />

        {/* Quick Filter Chip: Under ₹499 */}
        <button
          type="button"
          onClick={() => onToggleQuickFilter('under499')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            border: quickFilters.under499 ? '1.5px solid #059669' : '1px solid #cbd5e1',
            background: quickFilters.under499 ? '#ecfdf5' : '#ffffff',
            color: quickFilters.under499 ? '#047857' : '#475569',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {quickFilters.under499 && <Check size={13} strokeWidth={2.8} />}
          <span>💰 Under ₹499</span>
        </button>

        {/* Quick Filter Chip: 4.5+ Rating */}
        <button
          type="button"
          onClick={() => onToggleQuickFilter('rating4Plus')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            border: quickFilters.rating4Plus ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
            background: quickFilters.rating4Plus ? '#fffbeb' : '#ffffff',
            color: quickFilters.rating4Plus ? '#b45309' : '#475569',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {quickFilters.rating4Plus ? (
            <Check size={13} strokeWidth={2.8} />
          ) : (
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
          )}
          <span>4.5★+ Top Rated</span>
        </button>

        {/* Quick Filter Chip: 40%+ Discount */}
        <button
          type="button"
          onClick={() => onToggleQuickFilter('discount40')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            border: quickFilters.discount40 ? '1.5px solid #db2777' : '1px solid #cbd5e1',
            background: quickFilters.discount40 ? '#fdf2f8' : '#ffffff',
            color: quickFilters.discount40 ? '#be185d' : '#475569',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {quickFilters.discount40 && <Check size={13} strokeWidth={2.8} />}
          <span>🏷️ 40%+ OFF</span>
        </button>

        {/* Quick Filter Chip: 24h Dispatch */}
        <button
          type="button"
          onClick={() => onToggleQuickFilter('fastDispatch')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            border: quickFilters.fastDispatch ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
            background: quickFilters.fastDispatch ? '#f3e8ff' : '#ffffff',
            color: quickFilters.fastDispatch ? '#6d28d9' : '#475569',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {quickFilters.fastDispatch && <Check size={13} strokeWidth={2.8} />}
          <Zap size={13} />
          <span>24h Dispatch</span>
        </button>

        {/* Reset All Filters Button */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetAll}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Reset all applied filters"
          >
            <RotateCcw size={12} />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* ── Right Side: Sort Selector + Grid Layout Switcher ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          marginLeft: 'auto',
        }}
      >
        {/* Sort Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
            Sort:
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#1e293b',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              outline: 'none',
            }}
            aria-label="Sort product catalog"
          >
            <option value="newest">✨ Newest Arrivals</option>
            <option value="featured">🔥 Best Sellers & Featured</option>
            <option value="rating">⭐ Customer Ratings (Highest)</option>
            <option value="price_asc">💵 Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
          </select>
        </div>

        {/* Grid View Switcher (Desktop only) */}
        <div
          className="shop-grid-switcher"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '0.2rem',
            borderRadius: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => onChangeGridCols(4)}
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: gridCols === 4 ? '#ffffff' : 'transparent',
              color: gridCols === 4 ? '#7c3aed' : '#64748b',
              boxShadow: gridCols === 4 ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="4-Column Grid View"
          >
            <Grid3X3 size={16} />
          </button>

          <button
            type="button"
            onClick={() => onChangeGridCols(3)}
            style={{
              padding: '0.35rem 0.5rem',
              borderRadius: '8px',
              border: 'none',
              background: gridCols === 3 ? '#ffffff' : 'transparent',
              color: gridCols === 3 ? '#7c3aed' : '#64748b',
              boxShadow: gridCols === 3 ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="3-Column Editorial Grid View"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .shop-grid-switcher {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
