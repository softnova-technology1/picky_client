import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Tag,
  Calendar,
  Clock,
  Layers,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Percent,
  X,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Spinner from '../../../components/ui/Spinner';
import DateTimePicker12h from '../../../components/ui/DateTimePicker12h';
import { productService } from '../../../services/product.service';
import { categoryService } from '../../../services/category.service';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';

export default function AdminDiscounts() {
  const { showToast } = useUiStore();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [discountFilter, setDiscountFilter] = useState('All Discounts');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Selection state for Bulk Actions
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // "Set Discount" Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [savingDiscount, setSavingDiscount] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    discountType: 'percentage', // 'percentage' | 'flat'
    discountValue: '',
    offerLabel: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  // Fetch live products and categories from server
  async function loadData() {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        productService.list({ limit: 200, includeInactive: true }).catch(() => null),
        categoryService.list().catch(() => null),
      ]);

      const liveList = prodRes?.data?.data || prodRes?.data || [];
      const catList = catRes?.data?.data || catRes?.data || [];
      setCategories(catList);

      // Normalize live products
      const formattedLive = liveList.map((p) => {
        const catName =
          typeof p.category === 'object' && p.category?.name
            ? p.category.name
            : p.subCategory || p.category || 'General';

        // Calculate if percentage exists
        const hasDiscount = p.discountPrice !== undefined && p.discountPrice !== null && p.discountPrice < p.price;

        return {
          _id: p._id || p.id,
          name: p.name || 'Untitled Product',
          categoryName: p.subCategory || catName,
          categoryRaw: p.category,
          price: Number(p.price) || 0,
          discountPrice: hasDiscount ? Number(p.discountPrice) : null,
          limitDiscount: p.limitDiscount || p.maxDiscount || null,
          label: p.offerLabel ? String(p.offerLabel).trim() : '',
          startDate: p.offerStartDate ? new Date(p.offerStartDate).toISOString() : (p.scheduledAt || ''),
          endDate: p.offerEndDate ? new Date(p.offerEndDate).toISOString() : (p.validTill || ''),
          dateRange: p.offerStartDate && p.offerEndDate
            ? `${new Date(p.offerStartDate).toLocaleDateString()} - ${new Date(p.offerEndDate).toLocaleDateString()}`
            : p.offerStartDate
            ? `From ${new Date(p.offerStartDate).toLocaleDateString()}`
            : p.offerEndDate
            ? `Till ${new Date(p.offerEndDate).toLocaleDateString()}`
            : p.scheduledAt
            ? `Scheduled: ${new Date(p.scheduledAt).toLocaleDateString()}`
            : null,
          images: p.images && p.images.length > 0 ? p.images : [],
          isScheduled: Boolean(
            p.offerStartDate
              ? new Date(p.offerStartDate) > new Date()
              : p.scheduledAt && new Date(p.scheduledAt) > new Date()
          ),
          isActive: p.isActive !== false,
          isDiscountActive: Boolean(p.isDiscountActive),
          rawProduct: p,
        };
      });

      setProducts(formattedLive);
    } catch (err) {
      console.error('Failed to load products for discount table:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filter products based on search, discount status, and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.name?.toLowerCase().includes(q);
        const catMatch = p.categoryName?.toLowerCase().includes(q);
        if (!nameMatch && !catMatch) return false;
      }

      // 2. Discount Status Filter
      const hasDiscount = p.discountPrice !== null && p.discountPrice < p.price;
      const isConfiguredActive = Boolean(p.isDiscountActive);
      if (discountFilter === 'Active Discounts' && (!isConfiguredActive || !hasDiscount)) return false;
      if (discountFilter === 'No Discount' && (isConfiguredActive && hasDiscount)) return false;
      if (discountFilter === 'Scheduled' && (!isConfiguredActive || !p.isScheduled)) return false;

      // 3. Category Filter
      if (categoryFilter !== 'All Categories') {
        const catName = (p.categoryName || '').toLowerCase();
        if (!catName.includes(categoryFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [products, searchQuery, discountFilter, categoryFilter]);

  // Pagination slice
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Metrics for Top 4 Stat Cards
  const activeDiscountsCount = useMemo(() => {
    return products.filter((p) => p.isDiscountActive && p.discountPrice !== null && p.discountPrice < p.price).length;
  }, [products]);

  const scheduledCount = useMemo(() => {
    return products.filter((p) => p.isDiscountActive && p.isScheduled).length;
  }, [products]);

  const expiredCount = 0;
  const totalProductsDisplay = products.length;

  // Checkbox handlers
  const allCurrentPageSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProductIds.includes(p._id));

  const handleSelectAllCurrentPage = () => {
    if (allCurrentPageSelected) {
      const pageIds = paginatedProducts.map((p) => p._id);
      setSelectedProductIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedProducts.map((p) => p._id);
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open "Set Discount" Modal
  const handleOpenEditDiscount = (product) => {
    setEditingProduct(product);

    const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;
    let initialType = 'percentage';
    let initialVal = '';

    if (hasDiscount) {
      const pct = Math.round(((product.price - product.discountPrice) / product.price) * 100);
      initialType = 'percentage';
      initialVal = String(pct);
    }

    setDiscountForm({
      discountType: initialType,
      discountValue: initialVal,
      offerLabel: product.label || '',
      startDate: product.startDate ? product.startDate.slice(0, 16) : '',
      endDate: product.endDate ? product.endDate.slice(0, 16) : '',
      isActive: true,
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Save Discount changes
  const handleSaveDiscount = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    const numVal = parseFloat(discountForm.discountValue);
    if (discountForm.isActive && (isNaN(numVal) || numVal <= 0)) {
      showToast('Please enter a valid discount value', 'error');
      return;
    }

    let calculatedDiscountPrice = null;
    if (discountForm.isActive && numVal > 0) {
      if (discountForm.discountType === 'percentage') {
        if (numVal >= 100) {
          showToast('Discount percentage must be less than 100%', 'error');
          return;
        }
        calculatedDiscountPrice = Math.max(1, Math.round(editingProduct.price * (1 - numVal / 100)));
      } else {
        if (numVal >= editingProduct.price) {
          showToast('Flat discount amount cannot exceed product price', 'error');
          return;
        }
        calculatedDiscountPrice = Math.max(1, Math.round(editingProduct.price - numVal));
      }
    }

    setSavingDiscount(true);
    try {
      // Prepare payload for backend update
      const payload = new FormData();
      payload.append('name', editingProduct.name);
      payload.append('price', editingProduct.price);
      if (editingProduct.rawProduct?.category) {
        payload.append(
          'category',
          typeof editingProduct.rawProduct.category === 'object'
            ? editingProduct.rawProduct.category._id
            : editingProduct.rawProduct.category
        );
      }
      if (editingProduct.rawProduct?.subCategory) {
        payload.append('subCategory', editingProduct.rawProduct.subCategory);
      }

      if (discountForm.isActive && calculatedDiscountPrice) {
        payload.append('discountPrice', calculatedDiscountPrice);
      } else {
        payload.append('discountPrice', '');
      }

      // Synchronize offerLabel & tags to database
      const cleanLabel = discountForm.offerLabel.trim();
      payload.append('offerLabel', cleanLabel);
      payload.append('tags', cleanLabel); // if empty, sends '' which backend clears to []

      // Start & End dates saved to database
      payload.append('offerStartDate', discountForm.startDate ? new Date(discountForm.startDate).toISOString() : '');
      payload.append('offerEndDate', discountForm.endDate ? new Date(discountForm.endDate).toISOString() : '');

      // Persist isDiscountActive to database
      payload.append('isDiscountActive', discountForm.isActive ? 'true' : 'false');

      // Add existing images so backend keeps them
      if (editingProduct.images && editingProduct.images.length > 0) {
        editingProduct.images.forEach((img) => {
          payload.append('imagePositions[]', img);
        });
      }

      // Call backend API (persists in MongoDB)
      await adminService.updateProduct(editingProduct._id, payload);

      // Update state in local products array
      const dateRangeText =
        discountForm.startDate && discountForm.endDate
          ? `${new Date(discountForm.startDate).toLocaleDateString()} - ${new Date(discountForm.endDate).toLocaleDateString()}`
          : discountForm.startDate
          ? `From ${new Date(discountForm.startDate).toLocaleDateString()}`
          : discountForm.endDate
          ? `Till ${new Date(discountForm.endDate).toLocaleDateString()}`
          : null;

      const isScheduledNow = Boolean(
        discountForm.startDate && new Date(discountForm.startDate) > new Date()
      );

      setProducts((prev) =>
        prev.map((p) =>
          p._id === editingProduct._id
            ? {
                ...p,
                discountPrice: discountForm.isActive ? calculatedDiscountPrice : null,
                label: cleanLabel || '',
                startDate: discountForm.startDate,
                endDate: discountForm.endDate,
                dateRange: dateRangeText,
                isScheduled: isScheduledNow,
                isDiscountActive: Boolean(discountForm.isActive),
                rawProduct: {
                  ...p.rawProduct,
                  offerLabel: cleanLabel,
                  tags: cleanLabel ? [cleanLabel] : [],
                  offerStartDate: discountForm.startDate,
                  offerEndDate: discountForm.endDate,
                  isDiscountActive: Boolean(discountForm.isActive),
                },
              }
            : p
        )
      );

      showToast(`Discount updated successfully for ${editingProduct.name}!`, 'success');
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save discount:', err);
      showToast(err.message || 'Failed to save discount', 'error');
    } finally {
      setSavingDiscount(false);
    }
  };

  // Bulk Actions
  const handleBulkRemove = () => {
    if (selectedProductIds.length === 0) {
      showToast('Select products first to remove discounts', 'error');
      return;
    }
    setProducts((prev) =>
      prev.map((p) =>
        selectedProductIds.includes(p._id)
          ? { ...p, discountPrice: null, label: null, isScheduled: false, dateRange: null, isDiscountActive: false }
          : p
      )
    );
    setSelectedProductIds([]);
    showToast(`Removed discounts from selected products!`, 'success');
  };

  const handleBulkDiscount = () => {
    if (selectedProductIds.length === 0) {
      showToast('Select products first to apply bulk discount', 'info');
      return;
    }
    const firstSelected = products.find((p) => selectedProductIds.includes(p._id));
    if (firstSelected) {
      handleOpenEditDiscount(firstSelected);
    }
  };

  return (
    <AdminLayout>
      <div style={{ paddingBottom: '2.5rem' }}>
        {/* ── 1. Page Header with Title, Subtitle and Top Action Buttons ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
                fontSize: '1.9rem',
                fontWeight: 700,
                color: '#111827',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Discounts
            </h1>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: '#64748b' }}>
              Manage product discounts &amp; offers
            </p>
          </div>

          {/* Action Buttons: Bulk Remove & Bulk Discount */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleBulkRemove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.15rem',
                background: '#ffffff',
                border: '1.5px solid #f87171',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
            >
              <Trash2 size={15} />
              <span>Bulk Remove {selectedProductIds.length > 0 ? `(${selectedProductIds.length})` : ''}</span>
            </button>

            <button
              type="button"
              onClick={handleBulkDiscount}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 1.25rem',
                background: '#b48348',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(180, 131, 72, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#9e713c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#b48348';
              }}
            >
              <Zap size={15} />
              <span>Bulk Discount {selectedProductIds.length > 0 ? `(${selectedProductIds.length})` : ''}</span>
            </button>
          </div>
        </div>

        {/* ── 2. Top 4 KPI Stat Cards ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Card 1: Active Discounts */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#e8f7ee',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Tag size={19} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>
                {activeDiscountsCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                Active Discounts
              </div>
            </div>
          </div>

          {/* Card 2: Scheduled */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Calendar size={19} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>
                {scheduledCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                Scheduled
              </div>
            </div>
          </div>

          {/* Card 3: Expired */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#fee2e2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={19} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>
                {expiredCount}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                Expired
              </div>
            </div>
          </div>

          {/* Card 4: Total Products */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #d4a373',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 1px 4px rgba(180, 131, 72, 0.08)',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Layers size={19} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.1 }}>
                {totalProductsDisplay}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, marginTop: '3px' }}>
                Total Products
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Search & Filter Bar ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', width: '280px', flex: '1 1 240px', maxWidth: '340px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '36px',
                paddingRight: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.85rem',
                color: '#1e293b',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* All Discounts Dropdown */}
          <select
            value={discountFilter}
            onChange={(e) => {
              setDiscountFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              height: '40px',
              padding: '0 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '0.84rem',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '150px',
            }}
          >
            <option value="All Discounts">All Discounts</option>
            <option value="Active Discounts">Active Discounts</option>
            <option value="No Discount">No Discount</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Expired">Expired</option>
          </select>

          {/* All Categories Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              height: '40px',
              padding: '0 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              fontSize: '0.84rem',
              color: '#334155',
              cursor: 'pointer',
              outline: 'none',
              minWidth: '155px',
            }}
          >
            <option value="All Categories">All Categories</option>
            {categories.map((c) => (
              <option key={c._id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* ── 4. Main Products Discount Table ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Spinner size={36} />
          </div>
        ) : (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '1080px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ width: '40px', padding: '0.9rem 0.8rem 0.9rem 1.25rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={handleSelectAllCurrentPage}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#b48348',
                          cursor: 'pointer',
                        }}
                      />
                    </th>
                    <th
                      style={{
                        width: '45px',
                        padding: '0.9rem 0.5rem',
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 1rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Product Name
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      MRP
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Selling Price
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Current Discount
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Limit Discount
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Label
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Date Range
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 0.85rem',
                        textAlign: 'left',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        padding: '0.9rem 1.25rem',
                        textAlign: 'right',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#64748b',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                        No products match the selected criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p, index) => {
                      const isSelected = selectedProductIds.includes(p._id);
                      const rowIndex = (currentPage - 1) * itemsPerPage + index + 1;
                      const hasDiscount = p.discountPrice !== null && p.discountPrice < p.price;
                      const salePrice = hasDiscount ? p.discountPrice : p.price;

                      let discountText = '—';
                      if (hasDiscount) {
                        const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
                        discountText = `${pct}% OFF`;
                      }

                      const isConfiguredActive = Boolean(p.isDiscountActive);

                      let statusBadge = (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.2rem 0.65rem',
                            borderRadius: '6px',
                            background: '#f1f5f9',
                            color: '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          No Discount
                        </span>
                      );

                      if (isConfiguredActive && hasDiscount) {
                        if (p.isScheduled) {
                          statusBadge = (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '6px',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Scheduled
                            </span>
                          );
                        } else {
                          statusBadge = (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.65rem',
                                borderRadius: '6px',
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Active
                            </span>
                          );
                        }
                      }

                      const thumbnail =
                        p.images && p.images[0]
                          ? p.images[0]
                          : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120';

                      return (
                        <tr
                          key={p._id}
                          style={{
                            background: isSelected ? '#fdfbf7' : '#ffffff',
                            borderBottom: '1px solid #f1f5f9',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: '0.85rem 0.8rem 0.85rem 1.25rem', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleProduct(p._id)}
                              style={{
                                width: '16px',
                                height: '16px',
                                accentColor: '#b48348',
                                cursor: 'pointer',
                              }}
                            />
                          </td>

                          {/* Index # */}
                          <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                            {rowIndex}
                          </td>

                          {/* Product Info (Product Name) */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                              <img
                                src={thumbnail}
                                alt={p.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120';
                                }}
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '6px',
                                  objectFit: 'cover',
                                  border: '1px solid #e2e8f0',
                                  flexShrink: 0,
                                  background: '#f8fafc',
                                }}
                              />
                              <div style={{ minWidth: 0, maxWidth: '280px' }}>
                                <div
                                  title={p.name}
                                  style={{
                                    fontSize: '0.86rem',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    lineHeight: 1.35,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {p.name}
                                </div>
                                <div
                                  title={p.categoryName || 'General'}
                                  style={{
                                    fontSize: '0.74rem',
                                    color: '#64748b',
                                    marginTop: '2px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {p.categoryName || 'General'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* MRP */}
                          <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>
                              {formatPrice(p.price)}
                            </span>
                          </td>

                          {/* Selling Price */}
                          <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                            <strong style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                              {formatPrice(salePrice)}
                            </strong>
                          </td>

                          {/* Current Discount */}
                          <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                            {hasDiscount ? (
                              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.84rem' }}>
                                {discountText}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '1rem' }}>—</span>
                            )}
                          </td>

                          {/* Limit Discount */}
                          <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                            {p.limitDiscount ? (
                              <span style={{ fontWeight: 600, color: '#334155', fontSize: '0.84rem' }}>
                                {typeof p.limitDiscount === 'number' ? formatPrice(p.limitDiscount) : p.limitDiscount}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '1rem' }}>—</span>
                            )}
                          </td>

                          {/* Label */}
                          <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                            {p.label ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  maxWidth: '130px',
                                  display: 'inline-block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={p.label}
                              >
                                {p.label}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>

                          {/* Date Range */}
                          <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                            {p.dateRange ? (
                              <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {p.dateRange}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.85rem 0.85rem', whiteSpace: 'nowrap' }}>
                            {statusBadge}
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEditDiscount(p)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                              }}
                              title="Edit product discount"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#0f172a';
                                e.currentTarget.style.background = '#f1f5f9';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#64748b';
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <Edit2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderTop: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
                  Showing{' '}
                  <strong style={{ color: '#0f172a' }}>
                    {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)}
                  </strong>{' '}
                  of <strong style={{ color: '#0f172a' }}>{filteredProducts.length}</strong> products
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                      color: currentPage === 1 ? '#94a3b8' : '#334155',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentPage(i + 1)}
                      style={{
                        minWidth: '28px',
                        height: '28px',
                        padding: '0 0.35rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: currentPage === i + 1 ? '#b48348' : '#cbd5e1',
                        background: currentPage === i + 1 ? '#b48348' : '#ffffff',
                        color: currentPage === i + 1 ? '#ffffff' : '#334155',
                        cursor: 'pointer',
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.35rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                      color: currentPage === totalPages ? '#94a3b8' : '#334155',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 5. "Set Discount" Modal (Exact match with user's design screenshot) ── */}
        {isModalOpen && editingProduct && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
            }}
            onClick={handleCloseModal}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '540px',
                boxShadow: '0 20px 45px rgba(0, 0, 0, 0.16)',
                overflow: 'visible',
                animation: 'adminModalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1.25rem 1.5rem 0.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ color: '#b48348', fontSize: '1rem', fontWeight: 700, lineHeight: 1 }}>
                    %
                  </div>
                  <h2
                    style={{
                      fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif",
                      fontSize: '1.35rem',
                      fontWeight: 700,
                      color: '#111827',
                      margin: '0.2rem 0 0',
                    }}
                  >
                    Set Discount
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveDiscount} style={{ padding: '0.75rem 1.5rem 1.5rem' }}>
                {/* Product Summary Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    padding: '0.75rem 0.9rem',
                    background: '#fcfbfa',
                    border: '1px solid #f1ece4',
                    borderRadius: '10px',
                    marginBottom: '1.25rem',
                  }}
                >
                  <img
                    src={
                      editingProduct.images && editingProduct.images[0]
                        ? editingProduct.images[0]
                        : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120'
                    }
                    alt={editingProduct.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=120';
                    }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid #e2e8f0',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
                      {editingProduct.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                      Original: {formatPrice(editingProduct.price)} | MRP: {formatPrice(Math.round(editingProduct.price * 1.25))}
                    </div>
                  </div>
                </div>

                {/* Row 1: DISCOUNT TYPE & DISCOUNT VALUE */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.45rem',
                      }}
                    >
                      DISCOUNT TYPE
                    </label>
                    <select
                      value={discountForm.discountType}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountType: e.target.value })}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#fafafa',
                        fontSize: '0.86rem',
                        color: '#1e293b',
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.45rem',
                      }}
                    >
                      DISCOUNT VALUE
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={discountForm.discountValue}
                      onChange={(e) => setDiscountForm({ ...discountForm, discountValue: e.target.value })}
                      style={{
                        width: '100%',
                        height: '42px',
                        padding: '0 0.85rem',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#fafafa',
                        fontSize: '0.86rem',
                        color: '#1e293b',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Row 2: OFFER LABEL */}
                <div style={{ marginBottom: '1rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '0.45rem',
                    }}
                  >
                    OFFER LABEL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer Sale, Festival Offer"
                    value={discountForm.offerLabel}
                    onChange={(e) => setDiscountForm({ ...discountForm, offerLabel: e.target.value })}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      background: '#fafafa',
                      fontSize: '0.86rem',
                      color: '#1e293b',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Row 3: START DATE & TIME and END DATE & TIME (12-Hour Format) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.45rem',
                      }}
                    >
                      START DATE &amp; TIME (12H)
                    </label>
                    <DateTimePicker12h
                      value={discountForm.startDate}
                      onChange={(val) => setDiscountForm((prev) => ({ ...prev, startDate: val }))}
                      placeholder="Start date & time (12h)"
                      align="left"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.45rem',
                      }}
                    >
                      END DATE &amp; TIME (12H)
                    </label>
                    <DateTimePicker12h
                      value={discountForm.endDate}
                      onChange={(val) => setDiscountForm((prev) => ({ ...prev, endDate: val }))}
                      placeholder="End date & time (12h)"
                      align="right"
                    />
                  </div>
                </div>

                {/* Row 4: Discount Active Checkbox */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={discountForm.isActive}
                      onChange={(e) => setDiscountForm({ ...discountForm, isActive: e.target.checked })}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#b48348',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 500 }}>
                      Discount Active
                    </span>
                  </label>
                </div>

                {/* Modal Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    style={{
                      padding: '0.55rem 1.4rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingDiscount}
                    style={{
                      padding: '0.55rem 1.4rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#b48348',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: savingDiscount ? 'not-allowed' : 'pointer',
                      opacity: savingDiscount ? 0.7 : 1,
                      boxShadow: '0 2px 6px rgba(180, 131, 72, 0.25)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {savingDiscount ? 'Saving...' : 'Save Discount'}
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
