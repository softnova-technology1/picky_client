import React, { useState, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CategoryHeroCarousel from '../components/category/CategoryHeroCarousel';
import WomensPillShowcase from '../components/category/WomensPillShowcase';
import GlamicsCategoryPills from '../components/category/GlamicsCategoryPills';
import CategoryBudgetStore from '../components/category/CategoryBudgetStore';
import CategoryFeaturedDrops from '../components/category/CategoryFeaturedDrops';
import CategoryPromoBanner from '../components/category/CategoryPromoBanner';
import CategoryRecommendedDrops from '../components/category/CategoryRecommendedDrops';
import CategoryTrustStrip from '../components/category/CategoryTrustStrip';
import { MOCK_CATEGORIES } from '../data/adminMockData';
import { Sparkles } from 'lucide-react';

export default function Categories() {
  // Use mock data from adminMockData.js
  const [categories] = useState(MOCK_CATEGORIES);

  // Top 4 categories are featured in the top pill showcase
  const top4Slugs = useMemo(
    () => ['womens-fashion', 'artificial-jewellery', 'mobile-accessories', 'home-kitchen'],
    []
  );

  // Remaining 6 categories for the quick access section below
  const balance6Categories = useMemo(() => {
    return categories.filter((cat) => !top4Slugs.includes(cat.slug));
  }, [categories, top4Slugs]);

  return (
    <PageWrapper>
      <div
        style={{
          background: 'radial-gradient(ellipse 90% 45% at 50% 10%, rgba(245, 238, 255, 0.75) 0%, rgba(255, 255, 255, 0) 100%), #ffffff',
          minHeight: '100vh',
          paddingBottom: '6rem',
        }}
      >
        {/* ── 1. Full-Width Glamics-Style Master Hero Section ── */}
        <section
          aria-label="Categories Hero Showcase"
          style={{
            width: '100%',
            padding: '1rem clamp(1rem, 2.5vw, 2.5rem) 2.5rem',
            marginBottom: '2rem',
          }}
        >
          <CategoryHeroCarousel categories={categories} />
        </section>

        <div className="container">
          {/* ── 2. Exclusive 4-Pill Showcase (Exact UI with Top-Right 3D Cutout Pop-Out) ── */}
          <WomensPillShowcase />

          {/* ── 3. Explore More Categories Section ── */}
          <section className="explore-more-categories-section" style={{ marginBottom: '4.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)',
                  fontWeight: 900,
                  color: '#1e1b4b',
                  margin: '0 0 0.35rem',
                  letterSpacing: '-0.025em',
                }}
              >
                Explore More Categories
              </h2>

              <p
                style={{
                  fontSize: '0.92rem',
                  color: '#64748b',
                  margin: '0 0 0.85rem',
                  fontWeight: 500,
                }}
              >
                Curated Tamil heritage, gourmet snacks, beauty rituals & living essentials
              </p>

              {/* Decorative Diamond Ornament Divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
                <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
                <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
              </div>
            </div>

            <GlamicsCategoryPills categories={balance6Categories} />
          </section>

          {/* ── 4. Shop By Budget: 4 Interactive Tier Cards ── */}
          <CategoryBudgetStore />

          {/* ── 5. Top Products: 1 Row of 4 Lumina Product Cards ── */}
          <CategoryFeaturedDrops />

          {/* ── 6. Mega Deal & Coupon Spotlight Banner (Up to 60% OFF + Click to Copy) ── */}
          <CategoryPromoBanner />

          {/* ── 7. Most Recommended Products: 1 Row of 4 Lumina Product Cards ── */}
          <CategoryRecommendedDrops />

          {/* ── 8. Customer Assurance Trust Strip (4 Floating Quality Guarantee Pillars) ── */}
          <CategoryTrustStrip />
        </div>
      </div>
    </PageWrapper>
  );
}
