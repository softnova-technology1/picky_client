import React, { useState } from 'react';
import {
  Search,
  Phone,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
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
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import { adminService } from '../../../services/admin.service';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import { useOrderStore } from '../../../store/orderStore';
import { useUiStore } from '../../../store/uiStore';

// ─── Status Tabs Configuration ──────────────────────────────────────────────
const STATUS_TABS = [
  { key: 'all',       label: 'All Orders',  icon: ShoppingBag, color: '#7c3aed' },
  { key: 'confirmed', label: 'Confirmed',   icon: Clock,       color: '#d97706' },
  { key: 'shipped',   label: 'Shipped',     icon: Truck,       color: '#2563eb' },
  { key: 'delivered', label: 'Delivered',   icon: BadgeCheck,  color: '#16a34a' },
  { key: 'cancelled', label: 'Cancelled',   icon: XCircle,     color: '#dc2626' },
];

// ─── Status Visual Config ───────────────────────────────────────────────────
const STATUS_CFG = {
  confirmed:        { cls: 'adm-status-processing', label: 'Confirmed',        icon: Clock,       bg: '#fffbebfb', color: '#b45309' },
  shipped:          { cls: 'adm-status-shipped',     label: 'Shipped',          icon: Truck,       bg: '#eff6ff',   color: '#1d4ed8' },
  out_for_delivery: { cls: 'adm-status-shipped',     label: 'Out for Delivery', icon: PackageCheck,bg: '#f0f9ff',   color: '#0369a1' },
  delivered:        { cls: 'adm-status-delivered',    label: 'Delivered',        icon: BadgeCheck,  bg: '#f0fdf4',   color: '#15803d' },
  cancelled:        { cls: 'adm-status-cancelled',    label: 'Cancelled',        icon: XCircle,     bg: '#fef2f2',   color: '#b91c1c' },
};

export default function AdminOrders() {
  const { orders: storeOrders, updateOrderStatus: storeUpdateStatus, updateOrder } = useOrderStore();
  const { showToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null); // Accordion state

  // Per-row status change state
  const [rowStatus, setRowStatus] = useState({});
  const [rowNote, setRowNote] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // ─── Dashboard Stats Calculations ────────────────────────────────────────
  const totalOrders = storeOrders.length;
  const confirmedCount = storeOrders.filter((o) => o.status === 'confirmed').length;
  const shippedCount = storeOrders.filter((o) => o.status === 'shipped' || o.status === 'out_for_delivery').length;
  const deliveredCount = storeOrders.filter((o) => o.status === 'delivered').length;
  const totalRevenue = storeOrders.reduce((acc, o) => {
    if (o.status !== 'cancelled') {
      return acc + Number(o.totalAmount || o.total || o.grandTotal || 0);
    }
    return acc;
  }, 0);

  // ─── Filter Logic ────────────────────────────────────────────────────────
  const filteredOrders = storeOrders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const term = searchTerm.toLowerCase().trim();
    const num = (o.orderNumber || '').toLowerCase();
    const cust = (o.customer?.name || o.user?.name || o.shippingAddress?.fullName || '').toLowerCase();
    const phone = (o.customer?.phone || o.user?.phone || '').toLowerCase();
    return matchesTab && (!term || num.includes(term) || cust.includes(term) || phone.includes(term));
  });

  // ─── Toggle accordion row ─────────────────────────────────────────────────
  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ─── Handle status update ─────────────────────────────────────────────────
  const handleStatusUpdate = async (order) => {
    const id = order._id;
    const newStatus = rowStatus[id] ?? order.status;
    const note = rowNote[id] ?? '';

    setRowLoading((p) => ({ ...p, [id]: true }));
    try {
      await adminService.updateOrderStatus(id, { status: newStatus, note }).catch(() => null);
      storeUpdateStatus(id, newStatus);
      updateOrder(id, {
        status: newStatus,
        statusHistory: [
          ...(order.statusHistory || []),
          { status: newStatus, timestamp: new Date().toISOString(), note: note || `Status updated to ${newStatus}` },
        ],
      });
      setRowNote((p) => ({ ...p, [id]: '' }));
      showToast(`✅ Order status updated to "${STATUS_CFG[newStatus]?.label || newStatus}"`, 'success');
    } catch {
      showToast('Status update failed', 'error');
    } finally {
      setRowLoading((p) => ({ ...p, [id]: false }));
    }
  };

  return (
    <AdminLayout title="Orders & Dispatch Dashboard">

      {/* ── 1. INNOVATIVE DASHBOARD STATS CARDS WITH CIRCLE ICON CONTAINERS ──────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Card 1: Total Orders */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '1.35rem 1.4rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f6f0ff 100%)',
            border: '1.5px solid #e9d8fd',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(124, 58, 237, 0.07)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#6b21a8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Total Orders
              </span>
              <strong style={{ fontSize: '1.65rem', color: '#1e1b4b', fontWeight: 900, display: 'block', marginTop: '0.2rem' }}>
                {totalOrders}
              </strong>
            </div>
            {/* Circle Icon Wrapper */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={22} />
            </div>
          </div>
          {/* Progress bar indicator */}
          <div style={{ marginTop: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span>Live Order Volume</span>
              <span style={{ color: '#7c3aed', fontWeight: 700 }}>100%</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: '#ede8f8', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a855f7)', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Ready to Dispatch */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '1.35rem 1.4rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #fffdf2 100%)',
            border: '1.5px solid #fde68a',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(217, 119, 6, 0.07)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Ready to Dispatch
              </span>
              <strong style={{ fontSize: '1.65rem', color: '#1e1b4b', fontWeight: 900, display: 'block', marginTop: '0.2rem' }}>
                {confirmedCount}
              </strong>
            </div>
            {/* Circle Icon Wrapper */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(217, 119, 6, 0.35)',
                flexShrink: 0,
              }}
            >
              <Clock size={22} />
            </div>
          </div>
          {/* Progress bar indicator */}
          <div style={{ marginTop: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span>Action Required</span>
              <span style={{ color: '#d97706', fontWeight: 700 }}>{totalOrders ? Math.round((confirmedCount / totalOrders) * 100) : 0}%</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: '#fef3c7', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${totalOrders ? (confirmedCount / totalOrders) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Shipped & Transit */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '1.35rem 1.4rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
            border: '1.5px solid #bfdbfe',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(37, 99, 235, 0.07)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Shipped / Transit
              </span>
              <strong style={{ fontSize: '1.65rem', color: '#1e1b4b', fontWeight: 900, display: 'block', marginTop: '0.2rem' }}>
                {shippedCount}
              </strong>
            </div>
            {/* Circle Icon Wrapper */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
                flexShrink: 0,
              }}
            >
              <Truck size={22} />
            </div>
          </div>
          {/* Progress bar indicator */}
          <div style={{ marginTop: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span>In Transit</span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>{totalOrders ? Math.round((shippedCount / totalOrders) * 100) : 0}%</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: '#dbeafe', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${totalOrders ? (shippedCount / totalOrders) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>

        {/* Card 4: Total Order Revenue */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            padding: '1.35rem 1.4rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1.5px solid #bbf7d0',
            borderRadius: '20px',
            boxShadow: '0 8px 30px rgba(22, 163, 74, 0.07)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
                Total Order Revenue
              </span>
              <strong style={{ fontSize: '1.55rem', color: '#16a34a', fontWeight: 900, display: 'block', marginTop: '0.2rem' }}>
                {formatPrice(totalRevenue)}
              </strong>
            </div>
            {/* Circle Icon Wrapper */}
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(22, 163, 74, 0.35)',
                flexShrink: 0,
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
          {/* Progress bar indicator */}
          <div style={{ marginTop: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', color: '#64748b', fontWeight: 600, marginBottom: '0.35rem' }}>
              <span>Fulfilled Ratio</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>{deliveredCount}/{totalOrders} Delivered</span>
            </div>
            <div style={{ height: '6px', width: '100%', background: '#dcfce7', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ width: `${totalOrders ? (deliveredCount / totalOrders) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #15803d)', borderRadius: '9999px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER & SEARCH CONTROL BAR ────────────────────────────── */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.1rem 1.25rem', borderRadius: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {STATUS_TABS.map(({ key, label, icon: Icon }) => {
              const isActive = activeTab === key;
              const count = key === 'all'
                ? storeOrders.length
                : storeOrders.filter((o) => o.status === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '9999px',
                    fontSize: '0.81rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1.5px solid',
                    background: isActive ? '#7c3aed' : 'transparent',
                    color: isActive ? '#ffffff' : '#5b21b6',
                    borderColor: isActive ? '#7c3aed' : '#dcd0fa',
                    boxShadow: isActive ? '0 4px 14px rgba(124,58,237,0.28)' : 'none',
                  }}
                >
                  <Icon size={14} />
                  {label}
                  <span
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.25)' : '#ede8f8',
                      color: isActive ? '#fff' : '#5b21b6',
                      borderRadius: '9999px',
                      padding: '0.08rem 0.5rem',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      minWidth: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.9rem', color: '#7c3aed', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search order #, customer, phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '280px',
                padding: '0.52rem 1rem 0.52rem 2.45rem',
                background: '#faf7ff',
                border: '1.5px solid #dcd0fa',
                borderRadius: '9999px',
                fontSize: '0.83rem',
                color: '#1e1b4b',
                outline: 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7c3aed';
                e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#dcd0fa';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* ── 3. ORDERS TABLE WITH PERFECT COLUMN ALIGNMENTS ─────────────────────────────── */}
      <div
        className="table-container"
        style={{
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1.5px solid #ede8f8',
          boxShadow: '0 4px 24px rgba(124,58,237,0.05)',
        }}
      >
        <table className="admin-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ background: '#f5f0fe' }}>
              <th style={{ width: '36px', padding: '0.95rem 0.85rem', textAlign: 'center' }}></th>
              <th style={{ padding: '0.95rem 0.85rem', textAlign: 'left' }}>Order ID</th>
              <th style={{ padding: '0.95rem 0.85rem', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '0.95rem 0.85rem', textAlign: 'left' }}>Items</th>
              <th style={{ padding: '0.95rem 0.85rem', textAlign: 'right' }}>Total Paid</th>
              <th style={{ padding: '0.95rem 0.85rem', textAlign: 'center' }}>Status</th>
              <th style={{ padding: '0.95rem 1.5rem 0.95rem 0.85rem', textAlign: 'right' }}>Manage Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                  <ShoppingBag size={42} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                  No orders found matching your search.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const custName  = order.customer?.name || order.user?.name || order.shippingAddress?.fullName || 'Customer';
                const custPhone = order.customer?.phone || order.user?.phone || '';
                const custEmail = order.customer?.email || order.user?.email || '';
                const st        = (order.status || 'confirmed').toLowerCase();
                const cfg       = STATUS_CFG[st] || STATUS_CFG.confirmed;
                const StatusIcon = cfg.icon;
                const isOpen    = expandedId === order._id;

                const currentRowStatus = rowStatus[order._id] ?? order.status;
                const currentRowNote   = rowNote[order._id]   ?? '';
                const isUpdating       = rowLoading[order._id] ?? false;

                return (
                  <React.Fragment key={order._id}>
                    {/* ── Main Table Row (Consistent Padding) ─────────────────────── */}
                    <tr
                      style={{
                        cursor: 'pointer',
                        background: isOpen ? '#faf7ff' : '#ffffff',
                        borderBottom: isOpen ? 'none' : '1px solid #f1eafa',
                        transition: 'background 0.15s ease',
                      }}
                      onClick={() => toggleRow(order._id)}
                    >
                      {/* Chevron Indicator */}
                      <td style={{ padding: '0.95rem 0.85rem', textAlign: 'center' }}>
                        <div
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '8px',
                            background: isOpen ? '#7c3aed' : '#f0ebfd',
                            color: isOpen ? '#ffffff' : '#7c3aed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}
                        >
                          {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </div>
                      </td>

                      {/* Order ID & Date */}
                      <td style={{ padding: '0.95rem 0.85rem', textAlign: 'left' }}>
                        <strong style={{ fontSize: '0.88rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          #{order.orderNumber}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                          <Calendar size={11} color="#94a3b8" />
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '0.95rem 0.85rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div className="admin-customer-avatar" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: 800 }}>
                            {custName[0]?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '0.86rem', color: '#1e1b4b', display: 'block' }}>
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
                                  color: '#16a34a',
                                  fontWeight: 700,
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

                      {/* Items count */}
                      <td style={{ padding: '0.95rem 0.85rem', textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <ShoppingBag size={13} color="#7c3aed" />
                          {order.items?.length || order.itemsCount || 1} item{(order.items?.length || 1) !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Total Paid (Right-aligned to match header) */}
                      <td style={{ padding: '0.95rem 0.85rem', textAlign: 'right' }}>
                        <strong style={{ fontSize: '0.94rem', color: '#1e1b4b', fontWeight: 800 }}>
                          {formatPrice(order.totalAmount || order.total || order.grandTotal || 0)}
                        </strong>
                      </td>

                      {/* Status Pill (Center-aligned to match header) */}
                      <td style={{ padding: '0.95rem 0.85rem', textAlign: 'center' }}>
                        <span
                          className={`adm-status-pill ${cfg.cls}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.28rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            border: '1px solid rgba(0,0,0,0.05)',
                          }}
                        >
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Action Button (Standardized Fixed Width & Padding) */}
                      <td style={{ padding: '0.95rem 1.5rem 0.95rem 0.85rem', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(order._id);
                          }}
                          style={{
                            minWidth: '135px',
                            height: '36px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.45rem',
                            padding: '0.45rem 0.95rem',
                            borderRadius: '9999px',
                            fontSize: '0.81rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            background: isOpen ? '#f0ebfd' : '#7c3aed',
                            color: isOpen ? '#6d28d9' : '#ffffff',
                            boxShadow: isOpen ? 'none' : '0 4px 14px rgba(124,58,237,0.32)',
                            boxSizing: 'border-box',
                          }}
                        >
                          <ChevronsUpDown size={14} />
                          {isOpen ? 'Close Panel' : 'Manage Order'}
                        </button>
                      </td>
                    </tr>

                    {/* ── 4. EXPANDED DETAIL VIEW WITH PERFECT UI/UX FIXES ──── */}
                    {isOpen && (
                      <tr style={{ background: '#faf7ff' }}>
                        <td colSpan={7} style={{ padding: 0, borderBottom: '2.5px solid #ede8f8' }}>
                          <div
                            style={{
                              padding: '1.5rem 1.75rem',
                              animation: 'ordAccordionIn 0.22s ease',
                            }}
                          >
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '1.35rem',
                                alignItems: 'stretch',
                              }}
                            >
                              {/* ── LEFT SECTION: Ordered Items & Customer Info ── */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: '1 1 60%' }}>

                                {/* Card 1: Ordered Products */}
                                <div
                                  style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1.5px solid #ede8f8',
                                    padding: '1.25rem 1.4rem',
                                    boxShadow: '0 2px 12px rgba(124,58,237,0.04)',
                                  }}
                                >
                                  {/* Standardized Card Header */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '1.25rem',
                                      paddingBottom: '0.85rem',
                                      borderBottom: '1px solid #f1eafa',
                                    }}
                                  >
                                    <h4
                                      style={{
                                        margin: 0,
                                        fontSize: '0.92rem',
                                        fontWeight: 800,
                                        color: '#1e1b4b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.55rem',
                                      }}
                                    >
                                      <ShoppingBag size={18} color="#7c3aed" />
                                      Ordered Products ({order.items?.length || 0})
                                    </h4>
                                  </div>

                                  {/* Products List (Increased Spacing & Readability) */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                                    {order.items?.map((item, idx) => (
                                      <div
                                        key={idx}
                                        style={{
                                          display: 'flex',
                                          gap: '1.1rem',
                                          alignItems: 'center',
                                          padding: '0.65rem 0.85rem',
                                          background: '#faf8fe',
                                          borderRadius: '12px',
                                          border: '1px solid #f1eafa',
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
                                            border: '1px solid #ede8f8',
                                          }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <strong
                                            style={{
                                              fontSize: '0.87rem',
                                              color: '#1e1b4b',
                                              display: 'block',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                            }}
                                          >
                                            {item.name}
                                          </strong>
                                          <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem', display: 'block' }}>
                                            Qty: {item.quantity} × {formatPrice(item.price)}
                                          </span>
                                        </div>
                                        <strong style={{ fontSize: '0.92rem', color: '#7c3aed', flexShrink: 0, fontWeight: 800 }}>
                                          {formatPrice(item.price * item.quantity)}
                                        </strong>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Order Summary row */}
                                  <div
                                    style={{
                                      marginTop: '1.25rem',
                                      paddingTop: '0.9rem',
                                      borderTop: '1px solid #f1eafa',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      fontSize: '0.88rem',
                                    }}
                                  >
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Total Paid Amount</span>
                                    <strong style={{ color: '#1e1b4b', fontSize: '1.02rem', fontWeight: 800 }}>
                                      {formatPrice(order.totalAmount || order.total || 0)}{' '}
                                      <span style={{ fontSize: '0.72rem', color: '#16a34a', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '9999px', marginLeft: '0.35rem', fontWeight: 800 }}>
                                        Paid
                                      </span>
                                    </strong>
                                  </div>
                                </div>

                                {/* Card 2: Customer & Shipping Details */}
                                <div
                                  style={{
                                    background: '#ffffff',
                                    borderRadius: '16px',
                                    border: '1.5px solid #ede8f8',
                                    padding: '1.25rem 1.4rem',
                                    boxShadow: '0 2px 12px rgba(124,58,237,0.04)',
                                  }}
                                >
                                  {/* Standardized Card Header */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '1.25rem',
                                      paddingBottom: '0.85rem',
                                      borderBottom: '1px solid #f1eafa',
                                    }}
                                  >
                                    <h4
                                      style={{
                                        margin: 0,
                                        fontSize: '0.92rem',
                                        fontWeight: 800,
                                        color: '#1e1b4b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.55rem',
                                      }}
                                    >
                                      <UserCheck size={18} color="#7c3aed" />
                                      Customer & Shipping Address
                                    </h4>
                                  </div>

                                  {/* Customer Info Box */}
                                  <div
                                    style={{
                                      background: '#faf8fe',
                                      borderRadius: '12px',
                                      padding: '0.9rem 1rem',
                                      marginBottom: '0.9rem',
                                      border: '1px solid #f1eafa',
                                    }}
                                  >
                                    <strong style={{ fontSize: '0.9rem', color: '#1e1b4b', display: 'block' }}>{custName}</strong>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                                      {custPhone && (
                                        <a
                                          href={`https://wa.me/${custPhone.replace(/[^0-9]/g, '')}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                            fontSize: '0.78rem',
                                            color: '#16a34a',
                                            fontWeight: 700,
                                            textDecoration: 'none',
                                          }}
                                        >
                                          <Phone size={12} /> WhatsApp: {custPhone}
                                        </a>
                                      )}
                                      {custEmail && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: '#64748b' }}>
                                          <Mail size={12} /> {custEmail}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Address Box */}
                                  <div
                                    style={{
                                      background: '#faf8fe',
                                      borderRadius: '12px',
                                      padding: '0.9rem 1rem',
                                      border: '1px solid #f1eafa',
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.82rem', color: '#1e1b4b', marginBottom: '0.35rem' }}>
                                      <MapPin size={14} color="#7c3aed" /> Shipping Location
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                                      <div>{order.shippingAddress?.street}</div>
                                      {order.shippingAddress?.landmark && (
                                        <div style={{ color: '#94a3b8' }}>Landmark: {order.shippingAddress.landmark}</div>
                                      )}
                                      <div>
                                        {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* ── RIGHT SECTION: STATUS CONTROL CARD (BALANCED HEIGHT & ANCHORED CTA) ── */}
                              <div
                                style={{
                                  background: '#ffffff',
                                  borderRadius: '16px',
                                  border: '1.5px solid #dcd0fa',
                                  padding: '1.25rem 1.4rem',
                                  boxShadow: '0 4px 20px rgba(124, 58, 237, 0.06)',
                                  flex: '1 1 35%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>
                                  {/* Standardized Card Header */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      marginBottom: '1.25rem',
                                      paddingBottom: '0.85rem',
                                      borderBottom: '1px solid #f1eafa',
                                    }}
                                  >
                                    <h4
                                      style={{
                                        margin: 0,
                                        fontSize: '0.92rem',
                                        fontWeight: 800,
                                        color: '#1e1b4b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.55rem',
                                      }}
                                    >
                                      <RotateCw size={18} color="#7c3aed" />
                                      Update Order Status
                                    </h4>
                                    <span
                                      style={{
                                        fontSize: '0.73rem',
                                        color: '#7c3aed',
                                        background: '#f0ebfd',
                                        padding: '0.15rem 0.6rem',
                                        borderRadius: '9999px',
                                        fontWeight: 800,
                                      }}
                                    >
                                      #{order.orderNumber}
                                    </span>
                                  </div>

                                  {/* Current Status Indicator */}
                                  <div
                                    style={{
                                      background: '#faf7ff',
                                      border: '1px solid #ede8f8',
                                      borderRadius: '12px',
                                      padding: '0.8rem 0.95rem',
                                      marginBottom: '1.2rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Current Status:</span>
                                    <span
                                      style={{
                                        background: cfg.bg,
                                        color: cfg.color,
                                        padding: '0.28rem 0.75rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.76rem',
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                      }}
                                    >
                                      <StatusIcon size={12} /> {cfg.label}
                                    </span>
                                  </div>

                                  {/* Select New Status Dropdown (Default Neutral Border, Focus Ring on Focus) */}
                                  <div style={{ marginBottom: '1.25rem' }}>
                                    <label
                                      style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 800,
                                        color: '#1e1b4b',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.04em',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.35rem',
                                        marginBottom: '0.45rem',
                                      }}
                                    >
                                      Select New Status <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <select
                                      value={currentRowStatus}
                                      onChange={(e) => setRowStatus((p) => ({ ...p, [order._id]: e.target.value }))}
                                      style={{
                                        width: '100%',
                                        padding: '0.72rem 1rem',
                                        background: '#faf8fe',
                                        border: '1.5px solid #dcd0fa',
                                        borderRadius: '12px',
                                        fontSize: '0.88rem',
                                        fontWeight: 700,
                                        color: '#1e1b4b',
                                        cursor: 'pointer',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s ease',
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.borderColor = '#7c3aed';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.15)';
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.borderColor = '#dcd0fa';
                                        e.target.style.boxShadow = 'none';
                                      }}
                                    >
                                      <option value="confirmed">⚡ Confirmed (Ready to Ship)</option>
                                      <option value="shipped">🚚 Shipped & Dispatched</option>
                                      <option value="out_for_delivery">📦 Out for Delivery</option>
                                      <option value="delivered">🎉 Delivered to Customer</option>
                                      <option value="cancelled">❌ Cancelled</option>
                                    </select>
                                  </div>

                                  {/* Tracking Note Input (Visually Differentiated Optional Field) */}
                                  <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                                      <label
                                        style={{
                                          fontSize: '0.75rem',
                                          fontWeight: 800,
                                          color: '#475569',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.04em',
                                        }}
                                      >
                                        Tracking / AWB Note
                                      </label>
                                      <span
                                        style={{
                                          fontSize: '0.68rem',
                                          color: '#64748b',
                                          background: '#f1f5f9',
                                          padding: '0.1rem 0.45rem',
                                          borderRadius: '4px',
                                          fontWeight: 600,
                                        }}
                                      >
                                        Optional
                                      </span>
                                    </div>
                                    <input
                                      type="text"
                                      value={currentRowNote}
                                      onChange={(e) => setRowNote((p) => ({ ...p, [order._id]: e.target.value }))}
                                      placeholder="e.g. Courier: BlueDart | AWB #987654321"
                                      style={{
                                        width: '100%',
                                        padding: '0.68rem 0.9rem',
                                        background: '#f8fafc',
                                        border: '1.5px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        fontSize: '0.82rem',
                                        color: '#1e1b4b',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s ease',
                                      }}
                                      onFocus={(e) => {
                                        e.target.style.borderColor = '#7c3aed';
                                        e.target.style.borderStyle = 'solid';
                                        e.target.style.background = '#ffffff';
                                      }}
                                      onBlur={(e) => {
                                        e.target.style.borderColor = '#cbd5e1';
                                        e.target.style.borderStyle = 'dashed';
                                        e.target.style.background = '#f8fafc';
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Update CTA Button (Anchored cleanly at the bottom) */}
                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                  <button
                                    onClick={() => handleStatusUpdate(order)}
                                    disabled={isUpdating || currentRowStatus === order.status}
                                    style={{
                                      width: '100%',
                                      height: '42px',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.5rem',
                                      padding: '0.75rem 1.4rem',
                                      borderRadius: '12px',
                                      border: 'none',
                                      fontWeight: 800,
                                      fontSize: '0.88rem',
                                      cursor: isUpdating || currentRowStatus === order.status ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s ease',
                                      background: currentRowStatus === order.status
                                        ? '#f1eafa'
                                        : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                      color: currentRowStatus === order.status ? '#9ca3af' : '#ffffff',
                                      boxShadow: currentRowStatus === order.status ? 'none' : '0 6px 20px rgba(124,58,237,0.35)',
                                      opacity: isUpdating ? 0.75 : 1,
                                    }}
                                  >
                                    <Save size={16} className={isUpdating ? 'spin' : ''} />
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
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Accordion and Spin Animations */}
      <style>{`
        @keyframes ordAccordionIn {
          from { opacity: 0; transform: translateY(-8px); }
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
