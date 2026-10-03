import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EditorialHero from '../../components/home/EditorialHero';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductGrid from '../../components/product/ProductGrid';
import ProductCard from '../../components/product/ProductCard';
import { productService } from '../../services/product.service';
import { promoOffer, categories, valuePropositions, products as fallbackProducts, REVIEWS_DATA } from '../../data';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { wishlistService } from '../../services/wishlist.service';
import { ArrowRight, Star, Heart, CheckCircle, ShieldCheck, Truck, Clock, ChevronLeft, ChevronRight, Sparkles, ShoppingCart, Check } from 'lucide-react';
import '../../styles/home-premium.css';

// ─── Utility Components ──────────────────────────────────────────

const FlashDealMiniCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
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
      } catch (_) {}
    }
    showToast(
      inWishlist ? `Removed "${product.name}" from wishlist` : `Saved "${product.name}" to wishlist!`,
      'info'
    );
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
    showToast(`Added "${product.name}" to cart!`, 'success');
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
          onClick={handleQuickAdd}
          className={`minimal-card-btn ${justAdded ? 'added' : ''}`}
        >
          {justAdded ? (
            <>
              <Check size={16} strokeWidth={2.8} />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart size={15} strokeWidth={2.3} />
              <span>Add to Cart</span>
            </>
          )}
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

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState(() => (fallbackProducts || []).slice(0, 8));
  const [trendingProducts, setTrendingProducts] = useState(() => (fallbackProducts || []).slice(0, 10));
  const [newArrivals, setNewArrivals] = useState(() => fallbackProducts || []);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();
  const { isLoggedIn } = useAuthStore();
  const { showToast } = useUiStore();

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

  const scrollTrending = (direction) => {
    if (!trendingScrollRef.current) return;
    const container = trendingScrollRef.current;
    const cardStep = 304; // 280px width + 24px gap
    if (direction === 'next') {
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    } else {
      if (container.scrollLeft <= 10) {
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: -cardStep, behavior: 'smooth' });
      }
    }
  };

  // Auto-move Trending Now carousel every 3 seconds (3000ms)
  useEffect(() => {
    if (isTrendingHovered || !trendingProducts.length) return;

    const autoScrollInterval = setInterval(() => {
      if (!trendingScrollRef.current) return;
      const container = trendingScrollRef.current;
      const cardStep = 304; // 280px width + 24px gap

      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(autoScrollInterval);
  }, [isTrendingHovered, trendingProducts.length]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const prodRes = await productService.list({ sort: 'featured', limit: 16 });
        const pItems = prodRes?.data?.data || prodRes?.data || fallbackProducts;
        if (Array.isArray(pItems) && pItems.length > 0) {
          setFeaturedProducts(pItems.slice(0, 8)); // Best sellers
          setTrendingProducts(pItems.slice(0, 10)); // Trending horizontal
          setNewArrivals(pItems); // New arrivals
        } else {
          setFeaturedProducts((fallbackProducts || []).slice(0, 8));
          setTrendingProducts((fallbackProducts || []).slice(0, 10));
          setNewArrivals(fallbackProducts || []);
        }
      } catch (err) {
        console.error('Home load error:', err);
        setFeaturedProducts((fallbackProducts || []).slice(0, 8));
        setTrendingProducts((fallbackProducts || []).slice(0, 10));
        setNewArrivals(fallbackProducts || []);
      } finally {
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

  const spotlightProduct = fallbackProducts.find((p) => p.slug === 'pure-cotton-handloom-madurai-sungudi-saree') || fallbackProducts[0];
  const flashDealProducts = [
    fallbackProducts.find((p) => p.slug === 'antique-matte-gold-temple-choker-necklace-set') || fallbackProducts[7],
    fallbackProducts.find((p) => p.slug === 'multi-blade-stainless-steel-quick-vegetable-chopper') || fallbackProducts[4],
    fallbackProducts.find((p) => p.slug === 'traditional-kemp-pearl-bell-jhumka-earrings') || fallbackProducts[8],
    fallbackProducts.find((p) => p.slug === 'pre-seasoned-heavy-cast-iron-deep-kadai') || fallbackProducts[5],
  ].filter(Boolean);

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
      } catch (_) {}
    }
    showToast(
      isSpotlightInWishlist
        ? `Removed "${spotlightProduct.name}" from wishlist`
        : `Saved "${spotlightProduct.name}" to wishlist!`,
      'info'
    );
  };

  const handleSpotlightAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!spotlightProduct) return;
    addItem(spotlightProduct, 1);
    showToast(`Added "${spotlightProduct.name}" to cart!`, 'success');
  };

  return (
    <PageWrapper>
      {/* 01 — EDITORIAL PRODUCT-CUTOUT HERO */}
      <EditorialHero />

      {/* 02 — DOME / ARCH CATEGORY NAVIGATION SECTION */}
      <section className="hp-category-nav">
        <div className="hp-category-container">
          {/* Header Bar */}
          <div className="hp-cat-header-wrap">
            <div className="hp-cat-header-center">
              <div className="hp-cat-eyebrow">
                <span className="hp-line" />
                <span>SHOP BY</span>
                <span className="hp-line" />
              </div>
              <h2 className="hp-cat-title">
                Top <span className="purple-accent-text">Categories</span>
              </h2>
              <p className="hp-cat-subtitle">Everything you need, in one place</p>
            </div>

            <button className="hp-cat-view-all-btn" onClick={() => navigate('/categories')}>
              <span>View All</span>
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
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400'}
                      alt={cat.name}
                      className="hp-category-arch-img"
                    />
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

      {/* 03 — HORIZONTAL PRODUCT EXPERIENCE (TRENDING NOW - AUTO MOVES EVERY 3s) */}
      <section
        className="hp-horizontal-section"
        onMouseEnter={() => setIsTrendingHovered(true)}
        onMouseLeave={() => setIsTrendingHovered(false)}
      >
        <div className="hp-horizontal-inner">
          <div className="hp-section-header">
            <FadeUp>
              <div className="hp-section-badge">POPULAR SELECTION</div>
              <h2 className="hp-section-title">
                Trending <span className="editorial-purple-accent">Now</span>
              </h2>
              <p className="hp-section-subtitle">Discover the products everyone is talking about.</p>
            </FadeUp>

            {/* Right-Side Premium Carousel Navigation Controls */}
            <div className="hp-carousel-nav-btns">
              <button
                className="hp-carousel-nav-btn"
                onClick={() => scrollTrending('prev')}
                aria-label="Previous Trending Product"
                title="Previous Product"
              >
                <ChevronLeft size={20} strokeWidth={2.3} />
              </button>
              <button
                className="hp-carousel-nav-btn"
                onClick={() => scrollTrending('next')}
                aria-label="Next Trending Product"
                title="Next Product"
              >
                <ChevronRight size={20} strokeWidth={2.3} />
              </button>
            </div>
          </div>

          <div className="hp-horizontal-scroll-container" ref={trendingScrollRef}>
            {trendingProducts.map((product, i) => (
              <div key={product._id || product.id || i} className="hp-horizontal-card">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 04 — FLASH DEALS / LIMITED TIME DEALS (POWERED BY REAL MOCK DATA) */}
      <section className="hp-flash-deals-section">
        <div className="hp-flash-deals-container">
          
          {/* Header Row: Title + Live Ticking Countdown */}
          <div className="hp-flash-deals-header">
            <FadeUp>
              <div className="hp-section-badge">FLASH SALE • LIMITED TIME ONLY</div>
              <h2 className="hp-section-title">
                Limited Time <span className="editorial-purple-accent">Deals</span>
              </h2>
            </FadeUp>

            {/* Live Ticking Countdown Timer */}
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

          {/* Flash Deals Main Grid (Spotlight Card + 4 Real Minimal Products) */}
          <div className="hp-flash-deals-grid">
            
            {/* Left Featured Spotlight Banner (Real Sungudi Saree) */}
            <FadeUp delay={150}>
              <div
                className="hp-flash-spotlight-card"
                onClick={() => navigate(`/products/${spotlightProduct.slug}`)}
              >
                <div className="spotlight-tag">DEAL OF THE DAY • 32% OFF</div>
                
                <div className="spotlight-img-wrap">
                  <button
                    onClick={handleToggleSpotlightWishlist}
                    className="spotlight-heart-btn"
                    title={isSpotlightInWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
                  >
                    <Heart
                      size={18}
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
                  <div className="spotlight-category">Women's Fashion</div>
                  <h3 className="spotlight-title">{spotlightProduct.name}</h3>
                  <p className="spotlight-desc">{spotlightProduct.description}</p>
                  
                  <div className="spotlight-price-row">
                    <span className="spotlight-current-price">₹{spotlightProduct.discountPrice}</span>
                    <span className="spotlight-orig-price">₹{spotlightProduct.price}</span>
                    <span className="spotlight-savings-tag">Save ₹{spotlightProduct.price - spotlightProduct.discountPrice}</span>
                  </div>

                  <button className="spotlight-cta-btn" onClick={handleSpotlightAddToCart}>
                    <ShoppingCart size={16} strokeWidth={2.3} />
                    <span>Claim Deal & Add to Cart</span>
                  </button>
                </div>
              </div>
            </FadeUp>

            {/* Right Side 4 Minimal Cards (Image + Add to Bag ONLY) */}
            <div className="hp-flash-products-grid">
              {flashDealProducts.map((product, idx) => (
                <FadeUp key={product._id || product.id || idx} delay={200 + idx * 80}>
                  <FlashDealMiniCard product={product} />
                </FadeUp>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 04 — NEW ARRIVALS SHOWCASE (REPLACES OLD STORY SECTION) */}
      <section className="hp-new-arrivals-section">
        <div className="hp-new-arrivals-container">
          <div className="hp-new-arrivals-header">
            <FadeUp>
              <div className="hp-section-badge">JUST DROPPED • 2026 EDITION</div>
              <h2 className="hp-section-title">
                New <span className="editorial-purple-accent">Arrivals</span>
              </h2>
              <p className="hp-section-subtitle">
                Be the first to explore our latest handpicked releases, updated weekly with artisanal quality.
              </p>
            </FadeUp>

            <div className="hp-new-arrivals-header-action">
              <button
                className="hp-view-all-btn"
                onClick={() => navigate('/products?sort=newest')}
              >
                <span>View All Drops</span>
                <ArrowRight size={16} />
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
              <FadeUp key={product._id || product.id || i} delay={i * 60}>
                <ProductCard
                  product={product}
                  badgeText={['HOT DROP', 'NEW ARRIVAL', 'TRENDING', 'SPECIAL EDITION', 'POPULAR'][i % 5]}
                />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>




      {/* 07 — BEST SELLERS (1 ROW OF 5 CARDS) */}
      <section className="hp-bestsellers-section">
        <div className="hp-bestsellers-inner">
          <div className="hp-section-header">
            <FadeUp>
              <div className="hp-section-badge">CUSTOMER FAVORITES</div>
              <h2 className="hp-section-title">
                Best <span className="editorial-purple-accent">Sellers</span>
              </h2>
              <p className="hp-section-subtitle">Customer favorites, selected for you.</p>
            </FadeUp>
          </div>
          <div style={{ marginTop: '2.5rem' }}>
            <ProductGrid products={(featuredProducts.length > 0 ? featuredProducts : fallbackProducts).slice(0, 5)} loading={loading} />
          </div>
        </div>
      </section>

      {/* 08 — WHY SHOP WITH US */}
      <section className="hp-trust-section">
        <div className="hp-trust-container">
          
          <div className="hp-trust-header">
            <FadeUp>
              <div className="hp-section-badge">THE PICKY COMMITMENT</div>
              <h2 className="hp-section-title">
                Why Shop <span className="editorial-purple-accent">With Us</span>
              </h2>
              <p className="hp-section-subtitle">
                Experience uncompromised quality, lightning-fast dispatch, and 100% buyer protection.
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

      {/* 09 — CUSTOMER REVIEWS SHOWCASE */}
      <section className="hp-reviews-section">
        <div className="hp-reviews-container">
          
          <div className="hp-reviews-header">
            <FadeUp>
              <div className="hp-section-badge">REAL REVIEWS • 4.9/5 RATING</div>
              <h2 className="hp-section-title">
                Loved By <span className="editorial-purple-accent">Thousands</span>
              </h2>
              <p className="hp-section-subtitle">
                Read real experiences from over 2,400+ verified shoppers across India.
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

          <div className="hp-reviews-grid">
            {REVIEWS_DATA.slice(0, 3).map((rev, idx) => (
              <FadeUp key={rev.id || idx} delay={150 + idx * 100}>
                <div className="hp-review-card">
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

                  <div className="hp-review-footer">
                    <img src={rev.avatar} alt={rev.name} className="hp-review-avatar" />
                    <div className="hp-review-user-info">
                      <h4 className="hp-review-user-name">{rev.name}</h4>
                      <span className="hp-review-user-meta">{rev.city} • Purchased {rev.productName}</span>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

        </div>
      </section>

      {/* 10 — FINAL CTA BANNER */}
      <section className="hp-final-cta-section">
        <div className="hp-final-cta-container">
          <div className="hp-final-cta-box">
            <FadeUp delay={100}>
              <span className="hp-final-cta-badge">✦ CURATED FOR YOU</span>
              <h2 className="hp-final-title">Find Something You'll Love</h2>
            </FadeUp>
            <FadeUp delay={200}>
              <p className="hp-final-subtitle">Explore our latest collections and discover your next favorite piece.</p>
            </FadeUp>
            <FadeUp delay={300}>
              <MagneticButton className="hp-final-cta-btn" onClick={() => navigate('/products')}>
                <span>Start Shopping Now</span>
                <ArrowRight size={18} />
              </MagneticButton>
            </FadeUp>
          </div>
        </div>
      </section>
      
      {/* 11 — EXISTING FOOTER is handled by PageWrapper */}
    </PageWrapper>
  );
}
