import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EditorialHero from '../../components/home/EditorialHero';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductGrid from '../../components/product/ProductGrid';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { useCategoryStore } from '../../store/categoryStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { usePageCustomization } from '../../store/customizationStore';
import { wishlistService } from '../../services/wishlist.service';
import { contactService } from '../../services/contact.service';
import { useReviewStore } from '../../store/reviewStore';
import { REVIEWS_DATA } from '../../data/reviewsData';
import { ArrowRight, Star, Heart, CheckCircle, ShieldCheck, Truck, Clock, ChevronLeft, ChevronRight, Sparkles, ShoppingCart, Check, Eye, Zap, Layers } from 'lucide-react';
import '../../styles/home-premium.css';
import '../../styles/mobile-responsive.css';

// ─── Utility Components ──────────────────────────────────────────

const FlashDealMiniCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem, setBuyNowItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const inWishlist = isInWishlist(product._id || product.id || product.slug);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    if (isLoggedIn) {
      try {
        await wishlistService.toggle(product._id || product.id);
      } catch (_) { }
    }
    showToast(
      inWishlist ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to wishlist!`,
      'info'
    );
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const prodId = product._id || product.id;
    setBuyNowItem({
      _id: prodId,
      id: prodId,
      productId: prodId,
      name: product.name,
      image: product.images?.[0] || product.image || null,
      images: product.images || (product.image ? [product.image] : []),
      price: product.discountPrice || product.price || 0,
      discountPrice: product.discountPrice || product.price || 0,
      originalPrice: product.originalPrice || product.price || 0,
      quantity: 1,
      stock: typeof product.stock === 'number' ? product.stock : 10,
    });
    navigate('/checkout?buyNow=true');
  };

  const discountPercent = product.discountPrice && product.discountPrice < product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div
      className="hp-flash-minimal-card"
      onClick={() => navigate(`/products/${product.slug}`)}
    >
      <div className="minimal-card-img-wrap">
        {discountPercent > 0 && (
          <span className="minimal-card-badge">{discountPercent}% OFF</span>
        )}

        <button
          onClick={handleToggleWishlist}
          className="minimal-card-heart-btn"
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            size={16}
            color={inWishlist ? '#e11d48' : '#64748b'}
            fill={inWishlist ? '#e11d48' : 'transparent'}
            strokeWidth={2.3}
          />
        </button>

        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className="minimal-card-img"
        />
      </div>

      <div className="minimal-card-action">
        <button
          onClick={handleBuyNow}
          className="minimal-card-btn"
        >
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};

const FadeUp = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '250px 0px' }
    );
    if (ref.current) observer.observe(ref.current);

    // Guaranteed visibility safety timer (prevents blank/stuck sections on full screenshots or scroll anomalies)
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 800);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`fade-up ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const MagneticButton = ({ children, className = '', onClick }) => {
  const btnRef = useRef(null);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const { left, top, width, height } = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) * 0.3;
    const y = (e.clientY - top - height / 2) * 0.3;
    btnRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (btnRef.current) {
      btnRef.current.style.transform = 'translate(0px, 0px)';
    }
  };

  return (
    <div className="hp-magnetic-btn-wrapper">
      <button
        ref={btnRef}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

// ─── Home Page Component ─────────────────────────────────────────


// ─── Home Page Component ─────────────────────────────────────────


export default function Home() {
  const { sections, isEnabled, getSetting } = usePageCustomization('home');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addItem, setBuyNowItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();
  const categories = useCategoryStore((state) => state.categories);
  const storeReviews = useReviewStore((state) => state.reviews);
  const fetchPublicReviews = useReviewStore((state) => state.fetchPublicReviews);

  useEffect(() => {
    if (fetchPublicReviews) {
      fetchPublicReviews();
    }
  }, [fetchPublicReviews]);

  // Dynamic vibrant gradient palette for authentic customer initial badges
  const BADGE_GRADIENTS = useMemo(
    () => [
      'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
      'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
      'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
      'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
      'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)',
    ],
    []
  );

  // Featured reviews from admin moderation dynamically injected at top of home marquee
  const displayReviews = useMemo(() => {
    const featured = (storeReviews || [])
      .filter((r) => r.isFeatured && r.status === 'published')
      .map((r, idx) => {
        const prodSlug =
          r.product?.slug ||
          r.productSlug ||
          (typeof r.product === 'string' && r.product.length > 0 ? r.product : '') ||
          r.product?._id ||
          r.product?.id ||
          '';

        return {
          id: r.id || r._id || `feat-${idx}`,
          name: r.customer?.name || 'Verified Customer',
          city: r.customer?.location || r.customer?.city || 'Tamil Nadu',
          rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))),
          comment: r.comment,
          badgeColor: BADGE_GRADIENTS[idx % BADGE_GRADIENTS.length],
          photos: Array.isArray(r.photos) ? r.photos.filter(Boolean) : [],
          productSlug: prodSlug || null,
          isRealReview: true,
        };
      });

    const dummyReviews = REVIEWS_DATA.slice(0, 7).map((r) => ({
      ...r,
      photos: Array.isArray(r.photos) ? r.photos.filter(Boolean) : [],
      isRealReview: false,
    }));

    if (featured.length > 0) {
      return [...featured, ...dummyReviews.slice(0, Math.max(0, 8 - featured.length))];
    }
    return dummyReviews;
  }, [storeReviews, BADGE_GRADIENTS]);

  // Handle Review Card Click:
  // Real customer review -> navigates to the specific product page (/products/:slug)
  // Dummy / curated review -> navigates to Shop / Products page (/products)
  const handleReviewClick = (rev) => {
    if (rev?.isRealReview && rev.productSlug) {
      navigate(`/products/${rev.productSlug}`);
    } else {
      navigate('/products');
    }
  };

  // Scroll ref & auto-scroll state for horizontal trending products carousel
  const trendingScrollRef = useRef(null);
  const [isTrendingHovered, setIsTrendingHovered] = useState(false);

  // Live Ticking Countdown Timer for Flash Deals (02 HRS : 44 MIN : 54 SEC)
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 44,
    seconds: 54,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 2, minutes: 44, seconds: 54 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const trendingProductsList = useMemo(() => {
    if (!trendingProducts || trendingProducts.length === 0) return [];
    return [...trendingProducts];
  }, [trendingProducts]);

  const handleTrendingScroll = () => {
    if (!trendingScrollRef.current) return;
    const container = trendingScrollRef.current;
    const singleSetWidth = container.scrollWidth / 2;
    if (singleSetWidth <= 0) return;

    if (container.scrollLeft >= singleSetWidth) {
      container.scrollLeft -= singleSetWidth;
    } else if (container.scrollLeft <= 0) {
      container.scrollLeft += singleSetWidth;
    }
  };

  const scrollTrending = (direction) => {
    if (!trendingScrollRef.current) return;
    const container = trendingScrollRef.current;
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const cardStep = isMobile ? container.clientWidth / 2 : 304;
    if (direction === 'next') {
      container.scrollBy({ left: cardStep, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: -cardStep, behavior: 'smooth' });
    }
  };

  // Continuous smooth auto-running marquee loop for Trending Now carousel
  useEffect(() => {
    if (isTrendingHovered || !trendingProductsList.length) return;

    const container = trendingScrollRef.current;
    if (!container) return;

    let animId;
    const speed = 0.8; // pixels per frame (~48px/sec continuous smooth motion)

    const step = () => {
      if (trendingScrollRef.current) {
        trendingScrollRef.current.scrollLeft += speed;
        const singleSetWidth = trendingScrollRef.current.scrollWidth / 2;
        if (singleSetWidth > 0 && trendingScrollRef.current.scrollLeft >= singleSetWidth) {
          trendingScrollRef.current.scrollLeft -= singleSetWidth;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isTrendingHovered, trendingProductsList]);



  useEffect(() => {
    async function loadData() {
      const startTime = Date.now();
      setLoading(true);
      try {
        const prodRes = await productService.list({ limit: 50 });
        const pItems = prodRes?.data?.data || prodRes?.data || [];
        if (Array.isArray(pItems) && pItems.length > 0) {
          const hasTag = (p, keyword) => {
            if (!p) return false;
            const kw = keyword.toLowerCase();
            const badgeMatch = typeof p.badge === 'string' && p.badge.toLowerCase().includes(kw);
            const tagMatch = Array.isArray(p.tags)
              ? p.tags.some((t) => String(t).toLowerCase().includes(kw))
              : typeof p.tags === 'string'
                ? p.tags.toLowerCase().includes(kw)
                : false;
            return badgeMatch || tagMatch;
          };

          // 1. Trending Now filter (strictly matches 'trending now', 'trend', or isTrending)
          const trending = pItems.filter(
            (p) => hasTag(p, 'trend') || Boolean(p.isTrending)
          );
          setTrendingProducts(trending);

          // 2. Best Sellers filter (strictly matches 'best sellers', 'best', 'seller', or isBestSeller)
          const bestSellers = pItems.filter(
            (p) => hasTag(p, 'best') || hasTag(p, 'seller') || Boolean(p.isBestSeller)
          );
          setFeaturedProducts(bestSellers);

          // 3. New Arrivals filter (strictly matches 'new arrivals', 'new', 'arrival', or isNewArrival)
          const arrivals = pItems.filter(
            (p) => hasTag(p, 'new') || hasTag(p, 'arrival') || Boolean(p.isNewArrival)
          );
          setNewArrivals(arrivals);

          // 4. Limited Deals filter: products with ACTIVE discounts from Discounts page, followed by tagged deal products
          const now = Date.now();
          const activeDiscounts = pItems.filter(
            (p) =>
              Boolean(p.isDiscountActive) &&
              p.discountPrice &&
              p.discountPrice < p.price &&
              (!p.offerStartDate || new Date(p.offerStartDate).getTime() <= now) &&
              (!p.offerEndDate || new Date(p.offerEndDate).getTime() >= now)
          );
          const tagDeals = pItems.filter(
            (p) => hasTag(p, 'deal') || hasTag(p, 'limited')
          );
          const deals = activeDiscounts.length > 0
            ? [
              ...activeDiscounts,
              ...tagDeals.filter(
                (t) => !activeDiscounts.some((a) => (a._id || a.id) === (t._id || t.id))
              ),
            ]
            : tagDeals;
          setDealProducts(deals);
        } else {
          setFeaturedProducts([]);
          setTrendingProducts([]);
          setNewArrivals([]);
          setDealProducts([]);
        }
      } catch (err) {
        console.error('Home load error:', err);
        setFeaturedProducts([]);
        setTrendingProducts([]);
        setNewArrivals([]);
        setDealProducts([]);
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 2000 - elapsed);
        if (remainingDelay > 0) {
          await new Promise((r) => setTimeout(r, remainingDelay));
        }
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredArrivals = useMemo(() => {
    if (!activeCategoryFilter || activeCategoryFilter === 'all') return newArrivals;
    return newArrivals.filter(
      (p) =>
        p.category?.slug === activeCategoryFilter ||
        p.category?._id === activeCategoryFilter ||
        p.category === activeCategoryFilter
    );
  }, [newArrivals, activeCategoryFilter]);

  // ── Flash Deals / Limited Time Deals 15-Second Auto-Rotation ─────────
  const allDealProducts = useMemo(() => {
    return dealProducts;
  }, [dealProducts]);

  // Spotlight rotation list (prioritizes high discount products)
  const spotlightProductsList = useMemo(() => {
    if (!allDealProducts.length) return [];
    return [...allDealProducts].sort((a, b) => {
      const discA = ((a.price - a.discountPrice) / a.price) || 0;
      const discB = ((b.price - b.discountPrice) / b.price) || 0;
      return discB - discA;
    });
  }, [allDealProducts]);

  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [miniBatchIndex, setMiniBatchIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (!spotlightProductsList.length) return;
    const interval = setInterval(() => {
      setIsRotating(true);
      setTimeout(() => {
        setSpotlightIndex((prev) => (prev + 1) % spotlightProductsList.length);
        setMiniBatchIndex((prev) => prev + 1);
        setTimeout(() => {
          setIsRotating(false);
        }, 120);
      }, 300);
    }, 15000); // exactly 15 seconds

    return () => clearInterval(interval);
  }, [spotlightProductsList.length]);

  const spotlightProduct = spotlightProductsList[spotlightIndex % spotlightProductsList.length] || null;
  const spotlightDiscountPercent = spotlightProduct?.discountPrice && spotlightProduct?.price
    ? Math.round(((spotlightProduct.price - spotlightProduct.discountPrice) / spotlightProduct.price) * 100)
    : 32;

  const flashDealProducts = useMemo(() => {
    if (!allDealProducts.length) return [];
    const currentSpotlightSlug = spotlightProduct?.slug;
    const nonSpotlight = allDealProducts.filter(
      (p) => p.slug !== currentSpotlightSlug && (p._id || p.id) !== (spotlightProduct?._id || spotlightProduct?.id)
    );

    // Instead of forcing exactly 4 items by looping, just return up to 4 available unique items
    return nonSpotlight.slice(0, 4);
  }, [allDealProducts, spotlightProduct, miniBatchIndex]);

  const isSpotlightInWishlist = spotlightProduct
    ? isInWishlist(spotlightProduct._id || spotlightProduct.id || spotlightProduct.slug)
    : false;

  const handleToggleSpotlightWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!spotlightProduct) return;
    toggleItem(spotlightProduct);
    if (isLoggedIn) {
      try {
        wishlistService.toggle(spotlightProduct._id || spotlightProduct.id);
      } catch (_) { }
    }
    showToast(
      isSpotlightInWishlist
        ? `Removed "${spotlightProduct.name}" from wishlist`
        : `Saved "${spotlightProduct.name}" to wishlist!`,
      'info'
    );
  };

  const handleSpotlightBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!spotlightProduct) return;
    const prodId = spotlightProduct._id || spotlightProduct.id;
    setBuyNowItem({
      _id: prodId,
      id: prodId,
      productId: prodId,
      name: spotlightProduct.name,
      image: spotlightProduct.images?.[0] || spotlightProduct.image || null,
      images: spotlightProduct.images || (spotlightProduct.image ? [spotlightProduct.image] : []),
      price: spotlightProduct.discountPrice || spotlightProduct.price || 0,
      discountPrice: spotlightProduct.discountPrice || spotlightProduct.price || 0,
      originalPrice: spotlightProduct.originalPrice || spotlightProduct.price || 0,
      quantity: 1,
      stock: typeof spotlightProduct.stock === 'number' ? spotlightProduct.stock : 10,
    });
    navigate('/checkout?buyNow=true');
  };

  const handleSpotlightAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!spotlightProduct) return;
    addItem(spotlightProduct, 1);
    showToast(`Added "${spotlightProduct.name}" to cart!`, 'success');
  };


  const sectionRenderers = {
    hero_banner: () => isEnabled('hero_banner') && (
      <EditorialHero />
    ),
    shop_by_category: () => isEnabled('shop_by_category') && (
      <section className="hp-category-nav">
        <div className="hp-category-container">
          {/* Header Bar */}
          <div className="hp-cat-header-wrap">
            <div className="hp-cat-header-center">
              <div className="hp-cat-eyebrow">
                <span className="hp-line hp-eyebrow-desktop" />
                <span className="hp-eyebrow-desktop">SHOP BY</span>
                <span className="hp-eyebrow-mobile">QUICK BUY</span>
                <span className="hp-line hp-eyebrow-desktop" />
              </div>
              {(() => {
                const rawTitle = getSetting("shop_by_category", "title", "Shop by Category");
                const titlePrefix = getSetting("shop_by_category", "titlePrefix", "");
                const titleHighlight = getSetting("shop_by_category", "titleHighlight", "");

                let prefix = titlePrefix;
                let highlight = titleHighlight;

                if (!prefix && !highlight) {
                  const words = (rawTitle || "Shop by Category").trim().split(/\s+/);
                  if (words.length > 1) {
                    highlight = words.pop();
                    prefix = words.join(" ");
                  } else {
                    prefix = rawTitle;
                    highlight = "";
                  }
                }

                const titleFontSize = getSetting("shop_by_category", "titleFontSize", 34);
                const titleColor = getSetting("shop_by_category", "titleColor", "#1e1b4b");
                const titleHighlightColor = getSetting("shop_by_category", "titleHighlightColor", "#7c3aed");
                const subtitle = getSetting("shop_by_category", "subtitle", "Discover products for everyday life, all in one place.");
                const subtitleFontSize = getSetting("shop_by_category", "subtitleFontSize", 15);
                const subtitleColor = getSetting("shop_by_category", "subtitleColor", "#64748b");

                const parsedTitleFontSize = typeof titleFontSize === 'number' ? `${titleFontSize}px` : (titleFontSize || 'clamp(2rem, 3.5vw, 3rem)');
                const parsedSubtitleFontSize = typeof subtitleFontSize === 'number' ? `${subtitleFontSize}px` : (subtitleFontSize || 'clamp(0.9rem, 1.1vw, 1.05rem)');

                return (
                  <>
                    <h2
                      className="hp-cat-title"
                      style={{
                        fontSize: parsedTitleFontSize,
                        lineHeight: 1.15,
                      }}
                    >
                      <span style={{ color: titleColor }}>{prefix}</span>
                      {highlight ? (
                        <>
                          {' '}
                          <span style={{ color: titleHighlightColor }}>{highlight}</span>
                        </>
                      ) : null}
                    </h2>
                    {subtitle && (
                      <p
                        className="hp-cat-subtitle"
                        style={{
                          fontSize: parsedSubtitleFontSize,
                          color: subtitleColor,
                        }}
                      >
                        {subtitle}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            <button className="hp-cat-view-all-btn" onClick={() => navigate(getSetting("shop_by_category", "viewAllUrl", "/categories"))}>
              <span className="hp-view-all-desktop">{getSetting("shop_by_category", "viewAllText", "View All")}</span>
              <span className="hp-view-all-mobile">{String(getSetting("shop_by_category", "viewAllText", "View All")).toUpperCase()}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Dome / Arch Category Row */}
          <div className="hp-category-scroll">
            {categories.slice(0, 10).map((cat, i) => {
              return (
                <div
                  key={cat.slug || cat._id || i}
                  className="hp-category-item"
                  onClick={() => navigate(`/categories/${cat.slug || cat._id}`)}
                >
                  {/* Dome / Arch Image Card */}
                  <div className="hp-category-arch-wrapper">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="hp-category-arch-img"
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'linear-gradient(135deg, #2d1052 0%, #170733 100%)',
                          color: '#c4b5fd',
                        }}
                      >
                        <Layers size={26} strokeWidth={1.8} />
                      </div>
                    )}
                    <div className="hp-arch-purple-tint" />
                    {/* Floating Bottom Center Arrow Button — Uniform Picky Theme */}
                    <div className="hp-category-arrow-badge">
                      <ArrowRight size={14} className="hp-arrow-icon" strokeWidth={2.8} />
                    </div>
                  </div>

                  {/* Category Label */}
                  <span className="hp-category-name">{cat.name}</span>
                </div>
              );
            })}
          </div>

          {/* Bottom Quality Tagline Divider */}
          <div className="hp-cat-bottom-tagline">
            <span className="hp-tagline-line" />
            <span className="hp-tagline-text">QUALITY PRODUCTS &nbsp;|&nbsp; BETTER LIVING</span>
            <span className="hp-tagline-line" />
          </div>
        </div>
      </section>
    ),
    trending_products: () => isEnabled('trending_products') && trendingProducts.length > 0 && (
      <section
        className="hp-horizontal-section"
        onMouseEnter={() => setIsTrendingHovered(true)}
        onMouseLeave={() => setIsTrendingHovered(false)}
        onTouchStart={() => setIsTrendingHovered(true)}
        onTouchEnd={() => setIsTrendingHovered(false)}
      >
        <div className="hp-horizontal-inner">
          <div className="hp-section-header">
            <FadeUp>
              <div className="hp-section-badge">{getSetting("trending_products", "badgeText", "POPULAR SELECTION")}</div>
              <h2 className="hp-section-title">
                {getSetting("trending_products", "title", "Trending Now")}
              </h2>
              <p className="hp-section-subtitle">{getSetting("trending_products", "subtitle", "Discover the products everyone is talking about.")}</p>
            </FadeUp>

            {/* Right-Side Premium Carousel Navigation Controls */}
            <div className="hp-carousel-nav-btns">
              <button
                className="hp-carousel-nav-btn no-hover-fx"
                onClick={() => scrollTrending('prev')}
                aria-label="Previous Trending Product"
                title="Previous Product"
              >
                <ChevronLeft size={20} strokeWidth={2.3} />
              </button>
              <button
                className="hp-carousel-nav-btn no-hover-fx"
                onClick={() => scrollTrending('next')}
                aria-label="Next Trending Product"
                title="Next Product"
              >
                <ChevronRight size={20} strokeWidth={2.3} />
              </button>
            </div>
          </div>

          <div
            className="hp-horizontal-scroll-container"
            ref={trendingScrollRef}
            onScroll={handleTrendingScroll}
            onMouseEnter={() => setIsTrendingHovered(true)}
            onMouseLeave={() => setIsTrendingHovered(false)}
            onTouchStart={() => setIsTrendingHovered(true)}
            onTouchEnd={() => setIsTrendingHovered(false)}
          >
            {trendingProductsList.map((product, i) => (
              <div key={`${product._id || product.id || i}-${i}`} className="hp-horizontal-card">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
    flash_deals: () => isEnabled('flash_deals') && allDealProducts.length > 0 && (
      <section className="hp-flash-deals-section">
        <div className="hp-flash-deals-container">

          {/* Header Row: Title + Live Ticking Countdown */}
          {/* Header Row: Title + Live Ticking Countdown */}
          <div className="hp-flash-deals-header">
            <div className="hp-flash-title-block">
              <FadeUp>
                <div className="hp-section-badge">{getSetting("flash_deals", "badgeText", "FLASH SALE • LIMITED TIME ONLY")}</div>
                <h2 className="hp-section-title">
                  {getSetting("flash_deals", "headline", "Limited Time Deals")}
                </h2>
              </FadeUp>

              {/* Mobile Timer directly under title */}
              <div className="hp-flash-timer-mobile">
                <div className="hp-flash-header-timer">
                  <span className="timer-label">Ends In:</span>
                  <div className="timer-box">
                    <span className="timer-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="timer-unit">HRS</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-box">
                    <span className="timer-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="timer-unit">MIN</span>
                  </div>
                  <span className="timer-colon">:</span>
                  <div className="timer-box">
                    <span className="timer-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="timer-unit">SEC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hp-flash-header-actions">
              {/* Desktop Live Ticking Countdown Timer */}
              <div className="hp-flash-timer-desktop">
                <FadeUp delay={100}>
                  <div className="hp-flash-header-timer">
                    <span className="timer-label">Ends In:</span>
                    <div className="timer-box">
                      <span className="timer-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                      <span className="timer-unit">HRS</span>
                    </div>
                    <span className="timer-colon">:</span>
                    <div className="timer-box">
                      <span className="timer-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                      <span className="timer-unit">MIN</span>
                    </div>
                    <span className="timer-colon">:</span>
                    <div className="timer-box">
                      <span className="timer-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                      <span className="timer-unit">SEC</span>
                    </div>
                  </div>
                </FadeUp>
              </div>

              {/* Explore Limited Deals button navigating to /limited-deals */}
              <FadeUp delay={120}>
                <button
                  className="hp-view-all-btn"
                  onClick={() => navigate('/limited-deals')}
                  title="Explore All Limited Deals"
                >
                  <span className="hp-view-all-desktop">Explore Limited Deals</span>
                  <span className="hp-view-all-mobile">EXPLORE</span>
                  <ArrowRight size={14} />
                </button>
              </FadeUp>
            </div>
          </div>

          {/* Flash Deals Main Grid (Spotlight Card + 4 Real Minimal Products) */}
          <div className={`hp-flash-deals-grid ${isRotating ? 'is-rotating' : ''}`}>

            {/* Left Featured Spotlight Banner */}
            <FadeUp delay={150}>
              {spotlightProduct ? (
                <div
                  className="hp-flash-spotlight-card"
                  onClick={() => navigate(`/products/${spotlightProduct.slug}`)}
                >
                  <div className="spotlight-img-wrap">
                    <button
                      onClick={handleToggleSpotlightWishlist}
                      className="spotlight-heart-btn"
                      title={isSpotlightInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                    >
                      <Heart
                        size={14}
                        color={isSpotlightInWishlist ? '#e11d48' : '#64748b'}
                        fill={isSpotlightInWishlist ? '#e11d48' : 'transparent'}
                        strokeWidth={2.3}
                      />
                    </button>
                    <img
                      src={spotlightProduct.images?.[0] || spotlightProduct.image}
                      alt={spotlightProduct.name}
                      className="spotlight-img"
                    />
                    <div className="spotlight-glow" />
                  </div>

                  <div className="spotlight-content">
                    <div className="spotlight-category">Featured Offer</div>
                    <h3 className="spotlight-title">{spotlightProduct.name}</h3>
                    <p className="spotlight-desc">{spotlightProduct.description}</p>

                    <div className="spotlight-price-row">
                      <span className="spotlight-current-price">₹{spotlightProduct.discountPrice || spotlightProduct.price}</span>
                      {spotlightProduct.discountPrice && spotlightProduct.discountPrice < spotlightProduct.price && (
                        <>
                          <span className="spotlight-orig-price">₹{spotlightProduct.price}</span>
                          <span className="spotlight-savings-tag">Save ₹{spotlightProduct.price - spotlightProduct.discountPrice}</span>
                        </>
                      )}
                    </div>

                    <button className="spotlight-cta-btn" onClick={handleSpotlightBuyNow}>
                      <span className="spotlight-btn-desktop">
                        <ShoppingCart size={16} strokeWidth={2.3} style={{ marginRight: '6px' }} />
                        Claim Deal & Add to Cart
                      </span>
                      <span className="spotlight-btn-mobile">
                        <Eye size={15} strokeWidth={2.3} style={{ marginRight: '6px' }} />
                        VIEW DEAL
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="hp-flash-spotlight-card">
                  <div className="spotlight-content">
                    <h3 className="spotlight-title">No Spotlight Deal Available</h3>
                  </div>
                </div>
              )}
            </FadeUp>

            {/* Right Side 4 Minimal Cards (Dynamic 15s Rotation) */}
            <div className="hp-flash-products-grid">
              {flashDealProducts.map((product, idx) => (
                <div
                  key={`${product._id || product.id || product.slug || 'deal'}-${miniBatchIndex}-${idx}`}
                  className="flash-mini-animated"
                >
                  <FlashDealMiniCard product={product} />
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>
    ),
    new_arrivals: () => isEnabled('new_arrivals') && newArrivals.length > 0 && (
      <section className="hp-new-arrivals-section">
        <div className="hp-new-arrivals-container">
          <div className="hp-new-arrivals-header">
            <FadeUp>
              <div className="hp-section-badge">{getSetting("new_arrivals", "badge", "JUST DROPPED • 2026 EDITION")}</div>
              <h2 className="hp-section-title">
                {getSetting("new_arrivals", "title", "New Arrivals")}
              </h2>
              <p className="hp-section-subtitle">
                {getSetting("new_arrivals", "subtitle", "Be the first to explore our latest handpicked releases, updated weekly with artisanal quality.")}
              </p>
            </FadeUp>

            <div className="hp-new-arrivals-header-action">
              <button
                className="hp-view-all-btn"
                onClick={() => navigate('/products?sort=newest')}
              >
                <span className="hp-view-all-desktop">View All Drops</span>
                <span className="hp-view-all-mobile">VIEW ALL</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Category Filter Tab Pills */}
          <div className="hp-arrivals-filter-tabs">
            {[
              { id: 'all', label: 'All New Drops' },
              ...categories.slice(0, 10).map((c) => ({ id: c.slug || c._id, label: c.name })),
            ].map((tab) => (
              <button
                key={tab.id}
                className={`hp-filter-tab-pill ${activeCategoryFilter === tab.id ? 'active' : ''}`}
                onClick={() => setActiveCategoryFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 5-Column Product Grid (1 Row of 5 Cards) */}
          <div className="hp-new-arrivals-grid">
            {(filteredArrivals.length > 0 ? filteredArrivals : newArrivals).slice(0, 5).map((product, i) => (
              <FadeUp key={`${product._id || product.id || 'arrival'}-${i}`} delay={i * 60}>
                <ProductCard product={product} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    ),
    best_sellers: () => isEnabled('best_sellers') && featuredProducts.length > 0 && (
      <section className="hp-bestsellers-section">
        <div className="hp-bestsellers-inner">
          <div className="hp-section-header">
            <FadeUp>
              <div className="hp-section-badge">{getSetting("best_sellers", "badge", "CUSTOMER FAVORITES")}</div>
              <h2 className="hp-section-title">
                {getSetting("best_sellers", "title", "Best Sellers")}
              </h2>
              <p className="hp-section-subtitle">{getSetting("best_sellers", "subtitle", "Customer favorites, selected for you.")}</p>
            </FadeUp>

            <button
              className="hp-view-all-btn"
              onClick={() => navigate('/products?sort=popular')}
            >
              <span className="hp-view-all-desktop">View All</span>
              <span className="hp-view-all-mobile">VIEW ALL</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <ProductGrid products={featuredProducts.slice(0, 5)} loading={loading} />
          </div>
        </div>
      </section>
    ),
    why_picky: () => isEnabled('why_picky') && (
      <section className="hp-trust-section">
        <div className="hp-trust-container">

          <div className="hp-trust-header">
            <FadeUp>
              <div className="hp-section-badge">{getSetting("why_picky", "badgeText", "THE PICKY COMMITMENT")}</div>
              <h2 className="hp-section-title">
                {getSetting("why_picky", "title", "Why Shop With Us")}
              </h2>
              <p className="hp-section-subtitle">
                {getSetting("why_picky", "subtitle", "Experience uncompromised quality, lightning-fast dispatch, and 100% buyer protection.")}
              </p>
            </FadeUp>
          </div>

          <div className="hp-trust-grid">
            <FadeUp delay={100}>
              <div className="hp-trust-item">
                <div className="hp-trust-icon-wrap">
                  <div className="hp-trust-icon"><Truck size={26} strokeWidth={2.2} /></div>
                </div>
                <h3 className="hp-trust-title">Fast Delivery</h3>
                <p className="hp-trust-desc">Direct dispatch across India with real-time tracking.</p>
              </div>
            </FadeUp>

            <FadeUp delay={200}>
              <div className="hp-trust-item">
                <div className="hp-trust-icon-wrap">
                  <div className="hp-trust-icon"><Clock size={26} strokeWidth={2.2} /></div>
                </div>
                <h3 className="hp-trust-title">Easy Returns</h3>
                <p className="hp-trust-desc">Hassle-free 7-day instant returns & zero-cost exchanges.</p>
              </div>
            </FadeUp>

            <FadeUp delay={300}>
              <div className="hp-trust-item">
                <div className="hp-trust-icon-wrap">
                  <div className="hp-trust-icon"><ShieldCheck size={26} strokeWidth={2.2} /></div>
                </div>
                <h3 className="hp-trust-title">Secure Payments</h3>
                <p className="hp-trust-desc">100% encrypted checkout supporting UPI, Cards & NetBanking.</p>
              </div>
            </FadeUp>

            <FadeUp delay={400}>
              <div className="hp-trust-item">
                <div className="hp-trust-icon-wrap">
                  <div className="hp-trust-icon"><CheckCircle size={26} strokeWidth={2.2} /></div>
                </div>
                <h3 className="hp-trust-title">Curated Quality</h3>
                <p className="hp-trust-desc">Hand-inspected artisanal crafts & premium products guaranteed.</p>
              </div>
            </FadeUp>
          </div>

        </div>
      </section>
    ),
    customer_reviews: () => isEnabled('customer_reviews') && (
      <section className="hp-reviews-section">
        <div className="hp-reviews-container">

          <div className="hp-reviews-header">
            <FadeUp>
              <div className="hp-section-badge">{getSetting("customer_reviews", "badgeText", "REAL REVIEWS • 4.9/5 RATING")}</div>
              <h2 className="hp-section-title">
                {getSetting("customer_reviews", "title", "Loved By Thousands")}
              </h2>
              <p className="hp-section-subtitle">
                {getSetting("customer_reviews", "subtitle", "Read real experiences from over 2,400+ verified shoppers across India.")}
              </p>
            </FadeUp>

            {/* Overall Rating Summary Bar */}
            <FadeUp delay={100}>
              <div className="hp-rating-summary-bar">
                <div className="summary-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <span className="summary-score">4.9 / 5.0</span>
                <span className="summary-divider">•</span>
                <span className="summary-count">Based on 2,400+ Verified Customer Reviews</span>
                <span className="summary-badge">✓ 99.2% Satisfaction</span>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* Smooth Continuous Running Marquee Carousel (Full Width Edge-to-Edge) */}
        <div className="hp-reviews-carousel-wrap">
          <div className="hp-reviews-marquee-track">
            {/* Group 1: Live Featured + authentic Tamil Nadu style cards */}
            <div className="hp-reviews-marquee-group">
              {displayReviews.map((rev, idx) => (
                <div key={`rev-g1-${rev.id || idx}`} className="hp-review-slide-item">
                  <div
                    className="hp-review-card"
                    onClick={() => handleReviewClick(rev)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleReviewClick(rev);
                      }
                    }}
                  >
                    <div className="hp-review-watermark">“</div>

                    <div className="hp-review-card-top">
                      <div className="hp-review-stars">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                      <span className="hp-verified-badge">
                        <CheckCircle size={13} strokeWidth={2.8} /> Verified Buyer
                      </span>
                    </div>

                    <p className="hp-review-text">"{rev.comment}"</p>

                    {/* Customer Review Attached Photos Thumbnail Row */}
                    {Array.isArray(rev.photos) && rev.photos.length > 0 && (
                      <div className="hp-review-photos-wrap">
                        {rev.photos.slice(0, 3).map((imgUrl, pIdx) => (
                          <img
                            key={pIdx}
                            src={imgUrl}
                            alt={`Review attachment ${pIdx + 1}`}
                            className="hp-review-photo-thumb"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ))}
                        {rev.photos.length > 3 && (
                          <span className="hp-review-photos-more">+{rev.photos.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="hp-review-footer">
                      <div
                        className="hp-review-initial-badge"
                        style={{
                          background: rev.badgeColor || 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                        }}
                      >
                        {(rev.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="hp-review-user-info">
                        <h4 className="hp-review-user-name">{rev.name}</h4>
                        <span className="hp-review-user-meta">{rev.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Group 2: Seamless Duplicate for Infinite Marquee */}
            <div className="hp-reviews-marquee-group" aria-hidden="true">
              {displayReviews.map((rev, idx) => (
                <div key={`rev-g2-${rev.id || idx}`} className="hp-review-slide-item">
                  <div
                    className="hp-review-card"
                    onClick={() => handleReviewClick(rev)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleReviewClick(rev);
                      }
                    }}
                  >
                    <div className="hp-review-watermark">“</div>

                    <div className="hp-review-card-top">
                      <div className="hp-review-stars">
                        {[...Array(rev.rating || 5)].map((_, i) => (
                          <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                      <span className="hp-verified-badge">
                        <CheckCircle size={13} strokeWidth={2.8} /> Verified Buyer
                      </span>
                    </div>

                    <p className="hp-review-text">"{rev.comment}"</p>

                    {/* Customer Review Attached Photos Thumbnail Row */}
                    {Array.isArray(rev.photos) && rev.photos.length > 0 && (
                      <div className="hp-review-photos-wrap">
                        {rev.photos.slice(0, 3).map((imgUrl, pIdx) => (
                          <img
                            key={pIdx}
                            src={imgUrl}
                            alt={`Review attachment ${pIdx + 1}`}
                            className="hp-review-photo-thumb"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ))}
                        {rev.photos.length > 3 && (
                          <span className="hp-review-photos-more">+{rev.photos.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="hp-review-footer">
                      <div
                        className="hp-review-initial-badge"
                        style={{
                          background: rev.badgeColor || 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                        }}
                      >
                        {(rev.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="hp-review-user-info">
                        <h4 className="hp-review-user-name">{rev.name}</h4>
                        <span className="hp-review-user-meta">{rev.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    ),
    quick_inquiry: () => null,
    final_cta_banner: () => isEnabled('final_cta_banner') && (
      <section className="hp-final-cta-section">
        <div className="hp-final-cta-container">
          <div className="hp-final-cta-box">
            <FadeUp delay={100}>
              <span className="hp-final-cta-badge">{getSetting("final_cta_banner", "badgeText", "✦ JOIN OUR COMMUNITY")}</span>
              <h2 className="hp-final-title">{getSetting("final_cta_banner", "title", "Connect With Us @picky.co.in")}</h2>
            </FadeUp>
            <FadeUp delay={200}>
              <p className="hp-final-subtitle">
                {getSetting("final_cta_banner", "subtitle", "Follow us on Instagram & WhatsApp for daily style inspiration, exclusive drops, and behind-the-scenes stories.")}
              </p>
            </FadeUp>
            <FadeUp delay={300}>
              <div className="hp-final-cta-btn-group no-hover-fx">
                <button
                  type="button"
                  className="hp-final-cta-btn no-hover-fx"
                  onClick={() => window.open(getSetting('final_cta_banner', 'instagramLink', 'https://www.instagram.com/picky.co.in/'), '_blank', 'noopener,noreferrer')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  <span>Follow on Instagram</span>
                  <ArrowRight size={16} />
                </button>


                <button
                  type="button"
                  className="hp-final-cta-outline-btn no-hover-fx"
                  onClick={() => window.open(`https://wa.me/${getSetting('final_cta_banner', 'whatsappNumber', '918300295721')}?text=Hi%20Picky!%20I%20would%20like%20to%20join%20the%20community.`, '_blank', 'noopener,noreferrer')}
                  aria-label="Join WhatsApp Group"
                  title="Join WhatsApp Group"
                >
                  <svg className="hp-cta-wa-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                  </svg>
                  <span className="hp-cta-wa-label">
                    <span>Join WhatsApp Group</span>
                    <ArrowRight size={16} />
                  </span>
                </button>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    ),
  };

  return (
    <PageWrapper>
      {(Array.isArray(sections) && sections.length > 0
        ? sections
        : [
          { id: 'hero_banner' },
          { id: 'shop_by_category' },
          { id: 'trending_products' },
          { id: 'flash_deals' },
          { id: 'new_arrivals' },
          { id: 'best_sellers' },
          { id: 'why_picky' },
          { id: 'customer_reviews' },
          { id: 'final_cta_banner' },
        ]
      ).map((sec) => {
        const renderFn = sectionRenderers[sec.id];
        return renderFn ? <React.Fragment key={sec.id}>{renderFn()}</React.Fragment> : null;
      })}
    </PageWrapper>

  );
}
