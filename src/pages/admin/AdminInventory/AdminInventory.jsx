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
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import {
  STOCK_ADJUST_REASONS,
  calculateInventoryKPIs,
  LOW_STOCK_THRESHOLD,
} from '../../../data/inventoryMockData';
import { MOCK_CATEGORIES } from '../../../data/categoryMockData';
import { useMockStockStore } from '../../../store/mockStockStore';

export default function AdminInventory() {
  const { showToast } = useUiStore();
  const { getInventoryList, adjustStock: storeAdjustStock } = useMockStockStore();

  // Inventory list derived from shared mockStockStore (single source of truth)
  const [inventoryList, setInventoryList] = useState(() => getInventoryList());

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
        item.categoryId === selectedCategory ||
        item.category.toLowerCase() === selectedCategory.toLowerCase();

      // Stock status filter
      const stock = Number(item.currentStock) || 0;
      const threshold = Number(item.lowStockThreshold) || LOW_STOCK_THRESHOLD;
      let statusKey = 'in_stock';
      if (stock <= 0) {
        statusKey = 'out_of_stock';
      } else if (stock <= threshold) {
        statusKey = 'low_stock';
      }

      const matchStatus = selectedStatus === 'all' || statusKey === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
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

  // ─── Bulk Delete Flow ──────────────────────────────────────────────────────
  const handleOpenDeleteModal = () => {
    if (selectedIds.length === 0) return;
    setDeleteConfirmInput('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    const count = selectedIds.length;
    if (count === 0) return;

    if (count > 5 && deleteConfirmInput.trim() !== 'DELETE') {
      showToast('Please type DELETE to confirm bulk deletion', 'error');
      return;
    }

    setInventoryList((prev) => prev.filter((item) => !selectedIds.includes(item._id)));
    setSelectedIds([]);
    setIsAllFilteredSelected(false);
    setIsDeleteModalOpen(false);
    showToast(`${count} product${count > 1 ? 's' : ''} deleted`, 'success');
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

      // Update shared stock store
      const delta = adjustType === 'add' ? qty : -qty;
      storeAdjustStock(selectedItem.productId, delta);

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

  // ─── Render Stock Status Badge ─────────────────────────────────────────────
  const renderStockStatusBadge = (stock, threshold = LOW_STOCK_THRESHOLD) => {
    const qty = Number(stock);
    if (isNaN(qty) || qty <= 0) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.22rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            whiteSpace: 'nowrap',
          }}
        >
          <XCircle size={12} /> Out of Stock
        </span>
      );
    }
    if (qty <= threshold) {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.22rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: '#fef3c7',
            color: '#d97706',
            border: '1px solid #fde68a',
            whiteSpace: 'nowrap',
          }}
        >
          <AlertTriangle size={12} /> {qty} Left (Low)
        </span>
      );
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.22rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.78rem',
          fontWeight: 700,
          background: '#dcfce7',
          color: '#15803d',
          border: '1px solid #bbf7d0',
          whiteSpace: 'nowrap',
        }}
      >
        <CheckCircle2 size={12} /> {qty} In Stock
      </span>
    );
  };

  // ─── Dropdown Options ──────────────────────────────────────────────────────
  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories' },
      ...MOCK_CATEGORIES.map((c) => ({ value: c._id, label: c.name })),
    ];
  }, []);

  const statusOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Statuses' },
      { value: 'in_stock', label: 'In Stock' },
      { value: 'low_stock', label: `Low Stock (≤ ${LOW_STOCK_THRESHOLD})` },
      { value: 'out_of_stock', label: 'Out of Stock (0)' },
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

  return (
    <AdminLayout title="Inventory & Stock Management">
      {/* ─── 4 Clickable Top KPI Stat Cards ───────────────────────────────── */}
      <div
        className="metrics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Card 1: Total Product Units */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedStatus('all')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStatus('all');
            }
          }}
          className="metric-card"
          title="Click to clear status filter and view all products"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: selectedStatus === 'all' ? '2px solid #7c3aed' : '1.5px solid #ede8f8',
            boxShadow:
              selectedStatus === 'all'
                ? '0 4px 18px rgba(124, 58, 237, 0.16)'
                : '0 2px 12px rgba(124, 58, 237, 0.04)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            outline: 'none',
          }}
        >
          <div
            className="metric-icon-wrap"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: '#ede8f8',
              color: '#7c3aed',
            }}
          >
            <Boxes size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="metric-val"
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: '#1e1b4b',
                lineHeight: 1.15,
                marginBottom: '2px',
                display: 'flex',
                alignItems: 'baseline',
                gap: '0.35rem',
              }}
            >
              <span>{kpis.totalStockUnits.toLocaleString()}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7c3aed' }}>Units</span>
            </div>
            <div
              className="metric-label"
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Total Product Units
            </div>
          </div>
        </div>

        {/* Card 2: In Stock Items */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedStatus((prev) => (prev === 'in_stock' ? 'all' : 'in_stock'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStatus((prev) => (prev === 'in_stock' ? 'all' : 'in_stock'));
            }
          }}
          className="metric-card"
          title="Click to filter by In Stock items"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: selectedStatus === 'in_stock' ? '2px solid #7c3aed' : '1.5px solid #ede8f8',
            boxShadow:
              selectedStatus === 'in_stock'
                ? '0 4px 18px rgba(124, 58, 237, 0.16)'
                : '0 2px 12px rgba(124, 58, 237, 0.04)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            outline: 'none',
          }}
        >
          <div
            className="metric-icon-wrap"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: '#dcfce7',
              color: '#16a34a',
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="metric-val"
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: '#1e1b4b',
                lineHeight: 1.15,
                marginBottom: '2px',
              }}
            >
              {kpis.inStock}
            </div>
            <div
              className="metric-label"
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              In Stock Items
            </div>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedStatus((prev) => (prev === 'low_stock' ? 'all' : 'low_stock'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStatus((prev) => (prev === 'low_stock' ? 'all' : 'low_stock'));
            }
          }}
          className="metric-card"
          title={`Click to filter by Low Stock items (≤ ${LOW_STOCK_THRESHOLD})`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: selectedStatus === 'low_stock' ? '2px solid #7c3aed' : '1.5px solid #ede8f8',
            boxShadow:
              selectedStatus === 'low_stock'
                ? '0 4px 18px rgba(124, 58, 237, 0.16)'
                : '0 2px 12px rgba(124, 58, 237, 0.04)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            outline: 'none',
          }}
        >
          <div
            className="metric-icon-wrap"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: '#fef3c7',
              color: '#d97706',
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="metric-val"
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: '#1e1b4b',
                lineHeight: 1.15,
                marginBottom: '2px',
              }}
            >
              {kpis.lowStock}
            </div>
            <div
              className="metric-label"
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Low Stock Alerts (≤ {LOW_STOCK_THRESHOLD})
            </div>
          </div>
        </div>

        {/* Card 4: Out of Stock Items */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedStatus((prev) => (prev === 'out_of_stock' ? 'all' : 'out_of_stock'))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedStatus((prev) => (prev === 'out_of_stock' ? 'all' : 'out_of_stock'));
            }
          }}
          className="metric-card"
          title="Click to filter by Out of Stock items"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.1rem 1.25rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: selectedStatus === 'out_of_stock' ? '2px solid #7c3aed' : '1.5px solid #ede8f8',
            boxShadow:
              selectedStatus === 'out_of_stock'
                ? '0 4px 18px rgba(124, 58, 237, 0.16)'
                : '0 2px 12px rgba(124, 58, 237, 0.04)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            outline: 'none',
          }}
        >
          <div
            className="metric-icon-wrap"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: '#fee2e2',
              color: '#dc2626',
            }}
          >
            <XCircle size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="metric-val"
              style={{
                fontSize: '1.55rem',
                fontWeight: 800,
                color: '#1e1b4b',
                lineHeight: 1.15,
                marginBottom: '2px',
              }}
            >
              {kpis.outOfStock}
            </div>
            <div
              className="metric-label"
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Out of Stock Items
            </div>
          </div>
        </div>
      </div>

      {/* ─── Controls & Filter Bar ────────────────────────────────────────── */}
      <div
        className="card"
        style={{
          position: 'relative',
          zIndex: 40,
          marginBottom: '1rem',
          padding: '1rem 1.25rem',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #ede8f8',
          boxShadow: '0 2px 12px rgba(124, 58, 237, 0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Search Input (White background with purple focus ring) */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flex: '1',
              minWidth: '280px',
            }}
          >
            <Search
              size={16}
              style={{ position: 'absolute', left: '1rem', color: '#8a7ca6', pointerEvents: 'none' }}
            />
            <input
              type="text"
              placeholder="Search by Product name or SKU (e.g. WF-001)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 1rem 0 2.6rem',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: '#1e1b4b',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.18s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.boxShadow = '0 0 0 3.5px rgba(124, 58, 237, 0.16)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
              }}
            />
          </div>

          {/* Filters Group (Category + Stock Status Custom Dropdowns) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Custom Category Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label
                htmlFor="inv-category-select"
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label
                htmlFor="inv-status-select"
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#5b13df' }}>
                  {selectedIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: '0 0.2rem',
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleOpenDeleteModal}
                  style={{
                    height: '42px',
                    padding: '0 1rem',
                    borderRadius: '12px',
                    background: '#dc2626',
                    border: '1.5px solid #b91c1c',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.2)',
                  }}
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
        <div
          style={{
            marginBottom: '0.85rem',
            padding: '0.65rem 1.15rem',
            background: '#faf5ff',
            border: '1.5px solid #dcd0fa',
            borderRadius: '12px',
            fontSize: '0.84rem',
            color: '#4c1d95',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>All {paginatedItems.length} products on this page are selected.</span>
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            style={{
              background: 'none',
              border: 'none',
              color: '#7c3aed',
              fontWeight: 800,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.84rem',
              padding: 0,
            }}
          >
            Select all {sortedItems.length} products
          </button>
        </div>
      )}

      {isAllFilteredSelected && sortedItems.length > 0 && (
        <div
          style={{
            marginBottom: '0.85rem',
            padding: '0.65rem 1.15rem',
            background: '#faf5ff',
            border: '1.5px solid #dcd0fa',
            borderRadius: '12px',
            fontSize: '0.84rem',
            color: '#4c1d95',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>All {sortedItems.length} products are selected.</span>
          <button
            type="button"
            onClick={handleClearSelection}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontWeight: 800,
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.84rem',
              padding: 0,
            }}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ─── Inventory Table ──────────────────────────────────────────────── */}
      <div
        ref={tableTopRef}
        className="table-container"
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: '18px',
          border: '1.5px solid #ede8f8',
          boxShadow: '0 4px 24px rgba(124, 58, 237, 0.05)',
          background: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%', maxHeight: '620px', overflowY: 'auto' }}>
          <table
            className="admin-table"
            style={{
              borderCollapse: 'collapse',
              width: '100%',
              minWidth: '1040px',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f5f0fe',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  boxShadow: '0 1px 0 #ede8f8',
                }}
              >
                {/* Select All Checkbox */}
                <th
                  style={{
                    width: '44px',
                    padding: '1rem 0.6rem 1rem 1.1rem',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    background: '#f5f0fe',
                  }}
                >
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={isAllOnPageSelected}
                    onChange={handleSelectPageToggle}
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      accentColor: '#7c3aed',
                    }}
                    title="Select all rows on this page"
                    aria-label="Select all rows on this page"
                  />
                </th>

                {/* S.NO */}
                <th
                  style={{
                    width: '56px',
                    padding: '1rem 0.5rem',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#5b21b6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#f5f0fe',
                  }}
                >
                  S.NO
                </th>

                {/* PRODUCT (Clickable Sort) */}
                <th
                  onClick={() => handleSort('product')}
                  style={{
                    padding: '1rem 1.25rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: sortConfig.key === 'product' ? '#7c3aed' : '#5b21b6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: '#f5f0fe',
                  }}
                  title="Click to sort by Product name"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
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
                  style={{
                    padding: '1rem 0.85rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: sortConfig.key === 'sku' ? '#7c3aed' : '#5b21b6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: '#f5f0fe',
                  }}
                  title="Click to sort by SKU"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
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
                  style={{
                    padding: '1rem 0.85rem',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: sortConfig.key === 'category' ? '#7c3aed' : '#5b21b6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: '#f5f0fe',
                  }}
                  title="Click to sort by Category"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
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
                  style={{
                    padding: '1rem 0.85rem',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: sortConfig.key === 'stock' ? '#7c3aed' : '#5b21b6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: '#f5f0fe',
                  }}
                  title="Click to sort by Current Stock"
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
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

                {/* STOCK STATUS */}
                <th
                  style={{
                    padding: '1rem 0.85rem',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#5b21b6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#f5f0fe',
                  }}
                >
                  Stock Status
                </th>

                {/* ACTION */}
                <th
                  style={{
                    padding: '1rem 1.5rem 1rem 0.85rem',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#5b21b6',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: '#f5f0fe',
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Loading Skeleton */}
              {isLoading ? (
                Array.from({ length: Math.min(itemsPerPage, 8) }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} style={{ borderBottom: '1px solid #f1eafa' }}>
                    <td style={{ padding: '1rem 0.6rem 1rem 1.1rem', textAlign: 'center' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: '#ede8f8', margin: '0 auto' }} />
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ width: '20px', height: '14px', borderRadius: '4px', background: '#ede8f8', margin: '0 auto' }} />
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ede8f8', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ width: '180px', height: '14px', borderRadius: '4px', background: '#ede8f8', marginBottom: '6px' }} />
                          <div style={{ width: '70px', height: '12px', borderRadius: '4px', background: '#f5f0fe' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.85rem' }}>
                      <div style={{ width: '70px', height: '22px', borderRadius: '6px', background: '#ede8f8' }} />
                    </td>
                    <td style={{ padding: '1rem 0.85rem' }}>
                      <div style={{ width: '100px', height: '22px', borderRadius: '6px', background: '#f5f0fe' }} />
                    </td>
                    <td style={{ padding: '1rem 0.85rem', textAlign: 'center' }}>
                      <div style={{ width: '60px', height: '16px', borderRadius: '4px', background: '#ede8f8', margin: '0 auto' }} />
                    </td>
                    <td style={{ padding: '1rem 0.85rem', textAlign: 'center' }}>
                      <div style={{ width: '90px', height: '24px', borderRadius: '9999px', background: '#ede8f8', margin: '0 auto' }} />
                    </td>
                    <td style={{ padding: '1rem 1.5rem 1rem 0.85rem', textAlign: 'right' }}>
                      <div style={{ width: '110px', height: '32px', borderRadius: '8px', background: '#ede8f8', marginLeft: 'auto' }} />
                    </td>
                  </tr>
                ))
              ) : sortedItems.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '4.5rem 1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '58px',
                          height: '58px',
                          borderRadius: '50%',
                          background: '#f5f0fe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#7c3aed',
                        }}
                      >
                        <Package size={30} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b' }}>
                        No products found
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', maxWidth: '340px' }}>
                        We couldn't find any inventory products matching your search query or filter selection.
                      </p>
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.55rem 1.25rem',
                          borderRadius: '10px',
                          background: '#ede8f8',
                          border: '1px solid #dcd0fa',
                          color: '#5b13df',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s ease',
                        }}
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
                  const isOutOfStock = Number(item.currentStock) <= 0;
                  const isLowStock =
                    Number(item.currentStock) > 0 &&
                    Number(item.currentStock) <= (Number(item.lowStockThreshold) || LOW_STOCK_THRESHOLD);

                  // Row background: Selected (light purple) > Out of Stock (very light red) > Default (white)
                  const rowBg = isChecked ? '#faf5ff' : isOutOfStock ? '#fef2f2' : '#ffffff';

                  return (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: '1px solid #f1eafa',
                        background: rowBg,
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Row Checkbox */}
                      <td
                        style={{
                          padding: '0.95rem 0.6rem 0.95rem 1.1rem',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(item._id)}
                          style={{
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px',
                            accentColor: '#7c3aed',
                          }}
                          aria-label={`Select ${item.productName}`}
                        />
                      </td>

                      {/* S.NO */}
                      <td
                        style={{
                          padding: '0.95rem 0.5rem',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                          {startIndex + index + 1}
                        </span>
                      </td>

                      {/* Product (1-line clamp with full title tooltip) */}
                      <td style={{ padding: '0.95rem 1.25rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                            alt={item.productName}
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              objectFit: 'cover',
                              border: '1.5px solid #ede8f8',
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0, maxWidth: '280px' }}>
                            <strong
                              title={item.productName}
                              tabIndex={0}
                              aria-label={item.productName}
                              style={{
                                fontSize: '0.88rem',
                                color: '#1e1b4b',
                                display: 'block',
                                lineHeight: 1.35,
                                marginBottom: '2px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                cursor: 'default',
                                outline: 'none',
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.color = '#7c3aed';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.color = '#1e1b4b';
                              }}
                            >
                              {item.productName}
                            </strong>
                            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
                              {formatPrice(item.sellingPrice || item.price)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '0.95rem 0.85rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            color: '#5b13df',
                            background: '#ede8f8',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            letterSpacing: '0.03em',
                            border: '1px solid #dfd5f5',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.sku}
                        </span>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.95rem 0.85rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#334155',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td
                        style={{
                          padding: '0.95rem 0.85rem',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <strong
                          style={{
                            fontSize: '0.95rem',
                            color:
                              item.currentStock <= 0
                                ? '#dc2626'
                                : item.currentStock <= LOW_STOCK_THRESHOLD
                                ? '#d97706'
                                : '#1e1b4b',
                            display: 'inline-block',
                          }}
                        >
                          {item.currentStock} units
                        </strong>
                      </td>

                      {/* Stock Status */}
                      <td
                        style={{
                          padding: '0.95rem 0.85rem',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
                          {renderStockStatusBadge(item.currentStock, item.lowStockThreshold)}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td
                        style={{
                          padding: '0.95rem 1.5rem 0.95rem 0.85rem',
                          verticalAlign: 'middle',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.5rem',
                          }}
                        >
                          {/* Icon-Only View Button with Tooltip */}
                          <button
                            type="button"
                            onClick={() => handleOpenView(item)}
                            className="admin-period-select-btn"
                            style={{
                              width: '32px',
                              height: '32px',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              background: '#ffffff',
                              color: '#475569',
                              cursor: 'pointer',
                              fontWeight: 600,
                              transition: 'all 0.15s ease',
                            }}
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
                              style={{
                                padding: '0.4rem 0.85rem',
                                fontSize: '0.78rem',
                                height: '32px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                borderRadius: '8px',
                                background: isOutOfStock ? '#fee2e2' : '#fef3c7',
                                border: isOutOfStock ? '1px solid #fecaca' : '1px solid #fde68a',
                                color: isOutOfStock ? '#b91c1c' : '#b45309',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title="Quick Restock (Add Stock)"
                            >
                              <Plus size={13} />
                              <span>Restock</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenAdjust(item)}
                              className="admin-period-select-btn"
                              style={{
                                padding: '0.4rem 0.85rem',
                                fontSize: '0.78rem',
                                height: '32px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                borderRadius: '8px',
                                background: '#ede8f8',
                                border: '1px solid #dcd0fa',
                                color: '#5b13df',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                              title="Adjust Stock Quantity"
                            >
                              <Edit3 size={13} color="#5b13df" />
                              <span>Adjust Stock</span>
                            </button>
                          )}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.9rem 1.4rem',
              borderTop: '1px solid #f1eafa',
              background: '#fcfbfe',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            {/* Left: Showing Count Indicator */}
            <div style={{ fontSize: '0.82rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              Showing <strong style={{ color: '#1e1b4b' }}>{startIndex + 1}</strong> to{' '}
              <strong style={{ color: '#1e1b4b' }}>{endIndex}</strong> of{' '}
              <strong style={{ color: '#1e1b4b' }}>{sortedItems.length}</strong> products
            </div>

            {/* Center: Pagination Controls (First, Prev, 1 2 3 ... N, Next, Last) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                flexWrap: 'wrap',
              }}
            >
              {/* First Page Button */}
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => handlePageChange(1)}
                title="First Page"
                aria-label="Go to first page"
                style={{
                  height: '32px',
                  padding: '0 0.55rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: safeCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                  color: safeCurrentPage <= 1 ? '#94a3b8' : '#334155',
                  cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.15s ease',
                }}
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
                style={{
                  height: '32px',
                  padding: '0 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: safeCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                  color: safeCurrentPage <= 1 ? '#94a3b8' : '#334155',
                  cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {/* Dynamic Page Items with Ellipsis */}
              {getPaginationItems(safeCurrentPage, totalPages).map((pItem, idx) => {
                if (pItem === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        padding: '0 0.4rem',
                        color: '#94a3b8',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        userSelect: 'none',
                      }}
                    >
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
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isActive ? '#7c3aed' : '#e2e8f0',
                      background: isActive ? '#7c3aed' : '#ffffff',
                      color: isActive ? '#ffffff' : '#334155',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
                    }}
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
                style={{
                  height: '32px',
                  padding: '0 0.65rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: safeCurrentPage >= totalPages ? '#f8fafc' : '#ffffff',
                  color: safeCurrentPage >= totalPages ? '#94a3b8' : '#334155',
                  cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.15s ease',
                }}
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
                style={{
                  height: '32px',
                  padding: '0 0.55rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: safeCurrentPage >= totalPages ? '#f8fafc' : '#ffffff',
                  color: safeCurrentPage >= totalPages ? '#94a3b8' : '#334155',
                  cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Last</span>
                <ChevronsRight size={14} />
              </button>
            </div>

            {/* Right: Rows per page selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <label
                htmlFor="inv-rows-per-page"
                style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}
              >
                Rows per page:
              </label>
              <Select
                id="inv-rows-per-page"
                ariaLabel="Rows per page"
                value={String(itemsPerPage)}
                onChange={handleRowsPerPageChange}
                options={rowsPerPageOptions}
                minWidth="125px"
                align="right"
                direction="up"
              />
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
                background: '#fee2e2',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                border: '1px solid #fecaca',
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                <Trash2 size={18} />
              </div>
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#991b1b', display: 'block', marginBottom: '2px' }}>
                  This action cannot be undone.
                </strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#b91c1c', lineHeight: 1.4 }}>
                  You are about to remove <strong>{selectedIds.length}</strong> selected product
                  {selectedIds.length > 1 ? 's' : ''} from the active inventory catalog.
                </p>
              </div>
            </div>

            {/* If more than 5 products are selected, ask user to type DELETE */}
            {selectedIds.length > 5 && (
              <div style={{ background: '#faf5ff', padding: '0.9rem 1rem', borderRadius: '12px', border: '1px solid #ede8f8' }}>
                <label
                  htmlFor="delete-confirm-input"
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    color: '#1e1b4b',
                    display: 'block',
                    marginBottom: '0.45rem',
                  }}
                >
                  To confirm bulk deletion, please type <code style={{ color: '#dc2626', background: '#fee2e2', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>DELETE</code> below:
                </label>
                <input
                  id="delete-confirm-input"
                  type="text"
                  autoFocus
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  style={{
                    width: '100%',
                    height: '40px',
                    padding: '0 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #dfd5f5',
                    fontSize: '0.88rem',
                    color: '#1e1b4b',
                    outline: 'none',
                    transition: 'border-color 0.18s ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#7c3aed';
                    e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#dfd5f5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={selectedIds.length > 5 && deleteConfirmInput.trim() !== 'DELETE'}
                style={{
                  height: '42px',
                  padding: '0 1.25rem',
                  borderRadius: '10px',
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor:
                    selectedIds.length > 5 && deleteConfirmInput.trim() !== 'DELETE'
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    selectedIds.length > 5 && deleteConfirmInput.trim() !== 'DELETE' ? 0.45 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 8px rgba(220, 38, 38, 0.25)',
                }}
              >
                <Trash2 size={15} />
                <span>Delete</span>
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
          <form onSubmit={handleSaveAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                background: '#faf8fe',
                padding: '0.85rem',
                borderRadius: '12px',
                border: '1px solid #ede8f8',
              }}
            >
              <img
                src={selectedItem.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                alt={selectedItem.productName}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
              />
              <div>
                <strong style={{ fontSize: '0.92rem', color: '#1e1b4b', display: 'block' }}>
                  {selectedItem.productName}
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Current Stock Level: <strong style={{ color: '#7c3aed' }}>{selectedItem.currentStock} units</strong>
                </span>
              </div>
            </div>

            {/* Adjustment Type Toggle */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                Adjustment Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setAdjustType('add')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    background: adjustType === 'add' ? '#dcfce7' : '#ffffff',
                    color: adjustType === 'add' ? '#15803d' : '#64748b',
                    borderColor: adjustType === 'add' ? '#22c55e' : '#e2e8f0',
                  }}
                >
                  <Plus size={16} />
                  <span>Add Stock (Restock)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('remove')}
                  style={{
                    padding: '0.65rem',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    transition: 'all 0.2s ease',
                    background: adjustType === 'remove' ? '#fee2e2' : '#ffffff',
                    color: adjustType === 'remove' ? '#b91c1c' : '#64748b',
                    borderColor: adjustType === 'remove' ? '#ef4444' : '#e2e8f0',
                  }}
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
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}
              >
                Quantity to Adjust <span style={{ color: '#ef4444' }}>*</span>
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
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #dfd5f5',
                  fontSize: '0.88rem',
                  color: '#1e1b4b',
                  outline: 'none',
                }}
              />
            </div>

            {/* Reason */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                Reason for Adjustment <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #dfd5f5',
                  background: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#1e1b4b',
                  outline: 'none',
                }}
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
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.4rem' }}>
                Internal Audit Note (Optional)
              </label>
              <textarea
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                placeholder="e.g. Received new shipment lot from Nachiarkoil workshop"
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #dfd5f5',
                  background: '#ffffff',
                  fontSize: '0.85rem',
                  color: '#1e1b4b',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <img
                src={viewProductItem.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                alt={viewProductItem.productName}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: '1px solid #ede8f8',
                }}
              />
              <div>
                <h4 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', color: '#1e1b4b' }}>
                  {viewProductItem.productName}
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ background: '#ede8f8', color: '#5b13df', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    SKU: {viewProductItem.sku}
                  </span>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {viewProductItem.category}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem' }}>
                  Selling Price: <strong style={{ color: '#16a34a' }}>{formatPrice(viewProductItem.sellingPrice)}</strong>{' '}
                  <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.8rem' }}>
                    {formatPrice(viewProductItem.price)}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.75rem',
                background: '#faf8fe',
                padding: '0.85rem',
                borderRadius: '12px',
                border: '1px solid #ede8f8',
                textAlign: 'center',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Current Stock</span>
                <strong style={{ fontSize: '1.1rem', color: '#1e1b4b' }}>{viewProductItem.currentStock}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Low Threshold</span>
                <strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{viewProductItem.lowStockThreshold || LOW_STOCK_THRESHOLD}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Stock Status</span>
                <div style={{ marginTop: '0.2rem' }}>
                  {renderStockStatusBadge(viewProductItem.currentStock, viewProductItem.lowStockThreshold)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
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
