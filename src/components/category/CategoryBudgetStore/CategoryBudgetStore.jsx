import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import styles from './CategoryBudgetStore.module.css';

export default function CategoryBudgetStore() {
  // Top 4 Flagship Store Categories in Cinematic Asymmetrical Bento Grid
  const categoryCards = [
    {
      id: 'cat-fashion',
      tag: "FLAGSHIP • WOMEN'S FASHION",
      title: 'Elegance in Every Thread',
      subtext: 'Handloom Sungudi silks, embroidered festive Anarkalis & breathable cotton kurtis.',
      btnLabel: 'Explore Fashion',
      link: '/categories/fashion',
      isWide: true,
      badgeBg: 'rgba(168, 85, 247, 0.28)',
      badgeColor: '#f3e8ff',
      badgeBorder: 'rgba(192, 132, 252, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.22) 45%, rgba(15, 23, 42, 0.92) 100%)',
      image: '/images/top_category_fashion.jpg',
      objectPosition: 'center 30%',
    },
    {
      id: 'cat-mobile-accessories',
      tag: 'SMART TECH • MOBILE ESSENTIALS',
      title: 'Smart Tech & Sound',
      subtext: '65W fast chargers, braided cables & noise-cancelling wireless audio.',
      btnLabel: 'Explore Tech',
      link: '/categories/mobile-accessories',
      isWide: false,
      badgeBg: 'rgba(59, 130, 246, 0.28)',
      badgeColor: '#dbeafe',
      badgeBorder: 'rgba(96, 165, 250, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.25) 45%, rgba(15, 23, 42, 0.92) 100%)',
      image: '/images/top_category_tech.jpg',
      objectPosition: 'center center',
    },
    {
      id: 'cat-artificial-jewellery',
      tag: 'TEMPLE & BRIDAL • JEWELLERY',
      title: 'Timeless Festive Jewellery',
      subtext: 'Goddess Lakshmi carved chokers, kemp stone bell jhumkas & antique bridal sets.',
      btnLabel: 'Explore Jewellery',
      link: '/categories/artificial-jewellery',
      isWide: false,
      badgeBg: 'rgba(217, 70, 239, 0.28)',
      badgeColor: '#fae8ff',
      badgeBorder: 'rgba(232, 121, 249, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.22) 45%, rgba(15, 23, 42, 0.92) 100%)',
      image: '/images/top_category_jewellery.jpg',
      objectPosition: 'center center',
    },
    {
      id: 'cat-home-kitchen',
      tag: 'CULINARY & LIVING • HOME & KITCHEN',
      title: 'Authentic Cookware & Modern Living',
      subtext: 'Pre-seasoned heavy cast iron kadais, multi-blade quick choppers & copper dining sets.',
      btnLabel: 'Explore Kitchen',
      link: '/categories/home-kitchen',
      isWide: true,
      badgeBg: 'rgba(234, 179, 8, 0.28)',
      badgeColor: '#fef08a',
      badgeBorder: 'rgba(250, 204, 21, 0.45)',
      scrimGradient:
        'linear-gradient(to bottom, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.25) 45%, rgba(15, 23, 42, 0.92) 100%)',
      image: '/images/top_category_kitchen.jpg',
      objectPosition: 'center 38%',
    },
  ];

  return (
    <section className={styles.departmentsSection}>
      {/* ── Section Header (Centered) ── */}
      <div className={styles.headerWrapper}>
        <h2 className={styles.sectionTitle}>Top Categories</h2>

        <p className={styles.sectionSubtitle}>
          Explore our top flagship lifestyle, ethnic & living collections
        </p>

        {/* Decorative Diamond Ornament Divider */}
        <div className={styles.diamondDivider}>
          <div className={styles.dividerLineLeft} />
          <span className={styles.dividerDiamonds}>✦ ❖ ✦</span>
          <div className={styles.dividerLineRight} />
        </div>
      </div>

      {/* ── Alternating 4-Card Asymmetrical Bento Grid ── */}
      <div className={styles.bentoGrid}>
        {categoryCards.map((card) => (
          <Link
            key={card.id}
            to={card.link}
            className={`${styles.bentoCard} ${card.isWide ? styles.bentoWide : styles.bentoCompact}`}
          >
            {/* Full Photographic Background */}
            <div className={styles.photoWrapper}>
              <img
                src={card.image}
                alt={card.title}
                className={styles.bgPhoto}
                style={{ objectPosition: card.objectPosition || 'center center' }}
                loading="lazy"
              />
              {/* Contrast-enhancing directional scrim overlay */}
              <div
                className={styles.scrimOverlay}
                style={{ background: card.scrimGradient }}
              />
            </div>

            {/* Top Row: Floating Frosted Pill Badge */}
            <div className={styles.topRow}>
              <div
                className={styles.frostedBadge}
                style={{
                  background: card.badgeBg,
                  borderColor: card.badgeBorder,
                  color: card.badgeColor,
                }}
              >
                {card.tag}
              </div>
            </div>

            {/* Bottom Row: Typography & Signature Tactile White Button */}
            <div className={styles.bottomContent}>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardSubtext}>{card.subtext}</p>

              <div className={styles.whiteBtn}>
                <span>{card.btnLabel}</span>
                <ArrowUpRight size={16} strokeWidth={2.8} className={styles.btnArrow} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
