import { useSearchParams } from 'react-router-dom';
import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Trash2,
  Gift,
  Tag,
  Globe,
  Barcode,
  Plus,
  Pencil,
  Settings,
  ExternalLink,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminInvoice from '../../../components/admin/AdminInvoice';
import AdminShippingLabel from '../../../components/admin/AdminShippingLabel';
import AdminGiftCard from '../../../components/admin/AdminGiftCard';
import AdminStatCard from '../../../components/common/AdminStatCard';
import { adminService } from '../../../services/admin.service';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import { useOrderStore } from '../../../store/orderStore';
import { useUiStore } from '../../../store/uiStore';

// ─── Order Status & Filter Configurations ────────────────────────────────────
export const STATUS_TABS = [
  { key: 'all',       label: 'All Orders',      icon: ShoppingBag,   color: '#7c3aed' },
  { key: 'placed',    label: 'Order Placed',    icon: ShoppingBag,   color: '#7c3aed' },
  { key: 'confirmed', label: 'Confirmed',       icon: CheckCircle2,  color: '#d97706' },
  { key: 'shipped',   label: 'Shipped',         icon: Truck,         color: '#2563eb' },
  { key: 'delivered', label: 'Delivered',       icon: PackageCheck,  color: '#16a34a' },
  { key: 'cancelled', label: 'Cancelled Order', icon: XCircle,       color: '#dc2626' },
];

export const STATUS_CFG = {
  placed:    { cls: 'adm-status-processing', label: 'Order Placed', desc: 'Customer order place செய்துவிட்டார்.', icon: ShoppingBag,   bg: '#f5f3ff', color: '#6d28d9' },
  confirmed: { cls: 'adm-status-processing', label: 'Confirmed',    desc: 'Admin order-ஐ confirm செய்துவிட்டார்.', icon: CheckCircle2,  bg: '#fffbeb', color: '#b45309' },
  packing:   { cls: 'adm-status-processing', label: 'Packing',      desc: 'Packing in warehouse',                  icon: Package,       bg: '#f3e8ff', color: '#7c3aed' },
  shipped:   { cls: 'adm-status-shipped',    label: 'Shipped',      desc: 'Order courier-க்கு அனுப்பப்பட்டுவிட்டது.',  icon: Truck,         bg: '#eff6ff', color: '#1d4ed8' },
  delivered: { cls: 'adm-status-delivered',  label: 'Delivered',    desc: 'Customer-க்கு order கிடைத்துவிட்டது.',    icon: PackageCheck,  bg: '#f0fdf4', color: '#15803d' },
  cancelled: { cls: 'adm-status-cancelled',  label: 'Cancelled',    desc: 'Order cancel செய்யப்பட்டது.',             icon: XCircle,       bg: '#fef2f2', color: '#b91c1c' },
};

export const CANCEL_REASONS = [
  'Out of Stock',
  'Customer Requested Cancellation',
  'Payment Failure / Not Received',
  'Incorrect Order Details',
  'Courier / Logistics Issue',
  'Other',
];

export const STATUS_OPTIONS = [
  { value: 'placed',    label: 'Order Placed', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'confirmed', label: 'Confirmed',    icon: CheckCircle2,  color: '#b45309', bg: '#fffbeb' },
  { value: 'shipped',   label: 'Shipped',      icon: Truck,         color: '#1d4ed8', bg: '#eff6ff' },
  { value: 'delivered', label: 'Delivered',    icon: PackageCheck,  color: '#15803d', bg: '#f0fdf4' },
  { value: 'cancelled', label: 'Cancelled',    icon: XCircle,       color: '#b91c1c', bg: '#fef2f2' },
];

export const ORDER_PROGRESS_STEPS = [
  { key: 'placed',    label: 'Order Placed', desc: 'Customer order place செய்துவிட்டார்.', icon: ShoppingBag,   color: '#7c3aed', bg: '#f5f3ff' },
  { key: 'confirmed', label: 'Confirmed',    desc: 'Admin order-ஐ confirm செய்துவிட்டார்.', icon: CheckCircle2,  color: '#d97706', bg: '#fffbeb' },
  { key: 'shipped',   label: 'Shipped',      desc: 'Order courier-க்கு அனுப்பப்பட்டுவிட்டது.',  icon: Truck,         color: '#2563eb', bg: '#eff6ff' },
  { key: 'delivered', label: 'Delivered',    desc: 'Customer-க்கு order கிடைத்துவிட்டது.',    icon: PackageCheck,  color: '#16a34a', bg: '#f0fdf4' },
];

export const DATE_FILTER_OPTIONS = [
  { value: 'all',        label: 'All Dates' },
  { value: 'today',      label: 'Today' },
  { value: 'yesterday',  label: 'Yesterday' },
  { value: '7days',      label: 'Last 7 Days' },
  { value: '30days',     label: 'Last 30 Days' },
  { value: 'this_month', label: 'This Month' },
];

export const PRICE_FILTER_OPTIONS = [
  { value: 'all',        label: 'All Prices' },
  { value: 'under1000',  label: 'Under ₹1,000' },
  { value: '1000to2500', label: '₹1,000 – ₹2,500' },
  { value: '2500to5000', label: '₹2,500 – ₹5,000' },
  { value: 'above5000',  label: 'Above ₹5,000' },
];

export const QUANTITY_FILTER_OPTIONS = [
  { value: 'all',   label: 'All Quantities' },
  { value: '1',     label: '1 Item' },
  { value: '2to3',  label: '2 – 3 Items' },
  { value: '4plus', label: '4+ Items' },
];

export const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'oldest',      label: 'Oldest First' },
  { value: 'amount_high', label: 'Price: High to Low' },
  { value: 'amount_low',  label: 'Price: Low to High' },
];

// ─── Default Logistics & Courier Partners Quick Fill Presets ─────────────────
const INITIAL_COURIER_PRESETS = [
  { id: 'st_courier', name: 'ST Courier', url: 'https://stcourier.com/', number: 'STC-', color: '#dc2626' },
  { id: 'prof_courier', name: 'Professional Courier', url: 'https://www.tpcindia.com/', number: 'TPC-', color: '#ea580c' },
  { id: 'bluedart', name: 'Blue Dart', url: 'https://www.bluedart.com/', number: 'BD-', color: '#2563eb' },
  { id: 'dtdc', name: 'DTDC', url: 'https://www.dtdc.in/', number: 'DTDC-', color: '#b91c1c' },
  { id: 'delhivery', name: 'Delhivery', url: 'https://www.delhivery.com/', number: 'DEL-', color: '#0f172a' },
  { id: 'speedpost', name: 'Speed Post', url: 'https://www.indiapost.gov.in/', number: 'SP-', color: '#d97706' },
];

// ─── Format status date and time ───────────────────────────────────────────
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

  // 1. Check explicit statusHistory first (latest occurrence for this status)
  const historyList = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const found = historyList.slice().reverse().find((h) => (h.status || '').toLowerCase() === targetKey);

  if (found?.timestamp) {
    return { isDone: true, timestamp: found.timestamp };
  }

  // 2. Lifecycle sequence logic:
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

  // If status is current or in completed sequence
  if (targetIdx !== -1 && targetIdx <= currentIdx) {
    const ts = targetIdx === currentIdx ? (order.updatedAt || order.createdAt) : order.createdAt;
    return { isDone: true, timestamp: ts };
  }

  return { isDone: false, timestamp: null };
}

// ─── Custom Status Select Dropdown (All options visible, Green Tick on updated, Date & Time beside status) ───
function StatusSelect({ value, onChange, currentStatus, order }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ALL status options remain visible (never invisible)
  const availableOptions = STATUS_OPTIONS;

  const selected = availableOptions.find((o) => o.value === value) || availableOptions[0] || STATUS_OPTIONS[0];
  const SelIcon = selected.icon;
  const currentSelectedInfo = getStatusUpdateInfo(selected.value, order);
  const formattedSelectedTime = currentSelectedInfo.timestamp ? formatStatusDateTime(currentSelectedInfo.timestamp) : '';

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
        title="Select New Status"
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
          <span style={{ width: '26px', height: '26px', borderRadius: '7px', background: selected.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SelIcon size={13} color={selected.color} />
          </span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{selected.label}</span>
          {formattedSelectedTime && (
            <span style={{
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
            }}>
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
          <ChevronDown size={14} color="#94a3b8" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }} />
        </div>
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
          boxShadow: '0 10px 32px rgba(0,0,0,0.12)',
          zIndex: 200,
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease',
          padding: '0.35rem',
        }}>
          {availableOptions.map((opt) => {
            const OptIcon = opt.icon;
            const isSelected = opt.value === value;
            const { isDone, timestamp } = getStatusUpdateInfo(opt.value, order);
            const formattedTime = timestamp ? formatStatusDateTime(timestamp) : '';

            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
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
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '8px', background: opt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <OptIcon size={14} color={opt.color} />
                  </span>
                  <span style={{ fontSize: '0.86rem', fontWeight: isSelected ? 700 : 600, color: isSelected ? '#6d28d9' : '#0f172a' }}>
                    {opt.label}
                  </span>
                  {/* Date & Time beside the status */}
                  {isDone && formattedTime && (
                    <span style={{
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
                    }}>
                      <Clock size={10} color="#16a34a" />
                      {formattedTime}
                    </span>
                  )}
                </div>

                {/* Right side Green Tick */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, marginLeft: '0.5rem' }}>
                  {isDone ? (
                    <span
                      title={`Updated on ${formattedTime || 'done'}`}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#dcfce7',
                        border: '1.5px solid #86efac',
                        color: '#16a34a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : isSelected ? (
                    <CheckCircle2 size={16} color="#7c3aed" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { orders: storeOrders, updateOrderStatus: storeUpdateStatus, updateOrder, deleteOrder: storeDeleteOrder } = useOrderStore();
  const { showToast } = useUiStore();

  // ─── Delete Order State ───────────────────────────────────────────────────
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Multi-Select & Bulk Actions State ───────────────────────────────────
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('shipped');
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // ─── Shipped Dispatch Modal State ─────────────────────────────────────────
  const [orderToShip, setOrderToShip] = useState(null);
  const [isSubmittingShip, setIsSubmittingShip] = useState(false);
  const [shipModalCourier, setShipModalCourier] = useState('');
  const [shipModalCourierUrl, setShipModalCourierUrl] = useState('');
  const [shipModalAwb, setShipModalAwb] = useState('');
  const [isBulkShipModal, setIsBulkShipModal] = useState(false);

  // ─── Print Tax Invoice & Shipping Label Preview State ─────────────────────
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [selectedLabelOrder, setSelectedLabelOrder] = useState(null);
  const [selectedGiftCardOrder, setSelectedGiftCardOrder] = useState(null);

  // ─── Dynamic Courier Partners Presets (Saved to localStorage) ─────────────
  const [courierPresets, setCourierPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('picky_admin_courier_presets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load courier presets', e);
    }
    return INITIAL_COURIER_PRESETS;
  });

  const saveCourierPresets = (newPresets) => {
    setCourierPresets(newPresets);
    try {
      localStorage.setItem('picky_admin_courier_presets', JSON.stringify(newPresets));
    } catch (e) {
      console.error('Failed to save courier presets', e);
    }
  };

  // Courier Partner Modal Management (Add / Edit / List)
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState(null);
  const [courierFormName, setCourierFormName] = useState('');
  const [courierFormUrl, setCourierFormUrl] = useState('');
  const [courierFormNumber, setCourierFormNumber] = useState('');
  const [courierFormColor, setCourierFormColor] = useState('#2563eb');
  const [manageCouriersModalOpen, setManageCouriersModalOpen] = useState(false);

  const handleOpenAddCourier = () => {
    setEditingCourier(null);
    setCourierFormName('');
    setCourierFormUrl('');
    setCourierFormNumber('');
    setCourierFormColor('#2563eb');
    setCourierModalOpen(true);
  };

  const handleOpenEditCourier = (preset, e) => {
    if (e) e.stopPropagation();
    setEditingCourier(preset);
    setCourierFormName(preset.name || '');
    setCourierFormUrl(preset.url || '');
    setCourierFormNumber(preset.number || '');
    setCourierFormColor(preset.color || '#2563eb');
    setCourierModalOpen(true);
  };

  const handleSaveCourierPartner = (e) => {
    if (e) e.preventDefault();
    const cleanName = courierFormName.trim();
    const cleanUrl = courierFormUrl.trim();
    const cleanNumber = courierFormNumber.trim();

    if (!cleanName) {
      showToast('⚠️ Courier Name is required', 'error');
      return;
    }
    if (!cleanUrl) {
      showToast('⚠️ Courier Site URL Link is required', 'error');
      return;
    }

    if (editingCourier) {
      const updated = courierPresets.map((p) => {
        const match = p.id ? p.id === editingCourier.id : (p.name === editingCourier.name && p.url === editingCourier.url);
        if (match) {
          return {
            ...p,
            name: cleanName,
            url: cleanUrl,
            number: cleanNumber,
            color: courierFormColor || p.color || '#2563eb',
          };
        }
        return p;
      });
      saveCourierPresets(updated);
      showToast(`✓ Updated courier partner "${cleanName}"`, 'success');
    } else {
      const newPartner = {
        id: `courier_${Date.now()}`,
        name: cleanName,
        url: cleanUrl,
        number: cleanNumber,
        color: courierFormColor || '#2563eb',
      };
      saveCourierPresets([...courierPresets, newPartner]);
      showToast(`✓ Added new courier partner "${cleanName}"`, 'success');
    }
    setCourierModalOpen(false);
  };

  const handleDeleteCourierPartner = (presetId, presetName) => {
    const remaining = courierPresets.filter((p) => (p.id ? p.id !== presetId : p.name !== presetName));
    saveCourierPresets(remaining);
    showToast(`Deleted courier partner "${presetName}"`, 'success');
    if (editingCourier && (editingCourier.id === presetId || editingCourier.name === presetName)) {
      setCourierModalOpen(false);
    }
  };

  const handleResetCourierPresets = () => {
    saveCourierPresets(INITIAL_COURIER_PRESETS);
    showToast('Reset courier partners to defaults', 'success');
  };

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
  const [rowCourier, setRowCourier] = useState({});
  const [rowCourierUrl, setRowCourierUrl] = useState({});
  const [rowCancelReason, setRowCancelReason] = useState({});
  const [rowLoading, setRowLoading] = useState({});

  // ─── Pagination State ────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, dateFilter, priceFilter, quantityFilter, sortBy]);

  // ─── Sync Orders from Backend Database ─────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchDbOrders = async () => {
      try {
        const res = await adminService.getOrders({ limit: 100 });
        const dbOrders = res?.data?.data || res?.data;
        if (Array.isArray(dbOrders) && isMounted) {
          useOrderStore.getState().setOrders(dbOrders);
        }
      } catch (err) {
        console.warn('Backend orders fetch notice:', err?.message || err);
      }
    };
    fetchDbOrders();
    return () => { isMounted = false; };
  }, []);

  // ─── Dashboard Stats Calculations ────────────────────────────────────────
  const totalOrders = storeOrders.length;
  const confirmedCount = storeOrders.filter((o) => o.status === 'confirmed').length;
  const readyToDispatchCount = storeOrders.filter((o) => o.status === 'confirmed').length;
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
    const id = order._id || order.id;
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

      // Single atomic status & tracking update to backend database
      const res = await adminService.updateOrderStatus(id, {
        status: newStatus,
        note: fullNote,
        ...trackingPayload,
      });
      const updatedOrderData = res?.data?.data || res?.data;

      storeUpdateStatus(id, newStatus);
      updateOrder(id, {
        status: newStatus,
        ...trackingPayload,
        statusHistory: [
          ...(order.statusHistory || []),
          { status: newStatus, timestamp: new Date().toISOString(), note: fullNote },
        ],
      });
      setRowNote((p) => ({ ...p, [id]: '' }));
      setRowCourier((p) => ({ ...p, [id]: '' }));
      setRowCourierUrl((p) => ({ ...p, [id]: '' }));
      setRowCancelReason((p) => ({ ...p, [id]: '' }));
      setRowStatus((p) => { const n = { ...p }; delete n[id]; return n; });
      showToast(`✅ Order status updated to "${STATUS_CFG[newStatus]?.label || newStatus}"`, 'success');
    } catch {
      showToast('Status update failed', 'error');
    } finally {
      setRowLoading((p) => ({ ...p, [id]: false }));
    }
  };

  // ─── Handle Delete Order ──────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    const id = orderToDelete._id || orderToDelete.id;
    const orderNum = orderToDelete.orderNumber || id;

    setIsDeleting(true);
    try {
      await adminService.deleteOrder(id);
      if (storeDeleteOrder) {
        storeDeleteOrder(id);
      }
      if (expandedId === id) {
        setExpandedId(null);
      }
      showToast(`Order #${orderNum} deleted successfully`, 'success');
      setOrderToDelete(null);
    } catch (err) {
      console.error('Backend delete order error:', err);
      showToast(err?.response?.data?.message || err?.message || `Failed to delete Order #${orderNum}`, 'error');
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  // ─── Multi-Select Helpers & Bulk Action Handlers ──────────────────────────
  const pageOrderIds = useMemo(() => paginatedOrders.map((o) => o._id || o.id), [paginatedOrders]);
  const isAllCurrentPageSelected =
    pageOrderIds.length > 0 && pageOrderIds.every((id) => selectedOrderIds.includes(id));
  const isSomeCurrentPageSelected =
    pageOrderIds.some((id) => selectedOrderIds.includes(id)) && !isAllCurrentPageSelected;

  const handleSelectAllCurrentPage = (e) => {
    if (e) e.stopPropagation();
    if (isAllCurrentPageSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !pageOrderIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...pageOrderIds])));
    }
  };

  const toggleSelectOrder = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredOrders.map((o) => o._id || o.id);
    setSelectedOrderIds(allFilteredIds);
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const results = await Promise.allSettled(
        selectedOrderIds.map((id) =>
          adminService.updateOrderStatus(id, {
            status: bulkStatus,
            note: `Bulk status update to ${bulkStatus} by Admin`,
          })
        )
      );

      const successfulIds = [];
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          successfulIds.push(selectedOrderIds[idx]);
        }
      });

      if (successfulIds.length > 0) {
        successfulIds.forEach((id) => {
          storeUpdateStatus(id, bulkStatus);
          const found = storeOrders.find((o) => (o._id || o.id) === id);
          updateOrder(id, {
            status: bulkStatus,
            statusHistory: [
              ...(found?.statusHistory || []),
              {
                status: bulkStatus,
                timestamp: new Date().toISOString(),
                note: `Bulk status update by Admin`,
              },
            ],
          });
        });
        showToast(
          `✅ Successfully updated ${successfulIds.length} order(s) to "${STATUS_CFG[bulkStatus]?.label || bulkStatus}"`,
          'success'
        );
        setSelectedOrderIds([]);
      } else {
        showToast('Failed to update status for selected orders', 'error');
      }
    } catch (err) {
      console.error('Bulk status update error:', err);
      showToast('Failed to update status for selected orders', 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const results = await Promise.allSettled(
        selectedOrderIds.map((id) => adminService.deleteOrder(id))
      );

      const successfulIds = [];
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          successfulIds.push(selectedOrderIds[idx]);
        }
      });

      if (successfulIds.length > 0) {
        successfulIds.forEach((id) => {
          if (storeDeleteOrder) storeDeleteOrder(id);
        });
        showToast(`✅ Successfully deleted ${successfulIds.length} order(s)`, 'success');
        setSelectedOrderIds((prev) => prev.filter((id) => !successfulIds.includes(id)));
      } else {
        showToast('Failed to delete selected orders', 'error');
      }
      setShowBulkDeleteModal(false);
    } catch (err) {
      console.error('Bulk delete error:', err);
      showToast('Failed to delete selected orders', 'error');
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };

  // ─── Dispatch & Ship Modal Handlers ───────────────────────────────────────
  const handleOpenShipModal = (order, e) => {
    if (e) e.stopPropagation();
    setIsBulkShipModal(false);
    setOrderToShip(order);
    setShipModalCourier(order?.courier !== 'Standard Surface Delivery' ? (order?.courier || '') : '');
    setShipModalCourierUrl(order?.courierUrl || '');
    setShipModalAwb(order?.trackingId || '');
  };

  const handleOpenBulkShipModal = () => {
    if (selectedOrderIds.length === 0) return;
    setIsBulkShipModal(true);
    setOrderToShip({ isBulk: true, count: selectedOrderIds.length });
    setShipModalCourier('');
    setShipModalCourierUrl('');
    setShipModalAwb('');
  };

  const handleConfirmShipModal = async () => {
    const courier = shipModalCourier.trim();
    const url = shipModalCourierUrl.trim();
    const awb = shipModalAwb.trim();

    if (!courier) {
      showToast('⚠️ Courier Name is required *', 'error');
      return;
    }
    if (!url) {
      showToast('⚠️ Courier Site URL Link is required *', 'error');
      return;
    }
    if (!awb) {
      showToast('⚠️ Tracking / AWB Number is required *', 'error');
      return;
    }

    setIsSubmittingShip(true);
    try {
      if (isBulkShipModal) {
        // Bulk shipping
        const results = await Promise.allSettled(
          selectedOrderIds.map((id) =>
            adminService.updateOrderStatus(id, {
              status: 'shipped',
              courier,
              courierUrl: url,
              trackingId: awb,
              note: `Bulk dispatched via ${courier} (AWB: ${awb})`,
            })
          )
        );
        const successfulIds = [];
        results.forEach((res, idx) => {
          if (res.status === 'fulfilled') successfulIds.push(selectedOrderIds[idx]);
        });
        if (successfulIds.length > 0) {
          successfulIds.forEach((id) => {
            storeUpdateStatus(id, 'shipped');
            const found = storeOrders.find((o) => (o._id || o.id) === id);
            updateOrder(id, {
              status: 'shipped',
              courier,
              courierUrl: url,
              trackingId: awb,
              statusHistory: [
                ...(found?.statusHistory || []),
                {
                  status: 'shipped',
                  timestamp: new Date().toISOString(),
                  note: `Dispatched via ${courier} (AWB: ${awb})`,
                },
              ],
            });
          });
          showToast(`🚀 Successfully dispatched & shipped ${successfulIds.length} orders!`, 'success');
          setSelectedOrderIds([]);
        }
      } else if (orderToShip) {
        // Single order shipping
        const id = orderToShip._id || orderToShip.id;
        await adminService.updateOrderStatus(id, {
          status: 'shipped',
          courier,
          courierUrl: url,
          trackingId: awb,
          note: `Dispatched via ${courier} (AWB: ${awb})`,
        });
        storeUpdateStatus(id, 'shipped');
        updateOrder(id, {
          status: 'shipped',
          courier,
          courierUrl: url,
          trackingId: awb,
          statusHistory: [
            ...(orderToShip.statusHistory || []),
            {
              status: 'shipped',
              timestamp: new Date().toISOString(),
              note: `Dispatched via ${courier} (AWB: ${awb})`,
            },
          ],
        });
        showToast(`🚀 Order #${orderToShip.orderNumber} successfully marked as Shipped!`, 'success');
      }
      setOrderToShip(null);
      setIsBulkShipModal(false);
    } catch (err) {
      console.error('Ship order error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Failed to update shipping details', 'error');
    } finally {
      setIsSubmittingShip(false);
    }
  };

  return (
    <AdminLayout title="Orders & Dispatch Dashboard">

      {/* ── Page Header ── */}
      <div className="admin-page-header-row">
        <div>
          <h1 className="admin-page-main-title">Orders & Dispatch</h1>
          <p className="admin-page-main-subtitle">Manage customer orders, track dispatch status and fulfillment</p>
        </div>
      </div>

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

      {/* ── BULK ACTIONS BAR (ACTIVATES ON MULTI-SELECTION) ───────────────── */}
      {selectedOrderIds.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '0.9rem 1.35rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            animation: 'ordAccordionIn 0.22s ease',
          }}
        >
          {/* Left: Selection Counter & Bulk Select All */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.16)',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.84rem',
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              <Layers size={15} color="#c4b5fd" />
              <span>{selectedOrderIds.length} Order{selectedOrderIds.length > 1 ? 's' : ''} Selected</span>
            </div>

            {selectedOrderIds.length < filteredOrders.length && (
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                style={{
                  background: 'rgba(196, 181, 253, 0.15)',
                  border: '1px solid rgba(196, 181, 253, 0.35)',
                  borderRadius: '6px',
                  color: '#ddd6fe',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.7rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(196, 181, 253, 0.25)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(196, 181, 253, 0.15)';
                  e.currentTarget.style.color = '#ddd6fe';
                }}
              >
                Select all {filteredOrders.length} orders
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '0.78rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
            >
              Clear Selection
            </button>
          </div>

          {/* Right: Bulk Status Update & Bulk Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Status Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.77rem', color: '#c4b5fd', fontWeight: 600 }}>Update Status:</span>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                disabled={isBulkUpdating || isBulkDeleting}
                style={{
                  height: '36px',
                  padding: '0 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="confirmed">Order Confirmed</option>
                <option value="shipped">Order Shipping (Dispatched)</option>
                <option value="delivered">Order Delivered</option>
                <option value="cancelled">Cancelled Order</option>
              </select>

              <button
                type="button"
                onClick={bulkStatus === 'shipped' ? handleOpenBulkShipModal : handleBulkStatusUpdate}
                disabled={isBulkUpdating || isBulkDeleting}
                style={{
                  height: '36px',
                  padding: '0 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: isBulkUpdating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 3px 10px rgba(124, 58, 237, 0.35)',
                  transition: 'all 0.18s ease',
                }}
              >
                {isBulkUpdating ? (
                  <>
                    <RotateCw size={14} className="spin-animation" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Apply Status</span>
                  </>
                )}
              </button>
            </div>

            {/* Bulk Delete Button */}
            <button
              type="button"
              onClick={() => setShowBulkDeleteModal(true)}
              disabled={isBulkUpdating || isBulkDeleting}
              style={{
                height: '36px',
                padding: '0 1.1rem',
                borderRadius: '8px',
                border: '1px solid #fecdd3',
                background: '#fff1f2',
                color: '#e11d48',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: isBulkDeleting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.15)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e11d48';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#e11d48';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#fff1f2';
                e.currentTarget.style.color = '#e11d48';
                e.currentTarget.style.borderColor = '#fecdd3';
              }}
            >
              <Trash2 size={15} />
              <span>Delete Selected ({selectedOrderIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ── 3. ORDERS TABLE WITH MULTI-SELECT & PERFECT ALIGNMENTS (9 COLUMNS) ── */}
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
              <th style={{ padding: '0.9rem 0.5rem 0.9rem 1.25rem', textAlign: 'center', width: '44px' }}>
                <input
                  type="checkbox"
                  checked={isAllCurrentPageSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isSomeCurrentPageSelected;
                    }
                  }}
                  onChange={handleSelectAllCurrentPage}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#7c3aed',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    verticalAlign: 'middle',
                  }}
                  title={isAllCurrentPageSelected ? 'Deselect all on this page' : 'Select all on this page'}
                />
              </th>
              <th style={{ padding: '0.9rem 0.6rem', textAlign: 'center', width: '48px', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>S.No</th>
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
                <td colSpan={9} style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
                  <ShoppingBag size={42} style={{ opacity: 0.3, marginBottom: '0.75rem', display: 'block', margin: '0 auto 0.75rem' }} />
                  No orders found matching your search or filters.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => {
                const custName  = order.customer?.name || order.user?.name || order.shippingAddress?.fullName || 'Customer';
                const custPhone = order.customer?.phone || order.user?.phone || '';
                const custEmail = order.customer?.email || order.user?.email || '';
                const st        = (order.status || 'placed').toLowerCase();
                const cfg       = STATUS_CFG[st] || STATUS_CFG.placed;
                const StatusIcon = cfg.icon;
                const isOpen    = expandedId === order._id;

                // Default status strictly to order's current status (never auto-advance to shipping)
                const currentRowStatus    = rowStatus[order._id]       ?? (order.status || 'placed');
                const isAlreadyShippedOrDelivered = order.status === 'shipped' || order.status === 'delivered';
                const initialCourier = isAlreadyShippedOrDelivered && order.courier !== 'Standard Surface Delivery' ? (order.courier || '') : '';
                const currentRowNote      = rowNote[order._id]         ?? (isAlreadyShippedOrDelivered ? (order.trackingId || '') : '');
                const currentRowCourier   = rowCourier[order._id]      ?? initialCourier;
                const currentRowCourierUrl= rowCourierUrl[order._id]   ?? (isAlreadyShippedOrDelivered ? (order.courierUrl || '') : '');
                const currentCancelReason = rowCancelReason[order._id] ?? '';
                const isUpdating          = rowLoading[order._id]       ?? false;

                const orderId = order._id || order.id;
                const isSelected = selectedOrderIds.includes(orderId);

                return (
                  <React.Fragment key={order._id}>
                    {/* ── Main Table Row (Neat Spacing & Clean SaaS Colors) ─────────────────────── */}
                    <tr
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? '#f5f3ff' : isOpen ? '#faf5ff' : index % 2 === 0 ? '#ffffff' : '#faf7ff',
                        borderBottom: isOpen ? 'none' : '1px solid #f1f5f9',
                        borderLeft: isSelected ? '3px solid #7c3aed' : isOpen ? '3px solid #7c3aed' : '3px solid transparent',
                        transition: 'background 0.15s ease',
                      }}
                      onClick={() => toggleRow(order._id)}
                    >
                      {/* Selection Checkbox */}
                      <td
                        style={{ padding: '1rem 0.5rem 1rem 1.25rem', textAlign: 'center' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectOrder(orderId, e)}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: '#7c3aed',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            verticalAlign: 'middle',
                          }}
                        />
                      </td>

                      {/* S.No */}
                      <td style={{ padding: '1rem 0.6rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'flex-start' }}>
                          <span style={{ fontWeight: 500, color: '#475569', fontSize: '0.83rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <ShoppingBag size={13} color="#7c3aed" />
                            {order.items?.length || order.itemsCount || 1} item{(order.items?.length || 1) !== 1 ? 's' : ''}
                          </span>
                          {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: '#e11d48',
                                background: '#ffe4e6',
                                border: '1px solid #fecdd3',
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                                letterSpacing: '0.01em',
                              }}
                              title={order.giftWrap?.message ? `Gift Message: "${order.giftWrap.message}"` : 'Gift Wrap Included'}
                            >
                              🎁 Gift
                            </span>
                          )}
                        </div>
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

                      {/* Action Cell: Manage Accordion Toggle & Delete Button */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                          {/* Quick Tax Invoice Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoiceOrder(order);
                            }}
                            title={`Generate Tax Invoice #${order.orderNumber}`}
                            style={{
                              width: '34px',
                              height: '34px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '9999px',
                              border: '1px solid #ddd6fe',
                              background: '#f5f3ff',
                              color: '#7c3aed',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#7c3aed';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#7c3aed';
                              e.currentTarget.style.boxShadow = '0 3px 10px rgba(124,58,237,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f5f3ff';
                              e.currentTarget.style.color = '#7c3aed';
                              e.currentTarget.style.borderColor = '#ddd6fe';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <FileText size={15} />
                          </button>

                          {/* Quick Courier Shipping Label Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLabelOrder(order);
                            }}
                            title={`Generate 4x6 Shipping Label #${order.orderNumber}`}
                            style={{
                              width: '34px',
                              height: '34px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '9999px',
                              border: '1.5px solid #cbd5e1',
                              background: '#f8fafc',
                              color: '#0f172a',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              boxSizing: 'border-box',
                              flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#0f172a';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#0f172a';
                              e.currentTarget.style.boxShadow = '0 3px 10px rgba(15,23,42,0.25)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#0f172a';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <Tag size={15} />
                          </button>

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
                        <td colSpan={9} style={{ padding: 0, borderBottom: '1px solid #e2e8f0' }}>
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

                                  {/* Gift Message Box (ONLY shown when order was placed with Gift Wrap) */}
                                  {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                                    <div
                                      style={{
                                        marginTop: '0.85rem',
                                        padding: '0.85rem 1rem',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
                                        border: '1.5px solid #fecdd3',
                                        boxShadow: '0 2px 6px rgba(225, 29, 72, 0.05)',
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        boxSizing: 'border-box',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#be123c', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                          🎁 Gift Wrapping Service {order.giftWrap?.fee ? `(+₹${order.giftWrap.fee})` : ''}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                          <button
                                            type="button"
                                            onClick={() => setSelectedGiftCardOrder(order)}
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '0.35rem',
                                              fontSize: '0.72rem',
                                              fontWeight: 700,
                                              color: '#ffffff',
                                              background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                                              border: 'none',
                                              padding: '0.24rem 0.7rem',
                                              borderRadius: '9999px',
                                              cursor: 'pointer',
                                              boxShadow: '0 2px 6px rgba(225, 29, 72, 0.25)',
                                              transition: 'all 0.15s ease',
                                            }}
                                            title="Print Luxury Gift Greeting Card"
                                          >
                                            <Printer size={12} />
                                            <span>Print Card</span>
                                          </button>
                                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9f1239', background: '#fecdd3', padding: '0.18rem 0.55rem', borderRadius: '9999px' }}>
                                            Gift Order
                                          </span>
                                        </div>
                                      </div>
                                      <div style={{ fontSize: '0.82rem', color: '#881337', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                        <strong>Gift Message: </strong>
                                        <span style={{ fontStyle: (order.giftWrap?.message && order.giftWrap.message.trim()) ? 'normal' : 'italic', color: (order.giftWrap?.message && order.giftWrap.message.trim()) ? '#4c0519' : '#9f1239', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                          {(order.giftWrap?.message && order.giftWrap.message.trim()) ? `"${order.giftWrap.message.trim()}"` : 'No message'}
                                        </span>
                                      </div>
                                    </div>
                                  )}
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
                                      {formatPrice(order.subtotal || (order.total - (order.shippingFee || 0)) || order.total || 0)}
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.79rem', color: '#64748b' }}>
                                    <span>Delivery / Shipping</span>
                                    <span style={{ fontWeight: 700, color: (order.shippingFee > 0 || (order.total - (order.subtotal || order.total)) > 0) ? '#1e293b' : '#16a34a' }}>
                                      {order.shippingFee !== undefined && order.shippingFee > 0
                                        ? formatPrice(order.shippingFee)
                                        : ((order.total && order.subtotal && order.total > order.subtotal)
                                          ? formatPrice(order.total - order.subtotal + (order.discountAmount || 0))
                                          : 'FREE')}
                                    </span>
                                  </div>
                                  {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.79rem', color: '#be123c' }}>
                                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                        🎁 Gift Wrapping
                                      </span>
                                      <span style={{ fontWeight: 700, color: '#be123c' }}>
                                        +{formatPrice(order.giftWrap?.fee || order.giftWrapFee || 30)}
                                      </span>
                                    </div>
                                  )}
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
                                        currentStatus={order.status}
                                        order={order}
                                      />
                                    </div>

                                    {/* ── Courier Details & AWB Input: shown strictly when Shipping is selected ── */}
                                    {currentRowStatus === 'shipped' && (
                                      <div
                                        style={{
                                          animation: 'fadeIn 0.22s ease',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '0.85rem',
                                          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
                                          border: '1.5px solid #93c5fd',
                                          borderRadius: '14px',
                                          padding: '1.1rem',
                                          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
                                        }}
                                      >
                                        {/* Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #bfdbfe', paddingBottom: '0.6rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                              <Truck size={15} />
                                            </div>
                                            <div>
                                              <strong style={{ fontSize: '0.82rem', color: '#1e3a8a', display: 'block' }}>Courier Dispatch Information</strong>
                                                                                          </div>
                                          </div>
                                          <span style={{ fontSize: '0.67rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.12rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                                            All 3 Fields Required *
                                          </span>
                                        </div>

                                        {/* 1-Click Popular Courier Quick Fill Presets */}
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            <div style={{ fontSize: '0.69rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                              Quick Select Courier Partner:
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                              <button
                                                type="button"
                                                onClick={handleOpenAddCourier}
                                                title="Add new Courier Partner"
                                                style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '0.25rem',
                                                  padding: '0.22rem 0.55rem',
                                                  borderRadius: '6px',
                                                  border: '1px dashed #2563eb',
                                                  background: '#eff6ff',
                                                  color: '#1d4ed8',
                                                  fontSize: '0.72rem',
                                                  fontWeight: 700,
                                                  cursor: 'pointer',
                                                  transition: 'all 0.15s ease',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8'; }}
                                              >
                                                <Plus size={11} />
                                                <span>Add Partner</span>
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setManageCouriersModalOpen(true)}
                                                title="Manage & Edit Courier Partners"
                                                style={{
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '0.25rem',
                                                  padding: '0.22rem 0.55rem',
                                                  borderRadius: '6px',
                                                  border: '1px solid #cbd5e1',
                                                  background: '#ffffff',
                                                  color: '#475569',
                                                  fontSize: '0.72rem',
                                                  fontWeight: 600,
                                                  cursor: 'pointer',
                                                  transition: 'all 0.15s ease',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#475569'; }}
                                              >
                                                <Settings size={11} />
                                                <span>Manage / Edit</span>
                                              </button>
                                            </div>
                                          </div>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                                            {courierPresets.map((preset) => {
                                              const isSelectedCourier = (currentRowCourier || '').toLowerCase() === preset.name.toLowerCase();
                                              return (
                                                <div
                                                  key={preset.id || preset.name}
                                                  style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${isSelectedCourier ? '#2563eb' : '#cbd5e1'}`,
                                                    background: isSelectedCourier ? '#2563eb' : '#ffffff',
                                                    color: isSelectedCourier ? '#ffffff' : '#334155',
                                                    boxShadow: isSelectedCourier ? '0 2px 6px rgba(37,99,235,0.3)' : 'none',
                                                    transition: 'all 0.15s ease',
                                                    overflow: 'hidden',
                                                  }}
                                                >
                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      setRowCourier((p) => ({ ...p, [order._id]: preset.name }));
                                                      setRowCourierUrl((p) => ({ ...p, [order._id]: preset.url }));
                                                      if (preset.number) {
                                                        setRowNote((p) => ({ ...p, [order._id]: preset.number }));
                                                      }
                                                    }}
                                                    title={`Click to Auto-fill: ${preset.name} (URL: ${preset.url}${preset.number ? ` • AWB: ${preset.number}` : ''})`}
                                                    style={{
                                                      fontSize: '0.73rem',
                                                      fontWeight: isSelectedCourier ? 700 : 600,
                                                      padding: '0.28rem 0.55rem',
                                                      background: 'transparent',
                                                      border: 'none',
                                                      color: 'inherit',
                                                      cursor: 'pointer',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      gap: '0.35rem',
                                                    }}
                                                  >
                                                    <Truck size={11} color={isSelectedCourier ? '#ffffff' : (preset.color || '#2563eb')} />
                                                    <span>{preset.name}</span>
                                                  </button>
                                                  <button
                                                    type="button"
                                                    onClick={(e) => handleOpenEditCourier(preset, e)}
                                                    title={`Edit ${preset.name} (Name, Link, Number)`}
                                                    style={{
                                                      padding: '0.28rem 0.45rem',
                                                      background: isSelectedCourier ? 'rgba(255,255,255,0.18)' : '#f8fafc',
                                                      border: 'none',
                                                      borderLeft: `1px solid ${isSelectedCourier ? 'rgba(255,255,255,0.3)' : '#e2e8f0'}`,
                                                      color: isSelectedCourier ? '#ffffff' : '#64748b',
                                                      cursor: 'pointer',
                                                      display: 'inline-flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      transition: 'background 0.15s',
                                                    }}
                                                    onMouseEnter={(e) => { e.currentTarget.style.background = isSelectedCourier ? 'rgba(255,255,255,0.32)' : '#e2e8f0'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.background = isSelectedCourier ? 'rgba(255,255,255,0.18)' : '#f8fafc'; }}
                                                  >
                                                    <Pencil size={10} />
                                                  </button>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Field 1: Courier Name (Required) */}
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                              <Truck size={13} color="#2563eb" /> Courier Name <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <span style={{ fontSize: '0.67rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.08rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>Required *</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={currentRowCourier}
                                            onChange={(e) => setRowCourier((p) => ({ ...p, [order._id]: e.target.value }))}
                                            placeholder="e.g. ST Courier, Professional Courier, Blue Dart, DTDC"
                                            style={{
                                              width: '100%',
                                              padding: '0.62rem 0.85rem',
                                              background: '#ffffff',
                                              border: `1.5px solid ${!currentRowCourier.trim() ? '#93c5fd' : '#2563eb'}`,
                                              borderRadius: '10px',
                                              fontSize: '0.82rem',
                                              color: '#0f172a',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                              transition: 'all 0.2s ease',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = 'none'; }}
                                          />
                                        </div>

                                        {/* Field 2: Courier Site URL Link (Required) */}
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                              <Globe size={13} color="#2563eb" /> Courier Site URL Link <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <span style={{ fontSize: '0.67rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.08rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>Required *</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={currentRowCourierUrl}
                                            onChange={(e) => setRowCourierUrl((p) => ({ ...p, [order._id]: e.target.value }))}
                                            placeholder="e.g. https://stcourier.com/ or https://www.bluedart.com/"
                                            style={{
                                              width: '100%',
                                              padding: '0.62rem 0.85rem',
                                              background: '#ffffff',
                                              border: `1.5px solid ${!currentRowCourierUrl.trim() ? '#93c5fd' : '#2563eb'}`,
                                              borderRadius: '10px',
                                              fontSize: '0.82rem',
                                              color: '#0f172a',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                              transition: 'all 0.2s ease',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = 'none'; }}
                                          />
                                        </div>

                                        {/* Field 3: Tracking / AWB Number (Required) */}
                                        <div>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                              <Barcode size={13} color="#2563eb" /> Tracking / AWB Number <span style={{ color: '#ef4444' }}>*</span>
                                            </label>
                                            <span style={{ fontSize: '0.67rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.08rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>Required *</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={currentRowNote}
                                            onChange={(e) => setRowNote((p) => ({ ...p, [order._id]: e.target.value }))}
                                            placeholder="e.g. STC-614602-9871 or AWB #88921004"
                                            style={{
                                              width: '100%',
                                              padding: '0.62rem 0.85rem',
                                              background: '#ffffff',
                                              border: `1.5px solid ${!currentRowNote.trim() ? '#93c5fd' : '#2563eb'}`,
                                              borderRadius: '10px',
                                              fontSize: '0.82rem',
                                              color: '#0f172a',
                                              outline: 'none',
                                              boxSizing: 'border-box',
                                              transition: 'all 0.2s ease',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = '#93c5fd'; e.target.style.boxShadow = 'none'; }}
                                          />
                                        </div>
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

                                    {/* ── Order Status Flow Tracker with Tamil Explanations ── */}
                                    <div style={{ padding: '0.95rem 1.15rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                                        <span style={{ fontSize: '0.69rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                          Order Lifecycle Progress
                                        </span>
                                        {order.status === 'cancelled' && (
                                          <span style={{ fontSize: '0.7rem', color: '#b91c1c', background: '#fee2e2', padding: '0.12rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
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
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: isDone ? step.bg : '#f1f5f9',
                                                    border: `2px solid ${isCurrent ? step.color : isDone ? step.color : '#cbd5e1'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: isCurrent ? `0 0 0 3px ${step.color}25` : 'none',
                                                    transition: 'all 0.2s',
                                                    marginBottom: '0.35rem',
                                                  }}
                                                >
                                                  <StepIcon size={14} color={isDone ? step.color : '#94a3b8'} />
                                                </div>
                                                <strong style={{ fontSize: '0.74rem', fontWeight: isCurrent ? 700 : 600, color: isDone ? step.color : '#64748b', whiteSpace: 'nowrap' }}>
                                                  {step.label}
                                                </strong>
                                              </div>

                                              {i < arr.length - 1 && (
                                                <div
                                                  style={{
                                                    flex: 1,
                                                    height: '2px',
                                                    background: stepIdx < currentIdx && orderStatusKey !== 'cancelled' ? '#2563eb' : '#e2e8f0',
                                                    margin: '15px 4px 0 4px',
                                                    borderRadius: '2px',
                                                  }}
                                                />
                                              )}
                                            </React.Fragment>
                                          );
                                        })}
                                      </div>

                                      {order.status === 'cancelled' && (
                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.45rem',
                                            marginTop: '0.85rem',
                                            padding: '0.6rem 0.85rem',
                                            background: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '8px',
                                            color: '#b91c1c',
                                            fontSize: '0.76rem',
                                            fontWeight: 600,
                                          }}
                                        >
                                          <XCircle size={15} color="#dc2626" />
                                          <span><strong>Cancelled:</strong> Order cancel செய்யப்பட்டது {order.cancelReason ? `(${order.cancelReason})` : ''}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Update CTA & Print Invoice & Shipping Label Action Buttons */}
                                  <div style={{ paddingTop: '0.85rem', marginTop: 'auto', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    {/* Tax Invoice Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedInvoiceOrder(order);
                                      }}
                                      style={{
                                        height: '42px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.45rem',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '10px',
                                        border: '1.5px solid #ddd6fe',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        background: '#faf5ff',
                                        color: '#7c3aed',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#7c3aed';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(124,58,237,0.25)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#faf5ff';
                                        e.currentTarget.style.color = '#7c3aed';
                                        e.currentTarget.style.boxShadow = 'none';
                                      }}
                                      title="View & Print Official A4 Tax Invoice"
                                    >
                                      <FileText size={15} />
                                      Tax Invoice
                                    </button>

                                    {/* Shipping Label Button */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLabelOrder(order);
                                      }}
                                      style={{
                                        height: '42px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.45rem',
                                        padding: '0.65rem 1rem',
                                        borderRadius: '10px',
                                        border: '1.5px solid #cbd5e1',
                                        fontWeight: 600,
                                        fontSize: '0.82rem',
                                        cursor: 'pointer',
                                        background: '#f8fafc',
                                        color: '#0f172a',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#0f172a';
                                        e.currentTarget.style.color = '#ffffff';
                                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(15,23,42,0.2)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#f8fafc';
                                        e.currentTarget.style.color = '#0f172a';
                                        e.currentTarget.style.boxShadow = 'none';
                                      }}
                                      title="View & Print 4x6 Courier Shipping Label"
                                    >
                                      <Tag size={15} />
                                      Shipping Label
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

      {/* ── Delete Order Confirmation Modal ─────────────────────────────────── */}
      {orderToDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={() => { if (!isDeleting) setOrderToDelete(null); }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '430px',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #f1f5f9',
              textAlign: 'center',
              animation: 'ordAccordionIn 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Trash Icon */}
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#e11d48',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Delete Order?
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
              Are you sure you want to delete order <strong style={{ color: '#0f172a' }}>#{orderToDelete.orderNumber}</strong>?
              This action cannot be undone and will permanently remove this order from the system.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setOrderToDelete(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  flex: 1,
                  padding: '0.7rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {isDeleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Delete Confirmation Modal ── */}
      {showBulkDeleteModal && selectedOrderIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => { if (!isBulkDeleting) setShowBulkDeleteModal(false); }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              animation: 'ordAccordionIn 0.2s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Trash Icon */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: '#fee2e2',
                color: '#e11d48',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Trash2 size={26} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              Delete {selectedOrderIds.length} Selected Order{selectedOrderIds.length > 1 ? 's' : ''}?
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete <strong style={{ color: '#0f172a' }}>{selectedOrderIds.length} selected order{selectedOrderIds.length > 1 ? 's' : ''}</strong>?
              This action cannot be undone and will permanently remove them from the system.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setShowBulkDeleteModal(false)}
                style={{
                  flex: 1,
                  padding: '0.7rem 1.25rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isBulkDeleting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleConfirmBulkDelete}
                style={{
                  flex: 1,
                  padding: '0.7rem 1.25rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isBulkDeleting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease',
                }}
              >
                {isBulkDeleting ? (
                  <>
                    <RotateCw size={15} className="spin-animation" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    <span>Yes, Delete All</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Courier Dispatch & Shipping Details Modal (Mandatory Fields on "Shipped") ── */}
      {orderToShip && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
          onClick={() => { if (!isSubmittingShip) setOrderToShip(null); }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '540px',
              width: '100%',
              padding: '1.75rem 2rem',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
              animation: 'ordAccordionIn 0.22s ease',
              border: '1px solid #e2e8f0',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                    flexShrink: 0,
                  }}
                >
                  <Truck size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800, color: '#0f172a' }}>
                    {isBulkShipModal
                      ? `Dispatch ${orderToShip.count} Orders to Courier`
                      : `Dispatch Order #${orderToShip.orderNumber}`}
                  </h3>
                  
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOrderToShip(null)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Select Popular Courier Partner Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quick 1-Click Courier Partner Fill:
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddCourier}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px dashed #2563eb',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={11} />
                  <span>Add Partner</span>
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
                {courierPresets.map((preset) => {
                  const isSelected = (shipModalCourier || '').toLowerCase() === preset.name.toLowerCase();
                  return (
                    <button
                      key={preset.id || preset.name}
                      type="button"
                      onClick={() => {
                        setShipModalCourier(preset.name);
                        setShipModalCourierUrl(preset.url);
                        if (preset.number) {
                          setShipModalAwb(preset.number);
                        }
                      }}
                      style={{
                        padding: '0.5rem 0.6rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                        background: isSelected ? '#eff6ff' : '#f8fafc',
                        color: isSelected ? '#1d4ed8' : '#334155',
                        fontSize: '0.77rem',
                        fontWeight: isSelected ? 700 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 2px 8px rgba(37,99,235,0.2)' : 'none',
                      }}
                    >
                      <Truck size={13} color={preset.color || '#2563eb'} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields: All 3 Mandatory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Field 1: Courier Name* (Required *) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={14} color="#2563eb" /> Courier Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.67rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                    Required *
                  </span>
                </div>
                <input
                  type="text"
                  value={shipModalCourier}
                  onChange={(e) => setShipModalCourier(e.target.value)}
                  placeholder="e.g. ST Courier, Professional Courier, Blue Dart, DTDC, Delhivery"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${!shipModalCourier.trim() ? '#93c5fd' : '#2563eb'}`,
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s ease',
                    background: '#ffffff',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = !shipModalCourier.trim() ? '#93c5fd' : '#2563eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Field 2: Courier Site URL Link* (Required *) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Globe size={14} color="#2563eb" /> Courier Site URL Link <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.67rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                    Required *
                  </span>
                </div>
                <input
                  type="text"
                  value={shipModalCourierUrl}
                  onChange={(e) => setShipModalCourierUrl(e.target.value)}
                  placeholder="e.g. https://stcourier.com/ or https://www.tpcindia.com/"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${!shipModalCourierUrl.trim() ? '#93c5fd' : '#2563eb'}`,
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s ease',
                    background: '#ffffff',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = !shipModalCourierUrl.trim() ? '#93c5fd' : '#2563eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              {/* Field 3: Tracking / AWB Number* (Required *) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Barcode size={14} color="#2563eb" /> Tracking / AWB Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '0.67rem', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 700 }}>
                    Required *
                  </span>
                </div>
                <input
                  type="text"
                  value={shipModalAwb}
                  onChange={(e) => setShipModalAwb(e.target.value)}
                  placeholder="e.g. STC-614602-9871 or AWB #88921004"
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.9rem',
                    borderRadius: '10px',
                    border: `1.5px solid ${!shipModalAwb.trim() ? '#93c5fd' : '#2563eb'}`,
                    fontSize: '0.86rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.18s ease',
                    background: '#ffffff',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#1d4ed8'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.15)'; }}
                  onBlur={(e) => { e.target.style.borderColor = !shipModalAwb.trim() ? '#93c5fd' : '#2563eb'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                disabled={isSubmittingShip}
                onClick={() => setOrderToShip(null)}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: isSubmittingShip ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingShip}
                onClick={handleConfirmShipModal}
                style={{
                  padding: '0.7rem 1.6rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: isSubmittingShip ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.18s ease',
                }}
              >
                {isSubmittingShip ? (
                  <>
                    <RotateCw size={15} className="spin-animation" />
                    <span>Updating Dispatch…</span>
                  </>
                ) : (
                  <>
                    <Truck size={16} />
                    <span>Confirm & Mark as Shipped</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Courier Partner Modal ── */}
      {courierModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setCourierModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              animation: 'ordAccordionIn 0.22s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.1rem 1.4rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 8px rgba(37,99,235,0.28)',
                  }}
                >
                  <Truck size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    {editingCourier ? 'Edit Courier Partner' : 'Add Courier Partner'}
                  </h3>
                  <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
                    Quick 1-Click Dispatch Preset
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCourierModalOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f1f5f9',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCourierPartner} style={{ padding: '1.35rem 1.4rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Field 1: Courier Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.77rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                    Courier Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={courierFormName}
                    onChange={(e) => setCourierFormName(e.target.value)}
                    placeholder="e.g. ST Courier, Professional Courier, Blue Dart, DTDC"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '9px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                  />
                </div>

                {/* Field 2: Courier Site URL Link */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.77rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>
                    Courier Site URL Link <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={courierFormUrl}
                    onChange={(e) => setCourierFormUrl(e.target.value)}
                    placeholder="e.g. https://stcourier.com/ or https://www.bluedart.com/"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '9px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                  />
                </div>

                {/* Field 3: Tracking / AWB Number or Prefix */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.77rem', fontWeight: 700, color: '#1e293b' }}>
                      Tracking / AWB Number or Prefix
                    </label>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '0.08rem 0.4rem', borderRadius: '4px' }}>
                      Auto-fill helper
                    </span>
                  </div>
                  <input
                    type="text"
                    value={courierFormNumber}
                    onChange={(e) => setCourierFormNumber(e.target.value)}
                    placeholder="e.g. STC-614602-9871 or default AWB / prefix"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '9px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '0.25rem' }}>
                    Quick Select கிளிக் செய்யும்போது இந்த AWB number தானாக fill ஆகும்.
                  </span>
                </div>

                {/* Field 4: Badge Color */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.77rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.45rem' }}>
                    Badge Color Accent
                  </label>
                  <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
                    {[
                      { label: 'Red', color: '#dc2626' },
                      { label: 'Orange', color: '#ea580c' },
                      { label: 'Blue', color: '#2563eb' },
                      { label: 'Green', color: '#16a34a' },
                      { label: 'Purple', color: '#7c3aed' },
                      { label: 'Slate', color: '#0f172a' },
                    ].map((c) => {
                      const isSelected = courierFormColor === c.color;
                      return (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() => setCourierFormColor(c.color)}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: c.color,
                            border: isSelected ? '3px solid #ffffff' : '2px solid transparent',
                            boxShadow: isSelected ? `0 0 0 2px ${c.color}` : 'none',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                            transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                          }}
                          title={c.label}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  {editingCourier && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCourierPartner(editingCourier.id, editingCourier.name)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.55rem 0.85rem',
                        borderRadius: '9px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setCourierModalOpen(false)}
                    style={{
                      padding: '0.6rem 1.1rem',
                      borderRadius: '9px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.6rem 1.3rem',
                      borderRadius: '9px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(37,99,235,0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Save size={14} />
                    <span>{editingCourier ? 'Update Partner' : 'Save Partner'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Manage Courier Partners Modal ── */}
      {manageCouriersModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setManageCouriersModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'ordAccordionIn 0.22s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.1rem 1.4rem',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #eff6ff 0%, #f8fafc 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Settings size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                    Manage Courier Partners
                  </h3>
                  <span style={{ fontSize: '0.73rem', color: '#64748b' }}>
                    {courierPresets.length} Quick Select Partners Configured
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setManageCouriersModalOpen(false);
                    handleOpenAddCourier();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                  }}
                >
                  <Plus size={13} />
                  <span>Add Partner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setManageCouriersModalOpen(false)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#f1f5f9',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div style={{ padding: '1.25rem 1.4rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px' }}>
              {courierPresets.map((preset) => (
                <div
                  key={preset.id || preset.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: `${preset.color || '#2563eb'}18`,
                        color: preset.color || '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Truck size={16} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>
                        {preset.name}
                      </strong>
                      <a
                        href={preset.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.73rem',
                          color: '#2563eb',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          maxWidth: '240px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <span>{preset.url}</span>
                        <ExternalLink size={10} />
                      </a>
                      {preset.number && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.15rem' }}>
                          AWB / Prefix: <code style={{ background: '#e2e8f0', padding: '0.05rem 0.35rem', borderRadius: '4px', color: '#0f172a' }}>{preset.number}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        setManageCouriersModalOpen(false);
                        handleOpenEditCourier(preset);
                      }}
                      title="Edit Courier Partner"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '7px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#1e293b',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <Pencil size={12} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourierPartner(preset.id, preset.name)}
                      title="Delete Partner"
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '7px',
                        border: '1px solid #fecaca',
                        background: '#fef2f2',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '0.85rem 1.4rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafbfc' }}>
              <button
                type="button"
                onClick={handleResetCourierPresets}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#dc2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
              >
                <RotateCcw size={12} />
                <span>Reset to Default Couriers</span>
              </button>
              <button
                type="button"
                onClick={() => setManageCouriersModalOpen(false)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tax Invoice Modal Preview ── */}
      {selectedInvoiceOrder && (
        <AdminInvoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* ── Courier Shipping Label Modal Preview ── */}
      {selectedLabelOrder && (
        <AdminShippingLabel
          order={selectedLabelOrder}
          onClose={() => setSelectedLabelOrder(null)}
        />
      )}

      {/* ── Gift Greeting Card Modal Preview ── */}
      {selectedGiftCardOrder && (
        <AdminGiftCard
          order={selectedGiftCardOrder}
          onClose={() => setSelectedGiftCardOrder(null)}
        />
      )}

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
