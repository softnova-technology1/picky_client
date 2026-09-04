import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { productService } from '../../services/product.service';
import { categoryService } from '../../services/category.service';
import { adminService } from '../../services/admin.service';
import { useUiStore } from '../../store/uiStore';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminProducts() {
  const { showToast } = useUiStore();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    discountPrice: '',
    description: '',
    tags: '',
    stock: '50',
    isFeatured: false,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  async function loadData() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.list({ limit: 100 }),
        categoryService.list(),
      ]);
      setProducts(prodRes?.data?.data || prodRes?.data || []);
      setCategories(catRes?.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?._id || '',
      price: '',
      discountPrice: '',
      description: '',
      tags: '',
      stock: '50',
      isFeatured: false,
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      category: p.category?._id || p.category || '',
      price: p.price ? String(p.price) : '',
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      description: p.description || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      stock: '50',
      isFeatured: !!p.isFeatured,
    });
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category) {
      showToast('Please fill in required product fields', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('category', formData.category);
    payload.append('price', Number(formData.price));
    if (formData.discountPrice) payload.append('discountPrice', Number(formData.discountPrice));
    payload.append('description', formData.description.trim());
    payload.append('isFeatured', formData.isFeatured);

    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    tagsArray.forEach((t) => payload.append('tags[]', t));

    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        payload.append('images', file);
      }
    }

    try {
      setModalLoading(true);
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await adminService.createProduct(payload);
        showToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await adminService.deleteProduct(id);
      showToast('Product deactivated', 'info');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to deactivate product', 'error');
    }
  };

  return (
    <AdminLayout title="Product Catalog Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <p style={{ margin: 0 }}>Manage store inventory, prices, and high-resolution product photos.</p>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          + Add New Product
        </button>
      </div>

      {loading ? (
        <Spinner size={36} />
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Discount Price</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                        alt={p.name}
                        style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.92rem', display: 'block' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.category?.name || 'Uncategorized'}</td>
                  <td><strong>{formatPrice(p.price)}</strong></td>
                  <td>
                    {p.discountPrice ? (
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{formatPrice(p.discountPrice)}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td>{p.isFeatured ? '⭐ Yes' : 'No'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEdit(p)} className="btn btn-secondary btn-sm">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="btn btn-danger btn-sm">
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

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth={620}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Product Name"
            placeholder="e.g. AeroSound Pro Wireless Headphones"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-select"
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <Input
              label="Regular Price (Rs.)"
              type="number"
              placeholder="e.g. 3999"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Discount Price (Rs., Optional)"
              type="number"
              placeholder="e.g. 2499"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              rows={3}
              className="form-textarea"
              placeholder="Detailed description of features and specs..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <Input
            label="Tags (Comma-separated)"
            placeholder="e.g. wireless, headphones, anc, audio"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />

          <div className="form-group">
            <label className="form-label">Product Images (Upload)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              className="form-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            />
            <label htmlFor="isFeatured" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
              Show on Featured / Trending list
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={modalLoading}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
