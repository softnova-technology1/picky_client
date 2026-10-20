import {
  Award,
  Flame,
  TrendingUp,
  Sparkles,
  Zap,
  Gem,
  Rocket,
  Compass,
  Heart,
  Sun,
  ShieldCheck,
  Bookmark,
  Tag,
  Feather,
  Star,
} from 'lucide-react';

/**
 * Exactly 5 Default Tags given by admin
 */
export const DEFAULT_PRODUCT_TAGS = [
  'Top Product',
  'Best Sellers',
  'Trending Now',
  'New Arrivals',
  'Limited Deals',
];

/**
 * Fixed signature visual styles & real Lucide icons for the 5 defaults
 */
export const DEFAULT_TAG_CONFIGS = {
  'top product': {
    name: 'Top Product',
    displayName: 'TOP PRODUCT',
    icon: Award,
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  'best sellers': {
    name: 'Best Sellers',
    displayName: 'BEST SELLERS',
    icon: Flame,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
  'trending now': {
    name: 'Trending Now',
    displayName: 'TRENDING NOW',
    icon: TrendingUp,
    color: '#e11d48',
    bg: '#ffe4e6',
    border: '#fecdd3',
  },
  'new arrivals': {
    name: 'New Arrivals',
    displayName: 'NEW ARRIVALS',
    icon: Sparkles,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  'limited deals': {
    name: 'Limited Deals',
    displayName: 'LIMITED DEALS',
    icon: Zap,
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
  },
};

/**
 * Non-default color and icon design system for newly created custom tags.
 * Ensures custom tags NEVER share the exact colors or icons of default tags.
 */
export const CUSTOM_TAG_PALETTES = [
  {
    icon: Gem,
    color: '#9333ea', // Electric Violet
    bg: '#faf5ff',
    border: '#f3e8ff',
  },
  {
    icon: Rocket,
    color: '#0284c7', // Ocean Sky
    bg: '#f0f9ff',
    border: '#bae6fd',
  },
  {
    icon: Compass,
    color: '#15803d', // Forest Emerald
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    icon: Heart,
    color: '#c026d3', // Radiant Fuchsia
    bg: '#fdf4ff',
    border: '#f5d0fe',
  },
  {
    icon: Sun,
    color: '#b45309', // Warm Bronze
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    icon: ShieldCheck,
    color: '#4338ca', // Deep Indigo
    bg: '#eef2ff',
    border: '#c7d2fe',
  },
  {
    icon: Bookmark,
    color: '#0f766e', // Deep Teal
    bg: '#f0fdfa',
    border: '#99f6e4',
  },
  {
    icon: Feather,
    color: '#4f46e5', // Iris Blue
    bg: '#eef2ff',
    border: '#e0e7ff',
  },
  {
    icon: Tag,
    color: '#be123c', // Crimson Ruby
    bg: '#fff1f2',
    border: '#fecdd3',
  },
  {
    icon: Star,
    color: '#854d0e', // Golden Amber
    bg: '#fefce8',
    border: '#fef08a',
  },
];

/**
 * Compute deterministic hash from string to consistently pick a unique design
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Extracts the primary tag string from a product object
 */
export function extractProductTag(product, fallbackBadge = null) {
  if (!product) return fallbackBadge || null;

  // 1. Array tags from database / form
  if (Array.isArray(product.tags) && product.tags.length > 0) {
    const firstValid = product.tags.find((t) => typeof t === 'string' && t.trim() !== '');
    if (firstValid) return firstValid.trim();
  }

  // 2. Comma-delimited or plain string tag
  if (typeof product.tags === 'string' && product.tags.trim()) {
    const firstPart = product.tags.split(',')[0].trim();
    if (firstPart) return firstPart;
  }

  // 3. Single tag property
  if (typeof product.tag === 'string' && product.tag.trim()) {
    return product.tag.trim();
  }

  // 4. Fallback badge property if present
  if (typeof product.badge === 'string' && product.badge.trim()) {
    return product.badge.trim();
  }

  // 5. Fallback badgeText from props
  if (typeof fallbackBadge === 'string' && fallbackBadge.trim()) {
    return fallbackBadge.trim();
  }

  // 6. Featured flag fallback
  if (product.isFeatured) {
    return 'Top Product';
  }

  return null;
}

/**
 * Resolves full visual styling (name, uppercase text, Lucide icon, colors) for any tag.
 * For the 5 defaults: uses their specific signature design.
 * For any newly created custom tag: deterministically generates a distinct non-default color & icon.
 */
export function getTagDesign(rawTag) {
  if (!rawTag || typeof rawTag !== 'string') return null;
  const clean = rawTag.trim();
  if (!clean) return null;

  const lower = clean.toLowerCase();

  // Check against the 5 defaults (including aliases)
  if (lower === 'top product' || lower === 'top' || lower.includes('top product')) {
    return DEFAULT_TAG_CONFIGS['top product'];
  }
  if (lower === 'best sellers' || lower === 'best seller' || lower === 'bestseller' || lower === 'bestsellers') {
    return DEFAULT_TAG_CONFIGS['best sellers'];
  }
  if (lower === 'trending now' || lower === 'trending' || lower === 'trend' || lower.includes('trending now')) {
    return DEFAULT_TAG_CONFIGS['trending now'];
  }
  if (lower === 'new arrivals' || lower === 'new arrival' || lower === 'new' || lower.includes('new arrival')) {
    return DEFAULT_TAG_CONFIGS['new arrivals'];
  }
  if (lower === 'limited deals' || lower === 'limited deal' || lower === 'limited' || lower === 'deal' || lower.includes('limited deal')) {
    return DEFAULT_TAG_CONFIGS['limited deals'];
  }

  // NEW CUSTOM TAG: Generate unique, non-existing tag design
  const paletteIndex = hashString(clean) % CUSTOM_TAG_PALETTES.length;
  const palette = CUSTOM_TAG_PALETTES[paletteIndex];

  return {
    name: clean,
    displayName: clean.toUpperCase(),
    icon: palette.icon,
    color: palette.color,
    bg: palette.bg,
    border: palette.border,
    isCustom: true,
  };
}
