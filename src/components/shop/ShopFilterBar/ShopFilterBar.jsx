import React from 'react';
import { SlidersHorizontal, Check, RotateCcw, Flame, Tag } from 'lucide-react';

export default function ShopFilterBar({
  onOpenDrawer,
  activeFilterCount = 0,
  quickFilters = {},
  onToggleQuickFilter,
  sort = 'newest',
  onSortChange,
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
          <SlidersHorizontal size={15} />
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
              }}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Quick Filter Chip: 40%+ Off */}
        <button
          type="button"
          onClick={() => onToggleQuickFilter('discount40')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 0.85rem',
            borderRadius: '9999px',
            border: quickFilters.discount40 ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
            background: quickFilters.discount40 ? '#f3e8ff' : '#ffffff',
            color: quickFilters.discount40 ? '#6d28d9' : '#475569',
            fontSize: '0.8rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {quickFilters.discount40 && <Check size={13} strokeWidth={2.8} />}
          <span>🏷️ 40%+ OFF</span>
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
              padding: '0.42rem 0.75rem',
              borderRadius: '9999px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#ef4444',
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

      {/* ── Right Side: Sort Selector ── */}
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
            <option value="price_asc">💵 Price: Low to High</option>
            <option value="price_desc">💎 Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
}
