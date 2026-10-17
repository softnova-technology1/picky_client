import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Sparkles } from 'lucide-react';
import ProductCard from '../../product/ProductCard';
import { productService } from '../../../services/product.service';
import styles from './CategoryRecommendedDrops.module.css';

export default function CategoryRecommendedDrops() {
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const startTime = Date.now();
    setLoading(true);

    // Fetch products from database and strictly filter for TOP PRODUCTS
    productService
      .list({ limit: 50, sort: 'featured' })
      .then((res) => {
        if (!alive) return;
        const items = res?.data?.data || res?.data || [];
        const rawList = Array.isArray(items) ? items : [];

        // STRICT WORKFLOW:
        // 1. ONLY Top Products are shown (isFeatured === true or tags containing 'top')
        // 2. NO Trending products (exclude tags containing 'trend' or isTrending)
        // 3. NO other tags products (exclude 'deal', 'limited', 'arrival')
        const topProductsOnly = rawList.filter((p) => {
          const tagStrings = Array.isArray(p.tags) ? p.tags.map((t) => String(t).toLowerCase().trim()) : [];

          const isTrending = tagStrings.some((t) => t.includes('trend')) || Boolean(p.isTrending);
          if (isTrending) return false;

          const hasOtherDisqualifyingTags = tagStrings.some(
            (t) => (t.includes('deal') || t.includes('limited') || t.includes('arrival')) && !t.includes('top')
          );
          if (hasOtherDisqualifyingTags) return false;

          const hasTopTag = tagStrings.some(
            (t) => t === 'top' || t === 'top product' || t === 'top products' || t.includes('top product') || t === 'featured'
          );
          const isTop = Boolean(p.isFeatured || hasTopTag);

          return isTop;
        });

        setDisplayProducts(topProductsOnly);
      })
      .catch((err) => {
        if (!alive) return;
        console.error('Failed to load top products drops', err);
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
    <section className={styles.section} aria-label="Top Products Showcase">
      {/* ── Section Header ── */}
      <div className={styles.headerWrapper}>
        <div className={styles.badgePill}>
          <Award size={13} className={styles.badgeIcon} />
          <span>Top Verified Drops • Curated Flagship Selection</span>
        </div>

        <h2 className={styles.sectionTitle}>
          Top Products <span className={styles.accentText}>Showcase</span>
        </h2>

        <p className={styles.sectionSubtitle}>
          Verified flagship products across our curated departments. Auto-streaming live drops • Hover over any product to pause.
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
                key={`top-marquee-${prod._id || prod.id || 'p'}-${idx}`}
                className={styles.marqueeCardItem}
              >
                <ProductCard product={prod} badgeText="TOP PRODUCT" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIconBadge}>
            <Award size={26} color="#7c3aed" />
          </div>
          <h4 className={styles.emptyTitle}>Curating Top Flagship Products</h4>
          <p className={styles.emptySubtitle}>
            Our curators are currently selecting verified top products for this showcase. No trending or untagged products appear in this section.
          </p>
        </div>
      )}

      {/* ── Centered View Best Rated CTA ── */}
      <div className={styles.footerAction}>
        <Link to="/products?sort=featured" className={styles.viewAllBtn}>
          <span>View All Top Products</span>
          <ArrowRight size={15} className={styles.arrowIcon} />
        </Link>
      </div>
    </section>
  );
}

