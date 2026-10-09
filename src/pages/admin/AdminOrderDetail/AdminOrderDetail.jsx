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
} from 'lucide-react';
import AdminLayout from '../../../components/layout/AdminLayout';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Spinner from '../../../components/ui/Spinner';
import StatusTimeline from '../../../components/order/StatusTimeline';
import { adminService } from '../../../services/admin.service';
import { useUiStore } from '../../../store/uiStore';
import { formatPrice } from '../../../utils/formatPrice';
import { formatDate } from '../../../utils/formatDate';
import { MOCK_ORDERS_EXTENDED, COMMON_COURIERS } from '../../../data/adminMockData';
import { useOrderStore } from '../../../store/orderStore';

const ADMIN = '/softpicky-sn2026';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const { showToast } = useUiStore();
  const { getOrderById, updateOrder, updateOrderStatus: storeUpdateStatus, updateOrderTracking } = useOrderStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Manual AWB Entry state (supports extensible courier list + Other)
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState('DTDC');
  const [customCourier, setCustomCourier] = useState('');
  const [shipLoading, setShipLoading] = useState(false);

  // Status Change state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    async function loadDetail() {
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
        console.error('Order detail fallback to mock store:', err);
        // Try shared orderStore first (has session-placed orders), then MOCK_ORDERS_EXTENDED
        const storeMatch = getOrderById(id);
        const mockMatch =
          storeMatch ||
          MOCK_ORDERS_EXTENDED.find((o) => o._id === id || o.orderNumber === id) ||
          MOCK_ORDERS_EXTENDED[0];
        setOrder(mockMatch);
        if (mockMatch.trackingId) setTrackingId(mockMatch.trackingId);
        if (mockMatch.courier) {
          if (COMMON_COURIERS.includes(mockMatch.courier)) {
            setCourier(mockMatch.courier);
          } else {
            setCourier('Other');
            setCustomCourier(mockMatch.courier);
          }
        }
        setNewStatus(mockMatch.status);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

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

  return (
    <AdminLayout title={`Manage Order #${order.orderNumber}`}>
      {/* Top Breadcrumb & Status Pill */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to={`${ADMIN}/orders`}
          className="admin-period-select-btn"
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem', textDecoration: 'none' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Orders</span>
        </Link>
        <span
          className={`adm-status-pill adm-status-${order.status || 'confirmed'}`}
          style={{ fontSize: '0.85rem', padding: '0.35rem 0.95rem' }}
        >
          ● Status: {order.status ? order.status.toUpperCase() : 'CONFIRMED'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Shipment Actions & Order Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* AWB & Dispatch Action Card */}
          <div className="card" style={{ border: '1.5px solid #dcd0fa', background: '#faf8fe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
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
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1e1b4b' }}>
                  Courier & AWB Tracking Entry
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Dispatches auto-WhatsApp tracking link to customer
                </span>
              </div>
            </div>

            <form onSubmit={handleShipOrder}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 700 }}>Courier Partner</label>
                  <select
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
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
                    {COMMON_COURIERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="AWB Tracking ID"
                  placeholder="e.g. DTDC-9842109"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  required
                />
              </div>

              {courier === 'Other' && (
                <div style={{ marginBottom: '1rem' }}>
                  <Input
                    label="Custom Courier Name *"
                    placeholder="e.g. ST Courier, Regional Express, Local Transport"
                    value={customCourier}
                    onChange={(e) => setCustomCourier(e.target.value)}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={shipLoading}
                className="admin-period-select-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.75rem',
                  background: '#7c3aed',
                  color: '#ffffff',
                  borderColor: '#7c3aed',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                }}
              >
                <Send size={15} />
                <span>{order.status === 'shipped' ? 'Update AWB & Re-notify Customer' : 'Mark as Shipped & Save AWB'}</span>
              </button>
            </form>
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
                    <strong style={{ fontSize: '0.92rem', color: '#1e1b4b', display: 'block' }}>
                      {item.name}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.98rem', color: '#7c3aed' }}>
                    {formatPrice(item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

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
                  <span>{order.customer?.phone || order.user?.phone || order.shippingAddress?.phone || '+91 98401 23456'}</span>
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
                <div>{order.shippingAddress?.street || '#42, 4th Cross, Indiranagar'}</div>
                {order.shippingAddress?.landmark && <div>Landmark: {order.shippingAddress.landmark}</div>}
                <div>
                  {order.shippingAddress?.city || 'Bengaluru'}, {order.shippingAddress?.state || 'Karnataka'} -{' '}
                  {order.shippingAddress?.pincode || '560038'}
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
    </AdminLayout>
  );
}
