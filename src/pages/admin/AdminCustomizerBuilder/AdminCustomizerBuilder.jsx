import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Type,
  Image as ImageIcon,
  Palette,
  CheckCircle2,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  ExternalLink,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Scissors,
  Check,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Sliders,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Spinner from '../../../components/ui/Spinner';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import styles from './AdminCustomizerBuilder.module.css';

// Default Sections matching the storefront customizer
export const DEFAULT_CUSTOMIZER_SECTIONS = [
  {
    id: 'front',
    title: 'Front',
    subtitle: 'Customize text, typography style, and upload front graphics/artwork.',
    badgeText: 'Step 1 of 3',
    enabled: true,
    isCore: true,
    textField: {
      enabled: true,
      label: 'FRONT CUSTOM TEXT',
      placeholder: 'Enter custom text for front side (e.g. Brand Name, Quote, Monogram)...',
      maxChars: 40,
    },
    fontStyle: {
      enabled: true,
      label: 'FONT STYLE',
      directFonts: [
        { id: 'sans', name: 'Modern Sans', fontFamily: 'system-ui, -apple-system, sans-serif', sample: 'Aa Bb 123' },
        { id: 'serif', name: 'Elegant Serif', fontFamily: 'Georgia, serif', sample: 'Aa Bb 123' },
        { id: 'script', name: 'Script Style', fontFamily: '"Brush Script MT", cursive, sans-serif', sample: 'Aa Bb 123' },
      ],
      dropdownFonts: [
        { id: 'bold', name: 'Bold Athletic', fontFamily: '"Impact", "Arial Black", sans-serif', sample: 'AA BB 123' },
        { id: 'mono', name: 'Cyber Mono', fontFamily: '"Courier New", monospace', sample: 'Aa Bb 123' },
        { id: 'gothic', name: 'Vintage Gothic', fontFamily: '"Cinzel", "Times New Roman", serif', sample: 'Aa Bb 123' },
        { id: 'casual', name: 'Playful Casual', fontFamily: '"Comic Sans MS", "Caveat", cursive', sample: 'Aa Bb 123' },
        { id: 'deco', name: 'Minimal Deco', fontFamily: '"Trebuchet MS", "Century Gothic", sans-serif', sample: 'Aa Bb 123' },
        { id: 'roman', name: 'Classic Roman', fontFamily: '"Palatino", "Book Antiqua", serif', sample: 'Aa Bb 123' },
        { id: 'display', name: 'Neon Display', fontFamily: '"Copperplate", "Arial", sans-serif', sample: 'Aa Bb 123' },
      ],
    },
    images: {
      enabled: true,
      label: 'FRONT IMAGES / ARTWORKS (UPLOAD UP TO 4)',
      maxImages: 4,
    },
    materials: {
      enabled: false,
      label: 'MATERIAL / FABRIC TYPE',
      options: [],
    },
    sizes: {
      enabled: false,
      label: 'SIZE',
      options: [],
    },
    colors: {
      enabled: false,
      label: 'COLOR',
      allowCustomColorPicker: false,
      defaultPalette: [],
    },
    mockups: {
      enabled: false,
      frontMockupLabel: 'Front Example Image',
      backMockupLabel: 'Back Example Image',
    },
  },
  {
    id: 'backside',
    title: 'Backside',
    subtitle: 'Customize back text, typography style, and upload backside graphics/artwork.',
    badgeText: 'Step 2 of 3',
    enabled: true,
    isCore: true,
    textField: {
      enabled: true,
      label: 'BACKSIDE CUSTOM TEXT',
      placeholder: 'Enter custom text for back side (e.g. Jersey Name, Large Statement)...',
      maxChars: 40,
    },
    fontStyle: {
      enabled: true,
      label: 'FONT STYLE',
      directFonts: [
        { id: 'sans', name: 'Modern Sans', fontFamily: 'system-ui, -apple-system, sans-serif', sample: 'Aa Bb 123' },
        { id: 'serif', name: 'Elegant Serif', fontFamily: 'Georgia, serif', sample: 'Aa Bb 123' },
        { id: 'script', name: 'Script Style', fontFamily: '"Brush Script MT", cursive, sans-serif', sample: 'Aa Bb 123' },
      ],
      dropdownFonts: [
        { id: 'bold', name: 'Bold Athletic', fontFamily: '"Impact", "Arial Black", sans-serif', sample: 'AA BB 123' },
        { id: 'mono', name: 'Cyber Mono', fontFamily: '"Courier New", monospace', sample: 'Aa Bb 123' },
        { id: 'gothic', name: 'Vintage Gothic', fontFamily: '"Cinzel", "Times New Roman", serif', sample: 'Aa Bb 123' },
        { id: 'casual', name: 'Playful Casual', fontFamily: '"Comic Sans MS", "Caveat", cursive', sample: 'Aa Bb 123' },
        { id: 'deco', name: 'Minimal Deco', fontFamily: '"Trebuchet MS", "Century Gothic", sans-serif', sample: 'Aa Bb 123' },
        { id: 'roman', name: 'Classic Roman', fontFamily: '"Palatino", "Book Antiqua", serif', sample: 'Aa Bb 123' },
        { id: 'display', name: 'Neon Display', fontFamily: '"Copperplate", "Arial", sans-serif', sample: 'Aa Bb 123' },
      ],
    },
    images: {
      enabled: true,
      label: 'BACKSIDE IMAGES / ARTWORKS (UPLOAD UP TO 4)',
      maxImages: 4,
    },
    materials: {
      enabled: false,
      label: 'MATERIAL / FABRIC TYPE',
      options: [],
    },
    sizes: {
      enabled: false,
      label: 'SIZE',
      options: [],
    },
    colors: {
      enabled: false,
      label: 'COLOR',
      allowCustomColorPicker: false,
      defaultPalette: [],
    },
    mockups: {
      enabled: false,
      frontMockupLabel: 'Front Example Image',
      backMockupLabel: 'Back Example Image',
    },
  },
  {
    id: 'general',
    title: 'General',
    subtitle: 'Choose material/fabric type, garment size, bespoke color, and example mockups.',
    badgeText: 'Step 3 of 3',
    enabled: true,
    isCore: true,
    textField: {
      enabled: false,
      label: 'SPECIAL INSTRUCTIONS / NOTES',
      placeholder: 'Enter any additional tailored production instructions...',
      maxChars: 120,
    },
    fontStyle: {
      enabled: false,
      label: 'FONT STYLE',
      directFonts: [],
      dropdownFonts: [],
    },
    images: {
      enabled: false,
      label: 'ADDITIONAL ARTWORKS',
      maxImages: 2,
    },
    materials: {
      enabled: true,
      label: 'MATERIAL / FABRIC TYPE',
      options: [
        '100% Bio-Wash Combed Cotton',
        'Heavyweight French Terry Fleece',
        'Premium Poly-Cotton Blend (Breathable)',
        'Pure Khadi Handloom Linen',
        'Organic Bamboo Cotton',
      ],
    },
    sizes: {
      enabled: true,
      label: 'SIZE',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    },
    colors: {
      enabled: true,
      label: 'COLOR',
      allowCustomColorPicker: true,
      defaultPalette: [
        { id: 'black', name: 'Jet Black', hex: '#111827', textColor: '#ffffff' },
        { id: 'white', name: 'Pure White', hex: '#ffffff', textColor: '#0f172a' },
        { id: 'navy', name: 'Navy Blue', hex: '#1e3a8a', textColor: '#ffffff' },
        { id: 'red', name: 'Crimson Red', hex: '#dc2626', textColor: '#ffffff' },
        { id: 'olive', name: 'Olive Green', hex: '#3f6212', textColor: '#ffffff' },
      ],
    },
    mockups: {
      enabled: true,
      frontMockupLabel: 'Front Example Image',
      backMockupLabel: 'Back Example Image',
    },
  },
];

export const DEFAULT_CUSTOMIZER_FORM_CONFIG = {
  enabled: true,
  sections: DEFAULT_CUSTOMIZER_SECTIONS,
  // Backward compatibility aliases
  front: DEFAULT_CUSTOMIZER_SECTIONS[0],
  backside: DEFAULT_CUSTOMIZER_SECTIONS[1],
  general: DEFAULT_CUSTOMIZER_SECTIONS[2],
};

export default function AdminCustomizerBuilder() {
  const { showToast } = useUiStore();
  const [config, setConfig] = useState(DEFAULT_CUSTOMIZER_FORM_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('front'); // section.id | 'preview'

  // Modal State for Adding New Section
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionSubtitle, setNewSectionSubtitle] = useState('');
  const [newSectionTemplate, setNewSectionTemplate] = useState('visual'); // 'visual' | 'specs' | 'text' | 'full'

  // Temporary inputs for adding items into active section
  const [newMaterial, setNewMaterial] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#8b5cf6');
  const [newFontName, setNewFontName] = useState('');
  const [newFontFamily, setNewFontFamily] = useState('');
  const [newFontType, setNewFontType] = useState('direct'); // 'direct' | 'dropdown'

  // Simulation State for Live Preview Tab
  const [simActiveStepId, setSimActiveStepId] = useState('front');
  const [simText, setSimText] = useState('');
  const [simSelectedFont, setSimSelectedFont] = useState(null);
  const [simSelectedColor, setSimSelectedColor] = useState(null);
  const [simSelectedSize, setSimSelectedSize] = useState('');
  const [simSelectedMaterial, setSimSelectedMaterial] = useState('');

  // Helper to normalize config sections array
  const normalizeSections = (rawConfig) => {
    if (Array.isArray(rawConfig?.sections) && rawConfig.sections.length > 0) {
      return rawConfig.sections;
    }
    // Convert legacy { front, backside, general } structure into sections array
    const secs = [];
    if (rawConfig?.front) secs.push({ ...rawConfig.front, id: 'front', isCore: true });
    if (rawConfig?.backside) secs.push({ ...rawConfig.backside, id: 'backside', isCore: true });
    if (rawConfig?.general) secs.push({ ...rawConfig.general, id: 'general', isCore: true });
    return secs.length > 0 ? secs : DEFAULT_CUSTOMIZER_SECTIONS;
  };

  // Load from DB settings
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await adminService.getSettings();
        const settings = res?.data?.data || res?.data || {};
        if (settings.customizerForm && typeof settings.customizerForm === 'object') {
          const raw = settings.customizerForm;
          const secs = normalizeSections(raw);
          setConfig({
            enabled: raw.enabled !== false,
            sections: secs,
            front: secs.find((s) => s.id === 'front') || DEFAULT_CUSTOMIZER_SECTIONS[0],
            backside: secs.find((s) => s.id === 'backside') || DEFAULT_CUSTOMIZER_SECTIONS[1],
            general: secs.find((s) => s.id === 'general') || DEFAULT_CUSTOMIZER_SECTIONS[2],
          });
        }
      } catch (err) {
        console.warn('Using default customizer settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  // Active Section Helper
  const currentSections = config.sections || DEFAULT_CUSTOMIZER_SECTIONS;
  const activeSection = currentSections.find((s) => s.id === activeTab) || currentSections[0];
  const activeSectionIndex = currentSections.findIndex((s) => s.id === activeSection?.id);

  // Update a single section
  const updateActiveSection = (updater) => {
    if (!activeSection) return;
    const updatedSections = currentSections.map((sec) => {
      if (sec.id === activeSection.id) {
        return typeof updater === 'function' ? updater(sec) : { ...sec, ...updater };
      }
      return sec;
    });

    setConfig({
      ...config,
      sections: updatedSections,
      front: updatedSections.find((s) => s.id === 'front') || config.front,
      backside: updatedSections.find((s) => s.id === 'backside') || config.backside,
      general: updatedSections.find((s) => s.id === 'general') || config.general,
    });
  };

  // ── Section Actions: Add, Delete, Reorder ──

  // 1. Add New Section
  const handleOpenAddSectionModal = () => {
    setNewSectionTitle('');
    setNewSectionSubtitle('');
    setNewSectionTemplate('visual');
    setShowAddSectionModal(true);
  };

  const handleCreateSection = (e) => {
    e.preventDefault();
    const title = newSectionTitle.trim();
    if (!title) {
      showToast('Please enter a section name/title', 'warning');
      return;
    }

    const secId = `sec_${Date.now()}`;
    const nextStepNum = currentSections.length + 1;

    let baseFields = {
      textField: {
        enabled: newSectionTemplate === 'visual' || newSectionTemplate === 'text' || newSectionTemplate === 'full',
        label: `${title.toUpperCase()} TEXT`,
        placeholder: `Enter custom text for ${title.toLowerCase()}...`,
        maxChars: 40,
      },
      fontStyle: {
        enabled: newSectionTemplate === 'visual' || newSectionTemplate === 'full',
        label: 'FONT STYLE',
        directFonts: DEFAULT_CUSTOMIZER_SECTIONS[0].fontStyle.directFonts,
        dropdownFonts: DEFAULT_CUSTOMIZER_SECTIONS[0].fontStyle.dropdownFonts,
      },
      images: {
        enabled: newSectionTemplate === 'visual' || newSectionTemplate === 'full',
        label: `${title.toUpperCase()} IMAGES / ARTWORKS (UPLOAD UP TO 4)`,
        maxImages: 4,
      },
      materials: {
        enabled: newSectionTemplate === 'specs' || newSectionTemplate === 'full',
        label: 'OPTIONS / SPECIFICATION',
        options: ['Standard Option A', 'Premium Option B', 'Deluxe Option C'],
      },
      sizes: {
        enabled: newSectionTemplate === 'specs' || newSectionTemplate === 'full',
        label: 'SIZE',
        options: ['XS', 'S', 'M', 'L', 'XL'],
      },
      colors: {
        enabled: newSectionTemplate === 'specs' || newSectionTemplate === 'full',
        label: 'COLOR',
        allowCustomColorPicker: true,
        defaultPalette: DEFAULT_CUSTOMIZER_SECTIONS[2].colors.defaultPalette,
      },
      mockups: {
        enabled: newSectionTemplate === 'full',
        frontMockupLabel: `${title} Example Image`,
        backMockupLabel: `Alternate Example Image`,
      },
    };

    const newSection = {
      id: secId,
      title,
      subtitle: newSectionSubtitle.trim() || `Tailor your ${title.toLowerCase()} specifications.`,
      badgeText: `Step ${nextStepNum}`,
      enabled: true,
      isCore: false,
      ...baseFields,
    };

    const updatedSections = [...currentSections, newSection];
    setConfig({
      ...config,
      sections: updatedSections,
    });

    setActiveTab(secId);
    setShowAddSectionModal(false);
    showToast(`New section "${title}" added successfully!`, 'success');
  };

  // 2. Delete Section
  const handleDeleteSection = (secId) => {
    const secToDelete = currentSections.find((s) => s.id === secId);
    if (!secToDelete) return;
    if (currentSections.length <= 1) {
      showToast('Cannot delete the only remaining section.', 'warning');
      return;
    }

    if (window.confirm(`Are you sure you want to permanently delete section "${secToDelete.title}"?`)) {
      const remaining = currentSections.filter((s) => s.id !== secId);
      setConfig({
        ...config,
        sections: remaining,
        front: remaining.find((s) => s.id === 'front') || null,
        backside: remaining.find((s) => s.id === 'backside') || null,
        general: remaining.find((s) => s.id === 'general') || null,
      });
      if (activeTab === secId) {
        setActiveTab(remaining[0].id);
      }
      showToast(`Section "${secToDelete.title}" deleted.`, 'info');
    }
  };

  // 3. Move Section Order (Reorder)
  const handleMoveSection = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= currentSections.length) return;

    const reordered = [...currentSections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Update step badges
    const updated = reordered.map((s, idx) => ({
      ...s,
      badgeText: s.badgeText?.startsWith('Step') ? `Step ${idx + 1}` : s.badgeText,
    }));

    setConfig({
      ...config,
      sections: updated,
    });
    showToast('Section order reordered!', 'info');
  };

  // ── Save Config to MongoDB ──
  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        enabled: config.enabled !== false,
        sections: currentSections,
        front: currentSections.find((s) => s.id === 'front') || currentSections[0],
        backside: currentSections.find((s) => s.id === 'backside') || currentSections[1],
        general: currentSections.find((s) => s.id === 'general') || currentSections[2],
      };
      await adminService.updateSettings({ customizerForm: payload });
      showToast('Customizer form settings saved successfully to database!', 'success');
    } catch (err) {
      console.error('Save customizer settings error:', err);
      showToast(err?.response?.data?.message || 'Failed to save customizer settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all customizer form sections and fields back to factory defaults?')) {
      setConfig(DEFAULT_CUSTOMIZER_FORM_CONFIG);
      setActiveTab('front');
      showToast('Reset to defaults. Remember to click "Save Changes" to persist.', 'info');
    }
  };

  // ── Handlers for active section's nested elements ──

  // Add / Remove Font
  const handleAddFont = (e) => {
    e.preventDefault();
    if (!newFontName.trim()) {
      showToast('Please enter a font name', 'warning');
      return;
    }
    const fontId = newFontName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newFontObj = {
      id: fontId,
      name: newFontName.trim(),
      fontFamily: newFontFamily.trim() || 'inherit',
      sample: 'Aa Bb 123',
    };

    updateActiveSection((sec) => {
      const fs = sec.fontStyle || { directFonts: [], dropdownFonts: [] };
      if (newFontType === 'direct') {
        return {
          ...sec,
          fontStyle: { ...fs, directFonts: [...(fs.directFonts || []), newFontObj] },
        };
      } else {
        return {
          ...sec,
          fontStyle: { ...fs, dropdownFonts: [...(fs.dropdownFonts || []), newFontObj] },
        };
      }
    });

    setNewFontName('');
    setNewFontFamily('');
    showToast(`Added font "${newFontName}" to ${activeSection.title}`, 'success');
  };

  const handleRemoveFont = (type, fontId) => {
    updateActiveSection((sec) => {
      const fs = sec.fontStyle || {};
      if (type === 'direct') {
        return {
          ...sec,
          fontStyle: { ...fs, directFonts: (fs.directFonts || []).filter((f) => f.id !== fontId) },
        };
      } else {
        return {
          ...sec,
          fontStyle: { ...fs, dropdownFonts: (fs.dropdownFonts || []).filter((f) => f.id !== fontId) },
        };
      }
    });
  };

  // Add / Remove Material / Options
  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!newMaterial.trim()) return;
    const current = activeSection.materials?.options || [];
    if (current.includes(newMaterial.trim())) {
      showToast('Option already exists', 'warning');
      return;
    }
    updateActiveSection((sec) => ({
      ...sec,
      materials: {
        ...(sec.materials || {}),
        options: [...current, newMaterial.trim()],
      },
    }));
    setNewMaterial('');
  };

  const handleRemoveMaterial = (idx) => {
    updateActiveSection((sec) => ({
      ...sec,
      materials: {
        ...(sec.materials || {}),
        options: (sec.materials?.options || []).filter((_, i) => i !== idx),
      },
    }));
  };

  // Add / Remove Size
  const handleAddSize = (e) => {
    e.preventDefault();
    if (!newSize.trim()) return;
    const current = activeSection.sizes?.options || [];
    if (current.includes(newSize.trim())) {
      showToast('Size already exists', 'warning');
      return;
    }
    updateActiveSection((sec) => ({
      ...sec,
      sizes: {
        ...(sec.sizes || {}),
        options: [...current, newSize.trim()],
      },
    }));
    setNewSize('');
  };

  const handleRemoveSize = (idx) => {
    updateActiveSection((sec) => ({
      ...sec,
      sizes: {
        ...(sec.sizes || {}),
        options: (sec.sizes?.options || []).filter((_, i) => i !== idx),
      },
    }));
  };

  // Add / Remove Color
  const handleAddColor = (e) => {
    e.preventDefault();
    if (!newColorName.trim()) {
      showToast('Please enter a color name', 'warning');
      return;
    }
    const colorId = newColorName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newColorObj = {
      id: colorId,
      name: newColorName.trim(),
      hex: newColorHex,
      textColor: '#ffffff',
    };
    const current = activeSection.colors?.defaultPalette || [];
    updateActiveSection((sec) => ({
      ...sec,
      colors: {
        ...(sec.colors || {}),
        defaultPalette: [...current, newColorObj],
      },
    }));
    setNewColorName('');
    showToast(`Added color "${newColorName}"`, 'success');
  };

  const handleRemoveColor = (colorId) => {
    updateActiveSection((sec) => ({
      ...sec,
      colors: {
        ...(sec.colors || {}),
        defaultPalette: (sec.colors?.defaultPalette || []).filter((c) => c.id !== colorId),
      },
    }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
          <Spinner size="lg" />
          <p style={{ color: '#64748b', fontWeight: 600 }}>Loading Customizer Form Settings...</p>
        </div>
      </AdminLayout>
    );
  }

  const enabledSections = currentSections.filter((s) => s.enabled !== false);
  const activeSimSection = enabledSections.find((s) => s.id === simActiveStepId) || enabledSections[0];

  return (
    <AdminLayout>
      <div className={styles.pageContainer}>
        {/* ── 1. Top Bar / Breadcrumb & Primary Actions ── */}
        <div className={styles.headerCard}>
          <div className={styles.headerInfo}>
            <h1>
              <SlidersHorizontal size={24} color="#0284c7" />
              Customizer Form Builder
            </h1>
            <p>
              Create, reorder, and configure customizer sections, typography styles, materials, and input fields.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleResetDefaults}
              title="Reset all settings to initial defaults"
            >
              <RotateCcw size={16} />
              Reset Defaults
            </button>

            <Link
              to="/products/kirish/customize"
              target="_blank"
              rel="noreferrer"
              className={styles.btnSecondary}
              title="Open customer customization page in new tab"
            >
              <ExternalLink size={16} />
              Preview Storefront
            </Link>

            <button
              type="button"
              className={styles.btnAddSectionTab}
              onClick={handleOpenAddSectionModal}
              style={{ background: '#0284c7', color: '#ffffff', border: 'none', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' }}
            >
              <Plus size={16} />
              Add New Section
            </button>

            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving to Database...' : 'Save All Changes'}
            </button>
          </div>
        </div>

        {/* ── 2. Sections Tab Navigation + '+ Add Section' Button ── */}
        <div className={styles.sectionTabs}>
          {currentSections.map((sec, idx) => {
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                className={`${styles.sectionTabBtn} ${isActive ? styles.sectionTabActive : ''}`}
                onClick={() => setActiveTab(sec.id)}
              >
                <span>{sec.badgeText || `Step ${idx + 1}`}: {sec.title}</span>
                <span
                  className={styles.previewPill}
                  style={{
                    background: sec.enabled !== false ? '#dcfce7' : '#f1f5f9',
                    color: sec.enabled !== false ? '#15803d' : '#94a3b8',
                  }}
                >
                  {sec.enabled !== false ? 'Active' : 'Disabled'}
                </span>
              </button>
            );
          })}

          {/* Quick Add Section Tab Button */}
          <button
            type="button"
            className={styles.btnAddSectionTab}
            onClick={handleOpenAddSectionModal}
            title="Create a new customization step/section"
          >
            <Plus size={15} />
            <span>Add Section</span>
          </button>

          {/* Live Preview Tab */}
          <button
            type="button"
            className={`${styles.sectionTabBtn} ${activeTab === 'preview' ? styles.sectionTabActive : ''}`}
            onClick={() => {
              setActiveTab('preview');
              if (enabledSections.length > 0) {
                setSimActiveStepId(enabledSections[0].id);
              }
            }}
            style={{ marginLeft: 'auto' }}
          >
            <Eye size={16} />
            <span>Live Interactive Preview</span>
          </button>
        </div>

        {/* ── 3. Main Builder Grid (Section Controls + Sidebar Summary) ── */}
        <div className={styles.builderGrid}>
          {/* ── Column A: Section Configuration (or Preview) ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* If NOT Preview: Render Active Section Configuration */}
            {activeTab !== 'preview' && activeSection && (
              <div className={styles.sectionCard}>
                {/* Section Header with Reorder, Toggle & Delete Actions */}
                <div className={styles.sectionCardHeader}>
                  <div className={styles.sectionTitleWrap}>
                    <span className={styles.sectionBadge}>
                      {activeSection.badgeText || `Step ${activeSectionIndex + 1}`}
                    </span>
                    <h2>{activeSection.title} Section Settings</h2>
                  </div>

                  <div className={styles.sectionHeaderActions}>
                    {/* Reorder Left */}
                    <button
                      type="button"
                      className={styles.btnIconAction}
                      disabled={activeSectionIndex <= 0}
                      onClick={() => handleMoveSection(activeSectionIndex, -1)}
                      title="Move Section Earlier in Stepper"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {/* Reorder Right */}
                    <button
                      type="button"
                      className={styles.btnIconAction}
                      disabled={activeSectionIndex >= currentSections.length - 1}
                      onClick={() => handleMoveSection(activeSectionIndex, 1)}
                      title="Move Section Later in Stepper"
                    >
                      <ChevronRight size={18} />
                    </button>

                    {/* Enable / Disable Toggle Switch */}
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          enabled: sec.enabled === false ? true : false,
                        }))
                      }
                      title="Toggle section enabled on customer storefront"
                    >
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: activeSection.enabled !== false ? '#0369a1' : '#64748b' }}>
                        {activeSection.enabled !== false ? 'Section Active' : 'Section Disabled'}
                      </span>
                      <div className={styles.toggleSwitch} style={{ background: activeSection.enabled !== false ? '#0284c7' : '#cbd5e1' }}>
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.enabled !== false ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>

                    {/* Delete Section Button */}
                    <button
                      type="button"
                      className={styles.btnDeleteSection}
                      onClick={() => handleDeleteSection(activeSection.id)}
                      title="Permanently remove this customization section"
                    >
                      <Trash2 size={14} />
                      Delete Section
                    </button>
                  </div>
                </div>

                {/* Section Meta Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.fieldInputRow}>
                    <label className={styles.fieldLabel}>Section Title</label>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={activeSection.title || ''}
                      onChange={(e) => updateActiveSection({ title: e.target.value })}
                      placeholder="e.g. Front, Sleeves, Packaging..."
                    />
                  </div>
                  <div className={styles.fieldInputRow}>
                    <label className={styles.fieldLabel}>Step Badge Text</label>
                    <input
                      type="text"
                      className={styles.textInput}
                      value={activeSection.badgeText || ''}
                      onChange={(e) => updateActiveSection({ badgeText: e.target.value })}
                      placeholder={`e.g. Step ${activeSectionIndex + 1}`}
                    />
                  </div>
                </div>

                <div className={styles.fieldInputRow}>
                  <label className={styles.fieldLabel}>Section Subtitle / Customer Instructions</label>
                  <input
                    type="text"
                    className={styles.textInput}
                    value={activeSection.subtitle || ''}
                    onChange={(e) => updateActiveSection({ subtitle: e.target.value })}
                    placeholder="Short description guiding the customer on this step..."
                  />
                </div>

                {/* ══════════════════════════════════════════════════
                    FIELD 1: CUSTOM TEXT INPUT
                ══════════════════════════════════════════════════ */}
                <div className={styles.fieldBox}>
                  <div className={styles.fieldBoxHeader}>
                    <span className={styles.fieldBoxTitle}>
                      <Type size={18} color="#0284c7" />
                      Custom Text Field
                    </span>
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          textField: {
                            ...(sec.textField || {}),
                            enabled: sec.textField?.enabled === false ? true : false,
                          },
                        }))
                      }
                    >
                      <div
                        className={styles.toggleSwitch}
                        style={{ background: activeSection.textField?.enabled !== false ? '#0284c7' : '#cbd5e1' }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.textField?.enabled !== false ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>
                  </div>

                  {activeSection.textField?.enabled !== false && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.fieldInputRow}>
                          <label className={styles.fieldLabel}>Field Label</label>
                          <input
                            type="text"
                            className={styles.textInput}
                            value={activeSection.textField?.label || ''}
                            onChange={(e) =>
                              updateActiveSection((sec) => ({
                                ...sec,
                                textField: { ...(sec.textField || {}), label: e.target.value },
                              }))
                            }
                          />
                        </div>
                        <div className={styles.fieldInputRow}>
                          <label className={styles.fieldLabel}>Max Character Limit</label>
                          <input
                            type="number"
                            className={styles.textInput}
                            value={activeSection.textField?.maxChars || 40}
                            onChange={(e) =>
                              updateActiveSection((sec) => ({
                                ...sec,
                                textField: { ...(sec.textField || {}), maxChars: parseInt(e.target.value, 10) || 40 },
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Placeholder Text</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={activeSection.textField?.placeholder || ''}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              textField: { ...(sec.textField || {}), placeholder: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ══════════════════════════════════════════════════
                    FIELD 2: TYPOGRAPHY / FONT OPTIONS
                ══════════════════════════════════════════════════ */}
                <div className={styles.fieldBox}>
                  <div className={styles.fieldBoxHeader}>
                    <span className={styles.fieldBoxTitle}>
                      <Sparkles size={18} color="#0284c7" />
                      Typography Font Options
                    </span>
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          fontStyle: {
                            ...(sec.fontStyle || {}),
                            enabled: sec.fontStyle?.enabled === false ? true : false,
                          },
                        }))
                      }
                    >
                      <div
                        className={styles.toggleSwitch}
                        style={{ background: activeSection.fontStyle?.enabled !== false ? '#0284c7' : '#cbd5e1' }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.fontStyle?.enabled !== false ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>
                  </div>

                  {activeSection.fontStyle?.enabled !== false && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Font Section Label</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={activeSection.fontStyle?.label || 'FONT STYLE'}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              fontStyle: { ...(sec.fontStyle || {}), label: e.target.value },
                            }))
                          }
                        />
                      </div>

                      {/* Direct Font Cards */}
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                          Direct Selection Fonts (Display Cards)
                        </span>
                        <div className={styles.itemsList}>
                          {(activeSection.fontStyle?.directFonts || []).map((f) => (
                            <div key={f.id} className={styles.itemRow}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <strong style={{ fontSize: '0.9rem' }}>{f.name}</strong>
                                <span style={{ fontFamily: f.fontFamily, fontSize: '0.85rem', color: '#64748b' }}>{f.sample || 'Aa Bb 123'}</span>
                              </div>
                              <button
                                type="button"
                                className={styles.btnItemDelete}
                                onClick={() => handleRemoveFont('direct', f.id)}
                                title="Remove Font"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dropdown Fonts */}
                      <div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                          Dropdown Menu Fonts ("More Fonts")
                        </span>
                        <div className={styles.itemsList}>
                          {(activeSection.fontStyle?.dropdownFonts || []).map((f) => (
                            <div key={f.id} className={styles.itemRow}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <strong style={{ fontSize: '0.9rem' }}>{f.name}</strong>
                                <span style={{ fontFamily: f.fontFamily, fontSize: '0.82rem', color: '#64748b' }}>{f.fontFamily}</span>
                              </div>
                              <button
                                type="button"
                                className={styles.btnItemDelete}
                                onClick={() => handleRemoveFont('dropdown', f.id)}
                                title="Remove Font"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add Font Form */}
                      <form onSubmit={handleAddFont} className={styles.addItemForm}>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="Font Name (e.g. Calligraphy Script)"
                          value={newFontName}
                          onChange={(e) => setNewFontName(e.target.value)}
                        />
                        <select
                          className={styles.textInput}
                          value={newFontType}
                          onChange={(e) => setNewFontType(e.target.value)}
                          style={{ width: '130px' }}
                        >
                          <option value="direct">Direct Card</option>
                          <option value="dropdown">Dropdown</option>
                        </select>
                        <button type="submit" className={styles.btnPrimary} style={{ padding: '0.55rem 1rem' }}>
                          Add Font
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* ══════════════════════════════════════════════════
                    FIELD 3: IMAGE / ARTWORK UPLOADS
                ══════════════════════════════════════════════════ */}
                <div className={styles.fieldBox}>
                  <div className={styles.fieldBoxHeader}>
                    <span className={styles.fieldBoxTitle}>
                      <ImageIcon size={18} color="#0284c7" />
                      Image / Artwork Uploads
                    </span>
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          images: {
                            ...(sec.images || {}),
                            enabled: sec.images?.enabled === false ? true : false,
                          },
                        }))
                      }
                    >
                      <div
                        className={styles.toggleSwitch}
                        style={{ background: activeSection.images?.enabled !== false ? '#0284c7' : '#cbd5e1' }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.images?.enabled !== false ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>
                  </div>

                  {activeSection.images?.enabled !== false && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Upload Section Label</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={activeSection.images?.label || ''}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              images: { ...(sec.images || {}), label: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Max Images Allowed (1-8)</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          className={styles.textInput}
                          value={activeSection.images?.maxImages || 4}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              images: { ...(sec.images || {}), maxImages: Math.min(8, Math.max(1, parseInt(e.target.value, 10) || 4)) },
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ══════════════════════════════════════════════════
                    FIELD 4: MATERIALS / FABRIC TYPES
                ══════════════════════════════════════════════════ */}
                <div className={styles.fieldBox}>
                  <div className={styles.fieldBoxHeader}>
                    <span className={styles.fieldBoxTitle}>
                      <Scissors size={18} color="#0284c7" />
                      Material / Fabric Options
                    </span>
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          materials: {
                            ...(sec.materials || {}),
                            enabled: sec.materials?.enabled ? false : true,
                          },
                        }))
                      }
                    >
                      <div
                        className={styles.toggleSwitch}
                        style={{ background: activeSection.materials?.enabled ? '#0284c7' : '#cbd5e1' }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.materials?.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>
                  </div>

                  {activeSection.materials?.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Section Label</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={activeSection.materials?.label || 'MATERIAL / FABRIC TYPE'}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              materials: { ...(sec.materials || {}), label: e.target.value },
                            }))
                          }
                        />
                      </div>

                      <div className={styles.itemsList}>
                        {(activeSection.materials?.options || []).map((mat, idx) => (
                          <div key={idx} className={styles.itemRow}>
                            <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{mat}</span>
                            <button
                              type="button"
                              className={styles.btnItemDelete}
                              onClick={() => handleRemoveMaterial(idx)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddMaterial} className={styles.addItemForm}>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="Add new material (e.g. 100% Bio-Wash Combed Cotton)"
                          value={newMaterial}
                          onChange={(e) => setNewMaterial(e.target.value)}
                        />
                        <button type="submit" className={styles.btnPrimary} style={{ padding: '0.55rem 1rem' }}>
                          <Plus size={15} /> Add Option
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* ══════════════════════════════════════════════════
                    FIELD 5: SIZES
                ══════════════════════════════════════════════════ */}
                <div className={styles.fieldBox}>
                  <div className={styles.fieldBoxHeader}>
                    <span className={styles.fieldBoxTitle}>
                      <Layers size={18} color="#0284c7" />
                      Garment / Product Sizes
                    </span>
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          sizes: {
                            ...(sec.sizes || {}),
                            enabled: sec.sizes?.enabled ? false : true,
                          },
                        }))
                      }
                    >
                      <div
                        className={styles.toggleSwitch}
                        style={{ background: activeSection.sizes?.enabled ? '#0284c7' : '#cbd5e1' }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.sizes?.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>
                  </div>

                  {activeSection.sizes?.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Section Label</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={activeSection.sizes?.label || 'SIZE'}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              sizes: { ...(sec.sizes || {}), label: e.target.value },
                            }))
                          }
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {(activeSection.sizes?.options || []).map((sz, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.4rem 0.75rem',
                              background: '#f1f5f9',
                              borderRadius: '8px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                            }}
                          >
                            <span>{sz}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSize(idx)}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleAddSize} className={styles.addItemForm}>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="Add size (e.g. 4XL or 38R)"
                          value={newSize}
                          onChange={(e) => setNewSize(e.target.value)}
                        />
                        <button type="submit" className={styles.btnPrimary} style={{ padding: '0.55rem 1rem' }}>
                          <Plus size={15} /> Add Size
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* ══════════════════════════════════════════════════
                    FIELD 6: COLOR PALETTE & BESPOKE COLOR PICKER
                ══════════════════════════════════════════════════ */}
                <div className={styles.fieldBox}>
                  <div className={styles.fieldBoxHeader}>
                    <span className={styles.fieldBoxTitle}>
                      <Palette size={18} color="#0284c7" />
                      Color Palette &amp; Picker
                    </span>
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          colors: {
                            ...(sec.colors || {}),
                            enabled: sec.colors?.enabled ? false : true,
                          },
                        }))
                      }
                    >
                      <div
                        className={styles.toggleSwitch}
                        style={{ background: activeSection.colors?.enabled ? '#0284c7' : '#cbd5e1' }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.colors?.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>
                  </div>

                  {activeSection.colors?.enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className={styles.fieldInputRow}>
                          <label className={styles.fieldLabel}>Section Label</label>
                          <input
                            type="text"
                            className={styles.textInput}
                            value={activeSection.colors?.label || 'CUSTOM COLOR'}
                            onChange={(e) =>
                              updateActiveSection((sec) => ({
                                ...sec,
                                colors: { ...(sec.colors || {}), label: e.target.value },
                              }))
                            }
                          />
                        </div>

                        <div className={styles.fieldInputRow}>
                          <label className={styles.fieldLabel}>Allow Bespoke Color Picker</label>
                          <label
                            className={styles.toggleWrap}
                            style={{ marginTop: '0.4rem' }}
                            onClick={() =>
                              updateActiveSection((sec) => ({
                                ...sec,
                                colors: {
                                  ...(sec.colors || {}),
                                  allowCustomColorPicker: sec.colors?.allowCustomColorPicker === false ? true : false,
                                },
                              }))
                            }
                          >
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                              {activeSection.colors?.allowCustomColorPicker !== false ? 'Picker Active' : 'Palette Only'}
                            </span>
                            <div
                              className={styles.toggleSwitch}
                              style={{ background: activeSection.colors?.allowCustomColorPicker !== false ? '#0284c7' : '#cbd5e1' }}
                            >
                              <div
                                className={styles.toggleKnob}
                                style={{ transform: activeSection.colors?.allowCustomColorPicker !== false ? 'translateX(20px)' : 'translateX(0)' }}
                              />
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Swatches List */}
                      <div className={styles.itemsList}>
                        {(activeSection.colors?.defaultPalette || []).map((c) => (
                          <div key={c.id} className={styles.itemRow}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: c.hex, border: '1.5px solid #cbd5e1' }} />
                              <strong style={{ fontSize: '0.88rem' }}>{c.name}</strong>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>({c.hex})</span>
                            </div>
                            <button
                              type="button"
                              className={styles.btnItemDelete}
                              onClick={() => handleRemoveColor(c.id)}
                              title="Delete Color"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Color Form */}
                      <form onSubmit={handleAddColor} className={styles.addItemForm}>
                        <input
                          type="color"
                          value={newColorHex}
                          onChange={(e) => setNewColorHex(e.target.value)}
                          style={{ width: '40px', height: '38px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '8px' }}
                        />
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder="Color Name (e.g. Royal Gold)"
                          value={newColorName}
                          onChange={(e) => setNewColorName(e.target.value)}
                        />
                        <button type="submit" className={styles.btnPrimary} style={{ padding: '0.55rem 1rem' }}>
                          <Plus size={15} /> Add Color
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* ══════════════════════════════════════════════════
                    FIELD 7: EXAMPLE MOCKUPS
                ══════════════════════════════════════════════════ */}
                <div className={styles.fieldBox}>
                  <div className={styles.fieldBoxHeader}>
                    <span className={styles.fieldBoxTitle}>
                      <ImageIcon size={18} color="#0284c7" />
                      Mockup / Reference Uploads
                    </span>
                    <label
                      className={styles.toggleWrap}
                      onClick={() =>
                        updateActiveSection((sec) => ({
                          ...sec,
                          mockups: {
                            ...(sec.mockups || {}),
                            enabled: sec.mockups?.enabled ? false : true,
                          },
                        }))
                      }
                    >
                      <div
                        className={styles.toggleSwitch}
                        style={{ background: activeSection.mockups?.enabled ? '#0284c7' : '#cbd5e1' }}
                      >
                        <div
                          className={styles.toggleKnob}
                          style={{ transform: activeSection.mockups?.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                        />
                      </div>
                    </label>
                  </div>

                  {activeSection.mockups?.enabled && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Primary Mockup Label</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={activeSection.mockups?.frontMockupLabel || 'Front Example Image'}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              mockups: { ...(sec.mockups || {}), frontMockupLabel: e.target.value },
                            }))
                          }
                        />
                      </div>
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>Secondary Mockup Label</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          value={activeSection.mockups?.backMockupLabel || 'Back Example Image'}
                          onChange={(e) =>
                            updateActiveSection((sec) => ({
                              ...sec,
                              mockups: { ...(sec.mockups || {}), backMockupLabel: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                TAB: LIVE INTERACTIVE PREVIEW
            ══════════════════════════════════════════════════════ */}
            {activeTab === 'preview' && (
              <div className={styles.sectionCard}>
                <div className={styles.sectionCardHeader}>
                  <div className={styles.sectionTitleWrap}>
                    <Eye size={20} color="#0284c7" />
                    <h2>Live Storefront Simulation</h2>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Interactive preview across all {enabledSections.length} active section(s)
                  </span>
                </div>

                {/* Simulated Stepper Nav */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {enabledSections.map((sec, idx) => {
                    const isStepActive = (simActiveStepId || enabledSections[0]?.id) === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setSimActiveStepId(sec.id)}
                        style={{
                          padding: '0.6rem 1rem',
                          borderRadius: '10px',
                          border: isStepActive ? '2px solid #0284c7' : '1px solid #e2e8f0',
                          background: isStepActive ? '#f0f9ff' : '#ffffff',
                          color: isStepActive ? '#0284c7' : '#475569',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: isStepActive ? '#0284c7' : '#cbd5e1', color: '#ffffff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {idx + 1}
                        </span>
                        <span>{sec.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Simulated Active Step Content */}
                {activeSimSection && (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>{activeSimSection.title}</h3>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{activeSimSection.subtitle}</p>
                    </div>

                    {/* Text field simulation */}
                    {activeSimSection.textField?.enabled !== false && (
                      <div className={styles.fieldInputRow}>
                        <label className={styles.fieldLabel}>{activeSimSection.textField?.label || 'CUSTOM TEXT'}</label>
                        <input
                          type="text"
                          className={styles.textInput}
                          placeholder={activeSimSection.textField?.placeholder}
                          value={simText}
                          onChange={(e) => setSimText(e.target.value)}
                        />
                      </div>
                    )}

                    {/* Fonts simulation */}
                    {activeSimSection.fontStyle?.enabled !== false && (
                      <div>
                        <label className={styles.fieldLabel}>{activeSimSection.fontStyle?.label || 'FONT STYLE'}</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem', marginTop: '0.4rem' }}>
                          {(activeSimSection.fontStyle?.directFonts || []).map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setSimSelectedFont(f)}
                              style={{
                                padding: '0.6rem',
                                borderRadius: '10px',
                                border: simSelectedFont?.id === f.id ? '2px solid #0284c7' : '1px solid #e2e8f0',
                                background: simSelectedFont?.id === f.id ? '#e0f2fe' : '#ffffff',
                                cursor: 'pointer',
                                textAlign: 'center',
                              }}
                            >
                              <div style={{ fontFamily: f.fontFamily, fontSize: '0.95rem', fontWeight: 700 }}>{f.sample || 'Aa Bb 123'}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{f.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Images simulation */}
                    {activeSimSection.images?.enabled !== false && (
                      <div>
                        <label className={styles.fieldLabel}>{activeSimSection.images?.label || 'IMAGE UPLOADS'}</label>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                          {Array.from({ length: activeSimSection.images?.maxImages || 4 }).map((_, i) => (
                            <div
                              key={i}
                              style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '10px',
                                border: '1.5px dashed #cbd5e1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#94a3b8',
                                fontSize: '0.68rem',
                              }}
                            >
                              <ImageIcon size={18} />
                              Slot {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Materials simulation */}
                    {activeSimSection.materials?.enabled && (
                      <div>
                        <label className={styles.fieldLabel}>{activeSimSection.materials?.label || 'MATERIAL'}</label>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                          {(activeSimSection.materials?.options || []).map((mat) => (
                            <button
                              key={mat}
                              type="button"
                              onClick={() => setSimSelectedMaterial(mat)}
                              style={{
                                padding: '0.45rem 0.8rem',
                                borderRadius: '8px',
                                border: simSelectedMaterial === mat ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                background: simSelectedMaterial === mat ? '#e0f2fe' : '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              {mat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizes simulation */}
                    {activeSimSection.sizes?.enabled && (
                      <div>
                        <label className={styles.fieldLabel}>{activeSimSection.sizes?.label || 'SIZE'}</label>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                          {(activeSimSection.sizes?.options || []).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setSimSelectedSize(sz)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                border: simSelectedSize === sz ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                background: simSelectedSize === sz ? '#0284c7' : '#ffffff',
                                color: simSelectedSize === sz ? '#ffffff' : '#334155',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Colors simulation */}
                    {activeSimSection.colors?.enabled && (
                      <div>
                        <label className={styles.fieldLabel}>{activeSimSection.colors?.label || 'COLOR'}</label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                          {(activeSimSection.colors?.defaultPalette || []).map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSimSelectedColor(c)}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: c.hex,
                                border: simSelectedColor?.id === c.id ? '3px solid #0284c7' : '1.5px solid #cbd5e1',
                                cursor: 'pointer',
                              }}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Column B: Active Form Overview Sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className={styles.sectionCard}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <CheckCircle2 size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Active Form Overview</h3>
              </div>

              {/* Sections list */}
              <div className={styles.statusSummaryList}>
                {currentSections.map((sec, idx) => (
                  <div
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`${styles.statusItem} ${sec.enabled !== false ? styles.statusItemActive : styles.statusItemDisabled}`}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>{idx + 1}. {sec.title}</span>
                    <span className={styles.previewPill}>
                      {sec.enabled !== false ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add New Section Button in Sidebar */}
              <button
                type="button"
                className={styles.btnSidebarAdd}
                onClick={handleOpenAddSectionModal}
              >
                <Plus size={16} /> Add New Section
              </button>

              {/* Configuration counts */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Sections:</span>
                  <strong style={{ color: '#0f172a' }}>{currentSections.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Active Sections:</span>
                  <strong style={{ color: '#16a34a' }}>{enabledSections.length}</strong>
                </div>
              </div>

              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSave}
                disabled={saving}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Save size={16} />
                Save Configuration
              </button>
            </div>
          </div>
        </div>

        {/* ── 4. Add New Section Modal Dialog ── */}
        {showAddSectionModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddSectionModal(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  <Plus size={20} color="#0284c7" />
                  Add New Customizer Section
                </h3>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setShowAddSectionModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSection}>
                <div className={styles.modalBody}>
                  <div className={styles.fieldInputRow}>
                    <label className={styles.fieldLabel}>
                      Section Title / Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="e.g. Sleeves Customization, Collar & Cuffs, Packaging..."
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <div className={styles.fieldInputRow}>
                    <label className={styles.fieldLabel}>Customer Subtitle / Instructions</label>
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="e.g. Customize left & right sleeve graphics and monogram"
                      value={newSectionSubtitle}
                      onChange={(e) => setNewSectionSubtitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className={styles.fieldLabel}>Initial Fields Template</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="secTemplate"
                          checked={newSectionTemplate === 'visual'}
                          onChange={() => setNewSectionTemplate('visual')}
                        />
                        <span><strong>Text &amp; Artworks:</strong> Custom Text Field, Typography Fonts, and Image Uploads</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="secTemplate"
                          checked={newSectionTemplate === 'specs'}
                          onChange={() => setNewSectionTemplate('specs')}
                        />
                        <span><strong>Material &amp; Specifications:</strong> Material Options, Sizes, and Color Palette</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="secTemplate"
                          checked={newSectionTemplate === 'text'}
                          onChange={() => setNewSectionTemplate('text')}
                        />
                        <span><strong>Simple Text Only:</strong> Just a custom text input and instructions</span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="secTemplate"
                          checked={newSectionTemplate === 'full'}
                          onChange={() => setNewSectionTemplate('full')}
                        />
                        <span><strong>Full Suite:</strong> All fields enabled (Text, Fonts, Images, Materials, Sizes, Colors, Mockups)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setShowAddSectionModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary}>
                    <Plus size={16} /> Create Section
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
