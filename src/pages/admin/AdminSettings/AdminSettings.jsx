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
  Plus,
  Gift,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { adminService } from '../../../services/admin.service';
import { contactService } from '../../../services/contact.service';
import { useUiStore } from '../../../store/uiStore';
import styles from './AdminSettings.module.css';

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

const isNotifToday = (notif) => {
  if (!notif) return false;
  if (notif.createdAt) {
    const d = new Date(notif.createdAt);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }
  }
  return notif.relativeTime === 'Today';
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

  // Notifications center state - purely from live database or synced cache
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('picky_admin_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Reject any legacy mock items
          return parsed.filter((n) => n && n.id && !String(n.id).startsWith('notif-'));
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Separate Category, Date, and Search filters
  const [notifCategory, setNotifCategory] = useState('all');
  const [notifDate, setNotifDate] = useState('all');
  const [notifSearch, setNotifSearch] = useState('');
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedContactModal, setSelectedContactModal] = useState(null);
  const [contactDetailsLoading, setContactDetailsLoading] = useState(false);
  const [contactFullData, setContactFullData] = useState(null);

  // Sync notifications with backend on mount & listen to changes
  useEffect(() => {
    async function syncBackendNotifs() {
      try {
        const res = await contactService.getNotifications({ limit: 50 }).catch(() => null);
        const apiNotifs = res?.data?.notifications || res?.data;
        if (Array.isArray(apiNotifs)) {
          const apiFormatted = apiNotifs.map((n) => {
            const created = n.createdAt ? new Date(n.createdAt) : new Date();
            const today = isNotifToday(n);
            return {
              ...n,
              id: n._id ? String(n._id) : String(n.id),
              date: created.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              }),
              time: created.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              }),
              relativeTime: today ? 'Today' : 'Earlier',
            };
          });

          // Pure 100% database notifications - overwrite any stale dummy cache
          setNotifications(apiFormatted);
          try {
            localStorage.setItem('picky_admin_notifications', JSON.stringify(apiFormatted));
          } catch {}
        }
      } catch (err) {
        console.warn('Backend notification fetch note:', err);
      }
    }
    syncBackendNotifs();

    const handleStorageChange = (e) => {
      if (e.key === 'picky_admin_notifications' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotifications(parsed.filter((n) => n && n.id && !String(n.id).startsWith('notif-')));
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredNotifications = notifications.filter((n) => {
    let matchesCategory = true;
    if (notifCategory === 'orders') matchesCategory = n.type === 'order';
    else if (notifCategory === 'products') matchesCategory = n.type === 'product';
    else if (notifCategory === 'customers') matchesCategory = n.type === 'customer';
    else if (notifCategory === 'inventory') matchesCategory = n.type === 'inventory';
    else if (notifCategory === 'coupons') matchesCategory = n.type === 'coupon';
    else if (notifCategory === 'contact') matchesCategory = n.type === 'contact';
    else if (notifCategory === 'system') matchesCategory = n.type === 'system';

    let matchesDate = true;
    if (notifDate === 'today') {
      matchesDate = isNotifToday(n);
    } else if (notifDate === 'earlier') {
      matchesDate = !isNotifToday(n);
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
  const catContactCount = notifications.filter((n) => n.type === 'contact').length;
  const catSystemCount = notifications.filter((n) => n.type === 'system').length;

  // Date counts for filter pills
  const dateAllCount = notifications.length;
  const dateTodayCount = notifications.filter(isNotifToday).length;
  const dateEarlierCount = notifications.filter((n) => !isNotifToday(n)).length;

  // Status counts
  const statusAllCount = notifications.length;
  const statusUnreadCount = notifications.filter((n) => n.unread).length;
  const statusReadCount = notifications.filter((n) => !n.unread).length;

  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    setNotifications(updated);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    contactService.markAllNotificationsRead().catch(() => {});
    showToast('All notifications marked as read', 'info');
  };

  const handleDismissNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    if (id && !id.startsWith('notif-')) {
      contactService.deleteNotification(id).catch(() => {});
    }
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
    if (id && !id.startsWith('notif-')) {
      contactService.markNotificationRead(id).catch(() => {});
    }
  };

  const handleNotificationClick = async (notif) => {
    if (notif.unread) {
      handleToggleRead(notif.id);
    }
    // If it's a contact inquiry, open modal with inquiry and file preview/download
    if (notif.type === 'contact' || notif.metadata?.inquiryId) {
      setSelectedContactModal(notif);
      setContactFullData(null);
      if (notif.metadata?.inquiryId) {
        setContactDetailsLoading(true);
        try {
          const res = await contactService.getById(notif.metadata.inquiryId).catch(() => null);
          if (res?.data) {
            setContactFullData(res.data);
          }
        } catch (e) {
          console.warn('Could not fetch inquiry details:', e);
        } finally {
          setContactDetailsLoading(false);
        }
      }
      return;
    }
    if (notif.link && notif.link !== `${ADMIN}/settings?tab=notifications`) {
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
    if (id && !id.startsWith('notif-')) {
      contactService.deleteNotification(id).catch(() => {});
    }
    showToast('Notification deleted', 'info');
  };

  const handleBatchMarkRead = () => {
    const updated = notifications.map((n) =>
      selectedIds.includes(n.id) ? { ...n, unread: false } : n
    );
    setNotifications(updated);
    selectedIds.forEach((id) => {
      if (id && !id.startsWith('notif-')) contactService.markNotificationRead(id).catch(() => {});
    });
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
    selectedIds.forEach((id) => {
      if (id && !id.startsWith('notif-')) contactService.deleteNotification(id).catch(() => {});
    });
    setNotifications(updated);
    setSelectedIds([]);
    try {
      localStorage.setItem('picky_admin_notifications', JSON.stringify(updated));
    } catch {}
    showToast(`${count} notification${count > 1 ? 's' : ''} deleted successfully`, 'info');
  };

  const formatEmailDate = (notif) => {
    if (notif.createdAt) {
      const d = new Date(notif.createdAt);
      if (!isNaN(d.getTime())) {
        if (isNotifToday(notif)) {
          return notif.time || d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      }
    }
    return notif.time || 'Recent';
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
      case 'contact':
        return <MessageSquare size={18} />;
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

  // Load live settings from MongoDB Atlas
  useEffect(() => {
    async function loadBackendSettings() {
      try {
        const res = await adminService.getSettings().catch(() => null);
        const data = res?.data || res;
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const shippingData = data.shipping || {};
          setSettings((prev) => ({
            ...prev,
            ...data,
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
          }));
        }
      } catch (err) {
        console.warn('Using local settings cache:', err);
      }
    }
    loadBackendSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem('picky_admin_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
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

      localStorage.setItem('picky_admin_settings', JSON.stringify(payload));
      localStorage.setItem('picky_shipping_settings', JSON.stringify(payload.shipping));
      localStorage.setItem('picky_admin_notifications', JSON.stringify(notifications));
      await adminService.updateSettings(payload);
      showToast('Shipping settings saved to database successfully!', 'success');
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
                    <option value="contact">Contact & Support ({catContactCount})</option>
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
                            {(notif.hasAttachment || notif.metadata?.hasAttachment || notif.attachmentUrl || notif.metadata?.fileUrl) && (
                              <span className={styles.attachmentBadge} title="File attachment included">
                                <Paperclip size={12} /> File
                              </span>
                            )}
                            {(notif.metadata?.isGiftWrapped || notif.title?.includes('[GIFT WRAP]')) && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  color: '#e11d48',
                                  background: '#fff1f2',
                                  border: '1px solid #fecdd3',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '9999px',
                                  marginLeft: '0.45rem',
                                  marginRight: '0.35rem',
                                }}
                                title={notif.metadata?.giftMessage ? `Gift Message: "${notif.metadata.giftMessage}"` : 'Gift Wrap Included'}
                              >
                                🎁 Gift Wrap
                              </span>
                            )}
                            <span className={styles.emailSeparator}>-</span>
                            <span className={styles.emailSnippet}>{notif.message}</span>
                          </div>

                          {/* Right: Date / Time + Hover Quick Actions */}
                          <div className={styles.emailDateActions}>
                            {/* Hover Quick Action Buttons */}
                            <div className={styles.emailRowActions}>
                              {notif.type === 'contact' || notif.metadata?.inquiryId ? (
                                <button
                                  type="button"
                                  className={styles.emailActionBtn}
                                  title="Preview inquiry & attachment"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationClick(notif);
                                  }}
                                >
                                  <Eye size={15} />
                                </button>
                              ) : notif.link ? (
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
                              ) : null}
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

              {/* Contact Inquiry & Attachment Preview Modal */}
              <Modal
                isOpen={Boolean(selectedContactModal)}
                onClose={() => {
                  setSelectedContactModal(null);
                  setContactFullData(null);
                }}
                title="Support Inquiry & Attachment"
                maxWidth={620}
              >
                {selectedContactModal && (() => {
                  const inquiry = contactFullData || selectedContactModal.metadata || {};
                  const fullName = inquiry.fullName || selectedContactModal.title.replace('New Support Inquiry from ', '') || 'Customer';
                  const email = inquiry.email || selectedContactModal.metadata?.email;
                  const phone = inquiry.phone || selectedContactModal.metadata?.phone;
                  const message = inquiry.message || selectedContactModal.message;
                  const file = inquiry.file || (selectedContactModal.metadata?.fileUrl ? {
                    url: selectedContactModal.metadata.fileUrl,
                    originalName: selectedContactModal.metadata.fileName,
                    mimeType: selectedContactModal.metadata.fileMime,
                    size: selectedContactModal.metadata.fileSize,
                  } : null) || (selectedContactModal.attachmentUrl ? {
                    url: selectedContactModal.attachmentUrl,
                    originalName: selectedContactModal.attachmentName,
                  } : null);

                  const fileUrl = file?.url || '';
                  const fileName = file?.originalName || 'Attachment';
                  const isImage = file?.mimeType?.startsWith('image/') ||
                    (fileUrl && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(fileUrl)) ||
                    (fileName && /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName));

                  const isPdf = file?.mimeType?.includes('pdf') ||
                    (fileUrl && /\.pdf(\?.*)?$/i.test(fileUrl)) ||
                    (fileName && /\.pdf$/i.test(fileName));

                  return (
                    <div className={styles.contactModalWrap}>
                      {/* Customer Profile Card */}
                      <div className={styles.contactModalCard}>
                        <div className={styles.contactHeaderRow}>
                          <div className={styles.contactAvatar}>
                            <User size={22} />
                          </div>
                          <div className={styles.contactMetaCol}>
                            <div className={styles.contactCustomerName}>{fullName}</div>
                            <div className={styles.contactTimeRow}>
                              <span>{selectedContactModal.date || 'Today'} at {selectedContactModal.time || 'Recent'}</span>
                              <span className={styles.contactInquiryPill}>Support Inquiry</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.contactInfoGrid}>
                          <div className={styles.contactInfoField}>
                            <span className={styles.contactInfoLabel}>Email Address</span>
                            {email ? (
                              <a href={`mailto:${email}`} className={styles.contactEmailLink}>
                                <Mail size={13} /> {email}
                              </a>
                            ) : (
                              <span className={styles.contactOptionalMuted}>Not provided (Optional)</span>
                            )}
                          </div>

                          {phone ? (
                            <div className={styles.contactInfoField}>
                              <span className={styles.contactInfoLabel}>Phone Number</span>
                              <a href={`tel:${phone}`} className={styles.contactPhoneLink}>
                                <Phone size={13} /> {phone}
                              </a>
                            </div>
                          ) : null}
                        </div>

                        {/* Customer Message */}
                        <div className={styles.contactMessageBox}>
                          <div className={styles.contactMessageLabel}>Customer Message:</div>
                          <p className={styles.contactMessageText}>{message}</p>
                        </div>

                        {/* Attachment Box with Preview & Download */}
                        {fileUrl ? (
                          <div className={styles.contactAttachmentBox}>
                            <div className={styles.attachmentBoxHeader}>
                              <div className={styles.attachmentBoxTitle}>
                                <Paperclip size={15} />
                                <span>Attached File / Screenshot</span>
                              </div>
                              {file.size ? (
                                <span className={styles.attachmentSize}>
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                              ) : null}
                            </div>

                            {/* Preview Area */}
                            <div className={styles.attachmentPreviewContainer}>
                              {isImage ? (
                                <div className={styles.imagePreviewWrap}>
                                  <img
                                    src={fileUrl}
                                    alt={fileName}
                                    className={styles.inquiryPreviewImg}
                                    onClick={() => window.open(fileUrl, '_blank')}
                                    title="Click to view full image in new tab"
                                  />
                                </div>
                              ) : isPdf ? (
                                <div className={styles.docPreviewWrap}>
                                  <div className={styles.docIconBox}>
                                    <FileText size={34} style={{ color: '#ef4444' }} />
                                  </div>
                                  <div className={styles.docInfoCol}>
                                    <span className={styles.docFileName}>{fileName}</span>
                                    <span className={styles.docHint}>PDF Document Attachment</span>
                                  </div>
                                </div>
                              ) : (
                                <div className={styles.docPreviewWrap}>
                                  <div className={styles.docIconBox}>
                                    <FileText size={34} style={{ color: '#7025fb' }} />
                                  </div>
                                  <div className={styles.docInfoCol}>
                                    <span className={styles.docFileName}>{fileName}</span>
                                    <span className={styles.docHint}>Customer Document File</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Download & Preview Action Buttons */}
                            <div className={styles.attachmentActionRow}>
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.attachmentPreviewBtn}
                              >
                                <Eye size={15} />
                                <span>Preview in New Tab</span>
                              </a>

                              <a
                                href={fileUrl}
                                download={fileName}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.attachmentDownloadBtn}
                              >
                                <Download size={15} />
                                <span>Download File</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.noAttachmentNote}>
                            <span>No file attachment was included with this inquiry.</span>
                          </div>
                        )}
                      </div>

                      {/* Modal Footer Controls */}
                      <div className={styles.contactModalFooter}>
                        <button
                          type="button"
                          className={styles.modalSecondaryBtn}
                          onClick={() => {
                            setSelectedContactModal(null);
                            setContactFullData(null);
                          }}
                        >
                          Close
                        </button>

                        {email && (
                          <a
                            href={`mailto:${email}?subject=Regarding your Picky inquiry`}
                            className={styles.modalReplyBtn}
                          >
                            <Mail size={14} />
                            <span>Reply via Email</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })()}
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
