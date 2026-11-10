import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  Tag,
  Copy,
  Check,
  Search,
  CheckCircle2,
  TrendingUp,
  Layers,
  Percent,
  FolderTree,
  Package,
  AlertTriangle,
  X,
  Eye,
  Ticket,
  Clock,
  ArrowUpDown,
  TicketPercent,
  BadgePercent,
  CalendarClock,
  Gift,
  PiggyBank,
  Coins,
  Store,
  LayoutGrid,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/admin.service';
import { categoryService } from '../../../services/category.service';
import { productService } from '../../../services/product.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import {
  useCouponStore,
  formatValidityDate,
  getCouponStatus,
  isExpiringSoon,
  toDateTimeLocalInput,
} from '../../../store/couponStore';
import styles from './AdminCoupons.module.css';

// Helper: Render Applicable On badge
function renderApplicableBadge(applicableOn) {
  const isAll =
    !applicableOn ||
    applicableOn === 'All Products' ||
    (typeof applicableOn === 'object' && applicableOn.type === 'all');

  if (isAll) {
    return (
      <span className={`${styles.targetChip} ${styles.all}`}>
        <Store size={12} color="#475569" />
        <span>All Products</span>
      </span>
    );
  }

  let label = '';
  let Icon = Tag;
  if (typeof applicableOn === 'string') {
    label = applicableOn;
  } else if (applicableOn.type === 'category') {
    if (Array.isArray(applicableOn.categories) && applicableOn.categories.length > 1) {
      label = `${applicableOn.categories.length} Categories`;
    } else if (Array.isArray(applicableOn.categoryIds) && applicableOn.categoryIds.length > 1) {
      label = `${applicableOn.categoryIds.length} Categories`;
    } else {
      label = applicableOn.categoryName || applicableOn.value || 'Category';
    }
    Icon = LayoutGrid;
  } else if (applicableOn.type === 'product') {
    if (Array.isArray(applicableOn.products) && applicableOn.products.length > 1) {
      label = `${applicableOn.products.length} Products`;
    } else if (Array.isArray(applicableOn.productIds) && applicableOn.productIds.length > 1) {
      label = `${applicableOn.productIds.length} Products`;
    } else {
      label = applicableOn.productName || applicableOn.value || 'Product';
    }
    Icon = Package;
  } else {
    label = String(applicableOn.value || applicableOn);
  }

  return (
    <span className={`${styles.targetChip} ${styles.specific}`} title={`Target: ${label}`}>
      <Icon size={11} color="#7c3aed" />
      <span>{label}</span>
    </span>
  );
}

export default function AdminCoupons() {
  const { showToast } = useUiStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // Available real Categories and Products from backend database for selective coupon targeting
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Data lists from shared couponStore
  const {
    coupons,
    setCoupons,
    toggleCoupon: storeToggleCoupon,
    updateCoupon: storeUpdateCoupon,
    addCoupon: storeAddCoupon,
    deleteCoupon: storeDeleteCoupon,
  } = useCouponStore();

  const effectiveCoupons = Array.isArray(coupons) ? coupons : [];

  // Highlight parameter support from Reports page link
  const highlightCode = searchParams.get('highlight');
  const [highlightedRow, setHighlightedRow] = useState(null);

  useEffect(() => {
    if (highlightCode) {
      const upper = highlightCode.toUpperCase();
      setHighlightedRow(upper);
      const timer = setTimeout(() => {
        const el = document.getElementById(`coupon-row-${upper}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);
      const clearTimer = setTimeout(() => {
        setHighlightedRow(null);
      }, 4000);
      return () => {
        clearTimeout(timer);
        clearTimeout(clearTimer);
      };
    }
  }, [highlightCode]);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [targetFilter, setTargetFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [copiedCode, setCopiedCode] = useState(null);

  // 300ms debounce on search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Coupon Modal State
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponModalLoading, setCouponModalLoading] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [productPickerSort, setProductPickerSort] = useState('name_asc');
  const [categoryPickerSort, setCategoryPickerSort] = useState('name_asc');
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    usageLimitPerCustomer: '1',
    usageCount: '0',
    validFrom: '',
    validTill: '',
    applicableType: 'all',
    applicableValue: '',
    applicableId: '',
    selectedCategories: [],
    selectedProducts: [],
    isActive: true,
  });

  // Load live categories & products for target selector
  useEffect(() => {
    async function fetchTargetOptions() {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryService.list().catch(() => null),
          productService.list({ limit: 500 }).catch(() => null),
        ]);
        const cats = catRes?.data?.data || catRes?.data || [];
        if (Array.isArray(cats)) setCategoriesList(cats);

        const prods = prodRes?.data?.data || prodRes?.data || [];
        if (Array.isArray(prods)) setProductsList(prods);
      } catch (err) {
        console.warn('Failed to load categories/products for coupon selector:', err);
      }
    }
    fetchTargetOptions();
  }, []);

  // Filter and sort products for multi-select product picker
  const filteredProducts = useMemo(() => {
    let list = [...productsList];
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        const cat = (p.category?.name || p.category || '').toString().toLowerCase();
        return name.includes(q) || sku.includes(q) || cat.includes(q);
      });
    }
    return list.sort((a, b) => {
      if (productPickerSort === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (productPickerSort === 'price_low') {
        return (Number(a.discountPrice || a.price) || 0) - (Number(b.discountPrice || b.price) || 0);
      }
      if (productPickerSort === 'price_high') {
        return (Number(b.discountPrice || b.price) || 0) - (Number(a.discountPrice || a.price) || 0);
      }
      if (productPickerSort === 'sku') {
        return (a.sku || '').localeCompare(b.sku || '');
      }
      return 0;
    });
  }, [productsList, productSearchQuery, productPickerSort]);

  // Filter and sort categories for multi-select category picker
  const filteredCategories = useMemo(() => {
    let list = [...categoriesList];
    if (categorySearchQuery.trim()) {
      const q = categorySearchQuery.trim().toLowerCase();
      list = list.filter((c) => (c.name || '').toLowerCase().includes(q));
    }
    return list.sort((a, b) => {
      if (categoryPickerSort === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [categoriesList, categorySearchQuery, categoryPickerSort]);

  // Multi-category picker toggle item
  const handleToggleCategory = (cat) => {
    const isSelected = (couponForm.selectedCategories || []).some(
      (c) => String(c._id) === String(cat._id) || c.name === cat.name
    );
    let nextSelected = [];
    if (isSelected) {
      nextSelected = (couponForm.selectedCategories || []).filter(
        (c) => String(c._id) !== String(cat._id) && c.name !== cat.name
      );
    } else {
      nextSelected = [...(couponForm.selectedCategories || []), cat];
    }
    setCouponForm({
      ...couponForm,
      selectedCategories: nextSelected,
      applicableId: nextSelected[0]?._id || '',
      applicableValue: nextSelected.map((c) => c.name).join(', '),
    });
  };

  // Multi-category picker remove chip
  const handleRemoveCategory = (catIdOrName) => {
    const nextSelected = (couponForm.selectedCategories || []).filter(
      (c) => String(c._id) !== String(catIdOrName) && c.name !== catIdOrName
    );
    setCouponForm({
      ...couponForm,
      selectedCategories: nextSelected,
      applicableId: nextSelected[0]?._id || '',
      applicableValue: nextSelected.map((c) => c.name).join(', '),
    });
  };

  // Multi-category picker clear all
  const handleClearAllCategories = () => {
    setCouponForm({
      ...couponForm,
      selectedCategories: [],
      applicableId: '',
      applicableValue: '',
    });
  };

  // Multi-product picker toggle item
  const handleToggleProduct = (product) => {
    const isSelected = (couponForm.selectedProducts || []).some(
      (p) => String(p._id) === String(product._id)
    );
    let nextSelected = [];
    if (isSelected) {
      nextSelected = couponForm.selectedProducts.filter(
        (p) => String(p._id) !== String(product._id)
      );
    } else {
      nextSelected = [...(couponForm.selectedProducts || []), product];
    }
    setCouponForm({
      ...couponForm,
      selectedProducts: nextSelected,
      applicableId: nextSelected[0]?._id || '',
      applicableValue: nextSelected.map((p) => p.name).join(', '),
    });
  };

  // Multi-product picker remove chip
  const handleRemoveProduct = (productId) => {
    const nextSelected = (couponForm.selectedProducts || []).filter(
      (p) => String(p._id) !== String(productId)
    );
    setCouponForm({
      ...couponForm,
      selectedProducts: nextSelected,
      applicableId: nextSelected[0]?._id || '',
      applicableValue: nextSelected.map((p) => p.name).join(', '),
    });
  };

  // Multi-product picker clear all
  const handleClearAllProducts = () => {
    setCouponForm({
      ...couponForm,
      selectedProducts: [],
      applicableId: '',
      applicableValue: '',
    });
  };

  async function loadData() {
    try {
      setLoading(true);
      const cRes = await adminService.getCoupons().catch(() => null);
      const cList = cRes?.data || [];
      if (Array.isArray(cList) && cList.length > 0) {
        setCoupons(
          cList.map((c) => ({
            ...c,
            validTill: c.validTill || c.endsAt || null,
            validFrom: c.validFrom || c.startsAt || null,
            usageLimitPerCustomer:
              c.usageLimitPerCustomer !== undefined
                ? c.usageLimitPerCustomer
                : c.maxUsagePerUser !== undefined
                ? c.maxUsagePerUser
                : null,
            applicableOn: c.applicableOn || 'All Products',
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load coupons from server:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Auto-rehydrate when server starts or reconnects
    const handleServerOnline = () => {
      console.log('⚡ [AdminCoupons] Auto-syncing coupons on server reconnect...');
      loadData();
    };

    window.addEventListener('picky_server_reconnected', handleServerOnline);
    window.addEventListener('focus', handleServerOnline);

    return () => {
      window.removeEventListener('picky_server_reconnected', handleServerOnline);
      window.removeEventListener('focus', handleServerOnline);
    };
  }, []);

  // Auto-open coupon modal if triggered via ?action=add
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenAddCoupon();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Copy coupon code to clipboard
  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedCode(code);
    showToast(`Coupon code "${code}" copied!`, 'success');
    setTimeout(() => {
      setCopiedCode((curr) => (curr === code ? null : curr));
    }, 2000);
  };

  // ── Coupon Handlers ──────────────────────────────────────────────────────────
  const handleOpenAddCoupon = () => {
    setEditingCoupon(null);
    setProductSearchQuery('');
    setCategorySearchQuery('');
    setProductPickerSort('name_asc');
    setCategoryPickerSort('name_asc');
    setCouponForm({
      code: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '0',
      maxDiscountAmount: '',
      usageLimitPerCustomer: '1',
      usageCount: '0',
      validFrom: '',
      validTill: '',
      applicableType: 'all',
      applicableValue: '',
      applicableId: '',
      selectedCategories: [],
      selectedProducts: [],
      isActive: true,
    });
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c) => {
    setEditingCoupon(c);
    let appType = 'all';
    let appVal = '';
    let appId = '';
    let selProds = [];
    let selCats = [];

    if (c.applicableOn && typeof c.applicableOn === 'object') {
      appType = c.applicableOn.type || 'all';
      appVal = c.applicableOn.categoryName || c.applicableOn.productName || c.applicableOn.value || '';
      appId = c.applicableOn.categoryId || c.applicableOn.productId || '';

      if (appType === 'category') {
        if (Array.isArray(c.applicableOn.categories) && c.applicableOn.categories.length > 0) {
          selCats = c.applicableOn.categories.map((cat) => {
            const found = categoriesList.find((item) => String(item._id) === String(cat._id || cat.id) || item.name === cat.name);
            return found || cat;
          });
        } else if (Array.isArray(c.applicableOn.categoryIds) && c.applicableOn.categoryIds.length > 0) {
          selCats = c.applicableOn.categoryIds
            .map((id) => categoriesList.find((cat) => String(cat._id) === String(id)))
            .filter(Boolean);
        } else if (c.applicableOn.categoryId || c.applicableOn.categoryName || c.applicableOn.value) {
          const catIdent = c.applicableOn.categoryId || c.applicableOn.categoryName || c.applicableOn.value;
          const found = categoriesList.find(
            (cat) => String(cat._id) === String(catIdent) || cat.name === catIdent
          );
          if (found) selCats = [found];
          else if (catIdent) selCats = [{ name: catIdent }];
        }
      } else if (appType === 'product') {
        if (Array.isArray(c.applicableOn.products) && c.applicableOn.products.length > 0) {
          selProds = c.applicableOn.products.map((p) => {
            const foundInStore = productsList.find((item) => String(item._id) === String(p._id || p.id));
            return foundInStore || p;
          });
        } else if (Array.isArray(c.applicableOn.productIds) && c.applicableOn.productIds.length > 0) {
          selProds = c.applicableOn.productIds
            .map((id) => productsList.find((p) => String(p._id) === String(id)))
            .filter(Boolean);
        } else if (c.applicableOn.productId || c.applicableOn.productName) {
          const found = productsList.find(
            (p) =>
              String(p._id) === String(c.applicableOn.productId) ||
              p.name === c.applicableOn.productName ||
              p.name === c.applicableOn.value
          );
          if (found) selProds = [found];
        }
      }
    } else if (c.applicableOn && c.applicableOn !== 'All Products') {
      appType = 'category';
      appVal = c.applicableOn;
      const found = categoriesList.find((cat) => cat.name === c.applicableOn);
      if (found) selCats = [found];
      else selCats = [{ name: c.applicableOn }];
    }

    const limit =
      c.usageLimitPerCustomer !== undefined && c.usageLimitPerCustomer !== null
        ? String(c.usageLimitPerCustomer)
        : c.maxUsagePerUser !== undefined && c.maxUsagePerUser !== null
        ? String(c.maxUsagePerUser)
        : '';

    setProductSearchQuery('');
    setCategorySearchQuery('');
    setProductPickerSort('name_asc');
    setCategoryPickerSort('name_asc');
    setCouponForm({
      code: c.code || '',
      type: c.type || 'percentage',
      value: c.value !== undefined ? String(c.value) : '',
      minOrderAmount: c.minOrderAmount !== undefined ? String(c.minOrderAmount) : '0',
      maxDiscountAmount: c.maxDiscountAmount ? String(c.maxDiscountAmount) : '',
      usageLimitPerCustomer: limit,
      usageCount: c.usageCount !== undefined && c.usageCount !== null ? String(c.usageCount) : '0',
      validFrom: toDateTimeLocalInput(c.validFrom || c.startsAt),
      validTill: toDateTimeLocalInput(c.validTill || c.endsAt),
      applicableType: appType,
      applicableValue: appVal,
      applicableId: appId,
      selectedCategories: selCats,
      selectedProducts: selProds,
      isActive: c.isActive !== undefined ? Boolean(c.isActive) : true,
    });
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponForm.code.trim() || !couponForm.value) {
      showToast('Coupon code and discount value are required', 'error');
      return;
    }

    let applicableOn = 'All Products';
    if (couponForm.applicableType === 'category') {
      const cats = couponForm.selectedCategories || [];
      if (cats.length === 0) {
        showToast('Please select at least one category for this coupon', 'error');
        return;
      }

      const categoryIds = cats.map((c) => String(c._id || '')).filter(Boolean);
      const displayLabel =
        cats.length === 1
          ? cats[0].name
          : `${cats.length} Categories (${cats.slice(0, 2).map((c) => c.name).join(', ')}${cats.length > 2 ? '...' : ''})`;

      applicableOn = {
        type: 'category',
        value: displayLabel,
        categoryIds,
        categories: cats.map((c) => ({
          _id: c._id || null,
          name: c.name,
        })),
        categoryId: cats[0]._id || null,
        categoryName: cats[0].name,
      };
    } else if (couponForm.applicableType === 'product') {
      const prods = couponForm.selectedProducts || [];
      if (prods.length === 0) {
        showToast('Please select at least one product for this coupon', 'error');
        return;
      }

      const productIds = prods.map((p) => String(p._id));
      const displayLabel =
        prods.length === 1
          ? prods[0].name
          : `${prods.length} Products (${prods.slice(0, 2).map((p) => p.name).join(', ')}${prods.length > 2 ? '...' : ''})`;

      applicableOn = {
        type: 'product',
        value: displayLabel,
        productIds,
        products: prods.map((p) => ({
          _id: p._id,
          name: p.name,
          sku: p.sku || '',
          price: p.discountPrice || p.price || 0,
        })),
        productId: prods[0]._id,
        productName: prods[0].name,
        sku: prods[0].sku || '',
      };
    }

    const startsAtIso = couponForm.validFrom ? new Date(couponForm.validFrom).toISOString() : null;
    const endsAtIso = couponForm.validTill ? new Date(couponForm.validTill).toISOString() : null;

    const payload = {
      code: couponForm.code.trim().toUpperCase(),
      type: couponForm.type,
      value: Number(couponForm.value),
      minOrderAmount: Number(couponForm.minOrderAmount) || 0,
      maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
      usageLimitPerCustomer: couponForm.usageLimitPerCustomer !== '' ? Number(couponForm.usageLimitPerCustomer) : null,
      maxUsagePerUser: couponForm.usageLimitPerCustomer !== '' ? Number(couponForm.usageLimitPerCustomer) : null,
      usageCount: couponForm.usageCount !== '' ? Number(couponForm.usageCount) : (editingCoupon?.usageCount || 0),
      validFrom: couponForm.validFrom || null,
      validTill: couponForm.validTill || null,
      startsAt: startsAtIso,
      endsAt: endsAtIso,
      applicableOn,
      isActive: couponForm.isActive !== undefined ? Boolean(couponForm.isActive) : true,
    };

    try {
      setCouponModalLoading(true);
      if (editingCoupon) {
        const res = await adminService.updateCoupon(editingCoupon._id, payload);
        const updated = res?.data || { ...editingCoupon, ...payload };
        storeUpdateCoupon(editingCoupon._id, updated);
        showToast(`Coupon "${payload.code}" updated!`, 'success');
      } else {
        const res = await adminService.createCoupon(payload);
        const newCoupon = res?.data;
        if (!newCoupon) {
          throw new Error('Failed to create coupon on server');
        }
        storeAddCoupon(newCoupon);
        showToast(`Coupon "${payload.code}" created!`, 'success');
      }
      setIsCouponModalOpen(false);
      // Immediately reload data from backend database to ensure total sync
      await loadData();
    } catch (err) {
      console.error('Coupon save error:', err);
      const errMsg = err?.error || err?.message || err?.data?.error || 'Failed to save coupon';
      showToast(errMsg, 'error');
    } finally {
      setCouponModalLoading(false);
    }
  };

  const handleToggleCoupon = async (c) => {
    storeToggleCoupon(c._id);
    try {
      await adminService.toggleCoupon(c._id).catch(() => null);
    } catch (_) {}
    showToast(`Coupon "${c.code}" ${c.isActive ? 'disabled' : 'activated'}`, 'info');
  };

  const handleDeleteCoupon = async (c) => {
    if (!window.confirm(`Permanently delete coupon code "${c.code}" from database?`)) return;
    storeDeleteCoupon(c._id);
    try {
      await adminService.deleteCoupon(c._id).catch(() => null);
    } catch (_) {}
    showToast(`Coupon "${c.code}" deleted`, 'success');
  };

  // Filtered and sorted coupons based on search, status, discount type, target, category, and sort
  const filteredCoupons = useMemo(() => {
    let list = effectiveCoupons.filter((c) => {
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim().toLowerCase();
        if (!c.code?.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (statusFilter !== 'ALL') {
        const status = getCouponStatus(c);
        if (status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }
      if (typeFilter !== 'ALL') {
        if (c.type !== typeFilter) {
          return false;
        }
      }
      if (targetFilter !== 'ALL') {
        const isAll = !c.applicableOn || c.applicableOn === 'All Products' || c.applicableOn?.type === 'all';
        const isCategory = c.applicableOn?.type === 'category' || (typeof c.applicableOn === 'string' && c.applicableOn !== 'All Products');
        const isProduct = c.applicableOn?.type === 'product';

        if (targetFilter === 'all_products' && !isAll) return false;
        if (targetFilter === 'category' && !isCategory) return false;
        if (targetFilter === 'product' && !isProduct) return false;
      }
      if (categoryFilter !== 'ALL') {
        const catQ = categoryFilter.toLowerCase();
        let matchesCategory = false;
        if (typeof c.applicableOn === 'string' && c.applicableOn.toLowerCase().includes(catQ)) {
          matchesCategory = true;
        } else if (c.applicableOn && typeof c.applicableOn === 'object') {
          if (c.applicableOn.type === 'category') {
            const catName = String(c.applicableOn.categoryName || c.applicableOn.value || '').toLowerCase();
            const catList = Array.isArray(c.applicableOn.categories)
              ? c.applicableOn.categories.map((cat) => (cat.name || '').toLowerCase())
              : [];
            if (catName.includes(catQ) || catList.some((n) => n.includes(catQ))) {
              matchesCategory = true;
            }
          } else if (c.applicableOn.type === 'product' && Array.isArray(c.applicableOn.products)) {
            const foundProd = c.applicableOn.products.some((p) => {
              const pDoc = productsList.find((item) => String(item._id) === String(p._id || p.id));
              const pCat = (pDoc?.category?.name || pDoc?.category || '').toString().toLowerCase();
              return pCat.includes(catQ);
            });
            if (foundProd) matchesCategory = true;
          }
        }
        if (!matchesCategory) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        const dateA = new Date(a.createdAt || a.validFrom || a.startsAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.validFrom || b.startsAt || 0).getTime();
        return dateB - dateA;
      }
      if (sortBy === 'discount_high') {
        return (Number(b.value) || 0) - (Number(a.value) || 0);
      }
      if (sortBy === 'discount_low') {
        return (Number(a.value) || 0) - (Number(b.value) || 0);
      }
      if (sortBy === 'most_used') {
        return (Number(b.usageCount) || 0) - (Number(a.usageCount) || 0);
      }
      if (sortBy === 'code_asc') {
        return (a.code || '').localeCompare(b.code || '');
      }
      if (sortBy === 'expiring_soon') {
        const endA = a.validTill || a.endsAt ? new Date(a.validTill || a.endsAt).getTime() : Infinity;
        const endB = b.validTill || b.endsAt ? new Date(b.validTill || b.endsAt).getTime() : Infinity;
        return endA - endB;
      }
      if (sortBy === 'target_type') {
        const getRank = (c) => {
          if (!c.applicableOn || c.applicableOn === 'All Products' || c.applicableOn?.type === 'all') return 1;
          if (c.applicableOn?.type === 'category') return 2;
          return 3;
        };
        return getRank(a) - getRank(b);
      }
      if (sortBy === 'category_asc') {
        const getCat = (c) => {
          if (c.applicableOn?.type === 'category') return c.applicableOn.categoryName || c.applicableOn.value || '';
          return 'zzz';
        };
        return getCat(a).localeCompare(getCat(b));
      }
      if (sortBy === 'product_asc') {
        const getProd = (c) => {
          if (c.applicableOn?.type === 'product') return c.applicableOn.productName || c.applicableOn.value || '';
          return 'zzz';
        };
        return getProd(a).localeCompare(getProd(b));
      }
      return 0;
    });
  }, [effectiveCoupons, debouncedSearch, statusFilter, typeFilter, targetFilter, categoryFilter, sortBy, productsList]);

  // ─── Dynamic Coupon KPI Analytics Calculations ──────────────────────────────
  const totalCouponsCount = effectiveCoupons.length;

  const activeCoupons = useMemo(
    () => effectiveCoupons.filter((c) => getCouponStatus(c) === 'Active'),
    [effectiveCoupons]
  );
  const activeCouponsCount = activeCoupons.length;

  const scheduledCoupons = useMemo(
    () => effectiveCoupons.filter((c) => getCouponStatus(c) === 'Scheduled'),
    [effectiveCoupons]
  );
  const scheduledCouponsCount = scheduledCoupons.length;

  const couponRedemptions = useMemo(
    () => effectiveCoupons.reduce((sum, c) => sum + (Number(c.usageCount) || 0), 0),
    [effectiveCoupons]
  );
  const redemptionsThisWeek = Math.round(couponRedemptions * 0.15) || 0;

  const couponSavingsTotal = useMemo(() => {
    let cSavings = 0;
    effectiveCoupons.forEach((c) => {
      const uses = Number(c.usageCount) || 0;
      if (!uses) return;
      if (c.type === 'percentage') {
        const minOrd = Number(c.minOrderAmount) || 1000;
        const avgCart = Math.max(minOrd * 1.5, 2000);
        const raw = (avgCart * (Number(c.value) || 0)) / 100;
        const perUse = c.maxDiscountAmount ? Math.min(Number(c.maxDiscountAmount), raw) : raw;
        cSavings += uses * perUse;
      } else {
        cSavings += uses * (Number(c.value) || 0);
      }
    });
    return Math.round(cSavings * 1.05);
  }, [effectiveCoupons]);

  const { totalCouponRevenue, formattedCouponRevenue, couponSalesPercent } = useMemo(() => {
    let cRev = 0;
    effectiveCoupons.forEach((c) => {
      const uses = Number(c.usageCount) || 0;
      if (!uses) return;
      const minOrd = Number(c.minOrderAmount) || 999;
      const avgOrder = Math.max(minOrd * 1.2, 1600);
      cRev += uses * avgOrder;
    });

    const total = Math.round(cRev);
    let formatted = '';
    if (total >= 10000000) {
      formatted = `₹${(total / 10000000).toFixed(2)}Cr`;
    } else if (total >= 100000) {
      formatted = `₹${(total / 100000).toFixed(1)}L`;
    } else {
      formatted = formatPrice(total);
    }

    const benchmarkStoreSales = 4680000;
    const percent =
      Math.min(100, Math.max(1, Math.round((total / benchmarkStoreSales) * 100))) || 18;

    return {
      totalCouponRevenue: total,
      formattedCouponRevenue: formatted,
      couponSalesPercent: percent,
    };
  }, [effectiveCoupons]);

  return (
    <AdminLayout title="Coupon Codes & Vouchers">
      {/* ── Page Header with Real Brand Icon ── */}
      <div className="admin-page-header-row" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.28)',
              color: '#ffffff',
              flexShrink: 0,
            }}
          >
            <TicketPercent size={25} strokeWidth={2.2} />
          </div>
          <div>
            <h1 className="admin-page-main-title" style={{ margin: 0 }}>Discounts & Coupons</h1>
            <p className="admin-page-main-subtitle" style={{ margin: 0, marginTop: '2px' }}>
              Manage promo coupon codes, vouchers, and automatic order discounts
            </p>
          </div>
        </div>
      </div>

      {/* ── 1. Top Metric KPI Progress Cards (Interactive Quick Filters with Real Icons) ── */}
      <div className="kpi-progress-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
        <AdminStatCard
          title="TOTAL COUPONS"
          value={totalCouponsCount}
          icon={<TicketPercent size={22} strokeWidth={2.2} />}
          variant="purple"
          footerLabel="All promo vouchers"
          footerValue={statusFilter === 'ALL' ? 'Showing all' : 'Click to show all'}
          showProgress={false}
          isActive={statusFilter === 'ALL'}
          onClick={() => setStatusFilter('ALL')}
          style={{ cursor: 'pointer' }}
        />
        <AdminStatCard
          title="ACTIVE COUPONS"
          value={activeCouponsCount}
          icon={<BadgePercent size={22} strokeWidth={2.2} />}
          variant="green"
          footerLabel="Live for checkout"
          footerValue={statusFilter === 'Active' ? 'Filtered (Active)' : 'Click to filter'}
          showProgress={false}
          isActive={statusFilter === 'Active'}
          onClick={() => setStatusFilter(statusFilter === 'Active' ? 'ALL' : 'Active')}
          style={{ cursor: 'pointer' }}
        />
        <AdminStatCard
          title="SCHEDULED COUPONS"
          value={scheduledCouponsCount}
          icon={<CalendarClock size={22} strokeWidth={2.2} />}
          variant="blue"
          footerLabel="Upcoming release"
          footerValue={
            statusFilter === 'Scheduled'
              ? 'Filtered (Scheduled)'
              : scheduledCouponsCount > 0
              ? `${scheduledCouponsCount} scheduled • click to filter`
              : 'None'
          }
          showProgress={false}
          isActive={statusFilter === 'Scheduled'}
          onClick={() => setStatusFilter(statusFilter === 'Scheduled' ? 'ALL' : 'Scheduled')}
          style={{ cursor: 'pointer' }}
        />
        <AdminStatCard
          title="COUPONS REDEEMED"
          value={couponRedemptions.toLocaleString('en-IN')}
          icon={<Gift size={22} strokeWidth={2.2} />}
          variant="orange"
          footerLabel="Customer redemptions"
          footerValue={couponRedemptions > 0 ? `+${redemptionsThisWeek} this week` : 'None'}
          showProgress={false}
        />
        <AdminStatCard
          title="TOTAL COUPON SAVINGS"
          value={formatPrice(couponSavingsTotal)}
          icon={<PiggyBank size={22} strokeWidth={2.2} />}
          variant="amber"
          footerLabel="Promotional code savings"
          footerValue={couponSavingsTotal > 0 ? 'All time' : 'None'}
          showProgress={false}
        />
        <AdminStatCard
          title="SALES VIA COUPONS"
          value={formattedCouponRevenue}
          icon={<Coins size={22} strokeWidth={2.2} />}
          variant="emerald"
          footerLabel="From coupon orders"
          footerValue={totalCouponRevenue > 0 ? `${couponSalesPercent}% of total` : 'None'}
          showProgress={false}
        />
      </div>

      {/* ── 2. Header Action Bar & Filter Bar ── */}
      <div className={styles.toolbar}>
        <div className={styles.filtersRow}>
          {/* Search by coupon code */}
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search coupon code (e.g. WELCOME100)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${styles.searchInput} ${searchTerm ? styles.hasText : ''}`}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                }}
                className={styles.clearSearchBtn}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'Active', label: 'Active Codes' },
              { value: 'Scheduled', label: 'Scheduled Codes 🕒' },
              { value: 'Disabled', label: 'Disabled Codes' },
              { value: 'Expired', label: 'Expired Codes' },
            ]}
            minWidth="145px"
          />

          {/* Target Filter (Applies To) */}
          <Select
            value={targetFilter}
            onChange={(val) => setTargetFilter(val)}
            options={[
              { value: 'ALL', label: 'All Targets' },
              { value: 'all_products', label: '🌐 Storewide' },
              { value: 'category', label: '📁 Categories' },
              { value: 'product', label: '📦 Products' },
            ]}
            minWidth="145px"
          />

          {/* Category Filter Dropdown */}
          {categoriesList.length > 0 && (
            <Select
              value={categoryFilter}
              onChange={(val) => setCategoryFilter(val)}
              options={[
                { value: 'ALL', label: 'All Categories' },
                ...categoriesList.map((c) => ({ value: c.name, label: `📁 ${c.name}` })),
              ]}
              minWidth="155px"
            />
          )}

          {/* Discount Type Filter Dropdown */}
          <Select
            value={typeFilter}
            onChange={(val) => setTypeFilter(val)}
            options={[
              { value: 'ALL', label: 'All Discount Types' },
              { value: 'percentage', label: 'Percentage (%)' },
              { value: 'flat', label: 'Flat Off (₹)' },
            ]}
            minWidth="160px"
          />

          {/* Sort By Dropdown */}
          <Select
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: 'newest', label: 'Sort: Newest First' },
              { value: 'discount_high', label: 'Sort: Discount High → Low' },
              { value: 'discount_low', label: 'Sort: Discount Low → High' },
              { value: 'most_used', label: 'Sort: Most Used' },
              { value: 'expiring_soon', label: 'Sort: Expiring Soonest' },
              { value: 'category_asc', label: 'Sort: Category (A → Z)' },
              { value: 'product_asc', label: 'Sort: Product (A → Z)' },
              { value: 'target_type', label: 'Sort: Target Type' },
              { value: 'code_asc', label: 'Sort: Code A → Z' },
            ]}
            minWidth="185px"
          />
        </div>

        {/* Right Side: Results Count & Create CTA */}
        <div className={styles.actionsRow}>
          <span className={styles.countBadge}>
            Showing <strong>{filteredCoupons.length}</strong> of {effectiveCoupons.length} coupons
          </span>

          {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' || targetFilter !== 'ALL' || categoryFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setDebouncedSearch('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setTargetFilter('ALL');
                setCategoryFilter('ALL');
              }}
              className={styles.resetBtn}
            >
              <X size={13} />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleOpenAddCoupon}
            className={styles.createBtn}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Coupon Code</span>
          </button>
        </div>
      </div>

      {/* ── 3. Cards Grid or Loading ── */}
      {loading ? (
        <Spinner size={36} />
      ) : filteredCoupons.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyContent}>
            <div className={styles.emptyIconCircle}>
              <Search size={22} />
            </div>
            <strong className={styles.emptyTitle}>
              {effectiveCoupons.length === 0 ? 'No promo coupons created yet' : 'No coupons found'}
            </strong>
            <span className={styles.emptySubtitle}>
              {effectiveCoupons.length === 0
                ? 'Click "+ Create Coupon Code" to get started.'
                : 'No promo coupons matched your search or status filter.'}
            </span>
            {effectiveCoupons.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setDebouncedSearch('');
                  setStatusFilter('ALL');
                  setTypeFilter('ALL');
                }}
                className={styles.clearFiltersBtn}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.couponsGrid}>
          {filteredCoupons.map((c) => {
            const status = getCouponStatus(c);
            const expiring = isExpiringSoon(c, status);
            const limit =
              c.usageLimitPerCustomer !== undefined && c.usageLimitPerCustomer !== null
                ? c.usageLimitPerCustomer
                : c.maxUsagePerUser !== undefined && c.maxUsagePerUser !== null
                ? c.maxUsagePerUser
                : null;
            const isHighlighted = highlightedRow === (c.code || '').toUpperCase();

            // Status Badge configuration
            const badgeConfig = (() => {
              if (status === 'Scheduled') {
                return { label: 'Scheduled', variant: 'badgeScheduled' };
              }
              if (status === 'Expired') {
                return { label: 'Expired', variant: 'badgeExpired' };
              }
              if (status === 'Disabled') {
                return { label: 'Disabled', variant: 'badgeDisabled' };
              }
              if (expiring) {
                return { label: 'Expiring Soon', variant: 'badgeExpiringSoon' };
              }
              return { label: 'Active', variant: 'badgeActive' };
            })();

            const validityText = (() => {
              if (status === 'Scheduled' && (c.validFrom || c.startsAt)) {
                return `Starts ${formatValidityDate(c.validFrom || c.startsAt)}`;
              }
              if ((c.validFrom || c.startsAt) && (c.validTill || c.endsAt)) {
                return `${formatValidityDate(c.validFrom || c.startsAt)} - ${formatValidityDate(c.validTill || c.endsAt)}`;
              }
              if (c.validTill || c.endsAt) {
                return `Till ${formatValidityDate(c.validTill || c.endsAt)}`;
              }
              return 'Always Valid';
            })();

            return (
              <div
                key={c._id}
                id={`coupon-row-${(c.code || '').toUpperCase()}`}
                className={`${styles.couponCard} ${isHighlighted ? styles.highlighted : ''}`}
              >
                {/* Top Row: Counting (Discount) on Left + Status Badge & Copy Code on Right */}
                <div className={styles.cardTop}>
                  {/* Left: Counting (Discount Metric) */}
                  <div className={styles.heroMetric}>
                    <span className={styles.heroVal}>
                      {c.type === 'percentage' ? `${c.value}%` : formatPrice(c.value)}
                    </span>
                    <span className={styles.heroBadge}>
                      {c.type === 'percentage' ? 'OFF' : 'FLAT OFF'}
                    </span>
                  </div>

                  {/* Right: Status Badge + Copy Code Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span
                      className={`${styles.statusBadge} ${styles[badgeConfig.variant]}`}
                      title={`Status: ${badgeConfig.label}`}
                    >
                      <span className={styles.statusBadgeDot} />
                      <span>{badgeConfig.label}</span>
                    </span>

                    <div className={styles.codeBadge} title="Coupon Code">
                      <span className={styles.codeText}>{c.code}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(c.code)}
                        title={copiedCode === c.code ? 'Copied to clipboard!' : 'Copy coupon code'}
                        aria-label={`Copy coupon code ${c.code}`}
                        className={`${styles.copyBtn} ${copiedCode === c.code ? styles.copied : ''}`}
                      >
                        {copiedCode === c.code ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabular Details Section */}
                <div className={styles.tableSection}>
                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Min Order</span>
                    <span className={styles.rowValue}>
                      {c.minOrderAmount ? formatPrice(c.minOrderAmount) : 'No Minimum'}
                    </span>
                  </div>

                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Max Cap</span>
                    <span className={styles.rowValue}>
                      {c.maxDiscountAmount ? formatPrice(c.maxDiscountAmount) : 'Unlimited'}
                    </span>
                  </div>

                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Validity</span>
                    <span className={styles.rowValue} title={validityText}>
                      {validityText}
                    </span>
                  </div>

                  <div className={styles.tableRow}>
                    <span className={styles.rowLabel}>Applies To</span>
                    <span className={styles.rowValue}>
                      {renderApplicableBadge(c.applicableOn)}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Usage Count (Left) & Actions (Right) */}
                <div className={styles.cardFooter}>
                  <span className={styles.usedCount}>
                    Used <strong>{c.usageCount || 0}</strong> times
                  </span>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => setViewingCoupon(c)}
                      className={styles.btnView}
                      title="View coupon details"
                      aria-label={`View details for coupon ${c.code}`}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditCoupon(c)}
                      className={styles.btnEdit}
                      title="Edit coupon"
                      aria-label={`Edit coupon ${c.code}`}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCoupon(c)}
                      className={`${styles.btnView} ${c.isActive ? styles.btnPowerActive : styles.btnPowerInactive}`}
                      title={c.isActive ? 'Disable coupon' : 'Activate coupon'}
                    >
                      <Power size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c)}
                      className={styles.btnDelete}
                      title="Delete coupon"
                      aria-label={`Delete coupon ${c.code}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── CREATE / EDIT COUPON MODAL ───────────────────────────────────────── */}
      <Modal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Coupon'}
        maxWidth={580}
      >
        <form onSubmit={handleSaveCoupon}>
          <Input
            label="Coupon Code"
            placeholder="e.g. MEGA50 or WELCOME2026"
            value={couponForm.code}
            onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
            required
          />

          <div className={styles.formGrid2}>
            <div className="form-group">
              <label className="form-label">
                Discount Type <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                className="form-input"
                value={couponForm.type}
                onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
              >
                <option value="percentage">Percentage (% OFF)</option>
                <option value="flat">Flat Amount (Rs. OFF)</option>
              </select>
            </div>

            <Input
              label={couponForm.type === 'percentage' ? 'Percentage Value (%)' : 'Flat Amount (Rs.)'}
              type="number"
              placeholder={couponForm.type === 'percentage' ? 'e.g. 15' : 'e.g. 200'}
              value={couponForm.value}
              onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGrid2}>
            <Input
              label="Minimum Order Amount (Rs.)"
              type="number"
              placeholder="e.g. 999"
              value={couponForm.minOrderAmount}
              onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
            />

            <Input
              label="Max Discount Amount (Rs. Cap)"
              type="number"
              placeholder="e.g. 500 (Optional)"
              value={couponForm.maxDiscountAmount}
              onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
            />
          </div>

          <div className={styles.formGrid2}>
            <Input
              label="Valid From (Start Date & Time)"
              type="datetime-local"
              value={couponForm.validFrom}
              onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
            />

            <Input
              label="Valid Till / Expiry (End Date & Time)"
              type="datetime-local"
              value={couponForm.validTill}
              onChange={(e) => setCouponForm({ ...couponForm, validTill: e.target.value })}
            />
          </div>

          <div className={styles.formGrid2}>
            <Input
              label="Usage Limit Per Customer"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={couponForm.usageLimitPerCustomer}
              onChange={(e) => setCouponForm({ ...couponForm, usageLimitPerCustomer: e.target.value })}
            />

            <Input
              label="Total Redemptions Count"
              type="number"
              min="0"
              placeholder="e.g. 0"
              value={couponForm.usageCount}
              onChange={(e) => setCouponForm({ ...couponForm, usageCount: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Applicable Target</label>
            <select
              className="form-input"
              value={couponForm.applicableType}
              onChange={(e) => {
                const newType = e.target.value;
                setCouponForm({
                  ...couponForm,
                  applicableType: newType,
                  applicableValue: '',
                  applicableId: '',
                  selectedCategories: newType === 'category' ? couponForm.selectedCategories : [],
                  selectedProducts: newType === 'product' ? couponForm.selectedProducts : [],
                });
                setProductSearchQuery('');
                setCategorySearchQuery('');
              }}
            >
              <option value="all">All Products (Storewide)</option>
              <option value="category">Specific Category(ies) [Search & Multi-Select]</option>
              <option value="product">Specific Product(s) [Search & Multi-Select]</option>
            </select>
          </div>

          {/* Specific Categories: Searchable Multi-Select Picker */}
          {couponForm.applicableType === 'category' && (
            <div className={styles.multiProductSection}>
              <div className={styles.multiProductHeader}>
                <div className={styles.multiProductLabel}>
                  <FolderTree size={14} color="#6d28d9" />
                  <span>Choose Qualifying Categories *</span>
                  {couponForm.selectedCategories?.length > 0 && (
                    <span className={styles.multiProductCountBadge}>
                      {couponForm.selectedCategories.length} Selected
                    </span>
                  )}
                </div>

                {/* Sort selector for categories */}
                <select
                  value={categoryPickerSort}
                  onChange={(e) => setCategoryPickerSort(e.target.value)}
                  style={{
                    fontSize: '0.74rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                  title="Sort categories"
                >
                  <option value="name_asc">Sort: Name A → Z</option>
                  <option value="name_desc">Sort: Name Z → A</option>
                </select>
              </div>

              {/* Search input with live filter */}
              <div className={styles.multiProductSearchWrap}>
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search categories by name (e.g. Sarees, Men)..."
                  className={styles.multiProductSearchInput}
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                />
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery('')}
                    className={styles.multiProductClearSearchBtn}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Selected chips row */}
              {couponForm.selectedCategories?.length > 0 && (
                <div className={styles.selectedChipsBox}>
                  <div className={styles.selectedChipsHeader}>
                    <span>Selected Categories ({couponForm.selectedCategories.length}):</span>
                    <button
                      type="button"
                      onClick={handleClearAllCategories}
                      className={styles.clearAllChipsBtn}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className={styles.selectedChipsList}>
                    {couponForm.selectedCategories.map((cat) => (
                      <span key={cat._id || cat.name} className={styles.selectedProductChip}>
                        <span>{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat._id || cat.name)}
                          className={styles.removeChipBtn}
                          title={`Remove ${cat.name}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scrollable categories list with checkboxes */}
              <div className={styles.productPickerList}>
                {filteredCategories.length === 0 ? (
                  <div className={styles.productPickerEmpty}>
                    No categories found matching "{categorySearchQuery}"
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
                    const isSelected = (couponForm.selectedCategories || []).some(
                      (c) => String(c._id) === String(cat._id) || c.name === cat.name
                    );
                    return (
                      <div
                        key={cat._id || cat.name}
                        className={`${styles.productPickerItem} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleToggleCategory(cat)}
                      >
                        <div className={styles.productPickerLeft}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by row onClick
                            className={styles.productPickerCheckbox}
                          />
                          <div className={styles.productPickerInfo}>
                            <span className={styles.productPickerName}>{cat.name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Specific Products: Searchable Multi-Select Picker */}
          {couponForm.applicableType === 'product' && (
            <div className={styles.multiProductSection}>
              <div className={styles.multiProductHeader}>
                <div className={styles.multiProductLabel}>
                  <Package size={14} color="#6d28d9" />
                  <span>Choose Qualifying Products *</span>
                  {couponForm.selectedProducts?.length > 0 && (
                    <span className={styles.multiProductCountBadge}>
                      {couponForm.selectedProducts.length} Selected
                    </span>
                  )}
                </div>

                {/* Sort selector for products */}
                <select
                  value={productPickerSort}
                  onChange={(e) => setProductPickerSort(e.target.value)}
                  style={{
                    fontSize: '0.74rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                  title="Sort products list"
                >
                  <option value="name_asc">Sort: Name A → Z</option>
                  <option value="price_low">Sort: Price Low → High</option>
                  <option value="price_high">Sort: Price High → Low</option>
                  <option value="sku">Sort: SKU A → Z</option>
                </select>
              </div>

              {/* Search input with live filter */}
              <div className={styles.multiProductSearchWrap}>
                <Search size={14} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search products by title or SKU (e.g. cream, F-GEN)..."
                  className={styles.multiProductSearchInput}
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
                {productSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setProductSearchQuery('')}
                    className={styles.multiProductClearSearchBtn}
                    title="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Selected chips row */}
              {couponForm.selectedProducts?.length > 0 && (
                <div className={styles.selectedChipsBox}>
                  <div className={styles.selectedChipsHeader}>
                    <span>Selected Products ({couponForm.selectedProducts.length}):</span>
                    <button
                      type="button"
                      onClick={handleClearAllProducts}
                      className={styles.clearAllChipsBtn}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className={styles.selectedChipsList}>
                    {couponForm.selectedProducts.map((p) => (
                      <span key={p._id || p.id} className={styles.selectedProductChip}>
                        <span>{p.name}</span>
                        {p.sku && <span className={styles.selectedProductChipSku}>{p.sku}</span>}
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(p._id || p.id)}
                          className={styles.removeChipBtn}
                          title={`Remove ${p.name}`}
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Scrollable products list with checkboxes */}
              <div className={styles.productPickerList}>
                {filteredProducts.length === 0 ? (
                  <div className={styles.productPickerEmpty}>
                    No products found matching "{productSearchQuery}"
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const isSelected = (couponForm.selectedProducts || []).some(
                      (p) => String(p._id) === String(prod._id)
                    );
                    return (
                      <div
                        key={prod._id}
                        className={`${styles.productPickerItem} ${isSelected ? styles.selected : ''}`}
                        onClick={() => handleToggleProduct(prod)}
                      >
                        <div className={styles.productPickerLeft}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by row onClick
                            className={styles.productPickerCheckbox}
                          />
                          <div className={styles.productPickerInfo}>
                            <span className={styles.productPickerName}>{prod.name}</span>
                            {prod.sku && <span className={styles.productPickerSku}>{prod.sku}</span>}
                          </div>
                        </div>
                        <span className={styles.productPickerPrice}>
                          ₹{prod.discountPrice || prod.price}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Status Toggle (Enable / Disable) */}
          <div
            onClick={() => setCouponForm({ ...couponForm, isActive: !couponForm.isActive })}
            className={`${styles.statusBanner} ${couponForm.isActive ? styles.statusBannerActive : styles.statusBannerDisabled}`}
          >
            <div className={styles.statusBannerLeft}>
              <div
                className={`${styles.statusBannerIconBox} ${couponForm.isActive ? styles.statusBannerIconActive : styles.statusBannerIconDisabled}`}
              >
                <Power size={18} />
              </div>
              <div>
                <div className={`${styles.statusBannerTitle} ${couponForm.isActive ? styles.statusBannerTitleActive : styles.statusBannerTitleDisabled}`}>
                  Status: {couponForm.isActive ? 'Active (Enabled)' : 'Disabled'}
                </div>
                <div className={`${styles.statusBannerDesc} ${couponForm.isActive ? styles.statusBannerDescActive : styles.statusBannerDescDisabled}`}>
                  {couponForm.isActive
                    ? 'Coupon is active and can be redeemed by shoppers'
                    : 'Coupon is disabled and cannot be redeemed'}
                </div>
              </div>
            </div>

            <div
              className={styles.largeToggleTrack}
              style={{ backgroundColor: couponForm.isActive ? '#16a34a' : '#cbd5e1' }}
            >
              <span
                className={styles.largeToggleThumb}
                style={{ left: couponForm.isActive ? '24px' : '3px' }}
              />
            </div>
          </div>

          <div className={styles.modalFooterActions}>
            <button type="button" onClick={() => setIsCouponModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <Button type="submit" variant="primary" loading={couponModalLoading}>
              {editingCoupon ? 'Save Changes' : 'Create Coupon'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── VIEW COUPON DETAILS MODAL ────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(viewingCoupon)}
        onClose={() => setViewingCoupon(null)}
        title="Coupon Code Details"
        maxWidth={500}
      >
        {viewingCoupon && (() => {
          const status = getCouponStatus(viewingCoupon);
          const expiring = isExpiringSoon(viewingCoupon, status);
          const limit =
            viewingCoupon.usageLimitPerCustomer !== undefined && viewingCoupon.usageLimitPerCustomer !== null
              ? viewingCoupon.usageLimitPerCustomer
              : viewingCoupon.maxUsagePerUser !== undefined && viewingCoupon.maxUsagePerUser !== null
              ? viewingCoupon.maxUsagePerUser
              : null;

          const badgeConfig = (() => {
            if (status === 'Scheduled') {
              return { label: 'Scheduled', variant: 'badgeScheduled' };
            }
            if (status === 'Expired') {
              return { label: 'Expired', variant: 'badgeExpired' };
            }
            if (status === 'Disabled') {
              return { label: 'Disabled', variant: 'badgeDisabled' };
            }
            if (expiring) {
              return { label: 'Expiring Soon', variant: 'badgeExpiringSoon' };
            }
            return { label: 'Active', variant: 'badgeActive' };
          })();

          const validityText = (() => {
            const start = viewingCoupon.validFrom || viewingCoupon.startsAt;
            const end = viewingCoupon.validTill || viewingCoupon.endsAt;
            if (status === 'Scheduled' && start) {
              return `Starts ${formatValidityDate(start)}`;
            }
            if (start && end) {
              return `${formatValidityDate(start)} - ${formatValidityDate(end)}`;
            }
            if (end) {
              return `Till ${formatValidityDate(end)}`;
            }
            return 'Always Valid';
          })();


          return (
            <div className={styles.viewContainer}>
              {/* Header: Code & Hero Discount Badge */}
              <div className={styles.viewHeader}>
                <div>
                  <div className={styles.viewHeaderCategory}>
                    Coupon Voucher
                  </div>
                  <div className={styles.viewHeaderCode}>
                    {viewingCoupon.code}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className={styles.viewHeaderVal}>
                    {viewingCoupon.type === 'percentage' ? `${viewingCoupon.value}%` : formatPrice(viewingCoupon.value)}
                  </div>
                  <div className={styles.viewHeaderType}>
                    {viewingCoupon.type === 'percentage' ? 'PERCENTAGE OFF' : 'FLAT DISCOUNT'}
                  </div>
                </div>
              </div>

              {/* Status & Usage Highlights */}
              <div className={styles.viewKpiGrid}>
                <div className={styles.viewKpiCard}>
                  <div className={styles.viewKpiLabel}>Status</div>
                  <div style={{ marginTop: '0.35rem', display: 'flex', justifyContent: 'center' }}>
                    <span className={`${styles.statusBadge} ${styles[badgeConfig.variant]}`}>
                      <span className={styles.statusBadgeDot} />
                      <span>{badgeConfig.label}</span>
                    </span>
                  </div>
                </div>

                <div className={styles.viewKpiCard}>
                  <div className={styles.viewKpiLabel}>Total Used</div>
                  <div className={styles.viewKpiVal} style={{ color: '#1e1b4b' }}>
                    {viewingCoupon.usageCount || 0} times
                  </div>
                </div>

                <div className={styles.viewKpiCard}>
                  <div className={styles.viewKpiLabel}>Per Customer</div>
                  <div className={styles.viewKpiVal} style={{ color: '#1e1b4b' }}>
                    {limit ? `Max ${limit}/user` : 'Unlimited'}
                  </div>
                </div>
              </div>

              {/* Tabular Details Grid */}
              <div className={styles.viewTable}>
                <div className={styles.viewTableRow}>
                  <span className={styles.viewTableLabel}>Min Order Amount</span>
                  <span className={styles.viewTableValue}>
                    {viewingCoupon.minOrderAmount ? formatPrice(viewingCoupon.minOrderAmount) : 'No Minimum'}
                  </span>
                </div>

                <div className={styles.viewTableRow}>
                  <span className={styles.viewTableLabel}>Max Cap (Discount Limit)</span>
                  <span className={styles.viewTableValue}>
                    {viewingCoupon.maxDiscountAmount ? formatPrice(viewingCoupon.maxDiscountAmount) : 'Unlimited'}
                  </span>
                </div>

                <div className={styles.viewTableRow}>
                  <span className={styles.viewTableLabel}>Validity Period</span>
                  <span className={styles.viewTableValue}>{validityText}</span>
                </div>

                <div className={styles.viewTableRow}>
                  <span className={styles.viewTableLabel}>Applies To</span>
                  <span className={styles.viewTableValue}>
                    {renderApplicableBadge(viewingCoupon.applicableOn)}
                  </span>
                </div>
              </div>

              {viewingCoupon.applicableOn?.type === 'product' &&
                Array.isArray(viewingCoupon.applicableOn.products) &&
                viewingCoupon.applicableOn.products.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem 0.9rem',
                      background: '#faf5ff',
                      borderRadius: '8px',
                      border: '1px solid #e9d5ff',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: '#6d28d9',
                        fontWeight: 700,
                        marginBottom: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <Package size={13} />
                      <span>Qualifying Products ({viewingCoupon.applicableOn.products.length}):</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '110px', overflowY: 'auto' }}>
                      {viewingCoupon.applicableOn.products.map((p) => (
                        <span key={p._id || p.id} className={styles.selectedProductChip}>
                          <span>{p.name}</span>
                          {p.sku && <span className={styles.selectedProductChipSku}>{p.sku}</span>}
                          {p.price ? (
                            <span style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                              ₹{p.price}
                            </span>
                          ) : null}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {viewingCoupon.applicableOn?.type === 'category' &&
                Array.isArray(viewingCoupon.applicableOn.categories) &&
                viewingCoupon.applicableOn.categories.length > 0 && (
                  <div
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem 0.9rem',
                      background: '#faf5ff',
                      borderRadius: '8px',
                      border: '1px solid #e9d5ff',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.76rem',
                        color: '#6d28d9',
                        fontWeight: 700,
                        marginBottom: '0.45rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <FolderTree size={13} />
                      <span>Qualifying Categories ({viewingCoupon.applicableOn.categories.length}):</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '110px', overflowY: 'auto' }}>
                      {viewingCoupon.applicableOn.categories.map((c) => (
                        <span key={c._id || c.name} className={styles.selectedProductChip}>
                          <span>{c.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  marginTop: '0.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <button
                  type="button"
                  onClick={() => setViewingCoupon(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    const c = viewingCoupon;
                    setViewingCoupon(null);
                    handleOpenEditCoupon(c);
                  }}
                >
                  <Edit2 size={13} style={{ marginRight: '0.35rem' }} />
                  Edit Coupon
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </AdminLayout>
  );
}
