import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Layers, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { getCategoryBySlug } from '../../data';
import { productService } from '../../services/product.service';
import { useCategoryStore } from '../../store/categoryStore';
import styles from './CategorySubcategories.module.css';

// 5 Vibrant Pastel Gradient Themes for Horizontal Capsule Cards (Image 2)
const HORIZONTAL_CAPSULE_THEMES = [
  {
    bgGradient: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 50%, #dbeafe 100%)',
    borderColor: 'rgba(59, 130, 246, 0.45)',
    shadowColor: 'rgba(59, 130, 246, 0.18)',
    btnColor: '#2563eb',
    badgeColor: '#1d4ed8',
    defaultBadge: 'Pocket Bazaar',
  },
  {
    bgGradient: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)',
    borderColor: 'rgba(234, 179, 8, 0.45)',
    shadowColor: 'rgba(234, 179, 8, 0.18)',
    btnColor: '#b45309',
    badgeColor: '#b45309',
    defaultBadge: 'Daily Bazaar',
  },
  {
    bgGradient: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fae8ff 100%)',
    borderColor: 'rgba(217, 70, 239, 0.45)',
    shadowColor: 'rgba(217, 70, 239, 0.18)',
    btnColor: '#c026d3',
    badgeColor: '#a21caf',
    defaultBadge: 'Style Picks',
  },
  {
    bgGradient: 'linear-gradient(135deg, #ede9fe 0%, #f3e8ff 50%, #e9d5ff 100%)',
    borderColor: 'rgba(168, 85, 247, 0.45)',
    shadowColor: 'rgba(124, 58, 237, 0.18)',
    btnColor: '#7c3aed',
    badgeColor: '#6d28d9',
    defaultBadge: 'Heritage Luxe',
  },
  {
    bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #ccfbf1 100%)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    shadowColor: 'rgba(16, 185, 129, 0.18)',
    btnColor: '#059669',
    badgeColor: '#047857',
    defaultBadge: 'Fresh Drop',
  },
];

// Static Hero Showcase Banner matching Image 1 Signature Purple Theme & Transparent PNG
const CategoryHeroBanner = ({ category, categorySlug }) => {
  const normalizedSlug = (categorySlug || category?.slug || '').toLowerCase().trim().replace(/[\s_]+/g, '-');
  const mockCat = getCategoryBySlug(normalizedSlug) || getCategoryBySlug(categorySlug) || category;
  const heroBadge = category?.heroBadge || mockCat?.heroBadge || 'New Collection';
  const heroTitle = category?.heroTitle || mockCat?.heroTitle || 'Find Your Style,\nLove Your Look';
  const heroSubtitle = category?.heroSubtitle || mockCat?.heroSubtitle || 'Discover the latest trends in fashion, beauty, and lifestyle.';
  const heroImage = category?.heroImage || mockCat?.heroImage || '/images/category_hero_fashion.png';
  const heroCta = category?.heroCta || mockCat?.heroCta || 'Shop Now';
  const rawTitle = typeof heroTitle === 'string' ? heroTitle : 'Find Your Style,\nLove Your Look';
  const titleText = rawTitle.replace(/✨/g, '').trim();
  const heroImageSrc = heroImage ? `${heroImage}${heroImage.includes('?') ? '&' : '?'}v=cleanpng` : '/images/category_hero_fashion.png';

  return (
    <div className={styles['hero-banner-card']}>
      {/* Left Column Content */}
      <div className={styles['hero-banner-content']}>
        <div className={styles['hero-pill-badge']}>
          {heroBadge}
        </div>

        <h1 className={styles['hero-banner-title']}>
          {titleText.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < titleText.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </h1>

        <p className={styles['hero-banner-subtitle']}>
          {heroSubtitle}
        </p>

        <div className={styles['hero-action-wrapper']}>
          <Link
            to={`/products?category=${categorySlug || category?._id || ''}`}
            className={styles['hero-shop-button']}
          >
            <span>{heroCta}</span>
            <ArrowRight size={17} strokeWidth={2.4} />
          </Link>
        </div>
      </div>

      {/* Right Column Transparent PNG Model Visual */}
      <div className={styles['hero-model-container']}>
        <img
          src={heroImageSrc}
          alt={titleText.replace('\n', ' ')}
          className={styles['hero-model-png']}
        />
      </div>
    </div>
  );
};

export default function CategorySubcategories() {
  const { slug } = useParams();
  
  // Use global store
  const { categories, subcategories: allSubcategories } = useCategoryStore();
  
  // Find category from store (which is already merged with UI rich data)
  const category = categories.find(c => c.slug === slug);
  
  // Filter subcategories for this category (matching by ID)
  const subcategories = category 
    ? allSubcategories.filter(s => s.categoryId === category._id || s.categoryId?._id === category._id)
    : [];
    
  const [dbProducts, setDbProducts] = useState([]);

  useEffect(() => {
    async function loadCategoryProducts() {
      if (!category) return;
      try {
        const res = await productService.list({
          category: category._id || category.slug,
          limit: 100,
        });
        const items = res?.data?.data || res?.data || [];
        setDbProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        setDbProducts([]);
      }
    }
    loadCategoryProducts();
  }, [category, slug]);

  if (!category) {
    return (
      <PageWrapper>
        <div className="section container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <h2>Category Not Found</h2>
          <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
            The department you are looking for does not exist or has been moved.
          </p>
          <Link to="/categories" className="btn btn-primary" style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Back to All Categories <ArrowRight size={16} />
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={styles['subcat-page-root']}>
        <div className="container">
          {/* Breadcrumbs */}
          <div className={styles['breadcrumbs']}>
            <Link to="/" className={styles['breadcrumb-link']}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/categories" className={styles['breadcrumb-link']}>Categories</Link>
            <ChevronRight size={14} />
            <span className={styles['breadcrumb-active']}>{category.name}</span>
          </div>

          {/* Category Hero Showcase Banner (Image 1 Signature Design) */}
          <CategoryHeroBanner category={category} categorySlug={slug} />

          {/* Sub-Categories Capsule Pill Cards with Section Title */}
          <div className={styles['subcat-container-card']}>
            <div className={styles['subcat-pill-section-header']}>
              <h2 className={styles['subcat-pill-main-title']}>Shop by Category</h2>
              <p className={styles['subcat-pill-subtitle']}>Discover curated collections handpicked for you</p>
            </div>

            {(subcategories || []).length <= 5 ? (
              <div className={`${styles['capsule-pills-grid']} ${(subcategories || []).length <= 3 ? styles['capsule-pills-trio'] : ''}`}>
                {(subcategories || []).map((sub, idx) => {
                  const theme = HORIZONTAL_CAPSULE_THEMES[idx % HORIZONTAL_CAPSULE_THEMES.length];
                  return (
                    <Link
                      key={sub._id || sub.slug}
                      to={`/products?category=${category.slug || category._id}&subCategory=${sub.slug || sub._id}`}
                      className={styles['capsule-pill-card']}
                      style={{
                        background: theme.bgGradient,
                        boxShadow: `0 6px 18px -4px ${theme.shadowColor}`,
                        '--card-glow': theme.shadowColor,
                      }}
                    >
                      {/* Left Content Column: Subcategory Name & Shop Now Button */}
                      <div className={styles['capsule-pill-content']}>
                        <h3 className={styles['capsule-pill-title']} title={sub.name}>
                          {sub.name}
                        </h3>
                        <span
                          className={styles['capsule-pill-btn']}
                          style={{ color: theme.btnColor }}
                        >
                          <span>Shop Now</span>
                          <ArrowUpRight size={11} strokeWidth={2.6} />
                        </span>
                      </div>

                      {/* Right Circular Image (Contained Inside Card) */}
                      <div className={styles['capsule-pill-circle-box']}>
                        <img
                          src={sub.image || category.image}
                          alt={sub.name}
                          className={styles['capsule-pill-circle-img']}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = category.image || '/images/products/saree.png';
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className={styles['vertical-pills-grid']}>
                {(subcategories || []).map((sub) => (
                  <Link
                    key={sub._id || sub.slug}
                    to={`/products?category=${category.slug || category._id}&subCategory=${sub.slug || sub._id}`}
                    className={styles['vertical-pill-card']}
                  >
                    <div className={styles['vertical-pill-circle']}>
                      <img
                        src={sub.image || category.image}
                        alt={sub.name}
                        className={styles['vertical-pill-img']}
                      />
                    </div>
                    <h3 className={styles['vertical-pill-title']} title={sub.name}>
                      {sub.name}
                    </h3>
                    <span className={styles['vertical-pill-count']}>
                      <span>Shop Now</span>
                      <ArrowUpRight size={11} strokeWidth={2.6} />
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Subcategory Showcase Rows: Each Subcategory has 4 Real DB Products + 1 View All Card */}
          {(subcategories || []).map((sub) => {
            const subProducts = dbProducts.filter((p) => {
              const pSub = p.subCategory?._id || p.subCategory?.id || p.subCategory?.slug || p.subCategory;
              return pSub && (pSub === sub._id || pSub === sub.id || pSub === sub.slug);
            }).slice(0, 4);

            if (subProducts.length === 0) return null;

            const targetSubUrl = `/products?category=${category.slug || category._id}&subCategory=${sub.slug || sub._id}`;

            return (
              <div key={sub._id || sub.slug} className={styles['subcat-products-section']}>
                {/* Clean Centered Subcategory Title (All icons, badges, subtext removed) */}
                <div className={styles['subcat-showcase-header']}>
                  <h2 className={styles['subcat-showcase-title']}>{sub.name}</h2>
                </div>

                {/* 5 Cards Grid: 4 Products + 1 View All Card (Exact Same Architecture & Dimensions) */}
                <div className="product-grid-5">
                  {subProducts.map((prod) => (
                    <ProductCard key={prod._id || prod.id} product={prod} />
                  ))}

                  {/* 5th Card: View All Subcategory Tile - Matches Exact ProductCard Architecture & Size */}
                  <Link
                    to={targetSubUrl}
                    className={styles['view-all-product-tile']}
                  >
                    {/* Top Aspect-Ratio Section Matching ref-card-top */}
                    <div className={styles['view-all-tile-top']}>
                      <div className={styles['view-all-circle-icon']}>
                        <ArrowRight size={28} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Bottom Info Section Matching ref-card-body */}
                    <div className={styles['view-all-tile-bottom']}>
                      <div>
                        <span className={styles['view-all-category-tag']}>{category.name}</span>
                        <h3 className={styles['view-all-tile-heading']}>
                          View All {sub.name}
                        </h3>
                        <p className={styles['view-all-tile-subtext']}>
                          Explore the entire curated collection
                        </p>
                      </div>

                      <div className={styles['view-all-action-btn']}>
                        <span>Explore Collection</span>
                        <ArrowRight size={15} strokeWidth={2.5} />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Quick Option to browse full catalog */}
          <div className={styles['catalog-banner']}>
            <p className={styles['catalog-banner-text']}>
              Want to see all {category.name} products with instant filters and sorting?
            </p>
            <Link
              to={`/products?category=${category.slug || category._id}`}
              className={`btn btn-primary ${styles['browse-all-btn']}`}
            >
              Browse All {category.name} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
