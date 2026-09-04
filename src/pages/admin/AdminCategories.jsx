import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { categoryService } from '../../services/category.service';
import { adminService } from '../../services/admin.service';
import { useUiStore } from '../../store/uiStore';

export default function AdminCategories() {
  const { showToast } = useUiStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      const res = await categoryService.list();
      setCategories(res?.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCategory(c);
    setFormData({ name: c.name || '', description: c.description || '' });
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('description', formData.description.trim());
    if (imageFile) payload.append('image', imageFile);

    try {
      setModalLoading(true);
      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, payload);
        showToast('Category updated successfully', 'success');
      } else {
        await adminService.createCategory(payload);
        showToast('Category created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save category', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this category?')) return;
    try {
      await adminService.deleteCategory(id);
      showToast('Category deactivated', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to deactivate category', 'error');
    }
  };

  return (
    <AdminLayout title="Category Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0 }}>Organize your store collections and promotional department banners.</p>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          + Add New Category
        </button>
      </div>

      {loading ? (
        <Spinner size={36} />
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={c.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100'}
                        alt={c.name}
                        style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <strong style={{ fontSize: '0.92rem' }}>{c.name}</strong>
                    </div>
                  </td>
                  <td><code>/{c.slug}</code></td>
                  <td>{c.description || '—'}</td>
                  <td>
                    <span style={{ color: c.isActive ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEdit(c)} className="btn btn-secondary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="btn btn-danger btn-sm">
                        Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Category Name"
            placeholder="e.g. Smart Electronics"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Short description for collection cards..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category Banner Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
