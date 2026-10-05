// ─── Picky Customer Store Main Data Layer ─────────────────────────────────────
// Centralized mock data seamlessly shared with Admin Portal via adminMockData.

import {
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_COUPONS,
} from './adminMockData';

export * from './reviewsData';

// Re-export synchronized collections
export const categories = MOCK_CATEGORIES;
export const products = MOCK_PRODUCTS;
export const mockOrders = MOCK_ORDERS;
export const coupons = MOCK_COUPONS;

export const heroSlides = [
  {
    id: 'slide_1',
    eyebrow: 'NEW ARRIVALS',
    title: 'LUXE',
    subtitle: 'NEW DROP',
    leftImage: '/images/slide_1_left.jpg',
    rightImage: '/images/slide_1_right.jpg',
    ctaText: 'SHOP NOW',
    ctaLink: '/products',
  },
  {
    id: 'slide_2',
    eyebrow: 'EXCLUSIVELY OUR',
    title: 'BRAND',
    subtitle: '50% OFF',
    leftImage: '/images/slide_2_left.jpg',
    rightImage: '/images/slide_2_right.jpg',
    ctaText: 'SHOP NOW',
    ctaLink: '/products',
  },
  {
    id: 'slide_3',
    eyebrow: 'PREMIUM SELECTION',
    title: 'URBAN',
    subtitle: '30% OFF',
    leftImage: '/images/slide_3_left.jpg',
    rightImage: '/images/slide_3_right.jpg',
    ctaText: 'SHOP NOW',
    ctaLink: '/products',
  },
];

// ── Value Propositions & Trust Features ───────────────────────────────────────
export const valuePropositions = [
  {
    icon: '✨',
    title: '100% Curated Quality',
    description: 'Every product physically inspected before fulfillment.',
  },
  {
    icon: '🚚',
    title: 'Fast Dispatch (24-48h)',
    description: 'Direct courier dispatch across India with live AWB tracking.',
  },
  {
    icon: '💬',
    title: 'Live WhatsApp Updates',
    description: 'Real-time order milestone notifications right on your phone.',
  },
  {
    icon: '🔒',
    title: 'Safe & Secure Payments',
    description: '100% encrypted online payments via Razorpay UPI & Cards.',
  },
];

export const promoOffer = {
  badge: 'LIMITED TIME WELCOME OFFER',
  title: 'Flat ₹100 OFF On Your First Order',
  subtitle: 'Use coupon code WELCOME100 on orders above ₹999. Fast courier shipping guaranteed.',
  code: 'WELCOME100',
  discountAmount: 100,
  minOrderAmount: 999,
};

export const storeInfo = {
  name: 'Picky Store',
  tagline: 'Carefully Picked, Lovingly Delivered',
  supportPhone: '+91 98765 43210',
  supportEmail: 'care@pickystore.com',
  workingHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  address: 'Softnova Hub, Anna Salai, Chennai, Tamil Nadu - 600002',
};

// Slug alias map: URL slug → canonical data slug
export const SLUG_ALIAS_MAP = {
  'women-fashion': 'womens-fashion',
  'womens-fashion': 'womens-fashion',
  'home-kitchen': 'home-kitchen',
  'artificial-jewellery': 'artificial-jewellery',
  'beauty-personal-care': 'beauty-personal-care',
  'beauty-and-personal-care': 'beauty-personal-care',
  'mobile-accessories': 'mobile-accessories',
  'traditional-tamil-products': 'traditional-tamil-products',
  'traditional-tamil': 'traditional-tamil-products',
};

// ── Helper Lookup Functions ───────────────────────────────────────────────────

export function getProducts(options = {}) {
  const { category, subCategory, sort = 'newest', search, limit, isFeatured } = options;
  let result = [...products];

  if (category) {
    const catLower = category.toLowerCase().trim().replace(/[\s_]+/g, '-');
    const resolvedCat = SLUG_ALIAS_MAP[catLower] || catLower;
    result = result.filter(
      (p) =>
        p.category?._id === category ||
        p.category?.slug === category ||
        p.category?.slug?.toLowerCase() === catLower ||
        p.category?.slug?.toLowerCase() === resolvedCat ||
        p.category === category
    );
  }

  if (subCategory) {
    const subLower = subCategory.toLowerCase();
    result = result.filter(
      (p) =>
        p.subCategory?._id === subCategory ||
        p.subCategory?.slug === subCategory ||
        p.subCategory?.slug?.toLowerCase() === subLower ||
        p.subCategory === subCategory
    );
  }

  if (isFeatured !== undefined) {
    result = result.filter((p) => p.isFeatured === isFeatured);
  }

  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.subCategory?.name?.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (sort === 'price_desc') {
    result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (sort === 'featured') {
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  } else {
    result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  if (limit && limit > 0) {
    result = result.slice(0, limit);
  }

  return result;
}

export function getProductBySlug(slug) {
  if (!slug) return null;
  const s = slug.toLowerCase();
  return (
    products.find((p) => p.slug?.toLowerCase() === s) ||
    products.find((p) => p._id === slug) ||
    products[0]
  );
}

export function getProductById(id) {
  if (!id) return null;
  return products.find((p) => p._id === id || p.slug === id) || null;
}

export function getCategories() {
  return [...categories];
}

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const decoded = decodeURIComponent(slug).toLowerCase().trim();
  const normalized = decoded.replace(/[\s_]+/g, '-');
  // Resolve alias first
  const aliasResolved = SLUG_ALIAS_MAP[normalized] || SLUG_ALIAS_MAP[decoded] || normalized;
  return (
    categories.find((c) => c.slug?.toLowerCase() === aliasResolved) ||
    categories.find((c) => c.slug?.toLowerCase() === normalized) ||
    categories.find((c) => c.slug?.toLowerCase() === decoded) ||
    categories.find((c) => c._id === slug) ||
    categories.find((c) => c.name?.toLowerCase() === decoded) ||
    null
  );
}

export function getSubcategoriesByCategory(categorySlug) {
  const cat = getCategoryBySlug(categorySlug);
  return cat?.subcategories || [];
}

export function getSubcategoryBySlug(categorySlug, subSlug) {
  const subcats = getSubcategoriesByCategory(categorySlug);
  if (!subSlug) return null;
  const decoded = decodeURIComponent(subSlug).toLowerCase().trim();
  const normalized = decoded.replace(/[\s_]+/g, '-');
  return (
    subcats.find((sub) => sub.slug?.toLowerCase() === normalized) ||
    subcats.find((sub) => sub.slug?.toLowerCase() === decoded) ||
    subcats.find((sub) => sub._id === subSlug) ||
    subcats.find((sub) => sub.name?.toLowerCase() === decoded) ||
    null
  );
}

export function searchProducts(query, params = {}) {
  return getProducts({ search: query, ...params });
}

export function validateCoupon(code, subtotal = 0) {
  if (!code) return { valid: false, message: 'Please enter a coupon code' };
  const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

  if (!found) {
    return { valid: false, message: 'Invalid coupon code' };
  }

  if (subtotal < (found.minOrderAmount || 0)) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${found.minOrderAmount} required for this coupon`,
    };
  }

  let discount = 0;
  if (found.type === 'percentage') {
    discount = Math.round((subtotal * found.value) / 100);
    if (found.maxDiscountAmount) {
      discount = Math.min(discount, found.maxDiscountAmount);
    }
  } else if (found.type === 'flat') {
    discount = Math.min(subtotal, found.value);
  }

  return {
    valid: true,
    code: found.code,
    couponDiscount: discount,
    description: `Coupon ${found.code} applied successfully!`,
  };
}

export function addOrderToStore(newOrder) {
  if (!newOrder) return;
  const pId = newOrder._id || newOrder.id || newOrder.orderNumber;
  const existing = mockOrders.find((o) => (o._id || o.id || o.orderNumber) === pId);
  if (!existing) {
    mockOrders.unshift(newOrder);
  }
  try {
    const saved = JSON.parse(localStorage.getItem('picky_created_orders') || '[]');
    const isSaved = saved.some((o) => (o._id || o.id || o.orderNumber) === pId);
    if (!isSaved) {
      saved.unshift(newOrder);
      localStorage.setItem('picky_created_orders', JSON.stringify(saved));
    }
  } catch (_) {}
}

export function getOrders() {
  let localCreated = [];
  try {
    localCreated = JSON.parse(localStorage.getItem('picky_created_orders') || '[]');
  } catch (_) {}
  const combined = [...localCreated, ...mockOrders];
  const uniqueMap = new Map();
  combined.forEach((o) => {
    const key = o._id || o.id || o.orderNumber;
    if (!uniqueMap.has(key)) uniqueMap.set(key, o);
  });
  return Array.from(uniqueMap.values());
}

export function getOrderById(id) {
  if (!id) return mockOrders[0];
  const all = getOrders();
  return (
    all.find((o) => (o._id || o.id || o.orderNumber) === id || o.orderNumber?.includes(id)) ||
    all[0]
  );
}

export const blogStories = [
  {
    id: 1,
    category: 'Shopping Guides',
    title: 'Smart Buying: How to Choose Quality Accessories for Every Budget',
    excerpt: 'Key indicators of durability, warranty perks, and value factors to check before adding items to your cart.',
    image: '/images/blog/blog_featured_desk.jpg',
    author: 'Maya Lin',
    date: 'Oct 3, 2026',
    readTime: '4 min read'
  },
  {
    id: 2,
    category: 'Product Tips',
    title: 'The Tactile Revolution: Unlocking Peak Product Experience',
    excerpt: 'An inside look at acoustic profiles, material ergonomics, and maintenance tips to double product longevity.',
    image: '/images/blog/blog_hero_slash.jpg',
    author: 'Alex Chen',
    date: 'Sep 29, 2026',
    readTime: '6 min read'
  },
  {
    id: 3,
    category: 'Lifestyle',
    title: 'Curated Everyday Living: Minimalist Gear for Modern Posture',
    excerpt: 'Disassembling complex routines into simple, elegant daily habits with essential lifestyle tools.',
    image: '/images/blog/blog_featured_audio.jpg',
    author: 'David Vance',
    date: 'Sep 25, 2026',
    readTime: '8 min read'
  },
  {
    id: 4,
    category: 'Fashion',
    title: 'Curated Wardrobe & Accessories: Essential Drops for Minimalists',
    excerpt: 'Our top recommendations for everyday carry gear, premium textures, and functional fashion accents.',
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    author: 'Sarah Jenkins',
    date: 'Sep 20, 2026',
    readTime: '5 min read'
  },
  {
    id: 5,
    category: 'Home & Kitchen',
    title: 'Elevating Your Home: Thoughtful Organizers & Kitchen Craft',
    excerpt: 'Exploring space-saving storage boxes, precision tools, and aesthetics that transform your living space.',
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80',
    author: 'Karan Malhotra',
    date: 'Sep 14, 2026',
    readTime: '7 min read'
  },
  {
    id: 6,
    category: 'Picky Updates',
    title: 'What’s New at Picky: Seasonal Drops & Exclusive Member Perks',
    excerpt: 'Discover our latest Tamil traditional craft collection, quick delivery milestones, and new feature updates.',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=80',
    author: 'Elena Rostova',
    date: 'Sep 10, 2026',
    readTime: '5 min read'
  }
];

export default {
  heroSlides,
  categories,
  products,
  valuePropositions,
  promoOffer,
  coupons,
  mockOrders,
  storeInfo,
  blogStories,
  getProducts,
  getProductBySlug,
  getProductById,
  getCategories,
  getCategoryBySlug,
  getSubcategoriesByCategory,
  getSubcategoryBySlug,
  searchProducts,
  validateCoupon,
  getOrders,
  getOrderById,
  addOrderToStore,
};
