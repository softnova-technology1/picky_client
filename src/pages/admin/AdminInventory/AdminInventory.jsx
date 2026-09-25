import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Filter,
  Plus,
  Minus,
  Edit3,
  ExternalLink,
  ArrowUpDown,
  History,
  TrendingDown,
  Warehouse,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import {
  STOCK_ADJUST_REASONS,
  calculateInventoryKPIs,
} from '../../../data/inventoryMockData';
import { MOCK_CATEGORIES } from '../../../data/categoryMockData';
import { useMockStockStore } from '../../../store/mockStockStore';

export default function AdminInventory() {
  const { showToast } = useUiStore();
  const { getInventoryList, adjustStock: storeAdjustStock, setStock: storeSetStock } = useMockStockStore();

  // Inventory list derived from shared mockStockStore (single source of truth with MOCK_PRODUCTS)
  const [inventoryList, setInventoryList] = useState(() => getInventoryList());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'

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

  // Dynamically compute KPIs from current inventory state
  const kpis = useMemo(() => calculateInventoryKPIs(inventoryList), [inventoryList]);

  // Filtered Inventory items
  const filteredItems = useMemo(() => {
    return inventoryList.filter((item) => {
      // Search by Product name or SKU
      const search = searchTerm.toLowerCase().trim();
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
      const threshold = Number(item.lowStockThreshold) || 5;
      let statusKey = 'in_stock';
      if (stock <= 0) {
        statusKey = 'out_of_stock';
      } else if (stock <= threshold || (stock >= 1 && stock <= 5)) {
        statusKey = 'low_stock';
      }

      const matchStatus = selectedStatus === 'all' || statusKey === selectedStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [inventoryList, searchTerm, selectedCategory, selectedStatus]);

  // Open Adjust Stock Modal
  const handleOpenAdjust = (item) => {
    setSelectedItem(item);
    setAdjustType('add');
    setAdjustQuantity('10');
    setAdjustReason('Restock');
    setAdjustNote('');
    setIsAdjustModalOpen(true);
  };

  // Open View Product Modal
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
      const timestamp = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

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

      // Also update the shared stock store — ProductCard/ProductDetail stock badges will reflect this
      const delta = adjustType === 'add' ? qty : -qty;
      storeAdjustStock(selectedItem.productId, delta);

      const actionWord = adjustType === 'add' ? 'added to' : 'removed from';
      showToast(`Successfully ${actionWord} ${selectedItem.productName}! New stock: ${updatedStock}`, 'success');
      setAdjustLoading(false);
      setIsAdjustModalOpen(false);
    }, 250);
  };

  // Render stock badge
  const renderStockStatusBadge = (stock, threshold = 5) => {
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
    if (qty <= threshold || (qty >= 1 && qty <= 5)) {
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

  return (
    <AdminLayout title="Inventory & Stock Management">
      {/* ─── 4 Top KPI Cards ──────────────────────────────────────────────── */}
      <div className="metrics-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Total Products */}
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#ede8f8', color: '#7c3aed' }}>
            <Warehouse size={22} />
          </div>
          <div>
            <div className="metric-val">{kpis.totalProducts}</div>
            <div className="metric-label">Total Catalog Products</div>
          </div>
        </div>

        {/* In Stock */}
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="metric-val">{kpis.inStock}</div>
            <div className="metric-label">In Stock Items</div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="metric-val">{kpis.lowStock}</div>
            <div className="metric-label">Low Stock Alerts (≤ 5)</div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <XCircle size={22} />
          </div>
          <div>
            <div className="metric-val">{kpis.outOfStock}</div>
            <div className="metric-label">Out of Stock Items</div>
          </div>
        </div>
      </div>

      {/* ─── Controls & Filter Bar ────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Search by Product / SKU */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.95rem', color: '#8a7ca6' }} />
            <input
              type="text"
              placeholder="Search by Product name, SKU (e.g. WF-SAR-001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.6rem',
                background: '#ede8f8',
                border: '1px solid #dfd5f5',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                color: '#1e1b4b',
                outline: 'none',
                boxShadow: 'inset 0 1.5px 3px rgba(124, 58, 237, 0.04)',
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #dfd5f5',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e1b4b',
                outline: 'none',
              }}
            >
              <option value="all">All Categories</option>
              {MOCK_CATEGORIES.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              Stock Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #dfd5f5',
                background: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#1e1b4b',
                outline: 'none',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (≤ 5)</option>
              <option value="out_of_stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Inventory Table ──────────────────────────────────────────────── */}
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Low Stock Threshold</th>
              <th>Stock Status</th>
              <th>Last Updated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b' }}>
                  No inventory records match your criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item._id}>
                  {/* Product */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                        alt={item.productName}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1px solid #ede8f8',
                        }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.88rem', color: '#1e1b4b', display: 'block' }}>
                          {item.productName}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          {formatPrice(item.sellingPrice || item.price)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: '#5b13df',
                        background: '#ede8f8',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                      }}
                    >
                      {item.sku}
                    </span>
                  </td>

                  {/* Category */}
                  <td>
                    <span
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#334155',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Current Stock */}
                  <td>
                    <strong
                      style={{
                        fontSize: '0.95rem',
                        color:
                          item.currentStock <= 0
                            ? '#dc2626'
                            : item.currentStock <= 5
                            ? '#d97706'
                            : '#1e1b4b',
                      }}
                    >
                      {item.currentStock} units
                    </strong>
                  </td>

                  {/* Low Stock Threshold */}
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                      {item.lowStockThreshold || 5} units
                    </span>
                  </td>

                  {/* Stock Status */}
                  <td>{renderStockStatusBadge(item.currentStock, item.lowStockThreshold)}</td>

                  {/* Last Updated */}
                  <td>
                    <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block' }}>
                      {item.lastUpdated || 'Recently'}
                    </span>
                    {item.lastReason && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#7c3aed',
                          fontWeight: 600,
                          background: '#f5f3ff',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                        }}
                      >
                        {item.lastReason}
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td>
                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      <button
                        onClick={() => handleOpenView(item)}
                        className="admin-period-select-btn"
                        style={{ padding: '0.35rem 0.7rem', fontSize: '0.76rem' }}
                        title="View Product Details"
                      >
                        <ExternalLink size={13} color="#475569" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleOpenAdjust(item)}
                        className="admin-period-select-btn"
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.76rem',
                          background: '#ede8f8',
                          borderColor: '#dcd0fa',
                          color: '#5b13df',
                          fontWeight: 700,
                        }}
                        title="Adjust Stock Quantity"
                      >
                        <Edit3 size={13} color="#5b13df" />
                        <span>Adjust Stock</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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

            {/* Quantity */}
            <Input
              label="Quantity to Adjust"
              type="number"
              min="1"
              required
              value={adjustQuantity}
              onChange={(e) => setAdjustQuantity(e.target.value)}
              placeholder="e.g. 10"
            />

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

      {/* ─── View Product Modal ───────────────────────────────────────────── */}
      {isViewModalOpen && viewProductItem && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Product Overview — ${viewProductItem.sku}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <img
                src={viewProductItem.image}
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
                <strong style={{ fontSize: '1.1rem', color: '#d97706' }}>{viewProductItem.lowStockThreshold}</strong>
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
