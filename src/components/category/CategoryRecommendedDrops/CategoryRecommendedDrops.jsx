import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, TrendingUp } from 'lucide-react';
import ProductCard from '../../product/ProductCard';
import { productService } from '../../../services/product.service';
import styles from './CategoryRecommendedDrops.module.css';

/**
 * Checks if a product qualifies as "Trending" based on product tags or explicit trending flag.
 * Tags can be an array of strings (e.g. ['trending', 'fashion']) or a comma-separated string.
 *
 * @param {Object} product
 * @returns {boolean}
 */
export const isTrendingProduct = (product) => {
  if (!product) return false;

  // Explicit boolean flag check
  if (product.isTrending === true) return true;

  // Normalize tags array or string
  const tagList = Array.isArray(product.tags)
    ? product.tags
    : typeof product.tags === 'string'
    ? product.tags.split(',')
    : [];

  return tagList.some((tag) => {
    if (!tag) return false;
    const normalized = String(tag).toLowerCase().trim();
    return (
      normalized === 'trending' ||
      normalized === 'trend' ||
      normalized === 'trending product' ||
      normalized === 'trending products' ||
      normalized.includes('trend')
    );
  });
};

export default function CategoryRecommendedDrops() {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const startTime = Date.now();
    setLoading(true);

    // Fetch products and filter strictly for trending items based on tags
    productService
      .list({ limit: 50 })
      .then((res) => {
        if (!alive) return;
        const items = res?.data?.data || res?.data || [];
        const rawList = Array.isArray(items) ? items : [];

        // Dedicated tag-based filtering function for trending products
        const trendingOnly = rawList.filter(isTrendingProduct);

        setDisplayProducts(trendingOnly);
      })
      .catch((err) => {
        if (!alive) return;
        console.error('Failed to load trending products', err);
        setDisplayProducts([]);
      })
      .finally(async () => {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 800 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Guarantee an infinite seamless marquee ribbon with ZERO design collapse even with 1 or 2 items
  const marqueeItems = useMemo(() => {
    if (!displayProducts || !displayProducts.length) return [];

    let singleCycle = [...displayProducts];
    // Ensure single cycle has at least 6 cards so it spans past viewports
    while (singleCycle.length < 6) {
      singleCycle = [...singleCycle, ...displayProducts];
    }

    // Double for mathematically seamless -50% translateX loop
    return [...singleCycle, ...singleCycle];
  }, [displayProducts]);

  return (
    <section className={styles.section} aria-label="Trending Products Showcase">
      {/* ── Section Header ── */}
      <div className={styles.headerWrapper}>
        <div className={styles.badgePill}>
          <Flame size={13} className={styles.badgeIcon} />
          <span>Trending Now • Popular Demand Selections</span>
        </div>

        <h2 className={styles.sectionTitle}>
          Trending Products <span className={styles.accentText}>Showcase</span>
        </h2>

        <p className={styles.sectionSubtitle}>
          Most loved and trending products across our curated departments. Auto-streaming live drops • Hover over any product to pause.
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div className={styles.diamondDivider}>
          <div className={styles.dividerLineLeft} />
          <span className={styles.dividerDiamonds}>✦ ❖ ✦</span>
          <div className={styles.dividerLineRight} />
        </div>

        <div className={styles.marqueeLiveIndicator}>
          <span className={styles.livePulseDot} />
          <span>Auto-Running Live Stream • Hover to Explore</span>
        </div>
      </div>

      {/* ── Continuous Running Infinite Marquee Ribbon ── */}
      {loading ? (
        <div className={styles.skeletonTrack}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : marqueeItems.length > 0 ? (
        <div className={styles.marqueeViewport}>
          <div className={styles.marqueeTrack}>
            {marqueeItems.map((prod, idx) => (
              <div
                key={`trending-marquee-${prod._id || prod.id || 'p'}-${idx}`}
                className={styles.marqueeCardItem}
              >
                <ProductCard product={prod} badgeText="TRENDING" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconBadge}>
            <TrendingUp size={26} color="#7c3aed" />
          </div>
          <h4 className={styles.emptyTitle}>Curating Trending Products</h4>
          <p className={styles.emptySubtitle}>
            Our curators are currently selecting verified trending items for this showcase. Products tagged with "trending" will automatically appear here.
          </p>
        </div>
      )}

      {/* ── Centered View All Trending Products CTA ── */}
      <div className={styles.footerAction}>
        <Link to="/products?tag=trending" className={styles.viewAllBtn}>
          <span>View All Trending Products</span>
          <ArrowRight size={15} className={styles.arrowIcon} />
        </Link>
      </div>
    </section>
  );
}

