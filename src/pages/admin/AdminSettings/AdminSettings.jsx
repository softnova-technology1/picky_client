import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Truck,
  Bell,
  ShieldCheck,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Lock,
  Zap,
  ShoppingBag,
  Package,
  Boxes,
  Tag,
  Users,
  Clock,
  History,
  ArrowRight,
  CheckCheck,
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Star,
  Trash2,
  MailOpen,
  ExternalLink,
  RotateCcw,
  Settings,
  MessageSquare,
  FileText,
  Download,
  Eye,
  Paperclip,
  User,
  Gift,
  LayoutDashboard,
  ShoppingCart,
  Layers,
  FolderTree,
  Percent,
  MessageCircle,
  Flame,
  MessageSquareText,
  Palette,
  SlidersHorizontal,
  Check,
  Sparkles,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { adminService } from '../../../services/admin.service';
import { contactService } from '../../../services/contact.service';
import { useUiStore } from '../../../store/uiStore';
import { THEME_PRESETS, applyTheme, generateThemeFromHex } from '../../../utils/theme';
import styles from './AdminSettings.module.css';

const DEFAULT_SETTINGS = {
  // General
  storeName: 'Picky Store',
  storeTagline: 'Curated Fashion & Lifestyle Essentials',
  supportEmail: 'support@picky.com',
  supportPhone: '+91 98765 43210',
  address: 'Main Road, Peravurani, Thanjavur District, Tamil Nadu, 614804',

  // Shipping
  freeShippingThreshold: '999',
  tamilNadu: {
    shippingFee: '40',
    estimatedDays: '2-3 Business Days',
  },
  allIndia: {
    shippingFee: '70',
    estimatedDays: '4-6 Business Days',
  },
  giftWrap: {
    enabled: true,
    fee: '30',
  },

  // Security
  sessionTimeoutMinutes: '60',
  requireTwoFactor: false,
  apiRateLimit: '100 requests / min',

  // Theme & Appearance
  theme: {
    preset: 'purple',
    primaryColor: '#7c3aed',
    name: 'Royal Purple',
  },
};

const SIDEBAR_CONFIG_GROUPS = [
  {
    title: 'Overview',
    description: 'Main dashboard analytics and store overview',
    items: [
      {
        key: 'dashboard',
        name: 'Dashboard',
        desc: 'Key performance metrics, live sales stats, top products and charts',
        path: '/softpicky-sn2026',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Sales & Fulfillment',
    description: 'Order processing, customer returns, and recovery workflows',
    items: [
      {
        key: 'orders',
        name: 'Orders',
        desc: 'Manage customer purchases, shipment tracking, invoices, and status lifecycle',
        path: '/softpicky-sn2026/orders',
        icon: ShoppingBag,
      },
      {
        key: 'returns',
        name: 'Returns & Refunds',
        desc: 'Review return requests, process customer refunds, and manage return labels',
        path: '/softpicky-sn2026/returns',
        icon: RotateCcw,
      },
      {
        key: 'abandonedCarts',
        name: 'Abandoned Carts Recovery',
        desc: 'Track dropped checkouts, send WhatsApp recovery alerts, view recovered revenue',
        path: '/softpicky-sn2026/abandoned-carts',
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: 'Catalog & Stock',
    description: 'Product catalog, categories, inventory management and ratings',
    items: [
      {
        key: 'products',
        name: 'Products',
        desc: 'Add, edit, bulk-manage items, set prices, variants, images, and stock',
        path: '/softpicky-sn2026/products',
        icon: Package,
      },
      {
        key: 'categories',
        name: 'Categories',
        desc: 'Main catalog categories, mega menu arrangement and banner thumbnails',
        path: '/softpicky-sn2026/categories',
        icon: Layers,
      },
      {
        key: 'subcategories',
        name: 'Sub-Categories',
        desc: 'Sub-category hierarchy, tags, and classification mapping',
        path: '/softpicky-sn2026/subcategories',
        icon: FolderTree,
      },
      {
        key: 'inventory',
        name: 'Inventory',
        desc: 'Low stock alerts, warehouse SKU counts, and restocking ledger',
        path: '/softpicky-sn2026/inventory',
        icon: Boxes,
      },
      {
        key: 'reviews',
        name: 'Reviews & Ratings',
        desc: 'Moderate customer product reviews, ratings, and testimonials',
        path: '/softpicky-sn2026/reviews',
        icon: Star,
      },
    ],
  },
  {
    title: 'Customers & Offers',
    description: 'CRM, promotional marketing, WhatsApp broadcasts and inquiries',
    items: [
      {
        key: 'customers',
        name: 'Users / Customers',
        desc: 'Customer profiles, order histories, phone numbers, and engagement stats',
        path: '/softpicky-sn2026/customers',
        icon: Users,
      },
      {
        key: 'coupons',
        name: 'Coupons & Promo Codes',
        desc: 'Discount promo coupon codes, expiration dates, and usage limits',
        path: '/softpicky-sn2026/coupons',
        icon: Tag,
      },
      {
        key: 'discounts',
        name: 'Automatic Discounts',
        desc: 'Tiered cart discounts, buy-x-get-y offers, and holiday price cuts',
        path: '/softpicky-sn2026/discounts',
        icon: Percent,
      },
      {
        key: 'broadcast',
        name: 'WhatsApp Broadcast',
        desc: 'Meta Cloud API WhatsApp automated messaging and marketing campaigns',
        path: '/softpicky-sn2026/broadcast',
        icon: MessageCircle,
      },
      {
        key: 'flashSales',
        name: 'Flash Sales & Events',
        desc: 'Time-limited flash deals, countdown banners, and festival events',
        path: '/softpicky-sn2026/flash-sales',
        icon: Flame,
      },
      {
        key: 'inquiries',
        name: 'Customer Inquiries',
        desc: 'Messages received from store contact forms and customer questions',
        path: '/softpicky-sn2026/inquiries',
        icon: MessageSquareText,
      },
    ],
  },
  {
    title: 'Storefront & System',
    description: 'CMS customization, alerts feed and core configuration',
    items: [
      {
        key: 'customization',
        name: 'Customization (CMS)',
        desc: 'Storefront hero banners, announcements, homepage visual layout',
        path: '/softpicky-sn2026/customization',
        icon: Palette,
      },
      {
        key: 'notifications',
        name: 'Notifications',
        desc: 'Real-time order notifications, stock warnings, and activity feeds',
        path: '/softpicky-sn2026/notifications',
        icon: Bell,
      },
      {
        key: 'settings',
        name: 'Store Settings & Preferences',
        desc: 'Store identity, shipping charges, security protocols and sidebar controls (Core System)',
        path: '/softpicky-sn2026/settings',
        icon: Settings,
        locked: true,
      },
    ],
  },
];

function CustomToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label || 'Toggle switch'}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled && onChange) {
          onChange(!checked);
        }
      }}
      className={`${styles.customSwitch} ${checked ? styles.customSwitchOn : styles.customSwitchOff} ${disabled ? styles.customSwitchDisabled : ''}`}
    >
      <span className={`${styles.customSwitchThumb} ${checked ? styles.customSwitchThumbOn : styles.customSwitchThumbOff}`}>
        {checked && <Check size={11} strokeWidth={3.5} className={styles.customSwitchCheckIcon} />}
      </span>
    </button>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();
  const {
    showToast,
    adminSidebarPages,
    toggleAdminSidebarPage,
    setAdminSidebarPages,
    resetAdminSidebarPages,
  } = useUiStore();
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['general', 'shipping', 'sidebar', 'security', 'theme'];
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'general'
  );

  useEffect(() => {
    if (tabFromUrl === 'notifications') {
      navigate('/softpicky-sn2026/notifications', { replace: true });
    }
  }, [tabFromUrl, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('picky_admin_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [customHex, setCustomHex] = useState(() => {
    return settings.theme?.primaryColor || '#7c3aed';
  });

  const handleSelectPreset = (preset) => {
    const updatedTheme = {
      preset: preset.id,
      primaryColor: preset.primary,
      name: preset.name,
    };
    setSettings((prev) => ({ ...prev, theme: updatedTheme }));
    setCustomHex(preset.primary);
    applyTheme(preset);
  };

  const handleCustomHexChange = (newHex) => {
    setCustomHex(newHex);
    if (/^#[0-9A-Fa-f]{6}$/.test(newHex)) {
      const customTheme = generateThemeFromHex(newHex, 'Custom Brand');
      const updatedTheme = {
        preset: 'custom',
        primaryColor: newHex,
        name: 'Custom Brand',
      };
      setSettings((prev) => ({ ...prev, theme: updatedTheme }));
      applyTheme(customTheme);
    }
  };

  // Load live settings from MongoDB Atlas
  useEffect(() => {
    async function loadBackendSettings() {
      try {
        const res = await adminService.getSettings().catch(() => null);
        const data = res?.data || res;
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const shippingData = data.shipping || {};
          const formattedAddress = data.address && typeof data.address === 'object'
            ? (data.address.fullAddress || [data.address.street, data.address.city, data.address.state, data.address.pincode].filter(Boolean).join(', '))
            : (typeof data.address === 'string' ? data.address : DEFAULT_SETTINGS.address);

          setSettings((prev) => ({
            ...prev,
            ...data,
            supportEmail: data.contactEmail || data.supportEmail || prev.supportEmail,
            supportPhone: data.contactPhone || data.supportPhone || prev.supportPhone,
            address: formattedAddress,
            freeShippingThreshold: shippingData.freeShippingThreshold !== undefined ? String(shippingData.freeShippingThreshold) : prev.freeShippingThreshold,
            tamilNadu: {
              shippingFee: shippingData.tamilNadu?.shippingFee !== undefined
                ? String(shippingData.tamilNadu.shippingFee)
                : (prev.tamilNadu?.shippingFee || '40'),
              estimatedDays: shippingData.tamilNadu?.estimatedDays || prev.tamilNadu?.estimatedDays || '2-3 Business Days',
            },
            allIndia: {
              shippingFee: shippingData.allIndia?.shippingFee !== undefined
                ? String(shippingData.allIndia.shippingFee)
                : (shippingData.standardShippingFee !== undefined ? String(shippingData.standardShippingFee) : (prev.allIndia?.shippingFee || '70')),
              estimatedDays: shippingData.allIndia?.estimatedDays || shippingData.estimatedDeliveryDays || prev.allIndia?.estimatedDays || '4-6 Business Days',
            },
            giftWrap: {
              enabled: shippingData.giftWrap?.enabled !== undefined ? Boolean(shippingData.giftWrap.enabled) : true,
              fee: shippingData.giftWrap?.fee !== undefined ? String(shippingData.giftWrap.fee) : (prev.giftWrap?.fee || '30'),
            },
            sessionTimeoutMinutes: data.sessionTimeoutMinutes !== undefined ? String(data.sessionTimeoutMinutes) : prev.sessionTimeoutMinutes,
            theme: data.theme && typeof data.theme === 'object' ? data.theme : (prev.theme || DEFAULT_SETTINGS.theme),
          }));

          if (data.theme?.primaryColor) {
            setCustomHex(data.theme.primaryColor);
          }
          if (data.theme) {
            applyTheme(data.theme);
          }

          if (data.adminSidebarPages && typeof data.adminSidebarPages === 'object') {
            setAdminSidebarPages(data.adminSidebarPages);
          }
        }
      } catch (err) {
        console.warn('Using local settings cache:', err);
      }
    }
    loadBackendSettings();
  }, [setAdminSidebarPages]);

  const totalSidebarPagesCount = SIDEBAR_CONFIG_GROUPS.reduce((acc, g) => acc + g.items.length, 0);
  const activeSidebarPagesCount = SIDEBAR_CONFIG_GROUPS.reduce((acc, g) => {
    return acc + g.items.filter((item) => item.locked || (adminSidebarPages?.[item.key] !== false)).length;
  }, 0);

  const handleToggleSidebarPage = async (key, name) => {
    if (key === 'settings') return;
    const currentState = adminSidebarPages?.[key] !== false;
    const nextState = !currentState;
    toggleAdminSidebarPage(key);

    const updatedPages = {
      ...(adminSidebarPages || {}),
      [key]: nextState,
      settings: true,
    };

    try {
      await adminService.updateSettings({ adminSidebarPages: updatedPages });
      showToast(
        nextState
          ? `"${name}" is now VISIBLE in admin sidebar.`
          : `"${name}" is now HIDDEN from admin sidebar.`,
        'success'
      );
    } catch {
      showToast(
        nextState
          ? `"${name}" is now visible.`
          : `"${name}" is now hidden.`,
        'info'
      );
    }
  };

  const handleEnableAllSidebarPages = async () => {
    resetAdminSidebarPages();
    const allPages = {
      dashboard: true,
      orders: true,
      returns: true,
      abandonedCarts: true,
      products: true,
      categories: true,
      subcategories: true,
      inventory: true,
      reviews: true,
      customers: true,
      coupons: true,
      discounts: true,
      broadcast: true,
      flashSales: true,
      inquiries: true,
      customization: true,
      notifications: true,
      settings: true,
    };
    try {
      await adminService.updateSettings({ adminSidebarPages: allPages });
      showToast('All 18 sidebar pages are now enabled and visible.', 'success');
    } catch {
      showToast('All sidebar pages enabled.', 'info');
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const parsedTimeout = Math.max(0, parseInt(settings.sessionTimeoutMinutes, 10) || 0);
      const payload = {
        storeName: settings.storeName || 'Picky Store',
        storeTagline: settings.storeTagline || '',
        supportEmail: settings.supportEmail || settings.contactEmail || 'support@picky.com',
        supportPhone: settings.supportPhone || settings.contactPhone || '+91 98765 43210',
        contactEmail: settings.supportEmail || settings.contactEmail || 'support@picky.com',
        contactPhone: settings.supportPhone || settings.contactPhone || '+91 98765 43210',
        whatsappNumber: settings.supportPhone || settings.whatsappNumber || '+91 98765 43210',
        address: settings.address || DEFAULT_SETTINGS.address,
        theme: settings.theme || DEFAULT_SETTINGS.theme,
        sessionTimeoutMinutes: parsedTimeout,
        requireTwoFactor: Boolean(settings.requireTwoFactor),
        shipping: {
          freeShippingThreshold: Number(settings.freeShippingThreshold) || 999,
          tamilNadu: {
            shippingFee: Number(settings.tamilNadu?.shippingFee) || 40,
            estimatedDays: settings.tamilNadu?.estimatedDays || '2-3 Business Days',
          },
          allIndia: {
            shippingFee: Number(settings.allIndia?.shippingFee) || 70,
            estimatedDays: settings.allIndia?.estimatedDays || '4-6 Business Days',
          },
          standardShippingFee: Number(settings.allIndia?.shippingFee) || 70,
          estimatedDeliveryDays: settings.allIndia?.estimatedDays || '4-6 Business Days',
          giftWrap: {
            enabled: settings.giftWrap?.enabled !== undefined ? Boolean(settings.giftWrap.enabled) : true,
            fee: Number(settings.giftWrap?.fee) || 30,
          },
        },
      };

      // Persist settings to local storage only upon explicit save
      localStorage.setItem('picky_admin_settings', JSON.stringify(payload));
      localStorage.setItem('picky_store_settings', JSON.stringify(payload));
      localStorage.setItem('picky_shipping_settings', JSON.stringify(payload.shipping));

      // Broadcast events so active listeners immediately update
      window.dispatchEvent(
        new CustomEvent('picky_admin_timeout_updated', {
          detail: { timeoutMinutes: parsedTimeout },
        })
      );
      window.dispatchEvent(
        new CustomEvent('picky_store_settings_updated', {
          detail: payload,
        })
      );

      if (payload.theme) {
        applyTheme(payload.theme);
      }

      await adminService.updateSettings(payload);

      if (activeTab === 'theme') {
        showToast(`Theme updated! "${settings.theme?.name || 'Selected theme'}" applied across all pages.`, 'success');
      } else if (activeTab === 'security') {
        if (parsedTimeout === 0) {
          showToast('Security settings saved! Session timeout is DISABLED (Stay logged in permanently).', 'success');
        } else {
          showToast(`Security settings saved! Session timeout is now ACTIVE (${parsedTimeout}m of inactivity).`, 'success');
        }
      } else if (activeTab === 'shipping') {
        showToast('Shipping settings saved to database successfully!', 'success');
      } else {
        showToast('Settings saved to database successfully!', 'success');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to save settings to database', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="System Settings">
      <div className={styles.container}>
        {/* Page Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Store Settings & Preferences</h1>
            <p className={styles.subtitle}>
              Configure global store details, shipping rules, and security protocols.
            </p>
          </div>
        </div>

        {/* Horizontal Side-by-Side: Settings Sidebar (Left) + Settings Content (Right) */}
        <div className={styles.settingsLayout}>
          {/* Left Settings Sidebar */}
          <aside className={styles.settingsSidebar}>
            <div className={styles.sidebarSectionTitle}>Navigation</div>

            <nav className={styles.sidebarNav}>
              {/* 1. General */}
              <button
                type="button"
                className={`${styles.sidebarNavItem} ${activeTab === 'general' ? styles.sidebarNavActive : ''}`}
                onClick={() => handleTabChange('general')}
              >
                <div className={`${styles.sidebarNavIconBox} ${activeTab === 'general' ? styles.iconBoxActive : ''}`}>
                  <Store size={18} />
                </div>
                <div className={styles.sidebarNavText}>
                  <div className={styles.sidebarNavLabel}>General</div>
                  <div className={styles.sidebarNavSub}>Store identity & contact</div>
                </div>
                <ChevronRight size={15} className={styles.sidebarNavArrow} />
              </button>

              {/* 2. Shipping */}
              <button
                type="button"
                className={`${styles.sidebarNavItem} ${activeTab === 'shipping' ? styles.sidebarNavActive : ''}`}
                onClick={() => handleTabChange('shipping')}
              >
                <div className={`${styles.sidebarNavIconBox} ${activeTab === 'shipping' ? styles.iconBoxActive : ''}`}>
                  <Truck size={18} />
                </div>
                <div className={styles.sidebarNavText}>
                  <div className={styles.sidebarNavLabel}>Shipping & Logistics</div>
                  <div className={styles.sidebarNavSub}>Delivery rates & timelines</div>
                </div>
                <ChevronRight size={15} className={styles.sidebarNavArrow} />
              </button>

              {/* 3. Sidebar & Pages */}
              <button
                type="button"
                className={`${styles.sidebarNavItem} ${activeTab === 'sidebar' ? styles.sidebarNavActive : ''}`}
                onClick={() => handleTabChange('sidebar')}
              >
                <div className={`${styles.sidebarNavIconBox} ${activeTab === 'sidebar' ? styles.iconBoxActive : ''}`}>
                  <SlidersHorizontal size={18} />
                </div>
                <div className={styles.sidebarNavText}>
                  <div className={styles.sidebarNavLabel}>Sidebar & Pages</div>
                  <div className={styles.sidebarNavSub}>Customize admin sidebar menu</div>
                </div>
                <ChevronRight size={15} className={styles.sidebarNavArrow} />
              </button>

              {/* 4. Security */}
              <button
                type="button"
                className={`${styles.sidebarNavItem} ${activeTab === 'security' ? styles.sidebarNavActive : ''}`}
                onClick={() => handleTabChange('security')}
              >
                <div className={`${styles.sidebarNavIconBox} ${activeTab === 'security' ? styles.iconBoxActive : ''}`}>
                  <ShieldCheck size={18} />
                </div>
                <div className={styles.sidebarNavText}>
                  <div className={styles.sidebarNavLabel}>Security & Auth</div>
                  <div className={styles.sidebarNavSub}>Admin session & 2FA</div>
                </div>
                <ChevronRight size={15} className={styles.sidebarNavArrow} />
              </button>

              {/* 5. Theme & Appearance */}
              <button
                type="button"
                className={`${styles.sidebarNavItem} ${activeTab === 'theme' ? styles.sidebarNavActive : ''}`}
                onClick={() => handleTabChange('theme')}
              >
                <div className={`${styles.sidebarNavIconBox} ${activeTab === 'theme' ? styles.iconBoxActive : ''}`}>
                  <Palette size={18} />
                </div>
                <div className={styles.sidebarNavText}>
                  <div className={styles.sidebarNavLabel}>Theme & Appearance</div>
                  <div className={styles.sidebarNavSub}>Storefront colors & brand styling</div>
                </div>
                <ChevronRight size={15} className={styles.sidebarNavArrow} />
              </button>
            </nav>
          </aside>

          {/* Right Main Content Pane */}
          <main className={styles.settingsMain}>
            <form onSubmit={(e) => e.preventDefault()} className={styles.tabContentCard}>
          {/* 1. GENERAL SETTINGS */}
          {activeTab === 'general' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <Globe size={20} className={styles.sectionIcon} /> Store Profile & Information
              </h2>
              <div className={styles.grid2}>
                <Input
                  label="Store Name"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  placeholder="e.g. Picky Store"
                />
                <Input
                  label="Store Tagline"
                  value={settings.storeTagline}
                  onChange={(e) => handleChange('storeTagline', e.target.value)}
                  placeholder="Tagline or slogan"
                />
                <Input
                  label="Support Email"
                  type="email"
                  icon={<Mail size={16} />}
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  placeholder="care@pickystore.com"
                />
                <Input
                  label="Support Phone Number / WhatsApp"
                  type="tel"
                  icon={<Phone size={16} />}
                  value={settings.supportPhone}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  placeholder="+91 83002 95721"
                />
              </div>

              <div className={styles.fullWidthField} style={{ marginTop: '1rem' }}>
                <Input
                  label="Official Store Address"
                  icon={<MapPin size={16} />}
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="e.g. Victoria Tower, Anna Salai, Chennai, TN"
                />
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Store size={18} color="#7c3aed" />
                </div>
                <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Real Storefront Sync:</strong>
                  Saving these changes updates your store details in the customer-facing <strong>Footer (across all pages)</strong>, <strong>Contact Us</strong> page, and official communications.
                </div>
              </div>

              <div className={styles.sectionFooter}>
                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleSave}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* 3. SHIPPING & LOGISTICS */}
          {activeTab === 'shipping' && (
            <div className={styles.section}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px dashed var(--border-color, #e2e8f0)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
                    <Truck size={20} className={styles.sectionIcon} /> Shipping Rates & Logistics
                  </h2>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Set shipping charges for Tamil Nadu and All India. The system automatically classifies orders based on customer pincode.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleSave}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>

              {/* CARD 1: ALL OVER TAMIL NADU */}
              <div className={`${styles.shippingCard} ${styles.shippingCardHighlight}`}>
                <div className={styles.shippingCardHeader}>
                  <div className={styles.shippingCardTitleWrap}>
                    <MapPin size={18} color="#7025fb" />
                    <div>
                      <h3 className={styles.shippingCardTitle}>All Over Tamil Nadu</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        Automatically applies to all Tamil Nadu postal codes (starting with 60xxxx to 64xxxx).
                      </p>
                    </div>
                  </div>
                  <span className={styles.shippingBadge}>Tamil Nadu Orders</span>
                </div>

                <div className={styles.grid2}>
                  <Input
                    label="Tamil Nadu Shipping Amount (₹)"
                    type="number"
                    placeholder="e.g. 40"
                    value={settings.tamilNadu?.shippingFee !== undefined ? settings.tamilNadu.shippingFee : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        tamilNadu: {
                          ...(prev.tamilNadu || {}),
                          shippingFee: val,
                        },
                      }));
                    }}
                  />
                  <Input
                    label="Estimated Delivery Window"
                    placeholder="e.g. 2-3 Business Days"
                    value={settings.tamilNadu?.estimatedDays || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        tamilNadu: {
                          ...(prev.tamilNadu || {}),
                          estimatedDays: val,
                        },
                      }));
                    }}
                  />
                </div>
              </div>

              {/* CARD 2: ALL OVER INDIA */}
              <div className={styles.shippingCard}>
                <div className={styles.shippingCardHeader}>
                  <div className={styles.shippingCardTitleWrap}>
                    <Globe size={18} color="#7025fb" />
                    <div>
                      <h3 className={styles.shippingCardTitle}>All Over India</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        Automatically applies to all non-Tamil Nadu postal codes across India.
                      </p>
                    </div>
                  </div>
                  <span className={styles.shippingBadge}>All Other States</span>
                </div>

                <div className={styles.grid2}>
                  <Input
                    label="All India Shipping Amount (₹)"
                    type="number"
                    placeholder="e.g. 70"
                    value={settings.allIndia?.shippingFee !== undefined ? settings.allIndia.shippingFee : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        allIndia: {
                          ...(prev.allIndia || {}),
                          shippingFee: val,
                        },
                      }));
                    }}
                  />
                  <Input
                    label="Estimated Delivery Window"
                    placeholder="e.g. 4-6 Business Days"
                    value={settings.allIndia?.estimatedDays || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        allIndia: {
                          ...(prev.allIndia || {}),
                          estimatedDays: val,
                        },
                      }));
                    }}
                  />
                </div>
              </div>

              {/* CARD 3: GIFT WRAPPING SERVICE */}
              <div className={styles.shippingCard}>
                <div className={styles.shippingCardHeader}>
                  <div className={styles.shippingCardTitleWrap}>
                    <Gift size={18} color="#e11d48" />
                    <div>
                      <h3 className={styles.shippingCardTitle}>Gift Wrapping & Packaging</h3>
                      <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                        Configure gift wrap pricing and availability for customer checkout orders.
                      </p>
                    </div>
                  </div>
                  <span className={styles.shippingBadge} style={{ background: '#fdf2f8', color: '#db2777', borderColor: '#fbcfe8' }}>
                    Optional Add-on
                  </span>
                </div>

                <div className={styles.grid2}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                      Gift Wrapping Status
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem' }}>
                      <input
                        type="checkbox"
                        id="giftWrapToggle"
                        checked={settings.giftWrap?.enabled !== false}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSettings((prev) => ({
                            ...prev,
                            giftWrap: {
                              ...(prev.giftWrap || {}),
                              enabled: checked,
                            },
                          }));
                        }}
                        style={{ width: '18px', height: '18px', accentColor: '#7c3aed', cursor: 'pointer' }}
                      />
                      <label htmlFor="giftWrapToggle" style={{ fontSize: '0.85rem', color: settings.giftWrap?.enabled !== false ? '#047857' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>
                        {settings.giftWrap?.enabled !== false ? '✓ Enabled at Checkout' : '✕ Disabled at Checkout'}
                      </label>
                    </div>
                  </div>

                  <Input
                    label="Gift Wrapping Fee (₹)"
                    type="number"
                    placeholder="e.g. 30"
                    value={settings.giftWrap?.fee !== undefined ? settings.giftWrap.fee : ''}
                    disabled={settings.giftWrap?.enabled === false}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings((prev) => ({
                        ...prev,
                        giftWrap: {
                          ...(prev.giftWrap || {}),
                          fee: val,
                        },
                      }));
                    }}
                  />
                </div>
              </div>

              <div className={styles.sectionFooter} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleSave}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* 3. SIDEBAR NAVIGATION & PAGES CUSTOMIZATION */}
          {activeTab === 'sidebar' && (
            <div className={styles.section}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px dashed var(--border-color, #e2e8f0)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0, margin: 0 }}>
                    <SlidersHorizontal size={20} className={styles.sectionIcon} /> Sidebar Navigation & Page Controls
                  </h2>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                    Customize which pages appear in your admin sidebar. Toggle individual pages ON or OFF in real time.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={styles.sidebarQuickBtn}
                    onClick={handleEnableAllSidebarPages}
                    title="Turn ON all 18 sidebar pages"
                  >
                    Enable All Pages
                  </button>
                </div>
              </div>

              {/* Stats & Overview Banner */}
              <div className={styles.sidebarStatsBanner}>
                <div className={styles.sidebarStatsLeft}>
                  <div className={styles.sidebarStatsIcon}>
                    <Layers size={22} />
                  </div>
                  <div>
                    <div className={styles.sidebarStatsTitle}>
                      {activeSidebarPagesCount} of {totalSidebarPagesCount} Sidebar Pages Active
                    </div>
                    <div className={styles.sidebarStatsSubtitle}>
                      Changes take effect immediately on your navigation menu and persist across sessions.
                    </div>
                  </div>
                </div>
                <div className={styles.sidebarStatsActions}>
                  <button
                    type="button"
                    className={styles.sidebarQuickBtn}
                    onClick={handleEnableAllSidebarPages}
                  >
                    Reset to All Active
                  </button>
                </div>
              </div>

              {/* Grouped Sidebar Pages */}
              {SIDEBAR_CONFIG_GROUPS.map((group) => {
                const groupActiveCount = group.items.filter(
                  (item) => item.locked || (adminSidebarPages?.[item.key] !== false)
                ).length;

                return (
                  <div key={group.title} className={styles.sidebarConfigGroup}>
                    <div className={styles.sidebarConfigGroupHeader}>
                      <div>
                        <div className={styles.sidebarConfigGroupTitle}>
                          {group.title}
                          <span style={{ fontSize: '0.72rem', color: '#7c3aed', background: '#ede9fe', padding: '1px 7px', borderRadius: '10px' }}>
                            {groupActiveCount} / {group.items.length} Active
                          </span>
                        </div>
                        <div className={styles.sidebarConfigGroupDesc}>{group.description}</div>
                      </div>
                    </div>

                    <div className={styles.sidebarItemsGrid}>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isVisible = item.locked ? true : (adminSidebarPages?.[item.key] !== false);

                        return (
                          <div
                            key={item.key}
                            className={`${styles.sidebarItemCard} ${isVisible ? styles.sidebarItemCardActive : styles.sidebarItemCardInactive}`}
                          >
                            <div className={styles.sidebarItemLeft}>
                              <div className={styles.sidebarItemIconBox}>
                                <Icon size={18} />
                              </div>
                              <div className={styles.sidebarItemInfo}>
                                <div className={styles.sidebarItemName}>
                                  <span>{item.name}</span>
                                  <span className={styles.sidebarRouteBadge}>{item.path.replace('/softpicky-sn2026', '') || '/'}</span>
                                </div>
                                <div className={styles.sidebarItemDesc} title={item.desc}>
                                  {item.desc}
                                </div>
                              </div>
                            </div>

                            <div className={styles.sidebarItemRight}>
                              {item.locked ? (
                                <span className={styles.sidebarLockedBadge} title="Core system settings page cannot be disabled">
                                  <Lock size={12} /> Always ON
                                </span>
                              ) : (
                                <>
                                  <span className={isVisible ? styles.sidebarStatusBadgeActive : styles.sidebarStatusBadgeInactive}>
                                    {isVisible ? 'Visible' : 'Hidden'}
                                  </span>
                                  <CustomToggleSwitch
                                    checked={isVisible}
                                    onChange={() => handleToggleSidebarPage(item.key, item.name)}
                                    label="Toggle page visibility"
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. SECURITY & AUTH */}
          {activeTab === 'security' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ShieldCheck size={20} className={styles.sectionIcon} /> Security & Access Controls
              </h2>

              <div className={styles.grid2}>
                <div>
                  <Input
                    label="Admin Session Timeout (Minutes)"
                    type="number"
                    min="0"
                    max="1440"
                    placeholder="e.g. 60 (0 to disable)"
                    value={settings.sessionTimeoutMinutes ?? 60}
                    onChange={(e) => handleChange('sessionTimeoutMinutes', e.target.value)}
                  />
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
                    {Number(settings.sessionTimeoutMinutes) === 0 ? (
                      <span style={{ color: '#059669', fontWeight: 600 }}>
                        ● 0 min: Session timeout is disabled (Stay logged in permanently).
                      </span>
                    ) : (
                      <span>
                        ⏱️ Auto-logout after <strong>{settings.sessionTimeoutMinutes || 60} min</strong> of inactivity (takes effect after clicking Save Changes).
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Input
                    label="API Gateway Rate Limit"
                    value={settings.apiRateLimit || '100 requests / min'}
                    onChange={(e) => handleChange('apiRateLimit', e.target.value)}
                    disabled
                  />
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', lineHeight: 1.4 }}>
                    🛡️ Global Express API gateway DDoS protection active on server.
                  </div>
                </div>
              </div>

              <div className={styles.toggleCard}>
                <div>
                  <div className={styles.toggleLabel}>Enforce Two-Factor Authentication (2FA)</div>
                  <div className={styles.toggleDesc}>Require OTP authentication for administrative logins.</div>
                </div>
                <CustomToggleSwitch
                  checked={Boolean(settings.requireTwoFactor)}
                  onChange={(val) => handleChange('requireTwoFactor', val)}
                  label="Enforce Two-Factor Authentication"
                />
              </div>

              <div className={styles.sectionFooter}>
                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleSave}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* 5. THEME & APPEARANCE */}
          {activeTab === 'theme' && (
            <div className={styles.section}>
              <div className={styles.themeHeaderWrap}>
                <div>
                  <h2 className={styles.sectionTitle}>
                    <Palette size={20} className={styles.sectionIcon} /> Storefront Theme & Visual Identity
                  </h2>
                  <p className={styles.themeSubtitle}>
                    Select a signature brand palette or create your custom theme. Applied instantly across all storefront and admin pages.
                  </p>
                </div>
                <div className={styles.activeThemePill}>
                  <span className={styles.activeThemeDot} style={{ background: settings.theme?.primaryColor || '#7c3aed' }} />
                  <span>Active: <strong>{settings.theme?.name || 'Royal Purple'}</strong></span>
                </div>
              </div>

              {/* Live Sync Banner */}
              <div className={styles.themeSyncBanner}>
                <div className={styles.themeSyncIcon}>
                  <Sparkles size={18} />
                </div>
                <div className={styles.themeSyncText}>
                  <strong>Real-time Storefront Synchronization:</strong>
                  <p>
                    Switching colors here updates buttons, price highlights, gradients, navbar pills, badges, cart and checkout buttons across all pages for all customers.
                  </p>
                </div>
              </div>

              {/* Curated Presets Grid */}
              <div className={styles.themeSectionHeading}>
                <span>1. Curated Brand Theme Presets</span>
                <span className={styles.themeCountBadge}>{THEME_PRESETS.length} Handcrafted Palettes</span>
              </div>

              <div className={styles.presetGrid}>
                {THEME_PRESETS.map((preset) => {
                  const isSelected =
                    (settings.theme?.preset === preset.id) ||
                    (!settings.theme?.preset && preset.id === 'purple') ||
                    (settings.theme?.primaryColor?.toLowerCase() === preset.primary.toLowerCase());
                  return (
                    <div
                      key={preset.id}
                      className={`${styles.presetCard} ${isSelected ? styles.presetCardActive : ''}`}
                      onClick={() => handleSelectPreset(preset)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.presetCardHeader}>
                        <div className={styles.colorSwatchRing} style={{ background: preset.gradient }}>
                          <span className={styles.colorSwatchCore} style={{ background: preset.primary }} />
                        </div>
                        <span className={styles.presetBadge}>{preset.badge}</span>
                      </div>

                      <div className={styles.presetCardBody}>
                        <div className={styles.presetNameRow}>
                          <span className={styles.presetName}>{preset.name}</span>
                          {isSelected && (
                            <span className={styles.presetSelectedCheck}>
                              <Check size={13} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <p className={styles.presetDesc}>{preset.description}</p>
                      </div>

                      <div className={styles.presetPaletteStrip}>
                        <span style={{ background: preset.primary }} title="Primary" />
                        <span style={{ background: preset.hover }} title="Hover" />
                        <span style={{ background: preset.accent }} title="Accent" />
                        <span style={{ background: preset.light }} title="Subtle Light" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Brand Color */}
              <div className={styles.themeSectionHeading} style={{ marginTop: '2rem' }}>
                <span>2. Custom Brand Hex Color</span>
                <span className={styles.themeCountBadge}>Advanced</span>
              </div>

              <div className={styles.customColorCard}>
                <div className={styles.customColorInputs}>
                  <div className={styles.colorPickerWrapper}>
                    <input
                      type="color"
                      id="theme-custom-picker"
                      aria-label="Pick custom theme color"
                      value={customHex.startsWith('#') && customHex.length === 7 ? customHex : '#7c3aed'}
                      onChange={(e) => handleCustomHexChange(e.target.value)}
                      className={styles.nativeColorInput}
                    />
                    <label htmlFor="theme-custom-picker" className={styles.colorPickerTrigger} style={{ background: customHex }}>
                      <Palette size={18} color="#ffffff" />
                    </label>
                  </div>
                  <div className={styles.hexInputWrapper}>
                    <span className={styles.hexPrefix}>#</span>
                    <input
                      type="text"
                      value={customHex.replace('#', '')}
                      onChange={(e) => handleCustomHexChange('#' + e.target.value.trim())}
                      placeholder="7c3aed"
                      maxLength={6}
                      className={styles.hexTextInput}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(customHex)) {
                        handleCustomHexChange(customHex);
                        showToast(`Applied custom hex ${customHex}!`, 'info');
                      }
                    }}
                  >
                    Apply Color
                  </Button>
                </div>
                <p className={styles.customColorHelp}>
                  Enter any brand hex code. Picky automatically computes complementary light accents, gradients, hover states, and shadows.
                </p>
              </div>

              {/* Live Storefront Component Preview */}
              <div className={styles.themeSectionHeading} style={{ marginTop: '2rem' }}>
                <span>3. Live Storefront Component Preview</span>
                <span className={styles.themeCountBadge}>Interactive</span>
              </div>

              <div className={styles.previewContainer}>
                {/* Mini Announcement Bar */}
                <div className={styles.previewAnnouncement}>
                  <span>✨ Free Delivery on all orders above ₹999 | Use Code <strong>PICKY10</strong> for 10% OFF</span>
                </div>

                {/* Mini Product Card Component */}
                <div className={styles.previewGrid}>
                  <div className={styles.previewCard}>
                    <div className={styles.previewCardTop}>
                      <span className={styles.previewBadge}>25% OFF</span>
                      <span className={styles.previewPill}>New Arrival</span>
                    </div>
                    <div className={styles.previewProductTitle}>Kanchipuram Pure Silk Saree</div>
                    <div className={styles.previewPriceRow}>
                      <span className={styles.previewPriceCurrent}>₹4,999</span>
                      <span className={styles.previewPriceOriginal}>₹6,999</span>
                    </div>
                    <div className={styles.previewButtonsRow}>
                      <button type="button" className={styles.previewPrimaryBtn}>
                        Add to Bag
                      </button>
                      <button type="button" className={styles.previewSecondaryBtn}>
                        Buy Now
                      </button>
                    </div>
                  </div>

                  {/* Mini Navigation Tabs */}
                  <div className={styles.previewNavCard}>
                    <div className={styles.previewNavTitle}>Store Navigation Pills</div>
                    <div className={styles.previewNavPills}>
                      <span className={styles.previewNavPillActive}>Sarees</span>
                      <span className={styles.previewNavPill}>Kurtis</span>
                      <span className={styles.previewNavPill}>Handloom</span>
                      <span className={styles.previewNavPill}>Festive</span>
                    </div>

                    <div style={{ marginTop: '1.25rem' }}>
                      <div className={styles.previewNavTitle}>Trust Guarantee & Icons</div>
                      <div className={styles.previewTrustRow}>
                        <div className={styles.previewTrustItem}>
                          <Truck size={16} className={styles.previewIconPrimary} />
                          <span>Express Shipping</span>
                        </div>
                        <div className={styles.previewTrustItem}>
                          <ShieldCheck size={16} className={styles.previewIconPrimary} />
                          <span>Verified Quality</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Footer with Save Button */}
              <div className={styles.sectionFooter} style={{ marginTop: '2rem' }}>
                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={handleSave}
                  loading={saving}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  </div>
</AdminLayout>
);
}
