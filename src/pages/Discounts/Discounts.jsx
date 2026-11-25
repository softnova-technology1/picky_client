import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import ProductCard from '../../components/product/ProductCard';
import Spinner from '../../components/ui/Spinner';
import MobileSkeleton from '../../components/ui/MobileSkeleton';
import Select from '../../components/ui/Select';
import { productService } from '../../services/product.service';
import { useCategoryStore } from '../../store/categoryStore';
import { useCartStore } from '../../store/cartStore';
import { formatPrice } from '../../utils/formatPrice';
import { usePageCustomization } from '../../store/customizationStore';
import {
  Tag,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowDown,
  ArrowUpRight,
  Search,
  Zap,
  Flame,
  RotateCcw,
  ShieldCheck,
  Truck,
  RotateCcw as ReturnIcon,
  Headphones,
  CheckCircle2,
  Star,
  Ticket,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Gift,
  ShoppingCart,
  TrendingUp,
  Pause,
  Play,
} from 'lucide-react';
import './Discounts.css';
import '../../styles/home-premium.css';

// Curated pastel themes for the Category-style deal cards matching Image 1
const PASTEL_PURPLE_THEMES = [
  '#f5efff', // Soft lilac mist
  '#eee4fa', // Gentle lavender
  '#f8f2fe', // Pearl amethyst
  '#ede5f8', // Warm lavender beige
  '#fbf8ff', // Crisp lilac white
  '#e9defc', // Royal light purple
  '#f3e8fc', // Sweet orchid
  '#ece3f9', // Whisper violet
];

const FALLBACK_DEAL_CARDS = [
  {
    _id: 'deal-fb-1',
    name: 'Artificial Temple Jewellery Set',
    category: { name: 'Artificial Jewellery', slug: 'artificial-jewellery' },
    shortDescription: 'Earrings, Chains, Bangles',
    price: 1299,
    discountPrice: 649,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
    slug: 'artificial-jewellery',
  },
  {
    _id: 'deal-fb-2',
    name: 'Handwoven Kanchipuram Silk Saree',
    category: { name: "Women's Fashion", slug: 'womens-fashion' },
    shortDescription: 'Pure Zari Weave & Handloom',
    price: 4999,
    discountPrice: 2499,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
    slug: 'womens-fashion',
  },
  {
    _id: 'deal-fb-3',
    name: 'Handcrafted Brass Diya & Decor',
    category: { name: 'Traditional Tamil Products', slug: 'traditional-tamil-products' },
    shortDescription: 'Tanjore Artisanal Brasscraft',
    price: 1899,
    discountPrice: 999,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
    slug: 'traditional-tamil-products',
  },
  {
    _id: 'deal-fb-4',
    name: 'Herbal Kumkumadi Glow Cream',
    category: { name: 'Beauty & Personal Care', slug: 'beauty-personal-care' },
    shortDescription: 'Ayurvedic Saffron Elixir',
    price: 899,
    discountPrice: 499,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    slug: 'beauty-personal-care',
  },
  {
    _id: 'deal-fb-5',
    name: 'Magnetic Wireless Power Pod',
    category: { name: 'Mobile Accessories', slug: 'mobile-accessories' },
    shortDescription: 'Fast-Charging 10000mAh',
    price: 1999,
    discountPrice: 999,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
    slug: 'mobile-accessories',
  },
  {
    _id: 'deal-fb-6',
    name: 'Heritage Ceramic Spice Jars',
    category: { name: 'Home & Kitchen', slug: 'home-kitchen' },
    shortDescription: 'Airtight Glazed Storage',
    price: 1499,
    discountPrice: 749,
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80',
    slug: 'home-kitchen',
  },
];

export default function Discounts() {
  const { isEnabled, getSetting } = usePageCustomization('discounts');
  const navigate = useNavigate();
  const { fetchCategories, categories } = useCategoryStore();
  const { addItem, setBuyNowItem } = useCartStore();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDealBucket, setSelectedDealBucket] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // In-Page Interactive Toast
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(null);
  const [addedHeroKey, setAddedHeroKey] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleCopyCoupon = (code, label) => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      setCopiedCoupon(code);
      triggerToast(`Coupon "${code}" copied! ${label || 'Applied at checkout.'}`);
      setTimeout(() => setCopiedCoupon(null), 3000);
    } catch (_) {
      triggerToast(`Coupon code is ${code}`);
    }
  };

  // Sticky Bar visibility on scroll
  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Categories
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load Products from API
  useEffect(() => {
    async function loadDiscounts() {
      try {
        setLoading(true);
        const res = await productService.list({ limit: 200, includeInactive: false });
        const list = res?.data?.data || res?.data || [];
        setProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load discount products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadDiscounts();
  }, []);

  // Strict Limited Deals tag matcher: strictly matches products tagged with "Limited Deals"
  const isLimitedDealProduct = (p) => {
    if (!p) return false;
    if (p.isLimitedDeal) return true;

    // Check offerLabel
    if (typeof p.offerLabel === 'string' && p.offerLabel.trim()) {
      const ol = p.offerLabel.trim().toLowerCase().replace(/[-_]/g, ' ');
      if (ol.includes('limited') || ol.includes('deal')) return true;
    }

    // Check badge
    if (typeof p.badge === 'string' && p.badge.trim()) {
      const b = p.badge.trim().toLowerCase().replace(/[-_]/g, ' ');
      if (b.includes('limited') || b.includes('deal')) return true;
    }

    // Check tags array or string
    const rawTags = Array.isArray(p.tags)
      ? p.tags
      : typeof p.tags === 'string'
      ? p.tags.split(',')
      : typeof p.tag === 'string'
      ? [p.tag]
      : [];

    return rawTags.some((t) => {
      if (!t) return false;
      const clean = String(t).trim().toLowerCase().replace(/[-_]/g, ' ');
      return clean.includes('limited') || clean.includes('deal');
    });
  };

  // Filter products: STRICTLY products tagged with "Limited Deals" - NO fallbacks to general catalog
  const activeDiscountProducts = useMemo(() => {
    return products.filter(isLimitedDealProduct);
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

  // Admin Customization Settings for Hero & Timer:
  const showCountdownTimerSetting = getSetting('discounts_hero', 'showCountdownTimer', true);
  const timerLabelSetting = getSetting('discounts_hero', 'timerLabel', 'DEAL ENDS IN');
  const timerEndTimeSetting = getSetting('discounts_hero', 'timerEndTime', '');

  // Target End Time
  const effectiveEndMs = useMemo(() => {
    if (timerEndTimeSetting) {
      const parsed = new Date(timerEndTimeSetting).getTime();
      if (!isNaN(parsed) && parsed > Date.now()) return parsed;
    }
    if (activeOfferWithEnd) {
      const end = activeOfferWithEnd.offerEndDate || activeOfferWithEnd.validTill || activeOfferWithEnd.endDate;
      const parsed = new Date(end).getTime();
      if (!isNaN(parsed) && parsed > Date.now()) return parsed;
    }
    return Date.now() + (2 * 24 + 14) * 60 * 60 * 1000 + 32 * 60 * 1000;
  }, [timerEndTimeSetting, activeOfferWithEnd]);

  // Live countdown timer state
  const [countdown, setCountdown] = useState({ days: 2, hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    if (!showCountdownTimerSetting || !effectiveEndMs) return;

    const updateTimer = () => {
      const diff = effectiveEndMs - Date.now();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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

  // Circular Dial Calculations (radius = 38, circumference = 2 * PI * 38 ≈ 238.76)
  const dialRadius = 38;
  const dialCircumference = 2 * Math.PI * dialRadius;

  const secondsDashoffset =
    dialCircumference - (dialCircumference * (countdown.seconds % 60)) / 60;
  const minutesDashoffset =
    dialCircumference - (dialCircumference * (countdown.minutes % 60)) / 60;
  const hoursDashoffset =
    dialCircumference - (dialCircumference * (countdown.hours % 24)) / 24;
  const daysDashoffset =
    dialCircumference - (dialCircumference * Math.min(countdown.days, 30)) / 30;

  // ── DYNAMIC DIAL COLORS (Full: Green, Middle: Recommended Warm Amber, Low: Red) ──
  const getDialColorInfo = (fraction) => {
    if (fraction > 0.5) {
      // Full / High: Emerald Green
      return {
        color: '#10b981',
        stop1: '#10b981',
        stop2: '#34d399',
        trackStroke: 'rgba(16, 185, 129, 0.15)',
        label: '#059669',
      };
    }
    if (fraction > 0.2) {
      // Middle: Recommended Warm Amber / Gold
      return {
        color: '#f59e0b',
        stop1: '#f59e0b',
        stop2: '#fbbf24',
        trackStroke: 'rgba(245, 158, 11, 0.16)',
        label: '#d97706',
      };
    }
    // Low / Urgent: Crimson Red
    return {
      color: '#ef4444',
      stop1: '#ef4444',
      stop2: '#f87171',
      trackStroke: 'rgba(239, 68, 68, 0.18)',
      label: '#dc2626',
    };
  };

  const daysColor = useMemo(
    () => getDialColorInfo(Math.min(countdown.days, 7) / 7),
    [countdown.days]
  );
  const hoursColor = useMemo(
    () => getDialColorInfo((countdown.hours % 24) / 24),
    [countdown.hours]
  );
  const minutesColor = useMemo(
    () => getDialColorInfo((countdown.minutes % 60) / 60),
    [countdown.minutes]
  );
  const secondsColor = useMemo(
    () => getDialColorInfo((countdown.seconds % 60) / 60),
    [countdown.seconds]
  );

  // Product helper
  const getProductImage = (p) => {
    if (!p) return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
    if (Array.isArray(p.images) && p.images.length > 0) {
      const valid = p.images.find((img) => typeof img === 'string' && img.trim().length > 0);
      if (valid) return valid;
    }
    if (typeof p.image === 'string' && p.image.trim().length > 0) return p.image;
    return 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80';
  };

  const getDiscountPercent = (p) => {
    if (!p) return 0;
    const effectivePrice = p.discountPrice || p.price;
    if (p.price && effectivePrice && p.price > effectivePrice) {
      return Math.round(((p.price - effectivePrice) / p.price) * 100);
    }
    return 0;
  };

  // Top Spotlight "Deal of the Day"
  const dealOfTheDay = useMemo(() => {
    if (!activeDiscountProducts || activeDiscountProducts.length === 0) return null;
    return [...activeDiscountProducts].sort((a, b) => {
      const gapA = (a.price || 0) - (a.discountPrice || a.price || 0);
      const gapB = (b.price || 0) - (b.discountPrice || b.price || 0);
      return gapB - gapA;
    })[0];
  }, [activeDiscountProducts]);

  // Flash Blitz Deals (Top 4)
  const flashDeals = useMemo(() => {
    return activeDiscountProducts.slice(0, 4);
  }, [activeDiscountProducts]);

  // Categories among deals with real counts
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

  const categoryOptions = useMemo(() => {
    const list = [{ value: 'all', label: `All Categories (${activeDiscountProducts.length})` }];
    availableCategories.forEach((cat) => {
      const count = activeDiscountProducts.filter((p) => {
        const catSlug = typeof p.category === 'object' && p.category?.slug ? p.category.slug : '';
        const catName =
          typeof p.category === 'object' && p.category?.name ? p.category.name : p.subCategory || p.category;
        return catSlug === cat.id || catName === cat.id;
      }).length;
      list.push({
        value: cat.id,
        label: `${cat.label} (${count})`,
      });
    });
    return list;
  }, [availableCategories, activeDiscountProducts]);

  const sortOptions = useMemo(
    () => [
      { value: 'recommended', label: 'Sort: Recommended' },
      { value: 'highest-discount', label: 'Highest Discount (% OFF)' },
      { value: 'price-low', label: 'Price: Low to High' },
      { value: 'price-high', label: 'Price: High to Low' },
      { value: 'newest', label: 'Newest Drops' },
    ],
    []
  );

  // Multi-Category Hub Preset Icons
  const categoryHubPresets = [
    { id: 'all', label: 'All Categories', icon: '✨', desc: 'Curated Deals' },
    { id: 'womens-fashion', label: "Women's Fashion", icon: '👗', desc: 'Sarees & Kurtis' },
    { id: 'artificial-jewellery', label: 'Art Jewellery', icon: '💍', desc: 'Temple & Kundan' },
    { id: 'traditional-tamil-products', label: 'Traditional Crafts', icon: '🪔', desc: 'Artisanal Weaves' },
    { id: 'home-kitchen', label: 'Home & Kitchen', icon: '🍳', desc: 'Decor & Storage' },
    { id: 'beauty-personal-care', label: 'Beauty & Care', icon: '🌸', desc: 'Herbal Wellness' },
    { id: 'mobile-accessories', label: 'Accessories', icon: '📱', desc: 'Smart & Travel' },
  ];

  // ── PREPARE 3-COLUMN VERTICAL MARQUEE STREAMS (Category-Page Card Style) ──
  const verticalStreamCards = useMemo(() => {
    const valid = activeDiscountProducts.filter((p) => {
      const img = Array.isArray(p.images) ? p.images[0] : p.image;
      return Boolean(img);
    });
    if (valid.length > 0) return valid;
    return FALLBACK_DEAL_CARDS;
  }, [activeDiscountProducts]);

  // Column 1 (Left flank - Top to Bottom, Partially visible)
  const col1Cards = useMemo(() => {
    if (verticalStreamCards.length === 0) return [];
    let pool = [...verticalStreamCards];
    while (pool.length < 6) pool = [...pool, ...verticalStreamCards];
    return [...pool, ...pool];
  }, [verticalStreamCards]);

  // Column 2 (Center - Bottom to Top, Fully visible & prominent)
  const col2Cards = useMemo(() => {
    if (verticalStreamCards.length === 0) return [];
    let pool = [...verticalStreamCards];
    while (pool.length < 6) pool = [...pool, ...verticalStreamCards];
    return [...pool, ...pool];
  }, [verticalStreamCards]);

  // Column 3 (Right flank - Top to Bottom, Partially visible)
  const col3Cards = useMemo(() => {
    if (verticalStreamCards.length === 0) return [];
    let pool = [...verticalStreamCards];
    while (pool.length < 6) pool = [...pool, ...verticalStreamCards];
    return [...pool, ...pool];
  }, [verticalStreamCards]);

  // Filtered & Sorted products for main catalog
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
        const catName =
          typeof p.category === 'object' && p.category?.name ? p.category.name : p.subCategory || p.category;
        return (
          catSlug.toLowerCase() === selectedCategory.toLowerCase() ||
          catName?.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      });
    }

    // 3. Deal Bucket Filter
    if (selectedDealBucket !== 'all') {
      result = result.filter((p) => {
        const effectivePrice = Number(p.discountPrice || p.price || 0);
        const originalPrice = Number(p.price || 0);
        const discountPct = originalPrice > 0 ? ((originalPrice - effectivePrice) / originalPrice) * 100 : 0;

        if (selectedDealBucket === 'under-499') return effectivePrice <= 499;
        if (selectedDealBucket === 'under-999') return effectivePrice <= 999;
        if (selectedDealBucket === 'under-1999') return effectivePrice <= 1999;
        if (selectedDealBucket === '50-off') return discountPct >= 50;
        if (selectedDealBucket === '30-off') return discountPct >= 30;
        return true;
      });
    }

    // 4. Sorting
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
  }, [activeDiscountProducts, searchQuery, selectedCategory, selectedDealBucket, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const catalogElem = document.getElementById('curated-catalog');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Newsletter State
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      triggerToast('Please enter a valid email address');
      return;
    }
    setNewsletterSubscribed(true);
    triggerToast('🎉 You are on the VIP Deal Alerts list!');
    setNewsletterEmail('');
  };

  /** Build standardized cart/checkout item payload for Limited Deals hero running cards */
  const buildHeroDealPayload = (p) => {
    const prodId = p._id || p.id || p.slug;
    const img = getProductImage(p);
    const hasDisc =
      p.discountPrice !== undefined &&
      p.discountPrice !== null &&
      Number(p.discountPrice) > 0 &&
      Number(p.discountPrice) < Number(p.price);
    const effectivePrice = hasDisc ? Number(p.discountPrice) : Number(p.price || 0);

    const hasDbVariants =
      p?.variants?.type &&
      p.variants.type !== 'none' &&
      Array.isArray(p.variants.options) &&
      p.variants.options.length > 0;
    const firstOpt = hasDbVariants ? p.variants.options[0] : null;
    const defaultSize =
      p?.variants?.default ||
      (firstOpt && typeof firstOpt === 'object' ? firstOpt.label || firstOpt.name || firstOpt.size : firstOpt) ||
      '';
    const firstColor =
      Array.isArray(p?.variants?.colors) && p.variants.colors.length > 0
        ? (typeof p.variants.colors[0] === 'object'
            ? p.variants.colors[0].name || p.variants.colors[0].label
            : p.variants.colors[0])
        : '';

    return {
      ...p,
      _id: prodId,
      id: prodId,
      productId: prodId,
      slug: p.slug,
      name: p.name,
      image: img || '',
      images: p.images || (img ? [img] : []),
      price: effectivePrice,
      discountPrice: effectivePrice,
      originalPrice: Number(p.originalPrice || p.price || effectivePrice),
      basePrice: effectivePrice,
      ...(defaultSize ? { selectedSize: defaultSize, selectedVariant: defaultSize } : {}),
      ...(firstColor ? { selectedColor: firstColor } : {}),
      quantity: 1,
      stock: typeof p.stock === 'number' ? p.stock : 10,
    };
  };

  // Direct Express Buy Now workflow for Limited Deals hero running cards
  const handleHeroBuyNow = (p, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p) return;

    if (String(p._id || '').startsWith('deal-fb-')) {
      navigate(p.slug ? `/shop?category=${p.slug}` : '/shop');
      return;
    }

    if (typeof p.stock === 'number' && p.stock <= 0) {
      triggerToast('This item is currently out of stock');
      return;
    }

    setBuyNowItem(buildHeroDealPayload(p));
    navigate('/checkout?buyNow=true');
  };

  // Store item in shopping cart from Limited Deals hero running card
  const handleHeroAddToCart = (p, cardKey, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!p) return;

    if (String(p._id || '').startsWith('deal-fb-')) {
      navigate(p.slug ? `/shop?category=${p.slug}` : '/shop');
      return;
    }

    if (typeof p.stock === 'number' && p.stock <= 0) {
      triggerToast('This item is currently out of stock');
      return;
    }

    addItem(buildHeroDealPayload(p), 1);
    setAddedHeroKey(cardKey);
    setTimeout(() => setAddedHeroKey((curr) => (curr === cardKey ? null : curr)), 1600);
    triggerToast(`Added "${p.name}" to cart!`);
  };

  // Helper to render Luxury Product Deal Card for the 3-column vertical stream
  const renderCategoryStyleDealCard = (p, idx, themeBg) => {
    const identifier = p.slug || p._id || p.id;
    const cardKey = `${identifier}-${idx}`;
    const catName =
      typeof p.category === 'object' && p.category?.name
        ? p.category.name
        : p.subCategory || (typeof p.category === 'string' ? p.category : 'LIMITED OFFER');
    const subtitle =
      p.shortDescription ||
      'Verified Limited-Time Offer';
    const hasDiscount =
      p.discountPrice !== undefined &&
      p.discountPrice !== null &&
      Number(p.discountPrice) > 0 &&
      Number(p.discountPrice) < Number(p.price);
    const effectivePrice = hasDiscount ? Number(p.discountPrice) : Number(p.price || 0);
    const savingsAmt = hasDiscount ? Number(p.price) - effectivePrice : 0;
    const discountPct = getDiscountPercent(p);
    const isOutOfStock = typeof p.stock === 'number' && p.stock <= 0;
    const isJustAdded = addedHeroKey === cardKey;

    return (
      <div
        key={cardKey}
        className="dept-deal-card"
        onClick={() => {
          if (identifier && !String(p._id || '').startsWith('deal-fb-')) {
            navigate(`/products/${identifier}`);
          }
        }}
      >
        {/* Top Product Image Frame */}
        <div className="dept-card-image-wrap" style={{ background: themeBg }}>
          <img
            src={getProductImage(p)}
            alt={p.name}
            className="dept-card-img"
            loading="lazy"
          />
          <div className="dept-card-deal-tag">
            <Zap size={10} fill="currentColor" />
            <span>LIMITED DEAL</span>
          </div>
          {discountPct > 0 && (
            <div className="dept-card-discount-pill">
              {discountPct}% OFF
            </div>
          )}
        </div>

        {/* Crisp White Product Info & Buy Now + Cart Action */}
        <div className="dept-card-body">
          <div className="dept-card-top">
            <div className="dept-card-meta">{catName}</div>
            <h3 className="dept-card-title">{p.name}</h3>
            {subtitle && (
              <p className="dept-card-sub" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>

          <div className="dept-card-price-row">
            <span className="dept-card-price">{formatPrice(effectivePrice)}</span>
            {hasDiscount && (
              <span className="dept-card-original-price">{formatPrice(p.price)}</span>
            )}
            {savingsAmt > 0 && (
              <span className="dept-card-save-pill">Save {formatPrice(savingsAmt)}</span>
            )}
          </div>

          <div className="dept-card-actions-row">
            <button
              type="button"
              className="dept-card-buy-btn"
              onClick={(e) => handleHeroBuyNow(p, e)}
              disabled={isOutOfStock}
            >
              <span>{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
            </button>
            <button
              type="button"
              className={`dept-card-cart-btn ${isJustAdded ? 'added' : ''}`}
              onClick={(e) => handleHeroAddToCart(p, cardKey, e)}
              disabled={isOutOfStock}
              aria-label={`Add ${p.name} to cart`}
              title="Add to Cart"
            >
              {isJustAdded ? <Check size={15} strokeWidth={2.5} /> : <ShoppingCart size={15} strokeWidth={2.2} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="discounts-page-root">
        {/* ── 1. Hero Section: Full 100vh Layout with Top-to-Bottom Auto-Scrolling Category-Style Cards ── */}
        {isEnabled('discounts_hero') && (
          <section className="discounts-hero-wrapper">
            <div className="discounts-hero-grid-pattern" />

            <div className="discounts-hero-container">
              {/* Left Column: Headline, Circular Countdown & Fast Actions */}
              <div className="discounts-hero-left-col">
                {/* Hero Title */}
                <h1 className="discounts-gradient-title">
                  {(() => {
                    const title = getSetting('discounts_hero', 'title', 'Limited Deals & Multi-Product Offers');
                    const words = title.split(' ');
                    if (words.length > 2) {
                      return (
                        <>
                          {words.slice(0, -2).join(' ')}{' '}
                          <span className="discounts-gradient-highlight">
                            {words.slice(-2).join(' ')}
                          </span>
                        </>
                      );
                    }
                    return <span className="discounts-gradient-highlight">{title}</span>;
                  })()}
                </h1>

                {/* Subtitle */}
                <p
                  className="discounts-hero-subtitle"
                  style={{
                    fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                    fontSize: '1.18rem',
                    color: '#334155',
                    lineHeight: 1.7,
                    marginBottom: '2rem',
                    maxWidth: '640px',
                    fontWeight: 500,
                  }}
                >
                  {getSetting(
                    'discounts_hero',
                    'subtitle',
                    'Explore handcrafted sarees, heritage jewellery, boutique kitchenware, and daily lifestyle essentials. Verified multi-category discounts applied automatically at checkout.'
                  )}
                </p>

                {/* ── UNIQUE CIRCULAR COUNTDOWN DESIGN ── */}
                {showCountdownTimerSetting && (
                  <div style={{ marginBottom: '2.2rem' }}>
                    <div
                      className="discounts-timer-label-row"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        marginBottom: '1rem',
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        color: '#6d28d9',
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                        fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                      }}
                    >
                      <Clock size={18} color="#7c3aed" />
                      <span>{timerLabelSetting}</span>
                      <span
                        style={{
                          width: '7px',
                          height: '7px',
                          borderRadius: '50%',
                          background: '#7c3aed',
                          display: 'inline-block',
                          boxShadow: '0 0 10px #7c3aed',
                        }}
                      />
                    </div>

                    {/* SVG Radial Countdown Dials with Dynamic Urgency Colors */}
                    <div className="countdown-dials-container">
                      {/* DAYS DIAL */}
                      <div className="countdown-dial-pod" title="Days Remaining">
                        <svg className="countdown-svg-ring" viewBox="0 0 90 90">
                          <defs>
                            <linearGradient id="daysDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={daysColor.stop1} />
                              <stop offset="100%" stopColor={daysColor.stop2} />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke={daysColor.trackStroke}
                            strokeWidth="5.5"
                            fill="transparent"
                          />
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke="url(#daysDialGrad)"
                            strokeWidth="5.5"
                            strokeDasharray={dialCircumference}
                            strokeDashoffset={daysDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
                          />
                        </svg>
                        <span className="countdown-number">
                          {String(countdown.days).padStart(2, '0')}
                        </span>
                        <span className="countdown-label" style={{ color: daysColor.label }}>DAYS</span>
                      </div>

                      <span className="countdown-dial-separator">:</span>

                      {/* HOURS DIAL */}
                      <div className="countdown-dial-pod" title="Hours Remaining">
                        <svg className="countdown-svg-ring" viewBox="0 0 90 90">
                          <defs>
                            <linearGradient id="hoursDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={hoursColor.stop1} />
                              <stop offset="100%" stopColor={hoursColor.stop2} />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke={hoursColor.trackStroke}
                            strokeWidth="5.5"
                            fill="transparent"
                          />
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke="url(#hoursDialGrad)"
                            strokeWidth="5.5"
                            strokeDasharray={dialCircumference}
                            strokeDashoffset={hoursDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
                          />
                        </svg>
                        <span className="countdown-number">
                          {String(countdown.hours).padStart(2, '0')}
                        </span>
                        <span className="countdown-label" style={{ color: hoursColor.label }}>HOURS</span>
                      </div>

                      <span className="countdown-dial-separator">:</span>

                      {/* MINUTES DIAL */}
                      <div className="countdown-dial-pod" title="Minutes Remaining">
                        <svg className="countdown-svg-ring" viewBox="0 0 90 90">
                          <defs>
                            <linearGradient id="minutesDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={minutesColor.stop1} />
                              <stop offset="100%" stopColor={minutesColor.stop2} />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke={minutesColor.trackStroke}
                            strokeWidth="5.5"
                            fill="transparent"
                          />
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke="url(#minutesDialGrad)"
                            strokeWidth="5.5"
                            strokeDasharray={dialCircumference}
                            strokeDashoffset={minutesDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.4s ease' }}
                          />
                        </svg>
                        <span className="countdown-number">
                          {String(countdown.minutes).padStart(2, '0')}
                        </span>
                        <span className="countdown-label" style={{ color: minutesColor.label }}>MINS</span>
                      </div>

                      <span className="countdown-dial-separator">:</span>

                      {/* SECONDS DIAL */}
                      <div className="countdown-dial-pod" title="Seconds Remaining">
                        <svg className="countdown-svg-ring" viewBox="0 0 90 90">
                          <defs>
                            <linearGradient id="secondsDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={secondsColor.stop1} />
                              <stop offset="100%" stopColor={secondsColor.stop2} />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke={secondsColor.trackStroke}
                            strokeWidth="5.5"
                            fill="transparent"
                          />
                          <circle
                            cx="45"
                            cy="45"
                            r={dialRadius}
                            stroke="url(#secondsDialGrad)"
                            strokeWidth="5.5"
                            strokeDasharray={dialCircumference}
                            strokeDashoffset={secondsDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.4s ease' }}
                          />
                        </svg>
                        <span className="countdown-number">
                          {String(countdown.seconds).padStart(2, '0')}
                        </span>
                        <span className="countdown-label" style={{ color: secondsColor.label }}>SECS</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Button Row */}
                <div className="discounts-hero-cta-row" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2.4rem' }}>
                  <a
                    href="#curated-catalog"
                    className="discounts-hero-cta-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '1.05rem 2.85rem',
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                      color: '#ffffff',
                      fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 10px 28px rgba(124, 58, 237, 0.36)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      border: 'none',
                    }}
                  >
                    <span>Shop All Deals</span>
                    <ArrowDown size={18} />
                  </a>
                </div>

                {/* Trust Micro-Badges */}
                <div className="discounts-hero-trust-row" style={{ display: 'flex', alignItems: 'center', gap: '1.85rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.92rem', fontWeight: 700, color: '#334155', fontFamily: "var(--font-secondary, 'Inter', sans-serif)" }}>
                    <CheckCircle2 size={18} color="#7c3aed" />
                    <span>Direct Artisan Guarantee</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.92rem', fontWeight: 700, color: '#334155', fontFamily: "var(--font-secondary, 'Inter', sans-serif)" }}>
                    <Truck size={18} color="#7c3aed" />
                    <span>Free Shipping &gt; ₹999</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.92rem', fontWeight: 700, color: '#334155', fontFamily: "var(--font-secondary, 'Inter', sans-serif)" }}>
                    <RotateCcw size={18} color="#7c3aed" />
                    <span>7-Day Return Policy</span>
                  </div>
                </div>
              </div>

              {/* ── Right Column: 3-Column Card Layout (Center fully visible, sides partially visible & alternating scroll) ── */}
              <div className="discounts-hero-right-col">
                <div
                  className="vertical-deals-stream-wrapper"
                  title="Hover to pause • Click any deal to explore"
                >
                  <div className="vertical-deals-stream-grid three-columns">
                    {/* Column 1: Left Flank (Partially Visible) • Moves Top to Bottom */}
                    <div className="vertical-deals-column col-side col-left">
                      {col1Cards.map((p, idx) =>
                        renderCategoryStyleDealCard(
                          p,
                          `c1-${idx}`,
                          PASTEL_PURPLE_THEMES[idx % PASTEL_PURPLE_THEMES.length]
                        )
                      )}
                    </div>

                    {/* Column 2: Center Column (Fully Visible & Prominent) • Moves Bottom to Top */}
                    <div className="vertical-deals-column col-center">
                      {col2Cards.map((p, idx) =>
                        renderCategoryStyleDealCard(
                          p,
                          `c2-${idx}`,
                          PASTEL_PURPLE_THEMES[(idx + 1) % PASTEL_PURPLE_THEMES.length]
                        )
                      )}
                    </div>

                    {/* Column 3: Right Flank (Partially Visible) • Moves Top to Bottom */}
                    <div className="vertical-deals-column col-side col-right">
                      {col3Cards.map((p, idx) =>
                        renderCategoryStyleDealCard(
                          p,
                          `c3-${idx}`,
                          PASTEL_PURPLE_THEMES[(idx + 2) % PASTEL_PURPLE_THEMES.length]
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}





        {/* ── 5. High Urgency Flash Blitz Vault (4 Cards) ── */}
        {flashDeals.length > 0 && (
          <section
            id="flash-deals-section"
            className="discounts-flash-section"
            style={{
              maxWidth: '1360px',
              margin: '4.5rem auto 3.5rem',
              padding: '0 1.5rem',
            }}
          >
            <div
              className="discounts-flash-header"
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.75rem',
                borderBottom: '1.5px solid rgba(124, 58, 237, 0.12)',
                paddingBottom: '1rem',
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
                    color: '#7c3aed',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '0.35rem',
                    fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                  }}
                >
                  <Zap size={14} color="#7c3aed" />
                  <span>HIGH-URGENCY VAULT</span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-primary, 'Playfair Display', Georgia, serif)",
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#1e1b4b',
                    margin: 0,
                  }}
                >
                  Lightning Flash Deals
                </h3>
              </div>

              <div
                className="discounts-flash-status-pill"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#f5f0fd',
                  border: '1px solid #ddd6fe',
                  padding: '0.45rem 1rem',
                  borderRadius: '999px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#6d28d9',
                  fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                }}
              >
                <Clock size={15} color="#7c3aed" />
                <span>Active Vault • Extra Discounts Applied</span>
              </div>
            </div>

            <div
              className="shop-catalog-grid discounts-product-grid"
              style={{
                display: 'grid',
                gap: '1.25rem',
              }}
            >
              {flashDeals.map((prod) => (
                <ProductCard key={prod._id || prod.id} product={prod} buyNowOnly />
              ))}
            </div>
          </section>
        )}



        {/* ── Limited Deals Parallax Fixed Feature Section ── */}
        <section className="limited-deals-parallax-section">
          <div className="limited-deals-parallax-overlay">
            <div className="limited-deals-parallax-container">
              {/* Left Column: Limited Deals Content */}
              <div className="limited-deals-parallax-content">
                <div className="limited-deals-parallax-badge">
                  <Sparkles size={14} />
                  <span>LIMITED TIME DROPS • UP TO 90% OFF</span>
                </div>

                <h2 className="limited-deals-parallax-title">
                  Artisanal Luxury at Unmatched Steal Prices
                </h2>

                <p className="limited-deals-parallax-desc">
                  Discover handcrafted heirlooms, pure silks, statement temple jewellery, and festive collections released in strictly limited drops. When the countdown reaches zero, these exclusive deals expire automatically.
                </p>

                <div className="limited-deals-parallax-perks">
                  <div className="limited-deals-parallax-perk-item">
                    <span className="limited-deals-parallax-perk-icon">
                      <Zap size={14} />
                    </span>
                    <span>Direct Artisan Sourcing with Verified Luxury Hallmarks</span>
                  </div>
                  <div className="limited-deals-parallax-perk-item">
                    <span className="limited-deals-parallax-perk-icon">
                      <Clock size={14} />
                    </span>
                    <span>Live Stock Allocation with Real-Time Price Reductions</span>
                  </div>
                  <div className="limited-deals-parallax-perk-item">
                    <span className="limited-deals-parallax-perk-icon">
                      <Truck size={14} />
                    </span>
                    <span>Priority 24H Dispatch & Safe Doorstep Reverse Pickups</span>
                  </div>
                </div>

                <a href="#curated-catalog" className="limited-deals-parallax-cta">
                  <span>Explore Limited Deals</span>
                  <ArrowRight size={17} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── 7. Main Curated Deals Catalog (Search, Filter, Sort & Grid) ── */}
        <div id="curated-catalog" className="discounts-catalog-wrap" style={{ maxWidth: '1360px', margin: '0 auto', padding: '1.5rem 1.5rem 0.5rem' }}>
          <style>{`
            @media (min-width: 1081px) {
              .discounts-product-grid {
                grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                gap: 1.25rem !important;
              }
            }
            @media (max-width: 1080px) and (min-width: 769px) {
              .discounts-product-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
                gap: 1rem !important;
              }
            }
            @media (max-width: 768px) {
              .discounts-catalog-wrap {
                padding: 0.75rem 8px 0.5rem !important;
              }
              .discounts-grid-container {
                padding: 0.5rem 8px 2.5rem !important;
              }
              .discounts-toolbar {
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 0.75rem !important;
              }
              .discounts-selects-wrap {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 0.6rem !important;
                width: 100% !important;
              }
              .discounts-select-item {
                width: 100% !important;
                min-width: 0 !important;
              }
            }
            .discounts-select-item {
              min-width: 190px;
            }
          `}</style>

          {/* Search, Category Filter & Sorting Toolbar */}
          <div
            className="discounts-toolbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingBottom: '1.5rem',
              borderBottom: '1.5px solid #f1f5f9',
            }}
          >
            {/* Left: Summary Count & Active Filter Indicator */}
            <div className="discounts-toolbar-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontFamily: "var(--font-secondary, 'Inter', sans-serif)" }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                Showing <strong style={{ color: '#1e1b4b', fontWeight: 800 }}>{filteredProducts.length}</strong> limited deals
              </span>

              {(selectedCategory !== 'all' || selectedDealBucket !== 'all' || searchQuery) && (
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
                      setSelectedDealBucket('all');
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
                      fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                    }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Right: Search, Category Dropdown Filter, Sort Dropdown */}
            <div className="discounts-toolbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div className="discounts-search-wrap" style={{ position: 'relative', width: '230px' }}>
                <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search deal items..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    paddingLeft: '34px',
                    paddingRight: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.84rem',
                    outline: 'none',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                    color: '#1e1b4b',
                    fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                  }}
                />
              </div>

              {/* 2 Selects Wrapper */}
              <div className="discounts-selects-wrap" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Category Dropdown Filter */}
                <Select
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1);
                  }}
                  options={categoryOptions}
                  align="left"
                  height="40px"
                  borderRadius="10px"
                  className="discounts-select-item"
                  buttonStyle={{
                    background: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#1e1b4b',
                    border: '1px solid #e2e8f0',
                    fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                  }}
                />

                {/* Sort By */}
                <Select
                  value={sortBy}
                  onChange={(val) => setSortBy(val)}
                  options={sortOptions}
                  align="right"
                  height="40px"
                  borderRadius="10px"
                  className="discounts-select-item"
                  buttonStyle={{
                    background: '#ffffff',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: '#1e1b4b',
                    border: '1px solid #e2e8f0',
                    fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 8. Main Product Deals Grid ── */}
        <div className="discounts-grid-container" style={{ maxWidth: '1360px', margin: '0 auto', padding: '1rem 1.5rem 3.5rem' }}>
          {loading ? (
            <MobileSkeleton
              variant="product-grid"
              count={4}
              fallback={(
                <div style={{ padding: '6rem 0', textAlign: 'center' }}>
                  <Spinner size="lg" />
                  <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.92rem', fontFamily: "var(--font-secondary, 'Inter', sans-serif)" }}>
                    Loading verified limited deals from catalog...
                  </p>
                </div>
              )}
            />
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                padding: '4rem 1.5rem',
                textAlign: 'center',
                border: '1.5px solid #f1f5f9',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
              }}
            >
              <Tag size={36} color="#7c3aed" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.5rem', color: '#1e1b4b', fontFamily: "var(--font-primary, 'Playfair Display', Georgia, serif)" }}>
                No deals match your selected filters
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
                Try adjusting your budget filter, category, or search term to discover more deals.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDealBucket('all');
                  setSearchQuery('');
                }}
                style={{
                  padding: '0.7rem 1.8rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div>
              <div
                className="shop-catalog-grid discounts-product-grid"
                style={{
                  display: 'grid',
                  gap: '1.25rem',
                }}
              >
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod._id || prod.id} product={prod} buyNowOnly />
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
                    borderTop: '1.5px solid #f1f5f9',
                    fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} deals
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: currentPage === 1 ? '#cbd5e1' : '#334155',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
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
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: isActive ? 'none' : '1px solid #e2e8f0',
                            background: isActive
                              ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'
                              : '#ffffff',
                            color: isActive ? '#ffffff' : '#334155',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: isActive ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
                            fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
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
                        padding: '0.45rem 0.9rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        color: currentPage === totalPages ? '#cbd5e1' : '#334155',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
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

        {/* ── Community CTA Banner ── */}
        <section className="hp-final-cta-section" style={{ paddingTop: '2rem', paddingBottom: '3.5rem' }}>
          <div className="hp-final-cta-container" style={{ padding: 0 }}>
            <div className="hp-final-cta-box">
              <span className="hp-final-cta-badge">✦ JOIN OUR COMMUNITY</span>
              <h2 className="hp-final-title">Connect With Us @picky.co.in</h2>
              <p className="hp-final-subtitle">
                Follow us on Instagram & WhatsApp for daily style inspiration, exclusive drops, and behind-the-scenes stories.
              </p>
              <div className="hp-final-cta-btn-group no-hover-fx">
                <button
                  type="button"
                  className="hp-final-cta-btn no-hover-fx"
                  onClick={() => window.open(getSetting('about_community', 'instagramLink', 'https://www.instagram.com/picky.co.in/'), '_blank', 'noopener,noreferrer')}
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
                  onClick={() => window.open(`https://wa.me/${getSetting('about_community', 'whatsappNumber', '918300295721')}?text=Hi%20Picky!%20I%20would%20like%20to%20join%20the%20community.`, '_blank', 'noopener,noreferrer')}
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
            </div>
          </div>
        </section>

        {/* ── 11. Sticky Mini Countdown Urgency Bar (On Scroll) ── */}
        {showStickyBar && showCountdownTimerSetting && (
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 900,
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              borderTop: '1.5px solid rgba(124, 58, 237, 0.2)',
              boxShadow: '0 -8px 30px rgba(124, 58, 237, 0.12)',
              padding: '0.65rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              fontFamily: "var(--font-secondary, 'Inter', sans-serif)",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#f5f0fd',
                  border: '1px solid #ddd6fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={16} color="#7c3aed" />
              </div>
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#3b0764' }}>
                  LIMITED DEALS ENDING SOON
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#7c3aed' }}>
                  {String(countdown.days).padStart(2, '0')}d : {String(countdown.hours).padStart(2, '0')}h :{' '}
                  {String(countdown.minutes).padStart(2, '0')}m : {String(countdown.seconds).padStart(2, '0')}s
                </div>
              </div>
            </div>

            <a
              href="#curated-catalog"
              style={{
                padding: '0.55rem 1.35rem',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                whiteSpace: 'nowrap',
              }}
            >
              Shop Deals
            </a>
          </div>
        )}

        {/* ── 12. In-Page Interactive Floating Toast ── */}
        {toastMessage && (
          <div className="deal-inpage-toast">
            <CheckCircle2 size={18} color="#4ade80" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
