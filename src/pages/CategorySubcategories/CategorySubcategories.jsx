import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, ChevronRight, ArrowLeft, ShoppingCart, Layers, ArrowRight } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper/PageWrapper';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import { categoryService } from '../../services/category.service';
import { getCategoryBySlug, getSubcategoriesByCategory, getProducts } from '../../data';
import styles from './CategorySubcategories.module.css';

// Curated Flipkart-Style Category-Specific Mini Carousel Banners
const CATEGORY_MINI_BANNERS = {
  'womens-fashion': [
    {
      badge: 'FESTIVE SPECIAL',
      title: 'Handloom Sungudi & Silk Sarees',
      subtitle: 'Flat 35% OFF on Pure Combed Cotton Weaves',
      code: 'SUNGUDI35',
      accent: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'NEW ARRIVALS 2026',
      title: 'Embroidered Rayon Anarkali Sets',
      subtitle: 'Extra ₹200 OFF on Orders Above ₹1,499',
      code: 'ANARKALI200',
      accent: 'linear-gradient(135deg, #be185d 0%, #ec4899 100%)',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'DAILY ESSENTIALS',
      title: 'Soft Cotton Leggings & Dupattas',
      subtitle: 'Starting from ₹199 • 100% Breathable Fit',
      code: 'DAILYWEAR',
      accent: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'home-kitchen': [
    {
      badge: 'KITCHEN HACKS',
      title: 'Quick Multi-Blade Vegetable Choppers',
      subtitle: 'Save 45% Time in Daily Cooking Prep',
      code: 'CHOP45',
      accent: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'HEALTHY COOKWARE',
      title: 'Pre-Seasoned Heavy Cast Iron Kadais',
      subtitle: '100% Natural Organic Oil Seasoning',
      code: 'CASTIRON',
      accent: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'SMART STORAGE',
      title: 'BPA-Free Airtight Pantry Containers',
      subtitle: 'Keep Spices & Pulses Fresh For Months',
      code: 'FRESHBOX',
      accent: 'linear-gradient(135deg, #4d7c0f 0%, #84cc16 100%)',
      image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'artificial-jewellery': [
    {
      badge: 'TEMPLE JEWELRY',
      title: 'Antique Matte Gold Lakshmi Choker Sets',
      subtitle: 'Carved Ruby Kemp Stones • Up to 50% OFF',
      code: 'KEMP50',
      accent: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'TRENDING JHUMKAS',
      title: 'Kemp Pearl Bell Dome Jhumka Earrings',
      subtitle: 'Lightweight Festive Polish • Starts @ ₹499',
      code: 'JHUMKA',
      accent: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
      image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'BRIDAL COLLECTION',
      title: '24K Micro Gold Plated Peacock Kasu Mala',
      subtitle: 'Heritage Coin Motif with Adjustable Dori',
      code: 'BRIDALMALA',
      accent: 'linear-gradient(135deg, #b91c1c 0%, #f87171 100%)',
      image: 'https://images.unsplash.com/photo-1611591475822-79f939316666?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'beauty-personal-care': [
    {
      badge: 'HERBAL CARE',
      title: 'Rosemary & Bhringraj Dense Hair Growth Oil',
      subtitle: '100% Pure Cold-Pressed Coconut Oil Base',
      code: 'HERBALOIL',
      accent: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      image: 'https://images.unsplash.com/photo-1608248597359-2ff6112f45c8?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'HAIR LUXURY',
      title: 'Pure Mulberry Silk Satin Scrunchies Pack',
      subtitle: 'Zero Frizz • Anti-Hair Breakage Night Care',
      code: 'SILKSCRUNCH',
      accent: 'linear-gradient(135deg, #db2777 0%, #f472b6 100%)',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'GLOWING SKIN',
      title: 'Natural Kumkumadi Ayurvedic Face Serums',
      subtitle: 'Deep Hydration & Radiance Booster',
      code: 'GLOWSERUM',
      accent: 'linear-gradient(135deg, #9333ea 0%, #c084fc 100%)',
      image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'mobile-accessories': [
    {
      badge: 'FAST CHARGING',
      title: 'Heavy Duty 65W Braided Type-C Cables',
      subtitle: 'Tough Nylon Braid • 480Mbps Data Speed',
      code: 'FAST65W',
      accent: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'HI-FI AUDIO',
      title: 'Studio Pro ANC Wireless Over-Ear Headphones',
      subtitle: '30dB Active Noise Cancellation • 40h Battery',
      code: 'STUDIOANC',
      accent: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'DESK ACCESSORY',
      title: 'Aluminium Adjustable Phone & Tablet Stands',
      subtitle: '270° Dual Rotation • Anti-Slip Alloy Base',
      code: 'ALUSTAND',
      accent: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'traditional-tamil-products': [
    {
      badge: 'AUTHENTIC TAMIL',
      title: 'Nachiarkoil Solid Brass Mayil Kuthu Vilakku',
      subtitle: '100% Solid Heavy Virgin Brass • Artisan Crafted',
      code: 'BRASSDEEPAM',
      accent: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      image: 'https://images.unsplash.com/photo-1609137144822-26155986ec32?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'HERITAGE CRAFT',
      title: 'Tanjore Lakshmi Gold Foil Relief Wall Art',
      subtitle: 'Handcrafted Heritage Gifts for Auspicious Moments',
      code: 'TANJORE',
      accent: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)',
      image: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'MADURAI WEAVES',
      title: 'Authentic Pure Cotton Tie-Dye Sungudi Sarees',
      subtitle: 'Traditional Zari Border • Made in Tamil Nadu',
      code: 'MADURAICOTTON',
      accent: 'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'snacks-foods': [
    {
      badge: 'FRESH & CRUNCHY',
      title: 'Authentic Manapparai Rice Murukku Jars',
      subtitle: 'Cold-Pressed Groundnut Oil • Zero Palm Oil',
      code: 'MURUKKU',
      accent: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'NATIVE SWEETS',
      title: 'Tirunelveli Pure Desi Ghee Wheat Halwa',
      subtitle: 'Melt-In-Mouth Slow Cooked Recipe',
      code: 'HALWA',
      accent: 'linear-gradient(135deg, #9a3412 0%, #ea580c 100%)',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'HOMEMADE PODI',
      title: 'Spicy Garlic Idli Karapodi & South Pickles',
      subtitle: 'Roasted Lentils & Guntur Chillies',
      code: 'KARAPODI',
      accent: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'home-decor': [
    {
      badge: 'AESTHETIC LIVING',
      title: 'Solid Pine Wood Tripod Floor & Table Lamps',
      subtitle: '3000K Warm Golden Eye-Protecting Glow',
      code: 'WARMLIGHT',
      accent: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'NORDIC VIBES',
      title: 'Minimalist Fluted Ceramic Vases & Pots',
      subtitle: 'Stone-Matte Tactile Finish for Pampas & Florals',
      code: 'CERAMIC',
      accent: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
      image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'GREEN LIVING',
      title: 'Artificial Plants with Natural Jute Hangers',
      subtitle: 'Zero Maintenance Balcony & Room Greenery',
      code: 'PLANTS',
      accent: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'kids-products': [
    {
      badge: 'SCREEN-FREE FUN',
      title: 'Montessori Educational Wooden Shape Toys',
      subtitle: 'Smooth Organic Pine • Non-Toxic Water Paint',
      code: 'TOYS',
      accent: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
      image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'SPEECH THERAPY',
      title: 'Smart Talking Flashcards Card Readers',
      subtitle: '112 Double-Sided Cards (224 Words & Sounds)',
      code: 'FLASHCARDS',
      accent: 'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
      image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'BACK TO SCHOOL',
      title: 'Cute School Accessories & Water Bottles',
      subtitle: 'BPA-Free Leakproof Insulated Flasks',
      code: 'SCHOOLPACK',
      accent: 'linear-gradient(135deg, #db2777 0%, #fb7185 100%)',
      image: 'https://images.unsplash.com/photo-1546872006-42c78c00b743?w=500&auto=format&fit=crop&q=80',
    },
  ],
  'fitness-products': [
    {
      badge: 'YOGA & WELLNESS',
      title: '6mm Cushioned TPE Non-Slip Yoga Mats',
      subtitle: 'Laser Body Alignment Lines • Joint Protection',
      code: 'YOGAMAT',
      accent: 'linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%)',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'WORKOUT AT HOME',
      title: 'Heavy Anti-Snap Fabric Resistance Loop Bands',
      subtitle: 'Set of 3 Resistance Levels • Non-Slip Internal Strips',
      code: 'FABRICBANDS',
      accent: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&auto=format&fit=crop&q=80',
    },
    {
      badge: 'HYDRATION ESSENTIAL',
      title: '1000ml Vacuum Insulated Stainless Steel Bottles',
      subtitle: '24 Hours Ice Cold • Leakproof Sports Straw Lid',
      code: 'SACKBOTTLE',
      accent: 'linear-gradient(135deg, #0369a1 0%, #38bdf8 100%)',
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80',
    },
  ],
};

const MiniCategoryCarousel = ({ categorySlug }) => {
  const slides = CATEGORY_MINI_BANNERS[categorySlug] || CATEGORY_MINI_BANNERS['womens-fashion'];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || !slides.length) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const slide = slides[currentIdx];

  return (
    <div
      className={styles['flipkart-mini-carousel']}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles['mini-carousel-slide']}>
        <img src={slide.image} alt={slide.title} className={styles['mini-slide-img']} />
        <div className={styles['mini-slide-overlay']} style={{ background: slide.accent }} />

        <div className={styles['mini-slide-content']}>
          <span className={styles['mini-slide-badge']}>
            ✦ {slide.badge}
          </span>
          <h3 className={styles['mini-slide-title']}>{slide.title}</h3>
          <p className={styles['mini-slide-subtitle']}>{slide.subtitle}</p>

          <div className={styles['mini-slide-action']}>
            <span className={styles['mini-coupon-tag']}>CODE: <strong>{slide.code}</strong></span>
            <Link
              to={`/products?category=${categorySlug}`}
              className={styles['mini-shop-btn']}
            >
              <span>Shop Now</span>
              <ChevronRight size={13} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </div>

      <div className={styles['mini-carousel-dots']}>
        {slides.map((_, i) => (
          <span
            key={i}
            className={`${styles['mini-dot']} ${i === currentIdx ? styles['active'] : ''}`}
            onClick={() => setCurrentIdx(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default function CategorySubcategories() {
  const { slug } = useParams();
  const [category, setCategory] = useState(() => getCategoryBySlug(slug));
  const [subcategories, setSubcategories] = useState(() => getSubcategoriesByCategory(slug));
  const [categoryProducts, setCategoryProducts] = useState(() => getProducts({ category: slug, limit: 4 }));

  useEffect(() => {
    async function load() {
      try {
        const catRes = await categoryService.getBySlug(slug);
        const catData = catRes?.data || catRes;
        if (catData && catData.name) {
          setCategory(catData);
          const subList = catData.subcategories || getSubcategoriesByCategory(slug);
          setSubcategories(subList);
        } else {
          const fallbackCat = getCategoryBySlug(slug);
          if (fallbackCat) {
            setCategory(fallbackCat);
            setSubcategories(fallbackCat.subcategories || []);
          }
        }
      } catch (err) {
        const fallbackCat = getCategoryBySlug(slug);
        if (fallbackCat) {
          setCategory(fallbackCat);
          setSubcategories(fallbackCat.subcategories || []);
        }
      }
      setCategoryProducts(getProducts({ category: slug, limit: 5 }));
    }
    load();
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

          {/* Department Showcase Hero Header Card with Flipkart-Style Mini Carousel */}
          <div className={styles['hero-header-card']}>
            <div className={styles['hero-left-col']}>
              <div className={styles['hero-badge']}>
                <Sparkles size={14} color="#7c3aed" /> Department Showcase
              </div>
              <h1 className={styles['hero-title']}>
                {category.icon ? `${category.icon} ` : ''}{category.name}
              </h1>
              <p className={styles['hero-desc']}>
                {category.subtext || category.description || `Browse curated collections and popular styles in ${category.name}.`}
              </p>

              <div className={styles['hero-actions-row']}>
                <Link
                  to="/categories"
                  className={`btn btn-outline ${styles['all-cat-btn']}`}
                >
                  <ArrowLeft size={16} /> All Categories
                </Link>
                <Link
                  to={`/products?category=${category.slug || category._id}`}
                  className={`btn btn-primary ${styles['view-all-btn']}`}
                >
                  <ShoppingCart size={16} /> View All {category.name}
                </Link>
              </div>
            </div>

            {/* Right Side Flipkart-Like Mini Banner Carousel */}
            <div className={styles['hero-mini-carousel-wrapper']}>
              <MiniCategoryCarousel categorySlug={slug} />
            </div>
          </div>

          {/* Sub-Categories Outer Container Card (Exact 2nd Image Design) */}
          <div className={styles['subcat-container-card']}>
            {/* Header Row */}
            <div className={styles['subcat-header-row']}>
              <div className={styles['subcat-header-left']}>
                <div className={styles['subcat-icon-pod']}>
                  <Layers size={20} color="#7c3aed" strokeWidth={2.3} />
                </div>
                <div>
                  <div className={styles['title-row']}>
                    <h2 className={styles['container-title']}>Browse Collections</h2>
                    <span className={styles['categories-count-badge']}>
                      {subcategories.length} Categories
                    </span>
                  </div>
                  <p className={styles['container-subtext']}>
                    Shop curated gear by category
                  </p>
                </div>
              </div>

              <Link
                to={`/products?category=${category.slug || category._id}`}
                className={styles['view-all-collections-btn']}
              >
                <span>View all collections</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Horizontal Divider Line */}
            <div className={styles['header-divider']} />

            {/* Compact Horizontal Cards Grid */}
            <div className={styles['compact-subcat-grid']}>
              {subcategories.map((sub) => (
                <Link
                  key={sub._id || sub.slug}
                  to={`/products?category=${category.slug || category._id}&subCategory=${sub.slug || sub._id}`}
                  className={styles['compact-subcat-card']}
                >
                  <img
                    src={sub.image || category.image}
                    alt={sub.name}
                    className={styles['compact-card-img']}
                  />
                  <div className={styles['compact-card-content']}>
                    <h3 className={styles['compact-card-title']} title={sub.name}>
                      {sub.name}
                    </h3>
                    <span className={styles['compact-card-count']}>
                      {sub.itemCount ? `${sub.itemCount} items` : 'In stock'}
                    </span>
                    <div className={styles['compact-card-action']}>
                      <span>Shop</span>
                      <ArrowRight size={13} strokeWidth={2.5} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Featured Highlights from this Category (Enhanced Section Container) */}
          {categoryProducts.length > 0 && (
            <div className={styles['top-picks-container-card']}>
              <div className={styles['top-picks-header-row']}>
                <div className={styles['top-picks-header-left']}>
                  <div className={styles['top-picks-icon-pod']}>
                    <Sparkles size={20} color="#7c3aed" strokeWidth={2.3} />
                  </div>
                  <div>
                    <div className={styles['title-row']}>
                      <h2 className={styles['container-title']}>Top Picks in {category.name}</h2>
                      <span className={styles['picks-badge']}>✦ Customer Favorites</span>
                    </div>
                    <p className={styles['container-subtext']}>
                      Customer favorites and highest rated items ready for fast 24-48h dispatch.
                    </p>
                  </div>
                </div>

                <Link
                  to={`/products?category=${category.slug || category._id}`}
                  className={styles['view-all-collections-btn']}
                >
                  <span>View All ({category.itemCount || 10}+ Items)</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="product-grid-5">
                {categoryProducts.map((prod) => (
                  <ProductCard key={prod._id || prod.id} product={prod} />
                ))}
              </div>
            </div>
          )}

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
