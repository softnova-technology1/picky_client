// ─── Picky Centralized Multi-Theme Design System ────────────────────────
// Provides instant full-storefront theme switching across all customer-facing
// and admin pages (Navbar, Footer, Buttons, Badges, Cards, Gradients, Shadows).

export const THEME_PRESETS = [
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Current signature luxury look with rich violet & lilac accents',
    badge: 'Signature Default',
    primary: '#7c3aed',
    hover: '#6d28d9',
    dark: '#581c87',
    light: '#f3e8ff',
    subtle: '#faf5ff',
    border: '#e9d5ff',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #c026d3 100%)',
    subtleGradient: 'linear-gradient(180deg, #faf5ff 0%, #f3e8ff 50%, #ede9fe 100%)',
    shadowRgb: '124, 58, 237',
  },
  {
    id: 'rose',
    name: 'Crimson Rose & Ruby',
    description: 'Festive bridal rose & silk saree red for weddings and celebration drops',
    badge: 'Bridal & Festive',
    primary: '#e11d48',
    hover: '#be123c',
    dark: '#881337',
    light: '#ffe4e6',
    subtle: '#fff1f2',
    border: '#fecdd3',
    accent: '#f43f5e',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 50%, #fb7185 100%)',
    subtleGradient: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 50%, #fecdd3 100%)',
    shadowRgb: '225, 29, 72',
  },
  {
    id: 'emerald',
    name: 'Emerald Heritage Green',
    description: 'Organic handloom and pure cotton boutique vibe with earthy natural green',
    badge: 'Organic & Handloom',
    primary: '#059669',
    hover: '#047857',
    dark: '#064e3b',
    light: '#d1fae5',
    subtle: '#ecfdf5',
    border: '#a7f3d0',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 50%, #34d399 100%)',
    subtleGradient: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
    shadowRgb: '5, 150, 105',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Royal Blue',
    description: 'Crisp contemporary modern luxury with dependable sapphire tones',
    badge: 'Modern Classic',
    primary: '#2563eb',
    hover: '#1d4ed8',
    dark: '#1e3a8a',
    light: '#dbeafe',
    subtle: '#eff6ff',
    border: '#bfdbfe',
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #60a5fa 100%)',
    subtleGradient: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
    shadowRgb: '37, 99, 235',
  },
  {
    id: 'amber',
    name: 'Sunset Amber & Gold',
    description: 'Diwali festive gold and warm shimmer for grand ethnic celebration collections',
    badge: 'Festival Gold',
    primary: '#d97706',
    hover: '#b45309',
    dark: '#78350f',
    light: '#fef3c7',
    subtle: '#fffbeb',
    border: '#fde68a',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 50%, #fbbf24 100%)',
    subtleGradient: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 50%, #fde68a 100%)',
    shadowRgb: '217, 119, 6',
  },
  {
    id: 'midnight',
    name: 'Midnight Onyx Black',
    description: 'Ultra-minimal monochrome couture with sleek slate dark accents',
    badge: 'Minimal Couture',
    primary: '#0f172a',
    hover: '#1e293b',
    dark: '#020617',
    light: '#f1f5f9',
    subtle: '#f8fafc',
    border: '#e2e8f0',
    accent: '#334155',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #475569 100%)',
    subtleGradient: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    shadowRgb: '15, 23, 42',
  },
  {
    id: 'magenta',
    name: 'Plum & Magenta Glam',
    description: 'Vibrant celebratory fuchsia for youth fashion & bold style statements',
    badge: 'Youth & Glam',
    primary: '#c026d3',
    hover: '#a21caf',
    dark: '#701a75',
    light: '#fae8ff',
    subtle: '#fdf4ff',
    border: '#f5d0fe',
    accent: '#d946ef',
    gradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 50%, #e879f9 100%)',
    subtleGradient: 'linear-gradient(180deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)',
    shadowRgb: '192, 38, 211',
  },
  {
    id: 'teal',
    name: 'Ocean Teal & Cyan',
    description: 'Cool summer breeze and refreshing beachside collection aesthetic',
    badge: 'Summer Breeze',
    primary: '#0d9488',
    hover: '#0f766e',
    dark: '#134e4a',
    light: '#ccfbf1',
    subtle: '#f0fdfa',
    border: '#99f6e4',
    accent: '#14b8a6',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #2dd4bf 100%)',
    subtleGradient: 'linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)',
    shadowRgb: '13, 148, 136',
  },
];

// Helper to parse hex to {r, g, b}
export function hexToRgb(hex) {
  let c = (hex || '#7c3aed').replace('#', '').trim();
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return { r: 124, g: 58, b: 237 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper to lighten/darken hex
function clamp(val) {
  return Math.min(255, Math.max(0, Math.round(val)));
}

export function adjustHex(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const newR = clamp(r + amount);
  const newG = clamp(g + amount);
  const newB = clamp(b + amount);
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Generate complete palette from any custom hex
export function generateThemeFromHex(hex, name = 'Custom Brand Color') {
  const validHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#7c3aed';
  const { r, g, b } = hexToRgb(validHex);
  return {
    id: 'custom',
    name,
    description: `Custom branded palette generated from ${validHex}`,
    badge: 'Custom',
    primary: validHex,
    hover: adjustHex(validHex, -22),
    dark: adjustHex(validHex, -50),
    light: adjustHex(validHex, 175),
    subtle: adjustHex(validHex, 205),
    border: adjustHex(validHex, 145),
    accent: adjustHex(validHex, 25),
    gradient: `linear-gradient(135deg, ${validHex} 0%, ${adjustHex(validHex, 20)} 50%, ${adjustHex(validHex, 45)} 100%)`,
    subtleGradient: `linear-gradient(180deg, ${adjustHex(validHex, 205)} 0%, ${adjustHex(validHex, 175)} 50%, ${adjustHex(validHex, 145)} 100%)`,
    shadowRgb: `${r}, ${g}, ${b}`,
  };
}

// Find preset by ID or return custom
export function resolveTheme(themeInput) {
  if (!themeInput) return THEME_PRESETS[0];
  if (typeof themeInput === 'string') {
    const found = THEME_PRESETS.find((p) => p.id === themeInput || p.primary.toLowerCase() === themeInput.toLowerCase());
    return found || generateThemeFromHex(themeInput);
  }
  if (themeInput.preset) {
    const found = THEME_PRESETS.find((p) => p.id === themeInput.preset);
    if (found) return found;
  }
  if (themeInput.primaryColor) {
    const found = THEME_PRESETS.find((p) => p.primary.toLowerCase() === themeInput.primaryColor.toLowerCase());
    if (found) return found;
    return generateThemeFromHex(themeInput.primaryColor, themeInput.name || 'Custom Theme');
  }
  if (themeInput.primary) {
    return themeInput;
  }
  return THEME_PRESETS[0];
}

const DYNAMIC_STYLE_ID = 'picky-theme-dynamic-styles';

// Apply theme to DOM root and inject dynamic CSS overrides
export function applyTheme(themeInput) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const theme = resolveTheme(themeInput);

  // 1. Set CSS root variables
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-hover', theme.hover);
  root.style.setProperty('--color-primary-dark', theme.dark);
  root.style.setProperty('--color-primary-light', theme.light);
  root.style.setProperty('--color-primary-subtle', theme.subtle);
  root.style.setProperty('--color-purple-gradient', theme.gradient);
  root.style.setProperty('--color-purple-gradient-subtle', theme.subtleGradient);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-border', theme.border);
  root.style.setProperty('--color-border-hover', theme.hover);
  root.style.setProperty('--shadow-sm', `0 1px 3px rgba(${theme.shadowRgb}, 0.08)`);
  root.style.setProperty('--shadow', `0 4px 20px -2px rgba(${theme.shadowRgb}, 0.14)`);
  root.style.setProperty('--shadow-lg', `0 10px 30px -5px rgba(${theme.shadowRgb}, 0.20)`);

  // 2. Inject or update dynamic stylesheet for high-priority overrides across all pages
  let styleEl = document.getElementById(DYNAMIC_STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DYNAMIC_STYLE_ID;
    document.head.appendChild(styleEl);
  }

  styleEl.innerHTML = `
    /* Picky Dynamic Theme Overrides - Preset: ${theme.name} (${theme.primary}) */
    :root {
      --color-primary: ${theme.primary} !important;
      --color-primary-hover: ${theme.hover} !important;
      --color-primary-dark: ${theme.dark} !important;
      --color-primary-light: ${theme.light} !important;
      --color-primary-subtle: ${theme.subtle} !important;
      --color-purple-gradient: ${theme.gradient} !important;
      --color-purple-gradient-subtle: ${theme.subtleGradient} !important;
      --color-accent: ${theme.accent} !important;
      --color-border: ${theme.border} !important;
    }

    /* Navbar brand, active tabs & pill indicators */
    .nav-brand-logo-icon,
    .nav-signin-btn,
    .drawer-signin-btn,
    .drawer-user-avatar {
      background: ${theme.gradient} !important;
    }

    .nav-pill-link.active,
    .nav-pill-link.navPillActive {
      background: ${theme.gradient} !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(${theme.shadowRgb}, 0.3) !important;
    }

    .nav-badge-count,
    .cart-badge,
    .wishlist-badge {
      background: ${theme.primary} !important;
      color: #ffffff !important;
    }

    .nav-search-kbd,
    .nav-mega-column-title:hover,
    .nav-mega-link-item:hover,
    .nav-desktop-sidebar-btn:hover,
    .drawer-user-link {
      color: ${theme.primary} !important;
    }

    .nav-search-input-wrap:focus-within {
      border-color: ${theme.primary} !important;
      box-shadow: 0 0 0 3px rgba(${theme.shadowRgb}, 0.16) !important;
    }

    .nav-search-quick-tag:hover,
    .drawer-user-link:hover {
      background: ${theme.primary} !important;
      color: #ffffff !important;
      border-color: ${theme.primary} !important;
    }

    /* Global Primary Buttons (Storefront & Admin) */
    button.btn-primary,
    .btn-primary,
    .primaryBtn,
    .btnPrimary,
    .customSwitchOn {
      background: ${theme.primary} !important;
      border-color: ${theme.primary} !important;
      color: #ffffff !important;
    }

    button.btn-primary:hover,
    .btn-primary:hover,
    .primaryBtn:hover,
    .btnPrimary:hover {
      background: ${theme.hover} !important;
      border-color: ${theme.hover} !important;
      color: #ffffff !important;
    }

    /* Cart, Checkout, Product Detail action buttons */
    .addToCartBtn,
    .buyNowBtn,
    .checkoutBtn,
    .placeOrderBtn,
    .heroCtaBtn {
      background: ${theme.primary} !important;
      color: #ffffff !important;
    }

    .addToCartBtn:hover,
    .buyNowBtn:hover,
    .checkoutBtn:hover,
    .placeOrderBtn:hover,
    .heroCtaBtn:hover {
      background: ${theme.hover} !important;
    }

    /* Price tags, Highlights, Active icons */
    .highlight-price,
    .product-price-current,
    .price-value-primary,
    .rating-star-filled {
      color: ${theme.primary} !important;
    }

    /* Badges & Soft background containers */
    .badge-primary-soft,
    .category-pill-active {
      background: ${theme.light} !important;
      color: ${theme.primary} !important;
      border-color: ${theme.border} !important;
    }

    /* Admin Sidebar active highlights */
    .sidebarNavItem.sidebarNavActive,
    .iconBoxActive {
      background: ${theme.primary} !important;
      color: #ffffff !important;
    }

    /* Announcement Bar Accent */
    .announcement-bar-dynamic {
      background: ${theme.primary} !important;
      color: #ffffff !important;
    }
  `;

  // 3. Persist to localStorage
  try {
    localStorage.setItem(
      'picky_store_theme',
      JSON.stringify({
        preset: theme.id,
        primaryColor: theme.primary,
        name: theme.name,
      })
    );
  } catch (_) {}

  // 4. Dispatch event for other components
  window.dispatchEvent(
    new CustomEvent('picky_store_theme_updated', {
      detail: theme,
    })
  );
}

// Bootstrap theme on initial app load
export function initTheme() {
  if (typeof window === 'undefined') return;

  try {
    const saved = localStorage.getItem('picky_store_theme');
    if (saved) {
      applyTheme(JSON.parse(saved));
      return;
    }

    const storeSaved = localStorage.getItem('picky_store_settings');
    if (storeSaved) {
      const parsed = JSON.parse(storeSaved);
      if (parsed?.theme) {
        applyTheme(parsed.theme);
        return;
      }
    }
  } catch (_) {}

  // Default to royal purple
  applyTheme(THEME_PRESETS[0]);
}
