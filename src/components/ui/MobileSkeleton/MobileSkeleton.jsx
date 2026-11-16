import React from 'react';
import styles from './MobileSkeleton.module.css';

function renderProductCards(count) {
  return (
    <div className={styles.productGrid}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={styles.productCard}>
          <div className={`${styles.shimmer} ${styles.productImage}`} />
          <div className={styles.productTagRow}>
            <div className={`${styles.shimmer} ${styles.productBadge}`} />
            <div className={`${styles.shimmer} ${styles.productRating}`} />
          </div>
          <div className={`${styles.shimmer} ${styles.productTitle}`} />
          <div className={`${styles.shimmer} ${styles.productTitleShort}`} />
          <div className={styles.productFooter}>
            <div className={`${styles.shimmer} ${styles.productPrice}`} />
            <div className={`${styles.shimmer} ${styles.productCta}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function renderOrderCards(count) {
  return (
    <div className={styles.ordersStack}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={styles.orderCard}>
          <div className={styles.orderTopRow}>
            <div className={`${styles.shimmer} ${styles.orderId}`} />
            <div className={`${styles.shimmer} ${styles.orderStatusPill}`} />
          </div>
          <div className={styles.orderBodyRow}>
            <div className={`${styles.shimmer} ${styles.orderThumb}`} />
            <div className={styles.orderMetaCol}>
              <div className={`${styles.shimmer} ${styles.orderMetaLine}`} />
              <div className={`${styles.shimmer} ${styles.orderMetaSub}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderVariant(variant, count) {
  switch (variant) {
    case 'product-grid':
      return renderProductCards(count ?? 4);

    case 'product-detail':
      return (
        <div className={styles.detailContainer}>
          <div className={`${styles.shimmer} ${styles.detailGallery}`} />
          <div className={styles.detailDots}>
            {[0, 1, 2, 3].map((dot) => (
              <div key={dot} className={`${styles.shimmer} ${styles.detailDot}`} />
            ))}
          </div>
          <div className={`${styles.shimmer} ${styles.detailChip}`} />
          <div className={`${styles.shimmer} ${styles.detailTitle}`} />
          <div className={`${styles.shimmer} ${styles.detailTitleSub}`} />
          <div className={styles.detailPriceRow}>
            <div className={`${styles.shimmer} ${styles.detailPrice}`} />
            <div className={`${styles.shimmer} ${styles.detailMrp}`} />
          </div>
          <div className={`${styles.shimmer} ${styles.detailFeatureCard}`} />
          <div className={styles.detailActionBar}>
            <div className={`${styles.shimmer} ${styles.detailActionBtn}`} />
            <div className={`${styles.shimmer} ${styles.detailActionBtn}`} />
          </div>
        </div>
      );

    case 'orders':
      return renderOrderCards(count ?? 3);

    case 'order-detail':
      return (
        <div className={styles.orderDetailContainer}>
          <div className={`${styles.shimmer} ${styles.orderHeroCard}`} />
          <div className={styles.orderStepsRow}>
            {[0, 1, 2, 3].map((step) => (
              <div key={step} className={`${styles.shimmer} ${styles.orderStepBar}`} />
            ))}
          </div>
          {renderOrderCards(2)}
          <div className={`${styles.shimmer} ${styles.orderSummaryBlock}`} />
        </div>
      );

    case 'page':
    default:
      return (
        <div className={styles.pageContainer}>
          <div className={styles.pageTopBar}>
            <div className={`${styles.shimmer} ${styles.pageHeaderTitle}`} />
            <div className={`${styles.shimmer} ${styles.pageHeaderPill}`} />
          </div>
          <div className={`${styles.shimmer} ${styles.pageHeroBanner}`} />
          {renderProductCards(count ?? 4)}
        </div>
      );
  }
}

/**
 * Renders mobile-only shimmer Skeleton Screens (<= 768px) while preserving
 * the optional `fallback` loader strictly for desktop (> 768px).
 */
export default function MobileSkeleton({
  variant = 'page',
  count,
  fallback = null,
  spanFullGrid = false,
  className = '',
}) {
  const rootClass = [
    styles.wrapper,
    spanFullGrid ? styles.wrapperFullSpan : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass}>
      {fallback ? <div className={styles.desktopFallback}>{fallback}</div> : null}
      <div className={styles.mobileOnly} role="status" aria-busy="true" aria-label="Loading content">
        {renderVariant(variant, count)}
      </div>
    </div>
  );
}
