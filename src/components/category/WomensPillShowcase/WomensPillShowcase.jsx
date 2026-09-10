import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import styles from './WomensPillShowcase.module.css';

export default function WomensPillShowcase() {
  // 4 Curated Budget Tier Pill Stores with authentic 3D pop-out visuals
  const budgetPills = [
    {
      id: 'tier-199',
      title: 'Under ₹199',
      badge: 'Pocket Bazaar',
      link: '/products?maxPrice=199',
      image: '/images/pill_tech_product.png',
      bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      borderColor: 'rgba(59, 130, 246, 0.4)',
      shadowColor: 'rgba(59, 130, 246, 0.16)',
      btnColor: '#2563eb',
      badgeColor: '#1d4ed8',
      imgHeight: '168px',
      imgBottom: '2px',
      imgRight: '8px',
    },
    {
      id: 'tier-499',
      title: 'Under ₹499',
      badge: 'Daily Bazaar',
      link: '/products?maxPrice=499',
      image: '/images/pill_kitchen_product.png',
      bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)',
      borderColor: 'rgba(234, 179, 8, 0.4)',
      shadowColor: 'rgba(234, 179, 8, 0.16)',
      btnColor: '#b45309',
      badgeColor: '#b45309',
      imgHeight: '164px',
      imgBottom: '4px',
      imgRight: '6px',
    },
    {
      id: 'tier-799',
      title: 'Under ₹799',
      badge: 'Style Picks',
      link: '/products?maxPrice=799',
      image: '/images/pill_model_jewellery.png',
      bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fae8ff 100%)',
      borderColor: 'rgba(217, 70, 239, 0.4)',
      shadowColor: 'rgba(217, 70, 239, 0.16)',
      btnColor: '#c026d3',
      badgeColor: '#a21caf',
      imgHeight: '178px',
      imgBottom: '0px',
      imgRight: '4px',
    },
    {
      id: 'tier-luxe',
      title: '₹1,099+ Luxe',
      badge: 'Heritage Special',
      link: '/products?minPrice=1000',
      image: '/images/pill_model_saree.png',
      bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 50%, #e9d5ff 100%)',
      borderColor: 'rgba(168, 85, 247, 0.4)',
      shadowColor: 'rgba(124, 58, 237, 0.16)',
      btnColor: '#7c3aed',
      badgeColor: '#6d28d9',
      imgHeight: '178px',
      imgBottom: '0px',
      imgRight: '4px',
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
                {card.badge}
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

            {/* Right Cutout Image: Popping out over the top rim of the pill card! */}
            <div
              className={styles.cutoutContainer}
              style={{
                right: card.imgRight || '6px',
                bottom: card.imgBottom || '0px',
                height: card.imgHeight || '175px',
                width: '135px',
              }}
            >
              <img
                src={card.image}
                alt={card.title}
                className={styles.cutoutImg}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
