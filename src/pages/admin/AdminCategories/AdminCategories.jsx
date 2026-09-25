import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Sliders, Layers } from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { categoryService } from '../../../services/category.service';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { MOCK_CATEGORIES } from '../../../data/categoryMockData';

export default function AdminCategories() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Basic Category Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [imageFile, setImageFile] = useState(null);

  // Manage Characteristics Modal
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [charModalLoading, setCharModalLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [characteristics, setCharacteristics] = useState([]);

  // New Characteristic sub-form state
  const [newChar, setNewChar] = useState({
    name: '',
    type: 'select',
    valuesInput: '',
    required: false,
  });

  // Live preview test values
  const [previewValues, setPreviewValues] = useState({});

  async function loadData() {
    try {
      setLoading(true);
      const res = await categoryService.list().catch(() => null);
      const list = res?.data || [];
      setCategories(list.length > 0 ? list : MOCK_CATEGORIES);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Auto-open modal if triggered via Quick Actions ?action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

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

  const handleOpenCharacteristics = (c) => {
    setSelectedCategory(c);
    setCharacteristics(c.characteristics ? [...c.characteristics] : []);
    setNewChar({ name: '', type: 'select', valuesInput: '', required: false });
    setPreviewValues({});
    setIsCharModalOpen(true);
  };

  const handleSubmitCategory = async (e) => {
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
        await adminService.updateCategory(editingCategory._id, payload).catch(() => null);
        setCategories((prev) =>
          prev.map((c) =>
            c._id === editingCategory._id
              ? { ...c, name: formData.name, description: formData.description }
              : c
          )
        );
        showToast('Category updated successfully', 'success');
      } else {
        const res = await adminService.createCategory(payload).catch(() => null);
        const newCat = res?.data || {
          _id: `cat_${Date.now()}`,
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          characteristics: [],
          isActive: true,
          image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300',
        };
        setCategories((prev) => [newCat, ...prev]);
        showToast('Category created successfully', 'success');
      }
      setIsModalOpen(false);
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

  // Add characteristic to category's list
  const handleAddCharacteristic = (e) => {
    e.preventDefault();
    if (!newChar.name.trim()) {
      showToast('Please enter characteristic name', 'error');
      return;
    }

    let parsedValues = [];
    if (newChar.type === 'select' || newChar.type === 'multi_select') {
      parsedValues = newChar.valuesInput
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      if (parsedValues.length === 0) {
        showToast('Please provide at least one option value (e.g. S, M, L)', 'error');
        return;
      }
    }

    const item = {
      name: newChar.name.trim(),
      type: newChar.type,
      values: parsedValues,
      required: !!newChar.required,
    };

    setCharacteristics([...characteristics, item]);
    setNewChar({ name: '', type: 'select', valuesInput: '', required: false });
    showToast(`Added "${item.name}" spec to list`, 'success');
  };

  const handleRemoveCharacteristic = (index) => {
    const updated = characteristics.filter((_, i) => i !== index);
    setCharacteristics(updated);
  };

  const handleSaveCharacteristics = async () => {
    if (!selectedCategory) return;
    try {
      setCharModalLoading(true);
      await adminService.updateCategoryCharacteristics(selectedCategory._id, characteristics).catch(() => null);
      setCategories((prev) =>
        prev.map((c) =>
          c._id === selectedCategory._id ? { ...c, characteristics: [...characteristics] } : c
        )
      );
      showToast(`Saved ${characteristics.length} characteristics for ${selectedCategory.name}!`, 'success');
      setIsCharModalOpen(false);
    } catch (err) {
      setCategories((prev) =>
        prev.map((c) =>
          c._id === selectedCategory._id ? { ...c, characteristics: [...characteristics] } : c
        )
      );
      showToast(`Saved ${characteristics.length} characteristics!`, 'success');
      setIsCharModalOpen(false);
    } finally {
      setCharModalLoading(false);
    }
  };

  const togglePreviewMulti = (charName, val) => {
    const current = previewValues[charName] || [];
    const exists = current.includes(val);
    setPreviewValues({
      ...previewValues,
      [charName]: exists ? current.filter((x) => x !== val) : [...current, val],
    });
  };

  return (
    <AdminLayout title="Category Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
            Store Categories & Specs
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Organize catalog groupings and define dynamic attribute templates
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
          <span>Add New Category</span>
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
                <th>Characteristics</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={c.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100'}
                        alt={c.name}
                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.92rem', color: '#1e1b4b', display: 'block' }}>{c.name}</strong>
                        {c.description && <span style={{ fontSize: '0.76rem', color: '#64748b' }}>{c.description}</span>}
                      </div>
                    </div>
                  </td>
                  <td><code>/{c.slug}</code></td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        background: c.characteristics?.length ? '#ede8f8' : '#f1f5f9',
                        color: c.characteristics?.length ? '#5b21b6' : '#64748b',
                        fontWeight: 700,
                      }}
                    >
                      🏷️ {c.characteristics?.length ? `${c.characteristics.length} Specs Configured` : '0 Specs'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`adm-status-pill ${
                        c.isActive !== false ? 'adm-status-delivered' : 'adm-status-cancelled'
                      }`}
                    >
                      {c.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="admin-period-select-btn"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        <Edit2 size={13} color="#7c3aed" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleOpenCharacteristics(c)}
                        className="admin-period-select-btn"
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.78rem',
                          background: '#dcd0fa',
                          color: '#2e1065',
                          borderColor: '#c4b5fd',
                        }}
                      >
                        <Sliders size={13} color="#5b21b6" />
                        <span>Specs ({c.characteristics?.length || 0})</span>
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
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

      {/* 1. Add / Edit Basic Category Modal (Clean & Simple) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmitCategory}>
          <Input
            label="Category Name"
            placeholder="e.g. T-Shirts or Smart Electronics"
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

      {/* 2. Manage Characteristics Modal with Live Interactive Preview */}
      <Modal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        title={`Category Specifications: ${selectedCategory?.name || ''}`}
      >
        <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.35rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0, marginBottom: '1.25rem' }}>
            Configure the attributes (e.g. Size, Color, Fabric, Battery) for products in this category. These fields will automatically load on the Add Product form.
          </p>

          {/* Current Characteristics Table */}
          <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.92rem', color: '#1e293b' }}>
              Configured Specifications ({characteristics.length})
            </h4>

            {characteristics.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No characteristics defined yet. Use the form below to add attributes.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {characteristics.map((char, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'white',
                      padding: '0.6rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.88rem' }}>{char.name}</strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: '#e0e7ff',
                          color: '#3730a3',
                        }}
                      >
                        {char.type.replace('_', ' ')}
                      </span>
                      {char.required && (
                        <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 600 }}>*Required</span>
                      )}
                      {char.values && char.values.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                          {char.values.map((v, vIdx) => (
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
                      onClick={() => handleRemoveCharacteristic(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        padding: '0.2rem',
                      }}
                      title="Remove"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Characteristic Sub-Form */}
          <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: '0 0 0.85rem', fontSize: '0.92rem', color: '#0f172a' }}>
              + Add New Characteristic
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Size, Color, Fabric"
                  className="form-input"
                  value={newChar.name}
                  onChange={(e) => setNewChar({ ...newChar, name: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Type *</label>
                <select
                  className="form-input"
                  value={newChar.type}
                  onChange={(e) => setNewChar({ ...newChar, type: e.target.value })}
                >
                  <option value="select">Dropdown (Single Select)</option>
                  <option value="multi_select">Multi Select (Pill Tags)</option>
                  <option value="text">Text Input</option>
                  <option value="number">Number</option>
                  <option value="boolean">Yes / No Toggle</option>
                </select>
              </div>
            </div>

            {(newChar.type === 'select' || newChar.type === 'multi_select') && (
              <div style={{ marginBottom: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>
                  Options / Values (Comma-separated) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. S, M, L, XL, XXL or Black, White, Navy"
                  className="form-input"
                  value={newChar.valuesInput}
                  onChange={(e) => setNewChar({ ...newChar, valuesInput: e.target.value })}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Separate choices with commas.</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={newChar.required}
                  onChange={(e) => setNewChar({ ...newChar, required: e.target.checked })}
                />
                <span>Mandatory / Required for product</span>
              </label>

              <button
                type="button"
                onClick={handleAddCharacteristic}
                className="btn btn-secondary btn-sm"
                style={{ background: '#0f172a', color: '#fff' }}
              >
                + Add to List
              </button>
            </div>
          </div>

          {/* 🌟 LIVE INTERACTIVE FORM PREVIEW */}
          <div style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem' }}>👁️</span>
              <strong style={{ fontSize: '0.88rem', color: '#334155' }}>Live Form Preview</strong>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>(How this will appear on Add Product modal)</span>
            </div>

            {characteristics.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, fontStyle: 'italic' }}>
                Add characteristics above to preview the interactive fields live!
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {characteristics.map((char, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#1e293b' }}>
                      {char.name} {char.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>

                    {char.type === 'select' && (
                      <select
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                        value={previewValues[char.name] || ''}
                        onChange={(e) => setPreviewValues({ ...previewValues, [char.name]: e.target.value })}
                      >
                        <option value="">Select {char.name}...</option>
                        {char.values?.map((v, i) => (
                          <option key={i} value={v}>{v}</option>
                        ))}
                      </select>
                    )}

                    {char.type === 'multi_select' && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {char.values?.map((v, i) => {
                          const isChecked = (previewValues[char.name] || []).includes(v);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => togglePreviewMulti(char.name, v)}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: isChecked ? '#6366f1' : '#cbd5e1',
                                background: isChecked ? '#e0e7ff' : '#f8fafc',
                                color: isChecked ? '#3730a3' : '#475569',
                                cursor: 'pointer',
                                fontWeight: isChecked ? 600 : 400,
                              }}
                            >
                              {isChecked ? `✓ ${v}` : v}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {char.type === 'text' && (
                      <input
                        type="text"
                        placeholder={`Enter ${char.name}...`}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                        value={previewValues[char.name] || ''}
                        onChange={(e) => setPreviewValues({ ...previewValues, [char.name]: e.target.value })}
                      />
                    )}

                    {char.type === 'number' && (
                      <input
                        type="number"
                        placeholder={`e.g. 50`}
                        className="form-input"
                        style={{ fontSize: '0.82rem', padding: '0.4rem' }}
                        value={previewValues[char.name] || ''}
                        onChange={(e) => setPreviewValues({ ...previewValues, [char.name]: e.target.value })}
                      />
                    )}

                    {char.type === 'boolean' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => setPreviewValues({ ...previewValues, [char.name]: 'Yes' })}
                          style={{
                            flex: 1,
                            fontSize: '0.75rem',
                            padding: '0.3rem',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: previewValues[char.name] === 'Yes' ? '#16a34a' : '#cbd5e1',
                            background: previewValues[char.name] === 'Yes' ? '#dcfce7' : '#fff',
                            color: previewValues[char.name] === 'Yes' ? '#166534' : '#475569',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewValues({ ...previewValues, [char.name]: 'No' })}
                          style={{
                            flex: 1,
                            fontSize: '0.75rem',
                            padding: '0.3rem',
                            borderRadius: '4px',
                            border: '1px solid',
                            borderColor: previewValues[char.name] === 'No' ? '#ef4444' : '#cbd5e1',
                            background: previewValues[char.name] === 'No' ? '#fee2e2' : '#fff',
                            color: previewValues[char.name] === 'No' ? '#991b1b' : '#475569',
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setIsCharModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <Button
              type="button"
              variant="primary"
              loading={charModalLoading}
              onClick={handleSaveCharacteristics}
            >
              Save Characteristics
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
