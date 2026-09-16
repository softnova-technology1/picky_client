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

// ── Helper Lookup Functions ───────────────────────────────────────────────────

export function getProducts(options = {}) {
  const { category, subCategory, sort = 'newest', search, limit, isFeatured } = options;
  let result = [...products];

  if (category) {
    const catLower = category.toLowerCase();
    result = result.filter(
      (p) =>
        p.category?._id === category ||
        p.category?.slug === category ||
        p.category?.slug?.toLowerCase() === catLower ||
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
  const s = slug.toLowerCase();
  return (
    categories.find((c) => c.slug?.toLowerCase() === s) ||
    categories.find((c) => c._id === slug) ||
    null
  );
}

export function getSubcategoriesByCategory(categorySlug) {
  const cat = getCategoryBySlug(categorySlug);
  return cat?.subcategories || [];
}

export function getSubcategoryBySlug(categorySlug, subSlug) {
  const subcats = getSubcategoriesByCategory(categorySlug);
  const s = (subSlug || '').toLowerCase();
  return (
    subcats.find((sub) => sub.slug?.toLowerCase() === s) ||
    subcats.find((sub) => sub._id === subSlug) ||
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

export default {
  heroSlides,
  categories,
  products,
  valuePropositions,
  promoOffer,
  coupons,
  mockOrders,
  storeInfo,
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
