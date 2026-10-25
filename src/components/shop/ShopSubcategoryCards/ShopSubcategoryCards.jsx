import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X, ArrowUpRight } from 'lucide-react';
import styles from './ShopSubcategoryCards.module.css';
import { fuzzyFilter } from '../../../utils/fuzzySearch';

const FALLBACK_CATEGORY_IMAGES = {
  'mobile-accessories': '/images/dept_electronics.jpg',
  'womens-fashion': '/images/dept_fashion.jpg',
  'fashion': '/images/dept_fashion.jpg',
  'beauty-personal-care': '/images/dept_beauty.jpg',
  'home-kitchen': '/images/dept_home.jpg',
  'artificial-jewellery': '/images/dept_jewellery.jpg',
  'snacks-foods': '/images/dept_snacks.jpg',
  'traditional-tamil-products': '/images/dept_jewellery.jpg',
  'home-decor': '/images/dept_home.jpg',
  'kids-products': '/images/dept_fashion.jpg',
  'fitness-products': '/images/dept_electronics.jpg',
};

function formatSubName(name = '') {
  if (!name) return '';
  return name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Resolve genuine image for a subcategory item from database
function getSubImage(sub) {
  if (sub && typeof sub.image === 'string' && sub.image.trim() !== '') {
    return sub.image.trim();
  }
  return null;
}

export default function ShopSubcategoryCards({
  currentCategoryObj,
  selectedSubCategory = '',
  onSelectSubCategory,
  allProducts = [],
  searchQuery = '',
  onSearchSubmit,
  onSearchClear,
}) {
  const trackRef = useRef(null);
  const searchWrapRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [isFocused, setIsFocused] = useState(false);

  // Keep in sync with URL search query
  useEffect(() => {
    setSearchTerm(searchQuery || '');
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Compute fuzzy autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.trim().length < 1) return [];
    return fuzzyFilter(allProducts, searchTerm.trim(), {
      keys: ['name', 'tags', 'subCategory', 'sku'],
      threshold: 0.38,
      limit: 5,
    });
  }, [allProducts, searchTerm]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsFocused(true);
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    setIsFocused(false);
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm.trim());
    }
  };

  const handleSelectSuggestion = (productName) => {
    setSearchTerm(productName);
    setIsFocused(false);
    if (onSearchSubmit) {
      onSearchSubmit(productName);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsFocused(false);
    if (onSearchClear) {
      onSearchClear();
    }
  };

  if (
    !currentCategoryObj ||
    !Array.isArray(currentCategoryObj.subcategories) ||
    currentCategoryObj.subcategories.length === 0
  ) {
    return null;
  }

  const subcategories = currentCategoryObj.subcategories;

  // Horizontal scroll buttons handler
  const handleScroll = (direction) => {
    if (trackRef.current) {
      const scrollOffset = direction === 'left' ? -240 : 240;
      trackRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  };

  const isAllActive = !selectedSubCategory;
  const categoryDefaultImage =
    FALLBACK_CATEGORY_IMAGES[currentCategoryObj.slug] || '/images/dept_fashion.jpg';
  const categoryImage = currentCategoryObj.image || categoryDefaultImage;

  return (
    <div className={styles['container-card']}>
      {/* ── Top Header Row ── */}
      <div className={styles['header-row']}>
        <div className={styles['header-left']}>
          <h3 className={styles['header-title']}>Explore Subcategories</h3>
          <span className={styles['header-badge']}>Click to filter</span>
        </div>

        {/* ── Search Bar & Autocomplete in Subcategory Header ── */}
        <div className={styles['header-search-wrap']} ref={searchWrapRef}>
          <form
            className={styles['header-search-form']}
            onSubmit={handleFormSubmit}
            role="search"
          >
            <div className={styles['header-search-box']}>
              <Search size={14} className={styles['header-search-icon']} />
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFormSubmit(e);
                  }
                }}
                placeholder={`Search ${currentCategoryObj?.name ? `in ${currentCategoryObj.name}` : 'products'}...`}
                className={styles['header-search-input']}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={styles['header-search-clear']}
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="submit"
                className={styles['header-search-btn']}
                aria-label="Submit search"
                title="Search"
              >
                Search
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isFocused && searchTerm.trim().length >= 1 && suggestions.length > 0 && (
            <div className={styles['suggestions-dropdown']}>
              <div className={styles['suggestions-header']}>
                <span>Suggested Products</span>
                <span className={styles['suggestions-count']}>{suggestions.length} found</span>
              </div>
              {suggestions.map((p) => {
                const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || '/images/dept_fashion.jpg');
                const price = p.discountPrice || p.price || 0;
                return (
                  <div
                    key={p._id || p.id || p.slug}
                    className={styles['suggestion-item']}
                    onClick={() => handleSelectSuggestion(p.name)}
                  >
                    <img src={img} alt={p.name} className={styles['suggestion-img']} />
                    <div className={styles['suggestion-info']}>
                      <span className={styles['suggestion-name']}>{p.name}</span>
                      <span className={styles['suggestion-price']}>₹{Number(price).toLocaleString('en-IN')}</span>
                    </div>
                    <ArrowUpRight size={13} className={styles['suggestion-arrow']} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles['nav-arrows']}>
          <button
            type="button"
            className={styles['nav-btn']}
            onClick={() => handleScroll('left')}
            aria-label="Scroll subcategories left"
          >
            <ChevronLeft size={15} strokeWidth={2.4} />
          </button>
          <button
            type="button"
            className={styles['nav-btn']}
            onClick={() => handleScroll('right')}
            aria-label="Scroll subcategories right"
          >
            <ChevronRight size={15} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* ── Cards Scroll Track ── */}
      <div className={styles['cards-track']} ref={trackRef}>
        {/* Card 1: All [Category] Card */}
        <button
          type="button"
          className={`${styles['subcat-card']} ${isAllActive ? styles['active'] : ''}`}
          onClick={() => onSelectSubCategory('')}
        >
          <div className={styles['image-wrap']}>
            <img
              src={categoryImage}
              alt={`All ${currentCategoryObj.name}`}
              className={styles['img']}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = categoryDefaultImage;
              }}
            />
          </div>
          <span className={styles['title']} title={`All ${currentCategoryObj.name}`}>
            All {currentCategoryObj.name}
          </span>
        </button>

        {/* Subsequent Cards: Each Subcategory */}
        {subcategories.map((sub) => {
          const isSubActive =
            selectedSubCategory &&
            (String(selectedSubCategory).toLowerCase() === String(sub.slug || '').toLowerCase() ||
              String(selectedSubCategory) === String(sub._id || '') ||
              String(selectedSubCategory).toLowerCase() === String(sub.name || '').toLowerCase());

          const subImg = getSubImage(sub);

          return (
            <button
              key={sub._id || sub.slug || sub.name}
              type="button"
              className={`${styles['subcat-card']} ${isSubActive ? styles['active'] : ''}`}
              onClick={() => onSelectSubCategory(sub.slug || sub._id)}
            >
              <div className={styles['image-wrap']}>
                {subImg ? (
                  <img
                    src={subImg}
                    alt={sub.name}
                    className={styles['img']}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextSibling) {
                        e.currentTarget.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className={styles['avatar-fallback']}
                  style={{ display: subImg ? 'none' : 'flex' }}
                >
                  <span className={styles['avatar-initial']}>
                    {(sub.name || 'S').trim().charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <span className={styles['title']} title={sub.name}>
                {formatSubName(sub.name)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
