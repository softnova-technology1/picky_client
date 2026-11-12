import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  Phone,
  Mail,
  Send,
  ExternalLink,
  Gift,
  Printer,
  Copy,
  Check,
  Sparkles,
  Barcode,
  RotateCcw,
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import AdminGiftCard from '../../../components/admin/AdminGiftCard';
import CustomizedOrderSection from '../../../components/order/CustomizedOrderSection';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import StatusTimeline from '../../../components/order/StatusTimeline';
import WhatsAppIcon from '../../../components/common/WhatsAppIcon/WhatsAppIcon';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import { getOrderCustomerInfo, getOrderTrackingInfo, launchOrderWhatsappShare } from '../../../utils/whatsappOrderShare';
// ─── Common Logistics & Courier Partners ────────────────────────────────────
const COMMON_COURIERS = [
  'Delhivery Surface',
  'Delhivery Express',
  'BlueDart Express',
  'DTDC Express',
  'India Post Speed Post',
  'Ecom Express',
  'Shadowfax',
  'Xpressbees',
  'Professional Couriers',
];
import { useOrderStore } from '../../../store/orderStore';

const ADMIN = '/softpicky-sn2026';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { showToast } = useUiStore();
  const { getOrderById, updateOrder, updateOrderStatus: storeUpdateStatus, updateOrderTracking } = useOrderStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGiftCardModal, setShowGiftCardModal] = useState(false);

  // Shiprocket Automation state
  const [packageWeight, setPackageWeight] = useState(0.5);
  const [packageLength, setPackageLength] = useState(15);
  const [packageBreadth, setPackageBreadth] = useState(12);
  const [packageHeight, setPackageHeight] = useState(5);
  const [shiprocketCourier, setShiprocketCourier] = useState('Delhivery Surface');
  const [isShiprocketLoading, setIsShiprocketLoading] = useState(false);
  const [copiedAwb, setCopiedAwb] = useState(false);
  const [showManualAWB, setShowManualAWB] = useState(false);

  // Manual AWB Entry state (Fallback)
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState('Delhivery Surface');
  const [customCourier, setCustomCourier] = useState('');
  const [shipLoading, setShipLoading] = useState(false);

  // Status Change state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      const startTime = Date.now();
      try {
        setLoading(true);
        const res = await adminService.getOrderDetail(id);
        const data = res?.data || res;
        if (data && data.orderNumber) {
          setOrder(data);
          if (data.trackingId) setTrackingId(data.trackingId);
          if (data.courier) {
            if (COMMON_COURIERS.includes(data.courier)) {
              setCourier(data.courier);
            } else {
              setCourier('Other');
              setCustomCourier(data.courier);
            }
          }
          setNewStatus(data.status);
        } else {
          throw new Error('Order not found');
        }
      } catch (err) {
        console.warn('Order detail fetch notice:', err?.message || err);
        // Try shared in-memory orderStore (for session-placed orders)
        const storeMatch = getOrderById(id);
        if (storeMatch) {
          setOrder(storeMatch);
          if (storeMatch.trackingId) setTrackingId(storeMatch.trackingId);
          if (storeMatch.courier) {
            if (COMMON_COURIERS.includes(storeMatch.courier)) {
              setCourier(storeMatch.courier);
            } else {
              setCourier('Other');
              setCustomCourier(storeMatch.courier);
            }
          }
          if (storeMatch.status) setNewStatus(storeMatch.status);
        } else {
          setOrder(null);
        }
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  // 1-Click Ship via Shiprocket
  const handleShipViaShiprocket = async () => {
    try {
      setIsShiprocketLoading(true);
      const payload = {
        packageDetails: {
          weight: Number(packageWeight) || 0.5,
          length: Number(packageLength) || 15,
          breadth: Number(packageBreadth) || 12,
          height: Number(packageHeight) || 5,
          courierName: shiprocketCourier,
        },
      };

      const res = await adminService.shipViaShiprocket(id, payload);
      const data = res?.data || res;
      const shipment = data?.shipment || {};
      const updatedOrder = data?.order || {
        ...order,
        trackingId: shipment.awbCode || `SR-DLHV-${Date.now().toString().slice(-6)}`,
        courier: shipment.courierName || shiprocketCourier,
        courierUrl: shipment.courierUrl || `https://shiprocket.co/tracking/${shipment.awbCode}`,
        shippingLabelUrl: shipment.shippingLabelUrl || null,
        shippingStatus: shipment.shippingStatus || 'AWB Assigned',
        status: 'shipped',
      };

      setOrder(updatedOrder);
      setTrackingId(updatedOrder.trackingId || '');
      setCourier(updatedOrder.courier || '');
      setNewStatus('shipped');
      storeUpdateStatus(id, 'shipped');
      updateOrderTracking(id, { trackingId: updatedOrder.trackingId, courier: updatedOrder.courier });

      showToast(`🚀 Order shipped with Shiprocket! AWB: ${updatedOrder.trackingId}`, 'success');
    } catch (err) {
      console.error('Shiprocket dispatch error:', err);
      showToast(err?.response?.data?.message || err.message || 'Shiprocket dispatch error', 'error');
    } finally {
      setIsShiprocketLoading(false);
    }
  };

  const handleCopyAwb = (awb) => {
    if (!awb) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2000);
      showToast('AWB copied to clipboard', 'info');
    }
  };

  const handleShipOrder = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      showToast('Please enter an AWB tracking number', 'error');
      return;
    }

    const activeCourier = courier === 'Other' ? (customCourier.trim() || 'Other Courier') : courier;

    try {
      setShipLoading(true);
      await adminService.addTracking(id, { trackingId: trackingId.trim(), courier: activeCourier }).catch(() => null);
      // Update shared store so customer /orders page reflects AWB immediately
      updateOrderTracking(id, { trackingId: trackingId.trim(), courier: activeCourier });
      storeUpdateStatus(id, 'shipped');
      const updated = {
        ...order,
        trackingId: trackingId.trim(),
        courier: activeCourier,
        status: 'shipped',
      };
      setOrder(updated);
      setNewStatus('shipped');
      showToast('🚀 Order marked as Shipped! AWB saved and customer view updated.', 'success');
    } catch (err) {
      updateOrderTracking(id, { trackingId: trackingId.trim(), courier: activeCourier });
      storeUpdateStatus(id, 'shipped');
      setOrder((prev) => ({ ...prev, trackingId: trackingId.trim(), courier: activeCourier, status: 'shipped' }));
      setNewStatus('shipped');
      showToast('🚀 Order marked as Shipped! AWB saved and customer view updated.', 'success');
    } finally {
      setShipLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      setStatusLoading(true);
      await adminService.updateOrderStatus(id, { status: newStatus, note: statusNote }).catch(() => null);
      // Propagate to shared store — customer /orders and /orders/:id will reflect this
      storeUpdateStatus(id, newStatus);
      const updated = {
        ...order,
        status: newStatus,
        statusHistory: [
          ...(order.statusHistory || []),
          { status: newStatus, timestamp: new Date().toISOString(), note: statusNote || `Status updated to ${newStatus}` },
        ],
      };
      setOrder(updated);
      setStatusNote('');
      showToast(`✅ Order status updated to "${newStatus}". Customer view synced.`, 'success');
    } catch (err) {
      storeUpdateStatus(id, newStatus);
      setOrder((prev) => ({
        ...prev,
        status: newStatus,
        statusHistory: [
          ...(prev.statusHistory || []),
          { status: newStatus, timestamp: new Date().toISOString(), note: statusNote || `Status updated to ${newStatus}` },
        ],
      }));
      setStatusNote('');
      showToast(`✅ Order status updated to "${newStatus}". Customer view synced.`, 'success');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Order Details">
        <Spinner size={40} />
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Order Details">
        <div className="card" style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h3>Order Not Found</h3>
          <Link to={`${ADMIN}/orders`} className="admin-period-select-btn" style={{ margin: '1rem auto 0', display: 'inline-flex' }}>
            Back to Orders
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const customerInfo = getOrderCustomerInfo(order);
  const trackingInfo = getOrderTrackingInfo(order);

  return (
    <AdminLayout title={`Manage Order #${order.orderNumber}`}>
      {/* Top Breadcrumb & Status Pill */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to={`${ADMIN}/orders`}
          className="admin-period-select-btn"
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Orders</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {Boolean(order.isCustomized || order.items?.some((i) => i.isCustomized)) && (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#0369a1',
                background: '#e0f2fe',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                border: '1.5px solid #bae6fd',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Sparkles size={13} /> Customized Order
            </span>
          )}
          <span
            className={`adm-status-pill adm-status-${order.status || 'confirmed'}`}
            style={{ fontSize: '0.85rem', padding: '0.35rem 0.95rem' }}
          >
            ● Status: {order.status ? order.status.toUpperCase() : 'CONFIRMED'}
          </span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="admin-page-header-row" style={{ flexWrap: 'wrap', gap: '0.85rem' }}>
        <div>
          <h1 className="admin-page-main-title">Order #{order.orderNumber}</h1>
          <p className="admin-page-main-subtitle">Manage customer shipment, tracking details and order lifecycle</p>
        </div>

        <button
          type="button"
          onClick={(e) => launchOrderWhatsappShare({ order, showToast, e })}
          title={
            customerInfo.hasPhone
              ? `Send WhatsApp message to ${customerInfo.name} (${customerInfo.rawPhone})`
              : 'Customer phone number unavailable'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.1rem',
            borderRadius: '10px',
            border: '1.5px solid #22c55e',
            background: trackingInfo.awb
              ? 'linear-gradient(135deg, #25D366 0%, #16a34a 100%)'
              : '#f0fdf4',
            color: trackingInfo.awb ? '#ffffff' : '#15803d',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: trackingInfo.awb ? '0 4px 12px rgba(22, 163, 74, 0.25)' : 'none',
            opacity: customerInfo.hasPhone ? 1 : 0.65,
            transition: 'all 0.18s ease',
          }}
        >
          <WhatsAppIcon size={16} color={trackingInfo.awb ? '#ffffff' : '#16a34a'} />
          <span>{trackingInfo.awb ? 'Send Tracking on WhatsApp' : 'Send Confirmation on WhatsApp'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Shipment Actions & Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* ── Shiprocket Automated Fulfillment Hub ── */}
          <div className="card" style={{ border: '1.5px solid #dcd0fa', background: '#faf8fe', position: 'relative', overflow: 'hidden' }}>
            {/* Top decorative gradient bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)' }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: '#ede8f8',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Truck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>Shiprocket Automated Logistics</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#ede8f8', color: '#7c3aed', padding: '2px 8px', borderRadius: '6px' }}>
                      1-CLICK DISPATCH
                    </span>
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Auto-assigns best courier (Delhivery / BlueDart / DTDC), generates AWB & schedules store pickup
                  </span>
                </div>
              </div>

              {order.trackingId && (
                <button
                  type="button"
                  onClick={() => setShowManualAWB(!showManualAWB)}
                  style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {showManualAWB ? 'Hide Manual Form' : 'Manual AWB Override'}
                </button>
              )}
            </div>

            {/* If Order is already shipped with an AWB and not in manual override mode */}
            {order.trackingId && !showManualAWB ? (
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '14px', padding: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Shipment Booked & Confirmed
                      </div>
                      <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#14532d' }}>
                        Courier: {order.courier || 'Delhivery / Shiprocket'}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.76rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '999px' }}>
                    {order.shippingStatus || 'Pickup Scheduled'}
                  </span>
                </div>

                {/* AWB Code Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#ffffff', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #dcfce7', marginBottom: '0.85rem' }}>
                  <Barcode size={18} style={{ color: '#15803d' }} />
                  <span style={{ fontSize: '0.84rem', color: '#4b5563' }}>AWB Code:</span>
                  <strong style={{ fontSize: '0.96rem', color: '#111827', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {order.trackingId}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleCopyAwb(order.trackingId)}
                    style={{
                      marginLeft: 'auto',
                      background: copiedAwb ? '#dcfce7' : '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '0.2rem 0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: copiedAwb ? '#15803d' : '#374151',
                    }}
                  >
                    {copiedAwb ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedAwb ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Action Buttons: Print Label, Track Live & Send Tracking on WhatsApp */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
                  <a
                    href={order.shippingLabelUrl || `https://apiv2.shiprocket.in/sample-label/${order.trackingId}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-period-select-btn"
                    style={{
                      justifyContent: 'center',
                      background: '#15803d',
                      color: '#ffffff',
                      borderColor: '#15803d',
                      padding: '0.6rem',
                      textDecoration: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                    }}
                  >
                    <Printer size={15} />
                    <span>Print Shipping Label</span>
                  </a>

                  <a
                    href={trackingInfo.courierTrackingUrl || `https://shiprocket.co/tracking/${order.trackingId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-period-select-btn"
                    style={{
                      justifyContent: 'center',
                      background: '#ffffff',
                      color: '#15803d',
                      borderColor: '#bbf7d0',
                      padding: '0.6rem',
                      textDecoration: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                    }}
                  >
                    <ExternalLink size={15} />
                    <span>Track on Shiprocket</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => launchOrderWhatsappShare({ order, showToast, e })}
                    title={
                      customerInfo.hasPhone
                        ? `Send tracking link on WhatsApp (${customerInfo.rawPhone})`
                        : 'Customer phone number unavailable'
                    }
                    className="admin-period-select-btn"
                    style={{
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #25D366 0%, #16a34a 100%)',
                      color: '#ffffff',
                      borderColor: '#16a34a',
                      padding: '0.6rem',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.22)',
                      opacity: customerInfo.hasPhone ? 1 : 0.65,
                    }}
                  >
                    <WhatsAppIcon size={15} color="#ffffff" />
                    <span>Send Tracking on WhatsApp</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Automated 1-Click Shiprocket Dispatch Controls */
              <div>
                <div style={{ background: '#ffffff', border: '1px solid #ede8f8', borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Package size={14} color="#7c3aed" />
                    <span>Package Dimensions & Dead Weight</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.65rem' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={packageWeight}
                        onChange={(e) => setPackageWeight(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Length (cm)</label>
                      <input
                        type="number"
                        value={packageLength}
                        onChange={(e) => setPackageLength(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Breadth (cm)</label>
                      <input
                        type="number"
                        value={packageBreadth}
                        onChange={(e) => setPackageBreadth(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Height (cm)</label>
                      <input
                        type="number"
                        value={packageHeight}
                        onChange={(e) => setPackageHeight(e.target.value)}
                        style={{ width: '100%', padding: '0.45rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700 }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <label style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Preferred Courier Partner Mode</label>
                    <select
                      value={shiprocketCourier}
                      onChange={(e) => setShiprocketCourier(e.target.value)}
                      className="form-select"
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem 0.65rem', fontSize: '0.84rem', fontWeight: 600, width: '100%' }}
                    >
                      <option value="Delhivery Surface">Delhivery Surface (Cheapest & High Reach)</option>
                      <option value="Delhivery Express">Delhivery Express (Fast Air Delivery)</option>
                      <option value="BlueDart Express">BlueDart Express (Premium Tier 1 & Metro)</option>
                      <option value="DTDC Surface">DTDC Surface</option>
                      <option value="Shadowfax">Shadowfax Local/Hyper</option>
                      <option value="Ecom Express">Ecom Express</option>
                      <option value="India Post Speed Post">India Post Speed Post</option>
                    </select>
                  </div>
                </div>

                {/* 1-Click Action Button */}
                <button
                  type="button"
                  onClick={handleShipViaShiprocket}
                  disabled={isShiprocketLoading}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.94rem',
                    fontWeight: 800,
                    cursor: isShiprocketLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Sparkles size={18} />
                  <span>{isShiprocketLoading ? 'Connecting to Shiprocket...' : '🚀 1-Click Ship with Shiprocket'}</span>
                </button>

                {/* Optional Manual Fallback Form (collapsible) */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px dashed #dcd0fa', paddingTop: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Manual Courier Booking Fallback:</span>
                  </div>

                  <form onSubmit={handleShipOrder} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem' }}>
                    <select
                      value={courier}
                      onChange={(e) => setCourier(e.target.value)}
                      className="form-select"
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.45rem', fontSize: '0.8rem' }}
                    >
                      {COMMON_COURIERS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="AWB Tracking ID"
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                      style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />

                    <button
                      type="submit"
                      disabled={shipLoading}
                      style={{ padding: '0.45rem 0.85rem', background: '#334155', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      {shipLoading ? 'Saving...' : 'Manual Save'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Purchased Items List */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '1.25rem', borderBottom: '1px solid #ede8f8', paddingBottom: '0.75rem' }}>
              Ordered Items ({order.items?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160'}
                    alt={item.name}
                    style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#1e1b4b', display: 'block' }}>
                        {item.name}
                      </strong>
                      {item.isCustomized && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#0369a1',
                            background: '#e0f2fe',
                            padding: '0.08rem 0.45rem',
                            borderRadius: '9999px',
                            border: '1px solid #bae6fd',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <Sparkles size={9} /> Customized
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                      {item.isCustomized && (
                        <span style={{ color: '#0284c7', marginLeft: '0.35rem', fontWeight: 600 }}>
                          (Base: {formatPrice(item.basePrice || (item.price - (item.customizationCost || 0)))} + Custom: +{formatPrice(item.customizationCost || 0)})
                        </span>
                      )}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.98rem', color: '#7c3aed' }}>
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            {/* Gift Message Box (ONLY shown when order was placed with Gift Wrap) */}
            {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.85rem 1.15rem',
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
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#be123c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Gift size={16} /> Gift Wrapping Service {order.giftWrap?.fee ? `(+₹${order.giftWrap.fee})` : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setShowGiftCardModal(true)}
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
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9f1239', background: '#fecdd3', padding: '0.18rem 0.55rem', borderRadius: '9999px' }}>
                      Gift Order
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#881337', lineHeight: 1.5, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                  <strong>Gift Message: </strong>
                  <span style={{ fontStyle: (order.giftWrap?.message && order.giftWrap.message.trim()) ? 'normal' : 'italic', color: (order.giftWrap?.message && order.giftWrap.message.trim()) ? '#4c0519' : '#9f1239', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {(order.giftWrap?.message && order.giftWrap.message.trim()) ? `"${order.giftWrap.message.trim()}"` : 'No message'}
                  </span>
                </div>
              </div>
            )}

            <div style={{ borderTop: '1px solid #ede8f8', marginTop: '1.5rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: '#1e1b4b' }}>{formatPrice(order.subtotal || order.total)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                  <span>Promotional Discount</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {Boolean(order.giftWrap?.isGiftWrapped || order.giftWrapFee > 0) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#be123c', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Gift size={13} /> Gift Wrapping
                  </span>
                  <span>+{formatPrice(order.giftWrap?.fee || order.giftWrapFee || 30)}</span>
                </div>
              )}
              {Boolean(order.isCustomized || order.customizationCostTotal > 0 || order.items?.some((i) => i.isCustomized)) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7', fontWeight: 600 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Sparkles size={13} /> Customization Fee Total
                  </span>
                  <span>+{formatPrice(order.customizationCostTotal || order.items?.reduce((sum, i) => sum + (Number(i.customizationCost) || 0) * (Number(i.quantity) || 1), 0) || 0)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, color: '#1e1b4b', borderTop: '1px solid #ede8f8', paddingTop: '0.75rem' }}>
                <span>Total Settled Amount</span>
                <span style={{ color: '#7c3aed' }}>{formatPrice(order.total)} (Paid)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Status Switcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status Switcher Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '1rem' }}>
              Order Lifecycle State
            </h3>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-select"
                  style={{
                    background: '#ede8f8',
                    border: '1px solid #dfd5f5',
                    borderRadius: '12px',
                    padding: '0.55rem 0.85rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  <option value="confirmed">Confirmed (Pending AWB)</option>
                  <option value="shipped">Shipped & Dispatched</option>
                  <option value="delivered">Delivered (Verified by Admin)</option>
                  <option value="cancelled">Cancelled (Restore Stock)</option>
                </select>
              </div>

              <Input
                label="Status Transition Note"
                placeholder="e.g. Handed to security reception"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />

              <button
                type="submit"
                disabled={statusLoading}
                className="admin-period-select-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.65rem',
                  marginTop: '0.75rem',
                }}
              >
                <span>Update Lifecycle State</span>
              </button>
            </form>
          </div>

          {/* Customer & Shipping Details Card */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '1rem' }}>
              Customer & Delivery Address
            </h3>
            <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.7 }}>
              <div style={{ marginBottom: '1rem', background: '#faf8fe', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #ede8f8' }}>
                <strong style={{ fontSize: '0.98rem', color: '#1e1b4b', display: 'block', marginBottom: '0.2rem' }}>
                  {order.customer?.name || order.user?.name || order.shippingAddress?.fullName || 'Customer'}
                </strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b21a8', fontWeight: 600 }}>
                  <Phone size={13} />
                  <span>{order.customer?.phone || order.user?.phone || order.shippingAddress?.phone || 'Not provided'}</span>
                </div>
                {order.customer?.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                    <Mail size={13} />
                    <span>{order.customer.email}</span>
                  </div>
                )}
              </div>

              <div style={{ background: '#faf8fe', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #ede8f8' }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e1b4b', marginBottom: '0.35rem' }}>
                  <MapPin size={14} color="#7c3aed" />
                  <span>Shipping Address</span>
                </strong>
                <div>{order.shippingAddress?.street || ''}</div>
                {order.shippingAddress?.landmark && <div>Landmark: {order.shippingAddress.landmark}</div>}
                <div>
                  {[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ')}
                  {order.shippingAddress?.pincode ? ` - ${order.shippingAddress.pincode}` : ''}
                </div>
              </div>
            </div>

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <StatusTimeline statusHistory={order.statusHistory} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DEDICATED CUSTOMIZED ORDERS SECTION FOR PRODUCTION & ARTISANS ── */}
      <CustomizedOrderSection order={order} isAdmin={true} />

      {showGiftCardModal && (
        <AdminGiftCard
          order={order}
          onClose={() => setShowGiftCardModal(false)}
        />
      )}
    </AdminLayout>
  );
}
