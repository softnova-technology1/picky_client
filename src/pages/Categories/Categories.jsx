import React, { useState, useEffect, useMemo } from 'react';
import PageWrapper from '../../components/layout/PageWrapper';
import CategoryHeroCarousel from '../../components/category/CategoryHeroCarousel';
import WomensPillShowcase from '../../components/category/WomensPillShowcase';
import GlamicsCategoryPills from '../../components/category/GlamicsCategoryPills';
import CategoryBudgetStore from '../../components/category/CategoryBudgetStore';
import CategoryFeaturedDrops from '../../components/category/CategoryFeaturedDrops';
import CategoryPromoBanner from '../../components/category/CategoryPromoBanner';
import CategoryRecommendedDrops from '../../components/category/CategoryRecommendedDrops';
import { useCategoryStore } from '../../store/categoryStore';
import { usePageCustomization } from '../../store/customizationStore';
import { Sparkles } from 'lucide-react';

export default function Categories() {
  const { sections, isEnabled, getSetting } = usePageCustomization('categories');
  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Active DB categories ordered by the admin-defined sortOrder
  const orderedCategories = useMemo(
    () =>
      categories
        .filter((cat) => cat.isActive !== false)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories]
  );

  // First 5 DB categories are featured in the Top Categories section
  const featuredCategories = useMemo(() => orderedCategories.slice(0, 5), [orderedCategories]);

  // Section Renderers Map
  const sectionRenderers = {
    categories_hero: () => isEnabled('categories_hero') && (
      <section
        key="categories_hero"
        aria-label="Categories Hero Showcase"
        style={{
          width: '100%',
          height: 'calc(100vh - 90px)',
          minHeight: '620px',
          padding: '0.75rem clamp(1rem, 2.5vw, 2.5rem) 1.25rem',
          marginBottom: '2.5rem',
          boxSizing: 'border-box',
        }}
      >
        <CategoryHeroCarousel categories={categories} />
      </section>
    ),
    categories_budget_store: () => isEnabled('categories_budget_store') && (
      <WomensPillShowcase key="categories_budget_store" />
    ),
    categories_top_categories: () => isEnabled('categories_top_categories') && (
      <CategoryBudgetStore key="categories_top_categories" categories={featuredCategories} />
    ),
    categories_pills: () => isEnabled('categories_pills') && (
      <section key="categories_pills" className="explore-more-categories-section" style={{ marginBottom: '4.5rem' }}>
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
            {getSetting('categories_pills', 'title', 'Explore More Categories')}
          </h2>

          <p
            style={{
              fontSize: '0.92rem',
              color: '#64748b',
              margin: '0 0 0.85rem',
              fontWeight: 500,
            }}
          >
            {getSetting('categories_pills', 'subtitle', 'Curated Tamil heritage, gourmet snacks, beauty rituals & living essentials')}
          </p>

          {/* Decorative Diamond Ornament Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, transparent, #c084fc)' }} />
            <span style={{ color: '#7c3aed', fontSize: '0.75rem' }}>✦ ❖ ✦</span>
            <div style={{ width: '45px', height: '1.5px', background: 'linear-gradient(90deg, #c084fc, transparent)' }} />
          </div>
        </div>

        <GlamicsCategoryPills categories={orderedCategories} />
      </section>
    ),
    categories_recommended_drops: () => isEnabled('categories_recommended_drops') && (
      <CategoryRecommendedDrops key="categories_recommended_drops" />
    ),
    categories_featured_drops: () => isEnabled('categories_featured_drops') && (
      <CategoryFeaturedDrops key="categories_featured_drops" />
    ),
    categories_promo_banner: () => isEnabled('categories_promo_banner') && (
      <CategoryPromoBanner key="categories_promo_banner" />
    ),
  };

  const activeSectionsList = Array.isArray(sections) && sections.length > 0
    ? sections
    : [
        { id: 'categories_hero' },
        { id: 'categories_budget_store' },
        { id: 'categories_top_categories' },
        { id: 'categories_pills' },
        { id: 'categories_recommended_drops' },
        { id: 'categories_featured_drops' },
        { id: 'categories_promo_banner' },
      ];

  return (
    <PageWrapper>
      <div
        style={{
          background: 'linear-gradient(180deg, #f7f4fc 0%, #f9f7fd 50%, #ffffff 100%)',
          minHeight: '100vh',
          paddingBottom: '6rem',
        }}
      >
        {activeSectionsList.map((sec) => {
          const renderFn = sectionRenderers[sec.id];
          if (!renderFn) return null;
          if (sec.id === 'categories_hero') {
            return <React.Fragment key={sec.id}>{renderFn()}</React.Fragment>;
          }
          return (
            <div key={sec.id} className="container">
              {renderFn()}
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}
