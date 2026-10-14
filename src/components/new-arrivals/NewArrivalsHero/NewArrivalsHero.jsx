import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Package, BadgePercent, Sparkles } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
import { productService } from '../../../services/product.service';
import styles from './NewArrivalsHero.module.css';

// Fallback items if database products are still loading
const FALLBACK_SPOTLIGHT_PRODUCTS = [
  {
    id: 'spotlight-icebreeze-hoodie',
    title: 'IceBreeze Comfort Hoodie',
    price: 1699,
    displayPrice: '₹1,699',
    image: '/images/new-arrivals-hero/spotlight_green_hoodie.jpg',
    isFeatured: false,
  },
  {
    id: 'spotlight-warmnest-hoodie',
    title: 'WarmNest Hoodie',
    price: 2499,
    displayPrice: '₹2,499',
    image: '/images/new-arrivals-hero/spotlight_forest_hoodie.jpg',
    isFeatured: false,
  },
  {
    id: 'spotlight-snowshield-hoodie',
    title: 'SnowShield Hoodie',
    price: 2499,
    displayPrice: '₹2,499',
    image: '/images/new-arrivals-hero/spotlight_blue_puffer.jpg',
    isFeatured: true,
  },
  {
    id: 'spotlight-heatsole-shoes',
    title: 'HeatSole Comfort Shoes',
    price: 1299,
    displayPrice: '₹1,299',
    image: '/images/new-arrivals-hero/spotlight_shoes.jpg',
    isFeatured: false,
  },
];

export default function NewArrivalsHero({
  products: propProducts = [],
  onExploreClick,
  categories = [],
  activeCategory = 'all',
  onSelectCategory,
}) {
  const { addItem } = useCartStore();
  const { showToast } = useUiStore();
  const [dbProducts, setDbProducts] = useState(propProducts);

  // Sync propProducts or fetch directly from backend DB API
  useEffect(() => {
    if (Array.isArray(propProducts) && propProducts.length > 0) {
      setDbProducts(propProducts);
      return;
    }

    let isMounted = true;
    async function fetchDbProducts() {
      try {
        const res = await productService.list({ limit: 20, sort: 'newest' });
        const data = res?.data || res;
        const items = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        if (isMounted && items.length > 0) {
          setDbProducts(items);
        }
      } catch (err) {
        console.warn('Hero could not fetch DB products:', err);
      }
    }
    fetchDbProducts();

    return () => {
      isMounted = false;
    };
  }, [propProducts]);

  // Transform DB products into spotlight card model
  const spotlightList = useMemo(() => {
    if (Array.isArray(dbProducts) && dbProducts.length > 0) {
      return dbProducts.map((p, idx) => {
        const rawImg = (Array.isArray(p.images) && p.images[0]) || p.image || '/images/new-arrivals-hero/spotlight_forest_hoodie.jpg';
        return {
          id: p._id || p.id || `db-prod-${idx}`,
          rawProduct: p,
          title: p.title || p.name || 'New Arrival Collection',
          price: p.price || 1999,
          displayPrice: `₹${(p.price || 0).toLocaleString('en-IN')}`,
          image: rawImg,
          isFeatured: idx % 4 === 2, // highlight every 3rd or 4th card with the signature purple border
        };
      });
    }
    return FALLBACK_SPOTLIGHT_PRODUCTS;
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
      const itemToAdd = product.rawProduct || {
        _id: product.id,
        id: product.id,
        title: product.title,
        name: product.title,
        price: product.price,
        images: [product.image],
        image: product.image,
        inStock: true,
      };

      addItem(itemToAdd, 1);
      if (showToast) {
        showToast(`Added ${product.title} to your bag!`, 'success');
      }
    } catch (err) {
      console.warn('Could not add to cart:', err);
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

          {/* Bold Display Headline with Luxury Serif Accent */}
          <div className={styles.heroTitle}>
            <div className={styles.titleLineNew}>
              <span>NEW</span>
              <span className={styles.titleStar}>✦</span>
            </div>
            <div className={styles.titleLineArrivals}>
              <span className={styles.arrivalsText}>ARRIVALS</span>
              <svg
                className={styles.arrivalsSwoosh}
                viewBox="0 0 280 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 13C65 18 195 18 278 4C210 11 90 11 2 13Z"
                  fill="url(#swooshGradient)"
                />
                <defs>
                  <linearGradient
                    id="swooshGradient"
                    x1="2"
                    y1="13"
                    x2="278"
                    y2="13"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#6D28D9" />
                    <stop offset="0.5" stopColor="#9333EA" />
                    <stop offset="1" stopColor="#C084FC" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Subtitle */}
          <p className={styles.heroSubtitle}>
            Trendy styles, everyday comfort made for your season.
          </p>

          {/* Trust / Benefit Feature Highlights Card */}
          <div className={styles.trustCard}>
            <div className={styles.trustItem}>
              <div className={styles.trustIconBox}>
                <Package size={17} strokeWidth={2.2} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>7 DAYS</span>
                <span className={styles.trustSubtitle}>Easy Returns</span>
              </div>
            </div>

            <div className={styles.trustDivider} aria-hidden="true" />

            <div className={styles.trustItem}>
              <div className={styles.trustIconBox}>
                <BadgePercent size={17} strokeWidth={2.2} />
              </div>
              <div className={styles.trustText}>
                <span className={styles.trustTitle}>
                  Extra <span className={styles.trustHighlight}>10% OFF</span>
                </span>
                <span className={styles.trustSubtitle}>For New Users</span>
              </div>
            </div>
          </div>

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
                <span className={styles.liveDropPill}>
                  <span className={styles.livePulseDot} />
                  Live Drops ({spotlightList.length})
                </span>
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
                        e.target.src = '/images/new-arrivals-hero/spotlight_green_hoodie.jpg';
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
