import React, { useState, useMemo, useEffect } from 'react';
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

  // Categories list state (10 fixed categories, can have specs edited)
  const [categories, setCategories] = useState(() => MOCK_CATEGORIES);

  // Master list of subcategories
  const [subcategories, setSubcategories] = useState(() => MOCK_SUBCATEGORIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('all'); // 'all' or 'cat-1', 'cat-2', etc.
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'inactive'

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
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
      displayOrder: subcategories.length + 1,
      status: 'active',
    });
    setIsModalOpen(true);
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
        .sub-img-hover:hover {
          transform: scale(1.08) !important;
        }
        .metrics-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(124, 58, 237, 0.08) !important;
        }
      `}</style>

      {/* ─── Page Title Header ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#1e1b4b',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Sub-Categories & Department Catalog
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Manage dynamic sub-categories and specifications across all 10 fixed store departments
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Manage Specs button for currently active tab */}
          {currentCategoryObj && (
            <button
              onClick={() => handleOpenSpecs(currentCategoryObj)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #c4b5fd',
                background: '#ede8f8',
                color: '#5b21b6',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              <Sliders size={15} color="#6d28d9" />
              <span>Specs: {currentCategoryObj.name} ({currentCategoryObj.characteristics?.length || 0})</span>
            </button>
          )}

          {/* Add Sub-Category Button */}
          <button
            onClick={handleOpenAdd}
            className="admin-period-select-btn"
            style={{
              background: '#7c3aed',
              color: '#ffffff',
              borderColor: '#7c3aed',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Add Sub-Category</span>
          </button>
        </div>
      </div>

      {/* ─── Top 4 Metric KPI Cards ────────────────────────────────────────── */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Total Sub-Categories */}
        <div
          className="metric-card"
          style={{
            borderTop: '3.5px solid #7c3aed',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="metric-icon-wrap" style={{ background: '#ede8f8', color: '#7c3aed' }}>
            <FolderTree size={22} />
          </div>
          <div>
            <div className="metric-val" style={{ color: '#1e1b4b', fontWeight: 800 }}>{kpis.total}</div>
            <div className="metric-label" style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Sub-Categories</div>
          </div>
        </div>

        {/* Active Sub-Categories */}
        <div
          className="metric-card"
          style={{
            borderTop: '3.5px solid #16a34a',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="metric-val" style={{ color: '#1e1b4b', fontWeight: 800 }}>{kpis.active}</div>
            <div className="metric-label" style={{ fontSize: '0.8rem', color: '#64748b' }}>Active Sub-Categories</div>
          </div>
        </div>

        {/* Parent Categories Covered */}
        <div
          className="metric-card"
          style={{
            borderTop: '3.5px solid #2563eb',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="metric-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Layers size={22} />
          </div>
          <div>
            <div className="metric-val" style={{ color: '#1e1b4b', fontWeight: 800 }}>
              {kpis.distinctCategories} / {categories.length}
            </div>
            <div className="metric-label" style={{ fontSize: '0.8rem', color: '#64748b' }}>Fixed Departments Covered</div>
          </div>
        </div>

        {/* Total Catalog Items */}
        <div
          className="metric-card"
          style={{
            borderTop: '3.5px solid #d97706',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Package size={22} />
          </div>
          <div>
            <div className="metric-val" style={{ color: '#1e1b4b', fontWeight: 800 }}>{kpis.totalProducts}</div>
            <div className="metric-label" style={{ fontSize: '0.8rem', color: '#64748b' }}>Total Items Cataloged</div>
          </div>
        </div>
      </div>

      {/* ─── 10 Fixed Categories Horizontal Tab Strip ─────────────────────── */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '0.65rem 0.85rem',
          borderRadius: '14px',
          background: '#ffffff',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.15rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* 'All' Tab */}
          <button
            onClick={() => setSelectedCategoryTab('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid',
              borderColor: selectedCategoryTab === 'all' ? '#7c3aed' : '#e2e8f0',
              background: selectedCategoryTab === 'all' ? '#7c3aed' : '#f8fafc',
              color: selectedCategoryTab === 'all' ? '#ffffff' : '#334155',
              fontWeight: 700,
              fontSize: '0.82rem',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              boxShadow:
                selectedCategoryTab === 'all'
                  ? '0 4px 14px rgba(124, 58, 237, 0.3)'
                  : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>📁 All Departments</span>
            <span
              style={{
                fontSize: '0.72rem',
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
                  padding: '0.55rem 0.95rem',
                  borderRadius: '10px',
                  border: '1.5px solid',
                  borderColor: isSelected ? '#7c3aed' : '#e2e8f0',
                  background: isSelected ? '#7c3aed' : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#334155',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 14px rgba(124, 58, 237, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat.icon || '🏷️'}</span>
                <span>{cat.name}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
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
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '1.5px solid #ddd6fe',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: '#7c3aed',
                color: '#fff',
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)',
              }}
            >
              {currentCategoryObj.icon || '🏷️'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '1.05rem', color: '#2e1065', fontWeight: 800 }}>
                  {currentCategoryObj.name}
                </strong>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '999px',
                    background: '#dcfce7',
                    color: '#166534',
                    fontWeight: 700,
                  }}
                >
                  Fixed Department
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6d28d9', fontWeight: 600 }}>
                  Slug: <code>/{currentCategoryObj.slug}</code>
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#5b21b6', marginTop: '0.2rem' }}>
                {currentCategoryObj.subtext || 'Department catalog groupings & product attributes'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Manage Specs Button */}
            <button
              onClick={() => handleOpenSpecs(currentCategoryObj)}
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
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.1)',
              }}
            >
              <Sliders size={14} color="#6d28d9" />
              <span>
                Manage Specs ({currentCategoryObj.characteristics?.length || 0})
              </span>
            </button>

            {/* Quick Add Sub-Category for this Department */}
            <button
              onClick={handleOpenAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                background: '#7c3aed',
                border: '1.5px solid #7c3aed',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} />
              <span>Add Sub to {currentCategoryObj.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Controls & Filter Bar ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.15rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flex: '1',
              minWidth: '260px',
            }}
          >
            <Search size={16} style={{ position: 'absolute', left: '1rem', color: '#7c3aed' }} />
            <input
              type="text"
              placeholder="Search by sub-category name, slug, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 2.4rem 0.6rem 2.7rem',
                background: '#ede8f8',
                border: '1.5px solid #dfd5f5',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                color: '#1e1b4b',
                fontWeight: 500,
                outline: 'none',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.04)',
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  background: '#ddd6fe',
                  border: 'none',
                  borderRadius: '999px',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#5b21b6',
                }}
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Department Filter (Dropdown mirror) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Department:
            </label>
            <select
              value={selectedCategoryTab}
              onChange={(e) => setSelectedCategoryTab(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #dfd5f5',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e1b4b',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All 10 Departments</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1.5px solid #dfd5f5',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e1b4b',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Sub-Categories Table ─────────────────────────────────────────── */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ fontWeight: 800, color: '#475569' }}>Sub-Category</th>
              <th style={{ fontWeight: 800, color: '#475569' }}>Parent Department</th>
              <th style={{ fontWeight: 800, color: '#475569' }}>Slug / Path</th>
              <th style={{ fontWeight: 800, color: '#475569', textAlign: 'center' }}>Item Count</th>
              <th style={{ fontWeight: 800, color: '#475569', textAlign: 'center' }}>Display Order</th>
              <th style={{ fontWeight: 800, color: '#475569' }}>Status</th>
              <th style={{ fontWeight: 800, color: '#475569', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubcategories.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}
                >
                  <FolderTree size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <div style={{ fontWeight: 600 }}>No sub-categories match the current search or filters.</div>
                </td>
              </tr>
            ) : (
              filteredSubcategories.map((sub) => {
                const parent = categories.find((c) => c._id === sub.categoryId);
                const parentSlug = parent?.slug || 'womens-fashion';
                const fullSlug = `/${parentSlug}/${sub.slug}`;

                return (
                  <tr key={sub._id}>
                    {/* Sub-Category Name & Image */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ overflow: 'hidden', borderRadius: '10px', flexShrink: 0 }}>
                          <img
                            src={
                              sub.image ||
                              'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=100'
                            }
                            alt={sub.name}
                            style={{
                              width: '44px',
                              height: '44px',
                              objectFit: 'cover',
                              borderRadius: '10px',
                              border: '1.5px solid #e2e8f0',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                              transition: 'transform 0.25s ease',
                              display: 'block',
                            }}
                            className="sub-img-hover"
                          />
                        </div>
                        <div>
                          <strong
                            style={{
                              fontSize: '0.92rem',
                              color: '#1e1b4b',
                              display: 'block',
                              fontWeight: 700,
                            }}
                          >
                            {sub.name}
                          </strong>
                          {sub.description && (
                            <span
                              style={{
                                fontSize: '0.76rem',
                                color: '#64748b',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                maxWidth: '280px',
                              }}
                            >
                              {sub.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Parent Department */}
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem',
                          padding: '0.28rem 0.7rem',
                          borderRadius: '8px',
                          background: '#ede8f8',
                          color: '#5b21b6',
                          fontWeight: 700,
                          border: '1px solid #ddd6fe',
                        }}
                      >
                        {parent?.icon || '📁'} {parent?.name || sub.categoryName}
                      </span>
                    </td>

                    {/* Slug / Path with 1-Click Copy Button */}
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <code
                          style={{
                            fontSize: '0.78rem',
                            padding: '0.22rem 0.55rem',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                          }}
                        >
                          {fullSlug}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => handleCopySlug(fullSlug, e)}
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
                            transition: 'all 0.15s ease',
                          }}
                          title="Copy slug path"
                        >
                          <Copy size={12} />
                        </button>
                      </div>
                    </td>

                    {/* Item Count */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 700,
                          fontSize: '0.83rem',
                          color: '#1e1b4b',
                          background: '#f5f3ff',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #ddd6fe',
                        }}
                      >
                        <Package size={14} color="#7c3aed" />
                        {sub.itemCount || 0} products
                      </span>
                    </td>

                    {/* Display Order */}
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          minWidth: '28px',
                          textAlign: 'center',
                          padding: '0.18rem 0.55rem',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          color: '#475569',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        }}
                      >
                        #{sub.displayOrder || 1}
                      </span>
                    </td>

                    {/* Status Toggle */}
                    <td>
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
                          className={`adm-status-pill ${
                            sub.status === 'active'
                              ? 'adm-status-delivered'
                              : 'adm-status-cancelled'
                          }`}
                          style={{ cursor: 'pointer', fontWeight: 700 }}
                        >
                          {sub.status === 'active' ? '● Active' : '○ Inactive'}
                        </span>
                      </button>
                    </td>

                    {/* Compact Actions Group */}
                    <td>
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
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #bfdbfe',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="View Details"
                        >
                          <Eye size={13} color="#1d4ed8" />
                          <span>View</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sub)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '8px',
                            border: '1px solid #ddd6fe',
                            background: '#f5f3ff',
                            color: '#6d28d9',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Edit Sub-Category"
                        >
                          <Edit2 size={13} color="#6d28d9" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(sub._id, sub.name)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.35rem 0.55rem',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Delete Sub-Category"
                        >
                          <Trash2 size={13} color="#dc2626" />
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

      {/* ─── 1. Add / Edit Sub-Category Modal ──────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Sub-Category: ${editingItem.name}` : 'Add New Sub-Category'}
      >
        <form onSubmit={handleSubmit}>
          {/* Parent Department Selection */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Parent Department / Category *
            </label>
            <select
              className="form-input"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Sub-category will be grouped under this department and inherit its specifications.
            </span>
          </div>

          {/* Name & Slug */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Sub-Category Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Sarees or Wireless Chargers"
                className="form-input"
                value={formData.name}
                onChange={handleNameChange}
                required
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Slug / URL Key *
              </label>
              <input
                type="text"
                placeholder="e.g. sarees or wireless-chargers"
                className="form-input"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Description
            </label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Brief description for collection banners and search engines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Image URL & Preview */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 700 }}>
              Thumbnail Image URL
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                className="form-input"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                style={{ flex: 1 }}
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #cbd5e1',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>

          {/* Display Order & Status */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Display Order
              </label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 700 }}>
                Status
              </label>
              <select
                className="form-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active (Visible on Store)</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {editingItem ? 'Save Changes' : 'Create Sub-Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── 2. Manage Category Specs / Characteristics Modal ─────────────── */}
      <Modal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        title={`Department Specifications: ${specsCategory?.name || ''}`}
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.35rem' }}>
          <div
            style={{
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <Sparkles size={20} color="#7c3aed" />
            <span style={{ fontSize: '0.82rem', color: '#5b21b6' }}>
              These attributes (e.g. Fabric, Size, Material, Battery) dynamically generate input
              fields when creating products under <strong>{specsCategory?.name}</strong>.
            </span>
          </div>

          {/* Current Configured Specs List */}
          <div
            style={{
              marginBottom: '1.5rem',
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b' }}>
                Configured Attributes ({specsList.length})
              </h4>
            </div>

            {specsList.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  color: '#94a3b8',
                  fontStyle: 'italic',
                }}
              >
                No specifications defined yet. Add custom attributes using the form below.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {specsList.map((spec, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong style={{ fontSize: '0.88rem', color: '#1e1b4b' }}>
                        {spec.name || spec.key}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
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
                            padding: '0.1rem 0.35rem',
                            borderRadius: '3px',
                          }}
                        >
                          *Required
                        </span>
                      )}
                      {spec.values && spec.values.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {spec.values.map((v, vIdx) => (
                            <span
                              key={vIdx}
                              style={{
                                fontSize: '0.72rem',
                                background: '#f1f5f9',
                                color: '#475569',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '3px',
                                border: '1px solid #cbd5e1',
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
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '0.25rem',
                      }}
                      title="Remove specification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Spec Sub-Form */}
          <div
            style={{
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.92rem', color: '#0f172a' }}>
              + Add New Department Specification
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Attribute Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Size, Fabric, Battery Capacity"
                  className="form-input"
                  value={newSpec.name}
                  onChange={(e) => setNewSpec({ ...newSpec, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Input Field Type *
                </label>
                <select
                  className="form-input"
                  value={newSpec.type}
                  onChange={(e) => setNewSpec({ ...newSpec, type: e.target.value })}
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
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  Options / Values (Comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL, XXL or Pure Cotton, Soft Silk, Rayon"
                  className="form-input"
                  value={newSpec.valuesInput}
                  onChange={(e) => setNewSpec({ ...newSpec, valuesInput: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  Separate individual options with commas.
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.85rem',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
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
                className="btn btn-secondary btn-sm"
                style={{ background: '#7c3aed', color: '#fff', border: 'none' }}
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
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>👁️</span>
              <strong style={{ fontSize: '0.88rem', color: '#334155' }}>
                Live Add Product Form Preview
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                (Simulates how these attributes render in Add Product form)
              </span>
            </div>

            {specsList.length === 0 ? (
              <p
                style={{
                  fontSize: '0.8rem',
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                }}
              >
                {specsList.map((spec, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    <label
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'block',
                        marginBottom: '0.35rem',
                        color: '#1e293b',
                      }}
                    >
                      {spec.name || spec.key}{' '}
                      {spec.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>

                    {spec.type === 'select' && (
                      <select
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '0.4rem' }}
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
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
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
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: isChecked ? '#7c3aed' : '#cbd5e1',
                                background: isChecked ? '#ede8f8' : '#f8fafc',
                                color: isChecked ? '#5b21b6' : '#475569',
                                cursor: 'pointer',
                                fontWeight: isChecked ? 700 : 400,
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
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '0.4rem' }}
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
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '0.4rem' }}
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
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                            fontSize: '0.75rem',
                            padding: '0.3rem',
                            borderRadius: '4px',
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
                            fontWeight: 600,
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
                            fontSize: '0.75rem',
                            padding: '0.3rem',
                            borderRadius: '4px',
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
                            fontWeight: 600,
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
              gap: '0.75rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsSpecsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <Button
              type="button"
              variant="primary"
              loading={specsLoading}
              onClick={handleSaveSpecs}
            >
              Save Department Specs
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── 3. View Sub-Category Details Modal ────────────────────────────── */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={viewingItem ? `Sub-Category: ${viewingItem.name}` : 'Details'}
      >
        {viewingItem && (
          <div>
            <div
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                marginBottom: '1.5rem',
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <img
                src={
                  viewingItem.image ||
                  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'
                }
                alt={viewingItem.name}
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid #cbd5e1',
                }}
              />
              <div>
                <h3
                  style={{
                    margin: '0 0 0.25rem',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#1e1b4b',
                  }}
                >
                  {viewingItem.name}
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '6px',
                      background: '#ede8f8',
                      color: '#5b21b6',
                      fontWeight: 700,
                    }}
                  >
                    Department: {viewingItem.categoryName}
                  </span>
                  <span
                    className={`adm-status-pill ${
                      viewingItem.status === 'active'
                        ? 'adm-status-delivered'
                        : 'adm-status-cancelled'
                    }`}
                  >
                    {viewingItem.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  SLUG PATH
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1b4b', marginTop: '0.2rem' }}>
                  /{viewingItem.slug}
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  ITEMS CATALOGED
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1b4b', marginTop: '0.2rem' }}>
                  {viewingItem.itemCount || 0} Products
                </div>
              </div>

              <div
                style={{
                  background: '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  DISPLAY ORDER
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e1b4b', marginTop: '0.2rem' }}>
                  #{viewingItem.displayOrder || 1}
                </div>
              </div>
            </div>

            {viewingItem.description && (
              <div style={{ marginBottom: '1.5rem' }}>
                <strong
                  style={{
                    fontSize: '0.82rem',
                    color: '#475569',
                    display: 'block',
                    marginBottom: '0.35rem',
                  }}
                >
                  Description:
                </strong>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.88rem',
                    color: '#1e1b4b',
                    lineHeight: 1.5,
                    background: '#f8fafc',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {viewingItem.description}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(viewingItem);
                }}
                className="btn btn-primary"
              >
                <Edit2 size={14} style={{ marginRight: '0.35rem' }} />
                Edit Sub-Category
              </button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
