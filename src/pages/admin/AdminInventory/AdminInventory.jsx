import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Plus,
  Minus,
  Edit3,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/admin.service';
import { categoryService } from '../../../services/category.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { useMockStockStore } from '../../../store/mockStockStore';
import styles from './AdminInventory.module.css';

// ─── Inventory Constants & Calculations ──────────────────────────────────────
export const LOW_STOCK_THRESHOLD = 5;
export const STOCK_ADJUST_REASONS = ['Restock', 'Damage', 'Loss', 'Correction', 'Return'];

export function calculateInventoryKPIs(list = []) {
  const data = Array.isArray(list) ? list : [];
  let totalStockUnits = 0;
  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;
  let deactivated = 0;
  let totalSold = 0;
  let totalReserved = 0;

  data.forEach((item) => {
    const qty = Number(item.currentStock) || 0;
    const threshold = Number(item.lowStockThreshold) || LOW_STOCK_THRESHOLD;
    totalStockUnits += qty;
    totalSold += Number(item.sold) || 0;
    totalReserved += Number(item.reserved) || 0;

    if (item.isActive === false) {
      deactivated++;
    }

    if (qty <= 0) outOfStock++;
    else if (qty <= threshold) lowStock++;
    else inStock++;
  });

  return {
    totalStockUnits,
    inStock,
    lowStock,
    outOfStock,
    deactivated,
    totalSold,
    totalReserved,
  };
}

export default function AdminInventory() {
  const { showToast } = useUiStore();
  const { getInventoryList, adjustStock: storeAdjustStock } = useMockStockStore();

  // Inventory list and DB categories
  const [inventoryList, setInventoryList] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load live inventory and categories from backend
  useEffect(() => {
    async function loadLiveInventory() {
      const startTime = Date.now();
      try {
        setIsLoading(true);
        const [invRes, catRes] = await Promise.all([
          adminService.getInventory({ limit: 100 }).catch(() => null),
          categoryService.list().catch(() => null),
        ]);
        const items = invRes ? (invRes.data?.items || invRes.data?.data || invRes.data) : [];
        if (Array.isArray(items)) {
          const mapped = items.map((inv) => {
            const p = inv.product || {};
            return {
              _id: inv._id || `inv_${p._id}`,
              productId: p._id || inv.product,
              productName: p.name || 'Product',
              sku: inv.sku || p.sku || 'SKU-001',
              category: typeof p.category === 'object' ? p.category?.name : (p.category || 'Apparel'),
              categoryId: typeof p.category === 'object' ? (p.category?._id || p.category?.id) : (p.category || 'all'),
              subCategory: p.subCategory || '',
              currentStock: inv.quantity ?? 10,
              reserved: inv.reserved ?? 0,
              sold: inv.sold ?? 0,
              isActive: p.isActive !== undefined ? p.isActive : (inv.isActive !== undefined ? inv.isActive : true),
              lowStockThreshold: inv.lowStockThreshold ?? LOW_STOCK_THRESHOLD,
              price: p.discountPrice || p.price || 999,
              images: p.images || [],
              image: (Array.isArray(p.images) && p.images[0]) || p.image || '',
              lastUpdated: inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString('en-GB') : 'Recently',
              lastReason: 'System Sync',
            };
          });
          setInventoryList(mapped);
        }
        const cItems = catRes?.data || [];
        if (Array.isArray(cItems)) {
          setCategories(cItems);
        }
      } catch (err) {
        console.warn('Could not load live inventory:', err);
        setInventoryList([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadLiveInventory();
  }, []);

  // URL Query Params Synchronization
  const [searchParams, setSearchParams] = useSearchParams();

  const urlPage = parseInt(searchParams.get('page') || '1', 10);
  const urlLimit = parseInt(searchParams.get('limit') || '10', 10);
  const urlQ = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || 'all';
  const urlStatus = searchParams.get('status') || 'all';
  const urlSort = searchParams.get('sort') || null;
  const urlOrder = searchParams.get('order') || null;

  // Filter & Search States
  const [searchInput, setSearchInput] = useState(urlQ);
  const [debouncedSearch, setDebouncedSearch] = useState(urlQ);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedStatus, setSelectedStatus] = useState(urlStatus); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

  // Sorting State
  const [sortConfig, setSortConfig] = useState({
    key: urlSort,
    direction: urlOrder === 'desc' ? 'desc' : urlSort ? 'asc' : null,
  });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(urlPage > 0 ? urlPage : 1);
  const [itemsPerPage, setItemsPerPage] = useState([10, 25, 50].includes(urlLimit) ? urlLimit : 10);

  // Selection States
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAllFilteredSelected, setIsAllFilteredSelected] = useState(false);

  // Bulk Delete Confirmation Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Loading Skeleton State
  const [isLoading, setIsLoading] = useState(false);

  // Adjust Stock Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'remove'
  const [adjustQuantity, setAdjustQuantity] = useState('10');
  const [adjustReason, setAdjustReason] = useState('Restock');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // View Product Modal State
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProductItem, setViewProductItem] = useState(null);

  // DOM Refs
  const headerCheckboxRef = useRef(null);
  const tableTopRef = useRef(null);
  const quantityInputRef = useRef(null);
  const prevFilterRef = useRef({ search: debouncedSearch, cat: selectedCategory, status: selectedStatus });

  // ─── Debounce Search Input (300ms) ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ─── Reset Selection & Page on Filter or Search Change ──────────────────────
  useEffect(() => {
    const prev = prevFilterRef.current;
    if (
      prev.search !== debouncedSearch ||
      prev.cat !== selectedCategory ||
      prev.status !== selectedStatus
    ) {
      prevFilterRef.current = { search: debouncedSearch, cat: selectedCategory, status: selectedStatus };
      setSelectedIds([]);
      setIsAllFilteredSelected(false);
      setCurrentPage(1);

      // Brief loading skeleton animation on filter change
      setIsLoading(true);
      const loadTimer = setTimeout(() => setIsLoading(false), 120);
      return () => clearTimeout(loadTimer);
    }
  }, [debouncedSearch, selectedCategory, selectedStatus]);

  // ─── Sync State with URL Query Params ──────────────────────────────────────
  useEffect(() => {
    const params = {};
    if (currentPage > 1) params.page = String(currentPage);
    if (itemsPerPage !== 10) params.limit = String(itemsPerPage);
    if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (selectedStatus !== 'all') params.status = selectedStatus;
    if (sortConfig.key && sortConfig.direction) {
      params.sort = sortConfig.key;
      params.order = sortConfig.direction;
    }
    setSearchParams(params, { replace: true });
  }, [currentPage, itemsPerPage, debouncedSearch, selectedCategory, selectedStatus, sortConfig, setSearchParams]);

  // ─── Dynamically Compute KPIs from Current Inventory ───────────────────────
  const kpis = useMemo(() => calculateInventoryKPIs(inventoryList), [inventoryList]);

  // ─── Filter Inventory Items ────────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    return inventoryList.filter((item) => {
      // Search by Product name or SKU (case-insensitive)
      const search = debouncedSearch.toLowerCase().trim();
      const matchSearch =
        !search ||
        item.productName.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(search));

      // Category filter
      const matchCategory =
        selectedCategory === 'all' ||
        String(item.categoryId) === String(selectedCategory) ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

      // Stock status filter
      if (selectedStatus === 'deactivated') {
        if (item.isActive !== false) return false;
      } else if (selectedStatus !== 'all') {
        const stock = Number(item.currentStock) || 0;
        const threshold = Number(item.lowStockThreshold) || LOW_STOCK_THRESHOLD;
        let statusKey = 'in_stock';
        if (stock <= 0) {
          statusKey = 'out_of_stock';
        } else if (stock <= threshold) {
          statusKey = 'low_stock';
        }
        if (statusKey !== selectedStatus) return false;
      }

      return matchSearch && matchCategory;
    });
  }, [inventoryList, debouncedSearch, selectedCategory, selectedStatus]);

  // ─── Sorting Logic (Applied to full filtered list before pagination) ────────
  const sortedItems = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredItems;

    return [...filteredItems].sort((a, b) => {
      let comparison = 0;
      if (sortConfig.key === 'product') {
        comparison = a.productName.localeCompare(b.productName, undefined, { sensitivity: 'base' });
      } else if (sortConfig.key === 'sku') {
        comparison = a.sku.localeCompare(b.sku, undefined, { sensitivity: 'base' });
      } else if (sortConfig.key === 'category') {
        comparison = (a.category || '').localeCompare(b.category || '', undefined, { sensitivity: 'base' });
      } else if (sortConfig.key === 'stock') {
        comparison = (Number(a.currentStock) || 0) - (Number(b.currentStock) || 0);
      } else if (sortConfig.key === 'reserved') {
        comparison = (Number(a.reserved) || 0) - (Number(b.reserved) || 0);
      } else if (sortConfig.key === 'sold') {
        comparison = (Number(a.sold) || 0) - (Number(b.sold) || 0);
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortConfig]);

  // Cycle sort: asc -> desc -> none
  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  };

  // ─── Pagination Calculations ───────────────────────────────────────────────
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, sortedItems.length);

  const paginatedItems = useMemo(() => {
    return sortedItems.slice(startIndex, endIndex);
  }, [sortedItems, startIndex, endIndex]);

  const handlePageChange = (newPage) => {
    const targetPage = Math.max(1, Math.min(newPage, totalPages));
    // Persist across page changes only if "select all filtered" is active
    if (!isAllFilteredSelected) {
      setSelectedIds([]);
    }
    setCurrentPage(targetPage);
    tableTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleRowsPerPageChange = (newVal) => {
    const newLimit = parseInt(newVal, 10);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    if (!isAllFilteredSelected) {
      setSelectedIds([]);
    }
  };

  // ─── Selection Logic (Indeterminate Header & Scope) ────────────────────────
  const isAllOnPageSelected =
    paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.includes(item._id));
  const isSomeOnPageSelected =
    paginatedItems.some((item) => selectedIds.includes(item._id));
  const isIndeterminate = isSomeOnPageSelected && !isAllOnPageSelected;

  // Set indeterminate state on DOM checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  // Toggle selection for all items on the current page
  const handleSelectPageToggle = () => {
    if (isAllOnPageSelected) {
      const pageIds = new Set(paginatedItems.map((i) => i._id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
      setIsAllFilteredSelected(false);
    } else {
      const newSelected = new Set([...selectedIds, ...paginatedItems.map((i) => i._id)]);
      setSelectedIds(Array.from(newSelected));
    }
  };

  // Switch to selecting all filtered products
  const handleSelectAllFiltered = () => {
    setSelectedIds(sortedItems.map((i) => i._id));
    setIsAllFilteredSelected(true);
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsAllFilteredSelected(false);
  };

  // Toggle individual row
  const handleToggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      if (next.length !== sortedItems.length) {
        setIsAllFilteredSelected(false);
      }
      return next;
    });
  };

  // ─── Bulk & Single Delete Flow ─────────────────────────────────────────────
  const handleOpenDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmInput('');
    setIsDeleteModalOpen(true);
  };

  const handleOpenRowDelete = (item) => {
    setSelectedIds([item._id]);
    setDeleteConfirmInput('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const count = selectedIds.length;
    if (count === 0) return;

    if (count > 5 && deleteConfirmInput.trim() !== 'DELETE') {
      showToast('Please type DELETE to confirm bulk deletion', 'error');
      return;
    }

    setIsDeleting(true);
    try {
      const itemsToDelete = inventoryList.filter((item) => selectedIds.includes(item._id));

      // Call backend API to permanently delete each product from MongoDB Atlas
      await Promise.all(
        itemsToDelete.map(async (item) => {
          const prodId = item.productId || item._id;
          try {
            await adminService.deleteProduct(prodId);
          } catch (delErr) {
            console.warn('Product delete notice:', prodId, delErr?.message);
            await adminService.deleteInventory(item._id).catch(() => null);
          }
        })
      );

      setInventoryList((prev) => prev.filter((item) => !selectedIds.includes(item._id)));
      setSelectedIds([]);
      setIsAllFilteredSelected(false);
      setIsDeleteModalOpen(false);
      showToast(`${count} product${count > 1 ? 's' : ''} permanently deleted`, 'success');
    } catch (err) {
      console.error('Delete products error:', err);
      showToast('Failed to delete selected products from database', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Adjust Stock & Restock Flow ───────────────────────────────────────────
  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustType('add');
    setAdjustQuantity('10');
    setAdjustReason('Restock');
    setAdjustNote('');
    setIsAdjustModalOpen(true);
  };

  const handleOpenRestock = (item) => {
    setSelectedItem(item);
    setAdjustType('add');
    setAdjustQuantity('25');
    setAdjustReason('Restock');
    setAdjustNote('Quick Restock replenishment');
    setIsAdjustModalOpen(true);
  };

  // Auto-focus quantity field when Adjust modal opens
  useEffect(() => {
    if (isAdjustModalOpen) {
      const timer = setTimeout(() => {
        if (quantityInputRef.current) {
          quantityInputRef.current.focus();
          quantityInputRef.current.select();
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isAdjustModalOpen]);

  // Open View Product Overview Modal
  const handleOpenView = (item) => {
    setViewProductItem(item);
    setIsViewModalOpen(true);
  };

  // Save Stock Adjustment
  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const qty = parseInt(adjustQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      showToast('Please enter a valid positive quantity', 'error');
      return;
    }

    setAdjustLoading(true);

    setTimeout(() => {
      const current = Number(selectedItem.currentStock) || 0;
      let updatedStock = current;

      if (adjustType === 'add') {
        updatedStock = current + qty;
      } else {
        if (qty > current) {
          showToast(`Cannot remove ${qty} units. Current stock is only ${current}.`, 'error');
          setAdjustLoading(false);
          return;
        }
        updatedStock = Math.max(0, current - qty);
      }

      const now = new Date();
      const timestamp =
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' +
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      setInventoryList((prev) =>
        prev.map((item) =>
          item._id === selectedItem._id
            ? {
                ...item,
                currentStock: updatedStock,
                lastUpdated: timestamp,
                lastReason: adjustReason,
              }
            : item
        )
      );

      // Update shared stock store and live backend
      const delta = adjustType === 'add' ? qty : -qty;
      storeAdjustStock(selectedItem.productId, delta);

      if (selectedItem.productId) {
        adminService.updateInventoryStock(selectedItem.productId, {
          quantity: updatedStock,
          reason: adjustReason,
        }).catch((err) => console.warn('Could not sync stock to server:', err));
      }

      const actionWord = adjustType === 'add' ? 'added to' : 'removed from';
      showToast(
        `Successfully ${actionWord} ${selectedItem.productName}! New stock: ${updatedStock}`,
        'success'
      );
      setAdjustLoading(false);
      setIsAdjustModalOpen(false);
    }, 200);
  };

  // Reset all active filters
  const handleClearFilters = () => {
    setSearchInput('');
    setDebouncedSearch('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortConfig({ key: null, direction: null });
    setCurrentPage(1);
    setSelectedIds([]);
    setIsAllFilteredSelected(false);
  };

  // ─── Toggle Product Active/Deactivate (Hide/Show on Client Store) ────────
  const [togglingId, setTogglingId] = useState(null);

  const handleToggleProductStatus = async (item) => {
    const targetId = item.productId || item._id;
    const newStatus = item.isActive === false ? true : false;
    setTogglingId(item._id);

    // Optimistic UI update
    setInventoryList((prev) =>
      prev.map((it) => (it._id === item._id ? { ...it, isActive: newStatus } : it))
    );

    try {
      await adminService.toggleProductStatus(targetId);
      showToast(
        newStatus
          ? `"${item.productName}" activated & now visible on store`
          : `"${item.productName}" deactivated & hidden from client store`,
        'success'
      );
    } catch (err) {
      // Revert optimistic update
      setInventoryList((prev) =>
        prev.map((it) => (it._id === item._id ? { ...it, isActive: !newStatus } : it))
      );
      showToast(err.response?.data?.message || 'Failed to update product status', 'error');
    } finally {
      setTogglingId(null);
    }
  };

  // ─── Render Stock Status Badge ─────────────────────────────────────────────
  const renderStockStatusBadge = (stock, threshold = LOW_STOCK_THRESHOLD, isActive = true) => {
    if (isActive === false) {
      return (
        <span className={styles.badgeDeactivated} title="Product is deactivated and hidden from client store">
          <EyeOff size={12} /> Deactivated
        </span>
      );
    }
    const qty = Number(stock);
    if (isNaN(qty) || qty <= 0) {
      return (
        <span className={styles.badgeOutOfStock}>
          <XCircle size={12} /> Out of Stock
        </span>
      );
    }
    if (qty <= threshold) {
      return (
        <span className={styles.badgeLowStock}>
          <AlertTriangle size={12} /> {qty} Left (Low)
        </span>
      );
    }
    return (
      <span className={styles.badgeInStock}>
        <CheckCircle2 size={12} /> {qty} In Stock
      </span>
    );
  };

  // ─── Dropdown Options ──────────────────────────────────────────────────────
  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories' },
      ...categories.map((c) => ({ value: c._id, label: c.name })),
    ];
  }, [categories]);

  const statusOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Statuses' },
      { value: 'in_stock', label: 'In Stock' },
      { value: 'low_stock', label: `Low Stock (≤ ${LOW_STOCK_THRESHOLD})` },
      { value: 'out_of_stock', label: 'Out of Stock (0)' },
      { value: 'deactivated', label: 'Deactivated (Hidden)' },
    ];
  }, []);

  const rowsPerPageOptions = [
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' },
    { value: '50', label: '50 per page' },
  ];

  // Helper for pagination numbers with ellipsis (e.g. 1 2 3 ... 12)
  const getPaginationItems = (current, total) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const totalItemsCount = inventoryList.length || 1;
  const inStockRate = Math.round((kpis.inStock / totalItemsCount) * 100);
  const lowStockRate = Math.round((kpis.lowStock / totalItemsCount) * 100);
  const outOfStockRate = Math.round((kpis.outOfStock / totalItemsCount) * 100);
  const deactivatedRate = Math.round(((kpis.deactivated || 0) / totalItemsCount) * 100);

  return (
    <AdminLayout title="Inventory & Stock Management">
      {/* ─── 5 Clickable Top KPI Cards (Matching SubCategories Progress Blueprint) ──────── */}
      <div className="kpi-progress-grid">
        <AdminStatCard
          title="TOTAL PRODUCT UNITS"
          value={kpis.totalStockUnits.toLocaleString()}
          icon={<Boxes size={22} />}
          variant="purple"
          footerLabel="All Store"
          footerValue="100%"
          progress={100}
          isActive={selectedStatus === 'all'}
          onClick={() => setSelectedStatus('all')}
        />
        <AdminStatCard
          title="IN STOCK ITEMS"
          value={kpis.inStock}
          icon={<CheckCircle2 size={22} />}
          variant="green"
          footerLabel="Healthy Stock"
          footerValue={`${inStockRate}%`}
          progress={inStockRate}
          isActive={selectedStatus === 'in_stock'}
          onClick={() => setSelectedStatus((prev) => (prev === 'in_stock' ? 'all' : 'in_stock'))}
        />
        <AdminStatCard
          title="LOW STOCK ALERTS"
          value={kpis.lowStock}
          icon={<AlertTriangle size={22} />}
          variant="amber"
          footerLabel={`Threshold ≤ ${LOW_STOCK_THRESHOLD}`}
          footerValue={kpis.lowStock > 0 ? `${lowStockRate}%` : 'Healthy'}
          progress={kpis.lowStock > 0 ? lowStockRate : 0}
          isActive={selectedStatus === 'low_stock'}
          onClick={() => setSelectedStatus((prev) => (prev === 'low_stock' ? 'all' : 'low_stock'))}
        />
        <AdminStatCard
          title="OUT OF STOCK ITEMS"
          value={kpis.outOfStock}
          icon={<XCircle size={22} />}
          variant="red"
          footerLabel="Zero Inventory"
          footerValue={kpis.outOfStock > 0 ? `${outOfStockRate}%` : '0%'}
          progress={kpis.outOfStock > 0 ? outOfStockRate : 0}
          isActive={selectedStatus === 'out_of_stock'}
          onClick={() => setSelectedStatus((prev) => (prev === 'out_of_stock' ? 'all' : 'out_of_stock'))}
        />
        <AdminStatCard
          title="DEACTIVATED ITEMS"
          value={kpis.deactivated || 0}
          icon={<EyeOff size={22} />}
          variant="slate"
          footerLabel="Hidden from Store"
          footerValue={kpis.deactivated > 0 ? `${deactivatedRate}%` : '0%'}
          progress={kpis.deactivated > 0 ? deactivatedRate : 0}
          isActive={selectedStatus === 'deactivated'}
          onClick={() => setSelectedStatus((prev) => (prev === 'deactivated' ? 'all' : 'deactivated'))}
        />
      </div>

      {/* ─── Controls & Filter Bar ────────────────────────────────────────── */}
      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          {/* Search Input (White background with purple focus ring) */}
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Product name or SKU (e.g. WF-001)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Filters Group (Category + Stock Status Custom Dropdowns) */}
          <div className={styles.filterGroup}>
            {/* Custom Category Dropdown */}
            <div className={styles.filterItem}>
              <label
                htmlFor="inv-category-select"
                className={styles.filterLabel}
              >
                Category:
              </label>
              <Select
                id="inv-category-select"
                ariaLabel="Filter products by Category"
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                options={categoryOptions}
                minWidth="175px"
              />
            </div>

            {/* Custom Stock Status Dropdown */}
            <div className={styles.filterItem}>
              <label
                htmlFor="inv-status-select"
                className={styles.filterLabel}
              >
                Stock Status:
              </label>
              <Select
                id="inv-status-select"
                ariaLabel="Filter products by Stock Status"
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={statusOptions}
                minWidth="185px"
                align="right"
              />
            </div>

            {/* Selection Bar & Delete Selected Button */}
            {selectedIds.length > 0 && (
              <div className={styles.selectionGroup}>
                <span className={styles.selectedCount}>
                  {selectedIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className={styles.clearBtn}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleOpenDeleteModal}
                  className={styles.deleteSelectedBtn}
                  title="Open bulk delete confirmation"
                >
                  <Trash2 size={15} />
                  <span>Delete Selected ({selectedIds.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Scope Clarity Banner Above Table ─────────────────────────────── */}
      {isAllOnPageSelected && sortedItems.length > itemsPerPage && !isAllFilteredSelected && (
        <div className={styles.scopeBanner}>
          <span>All {paginatedItems.length} products on this page are selected.</span>
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            className={styles.scopeSelectAllBtn}
          >
            Select all {sortedItems.length} products
          </button>
        </div>
      )}

      {isAllFilteredSelected && sortedItems.length > 0 && (
        <div className={styles.scopeBanner}>
          <span>All {sortedItems.length} products are selected.</span>
          <button
            type="button"
            onClick={handleClearSelection}
            className={styles.scopeClearBtn}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ─── Inventory Table ──────────────────────────────────────────────── */}
      <div ref={tableTopRef} className={styles.tableCard}>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                {/* Select All Checkbox */}
                <th className={styles.thCheckbox}>
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={handleSelectPageToggle}
                    className={styles.checkboxInput}
                    title="Select all rows on this page"
                    aria-label="Select all rows on this page"
                  />
                </th>

                {/* S.NO */}
                <th className={styles.thSno}>
                  S.NO
                </th>

                {/* PRODUCT (Clickable Sort) */}
                <th
                  onClick={() => handleSort('product')}
                  className={`${styles.thProduct} ${sortConfig.key === 'product' ? styles.thSortActive : ''}`}
                  title="Click to sort by Product name"
                >
                  <div className={styles.thSortContent}>
                    <span>Product</span>
                    {sortConfig.key === 'product' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={14} color="#7c3aed" />
                      ) : (
                        <ArrowDown size={14} color="#7c3aed" />
                      )
                    ) : (
                      <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </th>

                {/* SKU (Clickable Sort) */}
                <th
                  onClick={() => handleSort('sku')}
                  className={`${styles.thSortable} ${sortConfig.key === 'sku' ? styles.thSortActive : ''}`}
                  title="Click to sort by SKU"
                >
                  <div className={styles.thSortContent}>
                    <span>SKU</span>
                    {sortConfig.key === 'sku' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={14} color="#7c3aed" />
                      ) : (
                        <ArrowDown size={14} color="#7c3aed" />
                      )
                    ) : (
                      <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </th>

                {/* CATEGORY (Clickable Sort) */}
                <th
                  onClick={() => handleSort('category')}
                  className={`${styles.thSortable} ${sortConfig.key === 'category' ? styles.thSortActive : ''}`}
                  title="Click to sort by Category"
                >
                  <div className={styles.thSortContent}>
                    <span>Category</span>
                    {sortConfig.key === 'category' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={14} color="#7c3aed" />
                      ) : (
                        <ArrowDown size={14} color="#7c3aed" />
                      )
                    ) : (
                      <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </th>

                {/* CURRENT STOCK (Clickable Sort) */}
                <th
                  onClick={() => handleSort('stock')}
                  className={`${styles.thSortableCenter} ${sortConfig.key === 'stock' ? styles.thSortActive : ''}`}
                  title="Click to sort by Current Stock"
                >
                  <div className={styles.thSortContentCenter}>
                    <span>Current Stock</span>
                    {sortConfig.key === 'stock' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={14} color="#7c3aed" />
                      ) : (
                        <ArrowDown size={14} color="#7c3aed" />
                      )
                    ) : (
                      <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </th>

                {/* RESERVED (Clickable Sort) */}
                <th
                  onClick={() => handleSort('reserved')}
                  className={`${styles.thSortableCenter} ${sortConfig.key === 'reserved' ? styles.thSortActive : ''}`}
                  title="Click to sort by Reserved orders"
                >
                  <div className={styles.thSortContentCenter}>
                    <span>Reserved</span>
                    {sortConfig.key === 'reserved' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={14} color="#7c3aed" />
                      ) : (
                        <ArrowDown size={14} color="#7c3aed" />
                      )
                    ) : (
                      <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </th>

                {/* SOLD (Clickable Sort) */}
                <th
                  onClick={() => handleSort('sold')}
                  className={`${styles.thSortableCenter} ${sortConfig.key === 'sold' ? styles.thSortActive : ''}`}
                  title="Click to sort by Sold units"
                >
                  <div className={styles.thSortContentCenter}>
                    <span>Sold</span>
                    {sortConfig.key === 'sold' ? (
                      sortConfig.direction === 'asc' ? (
                        <ArrowUp size={14} color="#7c3aed" />
                      ) : (
                        <ArrowDown size={14} color="#7c3aed" />
                      )
                    ) : (
                      <ArrowUpDown size={13} color="#94a3b8" style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </th>

                {/* STOCK STATUS */}
                <th className={styles.thStatus}>
                  Stock Status
                </th>

                {/* ACTION */}
                <th className={styles.thAction}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Loading Skeleton */}
              {isLoading ? (
                Array.from({ length: Math.min(itemsPerPage, 8) }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className={styles.skeletonTr}>
                    <td className={styles.tdCheckbox}>
                      <div className={styles.skeletonBox} style={{ width: '16px', height: '16px', margin: '0 auto' }} />
                    </td>
                    <td className={styles.tdSno}>
                      <div className={styles.skeletonBox} style={{ width: '20px', height: '14px', margin: '0 auto' }} />
                    </td>
                    <td className={styles.tdProduct}>
                      <div className={styles.productWrap}>
                        <div className={styles.skeletonBox} style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '10px' }} />
                        <div style={{ flex: 1 }}>
                          <div className={styles.skeletonBox} style={{ width: '180px', height: '14px', marginBottom: '6px' }} />
                          <div className={styles.skeletonBoxSubtle} style={{ width: '70px', height: '12px' }} />
                        </div>
                      </div>
                    </td>
                    <td className={styles.tdSku}>
                      <div className={styles.skeletonBox} style={{ width: '70px', height: '22px', borderRadius: '6px' }} />
                    </td>
                    <td className={styles.tdCategory}>
                      <div className={styles.skeletonBoxSubtle} style={{ width: '100px', height: '22px', borderRadius: '6px' }} />
                    </td>
                    <td className={styles.tdStock}>
                      <div className={styles.skeletonBox} style={{ width: '60px', height: '16px', margin: '0 auto' }} />
                    </td>
                    <td className={styles.tdReserved}>
                      <div className={styles.skeletonBoxSubtle} style={{ width: '45px', height: '20px', borderRadius: '6px', margin: '0 auto' }} />
                    </td>
                    <td className={styles.tdSold}>
                      <div className={styles.skeletonBoxSubtle} style={{ width: '45px', height: '20px', borderRadius: '6px', margin: '0 auto' }} />
                    </td>
                    <td className={styles.tdStatus}>
                      <div className={styles.skeletonBox} style={{ width: '90px', height: '24px', borderRadius: '9999px', margin: '0 auto' }} />
                    </td>
                    <td className={styles.tdAction}>
                      <div className={styles.skeletonBox} style={{ width: '110px', height: '32px', borderRadius: '8px', marginLeft: 'auto' }} />
                    </td>
                  </tr>
                ))
              ) : sortedItems.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={10} className={styles.emptyTd}>
                    <div className={styles.emptyWrap}>
                      <div className={styles.emptyIconCircle}>
                        <Package size={30} />
                      </div>
                      <h4 className={styles.emptyTitle}>
                        No products found
                      </h4>
                      <p className={styles.emptyDesc}>
                        We couldn't find any inventory products matching your search query or filter selection.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className={styles.clearFiltersBtn}
                      >
                        <RotateCcw size={14} />
                        <span>Clear filters</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Table Rows */
                paginatedItems.map((item, index) => {
                  const isChecked = selectedIds.includes(item._id);
                  const isDeactivated = item.isActive === false;
                  const isOutOfStock = Number(item.currentStock) <= 0;
                  const isLowStock =
                    Number(item.currentStock) > 0 &&
                    Number(item.currentStock) <= (Number(item.lowStockThreshold) || LOW_STOCK_THRESHOLD);

                  const rowClass = isChecked
                    ? styles.rowSelected
                    : isDeactivated
                    ? styles.rowDeactivated
                    : isOutOfStock
                    ? styles.rowOutOfStock
                    : index % 2 === 0
                    ? styles.rowWhite
                    : styles.rowSoftLavender;

                  return (
                    <tr
                      key={item._id}
                      className={`${styles.tableRow} ${rowClass}`}
                    >
                      {/* Row Checkbox */}
                      <td className={styles.tdCheckbox}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(item._id)}
                          className={styles.checkboxInput}
                          aria-label={`Select ${item.productName}`}
                        />
                      </td>

                      {/* S.NO */}
                      <td className={styles.tdSno}>
                        <span className={styles.snoText}>
                          {startIndex + index + 1}
                        </span>
                      </td>

                      {/* Product (1-line clamp with full title tooltip) */}
                      <td className={styles.tdProduct}>
                        <div className={styles.productWrap}>
                          <img
                            src={item.image || (item.images && item.images[0]) || ''}
                            alt={item.productName}
                            className={styles.productThumb}
                          />
                          <div className={styles.productDetails}>
                            <strong
                              title={item.productName}
                              tabIndex={0}
                              aria-label={item.productName}
                              className={styles.productName}
                            >
                              {item.productName}
                            </strong>
                            <span className={styles.productPrice}>
                              {formatPrice(item.sellingPrice || item.price)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className={styles.tdSku}>
                        <span className={styles.skuPill}>
                          {item.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td className={styles.tdCategory}>
                        <span className={styles.categoryPill}>
                          {item.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className={styles.tdStock}>
                        <strong
                          className={`${styles.stockUnits} ${
                            item.currentStock <= 0
                              ? styles.stockZero
                              : item.currentStock <= LOW_STOCK_THRESHOLD
                              ? styles.stockLow
                              : styles.stockNormal
                          }`}
                        >
                          {item.currentStock} units
                        </strong>
                      </td>

                      {/* Reserved Stock */}
                      <td className={styles.tdReserved}>
                        <span className={styles.reservedPill} title={`${item.reserved || 0} units reserved in orders`}>
                          {item.reserved || 0}
                        </span>
                      </td>

                      {/* Sold Stock */}
                      <td className={styles.tdSold}>
                        <span className={styles.soldPill} title={`${item.sold || 0} units sold & fulfilled`}>
                          {item.sold || 0}
                        </span>
                      </td>

                      {/* Stock Status */}
                      <td className={styles.tdStatus}>
                        <div className={styles.statusCenter}>
                          {renderStockStatusBadge(item.currentStock, item.lowStockThreshold, item.isActive)}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className={styles.tdAction}>
                        <div className={styles.actionRow}>
                          {/* Icon-Only View Button with Tooltip */}
                          <button
                            type="button"
                            onClick={() => handleOpenView(item)}
                            className={styles.btnActionView}
                            title={`View ${item.productName} overview`}
                            aria-label={`View ${item.productName} overview`}
                          >
                            <ExternalLink size={14} color="#475569" />
                          </button>

                          {/* Quick Restock for Low / Out of Stock rows, or regular Adjust Stock */}
                          {isOutOfStock || isLowStock ? (
                            <button
                              type="button"
                              onClick={() => handleOpenRestock(item)}
                              className={isOutOfStock ? styles.btnRestockOutOfStock : styles.btnRestockLowStock}
                              title="Quick Restock (Add Stock)"
                            >
                              <Plus size={13} />
                              <span>Restock</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAdjust(item)}
                              className={styles.btnAdjustStock}
                              title="Adjust Stock Quantity"
                            >
                              <Edit3 size={13} color="#5b13df" />
                              <span>Adjust Stock</span>
                            </button>
                          )}

                          {/* Toggle Active / Deactivate (Hide/Show on Client Store) */}
                          <button
                            type="button"
                            onClick={() => handleToggleProductStatus(item)}
                            disabled={togglingId === item._id}
                            className={`${styles.btnToggleStatus} ${
                              item.isActive === false ? styles.btnStatusInactive : styles.btnStatusActive
                            }`}
                            title={
                              item.isActive === false
                                ? `Activate "${item.productName}" (Make visible on client store)`
                                : `Deactivate "${item.productName}" (Hide from client store)`
                            }
                            aria-label={
                              item.isActive === false
                                ? `Activate ${item.productName}`
                                : `Deactivate ${item.productName}`
                            }
                          >
                            {item.isActive === false ? (
                              <Eye size={14} color="#16a34a" />
                            ) : (
                              <EyeOff size={14} color="#64748b" />
                            )}
                          </button>

                          {/* Row Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenRowDelete(item)}
                            className={styles.btnRowDelete}
                            title={`Delete ${item.productName}`}
                            aria-label={`Delete ${item.productName}`}
                          >
                            <Trash2 size={13} color="#ef4444" />
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

        {/* ─── Pagination Footer ────────────────────────────────────────────── */}
        {sortedItems.length > 0 && (
          <div className={styles.paginationBar}>
            {/* Pagination Controls (First, Prev, 1 2 3 ... N, Next, Last) */}
            <div className={styles.paginationControls}>
              {/* First Page Button */}
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => handlePageChange(1)}
                title="First Page"
                aria-label="Go to first page"
                className={styles.pageNavBtn}
              >
                <ChevronsLeft size={14} />
                <span>First</span>
              </button>

              {/* Previous Page Button */}
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                title="Previous Page"
                aria-label="Go to previous page"
                className={styles.pageNavBtn}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Dynamic Page Items with Ellipsis */}
              {getPaginationItems(safeCurrentPage, totalPages).map((pItem, idx) => {
                if (pItem === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>
                      ...
                    </span>
                  );
                }

                const isActive = pItem === safeCurrentPage;
                return (
                  <button
                    key={pItem}
                    type="button"
                    onClick={() => handlePageChange(pItem)}
                    aria-label={`Go to page ${pItem}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`${styles.pageBtnNumber} ${isActive ? styles.pageBtnActive : ''}`}
                  >
                    {pItem}
                  </button>
                );
              })}

              {/* Next Page Button */}
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                title="Next Page"
                aria-label="Go to next page"
                className={styles.pageNavBtn}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>

              {/* Last Page Button */}
              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => handlePageChange(totalPages)}
                title="Last Page"
                aria-label="Go to last page"
                className={styles.pageNavBtn}
              >
                <span>Last</span>
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bulk Delete Confirmation Modal ──────────────────────────────── */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Delete ${selectedIds.length} ${selectedIds.length === 1 ? 'product' : 'products'}?`}
          maxWidth={480}
        >
          <div className={styles.modalStack}>
            <div className={styles.dangerAlert}>
              <div className={styles.dangerAlertIcon}>
                <Trash2 size={18} />
              </div>
              <div>
                <strong className={styles.dangerAlertTitle}>
                  This action cannot be undone.
                </strong>
                <p className={styles.dangerAlertText}>
                  You are about to remove <strong>{selectedIds.length}</strong> selected product
                  {selectedIds.length > 1 ? 's' : ''} from the active inventory catalog.
                </p>
              </div>
            </div>

            {/* If more than 5 products are selected, ask user to type DELETE */}
            {selectedIds.length > 5 && (
              <div className={styles.confirmInputCard}>
                <label
                  htmlFor="delete-confirm-input"
                  className={styles.confirmInputLabel}
                >
                  To confirm bulk deletion, please type <code className={styles.confirmCodeSnippet}>DELETE</code> below:
                </label>
                <input
                  id="delete-confirm-input"
                  type="text"
                  autoFocus
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  className={styles.confirmTextInput}
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className={styles.modalFooterActions}>
              <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting || (selectedIds.length > 5 && deleteConfirmInput.trim() !== 'DELETE')}
                className={styles.btnConfirmDelete}
              >
                <Trash2 size={15} />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Adjust Stock Modal ───────────────────────────────────────────── */}
      {isAdjustModalOpen && selectedItem && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock — ${selectedItem.sku}`}
        >
          <form onSubmit={handleSaveAdjustment} className={styles.adjustForm}>
            <div className={styles.adjustProductHero}>
              <img
                src={selectedItem.image || (selectedItem.images && selectedItem.images[0]) || ''}
                alt={selectedItem.productName}
                className={styles.adjustProductImage}
              />
              <div>
                <strong className={styles.adjustProductTitle}>
                  {selectedItem.productName}
                </strong>
                <span className={styles.adjustProductMeta}>
                  Current Stock Level: <strong className={styles.adjustCurrentQty}>{selectedItem.currentStock} units</strong>
                </span>
              </div>
            </div>

            {/* Adjustment Type Toggle */}
            <div>
              <label className={styles.adjustFieldLabel}>
                Adjustment Type
              </label>
              <div className={styles.adjustTypeGrid}>
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  className={`${styles.adjustTypeBtn} ${adjustType === 'add' ? styles.adjustTypeBtnAddActive : ''}`}
                >
                  <Plus size={16} />
                  <span>Add Stock (Restock)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('remove')}
                  className={`${styles.adjustTypeBtn} ${adjustType === 'remove' ? styles.adjustTypeBtnRemoveActive : ''}`}
                >
                  <Minus size={16} />
                  <span>Remove Stock (Deduct)</span>
                </button>
              </div>
            </div>

            {/* Quantity with autofocus ref */}
            <div>
              <label
                htmlFor="adjust-qty-input"
                className={styles.adjustFieldLabel}
              >
                Quantity to Adjust <span className={styles.requiredAsterisk}>*</span>
              </label>
              <input
                id="adjust-qty-input"
                ref={quantityInputRef}
                type="number"
                min="1"
                required
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                placeholder="e.g. 10"
                className={styles.adjustInput}
              />
            </div>

            {/* Reason */}
            <div>
              <label className={styles.adjustFieldLabel}>
                Reason for Adjustment <span className={styles.requiredAsterisk}>*</span>
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className={styles.adjustSelect}
              >
                {STOCK_ADJUST_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Notes */}
            <div>
              <label className={styles.adjustFieldLabel}>
                Internal Audit Note (Optional)
              </label>
              <textarea
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="e.g. Received new shipment lot from Nachiarkoil workshop"
                rows={2}
                className={styles.adjustTextarea}
              />
            </div>

            <div className={styles.modalFooterActions}>
              <Button type="button" variant="secondary" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={adjustLoading}>
                Save Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ─── View Product Overview Modal ─────────────────────────────────── */}
      {isViewModalOpen && viewProductItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Product Overview — ${viewProductItem.sku}`}
        >
          <div className={styles.viewModalContent}>
            <div className={styles.viewHeaderWrap}>
              <img
                src={viewProductItem.image || (viewProductItem.images && viewProductItem.images[0]) || ''}
                alt={viewProductItem.productName}
                className={styles.viewProductImage}
              />
              <div>
                <h4 className={styles.viewProductTitle}>
                  {viewProductItem.productName}
                </h4>
                <div className={styles.viewPillRow}>
                  <span className={styles.viewSkuPill}>
                    SKU: {viewProductItem.sku}
                  </span>
                  <span className={styles.viewCategoryPill}>
                    {viewProductItem.category}
                  </span>
                </div>
                <div className={styles.viewPriceRow}>
                  Selling Price: <strong className={styles.viewSellingPrice}>{formatPrice(viewProductItem.sellingPrice)}</strong>{' '}
                  <span className={styles.viewRegularPrice}>
                    {formatPrice(viewProductItem.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.viewStatsGrid}>
              <div>
                <span className={styles.viewStatLabel}>Current Stock</span>
                <strong className={styles.viewStatValPrimary}>{viewProductItem.currentStock}</strong>
              </div>
              <div>
                <span className={styles.viewStatLabel}>Reserved</span>
                <strong className={styles.viewStatValWarning}>{viewProductItem.reserved || 0}</strong>
              </div>
              <div>
                <span className={styles.viewStatLabel}>Total Sold</span>
                <strong style={{ color: '#15803d', fontWeight: 800 }}>{viewProductItem.sold || 0}</strong>
              </div>
              <div>
                <span className={styles.viewStatLabel}>Store Visibility</span>
                <div className={styles.viewBadgeWrapper}>
                  {renderStockStatusBadge(viewProductItem.currentStock, viewProductItem.lowStockThreshold, viewProductItem.isActive)}
                </div>
              </div>
            </div>

            <div className={styles.viewCloseRow}>
              <Button type="button" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
