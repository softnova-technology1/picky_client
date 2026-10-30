import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProductCard from '../../product/ProductCard';
import { usePageCustomization } from '../../../store/customizationStore';
import styles from './ShopMobileView.module.css';

const FALLBACK_CATEGORY_IMAGES = {
  'fashion': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/fashion.webp',
  'home-kitchen': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/home-kitchen.webp',
  'artificial-jewellery': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/artificial-jewellery.webp',
  'beauty-personal-care': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/beauty-personal-care.webp',
  'mobile-accessories': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/mobile-accessories.webp',
  'traditional-tamil-products': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/traditional-tamil-products.webp',
  'snacks-foods': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/snacks-foods.webp',
  'home-decor': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/home-decor.webp',
  'kids-products': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/kids-products.webp',
  'fitness-products': 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/fitness-products.webp',
};

function formatSubName(name = '') {
  if (!name) return '';
  return name
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function ShopMobileView({
  products = [],
  allProducts = [],
  loading = false,
  totalCount,
  categories = [],
  subcategories = [],
  selectedCategory = '',
  selectedSubCategory = '',
  currentCategoryObj = null,
  onCategoryChange,
  onSubCategoryChange,
  onMaxPriceChange,
  onResetFilters,
}) {
  const navigate = useNavigate();

  // Admin Customization for Mobile Hero Banner
  const { getSetting } = usePageCustomization('shop');
  const bannerTag = getSetting('catalog_header_banner', 'tag', 'HANDPICKED EDIT • MADURAI HUB');
  const bannerHeadline = getSetting('catalog_header_banner', 'headline', 'Explore Curated Collections');
  const bannerSubtitle = getSetting('catalog_header_banner', 'subtitle', 'Discover handpicked, verified products directly dispatched from our Madurai hub.');
  const bannerBtnText = getSetting('catalog_header_banner', 'buttonText', 'Explore Collection');

  // Category State
  const [localCategory, setLocalCategory] = useState(selectedCategory || '');

  useEffect(() => {
    setLocalCategory(selectedCategory || '');
  }, [selectedCategory]);

  const effectiveCategory = selectedCategory || localCategory;

  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeBudget, setActiveBudget] = useState('all');
  const [isExpressOnly, setIsExpressOnly] = useState(true);

  // Derive subcategories for the active selected category
  const activeSubs = useMemo(() => {
    if (currentCategoryObj?.subcategories?.length > 0) {
      return currentCategoryObj.subcategories;
    }
    if (effectiveCategory) {
      const catTarget = String(effectiveCategory).toLowerCase();
      const foundCat = categories.find(
        (c) =>
          String(c.slug || '').toLowerCase() === catTarget ||
          String(c._id || '').toLowerCase() === catTarget ||
          String(c.name || '').toLowerCase() === catTarget
      );
      const targetId = foundCat?._id ? String(foundCat._id).toLowerCase() : '';
      const targetSlug = foundCat?.slug ? String(foundCat.slug).toLowerCase() : catTarget;

      return subcategories.filter((s) => {
        const sCatId = typeof s.categoryId === 'string'
          ? s.categoryId
          : (s.categoryId?._id || s.category?._id || s.category || '');
        const sCatSlug = s.categorySlug || s.categoryId?.slug || s.category?.slug || '';
        const sCatName = s.categoryId?.name || s.category?.name || '';
        return (
          (targetSlug && sCatSlug.toLowerCase() === targetSlug) ||
          (targetId && String(sCatId).toLowerCase() === targetId) ||
          sCatName.toLowerCase() === catTarget ||
          sCatSlug.toLowerCase() === catTarget
        );
      });
    }
    return [];
  }, [currentCategoryObj, effectiveCategory, categories, subcategories]);

  const activeCategoryName = useMemo(() => {
    if (currentCategoryObj?.name) return currentCategoryObj.name;
    const found = categories.find(
      (c) =>
        String(c.slug || '').toLowerCase() === String(effectiveCategory).toLowerCase() ||
        String(c._id) === String(effectiveCategory) ||
        String(c.name || '').toLowerCase() === String(effectiveCategory).toLowerCase()
    );
    return found?.name || 'Category';
  }, [currentCategoryObj, effectiveCategory, categories]);

  // Sort State
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState('Popular');

  // Wishlist State
  const [wishlist, setWishlist] = useState({});

  // Micro Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimeoutRef = useRef(null);

  // Trigger Toast
  const showToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2400);
  };

  // Toggle Wishlist
  const toggleWishlist = (id, title) => {
    setWishlist((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) {
        showToast(`Saved to Wishlist: ${title.slice(0, 24)}...`);
      } else {
        showToast('Removed from Wishlist');
      }
      return next;
    });
  };

  // Add to Bag
  const handleQuickAdd = (title) => {
    showToast(`Added to your Bag: ${title.slice(0, 22)}...`);
  };

  // Reset Filters
  const handleClearFilters = () => {
    setLocalCategory('');
    setActiveBudget('all');
    setIsExpressOnly(false);
    if (onResetFilters) onResetFilters();
    showToast('Filters reset to default');
  };

  // Sort DB Products
  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const list = [...products];
    if (activeSort === 'Price: Low') {
      list.sort((a, b) => {
        const pa = Number(a.discountPrice || a.price || 0);
        const pb = Number(b.discountPrice || b.price || 0);
        return pa - pb;
      });
    } else if (activeSort === 'Price: High') {
      list.sort((a, b) => {
        const pa = Number(a.discountPrice || a.price || 0);
        const pb = Number(b.discountPrice || b.price || 0);
        return pb - pa;
      });
    } else if (activeSort === 'Newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [products, activeSort]);

  // Mobile Pagination State (8 items per page = 4 clean rows of 2-column cards)
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Automatically reset to Page 1 when filters, search, or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [effectiveCategory, selectedSubCategory, activeBudget, activeSort, products.length]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  // Current slice of products for the active page
  const currentPaginatedProducts = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedProducts, safePage]);

  // Scroll smoothly up to top of grid on page change
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === safePage) return;
    setCurrentPage(newPage);
    const target = document.getElementById('picked-for-you');
    if (target) {
      const yOffset = -70;
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Smart page numbers array for pagination buttons
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safePage <= 3) {
      return [1, 2, 3, '...', totalPages];
    }
    if (safePage >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', safePage, '...', totalPages];
  };

  // Departments for Bottom Sheet
  const departmentOptions = [
    'All (542)',
    'Silk Sarees (128)',
    'Kurtas & Sets (210)',
    'Jewellery (84)',
    'Footwear (62)',
    'Home Essentials (58)',
  ];

  // Budget Options for Bottom Sheet
  const budgetOptions = [
    { id: 'under_499', title: 'Under ₹499', subtitle: 'Bazaar budget' },
    { id: '500_1499', title: '₹500 - ₹1,499', subtitle: 'Daily staples' },
    { id: '1500_3499', title: '₹1,500 - ₹3,499', subtitle: 'Festive edits' },
    { id: 'above_3500', title: '₹3,500+', subtitle: 'Heritage pure silk' },
  ];

  return (
    <div className={styles.shopMobileRoot}>
      {/* ─── 1. Editorial Hero Banner ───────────────────────────────────── */}
      <section className={styles.heroBannerSection}>
        <div className={styles.heroBannerCard}>
          <img
            src="/images/shop_editorial_hero_banner.jpg"
            alt="Picky Handpicked Curated Edit"
            className={styles.heroImg}
          />
          <div className={styles.heroOverlay}>
            <span className={styles.heroSubtitleTag}>{bannerTag}</span>
            <h1 className={styles.heroTitle}>{bannerHeadline}</h1>
            <p className={styles.heroDesc}>{bannerSubtitle}</p>
            <a
              href="#picked-for-you"
              className={styles.heroExploreBtn}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('picked-for-you');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>{bannerBtnText}</span>
              <span className={`material-symbols-outlined ${styles.materialIcon} ${styles.heroBtnIcon}`}>
                arrow_forward
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 3. Photographic Category / Subcategory Strip ──────────────── */}
      <section className={styles.categoryStripSection}>
        <div className={styles.categoryStripHeader}>
          <h2 className={styles.categoryStripTitle}>
            {effectiveCategory && activeSubs.length > 0
              ? `${activeCategoryName} Subcategories`
              : 'Explore Curated Worlds'}
          </h2>
          <span
            className={styles.viewAllLink}
            onClick={() => {
              if (selectedSubCategory && onSubCategoryChange) {
                onSubCategoryChange('');
              } else if (effectiveCategory) {
                setLocalCategory('');
                if (onCategoryChange) onCategoryChange('');
              } else {
                navigate('/categories');
              }
            }}
            role="button"
            tabIndex={0}
          >
            {selectedSubCategory ? 'ALL SUBS' : effectiveCategory ? 'ALL CATS' : 'VIEW ALL'}
          </span>
        </div>
        <div className={styles.categoryRibbon}>
          {effectiveCategory && activeSubs.length > 0 ? (
            <>
              {/* Special "All [Category]" Pill */}
              <div
                className={styles.ribbonItem}
                onClick={() => {
                  if (onSubCategoryChange) onSubCategoryChange('');
                  showToast(`All ${activeCategoryName} products`);
                }}
              >
                <div
                  className={`${styles.ribbonThumbCurated} ${
                    !selectedSubCategory ? styles.ribbonThumbActive : ''
                  }`}
                >
                  <div className={styles.curatedInnerBox}>
                    <span
                      className={`material-symbols-outlined ${styles.materialIcon} ${styles.curatedIcon}`}
                    >
                      auto_awesome
                    </span>
                    <span className={styles.curatedTag}>ALL</span>
                  </div>
                </div>
                <span className={!selectedSubCategory ? styles.ribbonLabelActive : styles.ribbonLabel}>
                  All {activeCategoryName.slice(0, 8)}
                </span>
              </div>

              {/* Category's Subcategories */}
              {activeSubs.map((sub) => {
                const subIdentifier = sub.slug || sub._id || sub.name;
                const isSubActive =
                  selectedSubCategory &&
                  (String(selectedSubCategory).toLowerCase() === String(sub.slug || '').toLowerCase() ||
                    String(selectedSubCategory).toLowerCase() === String(sub.name || '').toLowerCase() ||
                    String(selectedSubCategory) === String(sub._id || ''));
                const subImg =
                  sub.image ||
                  currentCategoryObj?.image ||
                  FALLBACK_CATEGORY_IMAGES[currentCategoryObj?.slug] ||
                  'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/fashion.webp';

                return (
                  <div
                    key={sub._id || subIdentifier}
                    className={styles.ribbonItem}
                    onClick={() => {
                      if (onSubCategoryChange) {
                        onSubCategoryChange(isSubActive ? '' : subIdentifier);
                      }
                      showToast(isSubActive ? 'Cleared subcategory' : `Subcategory: ${formatSubName(sub.name)}`);
                    }}
                  >
                    <div
                      className={`${styles.ribbonThumb} ${
                        isSubActive ? styles.ribbonThumbActive : ''
                      }`}
                    >
                      <img src={subImg} alt={sub.name} className={styles.ribbonImg} />
                    </div>
                    <span className={isSubActive ? styles.ribbonLabelActive : styles.ribbonLabel}>
                      {formatSubName(sub.name)}
                    </span>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {/* All / Curated Pill */}
              <div
                className={styles.ribbonItem}
                onClick={() => {
                  setLocalCategory('');
                  if (onCategoryChange) onCategoryChange('');
                  if (onSubCategoryChange) onSubCategoryChange('');
                  showToast('Viewing All Products');
                }}
              >
                <div
                  className={`${styles.ribbonThumbCurated} ${
                    !effectiveCategory ? styles.ribbonThumbActive : ''
                  }`}
                >
                  <div className={styles.curatedInnerBox}>
                    <span
                      className={`material-symbols-outlined ${styles.materialIcon} ${styles.curatedIcon}`}
                    >
                      auto_awesome
                    </span>
                    <span className={styles.curatedTag}>ALL</span>
                  </div>
                </div>
                <span className={!effectiveCategory ? styles.ribbonLabelActive : styles.ribbonLabel}>
                  Curated
                </span>
              </div>

              {/* Real Database Categories */}
              {categories.map((cat) => {
                const catSlug = cat.slug || cat._id;
                const isCatActive =
                  effectiveCategory &&
                  (String(effectiveCategory).toLowerCase() === String(catSlug).toLowerCase() ||
                    String(effectiveCategory) === String(cat._id) ||
                    String(effectiveCategory).toLowerCase() === String(cat.name).toLowerCase());
                const catImg =
                  cat.image ||
                  FALLBACK_CATEGORY_IMAGES[cat.slug] ||
                  'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/categories/fashion.webp';

                return (
                  <div
                    key={cat._id || catSlug}
                    className={styles.ribbonItem}
                    onClick={() => {
                      const nextCat = isCatActive ? '' : catSlug;
                      setLocalCategory(nextCat);
                      if (onCategoryChange) {
                        onCategoryChange(nextCat);
                      }
                      showToast(isCatActive ? 'Category cleared' : `Category: ${cat.name}`);
                    }}
                  >
                    <div
                      className={`${styles.ribbonThumb} ${
                        isCatActive ? styles.ribbonThumbActive : ''
                      }`}
                    >
                      <img src={catImg} alt={cat.name} className={styles.ribbonImg} />
                    </div>
                    <span className={isCatActive ? styles.ribbonLabelActive : styles.ribbonLabel}>
                      {cat.name}
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </section>

      {/* ─── 4. Picked for You with Controls ────────────────────────────── */}
      <section id="picked-for-you" className={styles.curatedGridSection}>
        <div className={styles.gridControlHeader}>
          <h2 className={styles.gridTitle}>All Products</h2>
          <div className={styles.controlsGroup}>
            {/* Filter Drawer Trigger */}
            <button
              type="button"
              className={styles.filterTriggerBtn}
              onClick={() => setIsFilterOpen(true)}
            >
              <span className={`material-symbols-outlined ${styles.materialIcon}`}>tune</span>
              <span>Filters</span>
              <span className={styles.filterDot}></span>
            </button>

            {/* Sort Dropdown */}
            <div className={styles.sortDropdownWrap}>
              <button
                type="button"
                className={styles.sortBtn}
                onClick={() => setIsSortOpen((prev) => !prev)}
              >
                <span className={`material-symbols-outlined ${styles.materialIcon}`}>swap_vert</span>
                <span>{activeSort}</span>
              </button>

              {isSortOpen && (
                <div className={styles.sortMenu}>
                  {['Popular', 'Price: Low', 'Price: High', 'Newest'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={styles.sortMenuItem}
                      onClick={() => {
                        setActiveSort(option);
                        setIsSortOpen(false);
                        showToast(`Sorted by ${option}`);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── 5. 2-Column Product Grid (Database Products with ProductCard) ─── */}
        <div className={styles.productGrid}>
          {loading ? (
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                style={{
                  height: '320px',
                  borderRadius: '18px',
                  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'pulse 1.5s infinite',
                }}
              />
            ))
          ) : sortedProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
              <p style={{ fontWeight: 700, fontSize: '15px', color: '#1e1b4b', marginBottom: '8px' }}>
                No products found
              </p>
              <p style={{ fontSize: '12px', margin: 0 }}>
                Try adjusting your filters or search keywords.
              </p>
            </div>
          ) : (
            currentPaginatedProducts.map((product, idx) => (
              <ProductCard key={product._id || product.id || idx} product={product} />
            ))
          )}
        </div>

        {/* ─── Modern Mobile Pagination Controls ─── */}
        {!loading && sortedProducts.length > 0 && (
          <div className={styles.paginationWrapper}>
            <div className={styles.paginationControls}>
              <button
                type="button"
                className={styles.pageNavBtn}
                onClick={() => handlePageChange(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div className={styles.pageNumberGroup}>
                {getPageNumbers().map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>
                        •••
                      </span>
                    );
                  }
                  const isActive = p === safePage;
                  return (
                    <button
                      key={p}
                      type="button"
                      className={isActive ? styles.pageBtnActive : styles.pageBtn}
                      onClick={() => handlePageChange(p)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className={styles.pageNavBtn}
                onClick={() => handlePageChange(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ─── 9. Interactive Filter Bottom Sheet Drawer ──────────────────── */}
      <div
        className={`${styles.drawerBackdrop} ${isFilterOpen ? styles.drawerBackdropVisible : ''}`}
        onClick={() => setIsFilterOpen(false)}
      >
        <div
          className={`${styles.drawerSheet} ${isFilterOpen ? styles.drawerSheetOpen : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.sheetHeader}>
            <div className={styles.sheetHandle}></div>
            <div className={styles.sheetTitleRow}>
              <div>
                <h3 className={styles.sheetTitle}>Filters &amp; Refine</h3>
                <p className={styles.sheetSubtitle}>Narrow down from our curated collection</p>
              </div>
              <div className={styles.sheetActionGroup}>
                <button
                  type="button"
                  className={styles.clearAllBtn}
                  onClick={handleClearFilters}
                >
                  Clear all
                </button>
                <button
                  type="button"
                  className={styles.sheetCloseBtn}
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.sheetBody}>
            {/* Category Filter Chips */}
            <div>
              <span className={styles.filterGroupLabel}>CATEGORY</span>
              <div className={styles.chipsFlex}>
                <button
                  type="button"
                  className={!effectiveCategory ? styles.filterChipActive : styles.filterChipInactive}
                  onClick={() => {
                    setLocalCategory('');
                    if (onCategoryChange) onCategoryChange('');
                    showToast('Viewing All Categories');
                  }}
                >
                  All Categories
                </button>
                {categories.map((cat) => {
                  const catSlug = cat.slug || cat._id;
                  const isCatActive =
                    effectiveCategory &&
                    (String(effectiveCategory).toLowerCase() === String(catSlug).toLowerCase() ||
                      String(effectiveCategory) === String(cat._id) ||
                      String(effectiveCategory).toLowerCase() === String(cat.name).toLowerCase());
                  return (
                    <button
                      key={cat._id || catSlug}
                      type="button"
                      className={isCatActive ? styles.filterChipActive : styles.filterChipInactive}
                      onClick={() => {
                        const nextCat = isCatActive ? '' : catSlug;
                        setLocalCategory(nextCat);
                        if (onCategoryChange) {
                          onCategoryChange(nextCat);
                        }
                        showToast(isCatActive ? 'Category cleared' : `Selected: ${cat.name}`);
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Radio Cards */}
            <div>
              <span className={styles.filterGroupLabel}>BUDGET</span>
              <div className={styles.budgetOptionsGrid}>
                {budgetOptions.map((b) => {
                  const isBudgetActive = activeBudget === b.id;
                  return (
                    <div
                      key={b.id}
                      className={`${styles.budgetSelectCard} ${
                        isBudgetActive ? styles.budgetSelectCardActive : ''
                      }`}
                      onClick={() => setActiveBudget(b.id)}
                    >
                      <div className={styles.budgetCardContent}>
                        <div
                          className={
                            isBudgetActive ? styles.budgetCardTitleActive : styles.budgetCardTitle
                          }
                        >
                          {b.title}
                        </div>
                        <div
                          className={
                            isBudgetActive ? styles.budgetCardSubtitleActive : styles.budgetCardSubtitle
                          }
                        >
                          {b.subtitle}
                        </div>
                      </div>
                      <div className={isBudgetActive ? styles.checkDotActive : styles.checkDotEmpty}>
                        {isBudgetActive && <span className={styles.checkDotInnerWhite}></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ready Stock Hubs Toggle */}
            <div className={styles.toggleRow}>
              <div>
                <span className={styles.toggleLabelTitle}>Ready in Tamil Nadu Hubs</span>
                <span className={styles.toggleLabelDesc}>Dispatches within 12 hours</span>
              </div>
              <label className={styles.switchWrapper}>
                <input
                  type="checkbox"
                  checked={isExpressOnly}
                  onChange={(e) => setIsExpressOnly(e.target.checked)}
                  className={styles.switchInput}
                />
                <span className={styles.switchTrack}>
                  <span className={styles.switchThumb}></span>
                </span>
              </label>
            </div>
          </div>

          <div className={styles.sheetStickyFooter}>
            <button
              type="button"
              className={styles.applyFiltersBtn}
              onClick={() => {
                setIsFilterOpen(false);
                showToast(`Filters Applied (${products.length} Products)`);
              }}
            >
              Apply Filters ({products.length} Items)
            </button>
          </div>
        </div>
      </div>

      {/* ─── 10. Notification Micro Toast ───────────────────────────────── */}
      <div className={`${styles.toastPill} ${toastVisible ? styles.toastPillVisible : ''}`}>
        <span className={`material-symbols-outlined ${styles.materialIcon} ${styles.toastSuccessIcon}`}>
          check_circle
        </span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
