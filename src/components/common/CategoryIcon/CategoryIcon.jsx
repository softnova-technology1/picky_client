import React from 'react';

// ─── Curated Luxury Palette & Metadata for Picky Departments ─────────────────
export const CATEGORY_THEMES = {
  'womens-fashion': {
    name: "Women's Fashion",
    gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    iconGradientId: 'grad-fashion',
    startColor: '#ec4899',
    stopColor: '#8b5cf6',
    bgLight: '#fdf2f8',
    borderColor: '#fbcfe8',
    glowColor: 'rgba(236, 72, 153, 0.22)',
    textColor: '#9d174d',
    badge: 'Popular',
  },
  'artificial-jewellery': {
    name: 'Artificial Jewellery',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)',
    iconGradientId: 'grad-jewellery',
    startColor: '#f59e0b',
    stopColor: '#ec4899',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    glowColor: 'rgba(245, 158, 11, 0.22)',
    textColor: '#92400e',
    badge: 'Trending',
  },
  'mobile-accessories': {
    name: 'Mobile Accessories',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    iconGradientId: 'grad-mobile',
    startColor: '#06b6d4',
    stopColor: '#3b82f6',
    bgLight: '#ecfeff',
    borderColor: '#a5f3fc',
    glowColor: 'rgba(6, 182, 212, 0.22)',
    textColor: '#0e7490',
    badge: 'Hot Deals',
  },
  'home-kitchen': {
    name: 'Home & Kitchen',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
    iconGradientId: 'grad-kitchen',
    startColor: '#f97316',
    stopColor: '#ef4444',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    glowColor: 'rgba(249, 115, 22, 0.22)',
    textColor: '#9a3412',
    badge: 'Best Seller',
  },
  'beauty-personal-care': {
    name: 'Beauty & Personal Care',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #d946ef 100%)',
    iconGradientId: 'grad-beauty',
    startColor: '#f43f5e',
    stopColor: '#d946ef',
    bgLight: '#fff1f2',
    borderColor: '#fecdd3',
    glowColor: 'rgba(244, 63, 94, 0.22)',
    textColor: '#9f1239',
    badge: 'Glow',
  },
  'traditional-tamil-products': {
    name: 'Traditional Tamil Products',
    gradient: 'linear-gradient(135deg, #eab308 0%, #ea580c 100%)',
    iconGradientId: 'grad-tamil',
    startColor: '#eab308',
    stopColor: '#ea580c',
    bgLight: '#fefce8',
    borderColor: '#fef08a',
    glowColor: 'rgba(234, 179, 8, 0.22)',
    textColor: '#854d0e',
    badge: 'Authentic Tamil',
  },
  'snacks-foods': {
    name: 'Snacks & Foods',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    iconGradientId: 'grad-snacks',
    startColor: '#10b981',
    stopColor: '#059669',
    bgLight: '#ecfdf5',
    borderColor: '#a7f3d0',
    glowColor: 'rgba(16, 185, 129, 0.22)',
    textColor: '#065f46',
    badge: 'Fresh & Crunchy',
  },
  'home-decor': {
    name: 'Home Décor',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    iconGradientId: 'grad-decor',
    startColor: '#8b5cf6',
    stopColor: '#6366f1',
    bgLight: '#f5f3ff',
    borderColor: '#ddd6fe',
    glowColor: 'rgba(139, 92, 246, 0.22)',
    textColor: '#5b21b6',
    badge: 'Aesthetic',
  },
  'kids-products': {
    name: 'Kids Products',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    iconGradientId: 'grad-kids',
    startColor: '#3b82f6',
    stopColor: '#8b5cf6',
    bgLight: '#eff6ff',
    borderColor: '#bfdbfe',
    glowColor: 'rgba(59, 130, 246, 0.22)',
    textColor: '#1e40af',
    badge: 'Playful',
  },
  'fitness-products': {
    name: 'Fitness Products',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    iconGradientId: 'grad-fitness',
    startColor: '#14b8a6',
    stopColor: '#06b6d4',
    bgLight: '#f0fdfa',
    borderColor: '#99f6e4',
    glowColor: 'rgba(20, 184, 166, 0.22)',
    textColor: '#115e59',
    badge: 'Wellness',
  },
};

// ─── Bespoke Luxury Vector SVG Glyphs ─────────────────────────────────────────
function RenderVectorGlyph({ slug, size = 24, strokeWidth = 2, fill = 'none' }) {
  const theme = CATEGORY_THEMES[slug] || CATEGORY_THEMES['womens-fashion'];
  const gradId = `cat-svg-${slug}-${Math.random().toString(36).substr(2, 4)}`;

  const defs = (
    <defs>
      <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={theme.startColor} />
        <stop offset="100%" stopColor={theme.stopColor} />
      </linearGradient>
    </defs>
  );

  const stroke = `url(#${gradId})`;

  switch (slug) {
    case 'womens-fashion':
      // Haute couture gown silhouette with sparkle
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <path d="M12 2a3 3 0 0 0-3 3c0 .8.3 1.5.8 2L5 10l2 12h10l2-12-4.8-3c.5-.5.8-1.2.8-2a3 3 0 0 0-3-3z" />
          <path d="M9 13c1.5 1.5 4.5 1.5 6 0" />
          <path d="M12 7v3" />
          <path d="M19 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" strokeWidth={1.5} fill={theme.startColor} opacity={0.8} />
        </svg>
      );

    case 'artificial-jewellery':
      // Multi-facet brilliant-cut diamond / gemstone
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <path d="M6 3h12l4 6-10 12L2 9z" />
          <path d="M2 9h20" />
          <path d="M10 3l-2 6 4 12 4-12-2-6" />
          <path d="M12 3v6" />
          <circle cx="19" cy="4" r="1.5" fill={theme.startColor} stroke="none" />
        </svg>
      );

    case 'mobile-accessories':
      // Modern borderless smartphone + wireless lightning charging
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <path d="M12 18h.01" strokeWidth={3} />
          <path d="M13 7l-3 4h4l-2 4" strokeWidth={1.8} />
          <path d="M9 2h6" strokeWidth={1.5} />
        </svg>
      );

    case 'home-kitchen':
      // Chef culinary casserole pot with simmering steam
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <path d="M4 11h16v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-7z" />
          <path d="M2 11h20" />
          <path d="M12 7c0-2.5-1-4-1-4s2.5 1 2.5 4" />
          <path d="M8 7c0-2-1-3-1-3s2 1 2 3" />
          <path d="M16 7c0-2-1-3-1-3s2 1 2 3" />
          <path d="M2 14h2" />
          <path d="M20 14h2" />
        </svg>
      );

    case 'beauty-personal-care':
      // Luxury perfume crystal flacon with sparkle mist
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <rect x="6" y="9" width="12" height="13" rx="3" />
          <path d="M9 5h6v4H9z" />
          <path d="M10 2h4v3h-4z" />
          <circle cx="12" cy="15" r="2.5" strokeDasharray="1 1" />
          <path d="M19 4l1 1.5 1.5 1-1.5 1-1 1.5-1-1.5-1.5-1 1.5-1z" strokeWidth={1.2} fill={theme.startColor} opacity={0.8} />
        </svg>
      );

    case 'traditional-tamil-products':
      // Traditional Heritage Brass Nachiarkoil Deepam (Vilakku)
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          {/* Base pedestal */}
          <path d="M6 21h12" />
          <path d="M8 21v-2h8v2" />
          <path d="M12 19v-4" />
          {/* Vilakku Bowl */}
          <path d="M4 14c0 1.5 3.5 2.5 8 2.5s8-1 8-2.5-3.5-2.5-8-2.5-8 1-8 2.5z" />
          {/* Flame of the Deepam */}
          <path d="M12 3c-1.5 2-2.5 3.5-2.5 5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-1.5-1-3-2.5-5z" fill={theme.startColor} opacity={0.35} />
          <path d="M12 3c-1.5 2-2.5 3.5-2.5 5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-1.5-1-3-2.5-5z" />
          {/* Rays / Aura */}
          <circle cx="12" cy="7" r="6" strokeDasharray="2 3" opacity={0.4} />
        </svg>
      );

    case 'snacks-foods':
      // Gourmet South Indian savory bowl with aroma waves
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <path d="M3 11c0 5 4 9 9 9s9-4 9-9H3z" />
          <path d="M2 11h20" />
          <path d="M8 21h8" strokeWidth={2.2} />
          {/* Steam/Crunch ripples */}
          <path d="M8 6c0-1.5 1-2.5 1-2.5" />
          <path d="M12 7c0-2 1-3.5 1-3.5" />
          <path d="M16 6c0-1.5 1-2.5 1-2.5" />
          <circle cx="9" cy="14" r="1" fill={theme.startColor} stroke="none" />
          <circle cx="15" cy="14" r="1" fill={theme.stopColor} stroke="none" />
          <circle cx="12" cy="16" r="1.2" fill={theme.startColor} stroke="none" />
        </svg>
      );

    case 'home-decor':
      // Modern living room floor lamp & aesthetic sofa silhouette
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          {/* Floor lamp shade */}
          <path d="M9 7l2-5h2l2 5z" />
          <path d="M12 7v14" />
          <path d="M9 21h6" />
          {/* Ambient wall frames / decor plant */}
          <rect x="3" y="12" width="4" height="6" rx="1" opacity={0.65} />
          <path d="M17 14c1.5 0 3 .8 3 2.5V19h-5v-2.5c0-1.7 1-2.5 2-2.5z" />
          <circle cx="12" cy="4.5" r="1" fill={theme.startColor} stroke="none" />
        </svg>
      );

    case 'kids-products':
      // Playful Wonder Rocket & Joy Star
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <circle cx="15.5" cy="8.5" r="1.5" fill={theme.startColor} stroke="none" />
          <path d="M9 21l1-3-3 1z" fill={theme.stopColor} opacity={0.7} />
        </svg>
      );

    case 'fitness-products':
      // Olympic Fitness Dumbbell with dynamic pulse wave
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <path d="M6.5 6.5l11 11" strokeWidth={2.6} />
          {/* Left weights */}
          <path d="M4 9L9 4l1.5 1.5L5.5 10.5z" fill={theme.startColor} opacity={0.3} />
          <path d="M4 9L9 4" />
          <path d="M2.5 7.5L7.5 2.5" strokeWidth={2.4} />
          {/* Right weights */}
          <path d="M15 20l5-5-1.5-1.5L13.5 18.5z" fill={theme.stopColor} opacity={0.3} />
          <path d="M15 20l5-5" />
          <path d="M16.5 21.5L21.5 16.5" strokeWidth={2.4} />
          {/* Energy pulse */}
          <path d="M2 17h3l2-3 2 6 2-3h3" strokeWidth={1.6} opacity={0.75} />
        </svg>
      );

    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          {defs}
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      );
  }
}

// ─── Main CategoryIcon Component ─────────────────────────────────────────────
export default function CategoryIcon({
  slug = 'womens-fashion',
  size = 44,
  iconSize = 22,
  variant = 'glass', // 'glass' | 'solid' | 'badge' | 'minimal'
  className = '',
  style = {},
}) {
  const theme = CATEGORY_THEMES[slug] || CATEGORY_THEMES['womens-fashion'];

  if (variant === 'minimal') {
    return (
      <div
        className={`category-icon-minimal ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <RenderVectorGlyph slug={slug} size={iconSize} strokeWidth={2} />
      </div>
    );
  }

  // Premium Squircle Glassmorphism Container
  return (
    <div
      className={`category-icon-squircle ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: size <= 40 ? '10px' : '14px',
        background: theme.bgLight,
        border: `1.5px solid ${theme.borderColor}`,
        boxShadow: size <= 40 ? `0 2px 8px ${theme.glowColor}` : `0 4px 14px ${theme.glowColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {/* Subtle glass reflection highlight */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0) 100%)',
          pointerEvents: 'none',
        }}
      />
      <RenderVectorGlyph slug={slug} size={iconSize} strokeWidth={2} />
    </div>
  );
}
