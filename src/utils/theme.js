// ─── Picky Centralized Admin Panel Theme & Design System ────────────────────────
// Strictly scoped to .admin-layout to ensure ZERO leaks to customer store UI.
// Provides instant live executive theme customization across all admin pages
// (Admin Sidebar, Active Navigation, Quick Actions, Search Bars, Badges, Tables, Buttons).

export const THEME_PRESETS = [
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Signature luxury Picky executive aesthetic with rich violet & lilac accents',
    badge: 'Picky Default',
    primary: '#7c3aed',
    hover: '#6d28d9',
    dark: '#581c87',
    light: '#f3e8ff',
    subtle: '#faf5ff',
    border: '#e9d5ff',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
    sidebarBg: 'linear-gradient(180deg, #07030e 0%, #15092a 100%)',
    shadowRgb: '124, 58, 237',
  },
  {
    id: 'rose',
    name: 'Crimson Rose & Ruby',
    description: 'Festive red & bridal ruby rose aesthetic for silk saree and luxury boutiques',
    badge: 'Bridal & Festive',
    primary: '#e11d48',
    hover: '#be123c',
    dark: '#881337',
    light: '#ffe4e6',
    subtle: '#fff1f2',
    border: '#fecdd3',
    accent: '#f43f5e',
    gradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    sidebarBg: 'linear-gradient(180deg, #180309 0%, #3f0415 100%)',
    shadowRgb: '225, 29, 72',
  },
  {
    id: 'emerald',
    name: 'Emerald Heritage Green',
    description: 'Organic handloom and traditional boutique vibe with rich forest green accents',
    badge: 'Organic & Handloom',
    primary: '#059669',
    hover: '#047857',
    dark: '#064e3b',
    light: '#d1fae5',
    subtle: '#ecfdf5',
    border: '#a7f3d0',
    accent: '#10b981',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    sidebarBg: 'linear-gradient(180deg, #02140d 0%, #064030 100%)',
    shadowRgb: '5, 150, 105',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Royal Blue',
    description: 'High-trust corporate modern executive theme with dependable sapphire tones',
    badge: 'Modern Classic',
    primary: '#2563eb',
    hover: '#1d4ed8',
    dark: '#1e3a8a',
    light: '#dbeafe',
    subtle: '#eff6ff',
    border: '#bfdbfe',
    accent: '#3b82f6',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    sidebarBg: 'linear-gradient(180deg, #020b1c 0%, #172554 100%)',
    shadowRgb: '37, 99, 235',
  },
  {
    id: 'amber',
    name: 'Sunset Amber & Gold',
    description: 'Diwali festive gold and warm bronze shimmer for grand celebration workspace',
    badge: 'Festival Gold',
    primary: '#d97706',
    hover: '#b45309',
    dark: '#78350f',
    light: '#fef3c7',
    subtle: '#fffbeb',
    border: '#fde68a',
    accent: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    sidebarBg: 'linear-gradient(180deg, #180c02 0%, #3d1702 100%)',
    shadowRgb: '217, 119, 6',
  },
  {
    id: 'midnight',
    name: 'Midnight Onyx Black',
    description: 'Ultra-minimal monochrome dark couture with sleek slate and carbon accents',
    badge: 'Minimal Stealth',
    primary: '#334155',
    hover: '#1e293b',
    dark: '#0f172a',
    light: '#f1f5f9',
    subtle: '#f8fafc',
    border: '#e2e8f0',
    accent: '#475569',
    gradient: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
    sidebarBg: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
    shadowRgb: '51, 65, 85',
  },
  {
    id: 'magenta',
    name: 'Plum & Magenta Glam',
    description: 'Vibrant celebratory fuchsia for high-energy modern retail management',
    badge: 'Youth & Glam',
    primary: '#c026d3',
    hover: '#a21caf',
    dark: '#701a75',
    light: '#fae8ff',
    subtle: '#fdf4ff',
    border: '#f5d0fe',
    accent: '#d946ef',
    gradient: 'linear-gradient(135deg, #c026d3 0%, #a21caf 100%)',
    sidebarBg: 'linear-gradient(180deg, #19021b 0%, #4a0650 100%)',
    shadowRgb: '192, 38, 211',
  },
  {
    id: 'teal',
    name: 'Ocean Teal & Cyan',
    description: 'Cool summer breeze and soothing aquatic aesthetic for a fresh clean look',
    badge: 'Summer Breeze',
    primary: '#0d9488',
    hover: '#0f766e',
    dark: '#134e4a',
    light: '#ccfbf1',
    subtle: '#f0fdfa',
    border: '#99f6e4',
    accent: '#14b8a6',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    sidebarBg: 'linear-gradient(180deg, #021614 0%, #11423e 100%)',
    shadowRgb: '13, 148, 136',
  },
];

export const MANUAL_SWATCHES = [
  { hex: '#7c3aed', name: 'Royal Purple' },
  { hex: '#9333ea', name: 'Electric Violet' },
  { hex: '#e11d48', name: 'Crimson Rose' },
  { hex: '#f43f5e', name: 'Coral Berry' },
  { hex: '#059669', name: 'Emerald Green' },
  { hex: '#10b981', name: 'Neon Mint' },
  { hex: '#2563eb', name: 'Sapphire Blue' },
  { hex: '#0284c7', name: 'Ocean Cyan' },
  { hex: '#d97706', name: 'Amber Gold' },
  { hex: '#ea580c', name: 'Sunset Bronze' },
  { hex: '#c026d3', name: 'Fuchsia Magenta' },
  { hex: '#334155', name: 'Stealth Slate' },
];

export const SIDEBAR_STYLES = [
  {
    id: 'gradient',
    name: 'Deep Midnight Gradient',
    description: 'Dynamic deep space gradient harmonized with your primary theme tone',
    preview: 'linear-gradient(90deg, #07030e 0%, #15092a 100%)',
  },
  {
    id: 'onyx',
    name: 'Stealth Onyx Black',
    description: 'Solid minimalist dark onyx black for high contrast readability',
    preview: 'linear-gradient(90deg, #09090b 0%, #18181b 100%)',
  },
  {
    id: 'tinted',
    name: 'Rich Brand Aura',
    description: 'Vibrant radial aura matching your chosen accent color',
    preview: 'linear-gradient(90deg, #180324 0%, #300746 100%)',
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
export function generateThemeFromHex(hex, name = 'Custom Admin Brand') {
  const validHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#7c3aed';
  const { r, g, b } = hexToRgb(validHex);
  const dark1 = adjustHex(validHex, -190);
  const dark2 = adjustHex(validHex, -135);
  return {
    id: 'custom',
    name,
    description: `Custom branded executive palette generated from ${validHex}`,
    badge: 'Custom',
    primary: validHex,
    hover: adjustHex(validHex, -22),
    dark: adjustHex(validHex, -50),
    light: adjustHex(validHex, 175),
    subtle: adjustHex(validHex, 205),
    border: adjustHex(validHex, 145),
    accent: adjustHex(validHex, 25),
    gradient: `linear-gradient(135deg, ${validHex} 0%, ${adjustHex(validHex, 20)} 100%)`,
    sidebarBg: `linear-gradient(180deg, ${dark1} 0%, ${dark2} 100%)`,
    shadowRgb: `${r}, ${g}, ${b}`,
  };
}

// Find preset by ID or return custom
export function resolveTheme(themeInput) {
  let baseTheme = THEME_PRESETS[0];
  let mode = 'light';
  let sidebarStyle = 'gradient';

  if (!themeInput) return { ...THEME_PRESETS[0], mode: 'light', sidebarStyle: 'gradient' };

  if (typeof themeInput === 'object') {
    mode = themeInput.mode === 'dark' ? 'dark' : 'light';
    sidebarStyle = themeInput.sidebarStyle || 'gradient';
  }

  if (typeof themeInput === 'string') {
    const found = THEME_PRESETS.find(
      (p) => p.id === themeInput || p.primary.toLowerCase() === themeInput.toLowerCase()
    );
    baseTheme = found || generateThemeFromHex(themeInput);
  } else if (themeInput.preset && themeInput.preset !== 'custom') {
    const found = THEME_PRESETS.find((p) => p.id === themeInput.preset);
    baseTheme = found || THEME_PRESETS[0];
  } else if (themeInput.primaryColor) {
    const found = THEME_PRESETS.find(
      (p) => p.primary.toLowerCase() === themeInput.primaryColor.toLowerCase()
    );
    baseTheme = found || generateThemeFromHex(themeInput.primaryColor, themeInput.name || 'Custom Theme');
  } else if (themeInput.primary) {
    baseTheme = themeInput;
  }

  // Adjust sidebar background based on sidebarStyle if custom
  let customSidebarBg = baseTheme.sidebarBg;
  if (sidebarStyle === 'onyx') {
    customSidebarBg = 'linear-gradient(180deg, #09090b 0%, #18181b 100%)';
  } else if (sidebarStyle === 'tinted') {
    const { r, g, b } = hexToRgb(baseTheme.primary);
    customSidebarBg = `linear-gradient(180deg, rgba(${r}, ${g}, ${b}, 0.25) 0%, #06020c 100%)`;
  }

  return {
    ...baseTheme,
    mode,
    sidebarStyle,
    sidebarBg: customSidebarBg,
  };
}

const ADMIN_DYNAMIC_STYLE_ID = 'picky-admin-theme-dynamic-styles';

// Apply theme strictly to .admin-layout (Admin Panel only)
export function applyTheme(themeInput) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const theme = resolveTheme(themeInput);
  const isDark = theme.mode === 'dark';

  let styleEl = document.getElementById(ADMIN_DYNAMIC_STYLE_ID);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = ADMIN_DYNAMIC_STYLE_ID;
    document.head.appendChild(styleEl);
  }

  const darkRules = isDark
    ? `
    /* ─── Admin Dark Mode Theme ─── */
    .admin-layout.dark-mode,
    .admin-layout[data-theme-mode="dark"] {
      --adm-bg: #0b0f19 !important;
      --adm-surface: #111827 !important;
      --adm-surface-alt: #161f30 !important;
      --adm-border: #1f293d !important;
      --adm-border-hover: #374151 !important;
      --adm-text: #f8fafc !important;
      --adm-text-body: #cbd5e1 !important;
      --adm-text-muted: #94a3b8 !important;
      --adm-text-subtle: #64748b !important;
      background-color: #0b0f19 !important;
      color: #cbd5e1 !important;
    }

    .admin-layout[data-theme-mode="dark"] .admin-topbar {
      background: rgba(17, 24, 39, 0.94) !important;
      border-bottom-color: #1f293d !important;
    }

    .admin-layout[data-theme-mode="dark"] .admin-topbar-search-box {
      background: #161f30 !important;
      border-color: #1f293d !important;
    }

    .admin-layout[data-theme-mode="dark"] .admin-topbar-search-input {
      color: #f8fafc !important;
    }

    .admin-layout[data-theme-mode="dark"] .admin-topbar-notif-btn,
    .admin-layout[data-theme-mode="dark"] .admin-theme-mode-toggle {
      background: #161f30 !important;
      border-color: #1f293d !important;
      color: #cbd5e1 !important;
    }

    .admin-layout[data-theme-mode="dark"] .admin-main-content,
    .admin-layout[data-theme-mode="dark"] .admin-content-area,
    .admin-layout[data-theme-mode="dark"] [class*="settingsSidebar"],
    .admin-layout[data-theme-mode="dark"] [class*="tabContentCard"],
    .admin-layout[data-theme-mode="dark"] [class*="section"],
    .admin-layout[data-theme-mode="dark"] [class*="generalCard"],
    .admin-layout[data-theme-mode="dark"] [class*="shippingCard"],
    .admin-layout[data-theme-mode="dark"] [class*="securityCard"],
    .admin-layout[data-theme-mode="dark"] [class*="customColorCard"],
    .admin-layout[data-theme-mode="dark"] [class*="modeCard"],
    .admin-layout[data-theme-mode="dark"] [class*="presetCard"],
    .admin-layout[data-theme-mode="dark"] [class*="previewNavCard"],
    .admin-layout[data-theme-mode="dark"] [class*="previewKpiCard"],
    .admin-layout[data-theme-mode="dark"] [class*="sidebarConfigCard"],
    .admin-layout[data-theme-mode="dark"] [class*="sidebarStyleCard"] {
      background: #111827 !important;
      border-color: #1f293d !important;
      color: #f8fafc !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="sidebarNavLabel"] {
      color: #e2e8f0 !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="title"],
    .admin-layout[data-theme-mode="dark"] [class*="sectionTitle"],
    .admin-layout[data-theme-mode="dark"] [class*="modeCardTitle"],
    .admin-layout[data-theme-mode="dark"] [class*="presetName"],
    .admin-layout[data-theme-mode="dark"] [class*="sidebarStyleName"],
    .admin-layout[data-theme-mode="dark"] h1,
    .admin-layout[data-theme-mode="dark"] h2,
    .admin-layout[data-theme-mode="dark"] h3 {
      color: #f8fafc !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="subtitle"],
    .admin-layout[data-theme-mode="dark"] [class*="themeSubtitle"],
    .admin-layout[data-theme-mode="dark"] [class*="modeCardSub"],
    .admin-layout[data-theme-mode="dark"] [class*="presetDesc"],
    .admin-layout[data-theme-mode="dark"] [class*="sidebarStyleDesc"],
    .admin-layout[data-theme-mode="dark"] p {
      color: #94a3b8 !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="sidebarNavItem"] {
      color: #94a3b8 !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="sidebarNavItem"]:hover {
      background: #161f30 !important;
      color: #f8fafc !important;
    }

    .admin-layout[data-theme-mode="dark"] input:not([type="checkbox"]):not([type="color"]),
    .admin-layout[data-theme-mode="dark"] select,
    .admin-layout[data-theme-mode="dark"] textarea {
      background: #161f30 !important;
      border-color: #1f293d !important;
      color: #f8fafc !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="previewAdminTopbar"] {
      background: #111827 !important;
      border-color: #1f293d !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="previewAdminSearch"] {
      background: #161f30 !important;
      border-color: #1f293d !important;
      color: #94a3b8 !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="themeSyncBanner"] {
      background: rgba(${theme.shadowRgb}, 0.12) !important;
      border-color: rgba(${theme.shadowRgb}, 0.25) !important;
    }

    .admin-layout[data-theme-mode="dark"] [class*="swatchBtn"] {
      background: #161f30 !important;
      border-color: #1f293d !important;
      color: #cbd5e1 !important;
    }
  `
    : '';

  styleEl.innerHTML = `
    /* Picky Dynamic Admin Panel Theme - ${theme.name} (${theme.primary}) [Mode: ${theme.mode || 'light'}] */
    .admin-layout {
      --adm-primary: ${theme.primary} !important;
      --adm-primary-hover: ${theme.hover} !important;
      --adm-primary-light: ${theme.light} !important;
      --adm-primary-tint: ${theme.subtle} !important;
      --adm-border-hover: ${theme.accent} !important;
      --adm-sidebar-active: ${theme.primary} !important;
      --adm-shaded-pill-bg: ${theme.light} !important;
      --adm-shaded-pill-border: ${theme.border} !important;
      --adm-shaded-pill-hover-bg: ${theme.subtle} !important;
      --adm-shadow-sm: 0 1px 3px rgba(${theme.shadowRgb}, 0.06) !important;
      --adm-shadow: 0 4px 20px -2px rgba(${theme.shadowRgb}, 0.1) !important;
      --adm-shadow-hover: 0 12px 28px -4px rgba(${theme.shadowRgb}, 0.18) !important;
    }

    /* 1. Admin Sidebar Background & Radial Glow */
    .admin-layout .admin-sidebar {
      background: ${theme.sidebarBg} !important;
      border-right: 1px solid rgba(${theme.shadowRgb}, 0.22) !important;
    }

    .admin-layout .admin-sidebar::before {
      background: radial-gradient(circle, rgba(${theme.shadowRgb}, 0.22) 0%, rgba(0, 0, 0, 0) 70%) !important;
    }

    .admin-layout .admin-brand-sub {
      color: ${theme.accent} !important;
    }

    /* 2. Admin Sidebar Active Navigation Item */
    .admin-layout .admin-nav-item.active {
      background: linear-gradient(90deg, rgba(${theme.shadowRgb}, 0.22) 0%, rgba(${theme.shadowRgb}, 0.04) 100%) !important;
      color: #ffffff !important;
      border: 1px solid rgba(${theme.shadowRgb}, 0.35) !important;
      box-shadow: 0 2px 10px rgba(${theme.shadowRgb}, 0.2) !important;
    }

    .admin-layout .admin-nav-item.active .admin-nav-icon-wrap {
      background: ${theme.gradient} !important;
      color: #ffffff !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      box-shadow: 0 3px 10px rgba(${theme.shadowRgb}, 0.45), inset 0 1px 2px rgba(255, 255, 255, 0.4) !important;
    }

    .admin-layout .admin-nav-item:hover .admin-nav-icon-wrap {
      background: rgba(${theme.shadowRgb}, 0.14) !important;
      color: ${theme.accent} !important;
      border-color: rgba(${theme.shadowRgb}, 0.4) !important;
      box-shadow: 0 0 10px rgba(${theme.shadowRgb}, 0.25) !important;
    }

    .admin-layout .admin-nav-sub-item.active {
      background: rgba(${theme.shadowRgb}, 0.12) !important;
      color: ${theme.accent} !important;
      border: 1px solid rgba(${theme.shadowRgb}, 0.22) !important;
    }

    .admin-layout .admin-nav-sub-item.active .admin-nav-sub-dot {
      background: ${theme.primary} !important;
      box-shadow: 0 0 8px rgba(${theme.shadowRgb}, 0.7) !important;
    }

    /* 3. Topbar Quick Actions & Quick Add Buttons */
    .admin-layout .admin-quick-add-btn,
    .admin-layout .admin-quick-actions-btn {
      background: ${theme.gradient} !important;
      box-shadow: 0 4px 14px rgba(${theme.shadowRgb}, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25) !important;
    }

    .admin-layout .admin-quick-add-btn:hover,
    .admin-layout .admin-quick-actions-btn:hover {
      background: linear-gradient(135deg, ${theme.hover} 0%, ${theme.dark} 100%) !important;
      box-shadow: 0 6px 20px rgba(${theme.shadowRgb}, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
    }

    /* 4. Topbar Search Input Focus */
    .admin-layout .admin-topbar-search-box:focus-within {
      border-color: ${theme.primary} !important;
      box-shadow: 0 0 0 3px rgba(${theme.shadowRgb}, 0.18), 0 2px 8px rgba(${theme.shadowRgb}, 0.08) !important;
    }

    .admin-layout .admin-topbar-search-icon {
      color: ${theme.primary} !important;
    }

    /* 5. Global Admin Buttons */
    .admin-layout button.btn-primary,
    .admin-layout .btn-primary,
    .admin-layout .primaryBtn,
    .admin-layout .btnPrimary {
      background: ${theme.primary} !important;
      border-color: ${theme.primary} !important;
      color: #ffffff !important;
    }

    .admin-layout button.btn-primary:hover,
    .admin-layout .btn-primary:hover,
    .admin-layout .primaryBtn:hover,
    .admin-layout .btnPrimary:hover {
      background: ${theme.hover} !important;
      border-color: ${theme.hover} !important;
      color: #ffffff !important;
    }

    /* 6. Admin Settings Navigation & Custom Toggles */
    .admin-layout .sidebarNavItem.sidebarNavActive,
    .admin-layout .iconBoxActive,
    .admin-layout .customSwitchOn {
      background: ${theme.primary} !important;
      color: #ffffff !important;
    }

    .admin-layout .activeThemeDot {
      background: ${theme.primary} !important;
    }

    .admin-layout .presetCardActive {
      border-color: ${theme.primary} !important;
      box-shadow: 0 0 0 2px ${theme.primary}, 0 8px 24px rgba(${theme.shadowRgb}, 0.14) !important;
    }

    .admin-layout .presetSelectedCheck {
      background: ${theme.primary} !important;
    }

    .admin-layout .selectedPillBadge,
    .admin-layout .badge-primary-soft {
      background: ${theme.light} !important;
      color: ${theme.primary} !important;
      border-color: ${theme.border} !important;
    }

    ${darkRules}
  `;

  // Apply classes and attributes to DOM
  const mode = theme.mode || 'light';
  document.querySelectorAll('.admin-layout').forEach((el) => {
    el.setAttribute('data-theme-mode', mode);
    if (mode === 'dark') {
      el.classList.add('dark-mode');
    } else {
      el.classList.remove('dark-mode');
    }
  });

  try {
    localStorage.setItem(
      'picky_admin_theme',
      JSON.stringify({
        preset: theme.id,
        primaryColor: theme.primary,
        name: theme.name,
        mode,
        sidebarStyle: theme.sidebarStyle || 'gradient',
      })
    );
  } catch (_) {}

  window.dispatchEvent(
    new CustomEvent('picky_admin_theme_updated', {
      detail: theme,
    })
  );
}

// Bootstrap admin theme on load
export function initTheme() {
  if (typeof window === 'undefined') return;

  try {
    const saved = localStorage.getItem('picky_admin_theme');
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

  applyTheme(THEME_PRESETS[0]);
}
