import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Layers, ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { getCategoryBySlug, getProducts } from '../../data';
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
  const heroBadge = mockCat?.heroBadge || category?.heroBadge || 'New Collection';
  const heroTitle = mockCat?.heroTitle || category?.heroTitle || 'Find Your Style,\nLove Your Look';
  const heroSubtitle = mockCat?.heroSubtitle || category?.heroSubtitle || 'Discover the latest trends in fashion, beauty, and lifestyle.';
  const heroImage = mockCat?.heroImage || category?.heroImage || '/images/category_hero_fashion.png';
  const heroCta = mockCat?.heroCta || category?.heroCta || 'Shop Now';
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

// High-definition diverse gallery images for subcategory showcases
const SUBCAT_GALLERY_IMAGES = {
  'hair-accessories': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500',
    'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=500',
    'https://images.unsplash.com/photo-1608248597359-59754f9a37e9?w=500',
  ],
  'skincare': [
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500',
    'https://images.unsplash.com/photo-1608248597359-59754f9a37e9?w=500',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500',
  ],
  'herbal-products': [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500',
    'https://images.unsplash.com/photo-1608248597359-59754f9a37e9?w=500',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500',
  ],
  'sarees': [
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500',
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500',
    'https://images.unsplash.com/photo-1610030469857-897dbfcbebf6?w=500',
  ],
  'kurtis': [
    'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500',
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500',
    'https://images.unsplash.com/photo-1608248597359-59754f9a37e9?w=500',
  ],
  'dresses': [
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500',
    'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=500',
  ],
  'tops': [
    'https://images.unsplash.com/photo-1564257631407-4deb129965a2?w=500',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500',
  ],
  't-shirts': [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500',
    'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=500',
  ],
  'pants': [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500',
  ],
  'pant': [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500',
    'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500',
    'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=500',
  ],
};

const SUBCAT_SAMPLE_NAMES = {
  'hair-accessories': [
    'Silk Satin Scrunchie Pack',
    'Pearl Encrusted Hair Claw',
    'Velvet Bow Hair Barrette',
    'Crystal Embellished Headband'
  ],
  'skincare': [
    'Luminous Hydrating Face Serum',
    'Rejuvenating Night Repair Cream',
    'Gentle Rosewater Purifying Foam',
    'Botanical Glow Radiance Oil'
  ],
  'herbal-products': [
    'Ayurvedic Hair Scalp Elixir',
    'Organic Neem Clarifying Gel',
    'Herbal Ubtan Glow Clay Mask',
    'Pure Cold-Pressed Almond Oil'
  ],
  'pants': [
    'Cotton Straight Fit Cigarette Pant',
    'Lycra Ankle-Length Stretchable Pant',
    'Ethnic Solid Rayon Palazzo Pant',
    'Casual Formal High-Waist Pant'
  ],
  'pant': [
    'Cotton Straight Fit Cigarette Pant',
    'Lycra Ankle-Length Stretchable Pant',
    'Ethnic Solid Rayon Palazzo Pant',
    'Casual Formal High-Waist Pant'
  ],
};

// Helper to reliably retrieve 4 mock products for any subcategory
const getProductsForSubcategory = (cat, sub) => {
  const catSlug = (cat?.slug || '').toLowerCase();
  const subSlug = (sub?.slug || '').toLowerCase();

  const matches = getProducts({
    category: catSlug,
    subCategory: subSlug,
  });

  if (matches && matches.length >= 4) {
    return matches.slice(0, 4);
  }

  const existing = matches || [];
  return existing;
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
    
  const [categoryProducts, setCategoryProducts] = useState(() => getProducts({ category: slug, limit: 4 }));

  useEffect(() => {
    // If you want to dynamically fetch products based on category ID, you could do it here.
    // For now, we leave the mock fallback products for subcategories so the UI doesn't crash completely
    // but the user only wanted NO dummy data on homepage categories.
    // If they want NO dummy products here either, set categoryProducts to [].
  }, [slug]);

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

          {/* Subcategory Showcase Rows: Each Subcategory has 4 Products + 1 View All Card */}
          {(subcategories || []).map((sub) => {
            const subProducts = getProductsForSubcategory(category, sub);
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
