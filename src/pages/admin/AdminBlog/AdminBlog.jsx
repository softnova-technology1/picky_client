import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ExternalLink,
  Save,
  RotateCcw,
  Video,
  ShieldCheck,
  ShoppingBag,
  Star,
  Plus,
  Trash2,
  SlidersHorizontal,
  Flame,
  Shirt,
  UtensilsCrossed,
  Gem,
  Smartphone,
  Coffee,
  Home,
  Smile,
  Dumbbell,
  LayoutGrid,
  Eye,
  Check,
  Upload,
  Loader2,
  Image as ImageIcon,
  Truck,
  CheckCircle,
  Heart,
  Award,
  Zap,
  Clock,
  Users,
  ThumbsUp,
  Gift,
  Shield,
  BadgePercent,
} from 'lucide-react';

const METRIC_ICON_OPTIONS = [
  { name: 'Video', label: 'Video Guide', icon: Video },
  { name: 'ShieldCheck', label: 'Verified Quality', icon: ShieldCheck },
  { name: 'ShoppingBag', label: 'Instant Bag', icon: ShoppingBag },
  { name: 'Star', label: 'Top Rating', icon: Star },
  { name: 'Sparkles', label: 'Premium Finds', icon: Sparkles },
  { name: 'Truck', label: 'Fast Delivery', icon: Truck },
  { name: 'CheckCircle', label: 'Guaranteed', icon: CheckCircle },
  { name: 'Heart', label: 'Customer Loved', icon: Heart },
  { name: 'Award', label: 'Award Winning', icon: Award },
  { name: 'Zap', label: 'Lightning Fast', icon: Zap },
  { name: 'Clock', label: 'Quick Response', icon: Clock },
  { name: 'Smile', label: 'Happy Shoppers', icon: Smile },
  { name: 'Users', label: 'Community', icon: Users },
  { name: 'ThumbsUp', label: 'Recommended', icon: ThumbsUp },
  { name: 'Gift', label: 'Special Perks', icon: Gift },
  { name: 'Shield', label: 'Buyer Protection', icon: Shield },
  { name: 'BadgePercent', label: 'Best Offers', icon: BadgePercent },
  { name: 'Gem', label: 'Luxury & Silk', icon: Gem },
];

const METRIC_ICONS_MAP = METRIC_ICON_OPTIONS.reduce((acc, curr) => {
  acc[curr.name] = curr.icon;
  return acc;
}, {});
import AdminLayout from '../../../components/layout/AdminLayout';
import { useBlogStore, INITIAL_BLOG_DATA } from '../../../store/blogStore';
import { useUiStore } from '../../../store/uiStore';
import { adminService } from '../../../services/admin.service';
import './AdminBlog.css';

const DEFAULT_HERO_S3_IMAGE = 'https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/blog/blog_hero_slash.jpg';

const TABS = [
  { id: 'hero', label: 'Hero Header' },
  { id: 'metrics', label: 'Trust Metrics' },
  { id: 'categories', label: 'Category Circles' },
  { id: 'shorts', label: 'Shoppable Shorts' },
  { id: 'masterclass', label: 'Video Masterclass' },
  { id: 'guides', label: 'Buying Guides' },
  { id: 'reviews', label: 'Customer Reviews' },
  { id: 'community', label: 'Community Banner' },
];

export default function AdminBlog() {
  const { blogData, setBlogData, resetToDefaults } = useBlogStore();
  const { showToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('hero');
  const [formData, _setFormData] = useState(() => JSON.parse(JSON.stringify(blogData)));
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDb, setIsSavingDb] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch live blog data from MongoDB on mount
  useEffect(() => {
    adminService
      .getBlogData()
      .then((res) => {
        if (res?.data?.data) {
          const apiData = res.data.data;
          _setFormData((prev) => ({
            ...prev,
            isBlogPageEnabled: apiData.isBlogPageEnabled !== undefined ? apiData.isBlogPageEnabled : prev.isBlogPageEnabled,
            hero: apiData.hero ? { ...prev.hero, ...apiData.hero } : prev.hero,
            metrics: apiData.metrics ? { ...prev.metrics, ...apiData.metrics } : prev.metrics,
          }));
          setBlogData((prev) => ({
            ...prev,
            isBlogPageEnabled: apiData.isBlogPageEnabled !== undefined ? apiData.isBlogPageEnabled : prev.isBlogPageEnabled,
            hero: apiData.hero ? { ...prev.hero, ...apiData.hero } : prev.hero,
            metrics: apiData.metrics ? { ...prev.metrics, ...apiData.metrics } : prev.metrics,
          }));
        }
      })
      .catch((err) => {
        console.warn('Could not load blog from MongoDB API:', err);
      });
  }, [setBlogData]);

  // Auto-sync local state with store on every mutation so storefront updates LIVE in 0ms!
  const setFormData = (updater) => {
    _setFormData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setBlogData(next); // INSTANT LIVE SYNC & BROADCAST TO ALL TABS / WINDOWS
      return next;
    });
  };

  const isPageLive = formData.isBlogPageEnabled !== false;

  const handleToggleBlogPage = async () => {
    const nextVal = formData.isBlogPageEnabled === false ? true : false;
    const updated = {
      ...formData,
      isBlogPageEnabled: nextVal,
    };
    setFormData(updated);
    showToast(`Blog Page ${nextVal ? 'Turned ON (Live)' : 'Turned OFF (Disabled)'}`, nextVal ? 'success' : 'info');

    // Sync toggle status to MongoDB
    try {
      await adminService.updateBlogData({ isBlogPageEnabled: nextVal });
    } catch (_) {}
  };

  const handleSaveAll = async () => {
    setIsSavingDb(true);
    setBlogData(formData);

    try {
      await adminService.updateBlogData(formData);
      showToast('Hero Header & Blog settings saved to MongoDB successfully!', 'success');
    } catch (err) {
      console.error('Save to MongoDB error:', err);
      showToast(err?.response?.data?.message || 'Saved locally, but MongoDB sync failed', 'warning');
    } finally {
      setIsSavingDb(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all Blog page content to original default presets?')) {
      resetToDefaults();
      _setFormData(JSON.parse(JSON.stringify(INITIAL_BLOG_DATA)));
      showToast('Blog content reset to defaults', 'info');
    }
  };

  // Upload image directly to AWS S3
  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file size exceeds 10MB! Please choose a smaller image.', 'error');
      return;
    }

    const data = new FormData();
    data.append('image', file);
    setIsUploading(true);
    setImagePreviewError(false);

    try {
      const res = await adminService.uploadBlogImage(data);
      const s3Url = res?.data?.data?.url || res?.data?.url;
      if (s3Url) {
        updateField('hero', 'imageUrl', s3Url);

        // Auto-save immediately to MongoDB Atlas so the S3 URL is permanently saved!
        try {
          await adminService.updateBlogData({
            ...formData,
            hero: {
              ...formData.hero,
              imageUrl: s3Url,
            },
          });
          showToast('Hero image uploaded to AWS S3 & saved to Database!', 'success');
        } catch (_) {
          showToast('Image uploaded to AWS S3! Click Save All Changes to persist.', 'success');
        }
      }
    } catch (err) {
      console.error('AWS S3 Upload error:', err);
      showToast(err?.response?.data?.message || 'Failed to upload image to AWS S3', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Immediate live update when typing or pasting any URL
  const handleHeroUrlChange = (newUrl) => {
    const cleanUrl = (newUrl || '').trim();
    setImagePreviewError(false);
    updateField('hero', 'imageUrl', cleanUrl);
  };

  // Generic Field Updater
  const updateField = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Toggle Section Enabled
  const toggleSectionState = (section) => {
    setFormData((prev) => {
      const nextEnabled = !prev[section]?.enabled;
      showToast(`${section.toUpperCase()} section ${nextEnabled ? 'enabled' : 'hidden'} live`, 'info');
      return {
        ...prev,
        [section]: {
          ...prev[section],
          enabled: nextEnabled,
        },
      };
    });
  };

  return (
    <AdminLayout title="Blog Page Management">
      <div className="admin-blog-container">
        {/* ── Page Header Row (Standard Admin Styling matching other pages) ── */}
        <div 
          className="admin-page-header-row admin-blog-header-row"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', textAlign: 'left', width: '100%', gap: '0.85rem' }}
        >
          <div 
            className="admin-blog-title-group"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignSelf: 'flex-start', textAlign: 'left', width: '100%' }}
          >
            <h1 className="admin-page-main-title" style={{ textAlign: 'left', alignSelf: 'flex-start', margin: '0 0 4px 0' }}>
              Blog & Stories Management
            </h1>
            <p className="admin-page-main-subtitle" style={{ textAlign: 'left', alignSelf: 'flex-start', margin: 0 }}>
              Manually customize and control every section of your public blog page in real-time
            </p>
          </div>

          <div 
            className="admin-blog-header-actions-row"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'flex-start' }}
          >
            {/* Master Site Page ON/OFF Switch */}
            <div className="admin-blog-master-switch-box">
              <span className="admin-blog-master-switch-title">Blog Page Status:</span>
              <button
                type="button"
                role="switch"
                aria-checked={isPageLive}
                onClick={handleToggleBlogPage}
                className={`admin-blog-master-switch-btn ${isPageLive ? 'active' : ''}`}
                title={isPageLive ? 'Click to Disable Site Blog Page' : 'Click to Enable Site Blog Page'}
              >
                <span className="admin-blog-master-switch-knob"></span>
              </button>
              <span className={`admin-blog-master-status-tag ${isPageLive ? 'live' : 'disabled'}`}>
                {isPageLive ? '● Live / Active' : '○ Disabled / Off'}
              </span>
            </div>
          </div>
        </div>

        {/* Warning Banner when Site Blog Page is Disabled */}
        {!isPageLive && (
          <div className="admin-blog-offline-alert">
            <span className="offline-alert-icon">⚠️</span>
            <div>
              <strong>Site Blog Page is Currently Turned OFF:</strong> Visitors opening <code>/blog</code> will see an offline/maintenance notice, and the "Blog" navigation link is hidden on the storefront header.
            </div>
          </div>
        )}

        {/* ── Section Tabs Navigation Bar ── */}
        <div className="admin-blog-tabs-nav">
          {TABS.map((tab) => {
            const isTabEnabled = tab.id === 'masterclass'
              ? formData.masterclass?.enabled !== false
              : tab.id === 'shorts'
              ? formData.shoppableShorts?.enabled !== false
              : tab.id === 'guides'
              ? formData.buyingGuides?.enabled !== false
              : tab.id === 'reviews'
              ? formData.customerReviews?.enabled !== false
              : tab.id === 'community'
              ? formData.communityBanner?.enabled !== false
              : formData[tab.id]?.enabled !== false;

            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-blog-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span
                  className={`tab-status-dot ${isTabEnabled ? 'active' : 'hidden'}`}
                  title={isTabEnabled ? 'Section Active' : 'Section Hidden'}
                />
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: HERO HEADER ─── */}
        {activeTab === 'hero' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>Hero Banner Section</h3>
                <p>Topmost attention-grabbing headline, subtext, CTA action buttons, and slash artwork.</p>
              </div>

              <div className="section-toggle-switch" onClick={() => toggleSectionState('hero')}>
                <span>{formData.hero.enabled ? 'Section Active' : 'Section Hidden'}</span>
                <div className={`switch-track ${formData.hero.enabled ? 'on' : ''}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Badge Text</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.hero.badgeText}
                  onChange={(e) => updateField('hero', 'badgeText', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Main Heading Title</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.hero.title}
                  onChange={(e) => updateField('hero', 'title', e.target.value)}
                />
              </div>

              <div className="admin-form-group span-2">
                <label className="admin-form-label">Subtitle Description</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.hero.subtitle}
                  onChange={(e) => updateField('hero', 'subtitle', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Primary Button Label</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.hero.primaryButtonText}
                  onChange={(e) => updateField('hero', 'primaryButtonText', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Secondary Button Label</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.hero.secondaryButtonText}
                  onChange={(e) => updateField('hero', 'secondaryButtonText', e.target.value)}
                />
              </div>

              <div className="admin-form-group span-2">
                <div className="hero-artwork-manager">
                  {/* Left Side: Live Image Preview Box */}
                  <div className="hero-artwork-preview-box">
                    {imagePreviewError || !formData.hero.imageUrl ? (
                      <div className="hero-artwork-preview-empty">
                        <ImageIcon size={28} />
                        <span>No Preview</span>
                      </div>
                    ) : (
                      <img
                        key={formData.hero.imageUrl}
                        src={formData.hero.imageUrl}
                        alt="Hero Artwork Preview"
                        onError={() => setImagePreviewError(true)}
                        onLoad={() => setImagePreviewError(false)}
                      />
                    )}
                  </div>

                  {/* Right Side: Controls, S3 Upload & Paste URL */}
                  <div className="hero-artwork-controls">
                    <div className="hero-artwork-controls-top">
                      <div className="hero-artwork-specs">
                        <strong>Hero Slash Artwork</strong> • Recommended: <strong>1200×1200px</strong> (1:1 Ratio) | Max: <strong>10MB</strong> (WebP, PNG, JPG)
                      </div>

                      {/* Hidden File Input + Dedicated S3 Upload Button */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        style={{ display: 'none' }}
                        disabled={isUploading}
                        onChange={handleHeroImageUpload}
                      />
                      <button
                        type="button"
                        className="btn-upload-s3"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                        <span>{isUploading ? 'Uploading to AWS S3...' : 'Upload New to AWS S3'}</span>
                      </button>
                    </div>

                    {/* URL Input & Quick Action Row */}
                    <div className="hero-artwork-input-group">
                      <input
                        type="text"
                        className="hero-artwork-url-input"
                        value={formData.hero.imageUrl || ''}
                        onChange={(e) => handleHeroUrlChange(e.target.value)}
                        placeholder="Paste image URL here or click Upload to AWS S3..."
                      />
                      <button
                        type="button"
                        className="btn-clear-url"
                        title="Revert to Default AWS S3 3D Slash Artwork"
                        onClick={() => handleHeroUrlChange(DEFAULT_HERO_S3_IMAGE)}
                      >
                        Default S3
                      </button>
                    </div>

                    {/* Status Badges & Test Link */}
                    <div className="hero-artwork-status-row">
                      {formData.hero.imageUrl?.includes('amazonaws.com') ? (
                        <span className="status-badge-s3">
                          <Check size={13} /> Active AWS S3 Cloud URL (Bucket: picky-e-com, ap-southeast-1)
                        </span>
                      ) : formData.hero.imageUrl?.startsWith('http') ? (
                        <span className="status-badge-external">
                          🔗 Live Web Image Link
                        </span>
                      ) : (
                        <span className="status-badge-external">
                          📁 Local Static File: {formData.hero.imageUrl}
                        </span>
                      )}

                      {formData.hero.imageUrl && (
                        <a
                          href={formData.hero.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hero-artwork-test-link"
                        >
                          <span>Open Full Image</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: TRUST METRICS ─── */}
        {activeTab === 'metrics' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>Trust & Credibility Metrics Bar</h3>
                <p>Curate credibility badges with custom icons, highlight values, and sub-labels displayed below the Hero banner.</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-add-item"
                  onClick={() => {
                    const newId = 'm-' + Date.now();
                    const newMetric = {
                      id: newId,
                      value: '100% Quality Guaranteed',
                      label: 'Verified Shopper Experience',
                      iconName: 'ShieldCheck',
                    };
                    setFormData((p) => ({
                      ...p,
                      metrics: {
                        ...p.metrics,
                        items: [...(p.metrics?.items || []), newMetric],
                      },
                    }));
                    showToast('New Trust Metric added! Click Save to persist to DB.', 'success');
                  }}
                >
                  <Plus size={14} /> Add New Metric
                </button>

                <div className="section-toggle-switch" onClick={() => toggleSectionState('metrics')}>
                  <span>{formData.metrics?.enabled ? 'Section Active' : 'Section Hidden'}</span>
                  <div className={`switch-track ${formData.metrics?.enabled ? 'on' : ''}`}>
                    <div className="switch-thumb"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sub-items-list">
              {(formData.metrics?.items || []).map((m, idx) => {
                const CurrentIconComp = METRIC_ICONS_MAP[m.iconName] || Sparkles;
                return (
                  <div key={m.id || idx} className="sub-item-card">
                    <div className="sub-item-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'rgba(124, 58, 237, 0.1)',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CurrentIconComp size={18} />
                        </div>
                        <span className="sub-item-title">
                          Metric #{idx + 1}: {m.value || 'Untitled Metric'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn-remove-item"
                        title="Delete this metric"
                        onClick={() => {
                          if ((formData.metrics?.items || []).length <= 1) {
                            showToast('You must keep at least 1 trust metric!', 'warning');
                            return;
                          }
                          const updated = (formData.metrics?.items || []).filter((_, i) => i !== idx);
                          setFormData((p) => ({
                            ...p,
                            metrics: { ...p.metrics, items: updated },
                          }));
                          showToast('Metric removed', 'info');
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="admin-form-grid">
                      <div className="admin-form-group">
                        <label className="admin-form-label">Highlight Value (e.g. 50+ Shoppable Guides)</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={m.value || ''}
                          placeholder="e.g. 50+ Shoppable Guides"
                          onChange={(e) => {
                            const updated = [...(formData.metrics?.items || [])];
                            updated[idx].value = e.target.value;
                            setFormData((p) => ({ ...p, metrics: { ...p.metrics, items: updated } }));
                          }}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label className="admin-form-label">Sub Label Description</label>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={m.label || ''}
                          placeholder="e.g. Tested & Curated by Editors"
                          onChange={(e) => {
                            const updated = [...(formData.metrics?.items || [])];
                            updated[idx].label = e.target.value;
                            setFormData((p) => ({ ...p, metrics: { ...p.metrics, items: updated } }));
                          }}
                        />
                      </div>

                      {/* Icon Selector / Picker */}
                      <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="admin-form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Select Icon for this Metric</span>
                          <span style={{ fontSize: '0.8rem', color: '#7c3aed', fontWeight: 700 }}>
                            Selected Icon: {m.iconName || 'Sparkles'}
                          </span>
                        </label>
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.45rem',
                            marginTop: '0.35rem',
                            background: '#f8fafc',
                            padding: '0.65rem',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {METRIC_ICON_OPTIONS.map((opt) => {
                            const IconComp = opt.icon;
                            const isSelected = (m.iconName || 'Sparkles') === opt.name;
                            return (
                              <button
                                key={opt.name}
                                type="button"
                                onClick={() => {
                                  const updated = [...(formData.metrics?.items || [])];
                                  updated[idx].iconName = opt.name;
                                  setFormData((p) => ({ ...p, metrics: { ...p.metrics, items: updated } }));
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  padding: '0.4rem 0.65rem',
                                  borderRadius: '8px',
                                  border: isSelected ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                                  background: isSelected ? 'rgba(124, 58, 237, 0.12)' : '#ffffff',
                                  color: isSelected ? '#7c3aed' : '#475569',
                                  fontSize: '0.82rem',
                                  fontWeight: isSelected ? 700 : 500,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                                title={opt.label}
                              >
                                <IconComp size={15} />
                                <span>{opt.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Add Metric Button */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #e2e8f0' }}>
              <button
                type="button"
                className="btn-add-item"
                style={{
                  background: '#f8fafc',
                  color: '#7c3aed',
                  border: '1.5px dashed #cbd5e1',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
                onClick={() => {
                  const newId = 'm-' + Date.now();
                  const newMetric = {
                    id: newId,
                    value: '100% Quality Guaranteed',
                    label: 'Verified Shopper Experience',
                    iconName: 'ShieldCheck',
                  };
                  setFormData((p) => ({
                    ...p,
                    metrics: {
                      ...p.metrics,
                      items: [...(p.metrics?.items || []), newMetric],
                    },
                  }));
                  showToast('New Trust Metric added! Click Save to persist to DB.', 'success');
                }}
              >
                <Plus size={15} /> Add Another Trust Metric
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 3: CATEGORY CIRCLES ─── */}
        {activeTab === 'categories' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>Category Filter Circles Bar</h3>
                <p>The horizontal circular story-style filter bar displaying all 10 Picky categories.</p>
              </div>

              <div className="section-toggle-switch" onClick={() => toggleSectionState('categories')}>
                <span>{formData.categories.enabled ? 'Section Active' : 'Section Hidden'}</span>
                <div className={`switch-track ${formData.categories.enabled ? 'on' : ''}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="sub-items-list">
              {formData.categories.items.map((cat, idx) => (
                <div key={cat.id} className="sub-item-card">
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Category Title Label</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={cat.label}
                        onChange={(e) => {
                          const updated = [...formData.categories.items];
                          updated[idx].label = e.target.value;
                          setFormData((p) => ({ ...p, categories: { ...p.categories, items: updated } }));
                        }}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Item Count Badge</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={cat.count}
                        onChange={(e) => {
                          const updated = [...formData.categories.items];
                          updated[idx].count = Number(e.target.value) || 0;
                          setFormData((p) => ({ ...p, categories: { ...p.categories, items: updated } }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: SHOPPABLE SHORTS ─── */}
        {activeTab === 'shorts' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>Trending Shoppable Shorts Carousel</h3>
                <p>Multi-product horizontal video reels with bottom docked Add to Bag action pills.</p>
              </div>

              <div className="section-toggle-switch" onClick={() => toggleSectionState('shoppableShorts')}>
                <span>{formData.shoppableShorts.enabled ? 'Section Active' : 'Section Hidden'}</span>
                <div className={`switch-track ${formData.shoppableShorts.enabled ? 'on' : ''}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="admin-form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Section Title</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.shoppableShorts.title}
                  onChange={(e) => updateField('shoppableShorts', 'title', e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Section Subtitle</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.shoppableShorts.subtitle}
                  onChange={(e) => updateField('shoppableShorts', 'subtitle', e.target.value)}
                />
              </div>
            </div>

            <div className="sub-items-header">
              <h4>Reels & Products List ({formData.shoppableShorts.items.length})</h4>
              <button
                type="button"
                className="btn-add-item"
                onClick={() => {
                  const newShort = {
                    id: `short-${Date.now()}`,
                    productId: `prod-${Date.now()}`,
                    title: 'New Trendy Product',
                    price: 999,
                    priceFormatted: '₹999',
                    category: 'Fashion',
                    image: '/images/blog/shorts/multi_3_kurti.jpg',
                  };
                  setFormData((p) => ({
                    ...p,
                    shoppableShorts: {
                      ...p.shoppableShorts,
                      items: [...p.shoppableShorts.items, newShort],
                    },
                  }));
                }}
              >
                <Plus size={14} /> Add New Short Reel
              </button>
            </div>

            <div className="sub-items-list">
              {formData.shoppableShorts.items.map((item, idx) => (
                <div key={item.id} className="sub-item-card">
                  <div className="sub-item-header">
                    <span className="sub-item-title">Reel #{idx + 1}: {item.title}</span>
                    <button
                      type="button"
                      className="btn-remove-item"
                      title="Delete this short"
                      onClick={() => {
                        const updated = formData.shoppableShorts.items.filter((_, i) => i !== idx);
                        setFormData((p) => ({ ...p, shoppableShorts: { ...p.shoppableShorts, items: updated } }));
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Product Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...formData.shoppableShorts.items];
                          updated[idx].title = e.target.value;
                          setFormData((p) => ({ ...p, shoppableShorts: { ...p.shoppableShorts, items: updated } }));
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Price (INR)</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={item.price}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = [...formData.shoppableShorts.items];
                          updated[idx].price = val;
                          updated[idx].priceFormatted = `₹${val.toLocaleString('en-IN')}`;
                          setFormData((p) => ({ ...p, shoppableShorts: { ...p.shoppableShorts, items: updated } }));
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Category</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={item.category}
                        onChange={(e) => {
                          const updated = [...formData.shoppableShorts.items];
                          updated[idx].category = e.target.value;
                          setFormData((p) => ({ ...p, shoppableShorts: { ...p.shoppableShorts, items: updated } }));
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Image URL / Path</label>
                      <div className="image-input-row">
                        <img src={item.image} alt={item.title} className="image-preview-thumb" onError={(e) => { e.target.src = '/images/blog/shorts/multi_1_earbuds.jpg'; }} />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={item.image}
                          onChange={(e) => {
                            const updated = [...formData.shoppableShorts.items];
                            updated[idx].image = e.target.value;
                            setFormData((p) => ({ ...p, shoppableShorts: { ...p.shoppableShorts, items: updated } }));
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 5: VIDEO MASTERCLASS & SHELVES ─── */}
        {activeTab === 'masterclass' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>16:9 Video Masterclass & Dual Shelves</h3>
                <p>The widescreen host video with timeline chapter scrubbers and Left/Right 3-card product shelves.</p>
              </div>

              <div className="section-toggle-switch" onClick={() => toggleSectionState('masterclass')}>
                <span>{formData.masterclass.enabled ? 'Section Active' : 'Section Hidden'}</span>
                <div className={`switch-track ${formData.masterclass.enabled ? 'on' : ''}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Section Badge</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.masterclass.badgeText}
                  onChange={(e) => updateField('masterclass', 'badgeText', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Video Title</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.masterclass.title}
                  onChange={(e) => updateField('masterclass', 'title', e.target.value)}
                />
              </div>

              <div className="admin-form-group span-2">
                <label className="admin-form-label">Subtitle Description</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.masterclass.subtitle}
                  onChange={(e) => updateField('masterclass', 'subtitle', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Host Video Image Path</label>
                <div className="image-input-row">
                  <img src={formData.masterclass.videoImage} alt="Host Preview" className="image-preview-thumb" onError={(e) => { e.target.src = '/images/blog/masterclass_host.jpg'; }} />
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.masterclass.videoImage}
                    onChange={(e) => updateField('masterclass', 'videoImage', e.target.value)}
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Time Display (e.g. 5:00 / 8:40)</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.masterclass.videoDuration}
                  onChange={(e) => updateField('masterclass', 'videoDuration', e.target.value)}
                />
              </div>
            </div>

            {/* Left Shelf Items */}
            <div className="sub-items-header" style={{ marginTop: '2rem' }}>
              <h4>Left Shelf Items (3 Products)</h4>
            </div>
            <div className="sub-items-list">
              {formData.masterclass.leftShelf.map((item, idx) => (
                <div key={item.id} className="sub-item-card">
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Product #{idx + 1} Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...formData.masterclass.leftShelf];
                          updated[idx].title = e.target.value;
                          setFormData((p) => ({ ...p, masterclass: { ...p.masterclass, leftShelf: updated } }));
                        }}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Price (INR)</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={item.price}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = [...formData.masterclass.leftShelf];
                          updated[idx].price = val;
                          updated[idx].priceFormatted = `₹${val.toLocaleString('en-IN')}`;
                          setFormData((p) => ({ ...p, masterclass: { ...p.masterclass, leftShelf: updated } }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Shelf Items */}
            <div className="sub-items-header" style={{ marginTop: '2rem' }}>
              <h4>Right Shelf Items (3 Products)</h4>
            </div>
            <div className="sub-items-list">
              {formData.masterclass.rightShelf.map((item, idx) => (
                <div key={item.id} className="sub-item-card">
                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Product #{idx + 1} Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...formData.masterclass.rightShelf];
                          updated[idx].title = e.target.value;
                          setFormData((p) => ({ ...p, masterclass: { ...p.masterclass, rightShelf: updated } }));
                        }}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Price (INR)</label>
                      <input
                        type="number"
                        className="admin-form-input"
                        value={item.price}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          const updated = [...formData.masterclass.rightShelf];
                          updated[idx].price = val;
                          updated[idx].priceFormatted = `₹${val.toLocaleString('en-IN')}`;
                          setFormData((p) => ({ ...p, masterclass: { ...p.masterclass, rightShelf: updated } }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 6: BUYING GUIDES (HOTSPOTS) ─── */}
        {activeTab === 'guides' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>Shoppable Buying Guides (Interactive Hotspots)</h3>
                <p>High-resolution room photographs featuring pulsating radar spots with popovers.</p>
              </div>

              <div className="section-toggle-switch" onClick={() => toggleSectionState('buyingGuides')}>
                <span>{formData.buyingGuides.enabled ? 'Section Active' : 'Section Hidden'}</span>
                <div className={`switch-track ${formData.buyingGuides.enabled ? 'on' : ''}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="admin-form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Section Heading</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.buyingGuides.title}
                  onChange={(e) => updateField('buyingGuides', 'title', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Section Subtitle</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.buyingGuides.subtitle}
                  onChange={(e) => updateField('buyingGuides', 'subtitle', e.target.value)}
                />
              </div>
            </div>

            <div className="sub-items-list">
              {formData.buyingGuides.items.map((guide, gIdx) => (
                <div key={guide.id} className="sub-item-card">
                  <div className="sub-item-header">
                    <span className="sub-item-title">Guide #{gIdx + 1}: {guide.title}</span>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Guide Title</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={guide.title}
                        onChange={(e) => {
                          const updated = [...formData.buyingGuides.items];
                          updated[gIdx].title = e.target.value;
                          setFormData((p) => ({ ...p, buyingGuides: { ...p.buyingGuides, items: updated } }));
                        }}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-form-label">Photo Path / URL</label>
                      <div className="image-input-row">
                        <img src={guide.image} alt={guide.title} className="image-preview-thumb" onError={(e) => { e.target.src = '/images/blog/desk_setup_hotspot.jpg'; }} />
                        <input
                          type="text"
                          className="admin-form-input"
                          value={guide.image}
                          onChange={(e) => {
                            const updated = [...formData.buyingGuides.items];
                            updated[gIdx].image = e.target.value;
                            setFormData((p) => ({ ...p, buyingGuides: { ...p.buyingGuides, items: updated } }));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem' }}>
                    <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#6d28d9', fontWeight: 800 }}>
                      Hotspots ({guide.hotspots.length})
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {guide.hotspots.map((hs, hsIdx) => (
                        <div key={hs.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Product Name</label>
                              <input
                                type="text"
                                className="admin-form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                value={hs.title}
                                onChange={(e) => {
                                  const updated = [...formData.buyingGuides.items];
                                  updated[gIdx].hotspots[hsIdx].title = e.target.value;
                                  setFormData((p) => ({ ...p, buyingGuides: { ...p.buyingGuides, items: updated } }));
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Price (INR)</label>
                              <input
                                type="number"
                                className="admin-form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                value={hs.price}
                                onChange={(e) => {
                                  const val = Number(e.target.value) || 0;
                                  const updated = [...formData.buyingGuides.items];
                                  updated[gIdx].hotspots[hsIdx].price = val;
                                  updated[gIdx].hotspots[hsIdx].priceFormatted = `₹${val.toLocaleString('en-IN')}`;
                                  setFormData((p) => ({ ...p, buyingGuides: { ...p.buyingGuides, items: updated } }));
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>X Position (%)</label>
                              <input
                                type="number"
                                className="admin-form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                value={hs.x}
                                onChange={(e) => {
                                  const updated = [...formData.buyingGuides.items];
                                  updated[gIdx].hotspots[hsIdx].x = Number(e.target.value) || 0;
                                  setFormData((p) => ({ ...p, buyingGuides: { ...p.buyingGuides, items: updated } }));
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Y Position (%)</label>
                              <input
                                type="number"
                                className="admin-form-input"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                                value={hs.y}
                                onChange={(e) => {
                                  const updated = [...formData.buyingGuides.items];
                                  updated[gIdx].hotspots[hsIdx].y = Number(e.target.value) || 0;
                                  setFormData((p) => ({ ...p, buyingGuides: { ...p.buyingGuides, items: updated } }));
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 7: CUSTOMER REVIEWS ─── */}
        {activeTab === 'reviews' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>Customer Video Reviews</h3>
                <p>User-generated video feedback cards from verified Picky shoppers.</p>
              </div>

              <div className="section-toggle-switch" onClick={() => toggleSectionState('customerReviews')}>
                <span>{formData.customerReviews.enabled ? 'Section Active' : 'Section Hidden'}</span>
                <div className={`switch-track ${formData.customerReviews.enabled ? 'on' : ''}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="admin-form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="admin-form-group">
                <label className="admin-form-label">Heading</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.customerReviews.title}
                  onChange={(e) => updateField('customerReviews', 'title', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Subtitle</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.customerReviews.subtitle}
                  onChange={(e) => updateField('customerReviews', 'subtitle', e.target.value)}
                />
              </div>
            </div>

            <div className="sub-items-list">
              {formData.customerReviews.items.map((rev, idx) => (
                <div key={rev.id} className="sub-item-card">
                  <div className="sub-item-header">
                    <span className="sub-item-title">Review #{idx + 1}: {rev.category}</span>
                  </div>

                  <div className="admin-form-grid">
                    <div className="admin-form-group">
                      <label className="admin-form-label">Category / User Tag</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={rev.category}
                        onChange={(e) => {
                          const updated = [...formData.customerReviews.items];
                          updated[idx].category = e.target.value;
                          setFormData((p) => ({ ...p, customerReviews: { ...p.customerReviews, items: updated } }));
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Duration (e.g. 13m)</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={rev.time}
                        onChange={(e) => {
                          const updated = [...formData.customerReviews.items];
                          updated[idx].time = e.target.value;
                          setFormData((p) => ({ ...p, customerReviews: { ...p.customerReviews, items: updated } }));
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Review Headline</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={rev.title}
                        onChange={(e) => {
                          const updated = [...formData.customerReviews.items];
                          updated[idx].title = e.target.value;
                          setFormData((p) => ({ ...p, customerReviews: { ...p.customerReviews, items: updated } }));
                        }}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-form-label">Author Name</label>
                      <input
                        type="text"
                        className="admin-form-input"
                        value={rev.author}
                        onChange={(e) => {
                          const updated = [...formData.customerReviews.items];
                          updated[idx].author = e.target.value;
                          setFormData((p) => ({ ...p, customerReviews: { ...p.customerReviews, items: updated } }));
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 8: COMMUNITY BANNER ─── */}
        {activeTab === 'community' && (
          <div className="admin-blog-card">
            <div className="admin-blog-card-header">
              <div className="admin-blog-card-title-group">
                <h3>Community CTA Banner</h3>
                <p>The Instagram and WhatsApp social engagement banner at the bottom of the page.</p>
              </div>

              <div className="section-toggle-switch" onClick={() => toggleSectionState('communityBanner')}>
                <span>{formData.communityBanner.enabled ? 'Section Active' : 'Section Hidden'}</span>
                <div className={`switch-track ${formData.communityBanner.enabled ? 'on' : ''}`}>
                  <div className="switch-thumb"></div>
                </div>
              </div>
            </div>

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label">Badge Text</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.communityBanner.badgeText}
                  onChange={(e) => updateField('communityBanner', 'badgeText', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Title</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.communityBanner.title}
                  onChange={(e) => updateField('communityBanner', 'title', e.target.value)}
                />
              </div>

              <div className="admin-form-group span-2">
                <label className="admin-form-label">Subtitle Description</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.communityBanner.subtitle}
                  onChange={(e) => updateField('communityBanner', 'subtitle', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Instagram Link URL</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.communityBanner.instagramLink}
                  onChange={(e) => updateField('communityBanner', 'instagramLink', e.target.value)}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">WhatsApp Number</label>
                <input
                  type="text"
                  className="admin-form-input"
                  value={formData.communityBanner.whatsappNumber}
                  onChange={(e) => updateField('communityBanner', 'whatsappNumber', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Bottom Quick Actions Footer Bar ─── */}
        <div className="admin-blog-bottom-bar">
          <div className="admin-blog-bottom-bar-left">
            <span className="admin-blog-status-indicator-dot"></span>
            <span className="admin-blog-bottom-bar-status-text">
              <strong>Live Auto-Sync:</strong> Changes saved here update your public blog page in real-time.
            </span>
          </div>

          <div className="admin-blog-bottom-bar-actions">
            <Link
              to="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-blog-action view-btn"
            >
              <ExternalLink size={15} />
              <span>View Live Blog</span>
            </Link>

            <button
              type="button"
              className="btn-blog-action reset-btn"
              onClick={handleReset}
            >
              <RotateCcw size={15} />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              className="btn-blog-action save-btn"
              onClick={handleSaveAll}
            >
              <Save size={16} />
              <span>Save All Changes</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
