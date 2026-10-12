import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ShopSubcategoryCards.module.css';

// Fallback high-resolution catalog images for common subcategory keywords
const SUBCAT_KEYWORD_IMAGES = {
  mens: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300',
  womens: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
  kids: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300',
  ethnic: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300',
  accessories: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300',
  sarees: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300',
  kurtis: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300',
  earrings: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300',
  cookware: 'https://images.unsplash.com/photo-1584990347449-39906666798e?w=300',
};

function formatSubName(name = '') {
  if (!name) return '';
  // Capitalize words cleanly (e.g. "mens" -> "Mens", "ethnic wear" -> "Ethnic Wear")
  return name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function ShopSubcategoryCards({
  currentCategoryObj,
  selectedSubCategory = '',
  onSelectSubCategory,
  allProducts = [],
}) {
  const trackRef = useRef(null);

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

  // Resolve image for a subcategory item
  const getSubImage = (sub) => {
    if (sub.image && typeof sub.image === 'string' && sub.image.trim() !== '') {
      return sub.image;
    }
    const cleanKey = (sub.slug || sub.name || '').toLowerCase().replace(/[^a-z]/g, '');
    for (const [k, url] of Object.entries(SUBCAT_KEYWORD_IMAGES)) {
      if (cleanKey.includes(k)) return url;
    }
    return currentCategoryObj.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300';
  };

  // Count items for each subcategory dynamically
  const getSubItemCount = (sub) => {
    if (!Array.isArray(allProducts) || allProducts.length === 0) {
      return sub.itemCount || 0;
    }
    const targetSlug = String(sub.slug || '').toLowerCase();
    const targetId = String(sub._id || '').toLowerCase();
    const targetName = String(sub.name || '').toLowerCase();

    const count = allProducts.filter((p) => {
      if (!p.subCategory) return false;
      if (typeof p.subCategory === 'object') {
        const pSlug = String(p.subCategory.slug || '').toLowerCase();
        const pId = String(p.subCategory._id || '').toLowerCase();
        const pName = String(p.subCategory.name || '').toLowerCase();
        return pSlug === targetSlug || pId === targetId || pName === targetName;
      }
      const pStr = String(p.subCategory).toLowerCase();
      return pStr === targetSlug || pStr === targetId || pStr === targetName;
    }).length;

    return count > 0 ? count : sub.itemCount || 0;
  };

  const isAllActive = !selectedSubCategory;

  return (
    <div className={styles['container-card']}>
      {/* ── Top Header Row ── */}
      <div className={styles['header-row']}>
        <div className={styles['header-left']}>
          <h3 className={styles['header-title']}>Explore Subcategories</h3>
          <span className={styles['header-badge']}>Click to filter</span>
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
              src={
                currentCategoryObj.image ||
                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300'
              }
              alt={`All ${currentCategoryObj.name}`}
              className={styles['img']}
              loading="lazy"
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

          return (
            <button
              key={sub._id || sub.slug || sub.name}
              type="button"
              className={`${styles['subcat-card']} ${isSubActive ? styles['active'] : ''}`}
              onClick={() => onSelectSubCategory(sub.slug || sub._id)}
            >
              <div className={styles['image-wrap']}>
                <img
                  src={getSubImage(sub)}
                  alt={sub.name}
                  className={styles['img']}
                  loading="lazy"
                />
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
