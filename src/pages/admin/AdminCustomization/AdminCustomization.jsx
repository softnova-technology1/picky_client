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
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Modal from '../../../components/ui/Modal';
import { useUiStore } from '../../../store/uiStore';
import { useCustomizationStore } from '../../../store/customizationStore';
import { MOCK_STORE_CUSTOMIZATION } from '../../../data/customizationMockData';

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

// ─── Accessible Sliding Toggle Switch Component (Requirement 6) ───────────────
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

// ─── Character Counter Component (Requirement 4) ──────────────────────────────
function CharacterCount({ current = '', max = 80 }) {
  const length = current ? current.length : 0;
  const ratio = length / max;
  let color = '#64748b'; // default slate

  if (length >= max) {
    color = '#dc2626'; // red when at limit
  } else if (ratio > 0.9) {
    color = '#ea580c'; // orange when > 90%
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

// ─── Image Upload Component (Requirement 3) ───────────────────────────────────
function ImageUploadControl({ label, value, onChange }) {
  const [tab, setTab] = useState('upload'); // 'upload' | 'url'
  const [isDragging, setIsDragging] = useState(false);
  const [urlError, setUrlError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileProcess = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUrlError('Please select a valid image file (JPG, PNG, WEBP, SVG)');
      return;
    }
    setUrlError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target.result);
    };
    reader.readAsDataURL(file);
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
      {/* Label and Mode Switcher */}
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

      {/* Tab 1: Drag & Drop Area */}
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
                Drag & drop banner image, or <span style={{ color: '#7c3aed' }}>browse</span>
              </strong>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Supports JPG, PNG, WEBP or SVG (preview generated instantly)
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Fallback URL Input */
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

      {/* Inline Image Load Error */}
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
          Image failed to load. Check the URL.
        </span>
      )}

      {/* Banner Preview Area */}
      {value && (
        <div style={{ marginTop: '0.65rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>
              Banner Preview
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
              alt="Banner preview"
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

// ─── Main Admin Customization Component ───────────────────────────────────────
export default function AdminCustomization() {
  const { showToast } = useUiStore();
  const {
    sections: storeSections,
    storeInfo: storeInfoData,
    setSections: storeSaveSections,
    setStoreInfo: storeSaveInfo,
  } = useCustomizationStore();

  // Baseline saved copy to detect unsaved changes
  const [savedSections, setSavedSections] = useState(() => storeSections || MOCK_STORE_CUSTOMIZATION.sections);
  // Current working editable copy
  const [sections, setSections] = useState(() => storeSections || MOCK_STORE_CUSTOMIZATION.sections);
  const [storeInfo, setStoreInfo] = useState(() => storeInfoData || MOCK_STORE_CUSTOMIZATION.storeInfo);

  // Active section selection
  const [activeSectionId, setActiveSectionId] = useState(
    sections.find((s) => s.id === 'hero_banner')?.id || sections[0]?.id || 'hero_banner'
  );

  // Saving states
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Requirement 7: Last Saved timestamps
  const [lastSavedOrderTime, setLastSavedOrderTime] = useState(null);
  const [lastSavedSectionTimeMap, setLastSavedSectionTimeMap] = useState({});
  const [clockTick, setClockTick] = useState(Date.now());

  // Ticker for updating relative times every 10s
  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Requirement 2: Unsaved changes guard modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingSectionId, setPendingSectionId] = useState(null);

  // Drag and drop state (Requirement 5)
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Current active section
  const currentSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const savedCurrentSection = savedSections.find((s) => s.id === activeSectionId) || savedSections[0];

  // Requirement 1: Check if the currently active section has unsaved field edits
  const hasCurrentSectionEdits = useMemo(() => {
    if (!currentSection || !savedCurrentSection) return false;
    return JSON.stringify(currentSection.settings) !== JSON.stringify(savedCurrentSection.settings);
  }, [currentSection, savedCurrentSection]);

  // Requirement 5: Drag and Drop Handlers
  const handleDrop = (fromIndex, toIndex) => {
    if (fromIndex === null || fromIndex === undefined || fromIndex === toIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const updated = [...sections];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
    setLastSavedOrderTime(null);
    showToast(`Reordered "${movedItem.name}"`, 'info');
  };

  // Keyboard Reordering (Alt+ArrowUp / Alt+ArrowDown)
  const handleMoveUp = (index) => {
    if (index <= 0) return;
    const updated = [...sections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(updated);
    setLastSavedOrderTime(null);
    showToast(`Moved "${updated[index - 1].name}" up`, 'info');
  };

  const handleMoveDown = (index) => {
    if (index >= sections.length - 1) return;
    const updated = [...sections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;

    updated.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSections(updated);
    setLastSavedOrderTime(null);
    showToast(`Moved "${updated[index + 1].name}" down`, 'info');
  };

  // Requirement 6: Accessible Visibility Toggle
  const handleToggleEnable = (id, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    let toggledName = '';
    let nextState = false;
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          toggledName = s.name;
          nextState = !s.enabled;
          return { ...s, enabled: nextState };
        }
        return s;
      })
    );
    setLastSavedOrderTime(null);
    if (toggledName) {
      showToast(`${toggledName} is now ${nextState ? 'Enabled' : 'Hidden'}`, 'info');
    }
  };

  // Section Field Edits
  const handleUpdateSetting = (field, value) => {
    setLastSavedSectionTimeMap((prev) => {
      if (!prev[activeSectionId]) return prev;
      const copy = { ...prev };
      delete copy[activeSectionId];
      return copy;
    });
    setSections((prev) =>
      prev.map((s) => {
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
      })
    );
  };

  // Requirement 2: Section selection with unsaved edits guard
  const handleSelectSection = (targetId) => {
    if (targetId === activeSectionId) return;

    if (hasCurrentSectionEdits) {
      setPendingSectionId(targetId);
      setIsConfirmModalOpen(true);
    } else {
      setActiveSectionId(targetId);
    }
  };

  // Discard changes and navigate
  const handleConfirmDiscard = () => {
    // Revert active section's settings back to saved baseline
    setSections((prev) =>
      prev.map((s) => (s.id === activeSectionId ? { ...s, settings: { ...savedCurrentSection.settings } } : s))
    );
    if (pendingSectionId) {
      setActiveSectionId(pendingSectionId);
    }
    setPendingSectionId(null);
    setIsConfirmModalOpen(false);
    showToast('Unsaved edits discarded', 'info');
  };

  // Requirement 1: Top-Right "Save Section Order & Visibility" Button
  const handleSaveOrderAndVisibility = () => {
    setIsSavingOrder(true);
    setTimeout(() => {
      // Merge current order and enabled status into savedSections
      const merged = savedSections.map((saved) => {
        const matchingCurrent = sections.find((s) => s.id === saved.id);
        return matchingCurrent
          ? { ...saved, order: matchingCurrent.order, enabled: matchingCurrent.enabled }
          : saved;
      });
      // Sort merged according to current order
      merged.sort((a, b) => a.order - b.order);

      setSavedSections(merged);
      storeSaveSections(merged);
      setIsSavingOrder(false);
      setLastSavedOrderTime(Date.now());
      showToast('🎉 Section order & visibility saved!', 'success');
    }, 350);
  };

  // Requirement 1: Section-level "Save Changes to [Section Name]" Button
  const handleSaveCurrentSection = () => {
    if (!hasCurrentSectionEdits) return;

    setIsSavingSection(true);
    setTimeout(() => {
      // Update saved baseline for this section
      const updatedSaved = savedSections.map((s) =>
        s.id === activeSectionId ? { ...s, settings: { ...currentSection.settings } } : s
      );
      setSavedSections(updatedSaved);

      // Propagate to store
      storeSaveSections(updatedSaved);

      setIsSavingSection(false);
      setLastSavedSectionTimeMap((prev) => ({
        ...prev,
        [activeSectionId]: Date.now(),
      }));
      showToast(`🎉 Changes to ${currentSection.name} saved!`, 'success');
    }, 350);
  };

  // Requirement 8: CTA Link validation errors for Hero Banner
  const heroPrimaryLinkError = useMemo(() => {
    if (currentSection.id !== 'hero_banner') return '';
    return validateCtaLink(currentSection.settings.ctaLink);
  }, [currentSection]);

  const heroSecondaryLinkError = useMemo(() => {
    if (currentSection.id !== 'hero_banner') return '';
    return validateCtaLink(currentSection.settings.secondaryCtaLink);
  }, [currentSection]);

  const announcementLinkError = useMemo(() => {
    if (currentSection.id !== 'announcement_bar') return '';
    return validateCtaLink(currentSection.settings.linkUrl);
  }, [currentSection]);

  return (
    <AdminLayout title="Store Customization">
      {/* ─── Top Control Header ───────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Storefront Layout & Visual Sections
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Control homepage section order, headlines, hero banners, and promotional copy
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Requirement 7: Last Saved Indicator for Order & Visibility */}
          {lastSavedOrderTime && (
            <span
              style={{
                fontSize: '0.78rem',
                color: '#16a34a',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f0fdf4',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #bbf7d0',
              }}
            >
              <CheckCircle2 size={13} color="#16a34a" />
              {formatRelativeTime(lastSavedOrderTime, clockTick)}
            </span>
          )}

          <Link
            to="/"
            target="_blank"
            className="admin-period-select-btn"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', textDecoration: 'none' }}
            title="Open customer storefront in a new tab"
          >
            <ExternalLink size={14} />
            <span>Preview Store</span>
          </Link>

          {/* Requirement 1: Renamed Button */}
          <Button
            onClick={handleSaveOrderAndVisibility}
            loading={isSavingOrder}
            style={{
              padding: '0.5rem 1.25rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
            }}
          >
            <Save size={15} />
            <span>Save Section Order & Visibility</span>
          </Button>
        </div>
      </div>

      {/* ─── Main Two-Column Layout ────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(310px, 390px) 1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ── Left Column: Section Reordering & Enable/Disable List ── */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.25rem' }}>
              Homepage Sections
            </h3>
            {/* Requirement 5: Reorder UX instruction */}
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Drag handle (<strong>⋮⋮</strong>) to reorder or focus row and press <strong>Alt+↑</strong> / <strong>Alt+↓</strong>.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {sections.map((section, index) => {
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
                  // Requirement 5: Accessible keyboard navigation
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
                    padding: '0.75rem 0.85rem',
                    borderRadius: '12px',
                    border: '1.5px solid',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: isDraggingThis ? 0.45 : 1,
                    background: isSelected ? '#ede8f8' : section.enabled ? '#ffffff' : '#f8fafc',
                    borderColor: isDragOverThis ? '#7c3aed' : isSelected ? '#7c3aed' : '#ede8f8',
                    boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.12)' : 'none',
                    outline: 'none',
                  }}
                  title="Click to edit section. Drag or press Alt+Up/Down to reorder."
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                    {/* Requirement 5: Single Drag Handle Icon (⋮⋮) */}
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

                    <div style={{ overflow: 'hidden' }}>
                      <strong
                        style={{
                          fontSize: '0.88rem',
                          color: section.enabled ? '#1e1b4b' : '#94a3b8',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}
                      >
                        {section.name}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {section.type}
                      </span>
                    </div>
                  </div>

                  {/* Requirement 6: Accessible Sliding Toggle Switch */}
                  <div style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
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

        {/* ── Right Column: Controlled Section Settings Form ── */}
        <div className="card" style={{ padding: '1.5rem' }}>
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                  {currentSection.name}
                </h3>
                <span
                  className={`adm-status-pill ${
                    currentSection.enabled ? 'adm-status-delivered' : 'adm-status-cancelled'
                  }`}
                  style={{ fontSize: '0.75rem' }}
                >
                  {currentSection.enabled ? '● Visible on Store' : '○ Section Hidden'}
                </span>

                {/* Requirement 1: Small "Unsaved changes" badge */}
                {hasCurrentSectionEdits && (
                  <span
                    style={{
                      background: '#fff7ed',
                      color: '#c2410c',
                      border: '1px solid #ffedd5',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }} />
                    Unsaved changes
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem', display: 'block' }}>
                {currentSection.description}
              </span>
            </div>

            {/* Quick Toggle in edit pane */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AccessibleToggleSwitch
                enabled={currentSection.enabled}
                onToggle={(e) => handleToggleEnable(currentSection.id, e)}
                label={`Toggle visibility of ${currentSection.name}`}
                id={`toggle-main-${currentSection.id}`}
              />
            </div>
          </div>

          {/* ── Form Controls Specialized by Section Type ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* 1. Announcement Bar Settings */}
            {currentSection.id === 'announcement_bar' && (
              <>
                <Input
                  label="Announcement Message"
                  value={currentSection.settings.text || ''}
                  onChange={(e) => handleUpdateSetting('text', e.target.value)}
                  placeholder="e.g. Free Shipping across Tamil Nadu on orders above ₹499"
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Action Button Label"
                    value={currentSection.settings.linkText || ''}
                    onChange={(e) => handleUpdateSetting('linkText', e.target.value)}
                    placeholder="e.g. Shop Sale"
                  />
                  <div>
                    <Input
                      label="Destination URL"
                      value={currentSection.settings.linkUrl || ''}
                      onChange={(e) => handleUpdateSetting('linkUrl', e.target.value)}
                      placeholder="e.g. /shop"
                      error={announcementLinkError}
                    />
                  </div>
                </div>
                <Input
                  label="Promotional Badge Text"
                  value={currentSection.settings.badge || ''}
                  onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                  placeholder="e.g. FESTIVE OFFER"
                />
              </>
            )}

            {/* 2. Hero Banner Settings */}
            {currentSection.id === 'hero_banner' && (
              <>
                {/* Headline Title with Requirement 4 Character Counter */}
                <div>
                  <Input
                    label="Headline Title"
                    value={currentSection.settings.headline || ''}
                    maxLength={80}
                    onChange={(e) => handleUpdateSetting('headline', e.target.value)}
                    placeholder="e.g. Authentic South Indian Elegance"
                  />
                  <CharacterCount current={currentSection.settings.headline} max={80} />
                </div>

                {/* Subheadline Description with Requirement 4 Character Counter */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                    Subheadline Description
                  </label>
                  <textarea
                    value={currentSection.settings.subheadline || ''}
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
                  <CharacterCount current={currentSection.settings.subheadline} max={200} />
                </div>

                {/* Primary CTA with Requirement 8 URL validation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Primary CTA Text"
                    value={currentSection.settings.ctaText || ''}
                    onChange={(e) => handleUpdateSetting('ctaText', e.target.value)}
                  />
                  <div>
                    <Input
                      label="Primary CTA Link"
                      value={currentSection.settings.ctaLink || ''}
                      onChange={(e) => handleUpdateSetting('ctaLink', e.target.value)}
                      error={heroPrimaryLinkError}
                      placeholder="/shop or https://..."
                    />
                  </div>
                </div>

                {/* Secondary CTA with Requirement 8 URL validation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Secondary CTA Text"
                    value={currentSection.settings.secondaryCtaText || ''}
                    onChange={(e) => handleUpdateSetting('secondaryCtaText', e.target.value)}
                  />
                  <div>
                    <Input
                      label="Secondary CTA Link"
                      value={currentSection.settings.secondaryCtaLink || ''}
                      onChange={(e) => handleUpdateSetting('secondaryCtaLink', e.target.value)}
                      error={heroSecondaryLinkError}
                      placeholder="/categories or https://..."
                    />
                  </div>
                </div>

                {/* Requirement 3: File Upload Area & Fallback URL with Preview & Validation */}
                <ImageUploadControl
                  label="Hero Banner Image"
                  value={currentSection.settings.imageUrl || ''}
                  onChange={(val) => handleUpdateSetting('imageUrl', val)}
                />
              </>
            )}

            {/* 3. Shop by Category Settings */}
            {currentSection.id === 'shop_by_category' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Grid Columns (Desktop)"
                    type="number"
                    min="2"
                    max="6"
                    value={currentSection.settings.columns || 5}
                    onChange={(e) => handleUpdateSetting('columns', Number(e.target.value))}
                  />
                  <Input
                    label="Max Visible Categories"
                    type="number"
                    min="3"
                    max="12"
                    value={currentSection.settings.maxItems || 10}
                    onChange={(e) => handleUpdateSetting('maxItems', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* 4. New Arrivals Settings */}
            {currentSection.id === 'new_arrivals' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Badge Text"
                    value={currentSection.settings.badge || ''}
                    onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                  />
                  <Input
                    label="Number of Items Displayed"
                    type="number"
                    min="4"
                    max="16"
                    value={currentSection.settings.limit || 8}
                    onChange={(e) => handleUpdateSetting('limit', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* 5. Best Sellers Settings */}
            {currentSection.id === 'best_sellers' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Badge Pill"
                    value={currentSection.settings.badge || ''}
                    onChange={(e) => handleUpdateSetting('badge', e.target.value)}
                  />
                  <Input
                    label="Limit"
                    type="number"
                    min="4"
                    max="16"
                    value={currentSection.settings.limit || 8}
                    onChange={(e) => handleUpdateSetting('limit', Number(e.target.value))}
                  />
                </div>
              </>
            )}

            {/* 6. Special Offers Settings */}
            {currentSection.id === 'special_offers' && (
              <>
                <Input
                  label="Offer Headline"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                    Banner Promotional Text
                  </label>
                  <textarea
                    value={currentSection.settings.bannerText || ''}
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
                    value={currentSection.settings.couponCode || ''}
                    onChange={(e) => handleUpdateSetting('couponCode', e.target.value)}
                  />
                  <Input
                    label="CTA Button Label"
                    value={currentSection.settings.ctaText || ''}
                    onChange={(e) => handleUpdateSetting('ctaText', e.target.value)}
                  />
                </div>
                <ImageUploadControl
                  label="Offer Background Image"
                  value={currentSection.settings.imageUrl || ''}
                  onChange={(val) => handleUpdateSetting('imageUrl', val)}
                />
              </>
            )}

            {/* 7. Featured Products Settings */}
            {currentSection.id === 'featured_products' && (
              <>
                <Input
                  label="Section Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Section Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />
                <Input
                  label="Product Limit"
                  type="number"
                  min="2"
                  max="12"
                  value={currentSection.settings.limit || 6}
                  onChange={(e) => handleUpdateSetting('limit', Number(e.target.value))}
                />
              </>
            )}

            {/* 8. Why Picky Settings */}
            {currentSection.id === 'why_picky' && (
              <>
                <Input
                  label="Heading Title"
                  value={currentSection.settings.title || ''}
                  onChange={(e) => handleUpdateSetting('title', e.target.value)}
                />
                <Input
                  label="Subtitle"
                  value={currentSection.settings.subtitle || ''}
                  onChange={(e) => handleUpdateSetting('subtitle', e.target.value)}
                />

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.5rem' }}>
                    Trust Proposition Features (4 Pillars)
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(currentSection.settings.features || []).map((feat, idx) => (
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

            {/* 9. Footer Settings */}
            {currentSection.id === 'footer_config' && (
              <>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                    About Storefront Blurb
                  </label>
                  <textarea
                    value={currentSection.settings.aboutText || ''}
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
                    value={currentSection.settings.newsletterTitle || ''}
                    onChange={(e) => handleUpdateSetting('newsletterTitle', e.target.value)}
                  />
                  <Input
                    label="Support Phone"
                    value={currentSection.settings.whatsapp || ''}
                    onChange={(e) => handleUpdateSetting('whatsapp', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Support Email"
                    value={currentSection.settings.supportEmail || ''}
                    onChange={(e) => handleUpdateSetting('supportEmail', e.target.value)}
                  />
                  <Input
                    label="Instagram URL"
                    value={currentSection.settings.instagram || ''}
                    onChange={(e) => handleUpdateSetting('instagram', e.target.value)}
                  />
                </div>

                <Input
                  label="Copyright Notice"
                  value={currentSection.settings.copyrightText || ''}
                  onChange={(e) => handleUpdateSetting('copyrightText', e.target.value)}
                />
              </>
            )}

            {/* Requirement 1: Section-level Save Button (Disabled until fields change) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: '1rem',
                gap: '0.75rem',
              }}
            >
              {/* Requirement 7: Last Saved Indicator for this section */}
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
                }}
              >
                Save Changes to {currentSection.name}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Requirement 2: Unsaved Changes Confirmation Modal ─────────────── */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Unsaved Changes"
      >
        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ color: '#334155', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            You have unsaved changes. Discard them?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setPendingSectionId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626' }}
              onClick={handleConfirmDiscard}
            >
              Discard
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
