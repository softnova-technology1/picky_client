import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FolderTree,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Package,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Check,
  X,
  ArrowRight,
  Copy,
  Command,
  RotateCcw,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useUiStore } from '../../../store/uiStore';
import { MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from '../../../data/categoryMockData';

export default function AdminSubCategories() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);

  // Categories list state (10 fixed categories, can have specs edited)
  const [categories, setCategories] = useState(() => MOCK_CATEGORIES);

  // Master list of subcategories
  const [subcategories, setSubcategories] = useState(() => MOCK_SUBCATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all'); // 'all' or 'cat-1', 'cat-2', etc.
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'inactive'

  // Global Ctrl+K / Cmd+K shortcut to focus unique search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add / Edit Sub-Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    categoryId: 'cat-1',
    description: '',
    image: '',
    displayOrder: 1,
    status: 'active',
  });

  // View Details Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState(null);

  // Manage Specs (Characteristics) Modal State
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [specsCategory, setSpecsCategory] = useState(null);
  const [specsList, setSpecsList] = useState([]);
  const [specsLoading, setSpecsLoading] = useState(false);

  // New spec item sub-form state
  const [newSpec, setNewSpec] = useState({
    name: '',
    type: 'select',
    valuesInput: '',
    required: false,
  });

  // Live test preview state for specs
  const [previewValues, setPreviewValues] = useState({});

  // Auto-open modal if URL has ?action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Derived KPI metrics
  const kpis = useMemo(() => {
    const total = subcategories.length;
    const active = subcategories.filter((s) => s.status === 'active').length;
    const distinctCategories = new Set(subcategories.map((s) => s.categoryId)).size;
    const totalProducts = subcategories.reduce((acc, curr) => acc + (Number(curr.itemCount) || 0), 0);
    return { total, active, distinctCategories, totalProducts };
  }, [subcategories]);

  // Active Category Object (when a specific tab is selected)
  const currentCategoryObj = useMemo(() => {
    if (selectedCategoryTab === 'all') return null;
    return categories.find((c) => c._id === selectedCategoryTab) || null;
  }, [categories, selectedCategoryTab]);

  // Filtered subcategories
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        sub.name.toLowerCase().includes(search) ||
        sub.slug.toLowerCase().includes(search) ||
        (sub.categoryName && sub.categoryName.toLowerCase().includes(search)) ||
        (sub.description && sub.description.toLowerCase().includes(search));

      const matchCategory =
        selectedCategoryTab === 'all' || sub.categoryId === selectedCategoryTab;
      const matchStatus = selectedStatus === 'all' || sub.status === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [subcategories, searchTerm, selectedCategoryTab, selectedStatus]);

  // Open Add Sub-Category modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    const defaultCatId = selectedCategoryTab !== 'all' ? selectedCategoryTab : 'cat-1';
    setFormData({
      name: '',
      slug: '',
      categoryId: defaultCatId,
      description: '',
      image: '',
      displayOrder: subcategories.length + 1,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  // Handle local image file upload
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, image: previewUrl }));
      showToast('Cover image selected!', 'success');
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  // Open Edit Sub-Category modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      slug: item.slug || '',
      categoryId: item.categoryId || 'cat-1',
      description: item.description || '',
      image: item.image || '',
      displayOrder: item.displayOrder || 1,
      status: item.status || 'active',
    });
    setIsModalOpen(true);
  };

  // Open View details modal
  const handleOpenView = (item) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  // Copy slug path to clipboard
  const handleCopySlug = (slugPath, e) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(slugPath);
      showToast(`Copied "${slugPath}" to clipboard!`, 'info');
    }
  };

  // Open Manage Specs Modal for a category
  const handleOpenSpecs = (cat) => {
    const targetCat = cat || currentCategoryObj || categories[0];
    setSpecsCategory(targetCat);
    setSpecsList(targetCat.characteristics ? [...targetCat.characteristics] : []);
    setNewSpec({ name: '', type: 'select', valuesInput: '', required: false });
    setPreviewValues({});
    setIsSpecsModalOpen(true);
  };

  // Auto-generate slug when name changes in Add mode
  const handleNameChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingItem ? generatedSlug : prev.slug,
    }));
  };

  // Save Add / Edit Sub-Category
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Sub-Category name is required', 'error');
      return;
    }
    if (!formData.slug.trim()) {
      showToast('Sub-Category slug is required', 'error');
      return;
    }

    setModalLoading(true);

    setTimeout(() => {
      const parentCat = categories.find((c) => c._id === formData.categoryId);
      const catName = parentCat ? parentCat.name : "Women's Fashion";

      if (editingItem) {
        setSubcategories((prev) =>
          prev.map((s) =>
            s._id === editingItem._id
              ? {
                  ...s,
                  name: formData.name.trim(),
                  slug: formData.slug.trim(),
                  categoryId: formData.categoryId,
                  categoryName: catName,
                  description: formData.description.trim(),
                  image: formData.image || s.image,
                  displayOrder: Number(formData.displayOrder) || 1,
                  status: formData.status,
                }
              : s
          )
        );
        showToast(`Sub-category "${formData.name}" updated successfully!`, 'success');
      } else {
        const newSub = {
          _id: `sub-${Date.now().toString(36)}`,
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          categoryId: formData.categoryId,
          categoryName: catName,
          description: formData.description.trim(),
          image:
            formData.image ||
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
          status: formData.status,
          displayOrder: Number(formData.displayOrder) || 1,
          itemCount: 0,
        };
        setSubcategories((prev) => [newSub, ...prev]);
        showToast(`New sub-category "${formData.name}" created!`, 'success');
      }

      setModalLoading(false);
      setIsModalOpen(false);
    }, 200);
  };

  // Toggle Status
  const handleToggleStatus = (sub) => {
    const nextStatus = sub.status === 'active' ? 'inactive' : 'active';
    setSubcategories((prev) =>
      prev.map((s) => (s._id === sub._id ? { ...s, status: nextStatus } : s))
    );
    showToast(`Status updated to ${nextStatus.toUpperCase()} for ${sub.name}`, 'info');
  };

  // Delete / Remove
  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove the sub-category "${name}"?`)) {
      setSubcategories((prev) => prev.filter((s) => s._id !== id));
      showToast(`Removed sub-category "${name}"`, 'info');
    }
  };

  // Add Spec to category's list
  const handleAddSpec = (e) => {
    e.preventDefault();
    if (!newSpec.name.trim()) {
      showToast('Please enter specification name', 'error');
      return;
    }

    let parsedValues = [];
    if (newSpec.type === 'select' || newSpec.type === 'multi_select') {
      parsedValues = newSpec.valuesInput
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      if (parsedValues.length === 0) {
        showToast('Please provide at least one option value (e.g. S, M, L)', 'error');
        return;
      }
    }

    const item = {
      key: newSpec.name.trim(),
      name: newSpec.name.trim(),
      type: newSpec.type,
      values: parsedValues,
      required: !!newSpec.required,
    };

    setSpecsList([...specsList, item]);
    setNewSpec({ name: '', type: 'select', valuesInput: '', required: false });
    showToast(`Added "${item.name}" spec to list`, 'success');
  };

  // Remove Spec from list
  const handleRemoveSpec = (index) => {
    const updated = specsList.filter((_, i) => i !== index);
    setSpecsList(updated);
  };

  // Save Category Specs
  const handleSaveSpecs = () => {
    if (!specsCategory) return;
    setSpecsLoading(true);

    setTimeout(() => {
      setCategories((prev) =>
        prev.map((c) =>
          c._id === specsCategory._id ? { ...c, characteristics: [...specsList] } : c
        )
      );
      showToast(
        `Saved ${specsList.length} specifications for ${specsCategory.name}!`,
        'success'
      );
      setSpecsLoading(false);
      setIsSpecsModalOpen(false);
    }, 200);
  };

  // Toggle multi-select in live preview
  const togglePreviewMulti = (charName, val) => {
    const current = previewValues[charName] || [];
    const exists = current.includes(val);
    setPreviewValues({
      ...previewValues,
      [charName]: exists ? current.filter((x) => x !== val) : [...current, val],
    });
  };

  return (
    <AdminLayout title="Sub-Categories Management">
      <style>{`
        .subcat-kpi-card {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 1.25rem 1.4rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .subcat-kpi-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 24px rgba(124, 58, 237, 0.08);
          border-color: #cbd5e1;
        }
        .subcat-search-box:focus-within {
          border-color: #7c3aed !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12), 0 4px 16px rgba(124, 58, 237, 0.05) !important;
        }
        .subcat-table-row-even {
          background-color: #ffffff;
          transition: background-color 0.18s ease;
        }
        .subcat-table-row-odd {
          background-color: #faf7ff;
          transition: background-color 0.18s ease;
        }
        .subcat-table-row-even:hover,
        .subcat-table-row-odd:hover {
          background-color: #f1e9fe !important;
        }
        .subcat-action-btn {
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .subcat-action-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
        }
        .subcat-tab-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* ─── Page Title Header ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.4rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Sub-Categories & Department Catalog
            </h2>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                background: '#f3e8ff',
                color: '#7c3aed',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                border: '1px solid #e9d5ff',
              }}
            >
              {subcategories.length} Total Sub-Categories
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
            Manage dynamic sub-categories and specifications across all 10 fixed store departments
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Quick Manage Specs button for currently active tab */}
          {currentCategoryObj && (
            <button
              onClick={() => handleOpenSpecs(currentCategoryObj)}
              className="subcat-action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #ddd6fe',
                background: '#faf5ff',
                color: '#6d28d9',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.06)',
              }}
            >
              <Sliders size={15} color="#7c3aed" />
              <span>Specs: {currentCategoryObj.name} ({currentCategoryObj.characteristics?.length || 0})</span>
            </button>
          )}

          {/* Add Sub-Category Button */}
          <button
            onClick={handleOpenAdd}
            className="subcat-action-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.15rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Sub-Category</span>
          </button>
        </div>
      </div>

      {/* ─── Top 4 Metric KPI Cards (Ultra-Premium SaaS Cards) ─────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.4rem',
        }}
      >
        {/* Card 1: Total Sub-Categories */}
        <div className="subcat-kpi-card" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TOTAL SUB-CATEGORIES
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {kpis.total}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 600, marginTop: '0.35rem' }}>
              ★ Master Catalog Registry
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #ddd6fe',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.12)',
            }}
          >
            <FolderTree size={22} />
          </div>
        </div>

        {/* Card 2: Active Sub-Categories */}
        <div className="subcat-kpi-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ACTIVE SUB-CATEGORIES
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {kpis.active}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
              100% Active & Published
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bbf7d0',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.12)',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Card 3: Fixed Departments Covered */}
        <div className="subcat-kpi-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                DEPARTMENTS COVERED
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {kpis.distinctCategories} <span style={{ fontSize: '1.05rem', color: '#94a3b8', fontWeight: 600 }}>/ {categories.length}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, marginTop: '0.35rem' }}>
              10 Fixed Store Verticals
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bfdbfe',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
            }}
          >
            <Layers size={22} />
          </div>
        </div>

        {/* Card 4: Total Items Cataloged */}
        <div className="subcat-kpi-card" style={{ borderLeft: '4px solid #d97706' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                TOTAL ITEMS CATALOGED
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {kpis.totalProducts}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 600, marginTop: '0.35rem' }}>
              Live Product Inventory
            </div>
          </div>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fde68a',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)',
            }}
          >
            <Package size={22} />
          </div>
        </div>
      </div>

      {/* ─── 10 Fixed Categories Horizontal Tab Strip ─────────────────────── */}
      <div
        style={{
          marginBottom: '1.25rem',
          padding: '0.55rem 0.75rem',
          borderRadius: '14px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div
          className="subcat-tab-scroll"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            overflowX: 'auto',
            paddingBottom: '0.1rem',
            scrollbarWidth: 'none',
          }}
        >
          {/* 'All' Tab */}
          <button
            onClick={() => setSelectedCategoryTab('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.95rem',
              borderRadius: '10px',
              border: '1.5px solid',
              borderColor: selectedCategoryTab === 'all' ? '#7c3aed' : '#e2e8f0',
              background: selectedCategoryTab === 'all' ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#f8fafc',
              color: selectedCategoryTab === 'all' ? '#ffffff' : '#334155',
              fontWeight: 700,
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow:
                selectedCategoryTab === 'all'
                  ? '0 4px 12px rgba(124, 58, 237, 0.28)'
                  : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📁 All Departments</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                background: selectedCategoryTab === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: selectedCategoryTab === 'all' ? '#ffffff' : '#64748b',
                fontWeight: 700,
              }}
            >
              {subcategories.length}
            </span>
          </button>

          {/* 10 Fixed Category Tabs */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryTab === cat._id;
            const subsInCat = subcategories.filter((s) => s.categoryId === cat._id).length;

            return (
              <button
                key={cat._id}
                onClick={() => setSelectedCategoryTab(cat._id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: isSelected ? '#7c3aed' : '#e2e8f0',
                  background: isSelected ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#334155',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.28)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat.icon || '🏷️'}</span>
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  {subsInCat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Active Category Info Banner (When a category is selected) ───── */}
      {currentCategoryObj && (
        <div
          style={{
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
            border: '1.5px solid #e9d5ff',
            borderRadius: '14px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#fff',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
              }}
            >
              {currentCategoryObj.icon || '🏷️'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800 }}>
                  {currentCategoryObj.name}
                </strong>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '999px',
                    background: '#dcfce7',
                    color: '#15803d',
                    fontWeight: 700,
                    border: '1px solid #bbf7d0',
                  }}
                >
                  Fixed Department
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 600 }}>
                  Path: <code style={{ background: 'rgba(255,255,255,0.7)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>/{currentCategoryObj.slug}</code>
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                {currentCategoryObj.subtext || 'Department catalog groupings & product attributes'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {/* Manage Specs Button */}
            <button
              onClick={() => handleOpenSpecs(currentCategoryObj)}
              className="subcat-action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1.5px solid #7c3aed',
                color: '#6d28d9',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)',
              }}
            >
              <Sliders size={14} color="#7c3aed" />
              <span>
                Manage Specs ({currentCategoryObj.characteristics?.length || 0})
              </span>
            </button>

            {/* Quick Add Sub-Category for this Department */}
            <button
              onClick={handleOpenAdd}
              className="subcat-action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: '#7c3aed',
                border: '1px solid #7c3aed',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
              }}
            >
              <Plus size={14} />
              <span>Add Sub to {currentCategoryObj.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Controls & Unique Search Bar ─────────────────────────────────── */}
      <div
        style={{
          marginBottom: '1.4rem',
          padding: '1rem 1.25rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Unique Search Box with Focus Glow & Shortcuts */}
          <div
            className="subcat-search-box"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flex: '1',
              minWidth: '280px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.2rem 0.5rem 0.2rem 0.8rem',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: '#ede9fe',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '0.65rem',
                flexShrink: 0,
              }}
            >
              <Search size={15} strokeWidth={2.5} />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by sub-category name, slug, department, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                fontSize: '0.86rem',
                color: '#0f172a',
                fontWeight: 600,
                outline: 'none',
                padding: '0.45rem 0',
              }}
            />

            {/* Right side shortcut badge or clear button */}
            {searchTerm ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: '#ede9fe',
                    color: '#7c3aed',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                  }}
                >
                  {filteredSubcategories.length} found
                </span>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.15rem 0.45rem',
                  letterSpacing: '0.04em',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                }}
              >
                <Command size={10} /> K
              </span>
            )}
          </div>

          {/* Department Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Department:
            </label>
            <select
              value={selectedCategoryTab}
              onChange={(e) => setSelectedCategoryTab(e.target.value)}
              style={{
                padding: '0.52rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            >
              <option value="all">All 10 Departments</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.52rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#7c3aed')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Reset Filters Quick Button if filtered */}
          {(searchTerm || selectedCategoryTab !== 'all' || selectedStatus !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategoryTab('all');
                setSelectedStatus('all');
              }}
              className="subcat-action-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.52rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#f8fafc',
                color: '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ─── Ultra-Neat Sub-Categories Table ───────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SUB-CATEGORY
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  PARENT DEPARTMENT
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  SLUG / PATH
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                  ITEM COUNT
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                  DISPLAY ORDER
                </th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
                  STATUS
                </th>
                <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSubcategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}
                  >
                    <FolderTree size={38} style={{ margin: '0 auto 0.6rem', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#334155' }}>No sub-categories found</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      Try adjusting your search terms or filters
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSubcategories.map((sub, index) => {
                  const parent = categories.find((c) => c._id === sub.categoryId);
                  const parentSlug = parent?.slug || 'womens-fashion';
                  const fullSlug = `/${parentSlug}/${sub.slug}`;

                  return (
                    <tr
                      key={sub._id}
                      className={index % 2 === 0 ? 'subcat-table-row-even' : 'subcat-table-row-odd'}
                      style={{
                        borderBottom: index !== filteredSubcategories.length - 1 ? '1px solid #f1f5f9' : 'none',
                      }}
                    >
                      {/* 1. Sub-Category Name & Image */}
                      <td style={{ padding: '0.9rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: '1.5px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                              background: '#f8fafc',
                            }}
                          >
                            <img
                              src={
                                sub.image ||
                                'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'
                              }
                              alt={sub.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                display: 'block',
                                transition: 'transform 0.2s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                            />
                          </div>
                          <div>
                            <strong
                              style={{
                                fontSize: '0.9rem',
                                color: '#0f172a',
                                display: 'block',
                                fontWeight: 700,
                              }}
                            >
                              {sub.name}
                            </strong>
                            {sub.description && (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 1,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  maxWidth: '260px',
                                  marginTop: '0.15rem',
                                }}
                              >
                                {sub.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Parent Department */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.78rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '8px',
                            background: '#f3e8ff',
                            color: '#6d28d9',
                            fontWeight: 700,
                            border: '1px solid #e9d5ff',
                          }}
                        >
                          {parent?.icon || '📁'} {parent?.name || sub.categoryName}
                        </span>
                      </td>

                      {/* 3. Slug / Path with 1-Click Copy Button */}
                      <td style={{ padding: '0.9rem 1rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <code
                            style={{
                              fontSize: '0.76rem',
                              padding: '0.22rem 0.55rem',
                              borderRadius: '6px',
                              background: '#f8fafc',
                              color: '#334155',
                              border: '1px solid #e2e8f0',
                              fontFamily: 'monospace',
                              fontWeight: 600,
                            }}
                          >
                            {fullSlug}
                          </code>
                          <button
                            type="button"
                            onClick={(e) => handleCopySlug(fullSlug, e)}
                            className="subcat-action-btn"
                            style={{
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '0.25rem 0.4rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#64748b',
                            }}
                            title="Copy slug path"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>

                      {/* 4. Item Count */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            color: '#0f172a',
                            background: '#f8fafc',
                            padding: '0.22rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <Package size={13} color="#7c3aed" />
                          {sub.itemCount || 0} items
                        </span>
                      </td>

                      {/* 5. Display Order */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '28px',
                            textAlign: 'center',
                            padding: '0.18rem 0.55rem',
                            borderRadius: '6px',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.76rem',
                            fontWeight: 800,
                            color: '#475569',
                          }}
                        >
                          #{sub.displayOrder || 1}
                        </span>
                      </td>

                      {/* 6. Status Toggle */}
                      <td style={{ padding: '0.9rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sub)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                          title="Click to toggle status"
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.25rem 0.7rem',
                              borderRadius: '9999px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: sub.status === 'active' ? '#dcfce7' : '#fee2e2',
                              color: sub.status === 'active' ? '#15803d' : '#b91c1c',
                              border: `1px solid ${sub.status === 'active' ? '#bbf7d0' : '#fecaca'}`,
                              cursor: 'pointer',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: sub.status === 'active' ? '#16a34a' : '#ef4444',
                              }}
                            />
                            {sub.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>

                      {/* 7. Actions Group */}
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.35rem',
                          }}
                        >
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenView(sub)}
                            className="subcat-action-btn"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.32rem 0.65rem',
                              borderRadius: '8px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="View Details"
                          >
                            <Eye size={12} color="#1d4ed8" />
                            <span>View</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(sub)}
                            className="subcat-action-btn"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.32rem 0.65rem',
                              borderRadius: '8px',
                              border: '1px solid #ddd6fe',
                              background: '#f5f3ff',
                              color: '#6d28d9',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Edit Sub-Category"
                          >
                            <Edit2 size={12} color="#6d28d9" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDelete(sub._id, sub.name)}
                            className="subcat-action-btn"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.32rem 0.55rem',
                              borderRadius: '8px',
                              border: '1px solid #fecaca',
                              background: '#fff1f2',
                              color: '#be123c',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Delete Sub-Category"
                          >
                            <Trash2 size={12} color="#be123c" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 1. Add / Edit Sub-Category Modal ──────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Sub-Category: ${editingItem.name}` : 'Add New Sub-Category'}
        maxWidth={640}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', padding: '0.25rem 0' }}>
          {/* Parent Department Selection */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem', letterSpacing: '0.02em' }}>
              <span>Parent Department / Category</span>
              <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#0f172a',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: '0.45rem', lineHeight: 1.4 }}>
              Sub-category will be grouped under this department and inherit its product specifications.
            </span>
          </div>

          {/* Name & Slug (2-Column Grid with comfortable spacing) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
            }}
          >
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem', letterSpacing: '0.02em' }}>
                <span>Sub-Category Name</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sarees, Wireless Chargers"
                value={formData.name}
                onChange={handleNameChange}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.18s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem', letterSpacing: '0.02em' }}>
                <span>Slug / URL Key</span>
                <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. sarees or wireless-chargers"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.18s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.55rem', letterSpacing: '0.02em' }}>
              <span>Description</span>
              <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.74rem' }}>(Optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Brief description for collection banners, SEO, and storefront browsing..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                borderRadius: '12px',
                border: '1.5px solid #e2e8f0',
                background: '#f8fafc',
                fontSize: '0.88rem',
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.5,
                resize: 'vertical',
                transition: 'all 0.18s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.background = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* ── Side-by-Side: Compact Cover Image (Left) + Display Order & Status (Right) ── */}
          <div
            style={{
              background: '#faf5ff',
              borderRadius: '16px',
              border: '1.5px solid #ede9fe',
              padding: '1.2rem',
              display: 'grid',
              gridTemplateColumns: '150px 1fr',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            {/* Left: Compact Cover Image Dropzone (Exact 150px x 145px) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Cover Image
                </label>
              </div>

              <label
                style={{
                  width: '150px',
                  height: '145px',
                  borderRadius: '14px',
                  border: formData.image ? '1.5px solid #ddd6fe' : '2px dashed #cbd5e1',
                  background: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: formData.image ? '0 4px 14px rgba(124, 58, 237, 0.08)' : 'none',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  if (!formData.image) {
                    e.currentTarget.style.borderColor = '#7c3aed';
                    e.currentTarget.style.background = '#f5f3ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!formData.image) {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.background = '#ffffff';
                  }
                }}
              >
                <input type="file" accept="image/*" onChange={handleImageFileSelect} style={{ display: 'none' }} />

                {formData.image ? (
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <img
                      src={formData.image}
                      alt="Subcategory Cover"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />

                    {/* Top-Left Cover Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '7px',
                        left: '7px',
                        background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        zIndex: 2,
                        letterSpacing: '0.02em',
                      }}
                    >
                      ⭐ COVER
                    </div>

                    {/* Hover Overlay with Change & Remove options */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.72)',
                        backdropFilter: 'blur(2px)',
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        opacity: 0,
                        transition: 'opacity 0.2s ease',
                        zIndex: 3,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.01em' }}>Change Image</span>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          handleRemoveImage();
                        }}
                        style={{
                          background: '#ef4444',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.28rem 0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.75rem', color: '#64748b' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                        color: '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.45rem',
                        border: '1px solid #ddd6fe',
                      }}
                    >
                      <Sparkles size={18} />
                    </div>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block', fontWeight: 700, marginBottom: '0.2rem' }}>
                      Upload Photo
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', fontWeight: 500 }}>
                      PNG, JPG up to 5MB
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Right: Stacked Display Order & Publishing Status Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              {/* Display Order */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '0.45rem' }}>
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              {/* Publishing Status */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '0.45rem' }}>
                  Publishing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="active">Active (Visible on Storefront)</option>
                  <option value="inactive">Inactive (Hidden Draft)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.85rem',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '1.35rem',
              marginTop: '0.35rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="subcat-action-btn"
              style={{
                padding: '0.7rem 1.4rem',
                borderRadius: '11px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="subcat-action-btn"
              style={{
                padding: '0.7rem 1.75rem',
                borderRadius: '11px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.32)',
              }}
            >
              {modalLoading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Sub-Category'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── 2. Manage Category Specs / Characteristics Modal ─────────────── */}
      <Modal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        title={`Department Specifications: ${specsCategory?.name || ''}`}
        maxWidth={740}
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.35rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
              border: '1px solid #ddd6fe',
              borderRadius: '12px',
              padding: '0.9rem 1.15rem',
              marginBottom: '1.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <Sparkles size={22} color="#7c3aed" />
            <span style={{ fontSize: '0.84rem', color: '#5b21b6', lineHeight: 1.5 }}>
              These attributes (e.g. Fabric, Size, Material, Battery) dynamically generate input
              fields when creating products under <strong>{specsCategory?.name}</strong>.
            </span>
          </div>

          {/* Current Configured Specs List */}
          <div
            style={{
              marginBottom: '1.5rem',
              background: '#f8fafc',
              padding: '1.15rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.9rem',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Configured Attributes ({specsList.length})
              </h4>
            </div>

            {specsList.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.84rem',
                  color: '#94a3b8',
                  fontStyle: 'italic',
                }}
              >
                No specifications defined yet. Add custom attributes using the form below.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {specsList.map((spec, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      gap: '0.85rem',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                        {spec.name || spec.key}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px',
                          background: '#ede8f8',
                          color: '#5b21b6',
                        }}
                      >
                        {spec.type.replace('_', ' ')}
                      </span>
                      {spec.required && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: '#dc2626',
                            fontWeight: 700,
                            background: '#fee2e2',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                          }}
                        >
                          *Required
                        </span>
                      )}
                      {spec.values && spec.values.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {spec.values.map((v, vIdx) => (
                            <span
                              key={vIdx}
                              style={{
                                fontSize: '0.72rem',
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                fontWeight: 500,
                              }}
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        padding: '0.3rem 0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Remove specification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Spec Sub-Form */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.15rem',
              marginBottom: '1.5rem',
            }}
          >
            <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              + Add New Department Specification
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                  Attribute Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Size, Fabric, Battery Capacity"
                  value={newSpec.name}
                  onChange={(e) => setNewSpec({ ...newSpec, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                  Input Field Type *
                </label>
                <select
                  value={newSpec.type}
                  onChange={(e) => setNewSpec({ ...newSpec, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.86rem',
                    outline: 'none',
                    cursor: 'pointer',
                    background: '#ffffff',
                  }}
                >
                  <option value="select">Dropdown (Single Select)</option>
                  <option value="multi_select">Multi-Select (Pill Tags)</option>
                  <option value="text">Text Input</option>
                  <option value="number">Number</option>
                  <option value="boolean">Yes / No Toggle</option>
                </select>
              </div>
            </div>

            {(newSpec.type === 'select' || newSpec.type === 'multi_select') && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.4rem' }}>
                  Options / Values (Comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL, XXL or Pure Cotton, Soft Silk, Rayon"
                  value={newSpec.valuesInput}
                  onChange={(e) => setNewSpec({ ...newSpec, valuesInput: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.86rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '0.3rem' }}>
                  Separate individual options with commas.
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={newSpec.required}
                  onChange={(e) => setNewSpec({ ...newSpec, required: e.target.checked })}
                />
                <span>Mandatory / Required for product entry</span>
              </label>

              <button
                type="button"
                onClick={handleAddSpec}
                className="subcat-action-btn"
                style={{
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                }}
              >
                + Add to List
              </button>
            </div>
          </div>

          {/* Live Interactive Form Preview */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '1.15rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.9rem',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>👁️</span>
              <strong style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 800 }}>
                Live Product Form Preview
              </strong>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                (Simulates how these attributes render in Add Product form)
              </span>
            </div>

            {specsList.length === 0 ? (
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  margin: 0,
                  fontStyle: 'italic',
                }}
              >
                Add specifications above to test the interactive fields live!
              </p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '1rem',
                }}
              >
                {specsList.map((spec, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      padding: '0.85rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        display: 'block',
                        marginBottom: '0.4rem',
                        color: '#1e293b',
                      }}
                    >
                      {spec.name || spec.key}{' '}
                      {spec.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>

                    {spec.type === 'select' && (
                      <select
                        style={{ width: '100%', fontSize: '0.84rem', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        value={previewValues[spec.name || spec.key] || ''}
                        onChange={(e) =>
                          setPreviewValues({
                            ...previewValues,
                            [spec.name || spec.key]: e.target.value,
                          })
                        }
                      >
                        <option value="">Select {spec.name || spec.key}...</option>
                        {spec.values?.map((v, i) => (
                          <option key={i} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    )}

                    {spec.type === 'multi_select' && (
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {spec.values?.map((v, i) => {
                          const isChecked = (
                            previewValues[spec.name || spec.key] || []
                          ).includes(v);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => togglePreviewMulti(spec.name || spec.key, v)}
                              style={{
                                fontSize: '0.76rem',
                                padding: '0.25rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid',
                                borderColor: isChecked ? '#7c3aed' : '#cbd5e1',
                                background: isChecked ? '#ede8f8' : '#f8fafc',
                                color: isChecked ? '#5b21b6' : '#475569',
                                cursor: 'pointer',
                                fontWeight: isChecked ? 700 : 500,
                              }}
                            >
                              {isChecked ? `✓ ${v}` : v}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {spec.type === 'text' && (
                      <input
                        type="text"
                        placeholder={`Enter ${spec.name || spec.key}...`}
                        style={{ width: '100%', fontSize: '0.84rem', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        value={previewValues[spec.name || spec.key] || ''}
                        onChange={(e) =>
                          setPreviewValues({
                            ...previewValues,
                            [spec.name || spec.key]: e.target.value,
                          })
                        }
                      />
                    )}

                    {spec.type === 'number' && (
                      <input
                        type="number"
                        placeholder="e.g. 50"
                        style={{ width: '100%', fontSize: '0.84rem', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                        value={previewValues[spec.name || spec.key] || ''}
                        onChange={(e) =>
                          setPreviewValues({
                            ...previewValues,
                            [spec.name || spec.key]: e.target.value,
                          })
                        }
                      />
                    )}

                    {spec.type === 'boolean' && (
                      <div style={{ display: 'flex', gap: '0.45rem' }}>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewValues({
                              ...previewValues,
                              [spec.name || spec.key]: 'Yes',
                            })
                          }
                          style={{
                            flex: 1,
                            fontSize: '0.78rem',
                            padding: '0.35rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor:
                              previewValues[spec.name || spec.key] === 'Yes'
                                ? '#16a34a'
                                : '#cbd5e1',
                            background:
                              previewValues[spec.name || spec.key] === 'Yes'
                                ? '#dcfce7'
                                : '#fff',
                            color:
                              previewValues[spec.name || spec.key] === 'Yes'
                                ? '#166534'
                                : '#475569',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewValues({
                              ...previewValues,
                              [spec.name || spec.key]: 'No',
                            })
                          }
                          style={{
                            flex: 1,
                            fontSize: '0.78rem',
                            padding: '0.35rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor:
                              previewValues[spec.name || spec.key] === 'No'
                                ? '#ef4444'
                                : '#cbd5e1',
                            background:
                              previewValues[spec.name || spec.key] === 'No'
                                ? '#fee2e2'
                                : '#fff',
                            color:
                              previewValues[spec.name || spec.key] === 'No'
                                ? '#991b1b'
                                : '#475569',
                            cursor: 'pointer',
                            fontWeight: 700,
                          }}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.85rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsSpecsModalOpen(false)}
              className="subcat-action-btn"
              style={{
                padding: '0.65rem 1.35rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={specsLoading}
              onClick={handleSaveSpecs}
              className="subcat-action-btn"
              style={{
                padding: '0.65rem 1.6rem',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
              }}
            >
              {specsLoading ? 'Saving...' : 'Save Department Specs'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ─── 3. View Sub-Category Details Modal (Ultra-Luxurious Showcase) ── */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Sub-Category Details"
        maxWidth={620}
      >
        {viewingItem && (() => {
          const parent = categories.find((c) => c._id === viewingItem.categoryId);
          const parentSlug = parent?.slug || 'womens-fashion';
          const fullPath = `/${parentSlug}/${viewingItem.slug}`;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', padding: '0.2rem 0' }}>
              {/* Showcase Hero Banner Card */}
              <div
                style={{
                  display: 'flex',
                  gap: '1.4rem',
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                  padding: '1.35rem',
                  borderRadius: '16px',
                  border: '1.5px solid #e9d5ff',
                  boxShadow: '0 4px 16px rgba(124, 58, 237, 0.06)',
                }}
              >
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '2px solid #ffffff',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    background: '#ffffff',
                  }}
                >
                  <img
                    src={
                      viewingItem.image ||
                      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'
                    }
                    alt={viewingItem.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: '#ffffff',
                        color: '#6d28d9',
                        border: '1px solid #ddd6fe',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                      }}
                    >
                      {parent?.icon || '🏷️'} {parent?.name || viewingItem.categoryName}
                    </span>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '999px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        background: viewingItem.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: viewingItem.status === 'active' ? '#15803d' : '#b91c1c',
                        border: `1px solid ${viewingItem.status === 'active' ? '#bbf7d0' : '#fecaca'}`,
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: viewingItem.status === 'active' ? '#16a34a' : '#ef4444',
                        }}
                      />
                      {viewingItem.status === 'active' ? 'Active Storefront' : 'Hidden Draft'}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: '0 0 0.4rem',
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}
                  >
                    {viewingItem.name}
                  </h3>

                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <code
                      style={{
                        fontSize: '0.78rem',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: '#5b21b6',
                        background: 'rgba(255, 255, 255, 0.75)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        border: '1px solid #e9d5ff',
                      }}
                    >
                      {fullPath}
                    </code>
                  </div>
                </div>
              </div>

              {/* 4-Item Parameter Grid (Spacious, modern SaaS cards) */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                }}
              >
                {/* 1. Parent Department */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1rem 1.15rem',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    PARENT DEPARTMENT
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    {parent?.icon} {parent?.name || viewingItem.categoryName}
                  </div>
                </div>

                {/* 2. Items Cataloged */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1rem 1.15rem',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    PRODUCTS CATALOGED
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Package size={16} color="#7c3aed" />
                    <span>{viewingItem.itemCount || 0} Products</span>
                  </div>
                </div>

                {/* 3. Display Sequence */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1rem 1.15rem',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    DISPLAY SEQUENCE
                  </div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    Priority Position #{viewingItem.displayOrder || 1}
                  </div>
                </div>

                {/* 4. Direct URL Route */}
                <div
                  style={{
                    background: '#ffffff',
                    padding: '1rem 1.15rem',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    STOREFRONT ROUTE
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>
                    {fullPath}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {viewingItem.description && (
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '1.15rem',
                    borderRadius: '14px',
                    border: '1.5px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.45rem',
                    }}
                  >
                    Sub-Category Description
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.9rem',
                      color: '#1e293b',
                      lineHeight: 1.6,
                      fontWeight: 500,
                    }}
                  >
                    {viewingItem.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.85rem',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '1.25rem',
                  marginTop: '0.25rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="subcat-action-btn"
                  style={{
                    padding: '0.65rem 1.35rem',
                    borderRadius: '11px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEdit(viewingItem);
                  }}
                  className="subcat-action-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.6rem',
                    borderRadius: '11px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  <Edit2 size={14} />
                  <span>Edit Sub-Category</span>
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
}

