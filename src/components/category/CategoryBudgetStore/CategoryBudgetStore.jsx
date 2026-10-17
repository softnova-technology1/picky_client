import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useCategoryStore } from '../../../store/categoryStore';
import { productService } from '../../../services/product.service';
import styles from './CategoryBudgetStore.module.css';

const formatRupees = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const matchesCategory = (sub, cat) => {
  const ref = sub.categoryId;
  const id = typeof ref === 'string' ? ref : ref?._id;
  const slug = typeof ref === 'object' ? ref?.slug : '';
  return (id && String(id) === String(cat._id)) || (slug && slug === cat.slug);
};

// Subtle ambient card aura tailored by department palette
const DEPARTMENT_THEMES = {
  'womens-fashion': {
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.28)',
    badgeLabel: 'FLAGSHIP ATELIER',
    borderHue: 'rgba(192, 132, 252, 0.4)',
  },
  'home-kitchen': {
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.22)',
    badgeLabel: 'CULINARY & LIVING',
    borderHue: 'rgba(251, 191, 36, 0.4)',
  },
  'artificial-jewellery': {
    accent: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.24)',
    badgeLabel: 'ROYAL ADORNMENTS',
    borderHue: 'rgba(244, 114, 182, 0.4)',
  },
  'beauty-personal-care': {
    accent: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.22)',
    badgeLabel: 'BEAUTY RITUALS',
    borderHue: 'rgba(251, 113, 133, 0.4)',
  },
  'mobile-accessories': {
    accent: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.24)',
    badgeLabel: 'SMART TECH & AUDIO',
    borderHue: 'rgba(56, 189, 248, 0.4)',
  },
};

/**
 * Top Categories — Luxury Editorial Bento Grid.
 * Fully database-driven:
 *  • categories     → from DB (ordered by sortOrder)
 *  • subcategories  → from DB (/subcategories)
 *  • live stock & "From ₹" → live queried from DB (/products)
 */
export default function CategoryBudgetStore({ categories = [] }) {
  const subcategories = useCategoryStore((s) => s.subcategories);
  const [stats, setStats] = useState(null);

  const slugKey = categories.map((c) => c.slug).join('|');

  useEffect(() => {
    if (!categories.length) return undefined;
    let alive = true;
    setStats(null);

    Promise.all(
      categories.map(async (cat) => {
        try {
          const res = await productService.list({ category: cat.slug, sort: 'price_asc', limit: 1 });
          const first = Array.isArray(res?.data) ? res.data[0] : null;
          const count = res?.pagination?.total ?? (first ? 1 : 0);
          const from = first ? Number(first.discountPrice || first.price) : null;
          return [cat.slug, { count, from }];
        } catch (_) {
          return [cat.slug, null];
        }
      })
    ).then((entries) => {
      if (alive) setStats(Object.fromEntries(entries));
    });

    return () => {
      alive = false;
    };
  }, [slugKey]);

  const items = useMemo(
    () =>
      categories.map((cat, idx) => ({
        ...cat,
        indexNum: String(idx + 1).padStart(2, '0'),
        theme: DEPARTMENT_THEMES[cat.slug] || {
          accent: '#8b5cf6',
          glow: 'rgba(139, 92, 246, 0.22)',
          badgeLabel: `DEPARTMENT ${String(idx + 1).padStart(2, '0')}`,
          borderHue: 'rgba(167, 139, 250, 0.35)',
        },
        subs: subcategories
          .filter((s) => s.status !== 'inactive' && matchesCategory(s, cat))
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)),
      })),
    [categories, subcategories]
  );

  if (!items.length) return null;

  const [featured, ...rest] = items;

  const renderStats = (cat, isFeatured = false) => {
    if (stats === null) return <span className={styles.statSkeleton} aria-hidden="true" />;
    const s = stats[cat.slug];
    if (!s) return null;
    if (!s.count) {
      return (
        <span className={styles.badgeComingSoon}>
          <Sparkles size={11} strokeWidth={2.4} /> Next Drop Soon
        </span>
      );
    }
    return (
      <div className={styles.stockPillGroup}>
        <span className={styles.badgeInStock}>
          <span className={styles.livePulseDot} />
          {s.count} {s.count === 1 ? 'Design' : 'Designs'}
        </span>
        {s.from ? (
          <span className={styles.badgePriceTag}>
            <Tag size={11} strokeWidth={2.5} /> From {formatRupees(s.from)}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <section className={styles.departmentsSection} aria-labelledby="top-categories-title">
      {/* ── Editorial Header ── */}
      <div className={styles.headerWrapper}>
        <div className={styles.headerEyebrow}>
          <span className={styles.eyebrowLine} />
          <span className={styles.eyebrowText}>CURATED DEPARTMENTS • 2026 EDITION</span>
          <span className={styles.eyebrowLine} />
        </div>

        <h2 id="top-categories-title" className={styles.sectionTitle}>
          Top <span className={styles.titleGradient}>Categories</span>
        </h2>

        <p className={styles.sectionSubtitle}>
          Discover authentic handpicked craftsmanship, ethnic elegance & everyday essentials directly from our artisans.
        </p>

        <div className={styles.diamondDivider}>
          <div className={styles.dividerLineLeft} />
          <span className={styles.dividerDiamonds}>✦ ❖ ✦</span>
          <div className={styles.dividerLineRight} />
        </div>
      </div>

      {/* ── Luxury Master Bento Grid ── */}
      <div className={styles.layout}>
        {/* ── 01: HERO FEATURED SHOWCASE CARD ── */}
        <article
          className={styles.featuredCard}
          style={{
            '--theme-glow': featured.theme.glow,
            '--theme-accent': featured.theme.accent,
          }}
        >
          {/* Full-Bleed Photographic Atmosphere */}
          <div className={styles.mediaContainer}>
            {featured.image ? (
              <img
                src={featured.image}
                alt={featured.name}
                className={styles.mediaPhoto}
                loading="lazy"
              />
            ) : (
              <div className={styles.mediaFallback}>
                <Layers size={52} strokeWidth={1.2} />
              </div>
            )}
            <div className={styles.cinematicVignette} />
            <div className={styles.shimmerSweep} />
          </div>

          {/* Top Overlaid Metadata Bar */}
          <div className={styles.cardTopBar}>
            <div className={styles.frostedIndexBadge}>
              <span className={styles.indexNum}>№ {featured.indexNum}</span>
              <span className={styles.indexSep}>•</span>
              <span className={styles.indexName}>{featured.theme.badgeLabel}</span>
            </div>

            <Link
              to={`/categories/${featured.slug}`}
              className={styles.tactileArrowBtn}
              aria-label={`Explore ${featured.name}`}
            >
              <ArrowUpRight size={17} strokeWidth={2.6} className={styles.arrowIcon} />
            </Link>
          </div>

          {/* Floating Glassmorphic Atelier Plinth */}
          <div className={styles.floatingGlassPlinth}>
            <div className={styles.plinthHeader}>
              <div className={styles.titleStack}>
                <span className={styles.categorySuper}>Featured Department</span>
                <h3 className={styles.featuredTitle}>
                  <Link to={`/categories/${featured.slug}`} className={styles.titleLink}>
                    {featured.name}
                  </Link>
                </h3>
              </div>
              <div className={styles.featuredStatsBox}>
                {renderStats(featured, true)}
              </div>
            </div>

            {featured.description && (
              <p className={styles.featuredDesc}>{featured.description}</p>
            )}

            {/* Couture Subcategory Tags */}
            {featured.subs.length > 0 && (
              <div className={styles.coutureTagsRow}>
                <span className={styles.tagsLabel}>Curated:</span>
                <div className={styles.tagsScroll}>
                  {featured.subs.slice(0, 6).map((sub) => (
                    <Link
                      key={sub._id || sub.slug}
                      to={`/categories/${featured.slug}/${sub.slug}`}
                      className={styles.coutureTag}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Magnetic CTA Bar */}
            <div className={styles.plinthFooter}>
              <Link to={`/categories/${featured.slug}`} className={styles.luxuryCtaBtn}>
                <span>Explore Full Collection</span>
                <ArrowRight size={15} strokeWidth={2.4} className={styles.ctaArrow} />
              </Link>

              <span className={styles.curatedGuarantee}>
                ✓ 100% Quality Inspected
              </span>
            </div>
          </div>
        </article>

        {/* ── 02-05: 4 COMPANION DEPARTMENT CARDS (2x2 GRID) ── */}
        <div className={styles.companionGrid}>
          {rest.map((cat) => (
            <article
              key={cat._id || cat.slug}
              className={styles.companionCard}
              style={{
                '--theme-glow': cat.theme.glow,
                '--theme-accent': cat.theme.accent,
              }}
            >
              {/* Full-Bleed Visual Canvas */}
              <div className={styles.mediaContainer}>
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className={styles.mediaPhoto}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.mediaFallback}>
                    <Layers size={36} strokeWidth={1.3} />
                  </div>
                )}
                <div className={styles.companionVignette} />
                <div className={styles.shimmerSweep} />
              </div>

              {/* Floating Top Header Badges */}
              <div className={styles.cardTopBar}>
                <div className={styles.frostedIndexBadgeSmall}>
                  <span className={styles.indexNum}>№ {cat.indexNum}</span>
                  <span className={styles.indexSep}>•</span>
                  <span className={styles.indexName}>{cat.theme.badgeLabel}</span>
                </div>

                <Link
                  to={`/categories/${cat.slug}`}
                  className={styles.tactileArrowBtnSmall}
                  aria-label={`Explore ${cat.name}`}
                >
                  <ArrowUpRight size={15} strokeWidth={2.6} className={styles.arrowIcon} />
                </Link>
              </div>

              {/* Floating Glass Dock */}
              <div className={styles.companionGlassDock}>
                <div className={styles.companionDockTop}>
                  <h3 className={styles.companionTitle}>
                    <Link to={`/categories/${cat.slug}`} className={styles.titleLink}>
                      {cat.name}
                    </Link>
                  </h3>
                  <div className={styles.companionStats}>
                    {renderStats(cat)}
                  </div>
                </div>

                {cat.description && (
                  <p className={styles.companionDesc}>{cat.description}</p>
                )}

                <div className={styles.companionFooter}>
                  <Link to={`/categories/${cat.slug}`} className={styles.quickExploreLink}>
                    <span>View Department</span>
                    <ArrowUpRight size={13} strokeWidth={2.5} />
                  </Link>

                  {cat.subs.length > 0 && (
                    <span className={styles.subCountIndicator}>
                      {cat.subs.length} sub-ranges
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
