import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Package,
  PackageCheck,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Star,
  Eye,
  Download,
  Search,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import { productService } from '../../../services/product.service';
import { categoryService } from '../../../services/category.service';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_SUBCATEGORIES } from '../../../data';

const PREDEFINED_TAGS = [
  'Traditional', 'Handloom', 'Cotton', 'Festive', 'Premium', 
  'Silk', 'Daily Wear', 'Party Wear', 'Organic'
];

export default function AdminProducts() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'table' | 'form'
  const [viewMode, setViewMode] = useState('table');
  const [modalLoading, setModalLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Filters and Tabs State
  const [activeTab, setActiveTab] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStock, setFilterStock] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filterCategory, filterStock, searchQuery]);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    sku: '',
    price: '',
    discountPrice: '',
    description: '',
    tags: '',
    stock: '',
    isFeatured: false,
    isActive: true,
  });

  const [charValues, setCharValues] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [primaryPreview, setPrimaryPreview] = useState(null);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);

  async function loadData() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.list({ limit: 100 }).catch(() => null),
        categoryService.list().catch(() => null),
      ]);
      const pList = prodRes?.data?.data || prodRes?.data || [];
      const cList = catRes?.data || [];
      setProducts(pList.length > 0 ? pList : MOCK_PRODUCTS);
      setCategories(cList.length > 0 ? cList : MOCK_CATEGORIES);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Open form workspace if action=add is triggered from Quick Actions
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAdd();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, categories]);

  const generateSku = (catIdOrName, subName) => {
    let catCode = 'PRD';
    const cat = categories.find((c) => c._id === catIdOrName || c.name === catIdOrName || c.slug === catIdOrName);
    const catName = cat?.name || (typeof catIdOrName === 'string' ? catIdOrName : '');
    
    if (catName.toLowerCase().includes('women')) catCode = 'WF';
    else if (catName.toLowerCase().includes('men')) catCode = 'MF';
    else if (catName.toLowerCase().includes('kitchen') || catName.toLowerCase().includes('home')) catCode = 'HK';
    else if (catName.toLowerCase().includes('jewel')) catCode = 'AJ';
    else if (catName.toLowerCase().includes('beauty')) catCode = 'BP';
    else if (catName.toLowerCase().includes('mobile') || catName.toLowerCase().includes('gadget')) catCode = 'MA';
    else if (catName.toLowerCase().includes('snack') || catName.toLowerCase().includes('sweet')) catCode = 'SS';
    else if (catName.toLowerCase().includes('footwear') || catName.toLowerCase().includes('shoe')) catCode = 'FW';
    else if (catName.toLowerCase().includes('toy') || catName.toLowerCase().includes('baby')) catCode = 'TK';
    else if (catName.toLowerCase().includes('bag')) catCode = 'BW';
    else if (catName) {
      catCode = catName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() || 'PRD';
    }

    let subCode = 'GEN';
    if (subName) {
      subCode = subName.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
      if (subCode.length < 3) subCode = subCode.padEnd(3, 'X');
    }

    const randNum = String(Math.floor(100 + Math.random() * 900));
    return `${catCode}-${subCode}-${randNum}`;
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    const defaultCat = categories[0]?._id || '';
    const defaultCatObj = categories.find((c) => c._id === defaultCat);
    const defaultSub = defaultCatObj?.subcategories?.[0]?.name || '';
    const defaultSku = generateSku(defaultCat, defaultSub);
    setFormData({
      name: '',
      category: defaultCat,
      subCategory: defaultSub,
      sku: defaultSku,
      price: '',
      discountPrice: '',
      description: '',
      tags: '',
      stock: '',
      isFeatured: false,
      isActive: true,
    });
    setCharValues({});
    setSelectedFiles([]);
    setPrimaryPreview(null);
    setSecondaryPreviews([]);
    setViewMode('form');
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const catId = p.category?._id || p.category || '';
    const subName = p.subCategory?.name || (typeof p.subCategory === 'string' ? p.subCategory : '');
    setFormData({
      name: p.name || '',
      category: catId,
      subCategory: subName,
      sku: p.sku || generateSku(catId, subName),
      price: p.price ? String(p.price) : '',
      discountPrice: p.discountPrice ? String(p.discountPrice) : '',
      description: p.description || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      stock: p.stock !== undefined ? String(p.stock) : '',
      isFeatured: !!p.isFeatured,
      isActive: true,
    });

    // Populate characteristics
    const initialChars = {};
    if (Array.isArray(p.characteristics)) {
      p.characteristics.forEach((item) => {
        if (item.key) initialChars[item.key] = item.value;
      });
    }
    setCharValues(initialChars);

    // Set image previews
    const imgs = p.images || (p.image ? [p.image] : []);
    setPrimaryPreview(imgs[0] || null);
    setSecondaryPreviews(imgs.slice(1));
    setSelectedFiles([]);
    setViewMode('form');
  };

  const handlePrimaryFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrimaryPreview(URL.createObjectURL(file));
      setSelectedFiles((prev) => [file, ...prev.slice(1)]);
    }
  };

  const handleSecondaryFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const remainingSlots = 10 - secondaryPreviews.length;
      if (remainingSlots <= 0) {
        showToast('Maximum 10 secondary gallery images allowed', 'warning');
        return;
      }
      const filesToAdd = files.slice(0, remainingSlots);
      const newUrls = filesToAdd.map((f) => URL.createObjectURL(f));
      setSecondaryPreviews((prev) => [...prev, ...newUrls]);
      setSelectedFiles((prev) => [...prev, ...filesToAdd]);
      if (files.length > remainingSlots) {
        showToast(`Added ${remainingSlots} images. (Limit is 10 max)`, 'info');
      }
    }
  };

  const handleSetAsCover = (index) => {
    const targetUrl = secondaryPreviews[index];
    if (!targetUrl) return;
    const oldPrimary = primaryPreview;
    setPrimaryPreview(targetUrl);
    setSecondaryPreviews((prev) => {
      const updated = [...prev];
      if (oldPrimary) {
        updated[index] = oldPrimary;
      } else {
        updated.splice(index, 1);
      }
      return updated;
    });
    showToast('Promoted gallery image to Primary Cover!', 'success');
  };

  const handleRemovePrimary = () => {
    if (secondaryPreviews.length > 0) {
      setPrimaryPreview(secondaryPreviews[0]);
      setSecondaryPreviews((prev) => prev.slice(1));
      showToast('First gallery image set as Primary Cover', 'info');
    } else {
      setPrimaryPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.discountPrice && Number(formData.discountPrice) > Number(formData.price)) {
      showToast('Selling Price cannot exceed M.R.P!', 'error');
      return;
    }
    if (!formData.name.trim() || !formData.price || !formData.category) {
      showToast('Please fill in required product fields', 'error');
      return;
    }

    const payload = new FormData();
    payload.append('name', formData.name.trim());
    payload.append('category', formData.category);
    if (formData.subCategory) payload.append('subCategory', formData.subCategory);
    if (formData.sku) payload.append('sku', formData.sku.trim().toUpperCase());
    payload.append('price', Number(formData.price));
    if (formData.discountPrice) payload.append('discountPrice', Number(formData.discountPrice));
    payload.append('stock', Number(formData.stock) || 0);
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
                  sku: formData.sku ? formData.sku.trim().toUpperCase() : p.sku,
                  price: Number(formData.price),
                  discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
                  stock: Number(formData.stock),
                  isFeatured: formData.isFeatured,
                  images: primaryPreview ? [primaryPreview, ...secondaryPreviews] : p.images,
                  category: categories.find((c) => c._id === formData.category) || p.category,
                  subCategory: { name: formData.subCategory || 'General' },
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
          sku: formData.sku ? formData.sku.trim().toUpperCase() : `PK-${Date.now().toString(36).toUpperCase()}`,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
          stock: Number(formData.stock),
          isFeatured: formData.isFeatured,
          category: categories.find((c) => c._id === formData.category) || { name: 'General' },
          subCategory: { name: formData.subCategory || 'General' },
          images: primaryPreview ? [primaryPreview, ...secondaryPreviews] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300'],
        };
        setProducts((prev) => [newProduct, ...prev]);
        showToast('Product created successfully', 'success');
      }
      setViewMode('table');
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

  const availableSubCategories = useMemo(() => {
    if (!formData.category) return [];
    if (currentCategoryObj?.subcategories && currentCategoryObj.subcategories.length > 0) {
      return currentCategoryObj.subcategories;
    }
    return MOCK_SUBCATEGORIES.filter((s) => s.categoryId === formData.category);
  }, [formData.category, currentCategoryObj]);

  const toggleMultiSelect = (charName, val) => {
    const current = Array.isArray(charValues[charName]) ? charValues[charName] : [];
    const exists = current.includes(val);
    setCharValues({
      ...charValues,
      [charName]: exists ? current.filter((x) => x !== val) : [...current, val],
    });
  };

  // Stock status formatting rules:
  // stock <= 0 (or missing/negative) -> "Out of Stock"
  // stock >= 1 && stock <= 5 -> "{stock} Left"
  // stock > 5 -> "{stock} In Stock"
  const renderStockBadge = (stock) => {
    const qty = Number(stock);
    if (isNaN(qty) || qty <= 0) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.22rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            background: '#fff1f2',
            color: '#be123c',
            border: '1px solid #ffe4e6',
            whiteSpace: 'nowrap',
          }}
        >
          Out of Stock
        </span>
      );
    }
    if (qty >= 1 && qty <= 5) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.22rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.74rem',
            fontWeight: 600,
            background: '#fffbe6',
            color: '#b45309',
            border: '1px solid #fef3c7',
            whiteSpace: 'nowrap',
          }}
        >
          {qty} Left
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.22rem 0.6rem',
          borderRadius: '9999px',
          fontSize: '0.74rem',
          fontWeight: 600,
          background: '#f0fdf4',
          color: '#15803d',
          border: '1px solid #dcfce7',
          whiteSpace: 'nowrap',
        }}
      >
        {qty} In Stock
      </span>
    );
  };

  // ─── Products Metric Calculations ─────────────────────────────────────────
  const totalProducts = products.length;
  const activeCount = useMemo(
    () => products.filter((p) => p.isActive !== false).length,
    [products]
  );
  
  const newProductsCount = useMemo(
    () => products.filter((p) => {
      const tags = Array.isArray(p.tags) ? p.tags.join(', ').toLowerCase() : typeof p.tags === 'string' ? p.tags.toLowerCase() : '';
      return tags.includes('new');
    }).length || Math.min(totalProducts, 5),
    [products]
  );

  const discountedCount = useMemo(
    () => products.filter((p) => p.price && p.discountPrice && Number(p.discountPrice) < Number(p.price)).length,
    [products]
  );

  // ─── Filter & Tab Logic ─────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Tab Filter
    if (activeTab === 'Active') result = result.filter((p) => p.isActive !== false);
    if (activeTab === 'Out of Stock') result = result.filter((p) => (Number(p.stock) || 0) <= 0);
    if (activeTab === 'Featured') result = result.filter((p) => p.isFeatured);
    if (activeTab === 'On Sale') result = result.filter((p) => p.discountPrice && Number(p.discountPrice) < Number(p.price));

    // 2. Category Filter
    if (filterCategory !== 'All') {
      result = result.filter((p) => p.category?.name === filterCategory || p.category?._id === filterCategory || p.category === filterCategory);
    }

    // 3. Stock Filter
    if (filterStock === 'In Stock') result = result.filter((p) => (Number(p.stock) || 0) > 5);
    if (filterStock === 'Low Stock') result = result.filter((p) => (Number(p.stock) || 0) >= 1 && (Number(p.stock) || 0) <= 5);
    if (filterStock === 'Out of Stock') result = result.filter((p) => (Number(p.stock) || 0) <= 0);

    // 4. Search Filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const skuMatch = p.sku?.toLowerCase().includes(q);
        const tagsStr = Array.isArray(p.tags) ? p.tags.join(' ') : (p.tags || '');
        const tagMatch = tagsStr.toLowerCase().includes(q);
        return nameMatch || skuMatch || tagMatch;
      });
    }

    return result;
  }, [products, activeTab, filterCategory, filterStock, searchQuery]);

  // Pagination Logic
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <AdminLayout title="Product Catalog Management">

      {/* ── MODE 1: FULL WORKSPACE FORM (ADD / EDIT PRODUCT) ────────────────────────── */}
      {viewMode === 'form' ? (
        <div style={{ animation: 'ordAccordionIn 0.2s ease' }}>

          {/* Top Header Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 1.1rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: '#ffffff',
                color: '#475569',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f8fafc';
                e.currentTarget.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              ← Back to Products Catalog
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
              {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 380px) 1fr',
                gap: '1.75rem',
                alignItems: 'start',
                marginBottom: '2rem',
              }}
            >
              {/* ── LEFT COLUMN: High-Impact Image Upload & Visual Gallery ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* Media Container Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '1.25rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Primary Cover Image Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem', margin: 0 }}>
                      <span style={{ color: '#7c3aed' }}>★</span> PRIMARY COVER IMAGE
                    </label>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#7c3aed', background: '#f3e8ff', padding: '0.2rem 0.55rem', borderRadius: '9999px' }}>
                      3:4 Ratio
                    </span>
                  </div>

                  {/* Primary Image Dropzone Box */}
                  <label
                    style={{
                      height: '310px',
                      borderRadius: '14px',
                      border: primaryPreview ? '1.5px solid #e2e8f0' : '2px dashed #cbd5e1',
                      background: '#f8fafc',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: primaryPreview ? '0 4px 16px rgba(0,0,0,0.04)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!primaryPreview) {
                        e.currentTarget.style.borderColor = '#7c3aed';
                        e.currentTarget.style.background = '#faf5ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!primaryPreview) {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.background = '#f8fafc';
                      }
                    }}
                  >
                    <input type="file" accept="image/*" onChange={handlePrimaryFileSelect} style={{ display: 'none' }} />

                    {primaryPreview ? (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img
                          src={primaryPreview}
                          alt="Primary Product Cover"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Top-Left Cover Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: '#7c3aed',
                            color: '#ffffff',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '9999px',
                            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            zIndex: 2,
                          }}
                        >
                          ⭐ COVER IMAGE
                        </div>

                        {/* Hover Overlay with Change & Remove options */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.65)',
                            color: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.6rem',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            zIndex: 3,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Click anywhere to change</span>
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              handleRemovePrimary();
                            }}
                            style={{
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              padding: '0.35rem 0.8rem',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            🗑️ Remove Cover
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
                        <div
                          style={{
                            width: '52px',
                            height: '52px',
                            borderRadius: '50%',
                            background: '#f1f5f9',
                            color: '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.85rem',
                          }}
                        >
                          <Sparkles size={24} />
                        </div>
                        <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', fontWeight: 700, marginBottom: '0.25rem' }}>
                          Upload Cover Image
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                          Drag & drop or click to browse
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', marginTop: '0.35rem' }}>
                          Recommended: 3:4 (e.g. 600×800px)
                        </span>
                      </div>
                    )}
                  </label>

                  {/* Secondary Gallery Images Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', marginBottom: '0.6rem' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      GALLERY IMAGES <span style={{ color: '#7c3aed', fontWeight: 700 }}>({secondaryPreviews.length}/10 MAX)</span>
                    </label>
                    <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                      Hover image to set cover
                    </span>
                  </div>

                  {/* 5-Column Compact Secondary Gallery Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                    {/* Render existing secondary previews */}
                    {secondaryPreviews.map((url, i) => (
                      <div
                        key={i}
                        style={{
                          height: '76px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          position: 'relative',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                        }}
                      >
                        <img src={url} alt={`Gallery ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        
                        {/* Index Badge */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '3px',
                            left: '3px',
                            background: 'rgba(15, 23, 42, 0.65)',
                            color: '#ffffff',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            padding: '0.1rem 0.35rem',
                            borderRadius: '4px',
                          }}
                        >
                          #{i + 1}
                        </div>

                        {/* Hover Overlay with Cover Star & Delete */}
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.75)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(i)}
                            title="Promote to Primary Cover"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#7c3aed',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                            }}
                          >
                            ⭐
                          </button>
                          <button
                            type="button"
                            onClick={() => setSecondaryPreviews((prev) => prev.filter((_, idx) => idx !== i))}
                            title="Delete Image"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#ef4444',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.72rem',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Gallery Images Tile if < 10 */}
                    {secondaryPreviews.length < 10 && (
                      <label
                        style={{
                          height: '76px',
                          borderRadius: '10px',
                          border: '1.5px dashed #cbd5e1',
                          background: '#f8fafc',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#64748b',
                          transition: 'all 0.15s ease',
                          textAlign: 'center',
                          padding: '0.2rem',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#7c3aed';
                          e.currentTarget.style.color = '#7c3aed';
                          e.currentTarget.style.background = '#faf5ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.background = '#f8fafc';
                        }}
                      >
                        <input type="file" multiple accept="image/*" onChange={handleSecondaryFileSelect} style={{ display: 'none' }} />
                        <Plus size={16} style={{ marginBottom: '0.1rem' }} />
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, lineHeight: 1.1 }}>
                          + Add ({10 - secondaryPreviews.length})
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: Structured Product Information Form Workspace ── */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.6rem 1.75rem 5.5rem',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {/* 1. Basic Details */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                    PRODUCT NAME <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pure Cotton Handloom Madurai Sungudi Saree / AeroSound Pro Headphones"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.72rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c3aed';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* 2. Detailed Description */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                    DETAILED DESCRIPTION <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Detailed product features, specifications, and washing/usage instructions..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.72rem 1rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      lineHeight: 1.5,
                      resize: 'vertical',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#7c3aed';
                      e.target.style.background = '#ffffff';
                      e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.background = '#f8fafc';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* 3. Category & Subcategory Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                      CATEGORY <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        const catObj = categories.find((c) => c._id === newCat);
                        const defaultSub = catObj?.subcategories?.[0]?.name || '';
                        const autoSku = generateSku(newCat, defaultSub);
                        setFormData((prev) => ({
                          ...prev,
                          category: newCat,
                          subCategory: defaultSub,
                          sku: autoSku,
                        }));
                        if (!editingProduct) setCharValues({});
                      }}
                      required
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                      SUBCATEGORY
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => {
                        const newSub = e.target.value;
                        const autoSku = generateSku(formData.category, newSub);
                        setFormData((prev) => ({
                          ...prev,
                          subCategory: newSub,
                          sku: autoSku,
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select Subcategory</option>
                      {availableSubCategories.map((sub, i) => (
                        <option key={sub._id || i} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. Pricing, Inventory & SKU Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', alignItems: 'start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ minHeight: '24px', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        SKU
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, sku: generateSku(prev.category, prev.subCategory) }))}
                        title="Click to re-generate auto SKU"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7c3aed',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '0 0.2rem',
                        }}
                      >
                        🔄 Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. WF-SAR-001"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        color: '#7c3aed',
                        outline: 'none',
                        boxSizing: 'border-box',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', marginTop: '0.35rem' }}>
                      Auto/Manual SKU
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ minHeight: '24px', marginBottom: '0.45rem', display: 'flex', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        M.R.P PRICE (₹) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 3999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', minHeight: '24px' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        SELLING PRICE (₹)
                      </label>
                      {formData.price && formData.discountPrice && Number(formData.price) > Number(formData.discountPrice) && (
                        <span style={{ fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                          {Math.round(((Number(formData.price) - Number(formData.discountPrice)) / Number(formData.price)) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      placeholder="e.g. 2499"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid',
                        borderColor: formData.price && formData.discountPrice && Number(formData.discountPrice) > Number(formData.price) ? '#ef4444' : '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: formData.price && formData.discountPrice && Number(formData.discountPrice) > Number(formData.price) ? '#ef4444' : '#15803d',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                    {formData.price && formData.discountPrice && Number(formData.discountPrice) > Number(formData.price) && (
                      <span style={{ fontSize: '0.7rem', color: '#ef4444', display: 'block', marginTop: '0.35rem', fontWeight: 600 }}>
                        ⚠️ Selling price cannot exceed M.R.P
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ minHeight: '24px', marginBottom: '0.45rem', display: 'flex', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        STOCK QUANTITY <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 50"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.68rem 0.9rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* 5. Dynamic Product Specifications */}
                {currentCategorySpecs.length > 0 && (
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: '1.1rem 1.25rem',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      marginTop: '0.3rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <strong style={{ fontSize: '0.78rem', color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                        {currentCategoryObj?.name} SPECIFICATIONS
                      </strong>
                      <span style={{ fontSize: '0.71rem', color: '#64748b' }}>
                        Auto-loaded from category configuration
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
                      {currentCategorySpecs.map((char, idx) => (
                        <div key={idx} style={{ background: '#ffffff', padding: '0.7rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <label style={{ fontSize: '0.74rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem', color: '#334155' }}>
                            {char.name} {char.required && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>

                          {char.type === 'select' && (
                            <select
                              style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
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
                                      fontSize: '0.72rem',
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '9999px',
                                      border: '1px solid',
                                      borderColor: isSelected ? '#7c3aed' : '#cbd5e1',
                                      background: isSelected ? '#f3e8ff' : '#ffffff',
                                      color: isSelected ? '#6d28d9' : '#475569',
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

                          {(char.type === 'text' || char.type === 'number') && (
                            <input
                              type={char.type}
                              placeholder={`e.g. ${char.name}...`}
                              style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box' }}
                              value={charValues[char.name] || ''}
                              onChange={(e) => setCharValues({ ...charValues, [char.name]: e.target.value })}
                              required={char.required}
                            />
                          )}

                          {char.type === 'boolean' && (
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => setCharValues({ ...charValues, [char.name]: 'Yes' })}
                                style={{
                                  flex: 1,
                                  fontSize: '0.75rem',
                                  padding: '0.3rem',
                                  borderRadius: '6px',
                                  border: '1px solid',
                                  borderColor: charValues[char.name] === 'Yes' ? '#16a34a' : '#cbd5e1',
                                  background: charValues[char.name] === 'Yes' ? '#dcfce7' : '#fff',
                                  color: charValues[char.name] === 'Yes' ? '#15803d' : '#475569',
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
                                  borderRadius: '6px',
                                  border: '1px solid',
                                  borderColor: charValues[char.name] === 'No' ? '#ef4444' : '#cbd5e1',
                                  background: charValues[char.name] === 'No' ? '#fff1f2' : '#fff',
                                  color: charValues[char.name] === 'No' ? '#be123c' : '#475569',
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

                {/* 6. Tags & Options */}
                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.45rem' }}>
                    TAGS (COMMA-SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. saree, traditional, cotton, festive"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.68rem 0.9rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box',
                      marginBottom: '0.6rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {PREDEFINED_TAGS.map(tag => {
                      const isSelected = formData.tags.toLowerCase().includes(tag.toLowerCase());
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            let currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                            const tagLower = tag.toLowerCase();
                            const existingIdx = currentTags.findIndex(t => t.toLowerCase() === tagLower);
                            
                            if (existingIdx >= 0) {
                              currentTags.splice(existingIdx, 1);
                            } else {
                              currentTags.push(tag);
                            }
                            setFormData({ ...formData, tags: currentTags.join(', ') });
                          }}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            border: '1px solid',
                            borderColor: isSelected ? '#7c3aed' : '#cbd5e1',
                            background: isSelected ? '#f3e8ff' : '#ffffff',
                            color: isSelected ? '#6d28d9' : '#475569',
                            cursor: 'pointer',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Checkbox Options Container */}
                <div style={{ background: '#f8fafc', padding: '0.85rem 1.1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#7c3aed', cursor: 'pointer' }}
                    />
                    ⭐ Featured Product
                  </label>

                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#7c3aed', cursor: 'pointer' }}
                    />
                    ✅ Active Status
                  </label>
                </div>
              </div>
            </div>

            {/* ── STICKY BOTTOM ACTION BAR ────────────────────────────────── */}
            <div
              style={{
                position: 'sticky',
                bottom: '1.5rem',
                zIndex: 20,
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '0.9rem 1.4rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => showToast(`Preview: ${formData.name || 'Product'} (₹${formData.discountPrice || formData.price || 0})`, 'info')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                <Eye size={16} />
                <span>Preview</span>
              </button>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={modalLoading}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.6rem',
                    borderRadius: '9999px',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: modalLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
                    opacity: modalLoading ? 0.75 : 1,
                  }}
                >
                  {modalLoading ? <Spinner size={16} color="#fff" /> : null}
                  <span>{editingProduct ? 'Save Product Changes' : 'Create Product'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* ── MODE 2: TABLE INVENTORY VIEW ─────────────────────────────────────── */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>
                Live Store Inventory
              </h2>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Manage catalog specifications, prices, and high-resolution media
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => showToast('Exporting products...', 'info')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Download size={16} />
                <span>Export</span>
              </button>
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
          </div>

          {/* ── Top 4 Metric KPI Progress Cards (Reference Design) ── */}
          <div className="kpi-progress-grid">
            <AdminStatCard
              title="TOTAL PRODUCTS"
              value={totalProducts}
              icon={<Package size={22} />}
              variant="purple"
              footerLabel="Live Catalog Volume"
              footerValue="100%"
              progress={100}
            />
            <AdminStatCard
              title="ACTIVE PRODUCTS"
              value={activeCount}
              icon={<Sparkles size={22} />}
              variant="green"
              footerLabel="Published Ratio"
              footerValue={`${totalProducts ? Math.round((activeCount / totalProducts) * 100) : 0}% Active`}
              progress={totalProducts ? (activeCount / totalProducts) * 100 : 0}
            />
            <AdminStatCard
              title="NEW PRODUCTS"
              value={newProductsCount}
              icon={<PackageCheck size={22} />}
              variant="amber"
              footerLabel="Recent Arrivals"
              footerValue={`${totalProducts ? Math.round((newProductsCount / totalProducts) * 100) : 0}% New`}
              progress={totalProducts ? (newProductsCount / totalProducts) * 100 : 0}
            />
            <AdminStatCard
              title="PRODUCTS ON SALE"
              value={discountedCount}
              icon={<TrendingUp size={22} />}
              variant="blue"
              footerLabel="Discounted Items"
              footerValue={`${totalProducts ? Math.round((discountedCount / totalProducts) * 100) : 0}% On Sale`}
              progress={totalProducts ? (discountedCount / totalProducts) * 100 : 0}
            />
          </div>

          {loading ? (
            <Spinner size={36} />
          ) : (
            <>
              {/* ── Tabs & Filters ───────────────────────────────────────── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem', background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  {['All', 'Active', 'Out of Stock', 'Featured', 'On Sale'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '9999px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        background: activeTab === tab ? '#7c3aed' : '#f1f5f9',
                        color: activeTab === tab ? '#ffffff' : '#64748b',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filters & Search */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '0.45rem 0.85rem 0.45rem 2rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        outline: 'none',
                        width: '180px',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="All">All Stock Status</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock (1-5)</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div
                className="table-container"
                style={{
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subcategory</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>M.R.P</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Selling Price</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                    <th style={{ padding: '0.85rem 0.85rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((p, index) => {
                    const subCatName =
                      p.subCategory?.name ||
                      (typeof p.subCategory === 'string' ? p.subCategory : null) ||
                      '—';
                    return (
                      <tr
                        key={p._id}
                        style={{
                          background: index % 2 === 0 ? '#ffffff' : '#faf7ff',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* Product Cell with Clean Truncated Title & Image Thumbnail */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', maxWidth: '280px' }}>
                            <img
                              src={p.images?.[0] || p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                              alt={p.name}
                              style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                objectFit: 'cover',
                                flexShrink: 0,
                                border: '1px solid #e2e8f0',
                                background: '#f8fafc',
                              }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <strong
                                title={p.name}
                                style={{
                                  fontSize: '0.86rem',
                                  color: '#0f172a',
                                  fontWeight: 600,
                                  display: 'block',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.3,
                                }}
                              >
                                {p.name}
                              </strong>
                              <span style={{ fontSize: '0.71rem', color: '#64748b', marginTop: '0.15rem', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                SKU: {p.sku || p._id?.slice(-6) || p.slug?.slice(0, 12) || 'PRD'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category Chip */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'left' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.22rem 0.65rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              background: '#f3e8ff',
                              color: '#6d28d9',
                              border: '1px solid #e9d8fd',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.category?.name || 'General'}
                          </span>
                        </td>

                        {/* Subcategory Chip */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'left' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.22rem 0.6rem',
                              borderRadius: '9999px',
                              fontSize: '0.74rem',
                              fontWeight: 500,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#475569',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {subCatName}
                          </span>
                        </td>

                        {/* MRP / Original Price */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', color: p.discountPrice ? '#94a3b8' : '#0f172a', fontWeight: p.discountPrice ? 500 : 600, textDecoration: p.discountPrice ? 'line-through' : 'none' }}>
                            {formatPrice(p.price)}
                          </span>
                        </td>

                        {/* Selling Price */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'right' }}>
                          {p.discountPrice ? (
                            <strong style={{ fontSize: '0.88rem', color: '#15803d', fontWeight: 700 }}>
                              {formatPrice(p.discountPrice)}
                            </strong>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>—</span>
                          )}
                        </td>

                        {/* Stock Status Badge */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'center' }}>
                          {renderStockBadge(p.stock)}
                        </td>

                        {/* Status Badge */}
                        <td style={{ padding: '0.85rem 0.85rem', textAlign: 'center' }}>
                          {p.isActive !== false ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.22rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #dcfce7',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Active
                            </span>
                          ) : (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.22rem 0.6rem',
                                borderRadius: '9999px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: '#f1f5f9',
                                color: '#64748b',
                                border: '1px solid #e2e8f0',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions Buttons */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setViewingProduct(p)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                background: '#f8fafc',
                                color: '#3b82f6',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#eff6ff';
                                e.currentTarget.style.borderColor = '#bfdbfe';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <Eye size={12} color="#3b82f6" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.76rem',
                                fontWeight: 600,
                                background: '#f8fafc',
                                color: '#6d28d9',
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3e8ff';
                                e.currentTarget.style.borderColor = '#e9d8fd';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                              }}
                            >
                              <Edit2 size={12} color="#6d28d9" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', border: '1px solid', borderColor: currentPage === i + 1 ? '#7c3aed' : '#cbd5e1', background: currentPage === i + 1 ? '#7c3aed' : '#fff', color: currentPage === i + 1 ? '#fff' : '#334155', cursor: 'pointer' }}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : '#fff', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
            </>
          )}
        </>
      )}
      {/* Product Details Modal */}
      <Modal
        isOpen={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        title="Product Details"
        maxWidth={900}
      >
        {viewingProduct && (
          <div style={{ padding: '0.5rem 1rem 1.5rem', width: '100%' }}>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
              <div style={{ flex: '0 0 45%', maxWidth: '400px' }}>
                <img
                  src={viewingProduct.images?.[0] || viewingProduct.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
                  alt={viewingProduct.name}
                  style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                />
              </div>
              <div style={{ flex: '2', minWidth: '300px' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.35rem' }}>{viewingProduct.name}</h3>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#15803d' }}>
                    {formatPrice(viewingProduct.discountPrice || viewingProduct.price)}
                  </span>
                  {viewingProduct.discountPrice && (
                    <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                      {formatPrice(viewingProduct.price)}
                    </span>
                  )}
                  <span style={{ padding: '0.25rem 0.6rem', background: '#f1f5f9', color: '#475569', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    SKU: {viewingProduct.sku || 'N/A'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#f3e8ff', color: '#6d28d9', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {viewingProduct.category?.name || (typeof viewingProduct.category === 'string' ? viewingProduct.category : 'N/A')}
                  </span>
                  {viewingProduct.subCategory && (
                    <span style={{ padding: '0.25rem 0.75rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {viewingProduct.subCategory?.name || (typeof viewingProduct.subCategory === 'string' ? viewingProduct.subCategory : '')}
                    </span>
                  )}
                  {renderStockBadge(viewingProduct.stock)}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h4>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                    {viewingProduct.description || 'No description available for this product.'}
                  </p>
                </div>

                {viewingProduct.characteristics && Object.keys(viewingProduct.characteristics).length > 0 && (
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specifications</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                      {(Array.isArray(viewingProduct.characteristics) ? viewingProduct.characteristics : Object.entries(viewingProduct.characteristics).map(([k, v]) => ({ key: k, value: v }))).map((item, i) => (
                        <div key={i} style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem', fontWeight: 600 }}>{item.key || item.name || 'Spec'}</span>
                          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>
                            {Array.isArray(item.value) ? item.value.join(', ') : (typeof item.value === 'object' ? JSON.stringify(item.value) : item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
