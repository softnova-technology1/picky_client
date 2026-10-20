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
  const validTabs = ['general', 'shipping', 'security'];
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
