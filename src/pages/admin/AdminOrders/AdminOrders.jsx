import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Phone,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Minus,
  Layers,
  Download,
  MapPin,
  Package,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Truck,
  Mail,
  Clock,
  RotateCw,
  ShoppingBag,
  TrendingUp,
  IndianRupee,
  Sparkles,
  Calendar,
  UserCheck,
  BadgeCheck,
  AlertCircle,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  ArrowUpRight,
  Save,
  ShieldCheck,
  Printer,
  FileText,
  X,
  RotateCcw,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import { adminService } from '../../../services/admin.service';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import { useOrderStore } from '../../../store/orderStore';
import { useUiStore } from '../../../store/uiStore';

import {
  STATUS_TABS,
  STATUS_CFG,
  CANCEL_REASONS,
  STATUS_OPTIONS,
  ORDER_PROGRESS_STEPS,
  DATE_FILTER_OPTIONS,
  PRICE_FILTER_OPTIONS,
  QUANTITY_FILTER_OPTIONS,
  SORT_OPTIONS,
} from '../../../data/ordersMockData';

// ─── Custom Status Select Dropdown (icon-rich, SaaS-style) ───────────────────
function StatusSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[0];
  const SelIcon = selected.icon;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          width: '100%',
          padding: '0.65rem 0.9rem',
          background: open ? '#ffffff' : '#f8fafc',
          border: `1.5px solid ${open ? '#7c3aed' : '#e2e8f0'}`,
          borderRadius: '10px',
          fontSize: '0.84rem',
          fontWeight: 600,
          color: '#0f172a',
          cursor: 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          boxShadow: open ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ width: '26px', height: '26px', borderRadius: '7px', background: selected.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SelIcon size={13} color={selected.color} />
          </span>
          {selected.label}
        </span>
        <ChevronDown size={14} color="#94a3b8" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.10)',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
          padding: '0.3rem',
        }}>
          {STATUS_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isSelected ? '#f5f3ff' : 'transparent',
                  color: isSelected ? '#6d28d9' : '#0f172a',
                  fontSize: '0.83rem',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'background 0.12s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ width: '26px', height: '26px', borderRadius: '7px', background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <OptIcon size={13} color={opt.color} />
                </span>
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isSelected && <CheckCircle2 size={14} color="#7c3aed" style={{ flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { orders: storeOrders, updateOrderStatus: storeUpdateStatus, updateOrder } = useOrderStore();
  const { showToast } = useUiStore();

  // ─── Filter & Search State ────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [quantityFilter, setQuantityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedId, setExpandedId] = useState(null); // Accordion state

  // Filter Popover Dropdown state
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Per-row status change state
  const [rowStatus, setRowStatus] = useState({});
  const [rowNote, setRowNote] = useState({});
  const [rowCancelReason, setRowCancelReason] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // ─── Pagination State ────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, dateFilter, priceFilter, quantityFilter, sortBy]);

  // ─── Dashboard Stats Calculations ────────────────────────────────────────
  const totalOrders = storeOrders.length;
  const confirmedCount = storeOrders.filter((o) => o.status === 'confirmed').length;
  const packingCount = storeOrders.filter((o) => o.status === 'packing').length;
  const readyToDispatchCount = storeOrders.filter((o) => o.status === 'confirmed' || o.status === 'packing').length;
  const shippedCount = storeOrders.filter((o) => o.status === 'shipped' || o.status === 'out_for_delivery').length;
  const deliveredCount = storeOrders.filter((o) => o.status === 'delivered').length;

  // ─── Filter Helper Matchers ──────────────────────────────────────────────
  const matchesDate = (orderDateStr) => {
    if (dateFilter === 'all') return true;
    const orderDate = new Date(orderDateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    if (dateFilter === 'today') return orderDate >= startOfToday;
    if (dateFilter === 'yesterday') return orderDate >= startOfYesterday && orderDate < startOfToday;
    if (dateFilter === '7days') return orderDate >= sevenDaysAgo;
    if (dateFilter === '30days') return orderDate >= thirtyDaysAgo;
    if (dateFilter === 'this_month') return orderDate >= startOfMonth;
    return true;
  };

  const matchesPrice = (amount) => {
    const num = Number(amount || 0);
    if (priceFilter === 'all') return true;
    if (priceFilter === 'under1000') return num < 1000;
    if (priceFilter === '1000to2500') return num >= 1000 && num <= 2500;
    if (priceFilter === '2500to5000') return num > 2500 && num <= 5000;
    if (priceFilter === 'above5000') return num > 5000;
    return true;
  };

  const matchesQuantity = (order) => {
    const totalQty = order.items?.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0) || order.itemsCount || 1;
    if (quantityFilter === 'all') return true;
    if (quantityFilter === '1') return totalQty === 1;
    if (quantityFilter === '2to3') return totalQty >= 2 && totalQty <= 3;
    if (quantityFilter === '4plus') return totalQty >= 4;
    return true;
  };

  // ─── Filter & Sort Logic ──────────────────────────────────────────────────
  const filteredOrders = storeOrders
    .filter((o) => {
      const matchesTab = activeTab === 'all' || o.status === activeTab;
      const term = searchTerm.toLowerCase().trim();
      const num = (o.orderNumber || '').toLowerCase();
      const cust = (o.customer?.name || o.user?.name || o.shippingAddress?.fullName || '').toLowerCase();
      const phone = (o.customer?.phone || o.user?.phone || '').toLowerCase();
      const city = (o.shippingAddress?.city || '').toLowerCase();
      const matchesSearch = !term || num.includes(term) || cust.includes(term) || phone.includes(term) || city.includes(term);

      return (
        matchesTab &&
        matchesSearch &&
        matchesDate(o.createdAt) &&
        matchesPrice(o.totalAmount || o.total || o.grandTotal || 0) &&
        matchesQuantity(o)
      );
    })
    .sort((a, b) => {
      const priceA = Number(a.totalAmount || a.total || a.grandTotal || 0);
      const priceB = Number(b.totalAmount || b.total || b.grandTotal || 0);
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'amount_high') return priceB - priceA;
      if (sortBy === 'amount_low') return priceA - priceB;
      return 0;
    });

  const hasActiveFilters =
    dateFilter !== 'all' ||
    priceFilter !== 'all' ||
    quantityFilter !== 'all' ||
    activeTab !== 'all' ||
    searchTerm !== '' ||
    sortBy !== 'newest';

  const activeFiltersCount =
    (dateFilter !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (quantityFilter !== 'all' ? 1 : 0) +
    (activeTab !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0) +
    (sortBy !== 'newest' ? 1 : 0);

  const activeSecondaryFiltersCount =
    (dateFilter !== 'all' ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (quantityFilter !== 'all' ? 1 : 0);

  const handleResetFilters = () => {
    setActiveTab('all');
    setSearchTerm('');
    setDateFilter('all');
    setPriceFilter('all');
    setQuantityFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    showToast('Filters reset to default', 'info');
  };

  // ─── Pagination Calculations ──────────────────────────────────────────────
  const totalOrdersCount = filteredOrders.length;
  const totalPages = Math.ceil(totalOrdersCount / rowsPerPage) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalOrdersCount);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // ─── Export Filtered Orders to CSV ────────────────────────────────────────
  const handleExportCSV = () => {
    const targetOrders = filteredOrders;
    if (targetOrders.length === 0) {
      showToast('No orders found to export', 'error');
      return;
    }

    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Shipping Address',
      'City',
      'State',
      'Pincode',
      'Items Count',
      'Total Amount (INR)',
      'Status',
      'Courier',
      'Tracking AWB',
    ];

    const rows = targetOrders.map((o) => [
      `"${o.orderNumber}"`,
      new Date(o.createdAt).toLocaleDateString(),
      `"${(o.customer?.name || o.user?.name || o.shippingAddress?.fullName || '').replace(/"/g, '""')}"`,
      `"${o.customer?.phone || o.user?.phone || ''}"`,
      `"${o.customer?.email || o.user?.email || ''}"`,
      `"${(o.shippingAddress?.street || '').replace(/"/g, '""')}"`,
      `"${o.shippingAddress?.city || ''}"`,
      `"${o.shippingAddress?.state || ''}"`,
      `"${o.shippingAddress?.pincode || ''}"`,
      o.items?.length || o.itemsCount || 1,
      o.totalAmount || o.total || o.grandTotal || 0,
      `"${STATUS_CFG[o.status]?.label || o.status}"`,
      `"${o.courier || ''}"`,
      `"${o.trackingId || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `picky_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`📥 Exported ${targetOrders.length} orders to CSV`, 'success');
  };

  // ─── Print / Export Single Order Dispatch Slip ────────────────────────────
  const handlePrintOrderSlip = (order, e) => {
    if (e) e.stopPropagation();
    const custName = order.customer?.name || order.user?.name || order.shippingAddress?.fullName || 'Customer';
    const custPhone = order.customer?.phone || order.user?.phone || '';
    const custEmail = order.customer?.email || order.user?.email || '';
    const addr = order.shippingAddress || {};
    const itemsHtml = (order.items || []).map((it, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
          <strong style="color: #0f172a;">${it.name}</strong>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px; font-weight: 600;">${it.quantity || 1}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px;">₹${(it.price || 0).toLocaleString()}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: 700; color: #7c3aed;">₹${((it.price || 0) * (it.quantity || 1)).toLocaleString()}</td>
      </tr>
    `).join('');

    const slipHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Dispatch Slip #${order.orderNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 30px; color: #0f172a; margin: 0; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
          .brand { font-size: 22px; font-weight: 900; color: #7c3aed; letter-spacing: -0.02em; }
          .order-meta { font-size: 13px; color: #64748b; margin-top: 4px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: #f3e8ff; color: #6d28d9; font-weight: 700; font-size: 12px; text-transform: uppercase; border: 1px solid #ddd6fe; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; font-size: 13px; line-height: 1.5; }
          .card-title { font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #475569; border-bottom: 2px solid #cbd5e1; }
          .total-box { margin-top: 24px; padding: 16px; background: #faf5ff; border: 1px solid #e9d8fd; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
          .total-label { font-size: 14px; font-weight: 700; color: #4c1d95; }
          .total-val { font-size: 20px; font-weight: 900; color: #6d28d9; }
          .footer { margin-top: 36px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          .print-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: #7c3aed; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; margin-top: 20px; }
          @media print { .no-print { display: none !important; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">PICKY — ORDER DISPATCH SLIP</div>
            <div class="order-meta">Order #${order.orderNumber} • Placed on ${new Date(order.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <span class="badge">${STATUS_CFG[order.status]?.label || order.status}</span>
          </div>
        </div>
        <div class="grid">
          <div class="card">
            <div class="card-title">Customer Information</div>
            <strong style="font-size: 14px; color: #0f172a;">${custName}</strong><br/>
            ${custPhone ? 'Phone: ' + custPhone + '<br/>' : ''}
            ${custEmail ? 'Email: ' + custEmail + '<br/>' : ''}
          </div>
          <div class="card">
            <div class="card-title">Shipping Address</div>
            ${addr.street || 'Standard Address'}<br/>
            ${addr.landmark ? 'Landmark: ' + addr.landmark + '<br/>' : ''}
            ${addr.city || 'Chennai'}, ${addr.state || 'Tamil Nadu'} — ${addr.pincode || '600001'}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Item Details</th>
              <th style="text-align: center; width: 60px;">Qty</th>
              <th style="text-align: right; width: 100px;">Price</th>
              <th style="text-align: right; width: 110px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="total-box">
          <span class="total-label">Grand Total Paid</span>
          <span class="total-val">₹${(order.totalAmount || order.total || order.grandTotal || 0).toLocaleString()} <span style="font-size: 12px; color: #16a34a; background: #dcfce7; padding: 2px 8px; border-radius: 9999px;">✓ PAID</span></span>
        </div>
        <div class="footer">
          Thank you for ordering with Picky Store! For support queries, reach out at care@pickystore.com
        </div>
        <div class="no-print" style="text-align: center;">
          <button class="print-btn" onclick="window.print()">🖨️ Print Dispatch Slip</button>
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=800,height=800');
    if (printWin) {
      printWin.document.write(slipHtml);
      printWin.document.close();
      showToast(`🖨️ Opened Order Slip for #${order.orderNumber}`, 'success');
    }
  };

  // ─── Toggle accordion row ─────────────────────────────────────────────────
  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ─── Handle status update ─────────────────────────────────────────────────
  const handleStatusUpdate = async (order) => {
    const id = order._id;
    const newStatus = rowStatus[id] ?? order.status;
    const note = rowNote[id] ?? '';
    const cancelReason = rowCancelReason[id] ?? '';

    // Validate: cancelled requires a reason
    if (newStatus === 'cancelled' && !cancelReason) {
      showToast('⚠️ Please select a cancellation reason', 'error');
      return;
    }

    const fullNote = newStatus === 'cancelled'
      ? `Reason: ${cancelReason}${note ? ` — ${note}` : ''}`
      : note || `Status updated to ${newStatus}`;

    setRowLoading((p) => ({ ...p, [id]: true }));
    try {
      await adminService.updateOrderStatus(id, { status: newStatus, note: fullNote }).catch(() => null);
      storeUpdateStatus(id, newStatus);
      updateOrder(id, {
        status: newStatus,
        statusHistory: [
          ...(order.statusHistory || []),
          { status: newStatus, timestamp: new Date().toISOString(), note: fullNote },
        ],
      });
      setRowNote((p) => ({ ...p, [id]: '' }));
      setRowCancelReason((p) => ({ ...p, [id]: '' }));
      setRowStatus((p) => { const n = { ...p }; delete n[id]; return n; });
      showToast(`✅ Order status updated to "${STATUS_CFG[newStatus]?.label || newStatus}"`, 'success');
    } catch {
      showToast('Status update failed', 'error');
    } finally {
      setRowLoading((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <AdminLayout title="Orders & Dispatch Dashboard">

      {/* ── 1. INNOVATIVE DASHBOARD STATS CARDS (EXACT MATCH) ──────────────── */}
      <div className="kpi-progress-grid">
        <AdminStatCard
          title="TOTAL ORDERS"
          value={totalOrders}
          icon={<ShoppingBag size={22} />}
          variant="purple"
          footerLabel="Live Volume"
          footerValue="100%"
          progress={100}
        />
        <AdminStatCard
          title="READY TO DISPATCH"
          value={readyToDispatchCount}
          icon={<Clock size={22} />}
          variant="amber"
          footerLabel="Action Required"
          footerValue={`${totalOrders ? Math.round((readyToDispatchCount / totalOrders) * 100) : 0}%`}
          progress={totalOrders ? (readyToDispatchCount / totalOrders) * 100 : 0}
        />
        <AdminStatCard
          title="SHIPPED / TRANSIT"
          value={shippedCount}
          icon={<Truck size={22} />}
          variant="blue"
          footerLabel="In Transit"
          footerValue={`${totalOrders ? Math.round((shippedCount / totalOrders) * 100) : 0}%`}
          progress={totalOrders ? (shippedCount / totalOrders) * 100 : 0}
        />
        <AdminStatCard
          title="DELIVERED ORDERS"
          value={deliveredCount}
          icon={<BadgeCheck size={22} />}
          variant="green"
          footerLabel="Successfully"
          footerValue="Delivered"
          progress={totalOrders ? (deliveredCount / totalOrders) * 100 : 0}
        />
      </div>

      {/* ── 2. FILTER & SEARCH CONTROL BAR ────────────────────────────── */}
      <div
        className="card"
        style={{
          marginBottom: '1.5rem',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        {/* Row 1: Status Filter Tabs (Left) + Action Buttons (Right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingBottom: '0.2rem',
          }}
        >
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {STATUS_TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              const count = key === 'all'
                ? storeOrders.length
                : storeOrders.filter((o) => o.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setCurrentPage(1);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isActive ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                    background: isActive ? '#7c3aed' : '#ffffff',
                    color: isActive ? '#ffffff' : '#64748b',
                    boxShadow: isActive ? '0 3px 10px rgba(124, 58, 237, 0.25)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.color = '#64748b';
                    }
                  }}
                >
                  <Icon size={14} style={{ color: isActive ? '#ffffff' : '#7c3aed' }} />
                  <span>{label}</span>
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.22)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      borderRadius: '9999px',
                      padding: '0.08rem 0.45rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      minWidth: '18px',
                      textAlign: 'center',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Action: Export CSV Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleExportCSV}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.48rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #ddd6fe',
                background: '#fbf9ff',
                color: '#6d28d9',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.background = '#7c3aed';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd6fe';
                e.currentTarget.style.background = '#fbf9ff';
                e.currentTarget.style.color = '#6d28d9';
              }}
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Dedicated Modern Filter & Search Toolbar Strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            padding: '0.6rem 0.85rem',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #edf2f7',
          }}
        >
          {/* Left: Search Box + Single Consolidated Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', color: '#64748b', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search order #, customer, city…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: '240px',
                  height: '36px',
                  padding: '0 0.75rem 0 2.2rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '0.79rem',
                  color: '#0f172a',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div style={{ width: '1px', height: '22px', background: '#e2e8f0', margin: '0 0.15rem' }} />

            {/* Single Consolidated Filter Dropdown Button */}
            <div ref={filterRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setFilterPopoverOpen((p) => !p)}
                style={{
                  height: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0 0.85rem',
                  borderRadius: '8px',
                  border: activeSecondaryFiltersCount > 0 || filterPopoverOpen ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                  background: activeSecondaryFiltersCount > 0 || filterPopoverOpen ? '#faf5ff' : '#ffffff',
                  color: activeSecondaryFiltersCount > 0 || filterPopoverOpen ? '#6d28d9' : '#334155',
                  fontSize: '0.79rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'all 0.18s ease',
                }}
              >
                <SlidersHorizontal size={14} color={activeSecondaryFiltersCount > 0 || filterPopoverOpen ? '#7c3aed' : '#64748b'} />
                <span>Filters</span>
                {activeSecondaryFiltersCount > 0 && (
                  <span
                    style={{
                      background: '#7c3aed',
                      color: '#ffffff',
                      borderRadius: '9999px',
                      padding: '0.05rem 0.45rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {activeSecondaryFiltersCount}
                  </span>
                )}
                <ChevronDown
                  size={13}
                  color={activeSecondaryFiltersCount > 0 || filterPopoverOpen ? '#7c3aed' : '#94a3b8'}
                  style={{
                    transform: filterPopoverOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>

              {/* Filter Popover Floating Panel */}
              {filterPopoverOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '320px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    zIndex: 200,
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  {/* Popover Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                      <SlidersHorizontal size={13} color="#7c3aed" />
                      Filter Options
                    </div>
                    {activeSecondaryFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setDateFilter('all');
                          setPriceFilter('all');
                          setQuantityFilter('all');
                          setCurrentPage(1);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#dc2626',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: '2px 4px',
                        }}
                      >
                        Reset All
                      </button>
                    )}
                  </div>

                  {/* 1. Date Filter */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      <Calendar size={13} color="#7c3aed" />
                      <span>Date Range</span>
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 0.65rem',
                        borderRadius: '8px',
                        border: dateFilter !== 'all' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                        background: dateFilter !== 'all' ? '#faf5ff' : '#f8fafc',
                        color: dateFilter !== 'all' ? '#6d28d9' : '#0f172a',
                        fontSize: '0.78rem',
                        fontWeight: dateFilter !== 'all' ? 700 : 500,
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      {DATE_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Price Filter */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      <IndianRupee size={13} color="#7c3aed" />
                      <span>Order Value / Price</span>
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => {
                        setPriceFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 0.65rem',
                        borderRadius: '8px',
                        border: priceFilter !== 'all' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                        background: priceFilter !== 'all' ? '#faf5ff' : '#f8fafc',
                        color: priceFilter !== 'all' ? '#6d28d9' : '#0f172a',
                        fontSize: '0.78rem',
                        fontWeight: priceFilter !== 'all' ? 700 : 500,
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      {PRICE_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Quantity Filter */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      <Package size={13} color="#7c3aed" />
                      <span>Item Quantity</span>
                    </label>
                    <select
                      value={quantityFilter}
                      onChange={(e) => {
                        setQuantityFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        width: '100%',
                        height: '35px',
                        padding: '0 0.65rem',
                        borderRadius: '8px',
                        border: quantityFilter !== 'all' ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                        background: quantityFilter !== 'all' ? '#faf5ff' : '#f8fafc',
                        color: quantityFilter !== 'all' ? '#6d28d9' : '#0f172a',
                        fontSize: '0.78rem',
                        fontWeight: quantityFilter !== 'all' ? 700 : 500,
                        outline: 'none',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                      }}
                    >
                      {QUANTITY_FILTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Popover Footer Action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.2rem' }}>
                    <button
                      type="button"
                      onClick={() => setFilterPopoverOpen(false)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '8px',
                        background: '#7c3aed',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: '0 2px 6px rgba(124, 58, 237, 0.2)',
                      }}
                    >
                      Apply & Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                style={{
                  height: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                title="Reset all filters to default"
              >
                <RotateCcw size={12} />
                <span>Reset ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Right: Sort By */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                height: '36px',
                padding: '0 0.75rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.78rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                boxSizing: 'border-box',
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. ORDERS TABLE WITH PERFECT ALIGNMENTS (8 COLUMNS) ──────────────────────── */}
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
              <th style={{ padding: '0.9rem 0.6rem 0.9rem 1.25rem', textAlign: 'center', width: '50px', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>S.No</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shipping Address</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'center', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
              <th style={{ padding: '0.9rem 1.25rem', textAlign: 'right', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manage Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                  <ShoppingBag size={42} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                  No orders found matching your search or filters.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => {
                const custName  = order.customer?.name || order.user?.name || order.shippingAddress?.fullName || 'Customer';
                const custPhone = order.customer?.phone || order.user?.phone || '';
                const custEmail = order.customer?.email || order.user?.email || '';
                const st        = (order.status || 'confirmed').toLowerCase();
                const cfg       = STATUS_CFG[st] || STATUS_CFG.confirmed;
                const StatusIcon = cfg.icon;
                const isOpen    = expandedId === order._id;

                // Auto-advance to next logical status (so admin doesn't need to manually change)
                const STATUS_FLOW = ['confirmed', 'packing', 'shipped', 'delivered'];
                const flowIdx  = STATUS_FLOW.indexOf(order.status);
                const nextAuto = flowIdx >= 0 && flowIdx < STATUS_FLOW.length - 1
                  ? STATUS_FLOW[flowIdx + 1]
                  : order.status;
                const currentRowStatus    = rowStatus[order._id]       ?? nextAuto;
                const currentRowNote      = rowNote[order._id]         ?? '';
                const currentCancelReason = rowCancelReason[order._id] ?? '';
                const isUpdating          = rowLoading[order._id]       ?? false;

                return (
                  <React.Fragment key={order._id}>
                    {/* ── Main Table Row (Neat Spacing & Clean SaaS Colors) ─────────────────────── */}
                    <tr
                      style={{
                        cursor: 'pointer',
                        background: isOpen ? '#faf5ff' : index % 2 === 0 ? '#ffffff' : '#faf7ff',
                        borderBottom: isOpen ? 'none' : '1px solid #f1f5f9',
                        borderLeft: isOpen ? '3px solid #7c3aed' : '3px solid transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onClick={() => toggleRow(order._id)}
                    >
                      {/* S.No */}
                      <td style={{ padding: '1rem 0.6rem 1rem 1.25rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                        {startIndex + index + 1}
                      </td>

                      {/* Order ID & Date */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'left' }}>
                        <strong style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600, letterSpacing: '0.01em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          #{order.orderNumber}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                          <Calendar size={11} color="#94a3b8" />
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            className="admin-customer-avatar"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#f3e8ff',
                              color: '#6d28d9',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {custName[0]?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600, display: 'block' }}>
                              {custName}
                            </strong>
                            {custPhone && (
                              <a
                                href={`https://wa.me/${custPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  fontSize: '0.72rem',
                                  color: '#059669',
                                  fontWeight: 500,
                                  marginTop: '0.15rem',
                                  textDecoration: 'none',
                                }}
                              >
                                <Phone size={11} /> {custPhone}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Shipping Address */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'left', maxWidth: '230px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                          <MapPin size={13} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <div
                              style={{
                                fontSize: '0.82rem',
                                color: '#1e293b',
                                fontWeight: 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '200px',
                              }}
                              title={order.shippingAddress?.street || 'Standard Address'}
                            >
                              {order.shippingAddress?.street || 'Standard Address'}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '0.15rem' }}>
                              {order.shippingAddress?.city || 'Chennai'}, {order.shippingAddress?.state || 'TN'} — {order.shippingAddress?.pincode || '600001'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Items count */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'left' }}>
                        <span style={{ fontWeight: 500, color: '#475569', fontSize: '0.83rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <ShoppingBag size={13} color="#7c3aed" />
                          {order.items?.length || order.itemsCount || 1} item{(order.items?.length || 1) !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Total Paid (Right-aligned to match header) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'right' }}>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                          {formatPrice(order.totalAmount || order.total || order.grandTotal || 0)}
                        </strong>
                      </td>

                      {/* Status Pill (Center-aligned with refined SaaS colors) */}
                      <td style={{ padding: '1rem 1rem', textAlign: 'center' }}>
                        <span
                          className={`adm-status-pill ${cfg.cls}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.7rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            letterSpacing: '0.01em',
                          }}
                        >
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Action Cell: Manage Accordion Toggle */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {/* Manage Order Accordion Toggle Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(order._id);
                            }}
                            style={{
                              minWidth: '130px',
                              height: '34px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                              padding: '0.4rem 0.95rem',
                              borderRadius: '9999px',
                              fontSize: '0.79rem',
                              fontWeight: 600,
                              border: isOpen ? '1px solid #ddd6fe' : '1.5px solid #7c3aed',
                              cursor: 'pointer',
                              transition: 'all 0.22s ease',
                              background: isOpen
                                ? 'rgba(124,58,237,0.07)'
                                : 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                              color: isOpen ? '#7c3aed' : '#ffffff',
                              boxShadow: isOpen ? 'none' : '0 3px 12px rgba(124,58,237,0.28)',
                              boxSizing: 'border-box',
                            }}
                          >
                            {isOpen ? <ChevronUp size={13} /> : <ChevronsUpDown size={13} />}
                            {isOpen ? 'Close Panel' : 'Manage Order'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ── 4. EXPANDED DETAIL VIEW WITH EQUAL HEIGHT SECTIONS ──── */}
                    {isOpen && (
                      <tr style={{ background: '#faf5ff' }}>
                        <td colSpan={8} style={{ padding: 0, borderBottom: '1px solid #e2e8f0' }}>
                          <div
                            style={{
                              padding: '1.5rem 1.75rem',
                              animation: 'ordAccordionIn 0.22s ease',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                                gap: '1.25rem',
                                alignItems: 'stretch',
                                width: '100%',
                              }}
                            >
                              {/* ── SECTION 1: ORDERED PRODUCTS & PAYMENT SUMMARY ── */}
                              <div
                                style={{
                                  background: '#ffffff',
                                  borderRadius: '16px',
                                  border: '1px solid #e2e8f0',
                                  padding: '1.35rem 1.4rem',
                                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                }}
                              >
                                <div>
                                  {/* Card Header */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      paddingBottom: '0.8rem',
                                      marginBottom: '1rem',
                                      borderBottom: '1px solid #f1f5f9',
                                    }}
                                  >
                                    <h4
                                      style={{
                                        margin: 0,
                                        fontSize: '0.92rem',
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <ShoppingBag size={17} color="#7c3aed" />
                                      Ordered Products
                                    </h4>
                                    <span
                                      style={{
                                        fontSize: '0.72rem',
                                        color: '#6d28d9',
                                        background: '#f3e8ff',
                                        padding: '0.2rem 0.6rem',
                                        borderRadius: '9999px',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                                    </span>
                                  </div>

                                  {/* Products List with max-height and custom clean scroll */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '0.75rem',
                                      maxHeight: '280px',
                                      overflowY: 'auto',
                                      paddingRight: '0.25rem',
                                    }}
                                  >
                                    {order.items?.map((item, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          display: 'flex',
                                          gap: '0.9rem',
                                          alignItems: 'center',
                                          padding: '0.75rem 0.9rem',
                                          background: '#f8fafc',
                                          borderRadius: '12px',
                                          border: '1px solid #f1f5f9',
                                          transition: 'all 0.15s ease',
                                        }}
                                      >
                                        <img
                                          src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                                          alt={item.name}
                                          style={{
                                            width: '52px',
                                            height: '52px',
                                            borderRadius: '10px',
                                            objectFit: 'cover',
                                            flexShrink: 0,
                                            border: '1px solid #e2e8f0',
                                          }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <strong
                                            style={{
                                              fontSize: '0.85rem',
                                              color: '#0f172a',
                                              fontWeight: 600,
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                            }}
                                          >
                                            {item.name}
                                          </strong>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                              Qty: <strong style={{ color: '#0f172a' }}>{item.quantity}</strong> × {formatPrice(item.price)}
                                            </span>
                                          </div>
                                        </div>
                                        <strong style={{ fontSize: '0.9rem', color: '#7c3aed', flexShrink: 0, fontWeight: 700 }}>
                                          {formatPrice(item.price * item.quantity)}
                                        </strong>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Financial Breakdown anchored to bottom */}
                                <div
                                  style={{
                                    marginTop: '1.25rem',
                                    background: 'linear-gradient(135deg, #fbf9ff 0%, #f5f0ff 100%)',
                                    borderRadius: '14px',
                                    padding: '1rem 1.15rem',
                                    border: '1.5px solid #e9d8fd',
                                    boxShadow: '0 2px 8px rgba(124, 58, 237, 0.04)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '0.45rem',
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.79rem', color: '#64748b' }}>
                                    <span>Items Subtotal</span>
                                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                      {formatPrice(order.totalAmount || order.total || 0)}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.79rem', color: '#64748b' }}>
                                    <span>Delivery / Shipping</span>
                                    <span style={{ fontWeight: 700, color: '#16a34a' }}>FREE</span>
                                  </div>
                                  <div
                                    style={{
                                      marginTop: '0.4rem',
                                      paddingTop: '0.75rem',
                                      borderTop: '1.5px dashed #ddd6fe',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <span style={{ color: '#4c1d95', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                                      Total Paid Amount
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                      <strong style={{ color: '#6d28d9', fontSize: '1.18rem', fontWeight: 900, letterSpacing: '-0.02em' }}>
                                        {formatPrice(order.totalAmount || order.total || 0)}
                                      </strong>
                                      <span style={{ fontSize: '0.68rem', color: '#047857', background: '#d1fae5', border: '1px solid #a7f3d0', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                        ✓ Paid
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* ── SECTION 2: SHIPPING ADDRESS & ORDER STATUS DETAILS (STACKED ONE-BY-ONE) ── */}
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '1.25rem',
                                  height: '100%',
                                  boxSizing: 'border-box',
                                }}
                              >
                                {/* Card 2.1: Customer & Shipping Address */}
                                <div
                                  style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '1.25rem 1.4rem',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                    flexShrink: 0,
                                  }}
                                >
                                  {/* Card Header */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '1rem',
                                      paddingBottom: '0.75rem',
                                      borderBottom: '1px solid #f1f5f9',
                                    }}
                                  >
                                    <h4
                                      style={{
                                        margin: 0,
                                        fontSize: '0.9rem',
                                        fontWeight: 700,
                                        color: '#0f172a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                      }}
                                    >
                                      <UserCheck size={16} color="#7c3aed" />
                                      Customer & Shipping Address
                                    </h4>
                                  </div>

                                  {/* Customer Info Box */}
                                  <div
                                    style={{
                                      background: '#f8fafc',
                                      borderRadius: '12px',
                                      padding: '0.85rem 1rem',
                                      marginBottom: '0.75rem',
                                      border: '1px solid #f1f5f9',
                                    }}
                                  >
                                    <strong style={{ fontSize: '0.86rem', color: '#0f172a', fontWeight: 600, display: 'block' }}>{custName}</strong>
                                    <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                                      {custPhone && (
                                        <a
                                          href={`https://wa.me/${custPhone.replace(/[^0-9]/g, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            fontSize: '0.76rem',
                                            color: '#059669',
                                            fontWeight: 500,
                                            textDecoration: 'none',
                                          }}
                                        >
                                          <Phone size={12} /> WhatsApp: {custPhone}
                                        </a>
                                      )}
                                      {custEmail && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.76rem', color: '#64748b' }}>
                                          <Mail size={12} /> {custEmail}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Address Box */}
                                  <div
                                    style={{
                                      background: '#f8fafc',
                                      borderRadius: '12px',
                                      padding: '0.85rem 1rem',
                                      border: '1px solid #f1f5f9',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.81rem', color: '#0f172a', marginBottom: '0.3rem' }}>
                                      <MapPin size={13} color="#7c3aed" /> Shipping Location
                                    </div>
                                    <div style={{ fontSize: '0.81rem', color: '#475569', lineHeight: 1.55 }}>
                                      <div>{order.shippingAddress?.street || 'Flat 4A, Green Garden Apts, Anna Nagar'}</div>
                                      {order.shippingAddress?.landmark && (
                                        <div style={{ color: '#64748b' }}>Landmark: {order.shippingAddress.landmark}</div>
                                      )}
                                      <div>
                                        {order.shippingAddress?.city || 'Chennai'}, {order.shippingAddress?.state || 'Tamil Nadu'} — {order.shippingAddress?.pincode || '600040'}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Card 2.2: Update Order Status Details & Actions */}
                                <div
                                  style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '1.25rem 1.4rem',
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    flex: 1,
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Card Header */}
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingBottom: '0.75rem',
                                        borderBottom: '1px solid #f1f5f9',
                                      }}
                                    >
                                      <h4
                                        style={{
                                          margin: 0,
                                          fontSize: '0.9rem',
                                          fontWeight: 700,
                                          color: '#0f172a',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.5rem',
                                        }}
                                      >
                                        <RotateCw size={16} color="#7c3aed" />
                                        Update Order Status
                                      </h4>
                                      <span
                                        style={{
                                          fontSize: '0.72rem',
                                          color: '#6d28d9',
                                          background: '#f3e8ff',
                                          padding: '0.15rem 0.55rem',
                                          borderRadius: '9999px',
                                          fontWeight: 600,
                                        }}
                                      >
                                        #{order.orderNumber}
                                      </span>
                                    </div>

                                    {/* Custom Status Select Dropdown */}
                                    <div>
                                      <label
                                        style={{
                                          fontSize: '0.71rem',
                                          fontWeight: 700,
                                          color: '#334155',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.04em',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.3rem',
                                          marginBottom: '0.4rem',
                                        }}
                                      >
                                        Select New Status <span style={{ color: '#ef4444' }}>*</span>
                                      </label>
                                      <StatusSelect
                                        value={currentRowStatus}
                                        onChange={(val) => setRowStatus((p) => ({ ...p, [order._id]: val }))}
                                      />
                                    </div>

                                    {/* ── AWB Input: shown only when Shipping is selected ── */}
                                    {currentRowStatus === 'shipped' && (
                                      <div style={{ animation: 'fadeIn 0.22s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                          <label style={{ fontSize: '0.71rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            <Truck size={13} color="#1d4ed8" /> Tracking / AWB Number
                                          </label>
                                          <span style={{ fontSize: '0.67rem', color: '#64748b', background: '#eff6ff', padding: '0.08rem 0.4rem', borderRadius: '4px', fontWeight: 500 }}>Optional</span>
                                        </div>
                                        <input
                                          type="text"
                                          value={currentRowNote}
                                          onChange={(e) => setRowNote((p) => ({ ...p, [order._id]: e.target.value }))}
                                          placeholder="e.g. Courier: BlueDart | AWB #987654321"
                                          style={{
                                            width: '100%',
                                            padding: '0.62rem 0.85rem',
                                            background: '#eff6ff',
                                            border: '1px dashed #93c5fd',
                                            borderRadius: '10px',
                                            fontSize: '0.81rem',
                                            color: '#0f172a',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.2s ease',
                                          }}
                                          onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.borderStyle = 'solid'; e.target.style.background = '#ffffff'; }}
                                          onBlur={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.borderStyle = 'dashed'; e.target.style.background = '#eff6ff'; }}
                                        />
                                      </div>
                                    )}

                                    {/* ── Cancellation Block: reason + note ── */}
                                    {currentRowStatus === 'cancelled' && (
                                      <div style={{ animation: 'fadeIn 0.22s ease' }}>
                                        {/* Reason List */}
                                        <div style={{ marginBottom: '0.8rem' }}>
                                          <label style={{ fontSize: '0.71rem', fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
                                            <XCircle size={13} color="#b91c1c" /> Cancellation Reason <span style={{ color: '#ef4444' }}>*</span>
                                          </label>
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.4rem' }}>
                                            {CANCEL_REASONS.map((r) => {
                                              const isChosen = currentCancelReason === r;
                                              return (
                                                <div
                                                  key={r}
                                                  onClick={() => setRowCancelReason((p) => ({ ...p, [order._id]: r }))}
                                                  style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.55rem',
                                                    padding: '0.5rem 0.75rem',
                                                    borderRadius: '9px',
                                                    border: `1.5px solid ${isChosen ? '#fca5a5' : '#fee2e2'}`,
                                                    background: isChosen ? '#fef2f2' : '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: '0.8rem',
                                                    fontWeight: isChosen ? 600 : 400,
                                                    color: isChosen ? '#b91c1c' : '#475569',
                                                    transition: 'all 0.15s ease',
                                                    userSelect: 'none',
                                                  }}
                                                  onMouseEnter={(e) => { if (!isChosen) e.currentTarget.style.background = '#fff5f5'; }}
                                                  onMouseLeave={(e) => { if (!isChosen) e.currentTarget.style.background = '#fff'; }}
                                                >
                                                  <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: `2px solid ${isChosen ? '#ef4444' : '#fca5a5'}`, background: isChosen ? '#ef4444' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                                                    {isChosen && <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />}
                                                  </div>
                                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                        {/* Optional Note */}
                                        <div style={{ marginBottom: '0.4rem' }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                            <label style={{ fontSize: '0.71rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Additional Note</label>
                                            <span style={{ fontSize: '0.67rem', color: '#64748b', background: '#f1f5f9', padding: '0.08rem 0.4rem', borderRadius: '4px', fontWeight: 500 }}>Optional</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={currentRowNote}
                                            onChange={(e) => setRowNote((p) => ({ ...p, [order._id]: e.target.value }))}
                                            placeholder="e.g. Customer called and requested cancellation"
                                            style={{
                                              width: '100%',
                                              padding: '0.62rem 0.85rem',
                                              background: '#fef2f2',
                                              border: '1px dashed #fca5a5',
                                              borderRadius: '10px',
                                              fontSize: '0.81rem',
                                              color: '#0f172a',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                              transition: 'all 0.2s ease',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#ef4444'; e.target.style.borderStyle = 'solid'; e.target.style.background = '#ffffff'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#fca5a5'; e.target.style.borderStyle = 'dashed'; e.target.style.background = '#fef2f2'; }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Order Status Flow Tracker */}
                                    <div style={{ padding: '0.9rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                      <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.7rem' }}>Order Progress</div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                        {ORDER_PROGRESS_STEPS.map((step, i, arr) => {
                                          const stepOrder = ['confirmed', 'packing', 'shipped', 'delivered'];
                                          const currentIdx = stepOrder.indexOf(order.status);
                                          const stepIdx = stepOrder.indexOf(step.key);
                                          const isDone   = order.status !== 'cancelled' && stepIdx <= currentIdx;
                                          const isCurrent = stepIdx === currentIdx;
                                          const StepIcon = step.icon;
                                          return (
                                            <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', flex: '0 0 auto' }}>
                                                <div style={{
                                                  width: '30px', height: '30px', borderRadius: '50%',
                                                  background: isDone ? step.bg : '#f1f5f9',
                                                  border: `2px solid ${isCurrent ? step.color : isDone ? step.color + '66' : '#e2e8f0'}`,
                                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                  boxShadow: isCurrent ? `0 0 0 3px ${step.color}22` : 'none',
                                                  transition: 'all 0.2s',
                                                }}>
                                                  <StepIcon size={12} color={isDone ? step.color : '#cbd5e1'} />
                                                </div>
                                                <span style={{ fontSize: '0.6rem', fontWeight: isCurrent ? 700 : 500, color: isDone ? step.color : '#94a3b8', whiteSpace: 'nowrap' }}>{step.label}</span>
                                              </div>
                                              {i < arr.length - 1 && (
                                                <div style={{ flex: 1, height: '2px', background: stepIdx < currentIdx && order.status !== 'cancelled' ? step.color + '55' : '#e2e8f0', margin: '0 2px', marginBottom: '16px', borderRadius: '2px' }} />
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                      {order.status === 'cancelled' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 600 }}>
                                          <XCircle size={13} /> This order has been cancelled
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Update CTA & Print Slip Action Buttons */}
                                  <div style={{ paddingTop: '0.85rem', marginTop: 'auto', display: 'flex', gap: '0.65rem' }}>
                                    <button
                                      type="button"
                                      onClick={(e) => handlePrintOrderSlip(order, e)}
                                      style={{
                                        height: '42px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '10px',
                                        border: '1.5px solid #e2e8f0',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        background: '#ffffff',
                                        color: '#475569',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = '#7c3aed';
                                        e.currentTarget.style.color = '#7c3aed';
                                        e.currentTarget.style.background = '#faf5ff';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.color = '#475569';
                                        e.currentTarget.style.background = '#ffffff';
                                      }}
                                      title="Print or Export Order Dispatch Slip"
                                    >
                                      <Printer size={15} />
                                      Print Slip
                                    </button>

                                    <button
                                      onClick={() => handleStatusUpdate(order)}
                                      disabled={isUpdating || currentRowStatus === order.status}
                                      style={{
                                        flex: 1,
                                        height: '42px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        padding: '0.65rem 1.25rem',
                                        borderRadius: '10px',
                                        border: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.84rem',
                                        cursor: isUpdating || currentRowStatus === order.status ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        background: currentRowStatus === order.status
                                          ? '#f1f5f9'
                                          : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                        color: currentRowStatus === order.status ? '#94a3b8' : '#ffffff',
                                        boxShadow: currentRowStatus === order.status ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.25)',
                                        opacity: isUpdating ? 0.75 : 1,
                                      }}
                                    >
                                      <Save size={15} className={isUpdating ? 'spin' : ''} />
                                      {isUpdating
                                        ? 'Updating…'
                                        : currentRowStatus === order.status
                                        ? 'Select New Status Above'
                                        : 'Save Status Update'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        {/* ── 5. CLEAN CENTERED PAGINATION (Prev 1 2 Next) ────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.1rem 1.5rem',
            background: '#ffffff',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.81rem',
                fontWeight: 600,
                color: safePage <= 1 ? '#cbd5e1' : '#475569',
                cursor: safePage <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ChevronLeft size={14} /> Prev
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              if (totalPages > 7) {
                if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - safePage) > 1) {
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return <span key={pageNum} style={{ padding: '0 0.2rem', color: '#94a3b8', fontSize: '0.8rem' }}>…</span>;
                  }
                  return null;
                }
              }
              const isCurrent = pageNum === safePage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    border: isCurrent ? '1.5px solid #7c3aed' : '1px solid #e2e8f0',
                    background: isCurrent ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#ffffff',
                    color: isCurrent ? '#ffffff' : '#475569',
                    fontSize: '0.83rem',
                    fontWeight: isCurrent ? 700 : 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isCurrent ? '0 2px 8px rgba(124, 58, 237, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                fontSize: '0.81rem',
                fontWeight: 600,
                color: safePage >= totalPages ? '#cbd5e1' : '#475569',
                cursor: safePage >= totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Accordion and Spin Animations */}
      <style>{`
        @keyframes ordAccordionIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .spin {
          animation: spinIcon 0.8s linear infinite;
        }
        @keyframes spinIcon {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
}
