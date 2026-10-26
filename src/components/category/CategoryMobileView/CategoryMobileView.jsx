import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCategoryStore } from '../../../store/categoryStore';
import { productService } from '../../../services/product.service';
import { usePageCustomization } from '../../../store/customizationStore';
import ProductCard from '../../product/ProductCard';
import styles from './CategoryMobileView.module.css';

export default function CategoryMobileView() {
  const navigate = useNavigate();
  const heroScrollerRef = useRef(null);

  // Live Admin Customization Hook for Categories Hub
  const { sections, isEnabled, getSetting } = usePageCustomization('categories');

  // Real DB Categories from store
  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  // Real DB Products
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Category Filter for Top Products Section
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

  // Carousel Active Dot Index
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Toggle to show all categories in Explore More Categories section (default 4 cards)
  const [showAllPillCategories, setShowAllPillCategories] = useState(false);

  useEffect(() => {
    fetchCategories();

    productService
      .list({ limit: 60 })
      .then((res) => {
        const items = res?.data?.data || res?.data || [];
        if (Array.isArray(items)) {
          setProducts(items);
        }
      })
      .catch((err) => {
        console.error('Failed to load products for categories page:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchCategories]);

  // Active DB categories ordered properly
  const orderedCategories = useMemo(() => {
    return (categories || [])
      .filter((cat) => cat.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [categories]);

  // Compute live product counts for each category from actual DB products
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const catId = p.category?._id || p.category?.id || (typeof p.category === 'string' ? p.category : null);
      const catSlug = p.category?.slug;
      if (catId) counts[catId] = (counts[catId] || 0) + 1;
      if (catSlug) counts[catSlug] = (counts[catSlug] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Minimum price across all DB products for fallback
  const minPrice = useMemo(() => {
    if (!products.length) return 129;
    const prices = products
      .map((p) => Number(p.discountPrice || p.price))
      .filter((pr) => !isNaN(pr) && pr > 0);
    return prices.length ? Math.min(...prices) : 129;
  }, [products]);

  // ─── Live Dynamic Admin Customization Settings for Hero Spotlight ─────────────
  const heroSectionBadge = getSetting(
    'categories_hero',
    'sectionBadge',
    getSetting('categories_hero', 'title', 'Curated Heritage Spotlight')
  );
  const heroEyebrow = getSetting(
    'categories_hero',
    'badge',
    getSetting('categories_hero', 'eyebrow', 'Direct from Artisans')
  );
  const heroHeadline = getSetting(
    'categories_hero',
    'headline',
    'Heritage Collections Of South India'
  );
  const heroSubheadline = getSetting(
    'categories_hero',
    'subheadline',
    'Curated direct from multigenerational handloom weavers & brass artisans.'
  );
  const heroStartingPriceLabel = getSetting(
    'categories_hero',
    'startingPriceLabel',
    'Starting From'
  );
  const rawStartingPrice = getSetting(
    'categories_hero',
    'startingPrice',
    minPrice ? `₹${minPrice}` : '₹200'
  );
  const heroStartingPrice = rawStartingPrice
    ? (String(rawStartingPrice).trim().startsWith('₹') ? String(rawStartingPrice).trim() : `₹${rawStartingPrice}`)
    : (minPrice ? `₹${minPrice}` : '₹200');
  const heroButtonText = getSetting('categories_hero', 'buttonText', 'SHOP NOW');
  const heroButtonLink = getSetting('categories_hero', 'buttonLink', '/products');
  const heroImage = getSetting('categories_hero', 'heroImage', '/images/categories_hero_3d.png');
  const autoplaySpeed = Number(getSetting('categories_hero', 'autoplaySpeed', 4000)) || 3500;

  // ─── Live Dynamic Admin Settings for Other Sections ──────────────────────────
  const pillsTitle = getSetting('categories_pills', 'title', 'Explore More Categories');
  const pillsSubtitle = getSetting(
    'categories_pills',
    'subtitle',
    'Curated Tamil heritage, gourmet snacks, beauty rituals & living essentials'
  );

  const budgetTitle = getSetting('categories_budget_store', 'title', 'Shop By Budget');
  const budgetSubtitle = getSetting(
    'categories_budget_store',
    'subtitle',
    'Discover handpicked collections curated for every wallet size'
  );

  const topProductsTitle = getSetting(
    'categories_featured_drops',
    'title',
    getSetting('categories_recommended_drops', 'title', 'Top Products')
  );
  const topProductsSubtitle = getSetting(
    'categories_featured_drops',
    'subtitle',
    getSetting(
      'categories_recommended_drops',
      'subtitle',
      `Showing ${products.length} top products across all departments`
    )
  );

  // Helper to format headline text with stylish highlight on 2nd word or newlines
  const renderFormattedHeadline = (text) => {
    if (!text) return 'Heritage Collections Of South India';
    if (text.includes('\n')) {
      const lines = text.split('\n');
      return lines.map((line, idx) => (
        <React.Fragment key={idx}>
          {idx === 1 ? (
            <span className={styles.spotlightTitleHighlight}>{line}</span>
          ) : (
            line
          )}
          {idx < lines.length - 1 && <br />}
        </React.Fragment>
      ));
    }
    const words = text.trim().split(/\s+/);
    if (words.length <= 1) {
      return text;
    }
    if (words.length === 2) {
      return (
        <>
          {words[0]} <br />
          <span className={styles.spotlightTitleHighlight}>{words[1]}</span>
        </>
      );
    }
    const first = words[0];
    const second = words[1];
    const rest = words.slice(2).join(' ');
    return (
      <>
        {first} <br />
        <span className={styles.spotlightTitleHighlight}>{second}</span> <br />
        {rest}
      </>
    );
  };





  // Group categories into pairs of 2 so 2 cards appear side-by-side per slide
  const categoryPairs = useMemo(() => {
    const topCats = orderedCategories.slice(0, 6);
    const pairs = [];
    for (let i = 0; i < topCats.length; i += 2) {
      pairs.push(topCats.slice(i, i + 2));
    }
    return pairs;
  }, [orderedCategories]);

  const totalHeroSlides = useMemo(() => 1 + categoryPairs.length, [categoryPairs]);

  // ─── Carousel Controls & Auto-Advance (Matching Customize / Desktop) ────────
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const pauseTimeoutRef = useRef(null);

  // Auto-advance hero carousel slide by slide (2 cards at a time for category slides)
  useEffect(() => {
    if (isCarouselPaused) return;

    const timer = setInterval(() => {
      if (!heroScrollerRef.current) return;
      const container = heroScrollerRef.current;
      const slides = container.querySelectorAll(`.${styles.carouselSlide}`);
      if (!slides.length) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isNearEnd = scrollLeft >= scrollWidth - clientWidth - 20;

      if (isNearEnd) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        let nextSlide = null;
        for (let i = 0; i < slides.length; i++) {
          if (slides[i].offsetLeft > scrollLeft + 10) {
            nextSlide = slides[i];
            break;
          }
        }
        if (nextSlide) {
          container.scrollTo({ left: nextSlide.offsetLeft, behavior: 'smooth' });
        } else {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }
    }, autoplaySpeed);

    return () => clearInterval(timer);
  }, [isCarouselPaused, autoplaySpeed]);

  const handleTouchStart = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    setIsCarouselPaused(true);
  };

  const handleTouchEnd = () => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      setIsCarouselPaused(false);
    }, 2500);
  };

  const scrollToSlide = (idx) => {
    if (!heroScrollerRef.current) return;
    const container = heroScrollerRef.current;
    const slides = container.querySelectorAll(`.${styles.carouselSlide}`);
    if (slides[idx]) {
      container.scrollTo({ left: slides[idx].offsetLeft, behavior: 'smooth' });
    }
  };

  // Carousel manual controls
  const handleScrollCarousel = (direction) => {
    if (!heroScrollerRef.current) return;
    const container = heroScrollerRef.current;
    const slides = container.querySelectorAll(`.${styles.carouselSlide}`);
    if (!slides.length) return;

    const scrollLeft = container.scrollLeft;
    if (direction === 'next') {
      let nextSlide = null;
      for (let i = 0; i < slides.length; i++) {
        if (slides[i].offsetLeft > scrollLeft + 10) {
          nextSlide = slides[i];
          break;
        }
      }
      if (nextSlide) container.scrollTo({ left: nextSlide.offsetLeft, behavior: 'smooth' });
    } else {
      let prevSlide = null;
      for (let i = slides.length - 1; i >= 0; i--) {
        if (slides[i].offsetLeft < scrollLeft - 10) {
          prevSlide = slides[i];
          break;
        }
      }
      if (prevSlide) container.scrollTo({ left: prevSlide.offsetLeft, behavior: 'smooth' });
      else container.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleCarouselScroll = () => {
    if (!heroScrollerRef.current) return;
    const container = heroScrollerRef.current;
    const slides = container.querySelectorAll(`.${styles.carouselSlide}`);
    if (!slides.length) return;

    const scrollLeft = container.scrollLeft;
    let closestIdx = 0;
    let minDiff = Infinity;
    slides.forEach((slide, idx) => {
      const diff = Math.abs(slide.offsetLeft - scrollLeft);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setActiveSlideIndex(closestIdx);
  };

  // Top Products Filter Logic
  const filterTabs = useMemo(() => {
    return [
      { id: 'all', name: 'All' },
      ...orderedCategories.slice(0, 4).map((c) => ({
        id: c.slug || c._id,
        name: c.name,
      })),
    ];
  }, [orderedCategories]);

  const moreFilterCategories = useMemo(() => {
    return orderedCategories.slice(4).map((c) => ({
      id: c.slug || c._id,
      name: c.name,
    }));
  }, [orderedCategories]);

  const filteredProducts = useMemo(() => {
    if (!products.length) return [];
    if (activeCategoryFilter === 'all') return products;

    return products.filter((p) => {
      const catId = p.category?._id || p.category?.id || (typeof p.category === 'string' ? p.category : null);
      const catSlug = p.category?.slug;
      return (
        catId === activeCategoryFilter ||
        catSlug === activeCategoryFilter ||
        p.category === activeCategoryFilter
      );
    });
  }, [products, activeCategoryFilter]);

  const activeCategoryName = useMemo(() => {
    if (activeCategoryFilter === 'all') return 'All';
    const found = orderedCategories.find(
      (c) => (c.slug || c._id) === activeCategoryFilter
    );
    return found ? found.name : 'All';
  }, [activeCategoryFilter, orderedCategories]);

  // ─── Section Renderers (Follows Admin Ordering & Enabled Toggles) ───────────

  // 1. Hero Carousel Spotlight Section
  const renderHeroSection = () => {
    if (!isEnabled('categories_hero')) return null;

    return (
      <section
        key="categories_hero"
        className={styles.heroCarouselSection}
        data-purpose="hero-carousel-section"
      >
        {/* Horizontal Snap Scroller: Slide 1 = 1 Full Spotlight Card, Subsequent Slides = 2 Cards Full */}
        <div
          className={styles.carouselScroller}
          ref={heroScrollerRef}
          onScroll={handleCarouselScroll}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          {/* Slide 1: Editorial Spotlight Feature (Full Width Card) */}
          <div className={`${styles.carouselSlide} ${styles.snapCard}`}>
            <article className={styles.spotlightCard}>
              <div className={styles.spotlightGlow}></div>
              <div className={styles.heroDotsPattern}></div>

              <div className={styles.spotlightBodyRow}>
                <div className={styles.spotlightContent}>
                  <span className={styles.artisanBadge}>{heroEyebrow}</span>
                  <h1 className={styles.spotlightTitle}>
                    {renderFormattedHeadline(heroHeadline)}
                  </h1>
                  <p className={styles.spotlightDesc}>
                    {heroSubheadline}
                  </p>
                </div>

                {/* Dynamic Visual Graphic from Admin Customize (Exact match with Desktop) */}
                <div className={styles.heroVisualWrap}>
                  <img
                    alt={heroHeadline || 'Picky Categories Hero'}
                    className={styles.heroVisualImg}
                    src={heroImage || '/images/categories_hero_3d.png'}
                    onError={(e) => {
                      e.currentTarget.src = '/images/categories_hero_3d.png';
                    }}
                  />
                </div>
              </div>

              {/* Pricing Pill & Shop Now Action */}
              <div className={styles.spotlightFooter}>
                <div>
                  <span className={styles.startingPriceLabel}>{heroStartingPriceLabel}</span>
                  <span className={styles.startingPrice}>{heroStartingPrice}</span>
                </div>
                <Link to={heroButtonLink || '/products'} className={styles.shopNowBtn}>
                  <span>{heroButtonText}</span>
                  <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '10px' }}></i>
                </Link>
              </div>
            </article>
          </div>

          {/* Slides 2+: Dynamic Top Categories in Pairs of 2 (2 cards full per slide, scrolls 2 cards at a time) */}
          {categoryPairs.map((pair, pairIdx) => (
            <div
              key={`pair-${pairIdx}`}
              className={`${styles.carouselSlide} ${styles.categorySlidePair} ${styles.snapCard}`}
            >
              {pair.map((cat, subIdx) => {
                const globalIdx = pairIdx * 2 + subIdx;
                const count = categoryCounts[cat.slug || cat._id];
                const badgeLabel =
                  globalIdx === 0 ? 'Artisan' : globalIdx === 1 ? 'Fresh Made' : globalIdx === 2 ? 'Trending' : 'Special';

                return (
                  <article
                    key={cat._id || cat.slug || globalIdx}
                    className={styles.categorySlideCard}
                  >
                    <div>
                      <div className={styles.catSlideImgWrap}>
                        <img
                          alt={cat.name}
                          className={styles.catSlideImg}
                          src={cat.image || fallbackHeritageImages[globalIdx % fallbackHeritageImages.length]}
                        />
                        <span className={styles.catSlideBadge}>{badgeLabel}</span>
                      </div>
                      <div>
                        <h2 className={styles.catSlideTitle}>{cat.name}</h2>
                        <p className={styles.catSlideDesc}>
                          {cat.description || (count ? `${count}+ Products` : 'Handpicked Collection')}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/categories/${cat.slug || cat._id}`}
                      className={styles.catSlideAction}
                    >
                      <span>Explore</span>
                      <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i>
                    </Link>
                  </article>
                );
              })}
            </div>
          ))}
        </div>

        {/* Indicator Dots */}
        <div className={styles.dotsRow}>
          {Array.from({ length: totalHeroSlides }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              className={activeSlideIndex === dotIdx ? styles.activeDot : styles.inactiveDot}
              onClick={() => scrollToSlide(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              style={{ border: 'none', padding: 0, cursor: 'pointer' }}
            />
          ))}
        </div>
      </section>
    );
  };

  // 2. Explore More Categories Section
  const renderPillsSection = () => {
    if (!isEnabled('categories_pills')) return null;

    const visiblePillCategories = showAllPillCategories
      ? orderedCategories
      : orderedCategories.slice(0, 4);

    return (
      <section
        key="categories_pills"
        className={styles.exploreSection}
        data-purpose="explore-more-categories-section"
      >
        <div className={styles.sectionHeaderCenter}>
          <h2 className={styles.sectionHeading}>{pillsTitle}</h2>
          <p className={styles.sectionSubtitle}>{pillsSubtitle}</p>
          <div className={styles.diamondDivider}>
            <span className={styles.diamondDot}></span>
            <i className={`fa-solid fa-diamond ${styles.diamondIcon}`}></i>
            <span className={styles.diamondDot}></span>
          </div>
        </div>

        {/* 2-Column Grid (Default 4 cards, expands on View All click) */}
        <div className={styles.categoryGrid2Col}>
          {visiblePillCategories.map((cat, idx) => {
            const count = categoryCounts[cat.slug || cat._id];
            return (
              <Link
                key={cat._id || cat.slug || idx}
                to={`/categories/${cat.slug || cat._id}`}
                className={styles.categoryPillItem}
              >
                <div className={styles.catPillThumb}>
                  <img
                    alt={cat.name}
                    className={styles.catPillThumbImg}
                    src={cat.image || fallbackHeritageImages[idx % fallbackHeritageImages.length]}
                  />
                </div>
                <div className={styles.catPillInfo}>
                  <h3 className={styles.catPillName}>{cat.name}</h3>
                  <span className={styles.catPillCount}>
                    {count ? `${count}+ Products` : 'Curated'}
                  </span>
                </div>
                <span className={styles.catPillChevron}>
                  <i className="fa-solid fa-chevron-right"></i>
                </span>
              </Link>
            );
          })}
        </div>

        {/* View All Button */}
        {orderedCategories.length > 4 && (
          <div className={styles.viewAllPillsWrapper}>
            <button
              type="button"
              className={styles.viewAllPillsBtn}
              onClick={() => setShowAllPillCategories((prev) => !prev)}
            >
              <span>{showAllPillCategories ? 'View Less' : `View All (${orderedCategories.length})`}</span>
              <i className={`fa-solid ${showAllPillCategories ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
            </button>
          </div>
        )}
      </section>
    );
  };

  // 3. Shop By Budget Section
  const renderBudgetSection = () => {
    if (!isEnabled('categories_budget_store')) return null;

    return (
      <section
        key="categories_budget_store"
        className={styles.budgetSection}
        data-purpose="shop-by-budget-section"
      >
        <div className={styles.sectionHeaderCenter}>
          <h2 className={styles.sectionHeading}>{budgetTitle}</h2>
          <p className={styles.sectionSubtitle}>{budgetSubtitle}</p>
          <div className={styles.diamondDivider}>
            <span className={styles.diamondDot}></span>
            <i className={`fa-solid fa-diamond ${styles.diamondIcon}`}></i>
            <span className={styles.diamondDot}></span>
          </div>
        </div>

        {/* 2x2 Budget Grid */}
        <div className={styles.budgetGrid2Col}>
          {/* Card 1: Under ₹199 */}
          <article className={`${styles.budgetCard} ${styles.budgetCard199}`}>
            <div className={styles.budgetCardText}>
              <span className={styles.budgetBadge199}>All Categories</span>
              <h3 className={styles.budgetHeading}>Under ₹199</h3>
              <Link to="/products?maxPrice=199" className={styles.budgetActionLink199}>
                <span>SHOP NOW</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '9px' }}></i>
              </Link>
            </div>
            <div className={styles.budgetCutoutCluster} aria-hidden="true">
              <img
                src="/images/pill_beauty_product.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_left}`}
              />
              <img
                src="/images/pill_tech_product.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_center}`}
              />
              <img
                src="/images/pill_kitchen_product.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_right}`}
              />
            </div>
          </article>

          {/* Card 2: Under ₹499 */}
          <article className={`${styles.budgetCard} ${styles.budgetCard499}`}>
            <div className={styles.budgetCardText}>
              <span className={styles.budgetBadge499}>All Categories</span>
              <h3 className={styles.budgetHeading}>Under ₹499</h3>
              <Link to="/products?maxPrice=499" className={styles.budgetActionLink499}>
                <span>SHOP NOW</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '9px' }}></i>
              </Link>
            </div>
            <div className={styles.budgetCutoutCluster} aria-hidden="true">
              <img
                src="/images/pill_model_decor.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_left}`}
              />
              <img
                src="/images/pill_model_kurti.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_center}`}
              />
              <img
                src="/images/pill_kitchen_product.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_right}`}
              />
            </div>
          </article>

          {/* Card 3: Under ₹799 */}
          <article className={`${styles.budgetCard} ${styles.budgetCard799}`}>
            <div className={styles.budgetCardText}>
              <span className={styles.budgetBadge799}>All Categories</span>
              <h3 className={styles.budgetHeading}>Under ₹799</h3>
              <Link to="/products?maxPrice=799" className={styles.budgetActionLink799}>
                <span>SHOP NOW</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '9px' }}></i>
              </Link>
            </div>
            <div className={styles.budgetCutoutCluster} aria-hidden="true">
              <img
                src="/images/pill_beauty_product.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_left}`}
              />
              <img
                src="/images/pill_model_jewellery.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_center}`}
              />
              <img
                src="/images/pill_tech_product.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_right}`}
              />
            </div>
          </article>

          {/* Card 4: ₹1,099+ Luxe */}
          <article className={`${styles.budgetCard} ${styles.budgetCardLuxe}`}>
            <div className={styles.budgetCardText}>
              <span className={styles.budgetBadgeLuxe}>All Categories</span>
              <h3 className={styles.budgetHeading}>₹1,099+ | Luxe</h3>
              <Link to="/products?minPrice=1099" className={styles.budgetActionLinkLuxe}>
                <span>SHOP NOW</span>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '9px' }}></i>
              </Link>
            </div>
            <div className={styles.budgetCutoutCluster} aria-hidden="true">
              <img
                src="/images/pill_model_jewellery.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_left}`}
              />
              <img
                src="/images/pill_model_saree.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_center}`}
              />
              <img
                src="/images/pill_model_decor.png"
                alt=""
                className={`${styles.budgetClusterImg} ${styles.slot_right}`}
              />
            </div>
          </article>
        </div>
      </section>
    );
  };

  // 4. Top Products Section (2 Cards Per Row with Picky ProductCard)
  const renderTopProductsSection = () => {
    if (!isEnabled('categories_featured_drops') && !isEnabled('categories_recommended_drops')) return null;

    return (
      <section
        key="categories_top_products"
        className={styles.topProductsSection}
        data-purpose="top-products-section"
      >
        <div className={styles.topProductsHeader}>
          <h2 className={styles.sectionHeading}>{topProductsTitle}</h2>
          <p className={styles.sectionSubtitle}>{topProductsSubtitle}</p>
        </div>

        {/* Filter Pills with "More Categories" Dropdown */}
        <div className={styles.filterPillsRow}>
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeCategoryFilter === tab.id ? styles.filterPillActive : styles.filterPillInactive}
              onClick={() => {
                setActiveCategoryFilter(tab.id);
                setShowMoreDropdown(false);
              }}
            >
              {tab.name}
            </button>
          ))}

          {moreFilterCategories.length > 0 && (
            <div className={styles.filterDropdownWrap}>
              <button
                type="button"
                className={styles.filterDropdownBtn}
                onClick={() => setShowMoreDropdown((prev) => !prev)}
              >
                <span>More Categories</span>
                <i className="fa-solid fa-chevron-down" style={{ fontSize: '9px' }}></i>
              </button>

              {showMoreDropdown && (
                <div className={styles.filterDropdownMenu}>
                  {moreFilterCategories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={styles.filterDropdownItem}
                      onClick={() => {
                        setActiveCategoryFilter(c.id);
                        setShowMoreDropdown(false);
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2 CARDS PER ROW USING OUR ProductCard COMPONENT */}
        <div className={styles.productsGrid2Col}>
          {filteredProducts.slice(0, 10).map((product) => (
            <ProductCard
              key={product._id || product.id || product.slug}
              product={product}
            />
          ))}

          {filteredProducts.length === 0 && !loading && (
            <div className={styles.noProductsNotice}>
              <p>No products found in this category yet.</p>
            </div>
          )}
        </div>

        {/* Center View All Button */}
        <div className={styles.viewAllCenterRow}>
          <Link
            to={activeCategoryFilter === 'all' ? '/products' : `/categories/${activeCategoryFilter}`}
            className={styles.viewAllPillBtn}
          >
            <span>View All in {activeCategoryName}</span>
            <i className="fa-solid fa-arrow-right" style={{ fontSize: '10px' }}></i>
          </Link>
        </div>
      </section>
    );
  };

  // ─── Dynamic Section Rendering Pipeline ──────────────────────────────────
  const renderedSet = new Set();
  const activeSectionsList = Array.isArray(sections) && sections.length > 0
    ? sections
    : [
        { id: 'categories_hero' },
        { id: 'categories_pills' },
        { id: 'categories_budget_store' },
        { id: 'categories_featured_drops' },
      ];

  return (
    <div className={styles.mobileShellRoot}>
      <div className={styles.mobileContainer}>
        {activeSectionsList.map((sec) => {
          const secId = sec.id || sec.key;

          if (secId === 'categories_hero' && !renderedSet.has('hero')) {
            renderedSet.add('hero');
            return renderHeroSection();
          }

          if ((secId === 'categories_pills' || secId === 'categories_top_categories') && !renderedSet.has('pills')) {
            renderedSet.add('pills');
            return renderPillsSection();
          }

          if (secId === 'categories_budget_store' && !renderedSet.has('budget')) {
            renderedSet.add('budget');
            return renderBudgetSection();
          }

          if ((secId === 'categories_featured_drops' || secId === 'categories_recommended_drops') && !renderedSet.has('top_products')) {
            renderedSet.add('top_products');
            return renderTopProductsSection();
          }

          return null;
        })}
      </div>
    </div>
  );
}
