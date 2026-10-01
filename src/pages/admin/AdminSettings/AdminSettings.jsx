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
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useUiStore } from '../../../store/uiStore';
import styles from './AdminSettings.module.css';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'order',
    category: 'Orders',
    title: 'New Order #ORD-2026-894 received',
    message: 'Priya Ramesh placed an order for ₹2,499 (3 items) with Online Payment.',
    date: '01 Oct 2026',
    time: '02:35 PM',
    relativeTime: '10 mins ago',
    unread: true,
    starred: false,
    link: '/pickyadmin-softnova2026/orders',
    linkText: 'View Order',
    tagClass: 'tagOrder',
    iconClass: 'iconOrder',
  },
  {
    id: 'notif-2',
    type: 'inventory',
    category: 'Inventory',
    title: 'Low Stock Alert: Embroidered Rayon Anarkali Kurti',
    message: 'Stock level dropped to 3 units remaining. Please reorder from supplier.',
    date: '01 Oct 2026',
    time: '01:55 PM',
    relativeTime: '45 mins ago',
    unread: true,
    starred: true,
    link: '/pickyadmin-softnova2026/inventory',
    linkText: 'Inspect Stock',
    tagClass: 'tagInventory',
    iconClass: 'iconInventory',
  },
  {
    id: 'notif-3',
    type: 'coupon',
    category: 'Coupons & Discounts',
    title: 'Coupon Limit Reaching: FESTIVE25',
    message: 'Coupon FESTIVE25 reached 85% of total redemption limit (425 of 500 uses applied).',
    date: '01 Oct 2026',
    time: '12:40 PM',
    relativeTime: '2 hours ago',
    unread: false,
    link: '/pickyadmin-softnova2026/coupons',
    linkText: 'Manage Coupons',
    tagClass: 'tagCoupon',
    iconClass: 'iconCoupon',
  },
  {
    id: 'notif-8',
    type: 'product',
    category: 'Products',
    title: 'New Product Added: Cotton Chikankari Kurta',
    message: 'Product successfully added to Women\'s Fashion catalog with 5 size variants.',
    date: '01 Oct 2026',
    time: '11:30 AM',
    relativeTime: '3 hours ago',
    unread: true,
    link: '/pickyadmin-softnova2026/products',
    linkText: 'View Product',
    tagClass: 'tagProduct',
    iconClass: 'iconProduct',
  },
  {
    id: 'notif-4',
    type: 'order',
    category: 'Orders',
    title: 'Order #ORD-2026-889 Dispatched',
    message: 'Package handed over to Blue Dart courier with tracking code #BD9827361.',
    date: '01 Oct 2026',
    time: '10:20 AM',
    relativeTime: '4 hours ago',
    unread: false,
    link: '/pickyadmin-softnova2026/orders',
    linkText: 'Track Shipment',
    tagClass: 'tagOrder',
    iconClass: 'iconOrder',
  },
  {
    id: 'notif-5',
    type: 'customer',
    category: 'Customers',
    title: 'New VIP Customer Registration',
    message: 'Ananya Krishnan (ananya.k@gmail.com) created an account from Chennai, TN.',
    date: '01 Oct 2026',
    time: '08:45 AM',
    relativeTime: '6 hours ago',
    unread: true,
    link: '/pickyadmin-softnova2026/customers',
    linkText: 'View Profile',
    tagClass: 'tagCustomer',
    iconClass: 'iconCustomer',
  },
  {
    id: 'notif-9',
    type: 'product',
    category: 'Products',
    title: 'Catalog Price Updated: Festive Sale',
    message: 'Festive discount prices applied across 12 items in Ethnic Wear collection.',
    date: '30 Sep 2026',
    time: '06:15 PM',
    relativeTime: 'Yesterday',
    unread: false,
    link: '/pickyadmin-softnova2026/products',
    linkText: 'Inspect Catalog',
    tagClass: 'tagProduct',
    iconClass: 'iconProduct',
  },
  {
    id: 'notif-6',
    type: 'inventory',
    category: 'Inventory',
    title: 'Out of Stock: Traditional Temple Silk Saree',
    message: 'Variant "Maroon / Free Size" is completely sold out. Auto-marked out of stock.',
    date: '30 Sep 2026',
    time: '04:10 PM',
    relativeTime: 'Yesterday',
    unread: false,
    link: '/pickyadmin-softnova2026/inventory',
    linkText: 'Restock Product',
    tagClass: 'tagInventory',
    iconClass: 'iconInventory',
  },
  {
    id: 'notif-7',
    type: 'system',
    category: 'System',
    title: 'Automated Catalog Backup Completed',
    message: 'Weekly system backup of 10 categories and 124 product variants completed successfully.',
    date: '30 Sep 2026',
    time: '02:00 AM',
    relativeTime: 'Yesterday',
    unread: false,
    link: null,
    linkText: null,
    tagClass: 'tagSystem',
    iconClass: 'iconSystem',
  },
];

const DEFAULT_SETTINGS = {
  // General
  storeName: 'Picky Store',
  storeTagline: 'Curated Fashion & Lifestyle Essentials',
  supportEmail: 'support@picky.com',
  supportPhone: '+91 98765 43210',
  currency: 'INR (₹)',
  timezone: 'Asia/Kolkata (IST)',
  address: '123 SoftNova Tech Park, Main Expressway, Chennai, TN, 600001',
  maintenanceMode: false,

  // Shipping
  standardShippingFee: '49',
  estimatedDeliveryDays: '3-5 Business Days',

  // Notifications
  orderEmailAlerts: true,
  customerOrderConfirmation: true,
  lowStockAlerts: true,
  adminAlertEmail: 'aglish@softnova.dev',

  // Security
  sessionTimeoutMinutes: '60',
  requireTwoFactor: false,
  apiRateLimit: '100 requests / min',
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const { showToast } = useUiStore();
  const [saving, setSaving] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const validTabs = ['general', 'shipping', 'notifications', 'security'];
  const [activeTab, setActiveTab] = useState(
    tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'general'
  );

  // Notifications center state
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('picky_admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned = parsed.map((n) => {
          const match = INITIAL_NOTIFICATIONS.find((init) => init.id === n.id);
          return {
            ...n,
            message: n.message ? n.message.replace(/Cash on Delivery/gi, 'Online Payment') : n.message,
            date: n.date || match?.date || '01 Oct 2026',
            time: n.time && n.time.includes('M') ? n.time : (match?.time || '02:35 PM'),
            relativeTime: n.relativeTime || (n.time && !n.time.includes('M') ? n.time : match?.relativeTime || '10 mins ago'),
            link: n.link || match?.link || null,
            linkText: n.linkText || match?.linkText || 'View Details',
            starred: n.starred !== undefined ? n.starred : (match?.starred || false),
          };
        });
        if (cleaned.some((n) => n.type === 'product')) {
          return cleaned;
        }
      }
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Separate Category, Date, and Search filters
  const [notifCategory, setNotifCategory] = useState('all');
  const [notifDate, setNotifDate] = useState('all');
  const [notifSearch, setNotifSearch] = useState('');
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    let matchesCategory = true;
    if (notifCategory === 'orders') matchesCategory = n.type === 'order';
    else if (notifCategory === 'products') matchesCategory = n.type === 'product';
    else if (notifCategory === 'customers') matchesCategory = n.type === 'customer';
    else if (notifCategory === 'inventory') matchesCategory = n.type === 'inventory';
    else if (notifCategory === 'coupons') matchesCategory = n.type === 'coupon';
    else if (notifCategory === 'system') matchesCategory = n.type === 'system';

    let matchesDate = true;
    if (notifDate === 'today') {
      matchesDate = !n.relativeTime?.includes('Yesterday') && (n.date?.includes('01 Oct') || !n.date);
    } else if (notifDate === 'earlier') {
      matchesDate = n.relativeTime?.includes('Yesterday') || (n.date && n.date.includes('30 Sep'));
    }

    let matchesSearch = true;
    if (notifSearch.trim()) {
      const q = notifSearch.toLowerCase().trim();
      const title = (n.title || '').toLowerCase();
      const message = (n.message || '').toLowerCase();
      const category = (n.category || '').toLowerCase();
      matchesSearch = title.includes(q) || message.includes(q) || category.includes(q);
    }

    return matchesCategory && matchesDate && matchesSearch;
  });

  const unreadCount = notifications.filter((n) => n.unread).length;
  const starredCount = notifications.filter((n) => n.starred).length;

  const isFilterActive =
    notifCategory !== 'all' ||
    notifDate !== 'all' ||
    notifSearch.trim() !== '';

  const handleResetFilters = () => {
    setNotifCategory('all');
    setNotifDate('all');
    setNotifSearch('');
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Reset pagination & selection on filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [notifCategory, notifDate, notifSearch]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredNotifications.length);
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Category counts
  const catAllCount = notifications.length;
  const catOrdersCount = notifications.filter((n) => n.type === 'order').length;
  const catProductsCount = notifications.filter((n) => n.type === 'product').length;
  const catCustomersCount = notifications.filter((n) => n.type === 'customer').length;
  const catInventoryCount = notifications.filter((n) => n.type === 'inventory').length;
  const catCouponsCount = notifications.filter((n) => n.type === 'coupon').length;
  const catSystemCount = notifications.filter((n) => n.type === 'system').length;

  // Date counts for filter pills
  const dateAllCount = notifications.length;
  const dateTodayCount = notifications.filter(
    (n) => !n.relativeTime?.includes('Yesterday') && (n.date?.includes('01 Oct') || !n.date)
  ).length;
  const dateEarlierCount = notifications.filter(
    (n) => n.relativeTime?.includes('Yesterday') || (n.date && n.date.includes('30 Sep'))
  ).length;

  // Status counts
  const statusAllCount = notifications.length;
  const statusUnreadCount = notifications.filter((n) => n.unread).length;
  const statusReadCount = notifications.filter((n) => !n.unread).length;

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    showToast('All notifications marked as read', 'info');
  };

  const handleDismissNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    showToast('Notification dismissed', 'info');
  };

  const handleToggleRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n
    );
    setNotifications(updated);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
  };

  const handleNotificationClick = (notif) => {
    if (notif.unread) {
      handleToggleRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  // Gmail Inbox selection & actions state
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    paginatedNotifications.length > 0 &&
    paginatedNotifications.every((n) => selectedIds.includes(n.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedNotifications.some((n) => n.id === id))
      );
    } else {
      const pageIds = paginatedNotifications.map((n) => n.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectRow = (e, id) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleStar = (e, id) => {
    e.stopPropagation();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, starred: !n.starred } : n
    );
    setNotifications(updated);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
  };

  const handleToggleReadRow = (e, id) => {
    e.stopPropagation();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, unread: !n.unread } : n
    );
    setNotifications(updated);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteRow = (e, id) => {
    e.stopPropagation();
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    showToast('Notification deleted', 'info');
  };

  const handleBatchMarkRead = () => {
    const updated = notifications.map((n) =>
      selectedIds.includes(n.id) ? { ...n, unread: false } : n
    );
    setNotifications(updated);
    setSelectedIds([]);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    showToast('Selected notifications marked as read', 'info');
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      showToast('Please select notifications using the checkboxes to bulk delete', 'warning');
      return;
    }
    const count = selectedIds.length;
    const updated = notifications.filter((n) => !selectedIds.includes(n.id));
    setNotifications(updated);
    setSelectedIds([]);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    showToast(`${count} notification${count > 1 ? 's' : ''} deleted successfully`, 'info');
  };

  const formatEmailDate = (notif) => {
    if (notif.relativeTime === 'Yesterday' || (notif.date && notif.date.includes('30 Sep'))) {
      return '30 Sept';
    }
    return notif.time || '02:35 PM';
  };

  const renderNotifIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} />;
      case 'product':
        return <Package size={18} />;
      case 'inventory':
        return <Boxes size={18} />;
      case 'coupon':
        return <Tag size={18} />;
      case 'customer':
        return <Users size={18} />;
      default:
        return <CheckCircle2 size={18} />;
    }
  };

  useEffect(() => {
    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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

  const handleChange = (field, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem('picky_admin_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('picky_admin_settings', JSON.stringify(settings));
      localStorage.setItem('picky_admin_notifications', JSON.stringify(notifications));
      setTimeout(() => {
        setSaving(false);
        showToast('Settings saved successfully!', 'success');
      }, 350);
    } catch {
      setSaving(false);
      showToast('Failed to save settings', 'error');
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
              Configure global store details, shipping rules, notifications, and security protocols.
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
                  <div className={styles.sidebarNavSub}>Store identity & currency</div>
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

              {/* 3. Notifications */}
              <button
                type="button"
                className={`${styles.sidebarNavItem} ${activeTab === 'notifications' ? styles.sidebarNavActive : ''}`}
                onClick={() => handleTabChange('notifications')}
              >
                <div className={`${styles.sidebarNavIconBox} ${activeTab === 'notifications' ? styles.iconBoxActive : ''}`}>
                  <Bell size={18} />
                </div>
                <div className={styles.sidebarNavText}>
                  <div className={styles.sidebarNavLabel}>Notifications</div>
                  <div className={styles.sidebarNavSub}>Live feed & dispatch alerts</div>
                </div>
                {unreadCount > 0 ? (
                  <span className={styles.sidebarNavBadge}>{unreadCount}</span>
                ) : (
                  <ChevronRight size={15} className={styles.sidebarNavArrow} />
                )}
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
                />
                <Input
                  label="Support Phone Number"
                  type="tel"
                  icon={<Phone size={16} />}
                  value={settings.supportPhone}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                />
                <Input
                  label="Currency Symbol / Code"
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                />
                <Input
                  label="Timezone"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                />
              </div>

              <div className={styles.fullWidthField}>
                <Input
                  label="Official Store Address"
                  icon={<MapPin size={16} />}
                  value={settings.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div className={styles.toggleCard}>
                <div>
                  <div className={styles.toggleLabel}>Store Maintenance Mode</div>
                  <div className={styles.toggleDesc}>
                    Temporarily disable public browsing and checkout for users while performing updates.
                  </div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
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
              <h2 className={styles.sectionTitle}>
                <Truck size={20} className={styles.sectionIcon} /> Shipping Rates & Logistics Rules
              </h2>
              <div className={styles.grid2}>
                <Input
                  label="Standard Shipping Fee (₹)"
                  type="number"
                  value={settings.standardShippingFee}
                  onChange={(e) => handleChange('standardShippingFee', e.target.value)}
                />
                <Input
                  label="Estimated Delivery Window"
                  value={settings.estimatedDeliveryDays}
                  onChange={(e) => handleChange('estimatedDeliveryDays', e.target.value)}
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

          {/* 4. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className={styles.section}>
              {/* Top: Notifications Center Header & Actions */}
              <div className={styles.notifCenterHeader}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '0.2rem' }}>
                    <Bell size={20} className={styles.sectionIcon} /> Store Notifications & Activity Feed
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                    Live alerts for customer orders, inventory stock levels, coupon promotions, and system events.
                  </p>
                </div>
                <div className={styles.notifHeaderActions}>
                  {unreadCount > 0 && (
                    <button type="button" onClick={handleMarkAllRead} className={styles.markAllBtn} title="Mark all notifications as read">
                      <CheckCheck size={16} /> Mark All as Read ({unreadCount})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAlertModalOpen(true)}
                    className={styles.notifSettingsIconBtn}
                    title="Alert Dispatch Preferences"
                    aria-label="Alert Dispatch Preferences"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>

              {/* Filter and Search Bar Section - Single Unified Modern Toolbar */}
              <div className={styles.notifFiltersSection}>
                {/* Category Dropdown */}
                <div className={styles.categoryDropdownWrapper}>
                  <Filter size={14} className={styles.dropdownIcon} />
                  <select
                    value={notifCategory}
                    onChange={(e) => setNotifCategory(e.target.value)}
                    className={styles.categoryDropdown}
                  >
                    <option value="all">All Categories ({catAllCount})</option>
                    <option value="orders">Orders ({catOrdersCount})</option>
                    <option value="products">Products ({catProductsCount})</option>
                    <option value="customers">Customers ({catCustomersCount})</option>
                    <option value="inventory">Inventory ({catInventoryCount})</option>
                    <option value="coupons">Coupons & Discounts ({catCouponsCount})</option>
                    <option value="system">System ({catSystemCount})</option>
                  </select>
                  <ChevronDown size={14} className={styles.dropdownArrow} />
                </div>

                {/* Search Bar */}
                <div className={styles.notifSearchBox}>
                  <Search size={15} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={notifSearch}
                    onChange={(e) => setNotifSearch(e.target.value)}
                    className={styles.notifSearchInput}
                  />
                  {notifSearch && (
                    <button
                      type="button"
                      onClick={() => setNotifSearch('')}
                      className={styles.searchClearBtn}
                      title="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Date Filter Pills (Matching Picky Admin Filter Format) */}
                <div className={styles.dateFilterRow} role="group" aria-label="Filter notifications by date">
                  <button
                    type="button"
                    onClick={() => setNotifDate('all')}
                    className={`${styles.filterPillBtn} ${notifDate === 'all' ? styles.filterPillBtnActive : ''}`}
                    title="Show all notifications"
                  >
                    <Calendar size={13} className={styles.pillIcon} />
                    <span>All Dates</span>
                    <span className={styles.pillBadge}>{dateAllCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifDate('today')}
                    className={`${styles.filterPillBtn} ${notifDate === 'today' ? styles.filterPillBtnActive : ''}`}
                    title="Show today's notifications"
                  >
                    <Clock size={13} className={styles.pillIcon} />
                    <span>Today</span>
                    <span className={styles.pillBadge}>{dateTodayCount}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifDate('earlier')}
                    className={`${styles.filterPillBtn} ${notifDate === 'earlier' ? styles.filterPillBtnActive : ''}`}
                    title="Show older notifications"
                  >
                    <History size={13} className={styles.pillIcon} />
                    <span>Yesterday & Earlier</span>
                    <span className={styles.pillBadge}>{dateEarlierCount}</span>
                  </button>
                </div>

                {/* Permanent Reset Filters Button (Prevents Layout Shifting) */}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  disabled={!isFilterActive}
                  className={`${styles.resetFiltersBtn} ${!isFilterActive ? styles.resetFiltersBtnDisabled : styles.resetFiltersBtnActive}`}
                  title={isFilterActive ? 'Reset all filters to default' : 'No active filters to reset'}
                >
                  <RotateCcw size={13} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Email-Style Notification Inbox Table (Gmail Layout) */}
              <div className={styles.emailInboxWrapper}>
                {/* Email Toolbar */}
                <div className={styles.emailToolbar}>
                  <div className={styles.toolbarLeft}>
                    {/* Select All Checkbox */}
                    <label className={styles.toolbarCheckWrap} title={isAllSelected ? 'Deselect all on this page' : 'Select all on this page'}>
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        className={styles.emailCheckbox}
                      />
                    </label>

                    {/* Dedicated Bulk Delete Button (appears only when items are selected) */}
                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        className={`${styles.toolbarBtn} ${styles.bulkDeleteBtn} ${styles.bulkDeleteActive}`}
                        onClick={handleBatchDelete}
                        title={`Delete ${selectedIds.length} selected notification(s)`}
                      >
                        <Trash2 size={14} />
                        <span>Bulk Delete ({selectedIds.length})</span>
                      </button>
                    )}

                    {/* Mark Read when items selected */}
                    {selectedIds.length > 0 && (
                      <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={handleBatchMarkRead}
                        title="Mark selected as read"
                      >
                        <MailOpen size={14} />
                        <span>Mark Read</span>
                      </button>
                    )}

                    {/* Mark All Read (when nothing selected and unread exists) */}
                    {selectedIds.length === 0 && unreadCount > 0 && (
                      <button
                        type="button"
                        className={styles.toolbarBtn}
                        onClick={handleMarkAllRead}
                        title="Mark all notifications as read"
                      >
                        <CheckCheck size={14} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Email Rows */}
                {filteredNotifications.length === 0 ? (
                  <div className={styles.emptyInbox}>
                    <CheckCircle2 size={36} className={styles.emptyIcon} />
                    <div className={styles.emptyText}>No notifications in this filter</div>
                    <div className={styles.emptySubtext}>You are all caught up with your store activity! ✨</div>
                  </div>
                ) : (
                  <div className={styles.emailRowsContainer}>
                    {paginatedNotifications.map((notif) => {
                      const isSelected = selectedIds.includes(notif.id);

                      return (
                        <div
                          key={notif.id}
                          className={`${styles.emailRow} ${
                            notif.unread ? styles.emailRowUnread : styles.emailRowRead
                          } ${isSelected ? styles.emailRowSelected : ''}`}
                          onClick={() => handleNotificationClick(notif)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleNotificationClick(notif);
                            }
                          }}
                        >
                          {/* Checkbox Column */}
                          <div className={styles.emailCheckCol} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className={styles.emailCheckbox}
                              checked={isSelected}
                              onChange={(e) => handleToggleSelectRow(e, notif.id)}
                              aria-label={`Select notification ${notif.title}`}
                            />
                          </div>

                          {/* Star Column */}
                          <div className={styles.emailStarCol} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className={`${styles.emailStarBtn} ${notif.starred ? styles.emailStarActive : ''}`}
                              onClick={(e) => handleToggleStar(e, notif.id)}
                              title={notif.starred ? 'Starred' : 'Not starred'}
                            >
                              <Star
                                size={16}
                                fill={notif.starred ? '#f59e0b' : 'none'}
                                color={notif.starred ? '#f59e0b' : '#94a3b8'}
                              />
                            </button>
                          </div>

                          {/* Sender / Category Column */}
                          <div className={styles.emailSender} title={notif.category}>
                            {notif.category}
                          </div>

                          {/* Subject & Snippet Column (Single Line Gmail Style) */}
                          <div className={styles.emailContent}>
                            <span className={styles.emailSubject}>{notif.title}</span>
                            <span className={styles.emailSeparator}>-</span>
                            <span className={styles.emailSnippet}>{notif.message}</span>
                          </div>

                          {/* Right: Date / Time + Hover Quick Actions */}
                          <div className={styles.emailDateActions}>
                            {/* Hover Quick Action Buttons */}
                            <div className={styles.emailRowActions}>
                              {notif.link && (
                                <button
                                  type="button"
                                  className={styles.emailActionBtn}
                                  title="Open page"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (notif.unread) handleToggleRead(notif.id);
                                    navigate(notif.link);
                                  }}
                                >
                                  <ExternalLink size={15} />
                                </button>
                              )}
                              <button
                                type="button"
                                className={styles.emailActionBtn}
                                title={notif.unread ? 'Mark as read' : 'Mark as unread'}
                                onClick={(e) => handleToggleReadRow(e, notif.id)}
                              >
                                {notif.unread ? <MailOpen size={15} /> : <Mail size={15} />}
                              </button>
                              <button
                                type="button"
                                className={`${styles.emailActionBtn} ${styles.emailDeleteBtn}`}
                                title="Delete notification"
                                onClick={(e) => handleDeleteRow(e, notif.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* Date / Time */}
                            <span className={styles.emailDate}>
                              {formatEmailDate(notif)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Bottom Pagination Footer */}
                {filteredNotifications.length > pageSize && (
                  <div className={styles.inboxPaginationFooter}>
                    <div className={styles.pageBtnGroup}>
                      <button
                        type="button"
                        className={styles.paginationBtn}
                        onClick={handlePrevPage}
                        disabled={safeCurrentPage <= 1}
                      >
                        <ChevronLeft size={15} /> Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          className={`${styles.pageNumBtn} ${
                            pageNum === safeCurrentPage ? styles.pageNumBtnActive : ''
                          }`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={styles.paginationBtn}
                        onClick={handleNextPage}
                        disabled={safeCurrentPage >= totalPages}
                      >
                        Next <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Alert Dispatch Preferences Modal (Opened by top right Settings icon) */}
              <Modal
                isOpen={alertModalOpen}
                onClose={() => setAlertModalOpen(false)}
                title="Alert Dispatch Preferences"
                maxWidth={560}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className={styles.fullWidthField}>
                    <Input
                      label="Admin Alert Dispatch Email"
                      type="email"
                      value={settings.adminAlertEmail}
                      onChange={(e) => handleChange('adminAlertEmail', e.target.value)}
                    />
                  </div>

                  <div className={styles.toggleCard}>
                    <div>
                      <div className={styles.toggleLabel}>Customer Order Confirmation Emails</div>
                      <div className={styles.toggleDesc}>Send automatic email receipts whenever an order is successfully placed.</div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={settings.customerOrderConfirmation}
                        onChange={(e) => handleChange('customerOrderConfirmation', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleCard}>
                    <div>
                      <div className={styles.toggleLabel}>Admin New Order Instant Alerts</div>
                      <div className={styles.toggleDesc}>Receive immediate email notification for every incoming order.</div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={settings.orderEmailAlerts}
                        onChange={(e) => handleChange('orderEmailAlerts', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.toggleCard}>
                    <div>
                      <div className={styles.toggleLabel}>Low Inventory Threshold Alerts</div>
                      <div className={styles.toggleDesc}>Notify admin when any product stock falls below 5 items.</div>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={settings.lowStockAlerts}
                        onChange={(e) => handleChange('lowStockAlerts', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', gap: '0.5rem' }}>
                    <Button
                      variant="primary"
                      size="md"
                      type="button"
                      onClick={() => {
                        handleSave();
                        setAlertModalOpen(false);
                      }}
                      loading={saving}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>
          )}

          {/* 5. SECURITY & AUTH */}
          {activeTab === 'security' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <ShieldCheck size={20} className={styles.sectionIcon} /> Security & Access Controls
              </h2>

              <div className={styles.grid2}>
                <Input
                  label="Admin Session Timeout (Minutes)"
                  type="number"
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => handleChange('sessionTimeoutMinutes', e.target.value)}
                />
                <Input
                  label="API Gateway Rate Limit"
                  value={settings.apiRateLimit}
                  onChange={(e) => handleChange('apiRateLimit', e.target.value)}
                  disabled
                />
              </div>

              <div className={styles.toggleCard}>
                <div>
                  <div className={styles.toggleLabel}>Enforce Two-Factor Authentication (2FA)</div>
                  <div className={styles.toggleDesc}>Require OTP authentication for administrative logins.</div>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={settings.requireTwoFactor}
                    onChange={(e) => handleChange('requireTwoFactor', e.target.checked)}
                  />
                  <span className={styles.slider}></span>
                </label>
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
        </form>
      </main>
    </div>
  </div>
</AdminLayout>
);
}
