import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  ImageOff,
  CheckCircle2,
  XCircle,
  UploadCloud,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { categoryService } from '../../../services/category.service';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { useCategoryStore } from '../../../store/categoryStore';

export default function AdminCategories() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Category Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });

  // Direct S3 Image Upload State
  const [imageUploading, setImageUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        categoryService.list({ all: true }).catch(() => null),
        adminService.getSubCategories().catch(() => null),
      ]);
      const list = catRes ? catRes.data || [] : [];
      const subs = subRes ? subRes.data || [] : [];
      setCategories(list);
      setSubcategories(subs);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Compute subcategory count per category ID
  const subCountMap = useMemo(() => {
    const map = {};
    (subcategories || []).forEach((s) => {
      const cId = String(s.categoryId?._id || s.categoryId || '');
      if (cId) {
        map[cId] = (map[cId] || 0) + 1;
      }
    });
    return map;
  }, [subcategories]);

  // Auto-open modal if triggered via Quick Actions ?action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
    setImageUploading(false);
    setCopiedUrl(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({
      name: c.name || '',
      description: c.description || '',
      image: c.image || '',
    });
    setImageUploading(false);
    setCopiedUrl(false);
    setIsModalOpen(true);
  };

  // Direct S3 Upload Handler for Category Image
  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadPayload = new FormData();
    uploadPayload.append('image', file);

    try {
      setImageUploading(true);
      const res = await adminService.uploadCategoryImage(uploadPayload);
      const uploadedUrl = res?.data?.url || res?.url;
      if (uploadedUrl) {
        setFormData((prev) => ({ ...prev, image: uploadedUrl }));
        showToast('Image uploaded directly to S3 (picky/category)!', 'success');
      } else {
        showToast('Failed to retrieve uploaded image URL', 'error');
      }
    } catch (err) {
      console.error('Direct S3 upload failed:', err);
      showToast(err.message || 'Failed to upload image directly to S3', 'error');
    } finally {
      setImageUploading(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleCopyUrl = () => {
    if (!formData.image) return;
    navigator.clipboard.writeText(formData.image);
    setCopiedUrl(true);
    showToast('S3 URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleToggleActive = async (c) => {
    const currentActive = c.isActive !== false;
    const newStatus = !currentActive;

    // Optimistic UI update
    setCategories((prev) =>
      prev.map((item) => (item._id === c._id ? { ...item, isActive: newStatus } : item))
    );

    try {
      const payload = {
        name: c.name,
        isActive: newStatus,
      };

      await adminService.updateCategory(c._id, payload);

      // Invalidate and refresh client category store so site reflects change immediately
      useCategoryStore.setState({ fetched: false });
      useCategoryStore.getState().fetchCategories();

      showToast(`Category "${c.name}" is now ${newStatus ? 'Active' : 'Inactive'}`, 'success');
    } catch (err) {
      console.error('Failed to toggle category active status:', err);
      // Revert optimistic update on failure
      setCategories((prev) =>
        prev.map((item) => (item._id === c._id ? { ...item, isActive: currentActive } : item))
      );
      showToast('Failed to update category status', 'error');
    }
  };

  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      image: formData.image.trim(),
    };

    try {
      setModalLoading(true);
      if (editingCategory) {
        const res = await adminService.updateCategory(editingCategory._id, payload);
        const updatedCat = res?.data;
        if (updatedCat) {
          setCategories((prev) =>
            prev.map((c) => (c._id === editingCategory._id ? updatedCat : c))
          );
        }
        showToast('Category updated successfully', 'success');
      } else {
        const res = await adminService.createCategory(payload);
        const newCat = res?.data;
        if (newCat) {
          setCategories((prev) => [newCat, ...prev]);
        }
        showToast('Category created successfully', 'success');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this category?')) return;
    try {
      await adminService.deleteCategory(id).catch(() => null);
      setCategories((prev) => prev.filter((c) => c._id !== id));
      showToast('Category deactivated', 'info');
    } catch (err) {
      setCategories((prev) => prev.filter((c) => c._id !== id));
      showToast('Category deactivated', 'info');
    }
  };

  return (
    <AdminLayout title="Category Management">
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
          <h1 className="admin-page-main-title">Store Categories</h1>
          <p className="admin-page-main-subtitle">
            Organize catalog groupings and departments
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="admin-period-select-btn"
          style={{
            background: '#7c3aed',
            color: '#ffffff',
            borderColor: '#7c3aed',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          }}
        >
          <Plus size={16} />
          <span>Add New Category</span>
        </button>
      </div>

      {loading ? (
        <Spinner size={36} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {categories.map((c) => {
            const subCount = subCountMap[c._id] || 0;
            return (
              <div
                key={c._id}
                onClick={() => navigate(`/softpicky-sn2026/subcategories?category=${c._id}`)}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 58, 237, 0.12)';
                  e.currentTarget.style.borderColor = '#c4b5fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        const fallbackMap = {
                          'traditional-tamil-products': '/images/dept_traditional_tamil.jpg',
                          'home-decor': '/images/dept_home_decor.jpg',
                          'kids-products': '/images/dept_kids.jpg',
                          'fitness-products': '/images/dept_fitness.jpg',
                          'fashion': '/images/dept_fashion.jpg',
                          'womens-fashion': '/images/dept_fashion.jpg',
                          'home-kitchen': '/images/dept_home.jpg',
                          'artificial-jewellery': '/images/dept_jewellery.jpg',
                          'beauty-personal-care': '/images/dept_beauty.jpg',
                          'mobile-accessories': '/images/dept_electronics.jpg',
                          'snacks-foods': '/images/dept_snacks.jpg',
                        };
                        if (fallbackMap[c.slug]) {
                          e.currentTarget.src = fallbackMap[c.slug];
                        }
                      }}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1.5px dashed #cbd5e1',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        flexShrink: 0,
                        gap: '3px',
                      }}
                      title="No image in database"
                    >
                      <ImageOff size={18} strokeWidth={1.8} />
                      <span
                        style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          letterSpacing: '0.02em',
                        }}
                      >
                        No Image
                      </span>
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        margin: '0 0 0.25rem',
                        fontSize: '1.1rem',
                        color: '#1e1b4b',
                        fontWeight: 800,
                      }}
                    >
                      {c.name}
                    </h3>
                    <code
                      style={{
                        fontSize: '0.75rem',
                        color: '#64748b',
                        background: '#f1f5f9',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                      }}
                    >
                      /{c.slug}
                    </code>
                    <p
                      style={{
                        margin: '0.5rem 0 0',
                        fontSize: '0.82rem',
                        color: '#475569',
                        lineHeight: '1.4',
                      }}
                    >
                      {c.description
                        ? c.description.length > 60
                          ? c.description.substring(0, 60) + '...'
                          : c.description
                        : 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Subcategories Count and Status */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.85rem',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.76rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      background: subCount > 0 ? '#f3e8ff' : '#f1f5f9',
                      color: subCount > 0 ? '#7c3aed' : '#64748b',
                      fontWeight: 700,
                    }}
                  >
                    <Layers size={13} style={{ color: subCount > 0 ? '#7c3aed' : '#94a3b8' }} />
                    {subCount} {subCount === 1 ? 'Subcategory' : 'Subcategories'}
                  </span>

                  <span
                    className={`adm-status-pill ${
                      c.isActive !== false ? 'adm-status-delivered' : 'adm-status-cancelled'
                    }`}
                    style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}
                  >
                    {c.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(c);
                    }}
                    className="admin-period-select-btn"
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      fontSize: '0.78rem',
                      justifyContent: 'center',
                    }}
                  >
                    <Edit2 size={13} color="#7c3aed" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(c);
                    }}
                    className="admin-period-select-btn"
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      fontSize: '0.78rem',
                      background: c.isActive !== false ? '#dcfce7' : '#fee2e2',
                      color: c.isActive !== false ? '#15803d' : '#b91c1c',
                      borderColor: c.isActive !== false ? '#bbf7d0' : '#fecaca',
                      justifyContent: 'center',
                      fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    title={c.isActive !== false ? 'Click to make Inactive' : 'Click to make Active'}
                  >
                    {c.isActive !== false ? (
                      <>
                        <CheckCircle2 size={13} color="#16a34a" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={13} color="#dc2626" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(c._id);
                    }}
                    className="admin-period-select-btn"
                    style={{ padding: '0.4rem', fontSize: '0.78rem', color: '#dc2626' }}
                  >
                    <Trash2 size={13} color="#dc2626" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal with Direct S3 Upload */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmitCategory}>
          <Input
            label="Category Name"
            placeholder="e.g. Traditional Products or Fashion"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Short description for collection cards..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* S3 Image Direct Upload Section */}
          <div
            className="form-group"
            style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <label
              className="form-label"
              style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                marginBottom: '0.85rem',
              }}
            >
              <UploadCloud size={16} color="#7c3aed" />
              <span>Category Banner Image (Direct S3 Upload)</span>
            </label>

            {/* Direct Upload Trigger */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 1rem',
                  borderRadius: '8px',
                  background: imageUploading ? '#cbd5e1' : '#7c3aed',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: imageUploading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s ease',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                }}
              >
                {imageUploading ? (
                  <>
                    <Spinner size={16} color="#ffffff" />
                    <span>Uploading directly to S3...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Choose Image & Upload to S3</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={imageUploading}
                  onChange={handleImageFileSelect}
                  style={{ display: 'none' }}
                />
              </label>

              {formData.image && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  style={{
                    background: 'transparent',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.8rem',
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  Clear Image
                </button>
              )}
            </div>

            {/* S3 URL Display Input */}
            <div style={{ marginBottom: '0.85rem' }}>
              <label
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#475569',
                  display: 'block',
                  marginBottom: '0.35rem',
                }}
              >
                S3 Image URL:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="https://picky-e-com.s3.ap-southeast-1.amazonaws.com/picky/category/..."
                  className="form-input"
                  style={{
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    background: '#ffffff',
                    color: '#0f172a',
                    flex: 1,
                  }}
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                {formData.image && (
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="admin-period-select-btn"
                    style={{
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.78rem',
                      flexShrink: 0,
                    }}
                    title="Copy S3 URL"
                  >
                    {copiedUrl ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Image Preview if URL is available */}
            {formData.image && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginTop: '0.5rem',
                }}
              >
                <img
                  src={formData.image}
                  alt="Category Banner Preview"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #cbd5e1',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#166534' }}>
                      Active S3 Image Loaded
                    </span>
                  </div>
                  <a
                    href={formData.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.75rem',
                      color: '#7c3aed',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      wordBreak: 'break-all',
                    }}
                  >
                    <span>View uploaded image</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              marginTop: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={modalLoading || imageUploading}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
