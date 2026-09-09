import React from 'react';

export default function ShopCategoryBar({
  categories = [],
  selectedCategory = '',
  selectedSubCategory = '',
  selectedBudget = '',
  onSelectCategory,
  onSelectSubCategory,
  onSelectBudget,
  totalAllCount = 0,
}) {
  const currentCategoryObj = categories.find(
    (c) =>
      c._id === selectedCategory ||
      c.slug === selectedCategory ||
      c.slug?.toLowerCase() === selectedCategory.toLowerCase()
  );

  return (
    <div className="shop-category-bar" style={{ marginBottom: '1.5rem' }}>
      {/* ── 1. Main Department Pills (Horizontal Scroll) ── */}
      <div
        className="shop-category-scroll"
        style={{
          display: 'flex',
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.65rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* All Departments Pill */}
        <button
          onClick={() => {
            onSelectCategory('');
            onSelectBudget('');
          }}
          type="button"
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '9999px',
            border:
              !selectedCategory && !selectedBudget
                ? '1.5px solid #7c3aed'
                : '1.5px solid #e2e8f0',
            background:
              !selectedCategory && !selectedBudget ? '#7c3aed' : '#ffffff',
            color:
              !selectedCategory && !selectedBudget ? '#ffffff' : '#334155',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow:
              !selectedCategory && !selectedBudget
                ? '0 4px 14px rgba(124, 58, 237, 0.25)'
                : '0 2px 6px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0,
          }}
        >
          <span>✨ All Catalog</span>
          {totalAllCount > 0 && (
            <span
              style={{
                fontSize: '0.72rem',
                padding: '0.12rem 0.45rem',
                borderRadius: '9999px',
                background:
                  !selectedCategory && !selectedBudget
                    ? 'rgba(255, 255, 255, 0.25)'
                    : '#f1f5f9',
                color:
                  !selectedCategory && !selectedBudget ? '#ffffff' : '#64748b',
                fontWeight: 700,
              }}
            >
              {totalAllCount}
            </span>
          )}
        </button>

        {/* Special Budget Quick Pills */}
        <button
          onClick={() => onSelectBudget('299')}
          type="button"
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '9999px',
            border:
              selectedBudget === '299'
                ? '1.5px solid #059669'
                : '1.5px solid #a7f3d0',
            background: selectedBudget === '299' ? '#059669' : '#ecfdf5',
            color: selectedBudget === '299' ? '#ffffff' : '#047857',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow:
              selectedBudget === '299'
                ? '0 4px 14px rgba(5, 150, 105, 0.25)'
                : '0 2px 6px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0,
          }}
        >
          <span>⚡ Under ₹299</span>
        </button>

        <button
          onClick={() => onSelectBudget('499')}
          type="button"
          style={{
            padding: '0.55rem 1.15rem',
            borderRadius: '9999px',
            border:
              selectedBudget === '499'
                ? '1.5px solid #db2777'
                : '1.5px solid #fbcfe8',
            background: selectedBudget === '499' ? '#db2777' : '#fdf2f8',
            color: selectedBudget === '499' ? '#ffffff' : '#be185d',
            fontWeight: 800,
            fontSize: '0.86rem',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow:
              selectedBudget === '499'
                ? '0 4px 14px rgba(219, 39, 119, 0.25)'
                : '0 2px 6px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            flexShrink: 0,
          }}
        >
          <span>🔥 Under ₹499 Bazaar</span>
        </button>

        {/* Categories List */}
        {categories.map((cat) => {
          const isCatActive =
            !selectedBudget &&
            (selectedCategory === cat.slug ||
              selectedCategory === cat._id ||
              selectedCategory.toLowerCase() === cat.slug?.toLowerCase());

          return (
            <button
              key={cat._id || cat.slug}
              onClick={() => {
                onSelectBudget('');
                onSelectCategory(cat.slug || cat._id);
              }}
              type="button"
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '9999px',
                border: isCatActive ? '1.5px solid #7c3aed' : '1.5px solid #e2e8f0',
                background: isCatActive ? '#7c3aed' : '#ffffff',
                color: isCatActive ? '#ffffff' : '#334155',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: isCatActive
                  ? '0 4px 14px rgba(124, 58, 237, 0.25)'
                  : '0 2px 6px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                flexShrink: 0,
              }}
            >
              <span>{cat.icon || '🛍️'}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── 2. Secondary Subcategory Bar (If Department Selected) ── */}
      {currentCategoryObj &&
        Array.isArray(currentCategoryObj.subcategories) &&
        currentCategoryObj.subcategories.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              padding: '0.65rem 0.85rem',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              marginTop: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#64748b',
                whiteSpace: 'nowrap',
                marginRight: '0.25rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Filter Subcategory:
            </span>

            <button
              type="button"
              onClick={() => onSelectSubCategory('')}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '8px',
                border: !selectedSubCategory ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                background: !selectedSubCategory ? '#f3e8ff' : '#ffffff',
                color: !selectedSubCategory ? '#7c3aed' : '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
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
                  type="button"
                  onClick={() => onSelectSubCategory(sub.slug || sub._id)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    border: isSubActive ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                    background: isSubActive ? '#7c3aed' : '#ffffff',
                    color: isSubActive ? '#ffffff' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {sub.name}
                </button>
              );
            })}
          </div>
        )}

      <style>{`
        .shop-category-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
