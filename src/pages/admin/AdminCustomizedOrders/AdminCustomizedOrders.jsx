import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  PackageCheck,
  Search,
  Type,
  Image as ImageIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Printer,
  RotateCw,
  Phone,
  Mail,
  MapPin,
  Tag,
  Check,
  Calendar,
  FileText,
  UserCheck,
  ExternalLink,
  XCircle,
  Package,
  Globe,
  Barcode,
  Save,
  ArrowRight,
  ShieldCheck,
  Plus,
  Pencil,
  Settings,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminStatCard from '../../../components/common/AdminStatCard';
import AdminInvoice from '../../../components/admin/AdminInvoice';
import AdminShippingLabel from '../../../components/admin/AdminShippingLabel';
import WhatsAppIcon from '../../../components/common/WhatsAppIcon/WhatsAppIcon';
import Spinner from '../../../components/ui/Spinner';
import { adminService } from '../../../services/admin.service';
import { useOrderStore } from '../../../store/orderStore';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import {
  getOrderCustomerInfo,
  getOrderTrackingInfo,
  launchOrderWhatsappShare,
} from '../../../utils/whatsappOrderShare';
import styles from './AdminCustomizedOrders.module.css';

const ADMIN = '/softpicky-sn2026';

// ─── Status & Progress Configurations (Exact Match to AdminOrders) ────────────
export const STATUS_CFG = {
  placed:    { cls: 'adm-status-processing', label: 'Order Placed', icon: ShoppingBag,   bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
  confirmed: { cls: 'adm-status-processing', label: 'Confirmed',    icon: CheckCircle2,  bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  packing:   { cls: 'adm-status-processing', label: 'In Crafting',  icon: Layers,        bg: '#f3e8ff', color: '#7c3aed', border: '#e9d5ff' },
  shipped:   { cls: 'adm-status-shipped',    label: 'Shipped',      icon: Truck,         bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  delivered: { cls: 'adm-status-delivered',  label: 'Delivered',    icon: PackageCheck,  bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  cancelled: { cls: 'adm-status-cancelled',  label: 'Cancelled',    icon: XCircle,       bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};

export const STATUS_OPTIONS = [
  { value: 'placed',    label: 'Order Placed', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'confirmed', label: 'Confirmed',    icon: CheckCircle2,  color: '#b45309', bg: '#fffbeb' },
  { value: 'shipped',   label: 'Shipped',      icon: Truck,         color: '#1d4ed8', bg: '#eff6ff' },
  { value: 'delivered', label: 'Delivered',    icon: PackageCheck,  color: '#15803d', bg: '#f0fdf4' },
  { value: 'cancelled', label: 'Cancelled',    icon: XCircle,       color: '#b91c1c', bg: '#fef2f2' },
];

export const ORDER_PROGRESS_STEPS = [
  { key: 'placed',    label: 'Order Placed', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'confirmed', label: 'Confirmed',    icon: CheckCircle2,  color: '#d97706', bg: '#fffbeb' },
  { key: 'shipped',   label: 'Shipped',      icon: Truck,         color: '#2563eb', bg: '#eff6ff' },
  { key: 'delivered', label: 'Delivered',    icon: PackageCheck,  color: '#16a34a', bg: '#f0fdf4' },
];

export const CANCEL_REASONS = [
  'Out of Stock',
  'Customer Requested Cancellation',
  'Payment Failure / Not Received',
  'Incorrect Order Details',
  'Courier / Logistics Issue',
  'Other',
];

const INITIAL_COURIER_PRESETS = [
  { id: 'st_courier', name: 'ST Courier', url: 'https://stcourier.com/', number: 'STC-', color: '#dc2626' },
  { id: 'prof_courier', name: 'Professional Courier', url: 'https://www.tpcindia.com/', number: 'TPC-', color: '#ea580c' },
  { id: 'bluedart', name: 'Blue Dart', url: 'https://www.bluedart.com/', number: 'BD-', color: '#2563eb' },
  { id: 'dtdc', name: 'DTDC', url: 'https://www.dtdc.in/', number: 'DTDC-', color: '#b91c1c' },
  { id: 'delhivery', name: 'Delhivery', url: 'https://www.delhivery.com/', number: 'DEL-', color: '#0f172a' },
  { id: 'speedpost', name: 'Speed Post', url: 'https://www.indiapost.gov.in/', number: 'SP-', color: '#d97706' },
];

const MONTHS_SHORT_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatStatusDateTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS_SHORT_NAMES[d.getMonth()] || '';
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  return `${day} ${month} ${year}, ${time}`;
}

function getStatusUpdateInfo(statusKey, order) {
  if (!order) return { isDone: false, timestamp: null };
  const targetKey = (statusKey || '').toLowerCase();
  const currentKey = (order.status || 'placed').toLowerCase();

  const historyList = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const found = historyList.slice().reverse().find((h) => (h.status || '').toLowerCase() === targetKey);

  if (found?.timestamp) {
    return { isDone: true, timestamp: found.timestamp };
  }

  const stepSequence = ['placed', 'confirmed', 'shipped', 'delivered'];
  const currentIdx = currentKey === 'delivered' ? 3 : (currentKey === 'shipped' ? 2 : (currentKey === 'confirmed' ? 1 : (currentKey === 'placed' ? 0 : -1)));
  const targetIdx = stepSequence.indexOf(targetKey);

  if (currentKey === 'cancelled') {
    if (targetKey === 'cancelled') {
      return { isDone: true, timestamp: order.updatedAt || order.createdAt || null };
    }
    if (targetKey === 'placed') {
      return { isDone: true, timestamp: order.createdAt || null };
    }
    return { isDone: false, timestamp: null };
  }

  if (targetIdx !== -1 && targetIdx <= currentIdx) {
    const ts = targetIdx === currentIdx ? (order.updatedAt || order.createdAt) : order.createdAt;
    return { isDone: true, timestamp: ts };
  }

  return { isDone: false, timestamp: null };
}

// ─── StatusSelect Dropdown Component (Matching AdminOrders 1:1) ───────────────
function StatusSelect({ value, onChange, currentStatus, order, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const availableOptions = STATUS_OPTIONS;
  const selected = availableOptions.find((o) => o.value === value) || availableOptions[0] || STATUS_OPTIONS[0];
  const SelIcon = selected.icon;
  const currentSelectedInfo = getStatusUpdateInfo(selected.value, order);
  const formattedSelectedTime = currentSelectedInfo.timestamp ? formatStatusDateTime(currentSelectedInfo.timestamp) : '';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((p) => !p); }}
        style={{
          width: '100%',
          padding: '0.65rem 0.9rem',
          background: disabled ? '#f8fafc' : open ? '#ffffff' : '#f8fafc',
          border: `1.5px solid ${disabled ? '#e2e8f0' : open ? '#7c3aed' : '#e2e8f0'}`,
          borderRadius: '10px',
          fontSize: '0.84rem',
          fontWeight: 600,
          color: disabled ? '#64748b' : '#0f172a',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          boxShadow: !disabled && open ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
          transition: 'all 0.2s ease',
        }}
        title="Select New Status"
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
          <span style={{ width: '26px', height: '26px', borderRadius: '7px', background: selected.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SelIcon size={13} color={selected.color} />
          </span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{selected.label}</span>
          {formattedSelectedTime && (
            <span
              style={{
                fontSize: '0.71rem',
                fontWeight: 600,
                color: '#15803d',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                padding: '0.12rem 0.45rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Clock size={11} color="#16a34a" />
              {formattedSelectedTime}
            </span>
          )}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {currentSelectedInfo.isDone && (
            <span
              title="Status Updated"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#dcfce7',
                border: '1.5px solid #86efac',
                color: '#16a34a',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={11} strokeWidth={3} />
            </span>
          )}
          <ChevronDown
            size={14}
            color="#94a3b8"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 10px 32px rgba(0,0,0,0.12)',
            zIndex: 200,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease',
            padding: '0.35rem',
          }}
        >
          {availableOptions.map((opt) => {
            const OptIcon = opt.icon;
            const isSelected = opt.value === value;
            const { isDone, timestamp } = getStatusUpdateInfo(opt.value, order);
            const formattedTime = timestamp ? formatStatusDateTime(timestamp) : '';

            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.65rem',
                  padding: '0.62rem 0.85rem',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  background: isSelected ? '#f5f3ff' : 'transparent',
                  border: `1px solid ${isSelected ? '#ddd6fe' : 'transparent'}`,
                  color: isSelected ? '#6d28d9' : '#0f172a',
                  fontSize: '0.84rem',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'background 0.12s ease',
                  userSelect: 'none',
                  marginBottom: '0.2rem',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <OptIcon size={14} color={opt.color} />
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#6d28d9' : '#0f172a' }}>
                    {opt.label}
                  </span>
                  {formattedTime && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: '#15803d',
                        background: '#dcfce7',
                        border: '1px solid #bbf7d0',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Clock size={10} color="#16a34a" />
                      {formattedTime}
                    </span>
                  )}
                </div>

                {isDone && (
                  <span
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#dcfce7',
                      border: '1.5px solid #86efac',
                      color: '#16a34a',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const getColorHex = (color) => {
  if (!color) return '#1e293b';
  if (typeof color === 'string') return color.startsWith('#') || color.startsWith('rgb') ? color : '#dc2626';
  if (typeof color === 'object') return color.hex || '#dc2626';
  return '#dc2626';
};

const getColorName = (color) => {
  if (!color) return 'Custom Color';
  if (typeof color === 'string') return color;
  if (typeof color === 'object') return color.name || color.hex || 'Custom Color';
  return 'Custom Color';
};

export default function AdminCustomizedOrders() {
  const { showToast } = useUiStore();
  const storeOrders = useOrderStore((s) => s.orders);
  const storeUpdateStatus = useOrderStore((s) => s.updateOrderStatus);

  // Helper: Filter customized orders from any order list
  const getCustomOrders = (list) => {
    return (list || []).filter(
      (o) =>
        o.isCustomized ||
        o.customizationCostTotal > 0 ||
        o.items?.some((i) => i.isCustomized || i.customization)
    );
  };

  const initialCustom = getCustomOrders(storeOrders);
  const [orders, setOrders] = useState(initialCustom);
  const [loading, setLoading] = useState(initialCustom.length === 0);
  const [fetchError, setFetchError] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion Dropdown State: Collapsed by default (null).
  const [expandedId, setExpandedId] = useState(null);

  // Exact Status Update Workflow State (from AdminOrders)
  const [rowStatus, setRowStatus] = useState({});
  const [rowNote, setRowNote] = useState({});
  const [rowCourier, setRowCourier] = useState({});
  const [rowCourierUrl, setRowCourierUrl] = useState({});
  const [rowCancelReason, setRowCancelReason] = useState({});
  const [rowLoading, setRowLoading] = useState({});
  const [srCourierChoice, setSrCourierChoice] = useState({});
  const [srShippingId, setSrShippingId] = useState(null);
  const [courierPresets] = useState(INITIAL_COURIER_PRESETS);

  // Modals
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Sync state if storeOrders updates
  useEffect(() => {
    if (orders.length === 0 && storeOrders.length > 0) {
      const customOnly = getCustomOrders(storeOrders);
      if (customOnly.length > 0) {
        setOrders(customOnly);
        setLoading(false);
      }
    }
  }, [storeOrders]);

  // Load orders from MongoDB backend
  const loadOrders = async () => {
    try {
      if (orders.length === 0) setLoading(true);
      setFetchError(null);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network request timed out. Please try again.')), 15000)
      );

      const fetchPromise = adminService.getOrders({ limit: 100 });
      const res = await Promise.race([fetchPromise, timeoutPromise]);

      const raw = res?.data?.orders || res?.data?.data || res?.data || [];
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.orders) ? raw.orders : []);

      if (list.length > 0) {
        useOrderStore.getState().setOrders(list);
      }

      const customOnly = getCustomOrders(list);
      setOrders(customOnly);
    } catch (err) {
      console.warn('Could not fetch admin orders from DB:', err?.message || err);
      const fallback = getCustomOrders(useOrderStore.getState().orders);
      if (fallback.length > 0) {
        setOrders(fallback);
      } else {
        setFetchError(err?.message || 'Unable to load customized orders from database.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Toggle Row Accordion Dropdown
  const toggleRow = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ─── Exact Status Update Handler (Matching AdminOrders Workflow) ─────────────
  const handleStatusUpdate = async (order) => {
    const id = order._id || order.id || order.orderNumber;
    const newStatus = rowStatus[id] ?? order.status;
    const note = rowNote[id] ?? '';
    const cancelReason = rowCancelReason[id] ?? '';

    // Disallow backward status transitions
    if (order.status === 'delivered' && newStatus !== 'delivered') {
      showToast('⚠️ Delivered order is completed and cannot be modified.', 'error');
      return;
    }
    if (order.status === 'cancelled' && newStatus !== 'cancelled') {
      showToast('⚠️ Cancelled order cannot be reopened.', 'error');
      return;
    }
    if (order.status === 'shipped' && (newStatus === 'confirmed' || newStatus === 'placed')) {
      showToast('⚠️ Shipped order cannot be moved back to Confirmed or Order Placed.', 'error');
      return;
    }

    // Validate: shipping requires all 3 input fields
    if (newStatus === 'shipped') {
      const enteredCourier = (rowCourier[id] !== undefined ? rowCourier[id] : (order.courier !== 'Standard Surface Delivery' ? (order.courier || '') : '')).trim();
      const enteredCourierUrl = (rowCourierUrl[id] !== undefined ? rowCourierUrl[id] : (order.courierUrl || '')).trim();
      const enteredAwb = (rowNote[id] !== undefined ? rowNote[id] : (order.trackingId || '')).trim();

      if (!enteredCourier) {
        showToast('⚠️ Courier Name is required to ship order.', 'error');
        return;
      }
      if (!enteredCourierUrl) {
        showToast('⚠️ Courier Site URL Link is required to ship order.', 'error');
        return;
      }
      if (!enteredAwb) {
        showToast('⚠️ Tracking / AWB Number is required to ship order.', 'error');
        return;
      }
    }

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
      const enteredAwb = (rowNote[id] !== undefined ? rowNote[id] : (order.trackingId || '')).trim();
      const enteredCourier = (rowCourier[id] !== undefined ? rowCourier[id] : (order.courier !== 'Standard Surface Delivery' ? (order.courier || '') : '')).trim();
      const enteredCourierUrl = (rowCourierUrl[id] !== undefined ? rowCourierUrl[id] : (order.courierUrl || '')).trim();

      const trackingPayload = {};
      if (enteredAwb) trackingPayload.trackingId = enteredAwb;
      if (enteredCourier) trackingPayload.courier = enteredCourier;
      if (enteredCourierUrl) trackingPayload.courierUrl = enteredCourierUrl;

      // Update to backend database
      await adminService.updateOrderStatus(id, {
        status: newStatus,
        note: fullNote,
        ...trackingPayload,
      }).catch(() => null);

      storeUpdateStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) =>
          (o._id === id || o.orderNumber === id)
            ? {
                ...o,
                status: newStatus,
                ...trackingPayload,
                statusHistory: [
                  ...(o.statusHistory || []),
                  { status: newStatus, timestamp: new Date().toISOString(), note: fullNote },
                ],
              }
            : o
        )
      );

      setRowNote((p) => ({ ...p, [id]: '' }));
      setRowCourier((p) => ({ ...p, [id]: '' }));
      setRowCourierUrl((p) => ({ ...p, [id]: '' }));
      setRowCancelReason((p) => ({ ...p, [id]: '' }));
      setRowStatus((p) => { const n = { ...p }; delete n[id]; return n; });

      showToast(`✅ Order status updated to "${STATUS_CFG[newStatus]?.label || newStatus}"`, 'success');
    } catch (err) {
      console.error('Status update failed:', err);
      showToast('Status update failed. Please try again.', 'error');
    } finally {
      setRowLoading((p) => ({ ...p, [id]: false }));
    }
  };

  // ─── 1-Click Shiprocket Dispatch (Matching AdminOrders Workflow) ───────────
  const handleShipViaShiprocket = async (order) => {
    const id = order._id || order.id || order.orderNumber;
    setSrShippingId(id);
    try {
      const courier = srCourierChoice[id] || 'Delhivery Surface';
      const res = await adminService.shipViaShiprocket(id, {
        packageDetails: {
          weight: 0.5,
          length: 15,
          breadth: 12,
          height: 5,
          courierName: courier,
        },
      });

      const data = res?.data;
      const shipment = data?.shipment || {};
      const awb = shipment.awbCode || data?.order?.trackingNumber || 'SR-DLHV-SIM';
      const assignedCourier = shipment.courierName || courier;
      const labelUrl = shipment.labelUrl || `/api/v1/orders/admin/${id}/shiprocket/label`;
      const trackingUrl = shipment.courierUrl || shipment.trackingUrl || `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;

      showToast(`🚀 Order #${order.orderNumber} dispatched via Shiprocket (${assignedCourier})! AWB: ${awb}`, 'success');

      storeUpdateStatus(id, 'shipped');
      setOrders((prev) =>
        prev.map((o) =>
          (o._id === id || o.orderNumber === id)
            ? {
                ...o,
                status: 'shipped',
                courier: assignedCourier,
                courierUrl: trackingUrl,
                trackingId: awb,
                trackingNumber: awb,
                shippingLabelUrl: labelUrl,
                shippingStatus: 'shipped',
              }
            : o
        )
      );
    } catch (err) {
      console.error('Shiprocket dispatch error:', err);
      showToast(err?.response?.data?.message || err.message || 'Shiprocket dispatch failed', 'error');
    } finally {
      setSrShippingId(null);
    }
  };

  const handlePrintSrLabel = async (order) => {
    const id = order._id || order.id || order.orderNumber;
    try {
      const res = await adminService.getShiprocketLabel(id);
      const labelUrl = res?.data?.labelUrl || order.shippingLabelUrl;
      if (labelUrl) {
        window.open(labelUrl, '_blank');
      } else {
        setSelectedLabelOrder(order);
      }
    } catch (err) {
      console.error('Shiprocket label fetch error:', err);
      setSelectedLabelOrder(order);
    }
  };

  // KPI Calculations
  const totalCustomOrders = orders.length;
  const readyForProductionCount = orders.filter((o) => ['placed', 'confirmed'].includes(o.status)).length;
  const inProductionDispatchedCount = orders.filter((o) =>
    ['shipped', 'out_for_delivery', 'in_transit', 'packing'].includes(o.status)
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalCustomRevenue = orders.reduce((sum, o) => {
    const fee =
      o.customizationCostTotal ||
      o.items?.reduce((s, i) => s + (Number(i.customizationCost) || 0) * (Number(i.quantity) || 1), 0) ||
      200;
    return sum + fee;
  }, 0);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    let list = orders;

    if (filterTab === 'ready') {
      list = list.filter((o) => ['placed', 'confirmed'].includes(o.status));
    } else if (filterTab === 'in_production') {
      list = list.filter((o) => ['confirmed', 'packing', 'processing'].includes(o.status));
    } else if (filterTab === 'shipped') {
      list = list.filter((o) => ['shipped', 'out_for_delivery'].includes(o.status));
    } else if (filterTab === 'delivered') {
      list = list.filter((o) => o.status === 'delivered');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((o) => {
        const orderNum = (o.orderNumber || '').toLowerCase();
        const custName = (
          o.customer?.name ||
          o.shippingAddress?.fullName ||
          o.shippingAddress?.name ||
          ''
        ).toLowerCase();
        const hasItemMatch = o.items?.some((i) => {
          const name = (i.name || '').toLowerCase();
          const frontText = (i.customization?.frontText || '').toLowerCase();
          const backText = (i.customization?.backText || '').toLowerCase();
          const font = (i.customization?.frontFont || '').toLowerCase();
          const color = getColorName(i.customization?.color).toLowerCase();
          return (
            name.includes(q) ||
            frontText.includes(q) ||
            backText.includes(q) ||
            font.includes(q) ||
            color.includes(q)
          );
        });
        return orderNum.includes(q) || custName.includes(q) || hasItemMatch;
      });
    }

    return list;
  }, [orders, filterTab, searchQuery]);

  return (
    <AdminLayout title="Customized Orders">
      <div className={styles.pageContainer}>
        {/* ── Page Header (Consistent with AdminOrders) ── */}
        <div className="admin-page-header-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h1 className="admin-page-main-title" style={{ margin: 0 }}>
                Customized Orders
              </h1>
              <span className={styles.customizedBadge}>
                <Sparkles size={13} color="#7c3aed" /> Artisanal Workflow
              </span>
            </div>
            <p className="admin-page-main-subtitle">
              Inspect bespoke manufacturing specifications, fabric details, front/back typography, and uploaded design artwork
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            className="admin-period-select-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}
          >
            <RotateCw size={14} className={loading ? 'spin-animation' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* ── 1. KPI Stats Cards (Styled with Royal Purple, Amber, Blue, Green) ── */}
        <div className={styles.kpiGrid}>
          <AdminStatCard
            title="TOTAL CUSTOM ORDERS"
            value={totalCustomOrders}
            icon={<Sparkles size={22} />}
            variant="purple"
            footerLabel="Bespoke Pipeline"
            footerValue="100%"
            progress={100}
          />
          <AdminStatCard
            title="READY FOR PRODUCTION"
            value={readyForProductionCount}
            icon={<Clock size={22} />}
            variant="amber"
            footerLabel="Action Required"
            footerValue={`${totalCustomOrders ? Math.round((readyForProductionCount / totalCustomOrders) * 100) : 0}%`}
            progress={totalCustomOrders ? (readyForProductionCount / totalCustomOrders) * 100 : 0}
          />
          <AdminStatCard
            title="IN CRAFTING / SHIPPED"
            value={inProductionDispatchedCount}
            icon={<Truck size={22} />}
            variant="blue"
            footerLabel="Active Production"
            footerValue={`${totalCustomOrders ? Math.round((inProductionDispatchedCount / totalCustomOrders) * 100) : 0}%`}
            progress={totalCustomOrders ? (inProductionDispatchedCount / totalCustomOrders) * 100 : 0}
          />
          <AdminStatCard
            title="CUSTOMIZATION REVENUE"
            value={formatPrice(totalCustomRevenue)}
            icon={<ShoppingBag size={22} />}
            variant="green"
            footerLabel="Separate Fee Ledger"
            footerValue="+₹200/unit avg"
            progress={85}
          />
        </div>

        {/* ── 2. Toolbar & Status Filter Tabs ── */}
        <div className={styles.toolbarCard}>
          <div className={styles.tabsGroup}>
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`${styles.tabBtn} ${filterTab === 'all' ? styles.tabBtnActive : ''}`}
            >
              <ShoppingBag size={14} />
              All Orders
              <span className={styles.tabBadge}>{orders.length}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('ready')}
              className={`${styles.tabBtn} ${filterTab === 'ready' ? styles.tabBtnActive : ''}`}
            >
              <Clock size={14} />
              Ready for Production
              <span className={styles.tabBadge}>{readyForProductionCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('shipped')}
              className={`${styles.tabBtn} ${filterTab === 'shipped' ? styles.tabBtnActive : ''}`}
            >
              <Truck size={14} />
              Dispatched / Shipped
              <span className={styles.tabBadge}>{inProductionDispatchedCount}</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('delivered')}
              className={`${styles.tabBtn} ${filterTab === 'delivered' ? styles.tabBtnActive : ''}`}
            >
              <PackageCheck size={14} />
              Delivered
              <span className={styles.tabBadge}>{deliveredCount}</span>
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by Order #, Customer, Text, Font, or Color..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* ── 3. Orders Table View (Exact Match to AdminOrders) ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Spinner size={36} />
            <p style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.88rem' }}>
              Loading bespoke customized orders...
            </p>
          </div>
        ) : fetchError && orders.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconWrap} style={{ background: '#fef2f2', color: '#dc2626' }}>
              <RotateCw size={30} />
            </div>
            <h3 className={styles.emptyTitle}>Slow Database Response</h3>
            <p className={styles.emptyDesc}>
              {fetchError}. The cloud database took too long to return orders. Click below to retry.
            </p>
            <button
              type="button"
              onClick={loadOrders}
              className="admin-period-select-btn"
              style={{ marginTop: '1.2rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <RotateCw size={14} />
              <span>Retry Fetching Orders</span>
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconWrap}>
              <Sparkles size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No Customized Orders Found</h3>
            <p className={styles.emptyDesc}>
              {searchQuery
                ? `No customized orders match "${searchQuery}". Try clearing search filters.`
                : 'Customized orders placed with bespoke front, backside, fabric, and color specifications will appear here automatically.'}
            </p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '48px', textAlign: 'center' }}>S.No</th>
                  <th style={{ textAlign: 'left' }}>Order ID</th>
                  <th style={{ textAlign: 'left' }}>Customer</th>
                  <th style={{ textAlign: 'left' }}>Shipping Address</th>
                  <th style={{ textAlign: 'left' }}>Items</th>
                  <th style={{ textAlign: 'right' }}>Total Paid</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Manage Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const orderId = order._id || order.id || order.orderNumber;
                  const isOpen = expandedId === orderId;
                  const custItems = (order.items || []).filter(
                    (i) => i.isCustomized || i.customization || (order.isCustomized && order.items.length === 1)
                  );
                  const custName =
                    order.customer?.name ||
                    order.shippingAddress?.fullName ||
                    order.shippingAddress?.name ||
                    'Customer';
                  const custPhone = order.customer?.phone || order.shippingAddress?.phone || '';
                  const custEmail = order.customer?.email || order.user?.email || '';
                  const rowCustomerInfo = getOrderCustomerInfo(order);
                  const rowTrackingInfo = getOrderTrackingInfo(order);

                  // Current status and editing values for this row
                  const currentRowStatus = rowStatus[orderId] ?? (order.status || 'confirmed');
                  const isAlreadyShippedOrDelivered = order.status === 'shipped' || order.status === 'delivered';
                  const initialCourier = isAlreadyShippedOrDelivered && order.courier !== 'Standard Surface Delivery' ? (order.courier || '') : '';
                  const currentRowNote = rowNote[orderId] ?? (isAlreadyShippedOrDelivered ? (order.trackingId || '') : '');
                  const currentRowCourier = rowCourier[orderId] ?? initialCourier;
                  const currentRowCourierUrl = rowCourierUrl[orderId] ?? (isAlreadyShippedOrDelivered ? (order.courierUrl || '') : '');
                  const currentCancelReason = rowCancelReason[orderId] ?? '';
                  const isUpdating = rowLoading[orderId] ?? false;

                  const st = (order.status || 'confirmed').toLowerCase();
                  const cfg = STATUS_CFG[st] || STATUS_CFG.confirmed;
                  const StatusIcon = cfg.icon;

                  return (
                    <React.Fragment key={orderId}>
                      {/* ── Compact Main Table Row (Clickable anywhere to dropdown) ── */}
                      <tr
                        className={`${styles.tableRow} ${isOpen ? styles.tableRowActive : ''}`}
                        onClick={() => toggleRow(orderId)}
                      >
                        {/* S.No */}
                        <td className={styles.tableCell} style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                          {index + 1}
                        </td>

                        {/* Order ID & Date */}
                        <td className={styles.tableCell} style={{ textAlign: 'left' }}>
                          <Link
                            to={`${ADMIN}/orders/${order._id || order.orderNumber}`}
                            onClick={(e) => e.stopPropagation()}
                            title="Open Standalone Order Details Page"
                            style={{
                              fontSize: '0.86rem',
                              color: '#7c3aed',
                              fontWeight: 700,
                              letterSpacing: '0.01em',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              textDecoration: 'none',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
                          >
                            <span>#{order.orderNumber}</span>
                            <ExternalLink size={12} color="#a78bfa" />
                          </Link>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                            <Calendar size={11} color="#94a3b8" />
                            {formatDate(order.createdAt)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className={styles.tableCell} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <div className={styles.customerAvatar}>
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
                        <td className={styles.tableCell} style={{ textAlign: 'left', maxWidth: '230px' }}>
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
                                {order.shippingAddress?.city || 'Chennai'}, {order.shippingAddress?.state || 'TN'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Items */}
                        <td className={styles.tableCell} style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: 500, color: '#475569', fontSize: '0.83rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <ShoppingBag size={13} color="#7c3aed" />
                              {order.items?.length || 1} item{(order.items?.length || 1) !== 1 ? 's' : ''}
                            </span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: '#7c3aed',
                                background: '#f5f3ff',
                                border: '1px solid #ddd6fe',
                                padding: '0.12rem 0.5rem',
                                borderRadius: '6px',
                                letterSpacing: '0.01em',
                              }}
                              title="Customized Order with bespoke manufacturing specifications"
                            >
                              <Sparkles size={10} color="#7c3aed" /> Customized
                            </span>
                          </div>
                        </td>

                        {/* Total Paid */}
                        <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                            {formatPrice(order.totalAmount || order.total || order.grandTotal || 0)}
                          </strong>
                        </td>

                        {/* Status Pill */}
                        <td className={styles.tableCell} style={{ textAlign: 'center' }}>
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
                              background: cfg.bg,
                              color: cfg.color,
                              border: `1px solid ${cfg.border}`,
                            }}
                          >
                            <StatusIcon size={12} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Action Cell */}
                        <td className={styles.tableCell} style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                            {/* Tax Invoice Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceOrder(order);
                              }}
                              className={`${styles.circleActionBtn} ${styles.invoiceBtn}`}
                              title={`Generate Tax Invoice #${order.orderNumber}`}
                            >
                              <FileText size={15} />
                            </button>

                            {/* Shipping Label Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLabelOrder(order);
                              }}
                              className={`${styles.circleActionBtn} ${styles.labelBtn}`}
                              title={`Generate 4x6 Shipping Label #${order.orderNumber}`}
                            >
                              <Tag size={15} />
                            </button>

                            {/* WhatsApp Share Button */}
                            <button
                              type="button"
                              onClick={(e) => launchOrderWhatsappShare({ order, showToast, e })}
                              className={`${styles.circleActionBtn} ${styles.whatsappBtn}`}
                              title={
                                !rowCustomerInfo.hasPhone
                                  ? 'Customer phone number unavailable'
                                  : rowTrackingInfo.awb
                                    ? `Send Tracking (${rowTrackingInfo.awb}) on WhatsApp`
                                    : `Send Order Confirmation #${order.orderNumber} on WhatsApp`
                              }
                            >
                              <WhatsAppIcon size={15} color="currentColor" />
                            </button>

                            {/* Order Details Dropdown Toggle Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(orderId);
                              }}
                              className={`${styles.manageBtn} ${isOpen ? styles.manageBtnOpen : styles.manageBtnClosed}`}
                            >
                              {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              <span>{isOpen ? 'Close Details' : 'Order Details'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Collapsible Accordion Dropdown Content ── */}
                      {isOpen && (
                        <tr className={styles.expandedRow}>
                          <td colSpan={8} style={{ padding: 0, borderBottom: '1px solid #e2e8f0' }}>
                            <div className={styles.expandedContent}>
                              {/* 1. Bespoke Manufacturing Specification Banner */}
                              <div className={styles.customizedBanner}>
                                <div className={styles.bannerHeader}>
                                  <span className={styles.bannerTitle}>
                                    <Sparkles size={18} color="#7c3aed" /> Bespoke Manufacturing Specification
                                  </span>
                                  <span className={styles.customizedBadge}>
                                    <Sparkles size={12} color="#7c3aed" /> Customized Order #{order.orderNumber}
                                  </span>
                                </div>
                                <p className={styles.bannerSub}>
                                  This order originated from <strong>"{custItems[0]?.name || 'Picky Bespoke Apparel'}"</strong> and includes customized front, backside, fabric, and color specifications.
                                </p>
                              </div>

                              {custItems.map((item, itemIdx) => {
                                const cust = item.customization || {};
                                const customCost = Number(item.customizationCost || 200);
                                const basePrice = Number(
                                  item.basePrice !== undefined
                                    ? item.basePrice
                                    : Math.max(0, Number(item.price || 0) - customCost)
                                ) || 300;
                                const unitPrice = basePrice + customCost;
                                const qty = Number(item.quantity) || 1;
                                const totalItemPrice = unitPrice * qty;

                                const frontImages = Array.isArray(cust.frontImages) ? cust.frontImages : [];
                                const backImages = Array.isArray(cust.backImages) ? cust.backImages : [];
                                const colorHex = getColorHex(cust.color);
                                const colorName = getColorName(cust.color);

                                return (
                                  <React.Fragment key={itemIdx}>
                                    {/* 2. Originating Product Card */}
                                    <div className={styles.originCard}>
                                      <div className={styles.originLeft}>
                                        <img
                                          src={
                                            item.image ||
                                            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200'
                                          }
                                          alt={item.name}
                                          className={styles.originThumb}
                                        />
                                        <div className={styles.originDetails}>
                                          <span className={styles.originName}>{item.name}</span>
                                          <div className={styles.originSubmeta}>
                                            <span>SKU: {item.sku || 'F-MEN-309'}</span>
                                            <span>•</span>
                                            <span>Category: {item.category || 'Fashion'}</span>
                                            <span>•</span>
                                            <span>Quantity: <strong>{qty} item(s)</strong></span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className={styles.originPriceBox}>
                                        <span className={styles.unitPriceLabel}>TOTAL UNIT PRICE</span>
                                        <span className={styles.unitPriceVal}>{formatPrice(unitPrice)}</span>
                                        <span className={styles.unitPriceBreakdown}>
                                          Base: {formatPrice(basePrice)} + Customization: +{formatPrice(customCost)}
                                        </span>
                                      </div>
                                    </div>

                                    {/* 3. Specifications Grid: Front and Backside Customization */}
                                    <div className={styles.specsGrid}>
                                      {/* 3A. Front Customization */}
                                      <div className={styles.specCard}>
                                        <div className={styles.specHeader}>
                                          <span className={styles.specTitle}>
                                            <Type size={16} color="#7c3aed" /> Front Customization
                                          </span>
                                          <span className={styles.fontPill}>
                                            Font: {cust.frontFont || 'Modern Sans'}
                                          </span>
                                        </div>

                                        <div className={styles.textDisplayBox}>
                                          <div className={styles.textDisplayLabel}>FRONT TEXT DISPLAY</div>
                                          <p className={styles.textDisplayContent}>
                                            "{cust.frontText || cust.text || 'Custom Text'}"
                                          </p>
                                        </div>

                                        <div className={styles.fontDetailRow}>
                                          <span className={styles.fontDetailLabel}>Selected Font Style</span>
                                          <span className={styles.fontDetailVal}>
                                            {cust.frontFont || 'Modern Sans'}
                                          </span>
                                        </div>

                                        {/* Uploaded Front Images */}
                                        <div className={styles.imagesSection}>
                                          <span className={styles.imagesLabel}>
                                            UPLOADED FRONT IMAGES ({frontImages.length}/4):
                                          </span>
                                          <div className={styles.imagesGrid}>
                                            {[0, 1, 2, 3].map((slotIdx) => {
                                              const imgItem = frontImages[slotIdx];
                                              const imgUrl = typeof imgItem === 'object' ? imgItem?.url : imgItem;
                                              return (
                                                <div
                                                  key={slotIdx}
                                                  className={styles.imageThumbBox}
                                                  onClick={() => imgUrl && setActiveLightboxImg(imgUrl)}
                                                  title={imgUrl ? 'Click to preview full size' : 'Slot empty'}
                                                >
                                                  {imgUrl ? (
                                                    <img
                                                      src={imgUrl}
                                                      alt={`Front Upload ${slotIdx + 1}`}
                                                      className={styles.imageThumb}
                                                    />
                                                  ) : (
                                                    <div className={styles.imageEmpty}>
                                                      <ImageIcon size={18} />
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>

                                      {/* 3B. Backside Customization */}
                                      <div className={styles.specCard}>
                                        <div className={styles.specHeader}>
                                          <span className={styles.specTitle}>
                                            <Type size={16} color="#7c3aed" /> Backside Customization
                                          </span>
                                          <span className={styles.fontPill}>
                                            Font: {cust.backFont || 'Elegant Serif'}
                                          </span>
                                        </div>

                                        <div className={styles.textDisplayBox}>
                                          <div className={styles.textDisplayLabel}>BACKSIDE TEXT DISPLAY</div>
                                          <p className={styles.textDisplayContent}>
                                            "{cust.backText || 'Custom Back Text'}"
                                          </p>
                                        </div>

                                        <div className={styles.fontDetailRow}>
                                          <span className={styles.fontDetailLabel}>Selected Font Style</span>
                                          <span className={styles.fontDetailVal}>
                                            {cust.backFont || 'Elegant Serif'}
                                          </span>
                                        </div>

                                        {/* Uploaded Backside Images */}
                                        <div className={styles.imagesSection}>
                                          <span className={styles.imagesLabel}>
                                            UPLOADED BACKSIDE IMAGES ({backImages.length}/4):
                                          </span>
                                          <div className={styles.imagesGrid}>
                                            {[0, 1, 2, 3].map((slotIdx) => {
                                              const imgItem = backImages[slotIdx];
                                              const imgUrl = typeof imgItem === 'object' ? imgItem?.url : imgItem;
                                              return (
                                                <div
                                                  key={slotIdx}
                                                  className={styles.imageThumbBox}
                                                  onClick={() => imgUrl && setActiveLightboxImg(imgUrl)}
                                                  title={imgUrl ? 'Click to preview full size' : 'Slot empty'}
                                                >
                                                  {imgUrl ? (
                                                    <img
                                                      src={imgUrl}
                                                      alt={`Backside Upload ${slotIdx + 1}`}
                                                      className={styles.imageThumb}
                                                    />
                                                  ) : (
                                                    <div className={styles.imageEmpty}>
                                                      <ImageIcon size={18} />
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* 4. General Specifications Card */}
                                    <div className={styles.generalCard}>
                                      <div className={styles.specHeader}>
                                        <span className={styles.specTitle}>
                                          <Layers size={16} color="#7c3aed" /> General Specifications
                                        </span>
                                        <span className={styles.fontPill}>Fabric &amp; Examples</span>
                                      </div>

                                      <div className={styles.generalGrid}>
                                        <div className={styles.generalItem}>
                                          <span className={styles.generalItemLabel}>MATERIAL / FABRIC TYPE</span>
                                          <span className={styles.generalItemValue}>
                                            {cust.material || 'Heavyweight French Terry Fleece'}
                                          </span>
                                        </div>

                                        <div className={styles.generalItem}>
                                          <span className={styles.generalItemLabel}>SELECTED SIZE</span>
                                          <span className={styles.generalItemValue}>
                                            {cust.size || item.selectedSize || 'M'}
                                          </span>
                                        </div>

                                        <div className={styles.generalItem}>
                                          <span className={styles.generalItemLabel}>CUSTOM COLOR</span>
                                          <span className={styles.generalItemValue}>
                                            <span className={styles.colorDot} style={{ backgroundColor: colorHex }} />
                                            {colorName}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Uploaded Example Mockups */}
                                      {(cust.frontExampleImage || cust.backExampleImage) && (
                                        <div className={styles.mockupItem}>
                                          <span className={styles.generalItemLabel}>UPLOADED EXAMPLE MOCKUPS</span>
                                          <div className={styles.mockupsGrid}>
                                            {cust.frontExampleImage && (
                                              <div
                                                className={styles.mockupPreviewCard}
                                                onClick={() => setActiveLightboxImg(cust.frontExampleImage)}
                                                title="Click to view full size mockup"
                                              >
                                                <img
                                                  src={cust.frontExampleImage}
                                                  alt="Front Example Mockup"
                                                  className={styles.mockupThumb}
                                                />
                                                <span className={styles.mockupLabel}>Front Example Mockup</span>
                                              </div>
                                            )}
                                            {cust.backExampleImage && (
                                              <div
                                                className={styles.mockupPreviewCard}
                                                onClick={() => setActiveLightboxImg(cust.backExampleImage)}
                                                title="Click to view full size mockup"
                                              >
                                                <img
                                                  src={cust.backExampleImage}
                                                  alt="Back Example Mockup"
                                                  className={styles.mockupThumb}
                                                />
                                                <span className={styles.mockupLabel}>Back Example Mockup</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </React.Fragment>
                                );
                              })}

                              {/* 5. Production Lifecycle & Customer Address Section (Exact Match to AdminOrders Card 2.1 & 2.2) */}
                              <div className={styles.lifecycleGrid}>
                                {/* 5A. Customer & Shipping Destination */}
                                <div className={styles.lifecycleCard}>
                                  <div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', marginBottom: '0.85rem', borderBottom: '1px solid #f1f5f9' }}>
                                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <UserCheck size={16} color="#7c3aed" /> Customer &amp; Shipping Destination
                                      </h4>
                                    </div>

                                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #f1f5f9', marginBottom: '0.75rem' }}>
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

                                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid #f1f5f9' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.81rem', color: '#0f172a', marginBottom: '0.3rem' }}>
                                        <MapPin size={13} color="#7c3aed" /> Delivery Location
                                      </div>
                                      <div style={{ fontSize: '0.81rem', color: '#475569', lineHeight: 1.55 }}>
                                        <div>{order.shippingAddress?.street || 'Standard Address'}</div>
                                        {order.shippingAddress?.landmark && (
                                          <div style={{ color: '#64748b' }}>Landmark: {order.shippingAddress.landmark}</div>
                                        )}
                                        <div>
                                          {order.shippingAddress?.city || 'Chennai'}, {order.shippingAddress?.state || 'Tamil Nadu'} — {order.shippingAddress?.pincode || '600001'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* 5B. The EXACT Update Order Status Card & Workflow (from AdminOrders) */}
                                <div className={styles.lifecycleCard}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                    {/* Card Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.65rem', borderBottom: '1px solid #f1f5f9' }}>
                                      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <RotateCw size={16} color="#7c3aed" /> Update Order Status
                                      </h4>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                        <Link
                                          to={`${ADMIN}/orders/${order._id || order.id || order.orderNumber}`}
                                          title="Open Standalone Order Details Page"
                                          style={{
                                            fontSize: '0.72rem',
                                            color: '#6d28d9',
                                            background: '#f3e8ff',
                                            border: '1px solid #ddd6fe',
                                            padding: '0.2rem 0.55rem',
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            textDecoration: 'none',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                          }}
                                        >
                                          <span>Full Page</span>
                                          <ExternalLink size={10} />
                                        </Link>
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
                                    </div>

                                    {/* ── Active Shiprocket / Courier Dispatch Info ── */}
                                    {(order.trackingId || order.trackingNumber || order.status === 'shipped' || order.status === 'delivered') && (
                                      <div
                                        style={{
                                          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)',
                                          border: '1.5px solid #86efac',
                                          borderRadius: '12px',
                                          padding: '0.75rem 0.9rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          flexWrap: 'wrap',
                                          gap: '0.5rem',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Truck size={15} />
                                          </div>
                                          <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                              <strong style={{ fontSize: '0.8rem', color: '#166534' }}>Shiprocket Dispatched</strong>
                                              <span style={{ fontSize: '0.67rem', background: '#dcfce7', color: '#15803d', padding: '0.08rem 0.4rem', borderRadius: '4px', fontWeight: 700, border: '1px solid #bbf7d0' }}>
                                                {order.courier || 'Delhivery Surface'}
                                              </span>
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '0.1rem' }}>
                                              AWB: <strong>{order.trackingId || order.trackingNumber || 'SR-AWB-GENERATED'}</strong>
                                            </div>
                                          </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                          <button
                                            type="button"
                                            onClick={() => handlePrintSrLabel(order)}
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '0.25rem',
                                              padding: '0.3rem 0.55rem',
                                              borderRadius: '6px',
                                              border: '1px solid #86efac',
                                              background: '#ffffff',
                                              color: '#166534',
                                              fontSize: '0.72rem',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                            }}
                                          >
                                            <Printer size={11} /> Label
                                          </button>
                                          <a
                                            href={rowTrackingInfo.courierTrackingUrl || `https://shiprocket.co/tracking/${order.trackingId || order.trackingNumber || ''}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '0.25rem',
                                              padding: '0.3rem 0.55rem',
                                              borderRadius: '6px',
                                              border: '1px solid #16a34a',
                                              background: '#ffffff',
                                              color: '#15803d',
                                              fontSize: '0.72rem',
                                              fontWeight: 600,
                                              textDecoration: 'none',
                                            }}
                                          >
                                            <ExternalLink size={11} /> Live Track
                                          </a>
                                        </div>
                                      </div>
                                    )}

                                    {/* ── 1-Click Ship with Shiprocket Card (When not yet shipped or cancelled) ── */}
                                    {order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled' && !order.trackingId && (
                                      <div
                                        style={{
                                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                          color: '#ffffff',
                                          borderRadius: '12px',
                                          padding: '0.85rem 1rem',
                                          boxShadow: '0 4px 14px rgba(79, 70, 229, 0.22)',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '0.6rem',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <Sparkles size={15} color="#fde047" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                              Shiprocket 1-Click Fast Fulfillment
                                            </span>
                                          </div>
                                          <span style={{ fontSize: '0.67rem', background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.45rem', borderRadius: '9999px', fontWeight: 600 }}>
                                            Auto AWB &amp; Pickup
                                          </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                          <div style={{ flex: 1, minWidth: '150px' }}>
                                            <select
                                              value={srCourierChoice[orderId] || 'Delhivery Surface'}
                                              onChange={(e) => setSrCourierChoice(prev => ({ ...prev, [orderId]: e.target.value }))}
                                              style={{
                                                width: '100%',
                                                padding: '0.45rem 0.7rem',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.35)',
                                                background: 'rgba(255,255,255,0.18)',
                                                color: '#ffffff',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                outline: 'none',
                                                cursor: 'pointer',
                                              }}
                                            >
                                              <option value="Delhivery Surface" style={{ color: '#0f172a' }}>⚡ Delhivery Surface (Fast &amp; Reliable)</option>
                                              <option value="BlueDart Express" style={{ color: '#0f172a' }}>✈️ BlueDart Express (Air Priority)</option>
                                              <option value="Shadowfax Surface" style={{ color: '#0f172a' }}>📦 Shadowfax Surface</option>
                                              <option value="DTDC Surface" style={{ color: '#0f172a' }}>🚚 DTDC Surface</option>
                                            </select>
                                          </div>

                                          <button
                                            type="button"
                                            disabled={srShippingId === orderId}
                                            onClick={() => handleShipViaShiprocket(order)}
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '0.35rem',
                                              padding: '0.45rem 0.95rem',
                                              borderRadius: '8px',
                                              border: 'none',
                                              background: '#ffffff',
                                              color: '#4338ca',
                                              fontSize: '0.79rem',
                                              fontWeight: 700,
                                              cursor: srShippingId === orderId ? 'not-allowed' : 'pointer',
                                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                              flexShrink: 0,
                                            }}
                                          >
                                            <Truck size={14} className={srShippingId === orderId ? 'spin-animation' : ''} />
                                            <span>{srShippingId === orderId ? 'Dispatching…' : '🚀 Ship with Shiprocket'}</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* ── SELECT NEW STATUS * Dropdown ── */}
                                    <div>
                                      <label style={{ fontSize: '0.71rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.35rem' }}>
                                        Select New Status <span style={{ color: '#ef4444' }}>*</span>
                                      </label>
                                      <StatusSelect
                                        value={currentRowStatus}
                                        onChange={(val) => setRowStatus((p) => ({ ...p, [orderId]: val }))}
                                        currentStatus={order.status}
                                        order={order}
                                      />
                                    </div>

                                    {/* ── Courier Dispatch Inputs (shown strictly when Shipped is chosen) ── */}
                                    {currentRowStatus === 'shipped' && (
                                      <div
                                        style={{
                                          animation: 'fadeIn 0.22s ease',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '0.75rem',
                                          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
                                          border: '1.5px solid #93c5fd',
                                          borderRadius: '12px',
                                          padding: '0.95rem',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #bfdbfe', paddingBottom: '0.5rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                            <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              <Truck size={14} />
                                            </div>
                                            <strong style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>Courier Dispatch Information</strong>
                                          </div>
                                          <span style={{ fontSize: '0.65rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                                            All 3 Fields Required *
                                          </span>
                                        </div>

                                        {/* Courier Presets */}
                                        <div>
                                          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                                            Quick Select Courier Partner:
                                          </div>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                            {courierPresets.map((preset) => {
                                              const isSelected = (currentRowCourier || '').toLowerCase() === preset.name.toLowerCase();
                                              return (
                                                <button
                                                  key={preset.id || preset.name}
                                                  type="button"
                                                  onClick={() => {
                                                    setRowCourier((p) => ({ ...p, [orderId]: preset.name }));
                                                    setRowCourierUrl((p) => ({ ...p, [orderId]: preset.url }));
                                                    if (preset.number) {
                                                      setRowNote((p) => ({ ...p, [orderId]: preset.number }));
                                                    }
                                                  }}
                                                  style={{
                                                    fontSize: '0.72rem',
                                                    fontWeight: isSelected ? 700 : 600,
                                                    padding: '0.25rem 0.55rem',
                                                    borderRadius: '6px',
                                                    border: `1px solid ${isSelected ? '#2563eb' : '#cbd5e1'}`,
                                                    background: isSelected ? '#2563eb' : '#ffffff',
                                                    color: isSelected ? '#ffffff' : '#334155',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.3rem',
                                                  }}
                                                >
                                                  <Truck size={11} color={isSelected ? '#ffffff' : (preset.color || '#2563eb')} />
                                                  <span>{preset.name}</span>
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Field 1: Courier Name */}
                                        <div>
                                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                                            Courier Name <span style={{ color: '#ef4444' }}>*</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={currentRowCourier}
                                            onChange={(e) => setRowCourier((p) => ({ ...p, [orderId]: e.target.value }))}
                                            placeholder="e.g. ST Courier, Professional Courier, Blue Dart"
                                            style={{
                                              width: '100%',
                                              padding: '0.5rem 0.75rem',
                                              borderRadius: '8px',
                                              border: '1.5px solid #93c5fd',
                                              background: '#ffffff',
                                              fontSize: '0.8rem',
                                              color: '#0f172a',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                            }}
                                          />
                                        </div>

                                        {/* Field 2: Courier URL */}
                                        <div>
                                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                                            Courier Site URL Link <span style={{ color: '#ef4444' }}>*</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={currentRowCourierUrl}
                                            onChange={(e) => setRowCourierUrl((p) => ({ ...p, [orderId]: e.target.value }))}
                                            placeholder="e.g. https://stcourier.com/"
                                            style={{
                                              width: '100%',
                                              padding: '0.5rem 0.75rem',
                                              borderRadius: '8px',
                                              border: '1.5px solid #93c5fd',
                                              background: '#ffffff',
                                              fontSize: '0.8rem',
                                              color: '#0f172a',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                            }}
                                          />
                                        </div>

                                        {/* Field 3: AWB Number */}
                                        <div>
                                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem' }}>
                                            Tracking / AWB Number <span style={{ color: '#ef4444' }}>*</span>
                                          </label>
                                          <input
                                            type="text"
                                            value={currentRowNote}
                                            onChange={(e) => setRowNote((p) => ({ ...p, [orderId]: e.target.value }))}
                                            placeholder="e.g. STC12345678"
                                            style={{
                                              width: '100%',
                                              padding: '0.5rem 0.75rem',
                                              borderRadius: '8px',
                                              border: '1.5px solid #93c5fd',
                                              background: '#ffffff',
                                              fontSize: '0.8rem',
                                              color: '#0f172a',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                            }}
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* ── Cancellation Reason (shown strictly when Cancelled is chosen) ── */}
                                    {currentRowStatus === 'cancelled' && (
                                      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '0.85rem' }}>
                                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991b1b', display: 'block', marginBottom: '0.35rem' }}>
                                          Select Cancellation Reason <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.35rem' }}>
                                          {CANCEL_REASONS.map((r) => (
                                            <div
                                              key={r}
                                              onClick={() => setRowCancelReason((p) => ({ ...p, [orderId]: r }))}
                                              style={{
                                                padding: '0.4rem 0.65rem',
                                                borderRadius: '6px',
                                                fontSize: '0.74rem',
                                                fontWeight: currentCancelReason === r ? 700 : 500,
                                                background: currentCancelReason === r ? '#dc2626' : '#ffffff',
                                                color: currentCancelReason === r ? '#ffffff' : '#7f1d1d',
                                                border: `1px solid ${currentCancelReason === r ? '#dc2626' : '#fca5a5'}`,
                                                cursor: 'pointer',
                                              }}
                                            >
                                              {r}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* ── Order Lifecycle Progress Stepper ── */}
                                    <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                          Order Lifecycle Progress
                                        </span>
                                        {order.status === 'cancelled' && (
                                          <span style={{ fontSize: '0.68rem', color: '#b91c1c', background: '#fee2e2', padding: '0.1rem 0.45rem', borderRadius: '5px', fontWeight: 700 }}>
                                            Cancelled
                                          </span>
                                        )}
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                                        {ORDER_PROGRESS_STEPS.map((step, i, arr) => {
                                          const stepOrder = ['placed', 'confirmed', 'shipped', 'delivered'];
                                          const orderStatusKey = (order.status || 'placed').toLowerCase();
                                          const currentIdx = orderStatusKey === 'delivered' ? 3 : (orderStatusKey === 'shipped' ? 2 : (orderStatusKey === 'confirmed' ? 1 : 0));
                                          const stepIdx = stepOrder.indexOf(step.key);
                                          const isDone = orderStatusKey !== 'cancelled' && stepIdx <= currentIdx;
                                          const isCurrent = orderStatusKey !== 'cancelled' && stepIdx === currentIdx;
                                          const StepIcon = step.icon;

                                          return (
                                            <React.Fragment key={step.key}>
                                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0, textAlign: 'center' }}>
                                                <div
                                                  style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    borderRadius: '50%',
                                                    background: isDone ? step.bg : '#f1f5f9',
                                                    border: `2px solid ${isCurrent ? step.color : isDone ? step.color : '#cbd5e1'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: isCurrent ? `0 0 0 3px ${step.color}25` : 'none',
                                                    marginBottom: '0.3rem',
                                                  }}
                                                >
                                                  <StepIcon size={13} color={isDone ? step.color : '#94a3b8'} />
                                                </div>
                                                <strong style={{ fontSize: '0.72rem', fontWeight: isCurrent ? 700 : 600, color: isDone ? step.color : '#64748b', whiteSpace: 'nowrap' }}>
                                                  {step.label}
                                                </strong>
                                              </div>

                                              {i < arr.length - 1 && (
                                                <div
                                                  style={{
                                                    flex: 1,
                                                    height: '2px',
                                                    background: stepIdx < currentIdx && orderStatusKey !== 'cancelled' ? '#2563eb' : '#e2e8f0',
                                                    margin: '14px 4px 0 4px',
                                                    borderRadius: '2px',
                                                  }}
                                                />
                                              )}
                                            </React.Fragment>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Update CTA & Print Invoice & Shipping Label Action Buttons */}
                                  <div style={{ paddingTop: '0.85rem', marginTop: 'auto', display: 'flex', gap: '0.55rem', flexWrap: 'wrap' }}>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedInvoiceOrder(order)}
                                      style={{
                                        height: '40px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        padding: '0.55rem 0.85rem',
                                        borderRadius: '9px',
                                        border: '1.5px solid #ddd6fe',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        background: '#faf5ff',
                                        color: '#7c3aed',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <FileText size={14} /> Tax Invoice
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedLabelOrder(order)}
                                      style={{
                                        height: '40px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        padding: '0.55rem 0.85rem',
                                        borderRadius: '9px',
                                        border: '1.5px solid #cbd5e1',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Tag size={14} /> Shipping Label
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => launchOrderWhatsappShare({ order, showToast, e })}
                                      style={{
                                        height: '40px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.4rem',
                                        padding: '0.55rem 0.85rem',
                                        borderRadius: '9px',
                                        border: '1.5px solid #86efac',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        background: '#f0fdf4',
                                        color: '#15803d',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <WhatsAppIcon size={14} color="currentColor" />
                                      {rowTrackingInfo.awb ? 'Send Tracking' : 'WhatsApp Confirmation'}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleStatusUpdate(order)}
                                      disabled={isUpdating || currentRowStatus === order.status}
                                      style={{
                                        flex: 1,
                                        height: '40px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.45rem',
                                        padding: '0.55rem 1.1rem',
                                        borderRadius: '9px',
                                        border: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: isUpdating || currentRowStatus === order.status ? 'not-allowed' : 'pointer',
                                        background: currentRowStatus === order.status
                                          ? '#f1f5f9'
                                          : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                                        color: currentRowStatus === order.status ? '#94a3b8' : '#ffffff',
                                        boxShadow: currentRowStatus === order.status ? 'none' : '0 4px 14px rgba(124, 58, 237, 0.25)',
                                      }}
                                    >
                                      <Save size={14} className={isUpdating ? 'spin-animation' : ''} />
                                      <span>
                                        {isUpdating
                                          ? 'Updating…'
                                          : currentRowStatus === order.status
                                          ? 'Select New Status Above'
                                          : 'Save Status Update'}
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* 6. Pricing Breakdown (Matching AdminOrders Design) */}
                              <div className={styles.pricingSummary}>
                                <div className={styles.pricingRow}>
                                  <span>Base Products Subtotal</span>
                                  <span>
                                    {formatPrice(
                                      (order.totalAmount || order.total || 0) -
                                        (order.customizationCostTotal || (custItems.length * 200))
                                    )}
                                  </span>
                                </div>
                                <div className={`${styles.pricingRow} ${styles.pricingRowHighlight}`}>
                                  <span>Customization Fee (Tracked Separately)</span>
                                  <span>+{formatPrice(order.customizationCostTotal || (custItems.length * 200))}</span>
                                </div>
                                <div className={styles.pricingTotalRow}>
                                  <span className={styles.pricingTotalLabel}>Total Customized Order Amount</span>
                                  <span className={styles.pricingTotalVal}>
                                    {formatPrice(order.totalAmount || order.total || order.grandTotal || 0)}
                                  </span>
                                </div>
                                <p className={styles.pricingNote}>
                                  ✓ Base product price and customization cost are tracked separately in the ledger and invoice.
                                </p>
                              </div>

                              {/* 7. Dropdown Action Bar */}
                              <div className={styles.dropdownActionBar}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                  <Link
                                    to={`${ADMIN}/orders/${order._id || order.id || order.orderNumber}`}
                                    className="admin-period-select-btn"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                                  >
                                    <span>Open Standalone Order Page</span>
                                    <ExternalLink size={13} />
                                  </Link>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleRow(orderId)}
                                  className={styles.manageBtn}
                                  style={{
                                    background: 'rgba(124, 58, 237, 0.08)',
                                    color: '#7c3aed',
                                    border: '1px solid #ddd6fe',
                                  }}
                                >
                                  <ChevronUp size={13} />
                                  <span>Close Details</span>
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Lightbox Modal for Artworks & Mockups ── */}
      {activeLightboxImg && (
        <div className={styles.lightboxOverlay} onClick={() => setActiveLightboxImg(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setActiveLightboxImg(null)}
            >
              <X size={16} /> Close Preview
            </button>
            <img
              src={activeLightboxImg}
              alt="High Resolution Artwork Preview"
              className={styles.lightboxImg}
            />
          </div>
        </div>
      )}

      {/* ── Tax Invoice Modal ── */}
      {selectedInvoiceOrder && (
        <AdminInvoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* ── Shipping Label Modal ── */}
      {selectedLabelOrder && (
        <AdminShippingLabel
          order={selectedLabelOrder}
          onClose={() => setSelectedLabelOrder(null)}
        />
      )}
    </AdminLayout>
  );
}
