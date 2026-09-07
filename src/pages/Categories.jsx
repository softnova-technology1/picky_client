import React, { useState, useMemo } from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import CategoryHeroCarousel from '../components/category/CategoryHeroCarousel';
import WomensPillShowcase from '../components/category/WomensPillShowcase';
import GlamicsCategoryPills from '../components/category/GlamicsCategoryPills';
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

          {/* ── 3. Balance 6 Categories Quick Access Bar ── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#7c3aed',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <Sparkles size={16} />
                <span>Explore More Departments ({balance6Categories.length})</span>
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#64748b',
                }}
              >
                Curated Tamil & Lifestyle Essentials
              </span>
            </div>
            <GlamicsCategoryPills categories={balance6Categories} />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
