import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
import { productService } from '../../../services/product.service';
import styles from './NewArrivalsHero.module.css';

// Tag check helper for New Arrivals products
const isNewArrivalItem = (p) => {
  if (!p) return false;
  if (p.isNewArrival) return true;
  if (typeof p.badge === 'string') {
    const b = p.badge.toLowerCase();
    if (b.includes('new') || b.includes('arrival')) return true;
  }
  const rawTags = Array.isArray(p.tags)
    ? p.tags
    : typeof p.tags === 'string'
    ? p.tags.split(',')
    : [];
  return rawTags.some((t) => {
    if (!t) return false;
    const clean = String(t).trim().toLowerCase().replace(/[-_]/g, ' ');
    return clean.includes('new') || clean.includes('arrival');
  });
};

export default function NewArrivalsHero({
  products: propProducts = [],
  isLoading: propLoading = false,
  onExploreClick,
  categories = [],
  activeCategory = 'all',
  onSelectCategory,
}) {
  const navigate = useNavigate();
  const { addItem, setBuyNowItem } = useCartStore();
  const { showToast } = useUiStore();
  const [dbProducts, setDbProducts] = useState(propProducts || []);
  const [isLoading, setIsLoading] = useState(propLoading || (!propProducts || propProducts.length === 0));

  // Sync propProducts or fetch directly from backend DB API
  useEffect(() => {
    if (Array.isArray(propProducts) && propProducts.length > 0) {
      setDbProducts(propProducts);
      setIsLoading(false);
      return;
    }

    // If parent is currently loading products, wait for parent without duplicate fetch
    if (propLoading) {
      setIsLoading(true);
      return;
    }

    let isMounted = true;
    async function fetchDbProducts() {
      try {
        setIsLoading(true);
        const res = await productService.list({ limit: 50, sort: 'newest' });
        const data = res?.data || res;
        const items = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (isMounted) {
          const newArrivals = items.filter(isNewArrivalItem);
          setDbProducts(newArrivals);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('Hero could not fetch DB products:', err);
        if (isMounted) setIsLoading(false);
      }
    }
    fetchDbProducts();

    return () => {
      isMounted = false;
    };
  }, [propProducts, propLoading]);

  // Transform DB products into spotlight card model (100% Real DB Data)
  const spotlightList = useMemo(() => {
    if (Array.isArray(dbProducts) && dbProducts.length > 0) {
      return dbProducts.map((p, idx) => {
        const rawImg =
          (Array.isArray(p.images) && p.images[0]) ||
          p.image ||
          '/placeholder-product.png';
        return {
          id: p._id || p.id || `db-prod-${idx}`,
          rawProduct: p,
          title: p.name || p.title || 'New Arrival Collection',
          price: p.price || 0,
          displayPrice: `₹${(p.price || 0).toLocaleString('en-IN')}`,
          image: rawImg,
          isFeatured: idx % 3 === 1,
        };
      });
    }
    return [];
  }, [dbProducts]);

  // Duplicate for seamless 360-degree running marquee loop
  const runningMarqueeCards = useMemo(() => {
    if (!spotlightList.length) return [];
    let base = [...spotlightList];
    while (base.length < 8) {
      base = [...base, ...spotlightList];
    }
    return [...base, ...base];
  }, [spotlightList]);

  const handleBuyNow = (product, e) => {
    e.stopPropagation();
    try {
      const raw = product.rawProduct || product;
      const prodId = product.id || product._id || raw._id || raw.id;
      setBuyNowItem({
        _id: prodId,
        id: prodId,
        productId: prodId,
        name: product.title || raw.name || 'New Arrival Item',
        image: product.image || (Array.isArray(raw.images) ? raw.images[0] : raw.image) || '/placeholder-product.png',
        images: Array.isArray(raw.images) ? raw.images : [product.image],
        price: product.price || raw.discountPrice || raw.price || 0,
        discountPrice: raw.discountPrice || product.price || 0,
        originalPrice: raw.originalPrice || product.price || 0,
        quantity: 1,
        stock: typeof raw.stock === 'number' ? raw.stock : (typeof product.stock === 'number' ? product.stock : 10),
      });
      navigate('/checkout?buyNow=true');
    } catch (err) {
      console.warn('Could not proceed to direct checkout:', err);
    }
  };

  return (
    <section className={styles.heroStage} aria-label="New Arrivals Winter Showcase">
      {/* ── 4K Studio Architectural Background Layer ── */}
      <div className={styles.heroBgContainer} aria-hidden="true">
        <img
          src="/images/new-arrivals-hero/new_arrivals_hero_bg_4k.jpg"
          alt="New Arrivals Luxury 4K Arch & Studio Showcase"
          className={styles.heroBgImg}
          loading="eager"
          fetchpriority="high"
        />
        <div className={styles.heroBgOverlay} />
      </div>

      {/* ── Inner Content Container (Elevated, Compact & Aligned) ── */}
      <div className={styles.heroContainer}>
        {/* Top Row: Left-Aligned Studio Editorial */}
        <div className={styles.leftEditorial}>
          {/* Top Capsule Badge */}
          <div className={styles.capsuleBadge}>
            <span className={styles.capsuleStar}>✦</span>
            <span className={styles.capsuleText}>WINTER COLLECTION 2026</span>
          </div>

          {/* Unified Luxury Display Headline */}
          <h1 className={styles.heroTitle}>
            <span className={styles.titleWordNew}>NEW</span>
            <span className={styles.titleWordArrivals}>ARRIVALS</span>
          </h1>

          {/* Subtitle */}
          <p className={styles.heroSubtitle}>
            Trendy styles, everyday comfort made for your season.
          </p>

          {/* Call to Action Button */}
          <button
            type="button"
            className={styles.discoverBtn}
            onClick={onExploreClick}
            aria-label="Discover more new arrivals"
          >
            <span>Discover More</span>
            <ArrowRight size={15} strokeWidth={2.6} className={styles.discoverArrow} />
          </button>
        </div>

        {/* ── Bottom Row: "Explore Collection" Live Running Cards Marquee ── */}
        <div className={styles.exploreCollectionSection}>
          {/* Section Header Row */}
          <div className={styles.exploreHeaderRow}>
            <div className={styles.exploreTitleGroup}>
              <div className={styles.exploreHeadingRow}>
                <h2 className={styles.exploreTitle}>Explore Collection</h2>
              </div>
              <p className={styles.exploreSubtitle}>
                Warm, durable, and made for winter adventures.
              </p>
            </div>

            <button
              type="button"
              className={styles.viewAllLink}
              onClick={onExploreClick}
              aria-label="View all items in collection"
            >
              <span>View All</span>
              <ArrowRight size={15} strokeWidth={2.4} />
              <span className={styles.viewAllLine} />
            </button>
          </div>

          {/* Smooth Continuous Running Marquee Runner */}
          <div className={styles.cardsMarqueeWrapper}>
            <div className={styles.cardsMarqueeTrack}>
              {runningMarqueeCards.map((prod, idx) => (
                <div
                  key={`${prod.id}-${idx}`}
                  className={`${styles.spotlightCard} ${
                    prod.isFeatured ? styles.spotlightCardFeatured : ''
                  }`}
                  onClick={onExploreClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onExploreClick?.();
                  }}
                >
                  <div className={styles.spotlightCardLeft}>
                    <div className={styles.spotlightCardTitle}>{prod.title}</div>
                    <div className={styles.spotlightCardPrice}>{prod.displayPrice}</div>
                    <button
                      type="button"
                      className={styles.buyNowBtn}
                      onClick={(e) => handleBuyNow(prod, e)}
                      aria-label={`Buy ${prod.title}`}
                    >
                      Buy Now
                    </button>
                  </div>

                  <div className={styles.spotlightCardRight}>
                    <img
                      src={prod.image}
                      alt={prod.title}
                      className={styles.spotlightCardImg}
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-product.png';
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
