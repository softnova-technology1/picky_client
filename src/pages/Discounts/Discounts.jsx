import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductCard from '../../components/product/ProductCard';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { useCategoryStore } from '../../store/categoryStore';
import { useUiStore } from '../../store/uiStore';
import { formatPrice } from '../../utils/formatPrice';
import {
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Search,
  SlidersHorizontal,
  Flame,
  Zap,
  RotateCcw,
  ShieldCheck,
  Truck,
  RotateCcw as ReturnIcon,
  Headphones,
  CheckCircle2,
  Star,
  Ticket,
} from 'lucide-react';
import { usePageCustomization } from '../../store/customizationStore';

export default function Discounts() {
  const { isEnabled, getSetting } = usePageCustomization('discounts');
  const navigate = useNavigate();
  const { fetchCategories } = useCategoryStore();
  const { showToast } = useUiStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended' | 'highest-discount' | 'price-low' | 'price-high' | 'newest'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    async function loadDiscounts() {
      try {
        setLoading(true);
        const res = await productService.list({ limit: 200, includeInactive: false });
        const list = res?.data?.data || res?.data || [];
        setProducts(list);
      } catch (err) {
        console.error('Failed to load discount products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadDiscounts();
  }, []);

  // Tag matcher helper
  const hasTag = (p, keyword) => {
    if (!p) return false;
    const kw = keyword.toLowerCase();
    if (Array.isArray(p.tags)) {
      return p.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(kw));
    }
    if (typeof p.tags === 'string') return p.tags.toLowerCase().includes(kw);
    if (typeof p.tag === 'string') return p.tag.toLowerCase().includes(kw);
    return false;
  };

  // Helper to verify if product is actively discounted right now in DB
  const isProductInActiveDiscount = (p) => {
    if (!p || !p.isDiscountActive) return false;
    if (p.discountPrice === undefined || p.discountPrice === null || p.discountPrice >= p.price) return false;
    const now = Date.now();
    const startDateValid = !p.offerStartDate || isNaN(new Date(p.offerStartDate).getTime()) || new Date(p.offerStartDate).getTime() <= now;
    const endDate = p.offerEndDate || p.validTill || p.endDate;
    const endDateValid = !endDate || isNaN(new Date(endDate).getTime()) || new Date(endDate).getTime() >= now;
    return startDateValid && endDateValid;
  };

  // Filter products: ONLY products matching active discounts or limited deals tag
  const activeDiscountProducts = useMemo(() => {
    return products.filter((p) => {
      const isTaggedLimitedDeal = hasTag(p, 'limited');
      const isConfiguredDiscount = isProductInActiveDiscount(p);
      return isConfiguredDiscount || isTaggedLimitedDeal;
    });
  }, [products]);

  // Check if any product has an active offer with an end date in the future
  const activeOfferWithEnd = useMemo(() => {
    const now = Date.now();
    return activeDiscountProducts.find((p) => {
      const end = p.offerEndDate || p.validTill || p.endDate;
      if (!end) return false;
      const endMs = new Date(end).getTime();
      return !isNaN(endMs) && endMs > now;
    });
  }, [activeDiscountProducts]);

  // Admin Customization Settings for Timer:
  const showCountdownTimerSetting = getSetting('discounts_hero', 'showCountdownTimer', true);
  const timerLabelSetting = getSetting('discounts_hero', 'timerLabel', 'ENDS IN:');
  const timerEndTimeSetting = getSetting('discounts_hero', 'timerEndTime', '');

  // Effective Target End Time (supports Admin Customization picker + DB fallback)
  const effectiveEndMs = useMemo(() => {
    if (timerEndTimeSetting) {
      const parsed = new Date(timerEndTimeSetting).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    if (activeOfferWithEnd) {
      const end = activeOfferWithEnd.offerEndDate || activeOfferWithEnd.validTill || activeOfferWithEnd.endDate;
      const parsed = new Date(end).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    // Default fallback: 7 days from now
    return Date.now() + 7 * 24 * 60 * 60 * 1000;
  }, [timerEndTimeSetting, activeOfferWithEnd]);

  // Live countdown timer state (controlled via Admin Customization)
  const [countdown, setCountdown] = useState(null);



  useEffect(() => {
    if (!showCountdownTimerSetting || !effectiveEndMs) {
      setCountdown(null);
      return;
    }

    const updateTimer = () => {
      const diff = effectiveEndMs - Date.now();
      if (diff <= 0) {
        setCountdown(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown({ days, hours, minutes, seconds });
    };

        updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [showCountdownTimerSetting, effectiveEndMs]);

  // Navigate directly to Product Detail page when clicking any hero product card
  const handleProductClick = (p) => {
    if (!p) return;
    const identifier = p.slug || p._id || p.id;
    if (identifier) {
      navigate(`/products/${identifier}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Hero Showcase Pool: ONLY products matching limited deals tag or active discount (no other tags)
  const heroPool = useMemo(() => {
    return activeDiscountProducts;
  }, [activeDiscountProducts]);

  // 1-Minute Auto-Rotation for the 3 Hero Cards
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isCardTransitioning, setIsCardTransitioning] = useState(false);

  useEffect(() => {
    if (heroPool.length <= 1) return;

    const interval = setInterval(() => {
      setIsCardTransitioning(true);
      setTimeout(() => {
        setRotationIndex((prev) => (prev + 1) % heroPool.length);
        setIsCardTransitioning(false);
      }, 400); // 400ms fade transition
    }, 60000); // 1 minute (60,000ms)

    return () => clearInterval(interval);
  }, [heroPool.length]);

  const poolLen = heroPool.length;
  const card1Product = poolLen > 0 ? heroPool[rotationIndex % poolLen] : null;
  const card2Product = poolLen > 1 ? heroPool[(rotationIndex + 1) % poolLen] : card1Product;
  const card3Product =
    poolLen > 2
      ? heroPool[(rotationIndex + 2) % poolLen]
      : poolLen > 1
      ? heroPool[(rotationIndex + 1) % poolLen]
      : card1Product;

  const getProductImage = (p) => {
    if (!p) return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
    if (Array.isArray(p.images) && p.images.length > 0) {
      const valid = p.images.find((img) => typeof img === 'string' && img.trim().length > 0);
      if (valid) return valid;
    }
    if (typeof p.image === 'string' && p.image.trim().length > 0) return p.image;
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
  };

  const getCardBadge = (p, defaultBadge = 'LIMITED DEAL') => {
    if (!p) return defaultBadge;
    if (p.price && p.discountPrice && p.price > p.discountPrice) {
      const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
      return `${pct}% OFF`;
    }
    if (p.offerLabel && typeof p.offerLabel === 'string' && p.offerLabel.trim()) {
      return p.offerLabel.trim().toUpperCase();
    }
    return defaultBadge;
  };

  // Flash deals: ONLY products that are ACTUALLY in active discount from DB!
  const flashDeals = useMemo(() => {
    return products
      .filter((p) => isProductInActiveDiscount(p))
      .sort((a, b) => {
        const diffA = (a.price - a.discountPrice) / a.price;
        const diffB = (b.price - b.discountPrice) / b.price;
        return diffB - diffA;
      })
      .slice(0, 4);
  }, [products]);

  // Categories among deals with real counts from DB
  const availableCategories = useMemo(() => {
    const catMap = new Map();
    activeDiscountProducts.forEach((p) => {
      const catName =
        typeof p.category === 'object' && p.category?.name
          ? p.category.name
          : p.subCategory || (typeof p.category === 'string' ? p.category : 'General');
      const catId = typeof p.category === 'object' && p.category?.slug ? p.category.slug : catName;
      if (catName && catId) {
        catMap.set(catId, catName);
      }
    });
    return Array.from(catMap.entries()).map(([id, label]) => ({ id, label }));
  }, [activeDiscountProducts]);

  // Filtered & Sorted products for the main catalog
  const filteredProducts = useMemo(() => {
    let result = activeDiscountProducts;

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.offerLabel?.toLowerCase().includes(q) ||
          (typeof p.category === 'object' && p.category?.name?.toLowerCase().includes(q)) ||
          p.subCategory?.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => {
        const catSlug = typeof p.category === 'object' && p.category?.slug ? p.category.slug : '';
        const catName = typeof p.category === 'object' && p.category?.name ? p.category.name : p.subCategory || p.category;
        return catSlug === selectedCategory || catName === selectedCategory;
      });
    }

    // 3. Sorting
    return [...result].sort((a, b) => {
      const priceA = a.discountPrice || a.price || 0;
      const priceB = b.discountPrice || b.price || 0;
      const discPctA = a.price && a.discountPrice ? ((a.price - a.discountPrice) / a.price) * 100 : 0;
      const discPctB = b.price && b.discountPrice ? ((b.price - b.discountPrice) / b.price) * 100 : 0;

      if (sortBy === 'highest-discount') {
        return discPctB - discPctA;
      }
      if (sortBy === 'price-low') {
        return priceA - priceB;
      }
      if (sortBy === 'price-high') {
        return priceB - priceA;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      return (b.ratings?.average || 4.8) - (a.ratings?.average || 4.8);
    });
  }, [activeDiscountProducts, searchQuery, selectedCategory, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 750, behavior: 'smooth' });
  };

  return (
    <PageWrapper>
      <div style={{ background: '#ffffff', minHeight: '100vh', color: '#1e293b' }}>
        {/* ── 1. Hero Section: Limited Deals Full-Width Purple Gradient Banner ── */}
        {isEnabled('discounts_hero') && (
          <section
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #150348 0%, #2b0b66 25%, #4a1590 55%, #6d28d9 80%, #7c3aed 100%)',
              borderBottom: '1px solid rgba(168, 85, 247, 0.35)',
              padding: '4rem 1.5rem 3.5rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ambient Purple Luminous Glows */}
            <div
              style={{
                position: 'absolute',
                top: '-15%',
                left: '10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 65%)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-20%',
                right: '5%',
                width: '550px',
                height: '550px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(192, 132, 252, 0.22) 0%, transparent 65%)',
                pointerEvents: 'none',
              }}
            />

            <style>{`
              @keyframes heroSilkyFloat {
                0% {
                  transform: translateY(0px) rotate(0deg);
                }
                50% {
                  transform: translateY(-16px) rotate(-1.2deg);
                }
                100% {
                  transform: translateY(0px) rotate(0deg);
                }
              }

              @keyframes auraGlowPulse {
                0%, 100% {
                  transform: scale(0.95);
                  opacity: 0.35;
                }
                50% {
                  transform: scale(1.1);
                  opacity: 0.65;
                }
              }



              @keyframes subtleBadgePulse {
                0%, 100% {
                  transform: scale(1);
                  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(168, 85, 247, 0.4);
                }
                50% {
                  transform: scale(1.05);
                  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45), 0 0 25px rgba(168, 85, 247, 0.6);
                }
              }

              @media (max-width: 960px) {
                .hero-grid-purple {
                  grid-template-columns: 1fr !important;
                  gap: 2.5rem !important;
                  text-align: center !important;
                }
                .hero-left-col {
                  order: 1 !important;
                }
                .hero-right-col {
                  order: 2 !important;
                }
                .hero-right-col p {
                  margin-left: auto !important;
                  margin-right: auto !important;
                }
                .hero-cta-wrap {
                  justify-content: center !important;
                }
                .hero-trust-wrap {
                  justify-content: center !important;
                }
              }
            `}</style>

            <div
              style={{
                maxWidth: '1360px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Main Content Grid: Left (Luxury 3D Gift Box) & Right (Headlines & CTAs) */}
              <div
                className="hero-grid-purple"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(320px, 1.05fr) minmax(340px, 1.25fr)',
                  gap: '3.5rem',
                  alignItems: 'center',
                }}
              >
                {/* ── Left Column: Luxury 3D Gift Box with Silky Smooth Levitation ── */}
                <div
                  className="hero-left-col"
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '420px',
                  }}
                >
                  {/* Purple Ambient Light Halo */}
                  <div
                    style={{
                      position: 'absolute',
                      width: '420px',
                      height: '420px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(192, 132, 252, 0.35) 0%, rgba(124, 58, 237, 0.18) 45%, transparent 70%)',
                      filter: 'blur(45px)',
                      pointerEvents: 'none',
                      animation: 'auraGlowPulse 6s ease-in-out infinite',
                    }}
                  />

                  {/* Circular "LIMITED TIME" badge matching reference layout */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      width: '84px',
                      height: '84px',
                      borderRadius: '50%',
                      border: '1.5px dashed rgba(233, 213, 255, 0.85)',
                      background: 'rgba(22, 5, 58, 0.88)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      lineHeight: '1.25',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4), 0 0 15px rgba(168, 85, 247, 0.4)',
                      zIndex: 5,
                      animation: 'subtleBadgePulse 3.5s ease-in-out infinite',
                    }}
                  >
                    <span>LIMITED</span>
                    <span>TIME</span>
                  </div>

                  {/* 3D Box Container with Silky Smooth Floating Levitation */}
                  <div
                    style={{
                      position: 'relative',
                      zIndex: 3,
                      maxWidth: '450px',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'heroSilkyFloat 5.8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite',
                      willChange: 'transform',
                    }}
                  >
                    <img
                      src="/images/limited-deals/gift_box_hero.jpg"
                      alt="Luxury Limited Deals Gift Box"
                      style={{
                        width: '100%',
                        maxHeight: '430px',
                        objectFit: 'contain',
                        display: 'block',
                        borderRadius: '28px',
                        maskImage: 'radial-gradient(circle at 50% 50%, black 46%, transparent 74%)',
                        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 46%, transparent 74%)',
                        filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.55))',
                      }}
                    />
                  </div>
                </div>

                {/* ── Right Column: Campaign Badge, Heading, Subtitle, Countdown, Button & Trust ── */}
                <div className="hero-right-col">
                  {/* Campaign Pill */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.42rem 1.05rem',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.28)',
                      color: '#ffffff',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '1.25rem',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Sparkles size={14} color="#f5d0fe" />
                    <span>{getSetting('discounts_hero', 'badgeText', 'LIMITED DEALS • LIVE NOW')}</span>
                  </div>

                  {/* Title */}
                  <h1
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 'clamp(2.4rem, 4.4vw, 3.8rem)',
                      fontWeight: 800,
                      color: '#ffffff',
                      lineHeight: 1.15,
                      margin: '0 0 1.25rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {(() => {
                      const title = getSetting('discounts_hero', 'title', 'Limited Deals');
                      const words = title.split(' ');
                      if (words.length > 1) {
                        return (
                          <>
                            {words.slice(0, -1).join(' ')}{' '}
                            <span style={{ color: '#f0abfc' }}>{words[words.length - 1]}</span>
                          </>
                        );
                      }
                      return title;
                    })()}
                  </h1>

                  {/* Subtitle */}
                  <p
                    style={{
                      fontSize: '1.05rem',
                      color: '#e9d5ff',
                      lineHeight: 1.65,
                      margin: '0 0 2rem',
                      maxWidth: '540px',
                    }}
                  >
                    {getSetting(
                      'discounts_hero',
                      'subtitle',
                      'Discover curated artisanal luxury and handcrafted treasures at limited deal prices. All discounts are verified and applied automatically at checkout.'
                    )}
                  </p>

                  {/* Live Countdown Pill: Configurable & Controllable via Admin Customization */}
                  {showCountdownTimerSetting && countdown && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.55rem 1.35rem',
                        borderRadius: '999px',
                        background: 'rgba(255, 255, 255, 0.14)',
                        border: '1px solid rgba(255, 255, 255, 0.28)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        marginBottom: '1.75rem',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          color: '#fed7aa',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#f97316',
                            boxShadow: '0 0 10px #f97316',
                            display: 'inline-block',
                          }}
                        />
                        {timerLabelSetting}
                      </span>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontWeight: 800,
                          fontSize: '0.92rem',
                          color: '#ffffff',
                        }}
                      >
                        <span style={{ background: 'rgba(255, 255, 255, 0.18)', padding: '2px 7px', borderRadius: '6px' }}>
                          {String(countdown.days).padStart(2, '0')}d
                        </span>
                        <span>:</span>
                        <span style={{ background: 'rgba(255, 255, 255, 0.18)', padding: '2px 7px', borderRadius: '6px' }}>
                          {String(countdown.hours).padStart(2, '0')}h
                        </span>
                        <span>:</span>
                        <span style={{ background: 'rgba(255, 255, 255, 0.18)', padding: '2px 7px', borderRadius: '6px' }}>
                          {String(countdown.minutes).padStart(2, '0')}m
                        </span>
                        <span>:</span>
                        <span style={{ background: 'rgba(255, 255, 255, 0.24)', padding: '2px 7px', borderRadius: '6px', color: '#fef08a' }}>
                          {String(countdown.seconds).padStart(2, '0')}s
                        </span>
                      </div>

                      <Clock size={15} color="#fef08a" />
                    </div>
                  )}

                  {/* Action Button: Explore Deals */}
                  <div
                    className="hero-cta-wrap"
                    style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}
                  >
                    <a
                      href="#curated-catalog"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.85rem 2.2rem',
                        borderRadius: '999px',
                        background: '#ffffff',
                        color: '#4c1d95',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.25)';
                      }}
                    >
                      <span>Explore Deals</span>
                      <ArrowRight size={16} />
                    </a>
                  </div>

                  {/* Trust Micro-Badges */}
                  <div
                    className="hero-trust-wrap"
                    style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#f3e8ff' }}>
                      <CheckCircle2 size={16} color="#f5d0fe" />
                      <span>100% Genuine Provenance</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#f5d0fe' }}>
                      <Truck size={16} color="#f5d0fe" />
                      <span>Same-Day Dispatch</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 2. High Urgency Vault: Flash Deals (Rendered ONLY if active offer with countdown exists) ── */}
        {countdown && flashDeals.length > 0 && (
          <section
            id="flash-deals-section"
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '3.5rem 1.5rem 2.5rem',
            }}
          >
            {/* Header Row: Title & Digital Countdown Flip Boxes (Only if offer active) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1.5rem',
                marginBottom: '2rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#dc2626',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                  }}
                >
                  <Zap size={14} color="#dc2626" />
                  <span>HIGH URGENCY VAULT</span>
                </div>

                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '2.1rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Flash Deals
                </h2>

                <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#64748b' }}>
                  Limited-time savings on selected favourites with verified inventory caps.
                </p>
              </div>

              {/* Digital Countdown Timer Boxes (ONLY shown when real active offer exists) */}
              {countdown && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    style={{
                      background: '#881337',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '0.45rem 0.65rem',
                      textAlign: 'center',
                      minWidth: '50px',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>
                      {String(countdown.days).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.8, marginTop: '3px' }}>
                      DAYS
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#881337' }}>:</span>

                  <div
                    style={{
                      background: '#881337',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '0.45rem 0.65rem',
                      textAlign: 'center',
                      minWidth: '50px',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>
                      {String(countdown.hours).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.8, marginTop: '3px' }}>
                      HOURS
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#881337' }}>:</span>

                  <div
                    style={{
                      background: '#881337',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '0.45rem 0.65rem',
                      textAlign: 'center',
                      minWidth: '50px',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>
                      {String(countdown.minutes).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.8, marginTop: '3px' }}>
                      MINS
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, color: '#881337' }}>:</span>

                  <div
                    style={{
                      background: '#881337',
                      color: '#ffffff',
                      borderRadius: '8px',
                      padding: '0.45rem 0.65rem',
                      textAlign: 'center',
                      minWidth: '50px',
                    }}
                  >
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1 }}>
                      {String(countdown.seconds).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.05em', opacity: 0.8, marginTop: '3px' }}>
                      SECS
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Flash Deals Cards using Site's Official ProductCard Component */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {flashDeals.map((prod) => (
                <ProductCard key={prod._id || prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        {/* ── 3. Controls Toolbar (Search, Category Filter Dropdown, Sorting) ── */}
        <div id="curated-catalog" style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1.5rem 0.5rem' }}>
          {/* Search, Category Filter & Sorting Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            {/* Left: Summary Count & Active Filter Indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                Showing <strong style={{ color: '#0f172a' }}>{filteredProducts.length}</strong> curated deals
              </span>

              {(selectedCategory !== 'all' || searchQuery) && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      background: '#ede9fe',
                      color: '#6d28d9',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                    }}
                  >
                    Filtered
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#dc2626',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '0.2rem 0.4rem',
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Right: Search, Category Dropdown Filter, Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    height: '38px',
                    paddingLeft: '34px',
                    paddingRight: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.84rem',
                    outline: 'none',
                    background: '#f8fafc',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Category Dropdown Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  height: '38px',
                  padding: '0 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  color: '#334155',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Categories ({activeDiscountProducts.length})</option>
                {availableCategories.map((cat) => {
                  const count = activeDiscountProducts.filter((p) => {
                    const catSlug = typeof p.category === 'object' && p.category?.slug ? p.category.slug : '';
                    const catName = typeof p.category === 'object' && p.category?.name ? p.category.name : p.subCategory || p.category;
                    return catSlug === cat.id || catName === cat.id;
                  }).length;
                  return (
                    <option key={cat.id} value={cat.id}>
                      {cat.label} ({count})
                    </option>
                  );
                })}
              </select>

              {/* Sort By */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  color: '#334155',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="highest-discount">Highest Discount (% OFF)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest Deals</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── 4. Main Product Deals Grid (Using Official ProductCard Component) ── */}
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem 3rem' }}>
          {loading ? (
            <div style={{ padding: '6rem 0', textAlign: 'center' }}>
              <Spinner size="lg" />
              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.92rem' }}>
                Loading verified deals from database...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '4rem 1.5rem',
                textAlign: 'center',
                border: '1px solid #f1f5f9',
              }}
            >
              <Tag size={32} color="#94a3b8" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#1e293b' }}>
                No deals found in catalog
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 1.25rem' }}>
                {searchQuery || selectedCategory !== 'all'
                  ? 'No products match your current filters. Try resetting search or category filter.'
                  : 'There are currently no active limited deals in the store. Please check back later!'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  navigate('/shop');
                }}
                style={{
                  padding: '0.55rem 1.35rem',
                  borderRadius: '8px',
                  background: '#2e1065',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod._id || prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginTop: '3rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} items
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: currentPage === 1 ? '#cbd5e1' : '#334155',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      Prev
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = currentPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            background: isActive ? '#2e1065' : 'transparent',
                            color: isActive ? '#ffffff' : '#334155',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: currentPage === totalPages ? '#cbd5e1' : '#334155',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      Next &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


        {/* ── Trust Features Row ── */}
        <section
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '4rem 1.5rem 5rem',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#f5f3ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} color="#7c3aed" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  Secure Payments
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  100% encrypted UPI, NetBanking, and all international cards.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#f5f3ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Truck size={20} color="#7c3aed" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  Express Delivery
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Dispatched within 24 hours with live door-step tracking.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#f5f3ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ReturnIcon size={20} color="#7c3aed" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  Easy 7-Day Returns
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Hassle-free reverse courier pickup for eligible products.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '14px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#f5f3ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Headphones size={20} color="#7c3aed" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.35rem' }}>
                  Dedicated Support
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Personal concierge available 9 AM - 8 PM IST every day.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
