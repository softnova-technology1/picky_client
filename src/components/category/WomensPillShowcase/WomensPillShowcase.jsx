import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import styles from './WomensPillShowcase.module.css';

export default function WomensPillShowcase() {
  // 4 Curated Budget Tier Pill Stores.
  // Every tier links to the shop page filtered ONLY by price (all categories included),
  // so each card shows a mixed-category cluster instead of a single-category product —
  // shoppers must never think "₹199 = mobile only" or "₹799 = fashion only".
  const budgetPills = [
    {
      id: 'tier-199',
      title: 'Under ₹199',
      badge: 'Pocket Bazaar',
      link: '/products?maxPrice=199',
      cluster: [
        { src: '/images/pill_beauty_product.png', label: 'Beauty', slot: 'left' },
        { src: '/images/pill_tech_product.png', label: 'Mobile Accessories', slot: 'center' },
        { src: '/images/pill_kitchen_product.png', label: 'Kitchen', slot: 'right' },
      ],
      bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      borderColor: 'rgba(59, 130, 246, 0.4)',
      shadowColor: 'rgba(59, 130, 246, 0.16)',
      btnColor: '#2563eb',
      badgeColor: '#1d4ed8',
    },
    {
      id: 'tier-499',
      title: 'Under ₹499',
      badge: 'Daily Bazaar',
      link: '/products?maxPrice=499',
      cluster: [
        { src: '/images/pill_model_decor.png', label: 'Home Decor', slot: 'left' },
        { src: '/images/pill_model_kurti.png', label: 'Fashion', slot: 'center' },
        { src: '/images/pill_kitchen_product.png', label: 'Kitchen', slot: 'right' },
      ],
      bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)',
      borderColor: 'rgba(234, 179, 8, 0.4)',
      shadowColor: 'rgba(234, 179, 8, 0.16)',
      btnColor: '#b45309',
      badgeColor: '#b45309',
    },
    {
      id: 'tier-799',
      title: 'Under ₹799',
      badge: 'Style Picks',
      link: '/products?maxPrice=799',
      cluster: [
        { src: '/images/pill_beauty_product.png', label: 'Beauty', slot: 'left' },
        { src: '/images/pill_model_jewellery.png', label: 'Jewellery', slot: 'center' },
        { src: '/images/pill_tech_product.png', label: 'Mobile Accessories', slot: 'right' },
      ],
      bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fae8ff 100%)',
      borderColor: 'rgba(217, 70, 239, 0.4)',
      shadowColor: 'rgba(217, 70, 239, 0.16)',
      btnColor: '#c026d3',
      badgeColor: '#a21caf',
    },
    {
      id: 'tier-luxe',
      title: '₹1,099+ Luxe',
      badge: 'Heritage Special',
      link: '/products?minPrice=1099',
      cluster: [
        { src: '/images/pill_model_jewellery.png', label: 'Jewellery', slot: 'left' },
        { src: '/images/pill_model_saree.png', label: 'Fashion', slot: 'center' },
        { src: '/images/pill_model_decor.png', label: 'Home Decor', slot: 'right' },
      ],
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 50%, #e9d5ff 100%)',
      borderColor: 'rgba(168, 85, 247, 0.4)',
      shadowColor: 'rgba(124, 58, 237, 0.16)',
      btnColor: '#7c3aed',
      badgeColor: '#6d28d9',
    },
  ];

  return (
    <section className={styles.pillSection}>
      {/* ── Section Header ── */}
      <div className={styles.headerWrapper}>
        <h2 className={styles.sectionTitle}>Shop By Budget</h2>

        <p className={styles.sectionSubtitle}>
          Discover handpicked collections curated for every wallet size
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div className={styles.diamondDivider}>
          <div className={styles.dividerLineLeft} />
          <span className={styles.dividerDiamonds}>✦ ❖ ✦</span>
          <div className={styles.dividerLineRight} />
        </div>
      </div>

      {/* ── 4 Capsule Pill Cards (Full-Card Clickable with Tailored Hover Glow) ── */}
      <div className={styles.pillsGrid}>
        {budgetPills.map((card) => (
          <Link
            key={card.id}
            to={card.link}
            className={styles.pillCard}
            aria-label={`${card.title} — ${card.badge}. Shop all categories: ${card.cluster
              .map((c) => c.label)
              .join(', ')} and more`}
            style={{
              '--card-glow': card.shadowColor,
              background: card.bgGradient,
              border: `1.5px solid ${card.borderColor}`,
              boxShadow: `0 12px 28px -6px ${card.shadowColor}`,
            }}
          >
            {/* Left Content Column */}
            <div className={styles.pillContentCol}>
              <span
                className={styles.pillBadgeTag}
                style={{ color: card.badgeColor }}
              >
                All Categories
              </span>

              <h3 className={styles.pillTitle} title={card.title}>
                {card.title}
              </h3>

              {/* White Pill Button (Shop Now ↗) */}
              <div
                className={styles.pillBtn}
                style={{ color: card.btnColor }}
              >
                <span>Shop Now</span>
                <ArrowUpRight size={13} strokeWidth={2.6} className={styles.pillBtnArrow} />
              </div>
            </div>

            {/* Right: mixed-category product cluster popping out over the pill rim */}
            <div className={styles.cutoutCluster} aria-hidden="true">
              {card.cluster.map((item) => (
                <img
                  key={`${card.id}-${item.slot}`}
                  src={item.src}
                  alt=""
                  title={item.label}
                  loading="lazy"
                  className={`${styles.clusterImg} ${styles[`slot_${item.slot}`]}`}
                />
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
