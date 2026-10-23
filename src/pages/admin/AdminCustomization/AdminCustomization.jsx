import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Save,
  CheckCircle2,
  ExternalLink,
  GripVertical,
  UploadCloud,
  Trash2,
  AlertCircle,
  PanelTop,
  Home,
  ShoppingBag,
  Package,
  ShoppingCart,
  Footprints,
  FileText,
  Sparkles,
  Globe,
  Eye,
  SlidersHorizontal,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  HelpCircle,
  Compass,
  LayoutGrid,
  Info,
  PhoneCall,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Palette,
  Type,
  RotateCw,
  Tag,
  Gift,
  Percent,
  Megaphone,
  RotateCcw,
  Play,
  Pause,
  Heart,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useUiStore } from '../../../store/uiStore';
import { useCustomizationStore, broadcastLivePreview } from '../../../store/customizationStore';
import { adminService } from '../../../services/admin.service';
import {
  MOCK_CUSTOMIZATION_PAGES,
  MOCK_PAGE_SECTIONS,
} from '../../../data/customizationMockData';
import './AdminCustomization.css';

// ─── Icon Mapper for Pages ───────────────────────────────────────────────────
function getPageIcon(iconName, size = 18) {
  switch (iconName) {
    case 'PanelTop':
      return <PanelTop size={size} />;
    case 'Home':
      return <Home size={size} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} />;
    case 'LayoutGrid':
      return <LayoutGrid size={size} />;
    case 'Sparkles':
      return <Sparkles size={size} />;
    case 'Flame':
      return <Flame size={size} />;
    case 'Percent':
      return <Percent size={size} />;
    case 'Heart':
      return <Heart size={size} />;
    case 'Package':
      return <Package size={size} />;
    case 'ShoppingCart':
      return <ShoppingCart size={size} />;
    case 'Footprints':
      return <Footprints size={size} />;
    case 'Info':
      return <Info size={size} />;
    case 'PhoneCall':
      return <PhoneCall size={size} />;
    case 'BookOpen':
      return <BookOpen size={size} />;
    case 'FileText':
      return <FileText size={size} />;
    default:
      return <Globe size={size} />;
  }
}

// ─── Relative Time Helper ─────────────────────────────────────────────────────
function formatRelativeTime(timestamp, now = Date.now()) {
  if (!timestamp) return null;
  const diffSec = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (diffSec < 10) return 'Saved just now';
  if (diffSec < 60) return `Saved ${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return 'Saved 1 min ago';
  if (diffMin < 60) return `Saved ${diffMin} mins ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return 'Saved 1 hr ago';
  return `Saved ${diffHours} hrs ago`;
}

// ─── CTA Link Validator ───────────────────────────────────────────────────────
function validateCtaLink(val) {
  if (!val || !val.trim()) return '';
  const trimmed = val.trim();
  if (!trimmed.startsWith('/') && !trimmed.startsWith('https://')) {
    return "Link must start with '/' (internal route) or 'https://' (external link)";
  }
  return '';
}

// ─── Accessible Sliding Toggle Switch Component ───────────────────────────────
function AccessibleToggleSwitch({ enabled, onToggle, label, id }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
      <div
        id={id}
        role="switch"
        tabIndex={0}
        aria-checked={enabled}
        aria-label={label || 'Toggle switch'}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            onToggle(e);
          }
        }}
        style={{
          width: '38px',
          height: '22px',
          borderRadius: '9999px',
          background: enabled ? '#7c3aed' : '#cbd5e1',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background-color 0.22s ease, box-shadow 0.18s ease',
          display: 'inline-flex',
          alignItems: 'center',
          padding: '2px',
          outline: 'none',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = enabled
            ? '0 0 0 3px rgba(124, 58, 237, 0.22)'
            : '0 0 0 3px rgba(148, 163, 184, 0.22)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.4)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <span
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.22)',
            transform: enabled ? 'translateX(16px)' : 'translateX(0px)',
            transition: 'transform 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'block',
          }}
        />
      </div>
      <span
        style={{
          fontSize: '0.74rem',
          fontWeight: 800,
          color: enabled ? '#7c3aed' : '#94a3b8',
          letterSpacing: '0.02em',
          minWidth: '24px',
          userSelect: 'none',
        }}
      >
        {enabled ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

// ─── Character Counter Component ──────────────────────────────────────────────
function CharacterCount({ current = '', max = 80 }) {
  const length = current ? current.length : 0;
  const ratio = length / max;
  let color = '#64748b';

  if (length >= max) {
    color = '#dc2626';
  } else if (ratio > 0.9) {
    color = '#ea580c';
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '3px' }}>
      <span
        style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          color,
          transition: 'color 0.15s ease',
          userSelect: 'none',
        }}
      >
        {length}/{max}
      </span>
    </div>
  );
}

// ─── Image Upload Component ───────────────────────────────────────────────────
function ImageUploadControl({ label, value, onChange, onClear }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleClearImage = async () => {
    if (!value) {
      onChange('');
      setUrlError(null);
      return;
    }
    const previousUrl = value;
    setIsDeleting(true);
    try {
      if (onClear) {
        await onClear(previousUrl);
      } else {
        await adminService.deleteImage(previousUrl).catch(() => {});
      }
      onChange('');
      setUrlError(null);
    } catch (err) {
      console.warn('Clear image error:', err);
      onChange('');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileProcess = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUrlError('Please select a valid image file (JPG, PNG, WEBP, SVG)');
      return;
    }
    setUrlError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'customization');
      const res = await adminService.uploadImage(formData);
      const uploadedUrl = res?.data?.url || res?.data?.data?.url || res?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
      } else {
        setUrlError('Failed to retrieve image URL from server');
      }
    } catch (err) {
      setUrlError('Failed to upload image to server');
    }
  };

  const handleUrlBlur = (url) => {
    if (!url || !url.trim()) {
      setUrlError(null);
      return;
    }
    const trimmed = url.trim();
    const isPlausible =
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/') ||
      trimmed.startsWith('data:image/');

    if (!isPlausible) {
      setUrlError('Image failed to load. Check the URL.');
      return;
    }

    const testImg = new Image();
    testImg.onload = () => {
      setUrlError(null);
    };
    testImg.onerror = () => {
      setUrlError('Image failed to load. Check the URL.');
    };
    testImg.src = trimmed;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
          {label}
        </label>
        <div
          style={{
            display: 'inline-flex',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            type="button"
            onClick={() => setTab('upload')}
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: tab === 'upload' ? 700 : 500,
              background: tab === 'upload' ? '#ffffff' : 'transparent',
              color: tab === 'upload' ? '#7c3aed' : '#64748b',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: tab === 'upload' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            📁 File Upload
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            style={{
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontWeight: tab === 'url' ? 700 : 500,
              background: tab === 'url' ? '#ffffff' : 'transparent',
              color: tab === 'url' ? '#7c3aed' : '#64748b',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: tab === 'url' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🔗 Image URL
          </button>
        </div>
      </div>

      {tab === 'upload' ? (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFileProcess(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed',
              borderColor: isDragging ? '#7c3aed' : '#dfd5f5',
              background: isDragging ? '#f5f3ff' : '#faf8fe',
              borderRadius: '12px',
              padding: '1.25rem 1rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileProcess(file);
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#ede8f8',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UploadCloud size={20} />
              </div>
              <strong style={{ fontSize: '0.84rem', color: '#1e1b4b' }}>
                Drag & drop image, or <span style={{ color: '#7c3aed' }}>browse</span>
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Supports JPG, PNG, WEBP or SVG (instant preview)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value);
              setUrlError(null);
            }}
            onBlur={(e) => handleUrlBlur(e.target.value)}
            placeholder="https://images.unsplash.com/... or /images/banner.jpg"
            className="form-input"
            style={{
              width: '100%',
              borderColor: urlError ? '#dc2626' : undefined,
            }}
          />
        </div>
      )}

      {urlError && (
        <span
          style={{
            color: '#dc2626',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '2px',
          }}
        >
          <AlertCircle size={13} />
          {urlError}
        </span>
      )}

      {value && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              Image Preview
            </span>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleClearImage}
              title="Delete image from S3 bucket and database"
              style={{
                background: 'transparent',
                border: 'none',
                color: isDeleting ? '#94a3b8' : '#dc2626',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'all 0.15s ease',
              }}
            >
              {isDeleting ? (
                <>
                  <RotateCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Deleting from S3...
                </>
              ) : (
                <>
                  <Trash2 size={12} /> Clear (S3 & DB)
                </>
              )}
            </button>
          </div>
          <div
            style={{
              width: '100%',
              height: '180px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1.5px solid #ede8f8',
              background: '#f8fafc',
              position: 'relative',
            }}
          >
            <img
              src={value}
              alt="Preview"
              onError={() => setUrlError('Image failed to load. Check the URL.')}
              onLoad={() => setUrlError(null)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Live Visual Section Preview Component (Shopify Style) ───────────────────
function LiveSectionPreview({
  section,
  activeLineIdx,
  onSelectLine,
  activeHeroSlideIdx,
  onSelectHeroSlide,
}) {
  if (!section || !section.id) return null;
  const s = section.settings || {};
  const [internalLineIdx, setInternalLineIdx] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Helper for real vector icons inside preview (supports 'none' to hide icon)
  const renderPreviewRealIcon = (iconName) => {
    if (!iconName || iconName === 'none' || iconName === 'None') return null;
    const iconMap = {
      Tag: <Tag size={13} />,
      Truck: <Truck size={13} />,
      Sparkles: <Sparkles size={13} />,
      ShieldCheck: <ShieldCheck size={13} />,
      Gift: <Gift size={13} />,
      Flame: <Flame size={13} />,
      Percent: <Percent size={13} />,
      Megaphone: <Megaphone size={13} />,
      RotateCcw: <RotateCcw size={13} />,
      ShoppingBag: <ShoppingBag size={13} />,
    };
    return iconMap[iconName] || null;
  };

  // Derive announcement lines (strictly filters enabled lines)
  const announcementLines = useMemo(() => {
    if (section.id !== 'announcement_bar') return [];
    if (Array.isArray(s.lines) && s.lines.length > 0) {
      const active = s.lines.filter((l) => l && l.enabled !== false);
      if (active.length > 0) return active;
      return s.lines;
    }
    return [
      {
        id: 1,
        enabled: true,
        icon: 'Tag',
        text: s.text || 'Flat 15% OFF on orders above ₹1,499 | Use Code: PICKY15',
        linkText: s.linkText || 'Shop Sale',
        linkUrl: s.linkUrl || '/shop',
        badge: s.badge || 'FESTIVE OFFER',
      },
    ];
  }, [section.id, s.lines, s.text, s.linkText, s.linkUrl, s.badge]);

  // Autoplay preview rotation timer: automatically advances line every speed interval
  useEffect(() => {
    if (section.id !== 'announcement_bar' || announcementLines.length <= 1 || !isAutoPlaying) return;
    const speed = Math.max(2500, s.autoplaySpeed || 4000);
    const timer = setInterval(() => {
      setInternalLineIdx((prev) => (prev + 1) % announcementLines.length);
    }, speed);
    return () => clearInterval(timer);
  }, [section.id, announcementLines.length, s.autoplaySpeed, isAutoPlaying]);

  // When a specific tab index is selected and autoplay is paused, pin to that line.
  // Otherwise, follow the auto-advancing line index.
  const isLinePinned = typeof activeLineIdx === 'number' && !isAutoPlaying;
  const safeLineCount = announcementLines.length || 1;
  const previewLineIdx = isLinePinned
    ? activeLineIdx % safeLineCount
    : internalLineIdx % safeLineCount;

  const currentPreviewLine =
    announcementLines[previewLineIdx] || announcementLines[0] || {};

  const previewIconElement = renderPreviewRealIcon(currentPreviewLine.icon);

  const handleManualLineSelect = (target) => {
    setIsAutoPlaying(false);
    if (typeof target === 'function') {
      setInternalLineIdx((prev) => {
        const nextVal = target(prev);
        if (onSelectLine) onSelectLine(nextVal);
        return nextVal;
      });
    } else {
      setInternalLineIdx(target);
      if (onSelectLine) onSelectLine(target);
    }
  };

  // ─── Hero Banner: 3 Slides & 6 Images Preview Logic ─────────────────────────
  const heroDefaultSlides = useMemo(
    () => [
      {
        id: 'slide_1',
        enabled: true,
        eyebrow: 'NEW ARRIVALS',
        title: 'LUXE',
        subtitle: 'NEW DROP',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
        leftImage: '/images/slide_1_left.jpg',
        rightImage: '/images/slide_1_right.jpg',
      },
      {
        id: 'slide_2',
        enabled: true,
        eyebrow: 'EXCLUSIVELY OUR',
        title: 'BRAND',
        subtitle: '50% OFF',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
        leftImage: '/images/slide_2_left.jpg',
        rightImage: '/images/slide_2_right.jpg',
      },
      {
        id: 'slide_3',
        enabled: true,
        eyebrow: 'PREMIUM SELECTION',
        title: 'URBAN',
        subtitle: '30% OFF',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
        leftImage: '/images/slide_3_left.jpg',
        rightImage: '/images/slide_3_right.jpg',
      },
    ],
    []
  );

  const heroSlidesList = useMemo(() => {
    if (section.id !== 'hero_banner') return [];
    if (Array.isArray(s.slides) && s.slides.length > 0) {
      return [0, 1, 2].map((i) => ({
        ...heroDefaultSlides[i],
        ...(s.slides[i] || {}),
      }));
    }
    const copy = [...heroDefaultSlides];
    if (s.headline || s.imageUrl || s.badge || s.ctaText) {
      copy[0] = {
        ...copy[0],
        eyebrow: s.badge || copy[0].eyebrow,
        title: s.headline || copy[0].title,
        subtitle: s.subheadline || copy[0].subtitle,
        ctaText: s.ctaText || copy[0].ctaText,
        leftImage: s.imageUrl || copy[0].leftImage,
        rightImage: s.imageUrl || copy[0].rightImage,
      };
    }
    return copy;
  }, [section.id, s.slides, s.headline, s.subheadline, s.badge, s.ctaText, s.imageUrl, heroDefaultSlides]);

  const [internalHeroSlideIdx, setInternalHeroSlideIdx] = useState(0);
  const [isHeroAutoPlaying, setIsHeroAutoPlaying] = useState(true);

  useEffect(() => {
    if (section.id !== 'hero_banner' || heroSlidesList.length <= 1 || !isHeroAutoPlaying) return;
    const speed = Math.max(2000, Number(s.autoplaySpeed) || 3200);
    const timer = setInterval(() => {
      setInternalHeroSlideIdx((prev) => (prev + 1) % heroSlidesList.length);
    }, speed);
    return () => clearInterval(timer);
  }, [section.id, heroSlidesList.length, s.autoplaySpeed, isHeroAutoPlaying]);

  const isHeroSlidePinned = typeof activeHeroSlideIdx === 'number' && !isHeroAutoPlaying;
  const currentHeroIdx = isHeroSlidePinned
    ? (activeHeroSlideIdx % (heroSlidesList.length || 1))
    : (internalHeroSlideIdx % (heroSlidesList.length || 1));

  const curHeroSlide = heroSlidesList[currentHeroIdx] || heroSlidesList[0] || {};

  const handleManualHeroSelect = (target) => {
    setIsHeroAutoPlaying(false);
    if (typeof target === 'function') {
      setInternalHeroSlideIdx((prev) => {
        const nextVal = target(prev);
        if (onSelectHeroSlide) onSelectHeroSlide(nextVal);
        return nextVal;
      });
    } else {
      setInternalHeroSlideIdx(target);
      if (onSelectHeroSlide) onSelectHeroSlide(target);
    }
  };

  return (
    <div className="adm-cust-preview-box">
      <div className="adm-cust-preview-header">
        <span className="adm-cust-preview-badge">
          <Eye size={13} /> Live Storefront Visual Preview
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {section.id === 'announcement_bar' && announcementLines.length > 1 && (
            <button
              type="button"
              className={`adm-cust-preview-auto-btn no-hover-fx ${isAutoPlaying ? 'active' : ''}`}
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              title={isAutoPlaying ? 'Pause automatic preview' : 'Resume automatic preview'}
            >
              {isAutoPlaying ? <Pause size={10} /> : <Play size={10} />}
              <span>{isAutoPlaying ? 'Auto Rotating' : 'Rotate Paused'}</span>
            </button>
          )}

          {section.id === 'hero_banner' && (
            <button
              type="button"
              className={`adm-cust-preview-auto-btn no-hover-fx ${isHeroAutoPlaying ? 'active' : ''}`}
              onClick={() => setIsHeroAutoPlaying(!isHeroAutoPlaying)}
              title={isHeroAutoPlaying ? 'Pause automatic slide rotation' : 'Resume automatic slide rotation'}
            >
              {isHeroAutoPlaying ? <Pause size={10} /> : <Play size={10} />}
              <span>{isHeroAutoPlaying ? 'Auto Rotating' : 'Rotate Paused'}</span>
            </button>
          )}

          <span className="adm-cust-preview-subtitle">
            Real-time customer view simulation
          </span>
        </div>
      </div>

      {/* 1. Announcement Bar Preview */}
      {section.id === 'announcement_bar' && (
        <div className="adm-cust-announcement-preview-wrap">
          <div
            className="adm-cust-announcement-preview-bar"
            style={{
              background: s.bgColor || '#7c3aed',
              color: s.textColor || '#ffffff',
              fontSize: s.fontSize || '13px',
            }}
          >
            {announcementLines.length > 1 && (
              <button
                type="button"
                className="adm-cust-preview-nav-btn prev no-hover-fx"
                onClick={() =>
                  handleManualLineSelect(
                    (prev) => (prev - 1 + announcementLines.length) % announcementLines.length
                  )
                }
                title="Preview previous line"
                style={{ color: s.textColor || '#ffffff' }}
              >
                <ChevronLeft size={13} />
              </button>
            )}

            {/* Real Lucide Icon (hidden if none) */}
            {previewIconElement && (
              <span style={{ display: 'inline-flex', alignItems: 'center', opacity: 0.95 }} aria-hidden="true">
                {previewIconElement}
              </span>
            )}

            {currentPreviewLine.badge && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.22)',
                  border: '1px solid rgba(255,255,255,0.35)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {currentPreviewLine.badge}
              </span>
            )}

            <span>
              {currentPreviewLine.text ||
                `Line ${(previewLineIdx % announcementLines.length) + 1} message empty`}
            </span>

            {currentPreviewLine.linkText && (
              <span style={{ textDecoration: 'underline', fontWeight: 800 }}>
                {currentPreviewLine.linkText} →
              </span>
            )}

            {announcementLines.length > 1 && (
              <button
                type="button"
                className="adm-cust-preview-nav-btn next no-hover-fx"
                onClick={() =>
                  handleManualLineSelect(
                    (prev) => (prev + 1) % announcementLines.length
                  )
                }
                title="Preview next line"
                style={{ color: s.textColor || '#ffffff' }}
              >
                <ChevronRight size={13} />
              </button>
            )}
          </div>

          {/* Sleek Line Indicator Dots */}
          {announcementLines.length > 1 && (
            <div className="adm-cust-preview-dots-row">
              <span className="adm-cust-preview-dots-label">
                Previewing <strong>Line {(previewLineIdx % announcementLines.length) + 1}</strong> of{' '}
                <strong>{announcementLines.length}</strong> {isAutoPlaying ? `(Auto: ${Math.round((s.autoplaySpeed || 4000) / 1000)}s)` : '(Paused)'}
              </span>
              <div className="adm-cust-preview-dots-container">
                {announcementLines.map((_, idx) => {
                  const isActive = (previewLineIdx % announcementLines.length) === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`adm-cust-preview-dot-btn no-hover-fx ${isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleManualLineSelect(idx)}
                      title={`Jump to Line ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Hero Banner Preview (True Storefront Diagonal Split Collage with 3 Slides & 6 Images) */}
      {section.id === 'hero_banner' && (
        <div className="adm-cust-announcement-preview-wrap">
          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              height: '240px',
              backgroundColor: '#0f1117',
              border: '1.5px solid #1e293b',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
              userSelect: 'none',
            }}
          >
            {/* Left Diagonal Image (58% width with polygon clip-path) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '58%',
                height: '100%',
                clipPath: 'polygon(0 0, 100% 0, 72% 100%, 0 100%)',
                WebkitClipPath: 'polygon(0 0, 100% 0, 72% 100%, 0 100%)',
                overflow: 'hidden',
                backgroundColor: '#1e1b4b',
              }}
            >
              <img
                src={curHeroSlide.leftImage || '/images/slide_1_left.jpg'}
                alt={`${curHeroSlide.title || 'Hero'} Left Diagonal`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '8px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                  backdropFilter: 'blur(4px)',
                }}
              >
                LEFT IMAGE
              </div>
            </div>

            {/* Right Diagonal Image (58% width with polygon clip-path) */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '42%',
                width: '58%',
                height: '100%',
                clipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)',
                WebkitClipPath: 'polygon(28% 0, 100% 0, 100% 100%, 0 100%)',
                overflow: 'hidden',
                backgroundColor: '#312e81',
              }}
            >
              <img
                src={curHeroSlide.rightImage || '/images/slide_1_right.jpg'}
                alt={`${curHeroSlide.title || 'Hero'} Right Diagonal`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '8px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                  backdropFilter: 'blur(4px)',
                }}
              >
                RIGHT IMAGE
              </div>
            </div>

            {/* Subtle Overlay Shadow */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Center Frosted Glass Callout Card */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 4,
                width: 'min(240px, 60%)',
                padding: '1rem 1.1rem',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.22)',
                textAlign: 'center',
              }}
            >
              {curHeroSlide.eyebrow && (
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    marginBottom: '0.2rem',
                  }}
                >
                  {curHeroSlide.eyebrow}
                </span>
              )}
              <h3
                style={{
                  margin: '0 0 0.15rem 0',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {curHeroSlide.title || 'LUXE'}
              </h3>
              {curHeroSlide.subtitle && (
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#dc2626',
                    letterSpacing: '0.06em',
                    marginBottom: '0.45rem',
                  }}
                >
                  {curHeroSlide.subtitle}
                </div>
              )}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  borderBottom: '1.5px solid #0f172a',
                  paddingBottom: '2px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  color: '#0f172a',
                  textTransform: 'uppercase',
                }}
              >
                <span>{curHeroSlide.ctaText || 'SHOP NOW'}</span>
                <ArrowRight size={10} strokeWidth={2.5} />
              </div>
            </div>

            {/* Left Nav Arrow */}
            <button
              type="button"
              onClick={() => handleManualHeroSelect((prev) => (prev - 1 + 3) % 3)}
              title="Preview previous slide"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 6,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.4} />
            </button>

            {/* Right Nav Arrow */}
            <button
              type="button"
              onClick={() => handleManualHeroSelect((prev) => (prev + 1) % 3)}
              title="Preview next slide"
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 6,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                color: '#111111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
              }}
            >
              <ChevronRight size={16} strokeWidth={2.4} />
            </button>
          </div>

          {/* Slide Indicator Bar & Jump Dots */}
          <div className="adm-cust-preview-dots-row" style={{ marginTop: '0.65rem' }}>
            <span className="adm-cust-preview-dots-label">
              Previewing <strong>Slide {currentHeroIdx + 1} of 3 ({curHeroSlide.title || 'Untitled'})</strong> • 2 Images Shown
              {isHeroAutoPlaying ? ` (Auto: ${((Number(s.autoplaySpeed) || 3200) / 1000).toFixed(1)}s)` : ' (Paused)'}
            </span>
            <div className="adm-cust-preview-dots-container">
              {[0, 1, 2].map((idx) => {
                const isActive = currentHeroIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`adm-cust-preview-dot-btn no-hover-fx ${isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleManualHeroSelect(idx)}
                    title={`Jump to Slide ${idx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Shop by Category Preview */}
      {section.id === 'shop_by_category' && (() => {
        const rawTitle = s.title || 'Shop by Category';
        let prefix = s.titlePrefix;
        let highlight = s.titleHighlight;
        if (!prefix && !highlight) {
          const words = rawTitle.trim().split(/\s+/);
          if (words.length > 1) {
            highlight = words.pop();
            prefix = words.join(' ');
          } else {
            prefix = rawTitle;
            highlight = '';
          }
        }
        const titleFontSize = s.titleFontSize || 28;
        const titleColor = s.titleColor || '#1e1b4b';
        const titleHighlightColor = s.titleHighlightColor || '#7c3aed';
        const subtitle = s.subtitle || 'Explore authentic handpicked items tailored for your home and lifestyle';
        const subtitleColor = s.subtitleColor || '#64748b';
        const subtitleFontSize = s.subtitleFontSize || 13;
        const viewAllText = s.viewAllText || 'View All';
        const viewAllUrl = s.viewAllUrl || '/categories';

        const mockAvatars = [
          { name: 'Kanjivaram Silk', color: '#fce7f3' },
          { name: 'Madurai Sungudi', color: '#f3e8ff' },
          { name: 'Handloom Cotton', color: '#ecfdf5' },
          { name: 'Festive Lehengas', color: '#fef3c7' },
          { name: 'Temple Jewelry', color: '#e0f2fe' },
        ];

        return (
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #ede8f8',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            }}
          >
            {/* Header row with Title & View All */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#7c3aed',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  <span style={{ width: '12px', height: '1.5px', background: '#7c3aed' }} />
                  SHOP BY
                  <span style={{ width: '12px', height: '1.5px', background: '#7c3aed' }} />
                </div>
                <h3
                  style={{
                    margin: '0 0 0.25rem 0',
                    fontSize: `${Math.min(titleFontSize, 32)}px`,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                  }}
                >
                  <span style={{ color: titleColor }}>{prefix}</span>
                  {highlight ? (
                    <>
                      {' '}
                      <span style={{ color: titleHighlightColor }}>{highlight}</span>
                    </>
                  ) : null}
                </h3>
                {subtitle && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: `${subtitleFontSize}px`,
                      color: subtitleColor,
                      lineHeight: 1.4,
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)',
                  }}
                >
                  <span>{viewAllText}</span>
                  <ArrowRight size={12} strokeWidth={2.5} />
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    color: '#64748b',
                    background: '#f8fafc',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontFamily: 'monospace',
                  }}
                >
                  Links to: {viewAllUrl}
                </span>
              </div>
            </div>

            {/* Dome/Arch category preview chips */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem' }}>
              {mockAvatars.map((cat, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '60px',
                      borderRadius: '30px 30px 10px 10px',
                      background: cat.color,
                      border: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    ✦
                  </div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#1e293b' }}>
                    {cat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 3. Flash Deals Preview */}
      {section.id === 'flash_deals' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            border: '1.5px solid #fed7aa',
            borderRadius: '10px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#ea580c',
                background: '#ffedd5',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {s.spotlightTag || 'DEAL OF THE DAY'}
            </span>
            <h4 style={{ margin: '0.25rem 0', fontSize: '1rem', fontWeight: 800, color: '#9a3412' }}>
              {s.spotlightTitle || 'Spotlight Product Deal'}
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#c2410c', fontWeight: 600 }}>
              {s.savingsText || 'Flat discount applied'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9a3412' }}>ENDS IN:</span>
            <div
              style={{
                background: '#ea580c',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.78rem',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              08h : 42m : 15s
            </div>
          </div>
        </div>
      )}

      {/* 4. Why Picky Preview */}
      {section.id === 'why_picky' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
          {(s.features || []).map((feat, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #ede8f8',
                borderRadius: '8px',
                padding: '0.65rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#ede8f8',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.35rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                ✓
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#1e1b4b', display: 'block' }}>
                {feat.title}
              </strong>
              <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '2px', lineHeight: 1.2 }}>
                {feat.desc}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 5. Free Shipping Goal Bar Preview */}
      {section.id === 'free_shipping_goal_bar' && (
        <div style={{ background: '#ffffff', border: '1px solid #ede8f8', borderRadius: '8px', padding: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <span style={{ color: '#7c3aed' }}>
              Add ₹249 more to unlock FREE Shipping! 🚚
            </span>
            <span style={{ color: '#64748b' }}>₹750 / ₹{s.thresholdAmount || 999}</span>
          </div>
          <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', background: '#7c3aed', borderRadius: '9999px' }} />
          </div>
        </div>
      )}

      {/* 6. Categories Hero Showcase Preview */}
      {section.id === 'categories_hero' && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fdfbf7 0%, #f6f0ff 100%)',
            border: '1.5px solid #ede8f8',
            borderRadius: '16px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, zIndex: 2 }}>
            <h4
              style={{
                fontFamily: 'serif',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#1e1b4b',
                lineHeight: 1.15,
                margin: '0 0 0.45rem',
                whiteSpace: 'pre-line',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {s.headline || 'YOUR EVERYTHING STORE'}
            </h4>
            <p
              style={{
                fontSize: '0.78rem',
                color: '#475569',
                margin: '0 0 0.75rem',
                lineHeight: 1.35,
                whiteSpace: 'pre-line',
              }}
            >
              {s.subheadline || 'Shop Your Daily Essentials & More'}
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '3px 8px',
                borderRadius: '9999px',
                marginBottom: '0.85rem',
              }}
            >
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {s.startingPriceLabel || 'Starting From'}
              </span>
              <strong style={{ fontSize: '0.75rem', color: '#7c3aed' }}>
                {s.startingPrice || '₹129'}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                <span>{s.buttonText || 'SHOP NOW'}</span>
                <span style={{ fontSize: '11px' }}>↗</span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#7c3aed',
                  background: '#f5f3ff',
                  border: '1px solid #ddd6fe',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}
              >
                Goes to: {s.buttonLink || '/products'}
              </span>
            </div>
          </div>
          <div style={{ width: '130px', flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <img
              src={s.heroImage || '/images/categories_hero_3d.png'}
              alt="Preview"
              style={{ width: '100%', maxHeight: '115px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = '/images/categories_hero_3d.png';
              }}
            />
          </div>
        </div>
      )}

      {/* 7. New Arrivals Hero Showcase Live Preview */}
      {section.id === 'new_arrivals_hero' && (() => {
        const rawHeadline = s.headline || 'NEW ARRIVALS';
        let prefix = s.titlePrefix;
        let highlight = s.titleHighlight;
        if (prefix === undefined && highlight === undefined) {
          const words = rawHeadline.trim().split(/\s+/);
          if (words.length > 1) {
            highlight = words.pop();
            prefix = words.join(' ');
          } else {
            prefix = rawHeadline;
            highlight = '';
          }
        } else {
          prefix = prefix ?? 'NEW';
          highlight = highlight ?? 'ARRIVALS';
        }

        const titleColor = s.titleColor || '#1e1b4b';
        const titleHighlightColor = s.titleHighlightColor || '#7c3aed';
        const subtitle = s.subheadline ?? s.subtitle ?? 'Trendy styles, everyday comfort made for your season.';
        const subtitleColor = s.subtitleColor || '#4b5563';
        const badgeText = s.badgeText ?? s.badge ?? 'WINTER COLLECTION 2026';
        const badgeTextColor = s.badgeTextColor || '#6d28d9';
        const badgeBgColor = s.badgeBgColor || '#ffffff';
        const buttonText = s.buttonText || s.ctaText || 'Discover More';
        const buttonLink = s.buttonLink || s.ctaLink || '#catalog';
        const buttonBgColor = s.buttonBgColor || '#250e4a';
        const buttonTextColor = s.buttonTextColor || '#ffffff';
        const bannerBgImage = s.bannerBgImage || s.bannerBg || s.heroImage || s.imageUrl || '/images/new-arrivals-hero/new_arrivals_hero_bg_4k.jpg';
        const bannerBgColor = s.bannerBgColor || '#ede7f6';

        return (
          <div
            style={{
              backgroundColor: bannerBgColor,
              borderRadius: '16px',
              padding: '1.5rem',
              position: 'relative',
              overflow: 'hidden',
              border: '1.5px solid #ede8f8',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.06)',
            }}
          >
            {/* Background preview image if available */}
            {bannerBgImage && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.35,
                  backgroundImage: `url(${bannerBgImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'right center',
                  pointerEvents: 'none',
                }}
              />
            )}

            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
              {/* Capsule Badge Preview */}
              {badgeText && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    backgroundColor: badgeBgColor,
                    border: `1.5px solid ${badgeTextColor}33`,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    marginBottom: '0.65rem',
                  }}
                >
                  <span style={{ color: badgeTextColor, fontSize: '0.75rem' }}>✦</span>
                  <span
                    style={{
                      color: badgeTextColor,
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {badgeText}
                  </span>
                </div>
              )}

              {/* Headline Preview */}
              <h3
                style={{
                  margin: '0 0 0.5rem',
                  fontFamily: 'serif',
                  fontSize: '1.65rem',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ color: titleColor }}>{prefix}</span>
                {highlight && (
                  <span style={{ color: titleHighlightColor }}>
                    {highlight}
                  </span>
                )}
              </h3>

              {/* Subheadline Preview */}
              {subtitle && (
                <p
                  style={{
                    margin: '0 0 0.95rem',
                    fontSize: '0.8rem',
                    color: subtitleColor,
                    lineHeight: 1.45,
                    maxWidth: '460px',
                    marginInline: 'auto',
                  }}
                >
                  {subtitle}
                </p>
              )}

              {/* Button Preview & Route Pill */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
                    padding: '7px 18px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    boxShadow: `0 4px 12px ${buttonBgColor}40`,
                  }}
                >
                  <span>{buttonText}</span>
                  <span style={{ fontSize: '11px' }}>→</span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: '#6d28d9',
                    backgroundColor: '#ffffff',
                    border: '1px solid #ddd6fe',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  Destination: {buttonLink}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 8. New Arrivals: Best Sellers Live Marquee Preview ── */}
      {section.id === 'new_arrivals_marquee' && (() => {
        const badgeText = s.badgeText || 'Best Sellers • Top Customer Picks';
        const title = s.title || 'All Best Sellers Running Live';
        const subtitle = s.subtitle || 'Continuous live stream of our top-rated, best-selling favorites. Hover over any card to pause and explore.';

        return (
          <div
            style={{
              background: 'linear-gradient(180deg, #fbfaff 0%, #f5f3ff 100%)',
              border: '1.5px solid #ede9fe',
              borderRadius: '16px',
              padding: '1.75rem 1.25rem',
              textAlign: 'center',
              boxShadow: '0 4px 18px rgba(124, 58, 237, 0.06)',
            }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f5f3ff',
                border: '1px solid #ddd6fe',
                padding: '4px 14px',
                borderRadius: '9999px',
                marginBottom: '0.85rem',
              }}
            >
              <Flame size={14} color="#f97316" />
              <span
                style={{
                  color: '#7c3aed',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {badgeText}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                fontFamily: 'serif',
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#1e1b4b',
                margin: '0 0 0.5rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {title}
            </h3>

            {/* Subtitle */}
            <p
              style={{
                color: '#64748b',
                fontSize: '0.85rem',
                maxWidth: '520px',
                margin: '0 auto 1.25rem',
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </p>

            {/* Simulated Live Stream Ribbon */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflow: 'hidden',
                justifyContent: 'center',
                padding: '4px 0',
              }}
            >
              {[
                { tag: '⭐ 4.9', name: 'Madurai Sungudi Saree', price: '₹1,850' },
                { tag: '🔥 BESTSELLER', name: 'Handcrafted Brass Vilakku', price: '₹2,490' },
                { tag: '⭐ 4.8', name: 'Kanchipuram Silk Stole', price: '₹1,299' },
              ].map((prod, i) => (
                <div
                  key={i}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #ede9fe',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    fontSize: '0.75rem',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#f97316' }}>{prod.tag}</span>
                  <strong style={{ color: '#1e1b4b' }}>{prod.name}</strong>
                  <span style={{ color: '#7c3aed', fontWeight: 700 }}>{prod.price}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 9. Generic Preview for Other Pages */}
      {section.id !== 'announcement_bar' &&
        section.id !== 'hero_banner' &&
        section.id !== 'shop_by_category' &&
        section.id !== 'flash_deals' &&
        section.id !== 'why_picky' &&
        section.id !== 'free_shipping_goal_bar' &&
        section.id !== 'categories_hero' &&
        section.id !== 'new_arrivals_hero' &&
        section.id !== 'new_arrivals_marquee' && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #ede8f8',
              borderRadius: '8px',
              padding: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.86rem', color: s.titleColor || s.textColor || '#1e1b4b' }}>
                {s.title || s.headline || s.storyTitle || section.name}
              </strong>
              <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: s.subtitleColor || '#64748b' }}>
                {s.subtitle || s.subheadline || s.storyBody || s.bannerText || section.description}
              </p>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#7c3aed',
                background: '#ede8f8',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              Active Component
            </span>
          </div>
        )}
    </div>
  );
}

// ─── Main Admin Customization Component ───────────────────────────────────────
export default function AdminCustomization() {
  const { showToast } = useUiStore();
  const {
    pageSections: storePageSections,
    setPageSections: storeSavePageSections,
  } = useCustomizationStore();

  const [searchParams, setSearchParams] = useSearchParams();

  // Valid page IDs from configuration
  const validPageIds = useMemo(() => MOCK_CUSTOMIZATION_PAGES.map((p) => p.id), []);
  const firstPageId = MOCK_CUSTOMIZATION_PAGES[0]?.id || 'global_header';

  // Helper to ensure all sections from MOCK_PAGE_SECTIONS are included even if DB has older schema
  const mergeWithDefaults = (source) => {
    const merged = { ...(source || {}) };
    Object.keys(MOCK_PAGE_SECTIONS).forEach((pId) => {
      const defaults = MOCK_PAGE_SECTIONS[pId] || [];
      const current = Array.isArray(merged[pId]) ? merged[pId] : [];
      const missing = defaults.filter((d) => !current.some((c) => c.id === d.id || c.key === d.key));
      if (missing.length > 0) {
        merged[pId] = [...current, ...missing];
      }
    });
    return merged;
  };

  // Baseline and Working copies of all page sections
  const [allPageSections, setAllPageSections] = useState(() => {
    return mergeWithDefaults(storePageSections || MOCK_PAGE_SECTIONS);
  });
  const [savedPageSections, setSavedPageSections] = useState(() => {
    return mergeWithDefaults(storePageSections || MOCK_PAGE_SECTIONS);
  });

  // Active Selected Page (Header, Home, Shop, PDP, Cart, Footer, Content)
  // Initializes to the page from URL query string if present, otherwise defaults to the first page (global_header)
  const [activePageId, setActivePageId] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramPage = urlParams.get('page');
      if (paramPage && MOCK_CUSTOMIZATION_PAGES.some((p) => p.id === paramPage)) {
        return paramPage;
      }
    } catch (e) {}
    return firstPageId;
  });

  // Current active page's section list
  const currentSections = useMemo(() => {
    return allPageSections[activePageId] || [];
  }, [allPageSections, activePageId]);

  const savedCurrentSections = useMemo(() => {
    return savedPageSections[activePageId] || [];
  }, [savedPageSections, activePageId]);

  // Active Section Selection within the active page
  // Initializes to the section from URL query string if present and valid, otherwise defaults to the first section of activePageId
  const [activeSectionId, setActiveSectionId] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramPage = urlParams.get('page');
      const initialPage = (paramPage && MOCK_CUSTOMIZATION_PAGES.some((p) => p.id === paramPage))
        ? paramPage
        : firstPageId;
      const list = (storePageSections || MOCK_PAGE_SECTIONS)[initialPage] || [];
      const paramSec = urlParams.get('section');
      if (paramSec && list.some((s) => s.id === paramSec)) {
        return paramSec;
      }
      return list[0]?.id || 'announcement_bar';
    } catch (e) {}
    const initialList = (storePageSections || MOCK_PAGE_SECTIONS)[firstPageId] || [];
    return initialList[0]?.id || 'announcement_bar';
  });

  // Keep URL search parameters synchronized with active page and section
  useEffect(() => {
    const urlPage = searchParams.get('page');
    const urlSec = searchParams.get('section');
    if (urlPage !== activePageId || urlSec !== activeSectionId) {
      setSearchParams({ page: activePageId, section: activeSectionId }, { replace: true });
    }
  }, [activePageId, activeSectionId, searchParams, setSearchParams]);

  // Handle direct sidebar clicks or browser back/forward navigation
  useEffect(() => {
    const urlPage = searchParams.get('page');
    const urlSec = searchParams.get('section');

    if (!urlPage) {
      // Sidebar clicked / navigated to /admin/customization without query params
      const firstSec = (allPageSections[firstPageId] || [])[0]?.id || 'announcement_bar';
      if (activePageId !== firstPageId) {
        setActivePageId(firstPageId);
      }
      if (activeSectionId !== firstSec) {
        setActiveSectionId(firstSec);
      }
      setSearchParams({ page: firstPageId, section: firstSec }, { replace: true });
    } else if (urlPage !== activePageId && validPageIds.includes(urlPage)) {
      setActivePageId(urlPage);
      const pageSecs = allPageSections[urlPage] || [];
      const targetSec = (urlSec && pageSecs.some((s) => s.id === urlSec)) ? urlSec : (pageSecs[0]?.id || '');
      if (targetSec && targetSec !== activeSectionId) {
        setActiveSectionId(targetSec);
      }
    } else if (urlSec && urlSec !== activeSectionId) {
      const pageSecs = allPageSections[activePageId] || [];
      if (pageSecs.some((s) => s.id === urlSec)) {
        setActiveSectionId(urlSec);
      }
    }
  }, [searchParams, activePageId, activeSectionId, allPageSections, firstPageId, validPageIds, setSearchParams]);

  // Fetch customizations from server if available on mount
  useEffect(() => {
    let mounted = true;
    adminService
      .getCustomizations()
      .then((res) => {
        if (!mounted) return;
        const data = res?.data || res;
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          const mergedData = mergeWithDefaults(data);
          setAllPageSections((prev) => ({ ...prev, ...mergedData }));
          setSavedPageSections((prev) => ({ ...prev, ...mergedData }));
          Object.entries(mergedData).forEach(([pId, secs]) => {
            if (Array.isArray(secs) && secs.length > 0) {
              storeSavePageSections(pId, secs);
            }
          });
        }
      })
      .catch((err) => {
        console.warn('Backend customizations fetch note (using local cache):', err?.message || err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Saving states
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Last Saved Timestamps
  const [lastSavedOrderTimeMap, setLastSavedOrderTimeMap] = useState({});
  const [lastSavedSectionTimeMap, setLastSavedSectionTimeMap] = useState({});
  const [clockTick, setClockTick] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Unsaved changes modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: 'page' | 'section', targetId: string }

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Active Announcement Bar line tab (0, 1, 2, or 3)
  const [activeAnnouncementLineIdx, setActiveAnnouncementLineIdx] = useState(0);

  // Active Hero Banner slide tab (0, 1, 2, or 'all')
  const [activeHeroSlideIdx, setActiveHeroSlideIdx] = useState(0);

  // Active section objects
  const currentSection = currentSections.find((s) => s.id === activeSectionId) || currentSections[0] || {};
  const savedCurrentSection = savedCurrentSections.find((s) => s.id === activeSectionId) || savedCurrentSections[0] || {};

  // Check if the current section has unsaved edits
  const hasCurrentSectionEdits = useMemo(() => {
    if (!currentSection.settings || !savedCurrentSection.settings) return false;
    return JSON.stringify(currentSection.settings) !== JSON.stringify(savedCurrentSection.settings);
  }, [currentSection, savedCurrentSection]);

  // Handle Drag & Drop within active page
  const handleDrop = (fromIndex, toIndex) => {
    if (fromIndex === null || fromIndex === undefined || fromIndex === toIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const updated = [...currentSections];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));
    storeSavePageSections(activePageId, updated);
    broadcastLivePreview(activePageId, updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
    showToast(`Reordered "${movedItem.name}"`, 'info');
  };

  // Keyboard Reordering (Alt+ArrowUp / Alt+ArrowDown)
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const updated = [...currentSections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));
    storeSavePageSections(activePageId, updated);
    broadcastLivePreview(activePageId, updated);
    showToast(`Moved "${updated[index - 1].name}" up`, 'info');
  };

  const handleMoveDown = (index) => {
    if (index >= currentSections.length - 1) return;
    const updated = [...currentSections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));
    storeSavePageSections(activePageId, updated);
    broadcastLivePreview(activePageId, updated);
    showToast(`Moved "${updated[index + 1].name}" down`, 'info');
  };

  // Toggle Section Visibility
  const handleToggleEnable = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    let toggledName = '';
    let nextState = false;
    const updated = currentSections.map((s) => {
      if (s.id === id) {
        toggledName = s.name;
        nextState = !s.enabled;
        return { ...s, enabled: nextState };
      }
      return s;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));

    // Immediately propagate to persistent store so client storefront toggles in real-time
    storeSavePageSections(activePageId, updated);

    // Sync to backend DB in background
    adminService.updateCustomization(activePageId, updated).catch((err) => {
      console.warn('Background toggle sync note:', err?.message || err);
    });

    if (toggledName) {
      showToast(`${toggledName} is now ${nextState ? 'Enabled' : 'Hidden'}`, 'info');
    }
  };

  // Section Field Update Handler
  const handleUpdateSetting = (field, value) => {
    setLastSavedSectionTimeMap((prev) => {
      if (!prev[activeSectionId]) return prev;
      const copy = { ...prev };
      delete copy[activeSectionId];
      return copy;
    });

    const updated = currentSections.map((s) => {
      if (s.id === activeSectionId) {
        return {
          ...s,
          settings: {
            ...s.settings,
            [field]: value,
          },
        };
      }
      return s;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));
    // Instant live preview broadcast and store sync to all open storefront tabs
    storeSavePageSections(activePageId, updated);
    broadcastLivePreview(activePageId, updated);
  };


  // Route URL format validator
  const validateRouteUrl = (url) => {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('#')) {
      return null;
    }
    return 'URL should begin with "/" (e.g. /shop) or "https://" for external link';
  };

  // Helper for updating 4 individual lines of the Announcement Bar
  const handleUpdateAnnouncementLine = (lineIdx, field, val) => {
    setLastSavedSectionTimeMap((prev) => {
      if (!prev[activeSectionId]) return prev;
      const copy = { ...prev };
      delete copy[activeSectionId];
      return copy;
    });

    const defaultLines = [
      {
        id: 1,
        enabled: true,
        icon: 'Tag',
        text: 'Flat 15% OFF on orders above ₹1,499 | Use Code: PICKY15',
        linkText: 'Shop Sale',
        linkUrl: '/shop',
        badge: 'FESTIVE OFFER',
      },
      {
        id: 2,
        enabled: true,
        icon: 'Truck',
        text: 'Free Express Shipping across Tamil Nadu on orders above ₹999',
        linkText: 'Shipping Info',
        linkUrl: '/shipping-policy',
        badge: 'FREE DELIVERY',
      },
      {
        id: 3,
        enabled: true,
        icon: 'Sparkles',
        text: 'Swamimalai Pure Brass Vilakku & Handloom Madurai Sungudi Drops',
        linkText: 'Explore New',
        linkUrl: '/new-arrivals',
        badge: 'NEW ARRIVALS',
      },
      {
        id: 4,
        enabled: true,
        icon: 'ShieldCheck',
        text: '7-Day Easy Doorstep Replacement Guarantee on all handlooms',
        linkText: 'Know More',
        linkUrl: '/returns',
        badge: 'EASY RETURNS',
      },
    ];

    const currentLines =
      Array.isArray(currentSection.settings?.lines) && currentSection.settings.lines.length > 0
        ? currentSection.settings.lines
        : defaultLines;

    const updatedLines = [0, 1, 2, 3].map((idx) => {
      const existing = currentLines[idx] || defaultLines[idx] || { id: idx + 1, enabled: true, text: '', linkText: '', linkUrl: '', badge: '' };
      if (idx === lineIdx) {
        return { ...existing, [field]: val };
      }
      return existing;
    });

    const updated = currentSections.map((s) => {
      if (s.id === activeSectionId) {
        return {
          ...s,
          settings: {
            ...s.settings,
            lines: updatedLines,
            // Keep backwards-compatibility fields synchronized with Line 1
            ...(lineIdx === 0 ? { [field]: val } : {}),
          },
        };
      }
      return s;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));
    // Instant live preview broadcast and store sync
    storeSavePageSections(activePageId, updated);
    broadcastLivePreview(activePageId, updated);
  };

  // Helper for quick-setting 1, 2, 3, or 4 active announcement lines on storefront
  const handleQuickSetLineCount = (targetCount) => {
    setLastSavedSectionTimeMap((prev) => {
      if (!prev[activeSectionId]) return prev;
      const copy = { ...prev };
      delete copy[activeSectionId];
      return copy;
    });

    const defaultLines = [
      {
        id: 1,
        enabled: true,
        icon: 'Tag',
        text: 'Flat 15% OFF on orders above ₹1,499 | Use Code: PICKY15',
        linkText: 'Shop Sale',
        linkUrl: '/shop',
        badge: 'FESTIVE OFFER',
      },
      {
        id: 2,
        enabled: true,
        icon: 'Truck',
        text: 'Free Express Shipping across Tamil Nadu on orders above ₹999',
        linkText: 'Shipping Info',
        linkUrl: '/shipping-policy',
        badge: 'FREE DELIVERY',
      },
      {
        id: 3,
        enabled: true,
        icon: 'Sparkles',
        text: 'Swamimalai Pure Brass Vilakku & Handloom Madurai Sungudi Drops',
        linkText: 'Explore New',
        linkUrl: '/new-arrivals',
        badge: 'NEW ARRIVALS',
      },
      {
        id: 4,
        enabled: true,
        icon: 'ShieldCheck',
        text: '7-Day Easy Doorstep Replacement Guarantee on all handlooms',
        linkText: 'Know More',
        linkUrl: '/returns',
        badge: 'EASY RETURNS',
      },
    ];

    const currentLines =
      Array.isArray(currentSection.settings?.lines) && currentSection.settings.lines.length > 0
        ? currentSection.settings.lines
        : defaultLines;

    const updatedLines = [0, 1, 2, 3].map((idx) => {
      const existing = currentLines[idx] || defaultLines[idx] || { id: idx + 1, enabled: true, text: '', linkText: '', linkUrl: '', badge: '' };
      return {
        ...existing,
        enabled: idx < targetCount,
      };
    });

    const updated = currentSections.map((s) => {
      if (s.id === activeSectionId) {
        return {
          ...s,
          settings: {
            ...s.settings,
            lines: updatedLines,
          },
        };
      }
      return s;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));
    storeSavePageSections(activePageId, updated);
    broadcastLivePreview(activePageId, updated);
    showToast(`Showing ${targetCount} active line${targetCount > 1 ? 's' : ''} on storefront`, 'info');
  };

  // Helper for updating individual slides (and 6 images) of the Hero Banner
  const handleUpdateHeroSlide = (slideIdx, field, val) => {
    setLastSavedSectionTimeMap((prev) => {
      if (!prev[activeSectionId]) return prev;
      const copy = { ...prev };
      delete copy[activeSectionId];
      return copy;
    });

    const defaultHeroSlides = [
      {
        id: 'slide_1',
        enabled: true,
        eyebrow: 'NEW ARRIVALS',
        title: 'LUXE',
        subtitle: 'NEW DROP',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
        leftImage: '/images/slide_1_left.jpg',
        rightImage: '/images/slide_1_right.jpg',
      },
      {
        id: 'slide_2',
        enabled: true,
        eyebrow: 'EXCLUSIVELY OUR',
        title: 'BRAND',
        subtitle: '50% OFF',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
        leftImage: '/images/slide_2_left.jpg',
        rightImage: '/images/slide_2_right.jpg',
      },
      {
        id: 'slide_3',
        enabled: true,
        eyebrow: 'PREMIUM SELECTION',
        title: 'URBAN',
        subtitle: '30% OFF',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
        leftImage: '/images/slide_3_left.jpg',
        rightImage: '/images/slide_3_right.jpg',
      },
    ];

    const currentHeroSlides =
      Array.isArray(currentSection.settings?.slides) && currentSection.settings.slides.length > 0
        ? currentSection.settings.slides
        : defaultHeroSlides;

    const updatedSlides = [0, 1, 2].map((idx) => {
      const existing = currentHeroSlides[idx] || defaultHeroSlides[idx] || {
        id: `slide_${idx + 1}`,
        enabled: true,
        eyebrow: '',
        title: '',
        subtitle: '',
        ctaText: 'SHOP NOW',
        ctaLink: '/products',
        leftImage: '/images/slide_1_left.jpg',
        rightImage: '/images/slide_1_right.jpg',
      };
      if (idx === slideIdx) {
        return { ...existing, [field]: val };
      }
      return existing;
    });

    const updated = currentSections.map((s) => {
      if (s.id === 'hero_banner') {
        return {
          ...s,
          settings: {
            ...s.settings,
            slides: updatedSlides,
            // Keep backwards-compatibility flat fields synchronized with Slide 1
            ...(slideIdx === 0
              ? {
                  ...(field === 'title' ? { headline: val } : {}),
                  ...(field === 'subtitle' ? { subheadline: val } : {}),
                  ...(field === 'eyebrow' ? { badge: val } : {}),
                  ...(field === 'ctaText' ? { ctaText: val } : {}),
                  ...(field === 'ctaLink' ? { ctaLink: val } : {}),
                  ...(field === 'leftImage' ? { imageUrl: val } : {}),
                }
              : {}),
          },
        };
      }
      return s;
    });

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: updated,
    }));
    storeSavePageSections(activePageId, updated);
    broadcastLivePreview(activePageId, updated);
  };

  // Clear a slide image: deletes from AWS S3 storage AND updates MongoDB database
  const handleClearHeroSlideImage = async (slideIdx, field, currentUrl) => {
    try {
      // 1. Call backend API to delete from S3 bucket and MongoDB
      await adminService.clearCustomizationImage({
        pageId: activePageId,
        sectionId: 'hero_banner',
        slideIndex: slideIdx,
        slideId: `slide_${slideIdx + 1}`,
        imageField: field,
        imageUrl: currentUrl,
      });

      // 2. Clear in local state and live preview
      handleUpdateHeroSlide(slideIdx, field, '');

      // 3. Mark in savedPageSections so unsaved badge doesn't linger for DB-persisted clear
      setSavedPageSections((prev) => {
        const copy = { ...prev };
        if (copy[activePageId]) {
          copy[activePageId] = copy[activePageId].map((s) => {
            if (s.id === 'hero_banner') {
              const currentHeroSlides = Array.isArray(s.settings?.slides) ? [...s.settings.slides] : [];
              if (currentHeroSlides[slideIdx]) {
                currentHeroSlides[slideIdx] = { ...currentHeroSlides[slideIdx], [field]: '' };
              }
              return {
                ...s,
                settings: {
                  ...s.settings,
                  slides: currentHeroSlides,
                  ...(slideIdx === 0 && field === 'leftImage' ? { imageUrl: '' } : {}),
                },
              };
            }
            return s;
          });
        }
        return copy;
      });

      showToast(`🗑️ Slide ${slideIdx + 1} ${field === 'leftImage' ? 'Left' : 'Right'} image deleted from S3 & DB!`, 'success');
    } catch (err) {
      console.error('Failed to clear hero image from S3/DB:', err);
      handleUpdateHeroSlide(slideIdx, field, '');
      showToast('Image cleared locally', 'info');
    }
  };

  // Clear generic section image: deletes from AWS S3 storage AND clears in DB
  const handleClearSectionImage = async (settingKey, currentUrl) => {
    try {
      await adminService.clearCustomizationImage({
        pageId: activePageId,
        sectionId: currentSection?.id,
        imageField: settingKey,
        imageUrl: currentUrl,
      });

      handleUpdateSetting(settingKey, '');
      showToast('🗑️ Image deleted from S3 bucket and cleared in DB!', 'success');
    } catch (err) {
      console.error('Failed to clear section image from S3/DB:', err);
      handleUpdateSetting(settingKey, '');
      showToast('Image cleared locally', 'info');
    }
  };


  // Switch Page Guard
  const handleSelectPage = (pageId) => {
    if (pageId === activePageId) return;

    if (hasCurrentSectionEdits) {
      setPendingAction({ type: 'page', targetId: pageId });
      setIsConfirmModalOpen(true);
    } else {
      setActivePageId(pageId);
      const pageSectionsList = allPageSections[pageId] || [];
      const nextSec = pageSectionsList.length > 0 ? pageSectionsList[0].id : '';
      if (nextSec) {
        setActiveSectionId(nextSec);
        setSearchParams({ page: pageId, section: nextSec }, { replace: true });
      } else {
        setSearchParams({ page: pageId }, { replace: true });
      }
    }
  };

  // Switch Section Guard
  const handleSelectSection = (sectionId) => {
    if (sectionId === activeSectionId) return;

    if (hasCurrentSectionEdits) {
      setPendingAction({ type: 'section', targetId: sectionId });
      setIsConfirmModalOpen(true);
    } else {
      setActiveSectionId(sectionId);
      setSearchParams({ page: activePageId, section: sectionId }, { replace: true });
    }
  };

  // Discard Unsaved Changes
  const handleConfirmDiscard = () => {
    const reverted = currentSections.map((s) =>
      s.id === activeSectionId ? { ...s, settings: { ...savedCurrentSection.settings } } : s
    );

    setAllPageSections((prev) => ({
      ...prev,
      [activePageId]: reverted,
    }));
    storeSavePageSections(activePageId, reverted);
    broadcastLivePreview(activePageId, reverted);


    if (pendingAction) {
      if (pendingAction.type === 'page') {
        const targetPage = pendingAction.targetId;
        setActivePageId(targetPage);
        const nextList = allPageSections[targetPage] || [];
        const nextSec = nextList.length > 0 ? nextList[0].id : '';
        if (nextSec) {
          setActiveSectionId(nextSec);
          setSearchParams({ page: targetPage, section: nextSec }, { replace: true });
        } else {
          setSearchParams({ page: targetPage }, { replace: true });
        }
      } else if (pendingAction.type === 'section') {
        const targetSec = pendingAction.targetId;
        setActiveSectionId(targetSec);
        setSearchParams({ page: activePageId, section: targetSec }, { replace: true });
      }
    }

    setPendingAction(null);
    setIsConfirmModalOpen(false);
    showToast('Unsaved edits discarded', 'info');
  };

  // Save Live Configuration (Section Order, Visibility & Settings)
  const handleSaveLiveConfiguration = async () => {
    setIsSavingOrder(true);
    try {
      try {
        await adminService.updateCustomization(activePageId, currentSections);
      } catch (apiErr) {
        console.warn('Backend customization sync warning (saved locally to store):', apiErr);
      }

      setSavedPageSections((prev) => ({
        ...prev,
        [activePageId]: [...currentSections],
      }));
      storeSavePageSections(activePageId, currentSections);
      broadcastLivePreview(activePageId, currentSections);

      const now = Date.now();
      setLastSavedOrderTimeMap((prev) => ({
        ...prev,
        [activePageId]: now,
      }));
      setLastSavedSectionTimeMap((prev) => ({
        ...prev,
        [activeSectionId]: now,
      }));
      showToast('🎉 Live configuration saved and published!', 'success');
    } catch (err) {
      console.error('Save configuration error:', err);
      showToast('Failed to save customization', 'error');
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Save Current Active Section
  const handleSaveCurrentSection = async () => {
    if (!hasCurrentSectionEdits) return;

    setIsSavingSection(true);
    try {
      const updatedSaved = currentSections.map((s) =>
        s.id === activeSectionId ? { ...s, settings: { ...currentSection.settings } } : s
      );

      try {
        await adminService.updateCustomization(activePageId, updatedSaved);
      } catch (apiErr) {
        console.warn('Backend customization sync warning (saved locally to store):', apiErr);
      }

      setSavedPageSections((prev) => ({
        ...prev,
        [activePageId]: updatedSaved,
      }));
      storeSavePageSections(activePageId, updatedSaved);

      setLastSavedSectionTimeMap((prev) => ({
        ...prev,
        [activeSectionId]: Date.now(),
      }));
      showToast(`🎉 Changes to ${currentSection.name} saved!`, 'success');
    } catch (err) {
      console.error('Save section error:', err);
      showToast('Failed to save section changes', 'error');
    } finally {
      setIsSavingSection(false);
    }
  };

  // CTA link validation helpers
  const heroPrimaryLinkError = useMemo(() => {
    if (currentSection.id !== 'hero_banner') return '';
    return validateCtaLink(currentSection.settings?.ctaLink);
  }, [currentSection]);

  const heroSecondaryLinkError = useMemo(() => {
    if (currentSection.id !== 'hero_banner') return '';
    return validateCtaLink(currentSection.settings?.secondaryCtaLink);
  }, [currentSection]);

  const announcementLinkError = useMemo(() => {
    if (currentSection.id !== 'announcement_bar') return '';
    return validateCtaLink(currentSection.settings?.linkUrl);
  }, [currentSection]);

  const activePageMeta = MOCK_CUSTOMIZATION_PAGES.find((p) => p.id === activePageId) || MOCK_CUSTOMIZATION_PAGES[0];

  const globalPages = MOCK_CUSTOMIZATION_PAGES.filter((p) => p.group === 'GLOBAL');
  const storefrontPages = MOCK_CUSTOMIZATION_PAGES.filter((p) => p.group === 'STOREFRONT');
  const otherPages = MOCK_CUSTOMIZATION_PAGES.filter((p) => p.group === 'PAGES');

  return (
    <AdminLayout title="Store Customization">
      <div className="admin-customization-container">
        {/* ─── Top Control Header ───────────────────────────────────────────── */}
        <div className="adm-cust-header">
        <div className="adm-cust-header-text">
          <div className="adm-cust-header-title-row">
            <h2 className="adm-cust-header-title">
              Storefront Customization & Visual Editor
            </h2>
            <span className="adm-cust-header-badge">
              <Sparkles size={12} /> PICKY THEME ENGINE
            </span>
          </div>
          <span className="adm-cust-header-subtitle">
            Customize global store branding, homepage sections, catalog layout, product details, and store policies
          </span>
        </div>

        <div className="adm-cust-header-actions">
          {lastSavedOrderTimeMap[activePageId] && (
            <span className="adm-cust-saved-indicator">
              <CheckCircle2 size={14} color="#16a34a" />
              <span>{formatRelativeTime(lastSavedOrderTimeMap[activePageId], clockTick)}</span>
            </span>
          )}

          <Link
            to="/"
            target="_blank"
            className="adm-cust-btn-preview no-hover-fx"
            title="Open customer storefront in a new tab"
          >
            <ExternalLink size={14} />
            <span>Preview Store</span>
          </Link>

          <button
            type="button"
            className="adm-cust-btn-save-order no-hover-fx"
            onClick={handleSaveLiveConfiguration}
            disabled={isSavingOrder}
            title="Save Live Configuration for this page"
          >
            <Save size={15} />
            <span>{isSavingOrder ? 'Saving...' : 'Save Live Configuration'}</span>
          </button>
        </div>
      </div>

      {/* ─── 3-Panel Unified Grid Layout ────────────────────────────────────── */}
      <div className="adm-cust-3panel-grid">
        {/* ── PANEL 1: Store Area Selector (Left Nav) ── */}
        <div
          className="card adm-cust-panel-nav"
          style={{
            height: '90vh',
            maxHeight: '90vh',
            position: 'sticky',
            top: '80px',
            overflowY: 'auto',
          }}
        >
          <div className="adm-cust-nav-groups">
            {/* Global Store */}
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.45rem',
                  paddingLeft: '0.35rem',
                }}
              >
                GLOBAL STORE
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {globalPages.map((page) => {
                  const isActive = page.id === activePageId;
                  const count = (allPageSections[page.id] || []).length;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => handleSelectPage(page.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderLeft: isActive ? '4px solid #7c3aed' : '1.5px solid transparent',
                        borderColor: isActive ? '#7c3aed' : 'transparent',
                        background: isActive ? '#f5f3ff' : '#ffffff',
                        color: isActive ? '#7c3aed' : '#334155',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ color: isActive ? '#7c3aed' : '#64748b' }}>
                          {getPageIcon(page.icon, 16)}
                        </span>
                        <span>{page.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isActive ? '#7c3aed' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Pages */}
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.45rem',
                  paddingLeft: '0.35rem',
                }}
              >
                CORE STOREFRONT PAGES
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {storefrontPages.map((page) => {
                  const isActive = page.id === activePageId;
                  const count = (allPageSections[page.id] || []).length;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => handleSelectPage(page.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderLeft: isActive ? '4px solid #7c3aed' : '1.5px solid transparent',
                        borderColor: isActive ? '#7c3aed' : 'transparent',
                        background: isActive ? '#f5f3ff' : '#ffffff',
                        color: isActive ? '#7c3aed' : '#334155',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ color: isActive ? '#7c3aed' : '#64748b' }}>
                          {getPageIcon(page.icon, 16)}
                        </span>
                        <span>{page.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isActive ? '#7c3aed' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content & Policies */}
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.45rem',
                  paddingLeft: '0.35rem',
                }}
              >
                CONTENT & POLICIES
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {otherPages.map((page) => {
                  const isActive = page.id === activePageId;
                  const count = (allPageSections[page.id] || []).length;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => handleSelectPage(page.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderLeft: isActive ? '4px solid #7c3aed' : '1.5px solid transparent',
                        borderColor: isActive ? '#7c3aed' : 'transparent',
                        background: isActive ? '#f5f3ff' : '#ffffff',
                        color: isActive ? '#7c3aed' : '#334155',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ color: isActive ? '#7c3aed' : '#64748b' }}>
                          {getPageIcon(page.icon, 16)}
                        </span>
                        <span>{page.name}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: isActive ? '#7c3aed' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Info Box at bottom of Panel 1 */}
          <div
            style={{
              marginTop: 'auto',
              background: '#faf8fe',
              border: '1px solid #ede8f8',
              borderRadius: '10px',
              padding: '0.75rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
              <strong style={{ fontSize: '0.76rem', color: '#1e1b4b' }}>Picky Live Sync Active</strong>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Modifications immediately update the customer storefront.
            </span>
          </div>
        </div>

        {/* ── PANEL 2: Page Sections List (Middle Panel) ── */}
        <div
          className="card adm-cust-panel-sections"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '90vh',
            maxHeight: '90vh',
            position: 'sticky',
            top: '80px',
            overflowY: 'auto',
            marginBottom: 0,
            boxSizing: 'border-box',
          }}
        >
          <div>
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ color: '#7c3aed' }}>{getPageIcon(activePageMeta.icon, 20)}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                  {activePageMeta.name}
                </h3>
              </div>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Drag handle (<strong>⋮⋮</strong>) to reorder or press <strong>Alt+↑</strong> / <strong>Alt+↓</strong>.
              </span>
            </div>

            {/* Sections List with full non-truncated titles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {currentSections.map((section, index) => {
                const isSelected = section.id === activeSectionId;
                const isDraggingThis = draggedIdx === index;
                const isDragOverThis = dragOverIdx === index;

                return (
                  <div
                    key={section.id}
                    tabIndex={0}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      setDraggedIdx(index);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (dragOverIdx !== index) setDragOverIdx(index);
                    }}
                    onDragLeave={() => {
                      if (dragOverIdx === index) setDragOverIdx(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      handleDrop(draggedIdx, index);
                    }}
                    onDragEnd={() => {
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.altKey && e.key === 'ArrowUp') {
                        e.preventDefault();
                        handleMoveUp(index);
                      } else if (e.altKey && e.key === 'ArrowDown') {
                        e.preventDefault();
                        handleMoveDown(index);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSelectSection(section.id);
                      }
                    }}
                    onClick={() => handleSelectSection(section.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.8rem 0.85rem',
                      borderRadius: '12px',
                      border: '1.5px solid',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      opacity: isDraggingThis ? 0.45 : 1,
                      background: isSelected ? '#f5f3ff' : section.enabled ? '#ffffff' : '#f8fafc',
                      borderColor: isDragOverThis ? '#7c3aed' : isSelected ? '#7c3aed' : '#ede8f8',
                      boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.12)' : 'none',
                      outline: 'none',
                    }}
                    title="Click to edit section. Drag or press Alt+Up/Down to reorder."
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          cursor: 'grab',
                          color: isSelected ? '#7c3aed' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '2px',
                          flexShrink: 0,
                        }}
                        title="Drag to reorder"
                        aria-label="Drag handle"
                      >
                        <GripVertical size={18} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            fontSize: '0.88rem',
                            color: section.enabled ? '#1e1b4b' : '#94a3b8',
                            display: 'block',
                            lineHeight: 1.3,
                            fontWeight: 700,
                          }}
                        >
                          {section.name}
                        </strong>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: isSelected ? '#7c3aed' : '#64748b',
                            background: isSelected ? '#ede8f8' : '#f1f5f9',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '3px',
                          }}
                        >
                          {section.type}
                        </span>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, marginLeft: '0.6rem' }}>
                      <AccessibleToggleSwitch
                        enabled={section.enabled}
                        onToggle={(e) => handleToggleEnable(section.id, e)}
                        label={`Toggle ${section.name}`}
                        id={`toggle-${section.id}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '0.75rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.74rem',
              color: '#64748b',
            }}
          >
            <span>
              <strong>{currentSections.filter((s) => s.enabled).length}</strong> of{' '}
              <strong>{currentSections.length}</strong> sections active
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              Instant Auto-Sync
            </span>
          </div>
        </div>

        {/* ── PANEL 3: Live Customizer & Form (Right Panel) ── */}
        <div
          className="card adm-cust-panel-editor"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            height: '90vh',
            maxHeight: '90vh',
            position: 'sticky',
            top: '80px',
            overflowY: 'auto',
            marginBottom: 0,
            boxSizing: 'border-box',
          }}
        >
          {currentSection.id ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flex: 1,
                minHeight: '100%',
              }}
            >
              <div>
                {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #ede8f8',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                      {currentSection.name}
                    </h3>
                    <span
                      className={`adm-status-pill ${
                        currentSection.enabled ? 'adm-status-delivered' : 'adm-status-cancelled'
                      }`}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {currentSection.enabled ? '● Visible On Store' : '○ Section Hidden'}
                    </span>

                    {hasCurrentSectionEdits && (
                      <span
                        style={{
                          background: '#fff7ed',
                          color: '#c2410c',
                          border: '1px solid #ffedd5',
                          padding: '0.2rem 0.65rem',
                          borderRadius: '9999px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }} />
                        Unsaved edits
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                    {currentSection.description}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AccessibleToggleSwitch
                    enabled={currentSection.enabled}
                    onToggle={(e) => handleToggleEnable(currentSection.id, e)}
                    label={`Toggle visibility of ${currentSection.name}`}
                    id={`toggle-main-${currentSection.id}`}
                  />
                </div>
              </div>

              {/* Real-time Visual Preview Mockup Box */}
              <LiveSectionPreview
                section={currentSection}
                activeLineIdx={activeAnnouncementLineIdx}
                onSelectLine={setActiveAnnouncementLineIdx}
                activeHeroSlideIdx={activeHeroSlideIdx}
                onSelectHeroSlide={setActiveHeroSlideIdx}
              />

              {/* Dynamic Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Announcement Bar Form Controls (Clean Luxury Layout) */}
                {currentSection.id === 'announcement_bar' && (() => {
                  const defaultLines = [
                    {
                      id: 1,
                      icon: 'Tag',
                      text: 'Flat 15% OFF on orders above ₹1,499 | Use Code: PICKY15',
                      linkText: 'Shop Sale',
                      linkUrl: '/shop',
                      badge: 'FESTIVE OFFER',
                    },
                    {
                      id: 2,
                      icon: 'Truck',
                      text: 'Free Express Shipping across Tamil Nadu on orders above ₹999',
                      linkText: 'Shipping Info',
                      linkUrl: '/shipping-policy',
                      badge: 'FREE DELIVERY',
                    },
                    {
                      id: 3,
                      icon: 'Sparkles',
                      text: 'Swamimalai Pure Brass Vilakku & Handloom Madurai Sungudi Drops',
                      linkText: 'Explore New',
                      linkUrl: '/new-arrivals',
                      badge: 'NEW ARRIVALS',
                    },
                    {
                      id: 4,
                      icon: 'ShieldCheck',
                      text: '7-Day Easy Doorstep Replacement Guarantee on all handlooms',
                      linkText: 'Know More',
                      linkUrl: '/returns',
                      badge: 'EASY RETURNS',
                    },
                  ];

                  const rawLines =
                    Array.isArray(currentSection.settings?.lines) && currentSection.settings.lines.length > 0
                      ? currentSection.settings.lines
                      : defaultLines;

                  const linesList = [0, 1, 2, 3].map(
                    (i) => rawLines[i] || defaultLines[i] || { id: i + 1, enabled: true, text: '', linkText: '', linkUrl: '', badge: '' }
                  );
                  const curLine = (typeof activeAnnouncementLineIdx === 'number' && linesList[activeAnnouncementLineIdx])
                    ? linesList[activeAnnouncementLineIdx]
                    : linesList[0];

                  const activeLinesCount = linesList.filter((l) => l.enabled !== false).length;

                  const availableIcons = [
                    { id: 'none', label: 'None (No Icon)', icon: <span style={{ fontSize: '11px', opacity: 0.7 }}>🚫</span> },
                    { id: 'Tag', label: 'Offer', icon: <Tag size={13} /> },
                    { id: 'Truck', label: 'Shipping', icon: <Truck size={13} /> },
                    { id: 'Sparkles', label: 'New / Drops', icon: <Sparkles size={13} /> },
                    { id: 'ShieldCheck', label: 'Guarantee', icon: <ShieldCheck size={13} /> },
                    { id: 'Gift', label: 'Gift', icon: <Gift size={13} /> },
                    { id: 'Flame', label: 'Trending', icon: <Flame size={13} /> },
                    { id: 'Percent', label: 'Discount', icon: <Percent size={13} /> },
                    { id: 'Megaphone', label: 'Alert', icon: <Megaphone size={13} /> },
                    { id: 'RotateCcw', label: 'Returns', icon: <RotateCcw size={13} /> },
                    { id: 'ShoppingBag', label: 'Shop', icon: <ShoppingBag size={13} /> },
                  ];

                  const colorPresets = [
                    { label: 'Royal Purple', hex: '#7c3aed' },
                    { label: 'Deep Indigo', hex: '#4c1d95' },
                    { label: 'Midnight Navy', hex: '#1e1b4b' },
                    { label: 'Obsidian Slate', hex: '#0f172a' },
                    { label: 'Festive Crimson', hex: '#be123c' },
                    { label: 'Forest Emerald', hex: '#059669' },
                    { label: 'Warm Amber', hex: '#b45309' },
                    { label: 'Ruby Red', hex: '#e11d48' },
                  ];

                  const textPresets = [
                    { label: 'Crisp White', hex: '#ffffff' },
                    { label: 'Soft Gold', hex: '#fef08a' },
                    { label: 'Lavender Tint', hex: '#e9d5ff' },
                    { label: 'Warm Peach', hex: '#fed7aa' },
                    { label: 'Mint Glow', hex: '#a7f3d0' },
                  ];

                  const fontSizeOptions = [
                    { label: '11px (Tiny)', value: '11px' },
                    { label: '12px (Compact)', value: '12px' },
                    { label: '13px (Default)', value: '13px' },
                    { label: '14px (Medium)', value: '14px' },
                    { label: '15px (Large)', value: '15px' },
                  ];

                  const speedOptions = [
                    { label: '3s (Fast)', value: 3000 },
                    { label: '4s (Default)', value: 4000 },
                    { label: '5s (Relaxed)', value: 5000 },
                    { label: '6s (Slow)', value: 6000 },
                  ];

                  const quickRoutes = [
                    { label: '🛍️ All Products (/shop)', url: '/shop' },
                    { label: '✨ New Arrivals (/new-arrivals)', url: '/new-arrivals' },
                    { label: '🔥 Best Sellers (/best-sellers)', url: '/best-sellers' },
                    { label: '📦 Categories (/categories)', url: '/categories' },
                    { label: '🚚 Shipping Policy (/shipping-policy)', url: '/shipping-policy' },
                    { label: '🔄 Returns (/returns)', url: '/returns' },
                    { label: '📞 Contact Us (/contact-us)', url: '/contact-us' },
                    { label: '📖 Artisan Blog (/blog)', url: '/blog' },
                  ];

                  const quickBadges = [
                    'None',
                    'FESTIVE OFFER',
                    'FREE DELIVERY',
                    'NEW ARRIVALS',
                    'EASY RETURNS',
                    'LIMITED DROP',
                    'TODAY ONLY',
                  ];

                  const renderLineFields = (lineItem, lineIdx, isStacked = false) => {
                    const isLineOn = lineItem.enabled !== false;
                    return (
                      <div
                        key={lineIdx}
                        className={isStacked ? `adm-cust-line-card-stacked ${!isLineOn ? 'is-disabled' : ''}` : ''}
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', paddingTop: isStacked ? '0' : '0.2rem' }}
                      >
                        {/* Line Header & Enable/Disable Toggle Switch (Answers Point 1) */}
                        <div className={`adm-cust-line-status-banner ${isLineOn ? 'is-on' : 'is-off'}`}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`adm-cust-tab-status-dot ${isLineOn ? 'on' : 'off'}`} />
                            <div>
                              <strong style={{ fontSize: '0.82rem', color: isLineOn ? '#15803d' : '#64748b' }}>
                                Line {lineIdx + 1} Status: {isLineOn ? 'ACTIVE (Visible in Ticker)' : 'HIDDEN (Paused)'}
                              </strong>
                              <span style={{ fontSize: '0.71rem', color: '#64748b', display: 'block' }}>
                                {isLineOn
                                  ? 'This message is currently running on the customer announcement bar.'
                                  : 'This message is disabled and will not show on the customer website.'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`adm-cust-line-toggle-btn no-hover-fx ${isLineOn ? 'active' : ''}`}
                            onClick={() => handleUpdateAnnouncementLine(lineIdx, 'enabled', !isLineOn)}
                            title={isLineOn ? 'Click to disable this line' : 'Click to enable this line'}
                          >
                            {isLineOn ? '✓ Line is ON' : '✕ Line is OFF'}
                          </button>
                        </div>

                        {/* Vector Icon Row with 'none' option (Answers Point 2) */}
                        <div className="adm-cust-icons-container">
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>✨</span> Line Icon (Lucide Vector):
                          </label>
                          <div className="adm-cust-icons-row">
                            {availableIcons.map((ic) => {
                              const isSelected =
                                ic.id === 'none'
                                  ? (lineItem.icon === 'none' || !lineItem.icon)
                                  : lineItem.icon === ic.id;
                              return (
                                <button
                                  key={ic.id}
                                  type="button"
                                  className={`adm-cust-icon-pill-btn no-hover-fx ${isSelected ? 'active' : ''}`}
                                  onClick={() =>
                                    handleUpdateAnnouncementLine(lineIdx, 'icon', ic.id)
                                  }
                                >
                                  {ic.icon}
                                  <span>{ic.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Announcement Text Input (Answers Point 3) */}
                        <Input
                          label={`Announcement Message (Line ${lineIdx + 1})`}
                          value={lineItem.text || ''}
                          onChange={(e) =>
                            handleUpdateAnnouncementLine(lineIdx, 'text', e.target.value)
                          }
                          placeholder={`e.g. Line ${lineIdx + 1} promotional announcement message`}
                        />

                        {/* Action Button & Destination URL */}
                        <div className="adm-cust-two-col-grid">
                          <Input
                            label="Action Button Label"
                            value={lineItem.linkText || ''}
                            onChange={(e) =>
                              handleUpdateAnnouncementLine(lineIdx, 'linkText', e.target.value)
                            }
                            placeholder="e.g. Shop Sale / Know More"
                          />
                          <div>
                            <Input
                              label="Destination Page URL"
                              value={lineItem.linkUrl || ''}
                              onChange={(e) =>
                                handleUpdateAnnouncementLine(lineIdx, 'linkUrl', e.target.value)
                              }
                              placeholder="e.g. /shop, /shipping-policy, /returns"
                              error={validateRouteUrl(lineItem.linkUrl)}
                            />
                          </div>
                        </div>

                        {/* Quick Route Selector Dropdown */}
                        <div className="adm-cust-quick-route-row">
                          <span className="adm-cust-quick-route-label">
                            ⚡ Quick Set Store URL:
                          </span>
                          <select
                            className="adm-cust-quick-route-select"
                            value={quickRoutes.some((r) => r.url === lineItem.linkUrl) ? lineItem.linkUrl : ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateAnnouncementLine(lineIdx, 'linkUrl', e.target.value);
                              }
                            }}
                          >
                            <option value="">Choose a store page from list...</option>
                            {quickRoutes.map((rt) => (
                              <option key={rt.url} value={rt.url}>
                                {rt.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Promotional Badge & Presets with Aligned Clear Button (Answers Point 4) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', paddingTop: '0.4rem', borderTop: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                              Promotional Badge Tag (Optional)
                            </label>
                            {lineItem.badge ? (
                              <button
                                type="button"
                                className="adm-cust-clear-badge-btn-aligned no-hover-fx"
                                onClick={() => handleUpdateAnnouncementLine(lineIdx, 'badge', '')}
                                title="Remove badge"
                              >
                                ✕ Clear Badge
                              </button>
                            ) : null}
                          </div>

                          <div style={{ position: 'relative', width: '100%' }}>
                            <input
                              type="text"
                              className="form-input"
                              value={lineItem.badge || ''}
                              onChange={(e) =>
                                handleUpdateAnnouncementLine(lineIdx, 'badge', e.target.value)
                              }
                              placeholder="e.g. FESTIVE OFFER, FREE DELIVERY (or select None below)"
                              style={{ width: '100%', paddingRight: lineItem.badge ? '32px' : '12px' }}
                            />
                            {lineItem.badge && (
                              <button
                                type="button"
                                onClick={() => handleUpdateAnnouncementLine(lineIdx, 'badge', '')}
                                title="Clear badge"
                                style={{
                                  position: 'absolute',
                                  right: '8px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#94a3b8',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  padding: '2px 4px',
                                  lineHeight: 1,
                                }}
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Quick Badge Chips + Subtle Tip */}
                          <div className="adm-cust-badge-presets-container">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.69rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                              {quickBadges.map((badgeTxt) => {
                                const isBadgeActive = badgeTxt === 'None' ? (!lineItem.badge || lineItem.badge === 'None') : lineItem.badge === badgeTxt;
                                return (
                                  <button
                                    key={badgeTxt}
                                    type="button"
                                    className={`adm-cust-badge-preset-btn no-hover-fx ${isBadgeActive ? 'active' : ''}`}
                                    onClick={() =>
                                      handleUpdateAnnouncementLine(lineIdx, 'badge', badgeTxt === 'None' ? '' : badgeTxt)
                                    }
                                  >
                                    {badgeTxt === 'None' ? '🚫 None' : badgeTxt}
                                  </button>
                                );
                              })}
                            </div>
                            <span style={{ fontSize: '0.69rem', color: '#94a3b8' }}>
                              Eye-catching pill tag shown before text (select None or clear to hide).
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                      {/* ── CARD 1: Announcement Messages (4 Lines) ── */}
                      <div className="adm-cust-form-card">
                        {/* Header & Status */}
                        <div className="adm-cust-form-card-header">
                          <div>
                            <div className="adm-cust-form-card-title">
                              <Megaphone size={16} color="#7c3aed" />
                              <span>Announcement Messages (4 Lines)</span>
                            </div>
                            <span className="adm-cust-form-card-subtitle">
                              Configure up to 4 promotional ticker messages. Toggle each line ON or OFF to choose which lines scroll on the customer storefront.
                            </span>
                          </div>
                          <span className="adm-cust-active-line-tag">
                            {activeAnnouncementLineIdx === 'all'
                              ? `Viewing All 4 Lines (${activeLinesCount} Active)`
                              : `Active: Line ${activeAnnouncementLineIdx + 1} of 4 (${linesList[activeAnnouncementLineIdx]?.enabled !== false ? 'ON' : 'OFF'})`}
                          </span>
                        </div>

                        {/* Quick Active Line Count Selector (Answers Point 1) */}
                        <div className="adm-cust-line-count-bar">
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Sparkles size={14} color="#7c3aed" /> Display on Storefront:
                          </span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {[1, 2, 3, 4].map((count) => {
                              const isActive = activeLinesCount === count;
                              return (
                                <button
                                  key={count}
                                  type="button"
                                  className={`adm-cust-line-count-btn no-hover-fx ${isActive ? 'active' : ''}`}
                                  onClick={() => handleQuickSetLineCount(count)}
                                  title={`Display only ${count} line${count > 1 ? 's' : ''} on client storefront`}
                                >
                                  {count} {count === 1 ? 'Line' : 'Lines'}
                                </button>
                              );
                            })}
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: 'auto' }}>
                            Currently showing: <strong style={{ color: '#7c3aed' }}>{activeLinesCount} of 4</strong> lines
                          </span>
                        </div>

                        {/* Segmented Line Switcher Tabs (Answers Point 3: All 4 Lines accessible) */}
                        <div className="adm-cust-line-tabs-grid">
                          {linesList.map((line, idx) => {
                            const isSelected = activeAnnouncementLineIdx === idx;
                            const isLineOn = line.enabled !== false;
                            return (
                              <button
                                key={idx}
                                type="button"
                                className={`adm-cust-line-tab-btn no-hover-fx ${isSelected ? 'active' : ''}`}
                                onClick={() => setActiveAnnouncementLineIdx(idx)}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                  <span className={`adm-cust-tab-status-dot ${isLineOn ? 'on' : 'off'}`} />
                                  <span>Line {idx + 1}</span>
                                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: isLineOn ? '#15803d' : '#94a3b8' }}>
                                    {isLineOn ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                {line.badge && (
                                  <span className="adm-cust-line-badge-pill">
                                    {line.badge.length > 7 ? line.badge.substring(0, 7) + '..' : line.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            className={`adm-cust-line-tab-btn no-hover-fx ${activeAnnouncementLineIdx === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveAnnouncementLineIdx('all')}
                            style={{ fontWeight: 800 }}
                          >
                            <span>📋 All 4 Lines</span>
                          </button>
                        </div>

                        {/* Render Fields: Either selected line or all 4 lines stacked */}
                        {activeAnnouncementLineIdx === 'all' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingTop: '0.5rem' }}>
                            {linesList.map((line, idx) => renderLineFields(line, idx, true))}
                          </div>
                        ) : (
                          renderLineFields(curLine, typeof activeAnnouncementLineIdx === 'number' ? activeAnnouncementLineIdx : 0, false)
                        )}
                      </div>


                      {/* ── CARD 2: Bar Appearance, Colors & Typography ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-title">
                          <Palette size={16} color="#7c3aed" />
                          <span>Bar Styling, Colors & Timing</span>
                        </div>

                        {/* Background & Text Colors */}
                        <div className="adm-cust-two-col-grid">
                          {/* Background Color */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                              Bar Background Color
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="color"
                                value={currentSection.settings?.bgColor || '#7c3aed'}
                                onChange={(e) => handleUpdateSetting('bgColor', e.target.value)}
                                style={{
                                  width: '38px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  background: '#ffffff',
                                  flexShrink: 0,
                                }}
                                title="Pick custom background color"
                              />
                              <Input
                                value={currentSection.settings?.bgColor || '#7c3aed'}
                                onChange={(e) => handleUpdateSetting('bgColor', e.target.value)}
                                placeholder="#7c3aed"
                                style={{ fontFamily: 'monospace', fontWeight: 600 }}
                              />
                            </div>
                            <div className="adm-cust-color-row">
                              {colorPresets.map((preset) => {
                                const isCurrent = (currentSection.settings?.bgColor || '#7c3aed').toLowerCase() === preset.hex.toLowerCase();
                                return (
                                  <button
                                    key={preset.hex}
                                    type="button"
                                    className={`adm-cust-color-dot-btn no-hover-fx ${isCurrent ? 'active' : ''}`}
                                    style={{ background: preset.hex }}
                                    onClick={() => handleUpdateSetting('bgColor', preset.hex)}
                                    title={preset.label}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Text Color */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                              Text & Action Button Color
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <input
                                type="color"
                                value={currentSection.settings?.textColor || '#ffffff'}
                                onChange={(e) => handleUpdateSetting('textColor', e.target.value)}
                                style={{
                                  width: '38px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  border: '1px solid #cbd5e1',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  background: '#ffffff',
                                  flexShrink: 0,
                                }}
                                title="Pick custom text color"
                              />
                              <Input
                                value={currentSection.settings?.textColor || '#ffffff'}
                                onChange={(e) => handleUpdateSetting('textColor', e.target.value)}
                                placeholder="#ffffff"
                                style={{ fontFamily: 'monospace', fontWeight: 600 }}
                              />
                            </div>
                            <div className="adm-cust-color-row">
                              {textPresets.map((preset) => {
                                const isCurrent = (currentSection.settings?.textColor || '#ffffff').toLowerCase() === preset.hex.toLowerCase();
                                return (
                                  <button
                                    key={preset.hex}
                                    type="button"
                                    className={`adm-cust-color-dot-btn no-hover-fx ${isCurrent ? 'active' : ''}`}
                                    style={{ background: preset.hex }}
                                    onClick={() => handleUpdateSetting('textColor', preset.hex)}
                                    title={preset.label}
                                  />
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Font Size & Rotation Speed */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                          {/* Font Size */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <Type size={14} /> Text Font Size
                            </label>
                            <div className="adm-cust-pills-row">
                              {fontSizeOptions.map((opt) => {
                                const isCurrent = (currentSection.settings?.fontSize || '13px') === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    className={`adm-cust-option-pill-btn no-hover-fx ${isCurrent ? 'active' : ''}`}
                                    onClick={() => handleUpdateSetting('fontSize', opt.value)}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Autoplay Speed */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <RotateCw size={14} /> Rotation Speed
                            </label>
                            <div className="adm-cust-pills-row">
                              {speedOptions.map((opt) => {
                                const isCurrent = (currentSection.settings?.autoplaySpeed || 4000) === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    className={`adm-cust-option-pill-btn no-hover-fx ${isCurrent ? 'active' : ''}`}
                                    onClick={() => handleUpdateSetting('autoplaySpeed', opt.value)}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}


                {/* 4. Hero Banner (Collage Billboard: 3 Slides & 6 Images) */}
                {currentSection.id === 'hero_banner' && (() => {
                  const defaultHeroSlides = [
                    {
                      id: 'slide_1',
                      enabled: true,
                      eyebrow: 'NEW ARRIVALS',
                      title: 'LUXE',
                      subtitle: 'NEW DROP',
                      ctaText: 'SHOP NOW',
                      ctaLink: '/products',
                      leftImage: '/images/slide_1_left.jpg',
                      rightImage: '/images/slide_1_right.jpg',
                    },
                    {
                      id: 'slide_2',
                      enabled: true,
                      eyebrow: 'EXCLUSIVELY OUR',
                      title: 'BRAND',
                      subtitle: '50% OFF',
                      ctaText: 'SHOP NOW',
                      ctaLink: '/products',
                      leftImage: '/images/slide_2_left.jpg',
                      rightImage: '/images/slide_2_right.jpg',
                    },
                    {
                      id: 'slide_3',
                      enabled: true,
                      eyebrow: 'PREMIUM SELECTION',
                      title: 'URBAN',
                      subtitle: '30% OFF',
                      ctaText: 'SHOP NOW',
                      ctaLink: '/products',
                      leftImage: '/images/slide_3_left.jpg',
                      rightImage: '/images/slide_3_right.jpg',
                    },
                  ];

                  const rawSlides =
                    Array.isArray(currentSection.settings?.slides) && currentSection.settings.slides.length > 0
                      ? currentSection.settings.slides
                      : defaultHeroSlides;

                  const slidesList = [0, 1, 2].map(
                    (i) => rawSlides[i] || defaultHeroSlides[i] || {
                      id: `slide_${i + 1}`,
                      enabled: true,
                      eyebrow: 'NEW ARRIVALS',
                      title: 'LUXE',
                      subtitle: 'NEW DROP',
                      ctaText: 'SHOP NOW',
                      ctaLink: '/products',
                      leftImage: '/images/slide_1_left.jpg',
                      rightImage: '/images/slide_1_right.jpg',
                    }
                  );

                  const curSlide =
                    (typeof activeHeroSlideIdx === 'number' && slidesList[activeHeroSlideIdx])
                      ? slidesList[activeHeroSlideIdx]
                      : slidesList[0];

                  const activeSlidesCount = slidesList.filter((s) => s.enabled !== false).length;

                  const heroBadgePresets = [
                    'NEW ARRIVALS',
                    'EXCLUSIVELY OUR',
                    'PREMIUM SELECTION',
                    'FESTIVE OFFER',
                    'LIMITED EDITION',
                    'HOT DROP',
                    'TAMIL HERITAGE',
                  ];

                  // Render fields for a single slide
                  const renderSlideEditor = (slideItem, slideIdx, isStacked = false) => {
                    const isSlideOn = slideItem.enabled !== false;
                    return (
                      <div
                        key={slideItem.id || slideIdx}
                        style={{
                          background: isStacked ? '#fcfaff' : '#ffffff',
                          border: isStacked ? '1.5px solid #ede8f8' : 'none',
                          borderRadius: isStacked ? '12px' : '0',
                          padding: isStacked ? '1.15rem' : '0.25rem 0 0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1.15rem',
                        }}
                      >
                        {/* Slide Sub-Header */}
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px solid #f1f5f9',
                            paddingBottom: '0.65rem',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                            <span
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: isSlideOn ? '#7c3aed' : '#cbd5e1',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                              }}
                            >
                              {slideIdx + 1}
                            </span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e1b4b' }}>
                              Slide {slideIdx + 1}: {slideItem.title || 'Untitled'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '2px 7px',
                                borderRadius: '999px',
                                background: isSlideOn ? '#dcfce7' : '#f1f5f9',
                                color: isSlideOn ? '#15803d' : '#94a3b8',
                              }}
                            >
                              {isSlideOn ? '● Visible in Rotation' : '○ Slide Hidden'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <AccessibleToggleSwitch
                              enabled={isSlideOn}
                              onToggle={() => handleUpdateHeroSlide(slideIdx, 'enabled', !isSlideOn)}
                              label={`Toggle Slide ${slideIdx + 1} visibility`}
                              id={`toggle-slide-${slideIdx}`}
                            />
                          </div>
                        </div>

                        {/* Eyebrow / Pill Badge */}
                        <div>
                          <label
                            style={{
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#334155',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              marginBottom: '0.35rem',
                            }}
                          >
                            <span>Eyebrow Pill Tag (Top Badge)</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Optional</span>
                          </label>
                          <Input
                            value={slideItem.eyebrow || ''}
                            onChange={(e) => handleUpdateHeroSlide(slideIdx, 'eyebrow', e.target.value)}
                            placeholder="e.g. NEW ARRIVALS, EXCLUSIVELY OUR"
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                            <span style={{ fontSize: '0.69rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                            {heroBadgePresets.map((preset) => {
                              const isCur = slideItem.eyebrow === preset;
                              return (
                                <button
                                  key={preset}
                                  type="button"
                                  className={`adm-cust-badge-preset-btn no-hover-fx ${isCur ? 'active' : ''}`}
                                  onClick={() => handleUpdateHeroSlide(slideIdx, 'eyebrow', preset)}
                                >
                                  {preset}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Title (Headline) & Subtitle (Subheadline) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <Input
                              label="Main Headline Title"
                              value={slideItem.title || ''}
                              maxLength={40}
                              onChange={(e) => handleUpdateHeroSlide(slideIdx, 'title', e.target.value)}
                              placeholder="e.g. LUXE, BRAND, URBAN"
                            />
                            <CharacterCount current={slideItem.title} max={40} />
                          </div>

                          <div>
                            <Input
                              label="Subtitle / Discount Accent"
                              value={slideItem.subtitle || ''}
                              maxLength={40}
                              onChange={(e) => handleUpdateHeroSlide(slideIdx, 'subtitle', e.target.value)}
                              placeholder="e.g. NEW DROP, 50% OFF"
                            />
                            <CharacterCount current={slideItem.subtitle} max={40} />
                          </div>
                        </div>

                        {/* CTA Button Text & Link */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <Input
                            label="CTA Button Text"
                            value={slideItem.ctaText || 'SHOP NOW'}
                            onChange={(e) => handleUpdateHeroSlide(slideIdx, 'ctaText', e.target.value)}
                            placeholder="SHOP NOW"
                          />
                          <Input
                            label="CTA Button Link"
                            value={slideItem.ctaLink || '/products'}
                            onChange={(e) => handleUpdateHeroSlide(slideIdx, 'ctaLink', e.target.value)}
                            placeholder="/products or /shop"
                          />
                        </div>

                        {/* The 2 Diagonal Collage Images for this slide */}
                        <div
                          style={{
                            background: '#faf8fe',
                            border: '1.5px solid #ede8f8',
                            borderRadius: '12px',
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                            <div>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                🖼️ Collage Images for Slide {slideIdx + 1} (2 Images)
                              </span>
                              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                                Both images are clipped into a modern diagonal split with an interactive center glass card.
                              </span>
                            </div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: '4px' }}>
                              Slide {slideIdx + 1} of 3
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                            {/* Left Diagonal Image */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e1b4b' }}>
                                1. Left Diagonal Image (58% Width)
                              </span>
                              <ImageUploadControl
                                label={`Slide ${slideIdx + 1} Left Image`}
                                value={slideItem.leftImage || ''}
                                onChange={(val) => handleUpdateHeroSlide(slideIdx, 'leftImage', val)}
                                onClear={(currUrl) => handleClearHeroSlideImage(slideIdx, 'leftImage', currUrl)}
                              />
                            </div>

                            {/* Right Diagonal Image */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e1b4b' }}>
                                2. Right Diagonal Image (58% Width)
                              </span>
                              <ImageUploadControl
                                label={`Slide ${slideIdx + 1} Right Image`}
                                value={slideItem.rightImage || ''}
                                onChange={(val) => handleUpdateHeroSlide(slideIdx, 'rightImage', val)}
                                onClear={(currUrl) => handleClearHeroSlideImage(slideIdx, 'rightImage', currUrl)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* ── CARD 1: Hero Carousel Slides (3 Slides, 6 Images) ── */}
                      <div className="adm-cust-form-card">
                        {/* Header & Status */}
                        <div className="adm-cust-form-card-header">
                          <div>
                            <div className="adm-cust-form-card-title">
                              <Flame size={16} color="#7c3aed" />
                              <span>Hero Banner Carousel (3 Slides • 6 Images)</span>
                            </div>
                            <span className="adm-cust-form-card-subtitle">
                              Customize all 3 collage slides and all 6 diagonal images. Each slide has its own Left & Right images, headline, badge, and CTA link.
                            </span>
                          </div>
                          <span className="adm-cust-active-line-tag">
                            {activeHeroSlideIdx === 'all'
                              ? `Viewing All 3 Slides (${activeSlidesCount} Active)`
                              : `Active: Slide ${activeHeroSlideIdx + 1} of 3 (${slidesList[activeHeroSlideIdx]?.enabled !== false ? 'ON' : 'OFF'})`}
                          </span>
                        </div>

                        {/* Segmented Slide Switcher Tabs */}
                        <div className="adm-cust-line-tabs-grid">
                          {slidesList.map((slide, idx) => {
                            const isSelected = activeHeroSlideIdx === idx;
                            const isSlideOn = slide.enabled !== false;
                            return (
                              <button
                                key={idx}
                                type="button"
                                className={`adm-cust-line-tab-btn no-hover-fx ${isSelected ? 'active' : ''}`}
                                onClick={() => setActiveHeroSlideIdx(idx)}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                  <span className={`adm-cust-tab-status-dot ${isSlideOn ? 'on' : 'off'}`} />
                                  <span>Slide {idx + 1}</span>
                                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: isSlideOn ? '#15803d' : '#94a3b8' }}>
                                    {isSlideOn ? 'ON' : 'OFF'}
                                  </span>
                                </div>
                                <span className="adm-cust-line-badge-pill">
                                  {slide.title || `Slide ${idx + 1}`}
                                </span>
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            className={`adm-cust-line-tab-btn no-hover-fx ${activeHeroSlideIdx === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveHeroSlideIdx('all')}
                            style={{ fontWeight: 800 }}
                          >
                            <span>📋 All 3 Slides</span>
                          </button>
                        </div>

                        {/* Render Fields: Either currently selected slide or all 3 slides stacked */}
                        {activeHeroSlideIdx === 'all' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingTop: '0.5rem' }}>
                            {slidesList.map((slide, idx) => renderSlideEditor(slide, idx, true))}
                          </div>
                        ) : (
                          renderSlideEditor(curSlide, typeof activeHeroSlideIdx === 'number' ? activeHeroSlideIdx : 0, false)
                        )}
                      </div>

                      {/* ── CARD 2: Autoplay Timing & Carousel Options ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-title">
                          <Clock size={16} color="#7c3aed" />
                          <span>Carousel Timing & Autoplay Speed</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
                          <Input
                            label="Autoplay Interval (Milliseconds)"
                            type="number"
                            min="1500"
                            max="10000"
                            step="200"
                            value={currentSection.settings?.autoplaySpeed || 3200}
                            onChange={(e) => handleUpdateSetting('autoplaySpeed', Number(e.target.value))}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>Speed Presets</span>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {[
                                { label: '2.5s (Fast)', val: 2500 },
                                { label: '3.2s (Default)', val: 3200 },
                                { label: '4.5s (Relaxed)', val: 4500 },
                                { label: '6s (Slow)', val: 6000 },
                              ].map((p) => {
                                const isCur = (currentSection.settings?.autoplaySpeed || 3200) === p.val;
                                return (
                                  <button
                                    key={p.val}
                                    type="button"
                                    className={`adm-cust-badge-preset-btn no-hover-fx ${isCur ? 'active' : ''}`}
                                    onClick={() => handleUpdateSetting('autoplaySpeed', p.val)}
                                  >
                                    {p.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 5. Flash Deals */}
                {currentSection.id === 'flash_deals' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Section Headline"
                        value={currentSection.settings?.headline || ''}
                        onChange={(e) => handleUpdateSetting('headline', e.target.value)}
                      />
                      <Input
                        label="Spotlight Badge Tag"
                        value={currentSection.settings?.spotlightTag || ''}
                        onChange={(e) => handleUpdateSetting('spotlightTag', e.target.value)}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Featured Product Name"
                        value={currentSection.settings?.spotlightTitle || ''}
                        onChange={(e) => handleUpdateSetting('spotlightTitle', e.target.value)}
                      />
                      <Input
                        label="Discount Percentage (%)"
                        type="number"
                        min="5"
                        max="80"
                        value={currentSection.settings?.discountPercent || 32}
                        onChange={(e) => handleUpdateSetting('discountPercent', Number(e.target.value))}
                      />
                    </div>
                    <Input
                      label="Customer Savings Text"
                      value={currentSection.settings?.savingsText || ''}
                      onChange={(e) => handleUpdateSetting('savingsText', e.target.value)}
                    />
                  </>
                )}

                {/* 6. Shop by Category */}
                {currentSection.id === 'shop_by_category' && (() => {
                  const s = currentSection.settings || {};
                  const rawTitle = s.title || 'Shop by Category';
                  let prefix = s.titlePrefix;
                  let highlight = s.titleHighlight;
                  if (prefix === undefined && highlight === undefined) {
                    const words = rawTitle.trim().split(/\s+/);
                    if (words.length > 1) {
                      highlight = words.pop();
                      prefix = words.join(' ');
                    } else {
                      prefix = rawTitle;
                      highlight = '';
                    }
                  } else {
                    prefix = prefix ?? '';
                    highlight = highlight ?? '';
                  }

                  const titleFontSize = s.titleFontSize || 34;
                  const titleColor = s.titleColor || '#1e1b4b';
                  const titleHighlightColor = s.titleHighlightColor || '#7c3aed';
                  const subtitle = s.subtitle ?? 'Explore authentic handpicked items tailored for your home and lifestyle';
                  const subtitleFontSize = s.subtitleFontSize || 15;
                  const subtitleColor = s.subtitleColor || '#64748b';
                  const viewAllText = s.viewAllText || 'View All';
                  const viewAllUrl = s.viewAllUrl || '/categories';

                  const handleUpdateTitleParts = (newPrefix, newHighlight) => {
                    const combined = `${newPrefix} ${newHighlight}`.trim();
                    handleUpdateSetting('titlePrefix', newPrefix);
                    handleUpdateSetting('titleHighlight', newHighlight);
                    handleUpdateSetting('title', combined);
                  };

                  const primaryColorPresets = ['#1e1b4b', '#0f172a', '#111827', '#312e81', '#065f46', '#991b1b'];
                  const accentColorPresets = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#2563eb', '#e11d48'];
                  const fontSizePresets = [26, 30, 34, 40, 48];
                  const urlPresets = [
                    { label: 'Categories Hub', url: '/categories' },
                    { label: 'All Products', url: '/shop' },
                    { label: 'New Drops', url: '/new-arrivals' },
                    { label: 'Best Sellers', url: '/best-sellers' },
                    { label: 'Discounts & Deals', url: '/discounts' },
                  ];

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* ── CARD 1: Dual-Color Headline & Font Size ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              Two-Tone Section Headline & Typography
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Customize the primary phrase ("Shop by") and the secondary accent word ("Category") with distinct colors and sizing.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {/* Title Inputs Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <Input
                              label="Primary Headline Text (Word 1)"
                              value={prefix}
                              placeholder="Shop by"
                              onChange={(e) => handleUpdateTitleParts(e.target.value, highlight)}
                            />
                            <Input
                              label="Accent Secondary Word (Word 2)"
                              value={highlight}
                              placeholder="Category"
                              onChange={(e) => handleUpdateTitleParts(prefix, e.target.value)}
                            />
                          </div>

                          {/* Two-Color Controls */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                            {/* Color 1: Primary Phrase Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Primary Text Color ("{prefix || 'Shop by'}")
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={titleColor}
                                  onChange={(e) => handleUpdateSetting('titleColor', e.target.value)}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    padding: '2px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                    background: '#ffffff',
                                  }}
                                />
                                <input
                                  type="text"
                                  value={titleColor}
                                  onChange={(e) => handleUpdateSetting('titleColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {primaryColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('titleColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: titleColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                      transform: titleColor === c ? 'scale(1.15)' : 'none',
                                      transition: 'transform 0.15s ease',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Color 2: Secondary Accent Word Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Secondary Accent Color ("{highlight || 'Category'}")
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={titleHighlightColor}
                                  onChange={(e) => handleUpdateSetting('titleHighlightColor', e.target.value)}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    padding: '2px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                    background: '#ffffff',
                                  }}
                                />
                                <input
                                  type="text"
                                  value={titleHighlightColor}
                                  onChange={(e) => handleUpdateSetting('titleHighlightColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {accentColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('titleHighlightColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: titleHighlightColor === c ? '2px solid #1e1b4b' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                      transform: titleHighlightColor === c ? 'scale(1.15)' : 'none',
                                      transition: 'transform 0.15s ease',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Title Font Size Control */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.35rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Title Font Size ({titleFontSize}px)
                              </label>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {fontSizePresets.map((fs) => (
                                  <button
                                    key={fs}
                                    type="button"
                                    onClick={() => handleUpdateSetting('titleFontSize', fs)}
                                    className={`adm-cust-badge-preset-btn no-hover-fx ${Number(titleFontSize) === fs ? 'active' : ''}`}
                                    style={{ padding: '2px 7px', fontSize: '0.7rem' }}
                                  >
                                    {fs}px
                                  </button>
                                ))}
                              </div>
                            </div>
                            <input
                              type="range"
                              min="20"
                              max="54"
                              value={titleFontSize}
                              onChange={(e) => handleUpdateSetting('titleFontSize', Number(e.target.value))}
                              style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* ── CARD 2: Subtitle & Description ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              Section Subtitle & Styling
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Descriptive caption displayed beneath the category title.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <Input
                            label="Section Subtitle"
                            value={subtitle}
                            placeholder="Explore authentic handpicked items tailored for your home and lifestyle"
                            onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                          />

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            {/* Subtitle Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Subtitle Text Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={subtitleColor}
                                  onChange={(e) => handleUpdateSetting('subtitleColor', e.target.value)}
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    padding: '2px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                    background: '#ffffff',
                                  }}
                                />
                                <input
                                  type="text"
                                  value={subtitleColor}
                                  onChange={(e) => handleUpdateSetting('subtitleColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                            </div>

                            {/* Subtitle Font Size */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Subtitle Font Size ({subtitleFontSize}px)
                              </label>
                              <input
                                type="range"
                                min="12"
                                max="22"
                                value={subtitleFontSize}
                                onChange={(e) => handleUpdateSetting('subtitleFontSize', Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer', marginTop: '8px' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── CARD 3: View All Button & Destination URL ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              "View All" Button & Destination Link
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Configure the button label and where the customer navigates when clicking the header CTA.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <Input
                              label="View All Button Label"
                              value={viewAllText}
                              placeholder="View All"
                              onChange={(e) => handleUpdateSetting('viewAllText', e.target.value)}
                            />
                            <Input
                              label="Destination URL Route (when clicked)"
                              value={viewAllUrl}
                              placeholder="/categories"
                              onChange={(e) => handleUpdateSetting('viewAllUrl', e.target.value)}
                            />
                          </div>

                          {/* Quick Preset Route Chips */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                              Quick Route Presets:
                            </span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {urlPresets.map((p) => {
                                const isCur = viewAllUrl === p.url;
                                return (
                                  <button
                                    key={p.url}
                                    type="button"
                                    onClick={() => handleUpdateSetting('viewAllUrl', p.url)}
                                    className={`adm-cust-badge-preset-btn no-hover-fx ${isCur ? 'active' : ''}`}
                                  >
                                    {p.label} <code style={{ fontSize: '0.65rem', opacity: 0.85 }}>({p.url})</code>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 7. New Arrivals / Best Sellers / Featured Products */}
                {(currentSection.id === 'new_arrivals' ||
                  currentSection.id === 'best_sellers' ||
                  currentSection.id === 'featured_products') && (
                  <>
                    <Input
                      label="Section Title"
                      value={currentSection.settings?.title || ''}
                      onChange={(e) => handleUpdateSetting('title', e.target.value)}
                    />
                    <Input
                      label="Section Subtitle"
                      value={currentSection.settings?.subtitle || ''}
                      onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Badge Pill Text"
                        value={currentSection.settings?.badge || ''}
                        onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                      />
                      <Input
                        label="Display Limit (Items)"
                        type="number"
                        min="4"
                        max="16"
                        value={currentSection.settings?.limit || 8}
                        onChange={(e) => handleUpdateSetting('limit', Number(e.target.value))}
                      />
                    </div>
                  </>
                )}

                {/* 8. Special Offers */}
                {currentSection.id === 'special_offers' && (
                  <>
                    <Input
                      label="Offer Headline"
                      value={currentSection.settings?.title || ''}
                      onChange={(e) => handleUpdateSetting('title', e.target.value)}
                    />
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                        Banner Promotional Text
                      </label>
                      <textarea
                        value={currentSection.settings?.bannerText || ''}
                        onChange={(e) => handleUpdateSetting('bannerText', e.target.value)}
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '10px',
                          border: '1px solid #dfd5f5',
                          fontSize: '0.88rem',
                          fontFamily: 'inherit',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Promo Coupon Code"
                        value={currentSection.settings?.couponCode || ''}
                        onChange={(e) => handleUpdateSetting('couponCode', e.target.value)}
                      />
                      <Input
                        label="CTA Button Label"
                        value={currentSection.settings?.ctaText || ''}
                        onChange={(e) => handleUpdateSetting('ctaText', e.target.value)}
                      />
                    </div>
                    <ImageUploadControl
                      label="Offer Background Image"
                      value={currentSection.settings?.imageUrl || ''}
                      onChange={(val) => handleUpdateSetting('imageUrl', val)}
                      onClear={(currUrl) => handleClearSectionImage('imageUrl', currUrl)}
                    />
                  </>
                )}

                {/* 9. Why Picky (Trust Badges) */}
                {currentSection.id === 'why_picky' && (
                  <>
                    <Input
                      label="Heading Title"
                      value={currentSection.settings?.title || ''}
                      onChange={(e) => handleUpdateSetting('title', e.target.value)}
                    />
                    <Input
                      label="Subtitle"
                      value={currentSection.settings?.subtitle || ''}
                      onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                    />

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.5rem' }}>
                        Trust Proposition Features (4 Pillars)
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(currentSection.settings?.features || []).map((feat, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: '#faf8fe',
                              padding: '0.85rem',
                              borderRadius: '10px',
                              border: '1px solid #ede8f8',
                              display: 'grid',
                              gridTemplateColumns: '1fr 2fr',
                              gap: '0.75rem',
                              alignItems: 'center',
                            }}
                          >
                            <Input
                              label={`Feature #${idx + 1} Title`}
                              value={feat.title}
                              onChange={(e) => {
                                const newFeats = [...currentSection.settings.features];
                                newFeats[idx] = { ...newFeats[idx], title: e.target.value };
                                handleUpdateSetting('features', newFeats);
                              }}
                            />
                            <Input
                              label="Description"
                              value={feat.desc}
                              onChange={(e) => {
                                const newFeats = [...currentSection.settings.features];
                                newFeats[idx] = { ...newFeats[idx], desc: e.target.value };
                                handleUpdateSetting('features', newFeats);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* 10. Shop / Catalog Banner & Filters */}
                {currentSection.id === 'catalog_header_banner' && (
                  <>
                    <Input
                      label="Catalog Headline"
                      value={currentSection.settings?.headline || ''}
                      onChange={(e) => handleUpdateSetting('headline', e.target.value)}
                    />
                    <Input
                      label="Catalog Subtitle"
                      value={currentSection.settings?.subtitle || ''}
                      onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentSection.settings?.showBreadcrumbs || false}
                        onChange={(e) => handleUpdateSetting('showBreadcrumbs', e.target.checked)}
                      />
                      Show Breadcrumb Trail Navigation
                    </label>
                  </>
                )}




                {currentSection.id === 'pdp_stock_delivery_pill' && (
                  <>
                    <Input
                      label="Estimated Delivery Timeframe Blurb"
                      value={currentSection.settings?.estimatedDeliveryText || ''}
                      onChange={(e) => handleUpdateSetting('estimatedDeliveryText', e.target.value)}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Low Stock Warning Limit"
                        type="number"
                        min="1"
                        max="20"
                        value={currentSection.settings?.lowStockThreshold || 5}
                        onChange={(e) => handleUpdateSetting('lowStockThreshold', Number(e.target.value))}
                      />
                      <Input
                        label="Free Delivery Callout Blurb"
                        value={currentSection.settings?.freeDeliveryCallout || ''}
                        onChange={(e) => handleUpdateSetting('freeDeliveryCallout', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {currentSection.id === 'pdp_trust_guarantee' && (
                  <>
                    <Input
                      label="Return Policy Summary"
                      value={currentSection.settings?.returnPolicyBlurb || ''}
                      onChange={(e) => handleUpdateSetting('returnPolicyBlurb', e.target.value)}
                    />
                    <Input
                      label="Authenticity Guarantee Text"
                      value={currentSection.settings?.authenticityBlurb || ''}
                      onChange={(e) => handleUpdateSetting('authenticityBlurb', e.target.value)}
                    />
                  </>
                )}

                {currentSection.id === 'pdp_related_products' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Section Title"
                        value={currentSection.settings?.sectionTitle || 'You May Also Love'}
                        onChange={(e) => handleUpdateSetting('sectionTitle', e.target.value)}
                      />
                      <Input
                        label="Number of Items Displayed"
                        type="number"
                        min="2"
                        max="8"
                        value={currentSection.settings?.displayLimit || 4}
                        onChange={(e) => handleUpdateSetting('displayLimit', Number(e.target.value))}
                      />
                    </div>
                  </>
                )}

                {/* 12. Cart & Checkout Settings */}
                {currentSection.id === 'free_shipping_goal_bar' && (
                  <>
                    <Input
                      label="Free Shipping Minimum Order Amount (₹)"
                      type="number"
                      min="100"
                      value={currentSection.settings?.thresholdAmount || 999}
                      onChange={(e) => handleUpdateSetting('thresholdAmount', Number(e.target.value))}
                    />
                    <Input
                      label="Goal In-Progress Message (use {remaining})"
                      value={currentSection.settings?.progressText || ''}
                      onChange={(e) => handleUpdateSetting('progressText', e.target.value)}
                    />
                    <Input
                      label="Goal Unlocked Completed Message"
                      value={currentSection.settings?.completedText || ''}
                      onChange={(e) => handleUpdateSetting('completedText', e.target.value)}
                    />
                  </>
                )}

                {currentSection.id === 'cart_trust_security' && (
                  <>
                    <Input
                      label="Trust Guarantee Title"
                      value={currentSection.settings?.trustTitle || ''}
                      onChange={(e) => handleUpdateSetting('trustTitle', e.target.value)}
                    />
                    <Input
                      label="Payment Gateways Subtitle"
                      value={currentSection.settings?.subtitle || ''}
                      onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                    />
                  </>
                )}

                {currentSection.id === 'categories_hero' && (() => {
                  const s = currentSection.settings || {};
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* Section 1: Left Card ("Everything Store" Banner) */}
                      <div
                        style={{
                          background: '#faf8fe',
                          border: '1.5px solid #ede8f8',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #ede8f8',
                            paddingBottom: '0.65rem',
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: '0.92rem',
                                fontWeight: 800,
                                color: '#1e1b4b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              🌟 Left Card: "Everything Store" Hero Banner
                            </span>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              Customize title, description, price pill, button text and click navigation path.
                            </span>
                          </div>
                        </div>

                        {/* Title (Headline) & Subheading */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <Input
                              label="Main Headline Title"
                              value={s.headline ?? 'YOUR EVERYTHING STORE'}
                              onChange={(e) => handleUpdateSetting('headline', e.target.value)}
                              placeholder="e.g. YOUR EVERYTHING STORE"
                            />
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '3px' }}>
                              Tip: You can use spaces or new lines for poster styling.
                            </span>
                          </div>

                          <div>
                            <Input
                              label="Subtitle / Description"
                              value={s.subheadline ?? 'Shop Your Daily Essentials & More'}
                              onChange={(e) => handleUpdateSetting('subheadline', e.target.value)}
                              placeholder="e.g. Shop Your Daily Essentials & More"
                            />
                          </div>
                        </div>

                        {/* Starting Price Pill: Label & Amount */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <Input
                            label="Price Pill Label"
                            value={s.startingPriceLabel ?? 'Starting From'}
                            onChange={(e) => handleUpdateSetting('startingPriceLabel', e.target.value)}
                            placeholder="Starting From"
                          />
                          <Input
                            label="Price Amount"
                            value={s.startingPrice ?? '₹129'}
                            onChange={(e) => handleUpdateSetting('startingPrice', e.target.value)}
                            placeholder="₹129"
                          />
                        </div>

                        {/* Button Text & Button Link (Path) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <Input
                              label="Button Text"
                              value={s.buttonText ?? 'SHOP NOW'}
                              onChange={(e) => handleUpdateSetting('buttonText', e.target.value)}
                              placeholder="SHOP NOW"
                            />
                          </div>
                          <div>
                            <Input
                              label="Button Click Path / Target URL"
                              value={s.buttonLink ?? '/products'}
                              onChange={(e) => handleUpdateSetting('buttonLink', e.target.value)}
                              placeholder="/products or /shop"
                            />
                            {/* Quick Path Preset Pills */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Quick paths:</span>
                              {[
                                { label: '/products', path: '/products' },
                                { label: '/shop', path: '/shop' },
                                { label: '/discounts', path: '/discounts' },
                                { label: '/categories', path: '/categories' },
                              ].map((preset) => (
                                <button
                                  key={preset.path}
                                  type="button"
                                  className="adm-cust-badge-preset-btn no-hover-fx"
                                  style={{
                                    fontSize: '0.68rem',
                                    padding: '2px 8px',
                                    background: (s.buttonLink || '/products') === preset.path ? '#7c3aed' : '#f1f5f9',
                                    color: (s.buttonLink || '/products') === preset.path ? '#ffffff' : '#475569',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleUpdateSetting('buttonLink', preset.path)}
                                >
                                  {preset.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Hero 3D Graphic Image */}
                        <div>
                          <ImageUploadControl
                            label="Card 3D Composition Graphic Image"
                            value={s.heroImage || '/images/categories_hero_3d.png'}
                            onChange={(newUrl) => handleUpdateSetting('heroImage', newUrl)}
                            onClear={() => handleUpdateSetting('heroImage', '/images/categories_hero_3d.png')}
                          />
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                            Default graphic: `/images/categories_hero_3d.png` (3D phone, audio, plants & shopping bags).
                          </span>
                        </div>
                      </div>

                      {/* Section 2: Right Carousel Track Settings */}
                      <div
                        style={{
                          background: '#faf8fe',
                          border: '1.5px solid #ede8f8',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.85rem',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            color: '#1e1b4b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          🎠 Department Cards Carousel Settings
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <Input
                            label="Autoplay Speed (milliseconds)"
                            type="number"
                            value={s.autoplaySpeed ?? 4000}
                            onChange={(e) => handleUpdateSetting('autoplaySpeed', Number(e.target.value) || 2000)}
                            placeholder="4000"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── 7. New Arrivals Hero Showcase Visual Editor ── */}
                {currentSection.id === 'new_arrivals_hero' && (() => {
                  const s = currentSection.settings || {};

                  // Derive title prefix and highlight
                  const rawHeadline = s.headline || 'NEW ARRIVALS';
                  let prefix = s.titlePrefix;
                  let highlight = s.titleHighlight;
                  if (prefix === undefined && highlight === undefined) {
                    const words = rawHeadline.trim().split(/\s+/);
                    if (words.length > 1) {
                      highlight = words.pop();
                      prefix = words.join(' ');
                    } else {
                      prefix = rawHeadline;
                      highlight = '';
                    }
                  } else {
                    prefix = prefix ?? 'NEW';
                    highlight = highlight ?? 'ARRIVALS';
                  }

                  const titleColor = s.titleColor || '#1e1b4b';
                  const titleHighlightColor = s.titleHighlightColor || '#7c3aed';
                  const subtitle = s.subheadline ?? s.subtitle ?? 'Trendy styles, everyday comfort made for your season.';
                  const subtitleColor = s.subtitleColor || '#4b5563';

                  const badgeText = s.badgeText ?? s.badge ?? 'WINTER COLLECTION 2026';
                  const badgeTextColor = s.badgeTextColor || '#6d28d9';
                  const badgeBgColor = s.badgeBgColor || '#ffffff';

                  const buttonText = s.buttonText || s.ctaText || 'Discover More';
                  const buttonLink = s.buttonLink || s.ctaLink || '#catalog';
                  const buttonBgColor = s.buttonBgColor || '#250e4a';
                  const buttonTextColor = s.buttonTextColor || '#ffffff';

                  const bannerBgImage = s.bannerBgImage || s.bannerBg || s.heroImage || s.imageUrl || '/images/new-arrivals-hero/new_arrivals_hero_bg_4k.jpg';
                  const bannerBgColor = s.bannerBgColor || '#ede7f6';

                  const exploreTitle = s.exploreTitle || 'Explore Collection';
                  const exploreSubtitle = s.exploreSubtitle || 'Warm, durable, and made for winter adventures.';
                  const viewAllText = s.viewAllText || 'View All';
                  const viewAllLink = s.viewAllLink || '#catalog';

                  const handleUpdateTitleParts = (newPrefix, newHighlight) => {
                    const combined = `${newPrefix} ${newHighlight}`.trim();
                    handleUpdateSetting('titlePrefix', newPrefix);
                    handleUpdateSetting('titleHighlight', newHighlight);
                    handleUpdateSetting('headline', combined);
                  };

                  const primaryColorPresets = ['#1e1b4b', '#0f172a', '#111827', '#312e81', '#831843', '#ffffff'];
                  const accentColorPresets = ['#7c3aed', '#6d28d9', '#9333ea', '#ec4899', '#2563eb', '#059669', '#d97706'];
                  const subtitleColorPresets = ['#4b5563', '#64748b', '#334155', '#94a3b8', '#1e1b4b'];
                  const badgeTextPresets = [
                    'WINTER COLLECTION 2026',
                    'WEEKLY FRESH DROP',
                    'HANDCRAFTED LUXURY',
                    'NEW SEASON ARRIVALS',
                    'LIMITED EDITION',
                  ];
                  const badgeColorPresets = ['#6d28d9', '#7c3aed', '#4338ca', '#b91c1c', '#047857', '#0f172a'];
                  const badgeBgPresets = ['#ffffff', '#f5f3ff', '#fef2f2', '#ecfdf5', '#1e1b4b'];
                  const btnBgPresets = ['#250e4a', '#1e1b4b', '#7c3aed', '#0f172a', '#be185d', '#047857'];
                  const btnTextPresets = ['#ffffff', '#f8fafc', '#fef08a', '#e9d5ff', '#1e1b4b'];
                  const stageBgPresets = ['#ede7f6', '#f5f3ff', '#f8fafc', '#faf5ff', '#fef2f2', '#f0fdf4'];

                  const quickRoutes = [
                    { label: 'Catalog (#catalog)', url: '#catalog' },
                    { label: 'All Products (/shop)', url: '/shop' },
                    { label: 'Categories Hub (/categories)', url: '/categories' },
                    { label: 'Discounts & Deals (/discounts)', url: '/discounts' },
                    { label: 'Best Sellers (/best-sellers)', url: '/best-sellers' },
                  ];

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* ── CARD 1: Capsule Badge Pill Settings ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              ✦ Top Eyebrow Capsule Badge
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Customize the luxury pill tag text and styling above the main headline.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <Input
                            label="Badge Text"
                            value={badgeText}
                            onChange={(e) => handleUpdateSetting('badgeText', e.target.value)}
                            placeholder="WINTER COLLECTION 2026"
                          />

                          {/* Quick Badge Presets */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Presets:</span>
                            {badgeTextPresets.map((txt) => (
                              <button
                                key={txt}
                                type="button"
                                className={`adm-cust-badge-preset-btn no-hover-fx ${badgeText === txt ? 'active' : ''}`}
                                onClick={() => handleUpdateSetting('badgeText', txt)}
                              >
                                {txt}
                              </button>
                            ))}
                          </div>

                          {/* Badge Colors Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            {/* Badge Text Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Badge Text Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={badgeTextColor}
                                  onChange={(e) => handleUpdateSetting('badgeTextColor', e.target.value)}
                                  style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                                />
                                <input
                                  type="text"
                                  value={badgeTextColor}
                                  onChange={(e) => handleUpdateSetting('badgeTextColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {badgeColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('badgeTextColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: badgeTextColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Badge Background Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Badge Background Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={badgeBgColor}
                                  onChange={(e) => handleUpdateSetting('badgeBgColor', e.target.value)}
                                  style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                                />
                                <input
                                  type="text"
                                  value={badgeBgColor}
                                  onChange={(e) => handleUpdateSetting('badgeBgColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {badgeBgPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('badgeBgColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: badgeBgColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── CARD 2: Headline Typography & Dual-Color Settings ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              ✍️ Headline Typography & Colors
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Customize the two-tone luxury title text, word colors, and description subtitle.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <Input
                              label="Primary Title Word (Word 1)"
                              value={prefix}
                              placeholder="NEW"
                              onChange={(e) => handleUpdateTitleParts(e.target.value, highlight)}
                            />
                            <Input
                              label="Accent Highlight Word (Word 2)"
                              value={highlight}
                              placeholder="ARRIVALS"
                              onChange={(e) => handleUpdateTitleParts(prefix, e.target.value)}
                            />
                          </div>

                          {/* Headline Colors Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            {/* Title Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Primary Word Color ("{prefix || 'NEW'}")
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={titleColor}
                                  onChange={(e) => handleUpdateSetting('titleColor', e.target.value)}
                                  style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                                />
                                <input
                                  type="text"
                                  value={titleColor}
                                  onChange={(e) => handleUpdateSetting('titleColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {primaryColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('titleColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: titleColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Highlight Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Accent Highlight Color ("{highlight || 'ARRIVALS'}")
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={titleHighlightColor}
                                  onChange={(e) => handleUpdateSetting('titleHighlightColor', e.target.value)}
                                  style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                                />
                                <input
                                  type="text"
                                  value={titleHighlightColor}
                                  onChange={(e) => handleUpdateSetting('titleHighlightColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {accentColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('titleHighlightColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: titleHighlightColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Subtitle / Description Text & Color */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '0.35rem' }}>
                            <div>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                                Subtitle / Description
                              </label>
                              <textarea
                                rows={2}
                                value={subtitle}
                                onChange={(e) => {
                                  handleUpdateSetting('subheadline', e.target.value);
                                  handleUpdateSetting('subtitle', e.target.value);
                                }}
                                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #dfd5f5', fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none' }}
                                placeholder="Trendy styles, everyday comfort made for your season."
                              />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Subtitle Text Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={subtitleColor}
                                  onChange={(e) => handleUpdateSetting('subtitleColor', e.target.value)}
                                  style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                                />
                                <input
                                  type="text"
                                  value={subtitleColor}
                                  onChange={(e) => handleUpdateSetting('subtitleColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {subtitleColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('subtitleColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: subtitleColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── CARD 3: CTA Button Text, Path & Colors ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              🔘 CTA Button (Text, Navigation Link & Colors)
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Customize the hero action button label, target path, and button color palette.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <div>
                              <Input
                                label="Button Text"
                                value={buttonText}
                                onChange={(e) => {
                                  handleUpdateSetting('buttonText', e.target.value);
                                  handleUpdateSetting('ctaText', e.target.value);
                                }}
                                placeholder="Discover More"
                              />
                            </div>
                            <div>
                              <Input
                                label="Button Link / Target Path"
                                value={buttonLink}
                                onChange={(e) => {
                                  handleUpdateSetting('buttonLink', e.target.value);
                                  handleUpdateSetting('ctaLink', e.target.value);
                                }}
                                placeholder="#catalog or /shop"
                                error={validateRouteUrl(buttonLink)}
                              />
                            </div>
                          </div>

                          {/* Quick Route Selector Pills */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Quick paths:</span>
                            {quickRoutes.map((rt) => (
                              <button
                                key={rt.url}
                                type="button"
                                className={`adm-cust-badge-preset-btn no-hover-fx ${buttonLink === rt.url ? 'active' : ''}`}
                                onClick={() => {
                                  handleUpdateSetting('buttonLink', rt.url);
                                  handleUpdateSetting('ctaLink', rt.url);
                                }}
                              >
                                {rt.label}
                              </button>
                            ))}
                          </div>

                          {/* Button Colors Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.35rem' }}>
                            {/* Button Background Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Button Background Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={buttonBgColor}
                                  onChange={(e) => handleUpdateSetting('buttonBgColor', e.target.value)}
                                  style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                                />
                                <input
                                  type="text"
                                  value={buttonBgColor}
                                  onChange={(e) => handleUpdateSetting('buttonBgColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {btnBgPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('buttonBgColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: buttonBgColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Button Text Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Button Text & Icon Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={buttonTextColor}
                                  onChange={(e) => handleUpdateSetting('buttonTextColor', e.target.value)}
                                  style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                                />
                                <input
                                  type="text"
                                  value={buttonTextColor}
                                  onChange={(e) => handleUpdateSetting('buttonTextColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                                {btnTextPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('buttonTextColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: buttonTextColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                    }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── CARD 4: 4K Showcase Architectural Image & Stage Background ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              🖼️ Showcase Background Image & Stage Palette
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Upload a 4K architectural studio photo or provide an image URL with base canvas color.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <ImageUploadControl
                            label="Hero Showcase Background Image"
                            value={bannerBgImage}
                            onChange={(newUrl) => {
                              handleUpdateSetting('bannerBgImage', newUrl);
                              handleUpdateSetting('imageUrl', newUrl);
                            }}
                            onClear={() => {
                              handleUpdateSetting('bannerBgImage', '/images/new-arrivals-hero/new_arrivals_hero_bg_4k.jpg');
                              handleUpdateSetting('imageUrl', '/images/new-arrivals-hero/new_arrivals_hero_bg_4k.jpg');
                            }}
                          />
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '-4px' }}>
                            Default studio image: `/images/new-arrivals-hero/new_arrivals_hero_bg_4k.jpg` (Luxury arch & studio showcase).
                          </span>

                          {/* Stage Background Color */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                              Canvas Base Background Color
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="color"
                                value={bannerBgColor}
                                onChange={(e) => handleUpdateSetting('bannerBgColor', e.target.value)}
                                style={{ width: '38px', height: '38px', padding: '2px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                              />
                              <input
                                type="text"
                                value={bannerBgColor}
                                onChange={(e) => handleUpdateSetting('bannerBgColor', e.target.value)}
                                className="form-input"
                                style={{ flex: 1, fontFamily: 'monospace' }}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                              {stageBgPresets.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => handleUpdateSetting('bannerBgColor', c)}
                                  title={c}
                                  style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    background: c,
                                    border: bannerBgColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ── CARD 5: Bottom "Explore Collection" Row Settings ── */}
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              🧭 "Explore Collection" Sub-Header Row
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Customize the title, subtitle, and "View All" link above the running product marquee.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <Input
                              label="Section Title"
                              value={exploreTitle}
                              onChange={(e) => handleUpdateSetting('exploreTitle', e.target.value)}
                              placeholder="Explore Collection"
                            />
                            <Input
                              label="Section Subtitle"
                              value={exploreSubtitle}
                              onChange={(e) => handleUpdateSetting('exploreSubtitle', e.target.value)}
                              placeholder="Warm, durable, and made for winter adventures."
                            />
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                            <Input
                              label="View All Link Text"
                              value={viewAllText}
                              onChange={(e) => handleUpdateSetting('viewAllText', e.target.value)}
                              placeholder="View All"
                            />
                            <Input
                              label="View All Link Path"
                              value={viewAllLink}
                              onChange={(e) => handleUpdateSetting('viewAllLink', e.target.value)}
                              placeholder="#catalog or /shop"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── NEW ARRIVALS: Best Sellers Live Marquee Text Editor ── */}
                {currentSection.id === 'new_arrivals_marquee' && (() => {
                  const s = currentSection.settings || {};
                  const badgeText = s.badgeText ?? 'Best Sellers • Top Customer Picks';
                  const title = s.title ?? 'All Best Sellers Running Live';
                  const subtitle = s.subtitle ?? 'Continuous live stream of our top-rated, best-selling favorites. Hover over any card to pause and explore.';

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              🔥 Marquee Section Text Content
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Customize the badge, main heading, and subtitle displayed above the live running best sellers stream.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {/* 1. Top Badge Pill Text */}
                          <div>
                            <Input
                              label="Top Badge Pill Text"
                              value={badgeText}
                              onChange={(e) => handleUpdateSetting('badgeText', e.target.value)}
                              placeholder="Best Sellers • Top Customer Picks"
                            />
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                              Small badge pill displayed at the top with the orange flame icon.
                            </span>
                          </div>

                          {/* 2. Main Title / Headline */}
                          <div>
                            <Input
                              label="Main Headline / Section Title"
                              value={title}
                              onChange={(e) => handleUpdateSetting('title', e.target.value)}
                              placeholder="All Best Sellers Running Live"
                            />
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                              Primary headline displayed in bold serif typography.
                            </span>
                          </div>

                          {/* 3. Subtitle / Description */}
                          <div>
                            <label
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#1e1b4b',
                                display: 'block',
                                marginBottom: '0.4rem',
                              }}
                            >
                              Section Subtitle / Description
                            </label>
                            <textarea
                              rows={3}
                              className="adm-cust-textarea"
                              value={subtitle}
                              onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                              placeholder="Continuous live stream of our top-rated, best-selling favorites. Hover over any card to pause and explore."
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '10px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.86rem',
                                color: '#1e1b4b',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                              }}
                            />
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                              Descriptive text explaining the hover-to-pause and live stream experience for customers.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* ── BEST SELLERS: Leaderboard Banner Editor ── */}
                {currentSection.id === 'best_sellers_hero' && (() => {
                  const s = currentSection.settings || {};
                  const headline = s.headline ?? 'Most Loved South Indian Masterpieces';
                  const subheadline = s.subheadline ?? 'Handpicked by thousands of happy homes across India and worldwide.';
                  const badgeText = s.badgeText ?? 'TOP RATED & VERIFIED';
                  const titleColor = s.titleColor || s.textColor || '#111827';
                  const subtitleColor = s.subtitleColor || '#475569';

                  const titleColorPresets = [
                    '#111827', // Obsidian Black (Default)
                    '#1e1b4b', // Midnight Navy
                    '#7c3aed', // Royal Purple
                    '#4c1d95', // Deep Indigo
                    '#0f172a', // Slate Dark
                    '#be123c', // Festive Crimson
                    '#065f46', // Emerald
                    '#9a3412', // Warm Amber
                  ];

                  const subtitleColorPresets = [
                    '#475569', // Slate Gray (Default)
                    '#64748b', // Muted Gray
                    '#1e293b', // Deep Charcoal
                    '#6b21a8', // Soft Purple
                    '#4b5563', // Neutral Cool
                  ];

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="adm-cust-form-card">
                        <div className="adm-cust-form-card-header">
                          <div>
                            <h4 className="adm-cust-form-card-title">
                              🏆 Leaderboard Banner Content & Colors
                            </h4>
                            <p className="adm-cust-form-card-desc">
                              Customize the headline text, subtitle, badge, and text colors of the Best Sellers Hero Leaderboard.
                            </p>
                          </div>
                        </div>

                        <div className="adm-cust-form-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                          {/* 1. Headline */}
                          <div>
                            <Input
                              label="Headline"
                              value={headline}
                              onChange={(e) => handleUpdateSetting('headline', e.target.value)}
                              placeholder="Most Loved South Indian Masterpieces"
                            />
                          </div>

                          {/* 2. Subheadline */}
                          <div>
                            <label
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#1e1b4b',
                                display: 'block',
                                marginBottom: '0.4rem',
                              }}
                            >
                              Subheadline
                            </label>
                            <textarea
                              rows={3}
                              className="adm-cust-textarea"
                              value={subheadline}
                              onChange={(e) => handleUpdateSetting('subheadline', e.target.value)}
                              placeholder="Handpicked by thousands of happy homes across India and worldwide."
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '10px',
                                border: '1.5px solid #cbd5e1',
                                fontSize: '0.86rem',
                                color: '#1e1b4b',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          {/* 3. Badge Text */}
                          <div>
                            <Input
                              label="Badge Text"
                              value={badgeText}
                              onChange={(e) => handleUpdateSetting('badgeText', e.target.value)}
                              placeholder="TOP RATED & VERIFIED"
                            />
                          </div>

                          {/* 4. Banner Background Image (Restored) */}
                          <div>
                            <ImageUploadControl
                              label="Banner Background Image"
                              value={s.bannerBgImage || s.bannerBgColor || ''}
                              onChange={(newUrl) => {
                                handleUpdateSetting('bannerBgImage', newUrl);
                                handleUpdateSetting('bannerBgColor', newUrl);
                              }}
                              onClear={(currUrl) => {
                                handleClearSectionImage('bannerBgImage', currUrl);
                                handleUpdateSetting('bannerBgColor', '');
                              }}
                            />
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                              Supports JPG, PNG, WEBP or SVG (instant live preview). Default: <code>/images/bestseller_category_bg.jpg</code>.
                            </span>
                          </div>

                          {/* 5. Text Colors Grid */}
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid #ede8f8' }}>
                            {/* Headline Text Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Headline Text Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={titleColor}
                                  onChange={(e) => {
                                    handleUpdateSetting('titleColor', e.target.value);
                                    handleUpdateSetting('textColor', e.target.value);
                                  }}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    padding: '2px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                    background: '#ffffff',
                                  }}
                                />
                                <input
                                  type="text"
                                  value={titleColor}
                                  onChange={(e) => {
                                    handleUpdateSetting('titleColor', e.target.value);
                                    handleUpdateSetting('textColor', e.target.value);
                                  }}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                {titleColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateSetting('titleColor', c);
                                      handleUpdateSetting('textColor', c);
                                    }}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: titleColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                      boxShadow: titleColor === c ? '0 0 0 2px #ddd6fe' : 'none',
                                    }}
                                  />
                                ))}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                Changes the main headline font color.
                              </span>
                            </div>

                            {/* Subtitle Text Color */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b' }}>
                                Subtitle Text Color
                              </label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                  type="color"
                                  value={subtitleColor}
                                  onChange={(e) => handleUpdateSetting('subtitleColor', e.target.value)}
                                  style={{
                                    width: '38px',
                                    height: '38px',
                                    padding: '2px',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    cursor: 'pointer',
                                    background: '#ffffff',
                                  }}
                                />
                                <input
                                  type="text"
                                  value={subtitleColor}
                                  onChange={(e) => handleUpdateSetting('subtitleColor', e.target.value)}
                                  className="form-input"
                                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '2px', flexWrap: 'wrap' }}>
                                {subtitleColorPresets.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdateSetting('subtitleColor', c)}
                                    title={c}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      background: c,
                                      border: subtitleColor === c ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                                      cursor: 'pointer',
                                      boxShadow: subtitleColor === c ? '0 0 0 2px #ddd6fe' : 'none',
                                    }}
                                  />
                                ))}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                Changes the paragraph subtitle font color.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Dynamic Settings Editor for Categories, New Arrivals, Best Sellers, Discounts, About Us, Blog & others */}
                {![
                  'announcement_bar',
                  'hero_banner',
                  'flash_deals',
                  'shop_by_category',
                  'why_picky',
                  'catalog_header_banner',
                  'pdp_stock_delivery_pill',
                  'pdp_trust_guarantee',
                  'pdp_related_products',
                  'free_shipping_goal_bar',
                  'cart_trust_security',
                  'categories_hero',
                  'new_arrivals_hero',
                  'new_arrivals_marquee',
                  'best_sellers_hero',
                ].includes(currentSection.id) && currentSection.settings && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(currentSection.settings).map(([key, val]) => {
                      const label = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/_/g, ' ')
                        .replace(/^./, (str) => str.toUpperCase());

                      if (typeof val === 'boolean') {
                        return (
                          <div
                            key={key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.65rem 0.85rem',
                              background: '#faf8fe',
                              borderRadius: '10px',
                              border: '1px solid #ede8f8',
                            }}
                          >
                            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1e1b4b' }}>
                              {label}
                            </span>
                            <AccessibleToggleSwitch
                              enabled={val}
                              onToggle={() => handleUpdateSetting(key, !val)}
                              label={label}
                              id={`dyn_${key}`}
                            />
                          </div>
                        );
                      }

                      if (typeof val === 'number') {
                        return (
                          <Input
                            key={key}
                            label={label}
                            type="number"
                            value={val}
                            onChange={(e) => handleUpdateSetting(key, Number(e.target.value))}
                          />
                        );
                      }

                      if (
                        typeof val === 'string' &&
                        (key.toLowerCase().includes('image') ||
                          key.toLowerCase().includes('img') ||
                          key.toLowerCase().includes('bannerbg') ||
                          key.toLowerCase().includes('photo'))
                      ) {
                        return (
                          <ImageUploadControl
                            key={key}
                            label={label}
                            value={val}
                            onChange={(newUrl) => handleUpdateSetting(key, newUrl)}
                            onClear={(currUrl) => handleClearSectionImage(key, currUrl)}
                          />
                        );
                      }

                      if (
                        typeof val === 'string' &&
                        (val.length > 50 ||
                          key.toLowerCase().includes('body') ||
                          key.toLowerCase().includes('story') ||
                          key.toLowerCase().includes('quote') ||
                          key.toLowerCase().includes('desc') ||
                          key.toLowerCase().includes('mission') ||
                          key.toLowerCase().includes('vision') ||
                          key.toLowerCase().includes('blurb') ||
                          key.toLowerCase().includes('subheading') ||
                          key.toLowerCase().includes('subtitle'))
                      ) {
                        return (
                          <div key={key}>
                            <label
                              style={{
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                color: '#1e1b4b',
                                display: 'block',
                                marginBottom: '0.4rem',
                              }}
                            >
                              {label}
                            </label>
                            <textarea
                              rows={3}
                              value={val}
                              onChange={(e) => handleUpdateSetting(key, e.target.value)}
                              style={{
                                width: '100%',
                                padding: '0.65rem 0.85rem',
                                borderRadius: '10px',
                                border: '1px solid #dfd5f5',
                                fontSize: '0.88rem',
                                fontFamily: 'inherit',
                                outline: 'none',
                              }}
                            />
                          </div>
                        );
                      }

                      return (
                        <Input
                          key={key}
                          label={label}
                          value={val || ''}
                          onChange={(e) => handleUpdateSetting(key, e.target.value)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Section-level Save Button (pinned cleanly to bottom) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: 'auto',
                gap: '0.75rem',
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1.25rem',
              }}
            >
              {lastSavedSectionTimeMap[activeSectionId] && !hasCurrentSectionEdits && (
                <span
                  style={{
                    fontSize: '0.78rem',
                    color: '#16a34a',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={13} color="#16a34a" />
                  {formatRelativeTime(lastSavedSectionTimeMap[activeSectionId], clockTick)}
                </span>
              )}

              <Button
                onClick={handleSaveCurrentSection}
                disabled={!hasCurrentSectionEdits || isSavingSection}
                loading={isSavingSection}
                style={{
                  fontWeight: 700,
                  opacity: !hasCurrentSectionEdits ? 0.6 : 1,
                  cursor: !hasCurrentSectionEdits ? 'not-allowed' : 'pointer',
                  padding: '0.55rem 1.4rem',
                }}
              >
                Save Changes to {currentSection.name}
              </Button>
            </div>
          </div>
        ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8', margin: 'auto' }}>
              <Compass size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5, color: '#7c3aed' }} />
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#475569' }}>
                Select a section from the middle panel to customize.
              </p>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Choose any section on the left to edit its headlines, CTA links, and visuals.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Unsaved Changes Confirmation Modal ─────────────────────────────── */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setPendingAction(null);
        }}
        title="Unsaved Changes"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ color: '#334155', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            You have unsaved edits in <strong>{currentSection?.name}</strong>. Do you want to discard your changes and switch?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setPendingAction(null);
              }}
            >
              Keep Editing
            </Button>
            <Button
              variant="danger"
              style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}
              onClick={handleConfirmDiscard}
            >
              Discard Changes
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </AdminLayout>
  );
}
