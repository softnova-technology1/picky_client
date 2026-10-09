import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useUiStore } from '../../../store/uiStore';
import { useCustomizationStore } from '../../../store/customizationStore';
import {
  MOCK_CUSTOMIZATION_PAGES,
  MOCK_PAGE_SECTIONS,
} from '../../../data/customizationMockData';

// ─── Icon Mapper for Pages ───────────────────────────────────────────────────
function getPageIcon(iconName, size = 18) {
  switch (iconName) {
    case 'PanelTop':
      return <PanelTop size={size} />;
    case 'Home':
      return <Home size={size} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} />;
    case 'Package':
      return <Package size={size} />;
    case 'ShoppingCart':
      return <ShoppingCart size={size} />;
    case 'Footprints':
      return <Footprints size={size} />;
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
function ImageUploadControl({ label, value, onChange }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const fileInputRef = useRef(null);

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
      const res = await adminService.uploadImage(formData);
      onChange(res.data?.url || res.url);
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
              onClick={() => {
                onChange('');
                setUrlError(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#dc2626',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 6px',
              }}
            >
              <Trash2 size={12} /> Clear
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
function LiveSectionPreview({ section }) {
  if (!section || !section.id) return null;
  const s = section.settings || {};

  return (
    <div
      style={{
        background: '#fcfaff',
        border: '1.5px dashed #dfd5f5',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '0.75rem',
          borderBottom: '1px solid #ede8f8',
          paddingBottom: '0.45rem',
        }}
      >
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 800,
            color: '#7c3aed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          <Eye size={13} /> Live Storefront Visual Preview
        </span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
          Real-time customer view simulation
        </span>
      </div>

      {/* 1. Announcement Bar Preview */}
      {section.id === 'announcement_bar' && (
        <div
          style={{
            background: s.bgColor || '#7c3aed',
            color: s.textColor || '#ffffff',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            flexWrap: 'wrap',
          }}
        >
          {s.badge && (
            <span
              style={{
                background: 'rgba(255,255,255,0.22)',
                padding: '1px 6px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 800,
              }}
            >
              {s.badge}
            </span>
          )}
          <span>{s.text || 'Announcement message preview'}</span>
          {s.linkText && (
            <span style={{ textDecoration: 'underline', fontWeight: 800 }}>
              {s.linkText} →
            </span>
          )}
        </div>
      )}

      {/* 2. Hero Banner Preview */}
      {section.id === 'hero_banner' && (
        <div
          style={{
            position: 'relative',
            borderRadius: '10px',
            overflow: 'hidden',
            minHeight: '170px',
            background: s.imageUrl
              ? `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.65)), url(${s.imageUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            color: '#ffffff',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.45rem',
          }}
        >
          {s.badge && (
            <span
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(4px)',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '0.68rem',
                fontWeight: 700,
              }}
            >
              {s.badge}
            </span>
          )}
          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
            {s.headline || 'Headline Title'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.9, maxWidth: '480px', lineHeight: 1.4 }}>
            {s.subheadline || 'Subheadline description will appear here...'}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
            {s.ctaText && (
              <span
                style={{
                  background: '#ffffff',
                  color: '#7c3aed',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                {s.ctaText}
              </span>
            )}
            {s.secondaryCtaText && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '6px',
                }}
              >
                {s.secondaryCtaText}
              </span>
            )}
          </div>
        </div>
      )}

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

      {/* 6. Generic Preview for Other Pages */}
      {section.id !== 'announcement_bar' &&
        section.id !== 'hero_banner' &&
        section.id !== 'flash_deals' &&
        section.id !== 'why_picky' &&
        section.id !== 'free_shipping_goal_bar' && (
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
              <strong style={{ fontSize: '0.86rem', color: '#1e1b4b' }}>
                {s.title || s.headline || s.storyTitle || section.name}
              </strong>
              <p style={{ margin: '3px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
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

  // Active Selected Page (Header, Home, Shop, PDP, Cart, Footer, Content)
  const [activePageId, setActivePageId] = useState('home');

  // Baseline and Working copies of all page sections
  const [allPageSections, setAllPageSections] = useState(() => {
    return storePageSections || MOCK_PAGE_SECTIONS;
  });
  const [savedPageSections, setSavedPageSections] = useState(() => {
    return storePageSections || MOCK_PAGE_SECTIONS;
  });

  // Current active page's section list
  const currentSections = useMemo(() => {
    return allPageSections[activePageId] || [];
  }, [allPageSections, activePageId]);

  const savedCurrentSections = useMemo(() => {
    return savedPageSections[activePageId] || [];
  }, [savedPageSections, activePageId]);

  // Active Section Selection within the active page
  const [activeSectionId, setActiveSectionId] = useState(() => {
    const list = (storePageSections || MOCK_PAGE_SECTIONS)['home'] || [];
    return list[0]?.id || 'hero_banner';
  });

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
      if (pageSectionsList.length > 0) {
        setActiveSectionId(pageSectionsList[0].id);
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

    if (pendingAction) {
      if (pendingAction.type === 'page') {
        setActivePageId(pendingAction.targetId);
        const nextList = allPageSections[pendingAction.targetId] || [];
        if (nextList.length > 0) {
          setActiveSectionId(nextList[0].id);
        }
      } else if (pendingAction.type === 'section') {
        setActiveSectionId(pendingAction.targetId);
      }
    }

    setPendingAction(null);
    setIsConfirmModalOpen(false);
    showToast('Unsaved edits discarded', 'info');
  };

  // Save Page Section Order & Visibility
  const handleSaveOrderAndVisibility = async () => {
    setIsSavingOrder(true);
    try {
      await adminService.updateCustomization(activePageId, currentSections);
      setSavedPageSections((prev) => ({
        ...prev,
        [activePageId]: [...currentSections],
      }));
      storeSavePageSections(activePageId, currentSections);

      setLastSavedOrderTimeMap((prev) => ({
        ...prev,
        [activePageId]: Date.now(),
      }));
      showToast('🎉 Section order & visibility saved!', 'success');
    } catch (err) {
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

      await adminService.updateCustomization(activePageId, updatedSaved);

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

  const activePageMeta = MOCK_CUSTOMIZATION_PAGES.find((p) => p.id === activePageId) || MOCK_CUSTOMIZATION_PAGES[1];

  const globalPages = MOCK_CUSTOMIZATION_PAGES.filter((p) => p.group === 'GLOBAL');
  const storefrontPages = MOCK_CUSTOMIZATION_PAGES.filter((p) => p.group === 'STOREFRONT');
  const otherPages = MOCK_CUSTOMIZATION_PAGES.filter((p) => p.group === 'PAGES');

  return (
    <AdminLayout title="Store Customization">
      {/* ─── Top Control Header ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
              Storefront Customization & Visual Editor
            </h2>
            <span
              style={{
                background: '#ede8f8',
                color: '#7c3aed',
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #dfd5f5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Sparkles size={12} /> PICKY THEME ENGINE
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px', display: 'block' }}>
            Customize global store branding, homepage sections, catalog layout, product details, and store policies
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {lastSavedOrderTimeMap[activePageId] && (
            <span
              style={{
                fontSize: '0.78rem',
                color: '#16a34a',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f0fdf4',
                padding: '5px 12px',
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
              }}
            >
              <CheckCircle2 size={14} color="#16a34a" />
              {formatRelativeTime(lastSavedOrderTimeMap[activePageId], clockTick)}
            </span>
          )}

          <Link
            to="/"
            target="_blank"
            className="admin-period-select-btn"
            style={{ padding: '0.5rem 1rem', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}
            title="Open customer storefront in a new tab"
          >
            <ExternalLink size={14} />
            <span>Preview Store</span>
          </Link>

          <Button
            onClick={handleSaveOrderAndVisibility}
            loading={isSavingOrder}
            style={{
              padding: '0.52rem 1.35rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Save size={15} />
            <span>Save Section Order & Visibility</span>
          </Button>
        </div>
      </div>

      {/* ─── 3-Panel Unified Grid Layout (Height-Matched & Balanced) ───────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 380px 1fr',
          gap: '1.25rem',
          alignItems: 'stretch',
          minHeight: 'calc(100vh - 175px)',
        }}
      >
        {/* ── PANEL 1: Store Area Selector (Left Nav) ── */}
        <div
          className="card"
          style={{
            padding: '1.15rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
          className="card"
          style={{
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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
              marginTop: '1.25rem',
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
          className="card"
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {currentSection.id ? (
            <>
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
              <LiveSectionPreview section={currentSection} />

              {/* Dynamic Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* 1. Announcement Bar */}
                {currentSection.id === 'announcement_bar' && (
                  <>
                    <Input
                      label="Announcement Message"
                      value={currentSection.settings?.text || ''}
                      onChange={(e) => handleUpdateSetting('text', e.target.value)}
                      placeholder="e.g. Free Shipping across Tamil Nadu on orders above ₹1,499"
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Action Button Label"
                        value={currentSection.settings?.linkText || ''}
                        onChange={(e) => handleUpdateSetting('linkText', e.target.value)}
                        placeholder="e.g. Shop Sale"
                      />
                      <div>
                        <Input
                          label="Destination URL"
                          value={currentSection.settings?.linkUrl || ''}
                          onChange={(e) => handleUpdateSetting('linkUrl', e.target.value)}
                          placeholder="e.g. /shop"
                          error={announcementLinkError}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Promotional Badge Text"
                        value={currentSection.settings?.badge || ''}
                        onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                        placeholder="e.g. FESTIVE OFFER"
                      />
                      <Input
                        label="Bar Background Color"
                        value={currentSection.settings?.bgColor || '#7c3aed'}
                        onChange={(e) => handleUpdateSetting('bgColor', e.target.value)}
                        placeholder="#7c3aed"
                      />
                    </div>
                  </>
                )}

                {/* 2. Main Navigation Header */}
                {currentSection.id === 'main_header_nav' && (
                  <>
                    <Input
                      label="Brand Logo Text"
                      value={currentSection.settings?.logoText || 'PICKY'}
                      onChange={(e) => handleUpdateSetting('logoText', e.target.value)}
                    />
                    <Input
                      label="Search Bar Placeholder"
                      value={currentSection.settings?.searchPlaceholder || ''}
                      onChange={(e) => handleUpdateSetting('searchPlaceholder', e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.isSticky || false}
                          onChange={(e) => handleUpdateSetting('isSticky', e.target.checked)}
                        />
                        Sticky Navigation on Scroll
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.showWishlistLink || false}
                          onChange={(e) => handleUpdateSetting('showWishlistLink', e.target.checked)}
                        />
                        Show Wishlist Icon
                      </label>
                    </div>
                  </>
                )}

                {/* 3. Sticky Quick Bar */}
                {currentSection.id === 'sticky_action_bar' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="WhatsApp Support Hotline"
                        value={currentSection.settings?.whatsappNumber || ''}
                        onChange={(e) => handleUpdateSetting('whatsappNumber', e.target.value)}
                      />
                      <Input
                        label="Support Callout Text"
                        value={currentSection.settings?.supportCallout || ''}
                        onChange={(e) => handleUpdateSetting('supportCallout', e.target.value)}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentSection.settings?.showMobileBottomNav || false}
                        onChange={(e) => handleUpdateSetting('showMobileBottomNav', e.target.checked)}
                      />
                      Enable Floating Mobile Quick Bar
                    </label>
                  </>
                )}

                {/* 4. Hero Banner */}
                {currentSection.id === 'hero_banner' && (
                  <>
                    <div>
                      <Input
                        label="Headline Title"
                        value={currentSection.settings?.headline || ''}
                        maxLength={80}
                        onChange={(e) => handleUpdateSetting('headline', e.target.value)}
                        placeholder="e.g. Authentic South Indian Elegance"
                      />
                      <CharacterCount current={currentSection.settings?.headline} max={80} />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                        Subheadline Description
                      </label>
                      <textarea
                        value={currentSection.settings?.subheadline || ''}
                        maxLength={200}
                        onChange={(e) => handleUpdateSetting('subheadline', e.target.value)}
                        rows={3}
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
                      <CharacterCount current={currentSection.settings?.subheadline} max={200} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Primary CTA Text"
                        value={currentSection.settings?.ctaText || ''}
                        onChange={(e) => handleUpdateSetting('ctaText', e.target.value)}
                      />
                      <div>
                        <Input
                          label="Primary CTA Link"
                          value={currentSection.settings?.ctaLink || ''}
                          onChange={(e) => handleUpdateSetting('ctaLink', e.target.value)}
                          error={heroPrimaryLinkError}
                          placeholder="/shop or https://..."
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Secondary CTA Text"
                        value={currentSection.settings?.secondaryCtaText || ''}
                        onChange={(e) => handleUpdateSetting('secondaryCtaText', e.target.value)}
                      />
                      <div>
                        <Input
                          label="Secondary CTA Link"
                          value={currentSection.settings?.secondaryCtaLink || ''}
                          onChange={(e) => handleUpdateSetting('secondaryCtaLink', e.target.value)}
                          error={heroSecondaryLinkError}
                          placeholder="/categories or https://..."
                        />
                      </div>
                    </div>

                    <ImageUploadControl
                      label="Hero Banner Image"
                      value={currentSection.settings?.imageUrl || ''}
                      onChange={(val) => handleUpdateSetting('imageUrl', val)}
                    />
                  </>
                )}

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
                {currentSection.id === 'shop_by_category' && (
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
                        label="Grid Columns (Desktop)"
                        type="number"
                        min="2"
                        max="6"
                        value={currentSection.settings?.columns || 5}
                        onChange={(e) => handleUpdateSetting('columns', Number(e.target.value))}
                      />
                      <Input
                        label="Max Visible Categories"
                        type="number"
                        min="3"
                        max="12"
                        value={currentSection.settings?.maxItems || 10}
                        onChange={(e) => handleUpdateSetting('maxItems', Number(e.target.value))}
                      />
                    </div>
                  </>
                )}

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

                {currentSection.id === 'shop_filters_sort' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Default Sorting"
                        value={currentSection.settings?.defaultSort || 'featured'}
                        onChange={(e) => handleUpdateSetting('defaultSort', e.target.value)}
                      />
                      <Input
                        label="Desktop Product Columns (3 / 4 / 5)"
                        type="number"
                        min="2"
                        max="5"
                        value={currentSection.settings?.desktopGridColumns || 4}
                        onChange={(e) => handleUpdateSetting('desktopGridColumns', Number(e.target.value))}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.enablePriceSlider || false}
                          onChange={(e) => handleUpdateSetting('enablePriceSlider', e.target.checked)}
                        />
                        Enable Price Slider
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.enableDepartmentFilter || false}
                          onChange={(e) => handleUpdateSetting('enableDepartmentFilter', e.target.checked)}
                        />
                        Department Facets
                      </label>
                    </div>
                  </>
                )}

                {currentSection.id === 'product_card_appearance' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.showWishlistHeart || false}
                          onChange={(e) => handleUpdateSetting('showWishlistHeart', e.target.checked)}
                        />
                        Show Floating Wishlist Heart Icon
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.showQuickAddToCart || false}
                          onChange={(e) => handleUpdateSetting('showQuickAddToCart', e.target.checked)}
                        />
                        Show Instant Add-to-Cart Button
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.showDiscountPercentage || false}
                          onChange={(e) => handleUpdateSetting('showDiscountPercentage', e.target.checked)}
                        />
                        Show Discount Percentage Badge
                      </label>
                    </div>
                  </>
                )}

                {currentSection.id === 'subcategory_pills_bar' && (
                  <>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.showSubcategoryIcons || false}
                          onChange={(e) => handleUpdateSetting('showSubcategoryIcons', e.target.checked)}
                        />
                        Show Category Icons in Pills
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={currentSection.settings?.showProductCountInPill || false}
                          onChange={(e) => handleUpdateSetting('showProductCountInPill', e.target.checked)}
                        />
                        Show Product Count Badge
                      </label>
                    </div>
                  </>
                )}

                {/* 11. Product Details (PDP) Settings */}
                {currentSection.id === 'pdp_gallery_settings' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Thumbnail Position (left / bottom)"
                        value={currentSection.settings?.thumbnailPosition || 'left'}
                        onChange={(e) => handleUpdateSetting('thumbnailPosition', e.target.value)}
                      />
                      <Input
                        label="Image Aspect Ratio (1:1 / 3:4)"
                        value={currentSection.settings?.aspectRatio || '1:1'}
                        onChange={(e) => handleUpdateSetting('aspectRatio', e.target.value)}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={currentSection.settings?.enableMagnifierZoom || false}
                        onChange={(e) => handleUpdateSetting('enableMagnifierZoom', e.target.checked)}
                      />
                      Enable High-Resolution Magnifier Hover Zoom
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

                {currentSection.id === 'cart_coupon_strip' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Featured Coupon Code"
                        value={currentSection.settings?.featuredCouponCode || ''}
                        onChange={(e) => handleUpdateSetting('featuredCouponCode', e.target.value)}
                      />
                      <Input
                        label="Coupon Highlight Blurb"
                        value={currentSection.settings?.couponHighlightText || ''}
                        onChange={(e) => handleUpdateSetting('couponHighlightText', e.target.value)}
                      />
                    </div>
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

                {currentSection.id === 'cart_upsell_carousel' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Carousel Title"
                        value={currentSection.settings?.title || ''}
                        onChange={(e) => handleUpdateSetting('title', e.target.value)}
                      />
                      <Input
                        label="Maximum Upsell Products"
                        type="number"
                        min="1"
                        max="6"
                        value={currentSection.settings?.maxItems || 3}
                        onChange={(e) => handleUpdateSetting('maxItems', Number(e.target.value))}
                      />
                    </div>
                  </>
                )}

                {/* 13. Storefront Footer Settings */}
                {currentSection.id === 'footer_config' && (
                  <>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                        About Storefront Blurb
                      </label>
                      <textarea
                        value={currentSection.settings?.aboutText || ''}
                        onChange={(e) => handleUpdateSetting('aboutText', e.target.value)}
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
                        label="Newsletter Heading"
                        value={currentSection.settings?.newsletterTitle || ''}
                        onChange={(e) => handleUpdateSetting('newsletterTitle', e.target.value)}
                      />
                      <Input
                        label="Support WhatsApp"
                        value={currentSection.settings?.whatsapp || ''}
                        onChange={(e) => handleUpdateSetting('whatsapp', e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Support Email"
                        value={currentSection.settings?.supportEmail || ''}
                        onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)}
                      />
                      <Input
                        label="Instagram URL"
                        value={currentSection.settings?.instagram || ''}
                        onChange={(e) => handleUpdateSetting('instagram', e.target.value)}
                      />
                    </div>

                    <Input
                      label="Copyright Notice"
                      value={currentSection.settings?.copyrightText || ''}
                      onChange={(e) => handleUpdateSetting('copyrightText', e.target.value)}
                    />
                  </>
                )}

                {/* 14. Content & Policies Pages Settings */}
                {currentSection.id === 'about_us_content' && (
                  <>
                    <Input
                      label="Story Headline"
                      value={currentSection.settings?.storyTitle || ''}
                      onChange={(e) => handleUpdateSetting('storyTitle', e.target.value)}
                    />
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                        Artisan Story Body
                      </label>
                      <textarea
                        value={currentSection.settings?.storyBody || ''}
                        onChange={(e) => handleUpdateSetting('storyBody', e.target.value)}
                        rows={3}
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
                        label="Artisan Count Badge"
                        value={currentSection.settings?.artisanCount || ''}
                        onChange={(e) => handleUpdateSetting('artisanCount', e.target.value)}
                      />
                      <Input
                        label="Districts Covered Badge"
                        value={currentSection.settings?.districtsCovered || ''}
                        onChange={(e) => handleUpdateSetting('districtsCovered', e.target.value)}
                      />
                    </div>
                  </>
                )}

                {currentSection.id === 'contact_support_content' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <Input
                        label="Support Phone"
                        value={currentSection.settings?.supportPhone || ''}
                        onChange={(e) => handleUpdateSetting('supportPhone', e.target.value)}
                      />
                      <Input
                        label="Support Email"
                        value={currentSection.settings?.supportEmail || ''}
                        onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)}
                      />
                    </div>
                    <Input
                      label="Working Hours Blurb"
                      value={currentSection.settings?.workingHours || ''}
                      onChange={(e) => handleUpdateSetting('workingHours', e.target.value)}
                    />
                    <Input
                      label="Headquarters Office Address"
                      value={currentSection.settings?.officeAddress || ''}
                      onChange={(e) => handleUpdateSetting('officeAddress', e.target.value)}
                    />
                  </>
                )}

                {currentSection.id === 'policies_terms_content' && (
                  <>
                    <Input
                      label="Policy Revision Notice"
                      value={currentSection.settings?.policyUpdateDate || ''}
                      onChange={(e) => handleUpdateSetting('policyUpdateDate', e.target.value)}
                    />
                    <Input
                      label="Shipping Turnaround Blurb"
                      value={currentSection.settings?.shippingTimeline || ''}
                      onChange={(e) => handleUpdateSetting('shippingTimeline', e.target.value)}
                    />
                  </>
                )}

                {/* Section-level Save Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginTop: '1.25rem',
                    gap: '0.75rem',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '1rem',
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
            </>
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
    </AdminLayout>
  );
}
