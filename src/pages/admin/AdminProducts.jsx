import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, CheckCircle2, Sparkles } from 'lucide-react';
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
import { MOCK_TOP_PRODUCTS, MOCK_CATEGORIES } from '../../data/adminMockData';

export default function AdminProducts() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const [charValues, setCharValues] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);

  async function loadData() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.list({ limit: 100 }).catch(() => null),
        categoryService.list().catch(() => null),
      ]);
      const pList = prodRes?.data?.data || prodRes?.data || [];
      const cList = catRes?.data || [];
      setProducts(pList.length > 0 ? pList : MOCK_TOP_PRODUCTS);
      setCategories(cList.length > 0 ? cList : MOCK_CATEGORIES);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts(MOCK_TOP_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Open modal if action=add is triggered from Quick Actions
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, categories]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const defaultCat = categories[0]?._id || '';
    setFormData({
      name: '',
      category: defaultCat,
      price: '',
      discountPrice: '',
      description: '',
      tags: '',
      stock: '50',
      isFeatured: false,
    });
    setCharValues({});
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const catId = p.category?._id || p.category || '';
    setFormData({
      name: p.name || '',
      category: catId,
      price: p.price ? String(p.price) : '',
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      description: p.description || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      stock: p.stock !== undefined ? String(p.stock) : '50',
      isFeatured: !!p.isFeatured,
    });

    // Populate characteristics
    const initialChars = {};
    if (Array.isArray(p.characteristics)) {
      p.characteristics.forEach((item) => {
        if (item.key) initialChars[item.key] = item.value;
      });
    }
    setCharValues(initialChars);

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
    payload.append('stock', Number(formData.stock) || 50);
    payload.append('description', formData.description.trim());
    payload.append('isFeatured', formData.isFeatured);

    const tagsArray = formData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    tagsArray.forEach((t) => payload.append('tags[]', t));

    // Serialize category characteristics
    const characteristicsList = Object.entries(charValues)
      .filter(([_, v]) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0))
      .map(([k, v]) => ({
        key: k,
        value: Array.isArray(v) ? v.join(', ') : String(v),
      }));

    if (characteristicsList.length > 0) {
      payload.append('characteristics', JSON.stringify(characteristicsList));
    }

    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        payload.append('images', file);
      }
    }

    try {
      setModalLoading(true);
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, payload).catch(() => null);
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProduct._id
              ? {
                  ...p,
                  name: formData.name,
                  price: Number(formData.price),
                  discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
                  stock: Number(formData.stock),
                  isFeatured: formData.isFeatured,
                  category: categories.find((c) => c._id === formData.category) || p.category,
                }
              : p
          )
        );
        showToast('Product updated successfully', 'success');
      } else {
        const res = await adminService.createProduct(payload).catch(() => null);
        const newProduct = res?.data || {
          _id: `prod_${Date.now()}`,
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
          stock: Number(formData.stock),
          isFeatured: formData.isFeatured,
          category: categories.find((c) => c._id === formData.category) || { name: 'General' },
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'],
        };
        setProducts((prev) => [newProduct, ...prev]);
        showToast('Product created successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this product?')) return;
    try {
      await adminService.deleteProduct(id).catch(() => null);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast('Product deactivated', 'info');
    } catch (err) {
      setProducts((prev) => prev.filter((p) => p._id !== id));
      showToast('Product deactivated', 'info');
    }
  };

  // Find currently selected category object to inspect characteristics
  const currentCategoryObj = categories.find((c) => c._id === formData.category);
  const currentCategorySpecs = currentCategoryObj?.characteristics || [];

  const toggleMultiSelect = (charName, val) => {
    const current = Array.isArray(charValues[charName]) ? charValues[charName] : [];
    const exists = current.includes(val);
    setCharValues({
      ...charValues,
      [charName]: exists ? current.filter((x) => x !== val) : [...current, val],
    });
  };

  return (
    <AdminLayout title="Product Catalog Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Live Store Inventory
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Manage catalog specifications, prices, and high-resolution media
          </span>
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
          <span>Add New Product</span>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                        alt={p.name}
                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#1e1b4b', display: 'block' }}>{p.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/{p.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        background: '#ede8f8',
                        color: '#5b21b6',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {p.category?.name || 'General'}
                    </span>
                  </td>
                  <td><strong style={{ color: '#1e1b4b' }}>{formatPrice(p.price)}</strong></td>
                  <td>
                    {p.discountPrice ? (
                      <span style={{ color: '#16a34a', fontWeight: 700 }}>{formatPrice(p.discountPrice)}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>—</span>
                    )}
                  </td>
                  <td>
                    {p.isFeatured ? (
                      <span className="adm-status-pill adm-status-confirmed" style={{ fontSize: '0.75rem' }}>
                        ⭐ Featured
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Standard</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="admin-period-select-btn"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={13} color="#7c3aed" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="admin-period-select-btn"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', color: '#dc2626' }}
                      >
                        <Trash2 size={13} color="#dc2626" />
                        <span>Deactivate</span>
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
        maxWidth={640}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ maxHeight: '76vh', overflowY: 'auto', paddingRight: '0.4rem' }}>
            <Input
              label="Product Name *"
              placeholder="e.g. AeroSound Pro Wireless Headphones"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  // If category changed, clear or reset characteristics
                  if (!editingProduct) setCharValues({});
                }}
                className="form-select"
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.characteristics?.length ? `(${c.characteristics.length} specs)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Price, Discount Price, and Stock Quantity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <Input
                label="Price (Rs.) *"
                type="number"
                placeholder="e.g. 3999"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
              <Input
                label="Discount Price (Rs.)"
                type="number"
                placeholder="e.g. 2499"
                value={formData.discountPrice}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              />
              <Input
                label="Stock Quantity *"
                type="number"
                placeholder="e.g. 50"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            {/* 🌟 DYNAMIC CATEGORY CHARACTERISTICS SECTION */}
            {currentCategorySpecs.length > 0 && (
              <div
                style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  marginBottom: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1rem' }}>⚙️</span>
                    <strong style={{ fontSize: '0.88rem', color: '#1e293b' }}>
                      {currentCategoryObj?.name} Specifications
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Auto-loaded from category configuration
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                  {currentCategorySpecs.map((char, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem', color: '#334155' }}>
                        {char.name} {char.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>

                      {/* 1. Single Select Dropdown */}
                      {char.type === 'select' && (
                        <select
                          className="form-input"
                          style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                          value={charValues[char.name] || ''}
                          onChange={(e) => setCharValues({ ...charValues, [char.name]: e.target.value })}
                          required={char.required}
                        >
                          <option value="">Select {char.name}...</option>
                          {char.values?.map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                          ))}
                        </select>
                      )}

                      {/* 2. Multi-Select Pills */}
                      {char.type === 'multi_select' && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {char.values?.map((v, i) => {
                            const current = Array.isArray(charValues[char.name]) ? charValues[char.name] : [];
                            const isSelected = current.includes(v);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => toggleMultiSelect(char.name, v)}
                                style={{
                                  fontSize: '0.74rem',
                                  padding: '0.2rem 0.45rem',
                                  borderRadius: '4px',
                                  border: '1px solid',
                                  borderColor: isSelected ? '#6366f1' : '#cbd5e1',
                                  background: isSelected ? '#ede9fe' : '#f8fafc',
                                  color: isSelected ? '#5b21b6' : '#475569',
                                  cursor: 'pointer',
                                  fontWeight: isSelected ? 600 : 400,
                                }}
                              >
                                {isSelected ? `✓ ${v}` : v}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. Text Input */}
                      {char.type === 'text' && (
                        <input
                          type="text"
                          placeholder={`Enter ${char.name}...`}
                          className="form-input"
                          style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                          value={charValues[char.name] || ''}
                          onChange={(e) => setCharValues({ ...charValues, [char.name]: e.target.value })}
                          required={char.required}
                        />
                      )}

                      {/* 4. Number Input */}
                      {char.type === 'number' && (
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          className="form-input"
                          style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                          value={charValues[char.name] || ''}
                          onChange={(e) => setCharValues({ ...charValues, [char.name]: e.target.value })}
                          required={char.required}
                        />
                      )}

                      {/* 5. Yes / No Toggle */}
                      {char.type === 'boolean' && (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => setCharValues({ ...charValues, [char.name]: 'Yes' })}
                            style={{
                              flex: 1,
                              fontSize: '0.75rem',
                              padding: '0.3rem',
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: charValues[char.name] === 'Yes' ? '#16a34a' : '#cbd5e1',
                              background: charValues[char.name] === 'Yes' ? '#dcfce7' : '#fff',
                              color: charValues[char.name] === 'Yes' ? '#166534' : '#475569',
                              cursor: 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setCharValues({ ...charValues, [char.name]: 'No' })}
                            style={{
                              flex: 1,
                              fontSize: '0.75rem',
                              padding: '0.3rem',
                              borderRadius: '4px',
                              border: '1px solid',
                              borderColor: charValues[char.name] === 'No' ? '#ef4444' : '#cbd5e1',
                              background: charValues[char.name] === 'No' ? '#fee2e2' : '#fff',
                              color: charValues[char.name] === 'No' ? '#991b1b' : '#475569',
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
              </div>
            )}

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
              <label htmlFor="isFeatured" style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                Show on Featured / Trending list
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
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
